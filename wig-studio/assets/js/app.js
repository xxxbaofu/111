// 全站通用逻辑：导航渲染、购物车、收藏、Toast、本地存储工具。
import { CATEGORIES, PRODUCTS, findColor } from './data.js';

/* ---------------- 本地存储工具 ---------------- */
const LS_KEYS = {
  cart: 'lumiere.cart',
  wish: 'lumiere.wish',
  profile: 'lumiere.profile',
  recent: 'lumiere.recent',
};

export const store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('lumiere:storage', { detail: { key } }));
  },
  remove(key) {
    localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent('lumiere:storage', { detail: { key } }));
  },
};

/* ---------------- 购物车 ---------------- */
export const cart = {
  all() { return store.get(LS_KEYS.cart, []); },
  count() { return cart.all().reduce((s, i) => s + i.qty, 0); },
  add(productId, { colorId, size, qty = 1 } = {}) {
    const items = cart.all();
    const key = `${productId}|${colorId||''}|${size||''}`;
    const existing = items.find((i) => i.key === key);
    if (existing) existing.qty += qty;
    else items.push({ key, productId, colorId, size, qty });
    store.set(LS_KEYS.cart, items);
    toast('已加入购物车', 'ok');
  },
  update(key, qty) {
    const items = cart.all().map((i) => (i.key === key ? { ...i, qty } : i)).filter((i) => i.qty > 0);
    store.set(LS_KEYS.cart, items);
  },
  remove(key) {
    store.set(LS_KEYS.cart, cart.all().filter((i) => i.key !== key));
  },
  clear() { store.remove(LS_KEYS.cart); },
  subtotal() {
    return cart.all().reduce((s, i) => {
      const p = PRODUCTS.find((x) => x.id === i.productId);
      return s + (p ? p.price * i.qty : 0);
    }, 0);
  },
};

/* ---------------- 心愿单 ---------------- */
export const wish = {
  all() { return store.get(LS_KEYS.wish, []); },
  has(id) { return wish.all().includes(id); },
  toggle(id) {
    const list = wish.all();
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    store.set(LS_KEYS.wish, next);
    toast(list.includes(id) ? '已移出收藏' : '已加入收藏', 'ok');
    return !list.includes(id);
  },
};

/* ---------------- 个人资料（头围等）---------------- */
export const profile = {
  get() { return store.get(LS_KEYS.profile, {}); },
  set(data) { store.set(LS_KEYS.profile, { ...profile.get(), ...data }); },
};

/* ---------------- 浏览历史 ---------------- */
export const recent = {
  all() { return store.get(LS_KEYS.recent, []); },
  push(id) {
    const list = [id, ...recent.all().filter((x) => x !== id)].slice(0, 12);
    store.set(LS_KEYS.recent, list);
  },
};

/* ---------------- Toast ---------------- */
export function toast(msg, type = '') {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  stack.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; }, 2400);
  setTimeout(() => el.remove(), 2800);
}

/* ---------------- 价格格式化 ---------------- */
export function formatPrice(n) {
  return '¥' + Number(n).toLocaleString('zh-CN');
}

