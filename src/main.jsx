import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const SUPABASE_URL = "https://tjxuumgwkttfnfgpdkaj.supabase.co";
const SUPABASE_KEY =
  "sb_publishable_29-OjXwd3B9rGcPGo6IF4Q_1R8-DjQh";

const API_URL = `${SUPABASE_URL}/rest/v1/numbers`;

function formatPrice(price) {
  const value = Number(price || 0);

  return `${value.toLocaleString("ru-RU")} ₽`;
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

function getCategoryName(category) {
  const names = {
    "Первая сотня": "Первая сотня",
    "Одинаковые цифры": "Одинаковые цифры",
    Комплекты: "Комплекты",
    Сотни: "Сотни",
    Буквы: "Буквы",
    "124/124;224/224": "124 / 224",
    Зеркала: "Зеркала",
    Прочее: "Прочее",
    Прицеп: "Прицеп",
    Мото: "Мото",
  };

  return names[category] || category || "Прочее";
}

function isReserved(item) {
  return String(item?.status || "").toLowerCase() === "reserved";
}

function Plate({ number }) {
  const value = String(number || "").trim();

  if (!value) {
    return (
      <div className="plate">
        <div className="plate-main">—</div>

        <div className="plate-region">
          <strong>24</strong>
          <span>RUS</span>
        </div>
      </div>
    );
  }

  /*
    Комплекты могут выглядеть примерно так:

    С333ОК24+С333ОК
    или
    С333ОК24 + С333ОК

    В таком случае показываем всю строку
    как единый номер.
  */
  if (value.includes("+")) {
    const parts = value.split("+");

    return (
      <div className="plate">
        <div className="plate-main">
          {parts.map((part, index) => (
            <React.Fragment key={`${part}-${index}`}>
              {index > 0 && " + "}
              {part}
            </React.Fragment>
          ))}
        </div>

        <div className="plate-region">
          <strong>24</strong>
          <span>RUS</span>
        </div>
      </div>
    );
  }

  const regionMatch = value.match(/(224|124|24)$/);

  const region = regionMatch ? regionMatch[1] : "24";

  const mainNumber = regionMatch
    ? value.slice(0, -region.length)
    : value;

  return (
    <div className="plate">
      <div className="plate-main">{mainNumber}</div>

      <div className="plate-region">
        <strong>{region}</strong>
        <span>RUS</span>
      </div>
    </div>
  );
}

function NumberCard({ item, favorite, onFavorite }) {
  const level = getLevel(item);
  const reserved = isReserved(item);

  const number = String(item?.number || "");

  return (
    <article
      className={`number-card ${
        reserved ? "reserved" : ""
      }`}
    >
      <div className="card-top">
        <Plate number={number} />

        <button
          type="button"
          className={`favorite ${
            favorite ? "active" : ""
          }`}
          onClick={() => onFavorite(number)}
          aria-label={
            favorite
              ? "Убрать из избранного"
              : "Добавить в избранное"
          }
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="card-info">
        <div className="card-left">
          {level && (
            <div
              className={`level ${level.toLowerCase()}`}
            >
              {level}
            </div>
          )}

          <div className="category">
            {getCategoryName(item?.category)}
          </div>

          <div className="location">
            Красноярский край · регион 24
          </div>

          {reserved && (
            <div className="reserved-label">
              ЗАБРОНИРОВАНО
            </div>
          )}
        </div>

        <div className="price">
          {formatPrice(item?.price)}
        </div>
      </div>

      <button
        type="button"
        className="details-button"
        onClick={() => {
          const message =
            `Здравствуйте! Интересует номер ${number} ` +
            `за ${formatPrice(item?.price)}.`;

          window.open(
            `https://t.me/Dremov767?text=${encodeURIComponent(
              message
            )}`,
            "_blank",
            "noopener,noreferrer"
          );
        }}
      >
        Подробнее
      </button>
    </article>
  );
}

function App() {
  const [numbers, setNumbers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("all");

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(
        "grz124_favorites"
      );

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  async function loadNumbers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}?select=id,created_at,number,price,category,status&order=price.desc`,
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
        const text = await response.text();

        throw new Error(
          text || `HTTP ${response.status}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(
          "Supabase вернул некорректные данные"
        );
      }

      setNumbers(data);
    } catch (err) {
      console.error(
        "Ошибка загрузки номеров:",
        err
      );

      setError(
        "Не удалось загрузить номера из базы данных."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNumbers();

    const interval = setInterval(() => {
      loadNumbers();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "grz124_favorites",
        JSON.stringify(favorites)
      );
    } catch {
      // Ничего не делаем, если localStorage недоступен.
    }
  }, [favorites]);

  function toggleFavorite(number) {
    setFavorites((previous) => {
      if (previous.includes(number)) {
        return previous.filter(
          (item) => item !== number
        );
      }

      return [...previous, number];
    });
  }

  const filteredNumbers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return numbers.filter((item) => {
      const number = String(
        item?.number || ""
      ).toLowerCase();

      const category = String(
        item?.category || ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        number.includes(query) ||
        category.includes(query);

      const level = getLevel(item);

      let matchesFilter = true;

      if (filter === "premium") {
        matchesFilter = level === "Premium";
      }

      if (filter === "vip") {
        matchesFilter = level === "VIP";
      }

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [numbers, search, filter]);

  return (
    <div className="app">
      <header className="header">
        <div>
          <div className="region-title">
            КРАСНОЯРСКИЙ КРАЙ
          </div>

          <h1>
            Красивые номера{" "}
            <span>24</span>
          </h1>
        </div>

        <button
          type="button"
          className="header-button"
          onClick={loadNumbers}
          title="Обновить"
          aria-label="Обновить номера"
        >
          ⟳
        </button>
      </header>

      <main className="catalog">
        <div className="catalog-title-row">
          <h2>Каталог номеров</h2>

          <button
            type="button"
            className="catalog-icon"
            aria-label="Каталог"
          >
            ▦
          </button>
        </div>

        <div className="search-box">
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

          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearch("")}
              aria-label="Очистить поиск"
            >
              ×
            </button>
          )}
        </div>

        <div className="filters">
          <button
            type="button"
            className={
              filter === "all"
                ? "selected"
                : ""
            }
            onClick={() =>
              setFilter("all")
            }
          >
            Все
          </button>

          <button
            type="button"
            className={
              filter === "premium"
                ? "selected"
                : ""
            }
            onClick={() =>
              setFilter("premium")
            }
          >
            Premium
          </button>

          <button
            type="button"
            className={
              filter === "vip"
                ? "selected"
                : ""
            }
            onClick={() =>
              setFilter("vip")
            }
          >
            VIP
          </button>
        </div>

        {loading && (
          <div className="state">
            Загружаем актуальные номера...
          </div>
        )}

        {error && !loading && (
          <div className="state error">
            <div>{error}</div>

            <button
              type="button"
              onClick={loadNumbers}
            >
              Повторить
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          filteredNumbers.length === 0 && (
            <div className="state">
              Номеров по вашему запросу
              не найдено.
            </div>
          )}

        {!loading && !error && (
          <div className="numbers-list">
            {filteredNumbers.map((item) => (
              <NumberCard
                key={item.id}
                item={item}
                favorite={favorites.includes(
                  item.number
                )}
                onFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setFilter("all");
          }}
        >
          <span>⌂</span>
          <small>Главная</small>
        </button>

        <button
          type="button"
          className="active"
          onClick={() => {
            setSearch("");
            setFilter("all");
          }}
        >
          <span>▦</span>
          <small>Каталог</small>
        </button>

        <button
          type="button"
          onClick={() => {
            setSearch("");

            setFilter("all");
          }}
        >
          <span>♡</span>
          <small>Избранное</small>
        </button>

        <button type="button">
          <span>□</span>
          <small>Заявки</small>
        </button>

        <button type="button">
          <span>♙</span>
          <small>Профиль</small>
        </button>
      </nav>
    </div>
  );
}

const rootElement =
  document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Не найден элемент #root"
  );
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
