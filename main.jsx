import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

const SUPABASE_URL = "https://tjxuumgwkttfnfgpdkaj.supabase.co";
const SUPABASE_KEY = "sb_publishable_29-OjXwd3B9rGcPGo6IF4Q_1R8-DjQh";

const API_URL = `${SUPABASE_URL}/rest/v1/numbers`;

function formatPrice(price) {
  return `${Number(price || 0).toLocaleString("ru-RU")} ₽`;
}

function getLevel(item) {
  const price = Number(item.price || 0);

  if (price >= 400000) return "VIP";
  if (price >= 200000) return "Premium";

  return "";
}

function getCategoryName(category) {
  const categories = {
    "Первая сотня": "Первая сотня",
    "Одинаковые цифры": "Одинаковые цифры",
    "Комплекты": "Комплекты",
    "Сотни": "Сотни",
    "Буквы": "Буквы",
    "124/124;224/224": "124 / 224",
    "Зеркала": "Зеркала",
    "Прочее": "Прочее",
    "Прицеп": "Прицеп",
    "Мото": "Мото",
  };

  return categories[category] || category || "Прочее";
}

function isReserved(status) {
  return (
    status === "reserved" ||
    status === "bron" ||
    status === "бронь"
  );
}

function Plate({ number }) {
  const value = String(number || "").trim();

  // Обычный автомобильный номер:
  // А777АА24
  // Если это прицеп/мото — оставляем как есть.
  const match = value.match(/^(.+?)(\d{2,3})$/);

  if (!match) {
    return <div className="plate">{value}</div>;
  }

  const lettersAndDigits = match[1];
  const region = match[2];

  return (
    <div className="plate">
      <div className="plate-main">{lettersAndDigits}</div>

      <div className="plate-region">
        <strong>{region}</strong>
        <span>RUS</span>
      </div>
    </div>
  );
}

function NumberCard({ item, favorite, onFavorite, onDetails }) {
  const level = getLevel(item);
  const reserved = isReserved(item.status);

  return (
    <div className={`number-card ${reserved ? "reserved-card" : ""}`}>
      <div className="card-top">
        <Plate number={item.number} />

        <button
          className={`favorite ${favorite ? "active" : ""}`}
          onClick={() => onFavorite(item.id)}
          aria-label="Добавить в избранное"
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="card-middle">
        <div className="card-info">
          {level && (
            <div className={`level ${level.toLowerCase()}`}>
              {level}
            </div>
          )}

          {reserved && (
            <div className="level reserved">
              Бронь
            </div>
          )}

          <div className="location">
            Красноярский край · регион 24
          </div>

          <div className="category">
            {getCategoryName(item.category)}
          </div>
        </div>

        <div className="price">
          {formatPrice(item.price)}
        </div>
      </div>

      <button
        className="details-button"
        onClick={() => onDetails(item)}
      >
        Подробнее
      </button>
    </div>
  );
}

