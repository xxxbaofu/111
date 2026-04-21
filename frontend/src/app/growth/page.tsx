import { LineChart } from "@/components/line-chart";
import { TableCard } from "@/components/table-card";
import { getGrowth } from "@/lib/api";

export default async function GrowthPage() {
  const growth = await getGrowth("US");

  const catX = growth.category_growth.slice(0, 10).map((item) => String(item.category));
  const catSeries = [
    {
      name: "增长",
      data: growth.category_growth
        .slice(0, 10)
        .map((item) => Number(item.growth_score) * 100),
    },
  ];
  const productX = growth.product_growth
    .slice(0, 10)
    .map((item) => `${item.name_cn as string}`);
  const productSeries = [
    {
      name: "产品增长",
      data: growth.product_growth
        .slice(0, 10)
        .map((item) => Number(item.growth_score) * 100),
    },
  ];
  const platformRows = growth.platform_growth.map((item) => [
    String(item.platform),
    Number(item.ads_count).toString(),
    Number(item.avg_appear).toFixed(2),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Growth（最重要）</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 text-lg font-semibold">品类增长</h2>
          <LineChart x={catX} series={catSeries} />
        </div>
        <div className="card">
          <h2 className="mb-3 text-lg font-semibold">产品增长 Top10</h2>
          <LineChart x={productX} series={productSeries} />
        </div>
      </div>
      <TableCard
        title="平台增长"
        columns={["平台", "广告条数", "平均出现次数"]}
        rows={platformRows}
      />
    </div>
  );
}
