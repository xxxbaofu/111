type KpiCardProps = {
  title: string;
  value: string | number;
  hint?: string;
  tone?: "green" | "red" | "orange" | "blue" | "purple";
};

const toneMap: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  green: "text-[#22C55E]",
  red: "text-[#EF4444]",
  orange: "text-[#F97316]",
  blue: "text-[#3B82F6]",
  purple: "text-[#A855F7]",
};

export function KpiCard({ title, value, hint, tone = "blue" }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition hover:bg-[var(--surface-hover)]">
      <div className="text-sm text-[var(--text-muted)]">{title}</div>
      <div className={`mt-2 text-3xl font-bold ${toneMap[tone]}`}>{value}</div>
      {hint ? <div className="mt-2 text-xs text-[var(--text-muted)]">{hint}</div> : null}
    </div>
  );
}
