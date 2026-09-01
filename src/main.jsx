import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const SUPABASE_URL = "https://tjxumwgktffnfgpdka.supabase.co";
const SUPABASE_KEY = "sb_publishable_29-OjXwd3B9rGcPg06If4Q_1R8-DjQh";
const API_URL = `${SUPABASE_URL}/rest/v1/numbers`;

/*
 * ПОЛНЫЙ КАТАЛОГ GRZ124.
 * Supabase теперь ДОПОЛНЯЕТ этот список, а не заменяет его.
 * Поэтому даже если в базе сейчас только 3 записи,
 * приложение всё равно покажет весь каталог.
 */
const FALLBACK_NUMBERS = [
  {
    "id": "number-1",
    "number": "У001ЕТ24",
    "price": 550000,
    "category": "Первая сотня",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-2",
    "number": "О003МС124",
    "price": 210000,
    "category": "Первая сотня",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-3",
    "number": "В009РР124",
    "price": 250000,
    "category": "Первая сотня",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-4",
    "number": "У011ВН124",
    "price": 90000,
    "category": "Первая сотня",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-5",
    "number": "Т020РА24",
    "price": 75000,
    "category": "Первая сотня",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-6",
    "number": "Н024ОС24",
    "price": 165000,
    "category": "Первая сотня",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-7",
    "number": "В024СМ24",
    "price": 185000,
    "category": "Первая сотня",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-8",
    "number": "Р027ОМ124",
    "price": 70000,
    "category": "Первая сотня",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-9",
    "number": "Е032КО24",
    "price": 55000,
    "category": "Первая сотня",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-10",
    "number": "М035ТВ124",
    "price": 40000,
    "category": "Первая сотня",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-11",
    "number": "К066НХ24",
    "price": 85000,
    "category": "Первая сотня",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-12",
    "number": "М093ТВ124",
    "price": 40000,
    "category": "Первая сотня",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-13",
    "number": "М094ТВ124",
    "price": 40000,
    "category": "Первая сотня",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-14",
    "number": "Н111ХЕ124",
    "price": 300000,
    "category": "Одинаковые цифры",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-15",
    "number": "М333УМ24",
    "price": 280000,
    "category": "Одинаковые цифры",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "reserved"
  },
  {
    "id": "number-16",
    "number": "С555МЕ124",
    "price": 285000,
    "category": "Одинаковые цифры",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-17",
    "number": "У666ТА124",
    "price": 250000,
    "category": "Одинаковые цифры",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-18",
    "number": "Е666РЕ124",
    "price": 350000,
    "category": "Одинаковые цифры",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-19",
    "number": "Р888УХ24",
    "price": 430000,
    "category": "Одинаковые цифры",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-20",
    "number": "В888МК24",
    "price": 500000,
    "category": "Одинаковые цифры",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-21",
    "number": "У999ТТ24",
    "price": 550000,
    "category": "Одинаковые цифры",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-22",
    "number": "А731АА24+А731АА124",
    "price": 375000,
    "category": "Комплекты",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-23",
    "number": "С333ОК24+С333ОК124",
    "price": 1300000,
    "category": "Комплекты",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-24",
    "number": "Х200НУ24",
    "price": 120000,
    "category": "Сотни",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-25",
    "number": "Р014РР24",
    "price": 250000,
    "category": "Буквы",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-26",
    "number": "У116УУ24",
    "price": 140000,
    "category": "Буквы",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-27",
    "number": "В391ВВ124",
    "price": 125000,
    "category": "Буквы",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-28",
    "number": "Е426ЕЕ124",
    "price": 105000,
    "category": "Буквы",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-29",
    "number": "О482ОО24",
    "price": 380000,
    "category": "Буквы",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-30",
    "number": "А742АА124",
    "price": 140000,
    "category": "Буквы",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-31",
    "number": "Р803РР24",
    "price": 100000,
    "category": "Буквы",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-32",
    "number": "А820АА24",
    "price": 175000,
    "category": "Буквы",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-33",
    "number": "В922ВВ124",
    "price": 100000,
    "category": "Буквы",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-34",
    "number": "Х124УВ124",
    "price": 155000,
    "category": "124/124;224/224",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-35",
    "number": "Н121УМ124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-36",
    "number": "У121УС124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-37",
    "number": "Т161ТС124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-38",
    "number": "Х181УН124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-39",
    "number": "В181НЕ124",
    "price": 60000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-40",
    "number": "Р191УУ124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-41",
    "number": "Т212УХ124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-42",
    "number": "Е292УМ124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-43",
    "number": "У363УН124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-44",
    "number": "О373ХА224",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-45",
    "number": "О373УН124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-46",
    "number": "Е393УУ124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-47",
    "number": "С484ХН124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-48",
    "number": "В484ХН124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-49",
    "number": "К545УР124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-50",
    "number": "Т595УХ124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-51",
    "number": "С646ХН124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-52",
    "number": "В656УХ124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-53",
    "number": "Н656УР124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-54",
    "number": "К686УХ124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-55",
    "number": "С787УХ124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-56",
    "number": "В808ХН124",
    "price": 100000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-57",
    "number": "Т828УС124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-58",
    "number": "У898НТ124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-59",
    "number": "С949УУ124",
    "price": 39000,
    "category": "Зеркала",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-60",
    "number": "Е110УТ124",
    "price": 35000,
    "category": "Прочее",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-61",
    "number": "Х150АН224",
    "price": 85000,
    "category": "Прочее",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-62",
    "number": "Т221УР124",
    "price": 35000,
    "category": "Прочее",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-63",
    "number": "Х227АН224",
    "price": 45000,
    "category": "Прочее",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-64",
    "number": "О321ХА224",
    "price": 30000,
    "category": "Прочее",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-65",
    "number": "М359УР124",
    "price": 30000,
    "category": "Прочее",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-66",
    "number": "М389УР124",
    "price": 30000,
    "category": "Прочее",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-67",
    "number": "М398УР124",
    "price": 30000,
    "category": "Прочее",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-68",
    "number": "В440УС124",
    "price": 30000,
    "category": "Прочее",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-69",
    "number": "К567УР124",
    "price": 35000,
    "category": "Прочее",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-70",
    "number": "О877ХА224",
    "price": 25000,
    "category": "Прочее",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-71",
    "number": "НВ 7878 24",
    "price": 50000,
    "category": "Прицеп",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-72",
    "number": "ОВ 0999 24",
    "price": 175000,
    "category": "Прицеп",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-73",
    "number": "ОВ 0990 24",
    "price": 120000,
    "category": "Прицеп",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-74",
    "number": "ОВ 0969 24",
    "price": 75000,
    "category": "Прицеп",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-75",
    "number": "ОВ 0828 24",
    "price": 55000,
    "category": "Прицеп",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-76",
    "number": "НК 6066 24",
    "price": 55000,
    "category": "Прицеп",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-77",
    "number": "НК 7666 24",
    "price": 75000,
    "category": "Прицеп",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-78",
    "number": "НК 7667 24",
    "price": 50000,
    "category": "Прицеп",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-79",
    "number": "НЕ 7333 24",
    "price": 75000,
    "category": "Прицеп",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-80",
    "number": "НК 2929 24",
    "price": 45000,
    "category": "Прицеп",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-81",
    "number": "ОВ 2999 24",
    "price": 75000,
    "category": "Прицеп",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-82",
    "number": "ОВ 4774 24",
    "price": 75000,
    "category": "Прицеп",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-83",
    "number": "АК 0200 24",
    "price": 160000,
    "category": "Мото",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-84",
    "number": "ВА 4666 24",
    "price": 60000,
    "category": "Мото",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  },
  {
    "id": "number-85",
    "number": "АМ 3993 24",
    "price": 60000,
    "category": "Мото",
    "region": "Красноярский край",
    "regionCode": "24",
    "status": "available"
  }
];

