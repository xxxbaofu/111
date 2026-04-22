import { TableCard } from "@/components/table-card";
import { getLeaders, type Region } from "@/lib/api";

type LeadersPageProps = {
  searchParams?: Promise<{ region?: Region }>;
};

export default async function LeadersPage({ searchParams }: LeadersPageProps) {
  const params = (await searchParams) ?? {};
  const region = params.region ?? "US";
  const data = await getLeaders(region);

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
  const regionOptions: Region[] = ["US", "UK", "EU", "SEA", "JP", "KR", "XHS"];

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-2xl font-semibold text-white">头部玩家（Leaders）</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          区域：{region}。看头部产品、店铺、创作者，帮助你判断市场是否进入强竞争阶段。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {regionOptions.map((r) => (
            <a
              key={r}
              href={`/leaders?region=${r}`}
              className={`rounded-md border px-2 py-1 text-xs ${
                r === region
                  ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]/20 text-white"
                  : "border-white/15 text-[var(--text-muted)] hover:border-white/30 hover:text-white"
              }`}
            >
              {r}
            </a>
          ))}
        </div>
      </section>

      <TableCard
        title="Top 产品"
        description="对标头部产品的素材结构和价格带。"
        columns={["名称", "市场", "分数", "增长"]}
        rows={productRows}
      />
      <TableCard
        title="Top 店铺"
        description="追踪头部店铺扩品节奏和定价策略。"
        columns={["名称", "市场", "分数", "增长"]}
        rows={shopRows}
      />
      <TableCard
        title="Top 创作者"
        description="优先复盘增长快的创作者内容框架。"
        columns={["名称", "市场", "分数", "增长"]}
        rows={creatorRows}
      />
    </div>
  );
}
