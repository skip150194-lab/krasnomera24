#!/usr/bin/env python3
import argparse
import asyncio
import csv
import json
import random
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout

BASE_URL = "https://auto.drom.ru/region24/"
ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "beautiful_numbers.csv"
STATE = ROOT / "checked_ads.json"
PROFILE = ROOT / ".browser-profile"

PLATE_RE = re.compile(
    r"(?<![АВЕКМНОРСТУХA-Z0-9])"
    r"([АВЕКМНОРСТУХABEKMHOPCTYX])[\s\-_.]*"
    r"(\d{3})[\s\-_.]*"
    r"([АВЕКМНОРСТУХABEKMHOPCTYX])[\s\-_.]*"
    r"([АВЕКМНОРСТУХABEKMHOPCTYX])[\s\-_.]*"
    r"(124|24)(?!\d)",
    re.IGNORECASE,
)

TRANSLATE = str.maketrans({
    "A": "А", "B": "В", "E": "Е", "K": "К", "M": "М",
    "H": "Н", "O": "О", "P": "Р", "C": "С", "T": "Т",
    "Y": "У", "X": "Х",
    "a": "А", "b": "В", "e": "Е", "k": "К", "m": "М",
    "h": "Н", "o": "О", "p": "Р", "c": "С", "t": "Т",
    "y": "У", "x": "Х",
})

DESCRIPTION_SELECTORS = (
    '[data-ftid="bull_description"]',
    '[itemprop="description"]',
    '[data-bull-description]',
)

BLOCKED_TYPES = {"image", "media", "font"}


def normalize(text):
    return text.translate(TRANSLATE).upper().replace("Ё", "Е")


def classify(letters, digits):
    kinds = []
    score = 0
    value = int(digits)

    if len(set(digits)) == 1:
        kinds.append("одинаковые цифры")
        score += 100
    if 0 < value < 100:
        kinds.append("первая сотня")
        score += 70
    if digits == digits[::-1]:
        kinds.append("зеркало")
        score += 60
    if digits in {
        "123", "234", "345", "456", "567", "678", "789",
        "987", "876", "765", "654", "543", "432", "321",
    }:
        kinds.append("последовательность")
        score += 80
    if digits.endswith("00"):
        kinds.append("сотня")
        score += 55
    if digits[0] == digits[1] or digits[1] == digits[2]:
        kinds.append("две одинаковые цифры")
        score += 25

    if len(set(letters)) == 1:
        kinds.append("три одинаковые буквы")
        score += 100
    elif letters[0] == letters[2]:
        kinds.append("зеркальные буквы")
        score += 55
    elif len(set(letters)) == 2:
        kinds.append("две одинаковые буквы")
        score += 25

    return score, kinds


def find_plates(description):
    found = {}
    text = normalize(description)

    for match in PLATE_RE.finditer(text):
        first, digits, second, third, region = match.groups()
        first, second, third = normalize(first + second + third)
        letters = first + second + third
        plate = f"{first}{digits}{second}{third}{region}"
        score, kinds = classify(letters, digits)

        if score >= 50:
            found[plate] = {
                "plate": plate,
                "score": score,
                "category": ", ".join(kinds),
            }

    return sorted(found.values(), key=lambda item: item["score"], reverse=True)


def listing_url(value):
    parsed = urlparse(value)
    return bool(
        parsed.hostname
        and parsed.hostname.endswith("drom.ru")
        and re.search(r"/\d{6,}\.html$", parsed.path)
    )


def load_state():
    if not STATE.exists():
        return set()
    try:
        return set(json.loads(STATE.read_text(encoding="utf-8")).get("checked", []))
    except Exception:
        return set()


def save_state(checked):
    temporary = STATE.with_suffix(".tmp")
    temporary.write_text(
        json.dumps({"checked": sorted(checked)}, ensure_ascii=False),
        encoding="utf-8",
    )
    temporary.replace(STATE)


def prepare_csv():
    if OUTPUT.exists():
        return
    with OUTPUT.open("w", encoding="utf-8-sig", newline="") as handle:
        csv.writer(handle, delimiter=";").writerow([
            "Госномер", "Категория", "Рейтинг", "Автомобиль",
            "Цена", "Ссылка", "Фрагмент описания",
        ])


def add_row(plate, title, price, url, description):
    compact = " ".join(description.split())
    with OUTPUT.open("a", encoding="utf-8-sig", newline="") as handle:
        csv.writer(handle, delimiter=";").writerow([
            plate["plate"], plate["category"], plate["score"],
            title, price, url, compact[:500],
        ])


