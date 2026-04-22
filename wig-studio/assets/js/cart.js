import { mount, cart, formatPrice, toast, iconTrash, wigSVG } from './app.js';
import { findProduct, findColor, SIZES } from './data.js';

mount({ activeKey: 'cart' });

let coupon = null;

function render() {
  const items = cart.all();
  const itemsHost = document.getElementById('items');
  if (!items.length) {
    itemsHost.innerHTML = `
      <div class="empty">
        <h3 style="margin-bottom:8px;">购物车还是空的</h3>
        <p>快去挑几款假发，开启你的新造型吧。</p>
        <a class="btn btn-rose mt-5" href="catalog.html">立即逛一逛 →</a>
      </div>`;
  } else {
    itemsHost.innerHTML = items.map((it) => {
      const p = findProduct(it.productId);
      if (!p) return '';
      const col = findColor(it.colorId || p.defaultColor);
      return `
      <div class="cart-item" data-key="${it.key}">
        <div class="thumb">${wigSVG(p, col)}</div>
        <div>
          <a href="product.html?id=${p.id}" style="font-weight:600;">${p.name}</a>
          <div style="color:var(--ink-soft); font-size:.85rem; margin-top:4px;">
            颜色：${col.name} · 尺码：${it.size || '—'}
          </div>
          <div class="row" style="align-items:center; gap:16px; margin-top:10px;">
            <div class="qty-input">
              <button data-act="dec">−</button>
              <input readonly value="${it.qty}" />
              <button data-act="inc">+</button>
            </div>
            <button class="icon-btn" data-act="del" title="删除">${iconTrash()}</button>
          </div>
        </div>
        <div style="text-align:right;">
          <strong style="font-size:1.1rem;">${formatPrice(p.price * it.qty)}</strong>
          ${p.originalPrice ? `<div style="color:var(--ink-faded); text-decoration: line-through; font-size:.85rem;">${formatPrice(p.originalPrice * it.qty)}</div>` : ''}
        </div>
      </div>`;
    }).join('');
  }

  renderSummary();
}

function renderSummary() {
  const sub = cart.subtotal();
  let discount = 0;
  if (coupon === 'LUMIERE10') discount = Math.round(sub * 0.1);
  if (coupon === 'FREESHIP') discount = 0;
  const ship = sub >= 999 || coupon === 'FREESHIP' || sub === 0 ? 0 : 15;
  const total = Math.max(0, sub - discount + ship);

  document.getElementById('summary').innerHTML = `
    <h3 style="margin-bottom:12px;">订单摘要</h3>
    <div class="summary-row"><span>商品小计</span><span>${formatPrice(sub)}</span></div>
    ${discount ? `<div class="summary-row" style="color:var(--success);"><span>优惠（${coupon}）</span><span>- ${formatPrice(discount)}</span></div>` : ''}
    <div class="summary-row"><span>运费</span><span>${ship ? formatPrice(ship) : '免费'}</span></div>
    <div class="summary-row total"><span>总计</span><span>${formatPrice(total)}</span></div>

    <div class="form-field mt-5">
      <label>优惠码（试试 <code>LUMIERE10</code> 或 <code>FREESHIP</code>）</label>
      <div class="row">
        <input type="text" id="coupon" placeholder="输入优惠码" style="flex:1;" />
        <button class="btn btn-ghost" id="apply">应用</button>
      </div>
    </div>

    <button class="btn btn-rose btn-block btn-lg mt-4" id="checkout" ${sub === 0 ? 'disabled style="opacity:.5;"':''}>
      去结算 →
    </button>

    <p style="color:var(--ink-soft); font-size:.82rem; margin-top:12px;">满 ¥999 免运费 · 支持支付宝 / 微信 / 花呗分期</p>
  `;

  document.getElementById('apply')?.addEventListener('click', () => {
    const val = document.getElementById('coupon').value.trim().toUpperCase();
    if (!val) return;
    if (['LUMIERE10','FREESHIP'].includes(val)) {
      coupon = val;
      toast('优惠码应用成功 ♡', 'ok');
      render();
    } else {
      toast('无效的优惠码', 'err');
    }
  });

  document.getElementById('checkout')?.addEventListener('click', () => {
    toast('Demo：模拟下单成功，订单已同步到账户页面。', 'ok');
    cart.clear();
    coupon = null;
    setTimeout(render, 500);
  });
}

/* 事件委托：数量增减 + 删除 */
document.getElementById('items').addEventListener('click', (e) => {
  const row = e.target.closest('.cart-item');
  const btn = e.target.closest('[data-act]');
  if (!row || !btn) return;
  const key = row.dataset.key;
  const it = cart.all().find((x) => x.key === key);
  if (!it) return;
  if (btn.dataset.act === 'inc') cart.update(key, it.qty + 1);
  if (btn.dataset.act === 'dec') cart.update(key, Math.max(0, it.qty - 1));
  if (btn.dataset.act === 'del') cart.remove(key);
  render();
});

render();
