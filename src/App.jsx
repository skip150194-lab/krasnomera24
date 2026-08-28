import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./admin-panel.css";

const SUPABASE_URL = "https://tjxumwgktffnfgpdka.supabase.co";
const SUPABASE_KEY = "sb_publishable_29-OjXwd3B9rGcPg06If4Q_1R8-DjQh";
const API_URL = SUPABASE_URL + "/rest/v1/numbers";

const ADMIN_PASSWORD = "124124";
const LOCAL_NUMBERS_KEY = "grz124-admin-numbers";
const FAVORITES_KEY = "beautiful-numbers-favorites";

const FALLBACK_NUMBERS = [
  { id: "number-1", number: "У001ЕТ24", price: 550000, category: "Первая сотня", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-2", number: "О003МС124", price: 210000, category: "Первая сотня", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-3", number: "В009РР124", price: 250000, category: "Первая сотня", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-4", number: "У011ВН124", price: 90000, category: "Первая сотня", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-5", number: "Т020РА24", price: 75000, category: "Первая сотня", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-6", number: "Н024ОС24", price: 165000, category: "Первая сотня", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-7", number: "В024СМ24", price: 185000, category: "Первая сотня", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-8", number: "Р027ОМ124", price: 70000, category: "Первая сотня", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-9", number: "Е032КО24", price: 55000, category: "Первая сотня", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-10", number: "М035ТВ124", price: 40000, category: "Первая сотня", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-11", number: "К066НХ24", price: 85000, category: "Первая сотня", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-12", number: "М093ТВ124", price: 40000, category: "Первая сотня", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-13", number: "М094ТВ124", price: 40000, category: "Первая сотня", region: "Красноярский край", regionCode: "24", status: "available" },

  { id: "number-14", number: "Н111ХЕ124", price: 300000, category: "Одинаковые цифры", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-15", number: "М333УМ24", price: 280000, category: "Одинаковые цифры", region: "Красноярский край", regionCode: "24", status: "reserved" },
  { id: "number-16", number: "С555МЕ124", price: 285000, category: "Одинаковые цифры", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-17", number: "У666ТА124", price: 250000, category: "Одинаковые цифры", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-18", number: "Е666РЕ124", price: 350000, category: "Одинаковые цифры", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-19", number: "Р888УХ24", price: 430000, category: "Одинаковые цифры", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-20", number: "В888МК24", price: 500000, category: "Одинаковые цифры", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-21", number: "У999ТТ24", price: 550000, category: "Одинаковые цифры", region: "Красноярский край", regionCode: "24", status: "available" },

  { id: "number-22", number: "А731АА24+А731АА124", price: 375000, category: "Комплекты", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-23", number: "С333ОК24+С333ОК124", price: 1300000, category: "Комплекты", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-24", number: "Х200НУ24", price: 120000, category: "Сотни", region: "Красноярский край", regionCode: "24", status: "available" },

  { id: "number-25", number: "Р014РР24", price: 250000, category: "Буквы", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-26", number: "У116УУ24", price: 140000, category: "Буквы", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-27", number: "В391ВВ124", price: 125000, category: "Буквы", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-28", number: "Е426ЕЕ124", price: 105000, category: "Буквы", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-29", number: "О482ОО24", price: 380000, category: "Буквы", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-30", number: "А742АА124", price: 140000, category: "Буквы", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-31", number: "Р803РР24", price: 100000, category: "Буквы", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-32", number: "А820АА24", price: 175000, category: "Буквы", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-33", number: "В922ВВ124", price: 100000, category: "Буквы", region: "Красноярский край", regionCode: "24", status: "available" },

  { id: "number-34", number: "Х124УВ124", price: 155000, category: "124/124;224/224", region: "Красноярский край", regionCode: "24", status: "available" },

  { id: "number-35", number: "Н121УМ124", price: 39000, category: "Зеркала", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-36", number: "У121УС124", price: 39000, category: "Зеркала", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-37", number: "Т161ТС124", price: 39000, category: "Зеркала", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-38", number: "Х181УН124", price: 39000, category: "Зеркала", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-39", number: "В181НЕ124", price: 60000, category: "Зеркала", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-40", number: "Р191УУ124", price: 39000, category: "Зеркала", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-41", number: "Т212УХ124", price: 39000, category: "Зеркала", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-42", number: "Е292УМ124", price: 39000, category: "Зеркала", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-43", number: "У363УН124", price: 39000, category: "Зеркала", region: "Красноярский край", regionCode: "24", status: "available" },
  { id: "number-44", number: "О373ХА224", price: 39000, category: "Зеркала", region: "Красноярский край", regionCode: "24", status: "available" },
];

function normalizeNumber(item) {
  return {
    id: String(
      item.id ??
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `number-${Date.now()}-${Math.random()}`)
    ),
    number: String(item.number ?? ""),
    price: Number(item.price ?? 0),
    category: String(item.category ?? "Красивые номера"),
    region: String(item.region ?? "Красноярский край"),
    regionCode: String(item.regionCode ?? item.region_code ?? "24"),
    status: String(item.status ?? "available"),
    description: item.description ?? "",
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

  return Array.from(map.values()).sort(
    (a, b) => Number(b.price) - Number(a.price)
  );
}

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("ru-RU")} ₽`;
}

function isReserved(item) {
  return item.status === "reserved";
}

function getLevel(item) {
  const price = Number(item.price || 0);

  if (item.category === "Комплекты" || price >= 500000) return "VIP";
  if (item.category === "Одинаковые цифры" || price >= 250000) return "Premium";
  return "";
}

function getInitials(number) {
  const clean = String(number || "").replace(/\+/g, " / ");
  return clean.slice(0, 3);
}

function getPlateRegion(part, fallbackRegionCode = "") {
  const clean = String(part || "").replace(/\s/g, "").toUpperCase();

  // ВАЖНО: регион берём из окончания конкретного госномера.
  // 124 и 224 проверяем раньше, чем 24.
  const threeDigitMatch = clean.match(/(124|224)$/);
  if (threeDigitMatch) return threeDigitMatch[1];

  const twoDigitMatch = clean.match(/(24)$/);
  if (twoDigitMatch) return twoDigitMatch[1];

  // Только если код действительно не указан в самом номере,
  // используем данные записи.
  return String(fallbackRegionCode || "");
}

function Plate({ number }) {
  const parts = String(number || "").split("+");

  return (
    <div className={`plate-wrap ${parts.length > 1 ? "plate-set" : ""}`}>
      {parts.map((part, index) => (
        <div className="plate" key={`${part}-${index}`}>
          <div className="plate-main">
            <div className="plate-number">{part}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function NumberCard({ item, favorite, onFavorite, onDetails }) {
  const level = getLevel(item);
  const reserved = isReserved(item);

  return (
    <article className={`number-card ${reserved ? "is-reserved" : ""}`}>
      <div className="card-glow" />

      <div className="number-card-top">
        <div className="card-index">
          <span>GRZ124</span>
          <strong>{reserved ? "ЗАНЯТ" : "В НАЛИЧИИ"}</strong>
        </div>

        <button
          type="button"
          className={`favorite-button ${favorite ? "active" : ""}`}
          onClick={() => onFavorite(item.id)}
          aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"}
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <Plate number={item.number} regionCode={item.regionCode} />

      <div className="number-info">
        <div className="card-tags">
          {level && <span className={`level level-${level.toLowerCase()}`}>{level}</span>}
          <span className="category-pill">{item.category}</span>
        </div>

        <div className="region">{item.region}</div>

        <div className="card-bottom">
          <div>
            <div className="price-label">Стоимость</div>
            <div className="price">{formatPrice(item.price)}</div>
          </div>

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

        {item.description && <div className="description">{item.description}</div>}
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
    description: "",
  });
  const [message, setMessage] = useState("");

  function login(event) {
    event.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthorized(true);
      setPassword("");
      setPasswordError("");
    } else {
      setPasswordError("Неверный пароль");
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      number: "",
      price: "",
      category: "Одинаковые цифры",
      status: "available",
      description: "",
    });
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

  function saveNumbers(next) {
    onChangeNumbers(next);
    try {
      localStorage.setItem(LOCAL_NUMBERS_KEY, JSON.stringify(next));
    } catch {}
  }

  async function saveToSupabase(item, isNew) {
    try {
      const headers = {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      };

      const body = {
        id: item.id,
        number: item.number,
        price: item.price,
        category: item.category,
        region: item.region,
        regionCode: item.regionCode,
        status: item.status,
        description: item.description,
      };

      if (isNew) {
        await fetch(API_URL, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
      } else {
        await fetch(`${API_URL}?id=eq.${encodeURIComponent(item.id)}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            number: item.number,
            price: item.price,
            category: item.category,
            region: item.region,
            regionCode: item.regionCode,
            status: item.status,
            description: item.description,
          }),
        });
      }
    } catch (error) {
      console.error("Supabase admin error:", error);
    }
  }

  async function submitForm(event) {
    event.preventDefault();

    const cleanNumber = form.number.trim();
    const price = Number(
      String(form.price).replace(/\s/g, "").replace(/₽/g, "")
    );

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

    saveNumbers(removeDuplicates([...numbers, newItem]));
    await saveToSupabase(newItem, true);
    setMessage("Номер добавлен");
    resetForm();
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

    setMessage(
      updated.status === "reserved"
        ? "Номер отмечен как занятый"
        : "Номер снова доступен"
    );
  }

  if (!authorized) {
    return (
      <section className="page-section admin-page">
        <div className="admin-header">
          <div>
            <h2>Админ-панель</h2>
            <div className="region">GRZ124 · управление номерами</div>
          </div>
          <button type="button" className="details-button" onClick={onClose}>
            Назад
          </button>
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
        <button type="button" className="details-button" onClick={onClose}>
          Закрыть
        </button>
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
          <option>Одинаковые цифры</option>
          <option>Первая сотня</option>
          <option>Комплекты</option>
          <option>Сотни</option>
          <option>Буквы</option>
          <option>Зеркала</option>
          <option>124/124;224/224</option>
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
          placeholder="Описание (необязательно)"
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
  const [activeTab, setActiveTab] = useState("home");
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

  async function loadNumbers() {
    setLoading(true);

    const localNumbers = getLocalNumbers();
    const baseNumbers = localNumbers.length ? localNumbers : FALLBACK_NUMBERS;

    try {
      const response = await fetch(API_URL + "?select=*&order=price.desc", {
        method: "GET",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Supabase error: ${response.status}`);

      const data = await response.json();
      const remoteNumbers = Array.isArray(data) ? data.map(normalizeNumber) : [];

      setNumbers(removeDuplicates([...baseNumbers, ...remoteNumbers]));
    } catch (error) {
      console.error("Ошибка загрузки номеров:", error);
      setNumbers(removeDuplicates(baseNumbers));
    } finally {
      setLoading(false);
    }
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

  const filteredNumbers = useMemo(() => {
    let result = [...numbers];

    if (filter === "VIP") {
      result = result.filter((item) => getLevel(item) === "VIP");
    }

    if (filter === "Premium") {
      result = result.filter((item) => getLevel(item) === "Premium");
    }

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((item) => {
        const number = String(item.number || "").toLowerCase();
        const category = String(item.category || "").toLowerCase();
        const region = String(item.region || "").toLowerCase();

        return (
          number.includes(query) ||
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
    const vipCount = numbers.filter((item) => getLevel(item) === "VIP").length;
    const premiumCount = numbers.filter((item) => getLevel(item) === "Premium").length;

    return (
      <section className="home-section">
        <div className="hero-card">
          <div className="hero-orb orb-one" />
          <div className="hero-orb orb-two" />

          <div className="hero-topline">
            <span className="brand-mark">GRZ124</span>
            <span className="hero-region">КРАСНОЯРСКИЙ КРАЙ · 24</span>
          </div>

          <div className="hero-content">
            <div className="hero-kicker">НОМЕР, КОТОРЫЙ ЗАПОМИНАЮТ</div>
            <h1>
              Красивые
              <span> номера 24</span>
            </h1>
            <p>
              Подберите номер для автомобиля с характером.
              Премиальные сочетания, редкие серии и комплекты.
            </p>

            <div className="hero-actions">
              <button type="button" className="hero-button" onClick={() => setActiveTab("catalog")}>
                Смотреть каталог <span>→</span>
              </button>
              <div className="hero-note">
                <span className="status-dot" />
                Актуальные номера
              </div>
            </div>
          </div>

          <div className="hero-plate">
            <div className="hero-plate-caption">SELECTED · 24 RUS</div>
            <Plate number="У999ТТ24" regionCode="24" />
          </div>
        </div>

        <div className="home-stats">
          <div className="stat-card">
            <span>Каталог</span>
            <strong>{numbers.length}</strong>
            <small>номеров</small>
          </div>
          <div className="stat-card">
            <span>Premium</span>
            <strong>{premiumCount}</strong>
            <small>выразительных</small>
          </div>
          <div className="stat-card">
            <span>VIP</span>
            <strong>{vipCount}</strong>
            <small>эксклюзивных</small>
          </div>
        </div>

        <div className="home-section-head">
          <div>
            <span className="eyebrow">ВЫБОР GRZ124</span>
            <h2>Подберите свой стиль</h2>
          </div>
          <button type="button" onClick={() => setActiveTab("catalog")}>
            Весь каталог →
          </button>
        </div>

        <div className="style-grid">
          <button type="button" className="style-card style-card-dark" onClick={() => { setFilter("VIP"); setActiveTab("catalog"); }}>
            <span className="style-number">01</span>
            <div>
              <strong>VIP</strong>
              <small>Максимально заметные сочетания</small>
            </div>
            <span className="style-arrow">↗</span>
          </button>

          <button type="button" className="style-card style-card-purple" onClick={() => { setFilter("Premium"); setActiveTab("catalog"); }}>
            <span className="style-number">02</span>
            <div>
              <strong>Premium</strong>
              <small>Повторяющиеся и редкие цифры</small>
            </div>
            <span className="style-arrow">↗</span>
          </button>

          <button type="button" className="style-card style-card-outline" onClick={() => { setFilter("Все"); setActiveTab("catalog"); }}>
            <span className="style-number">03</span>
            <div>
              <strong>Весь каталог</strong>
              <small>Все доступные категории</small>
            </div>
            <span className="style-arrow">↗</span>
          </button>
        </div>
      </section>
    );
  }

  function renderCatalog() {
    return (
      <>
        <section className="catalog-header">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">GRZ124 · CATALOG</span>
              <h2>Каталог номеров</h2>
            </div>
            <div className="catalog-counter">
              <strong>{filteredNumbers.length}</strong>
              <span>найдено</span>
            </div>
          </div>

          <div className="search-row">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск: 777, 001, буквы..."
            />
            {search && (
              <button type="button" className="clear-search" onClick={() => setSearch("")}>
                ×
              </button>
            )}
          </div>

          <div className="filters">
            {["Все", "Premium", "VIP"].map((name) => (
              <button
                key={name}
                type="button"
                className={filter === name ? "selected" : ""}
                onClick={() => setFilter(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </section>

        <section className="numbers-list">
          {loading ? (
            <div className="empty-state loading-state">
              <span className="loader" />
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
        <div className="section-title-row">
          <div>
            <span className="eyebrow">YOUR SELECTION</span>
            <h2>Избранное</h2>
          </div>
          <div className="catalog-counter">
            <strong>{favoriteNumbers.length}</strong>
            <span>номеров</span>
          </div>
        </div>

        {favoriteNumbers.length === 0 ? (
          <div className="empty-state">
            Здесь пока нет избранных номеров.
            <button type="button" className="empty-action" onClick={() => setActiveTab("catalog")}>
              Перейти в каталог →
            </button>
          </div>
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
      <section className="page-section requests-page">
        <span className="eyebrow">GRZ124 · REQUEST</span>
        <h2>Заявки</h2>
        <div className="request-card">
          <div className="request-icon">✓</div>
          <div>
            <strong>Оформление номера</strong>
            <p>Выберите номер в каталоге и откройте карточку «Подробнее».</p>
          </div>
        </div>
        <button type="button" className="hero-button request-button" onClick={() => setActiveTab("catalog")}>
          Перейти к номерам <span>→</span>
        </button>
      </section>
    );
  }

  function renderProfile() {
    return (
      <section className="page-section">
        <span className="eyebrow">GRZ124 · PROFILE</span>
        <h2>Профиль</h2>

        <div className="profile-card">
          <div className="profile-avatar">24</div>
          <div>
            <div className="profile-title">Красивые номера 24</div>
            <div className="profile-text">Красноярский край · регион 24</div>
          </div>
        </div>

        <button type="button" className="admin-open-button" onClick={() => setAdminOpen(true)}>
          ⚙ Админ-панель
        </button>
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
          <button type="button" className="brand-button" onClick={() => setActiveTab("home")}>
            <span className="brand-mini">GRZ124</span>
            <span>Красивые номера <b>24</b></span>
          </button>

          <button type="button" className="refresh-button" onClick={loadNumbers} aria-label="Обновить">
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
        {[
          ["home", "⌂", "Главная"],
          ["catalog", "▦", "Каталог"],
          ["favorites", "♡", "Избранное"],
          ["requests", "□", "Заявки"],
          ["profile", "♙", "Профиль"],
        ].map(([tab, icon, label]) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            <span className="nav-icon">{tab === "favorites" && favorites.length > 0 ? "♥" : icon}</span>
            <span>{label}</span>
            {tab === "favorites" && favorites.length > 0 && (
              <i className="nav-badge">{favorites.length}</i>
            )}
          </button>
        ))}
      </nav>

      {selectedNumber && (
        <div className="modal-overlay" onClick={() => setSelectedNumber(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setSelectedNumber(null)}>
              ×
            </button>

            <div className="modal-eyebrow">GRZ124 · SELECTED NUMBER</div>

            <Plate
              number={selectedNumber.number}
              regionCode={selectedNumber.regionCode}
            />

            <div className="modal-level">
              {getLevel(selectedNumber)}
            </div>

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
                ? "♥ Убрать из избранного"
                : "♡ Добавить в избранное"}
            </button>

            <button type="button" className="details-button secondary" onClick={() => setSelectedNumber(null)}>
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
