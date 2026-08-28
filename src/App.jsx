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
  { id:"number-1", number:"У001ЕТ24", price:550000, category:"Первая сотня" },
  { id:"number-2", number:"О003МС124", price:210000, category:"Первая сотня" },
  { id:"number-3", number:"У011ВН124", price:90000, category:"Первая сотня" },
  { id:"number-4", number:"Т020РА24", price:75000, category:"Первая сотня" },
  { id:"number-5", number:"Н024ОС24", price:165000, category:"Первая сотня" },
  { id:"number-6", number:"В024СМ24", price:185000, category:"Первая сотня" },
  { id:"number-7", number:"Е032КО24", price:55000, category:"Первая сотня" },
  { id:"number-8", number:"М035ТВ124", price:40000, category:"Первая сотня" },
  { id:"number-9", number:"К066НХ24", price:85000, category:"Первая сотня" },
  { id:"number-10", number:"М093ТВ124", price:40000, category:"Первая сотня" },
  { id:"number-11", number:"М094ТВ124", price:40000, category:"Первая сотня" },

  { id:"number-12", number:"Н111ХЕ124", price:300000, category:"Одинаковые цифры" },
  { id:"number-13", number:"У666ТА124", price:250000, category:"Одинаковые цифры" },
  { id:"number-14", number:"Е666РЕ124", price:350000, category:"Одинаковые цифры" },
  { id:"number-15", number:"Р888УХ24", price:430000, category:"Одинаковые цифры" },
  { id:"number-16", number:"В888МК24", price:500000, category:"Одинаковые цифры" },
  { id:"number-17", number:"У999ТТ24", price:550000, category:"Одинаковые цифры" },

  { id:"number-18", number:"А731АА24+А731АА124", price:375000, category:"Комплекты" },
  { id:"number-19", number:"С333ОК24+С333ОК124", price:1300000, category:"Комплекты" },

  { id:"number-20", number:"Х200НУ24", price:120000, category:"Сотни" },

  { id:"number-21", number:"Р014РР24", price:250000, category:"Буквы" },
  { id:"number-22", number:"У116УУ24", price:140000, category:"Буквы" },
  { id:"number-23", number:"В391ВВ124", price:125000, category:"Буквы" },
  { id:"number-24", number:"Е426ЕЕ124", price:105000, category:"Буквы" },
  { id:"number-25", number:"О482ОО24", price:380000, category:"Буквы" },
  { id:"number-26", number:"А742АА124", price:140000, category:"Буквы" },
  { id:"number-27", number:"Р803РР24", price:100000, category:"Буквы" },
  { id:"number-28", number:"А820АА24", price:175000, category:"Буквы" },
  { id:"number-29", number:"В922ВВ124", price:100000, category:"Буквы" },

  { id:"number-30", number:"Х124УВ124", price:155000, category:"124/124;224/224" },

  { id:"number-31", number:"У121ХА224", price:39000, category:"Зеркала" },
  { id:"number-32", number:"Н121УМ124", price:39000, category:"Зеркала" },
  { id:"number-33", number:"У121УС124", price:39000, category:"Зеркала" },
  { id:"number-34", number:"Т161ТС124", price:39000, category:"Зеркала" },
  { id:"number-35", number:"Х181УН124", price:39000, category:"Зеркала" },
  { id:"number-36", number:"В181НЕ124", price:60000, category:"Зеркала" },
  { id:"number-37", number:"Р191УУ124", price:39000, category:"Зеркала" },
  { id:"number-38", number:"Т212УХ124", price:39000, category:"Зеркала" },
  { id:"number-39", number:"Е292УМ124", price:39000, category:"Зеркала" },
  { id:"number-40", number:"У363УН124", price:39000, category:"Зеркала" },
  { id:"number-41", number:"О373ХА224", price:39000, category:"Зеркала" },
  { id:"number-42", number:"О373УН124", price:39000, category:"Зеркала" },
  { id:"number-43", number:"Е393УУ124", price:39000, category:"Зеркала" },
  { id:"number-44", number:"С484ХН124", price:39000, category:"Зеркала" },
  { id:"number-45", number:"В484ХН124", price:39000, category:"Зеркала" },
  { id:"number-46", number:"К545УР124", price:39000, category:"Зеркала" },
  { id:"number-47", number:"Т595УХ124", price:39000, category:"Зеркала" },
  { id:"number-48", number:"С646ХН124", price:39000, category:"Зеркала" },
  { id:"number-49", number:"В656УХ124", price:39000, category:"Зеркала" },
  { id:"number-50", number:"Н656УР124", price:39000, category:"Зеркала" },
  { id:"number-51", number:"К686УХ124", price:39000, category:"Зеркала" },
  { id:"number-52", number:"С787УХ124", price:39000, category:"Зеркала" },
  { id:"number-53", number:"В808ХН124", price:100000, category:"Зеркала" },
  { id:"number-54", number:"Т828УС124", price:39000, category:"Зеркала" },
  { id:"number-55", number:"У898НТ124", price:39000, category:"Зеркала" },
  { id:"number-56", number:"С949УУ124", price:39000, category:"Зеркала" },

  { id:"number-57", number:"Е110УТ124", price:35000, category:"Прочее" },
  { id:"number-58", number:"Х150АН224", price:85000, category:"Прочее" },
  { id:"number-59", number:"Т221УР124", price:35000, category:"Прочее" },
  { id:"number-60", number:"Х227АН224", price:45000, category:"Прочее" },
  { id:"number-61", number:"О321ХА224", price:30000, category:"Прочее" },
  { id:"number-62", number:"М359УР124", price:30000, category:"Прочее" },
  { id:"number-63", number:"М389УР124", price:30000, category:"Прочее" },
  { id:"number-64", number:"М398УР124", price:30000, category:"Прочее" },
  { id:"number-65", number:"В440УС124", price:30000, category:"Прочее" },
  { id:"number-66", number:"К567УР124", price:35000, category:"Прочее" },
  { id:"number-67", number:"О877ХА224", price:25000, category:"Прочее" },

  { id:"number-68", number:"НВ 7878 24", price:50000, category:"Прицеп" },
  { id:"number-69", number:"ОВ 0999 24", price:175000, category:"Прицеп" },
  { id:"number-70", number:"ОВ 0990 24", price:120000, category:"Прицеп" },
  { id:"number-71", number:"ОВ 0969 24", price:75000, category:"Прицеп" },
  { id:"number-72", number:"ОВ 0828 24", price:55000, category:"Прицеп" },
  { id:"number-73", number:"НК 6066 24", price:55000, category:"Прицеп" },
  { id:"number-74", number:"НК 7666 24", price:75000, category:"Прицеп" },
  { id:"number-75", number:"НК 7667 24", price:50000, category:"Прицеп" },
  { id:"number-76", number:"НЕ 7333 24", price:75000, category:"Прицеп" },
  { id:"number-77", number:"НК 2929 24", price:45000, category:"Прицеп" },
  { id:"number-78", number:"ОВ 2999 24", price:75000, category:"Прицеп" },
  { id:"number-79", number:"ОВ 4774 24", price:75000, category:"Прицеп" },

  { id:"number-80", number:"АК 0200 24", price:160000, category:"Мото" },
  { id:"number-81", number:"ВА 4666 24", price:60000, category:"Мото" },
  { id:"number-82", number:"АМ 3993 24", price:60000, category:"Мото" },
];