function formatPrice(price) {
  return `${Number(price || 0).toLocaleString("ru-RU")} ₽`;
}

function getLevel(item) {
  const price = Number(item?.price || 0);
  if (price >= 400000) return "VIP";
  if (price >= 200000) return "Premium";
  return "";
}

function normalizeCategory(category) {
  if (!category) return "Другие";

  const value = String(category).trim();
  const aliases = {
    "первая сотня": "Первая сотня",
    "одинаковые цифры": "Одинаковые цифры",
    "комплекты": "Комплекты",
    "красивые буквы": "Красивые буквы",
    "буквы": "Буквы",
    "зеркальные": "Зеркала",
    "зеркала": "Зеркала",
  };

  return aliases[value.toLowerCase()] || value;
}

function normalizeNumber(item, index) {
  return {
    id: item?.id ?? `${item?.number || item?.plate || "number"}-${index}`,
    number:
      item?.number ??
      item?.plate ??
      item?.name ??
      item?.["номер"] ??
      "",
    price: Number(item?.price ?? 0),
    category: normalizeCategory(
      item?.category ?? item?.type ?? item?.category_name
    ),
    region:
      item?.region ??
      item?.region_name ??
      "Красноярский край",
    regionCode:
      item?.region_code ??
      item?.regionCode ??
      item?.code ??
      "24",
    reserved:
      Boolean(item?.reserved) ||
      item?.status === "reserved" ||
      item?.status === "Продан",
    description: item?.description ?? "",
    phone: item?.phone ?? "",
    telegram: item?.telegram ?? "",
  };
}

