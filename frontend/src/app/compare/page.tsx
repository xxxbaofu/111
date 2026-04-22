import Link from "next/link";

import { TableCard } from "@/components/table-card";
import { getProducts, getProductsCompare, type Region } from "@/lib/api";

type ComparePageProps = {
  searchParams?: Promise<{ region?: Region; ids?: string }>;
};

const REGION_OPTIONS: Region[] = ["US", "UK", "EU", "SEA", "JP", "KR", "XHS"];

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = (await searchParams) ?? {};
  const region = params.region ?? "US";

  const products = await getProducts({ region, min_score: 60 });
  const defaultIds = products.items
    .slice(0, 3)
    .map((item) => item.id)
    .join(",");
  const ids = params.ids && params.ids.trim().length > 0 ? params.ids : defaultIds;

  let compareError: string | null = null;
  let compare:
    | Awaited<ReturnType<typeof getProductsCompare>>
    | null = null;
  try {
    compare = await getProductsCompare({ region, ids });
  } catch {
    compareError = "对比参数无效，请至少传入 2 个有效产品 ID。";
  }

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-2xl font-semibold">产品对比台（{region}）</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          解决“多个产品都不错，先做哪个”的问题：横向比增长、竞争、预算、效率，直接给出建议赢家。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {REGION_OPTIONS.map((r) => (
            <Link
              key={r}
              href={`/compare?region=${r}`}
              className={`rounded-md border px-2 py-1 text-xs ${
                r === region
                  ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]/20 text-white"
                  : "border-white/15 text-[var(--text-muted)] hover:border-white/30 hover:text-white"
              }`}
            >
              {r}
            </Link>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="text-base font-semibold">快捷对比入口</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          点击后自动带入 3 个候选产品进行横向对比。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {products.items.slice(0, 5).map((item, idx) => {
            const chosen = products.items
              .slice(idx, idx + 3)
              .map((x) => x.id);
            if (chosen.length < 2) return null;
            return (
              <Link
                key={`compare-quick-${item.id}`}
                href={`/compare?region=${region}&ids=${chosen.join(",")}`}
                className="rounded-md border border-white/15 px-2 py-1 text-xs hover:border-white/30"
              >
                对比组：{chosen.join(",")}
              </Link>
            );
          })}
        </div>
      </section>

      {compareError || !compare ? (
        <section className="card text-sm text-[var(--danger)]">{compareError ?? "暂无可对比数据"}</section>
      ) : (
        <>
          <TableCard
            title="对比结果"
            description="重点看效率(预估收入/日预算)与风险等级，避免只看总分。"
            columns={[
              "产品",
              "分数",
              "增长",
              "竞争",
              "日预算",
              "预估日收入",
              "效率",
              "风险",
              "新手友好",
              "建议",
            ]}
            rows={compare.items.map((item) => [
              `${item.name_cn}（${item.name_en}）`,
              item.score.toFixed(1),
              item.growth_score.toFixed(3),
              item.competition_score.toFixed(1),
              `$${item.budget_daily.toFixed(0)}`,
              `$${item.estimated_daily_revenue.toFixed(0)}`,
              item.efficiency.toFixed(2),
              item.risk_level,
              item.newbie_fit ? "是" : "否",
              item.recommendation,
            ])}
          />

          <TableCard
            title="赢家结论"
            description="这是系统给你的“先做谁”答案，不再停留在纯展示数据。"
            columns={["建议优先产品", "得分", "为什么"]}
            rows={[[compare.winner.name_cn, compare.winner.score.toFixed(1), compare.winner.why]]}
          />

          <TableCard
            title="组合摘要"
            description="用于粗估对比组的预算占用和总收益效率。"
            columns={["总日预算", "总预估日收入", "平均效率"]}
            rows={[
              [
                `$${compare.summary.total_budget_daily.toFixed(0)}`,
                `$${compare.summary.total_estimated_daily_revenue.toFixed(0)}`,
                compare.summary.avg_efficiency.toFixed(2),
              ],
            ]}
          />
        </>
      )}
    </div>
  );
}