async def description_from(page):
    for selector in DESCRIPTION_SELECTORS:
        item = page.locator(selector).first
        try:
            if await item.count():
                text = (await item.inner_text()).strip()
                if text:
                    return text
        except Exception:
            pass

    body = await page.locator("body").inner_text()
    match = re.search(
        r"(?:Комментарий продавца|Описание автомобиля)\s*(.+?)"
        r"(?=\n(?:Комплектация|Характеристики|Проверка автомобиля|"
        r"История автомобиля|Дополнительно)\b)",
        body,
        re.I | re.S,
    )
    return match.group(1).strip() if match else ""


async def price_from(page):
    for selector in ('[data-ftid="bull_price"]', '[itemprop="price"]'):
        item = page.locator(selector).first
        try:
            if await item.count():
                return " ".join((await item.inner_text()).split())
        except Exception:
            pass
    return ""


async def collect_links(page, page_number):
    address = BASE_URL if page_number == 1 else f"{BASE_URL}page{page_number}/"
    response = await page.goto(address, wait_until="domcontentloaded", timeout=60000)
    if response and response.status >= 400:
        raise RuntimeError(f"Страница выдачи вернула HTTP {response.status}")

    hrefs = await page.locator("a[href]").evaluate_all(
        "items => items.map(item => item.href)"
    )
    return sorted({
        urljoin(BASE_URL, href).split("?")[0]
        for href in hrefs
        if listing_url(urljoin(BASE_URL, href).split("?")[0])
    })


async def inspect_ad(page, url):
    try:
        response = await page.goto(url, wait_until="domcontentloaded", timeout=60000)
    except PlaywrightTimeout:
        print(f"Тайм-аут: {url}")
        return 0

    if response and response.status >= 400:
        return 0

    body = await page.locator("body").inner_text()
    lower = body.lower()

    if any(text in lower for text in (
        "объявление снято с продажи",
        "объявление удалено",
        "автомобиль продан",
    )):
        return 0

    if "подтвердите, что вы не робот" in lower or "captcha" in page.url.lower():
        print("\nПройдите проверку в открытом браузере.")
        await asyncio.to_thread(input, "После проверки нажмите Enter: ")
        await page.reload(wait_until="domcontentloaded")

    description = await description_from(page)
    if not description:
        return 0

    plates = find_plates(description)
    if not plates:
        return 0

    title = ""
    try:
        title = " ".join((await page.locator("h1").first.inner_text()).split())
    except Exception:
        pass
    price = await price_from(page)

    for plate in plates:
        add_row(plate, title, price, url, description)
        print(f'НАЙДЕНО: {plate["plate"]} — {url}')

    return len(plates)


async def main(max_pages, new_only):
    checked = load_state()
    prepare_csv()
    total = 0

    async with async_playwright() as engine:
        context = await engine.chromium.launch_persistent_context(
            str(PROFILE),
            headless=False,
            locale="ru-RU",
            viewport={"width": 1350, "height": 850},
        )

        async def block_heavy(route):
            if route.request.resource_type in BLOCKED_TYPES:
                await route.abort()
            else:
                await route.continue_()

        await context.route("**/*", block_heavy)
        list_page = await context.new_page()
        ad_page = await context.new_page()
        number = 1
        pages_without_new = 0

        while max_pages == 0 or number <= max_pages:
            print(f"\nСтраница выдачи {number}")
            try:
                links = await collect_links(list_page, number)
            except Exception as error:
                print(f"Остановка: {error}")
                break

            if not links:
                print("Объявления закончились.")
                break

            fresh = [url for url in links if url not in checked]
            print(f"Ссылок: {len(links)}; новых: {len(fresh)}")

            if not fresh:
                pages_without_new += 1
                if new_only and pages_without_new >= 3:
                    print("Три страницы без новых объявлений — проверка завершена.")
                    break
            else:
                pages_without_new = 0

            for index, url in enumerate(fresh, 1):
                print(f"[{index}/{len(fresh)}] {url}")
                try:
                    total += await inspect_ad(ad_page, url)
                except Exception as error:
                    print(f"Ошибка объявления: {error}")
                checked.add(url)
                save_state(checked)
                await asyncio.sleep(random.uniform(2.0, 3.5))

            number += 1
            await asyncio.sleep(random.uniform(3.0, 5.0))

        await context.close()

    print(f"\nГотово. Новых совпадений: {total}")
    print(f"Файл: {OUTPUT}")


if __name__ == "__main__":
    cli = argparse.ArgumentParser()
    cli.add_argument("--pages", type=int, default=0, help="0 — все страницы")
    cli.add_argument(
        "--full",
        action="store_true",
        help="Не останавливаться после трёх страниц без новых ссылок",
    )
    args = cli.parse_args()
    asyncio.run(main(args.pages, not args.full))
