import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const SUPABASE_URL = "https://tjxumwgktffnfgpdka.supabase.co";
const SUPABASE_KEY =
  "sb_publishable_29-OjXwd3B9rGcPg06If4Q_1R8-DjQh";

const API_URL = `${SUPABASE_URL}/rest/v1/numbers`;

const FALLBACK_NUMBERS = [
  {
    id: "package-1",
    number: "С333ОК24 + С333ОК124",
    price: 1300000,
    category: "Комплекты",
    region: "Красноярский край",
    regionCode: "24",
  },
  {
    id: "999",
    number: "У999ТТ",
    price: 550000,
    category: "Одинаковые цифры",
    region: "Красноярский край",
    regionCode: "24",
  },
  {
    id: "001",
    number: "У001ЕТ",
    price: 550000,
    category: "Первая сотня",
    region: "Красноярский край",
    regionCode: "24",
  },
];

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

function normalizeCategory(category) {
  if (!category) {
    return "Другие";
  }

  const value = String(category).trim();

  const names = {
    "Первая сотня": "Первая сотня",
    "Одинаковые цифры": "Одинаковые цифры",
    "Комплекты": "Комплекты",
    "Красивые буквы": "Красивые буквы",
    "Зеркальные": "Зеркальные",
    "Одинаковые буквы": "Одинаковые буквы",
  };

  return names[value] || value;
}

function normalizeNumber(item, index) {
  return {
    id: item.id ?? `${item.number ?? "number"}-${index}`,
    number:
      item.number ??
      item.plate ??
      item.name ??
      item.номер ??
      "",
    price: Number(item.price ?? 0),
    category: normalizeCategory(
      item.category ?? item.type ?? item.category_name
    ),
    region:
      item.region ??
      item.region_name ??
      "Красноярский край",
    regionCode:
      item.region_code ??
      item.regionCode ??
      item.code ??
      "24",
    reserved: Boolean(item.reserved),
    description: item.description ?? "",
  };
}

function getUniqueNumbers(items) {
  const map = new Map();

  for (const item of items) {
    const normalized = item;

    const number = String(normalized.number || "")
      .trim()
      .toUpperCase();

    const category = String(normalized.category || "")
      .trim()
      .toLowerCase();

    const price = Number(normalized.price || 0);

    /*
     * Один и тот же номер/комплект с одинаковой ценой
     * считаем одной карточкой.
     *
     * Это как раз убирает повторение:
     * С333ОК24 + С333ОК124
     * С333ОК24 + С333ОК124
     * С333ОК24 + С333ОК124
     */
    const key = `${category}|${number}|${price}`;

    if (!map.has(key)) {
      map.set(key, normalized);
    }
  }

  return Array.from(map.values());
}

function isReserved(item) {
  return Boolean(
    item?.reserved === true ||
      item?.status === "reserved" ||
      item?.status === "Продан"
  );
}

