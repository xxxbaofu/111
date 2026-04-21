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
    <div className="rounded-xl border border-[#1A2340] bg-[#12182B] p-4 shadow-sm transition hover:brightness-105">
      <div className="text-sm text-[#9CA8C3]">{title}</div>
      <div className={`mt-2 text-3xl font-bold ${toneMap[tone]}`}>{value}</div>
      {hint ? <div className="mt-2 text-xs text-[#9CA8C3]">{hint}</div> : null}
    </div>
  );
}
