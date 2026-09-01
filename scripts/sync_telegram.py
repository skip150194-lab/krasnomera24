#!/usr/bin/env python3
import html
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

# Source of truth: the current edited Telegram post. Each sync rebuilds the JSON from scratch,
# so numbers removed from the post are removed from the application catalog too.
CHANNEL = "grz124"
POST_ID = "451"
SOURCE_POST = f"https://t.me/{CHANNEL}/{POST_ID}"
PUBLIC_URL = f"https://t.me/s/{CHANNEL}/{POST_ID}"
OUTPUT = Path("public/numbers.json")

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


class TelegramPostParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.target_depth = None
        self.depth = 0
        self.in_text = False
        self.text_depth = None
        self.parts = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.depth += 1
        if tag == "div" and attrs.get("data-post") == f"{CHANNEL}/{POST_ID}":
            self.target_depth = self.depth
        if self.target_depth is not None and tag == "div":
            classes = attrs.get("class", "").split()
            if "tgme_widget_message_text" in classes:
                self.in_text = True
                self.text_depth = self.depth
        if self.in_text and tag in {"br", "p", "div", "li"}:
            self.parts.append("\n")

    def handle_startendtag(self, tag, attrs):
        if self.in_text and tag == "br":
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if self.in_text and self.text_depth == self.depth and tag == "div":
            self.in_text = False
            self.text_depth = None
        if self.target_depth == self.depth and tag == "div":
            self.target_depth = None
        self.depth -= 1

    def handle_data(self, data):
        if self.in_text:
            self.parts.append(data)

    @property
    def text(self):
        text = html.unescape("".join(self.parts))
        text = text.replace("\xa0", " ")
        lines = [re.sub(r"[ \t]+", " ", x).strip() for x in text.splitlines()]
        return "\n".join(x for x in lines if x)


def fetch_post_text() -> str:
    request = urllib.request.Request(
        PUBLIC_URL,
        headers={
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
            "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        body = response.read().decode("utf-8", errors="replace")
    parser = TelegramPostParser()
    parser.feed(body)
    text = parser.text
    if not text:
        raise RuntimeError(f"Не удалось найти текст поста {CHANNEL}/{POST_ID} в публичной HTML-странице")
    return text


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
    text = fetch_post_text()
    items = parse_catalog(text)
    if not items:
        print("Текст поста:\n" + text, file=sys.stderr)
        raise RuntimeError("Пост найден, но из него не удалось распознать ни одного номера")

    payload = {
        "source": SOURCE_POST,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "count": len(items),
        "items": items,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Синхронизировано {len(items)} номеров из {SOURCE_POST}")


if __name__ == "__main__":
    main()
