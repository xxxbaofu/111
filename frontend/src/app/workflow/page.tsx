import { TableCard } from "@/components/table-card";
import {
  deleteWorkflowTask,
  getWorkflowTasks,
  upsertWorkflowTask,
  type Region,
  type WorkflowTaskRow,
} from "@/lib/api";

type WorkflowPageProps = {
  searchParams?: Promise<{ region?: Region; action?: "seed" | "cleanup"; task_id?: string }>;
};

const REGION_OPTIONS: Region[] = ["US", "UK", "EU", "SEA", "JP", "KR", "XHS"];
const STATUS_ORDER: Array<WorkflowTaskRow["status"]> = ["待测试", "测试中", "复盘中", "停投"];

async function _applyQuickAction(
  region: Region,
  action?: "seed" | "cleanup",
  taskIdRaw?: string
): Promise<void> {
  if (action === "seed") {
    const base = await getWorkflowTasks(region);
    if (base.count === 0) {
      const workbench = await import("@/lib/api").then((m) => m.getWorkbench(region));
      for (const item of workbench.top_products.slice(0, 4)) {
        await upsertWorkflowTask({
          product_id: item.id,
          region,
          status: "待测试",
          priority: 2,
          owner: "self",
          note: "快速创建：等待验证素材点击率。",
          next_action: "准备 3 条素材并设置 $20/day 小预算。",
        });
      }
    }
  }
  if (action === "cleanup" && taskIdRaw) {
    const taskId = Number(taskIdRaw);
    if (Number.isFinite(taskId) && taskId > 0) {
      await deleteWorkflowTask(taskId);
    }
  }
}

export default async function WorkflowPage({ searchParams }: WorkflowPageProps) {
  const params = (await searchParams) ?? {};
  const region = params.region ?? "US";
  await _applyQuickAction(region, params.action, params.task_id);

  const tasks = await getWorkflowTasks(region);
  const grouped = STATUS_ORDER.map((status) => ({
    status,
    rows: tasks.items.filter((item) => item.status === status),
  }));

  const summaryRows = grouped.map((group) => {
    const avgScore =
      group.rows.length === 0
        ? 0
        : group.rows.reduce((sum, item) => sum + item.score, 0) / group.rows.length;
    return [group.status, group.rows.length, avgScore.toFixed(1)];
  });

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h1 className="text-2xl font-semibold">执行看板（{region}）</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          用状态流管理你的私有执行流程：待测试 -&gt; 测试中 -&gt; 复盘中 -&gt; 停投。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {REGION_OPTIONS.map((r) => (
            <a
              key={r}
              href={`/workflow?region=${r}`}
              className={`rounded-md border px-2 py-1 text-xs ${
                r === region
                  ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]/20 text-white"
                  : "border-white/15 text-[var(--text-muted)] hover:border-white/30 hover:text-white"
              }`}
            >
              {r}
            </a>
          ))}
          <a
            href={`/workflow?region=${region}&action=seed`}
            className="rounded-md border border-[var(--accent)] bg-[var(--accent)]/15 px-2 py-1 text-xs text-[var(--accent)]"
          >
            自动创建今日任务
          </a>
        </div>
      </section>

      <TableCard
        title="任务概览"
        description="先看每个阶段有多少任务，再决定今天主攻哪一步。"
        columns={["状态", "任务数", "平均分"]}
        rows={summaryRows}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        {grouped.map((group) => (
          <TableCard
            key={group.status}
            title={`${group.status}（${group.rows.length}）`}
            columns={["产品", "分数", "预算/日", "优先级", "下一步", "操作"]}
            rows={group.rows.map((item) => [
              item.product_name,
              item.score.toFixed(1),
              `$${item.budget_daily.toFixed(0)}`,
              item.priority,
              item.next_action || "待补充",
              `删除(${item.id})`,
            ])}
          />
        ))}
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-[var(--text-muted)]">
        快速操作：点击上方“自动创建今日任务”会从高分产品自动生成待测试任务。删除任务可用：
        <code className="ml-1">/workflow?region=US&amp;action=cleanup&amp;task_id=任务ID</code>
      </section>
    </div>
  );
}
