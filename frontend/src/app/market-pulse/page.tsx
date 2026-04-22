import { LineChart } from "@/components/line-chart";
import { KpiCard } from "@/components/kpi-card";
import { TableCard } from "@/components/table-card";
import { getGrowth, getMarket, getMarketsOverview, type Region } from "@/lib/api";

type MarketPulsePageProps = {
  searchParams?: Promise<{ region?: Region }>;
};

export default async function MarketPulsePage({ searchParams }: MarketPulsePageProps) {
  const params = (await searchParams) ?? {};
  const region = params.region ?? "US";
  const [market, growth, overview] = await Promise.all([
    getMarket(region),
    getGrowth(region),
    getMarketsOverview(),
  ]);

  const categoryTop = growth.category_growth.slice(0, 8);
  const categoryXAxis = categoryTop.map((item) => item.category);
  const categorySeries = [
    {
      name: "增长",
      data: categoryTop.map((item) => Number((item.growth_score * 100).toFixed(1))),
    },
    {
      name: "热度",
      data: categoryTop.map((item) => Number(item.heat_score.toFixed(2))),
    },
  ];

  const platformTop = growth.platform_growth.slice(0, 8);
  const platformXAxis = platformTop.map((item) => item.platform);
  const platformSeries = [
    { name: "广告数量", data: platformTop.map((item) => item.ads_count) },
    { name: "平均出现", data: platformTop.map((item) => Number(item.avg_appear.toFixed(2))) },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h1 className="text-xl font-semibold text-white">Market Pulse（趋势判断）</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          先看区域，再看品类，再看平台：把“感觉”变成可执行的判断。
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard title="当前市场" value={market.region} tone="blue" />
        <KpiCard
          title="市场平均增长"
          value={`${(market.kpis.avg_growth * 100).toFixed(1)}%`}
          tone="green"
        />
        <KpiCard title="新趋势数量" value={market.kpis.new_trend_count} tone="orange" />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-2 text-lg font-semibold">品类热度/增长</h2>
          <p className="mb-3 text-xs text-[var(--text-muted)]">
            优先筛“增长领先且热度同步”的品类，避免只有热度没有增长的假信号。
          </p>
          <LineChart x={categoryXAxis} series={categorySeries} />
        </div>
        <div className="card">
          <h2 className="mb-2 text-lg font-semibold">平台贡献趋势</h2>
          <p className="mb-3 text-xs text-[var(--text-muted)]">
            看平台广告量与出现频次，决定你的流量入口优先级。
          </p>
          <LineChart x={platformXAxis} series={platformSeries} />
        </div>
      </section>

      <section>
        <TableCard
          title={`区域优先级判断（当前区域：${region}）`}
          description="这是私人操盘最关键的一步：先分区，再分预算。"
          columns={["区域", "产品数", "平均增长", "平均分", "判断"]}
          rows={overview.items.map((item) => [
            item.region,
            item.product_count,
            `${(item.avg_growth * 100).toFixed(1)}%`,
            item.avg_score.toFixed(1),
            item.judgement,
          ])}
        />
      </section>
    </div>
  );
}
