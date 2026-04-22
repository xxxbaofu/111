// 商品数据与分类定义，全站通用。
// 所有颜色值基于 CSS 变量 / 十六进制，便于 3D 查看器直接使用。

export const CATEGORIES = [
  { id: 'daily',    name: '日常自然', desc: '上班、约会、日常造型',    emoji: '🌿' },
  { id: 'fashion',  name: '时尚造型', desc: '派对、拍照、潮流装扮',    emoji: '✨' },
  { id: 'cosplay',  name: 'Cosplay', desc: '动漫、游戏、角色扮演',     emoji: '🎭' },
  { id: 'stage',    name: '舞台派对', desc: '演出、舞台、万圣节',      emoji: '🎤' },
  { id: 'medical',  name: '医疗假发', desc: '舒适、透气、隐形发网',    emoji: '🏥' },
  { id: 'lacefront',name: 'Lace Front', desc: '蕾丝前片、超自然发际线', emoji: '💎' },
];

export const MATERIALS = [
  { id: 'human',      name: '100% 真人发', hint: '最自然、可烫可染，价格高' },
  { id: 'heat',       name: '高温丝',       hint: '可180°以下造型，性价比优选' },
  { id: 'protein',    name: '蛋白丝',       hint: '触感柔软、光泽自然' },
  { id: 'synthetic',  name: '合成纤维',     hint: '造型持久、价格亲民' },
];

export const LENGTHS = [
  { id: 'pixie',   name: '超短 (<15cm)',  cm: 12 },
  { id: 'short',   name: '短发 (15-30cm)', cm: 25 },
  { id: 'medium',  name: '中长 (30-45cm)', cm: 38 },
  { id: 'long',    name: '长发 (45-65cm)', cm: 55 },
  { id: 'extra',   name: '超长 (>65cm)',   cm: 80 },
];

// 统一色卡库，viewer3d.js 和 tryon.js 共享
export const COLOR_SWATCHES = [
  { id: 'natural-black',  name: '自然黑',   hex: '#1b1411' },
  { id: 'dark-brown',     name: '深棕',     hex: '#3b2418' },
  { id: 'chestnut',       name: '栗棕',     hex: '#5a3220' },
  { id: 'honey-blonde',   name: '蜂蜜金',   hex: '#b98552' },
  { id: 'platinum',       name: '铂金白',   hex: '#e7dcc6' },
  { id: 'ash-grey',       name: '雾灰',     hex: '#9a9ba0' },
  { id: 'silver',         name: '银白',     hex: '#c6c9cf' },
  { id: 'rose-gold',      name: '玫瑰金',   hex: '#d18a8a' },
  { id: 'cherry',         name: '樱桃红',   hex: '#a02435' },
  { id: 'burgundy',       name: '勃艮第',   hex: '#5a1a2a' },
  { id: 'pink-peach',     name: '蜜桃粉',   hex: '#f4a6b5' },
  { id: 'lavender',       name: '薰衣草紫', hex: '#b79cd9' },
  { id: 'mermaid-blue',   name: '人鱼蓝',   hex: '#3a8cb8' },
  { id: 'ocean-teal',     name: '海洋青',   hex: '#2f8c8a' },
  { id: 'forest-green',   name: '森林绿',   hex: '#3c6b47' },
  { id: 'sunset-orange',  name: '日落橙',   hex: '#e07a3c' },
  { id: 'cosmic-purple',  name: '宇宙紫',   hex: '#5b2c83' },
  { id: 'rainbow',        name: '彩虹渐变', hex: 'linear-gradient(90deg,#ff6ea2,#b79cd9,#3a8cb8,#3c6b47,#e07a3c)' },
];

export const STYLES = [
  { id: 'straight',   name: '直发' },
  { id: 'wavy',       name: '波浪' },
  { id: 'curly',      name: '卷发' },
  { id: 'bob',        name: 'BOB头' },
  { id: 'pixie-cut',  name: '超短发' },
  { id: 'twintails',  name: '双马尾' },
  { id: 'ponytail',   name: '马尾' },
  { id: 'lob',        name: '锁骨发' },
  { id: 'layered',    name: '层次发' },
];

