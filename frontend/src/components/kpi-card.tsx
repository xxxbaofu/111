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

const toneGlowMap: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  green: "from-emerald-400/20 to-emerald-500/0",
  red: "from-red-400/20 to-red-500/0",
  orange: "from-orange-400/20 to-orange-500/0",
  blue: "from-blue-400/20 to-blue-500/0",
  purple: "from-purple-400/20 to-purple-500/0",
};

export function KpiCard({ title, value, hint, tone = "blue" }: KpiCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--border-main)] bg-[linear-gradient(145deg,rgba(20,30,56,0.78),rgba(13,20,38,0.86))] p-4 shadow-[0_14px_36px_rgba(3,7,16,0.32)] transition duration-300 hover:-translate-y-0.5 hover:border-white/20">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${toneGlowMap[tone]} opacity-80 transition group-hover:opacity-100`}
      />
      <div className="relative text-xs tracking-wide text-[var(--text-dim)]">{title}</div>
      <div className={`mt-2 text-3xl font-bold ${toneMap[tone]}`}>{value}</div>
      {hint ? <div className="relative mt-2 text-xs text-[var(--text-muted)]">{hint}</div> : null}
    </div>
  );
}
