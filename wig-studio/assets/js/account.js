import { mount, profile, wish, recent, productCardHTML, bindFavDelegation, toast, formatPrice } from './app.js';
import { PRODUCTS, findProduct } from './data.js';

mount({ activeKey: 'account' });

/* 侧边 Tab 切换 */
function showTab(name) {
  document.querySelectorAll('[data-pane]').forEach((p) => p.classList.toggle('hidden', p.dataset.pane !== name));
  document.querySelectorAll('#menu [data-tab]').forEach((a) => a.classList.toggle('active', a.dataset.tab === name));
  if (name === 'wish') renderWish();
  if (name === 'recent') renderRecent();
  if (name === 'orders') renderOrders();
}
document.getElementById('menu').addEventListener('click', (e) => {
  const a = e.target.closest('[data-tab]');
  if (!a) return;
  e.preventDefault();
  location.hash = '#' + a.dataset.tab;
  showTab(a.dataset.tab);
});

/* 个人资料 */
const p = profile.get();
['name','email','head','face','pref'].forEach((k) => {
  const el = document.getElementById('p-' + k);
  if (!el) return;
  if (p[k] != null) el.value = p[k];
});
document.getElementById('save-profile').addEventListener('click', () => {
  const data = {};
  ['name','email','head','face','pref'].forEach((k) => {
    const el = document.getElementById('p-' + k);
    if (el) data[k] = el.value;
  });
  profile.set(data);
  toast('资料已保存 ♡', 'ok');
});

/* 心愿单 */
function renderWish() {
  const ids = wish.all();
  const grid = document.getElementById('wish-grid');
  const empty = document.getElementById('wish-empty');
  const list = ids.map((id) => findProduct(id)).filter(Boolean);
  if (!list.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
    grid.innerHTML = list.map((p) => productCardHTML(p, { fromPages: true })).join('');
  }
}
/* 最近浏览 */
function renderRecent() {
  const ids = recent.all();
  const grid = document.getElementById('recent-grid');
  const empty = document.getElementById('recent-empty');
  const list = ids.map((id) => findProduct(id)).filter(Boolean);
  if (!list.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
    grid.innerHTML = list.map((p) => productCardHTML(p, { fromPages: true })).join('');
  }
}
/* 订单 */
function renderOrders() {
  const demoOrders = [
    { id: 'LM-2026041501', date: '2026-04-15', status: '已送达', items: [PRODUCTS[0], PRODUCTS[2]] },
    { id: 'LM-2026033003', date: '2026-03-30', status: '运输中', items: [PRODUCTS[4]] },
  ];
  document.getElementById('orders-list').innerHTML = demoOrders.map((o) => `
    <div class="card" style="padding:18px; margin-bottom:12px;">
      <div class="between">
        <div>
          <strong>订单 #${o.id}</strong>
          <div style="color:var(--ink-soft); font-size:.85rem;">${o.date}</div>
        </div>
        <span class="badge ${o.status === '已送达' ? 'rose' : 'violet'}">${o.status}</span>
      </div>
      <div style="margin-top:10px; color:var(--ink-soft); font-size:.9rem;">
        ${o.items.map((it) => it.name).join('、')}
      </div>
      <div style="margin-top:10px;"><strong>${formatPrice(o.items.reduce((s, it) => s + it.price, 0))}</strong></div>
    </div>
  `).join('');
}

/* 初始 Tab */
const hash = location.hash.replace('#','') || 'profile';
showTab(hash);

bindFavDelegation();
