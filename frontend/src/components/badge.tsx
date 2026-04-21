type BadgeProps = {
  text: string;
  variant?: "default" | "up" | "down" | "burst" | "blue" | "profit";
};

const variantClass: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-slate-700 text-slate-100",
  up: "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40",
  down: "bg-red-600/30 text-red-300 border border-red-500/40",
  burst: "bg-orange-600/30 text-orange-300 border border-orange-500/40",
  blue: "bg-blue-600/30 text-blue-300 border border-blue-500/40",
  profit: "bg-purple-600/30 text-purple-300 border border-purple-500/40",
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
