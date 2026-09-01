import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./admin-panel.css";

const TG = window.Telegram?.WebApp;
const OWNER_TELEGRAM_ID = 105933015;
const ADMIN_PASSWORD = "299300";
const SUPABASE_URL = "https://tjxuumgwkttfnfgpdkaj.supabase.co";
const SUPABASE_KEY = "sb_publishable_29-OjXwd3B9rGcPGo6IF4Q_1R8-DjQh";
const API_URL = `${SUPABASE_URL}/rest/v1/numbers`;
const TELEGRAM_POST = "https://t.me/grz124/451";
const CATALOG_JSON = `${import.meta.env.BASE_URL}numbers.json`;

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
  const [catalogMeta, setCatalogMeta] = useState({ source: TELEGRAM_POST, updated_at: null });
  const [tab, setTab] = useState("catalog");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все");
  const [selected, setSelected] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminQuery, setAdminQuery] = useState("");
  const secretTap = useRef({ count: 0, timer: null });

  const telegramUserId = Number(TG?.initDataUnsafe?.user?.id || 0);
  const isOwner = telegramUserId === OWNER_TELEGRAM_ID;

  async function readSupabaseRows(full = false) {
    const select = full ? "id,number,price,category,status,created_at" : "id,number,status";
    const res = await fetch(`${API_URL}?select=${select}&order=id.asc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  }

  async function loadNumbers() {
    setLoading(true);
    setError("");
    try {
      let telegramItems = [];
      try {
        const jsonRes = await fetch(`${CATALOG_JSON}?v=${Date.now()}`, { cache: "no-store" });
        if (jsonRes.ok) {
          const payload = await jsonRes.json();
          telegramItems = Array.isArray(payload) ? payload : (payload.items || []);
          setCatalogMeta({ source: payload.source || TELEGRAM_POST, updated_at: payload.updated_at || null });
        }
      } catch (jsonError) {
        console.warn("Telegram JSON unavailable:", jsonError);
      }

      if (telegramItems.length) {
        let statuses = [];
        try { statuses = await readSupabaseRows(false); } catch (statusError) { console.warn("Reservation overlay unavailable:", statusError); }
        const statusMap = new Map();
        for (const row of statuses) {
          const key = normalize(row.number);
          if (!key) continue;
          const state = String(row.status || "available").toLowerCase();
          if (state === "reserved" || state === "sold") statusMap.set(key, state);
        }
        setNumbers(dedupe(telegramItems.map((item, index) => ({
          ...item,
          id: item.id ?? `tg-${index}-${normalize(item.number)}`,
          status: statusMap.get(normalize(item.number)) || "available",
          source: "telegram"
        }))));
      } else {
        const fallback = await readSupabaseRows(true);
        setNumbers(dedupe(fallback));
        setCatalogMeta({ source: "Supabase (резервный источник)", updated_at: null });
      }
    } catch (e) {
      console.error(e);
      setError("Не удалось загрузить каталог. Попробуйте обновить приложение позже.");
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
  const adminFiltered = useMemo(() => {
    const q = normalize(adminQuery);
    return q ? numbers.filter(n => normalize(n.number).includes(q)) : numbers;
  }, [numbers, adminQuery]);
  const availableCount = numbers.filter(n => String(n.status).toLowerCase() === "available").length;

  function ownerSecretTap() {
    if (!isOwner) return;
    clearTimeout(secretTap.current.timer);
    secretTap.current.count += 1;
    if (secretTap.current.count >= 5) {
      secretTap.current.count = 0;
      setAdminOpen(true);
      setAdminUnlocked(false);
      setPassword("");
      setPasswordError("");
      setAdminMessage("");
      TG?.HapticFeedback?.notificationOccurred?.("success");
      return;
    }
    secretTap.current.timer = setTimeout(() => { secretTap.current.count = 0; }, 1800);
  }

  function closeAdmin() {
    setAdminOpen(false);
    setAdminUnlocked(false);
    setPassword("");
    setPasswordError("");
    setAdminMessage("");
    setAdminQuery("");
  }

  function unlockAdmin(e) {
    e?.preventDefault?.();
    if (password === ADMIN_PASSWORD) {
      setAdminUnlocked(true);
      setPasswordError("");
      setPassword("");
      TG?.HapticFeedback?.notificationOccurred?.("success");
    } else {
      setPasswordError("Неверный пароль");
      TG?.HapticFeedback?.notificationOccurred?.("error");
    }
  }

  async function patchStatus(item) {
    if (!isOwner || !adminUnlocked || adminBusy) return;
    const current = String(item.status || "available").toLowerCase();
    const next = current === "reserved" ? "available" : "reserved";
    setAdminBusy(true);
    setAdminMessage("");
    try {
      const filter = encodeURIComponent(item.number);
      const patchRes = await fetch(`${API_URL}?number=eq.${filter}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify({ status: next })
      });
      if (!patchRes.ok) throw new Error(await patchRes.text());
      const patched = await patchRes.json();

      if (!patched.length) {
        const insertRes = await fetch(API_URL, {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal"
          },
          body: JSON.stringify({
            number: item.number,
            price: Number(item.price || 0),
            category: item.category || "Прочее",
            status: next
          })
        });
        if (!insertRes.ok) throw new Error(await insertRes.text());
      }

      setAdminMessage(next === "reserved" ? `${item.number} поставлен в бронь` : `${item.number} снова в наличии`);
      await loadNumbers();
    } catch (e) {
      console.error(e);
      setAdminMessage("Не удалось изменить бронь. Supabase пока не разрешает запись для админ-панели.");
    } finally {
      setAdminBusy(false);
    }
  }

  function contact(item) {
    const text = encodeURIComponent(`Здравствуйте! Интересует номер ${item.number} за ${money(item.price)}`);
    TG?.openTelegramLink?.(`https://t.me/Dremov767?text=${text}`);
  }

  const updatedLabel = catalogMeta.updated_at
    ? new Date(catalogMeta.updated_at).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "ожидает первой синхронизации";

  if (adminOpen && isOwner && !adminUnlocked) {
    return (
      <div className="app-shell"><main className="content admin-content admin-login-wrap">
        <div className="admin-login-card">
          <button className="admin-login-close" onClick={closeAdmin}>×</button>
          <div className="eyebrow">GRZ124 · PRIVATE</div>
          <h1>Вход в админ-панель</h1>
          <p>Введите пароль для управления бронями.</p>
          <form onSubmit={unlockAdmin}>
            <input className="admin-input admin-password-input" type="password" inputMode="numeric" autoFocus maxLength={12} value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" />
            {passwordError && <div className="admin-error">{passwordError}</div>}
            <button className="admin-primary-btn" type="submit">Войти</button>
          </form>
        </div>
      </main></div>
    );
  }

  if (adminOpen && isOwner && adminUnlocked) {
    return (
      <div className="app-shell"><main className="content admin-content">
        <div className="admin-head">
          <div><div className="eyebrow">GRZ124 · БРОНИ</div><h1>Админ-панель</h1></div>
          <button className="round-btn" onClick={closeAdmin}>×</button>
        </div>
        <div className="admin-note">Номера и цены берутся из Telegram-поста раз в сутки. Здесь меняется только бронь.</div>
        {adminMessage && <div className="admin-message">{adminMessage}</div>}
        <input className="admin-input" value={adminQuery} onChange={e => setAdminQuery(e.target.value)} placeholder="Найти номер для брони..." />
        <div className="admin-list">
          <div className="admin-list-title">Номеров: {adminFiltered.length}</div>
          {adminFiltered.map(item => (
            <div className="admin-number-row" key={normalize(item.number)}>
              <div className="admin-number-main">
                <strong>{item.number}</strong><span>{money(item.price)}</span><small>{item.category} · {statusLabel(String(item.status || "available").toLowerCase())}</small>
              </div>
              <div className="admin-actions">
                <button disabled={adminBusy} onClick={() => patchStatus(item)}>{item.status === "reserved" ? "Освободить" : "В бронь"}</button>
              </div>
            </div>
          ))}
        </div>
      </main></div>
    );
  }

  return (
    <div className="app-shell">
      <main className="content">
        <header className="topbar">
          <button className="brand" onClick={ownerSecretTap} aria-label="GRZ124"><span className="brand-dot" /><span><b>GRZ124</b><small>Красноярский край</small></span></button>
          <button className="round-btn" onClick={loadNumbers}>↻</button>
        </header>

        {tab === "catalog" && <>
          <section className="hero-compact">
            <div className="eyebrow">КАТАЛОГ ИЗ TELEGRAM</div>
            <h1>Красивые номера <span>24</span></h1>
            <p>{loading ? "Обновляем каталог..." : `${numbers.length} позиций · ${availableCount} в наличии`}</p>
            <small className="muted">Синхронизация: {updatedLabel}</small>
          </section>
          <section className="catalog-tools">
            <label className="searchbar"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Найти номер: 777, АА, 124..." />{query && <button onClick={() => setQuery("")}>×</button>}</label>
            <div className="chips">{categories.map(c => <button key={c} className={category === c ? "active" : ""} onClick={() => setCategory(c)}>{c}</button>)}</div>
          </section>
          {loading ? <div className="state-card">Загружаем номера…</div> : error ? <div className="state-card error">{error}</div> : <>
            <div className="results-line"><span>Найдено</span><b>{filtered.length}</b></div>
            <section className="number-list">
              {filtered.map(item => {
                const state = String(item.status || "available").toLowerCase();
                return <article className="number-card" key={normalize(item.number)}>
                  <div className="card-status-row"><span className={`status-pill ${state}`}>{statusLabel(state)}</span><span className="category-label">{item.category || "Прочее"}</span></div>
                  <Plate number={item.number} />
                  <div className="card-bottom"><div><small>Цена</small><strong>{money(item.price)}</strong></div><button onClick={() => setSelected(item)}>Подробнее</button></div>
                </article>;
              })}
              {!filtered.length && <div className="state-card">По вашему запросу ничего не найдено.</div>}
            </section>
          </>}
        </>}

        {tab === "profile" && <section className="profile-page">
          <div className="profile-logo">24</div><div className="eyebrow">GRZ124</div><h1>Красивые номера</h1>
          <p>Список автоматически синхронизируется с Telegram-постом один раз в сутки.</p>
          <div className="profile-actions">
            <button onClick={() => TG?.openTelegramLink?.(TELEGRAM_POST)}>Открыть исходный пост <span>›</span></button>
            <button onClick={() => TG?.openTelegramLink?.("https://t.me/Dremov767")}>Написать менеджеру <span>›</span></button>
            <button onClick={() => setTab("catalog")}>Вернуться в каталог <span>›</span></button>
          </div>
        </section>}
      </main>

      <nav className="bottom-nav">
        <button className={tab === "catalog" ? "active" : ""} onClick={() => setTab("catalog")}><span>▦</span><small>Каталог</small></button>
        <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}><span>◎</span><small>Контакты</small></button>
      </nav>

      {selected && <div className="modal-overlay" onClick={() => setSelected(null)}><div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setSelected(null)}>×</button>
        <div className="eyebrow">{selected.category || "Прочее"}</div><Plate number={selected.number} large />
        <div className="modal-price">{money(selected.price)}</div>
        <div className="modal-info"><span>Статус</span><b>{statusLabel(String(selected.status || "available").toLowerCase())}</b></div>
        <button className="primary-btn" disabled={String(selected.status).toLowerCase() !== "available"} onClick={() => contact(selected)}>{String(selected.status).toLowerCase() === "available" ? "Оставить заявку" : statusLabel(String(selected.status).toLowerCase())}</button>
      </div></div>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
