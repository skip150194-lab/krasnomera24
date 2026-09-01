#!/usr/bin/env python3
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

CHANNEL = "grz124"
POST_ID = 451
SOURCE_POST = f"https://t.me/{CHANNEL}/{POST_ID}"
OUTPUT = Path("public/numbers.json")
STATE = Path("data/telegram-sync-state.json")
TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()

KNOWN_CATEGORIES = [
    "Первая сотня",
    "Одинаковые цифры",
    "Комплекты",
    "Сотни",
    "Буквы",
    "124/124;224/224",
    "Зеркала",
    "Прочее",
    "Прицеп",
    "Мото",
]

LATIN_TO_CYR = str.maketrans({
    "A": "А", "B": "В", "E": "Е", "K": "К", "M": "М", "H": "Н",
    "O": "О", "P": "Р", "C": "С", "T": "Т", "Y": "У", "X": "Х",
})


def normalize_plate(value: str) -> str:
    value = value.upper().translate(LATIN_TO_CYR)
    value = re.sub(r"\s+", " ", value).strip()
    value = re.sub(r"\s*\+\s*", "+", value)
    return value


def api(method: str, params=None):
    if not TOKEN:
        raise RuntimeError("Не задан GitHub Secret TELEGRAM_BOT_TOKEN")
    url = f"https://api.telegram.org/bot{TOKEN}/{method}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "GRZ124-sync/1.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        data = json.loads(response.read().decode("utf-8"))
    if not data.get("ok"):
        raise RuntimeError(f"Telegram Bot API error: {data}")
    return data.get("result")


def load_state():
    if not STATE.exists():
        return {"offset": 0, "post_text": "", "post_date": None}
    try:
        return json.loads(STATE.read_text(encoding="utf-8"))
    except Exception:
        return {"offset": 0, "post_text": "", "post_date": None}


def save_state(state):
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def message_text(message):
    return message.get("text") or message.get("caption") or ""


def is_target_message(message):
    if not message or int(message.get("message_id", 0)) != POST_ID:
        return False
    chat = message.get("chat") or {}
    username = str(chat.get("username") or "").lower()
    return username == CHANNEL.lower()


def fetch_post_text_from_updates():
    state = load_state()
    offset = int(state.get("offset") or 0)
    params = {
        "timeout": 0,
        "limit": 100,
        "allowed_updates": json.dumps(["channel_post", "edited_channel_post"]),
    }
    if offset:
        params["offset"] = offset

    updates = api("getUpdates", params)
    latest_text = state.get("post_text") or ""
    latest_date = state.get("post_date")
    max_update = offset - 1

    for update in updates:
        update_id = int(update.get("update_id", 0))
        max_update = max(max_update, update_id)
        message = update.get("edited_channel_post") or update.get("channel_post")
        if is_target_message(message):
            text = message_text(message).strip()
            if text:
                latest_text = text
                latest_date = message.get("edit_date") or message.get("date")

    new_offset = max_update + 1 if max_update >= offset else offset
    save_state({
        "offset": new_offset,
        "post_text": latest_text,
        "post_date": latest_date,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })

    if not latest_text:
        raise RuntimeError(
            "Бот пока не получал пост grz124/451. После добавления бота в канал отредактируйте пост 451 хотя бы один раз, затем запустите синхронизацию снова."
        )
    return latest_text


def extract_category(line: str):
    low = line.lower()
    for cat in KNOWN_CATEGORIES:
        if cat.lower() in low:
            return cat
    return None


def looks_like_plate(value: str) -> bool:
    v = normalize_plate(value)
    car = r"[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}(?:24|124|224)"
    special = r"[АВЕКМНОРСТУХ]{2}\s?\d{4}\s?(?:24|124|224)"
    combo = rf"(?:{car})(?:\+(?:{car}))+"
    return bool(re.fullmatch(rf"(?:{combo}|{car}|{special})", v.replace("  ", " ")))


def parse_price(text: str):
    patterns = [
        r"(\d[\d\s.,]{2,})\s*(?:₽|руб\.?|р\.?)",
        r"(?:-|—|–|:)\s*(\d[\d\s.,]{2,})\s*$",
    ]
    for pattern in patterns:
        m = re.search(pattern, text, flags=re.I)
        if m:
            digits = re.sub(r"\D", "", m.group(1))
            if digits and int(digits) >= 1000:
                return int(digits), m.start(1)
    return None, None


def parse_line(line: str, category: str):
    price, price_pos = parse_price(line)
    if price is None:
        return None
    before = line[:price_pos]
    before = re.sub(r"[—–\-:=]+\s*$", "", before).strip()

    candidates = []
    for pattern in [
        r"[A-ZА-Я]\d{3}[A-ZА-Я]{2}(?:224|124|24)(?:\s*\+\s*[A-ZА-Я]\d{3}[A-ZА-Я]{2}(?:224|124|24))+",
        r"[A-ZА-Я]\d{3}[A-ZА-Я]{2}(?:224|124|24)",
        r"[A-ZА-Я]{2}\s*\d{4}\s*(?:224|124|24)",
    ]:
        candidates.extend(re.findall(pattern, before.upper()))

    for candidate in candidates:
        plate = normalize_plate(candidate)
        if looks_like_plate(plate):
            return {
                "number": plate,
                "price": price,
                "category": category or "Прочее",
                "status": "available",
            }
    return None


def parse_catalog(text: str):
    items = []
    current_category = "Прочее"
    seen = set()
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        cat = extract_category(line)
        if cat and parse_price(line)[0] is None:
            current_category = cat
            continue
        item = parse_line(line, current_category)
        if not item:
            continue
        key = re.sub(r"\s+", "", item["number"])
        if key in seen:
            continue
        seen.add(key)
        items.append(item)
    return items


def main():
    text = fetch_post_text_from_updates()
    items = parse_catalog(text)
    if not items:
        print("Текст поста:\n" + text, file=sys.stderr)
        raise RuntimeError("Пост получен через Bot API, но из него не удалось распознать ни одного номера")

    payload = {
        "source": SOURCE_POST,
        "source_type": "telegram_bot_api",
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "count": len(items),
        "items": items,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Синхронизировано {len(items)} номеров из {SOURCE_POST} через Telegram Bot API")


if __name__ == "__main__":
    main()
