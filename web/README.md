# MuseWig Atelier

MuseWig Atelier 是一个面向假发选购场景的前端产品站，包含：

- 品牌化首页
- 多分类假发商品库
- 3D 假头模试戴展示
- 基于头围、场景、脸型、预算的智能推荐
- 护理指南、FAQ 与信任建立模块

## 技术栈

- React 19
- TypeScript
- Vite
- Three.js / React Three Fiber
- Lucide React

## 本地运行

```bash
cd web
npm install
npm run dev
```

默认开发地址：

```bash
http://localhost:5173
```

## 生产构建

```bash
cd web
npm run build
```

## 代码结构

```text
web/
├─ public/
├─ src/
│  ├─ components/
│  │  └─ WigCanvas.tsx
│  ├─ App.tsx
│  ├─ App.css
│  ├─ data.ts
│  └─ index.css
└─ PRODUCT_BRIEF.md
```

## 当前实现重点

- 用结构化商品数据支撑目录、推荐和 3D 展示
- 用懒加载拆分 3D 试戴模块，避免首页首屏一次性加载全部 three 相关代码
- 采用更适合假发/美妆品牌的网站配色：酒红紫、裸粉、香槟金

## 后续建议

如果要继续做成可正式上线的商业网站，下一步可以增加：

- 购物车与支付
- 用户账号与收藏
- 后台商品管理
- 真人照片/AR 试戴
- 订单与客服系统
