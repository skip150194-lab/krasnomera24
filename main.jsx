import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

/* =========================
   TELEGRAM
========================= */

const TG = window.Telegram?.WebApp;

/* =========================
   SUPABASE
========================= */

const SUPABASE_URL = "https://tjxuumgwkttfnfgpdkaj.supabase.co";

// ВСТАВЬ СЮДА СВОЙ PUBLISHABLE KEY
const SUPABASE_KEY = "sb_publishable_29-OjXwd3B9rGcPGo6IF4Q_1R8-DjQh";

/* =========================
   HELPERS
========================= */

const money = (value) => {
  return (
    new Intl.NumberFormat("ru-RU").format(Number(value) || 0) + " ₽"
  );
};

const normalize = (value) => {
  return String(value || "")
    .toLowerCase()
    .replaceAll(" ", "")
    .trim();
};

const categoryEmoji = (category) => {
  const value = String(category || "").toLowerCase();

  if (value.includes("одинаков")) return "🔥";
  if (value.includes("зеркал")) return "🪞";
  if (value.includes("букв")) return "🔤";
  if (value.includes("комплект")) return "💎";
  if (value.includes("прицеп")) return "🚚";
  if (value.includes("мото")) return "🏍";
  if (value.includes("сотн")) return "💯";
  if (value.includes("124")) return "✨";

  return "⭐";
};

/* =========================
   SUPABASE LOAD
========================= */