function App() {
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("grz124_favorites")) || [];
    } catch {
      return [];
    }
  });

  const [selectedNumber, setSelectedNumber] = useState(null);

  useEffect(() => {
    loadNumbers();
  }, []);

  async function loadNumbers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}?select=*&order=id.asc`,
        {
          method: "GET",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Ошибка загрузки номеров");
      }

      const data = await response.json();

      setNumbers(data || []);
    } catch (err) {
      console.error(err);
      setError(
        "Не удалось загрузить номера. Проверь подключение к Supabase."
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleFavorite(id) {
    setFavorites((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];

      localStorage.setItem(
        "grz124_favorites",
        JSON.stringify(next)
      );

      return next;
    });
  }

  const filteredNumbers = useMemo(() => {
    let result = [...numbers];

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((item) => {
        const number = String(item.number || "").toLowerCase();
        const category = String(item.category || "").toLowerCase();

        return (
          number.includes(query) ||
          category.includes(query)
        );
      });
    }

    if (filter === "premium") {
      result = result.filter(
        (item) => getLevel(item) === "Premium"
      );
    }

    if (filter === "vip") {
      result = result.filter(
        (item) => getLevel(item) === "VIP"
      );
    }

    if (filter === "favorites") {
      result = result.filter((item) =>
        favorites.includes(item.id)
      );
    }

    return result;
  }, [numbers, search, filter, favorites]);

  return (
    <div className="app">
      <header className="header">
        <div>
          <div className="region-title">
            КРАСНОЯРСКИЙ КРАЙ
          </div>

          <h1>
            Красивые номера <span>24</span>
          </h1>
        </div>

        <button className="header-button">
          ◉
        </button>
      </header>

      <main>
        <section className="catalog-header">
          <div>
            <h2>Каталог номеров</h2>

            <div className="total">
              {loading
                ? "Загрузка..."
                : `${numbers.length} номеров`}
            </div>
          </div>

          <button className="view-button">
            ▦
          </button>
        </section>

        <div className="search-box">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Поиск: 777, 001..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}
        </div>

        <div className="filters">
          <button
            className={filter === "all" ? "selected" : ""}
            onClick={() => setFilter("all")}
          >
            Все
          </button>

          <button
            className={filter === "premium" ? "selected" : ""}
            onClick={() => setFilter("premium")}
          >
            Premium
          </button>

          <button
            className={filter === "vip" ? "selected" : ""}
            onClick={() => setFilter("vip")}
          >
            VIP
          </button>
        </div>

        {error && (
          <div className="error-box">
            <strong>Ошибка</strong>
            <p>{error}</p>

            <button onClick={loadNumbers}>
              Повторить
            </button>
          </div>
        )}

        {loading && !error && (
          <div className="loading">
            <div className="loader"></div>
            <p>Загружаем номера...</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="catalog-count">
              Найдено: <strong>{filteredNumbers.length}</strong>
            </div>

            <div className="numbers-list">
              {filteredNumbers.map((item) => (
                <NumberCard
                  key={item.id}
                  item={item}
                  favorite={favorites.includes(item.id)}
                  onFavorite={toggleFavorite}
                  onDetails={setSelectedNumber}
                />
              ))}
            </div>

            {filteredNumbers.length === 0 && (
              <div className="empty">
                <div className="empty-icon">⌕</div>

                <h3>Номеров не найдено</h3>

                <p>
                  Попробуй изменить поисковый запрос
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <nav className="bottom-nav">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          <span>⌂</span>
          <small>Главная</small>
        </button>

        <button
          className={filter !== "favorites" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          <span>▦</span>
          <small>Каталог</small>
        </button>

        <button
          className={filter === "favorites" ? "active" : ""}
          onClick={() => setFilter("favorites")}
        >
          <span>♡</span>
          <small>Избранное</small>
        </button>

        <button>
          <span>□</span>
          <small>Заявки</small>
        </button>

        <button>
          <span>♙</span>
          <small>Профиль</small>
        </button>
      </nav>

      {selectedNumber && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedNumber(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedNumber(null)}
            >
              ×
            </button>

            <div className="modal-title">
              Номер
            </div>

            <Plate number={selectedNumber.number} />

            <div className="modal-price">
              {formatPrice(selectedNumber.price)}
            </div>

            <div className="modal-category">
              {getCategoryName(selectedNumber.category)}
            </div>

            <div className="modal-location">
              Красноярский край · регион 24
            </div>

            {isReserved(selectedNumber.status) && (
              <div className="modal-reserved">
                Номер забронирован
              </div>
            )}

            <a
              className="contact-button"
              href="https://t.me/Dremov767"
              target="_blank"
              rel="noreferrer"
            >
              Узнать о номере
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

const style = document.createElement("style");

style.textContent = `
* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
  background: #08080b;
  color: #f5f5f7;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Arial,
    sans-serif;
}

