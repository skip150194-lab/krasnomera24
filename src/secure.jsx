import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./admin-panel.css";

const TG = window.Telegram?.WebApp;
const OWNER_TELEGRAM_ID = 105933015;
const SUPABASE_URL = "https://tjxuumgwkttfnfgpdkaj.supabase.co";
const SUPABASE_KEY = "sb_publishable_29-OjXwd3B9rGcPGo6IF4Q_1R8-DjQh";
const API_URL = `${SUPABASE_URL}/rest/v1/numbers`;

const money = (v) => `${Number(v || 0).toLocaleString("ru-RU")} ₽`;
const keyOf = (v) => String(v || "").replace(/\s+/g, "").toUpperCase();

function dedupe(items) {
  const map = new Map();
  for (const item of items || []) {
    const key = keyOf(item.number);
    if (!key) continue;
    if (!map.has(key)) map.set(key, item);
  }
  return [...map.values()];
}

function splitPlate(number) {
  const raw = String(number || "").trim();
  const match = raw.match(/^(.*?)(224|124|24)$/);
  return match ? { main: match[1].trim(), region: match[2] } : { main: raw, region: "" };
}

function Plate({ number }) {
  const parts = String(number || "").split("+");
  return <div className="plate-wrap">{parts.map((part, i) => {
    const { main, region } = splitPlate(part);
    return <div className="plate" key={i}>
      <div className="plate-number">{main}</div>
      {region && <div className="plate-region"><strong>{region}</strong><span>RUS 🇷🇺</span></div>}
    </div>;
  })}</div>;
}

function App() {
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("catalog");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все");
  const [selected, setSelected] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");

  const telegramUserId = Number(TG?.initDataUnsafe?.user?.id || 0);
  const isOwner = telegramUserId === OWNER_TELEGRAM_ID;

  async function loadNumbers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}?select=id,number,price,category,status,created_at&order=id.asc`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setNumbers(dedupe(data));
    } catch (e) {
      console.error(e);
      setError("Не удалось загрузить каталог из Supabase");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    TG?.ready?.();
    TG?.expand?.();
    loadNumbers();
  }, []);

  const categories = useMemo(() => ["Все", ...new Set(numbers.map(n => n.category).filter(Boolean))], [numbers]);
  const filtered = useMemo(() => {
    const q = keyOf(query);
    return numbers.filter(n => (category === "Все" || n.category === category) && (!q || keyOf(n.number).includes(q)));
  }, [numbers, query, category]);

  async function deleteItem(item) {
    if (!isOwner || !confirm(`Удалить ${item.number}?`)) return;
    const res = await fetch(`${API_URL}?id=eq.${encodeURIComponent(item.id)}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    if (!res.ok) {
      setAdminMessage("Supabase не разрешил удаление. Нужна отдельная admin policy.");
      return;
    }
    await loadNumbers();
    setAdminMessage("Удалено");
  }

  async function toggleStatus(item) {
    if (!isOwner) return;
    const next = item.status === "reserved" ? "available" : "reserved";
    const res = await fetch(`${API_URL}?id=eq.${encodeURIComponent(item.id)}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: next })
    });
    if (!res.ok) {
      setAdminMessage("Supabase не разрешил изменение. Нужна отдельная admin policy.");
      return;
    }
    await loadNumbers();
  }

  if (adminOpen && isOwner) {
    return <div className="app"><main className="content">
      <section className="page-section admin-page">
        <div className="admin-header"><div><h2>Админ-панель GRZ124</h2><div className="region">Только владелец · ID {OWNER_TELEGRAM_ID}</div></div><button className="details-button" onClick={() => setAdminOpen(false)}>Закрыть</button></div>
        {adminMessage && <div className="admin-message">{adminMessage}</div>}
        <div className="admin-list">
          {numbers.map(item => <div className="admin-number-row" key={item.id}>
            <div className="admin-number-main"><strong>{item.number}</strong><span>{money(item.price)}</span><small>{item.category} · {item.status}</small></div>
            <div className="admin-actions">
              <button onClick={() => toggleStatus(item)}>{item.status === "reserved" ? "Освободить" : "Занять"}</button>
              <button className="danger" onClick={() => deleteItem(item)}>Удалить</button>
            </div>
          </div>)}
        </div>
      </section>
    </main></div>;
  }

  return <div className="app">
    <main className="content">
      <div className="top-region">GRZ124 · КРАСНОЯРСКИЙ КРАЙ</div>
      <header className="main-header"><h1>Красивые номера 24</h1><button className="refresh-button" onClick={loadNumbers}>⟳</button></header>

      {tab === "catalog" && <>
        <section className="catalog-header">
          <div className="catalog-title-row"><h2>Каталог номеров</h2><div className="catalog-icon">▦</div></div>
          <div className="search-row"><span className="search-icon">⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск номера..." /></div>
          <div className="filters">{categories.map(c => <button key={c} className={category === c ? "selected" : ""} onClick={() => setCategory(c)}>{c}</button>)}</div>
        </section>
        <section className="numbers-list">
          {loading ? <div className="empty-state">Загрузка...</div> : error ? <div className="empty-state">{error}</div> : filtered.map(item => <article className="number-card" key={keyOf(item.number)}>
            <div className="number-card-top"><Plate number={item.number} /></div>
            <div className="number-info"><div className="category">{item.category}</div><div className="price">{money(item.price)}</div><div className="region">{item.status === "reserved" ? "Бронь" : item.status === "sold" ? "Продан" : "В наличии"}</div><button className="details-button" onClick={() => setSelected(item)}>Подробнее</button></div>
          </article>)}
        </section>
      </>}

      {tab === "profile" && <section className="page-section"><h2>Профиль</h2><div className="profile-card"><div className="profile-title">GRZ124</div><div className="profile-text">Красивые номера · Красноярск</div>{isOwner && <button className="details-button" style={{marginTop:16}} onClick={() => setAdminOpen(true)}>⚙ Админ-панель</button>}</div></section>}
    </main>

    <nav className="bottom-nav"><button className={tab === "catalog" ? "active" : ""} onClick={() => setTab("catalog")}><span className="nav-icon">▦</span><span>Каталог</span></button><button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}><span className="nav-icon">♙</span><span>Профиль</span></button></nav>

    {selected && <div className="modal-overlay" onClick={() => setSelected(null)}><div className="modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}>×</button><Plate number={selected.number} /><h3>{selected.category}</h3><div className="modal-price">{money(selected.price)}</div><button className="details-button" onClick={() => setSelected(null)}>Закрыть</button></div></div>}
  </div>;
}

createRoot(document.getElementById("root")).render(<App />);