/*
 * Удаляем только реальные дубли одного и того же номера.
 * Цена и категория не создают вторую карточку.
 */
function removeDuplicates(items) {
  const result = [];
  const keys = new Set();

  for (const item of items) {
    const number = String(item.number || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, " ");

    if (!number || keys.has(number)) continue;

    keys.add(number);
    result.push(item);
  }

  return result;
}

function isReserved(item) {
  return Boolean(
    item?.reserved === true ||
    item?.status === "reserved" ||
    item?.status === "Продан"
  );
}

function parsePlatePart(part, fallbackRegionCode) {
  const raw = String(part || "").trim().toUpperCase();
  const compact = raw.replace(/\s+/g, "");

  // Обычный российский автомобильный номер: буква + 3 цифры + 2 буквы + регион.
  const carMatch = compact.match(/^([А-ЯA-Z])(\d{3})([А-ЯA-Z]{2})(\d{2,3})$/);
  if (carMatch) {
    return {
      firstLetter: carMatch[1],
      digits: carMatch[2],
      lastLetters: carMatch[3],
      main: `${carMatch[1]}${carMatch[2]}${carMatch[3]}`,
      region: carMatch[4],
      variant: "car",
    };
  }

  // Спецформаты каталога: две буквы + четыре цифры + регион
  // (прицепы и мотоциклы в текущем каталоге).
  const specialMatch = compact.match(/^([А-ЯA-Z]{2})(\d{4})(\d{2,3})$/);
  if (specialMatch) {
    return {
      main: `${specialMatch[1]} ${specialMatch[2]}`,
      region: specialMatch[3],
      variant: "special",
    };
  }

  return {
    main: raw,
    region: String(fallbackRegionCode || "").trim(),
    variant: "unknown",
  };
}

