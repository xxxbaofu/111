// 虚拟 2D 试戴：画布叠加，支持照片 + 假发 SVG Layer 的平移/缩放/旋转/色相。
import { mount, toast, wigSVG } from './app.js';
import { PRODUCTS, findColor, findProduct } from './data.js';

mount({ activeKey: 'tryon' });

const stage = document.getElementById('stage');
const photoCanvas = document.getElementById('photo');
const wigCanvas = document.getElementById('wig');
const ph = document.getElementById('ph');

const STAGE_W = 900;
const STAGE_H = 1125;
photoCanvas.width = wigCanvas.width = STAGE_W;
photoCanvas.height = wigCanvas.height = STAGE_H;

const pctx = photoCanvas.getContext('2d');
const wctx = wigCanvas.getContext('2d');

/* ---- 状态 ---- */
const state = {
  photo: null,
  productId: new URLSearchParams(location.search).get('id') || PRODUCTS[0].id,
  colorId: null,
  tx: 0, ty: 0, scale: 1, rot: 0, alpha: 1, hue: 0,
  // 相对缩放和偏移基准（基于检测到的脸部或默认中心）
  baseX: STAGE_W / 2,
  baseY: STAGE_H * 0.42,
  baseScale: 1,
};

/* ---- 产品选择器 ---- */
const picker = document.getElementById('product-picker');
picker.innerHTML = PRODUCTS.map((p) => `<option value="${p.id}" ${p.id === state.productId ? 'selected' : ''}>${p.name}</option>`).join('');
picker.addEventListener('change', () => {
  state.productId = picker.value;
  const p = findProduct(state.productId);
  state.colorId = p.defaultColor;
  renderColors(); drawWig();
});

/* ---- 色卡 ---- */
function renderColors() {
  const p = findProduct(state.productId);
  state.colorId = state.colorId || p.defaultColor;
  const host = document.getElementById('colors');
  host.innerHTML = p.colors.map((cid) => {
    const c = findColor(cid);
    const bg = c.hex.startsWith('linear') ? c.hex : c.hex;
    return `<span class="color-dot ${cid === state.colorId ? 'selected' : ''}" data-col="${cid}" title="${c.name}" style="background:${bg}"></span>`;
  }).join('');
  host.onclick = (e) => {
    const d = e.target.closest('[data-col]');
    if (!d) return;
    state.colorId = d.dataset.col;
    renderColors();
    drawWig();
  };
}
renderColors();

/* ---- 上传照片 ---- */
document.getElementById('upload').addEventListener('change', (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  const img = new Image();
  img.onload = () => { state.photo = img; ph.classList.add('hidden'); drawPhoto(); drawWig(); };
  img.src = URL.createObjectURL(f);
});

/* ---- 示例模特 ---- */
document.getElementById('use-demo').addEventListener('click', () => {
  const img = new Image();
  img.onload = () => { state.photo = img; ph.classList.add('hidden'); drawPhoto(); drawWig(); };
  img.src = makeDemoModel();
});

/* 用 SVG 生成一张简易的模特脸，避免外部图片依赖 */
function makeDemoModel() {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1125">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#F5EBE6"/><stop offset="100%" stop-color="#E2D4F3"/>
      </linearGradient>
      <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F7DDC8"/><stop offset="100%" stop-color="#E9BFA0"/>
      </linearGradient>
    </defs>
    <rect width="900" height="1125" fill="url(#bg)"/>
    <path d="M 80 1125 Q 300 820 450 820 Q 600 820 820 1125 Z" fill="#D5C4EA"/>
    <rect x="390" y="660" width="120" height="140" fill="url(#skin)"/>
    <ellipse cx="450" cy="470" rx="170" ry="215" fill="url(#skin)"/>
    <circle cx="390" cy="470" r="9" fill="#2A1F2D"/>
    <circle cx="510" cy="470" r="9" fill="#2A1F2D"/>
    <path d="M 380 460 Q 395 450 410 460" stroke="#2A1F2D" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M 490 460 Q 505 450 520 460" stroke="#2A1F2D" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M 420 570 Q 450 590 480 570" stroke="#C06F7E" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="390" cy="530" rx="18" ry="10" fill="#F4B9C6" opacity=".45"/>
    <ellipse cx="510" cy="530" rx="18" ry="10" fill="#F4B9C6" opacity=".45"/>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/* ---- 绘制 ---- */
function drawPhoto() {
  pctx.clearRect(0, 0, STAGE_W, STAGE_H);
  if (!state.photo) return;
  // cover-fit
  const img = state.photo;
  const ir = img.width / img.height;
  const sr = STAGE_W / STAGE_H;
  let dw, dh, dx, dy;
  if (ir > sr) {
    dh = STAGE_H; dw = dh * ir;
    dx = (STAGE_W - dw) / 2; dy = 0;
  } else {
    dw = STAGE_W; dh = dw / ir;
    dx = 0; dy = (STAGE_H - dh) / 2;
  }
  pctx.drawImage(img, dx, dy, dw, dh);
}

function drawWig() {
  wctx.clearRect(0, 0, STAGE_W, STAGE_H);
  if (!state.photo) return;
  const p = findProduct(state.productId);
  const col = findColor(state.colorId || p.defaultColor);

  // 1) 生成 SVG 字符串
  const svgStr = wigSVG(p, col);
  const dataUri = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgStr);
  const img = new Image();
  img.onload = () => {
    wctx.save();
    // 色相偏移（只影响假发层）
    wctx.filter = `hue-rotate(${state.hue}deg)`;
    wctx.globalAlpha = state.alpha;
    const baseW = 700;
    const baseH = baseW * (img.height / img.width);
    const cx = state.baseX + state.tx;
    const cy = state.baseY + state.ty;
    wctx.translate(cx, cy);
    wctx.rotate((state.rot * Math.PI) / 180);
    const s = state.scale * state.baseScale;
    wctx.drawImage(img, -baseW * s / 2, -baseH * s / 2, baseW * s, baseH * s);
    wctx.restore();
  };
  img.src = dataUri;
}

