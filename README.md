# Selection Radar v0.1

自动发现跨境赚钱机会（不是 Top 榜单），按以下流程执行：

1. 数据采集（TikTok / Reddit / X）
2. AI 提取商品
3. 电商验证（Amazon / Etsy）
4. 评分（趋势 + 利润 + 蓝海 + 情绪 + 新趋势）
5. 机会分类与输出（JSON + Markdown）

## MVP 已实现范围

- 数据源：
  - TikTok（Apify，可回退到 demo 数据）
  - Reddit（官方 OAuth API，可回退到 demo 数据）
  - X（MVP 补充信号，demo）
  - Amazon + Etsy（MVP 验证代理）
  - Google Trends（实时 + demo）
- 存储：SQLite
- 调度：每日 00:00/00:10/00:20/00:30/00:40
- 输出：`output/opportunities_*.json` + `output/opportunities_*.md`

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

## 关键环境变量

- `SELECTION_RADAR_DB`：SQLite 文件路径（默认 `selection_radar.db`）
- `SELECTION_RADAR_OUTPUT_DIR`：输出目录（默认 `output`）
- `SELECTION_RADAR_DEMO_MODE`：`true/false`
- `OPENAI_API_KEY`：OpenAI API Key（可选）
- `SELECTION_RADAR_OPENAI_MODEL`：模型名（默认 `gpt-4.1-mini`）
- `APIFY_TOKEN`：TikTok 抓取 token（可选）
- `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET`：Reddit OAuth（可选）

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
