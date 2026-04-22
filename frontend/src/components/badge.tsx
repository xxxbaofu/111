type BadgeProps = {
  text: string;
  variant?: "default" | "up" | "down" | "burst" | "blue" | "profit";
};

const variantClass: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default:
    "border border-[color:var(--border-main)] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] text-[#d6def3]",
  up: "border border-emerald-400/35 bg-emerald-500/15 text-emerald-300",
  down: "border border-red-400/35 bg-red-500/15 text-red-300",
  burst: "border border-orange-400/35 bg-orange-500/15 text-orange-300",
  blue: "border border-blue-400/35 bg-blue-500/15 text-blue-300",
  profit: "border border-fuchsia-400/35 bg-fuchsia-500/15 text-fuchsia-300",
};

export function Badge({ text, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${variantClass[variant]}`}
    >
      {text}
    </span>
  );
}