/* ---------------- 公共导航渲染 ---------------- */
// 返回 HTML 字符串，便于写入 <header>
function headerHTML(activeKey = '') {
  const isActive = (k) => (k === activeKey ? 'active' : '');
  return `
  <div class="announce">
    <span>🎁 新用户注册立减 ¥100 · 订单满 ¥999 全国包邮 · 30 天无理由退换</span>
  </div>
  <div class="site-header">
    <div class="container bar">
      <a href="${rel('index.html')}" class="logo"><span class="dot"></span>LUMIÈRE<sup style="font-size:.7rem;margin-left:4px;color:var(--ink-faded);font-weight:400;">Wigs</sup></a>
      <nav class="nav">
        <a class="${isActive('shop')}" href="${rel('pages/catalog.html')}">全部假发</a>
        <a class="${isActive('cos')}" href="${rel('pages/catalog.html?c=cosplay')}">Cosplay</a>
        <a class="${isActive('tryon')}" href="${rel('pages/tryon.html')}">虚拟试戴</a>
        <a class="${isActive('quiz')}" href="${rel('pages/quiz.html')}">风格测试</a>
        <a class="${isActive('size')}" href="${rel('pages/size-guide.html')}">尺寸指南</a>
        <a class="${isActive('about')}" href="${rel('pages/about.html')}">品牌故事</a>
      </nav>
      <div class="nav-actions">
        <a class="icon-btn" aria-label="搜索" href="${rel('pages/catalog.html')}">${iconSearch()}</a>
        <a class="icon-btn" aria-label="账户" href="${rel('pages/account.html')}">${iconUser()}</a>
        <a class="icon-btn" aria-label="收藏" href="${rel('pages/account.html#wish')}">${iconHeart()}</a>
        <a class="icon-btn" aria-label="购物车" href="${rel('pages/cart.html')}">
          ${iconBag()}
          <span class="badge" data-cart-count>0</span>
        </a>
        <button class="burger" aria-label="菜单">${iconMenu()}</button>
      </div>
    </div>
  </div>
  <div class="drawer" id="mobile-drawer">
    <div class="panel">
      <div class="between">
        <span class="logo"><span class="dot"></span>LUMIÈRE</span>
        <button class="icon-btn" data-close-drawer aria-label="关闭">✕</button>
      </div>
      <nav class="nav-mobile">
        <a href="${rel('pages/catalog.html')}">全部假发</a>
        <a href="${rel('pages/catalog.html?c=cosplay')}">Cosplay</a>
        <a href="${rel('pages/tryon.html')}">虚拟试戴</a>
        <a href="${rel('pages/quiz.html')}">风格测试</a>
        <a href="${rel('pages/size-guide.html')}">尺寸指南</a>
        <a href="${rel('pages/about.html')}">品牌故事</a>
        <a href="${rel('pages/account.html')}">我的账户</a>
        <a href="${rel('pages/cart.html')}">购物车</a>
      </nav>
    </div>
  </div>
  `;
}

function footerHTML() {
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="logo" style="color:#fff;"><span class="dot"></span>LUMIÈRE</div>
          <p style="margin-top:12px;opacity:.8;max-width:320px;">
            为每一种风格、每一种需求，量身挑选她的第二头发。真人发 · Lace Front · Cosplay 应有尽有。
          </p>
          <div class="row" style="margin-top:16px;">
            <a aria-label="Instagram" href="#">${iconIG()}</a>
            <a aria-label="TikTok" href="#">${iconTikTok()}</a>
            <a aria-label="微博" href="#">${iconWeibo()}</a>
            <a aria-label="YouTube" href="#">${iconYouTube()}</a>
          </div>
        </div>
        <div>
          <h5>购物</h5>
          <ul>
            <li><a href="${rel('pages/catalog.html')}">全部假发</a></li>
            <li><a href="${rel('pages/catalog.html?c=daily')}">日常系列</a></li>
            <li><a href="${rel('pages/catalog.html?c=cosplay')}">Cosplay</a></li>
            <li><a href="${rel('pages/catalog.html?c=medical')}">医疗假发</a></li>
            <li><a href="${rel('pages/catalog.html?c=lacefront')}">Lace Front</a></li>
          </ul>
        </div>
        <div>
          <h5>帮助</h5>
          <ul>
            <li><a href="${rel('pages/size-guide.html')}">尺寸指南</a></li>
            <li><a href="${rel('pages/tryon.html')}">虚拟试戴</a></li>
            <li><a href="${rel('pages/quiz.html')}">风格测试</a></li>
            <li><a href="#">运费与发货</a></li>
            <li><a href="#">退换货政策</a></li>
          </ul>
        </div>
        <div>
          <h5>关于</h5>
          <ul>
            <li><a href="${rel('pages/about.html')}">品牌故事</a></li>
            <li><a href="#">职业机会</a></li>
            <li><a href="#">联系我们</a></li>
            <li><a href="#">隐私政策</a></li>
            <li><a href="#">用户协议</a></li>
          </ul>
        </div>
        <div>
          <h5>订阅</h5>
          <p style="font-size:.85rem;opacity:.8;">订阅 LUMIÈRE 通讯，第一时间拿到新品与专享折扣。</p>
          <form class="newsletter" onsubmit="event.preventDefault(); this.querySelector('input').value=''; window.dispatchEvent(new CustomEvent('lumiere:toast',{detail:{msg:'订阅成功，感谢 ♡',type:'ok'}}));">
            <input type="email" required placeholder="你的邮箱地址" />
            <button type="submit">订阅</button>
          </form>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} LUMIÈRE WIGS · All rights reserved.</span>
        <span>Made with ♡ for everyone who loves hair.</span>
      </div>
    </div>
  </footer>`;
}

// 在页面根部挂载公共组件
export function mount({ activeKey } = {}) {
  // 头部
  const headerHost = document.querySelector('[data-role="header"]');
  if (headerHost) headerHost.innerHTML = headerHTML(activeKey);

  // 页脚
  const footerHost = document.querySelector('[data-role="footer"]');
  if (footerHost) footerHost.innerHTML = footerHTML();

  // 移动菜单
  const burger = document.querySelector('.burger');
  const drawer = document.getElementById('mobile-drawer');
  if (burger && drawer) {
    burger.addEventListener('click', () => drawer.classList.add('open'));
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer || e.target.closest('[data-close-drawer]')) drawer.classList.remove('open');
    });
  }

  updateCartBadge();
  window.addEventListener('lumiere:storage', (e) => {
    if (e.detail.key === LS_KEYS.cart) updateCartBadge();
  });
  window.addEventListener('lumiere:toast', (e) => toast(e.detail.msg, e.detail.type));
}

function updateCartBadge() {
  const n = cart.count();
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = String(n);
    el.style.display = n > 0 ? '' : 'none';
  });
}

/* ---------------- 相对路径工具 ---------------- */
// 根据当前页面所在目录修正相对路径
function rel(path) {
  const inPages = location.pathname.includes('/pages/');
  if (inPages) {
    if (path.startsWith('pages/')) return path.replace(/^pages\//, '');
    if (path === 'index.html') return '../index.html';
    return path;
  }
  return path;
}

/* ---------------- SVG Icons ---------------- */
export function iconSearch() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>`;
}
export function iconUser() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>`;
}
export function iconHeart(filled=false) {
  return `<svg width="20" height="20" viewBox="0 0 24 24" ${filled?'fill="currentColor"':'fill="none"'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}
