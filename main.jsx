import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const SUPABASE_URL = "https://tjxuumgwkttfnfgpdkaj.supabase.co";
const SUPABASE_KEY = "sb_publishable_29-OjXwd3B9rGcPGo6IF4Q_1R8-DjQh";
const API_URL = `${SUPABASE_URL}/rest/v1/numbers`;

function formatPrice(price) {
  return `${Number(price || 0).toLocaleString("ru-RU")} ₽`;
}

function getLevel(item) {
  const price = Number(item.price || 0);

  if (price >= 400000) return "VIP";
  if (price >= 200000) return "Premium";

  return "";
}

function getCategoryName(category) {
  const names = {
    "Первая сотня": "Первая сотня",
    "Одинаковые цифры": "Одинаковые цифры",
    "Комплекты": "Комплекты",
    "Сотни": "Сотни",
    "Буквы": "Буквы",
    "124/124;224/224": "124 / 224",
    "Зеркала": "Зеркала",
    "Прочее": "Прочее",
    "Прицеп": "Прицеп",
    "Мото": "Мото",
  };

  return names[category] || category || "Прочее";
}

function isReserved(item) {
  return String(item.status || "").toLowerCase() === "reserved";
}

function Plate({ number }) {
  const value = String(number || "");

  const trailerOrMoto =
    value.includes(" ") && value.split(" ").length >= 3;

  if (trailerOrMoto) {
    return (
      <div className="plate">
        <div className="plate-main">{value}</div>
      </div>
    );
  }

  const regionMatch = value.match(/(24|124|224)$/);
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

  return (
    <article className={`number-card ${reserved ? "reserved" : ""}`}>
      <div className="card-top">
        <Plate number={item.number} />

        <button
          className={`favorite ${favorite ? "active" : ""}`}
          onClick={() => onFavorite(item.number)}
          aria-label="Избранное"
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="card-info">
        <div className="card-left">
          {level && (
            <div className={`level ${level.toLowerCase()}`}>
              {level}
            </div>
          )}

          <div className="category">
            {getCategoryName(item.category)}
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
          {formatPrice(item.price)}
        </div>
      </div>

      <button
        className="details-button"
        onClick={() => {
          const message = `Здравствуйте! Интересует номер ${item.number} за ${formatPrice(item.price)}.`;
          window.open(
            `https://t.me/Dremov767?text=${encodeURIComponent(message)}`,
            "_blank"
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
      return JSON.parse(localStorage.getItem("grz124_favorites")) || [];
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
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Supabase вернул некорректные данные");
      }

      setNumbers(data);
    } catch (err) {
      console.error(err);
      setError(
        "Не удалось загрузить номера из базы данных. Проверь RLS policy в Supabase."
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

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "grz124_favorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  function toggleFavorite(number) {
    setFavorites((prev) =>
      prev.includes(number)
        ? prev.filter((item) => item !== number)
        : [...prev, number]
    );
  }

  const filteredNumbers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return numbers.filter((item) => {
      const number = String(item.number || "").toLowerCase();
      const category = String(item.category || "").toLowerCase();

      const matchesSearch =
        !query ||
        number.includes(query) ||
        category.includes(query);

      const level = getLevel(item);

      const matchesFilter =
        filter === "all" ||
        (filter === "premium" && level === "Premium") ||
        (filter === "vip" && level === "VIP");

      return matchesSearch && matchesFilter;
    });
  }, [numbers, search, filter]);

  return (
    <div className="app">
      <header className="header">
        <div>
          <div className="region-title">КРАСНОЯРСКИЙ КРАЙ</div>

          <h1>
            Красивые номера <span>24</span>
          </h1>
        </div>

        <button
          className="header-button"
          onClick={loadNumbers}
          title="Обновить"
        >
          ⟳
        </button>
      </header>

      <main className="catalog">
        <div className="catalog-title-row">
          <h2>Каталог номеров</h2>

          <button className="catalog-icon">
            ▦
          </button>
        </div>

        <div className="search-box">
          <span className="search-icon">⌕</span>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск: 777, 001..."
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}
        </div>

        <div className="filters">
          <button
            className={filter === "all" ? "selected" : ""}
            onClick={() => setFilter("all")}
          >
            Все
          </button>

          <button
            className={filter === "premium" ? "selected" : ""}
            onClick={() => setFilter("premium")}
          >
            Premium
          </button>

          <button
            className={filter === "vip" ? "selected" : ""}
            onClick={() => setFilter("vip")}
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

            <button onClick={loadNumbers}>
              Повторить
            </button>
          </div>
        )}

        {!loading && !error && filteredNumbers.length === 0 && (
          <div className="state">
            Номеров по вашему запросу не найдено.
          </div>
        )}

        {!loading && !error && (
          <div className="numbers-list">
            {filteredNumbers.map((item) => (
              <NumberCard
                key={item.id}
                item={item}
                favorite={favorites.includes(item.number)}
                onFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <button>
          <span>⌂</span>
          <small>Главная</small>
        </button>

        <button className="active">
          <span>▦</span>
          <small>Каталог</small>
        </button>

        <button
          onClick={() => {
            setSearch("");
            setFilter("all");
          }}
        >
          <span>♡</span>
          <small>Избранное</small>
        </button>

        <button>
          <span>□</span>
          <small>Заявки</small>
        </button>

        <button>
          <span>♙</span>
          <small>Профиль</small>
        </button>
      </nav>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
