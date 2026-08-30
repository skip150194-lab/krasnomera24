import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./admin-panel.css";

const SUPABASE_URL = "https://tjxumwgktffnfgpdka.supabase.co";
const SUPABASE_KEY = "sb_publishable_29-OjXwd3B9rGcPg06If4Q_1R8-DjQh";
const API_URL = `${SUPABASE_URL}/rest/v1/numbers`;

const ADMIN_PASSWORD = "124124";
const LOCAL_NUMBERS_KEY = "grz124-admin-numbers-v2";
const FAVORITES_KEY = "beautiful-numbers-favorites";

const CATEGORIES = [
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
  // Первая сотня — 11
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

  // Одинаковые цифры — 6
  ["Н111ХЕ124", 300000, "Одинаковые цифры"],
  ["У666ТА124", 250000, "Одинаковые цифры"],
  ["Е666РЕ124", 350000, "Одинаковые цифры"],
  ["Р888УХ24", 430000, "Одинаковые цифры"],
  ["В888МК24", 500000, "Одинаковые цифры"],
  ["У999ТТ24", 550000, "Одинаковые цифры"],

  // Комплекты — 2
  ["А731АА24+А731АА124", 375000, "Комплекты"],
  ["С333ОК24+С333ОК124", 1300000, "Комплекты"],

  // Сотни — 1
  ["Х200НУ24", 120000, "Сотни"],

  // Буквы — 9
  ["Р014РР24", 250000, "Буквы"],
  ["У116УУ24", 140000, "Буквы"],
  ["В391ВВ124", 125000, "Буквы"],
  ["Е426ЕЕ124", 105000, "Буквы"],
  ["О482ОО24", 380000, "Буквы"],
  ["А742АА124", 140000, "Буквы"],
  ["Р803РР24", 100000, "Буквы"],
  ["А820АА24", 175000, "Буквы"],
  ["В922ВВ124", 100000, "Буквы"],

  // 124/124;224/224 — 1
  ["Х124УВ124", 155000, "124/124;224/224"],

  // Зеркала — 26
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

  // Прочее — 11
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

  // Прицеп — 12
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

  // Мото — 3
  ["АК 0200 24", 160000, "Мото"],
  ["ВА 4666 24", 60000, "Мото"],
  ["АМ 3993 24", 60000, "Мото"],
].map(([number, price, category], index) => ({
  id: `catalog-${index + 1}`,
  number,
  price,
  category,
  region: "Красноярский край",
  regionCode: "24",
  status: "available",
  description: "Цена указана с оформлением.",
}));

function normalizeNumber(item) {
  return {
    id: String(item.id ?? crypto.randomUUID()),
    number: String(item.number ?? ""),
    price: Number(item.price ?? 0),
    category: String(item.category ?? "Прочее"),
    region: String(item.region ?? "Красноярский край"),
    regionCode: String(item.regionCode ?? item.region_code ?? "24"),
    status: String(item.status ?? "available"),
    description: item.description ?? "Цена указана с оформлением.",
  };
}

