import { LineChart } from "@/components/line-chart";
import { TableCard } from "@/components/table-card";
import { getGrowth, type Region } from "@/lib/api";

type GrowthPageProps = {
  searchParams?: Promise<{ region?: Region }>;
};

export default async function GrowthPage({ searchParams }: GrowthPageProps) {
  const params = (await searchParams) ?? {};
  const region = params.region ?? "US";
  const growth = await getGrowth(region);

  const catX = growth.category_growth.slice(0, 10).map((item) => String(item.category));
  const catSeries = [
    {
      name: "品类增长",
      data: growth.category_growth.slice(0, 10).map((item) => Number(item.growth_score) * 100),
    },
  ];
  const productX = growth.product_growth.slice(0, 10).map((item) => item.name_cn);
  const productSeries = [
    {
      name: "产品增长",
      data: growth.product_growth.slice(0, 10).map((item) => Number(item.growth_score) * 100),
    },
  ];
  const platformRows = growth.platform_growth.map((item) => [
    item.platform,
    item.ads_count,
    item.avg_appear.toFixed(2),
  ]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h1 className="text-2xl font-semibold">Growth（最重要）- {region}</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          区域：{region}。
          先看增长，再看热度。增长领先于热度，通常是更好的早期机会。
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 text-lg font-semibold">品类增长 Top 10</h2>
          <LineChart x={catX} series={catSeries} />
        </div>
        <div className="card">
          <h2 className="mb-3 text-lg font-semibold">产品增长 Top 10</h2>
          <LineChart x={productX} series={productSeries} />
        </div>
      </div>

      <TableCard
        title="平台增长（广告信号）"
        description="广告条数上升且平均出现次数增加，通常代表平台侧竞争正在加速。"
        columns={["平台", "广告条数", "平均出现次数"]}
        rows={platformRows}
      />
    </div>
  );
}