/* ---- 滑块绑定 ---- */
const bindRange = (id, fn) => {
  document.getElementById(id).addEventListener('input', (e) => {
    fn(Number(e.target.value));
    drawWig();
  });
};
bindRange('tx',    (v) => state.tx = v);
bindRange('ty',    (v) => state.ty = v);
bindRange('scale', (v) => state.scale = v / 100);
bindRange('rot',   (v) => state.rot = v);
bindRange('alpha', (v) => state.alpha = v / 100);
bindRange('hue',   (v) => state.hue = v);

/* ---- 拖拽 ---- */
let dragging = false;
let dragStart = null;
stage.addEventListener('pointerdown', (e) => {
  if (!state.photo) return;
  dragging = true; dragStart = { x: e.clientX, y: e.clientY, tx: state.tx, ty: state.ty };
  stage.setPointerCapture(e.pointerId);
});
stage.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const scale = STAGE_W / stage.clientWidth;
  state.tx = dragStart.tx + (e.clientX - dragStart.x) * scale;
  state.ty = dragStart.ty + (e.clientY - dragStart.y) * scale;
  document.getElementById('tx').value = state.tx;
  document.getElementById('ty').value = state.ty;
  drawWig();
});
stage.addEventListener('pointerup', () => { dragging = false; });

/* 滚轮缩放 */
stage.addEventListener('wheel', (e) => {
  if (!state.photo) return;
  e.preventDefault();
  state.scale = Math.min(2, Math.max(0.5, state.scale - e.deltaY * 0.001));
  document.getElementById('scale').value = state.scale * 100;
  drawWig();
}, { passive: false });

/* ---- 其它按钮 ---- */
document.getElementById('reset-photo').addEventListener('click', () => {
  state.photo = null;
  pctx.clearRect(0,0,STAGE_W,STAGE_H);
  wctx.clearRect(0,0,STAGE_W,STAGE_H);
  ph.classList.remove('hidden');
});
document.getElementById('reset-tx').addEventListener('click', () => {
  state.tx = state.ty = 0; state.scale = 1; state.rot = 0; state.alpha = 1; state.hue = 0;
  ['tx','ty','rot','hue'].forEach((id) => document.getElementById(id).value = 0);
  document.getElementById('scale').value = 100;
  document.getElementById('alpha').value = 100;
  drawWig();
});
document.getElementById('snap').addEventListener('click', () => {
  if (!state.photo) { toast('先上传照片试试吧', 'err'); return; }
  // 合并两层
  const merge = document.createElement('canvas');
  merge.width = STAGE_W; merge.height = STAGE_H;
  const mctx = merge.getContext('2d');
  mctx.drawImage(photoCanvas, 0, 0);
  mctx.drawImage(wigCanvas, 0, 0);
  const url = merge.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url; a.download = 'lumiere-tryon.png';
  document.body.appendChild(a); a.click(); a.remove();
  toast('已保存效果图 ✨', 'ok');
});

/* 初始：如果 URL 有 id，使用 demo 模特 */
if (new URLSearchParams(location.search).get('id')) {
  setTimeout(() => document.getElementById('use-demo').click(), 100);
}