function removeDuplicates(list) {
  const map = new Map();

  for (const item of list) {
    const normalized = normalizeNumber(item);
    const key = normalized.number.replace(/\s/g, "").toUpperCase();
    if (!key) continue;
    map.set(key, normalized);
  }

  return Array.from(map.values()).sort((a, b) => Number(b.price) - Number(a.price));
}

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("ru-RU")} ₽`;
}

function isReserved(item) {
  return item.status === "reserved";
}

function Plate({ number }) {
  const text = String(number || "");
  const parts = text.split("+");

  return (
    <div className="plate-wrap">
      {parts.map((part, index) => {
        const trailerOrMoto = /\s\d{4}\s(?:24|124|224)$/.test(part);
        const match = part.match(/(24|124|224)$/);
        const regionCode = match ? match[1] : "";

        if (trailerOrMoto) {
          const clean = part.trim();
          const codeMatch = clean.match(/^(.*?)\s(\d{4})\s(24|124|224)$/);

          return (
            <div className="plate plate-special" key={`${part}-${index}`}>
              <div className="plate-number">
                {codeMatch ? (
                  <>
                    <span>{codeMatch[1]}</span>
                    <strong>{codeMatch[2]}</strong>
                  </>
                ) : (
                  part
                )}
              </div>
              {regionCode && (
                <div className="plate-region">
                  <strong>{regionCode}</strong>
                  <span>RUS</span>
                </div>
              )}
            </div>
          );
        }

        const main = regionCode ? part.slice(0, -regionCode.length) : part;

        return (
          <div className="plate" key={`${part}-${index}`}>
            <div className="plate-number">{main}</div>
            {regionCode && (
              <div className="plate-region">
                <strong>{regionCode}</strong>
                <span>RUS</span>
              </div>
            )}
          </div>
        );
      })}
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
          aria-label="Избранное"
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="number-info">
        <div className="category">{item.category}</div>
        <div className="region">{item.region} · регион {item.regionCode}</div>
        <div className="price">{formatPrice(item.price)}</div>

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

function AdminPanel({ numbers, onChangeNumbers, onClose }) {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    number: "",
    price: "",
    category: "Одинаковые цифры",
    status: "available",
    description: "Цена указана с оформлением.",
  });
  const [message, setMessage] = useState("");

  function login(event) {
    event.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setAuthorized(true);
      setPassword("");
      setPasswordError("");
      return;
    }

    setPasswordError("Неверный пароль");
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      number: "",
      price: "",
      category: "Одинаковые цифры",
      status: "available",
      description: "Цена указана с оформлением.",
    });
  }

  function saveNumbers(next) {
    const clean = removeDuplicates(next);
    onChangeNumbers(clean);

    try {
      localStorage.setItem(LOCAL_NUMBERS_KEY, JSON.stringify(clean));
    } catch {}
  }

  async function saveToSupabase(item, isNew) {
    try {
      const payload = {
        id: item.id,
        number: item.number,
        price: item.price,
        category: item.category,
        region: item.region,
        regionCode: item.regionCode,
        status: item.status,
        description: item.description,
      };

      await fetch(isNew ? API_URL : `${API_URL}?id=eq.${encodeURIComponent(item.id)}`, {
        method: isNew ? "POST" : "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(isNew ? payload : { ...payload, id: undefined }),
      });
    } catch (error) {
      console.error("Supabase admin error:", error);
    }
  }

  async function submitForm(event) {
    event.preventDefault();

    const cleanNumber = form.number.trim();
    const price = Number(String(form.price).replace(/\s/g, "").replace(/₽/g, ""));

    if (!cleanNumber) {
      setMessage("Введите номер");
      return;
    }

    if (!price || price < 0) {
      setMessage("Введите корректную цену");
      return;
    }

    if (editingId) {
      const oldItem = numbers.find((item) => item.id === editingId);

      const updated = {
        ...(oldItem || {}),
        id: editingId,
        number: cleanNumber,
        price,
        category: form.category,
        region: "Красноярский край",
        regionCode: "24",
        status: form.status,
        description: form.description.trim(),
      };

      saveNumbers(numbers.map((item) => (item.id === editingId ? updated : item)));
      await saveToSupabase(updated, false);
      setMessage("Номер изменён");
      resetForm();
      return;
    }

    const newItem = {
      id: `admin-${Date.now()}`,
      number: cleanNumber,
      price,
      category: form.category,
      region: "Красноярский край",
      regionCode: "24",
      status: form.status,
      description: form.description.trim(),
    };

    saveNumbers([...numbers, newItem]);
    await saveToSupabase(newItem, true);
    setMessage("Номер добавлен");
    resetForm();
  }

  function editNumber(item) {
    setEditingId(item.id);
    setForm({
      number: item.number,
      price: String(item.price),
      category: item.category,
      status: item.status,
      description: item.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteNumber(item) {
    if (!window.confirm(`Удалить номер ${item.number}?`)) return;

    saveNumbers(numbers.filter((number) => number.id !== item.id));

    try {
      await fetch(`${API_URL}?id=eq.${encodeURIComponent(item.id)}`, {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });
    } catch (error) {
      console.error(error);
    }

    setMessage("Номер удалён");
  }

  function toggleReserved(item) {
    const updated = {
      ...item,
      status: item.status === "reserved" ? "available" : "reserved",
    };

    saveNumbers(numbers.map((number) => (number.id === item.id ? updated : number)));
    saveToSupabase(updated, false);

    setMessage(updated.status === "reserved" ? "Номер отмечен как занятый" : "Номер снова доступен");
  }

  if (!authorized) {
    return (
      <section className="page-section admin-page">
        <div className="admin-header">
          <div>
            <h2>Админ-панель</h2>
            <div className="region">GRZ124 · управление номерами</div>
          </div>
          <button type="button" className="details-button" onClick={onClose}>Назад</button>
        </div>

        <form className="admin-form" onSubmit={login}>
          <h3>Вход администратора</h3>
          <input
            className="admin-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Пароль"
            autoFocus
          />
          {passwordError && <div className="admin-error">{passwordError}</div>}
          <button type="submit" className="details-button">Войти</button>
        </form>
      </section>
    );
  }

  return (
    <section className="page-section admin-page">
      <div className="admin-header">
        <div>
          <h2>Админ-панель</h2>
          <div className="region">Номеров: {numbers.length}</div>
        </div>
        <button type="button" className="details-button" onClick={onClose}>Закрыть</button>
      </div>

      <form className="admin-form" onSubmit={submitForm}>
        <h3>{editingId ? "Редактировать номер" : "Добавить номер"}</h3>

        <input
          className="admin-input"
          value={form.number}
          onChange={(event) => setForm({ ...form, number: event.target.value })}
          placeholder="Номер, например У999ТТ24"
        />

        <input
          className="admin-input"
          type="number"
          value={form.price}
          onChange={(event) => setForm({ ...form, price: event.target.value })}
          placeholder="Цена"
        />

        <select
          className="admin-input"
          value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
        >
          {CATEGORIES.filter((item) => item !== "Все").map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>

        <select
          className="admin-input"
          value={form.status}
          onChange={(event) => setForm({ ...form, status: event.target.value })}
        >
          <option value="available">Доступен</option>
          <option value="reserved">Занят</option>
        </select>

        <input
          className="admin-input"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          placeholder="Описание"
        />

        {message && <div className="admin-message">{message}</div>}

        <div className="admin-actions">
          <button type="submit">
            {editingId ? "Сохранить изменения" : "Добавить номер"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm}>Отмена</button>
          )}
        </div>
      </form>

      <div className="admin-list">
        <div className="admin-list-title">Все номера</div>

        {numbers.map((item) => (
          <div className="admin-number-row" key={item.id}>
            <div className="admin-number-main">
              <strong>{item.number}</strong>
              <span>{formatPrice(item.price)}</span>
              <small>
                {item.category} · {item.status === "reserved" ? "Занят" : "Доступен"}
              </small>
            </div>

            <div className="admin-actions">
              <button type="button" onClick={() => editNumber(item)}>Изменить</button>
              <button type="button" onClick={() => toggleReserved(item)}>
                {item.status === "reserved" ? "Освободить" : "Занять"}
              </button>
              <button type="button" className="danger" onClick={() => deleteNumber(item)}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function App() {
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Все");
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [activeTab, setActiveTab] = useState("catalog");
  const [adminOpen, setAdminOpen] = useState(false);

  function getLocalNumbers() {
    try {
      const saved = localStorage.getItem(LOCAL_NUMBERS_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.map(normalizeNumber) : [];
    } catch {
      return [];
    }
  }

  function loadNumbers() {
    setLoading(true);

    const localNumbers = getLocalNumbers();

    // Новая версия каталога является источником истины.
    // Это исключает старые номера из предыдущих версий localStorage/Supabase.
    setNumbers(removeDuplicates(localNumbers.length ? localNumbers : FALLBACK_NUMBERS));
    setLoading(false);
  }

  useEffect(() => {
    loadNumbers();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const category of CATEGORIES) {
      counts[category] =
        category === "Все"
          ? numbers.length
          : numbers.filter((item) => item.category === category).length;
    }
    return counts;
  }, [numbers]);

  const filteredNumbers = useMemo(() => {
    let result = [...numbers];

    if (filter !== "Все") {
      result = result.filter((item) => item.category === filter);
    }

    const query = search.trim().toLowerCase();

    if (query) {
      const normalizedQuery = query.replace(/\s/g, "");

      result = result.filter((item) => {
        const number = String(item.number || "").toLowerCase();
        const numberCompact = number.replace(/\s/g, "");
        const category = String(item.category || "").toLowerCase();
        const region = String(item.region || "").toLowerCase();

        return (
          number.includes(query) ||
          numberCompact.includes(normalizedQuery) ||
          category.includes(query) ||
          region.includes(query)
        );
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
      <section className="home-section">
        <div className="hero-card">
          <div className="hero-region">КРАСНОЯРСКИЙ КРАЙ</div>
          <h1>Красивые номера 24</h1>
          <p>Номер, который запомнят.</p>
          <button type="button" onClick={() => setActiveTab("catalog")}>
            Смотреть каталог
          </button>
        </div>

        <div className="home-stats">
          <div><strong>{numbers.length}</strong><span>номеров</span></div>
          <div><strong>{favoriteNumbers.length}</strong><span>избранных</span></div>
        </div>
      </section>
    );
  }

  function renderCatalog() {
    return (
      <>
        <section className="catalog-header">
          <div className="catalog-title-row">
            <h2>Каталог номеров</h2>
            <div className="catalog-icon">▦</div>
          </div>

          <div className="search-row">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск номера или категории..."
            />
          </div>

          <div className="filters">
            {CATEGORIES.map((name) => (
              <button
                key={name}
                type="button"
                className={filter === name ? "selected" : ""}
                onClick={() => setFilter(name)}
              >
                {name} — {categoryCounts[name] ?? 0}
              </button>
            ))}
          </div>
        </section>

        <section className="numbers-list">
          {loading ? (
            <div className="empty-state">Загрузка номеров...</div>
          ) : filteredNumbers.length === 0 ? (
            <div className="empty-state">
              {search ? "Номеров по вашему запросу не найдено." : "Номера пока не добавлены."}
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

          <button
            type="button"
            className="details-button"
            style={{ marginTop: 16 }}
            onClick={() => setAdminOpen(true)}
          >
            ⚙ Админ-панель
          </button>
        </div>
      </section>
    );
  }

  if (adminOpen) {
    return (
      <div className="app">
        <main className="content">
          <div className="top-region">КРАСНОЯРСКИЙ КРАЙ</div>

          <AdminPanel
            numbers={numbers}
            onChangeNumbers={setNumbers}
            onClose={() => setAdminOpen(false)}
          />
        </main>
      </div>
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
            aria-label="Обновить"
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

      <nav className="bottom-nav">
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
            >
              ×
            </button>

            <Plate number={selectedNumber.number} />

            <h3>{selectedNumber.category}</h3>

            <div className="modal-region">
              {selectedNumber.region} · регион {selectedNumber.regionCode}
            </div>

            <div className="modal-price">{formatPrice(selectedNumber.price)}</div>

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
              className="details-button"
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
