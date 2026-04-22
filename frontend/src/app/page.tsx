import { KpiCard } from "@/components/kpi-card";
import { LineChart } from "@/components/line-chart";
import { TableCard } from "@/components/table-card";
import { getGrowth, getMarket, getMarketsOverview, getProducts } from "@/lib/api";

export default async function DashboardPage() {
  const region = "US";
  const [market, products, growth, markets] = await Promise.all([
    getMarket(region),
    getProducts({ region, min_score: 55 }),
    getGrowth(region),
    getMarketsOverview(),
  ]);

  const topProducts = products.items.slice(0, 5);
  const trendXAxis = growth.product_growth.slice(0, 8).map((item) => String(item.name_cn));
  const trendSeries = [
    {
      name: "增长",
      data: growth.product_growth.slice(0, 8).map((item) => Number(item.growth_score)),
    },
    {
      name: "热度",
      data: growth.product_growth.slice(0, 8).map((item) => Number(item.heat_score)),
    },
  ];

  const regionRows = markets.items.slice(0, 7).map((item) => [
    item.region,
    item.product_count,
    `${(item.avg_growth * 100).toFixed(1)}%`,
    item.avg_score.toFixed(1),
    `$${item.avg_budget_daily.toFixed(0)}`,
    item.judgement,
  ]);
  const quickPlan = topProducts.map((item, idx) => [
    idx + 1,
    item.name_cn,
    `${item.recommendation} / $${item.budget_daily.toFixed(0)}-day`,
  ]);

  return (
    <div className="space-y-6">
      <section className="card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[radial-gradient(circle,_rgba(91,141,255,0.35)_0%,_rgba(91,141,255,0)_70%)]" />
        <div className="pointer-events-none absolute -bottom-8 left-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,_rgba(39,213,170,0.2)_0%,_rgba(39,213,170,0)_70%)]" />
        <h1 className="text-xl font-semibold text-white md:text-2xl">
          跨境赚钱操作系统（私人版）
          <span className="ml-2 rounded-full border border-[var(--border-main)] bg-white/5 px-2 py-0.5 text-xs text-[var(--text-muted)]">
            Data OS v0.3
          </span>
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--text-muted)]">
          少数据、多结论：打开 30 秒内，知道今天看什么、测什么、投多少钱。新增收藏、日报与预算模拟，形成完整执行闭环。
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard title="当前区域产品数" value={market.kpis.product_count} tone="blue" />
        <KpiCard title="品类总数" value={market.kpis.category_count} tone="green" />
        <KpiCard title="广告信号总量" value={market.kpis.ads_count} tone="orange" />
        <KpiCard title="新趋势信号" value={market.kpis.new_trend_count} tone="purple" />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <TableCard
            title="今日重点产品（US Top 5）"
            description="优先看“总分 + 建议 + 日预算”，作为今天投放待办。"
            columns={["产品中文", "市场", "总分", "建议", "日预算"]}
            rows={topProducts.map((item) => [
              item.name_cn,
              item.market,
              item.score.toFixed(1),
              item.recommendation,
              `$${item.budget_daily.toFixed(0)}`,
            ])}
          />
        </div>
        <div className="card">
          <h2 className="mb-3 text-lg font-semibold">增长/热度趋势（US）</h2>
          <p className="mb-3 text-xs text-[var(--text-muted)]">
            绿色线看增长，蓝色线看热度，优先寻找“增长先抬头”的产品。
          </p>
          <LineChart x={trendXAxis} series={trendSeries} />
        </div>
      </section>

      <section>
        <TableCard
          title="分区判断（Markets Overview）"
          description="做跨境时先看区域优先级，再决定把预算放在哪个市场。"
          columns={["区域", "产品数", "平均增长", "平均分", "日预算均值", "判断"]}
          rows={regionRows}
        />
      </section>

      <section>
        <TableCard
          title="今日执行清单（30 秒版）"
          description="给你直接可执行的动作：先看、先测、先投。"
          columns={["优先级", "产品", "动作"]}
          rows={quickPlan}
        />
      </section>
    </div>
  );
}
