# LUMIÈRE WIGS · 假发 3D 演示与虚拟试戴平台

> 一个面向日常时尚 / 角色扮演（Cosplay）/ 医疗需求用户的假发购物与体验平台。
> 集成 **3D 360° 演示**、**基于浏览器的虚拟试戴**、**头围与脸型定制**、**AI 风格测试**，
> 让用户在下单前充分、立体地感受假发的真实效果。

—— 一款纯前端即可运行、无任何后端依赖的完整网站原型。

---

## 1. 产品定位

| 维度 | 说明 |
| --- | --- |
| 品牌名 | LUMIÈRE WIGS（取自法语「光」，寓意"为每一个人点亮形象"） |
| 目标用户 | ① 日常时尚用户 ② Cosplayer / 舞台表演者 ③ 脱发 / 医疗脱发群体 ④ 摄影与影视造型师 |
| 核心痛点 | 看图买假发「戴上完全不一样」、头围/脸型不合适、颜色落差、风格难以想象 |
| 解决方案 | 3D 360° 模型 + 2D 虚拟试戴 + 头围/脸型精确选型 + 风格测试引导 |
| 竞品参照 | UNIWIGS、Arda Wigs、Epic Cosplay、Rockstar Wigs |

## 2. 配色与视觉系统

考虑到目标用户以女性和 Cosplay 群体为主，需兼具"**高级感 + 浪漫 + 轻微奇幻**"：

| Token | 颜色 | 用途 |
| --- | --- | --- |
| `--rose` | `#D26A8B` | 主色 · CTA / 品牌 |
| `--rose-dark` | `#A64866` | hover / 深色按钮 |
| `--lilac` | `#B392E0` | 点缀 · Cosplay 标签 |
| `--violet` | `#6B3FA0` | 强调色 |
| `--champagne` | `#E8C8A0` | 暖色点缀 · 天然发色 |
| `--cream` | `#FDF8F3` | 页面主背景 |
| `--pearl` | `#F5EBE6` | 卡片背景 |
| `--ink` | `#2A1F2D` | 主文字 |
| `--ink-soft` | `#5B4B5E` | 次文字 |

字体：`"Playfair Display"`（标题）+ `"Inter"`（正文）+ `"Noto Sans SC"`（中文）。

## 3. 信息架构（IA）

```
首页 /
├── 产品目录 /pages/catalog.html
│     └── 产品详情 /pages/product.html?id=xxx  （含 3D 查看器）
├── 虚拟试戴 /pages/tryon.html
├── 风格测试 /pages/quiz.html
├── 头围与尺寸指南 /pages/size-guide.html
├── 购物车 /pages/cart.html
├── 我的账户 /pages/account.html
└── 品牌故事 /pages/about.html
```

## 4. 功能清单

### 4.1 商品体系
- 分类：`日常自然`、`时尚造型`、`Cosplay / 动漫`、`舞台 / 派对`、`医疗假发`、`Lace Front 蕾丝头套`。
- 每件商品含：SKU、名称、品牌线、价格、原价、材质（真人发 / 高温丝 / 蛋白丝）、
  发长、发型、颜色色卡、头围适配范围、重量、透气度、图片多图、3D 参数、标签。

### 4.2 3D 演示（Three.js）
- 程序化头部 + 发丝 Mesh，不依赖外部模型文件；
- 360° 旋转、上下观察、缩放；
- 实时换色（色卡 → 材质）；
- 切换发型结构（长/短/波浪/双马尾/Bob）；
- 光照与阴影，展示高光与自然感。

### 4.3 虚拟 2D 试戴
- 支持本地上传自拍（仅浏览器内处理，保护隐私）；
- 可拖拽调整假发位置、缩放、旋转、色相；
- 一键换色卡；
- 截图保存效果图。

### 4.4 头围与尺寸选型
- 图示化指南（4 个关键测量点）；
- 头围输入 → 自动匹配 **S / M / L / XL** 尺码；
- 脸型选择（椭圆/圆形/方形/心形/长形）→ 推荐发型；

### 4.5 AI 风格测试
- 6 道问题（场景/风格偏好/色系/护理意愿/预算/用途）；
- 打分引擎映射到商品标签，输出 Top 3 推荐。

### 4.6 账户与购物闭环
- `localStorage` 本地持久化：购物车、心愿单、头围与脸型、浏览历史；
- 购物车：数量增减、尺寸选择、小计、优惠码、运费估算；
- 账户中心：个人档案、收藏、最近浏览、地址簿、订单（mock）。

### 4.7 通用能力
- 顶部公告条、响应式导航、移动端抽屉菜单；
- 全站 Toast 通知、模态框、骨架屏；
- 搜索、筛选（类别/长度/颜色/价格/头围/材质）、多维排序；
- 页脚含 Newsletter 订阅与社媒链接。

## 5. 技术栈

| 层 | 选型 |
| --- | --- |
| 页面 | 原生 HTML5 + 语义化结构 |
| 样式 | 原生 CSS3 + CSS 变量 + Grid/Flex + prefers-color-scheme |
| 交互 | 原生 ES Modules JavaScript |
| 3D | [Three.js](https://threejs.org) r160（CDN，ES Module） |
| 图标 | 内联 SVG |
| 数据 | `assets/js/data.js` 中的商品 JSON |

**无构建依赖，双击 `index.html` 或用任意静态服务器即可运行。**

## 6. 本地运行

```bash
cd wig-studio
# 任选其一
python3 -m http.server 8080
# 或
npx serve .
```

浏览器访问 <http://localhost:8080>。

## 7. 目录结构

```
wig-studio/
├── index.html                首页
├── README.md                 本说明
├── pages/
│   ├── catalog.html          商品目录
│   ├── product.html          产品详情 + 3D
│   ├── tryon.html            虚拟试戴
│   ├── size-guide.html       头围与尺寸指南
│   ├── quiz.html             风格测试
│   ├── cart.html             购物车
│   ├── account.html          账户中心
│   └── about.html            品牌故事
└── assets/
    ├── css/main.css          全站样式
    ├── js/
    │   ├── data.js           商品数据
    │   ├── app.js            全局逻辑（导航/购物车/收藏/Toast）
    │   ├── catalog.js        目录页筛选
    │   ├── product.js        详情页
    │   ├── viewer3d.js       Three.js 3D 查看器
    │   ├── tryon.js          虚拟试戴画布
    │   ├── quiz.js           风格测试
    │   ├── cart.js           购物车页
    │   ├── account.js        账户页
    │   └── size-guide.js     尺寸指南
    └── img/                  （SVG 图标内联，无需额外图片）
```

## 8. 后续可扩展

- 接入真实 Face Mesh（MediaPipe）自动对齐试戴假发；
- 接入 `.glb` 真实头模/发丝资产；
- 加入 WebXR，支持手机 AR 试戴；
- 对接真实后端（订单、库存、支付）。

—— *© LUMIÈRE WIGS · Demo built as a product prototype.*