function normalizeNumber(item) {
  return {
    id: String(item.id ?? `number-${Date.now()}-${Math.random()}`),
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
  for (const raw of list) {
    const item = normalizeNumber(raw);
    const key = item.number.replace(/\s/g, "").toUpperCase();
    if (key) map.set(key, item);
  }
  return Array.from(map.values()).sort((a,b) => b.price - a.price);
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

function Plate({ number }) {
  const parts = String(number || "").split("+");
  return (
    <div className="plate-wrap">
      {parts.map((part, index) => {
        const clean = part.trim();
        const trailer = /^(НВ|ОВ|НК|НЕ)\s+\d{4}\s+24$/.test(clean);
        const moto = /^(АК|ВА|АМ)\s+\d{4}\s+24$/.test(clean);

        return (
          <div className={`plate ${trailer ? "plate-trailer" : ""} ${moto ? "plate-moto" : ""}`} key={`${clean}-${index}`}>
            <div className="plate-number">{clean}</div>
            <div className="plate-region"><strong>24</strong><span>RUS</span></div>
          </div>
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
        <Plate number={item.number} />
        <button type="button" className={`favorite-button ${favorite ? "active" : ""}`} onClick={() => onFavorite(item.id)} aria-label="Избранное">
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="number-info">
        {level && <div className={`level level-${level.toLowerCase()}`}>{level}</div>}
        <div className="category">{item.category}</div>
        <div className="region">Красноярский край</div>
        <div className="price">{formatPrice(item.price)}</div>
        <div className="price-note">с оформлением</div>

        {item.description && <div className="description">{item.description}</div>}

        {reserved ? (
          <button type="button" className="details-button disabled" disabled>Занято</button>
        ) : (
          <button type="button" className="details-button" onClick={() => onDetails(item)}>Подробнее</button>
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
  const [form, setForm] = useState({ number:"", price:"", category:"Одинаковые цифры", status:"available", description:"" });
  const [message, setMessage] = useState("");

  function login(event) {
    event.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthorized(true); setPassword(""); setPasswordError("");
    } else setPasswordError("Неверный пароль");
  }

  function resetForm() {
    setEditingId(null);
    setForm({ number:"", price:"", category:"Одинаковые цифры", status:"available", description:"" });
  }

  function editNumber(item) {
    setEditingId(item.id);
    setForm({ number:item.number, price:String(item.price), category:item.category, status:item.status, description:item.description || "" });
    window.scrollTo({ top:0, behavior:"smooth" });
  }

  function saveNumbers(next) {
    onChangeNumbers(next);
    try { localStorage.setItem(LOCAL_NUMBERS_KEY, JSON.stringify(next)); } catch {}
  }

  async function saveToSupabase(item, isNew) {
    try {
      const headers = { apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}`, "Content-Type":"application/json", Prefer:"return=minimal" };
      const body = { id:item.id, number:item.number, price:item.price, category:item.category, region:"Красноярский край", regionCode:"24", status:item.status, description:item.description };
      await fetch(isNew ? API_URL : `${API_URL}?id=eq.${encodeURIComponent(item.id)}`, {
        method:isNew ? "POST" : "PATCH",
        headers,
        body:JSON.stringify(isNew ? body : { number:item.number, price:item.price, category:item.category, region:"Красноярский край", regionCode:"24", status:item.status, description:item.description })
      });
    } catch (error) { console.error("Supabase admin error:", error); }
  }

  async function submitForm(event) {
    event.preventDefault();
    const cleanNumber = form.number.trim();
    const price = Number(String(form.price).replace(/\s/g,"").replace(/₽/g,""));
    if (!cleanNumber) return setMessage("Введите номер");
    if (!price || price < 0) return setMessage("Введите корректную цену");

    if (editingId) {
      const oldItem = numbers.find(item => item.id === editingId);
      const updated = { ...(oldItem || {}), id:editingId, number:cleanNumber, price, category:form.category, region:"Красноярский край", regionCode:"24", status:form.status, description:form.description.trim() };
      saveNumbers(numbers.map(item => item.id === editingId ? updated : item));
      await saveToSupabase(updated, false);
      setMessage("Номер изменён"); resetForm(); return;
    }

    const newItem = { id:`admin-${Date.now()}`, number:cleanNumber, price, category:form.category, region:"Красноярский край", regionCode:"24", status:form.status, description:form.description.trim() };
    saveNumbers(removeDuplicates([...numbers, newItem]));
    await saveToSupabase(newItem, true);
    setMessage("Номер добавлен"); resetForm();
  }

  async function deleteNumber(item) {
    if (!window.confirm(`Удалить номер ${item.number}?`)) return;
    saveNumbers(numbers.filter(number => number.id !== item.id));
    try {
      await fetch(`${API_URL}?id=eq.${encodeURIComponent(item.id)}`, { method:"DELETE", headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}` }});
    } catch (error) { console.error(error); }
    setMessage("Номер удалён");
  }

  function toggleReserved(item) {
    const updated = { ...item, status:item.status === "reserved" ? "available" : "reserved" };
    saveNumbers(numbers.map(number => number.id === item.id ? updated : number));
    saveToSupabase(updated, false);
    setMessage(updated.status === "reserved" ? "Номер отмечен как занятый" : "Номер снова доступен");
  }

  if (!authorized) {
    return (
      <section className="page-section admin-page">
        <div className="admin-header">
          <div><h2>Админ-панель</h2><div className="region">GRZ124 · управление номерами</div></div>
          <button type="button" className="details-button" onClick={onClose}>Назад</button>
        </div>
        <form className="admin-form" onSubmit={login}>
          <h3>Вход администратора</h3>
          <input className="admin-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" autoFocus />
          {passwordError && <div className="admin-error">{passwordError}</div>}
          <button type="submit" className="details-button">Войти</button>
        </form>
      </section>
    );
  }

  return (
    <section className="page-section admin-page">
      <div className="admin-header">
        <div><h2>Админ-панель</h2><div className="region">Номеров: {numbers.length}</div></div>
        <button type="button" className="details-button" onClick={onClose}>Закрыть</button>
      </div>

      <form className="admin-form" onSubmit={submitForm}>
        <h3>{editingId ? "Редактировать номер" : "Добавить номер"}</h3>
        <input className="admin-input" value={form.number} onChange={e => setForm({...form, number:e.target.value})} placeholder="Номер, например У999ТТ24" />
        <input className="admin-input" type="number" value={form.price} onChange={e => setForm({...form, price:e.target.value})} placeholder="Цена" />
        <select className="admin-input" value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
          <option>Одинаковые цифры</option><option>Первая сотня</option><option>Комплекты</option><option>Сотни</option><option>Буквы</option><option>Зеркала</option><option>Прочее</option><option>124/124;224/224</option><option>Прицеп</option><option>Мото</option>
        </select>
        <select className="admin-input" value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
          <option value="available">Доступен</option><option value="reserved">Занят</option>
        </select>
        <input className="admin-input" value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Описание (необязательно)" />
        {message && <div className="admin-message">{message}</div>}
        <div className="admin-actions">
          <button type="submit">{editingId ? "Сохранить изменения" : "Добавить номер"}</button>
          {editingId && <button type="button" onClick={resetForm}>Отмена</button>}
        </div>
      </form>

      <div className="admin-list">
        <div className="admin-list-title">Все номера</div>
        {numbers.map(item => (
          <div className="admin-number-row" key={item.id}>
            <div className="admin-number-main">
              <strong>{item.number}</strong><span>{formatPrice(item.price)}</span>
              <small>{item.category} · {item.status === "reserved" ? "Занят" : "Доступен"}</small>
            </div>
            <div className="admin-actions">
              <button type="button" onClick={() => editNumber(item)}>Изменить</button>
              <button type="button" onClick={() => toggleReserved(item)}>{item.status === "reserved" ? "Освободить" : "Занять"}</button>
              <button type="button" className="danger" onClick={() => deleteNumber(item)}>Удалить</button>
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
    try { const saved = localStorage.getItem(FAVORITES_KEY); return saved ? JSON.parse(saved) : []; } catch { return []; }
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
    } catch { return []; }
  }

  async function loadNumbers() {
    setLoading(true);
    const localNumbers = getLocalNumbers();
    const baseNumbers = localNumbers.length ? localNumbers : FALLBACK_NUMBERS;

    try {
      const response = await fetch(API_URL + "?select=*&order=price.desc", {
        headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}`, "Content-Type":"application/json" }
      });
      if (!response.ok) throw new Error(`Supabase error: ${response.status}`);
      const data = await response.json();
      setNumbers(removeDuplicates([ ...baseNumbers, ...(Array.isArray(data) ? data.map(normalizeNumber) : []) ]));
    } catch (error) {
      console.error("Ошибка загрузки номеров:", error);
      setNumbers(removeDuplicates(baseNumbers));
    } finally { setLoading(false); }
  }

  useEffect(() => { loadNumbers(); }, []);

  useEffect(() => {
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); } catch {}
  }, [favorites]);

  function toggleFavorite(id) {
    setFavorites(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }

  const filteredNumbers = useMemo(() => {
    let result = [...numbers];
    if (filter === "VIP") result = result.filter(item => getLevel(item) === "VIP");
    if (filter === "Premium") result = result.filter(item => getLevel(item) === "Premium");
    const query = search.trim().toLowerCase();
    if (query) result = result.filter(item => `${item.number} ${item.category} ${item.region}`.toLowerCase().includes(query));
    return result;
  }, [numbers, filter, search]);

  const favoriteNumbers = useMemo(() => numbers.filter(item => favorites.includes(item.id)), [numbers, favorites]);

  function renderHome() {
    return (
      <section className="home-section">
        <div className="hero-card">
          <div className="hero-region">КРАСНОЯРСКИЙ КРАЙ</div>
          <h1>Красивые номера 24</h1>
          <p>Номер, который запомнят.</p>
          <button type="button" onClick={() => setActiveTab("catalog")}>Смотреть каталог</button>
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
          <div className="catalog-title-row"><h2>Каталог номеров</h2><div className="catalog-icon">▦</div></div>
          <div className="search-row"><span className="search-icon">⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск: 777, 001..." /></div>
          <div className="filters">{["Все","Premium","VIP"].map(name => <button key={name} type="button" className={filter === name ? "selected" : ""} onClick={() => setFilter(name)}>{name}</button>)}</div>
        </section>
        <section className="numbers-list">
          {loading ? <div className="empty-state">Загрузка номеров...</div> : filteredNumbers.length === 0 ? <div className="empty-state">{search ? "Номеров по вашему запросу не найдено." : "Номера пока не добавлены."}</div> :
            filteredNumbers.map(item => <NumberCard key={item.id} item={item} favorite={favorites.includes(item.id)} onFavorite={toggleFavorite} onDetails={setSelectedNumber} />)}
        </section>
      </>
    );
  }

  function renderFavorites() {
    return <section className="page-section"><h2>Избранное</h2>{favoriteNumbers.length === 0 ? <div className="empty-state">Здесь пока нет избранных номеров.</div> : <div className="numbers-list">{favoriteNumbers.map(item => <NumberCard key={item.id} item={item} favorite onFavorite={toggleFavorite} onDetails={setSelectedNumber} />)}</div>}</section>;
  }

  function renderRequests() {
    return <section className="page-section"><h2>Заявки</h2><div className="empty-state">Для оформления номера нажмите «Подробнее» в каталоге.</div></section>;
  }

  function renderProfile() {
    return <section className="page-section"><h2>Профиль</h2><div className="profile-card"><div className="profile-title">Красивые номера 24</div><div className="profile-text">Красноярский край</div><button type="button" className="details-button" style={{marginTop:16}} onClick={() => setAdminOpen(true)}>⚙ Админ-панель</button></div></section>;
  }

  if (adminOpen) return <div className="app"><main className="content"><div className="top-region">КРАСНОЯРСКИЙ КРАЙ</div><AdminPanel numbers={numbers} onChangeNumbers={setNumbers} onClose={() => setAdminOpen(false)} /></main></div>;

  return (
    <div className="app">
      <main className="content">
        <div className="top-region">КРАСНОЯРСКИЙ КРАЙ</div>
        <header className="main-header"><h1>Красивые номера 24</h1><button type="button" className="refresh-button" onClick={loadNumbers} aria-label="Обновить">⟳</button></header>
        {activeTab === "home" && renderHome()}
        {activeTab === "catalog" && renderCatalog()}
        {activeTab === "favorites" && renderFavorites()}
        {activeTab === "requests" && renderRequests()}
        {activeTab === "profile" && renderProfile()}
      </main>

      <nav className="bottom-nav">
        {[
          ["home","⌂","Главная"],["catalog","▦","Каталог"],["favorites","♡","Избранное"],["requests","□","Заявки"],["profile","♙","Профиль"]
        ].map(([tab, icon, label]) => (
          <button key={tab} type="button" className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
            <span className="nav-icon">{icon}</span><span>{label}</span>
          </button>
        ))}
      </nav>

      {selectedNumber && (
        <div className="modal-overlay" onClick={() => setSelectedNumber(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setSelectedNumber(null)}>×</button>
            <Plate number={selectedNumber.number} />
            {getLevel(selectedNumber) && <div className="modal-level">{getLevel(selectedNumber)}</div>}
            <h3>{selectedNumber.category}</h3>
            <div className="modal-region">Красноярский край</div>
            <div className="modal-price">{formatPrice(selectedNumber.price)}</div>
            <div className="modal-price-note">Цена с оформлением</div>
            {selectedNumber.description && <p className="modal-description">{selectedNumber.description}</p>}
            <button type="button" className="details-button modal-action" onClick={() => toggleFavorite(selectedNumber.id)}>
              {favorites.includes(selectedNumber.id) ? "Убрать из избранного" : "Добавить в избранное"}
            </button>
            <button type="button" className="details-button" onClick={() => setSelectedNumber(null)}>Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) createRoot(rootElement).render(<React.StrictMode><App /></React.StrictMode>);
