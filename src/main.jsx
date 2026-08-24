import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const SUPABASE_URL = "https://tjxuumgwkttfnfgpdkaj.supabase.co";
const SUPABASE_KEY = "sb_publishable_29-OjXwd3B9rGcPGo6IF4Q_1R8-DjQh";

const TABLE_NAME = "numbers";

// ------------------------------------------------------------
// Перевод латинских букв из CSV в российские буквы номера
// ------------------------------------------------------------

const LATIN_TO_CYRILLIC = {
  A: "А",
  B: "В",
  C: "С",
  E: "Е",
  H: "Н",
  K: "К",
  M: "М",
  O: "О",
  P: "Р",
  T: "Т",
  X: "Х",
  Y: "У",
};

function displayNumber(value) {
  if (!value) return "";

  return String(value)
    .split("")
    .map((char) => LATIN_TO_CYRILLIC[char] || char)
    .join("");
}

// ------------------------------------------------------------
// Нормализация поиска
// ------------------------------------------------------------

function normalize(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-ZА-Я0-9]/g, "");
}

function formatPrice(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat("ru-RU").format(number) + " ₽";
}

// ------------------------------------------------------------
// Категории
// ------------------------------------------------------------

const CATEGORY_ORDER = [
  "Все",
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
];

function categoryLabel(category) {
  if (!category) return "Прочее";
  return category;
}

// ------------------------------------------------------------
// Supabase REST
// ------------------------------------------------------------

async function loadNumbers() {
  const url =
    `${SUPABASE_URL}/rest/v1/${TABLE_NAME}` +
    "?select=id,created_at,number,price,category,status" +
    "&order=id.asc";

  const response = await fetch(url, {
    method: "GET",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `Supabase ${response.status}: ${text || "Ошибка загрузки данных"}`
    );
  }

  return response.json();
}

// ------------------------------------------------------------
// Иконки
// ------------------------------------------------------------

function SearchIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </svg>
  );
}

