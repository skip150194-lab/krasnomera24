import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const TG = window.Telegram?.WebApp;
const SUPABASE_URL = "https://tjxuumgwkttfnfgpdkaj.supabase.co";
const SUPABASE_KEY = "sb_publishable_29-OjXwd3B9rGcPGo6IF4Q_1R8-DjQh";
const API_URL = `${SUPABASE_URL}/rest/v1/numbers`;

const money = (value) => `${Number(value || 0).toLocaleString("ru-RU")} ₽`;
const normalize = (value) => String(value || "").toLowerCase().replaceAll(" ", "");

function statusLabel(status) {
  const s = String(status || "available").toLowerCase();
  if (s === "reserved") return "Бронь";
  if (s === "sold") return "Продан";
  return "В наличии";
}

function App() {
  const [tab, setTab] = useState("home");
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!TG) return;
    TG.ready();
    TG.expand();
    try {
      TG.setHeaderColor("#0b0b0e");
      TG.setBackgroundColor("#0b0b0e");
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadNumbers() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}?select=id,number,price,category,status,created_at&order=id.asc`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          const details = await response.text();
          throw new Error(details || `HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) setNumbers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Supabase error:", err);
        if (!cancelled) {
          setError("Каталог пока недоступен. Нужно разрешить публичное чтение таблицы numbers в Supabase.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadNumbers();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    return ["Все", ...Array.from(new Set(numbers.map((n) => n.category).filter(Boolean)))];
  }, [numbers]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return numbers.filter((item) => {
      const matchQuery = !q || normalize(item.number).includes(q);
      const matchCategory = category === "Все" || item.category === category;
      return matchQuery && matchCategory;
    });
  }, [numbers, query, category]);

  const availableCount = numbers.filter((n) => String(n.status).toLowerCase() === "available").length;

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="eyebrow">GRZ124 · КРАСНОЯРСК</div>
          <h1>Красивые номера <b>24</b></h1>
        </div>
        <button className="icon-btn" onClick={() => setTab("catalog")}>⌕</button>
      </header>

      {tab === "home" && (
        <main className="page">
          <section className="hero">
            <div className="hero-glow" />
            <div className="eyebrow">АКТУАЛЬНЫЙ КАТАЛОГ GRZ124</div>
            <h2>Найди свой<br />красивый номер</h2>
            <p>{loading ? "Обновляем каталог..." : `${numbers.length} позиций · ${availableCount} в наличии`}</p>
            <button className="primary" onClick={() => setTab("catalog")}>Открыть каталог <span>→</span></button>
          </section>

          <section className="section">
            <div className="section-title"><h3>Категории</h3><button onClick={() => setTab("catalog")}>Все →</button></div>
            <div className="chips">
              {categories.slice(0, 9).map((cat) => (
                <button key={cat} onClick={() => { setCategory(cat); setTab("catalog"); }}>{cat}</button>
              ))}
            </div>
          </section>

          <section className="category-grid">
            {categories.filter((c) => c !== "Все").slice(0, 4).map((cat, i) => (
              <button className="category-card" key={cat} onClick={() => { setCategory(cat); setTab("catalog"); }}>
                <span className="category-icon">{["💎", "🔥", "⭐", "🪞"][i]}</span>
                <strong>{cat}</strong>
                <small>Смотреть предложения</small>
              </button>
            ))}
          </section>

          {error && <div className="empty" style={{marginTop: 16}}>{error}</div>}
        </main>
      )}

      {tab === "catalog" && (
        <main className="page">
          <div className="page-title"><h2>Каталог GRZ124</h2><button className="filter-btn" onClick={() => { setQuery(""); setCategory("Все"); }}>↺</button></div>

          <div className="search">
            <span>⌕</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск: 777, 001, АА..." />
            <button onClick={() => setQuery("")}>×</button>
          </div>

          <div className="chips">
            {categories.map((cat) => (
              <button key={cat} className={category === cat ? "active" : ""} onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>

          {loading && <div className="empty" style={{marginTop: 14}}>Загружаем номера из Supabase...</div>}
          {!loading && error && <div className="empty" style={{marginTop: 14}}>{error}</div>}

          {!loading && !error && (
            <>
              <div className="muted" style={{marginTop: 14}}>Найдено: {filtered.length}</div>
              <div className="list">
                {filtered.map((item) => {
                  const reserved = String(item.status).toLowerCase() === "reserved";
                  const sold = String(item.status).toLowerCase() === "sold";

                  return (
                    <article className="number-card" key={item.id}>
                      <div className="card-top">
                        <div className="plate"><span className="plate-main">{item.number}</span></div>
                        <span className={"status " + (reserved ? "reserved" : "")}>{statusLabel(item.status)}</span>
                      </div>
                      <div className="meta">
                        <span className="badge">{item.category || "Прочее"}</span>
                        <strong>{money(item.price)}</strong>
                      </div>
                      <div className="muted">Красноярский край</div>
                      <button className="secondary" onClick={() => setSelected(item)} disabled={sold}>Подробнее</button>
                    </article>
                  );
                })}
                {!filtered.length && <div className="empty">По вашему запросу ничего не найдено.</div>}
              </div>
            </>
          )}
        </main>
      )}

      {tab === "profile" && (
        <main className="page">
          <div className="profile">
            <div className="avatar">24</div>
            <h2>GRZ124</h2>
            <p className="muted">Красивые государственные номера</p>
          </div>
          <div className="menu-card">
            <button onClick={() => setTab("catalog")}>▦ Каталог <span>›</span></button>
            <button onClick={() => setTab("home")}>⌂ Главная <span>›</span></button>
            <button onClick={() => TG?.openTelegramLink?.("https://t.me/Dremov767")}>💬 Связаться с менеджером <span>›</span></button>
          </div>
        </main>
      )}

      <nav className="bottom-nav">
        <button className={tab === "home" ? "nav-active" : ""} onClick={() => setTab("home")}><span>⌂</span><small>Главная</small></button>
        <button className={tab === "catalog" ? "nav-active" : ""} onClick={() => setTab("catalog")}><span>▦</span><small>Каталог</small></button>
        <button className={tab === "profile" ? "nav-active" : ""} onClick={() => setTab("profile")}><span>♙</span><small>Контакты</small></button>
      </nav>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            <div className="plate plate-large"><span className="plate-main">{selected.number}</span></div>
            <span className="badge">{selected.category || "Прочее"}</span>
            <div className="modal-price">{money(selected.price)}</div>
            <div className="detail-list">
              <div><span>Статус</span><strong>{statusLabel(selected.status)}</strong></div>
              <div><span>Регион</span><strong>Красноярский край</strong></div>
            </div>
            <button className="primary full" disabled={String(selected.status).toLowerCase() !== "available"} onClick={() => TG?.openTelegramLink?.(`https://t.me/Dremov767?text=${encodeURIComponent(`Здравствуйте! Интересует номер ${selected.number} за ${money(selected.price)}`)}`)}>
              {String(selected.status).toLowerCase() === "available" ? "Оставить заявку" : statusLabel(selected.status)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
