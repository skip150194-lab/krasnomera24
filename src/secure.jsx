import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const TG = window.Telegram?.WebApp;
const OWNER_TELEGRAM_ID = 105933015;
const SUPABASE_URL = "https://tjxuumgwkttfnfgpdkaj.supabase.co";
const SUPABASE_KEY = "sb_publishable_29-OjXwd3B9rGcPGo6IF4Q_1R8-DjQh";
const API_URL = `${SUPABASE_URL}/rest/v1/numbers`;

const money = (v) => `${Number(v || 0).toLocaleString("ru-RU")} ₽`;
const normalize = (v) => String(v || "").replace(/\s+/g, "").toUpperCase();
const statusLabel = (s) => s === "reserved" ? "Бронь" : s === "sold" ? "Продан" : "В наличии";

function dedupe(items) {
  const map = new Map();
  for (const item of items || []) {
    const key = normalize(item.number);
    if (key && !map.has(key)) map.set(key, item);
  }
  return [...map.values()];
}

function splitPlate(raw) {
  const value = String(raw || "").trim();
  const match = value.match(/^(.*?)(224|124|24)$/);
  return match ? { main: match[1].trim(), region: match[2] } : { main: value, region: "" };
}

function PlateSingle({ value }) {
  const { main, region } = splitPlate(value);
  return (
    <div className="plate">
      <div className="plate-main">{main}</div>
      {region && (
        <div className="plate-side">
          <div className="plate-region">{region}</div>
          <div className="plate-rus"><span>RUS</span><i className="ru-flag" /></div>
        </div>
      )}
    </div>
  );
}