export function iconBag() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2l-3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-3-6z"/><path d="M3 8h18"/><path d="M16 12a4 4 0 0 1-8 0"/></svg>`;
}
export function iconMenu() {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
}
export function iconStar(filled=true) {
  return `<svg width="16" height="16" viewBox="0 0 24 24" ${filled?'fill="#E8A94C"':'fill="none"'} stroke="#E8A94C" stroke-width="1.5"><polygon points="12 2 15 9 22 9.3 17 14 18.5 21 12 17.3 5.5 21 7 14 2 9.3 9 9"/></svg>`;
}
export function iconIG() {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>`;
}
export function iconTikTok() {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20 8.5a5.5 5.5 0 0 1-4-1.7V15a5 5 0 1 1-5-5v3a2 2 0 1 0 2 2V2h3a5.5 5.5 0 0 0 4 4.5v2z"/></svg>`;
}
export function iconWeibo() {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="10" cy="15" r="4"/><circle cx="17" cy="9" r="2"/></svg>`;
}
export function iconYouTube() {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="6" width="20" height="12" rx="3"/><polygon points="10 9 16 12 10 15" fill="#2A1F2D"/></svg>`;
}
export function iconCheck() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
}
export function iconUpload() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v14"/><polyline points="6 9 12 3 18 9"/><path d="M3 21h18"/></svg>`;
}
export function iconTrash() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>`;
}
export function iconCamera() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19V8a2 2 0 0 0-2-2h-3.17l-1.84-2.76A2 2 0 0 0 14.34 2H9.66a2 2 0 0 0-1.65.88L6.17 6H3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2z"/><circle cx="12" cy="13" r="4"/></svg>`;
}

