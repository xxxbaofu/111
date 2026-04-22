import Link from "next/link";

import { KpiCard } from "@/components/kpi-card";
import { TableCard } from "@/components/table-card";
import { getOpportunityBrief, type Region } from "@/lib/api";

type OpportunitiesPageProps = {
  searchParams?: Promise<{ region?: Region; budget_limit?: string }>;
};

const REGION_OPTIONS: Region[] = ["US", "UK", "EU", "SEA", "JP", "KR", "XHS"];

export default async function OpportunitiesPage({ searchParams }: OpportunitiesPageProps) {
  const params = (await searchParams) ?? {};
  const region = params.region ?? "US";
  const budgetLimitRaw = Number(params.budget_limit);
  const budgetLimit =
    Number.isFinite(budgetLimitRaw) && budgetLimitRaw > 0 ? budgetLimitRaw : undefined;
  const brief = await getOpportunityBrief({ region, budget_limit: budgetLimit });

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-2xl font-semibold">机会中枢（{region}）</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          一屏告诉你：哪些是快赢机会、哪些是高风险项、预算是否过度集中。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {REGION_OPTIONS.map((r) => (
            <Link
              key={r}
              href={`/opportunities?region=${r}${budgetLimit ? `&budget_limit=${budgetLimit}` : ""}`}
              className={`rounded-md border px-2 py-1 text-xs ${
                r === region
                  ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]/20 text-white"
                  : "border-white/15 text-[var(--text-muted)] hover:border-white/30 hover:text-white"
              }`}
            >
              {r}
            </Link>
          ))}
          <Link
            href={`/opportunities?region=${region}&budget_limit=50`}
            className="rounded-md border border-white/15 px-2 py-1 text-xs text-[var(--text-muted)] hover:border-white/30 hover:text-white"
          >
            仅看日预算 ≤ $50
          </Link>
          <Link
            href={`/opportunities?region=${region}`}
            className="rounded-md border border-white/15 px-2 py-1 text-xs text-[var(--text-muted)] hover:border-white/30 hover:text-white"
          >
            清空预算筛选
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard title="机会数" value={brief.opportunities.length} tone="blue" />
        <KpiCard title="快赢机会" value={brief.quick_wins.length} tone="green" />
        <KpiCard title="风险提醒" value={brief.risk_alerts.length} tone="orange" />
        <KpiCard title="预算健康" value={brief.budget_guardrail.health} tone="purple" />
      </section>

      <TableCard
        title="Top机会清单"
        description="先从高分+高增+可控竞争开始，避免一次铺太多。"
        columns={["产品", "分数", "增长", "竞争", "日预算", "建议", "操作"]}
        rows={brief.opportunities.map((item) => [
          `${item.name_cn}（${item.name_en}）`,
          item.score.toFixed(1),
          item.growth_score.toFixed(3),
          item.competition_score.toFixed(1),
          `$${item.budget_daily.toFixed(0)}`,
          item.recommendation,
          <Link
            key={`opportunity-${item.id}`}
            href={`/product/${item.id}?region=${region}`}
            className="text-[var(--accent-blue)] hover:underline"
          >
            进入作战页
          </Link>,
        ])}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <TableCard
          title="快赢机会（Quick Wins）"
          description="优先做低竞争、可快速验证的产品。"
          columns={["产品", "分数", "理由"]}
          rows={brief.quick_wins.map((item) => [item.name_cn, item.score.toFixed(1), item.why])}
        />
        <TableCard
          title="风险提醒（Risk Alerts）"
          description="风险高不代表不能做，代表先控预算和验证节奏。"
          columns={["产品", "分数", "风险"]}
          rows={brief.risk_alerts.map((item) => [item.name_cn, item.score.toFixed(1), item.risk])}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <TableCard
          title="品类动量"
          description="看品类平均分和平均增长，决定你今天重点跟哪几个赛道。"
          columns={["品类", "平均分", "平均增长", "产品数"]}
          rows={brief.category_momentum.map((row) => [
            row.category,
            row.avg_score.toFixed(1),
            `${(row.avg_growth * 100).toFixed(1)}%`,
            row.product_count,
          ])}
        />
        <TableCard
          title="预算护栏"
          description="避免把预算过度压在单个产品，降低整体波动风险。"
          columns={["总日预算", "Top1占比", "Top3占比", "健康度", "建议"]}
          rows={[
            [
              `$${brief.budget_guardrail.total_daily_budget.toFixed(0)}`,
              `${(brief.budget_guardrail.top1_budget_ratio * 100).toFixed(1)}%`,
              `${(brief.budget_guardrail.top3_budget_ratio * 100).toFixed(1)}%`,
              brief.budget_guardrail.health,
              brief.budget_guardrail.suggestion,
            ],
          ]}
        />
      </section>
    </div>
  );
}
