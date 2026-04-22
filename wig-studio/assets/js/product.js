import { mount, productCardHTML, bindFavDelegation, cart, wish, formatPrice, recent, iconHeart, iconCheck } from './app.js';
import { findProduct, findColor, findCategory, findMaterial, findLength, findStyle, PRODUCTS, SIZES } from './data.js';
import { WigViewer3D } from './viewer3d.js';

mount({ activeKey: 'shop' });

const id = new URLSearchParams(location.search).get('id') || PRODUCTS[0].id;
const p = findProduct(id) || PRODUCTS[0];

recent.push(p.id);

/* ---- 面包屑 ---- */
document.getElementById('crumb-name').textContent = p.name;
document.title = `${p.name} · LUMIÈRE WIGS`;

/* ---- 右侧信息 ---- */
const cat = findCategory(p.category);
const mat = findMaterial(p.material);
const length = findLength(p.length);
const style = findStyle(p.style);
const defCol = findColor(p.defaultColor);

let currentColor = p.defaultColor;
let currentSize = p.headSizes[0];

function infoHTML() {
  const col = findColor(currentColor);
  const off = p.originalPrice ? `
    <span class="original">${formatPrice(p.originalPrice)}</span>
    <span class="off">- ${Math.round((1 - p.price / p.originalPrice) * 100)}%</span>
  ` : '';
  const colors = p.colors.map((cid) => {
    const c = findColor(cid);
    const bg = c.hex.startsWith('linear') ? c.hex : c.hex;
    return `<button class="color-dot ${cid === currentColor ? 'selected' : ''}" title="${c.name}" data-col="${cid}" style="background:${bg}"></button>`;
  }).join('');
  const sizes = p.headSizes.map((s) => `
    <button class="chip ${s === currentSize ? 'active' : ''}" data-size="${s}">${s}</button>
  `).join('');
  const badges = (p.badges || []).map((b, i) => {
    const cls = ['rose','violet','champagne','ink','ghost'][i % 5];
    return `<span class="badge ${cls}">${b}</span>`;
  }).join(' ');

  return `
  <div class="row" style="gap:6px; flex-wrap: wrap; margin-bottom:10px;">${badges}</div>
  <h1 class="title">${p.name}</h1>
  <p class="subtitle">${p.tagline}</p>
  <div class="row" style="gap:10px; align-items:center; margin-bottom:8px;">
    <span style="color:#E8A94C;">★ ${p.rating}</span>
    <span style="color:var(--ink-soft); font-size:.9rem;">(${p.reviews} 条评价)</span>
    <span style="color:var(--ink-soft); font-size:.9rem;">· ${cat.emoji} ${cat.name}</span>
  </div>
  <div class="price-block">
    <span class="price">${formatPrice(p.price)}</span>
    ${off}
  </div>

  <div class="form-field">
    <label>颜色 · <strong>${col.name}</strong></label>
    <div class="color-dots" id="colors">${colors}</div>
  </div>

  <div class="form-field mt-4">
    <label>头围尺码 · <a href="size-guide.html" style="font-size:.8rem; color:var(--rose-dark);">怎么量？</a></label>
    <div class="chip-group" id="sizes">${sizes}</div>
  </div>

  <div class="spec-list">
    <div class="kv"><span>材质</span><strong>${mat?.name||'—'}</strong></div>
    <div class="kv"><span>发长</span><strong>${length?.name||'—'}</strong></div>
    <div class="kv"><span>发型</span><strong>${style?.name||'—'}</strong></div>
    <div class="kv"><span>重量</span><strong>${p.weight}g</strong></div>
    <div class="kv"><span>发量密度</span><strong>${p.density}</strong></div>
    <div class="kv"><span>透气度</span><strong>${'●'.repeat(p.breathable)}${'○'.repeat(5-p.breathable)}</strong></div>
  </div>

  <div class="row" style="gap:12px; margin-top:24px;">
    <button class="btn btn-rose btn-lg" id="add-cart" style="flex:1;">加入购物车</button>
    <button class="icon-btn" id="fav" aria-label="收藏" style="border:1px solid var(--line); width:48px; height:48px;">${iconHeart(wish.has(p.id))}</button>
  </div>
  <a href="tryon.html?id=${p.id}" class="btn btn-outline btn-block btn-lg mt-3">先试戴看看效果 →</a>
  `;
}