function HeartIcon({ filled = false }) {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20.8 8.9c0 5.5-8.8 10.2-8.8 10.2S3.2 14.4 3.2 8.9A4.7 4.7 0 0 1 8 4.2c1.4 0 2.7.7 4 2 1.3-1.3 2.6-2 4-2a4.7 4.7 0 0 1 4.8 4.7Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

// ------------------------------------------------------------
// Автомобильный номер
// ------------------------------------------------------------

function NumberPlate({ value }) {
  const number = displayNumber(value);

  // Обычный номер типа А777АА24
  // Комплект и прицеп/мото тоже отображаются аккуратно.
  const match = number.match(/^([А-Я])(\d{3})([А-Я]{2})(\d{2,3})$/);

  if (!match) {
    return (
      <div className="plate">
        <div className="plate-main">{number}</div>
        <div className="plate-country">
          <strong>RUS</strong>
        </div>
      </div>
    );
  }

  const [, letter, digits, letters, region] = match;

  return (
    <div className="plate">
      <div className="plate-main">
        <span>{letter}</span>
        <span>{digits}</span>
        <span>{letters}</span>
      </div>

      <div className="plate-region">
        <strong>{region}</strong>
        <small>RUS</small>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Основное приложение
// ------------------------------------------------------------

function App() {
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");

  const [selectedNumber, setSelectedNumber] = useState(null);

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("grz124_favorites") || "[]");
    } catch {
      return [];
    }
  });

  // ----------------------------------------------------------
  // Загрузка номеров
  // ----------------------------------------------------------

  async function refreshNumbers() {
    try {
      setLoading(true);
      setError("");

      const data = await loadNumbers();

      setNumbers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Не удалось загрузить номера");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshNumbers();
  }, []);

  // ----------------------------------------------------------
  // Избранное
  // ----------------------------------------------------------

  function toggleFavorite(id) {
    setFavorites((previous) => {
      const next = previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id];

      localStorage.setItem("grz124_favorites", JSON.stringify(next));

      return next;
    });
  }

  // ----------------------------------------------------------
  // Фильтрация
  // ----------------------------------------------------------

  const filteredNumbers = useMemo(() => {
    const query = normalize(search);

    return numbers.filter((item) => {
      const itemNumber = normalize(item.number);
      const itemDisplayNumber = normalize(displayNumber(item.number));

      const matchesSearch =
        !query ||
        itemNumber.includes(query) ||
        itemDisplayNumber.includes(query);

      const matchesCategory =
        category === "Все" || item.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [numbers, search, category]);

  // ----------------------------------------------------------
  // Доступные категории из БД
  // ----------------------------------------------------------

  const categories = useMemo(() => {
    const existing = new Set(
      numbers
        .map((item) => item.category)
        .filter(Boolean)
    );

    const ordered = CATEGORY_ORDER.filter(
      (item) => item === "Все" || existing.has(item)
    );

    // Если в БД появится новая категория,
    // она тоже автоматически появится.
    const additional = [...existing].filter(
      (item) => !CATEGORY_ORDER.includes(item)
    );

    return [...ordered, ...additional];
  }, [numbers]);

  // ----------------------------------------------------------
  // Статистика
  // ----------------------------------------------------------

  const availableCount = numbers.filter(
    (item) => item.status !== "reserved"
  ).length;

  const reservedCount = numbers.filter(
    (item) => item.status === "reserved"
  ).length;

  // ----------------------------------------------------------
  // Экран загрузки
  // ----------------------------------------------------------

  if (loading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loader"></div>

          <h2>GRZ124</h2>

          <p>Загружаем каталог номеров...</p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // Ошибка
  // ----------------------------------------------------------

  if (error) {
    return (
      <div className="app">
        <div className="error-screen">
          <div className="error-icon">!</div>

          <h2>Не удалось загрузить каталог</h2>

          <p>{error}</p>

          <button
            className="primary-button"
            onClick={refreshNumbers}
          >
            Повторить
          </button>

          <small>
            Проверь RLS policy таблицы numbers и доступ SELECT
            для anon.
          </small>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // Основной интерфейс
  // ----------------------------------------------------------

  return (
    <div className="app">
      <div className="page">

        {/* HEADER */}

        <header className="header">
          <div>
            <div className="region-title">
              КРАСНОЯРСКИЙ КРАЙ
            </div>

            <h1>
              Красивые номера <span>24</span>
            </h1>
          </div>

          <button
            className="header-button"
            onClick={refreshNumbers}
            title="Обновить"
          >
            ↻
          </button>
        </header>

        {/* CATALOG */}

        <main>
          <div className="catalog-header">
            <div>
              <h2>Каталог номеров</h2>

              <div className="stats">
                <span>{availableCount} в наличии</span>

                {reservedCount > 0 && (
                  <span>{reservedCount} в брони</span>
                )}
              </div>
            </div>
          </div>

          {/* SEARCH */}

          <div className="search-box">
            <SearchIcon />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск: 777, 001..."
              type="text"
            />

            {search && (
              <button
                className="clear-button"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>

          {/* CATEGORIES */}

          <div className="categories">
            {categories.map((item) => (
              <button
                key={item}
                className={
                  category === item
                    ? "category active"
                    : "category"
                }
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {/* RESULT COUNT */}

          <div className="result-count">
            Найдено: <strong>{filteredNumbers.length}</strong>
          </div>

          {/* CARDS */}

          {filteredNumbers.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">⌕</div>

              <h3>Ничего не найдено</h3>

              <p>
                Попробуй изменить запрос или выбрать другую
                категорию.
              </p>
            </div>
          ) : (
            <div className="numbers-list">
              {filteredNumbers.map((item) => {
                const isReserved = item.status === "reserved";
                const isFavorite = favorites.includes(item.id);

                return (
                  <article
                    className={
                      isReserved
                        ? "number-card reserved"
                        : "number-card"
                    }
                    key={item.id}
                  >
                    <div className="card-top">
                      <NumberPlate value={item.number} />

                      <button
                        className={
                          isFavorite
                            ? "favorite active"
                            : "favorite"
                        }
                        onClick={() =>
                          toggleFavorite(item.id)
                        }
                        aria-label="Избранное"
                      >
                        <HeartIcon filled={isFavorite} />
                      </button>
                    </div>

                    <div className="card-info">
                      <div className="card-left">
                        <div className="badge">
                          {categoryLabel(item.category)}
                        </div>

                        {isReserved && (
                          <div className="reserved-badge">
                            Бронь
                          </div>
                        )}

                        <div className="location">
                          Красноярский край · регион 24
                        </div>
                      </div>

                      <div className="price">
                        {formatPrice(item.price)}
                      </div>
                    </div>

                    <button
                      className="details-button"
                      onClick={() =>
                        setSelectedNumber(item)
                      }
                    >
                      Подробнее
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* DETAIL MODAL */}

      {selectedNumber && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedNumber(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedNumber(null)}
            >
              <CloseIcon />
            </button>

            <div className="modal-title">
              <span>Номер</span>

              <h2>
                {displayNumber(selectedNumber.number)}
              </h2>
            </div>

            <NumberPlate value={selectedNumber.number} />

            <div className="modal-price">
              {formatPrice(selectedNumber.price)}
            </div>

            <div className="modal-row">
              <span>Категория</span>
              <strong>
                {categoryLabel(selectedNumber.category)}
              </strong>
            </div>

            <div className="modal-row">
              <span>Регион</span>
              <strong>Красноярский край · 24</strong>
            </div>

            <div className="modal-row">
              <span>Статус</span>

              <strong
                className={
                  selectedNumber.status === "reserved"
                    ? "status-reserved"
                    : "status-available"
                }
              >
                {selectedNumber.status === "reserved"
                  ? "Забронирован"
                  : "В наличии"}
              </strong>
            </div>

            <div className="modal-actions">
              {selectedNumber.status === "reserved" ? (
                <button className="disabled-button" disabled>
                  Номер забронирован
                </button>
              ) : (
                <a
                  className="primary-button"
                  href={`https://t.me/Dremov767?text=${encodeURIComponent(
                    `Здравствуйте! Интересует номер ${displayNumber(
                      selectedNumber.number
                    )} за ${formatPrice(selectedNumber.price)}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Написать продавцу
                </a>
              )}
            </div>

            <div className="modal-note">
              Помощь с переоформлением · Быстро и без рисков
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Запуск
// ------------------------------------------------------------

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