function Plate({ number, regionCode }) {
  const parts = String(number || "")
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div className="plate-wrap">
      {parts.map((part, index) => {
        const parsed = parsePlatePart(part, regionCode);
        const hasRegion = Boolean(parsed.region);

        return (
          <React.Fragment key={`${part}-${index}`}>
            {index > 0 && <span className="plate-plus">+</span>}

            <div
              className={`plate plate--${parsed.variant}`}
              aria-label={`Государственный номер ${part}`}
            >
              <div className="plate-main">
                {parsed.variant === "car" ? (
                  <span className="plate-main-text plate-main-text--car">
                    <span className="plate-char plate-char--letter">
                      {parsed.firstLetter}
                    </span>
                    <span className="plate-char plate-char--digits">
                      {parsed.digits}
                    </span>
                    <span className="plate-char plate-char--letters">
                      {parsed.lastLetters}
                    </span>
                  </span>
                ) : (
                  <span className="plate-main-text">{parsed.main}</span>
                )}
              </div>

              {hasRegion && (
                <div className="plate-region">
                  <strong>{parsed.region}</strong>
                  <div className="plate-rus">
                    <span className="plate-flag" aria-hidden="true" />
                    <span>RUS</span>
                  </div>
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function NumberCard({ item, favorite, onFavorite, onDetails }) {
  const level = getLevel(item);
  const reserved = isReserved(item);

  return (
    <article className="number-card">
      <div className="number-card-top">
        <Plate
          number={item.number}
          regionCode={item.regionCode}
        />

        <button
          type="button"
          className={`favorite-button ${favorite ? "active" : ""}`}
          onClick={() => onFavorite(item.id)}
          aria-label="Избранное"
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="number-info">
        {level && (
          <div className={`level level-${level.toLowerCase()}`}>
            {level}
          </div>
        )}

        <div className="category">{item.category}</div>

        <div className="region">
          {item.region} · регион {item.regionCode}
        </div>

        <div className="price">
          {formatPrice(item.price)}
        </div>

        {item.description && (
          <div className="description">
            {item.description}
          </div>
        )}

        {reserved ? (
          <button
            type="button"
            className="details-button disabled"
            disabled
          >
            Занято
          </button>
        ) : (
          <button
            type="button"
            className="details-button"
            onClick={() => onDetails(item)}
          >
            Подробнее
          </button>
        )}
      </div>
    </article>
  );
}

function App() {
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Все");

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(
        "beautiful-numbers-favorites"
      );

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedNumber, setSelectedNumber] = useState(null);
  const [activeTab, setActiveTab] = useState("catalog");

  async function loadNumbers() {
    setLoading(true);

    const localNumbers =
      FALLBACK_NUMBERS.map(normalizeNumber);

    try {
      const response = await fetch(
        `${API_URL}?select=*&order=price.desc`,
        {
          method: "GET",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Supabase error: ${response.status}`
        );
      }

      const data = await response.json();

      const remoteNumbers = Array.isArray(data)
        ? data.map(normalizeNumber)
        : [];

      /*
       * КЛЮЧЕВОЕ ИЗМЕНЕНИЕ:
       * полный локальный список + данные Supabase.
       * База больше не может скрыть остальные номера.
       */
      setNumbers(
        removeDuplicates([
          ...localNumbers,
          ...remoteNumbers,
        ])
      );
    } catch (error) {
      console.error(
        "Ошибка загрузки номеров:",
        error
      );

      setNumbers(
        removeDuplicates(localNumbers)
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNumbers();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "beautiful-numbers-favorites",
        JSON.stringify(favorites)
      );
    } catch {
      // localStorage недоступен
    }
  }, [favorites]);

  function toggleFavorite(id) {
    setFavorites((current) => {
      if (current.includes(id)) {
        return current.filter(
          (item) => item !== id
        );
      }

      return [...current, id];
    });
  }

  const filteredNumbers = useMemo(() => {
    let result = [...numbers];

    if (filter === "VIP") {
      result = result.filter(
        (item) => getLevel(item) === "VIP"
      );
    }

    if (filter === "Premium") {
      result = result.filter(
        (item) => getLevel(item) === "Premium"
      );
    }

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((item) => {
        const number = String(
          item.number || ""
        ).toLowerCase();

        const category = String(
          item.category || ""
        ).toLowerCase();

        const region = String(
          item.region || ""
        ).toLowerCase();

        return (
          number.includes(query) ||
          category.includes(query) ||
          region.includes(query)
        );
      });
    }

    return result;
  }, [numbers, filter, search]);

  const favoriteNumbers = useMemo(() => {
    return numbers.filter((item) =>
      favorites.includes(item.id)
    );
  }, [numbers, favorites]);

  function renderHome() {
    return (
      <section className="home-section">
        <div className="hero-card">
          <div className="hero-region">
            КРАСНОЯРСКИЙ КРАЙ
          </div>

          <h1>Красивые номера 24</h1>

          <p>
            Подберите номер, который запомнят.
          </p>

          <button
            type="button"
            onClick={() =>
              setActiveTab("catalog")
            }
          >
            Смотреть каталог
          </button>
        </div>

        <div className="home-stats">
          <div>
            <strong>{numbers.length}</strong>
            <span>номеров</span>
          </div>

          <div>
            <strong>
              {favoriteNumbers.length}
            </strong>
            <span>избранных</span>
          </div>
        </div>
      </section>
    );
  }

  function renderCatalog() {
    return (
      <>
        <section className="catalog-header">
          <h2>Каталог номеров</h2>

          <div className="catalog-icon">
            ▦
          </div>

          <div className="search-row">
            <span className="search-icon">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Поиск: 777, 001..."
            />
          </div>

          <div className="filters">
            {["Все", "Premium", "VIP"].map(
              (name) => (
                <button
                  key={name}
                  type="button"
                  className={
                    filter === name
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setFilter(name)
                  }
                >
                  {name}
                </button>
              )
            )}
          </div>
        </section>

        <section className="numbers-list">
          {loading ? (
            <div className="empty-state">
              Загрузка номеров...
            </div>
          ) : filteredNumbers.length === 0 ? (
            <div className="empty-state">
              {search
                ? "Номеров по вашему запросу не найдено."
                : "Номера пока не добавлены."}
            </div>
          ) : (
            filteredNumbers.map((item) => (
              <NumberCard
                key={item.id}
                item={item}
                favorite={favorites.includes(
                  item.id
                )}
                onFavorite={toggleFavorite}
                onDetails={setSelectedNumber}
              />
            ))
          )}
        </section>
      </>
    );
  }

  function renderFavorites() {
    return (
      <section className="page-section">
        <h2>Избранное</h2>

        {favoriteNumbers.length === 0 ? (
          <div className="empty-state">
            Здесь пока нет избранных номеров.
          </div>
        ) : (
          <div className="numbers-list">
            {favoriteNumbers.map((item) => (
              <NumberCard
                key={item.id}
                item={item}
                favorite={true}
                onFavorite={toggleFavorite}
                onDetails={setSelectedNumber}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  function renderRequests() {
    return (
      <section className="page-section">
        <h2>Заявки</h2>

        <div className="empty-state">
          Для оформления номера нажмите
          «Подробнее» в каталоге.
        </div>
      </section>
    );
  }

  function renderProfile() {
    return (
      <section className="page-section">
        <h2>Профиль</h2>

        <div className="profile-card">
          <div className="profile-title">
            Красивые номера 24
          </div>

          <div className="profile-text">
            Красноярский край · регион 24
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="app">
      <main className="content">
        <div className="top-region">
          КРАСНОЯРСКИЙ КРАЙ
        </div>

        <header className="main-header">
          <h1>Красивые номера 24</h1>

          <button
            type="button"
            className="refresh-button"
            onClick={loadNumbers}
            aria-label="Обновить"
          >
            ⟳
          </button>
        </header>

        {activeTab === "home" &&
          renderHome()}

        {activeTab === "catalog" &&
          renderCatalog()}

        {activeTab === "favorites" &&
          renderFavorites()}

        {activeTab === "requests" &&
          renderRequests()}

        {activeTab === "profile" &&
          renderProfile()}
      </main>

      <nav className="bottom-nav">
        <button
          type="button"
          className={
            activeTab === "home"
              ? "active"
              : ""
          }
          onClick={() => setActiveTab("home")}
        >
          <span className="nav-icon">⌂</span>
          <span>Главная</span>
        </button>

        <button
          type="button"
          className={
            activeTab === "catalog"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("catalog")
          }
        >
          <span className="nav-icon">▦</span>
          <span>Каталог</span>
        </button>

        <button
          type="button"
          className={
            activeTab === "favorites"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("favorites")
          }
        >
          <span className="nav-icon">♡</span>
          <span>Избранное</span>
        </button>

        <button
          type="button"
          className={
            activeTab === "requests"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("requests")
          }
        >
          <span className="nav-icon">□</span>
          <span>Заявки</span>
        </button>

        <button
          type="button"
          className={
            activeTab === "profile"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("profile")
          }
        >
          <span className="nav-icon">♙</span>
          <span>Профиль</span>
        </button>
      </nav>

      {selectedNumber && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedNumber(null)
          }
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="modal-close"
              onClick={() =>
                setSelectedNumber(null)
              }
            >
              ×
            </button>

            <Plate
              number={selectedNumber.number}
              regionCode={
                selectedNumber.regionCode
              }
            />

            <div className="modal-level">
              {getLevel(selectedNumber)}
            </div>

            <h3>
              {selectedNumber.category}
            </h3>

            <div className="modal-region">
              {selectedNumber.region}
              {" · регион "}
              {selectedNumber.regionCode}
            </div>

            <div className="modal-price">
              {formatPrice(
                selectedNumber.price
              )}
            </div>

            {selectedNumber.description && (
              <p className="modal-description">
                {selectedNumber.description}
              </p>
            )}

            <button
              type="button"
              className="details-button modal-action"
              onClick={() => {
                toggleFavorite(
                  selectedNumber.id
                );
              }}
            >
              {favorites.includes(
                selectedNumber.id
              )
                ? "Убрать из избранного"
                : "Добавить в избранное"}
            </button>

            <button
              type="button"
              className="details-button"
              onClick={() =>
                setSelectedNumber(null)
              }
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const rootElement =
  document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