/* ---------------- 渲染辅助 ---------------- */
// 渲染一个商品卡 HTML 字符串
// fromPages: 若为 true，当前页位于 /pages/，链接就是同目录下的 product.html
export function productCardHTML(p, { fromPages = false } = {}) {
  const productHref = fromPages ? `product.html?id=${p.id}` : `pages/product.html?id=${p.id}`;
  const col = findColor(p.defaultColor);
  const swatches = p.colors.slice(0, 5).map((cid) => {
    const c = findColor(cid);
    const bg = c.hex.startsWith('linear') ? c.hex : c.hex;
    return `<span class="color-dot" title="${c.name}" style="background:${bg}"></span>`;
  }).join('');
  const badges = (p.badges || []).slice(0, 2).map((b, i) => {
    const cls = ['rose','violet','champagne'][i % 3];
    return `<span class="badge ${cls}">${b}</span>`;
  }).join('');
  const off = p.originalPrice ? `<span class="original">${formatPrice(p.originalPrice)}</span>` : '';
  const cat = CATEGORIES.find((c) => c.id === p.category);
  const wished = wish.has(p.id);
  return `
  <a class="product-card" href="${productHref}" data-product-id="${p.id}">
    <div class="thumb">
      ${wigSVG(p, col)}
      <div class="badges">${badges}</div>
      <button class="fav ${wished?'active':''}" data-fav="${p.id}" aria-label="收藏">${iconHeart(wished)}</button>
    </div>
    <div class="body">
      <div class="cat">${cat ? cat.name : ''}</div>
      <div class="name">${p.name}</div>
      <div class="color-dots">${swatches}</div>
      <div class="price-row">
        <span class="price">${formatPrice(p.price)}</span>
        ${off}
        <span class="rating" style="margin-left:auto;">${iconStar()} ${p.rating} (${p.reviews})</span>
      </div>
    </div>
  </a>`;
}

// 点击收藏按钮的处理器（可在列表容器上代理）
export function bindFavDelegation(root = document) {
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-fav]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const id = btn.getAttribute('data-fav');
    const added = wish.toggle(id);
    btn.classList.toggle('active', added);
    btn.innerHTML = iconHeart(added);
  });
}

/* ---------------- 2D SVG 生成（给商品缩略图）---------------- */
// 一个极简的"人头+发型"插画，用于缩略图。根据 style/color 生成。
export function wigSVG(product, color) {
  const style = product.model3d?.style || product.style || 'straight';
  const hex = color?.hex?.startsWith('linear') ? 'url(#rainbow)' : (color?.hex || '#3b2418');
  const len = Math.min(product.model3d?.length || 40, 80);
  const hairY = 80 + len * 2.2;
  const shape = hairPathForStyle(style, len);
  return `
  <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:100%;height:100%;">
    <defs>
      <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#F8EBE6"/>
        <stop offset="100%" stop-color="#E2D4F3"/>
      </linearGradient>
      <linearGradient id="skin" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#F4DCC8"/>
        <stop offset="100%" stop-color="#E9C3A5"/>
      </linearGradient>
      <linearGradient id="rainbow" x1="0" x2="1">
        <stop offset="0%" stop-color="#ff6ea2"/>
        <stop offset="25%" stop-color="#b79cd9"/>
        <stop offset="50%" stop-color="#3a8cb8"/>
        <stop offset="75%" stop-color="#3c6b47"/>
        <stop offset="100%" stop-color="#e07a3c"/>
      </linearGradient>
      <linearGradient id="hair-shine" x1="0" x2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
        <stop offset="50%" stop-color="rgba(255,255,255,.45)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>
    </defs>
    <rect width="400" height="500" fill="url(#bg)"/>
    <!-- 肩膀剪影 -->
    <path d="M 40 500 Q 140 380 200 380 Q 260 380 360 500 Z" fill="#E2D4F3" opacity=".6"/>
    <!-- 脸 -->
    <ellipse cx="200" cy="200" rx="78" ry="96" fill="url(#skin)"/>
    <!-- 脖子 -->
    <rect x="175" y="285" width="50" height="45" fill="url(#skin)"/>
    <!-- 眼睛 -->
    <circle cx="175" cy="200" r="4" fill="#3b2418"/>
    <circle cx="225" cy="200" r="4" fill="#3b2418"/>
    <!-- 嘴 -->
    <path d="M 188 240 Q 200 250 212 240" stroke="#C06F7E" stroke-width="3" fill="none" stroke-linecap="round"/>
    <!-- 头发 -->
    ${shape.replace(/{HAIR}/g, hex)}
    <!-- 高光 -->
    <path d="M 150 140 Q 200 130 250 140" stroke="url(#hair-shine)" stroke-width="6" fill="none"/>
  </svg>`;
}

