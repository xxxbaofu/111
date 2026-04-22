import Link from "next/link";

import { KpiCard } from "@/components/kpi-card";
import { TableCard } from "@/components/table-card";
import { getDailyReport, type Region } from "@/lib/api";

type DailyReportPageProps = {
  searchParams?: Promise<{ region?: Region }>;
};

const REGION_OPTIONS: Region[] = ["US", "UK", "EU", "SEA", "JP", "KR", "XHS"];

export default async function DailyReportPage({ searchParams }: DailyReportPageProps) {
  const params = (await searchParams) ?? {};
  const region = params.region ?? "US";
  const report = await getDailyReport(region);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h1 className="text-2xl font-semibold">自动日报（{region}）</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          每天自动给你：Top机会 + 预算建议 + 风险提醒。只看结论，直接执行。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {REGION_OPTIONS.map((r) => (
            <a
              key={r}
              href={`/daily-report?region=${r}`}
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

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="产品数" value={report.kpis.product_count} tone="blue" />
        <KpiCard title="品类数" value={report.kpis.category_count} tone="green" />
        <KpiCard title="广告信号" value={report.kpis.ads_count} tone="orange" />
        <KpiCard title="新趋势" value={report.kpis.new_trend_count} tone="purple" />
      </section>

      <TableCard
        title="今日Top机会（建议先测）"
        description="优先执行前 3 个，避免任务分散。"
        columns={["产品", "分数", "建议", "日预算", "预估日收入", "操作"]}
        rows={report.top_products.map((item) => [
          `${item.name_cn}（${item.name_en}）`,
          item.score.toFixed(1),
          item.recommendation,
          `$${item.budget_daily.toFixed(0)}`,
          `$${item.estimated_daily_revenue.toFixed(0)}`,
          <Link
            key={`daily-report-product-${item.id}`}
            href={`/product/${item.id}?region=${region}`}
            className="text-[var(--accent-blue)] hover:underline"
          >
            进入作战页
          </Link>,
        ])}
      />

      <TableCard
        title="预算建议（自动拆分）"
        description="核心测试 60%，探索 25%，风险储备 15%。"
        columns={["总日预算", "核心测试", "探索", "储备"]}
        rows={[
          [
            `$${report.budget_suggestion.total_daily_budget.toFixed(0)}`,
            `$${report.budget_suggestion.core_test_budget.toFixed(0)}`,
            `$${report.budget_suggestion.explore_budget.toFixed(0)}`,
            `$${report.budget_suggestion.reserve_budget.toFixed(0)}`,
          ],
        ]}
      />

      <TableCard
        title="执行流状态摘要"
        description="如果‘待测试’过高，说明你在囤积机会而不是推进验证。"
        columns={["待测试", "测试中", "复盘中", "停投"]}
        rows={[
          [
            report.workflow_summary["待测试"] ?? 0,
            report.workflow_summary["测试中"] ?? 0,
            report.workflow_summary["复盘中"] ?? 0,
            report.workflow_summary["停投"] ?? 0,
          ],
        ]}
      />

      <TableCard
        title="风险提醒（Top）"
        description="风险高不代表不能做，代表要先控制变量再投。"
        columns={["产品", "结论", "风险", "操作"]}
        rows={report.risk_alerts.map((item) => [
          item.name_cn,
          item.conclusion,
          item.risk,
          <Link
            key={`daily-report-risk-${item.product_id}`}
            href={`/workflow?region=${region}`}
            className="text-[var(--accent-blue)] hover:underline"
          >
            去执行看板
          </Link>,
        ])}
      />
    </div>
  );
}
