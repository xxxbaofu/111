# Cross-border Data Operating System

本仓库当前包含两部分：

1. **原有 Selection Radar（Python + SQLite + Streamlit）**
2. **新增全栈架构（FastAPI + PostgreSQL + Redis + Celery + Next.js）**

新增全栈部分用于实现：

- 看市场
- 看品类
- 看产品
- 看广告
- 做决策

---

## 新增全栈目录结构

```text
backend/        # FastAPI + SQLAlchemy + Celery
frontend/       # Next.js + TypeScript + Tailwind + ECharts
docker-compose.yml
```

---

## 新增全栈能力

### 后端 API（FastAPI）

- `GET /api/market?region=US`
- `GET /api/products?region=US&category=pet`
- `GET /api/product/{id}`
- `GET /api/growth?region=US`
- `GET /api/ads?product_id=1`
- `GET /api/leaders?region=US`
- `POST /api/ai/explain`
- `POST /api/seed`（初始化演示数据）

### 数据层（PostgreSQL）

核心表：

- `products`
- `daily_metrics`
- `categories`
- `ads`
- `leaders`

支持市场分区：

- `US / UK / EU / SEA / JP / KR / XHS`

### 任务调度（Celery + Redis）

- 每小时：`ingest_hourly`
- 每日：`compute_growth_daily`
- 每周：`compute_trend_weekly`

### 前端（Next.js）

7 个核心页面：

- Dashboard
- Market Pulse
- Category
- Products
- Ads
- Leaders
- Growth

并附加策略页：

- Strategy（投流预算模型 + 打法模板）

---

## 一键启动（推荐）

```bash
docker compose up --build
```

启动后访问：

- 前端：`http://localhost:3000`
- 后端：`http://localhost:8000/api/health`

首次初始化演示数据：

```bash
curl -X POST http://localhost:8000/api/seed
```

---

## 后端本地开发（可选）

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 前端本地开发（可选）

```bash
cd frontend
npm install
npm run dev
```