function hairPathForStyle(style, len) {
  // 粗略返回一段可复用的 path 字符串，占位以给 color-fill 使用
  switch (style) {
    case 'straight':
      return `<path d="M 116 150 Q 130 70 200 60 Q 270 70 284 150 L 296 ${150 + len * 2.4} Q 298 ${160 + len * 2.5} 280 ${160 + len * 2.5} L 280 220 Q 240 190 200 190 Q 160 190 120 220 L 120 ${160 + len * 2.5} Q 102 ${160 + len * 2.5} 104 ${150 + len * 2.4} Z" fill="{HAIR}"/>`;
    case 'wavy':
      return `<path d="M 116 150 Q 130 70 200 60 Q 270 70 284 150
        Q 310 ${190 + len} 280 ${210 + len * 1.6}
        Q 260 ${220 + len * 1.4} 260 ${200 + len * 1.3}
        Q 230 ${190} 200 190
        Q 170 190 140 ${200 + len * 1.3}
        Q 140 ${220 + len * 1.4} 120 ${210 + len * 1.6}
        Q 90 ${190 + len} 116 150 Z" fill="{HAIR}"/>`;
    case 'curly':
      return `<path d="M 110 150 Q 130 60 200 60 Q 270 60 290 150
        Q 330 ${200 + len} 300 ${240 + len * 1.3}
        Q 280 ${220 + len * 1.3} 270 ${240 + len * 1.2}
        Q 250 ${220 + len * 1.2} 230 ${240 + len * 1.1}
        Q 200 ${230 + len * 1.1} 170 ${240 + len * 1.1}
        Q 150 ${220 + len * 1.2} 130 ${240 + len * 1.2}
        Q 120 ${220 + len * 1.3} 100 ${240 + len * 1.3}
        Q 70 ${200 + len} 110 150 Z" fill="{HAIR}"/>`;
    case 'bob':
      return `<path d="M 116 140 Q 130 60 200 55 Q 270 60 284 140 L 296 280 Q 280 300 240 290 Q 220 280 200 280 Q 180 280 160 290 Q 120 300 104 280 Z" fill="{HAIR}"/>`;
    case 'pixie-cut':
      return `<path d="M 120 150 Q 140 50 210 55 Q 280 65 290 180 Q 290 220 270 210 Q 260 180 240 190 Q 220 160 200 180 Q 180 160 150 200 Q 130 220 110 210 Q 108 180 120 150 Z" fill="{HAIR}"/>`;
    case 'twintails':
      return `<g fill="{HAIR}">
        <path d="M 116 150 Q 130 60 200 55 Q 270 60 284 150 L 290 220 Q 240 200 200 200 Q 160 200 110 220 Z"/>
        <path d="M 90 180 Q 70 ${220 + len} 60 ${260 + len * 1.5} Q 80 ${260 + len * 1.5} 105 ${220 + len} Z"/>
        <path d="M 310 180 Q 330 ${220 + len} 340 ${260 + len * 1.5} Q 320 ${260 + len * 1.5} 295 ${220 + len} Z"/>
      </g>`;
    case 'ponytail':
      return `<g fill="{HAIR}">
        <path d="M 116 150 Q 130 60 200 55 Q 270 60 284 150 L 286 230 Q 240 210 200 210 Q 160 210 114 230 Z"/>
        <path d="M 260 130 Q 320 ${180 + len} 330 ${260 + len * 1.3} Q 300 ${260 + len * 1.3} 250 ${200 + len} Z"/>
      </g>`;
    case 'lob':
      return `<path d="M 116 145 Q 130 60 200 55 Q 270 60 284 145 L 294 ${260 + len} Q 240 ${260 + len} 200 ${260 + len} Q 160 ${260 + len} 106 ${260 + len} Z" fill="{HAIR}"/>`;
    case 'layered':
      return `<path d="M 110 150 Q 130 60 200 55 Q 270 60 290 150
        L 300 ${250 + len * 1.2}
        Q 260 ${240 + len} 240 ${260 + len * 1.2}
        Q 220 ${240 + len * 1.1} 200 ${260 + len * 1.2}
        Q 180 ${240 + len * 1.1} 160 ${260 + len * 1.2}
        Q 140 ${240 + len} 100 ${250 + len * 1.2} Z" fill="{HAIR}"/>`;
    default:
      return `<path d="M 116 150 Q 130 70 200 60 Q 270 70 284 150 L 290 ${200 + len * 2} L 110 ${200 + len * 2} Z" fill="{HAIR}"/>`;
  }
}
