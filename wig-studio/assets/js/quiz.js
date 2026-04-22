import { mount, productCardHTML, bindFavDelegation, toast } from './app.js';
import { PRODUCTS } from './data.js';

mount({ activeKey: 'quiz' });

const QUESTIONS = [
  {
    id: 'scene',
    title: '你最常在什么场景佩戴？',
    options: [
      { id: 'daily',   label: '日常通勤 / 上课', desc: '低调自然是主旋律' },
      { id: 'party',   label: '派对 / 拍照', desc: '想亮一点' },
      { id: 'cos',     label: 'Cosplay / 二次元', desc: '还原角色为主' },
      { id: 'stage',   label: '舞台 / 表演', desc: '需要视觉冲击' },
      { id: 'medical', label: '日常替代（医疗 / 脱发）', desc: '舒适与透气第一' },
    ],
  },
  {
    id: 'color',
    title: '更喜欢哪种色系？',
    options: [
      { id: 'natural', label: '自然发色',   desc: '黑 / 棕 / 栗' },
      { id: 'light',   label: '浅色系',     desc: '金 / 铂 / 灰' },
      { id: 'warm',    label: '暖色系',     desc: '红 / 粉 / 橙' },
      { id: 'fantasy', label: '幻彩 / 二次元', desc: '蓝 / 紫 / 彩虹' },
    ],
  },
  {
    id: 'length',
    title: '偏好的发长？',
    options: [
      { id: 'short',  label: '短发（<30cm）' },
      { id: 'medium', label: '中长（30-45cm）' },
      { id: 'long',   label: '长发（45-65cm）' },
      { id: 'extra',  label: '超长（>65cm）' },
    ],
  },
  {
    id: 'style',
    title: '偏好的发型？',
    options: [
      { id: 'straight', label: '直发' },
      { id: 'wavy',     label: '波浪' },
      { id: 'curly',    label: '卷发' },
      { id: 'bob',      label: 'BOB / Lob' },
      { id: 'twin',     label: '双马尾 / 特殊造型' },
    ],
  },
  {
    id: 'care',
    title: '你愿意花多少时间打理？',
    options: [
      { id: 'lazy',    label: '越少越好', desc: '合成材质 / BOB 头' },
      { id: 'normal',  label: '偶尔打理', desc: '高温丝可造型' },
      { id: 'active',  label: '愿意投入', desc: '真人发可烫染' },
    ],
  },
  {
    id: 'budget',
    title: '心理预算？',
    options: [
      { id: 'b1', label: '< ¥800' },
      { id: 'b2', label: '¥800 – ¥1500' },
      { id: 'b3', label: '¥1500 – ¥2500' },
      { id: 'b4', label: '不限' },
    ],
  },
];

let step = 0;
const answers = {};

function render() {
  const host = document.getElementById('quiz');
  if (step >= QUESTIONS.length) return renderResult();
  const q = QUESTIONS[step];
  const progress = (step / QUESTIONS.length) * 100;
  host.innerHTML = `
    <div class="progress"><div style="width:${progress}%;"></div></div>
    <div style="color:var(--ink-soft); font-size:.85rem;">第 ${step+1} 题 / 共 ${QUESTIONS.length} 题</div>
    <h3 class="q-title mt-3">${q.title}</h3>
    <div class="q-options mt-5">
      ${q.options.map((o) => `
        <div class="quiz-option ${answers[q.id] === o.id ? 'selected' : ''}" data-val="${o.id}">
          <strong>${o.label}</strong>
          ${o.desc ? `<span>${o.desc}</span>` : ''}
        </div>
      `).join('')}
    </div>
    <div class="row" style="justify-content:space-between; margin-top:32px;">
      <button class="btn btn-ghost" id="prev" ${step === 0 ? 'disabled style="opacity:.4;"' : ''}>← 上一题</button>
      <button class="btn btn-primary" id="next">下一题 →</button>
    </div>
  `;
  host.querySelector('.q-options').addEventListener('click', (e) => {
    const opt = e.target.closest('.quiz-option');
    if (!opt) return;
    answers[q.id] = opt.dataset.val;
    host.querySelectorAll('.quiz-option').forEach((x) => x.classList.remove('selected'));
    opt.classList.add('selected');
  });
  document.getElementById('prev').addEventListener('click', () => { if (step > 0) { step--; render(); } });
  document.getElementById('next').addEventListener('click', () => {
    if (!answers[q.id]) { toast('选一个再继续吧～', 'err'); return; }
    step++; render();
  });
}

function score(p) {
  let s = 0;
  const a = answers;
  const scene2cat = { daily:'daily', party:'fashion', cos:'cosplay', stage:'stage', medical:'medical' };
  if (a.scene && p.category === scene2cat[a.scene]) s += 40;

  const naturalColors = ['natural-black','dark-brown','chestnut','honey-blonde','ash-grey'];
  const lightColors = ['platinum','ash-grey','silver','honey-blonde'];
  const warmColors = ['cherry','burgundy','rose-gold','sunset-orange','pink-peach'];
  const fantasyColors = ['mermaid-blue','lavender','cosmic-purple','rainbow','ocean-teal','forest-green'];
  const pool = { natural:naturalColors, light:lightColors, warm:warmColors, fantasy:fantasyColors }[a.color] || [];
  if (p.colors.some((c) => pool.includes(c))) s += 25;

  const lenMap = { short:['pixie','short'], medium:['medium'], long:['long'], extra:['extra'] };
  if (lenMap[a.length]?.includes(p.length)) s += 15;

  const styleMap = { straight:['straight'], wavy:['wavy'], curly:['curly'], bob:['bob','lob'], twin:['twintails','ponytail'] };
  if (styleMap[a.style]?.includes(p.style)) s += 15;

  const careMap = { lazy: 'synthetic', normal: 'heat', active: 'human' };
  if (careMap[a.care] && p.material === careMap[a.care]) s += 10;

  const budgets = { b1: [0, 800], b2: [800, 1500], b3: [1500, 2500], b4: [0, 99999] };
  const [mn, mx] = budgets[a.budget] || [0, 99999];
  if (p.price >= mn && p.price <= mx) s += 10;

  s += p.rating * 2;
  return s;
}

function renderResult() {
  const ranked = [...PRODUCTS].sort((a,b) => score(b) - score(a)).slice(0, 3);
  const host = document.getElementById('quiz');
  host.innerHTML = `
    <div class="progress"><div style="width:100%;"></div></div>
    <div class="text-center" style="margin-top: 20px;">
      <div class="eyebrow">Your Match</div>
      <h3 class="q-title mt-3">为你挑出的 Top 3</h3>
      <p style="color:var(--ink-soft);">根据你的偏好，我们推荐下面这几款，点击查看 3D 效果。</p>
    </div>
    <div class="product-grid mt-6">
      ${ranked.map((p) => productCardHTML(p, { fromPages: true })).join('')}
    </div>
    <div class="row text-center" style="justify-content:center; gap:12px; margin-top:24px;">
      <button class="btn btn-ghost" id="again">重新测试</button>
      <a class="btn btn-rose" href="catalog.html">看全部</a>
    </div>
  `;
  bindFavDelegation();
  document.getElementById('again').addEventListener('click', () => {
    step = 0;
    Object.keys(answers).forEach((k) => delete answers[k]);
    render();
  });
}

render();
