# Selection Radar v0.1

自动发现跨境赚钱机会（不是 Top 榜单），按以下流程执行：

1. 数据采集（TikTok / Reddit / X）
2. AI 提取商品
3. 电商验证（Amazon / Etsy）
4. 评分（趋势 + 利润 + 蓝海 + 情绪 + 新趋势）
5. 机会分类与输出（JSON + Markdown）

## v0.2 已实现范围

- 数据源：
  - TikTok（Apify 在线抓取，失败自动回退）
  - Reddit（官方 OAuth API 在线抓取，失败自动回退）
  - X（补充信号，demo）
  - Amazon + Etsy（在线搜索页抓取代理指标，失败自动回退）
  - Google Trends（实时 + demo）
- 存储：SQLite
- 调度：每日 00:00/00:10/00:20/00:30/00:40
- 输出：`output/opportunities_*.json` + `output/opportunities_*.md`
- 可视化后台：Streamlit

## 快速开始

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py --mode run-once
```

默认开启 demo 模式（无需密钥）：

```bash
export SELECTION_RADAR_DEMO_MODE=true
```

线上抓取模式：

```bash
export SELECTION_RADAR_DEMO_MODE=false
export APIFY_TOKEN=xxx
export REDDIT_CLIENT_ID=xxx
export REDDIT_CLIENT_SECRET=xxx
python main.py --mode run-once
```

## 关键环境变量

- `SELECTION_RADAR_DB`：SQLite 文件路径（默认 `selection_radar.db`）
- `SELECTION_RADAR_OUTPUT_DIR`：输出目录（默认 `output`）
- `SELECTION_RADAR_DEMO_MODE`：`true/false`
- `OPENAI_API_KEY`：OpenAI API Key（可选）
- `SELECTION_RADAR_OPENAI_MODEL`：模型名（默认 `gpt-4.1-mini`）
- `APIFY_TOKEN`：TikTok 抓取 token（可选）
- `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET`：Reddit OAuth（可选）
- `SELECTION_RADAR_REQUEST_TIMEOUT`：请求超时秒数（默认 `25`）
- `SELECTION_RADAR_MAX_COLLECT_PER_SOURCE`：单源抓取上限（默认 `20`）

## 按阶段执行

```bash
python main.py --mode stage --stage collect
python main.py --mode stage --stage extract
python main.py --mode stage --stage validate
python main.py --mode stage --stage score
python main.py --mode stage --stage output
```

## 调度运行

```bash
python main.py --mode schedule
```

## Streamlit 可视化后台

```bash
streamlit run selection_radar/dashboard.py --server.port 8501 --server.headless true
```

看板功能：
- 一键运行全流程
- 指标卡片（机会数/平均分/建议测试数/新趋势数）
- 分类分布图
- Top机会明细表
- 单产品理由查看