// 尺码与头围（cm）
export const SIZES = [
  { id: 'XS', range: [50, 53], label: 'XS · 小童 / 娇小' },
  { id: 'S',  range: [53, 55], label: 'S · 偏小头围' },
  { id: 'M',  range: [55, 57], label: 'M · 标准（多数成人）' },
  { id: 'L',  range: [57, 59], label: 'L · 偏大头围' },
  { id: 'XL', range: [59, 62], label: 'XL · 特大' },
];

// 商品列表。所有图片均用 SVG data-uri，以避免网络依赖。
// `model3d` 字段给 viewer3d 使用：style 决定几何，color 给默认颜色。
export const PRODUCTS = [
  {
    id: 'w-001',
    name: '月光黑长直 · 自然发际',
    category: 'daily',
    tagline: '经典通勤款，真人发质感',
    price: 1290,
    originalPrice: 1590,
    rating: 4.8,
    reviews: 326,
    material: 'human',
    length: 'long',
    style: 'straight',
    weight: 210,
    breathable: 4,
    density: '150%',
    headSizes: ['S','M','L'],
    defaultColor: 'natural-black',
    colors: ['natural-black','dark-brown','chestnut'],
    badges: ['热销','真人发','可染烫'],
    description: '长 55cm 的亚洲系黑色直发，蕾丝前片+可调节发网，日常上班上课都很好驾驭。',
    model3d: { style: 'straight', length: 55, fringe: 'side' },
  },
  {
    id: 'w-002',
    name: '奶咖波浪 · 欧美日常款',
    category: 'daily',
    tagline: '空气感八字刘海',
    price: 890,
    originalPrice: 1090,
    rating: 4.7,
    reviews: 214,
    material: 'heat',
    length: 'medium',
    style: 'wavy',
    weight: 180,
    breathable: 5,
    density: '130%',
    headSizes: ['XS','S','M','L'],
    defaultColor: 'chestnut',
    colors: ['chestnut','honey-blonde','dark-brown'],
    badges: ['新品','高温丝'],
    description: '中长 40cm 波浪发，带柔和微卷，日常约会和通勤都合适。',
    model3d: { style: 'wavy', length: 40, fringe: 'curtain' },
  },
  {
    id: 'w-003',
    name: '铂金白女王 Lob',
    category: 'fashion',
    tagline: '派对与拍照焦点',
    price: 1590,
    originalPrice: 1890,
    rating: 4.9,
    reviews: 158,
    material: 'human',
    length: 'medium',
    style: 'lob',
    weight: 200,
    breathable: 4,
    density: '160%',
    headSizes: ['S','M','L'],
    defaultColor: 'platinum',
    colors: ['platinum','ash-grey','silver'],
    badges: ['网红款','Lace Front'],
    description: '欧美风锁骨发，撞色挑染自由可选，适合派对、婚纱摄影。',
    model3d: { style: 'lob', length: 35, fringe: 'middle' },
  },
  {
    id: 'w-004',
    name: '蜜桃粉泡泡 BOB',
    category: 'fashion',
    tagline: '甜酷街头感',
    price: 690,
    originalPrice: 890,
    rating: 4.6,
    reviews: 402,
    material: 'heat',
    length: 'short',
    style: 'bob',
    weight: 160,
    breathable: 5,
    density: '140%',
    headSizes: ['XS','S','M'],
    defaultColor: 'pink-peach',
    colors: ['pink-peach','rose-gold','lavender','cherry'],
    badges: ['少女感','高温丝'],
    description: '蜜桃粉 BOB 头，甜酷街头风，搭配 Lolita 或 Y2K 穿搭都很搭。',
    model3d: { style: 'bob', length: 22, fringe: 'full' },
  },
  {
    id: 'w-005',
    name: '人鱼蓝双马尾 · 动漫女主',
    category: 'cosplay',
    tagline: '高还原动漫角色',
    price: 790,
    rating: 4.8,
    reviews: 510,
    material: 'heat',
    length: 'long',
    style: 'twintails',
    weight: 220,
    breathable: 5,
    density: '160%',
    headSizes: ['S','M','L'],
    defaultColor: 'mermaid-blue',
    colors: ['mermaid-blue','lavender','pink-peach','platinum','cosmic-purple'],
    badges: ['Cosplay','双马尾','可塑形'],
    description: '80cm 超长双马尾，带哑光高温丝材质，可180°以下造型。',
    model3d: { style: 'twintails', length: 70, fringe: 'full' },
  },
  {
    id: 'w-006',
    name: '银发短剑 · 男性/中性角色款',
    category: 'cosplay',
    tagline: '冷感美型',
    price: 590,
    rating: 4.7,
    reviews: 289,
    material: 'heat',
    length: 'short',
    style: 'pixie-cut',
    weight: 130,
    breathable: 5,
    density: '120%',
    headSizes: ['XS','S','M','L'],
    defaultColor: 'silver',
    colors: ['silver','platinum','ash-grey','natural-black'],
    badges: ['中性','Cosplay'],
    description: '中性偏男款，短碎发 18cm，适合大部分美型男 / 中性角色。',
    model3d: { style: 'pixie-cut', length: 15, fringe: 'messy' },
  },
  {
    id: 'w-007',
    name: '宇宙紫长卷 · 魔法少女',
    category: 'cosplay',
    tagline: '梦幻高饱和色',
    price: 990,
    rating: 4.9,
    reviews: 176,
    material: 'heat',
    length: 'extra',
    style: 'curly',
    weight: 260,
    breathable: 4,
    density: '180%',
    headSizes: ['S','M','L'],
    defaultColor: 'cosmic-purple',
    colors: ['cosmic-purple','lavender','pink-peach','mermaid-blue'],
    badges: ['魔法','超长','卷发'],
    description: '85cm 大波浪，魔法少女标配，饱和度与光泽感兼顾。',
    model3d: { style: 'curly', length: 85, fringe: 'curtain' },
  },
  {
    id: 'w-008',
    name: '火焰橙层次烫 · 舞台表演',
    category: 'stage',
    tagline: '舞台灯光下很抓眼',
    price: 890,
    rating: 4.6,
    reviews: 98,
    material: 'synthetic',
    length: 'medium',
    style: 'layered',
    weight: 190,
    breathable: 3,
    density: '150%',
    headSizes: ['S','M','L'],
    defaultColor: 'sunset-orange',
    colors: ['sunset-orange','cherry','burgundy'],
    badges: ['舞台','抓眼'],
    description: '层次烫染橙色长发，舞台与舞蹈表演专用，上色鲜明。',
    model3d: { style: 'layered', length: 40, fringe: 'side' },
  },
  {
    id: 'w-009',
    name: '柔光棕 · 医疗透气全头套',
    category: 'medical',
    tagline: '医疗级舒适',
    price: 1890,
    originalPrice: 2190,
    rating: 4.9,
    reviews: 67,
    material: 'human',
    length: 'medium',
    style: 'straight',
    weight: 160,
    breathable: 5,
    density: '120%',
    headSizes: ['XS','S','M','L','XL'],
    defaultColor: 'dark-brown',
    colors: ['dark-brown','natural-black','chestnut','ash-grey'],
    badges: ['医疗','真人发','全透气'],
    description: '为化疗 / 脱发人群设计，超轻量 160g，全透气发网。',
    model3d: { style: 'straight', length: 35, fringe: 'curtain' },
  },
  {
    id: 'w-010',
    name: '樱桃红 Lace Front 长卷',
    category: 'lacefront',
    tagline: '隐形发际、仿真头皮',
    price: 1990,
    originalPrice: 2390,
    rating: 4.8,
    reviews: 143,
    material: 'human',
    length: 'long',
    style: 'wavy',
    weight: 230,
    breathable: 4,
    density: '180%',
    headSizes: ['S','M','L'],
    defaultColor: 'cherry',
    colors: ['cherry','burgundy','rose-gold'],
    badges: ['Lace Front','仿头皮','高密度'],
    description: '13x4 蕾丝前片，仿头皮效果，60cm 波浪长发。',
    model3d: { style: 'wavy', length: 55, fringe: 'middle' },
  },
  {
    id: 'w-011',
    name: '雾灰锁骨 · 高级感日常',
    category: 'daily',
    tagline: '轻熟 / OL 最爱',
    price: 1190,
    rating: 4.7,
    reviews: 221,
    material: 'human',
    length: 'medium',
    style: 'lob',
    weight: 180,
    breathable: 4,
    density: '140%',
    headSizes: ['S','M','L'],
    defaultColor: 'ash-grey',
    colors: ['ash-grey','silver','platinum'],
    badges: ['高级','通勤'],
    description: '雾灰色调锁骨发，带微微内扣，OL 穿搭精致感拉满。',
    model3d: { style: 'lob', length: 33, fringe: 'side' },
  },
  {
    id: 'w-012',
    name: '彩虹渐变长直 · 派对女王',
    category: 'stage',
    tagline: '一戴成为人群焦点',
    price: 1090,
    rating: 4.5,
    reviews: 76,
    material: 'heat',
    length: 'long',
    style: 'straight',
    weight: 240,
    breathable: 3,
    density: '160%',
    headSizes: ['S','M','L'],
    defaultColor: 'rainbow',
    colors: ['rainbow','pink-peach','lavender','mermaid-blue'],
    badges: ['彩虹','派对'],
    description: '彩虹渐变色，70cm 长直，派对、音乐节、万圣节一戴就亮。',
    model3d: { style: 'straight', length: 65, fringe: 'middle', rainbow: true },
  },
];

