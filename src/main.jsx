import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const TG = window.Telegram?.WebApp;

const NUMBERS = [
  { id: 1, plate: "А777АА", region: "24", category: "Premium", price: 2500000, tags: ["777", "три одинаковые"] },
  { id: 2, plate: "М001ММ", region: "24", category: "VIP", price: 1200000, tags: ["001", "зеркальный"] },
  { id: 3, plate: "В555ВВ", region: "24", category: "VIP", price: 950000, tags: ["555", "три одинаковые"] },
  { id: 4, plate: "К007КК", region: "24", category: "Premium", price: 1800000, tags: ["007", "зеркальный"] },
  { id: 5, plate: "О100ОО", region: "24", category: "VIP", price: 850000, tags: ["100", "круглое число"] },
  { id: 6, plate: "Е888ЕЕ", region: "24", category: "Premium", price: 2100000, tags: ["888", "три одинаковые"] },
  { id: 7, plate: "Н101НН", region: "24", category: "VIP", price: 720000, tags: ["101", "зеркальный"] },
  { id: 8, plate: "Т777ТТ", region: "24", category: "Premium", price: 2300000, tags: ["777", "три одинаковые"] }
];

const money = (n) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";

function Plate({ item, large = false }) {
  return (
    <div className={"plate " + (large ? "plate-large" : "")}>
      <span className="plate-main">{item.plate}</span>
      <span className="plate-region">{item.region}<small> RUS</small></span>
    </div>
  );
}