function Plate({ number, large = false }) {
  const parts = String(number || "").split("+");
  return <div className={`plate-stack ${large ? "plate-stack-large" : ""}`}>{parts.map((p, i) => <PlateSingle key={`${p}-${i}`} value={p} />)}</div>;
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
  const secretTap = useRef({ count: 0, timer: null });

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
      setNumbers(dedupe(await res.json()));
    } catch (e) {
      console.error(e);
      setError("Не удалось загрузить каталог. Проверь доступ к таблице numbers в Supabase.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    TG?.ready?.();
    TG?.expand?.();
    try {
      TG?.setHeaderColor?.("#07080b");
      TG?.setBackgroundColor?.("#07080b");
    } catch {}
    loadNumbers();
  }, []);

  const categories = useMemo(() => ["Все", ...new Set(numbers.map(n => n.category).filter(Boolean))], [numbers]);
  const filtered = useMemo(() => {
    const q = normalize(query);
    return numbers.filter(n => (category === "Все" || n.category === category) && (!q || normalize(n.number).includes(q)));
  }, [numbers, query, category]);
  const availableCount = numbers.filter(n => String(n.status).toLowerCase() === "available").length;

  function ownerSecretTap() {
    if (!isOwner) return;
    clearTimeout(secretTap.current.timer);
    secretTap.current.count += 1;
    if (secretTap.current.count >= 5) {
      secretTap.current.count = 0;
      setAdminOpen(true);
      TG?.HapticFeedback?.notificationOccurred?.("success");
      return;
    }
    secretTap.current.timer = setTimeout(() => { secretTap.current.count = 0; }, 1800);
  }

  async function patchStatus(item) {
    if (!isOwner) return;
    const next = item.status === "reserved" ? "available" : "reserved";
    const res = await fetch(`${API_URL}?id=eq.${encodeURIComponent(item.id)}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ status: next })
    });
    if (!res.ok) {
      setAdminMessage("Изменение заблокировано политиками Supabase. Публичный ключ нельзя использовать как полноценный админ-доступ.");
      return;
    }
    setAdminMessage("Статус обновлён");
    await loadNumbers();
  }

  function contact(item) {
    const text = encodeURIComponent(`Здравствуйте! Интересует номер ${item.number} за ${money(item.price)}`);
    TG?.openTelegramLink?.(`https://t.me/Dremov767?text=${text}`);
  }

  if (adminOpen && isOwner) {
    return (
      <div className="app-shell">
        <main className="content admin-content">
          <div className="admin-head">
            <div><div className="eyebrow">GRZ124 · PRIVATE</div><h1>Админ-панель</h1></div>
            <button className="round-btn" onClick={() => setAdminOpen(false)}>×</button>
          </div>
          <div className="admin-note">Публичный Supabase-ключ подходит для чтения каталога. Изменения сработают только если RLS-политики разрешают соответствующую операцию.</div>
          {adminMessage && <div className="admin-message">{adminMessage}</div>}
          <div className="admin-list">
            {numbers.map(item => (
              <div className="admin-row" key={item.id}>
                <div><strong>{item.number}</strong><span>{money(item.price)}</span><small>{item.category} · {statusLabel(item.status)}</small></div>
                <button onClick={() => patchStatus(item)}>{item.status === "reserved" ? "Освободить" : "В бронь"}</button>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <main className="content">
        <header className="topbar">
          <button className="brand" onClick={ownerSecretTap} aria-label="GRZ124">
            <span className="brand-dot" />
            <span><b>GRZ124</b><small>Красноярский край</small></span>
          </button>
          <button className="round-btn" onClick={loadNumbers}>↻</button>
        </header>

        {tab === "catalog" && (
          <>
            <section className="hero-compact">
              <div className="eyebrow">АКТУАЛЬНЫЙ КАТАЛОГ</div>
              <h1>Красивые номера <span>24</span></h1>
              <p>{loading ? "Обновляем каталог..." : `${numbers.length} позиций · ${availableCount} в наличии`}</p>
            </section>

            <section className="catalog-tools">
              <label className="searchbar"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Найти номер: 777, АА, 124..." />{query && <button onClick={() => setQuery("")}>×</button>}</label>
              <div className="chips">{categories.map(c => <button key={c} className={category === c ? "active" : ""} onClick={() => setCategory(c)}>{c}</button>)}</div>
            </section>

            {loading ? <div className="state-card">Загружаем номера…</div> : error ? <div className="state-card error">{error}</div> : (
              <>
                <div className="results-line"><span>Найдено</span><b>{filtered.length}</b></div>
                <section className="number-list">
                  {filtered.map(item => {
                    const state = String(item.status || "available").toLowerCase();
                    return (
                      <article className="number-card" key={normalize(item.number)}>
                        <div className="card-status-row"><span className={`status-pill ${state}`}>{statusLabel(state)}</span><span className="category-label">{item.category || "Прочее"}</span></div>
                        <Plate number={item.number} />
                        <div className="card-bottom"><div><small>Цена</small><strong>{money(item.price)}</strong></div><button onClick={() => setSelected(item)}>Подробнее</button></div>
                      </article>
                    );
                  })}
                  {!filtered.length && <div className="state-card">По вашему запросу ничего не найдено.</div>}
                </section>
              </>
            )}
          </>
        )}

        {tab === "profile" && (
          <section className="profile-page">
            <div className="profile-logo">24</div>
            <div className="eyebrow">GRZ124</div>
            <h1>Красивые номера</h1>
            <p>Каталог актуальных предложений по Красноярскому краю.</p>
            <div className="profile-actions">
              <button onClick={() => TG?.openTelegramLink?.("https://t.me/Dremov767")}>Написать менеджеру <span>›</span></button>
              <button onClick={() => setTab("catalog")}>Вернуться в каталог <span>›</span></button>
            </div>
          </section>
        )}
      </main>

      <nav className="bottom-nav">
        <button className={tab === "catalog" ? "active" : ""} onClick={() => setTab("catalog")}><span>▦</span><small>Каталог</small></button>
        <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}><span>◎</span><small>Контакты</small></button>
      </nav>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            <div className="eyebrow">{selected.category || "Прочее"}</div>
            <Plate number={selected.number} large />
            <div className="modal-price">{money(selected.price)}</div>
            <div className="modal-info"><span>Статус</span><b>{statusLabel(String(selected.status || "available").toLowerCase())}</b></div>
            <button className="primary-btn" disabled={String(selected.status).toLowerCase() !== "available"} onClick={() => contact(selected)}>{String(selected.status).toLowerCase() === "available" ? "Оставить заявку" : statusLabel(String(selected.status).toLowerCase())}</button>
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
