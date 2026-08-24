import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const SUPABASE_URL =
  "https://tjxumwgktffnfgpdka.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_29-OjXwd3B9rGcPg06If4Q_1R8-DjQh";

const API_URL = `${SUPABASE_URL}/rest/v1/numbers`;

const FALLBACK_NUMBERS = [
  {
    id: "package-333",
    number: "С333ОК24 + С333ОК124",
    price: 1300000,
    category: "Комплекты",
    region: "Красноярский край",
    regionCode: "24",
  },
  {
    id: "u999tt24",
    number: "У999ТТ",
    price: 550000,
    category: "Одинаковые цифры",
    region: "Красноярский край",
    regionCode: "24",
  },
  {
    id: "u001et24",
    number: "У001ЕТ",
    price: 550000,
    category: "Первая сотня",
    region: "Красноярский край",
    regionCode: "24",
  },
];

/* =========================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
========================= */

function formatPrice(price) {
  return `${Number(price || 0).toLocaleString("ru-RU")} ₽`;
}

function getLevel(item) {
  const price = Number(item?.price || 0);

  if (price >= 400000) {
    return "VIP";
  }

  if (price >= 200000) {
    return "Premium";
  }

  return "";
}

function normalizeCategory(category) {
  if (!category) {
    return "Другие";
  }

  const value = String(category).trim();

  const aliases = {
    "первая сотня": "Первая сотня",
    "одинаковые цифры": "Одинаковые цифры",
    "комплекты": "Комплекты",
    "красивые буквы": "Красивые буквы",
    "зеркальные": "Зеркальные",
    "одинаковые буквы": "Одинаковые буквы",
  };

  return aliases[value.toLowerCase()] || value;
}

function normalizeNumber(item, index) {
  return {
    id:
      item?.id ??
      `${item?.number || item?.plate || "number"}-${index}`,

    number:
      item?.number ??
      item?.plate ??
      item?.name ??
      item?.["номер"] ??
      "",

    price: Number(item?.price ?? 0),

    category: normalizeCategory(
      item?.category ??
        item?.type ??
        item?.category_name
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
 * Убираем настоящие дубли.

 * Например, если Supabase отдаёт:
 *
 * С333ОК24 + С333ОК124
 * С333ОК24 + С333ОК124
 * С333ОК24 + С333ОК124
 *
 * останется только одна карточка.

 * Разные номера с одинаковой ценой НЕ удаляются.
 */
function removeDuplicates(items) {
  const result = [];
  const keys = new Set();

  for (const item of items) {
    const number = String(item.number || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, " ");

    const category = String(item.category || "")
      .trim()
      .toLowerCase();

    const price = Number(item.price || 0);

    const key = `${category}|${number}|${price}`;

    if (keys.has(key)) {
      continue;
    }

    keys.add(key);
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

/* =========================
   ГОСУДАРСТВЕННЫЙ НОМЕР
========================= */

function Plate({ number, regionCode }) {
  const text = String(number || "").trim();

  const parts = text
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div className="plate-wrapper">
      <div className="plate">
        <div className="plate-number">
          {parts.map((part, index) => (
            <React.Fragment key={`${part}-${index}`}>
              {index > 0 && (
                <span className="plate-plus">
                  {" + "}
                </span>
              )}

              <span>{part}</span>
            </React.Fragment>
          ))}
        </div>

        <div className="plate-region">
          <strong>{regionCode || "24"}</strong>
          <span>RUS</span>
        </div>
      </div>
    </div>
  );
}

/* =========================
   КАРТОЧКА НОМЕРА
========================= */

function NumberCard({
  item,
  favorite,
  onFavorite,
  onDetails,
}) {
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
          className={`favorite-button ${
            favorite ? "active" : ""
          }`}
          onClick={() => onFavorite(item.id)}
          aria-label="Избранное"
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="number-info">
        {level && (
          <div
            className={`level level-${level.toLowerCase()}`}
          >
            {level}
          </div>
        )}

        <div className="category">
          {item.category}
        </div>

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

/* =========================
   APP
========================= */

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

  const [selectedNumber, setSelectedNumber] =
    useState(null);

  const [activeTab, setActiveTab] =
    useState("catalog");

  /* =========================
     ЗАГРУЗКА ИЗ SUPABASE
  ========================= */

  async function loadNumbers() {
    setLoading(true);

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

      const normalized = Array.isArray(data)
        ? data.map(normalizeNumber)
        : [];

      const unique = removeDuplicates(normalized);

      if (unique.length > 0) {
        setNumbers(unique);
      } else {
        setNumbers(
          removeDuplicates(
            FALLBACK_NUMBERS.map(normalizeNumber)
          )
        );
      }
    } catch (error) {
      console.error(
        "Ошибка загрузки номеров:",
        error
      );

      setNumbers(
        removeDuplicates(
          FALLBACK_NUMBERS.map(normalizeNumber)
        )
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNumbers();
  }, []);

  /* =========================
     СОХРАНЕНИЕ ИЗБРАННОГО
  ========================= */

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

  /* =========================
     ФИЛЬТРАЦИЯ
  ========================= */

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

  /* =========================
     ГЛАВНАЯ
  ========================= */

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

  /* =========================
     КАТАЛОГ
  ========================= */

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
            <button
              type="button"
              className={
                filter === "Все"
                  ? "selected"
                  : ""
              }
              onClick={() => setFilter("Все")}
            >
              Все
            </button>

            <button
              type="button"
              className={
                filter === "Premium"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setFilter("Premium")
              }
            >
              Premium
            </button>

            <button
              type="button"
              className={
                filter === "VIP"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setFilter("VIP")
              }
            >
              VIP
            </button>
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

  /* =========================
     ИЗБРАННОЕ
  ========================= */

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

  /* =========================
     ЗАЯВКИ
  ========================= */

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

  /* =========================
     ПРОФИЛЬ
  ========================= */

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

  /* =========================
     ОСНОВНОЙ ЭКРАН
  ========================= */

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

      {/* =========================
          НИЖНЯЯ НАВИГАЦИЯ
      ========================= */}

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

      {/* =========================
          ОКНО "ПОДРОБНЕЕ"
      ========================= */}

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

/* =========================
   ЗАПУСК REACT
========================= */

const rootElement =
  document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
