import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const SUPABASE_URL = "https://tjxumwgktffnfgpdka.supabase.co";
const SUPABASE_KEY = "sb_publishable_29-OjXwd3B9rGcPg06If4Q_1R8-DjQh";
const API_URL = `${SUPABASE_URL}/rest/v1/numbers`;

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

const FALLBACK_NUMBERS = [
  ["У001ЕТ24", 550000, "Первая сотня"],
  ["О003МС124", 210000, "Первая сотня"],
  ["У011ВН124", 90000, "Первая сотня"],
  ["Т020РА24", 75000, "Первая сотня"],
  ["Н024ОС24", 165000, "Первая сотня"],
  ["В024СМ24", 185000, "Первая сотня"],
  ["Е032КО24", 55000, "Первая сотня"],
  ["М035ТВ124", 40000, "Первая сотня"],
  ["К066НХ24", 85000, "Первая сотня"],
  ["М093ТВ124", 40000, "Первая сотня"],
  ["М094ТВ124", 40000, "Первая сотня"],

  ["Н111ХЕ124", 300000, "Одинаковые цифры"],
  ["У666ТА124", 250000, "Одинаковые цифры"],
  ["Е666РЕ124", 350000, "Одинаковые цифры"],
  ["Р888УХ24", 430000, "Одинаковые цифры"],
  ["В888МК24", 500000, "Одинаковые цифры"],
  ["У999ТТ24", 550000, "Одинаковые цифры"],

  ["А731АА24+А731АА124", 375000, "Комплекты"],
  ["С333ОК24+С333ОК124", 1300000, "Комплекты"],

  ["Х200НУ24", 120000, "Сотни"],

  ["Р014РР24", 250000, "Буквы"],
  ["У116УУ24", 140000, "Буквы"],
  ["В391ВВ124", 125000, "Буквы"],
  ["Е426ЕЕ124", 105000, "Буквы"],
  ["О482ОО24", 380000, "Буквы"],
  ["А742АА124", 140000, "Буквы"],
  ["Р803РР24", 100000, "Буквы"],
  ["А820АА24", 175000, "Буквы"],
  ["В922ВВ124", 100000, "Буквы"],

  ["Х124УВ124", 155000, "124/124;224/224"],

  ["У121ХА224", 39000, "Зеркала"],
  ["Н121УМ124", 39000, "Зеркала"],
  ["У121УС124", 39000, "Зеркала"],
  ["Т161ТС124", 39000, "Зеркала"],
  ["Х181УН124", 39000, "Зеркала"],
  ["В181НЕ124", 60000, "Зеркала"],
  ["Р191УУ124", 39000, "Зеркала"],
  ["Т212УХ124", 39000, "Зеркала"],
  ["Е292УМ124", 39000, "Зеркала"],
  ["У363УН124", 39000, "Зеркала"],
  ["О373ХА224", 39000, "Зеркала"],
  ["О373УН124", 39000, "Зеркала"],
  ["Е393УУ124", 39000, "Зеркала"],
  ["С484ХН124", 39000, "Зеркала"],
  ["В484ХН124", 39000, "Зеркала"],
  ["К545УР124", 39000, "Зеркала"],
  ["Т595УХ124", 39000, "Зеркала"],
  ["С646ХН124", 39000, "Зеркала"],
  ["В656УХ124", 39000, "Зеркала"],
  ["Н656УР124", 39000, "Зеркала"],
  ["К686УХ124", 39000, "Зеркала"],
  ["С787УХ124", 39000, "Зеркала"],
  ["В808ХН124", 100000, "Зеркала"],
  ["Т828УС124", 39000, "Зеркала"],
  ["У898НТ124", 39000, "Зеркала"],
  ["С949УУ124", 39000, "Зеркала"],

  ["Е110УТ124", 35000, "Прочее"],
  ["Х150АН224", 85000, "Прочее"],
  ["Т221УР124", 35000, "Прочее"],
  ["Х227АН224", 45000, "Прочее"],
  ["О321ХА224", 30000, "Прочее"],
  ["М359УР124", 30000, "Прочее"],
  ["М389УР124", 30000, "Прочее"],
  ["М398УР124", 30000, "Прочее"],
  ["В440УС124", 30000, "Прочее"],
  ["К567УР124", 35000, "Прочее"],
  ["О877ХА224", 25000, "Прочее"],

  ["НВ 7878 24", 50000, "Прицеп"],
  ["ОВ 0999 24", 175000, "Прицеп"],
  ["ОВ 0990 24", 120000, "Прицеп"],
  ["ОВ 0969 24", 75000, "Прицеп"],
  ["ОВ 0828 24", 55000, "Прицеп"],
  ["НК 6066 24", 55000, "Прицеп"],
  ["НК 7666 24", 75000, "Прицеп"],
  ["НК 7667 24", 50000, "Прицеп"],
  ["НЕ 7333 24", 75000, "Прицеп"],
  ["НК 2929 24", 45000, "Прицеп"],
  ["ОВ 2999 24", 75000, "Прицеп"],
  ["ОВ 4774 24", 75000, "Прицеп"],

  ["АК 0200 24", 160000, "Мото"],
  ["ВА 4666 24", 60000, "Мото"],
  ["АМ 3993 24", 60000, "Мото"],
].map(([number, price, category], index) => ({
  id: `local-${index + 1}`,
  number,
  price,
  category,
  region: "Красноярский край",
  regionCode: "24",
  status: "available",
  description: "",
}));

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("ru-RU")} ₽`;
}

function normalizeCategory(value) {
  const raw = String(value || "").trim();
  const aliases = {
    "зеркальные": "Зеркала",
    "зеркала": "Зеркала",
    "красивые буквы": "Буквы",
    "буквы": "Буквы",
  };
  return aliases[raw.toLowerCase()] || raw || "Прочее";
}

function normalizeNumber(item, index = 0) {
  return {
    id: String(item?.id ?? `remote-${index}-${item?.number ?? "number"}`),
    number: String(item?.number ?? item?.plate ?? item?.name ?? "").trim(),
    price: Number(item?.price ?? 0),
    category: normalizeCategory(item?.category ?? item?.type ?? item?.category_name),
    region: String(item?.region ?? item?.region_name ?? "Красноярский край"),
    regionCode: String(item?.regionCode ?? item?.region_code ?? item?.code ?? "24"),
    status: String(item?.status ?? "available"),
    description: String(item?.description ?? ""),
  };
}

function normalizeSearch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/\s+/g, "");
}

function removeDuplicates(items) {
  const map = new Map();

  for (const raw of items) {
    const item = normalizeNumber(raw);
    const key = normalizeSearch(item.number);
    if (key && !map.has(key)) {
      map.set(key, item);
    }
  }

  return Array.from(map.values());
}

function isReserved(item) {
  return item?.status === "reserved" || item?.status === "Продан" || item?.reserved === true;
}

/*
 * Разбираем строку номера на основную часть и регион.
 * Пример: У001ЕТ124 -> У001ЕТ / 124.
 * Для прицепов и мотоцикла сохраняем исходную компоновку.
 */
function parsePlate(number) {
  const text = String(number || "").trim();

  if (text.includes("+")) {
    return {
      type: "set",
      parts: text.split("+").map((part) => parsePlate(part.trim())),
    };
  }

  const trailer = /^(НВ|ОВ|НК|НЕ)\s+\d{4}\s+(24|124|224)$/.test(text);
  const moto = /^(АК|ВА|АМ)\s+\d{4}\s+(24|124|224)$/.test(text);

  if (trailer) {
    const match = text.match(/^(.+?)\s+(24|124|224)$/);
    return {
      type: "trailer",
      main: match?.[1] || text,
      region: match?.[2] || "24",
    };
  }

  if (moto) {
    const match = text.match(/^([А-Я]{2})\s+(\d{4})\s+(24|124|224)$/);
    return {
      type: "moto",
      letters: match?.[1] || "",
      digits: match?.[2] || "",
      region: match?.[3] || "24",
    };
  }

  const standard = text.match(/^([А-Я])(\d{3})([А-Я]{2})(24|124|224)$/);
  if (standard) {
    return {
      type: "standard",
      main: `${standard[1]}${standard[2]}${standard[3]}`,
      region: standard[4],
    };
  }

  return {
    type: "fallback",
    main: text,
    region: "",
  };
}

function Plate({ number }) {
  const parsed = parsePlate(number);

  if (parsed.type === "set") {
    return (
      <div className="plate-set">
        {parsed.parts.map((part, index) => (
          <PlateView key={`${number}-${index}`} plate={part} />
        ))}
      </div>
    );
  }

  return <PlateView plate={parsed} />;
}

function PlateView({ plate }) {
  if (plate.type === "moto") {
    return (
      <div className="plate plate-moto">
        <div className="moto-main">
          <div className="moto-letters">{plate.letters}</div>
          <div className="moto-digits">{plate.digits}</div>
        </div>
        <div className="plate-region">
          <strong>{plate.region}</strong>
          <span>RUS</span>
        </div>
      </div>
    );
  }

  if (plate.type === "trailer") {
    return (
      <div className="plate plate-trailer">
        <div className="trailer-main">{plate.main}</div>
        <div className="plate-region">
          <strong>{plate.region}</strong>
          <span>RUS</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`plate ${plate.type === "fallback" ? "plate-fallback" : ""}`}>
      <div className="plate-main">
        <span className="plate-text">{plate.main}</span>
      </div>
      {plate.region && (
        <div className="plate-region">
          <strong>{plate.region}</strong>
          <span>RUS</span>
        </div>
      )}
    </div>
  );
}

function NumberCard({ item, favorite, onFavorite, onDetails }) {
  const reserved = isReserved(item);

  return (
    <article className="number-card">
      <div className="number-card-top">
        <Plate number={item.number} />

        <button
          type="button"
          className={`favorite-button ${favorite ? "active" : ""}`}
          onClick={() => onFavorite(item.id)}
          aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"}
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="number-info">
        <div className="category">{item.category}</div>
        <div className="region">{item.region} · регион {item.regionCode}</div>
        <div className="price">{formatPrice(item.price)}</div>
        <div className="price-note">с оформлением</div>

        {item.description && <div className="description">{item.description}</div>}

        {reserved ? (
          <button type="button" className="details-button disabled" disabled>
            Занято
          </button>
        ) : (
          <button type="button" className="details-button" onClick={() => onDetails(item)}>
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
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [activeTab, setActiveTab] = useState("catalog");

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("beautiful-numbers-favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  async function loadNumbers() {
    setLoading(true);

    const localNumbers = FALLBACK_NUMBERS.map(normalizeNumber);

    try {
      const response = await fetch(`${API_URL}?select=*&order=price.desc`, {
        method: "GET",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`);
      }

      const data = await response.json();
      const remoteNumbers = Array.isArray(data)
        ? data.map((item, index) => normalizeNumber(item, index))
        : [];

      setNumbers(removeDuplicates([...localNumbers, ...remoteNumbers]));
    } catch (error) {
      console.error("Ошибка загрузки номеров:", error);
      setNumbers(removeDuplicates(localNumbers));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNumbers();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("beautiful-numbers-favorites", JSON.stringify(favorites));
    } catch {
      // localStorage недоступен
    }
  }, [favorites]);

  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  const counts = useMemo(() => {
    const result = Object.fromEntries(CATEGORY_ORDER.map((category) => [category, 0]));
    result["Все"] = numbers.length;

    for (const item of numbers) {
      if (result[item.category] !== undefined) {
        result[item.category] += 1;
      }
    }

    return result;
  }, [numbers]);

  const filteredNumbers = useMemo(() => {
    let result = [...numbers];

    if (filter !== "Все") {
      result = result.filter((item) => item.category === filter);
    }

    const query = normalizeSearch(search);

    if (query) {
      result = result.filter((item) => {
        const number = normalizeSearch(item.number);
        const category = normalizeSearch(item.category);
        const region = normalizeSearch(item.region);
        return number.includes(query) || category.includes(query) || region.includes(query);
      });
    }

    return result;
  }, [numbers, filter, search]);

  const favoriteNumbers = useMemo(
    () => numbers.filter((item) => favorites.includes(item.id)),
    [numbers, favorites]
  );

  function renderHome() {
    return (
      <section className="page-section">
        <div className="hero-card">
          <div className="hero-region">КРАСНОЯРСКИЙ КРАЙ</div>
          <h2>Красивые номера 24</h2>
          <p>Каталог красивых государственных регистрационных знаков.</p>
          <button type="button" onClick={() => setActiveTab("catalog")}>
            Смотреть каталог
          </button>
        </div>

        <div className="home-stats">
          <div>
            <strong>{numbers.length}</strong>
            <span>номеров в каталоге</span>
          </div>
          <div>
            <strong>{favoriteNumbers.length}</strong>
            <span>в избранном</span>
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

          <div className="catalog-note">Все цены указаны с оформлением · от 28.08.26</div>

          <label className="search-row">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск номера или категории"
              autoComplete="off"
            />
          </label>

          <div className="filters">
            {CATEGORY_ORDER.map((name) => (
              <button
                key={name}
                type="button"
                className={filter === name ? "selected" : ""}
                onClick={() => setFilter(name)}
              >
                <span>{name}</span>
                <b>{counts[name] ?? 0}</b>
              </button>
            ))}
          </div>
        </section>

        <section className="numbers-list">
          {loading ? (
            <div className="empty-state">Загрузка номеров...</div>
          ) : filteredNumbers.length === 0 ? (
            <div className="empty-state">
              {search ? "Номеров по вашему запросу не найдено." : "В этой категории пока нет номеров."}
            </div>
          ) : (
            filteredNumbers.map((item) => (
              <NumberCard
                key={item.id}
                item={item}
                favorite={favorites.includes(item.id)}
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
          <div className="empty-state">Здесь пока нет избранных номеров.</div>
        ) : (
          <div className="numbers-list">
            {favoriteNumbers.map((item) => (
              <NumberCard
                key={item.id}
                item={item}
                favorite
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
          Для оформления номера нажмите «Подробнее» в каталоге.
        </div>
      </section>
    );
  }

  function renderProfile() {
    return (
      <section className="page-section">
        <h2>Профиль</h2>
        <div className="profile-card">
          <div className="profile-title">Красивые номера 24</div>
          <div className="profile-text">Красноярский край · регион 24</div>
          <div className="profile-text">Все цены указаны с оформлением.</div>
        </div>
      </section>
    );
  }

  return (
    <div className="app">
      <main className="content">
        <div className="top-region">КРАСНОЯРСКИЙ КРАЙ</div>

        <header className="main-header">
          <h1>Красивые номера 24</h1>
          <button
            type="button"
            className="refresh-button"
            onClick={loadNumbers}
            aria-label="Обновить каталог"
            title="Обновить каталог"
          >
            ⟳
          </button>
        </header>

        {activeTab === "home" && renderHome()}
        {activeTab === "catalog" && renderCatalog()}
        {activeTab === "favorites" && renderFavorites()}
        {activeTab === "requests" && renderRequests()}
        {activeTab === "profile" && renderProfile()}
      </main>

      <nav className="bottom-nav" aria-label="Основная навигация">
        <button
          type="button"
          className={activeTab === "home" ? "active" : ""}
          onClick={() => setActiveTab("home")}
        >
          <span className="nav-icon">⌂</span>
          <span>Главная</span>
        </button>

        <button
          type="button"
          className={activeTab === "catalog" ? "active" : ""}
          onClick={() => setActiveTab("catalog")}
        >
          <span className="nav-icon">▦</span>
          <span>Каталог</span>
        </button>

        <button
          type="button"
          className={activeTab === "favorites" ? "active" : ""}
          onClick={() => setActiveTab("favorites")}
        >
          <span className="nav-icon">♡</span>
          <span>Избранное</span>
        </button>

        <button
          type="button"
          className={activeTab === "requests" ? "active" : ""}
          onClick={() => setActiveTab("requests")}
        >
          <span className="nav-icon">□</span>
          <span>Заявки</span>
        </button>

        <button
          type="button"
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          <span className="nav-icon">♙</span>
          <span>Профиль</span>
        </button>
      </nav>

      {selectedNumber && (
        <div className="modal-overlay" onClick={() => setSelectedNumber(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelectedNumber(null)}
              aria-label="Закрыть"
            >
              ×
            </button>

            <Plate number={selectedNumber.number} />

            <div className="modal-category">{selectedNumber.category}</div>
            <h3>{selectedNumber.number}</h3>
            <div className="modal-region">
              {selectedNumber.region} · регион {selectedNumber.regionCode}
            </div>
            <div className="modal-price">{formatPrice(selectedNumber.price)}</div>
            <div className="modal-note">Цена с оформлением</div>

            {selectedNumber.description && (
              <p className="modal-description">{selectedNumber.description}</p>
            )}

            <button
              type="button"
              className="details-button modal-action"
              onClick={() => toggleFavorite(selectedNumber.id)}
            >
              {favorites.includes(selectedNumber.id)
                ? "Убрать из избранного"
                : "Добавить в избранное"}
            </button>

            <button
              type="button"
              className="details-button secondary"
              onClick={() => setSelectedNumber(null)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