function bindInfoEvents() {
  document.getElementById('colors').addEventListener('click', (e) => {
    const d = e.target.closest('[data-col]');
    if (!d) return;
    currentColor = d.dataset.col;
    render();
    const col = findColor(currentColor);
    if (col.hex.startsWith('linear')) {
      viewer.setColor('#D26A8B', true);
    } else {
      viewer.setColor(col.hex, false);
    }
  });
  document.getElementById('sizes').addEventListener('click', (e) => {
    const d = e.target.closest('[data-size]');
    if (!d) return;
    currentSize = d.dataset.size;
    render();
  });
  document.getElementById('add-cart').addEventListener('click', () => {
    cart.add(p.id, { colorId: currentColor, size: currentSize, qty: 1 });
  });
  document.getElementById('fav').addEventListener('click', () => {
    const added = wish.toggle(p.id);
    document.getElementById('fav').innerHTML = iconHeart(added);
  });
}

function render() {
  document.getElementById('info').innerHTML = infoHTML();
  bindInfoEvents();
}

render();

/* ---- 3D Viewer ---- */
const viewer = new WigViewer3D(document.getElementById('viewer3d'), {
  hairColor: defCol.hex.startsWith('linear') ? '#D26A8B' : defCol.hex,
  rainbow: !!defCol.hex.startsWith('linear'),
  style: p.model3d?.style || p.style,
  length: p.model3d?.length || 40,
  autoRotate: true,
});

document.querySelectorAll('.viewer-controls [data-view]').forEach((b) => {
  b.addEventListener('click', () => {
    const v = b.dataset.view;
    document.querySelectorAll('.viewer-controls [data-view]').forEach((x) => x.classList.remove('active'));
    if (v === 'auto') {
      viewer.setAutoRotate(true); b.classList.add('active');
    } else if (v === 'reset') {
      viewer.resetView(); viewer.setAutoRotate(false);
    } else {
      viewer.setAutoRotate(false);
      const positions = {
        front: [0, 0.2, 2.8],
        side:  [2.6, 0.2, 0],
        back:  [0, 0.2, -2.8],
      };
      const pos = positions[v];
      viewer.camera.position.set(...pos);
      viewer.controls.target.set(0, 0.1, 0);
      viewer.controls.update();
      b.classList.add('active');
    }
  });
});

/* ---- Tabs ---- */
document.querySelectorAll('.tab').forEach((t) => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
    ['desc','spec','care','ship'].forEach((id) => {
      document.getElementById('tab-' + id).classList.toggle('hidden', id !== t.dataset.tab);
    });
  });
});
document.getElementById('tab-desc').innerHTML = `<p>${p.description}</p><p style="margin-top:10px;">LUMIÈRE 通过每一款假发的 3D 演示与实物拍摄，为用户提供最真实的效果预览。本款通过 QC 三重检测：色差检测、发量均匀度检测、发网舒适度检测。</p>`;
document.getElementById('tab-spec').innerHTML = `
  <ul style="color:var(--ink-soft); line-height:2;">
    <li>发色：${findColor(p.defaultColor).name}（可选配色 ${p.colors.length} 种）</li>
    <li>材质：${mat?.name||'—'} · ${mat?.hint||''}</li>
    <li>发型：${style?.name||'—'}</li>
    <li>发长：${length?.name||'—'}</li>
    <li>重量：${p.weight}g</li>
    <li>发量密度：${p.density}</li>
    <li>透气度：${p.breathable}/5</li>
    <li>适配头围（cm）：${p.headSizes.map((s) => { const o = SIZES.find((x) => x.id === s); return `${s}(${o?.range[0]}-${o?.range[1]})`; }).join(' / ')}</li>
  </ul>
`;

/* ---- 相关推荐 ---- */
const related = PRODUCTS.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4);
document.getElementById('related').innerHTML = related.map((x) => productCardHTML(x, { fromPages: true })).join('');
bindFavDelegation();
