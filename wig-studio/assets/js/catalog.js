import { mount, productCardHTML, bindFavDelegation } from './app.js';
import {
  CATEGORIES, PRODUCTS, STYLES, LENGTHS, MATERIALS, SIZES, COLOR_SWATCHES, findColor,
} from './data.js';

mount({ activeKey: 'shop' });

/* 构建筛选 UI */
const state = {
  q: '',
  category: new Set(),
  style: new Set(),
  length: new Set(),
  material: new Set(),
  size: new Set(),
  color: new Set(),
  priceMax: 3000,
  sort: 'pop',
};

// 预设分类参数（URL）
const params = new URLSearchParams(location.search);
if (params.get('c')) state.category.add(params.get('c'));
if (params.get('q')) state.q = params.get('q');

/* 渲染筛选 Chip 组 */
function renderChipGroup(selector, items) {
  const host = document.querySelector(`[data-filter="${selector}"]`);
  host.innerHTML = items.map((it) => `
    <button class="chip ${state[selector].has(it.id) ? 'active' : ''}" data-val="${it.id}">${it.name}</button>
  `).join('');
  host.addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    const v = b.dataset.val;
    if (state[selector].has(v)) state[selector].delete(v);
    else state[selector].add(v);
    b.classList.toggle('active');
    render();
  });
}
renderChipGroup('category', CATEGORIES);
renderChipGroup('style', STYLES);
renderChipGroup('length', LENGTHS);
renderChipGroup('material', MATERIALS);
renderChipGroup('size', SIZES.map((s) => ({ id: s.id, name: s.id })));

/* 颜色圆点筛选 */
const colorHost = document.getElementById('color-filters');
colorHost.innerHTML = COLOR_SWATCHES.map((c) => {
  const bg = c.hex.startsWith('linear') ? c.hex : c.hex;
  return `<span class="color-dot ${state.color.has(c.id)?'selected':''}" title="${c.name}" data-color="${c.id}" style="background:${bg}"></span>`;
}).join('');
colorHost.addEventListener('click', (e) => {
  const d = e.target.closest('[data-color]');
  if (!d) return;
  const v = d.dataset.color;
  if (state.color.has(v)) state.color.delete(v);
  else state.color.add(v);
  d.classList.toggle('selected');
  render();
});

/* 搜索 & 价格 */
const qEl = document.getElementById('q');
qEl.value = state.q;
qEl.addEventListener('input', (e) => { state.q = e.target.value.trim().toLowerCase(); render(); });

const priceEl = document.getElementById('price-max');
const priceLabel = document.getElementById('price-label');
priceEl.addEventListener('input', (e) => {
  state.priceMax = Number(e.target.value);
  priceLabel.textContent = state.priceMax >= 3000 ? '不限' : `≤ ¥${state.priceMax}`;
  render();
});

/* 排序 */
document.getElementById('sort').addEventListener('change', (e) => {
  state.sort = e.target.value; render();
});

/* 重置 */
document.getElementById('reset').addEventListener('click', () => {
  Object.keys(state).forEach((k) => {
    if (state[k] instanceof Set) state[k].clear();
  });
  state.q = ''; state.priceMax = 3000; state.sort = 'pop';
  qEl.value = ''; priceEl.value = 3000; priceLabel.textContent = '不限';
  document.getElementById('sort').value = 'pop';
  document.querySelectorAll('.chip.active').forEach((el) => el.classList.remove('active'));
  document.querySelectorAll('.color-dot.selected').forEach((el) => el.classList.remove('selected'));
  render();
});

/* 若 URL 指定 category，刷新标题 */
if (params.get('c')) {
  const cat = CATEGORIES.find((c) => c.id === params.get('c'));
  if (cat) {
    document.getElementById('cat-title').textContent = cat.name;
    document.getElementById('cat-desc').textContent = cat.desc;
  }
}

function matches(p) {
  if (state.category.size && !state.category.has(p.category)) return false;
  if (state.style.size && !state.style.has(p.style)) return false;
  if (state.length.size && !state.length.has(p.length)) return false;
  if (state.material.size && !state.material.has(p.material)) return false;
  if (state.size.size && !p.headSizes.some((s) => state.size.has(s))) return false;
  if (state.color.size && !p.colors.some((c) => state.color.has(c))) return false;
  if (p.price > state.priceMax) return false;
  if (state.q) {
    const hay = [p.name, p.tagline, (p.badges||[]).join(' '), p.description, ...p.colors.map((cid) => findColor(cid)?.name||'')].join(' ').toLowerCase();
    if (!hay.includes(state.q)) return false;
  }
  return true;
}

function sort(list) {
  const copy = [...list];
  switch (state.sort) {
    case 'price-asc':  return copy.sort((a,b) => a.price - b.price);
    case 'price-desc': return copy.sort((a,b) => b.price - a.price);
    case 'rating':     return copy.sort((a,b) => b.rating - a.rating);
    case 'new':        return copy.reverse();
    default:           return copy.sort((a,b) => b.reviews - a.reviews);
  }
}

function render() {
  const list = sort(PRODUCTS.filter(matches));
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');
  document.getElementById('count').textContent = `共 ${list.length} 款`;
  if (list.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
    grid.innerHTML = list.map((p) => productCardHTML(p, { fromPages: true })).join('');
  }
}

bindFavDelegation();
render();
