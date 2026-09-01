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
  "Мото"
];

function reorderCategories() {
  const chips = document.querySelector('.catalog-tools .chips');
  if (!chips) return;
  const buttons = [...chips.querySelectorAll('button')];
  if (!buttons.length) return;

  const rank = new Map(CATEGORY_ORDER.map((name, index) => [name, index]));
  buttons
    .sort((a, b) => {
      const ai = rank.has(a.textContent.trim()) ? rank.get(a.textContent.trim()) : 999;
      const bi = rank.has(b.textContent.trim()) ? rank.get(b.textContent.trim()) : 999;
      return ai - bi;
    })
    .forEach(button => chips.appendChild(button));
}

function polishBrand() {
  const brandSmall = document.querySelector('.brand small');
  if (brandSmall && brandSmall.textContent !== 'Премиальные государственные номера') {
    brandSmall.textContent = 'Премиальные государственные номера';
  }

  const heroTitle = document.querySelector('.hero-compact h1');
  if (heroTitle && heroTitle.textContent.trim() !== 'GRZ124') {
    heroTitle.textContent = 'GRZ124';
  }

  const heroEyebrow = document.querySelector('.hero-compact .eyebrow');
  if (heroEyebrow && heroEyebrow.textContent !== 'ПРЕМИАЛЬНЫЕ ГОСУДАРСТВЕННЫЕ НОМЕРА') {
    heroEyebrow.textContent = 'ПРЕМИАЛЬНЫЕ ГОСУДАРСТВЕННЫЕ НОМЕРА';
  }
}

let queued = false;
function refresh() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    reorderCategories();
    polishBrand();
  });
}

new MutationObserver(refresh).observe(document.documentElement, { childList: true, subtree: true });
refresh();