async function loadNumbers() {
  const url =
    `${SUPABASE_URL}/rest/v1/numbers` +
    `?select=id,number,price,category,status` +
    `&order=id.asc`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Supabase error ${response.status}`);
  }

  const data = await response.json();

  return data.map((item) => ({
    id: item.id,
    plate: item.number,
    price: Number(item.price) || 0,
    category: item.category || "Прочее",
    status: item.status || "available",
  }));
}

/* =========================
   PLATE
========================= */

function Plate({ item, large = false }) {
  return (
    <div className={`plate ${large ? "plate-large" : ""}`}>
      <span className="plate-main">
        {item.plate}
      </span>

      <span className="plate-region">
        24
        <small> RUS</small>
      </span>
    </div>
  );
}

/* =========================
   APP
========================= */

function App() {
  const [tab, setTab] = useState("home");

  const [query, setQuery] = useState("");

  const [category, setCategory] = useState("Все");

  const [selected, setSelected] = useState(null);

  const [numbers, setNumbers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("grz124_favorites") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [requests, setRequests] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("grz124_requests") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState("");

  /* =========================
     TELEGRAM INIT
  ========================= */

  useEffect(() => {
    if (!TG) return;

    TG.ready();
    TG.expand();

    try {
      TG.setHeaderColor("#09090b");
      TG.setBackgroundColor("#09090b");
    } catch {}

  }, []);

  /* =========================
     LOAD NUMBERS
  ========================= */

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await loadNumbers();

        if (mounted) {
          setNumbers(data);
        }

      } catch (err) {
        console.error(err);

        if (mounted) {
          setError(
            "Не удалось загрузить каталог. Проверьте настройки Supabase."
          );
        }

      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================
     LOCAL STORAGE
  ========================= */

  useEffect(() => {
    localStorage.setItem(
      "grz124_favorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(
      "grz124_requests",
      JSON.stringify(requests)
    );
  }, [requests]);

  /* =========================
     CATEGORIES
  ========================= */

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(
        numbers
          .map((item) => item.category)
          .filter(Boolean)
      )
    );

    return ["Все", ...unique];

  }, [numbers]);

  /* =========================
     FILTER
  ========================= */

  const filteredNumbers = useMemo(() => {

    const search = normalize(query);

    return numbers.filter((item) => {

      const plate = normalize(item.plate);

      const categoryValue = normalize(item.category);

      const searchMatch =
        !search ||
        plate.includes(search) ||
        categoryValue.includes(search);

      const categoryMatch =
        category === "Все" ||
        item.category === category;

      return searchMatch && categoryMatch;

    });

  }, [numbers, query, category]);

  /* =========================
     FAVORITES
  ========================= */

  const toggleFavorite = (id) => {

    setFavorites((prev) => {

      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];

    });

  };

  /* =========================
     REQUEST
  ========================= */

  const addRequest = (item) => {

    const alreadyExists = requests.some(
      (request) =>
        request.numberId === item.id &&
        request.status !== "Завершена"
    );

    if (!alreadyExists) {

      const newRequest = {
        id: Date.now(),
        numberId: item.id,
        number: item.plate,
        price: item.price,
        createdAt: new Date().toLocaleDateString(
          "ru-RU"
        ),
        status: "Новая",
      };

      setRequests((prev) => [
        newRequest,
        ...prev,
      ]);

    }

    setSelected(null);

    showToast("Заявка отправлена");

    if (TG) {
      try {
        TG.HapticFeedback.notificationOccurred(
          "success"
        );
      } catch {}
    }

  };

  /* =========================
     TOAST
  ========================= */

  const showToast = (message) => {

    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2200);

  };

  /* =========================
     SUPPORT
  ========================= */

  const openSupport = () => {

    showToast(
      "Свяжитесь с менеджером через Telegram"
    );

  };

  /* =========================
     HOME
  ========================= */

  const Home = () => {

    return (
      <main className="page">

        <section className="hero">

          <div className="hero-glow" />

          <div className="eyebrow">
            GRZ124 · КРАСНОЯРСКИЙ КРАЙ
          </div>

          <h2>
            Подбери свой
            <br />
            красивый номер
          </h2>

          <p>
            Актуальный каталог красивых
            государственных номеров
          </p>

          <button
            className="primary"
            onClick={() => setTab("catalog")}
          >
            Открыть каталог
            <span>⌕</span>
          </button>

        </section>

        <section className="section">

          <div className="section-title">

            <h3>
              Категории
            </h3>

            <button
              onClick={() => {
                setCategory("Все");
                setTab("catalog");
              }}
            >
              Все →
            </button>

          </div>

          <div className="chips">

            {categories
              .slice(0, 8)
              .map((item) => (

                <button
                  key={item}
                  onClick={() => {
                    setCategory(item);
                    setTab("catalog");
                  }}
                >
                  {item}
                </button>

              ))}

          </div>

        </section>

        <section className="category-grid">

          {categories
            .filter(
              (item) => item !== "Все"
            )
            .slice(0, 4)
            .map((item) => (

              <button
                className="category-card"
                key={item}
                onClick={() => {
                  setCategory(item);
                  setTab("catalog");
                }}
              >

                <span className="category-icon">
                  {categoryEmoji(item)}
                </span>

                <strong>
                  {item}
                </strong>

                <small>
                  Смотреть номера
                </small>

              </button>

            ))}

        </section>

        <div className="trust">

          <span>
            ⚡ Актуальная база
          </span>

          <span>
            🔒 Надёжно
          </span>

          <span>
            📍 Регион 24
          </span>

        </div>

      </main>
    );

  };

  /* =========================
     CATALOG
  ========================= */

  const Catalog = () => {

    return (
      <main className="page">

        <div className="page-title">

          <h2>
            Каталог номеров
          </h2>

          <button
            className="filter-btn"
            onClick={() => {
              setCategory("Все");
              setQuery("");
            }}
          >
            ☷
          </button>

        </div>

        <div className="search">

          <span>
            ⌕
          </span>

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Поиск номера..."
          />

          {query && (
            <button
              onClick={() => setQuery("")}
            >
              ×
            </button>
          )}

        </div>

        <div className="chips category-scroll">

          {categories.map((item) => (

            <button
              key={item}
              className={
                category === item
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCategory(item)
              }
            >
              {item}
            </button>

          ))}

        </div>

        {loading && (
          <div className="empty">
            Загружаем каталог GRZ124...
          </div>
        )}

        {error && (
          <div className="empty">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="muted">
            Найдено номеров:{" "}
            <strong>
              {filteredNumbers.length}
            </strong>
          </div>
        )}

        <div className="list">

          {!loading &&
            !error &&
            filteredNumbers.map((item) => (

              <article
                className="number-card"
                key={item.id}
              >

                <div className="card-top">

                  <Plate item={item} />

                  <button
                    className={
                      "heart " +
                      (
                        favorites.includes(item.id)
                          ? "liked"
                          : ""
                      )
                    }
                    onClick={() =>
                      toggleFavorite(item.id)
                    }
                  >
                    {favorites.includes(item.id)
                      ? "♥"
                      : "♡"}
                  </button>

                </div>

                <div className="meta">

                  <span className="badge">

                    {categoryEmoji(item.category)}{" "}
                    {item.category}

                  </span>

                  <strong>
                    {money(item.price)}
                  </strong>

                </div>

                <div className="muted">

                  {item.status === "reserved"
                    ? "🟡 Забронирован"
                    : "🟢 В наличии"}

                </div>

                <button
                  className="secondary"
                  onClick={() =>
                    setSelected(item)
                  }
                >
                  Подробнее
                </button>

              </article>

            ))}

          {!loading &&
            !error &&
            filteredNumbers.length === 0 && (

              <div className="empty">

                Ничего не найдено.

                <br />

                Попробуйте другой номер
                или категорию.

              </div>

            )}

        </div>

      </main>
    );

  };

  /* =========================
     FAVORITES
  ========================= */

  const Favorites = () => {

    const favoriteNumbers =
      numbers.filter((item) =>
        favorites.includes(item.id)
      );

    return (
      <main className="page">

        <div className="page-title">

          <h2>
            Избранное
          </h2>

        </div>

        <div className="list">

          {favoriteNumbers.map((item) => (

            <article
              className="number-card"
              key={item.id}
            >

              <div className="card-top">

                <Plate item={item} />

                <button
                  className="heart liked"
                  onClick={() =>
                    toggleFavorite(item.id)
                  }
                >
                  ♥
                </button>

              </div>

              <div className="meta">

                <span className="badge">
                  {item.category}
                </span>

                <strong>
                  {money(item.price)}
                </strong>

              </div>

              <button
                className="secondary"
                onClick={() =>
                  setSelected(item)
                }
              >
                Подробнее
              </button>

            </article>

          ))}

          {!favoriteNumbers.length && (

            <div className="empty">

              Пока нет избранных номеров.

              <br />

              Нажмите ♡ у понравившегося номера.

            </div>

          )}

        </div>

      </main>
    );

  };

  /* =========================
     REQUESTS
  ========================= */

  const Requests = () => {

    return (
      <main className="page">

        <div className="page-title">

          <h2>
            Мои заявки
          </h2>

        </div>

        <div className="list">

          {requests.map((request) => (

            <article
              className="request-card"
              key={request.id}
            >

              <div>

                <strong>
                  {request.number}
                </strong>

                <div className="muted">
                  {request.createdAt}
                </div>

              </div>

              <div>

                <span className="status">
                  {request.status}
                </span>

                <strong>
                  {money(request.price)}
                </strong>

              </div>

            </article>

          ))}

          {!requests.length && (

            <div className="empty">

              У вас пока нет заявок.

              <br />

              Выберите номер в каталоге.

            </div>

          )}

        </div>

      </main>
    );

  };

  /* =========================
     PROFILE
  ========================= */

  const Profile = () => {

    return (
      <main className="page">

        <div className="profile">

          <div className="avatar">
            24
          </div>

          <h2>
            GRZ124
          </h2>

          <p className="muted">
            Красивые государственные номера
          </p>

        </div>

        <div className="menu-card">

          <button
            onClick={() =>
              setTab("requests")
            }
          >
            📋 Мои заявки
            <span>›</span>
          </button>

          <button
            onClick={() =>
              setTab("favorites")
            }
          >
            ♥ Избранное
            <span>›</span>
          </button>

          <button
            onClick={openSupport}
          >
            💬 Поддержка
            <span>›</span>
          </button>

          <button
            onClick={() =>
              showToast(
                "GRZ124 · Красноярский край"
              )
            }
          >
            ℹ️ О магазине
            <span>›</span>
          </button>

        </div>

      </main>
    );

  };

  /* =========================
     CURRENT PAGE
  ========================= */

  let content;

  if (tab === "home") {
    content = <Home />;
  }

  if (tab === "catalog") {
    content = <Catalog />;
  }

  if (tab === "favorites") {
    content = <Favorites />;
  }

  if (tab === "requests") {
    content = <Requests />;
  }

  if (tab === "profile") {
    content = <Profile />;
  }

  /* =========================
     RETURN
  ========================= */

  return (
    <div className="app">

      <header className="topbar">

        <div>

          <div className="eyebrow">
            GRZ124 · КРАСНОЯРСКИЙ КРАЙ
          </div>

          <h1>
            Красивые номера{" "}
            <b>24</b>
          </h1>

        </div>

        <button
          className="icon-btn"
          onClick={openSupport}
        >
          ◉
        </button>

      </header>

      {content}

      <nav className="bottom-nav">

        {[
          ["home", "⌂", "Главная"],
          ["catalog", "▦", "Каталог"],
          ["favorites", "♡", "Избранное"],
          ["requests", "▣", "Заявки"],
          ["profile", "♙", "Профиль"],
        ].map(
          ([id, icon, label]) => (

            <button
              key={id}
              className={
                tab === id
                  ? "nav-active"
                  : ""
              }
              onClick={() =>
                setTab(id)
              }
            >

              <span>
                {icon}
              </span>

              <small>
                {label}
              </small>

            </button>

          )
        )}

      </nav>

      {/* =========================
          MODAL
      ========================= */}

      {selected && (

        <div
          className="modal-backdrop"
          onClick={() =>
            setSelected(null)
          }
        >

          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setSelected(null)
              }
            >
              ×
            </button>

            <Plate
              item={selected}
              large
            />

            <span className="badge">

              {categoryEmoji(
                selected.category
              )}{" "}

              {selected.category}

            </span>

            <div className="modal-price">

              {money(selected.price)}

            </div>

            <div className="detail-list">

              <div>

                <span>
                  Номер
                </span>

                <strong>
                  {selected.plate}
                </strong>

              </div>

              <div>

                <span>
                  Категория
                </span>

                <strong>
                  {selected.category}
                </strong>

              </div>

              <div>

                <span>
                  Регион
                </span>

                <strong>
                  Красноярский край · 24
                </strong>

              </div>

              <div>

                <span>
                  Статус
                </span>

                <strong
                  className={
                    selected.status ===
                    "available"
                      ? "available"
                      : ""
                  }
                >

                  {selected.status ===
                  "reserved"
                    ? "Бронь"
                    : "В наличии"}

                </strong>

              </div>

            </div>

            {selected.status ===
              "reserved" ? (

              <button
                className="primary full"
                disabled
              >
                Номер забронирован
              </button>

            ) : (

              <button
                className="primary full"
                onClick={() =>
                  addRequest(selected)
                }
              >
                Оставить заявку
              </button>

            )}

          </div>

        </div>

      )}

      {/* =========================
          TOAST
      ========================= */}

      {toast && (

        <div className="toast">
          {toast}
        </div>

      )}

    </div>
  );
}

/* =========================
   RENDER
========================= */

createRoot(
  document.getElementById("root")
).render(
  <App />
);