// 运营 Banner / 推荐位
export const HERO_SLIDES = [
  {
    eyebrow: '春夏新品',
    title: '让每一束光，\n都落在你身上',
    subtitle: '真人发 · Lace Front · 6 种头围精细适配，你的第二头发从此开始。',
    ctaText: '逛全部假发',
    ctaHref: 'pages/catalog.html',
    accent: 'rose',
  },
  {
    eyebrow: 'Cosplay 系列',
    title: '像从动漫里\n走出来那样戴发',
    subtitle: '40+ 角色还原色卡，180° 可造型高温丝，还原度直接拉满。',
    ctaText: '探索 Cosplay',
    ctaHref: 'pages/catalog.html?c=cosplay',
    accent: 'violet',
  },
  {
    eyebrow: '上线即爆款',
    title: '不出门，\n也能看 360° 上头效果',
    subtitle: '全站新增 3D 演示 + 虚拟试戴，先看清楚再下单。',
    ctaText: '进入 3D 体验',
    ctaHref: 'pages/tryon.html',
    accent: 'champagne',
  },
];

// 工具：按 id 找商品
export function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

// 工具：找颜色
export function findColor(id) {
  return COLOR_SWATCHES.find((c) => c.id === id) || COLOR_SWATCHES[0];
}

export function findCategory(id) {
  return CATEGORIES.find((c) => c.id === id);
}

export function findMaterial(id) {
  return MATERIALS.find((c) => c.id === id);
}

export function findLength(id) {
  return LENGTHS.find((c) => c.id === id);
}

export function findStyle(id) {
  return STYLES.find((c) => c.id === id);
}

// 头围 cm -> 尺码
export function sizeByHead(cm) {
  if (!cm) return null;
  for (const s of SIZES) {
    if (cm >= s.range[0] && cm < s.range[1]) return s;
  }
  if (cm < SIZES[0].range[0]) return SIZES[0];
  return SIZES[SIZES.length - 1];
}
