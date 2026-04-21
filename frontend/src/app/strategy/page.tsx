import { TableCard } from "@/components/table-card";

export default function StrategyPage() {
  const rows: Array<Array<string | number>> = [
    ["TikTok", "$20-$60/day", "短视频痛点切入 + UGC素材测试"],
    ["Meta", "$30-$90/day", "高客单价值锚定 + 图文对比创意"],
    ["Google", "$40-$120/day", "关键词意图收割 + 落地页优化"],
  ];

  const playbooks: Array<Array<string | number>> = [
    ["情绪驱动", "先故事后产品，强化评论互动和真实反馈"],
    ["蓝海机会", "先小预算验证CVR，再放大高点击素材"],
    ["长尾稳定", "持续投放低波动关键词，控制CPA稳步提量"],
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-100">投流与玩法 Strategy</h1>
      <TableCard title="平台预算模型" columns={["平台", "建议预算", "执行建议"]} rows={rows} />
      <TableCard title="品类打法模板" columns={["类型", "打法建议"]} rows={playbooks} />
    </div>
  );
}
