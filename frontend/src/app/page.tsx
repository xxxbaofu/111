import { KpiCard } from "@/components/kpi-card";
import { LineChart } from "@/components/line-chart";
import { TableCard } from "@/components/table-card";
import { getGrowth, getMarket, getProducts } from "@/lib/api";

export default async function DashboardPage() {
  const region = "US";
  const [market, products, growth] = await Promise.all([
    getMarket(region),
    getProducts({ region }),
    getGrowth(region),
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

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard title="产品总数" value={market.kpis.product_count} tone="blue" />
        <KpiCard title="品类总数" value={market.kpis.category_count} tone="green" />
        <KpiCard title="广告总量" value={market.kpis.ads_count} tone="orange" />
        <KpiCard title="新趋势信号" value={market.kpis.new_trend_count} tone="purple" />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">今日重点产品（Top 5）</h2>
          <TableCard
            title="重点产品"
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
          <h2 className="mb-3 text-lg font-semibold">产品增长趋势</h2>
          <LineChart x={trendXAxis} series={trendSeries} />
        </div>
      </section>
    </div>
  );
}