function App() {
  const [tab, setTab] = useState("home");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все");
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("favorites24") || "[]"));
  const [requests, setRequests] = useState(() => JSON.parse(localStorage.getItem("requests24") || "[]"));
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (TG) {
      TG.ready();
      TG.expand();
      try {
        TG.setHeaderColor("#0b0b0e");
        TG.setBackgroundColor("#0b0b0e");
      } catch {}
    }
  }, []);

  useEffect(() => localStorage.setItem("favorites24", JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem("requests24", JSON.stringify(requests)), [requests]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().replaceAll(" ", "");
    return NUMBERS.filter((n) => {
      const matchQuery = !q || n.plate.toLowerCase().replaceAll(" ", "").includes(q) || n.tags.some(t => t.includes(q));
      const matchCat = category === "Все" || n.category === category;
      return matchQuery && matchCat;
    });
  }, [query, category]);

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const addRequest = (item) => {
    const exists = requests.some(r => r.numberId === item.id && r.status !== "Завершена");
    if (!exists) {
      setRequests(prev => [{ id: Date.now(), numberId: item.id, createdAt: new Date().toLocaleDateString("ru-RU"), status: "Новая" }, ...prev]);
    }
    setSelected(null);
    setToast("Заявка отправлена");
    setTimeout(() => setToast(""), 2200);
    if (TG) {
      try { TG.HapticFeedback.notificationOccurred("success"); } catch {}
    }
  };

  const openSupport = () => {
    setToast("Свяжитесь с менеджером через бота");
    setTimeout(() => setToast(""), 2200);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="eyebrow">КРАСНОЯРСКИЙ КРАЙ</div>
          <h1>Красивые номера <b>24</b></h1>
        </div>
        <button className="icon-btn" onClick={openSupport}>◉</button>
      </header>

      {tab === "home" && (
        <main className="page">
          <section className="hero">
            <div className="hero-glow" />
            <div className="eyebrow">PREMIUM АВТОНОМЕРА</div>
            <h2>Подбери свой<br/>красивый номер</h2>
            <p>Каталог комбинаций для Красноярского края</p>
            <button className="primary" onClick={() => setTab("catalog")}>Найти номер <span>⌕</span></button>
          </section>

          <section className="section">
            <div className="section-title"><h3>Популярные комбинации</h3><button onClick={() => setTab("catalog")}>Все →</button></div>
            <div className="chips">
              {["777","001","555","100","888","007"].map(x => <button key={x} onClick={() => {setQuery(x); setTab("catalog")}}>{x}</button>)}
            </div>
          </section>

          <section className="category-grid">
            {[
              ["💎","Premium","Эксклюзивные номера","Premium"],
              ["⭐","VIP","Очень красивые сочетания","VIP"],
              ["🔥","Популярные","Хиты каталога","Все"],
              ["🆕","Новинки","Недавно добавленные","Все"]
            ].map(([icon,title,sub,cat]) => (
              <button className="category-card" key={title} onClick={() => {setCategory(cat); setTab("catalog")}}>
                <span className="category-icon">{icon}</span><strong>{title}</strong><small>{sub}</small>
              </button>
            ))}
          </section>

          <div className="trust">
            <span>⚡ Быстрый поиск</span><span>🔒 Надёжно</span><span>📍 Регион 24</span>
          </div>
        </main>
      )}

      {tab === "catalog" && (
        <main className="page">
          <div className="page-title"><h2>Каталог номеров</h2><button className="filter-btn">☷</button></div>
          <div className="search"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск: 777, 001..." /><button onClick={() => setQuery("")}>×</button></div>
          <div className="chips">
            {["Все","Premium","VIP"].map(c => <button className={category === c ? "active" : ""} key={c} onClick={() => setCategory(c)}>{c}</button>)}
          </div>
          <div className="list">
            {filtered.map(item => (
              <article className="number-card" key={item.id}>
                <div className="card-top">
                  <Plate item={item}/>
                  <button className={"heart " + (favorites.includes(item.id) ? "liked" : "")} onClick={() => toggleFavorite(item.id)}>{favorites.includes(item.id) ? "♥" : "♡"}</button>
                </div>
                <div className="meta"><span className={"badge " + item.category.toLowerCase()}>{item.category}</span><strong>{money(item.price)}</strong></div>
                <div className="muted">Красноярский край · регион 24</div>
                <button className="secondary" onClick={() => setSelected(item)}>Подробнее</button>
              </article>
            ))}
            {!filtered.length && <div className="empty">Ничего не найдено. Попробуйте другую комбинацию.</div>}
          </div>
        </main>
      )}

      {tab === "favorites" && (
        <main className="page">
          <div className="page-title"><h2>Избранное</h2></div>
          <div className="list">
            {NUMBERS.filter(n => favorites.includes(n.id)).map(item => (
              <article className="number-card compact" key={item.id}>
                <div className="card-top"><Plate item={item}/><button className="heart liked" onClick={() => toggleFavorite(item.id)}>♥</button></div>
                <div className="meta"><span className={"badge " + item.category.toLowerCase()}>{item.category}</span><strong>{money(item.price)}</strong></div>
              </article>
            ))}
            {!favorites.length && <div className="empty">Добавляйте номера в избранное, чтобы быстро вернуться к ним.</div>}
          </div>
        </main>
      )}

      {tab === "requests" && (
        <main className="page">
          <div className="page-title"><h2>Мои заявки</h2></div>
          <div className="list">
            {requests.map(r => {
              const item = NUMBERS.find(n => n.id === r.numberId);
              return <article className="request-card" key={r.id}>
                <Plate item={item}/>
                <div><span className="status">{r.status}</span><div className="muted">{r.createdAt}</div><strong>{money(item.price)}</strong></div>
              </article>
            })}
            {!requests.length && <div className="empty">Здесь появятся ваши заявки на номера.</div>}
          </div>
        </main>
      )}

      {tab === "profile" && (
        <main className="page">
          <div className="profile">
            <div className="avatar">24</div>
            <h2>Мой профиль</h2>
            <p className="muted">Telegram-пользователь</p>
          </div>
          <div className="menu-card">
            <button onClick={() => setTab("requests")}>📋 Мои заявки <span>›</span></button>
            <button onClick={() => setTab("favorites")}>♥ Избранное <span>›</span></button>
            <button onClick={openSupport}>💬 Поддержка <span>›</span></button>
            <button>ℹ️ О приложении <span>›</span></button>
          </div>
        </main>
      )}

      <nav className="bottom-nav">
        {[
          ["home","⌂","Главная"],
          ["catalog","▦","Каталог"],
          ["favorites","♡","Избранное"],
          ["requests","▣","Заявки"],
          ["profile","♙","Профиль"]
        ].map(([id,icon,label]) => (
          <button className={tab === id ? "nav-active" : ""} key={id} onClick={() => setTab(id)}>
            <span>{icon}</span><small>{label}</small>
          </button>
        ))}
      </nav>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            <Plate item={selected} large/>
            <span className={"badge " + selected.category.toLowerCase()}>{selected.category}</span>
            <div className="modal-price">{money(selected.price)}</div>
            <div className="detail-list">
              <div><span>Регион</span><strong>24 · Красноярский край</strong></div>
              <div><span>Комбинация</span><strong>{selected.tags.join(", ")}</strong></div>
              <div><span>Статус</span><strong className="available">Доступен</strong></div>
            </div>
            <p className="notice">Демонстрационные данные. Перед реальным запуском нужно подключить источник актуальных номеров и юридически корректную схему оформления.</p>
            <button className="primary full" onClick={() => addRequest(selected)}>Оставить заявку</button>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
