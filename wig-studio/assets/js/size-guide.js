import { mount, profile, toast } from './app.js';
import { sizeByHead } from './data.js';

mount({ activeKey: 'size' });

const range = document.getElementById('cm-range');
const label = document.getElementById('cm-label');
const big = document.getElementById('size-big');
const desc = document.getElementById('size-desc');
const faceDesc = document.getElementById('face-desc');

const faceHints = {
  oval:   '椭圆脸适合绝大多数发型，尤其是长直、Lob、侧分刘海。',
  round:  '圆脸推荐：中长层次发、侧分长刘海、BOB 偏长款，避免空气刘海。',
  square: '方脸推荐：柔和波浪、锁骨发、空气刘海，可柔化下颌线。',
  heart:  '心形脸推荐：中长发、齐刘海、Lob，平衡下巴偏尖的视觉。',
  long:   '长形脸推荐：齐刘海 + 卷发或波浪，视觉上缩短脸型。',
};

let face = 'oval';

function update() {
  const cm = Number(range.value);
  label.textContent = `${cm} cm`;
  const size = sizeByHead(cm);
  big.textContent = size.id;
  desc.textContent = size.label;
  faceDesc.textContent = faceHints[face] || '';
  profile.set({ head: cm, face });
}

range.addEventListener('input', update);
document.getElementById('face').addEventListener('click', (e) => {
  const b = e.target.closest('[data-face]');
  if (!b) return;
  document.querySelectorAll('[data-face]').forEach((x) => x.classList.remove('active'));
  b.classList.add('active');
  face = b.dataset.face;
  update();
});

// 初始化：从已保存的资料中读取
const saved = profile.get();
if (saved.head) range.value = saved.head;
if (saved.face) {
  face = saved.face;
  document.querySelectorAll('[data-face]').forEach((x) => x.classList.toggle('active', x.dataset.face === face));
}
update();

document.getElementById('go-shop').addEventListener('click', () => {
  toast('已保存你的头围和脸型，为你推荐更合适的款式。', 'ok');
});
