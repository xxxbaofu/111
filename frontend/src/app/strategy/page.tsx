import { TableCard } from "@/components/table-card";
import { getSystemStatus } from "@/lib/api";

export default async function StrategyPage() {
  const status = await getSystemStatus();
  const rows: Array<Array<string | number>> = [
    ["TikTok", "$20-$60/day", "短视频痛点切入 + UGC 素材测试 + 24h 快迭代"],
    ["Meta", "$30-$90/day", "高客单价值锚定 + 图片/短视频双素材并行"],
    ["Google", "$40-$120/day", "关键词意图收割 + 落地页转化优化"],
  ];
  const playbooks: Array<Array<string | number>> = [
    ["情绪驱动", "先故事后产品，强化评论互动和真实反馈，重点看CVR。"],
    ["蓝海机会", "先小预算验证 CTR，再放大高点击素材到相近人群。"],
    ["长尾稳定", "持续投放低波动关键词，控制 CPA 并逐步提量。"],
  ];
  const opsRows: Array<Array<string | number>> = [
    ["数据库状态", status.database],
    ["产品条目", status.products],
    ["品类条目", status.categories],
    ["广告条目", status.ads],
    ["日指标条目", status.daily_metrics],
    ["最新数据日期", status.latest_metric_date ?? "N/A"],
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h1 className="text-2xl font-semibold text-slate-100">投流与玩法 Strategy</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          这里不是看数据大盘，而是给你每天可执行的固定动作：预算分配、素材迭代、系统巡检。
        </p>
      </section>
      <TableCard
        title="策略页说明"
        description="这里不是展示数据，而是给你每天固定执行框架：预算分配 + 素材打法 + 系统巡检。"
        columns={["模块", "说明"]}
        rows={[
          ["预算分配", "按平台预算模型先定上限，避免凭感觉加预算。"],
          ["素材迭代", "每天至少 3 套新素材，优先替换低 CTR 素材。"],
          ["系统巡检", "确保数据更新及时，否则决策会失真。"],
        ]}
      />
      <TableCard
        title="平台预算模型（私人实战版）"
        description="预算从小到大，先验证后放量，避免单日大亏。"
        columns={["平台", "建议预算", "执行建议"]}
        rows={rows}
      />
      <TableCard
        title="品类打法模板"
        description="你可以按产品类型直接套模板，不用每次重想。"
        columns={["类型", "打法建议"]}
        rows={playbooks}
      />
      <TableCard
        title="系统运行状态"
        description="先看系统是否健康，再决定今天的数据是否可用。"
        columns={["状态项", "当前值"]}
        rows={opsRows}
      />
    </div>
  );
}