body {
  min-height: 100vh;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

.app {
  min-height: 100vh;
  max-width: 980px;
  margin: 0 auto;
  background:
    radial-gradient(
      circle at 70% 25%,
      rgba(88, 49, 110, 0.18),
      transparent 35%
    ),
    #0b0b0f;
  padding-bottom: 100px;
}

.header {
  min-height: 122px;
  padding: 28px 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0a0a0d;
}

.region-title {
  color: #92919b;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 5px;
  margin-bottom: 6px;
}

h1 {
  margin: 0;
  font-size: 36px;
  line-height: 1;
  font-weight: 850;
  letter-spacing: -1.5px;
}

h1 span {
  color: #ffc400;
}

.header-button,
.view-button {
  width: 74px;
  height: 74px;
  border-radius: 22px;
  background: #121217;
  border: 1px solid #33333c;
  color: #f3f3f5;
  font-size: 28px;
}

main {
  padding: 28px 32px 40px;
  background:
    radial-gradient(
      circle at 80% 0%,
      rgba(104, 61, 124, 0.12),
      transparent 45%
    ),
    #15131a;
}

.catalog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.catalog-header h2 {
  margin: 0;
  font-size: 32px;
  letter-spacing: -1px;
}

.total {
  color: #85848e;
  font-size: 14px;
  margin-top: 5px;
}

.view-button {
  width: 72px;
  height: 72px;
}

.search-box {
  height: 82px;
  border-radius: 26px;
  border: 1px solid #383840;
  background: #111116;
  display: flex;
  align-items: center;
  padding: 0 24px;
  margin-top: 14px;
}

.search-icon {
  font-size: 30px;
  margin-right: 14px;
  color: #f2f2f3;
}

.search-box input {
  flex: 1;
  border: 0;
  outline: none;
  color: #fff;
  background: transparent;
  font-size: 24px;
  min-width: 0;
}

.search-box input::placeholder {
  color: #9998a1;
}

.clear-search {
  border: 0;
  background: transparent;
  color: #898890;
  font-size: 28px;
}

.filters {
  display: flex;
  gap: 14px;
  margin: 20px 0 28px;
}

.filters button {
  padding: 13px 28px;
  border-radius: 30px;
  border: 1px solid #363640;
  background: #111116;
  color: #b9b8c1;
  font-size: 20px;
  font-weight: 700;
}

.filters button.selected {
  color: #ffc400;
  border-color: #aa8200;
}

.catalog-count {
  color: #777681;
  margin-bottom: 12px;
}

.catalog-count strong {
  color: #d8d7dc;
}

.numbers-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.number-card {
  position: relative;
  padding: 28px;
  border-radius: 30px;
  border: 1px solid #34343d;
  background:
    linear-gradient(
      145deg,
      rgba(30, 30, 37, 0.95),
      rgba(15, 15, 19, 0.98)
    );
  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.18);
}

.reserved-card {
  opacity: 0.72;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.plate {
  display: flex;
  align-items: stretch;
  width: fit-content;
  min-height: 68px;
  background: #f3f3f1;
  color: #111;
  border: 4px solid #333;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,.3);
  font-weight: 900;
}

.plate-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 15px;
  font-size: 34px;
  letter-spacing: 0;
  white-space: nowrap;
}

.plate-region {
  min-width: 62px;
  padding: 5px 7px 4px;
  border-left: 3px solid #444;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.plate-region strong {
  font-size: 26px;
}

.plate-region span {
  font-size: 10px;
  margin-top: 5px;
}

.favorite {
  border: 0;
  background: transparent;
  color: #77777e;
  font-size: 55px;
  line-height: 1;
  padding: 0;
}

.favorite.active {
  color: #ffca00;
}

.card-middle {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-top: 24px;
}

.card-info {
  min-width: 0;
}

.level {
  width: fit-content;
  padding: 8px 16px;
  border-radius: 13px;
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 9px;
}

.level.premium {
  color: #fff;
  background: #7836dc;
}

.level.vip {
  color: #fff;
  background: #c99800;
}

.level.reserved {
  color: #fff;
  background: #7b3b3b;
}

.location {
  color: #8a8993;
  font-size: 20px;
}

.category {
  margin-top: 5px;
  color: #65646e;
  font-size: 14px;
}

.price {
  font-size: 31px;
  font-weight: 850;
  white-space: nowrap;
}

