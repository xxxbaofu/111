import { LineChart } from "@/components/line-chart";
import { KpiCard } from "@/components/kpi-card";
import { getGrowth, getMarket } from "@/lib/api";

export default async function MarketPulsePage() {
  const [market, growth] = await Promise.all([getMarket("US"), getGrowth("US")]);

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
    {
      name: "广告数量",
      data: platformTop.map((item) => item.ads_count),
    },
    {
      name: "平均出现",
      data: platformTop.map((item) => Number(item.avg_appear.toFixed(2))),
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard title="市场" value={market.region} tone="blue" />
        <KpiCard
          title="平均增长"
          value={`${(market.kpis.avg_growth * 100).toFixed(1)}%`}
          tone="green"
        />
        <KpiCard title="新趋势数量" value={market.kpis.new_trend_count} tone="orange" />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 text-lg font-semibold">品类热度/增长趋势</h2>
          <LineChart x={categoryXAxis} series={categorySeries} />
        </div>
        <div className="card">
          <h2 className="mb-3 text-lg font-semibold">平台贡献趋势</h2>
          <LineChart x={platformXAxis} series={platformSeries} />
        </div>
      </section>
    </div>
  );
}
