import Link from "next/link";

import { LineChart } from "@/components/line-chart";
import { TableCard } from "@/components/table-card";
import { getProduct, getWorkflowTasks, type Region } from "@/lib/api";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ region?: Region }>;
};

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  const routeParams = await params;
  const query = (await searchParams) ?? {};
  const region = query.region ?? "US";
  const productId = Number(routeParams.id);
  const detail = await getProduct(productId);
  const workflow = await getWorkflowTasks(region);
  const relatedTask = workflow.items.find((item) => item.product_id === productId);

  const metrics = [...detail.daily_metrics].reverse();
  const xAxis = metrics.map((item) => item.date.slice(5));
  const trendSeries = [
    { name: "热度", data: metrics.map((item) => Number(item.heat)) },
    { name: "讨论", data: metrics.map((item) => Number(item.discussion)) },
  ];

  const adRows = detail.ads.map((ad) => [
    ad.platform,
    ad.creative_type,
    ad.appear_count,
    ad.last_seen.slice(0, 10),
    ad.market,
  ]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h1 className="text-2xl font-semibold text-white">
          {detail.name_cn}（{detail.name_en}）
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          区域：{region}。这是你的单品作战页：先判定值不值得做，再确认预算和下一步动作。
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-2 text-lg font-semibold">产品趋势（近 30 天）</h2>
          <p className="mb-3 text-xs text-[var(--text-muted)]">
            热度和讨论同步抬升，通常是更优先的启动窗口。
          </p>
          <LineChart x={xAxis} series={trendSeries} height={300} />
        </div>
        <div className="card space-y-2">
          <h2 className="text-lg font-semibold">核心结论</h2>
          <p className="text-sm text-[var(--text-muted)]">结论：{detail.decision?.conclusion ?? detail.recommendation}</p>
          <p className="text-sm text-[var(--text-muted)]">原因：{detail.decision?.why ?? "数据驱动判定中"}</p>
          <p className="text-sm text-[var(--text-muted)]">做法：{detail.decision?.how ?? detail.strategy_type}</p>
          <p className="text-sm text-[var(--text-muted)]">
            预算：测试 ${detail.decision?.budget.test ?? detail.budget_test} / 日预算 $
            {detail.decision?.budget.daily ?? detail.budget_daily} / 起量 $
            {detail.decision?.budget.scale ?? detail.budget_scale}
          </p>
          <p className="text-sm text-[var(--danger)]">风险：{detail.decision?.risk ?? "需关注供应链稳定性"}</p>
          <div className="pt-2">
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/workflow?region=${region}`}
                className="inline-flex items-center rounded-md border border-[var(--accent-blue)] bg-[var(--accent-blue)]/20 px-3 py-2 text-xs text-white"
              >
                去执行看板更新状态
              </Link>
              <Link
                href={`/bookmarks?region=${region}&action=add_product&product_id=${productId}`}
                className="inline-flex items-center rounded-md border border-[var(--accent)] bg-[var(--accent)]/15 px-3 py-2 text-xs text-[var(--accent)]"
              >
                收藏该产品
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <TableCard
          title="单品指标面板"
          description="只看关键指标：分数、增长、竞争、价格带与预算。"
          columns={["分数", "增长", "热度", "讨论", "竞争", "均价", "价格带", "日预算", "预估日收入"]}
          rows={[
            [
              detail.score.toFixed(1),
              detail.growth_score.toFixed(3),
              detail.heat_score.toFixed(2),
              detail.discussion_score.toFixed(2),
              detail.competition_score.toFixed(1),
              `$${detail.price_avg.toFixed(2)}`,
              `$${detail.price_min.toFixed(2)}-$${detail.price_max.toFixed(2)}`,
              `$${detail.budget_daily.toFixed(0)}`,
              `$${detail.estimated_daily_revenue.toFixed(0)}`,
            ],
          ]}
        />
      </section>

      <section>
        <TableCard
          title="广告素材信号"
          description="素材重复出现通常意味着该表达方式有潜在转化。"
          columns={["平台", "素材类型", "出现次数", "最近出现", "市场"]}
          rows={adRows}
        />
      </section>

      <section>
        <TableCard
          title="当前执行状态"
          description="把产品放入任务流（待测试/测试中/复盘中/停投），形成闭环。"
          columns={["状态", "优先级", "负责人", "下一步动作", "更新时间"]}
          rows={
            relatedTask
              ? [
                  [
                    relatedTask.status,
                    relatedTask.priority,
                    relatedTask.owner,
                    relatedTask.next_action || "-",
                    relatedTask.updated_at ? relatedTask.updated_at.slice(0, 10) : "-",
                  ],
                ]
              : [["未入库", "-", "-", "建议加入执行看板", "-"]]
          }
        />
      </section>
    </div>
  );
}
