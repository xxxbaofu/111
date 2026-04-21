import { TableCard } from "@/components/table-card";
import { getLeaders } from "@/lib/api";

export default async function LeadersPage() {
  const data = await getLeaders("US");
  const productRows = data.leaders.product.map((item) => [
    item.name,
    item.market,
    item.score.toFixed(2),
    item.growth.toFixed(3),
  ]);
  const shopRows = data.leaders.shop.map((item) => [
    item.name,
    item.market,
    item.score.toFixed(2),
    item.growth.toFixed(3),
  ]);
  const creatorRows = data.leaders.creator.map((item) => [
    item.name,
    item.market,
    item.score.toFixed(2),
    item.growth.toFixed(3),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Leaders（头部）</h1>
      <TableCard
        title="Top 产品"
        columns={["名称", "市场", "分数", "增长"]}
        rows={productRows}
      />
      <TableCard
        title="Top 店铺"
        columns={["名称", "市场", "分数", "增长"]}
        rows={shopRows}
      />
      <TableCard
        title="Top 创作者"
        columns={["名称", "市场", "分数", "增长"]}
        rows={creatorRows}
      />
    </div>
  );
}
