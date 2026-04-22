import { TableCard } from "@/components/table-card";
import { getCategories, type Region } from "@/lib/api";

type CategoryPageProps = {
  searchParams?: Promise<{ region?: Region; keyword?: string }>;
};

export default async function CategoryPage({ searchParams }: CategoryPageProps) {
  const params = (await searchParams) ?? {};
  const region = params.region ?? "US";
  const keyword = params.keyword;
  const categories = await getCategories({ region, keyword });
  const rows = categories.items.map((item) => [
    item.name,
    item.product_count,
    `${(item.growth_score * 100).toFixed(1)}%`,
    item.heat_score.toFixed(2),
    `$${item.avg_price.toFixed(2)}`,
  ]);

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h1 className="text-2xl font-semibold">Category（品类雷达）</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          先看品类增长和平均价格，再决定今天测试哪个赛道。
        </p>
      </div>
      <TableCard
        title={`品类机会列表（${region}）`}
        description="建议优先看：增长率 > 20% 且产品数>5 的品类。"
        columns={["品类", "产品数", "增长", "热度", "均价"]}
        rows={rows}
      />
    </section>
  );
}