function Plate({ number, regionCode }) {
  const text = String(number || "").trim();

  const parts = text.split("+").map((part) => part.trim());

  return (
    <div className="plate-wrapper">
      <div className="plate">
        <div className="plate-number">
          {parts.map((part, index) => (
            <React.Fragment key={`${part}-${index}`}>
              {index > 0 && (
                <span className="plate-plus"> + </span>
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
          aria-label="Добавить в избранное"
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

function EmptyState({ search, loading }) {
  if (loading) {
    return (
      <div className="empty-state">
        Загрузка номеров...
      </div>
    );
  }

  return (
    <div className="empty-state">
      {search
        ? "Номеров по вашему запросу не найдено."
        : "Номера пока не добавлены."}
    </div>
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

  const [selectedNumber, setSelectedNumber] =
    useState(null);

  const [activeTab, setActiveTab] = useState("catalog");

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

      const unique = getUniqueNumbers(normalized);

      /*
       * Если база вернула данные — используем базу.
       * Если таблица пустая — показываем тестовые данные.
       */
      setNumbers(
        unique.length > 0
          ? unique
          : getUniqueNumbers(FALLBACK_NUMBERS)
      );
    } catch (error) {
      console.error("Ошибка загрузки номеров:", error);

      setNumbers(getUniqueNumbers(FALLBACK_NUMBERS));
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
      // Ничего не делаем, если localStorage недоступен
    }
  }, [favorites]);

  function toggleFavorite(id) {
    setFavorites((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      return [...current, id];
    });
  }

  function handleDetails(item) {
    setSelectedNumber(item);
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
        const number = String(item.number || "").toLowerCase();
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

  function renderCatalog() {
    return (
      <>
        <section className="catalog-header">
          <h2>Каталог номеров</h2>

          <div className="catalog-icon">
            ▦
          </div>

          <div className="search-row">
            <span className="search-icon">⌕</span>

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
                filter === "Все" ? "selected" : ""
              }
              onClick={() => setFilter("Все")}
            >
              Все
            </button>

            <button
              type="button"
              className={
                filter === "Premium" ? "selected" : ""
              }
              onClick={() => setFilter("Premium")}
            >
              Premium
            </button>

            <button
              type="button"
              className={
                filter === "VIP" ? "selected" : ""
              }
              onClick={() => setFilter("VIP")}
            >
              VIP
            </button>
          </div>
        </section>

        <section className="numbers-list">
          {filteredNumbers.length === 0 ? (
            <EmptyState
              search={Boolean(search)}
              loading={loading}
            />
          ) : (
            filteredNumbers.map((item) => (
              <NumberCard
                key={item.id}
                item={item}
                favorite={favorites.includes(item.id)}
                onFavorite={toggleFavorite}
                onDetails={handleDetails}
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
                onDetails={handleDetails}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

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
            onClick={() => setActiveTab("catalog")}
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
            <strong>{favoriteNumbers.length}</strong>
            <span>в избранном</span>
          </div>
        </div>
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

        <header className="app-header">
          <h1>Красивые номера 24</h1>

          <button
            type="button"
            className="refresh-button"
            onClick={loadNumbers}
            title="Обновить"
          >
            ⟳
          </button>
        </header>

        {activeTab === "home" && renderHome()}

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
            activeTab === "home" ? "active" : ""
          }
          onClick={() => setActiveTab("home")}
        >
          <span className="nav-icon">⌂</span>
          <span>Главная</span>
        </button>

        <button
          type="button"
          className={
            activeTab === "catalog" ? "active" : ""
          }
          onClick={() => setActiveTab("catalog")}
        >
          <span className="nav-icon">▦</span>
          <span>Каталог</span>
        </button>

        <button
          type="button"
          className={
            activeTab === "favorites" ? "active" : ""
          }
          onClick={() =>
            setActiveTab("favorites")
          }
        >
          <span className="nav-icon">
            {favorites.length > 0 ? "♥" : "♡"}
          </span>
          <span>Избранное</span>
        </button>

        <button
          type="button"
          className={
            activeTab === "requests" ? "active" : ""
          }
          onClick={() => setActiveTab("requests")}
        >
          <span className="nav-icon">□</span>
          <span>Заявки</span>
        </button>

        <button
          type="button"
          className={
            activeTab === "profile" ? "active" : ""
          }
          onClick={() => setActiveTab("profile")}
        >
          <span className="nav-icon">♙</span>
          <span>Профиль</span>
        </button>
      </nav>

      {selectedNumber && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedNumber(null)}
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

            <div className="modal-title">
              {selectedNumber.category}
            </div>

            <Plate
              number={selectedNumber.number}
              regionCode={selectedNumber.regionCode}
            />

            <div className="modal-details">
              <div>
                <span>Категория</span>
                <strong>
                  {selectedNumber.category}
                </strong>
              </div>

              <div>
                <span>Регион</span>
                <strong>
                  {selectedNumber.region} ·{" "}
                  {selectedNumber.regionCode}
                </strong>
              </div>

              <div>
                <span>Стоимость</span>
                <strong>
                  {formatPrice(selectedNumber.price)}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="request-button"
              onClick={() => {
                alert(
                  "Заявка на номер принята. Свяжитесь с менеджером для оформления."
                );
              }}
            >
              Оставить заявку
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    'Не найден элемент <div id="root"></div> в index.html'
  );
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
