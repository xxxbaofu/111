type BadgeProps = {
  text: string;
  variant?: "default" | "up" | "down" | "burst" | "blue" | "profit";
};

const variantClass: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-slate-700/60 text-slate-100 border border-slate-500/40",
  up: "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40",
  down: "bg-red-600/20 text-red-300 border border-red-500/40",
  burst: "bg-orange-600/20 text-orange-300 border border-orange-500/40",
  blue: "bg-blue-600/20 text-blue-300 border border-blue-500/40",
  profit: "bg-purple-600/20 text-purple-300 border border-purple-500/40",
};

export function Badge({ text, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${variantClass[variant]}`}
    >
      {text}
    </span>
  );
}