.details-button {
  width: 100%;
  margin-top: 22px;
  height: 62px;
  border-radius: 19px;
  border: 1px solid #41414b;
  background: #19191f;
  color: #f4f4f6;
  font-size: 21px;
  font-weight: 750;
}

.details-button:active {
  transform: scale(.99);
}

.loading {
  padding: 80px 20px;
  text-align: center;
  color: #8d8c96;
}

.loader {
  width: 42px;
  height: 42px;
  border: 4px solid #33333a;
  border-top-color: #ffc400;
  border-radius: 50%;
  animation: spin .8s linear infinite;
  margin: 0 auto 18px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-box {
  padding: 25px;
  border-radius: 20px;
  background: #281717;
  border: 1px solid #6b2929;
  color: #ff9a9a;
}

.error-box p {
  color: #c6a0a0;
}

.error-box button {
  padding: 10px 18px;
  border: 0;
  border-radius: 12px;
  background: #ffc400;
  color: #111;
  font-weight: 800;
}

.empty {
  text-align: center;
  padding: 80px 20px;
  color: #85848e;
}

.empty-icon {
  font-size: 50px;
}

.empty h3 {
  color: #eee;
  font-size: 24px;
}

.bottom-nav {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(980px, 100%);
  height: 90px;
  background: rgba(9, 9, 12, .97);
  border-top: 1px solid #292930;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  z-index: 20;
}

.bottom-nav button {
  border: 0;
  background: transparent;
  color: #777780;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.bottom-nav button span {
  font-size: 27px;
}

.bottom-nav button small {
  font-size: 13px;
}

.bottom-nav button.active {
  color: #ffc400;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0,0,0,.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal {
  position: relative;
  width: min(520px, 100%);
  border-radius: 28px;
  border: 1px solid #3b3b44;
  background: #15151a;
  padding: 32px;
  box-shadow: 0 30px 100px rgba(0,0,0,.6);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 18px;
  border: 0;
  background: transparent;
  color: #aaa;
  font-size: 34px;
}

.modal-title {
  color: #9998a1;
  margin-bottom: 20px;
  font-size: 16px;
}

.modal-price {
  margin-top: 25px;
  font-size: 34px;
  font-weight: 850;
}

.modal-category,
.modal-location {
  margin-top: 8px;
  color: #85848e;
}

.modal-reserved {
  margin-top: 18px;
  padding: 12px;
  border-radius: 12px;
  background: #542727;
  color: #ffb2b2;
  text-align: center;
  font-weight: 700;
}

.contact-button {
  display: block;
  text-align: center;
  margin-top: 25px;
  padding: 16px;
  border-radius: 16px;
  background: #ffc400;
  color: #111;
  text-decoration: none;
  font-weight: 850;
  font-size: 18px;
}

@media (max-width: 700px) {
  .header {
    padding: 24px 20px;
  }

  .region-title {
    font-size: 13px;
    letter-spacing: 3px;
  }

  h1 {
    font-size: 28px;
  }

  .header-button {
    width: 60px;
    height: 60px;
  }

  main {
    padding: 22px 16px 30px;
  }

  .catalog-header h2 {
    font-size: 27px;
  }

  .view-button {
    width: 58px;
    height: 58px;
  }

  .search-box {
    height: 68px;
    padding: 0 18px;
  }

  .search-box input {
    font-size: 19px;
  }

  .filters {
    gap: 8px;
    overflow-x: auto;
  }

  .filters button {
    font-size: 16px;
    padding: 11px 20px;
    white-space: nowrap;
  }

  .number-card {
    padding: 20px;
    border-radius: 24px;
  }

  .plate {
    min-height: 55px;
  }

  .plate-main {
    font-size: 26px;
    padding: 0 10px;
  }

  .plate-region {
    min-width: 50px;
  }

  .plate-region strong {
    font-size: 21px;
  }

  .card-middle {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .price {
    font-size: 26px;
  }

  .location {
    font-size: 17px;
  }

  .favorite {
    font-size: 45px;
  }

  .bottom-nav {
    height: 78px;
  }

  .bottom-nav button span {
    font-size: 22px;
  }
}
`;

document.head.appendChild(style);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
