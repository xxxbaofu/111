"use client";

import { useI18n } from "@/lib/i18n";

const spark = [62, 68, 71, 66, 74, 79, 77, 82, 80, 84, 82, 86, 82];

export function PhoneReport({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return (
    <div
      className={
        "relative mx-auto w-full max-w-sm " +
        (compact ? "sm:max-w-sm" : "sm:max-w-md")
      }
    >
      <div
        className="absolute -inset-8 -z-10 rounded-[48px] bg-gradient-to-br from-mint-400/15 via-sky-500/10 to-transparent blur-3xl"
        aria-hidden
      />
      <div className="relative rounded-[40px] border border-white/10 bg-ink-900 p-2 shadow-card">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-ink-800 to-ink-900">
          <div className="flex items-center justify-between px-5 pb-2 pt-3 text-[10px] text-white/70">
            <span>9:41</span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
              AIHeal
            </span>
            <span>100%</span>
          </div>

          <div className="px-5 pb-5 pt-2">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-mint-400/15 via-sky-500/10 to-transparent p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                {t("demo.score.label")}
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="font-display text-5xl font-semibold tracking-tight">
                  82
                </span>
                <span className="pb-2 text-xs text-white/50">/ 100</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-400/15 px-2 py-0.5 text-mint-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
                  {t("demo.score.state")}
                </span>
                <span className="text-white/40">+4 vs last week</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                {t("demo.findings")}
              </p>
              <ul className="mt-2 space-y-1.5 text-[13px] text-white/80">
                <li className="flex items-start gap-2">
                  <Dot color="amber" /> {t("demo.finding1")}
                </li>
                <li className="flex items-start gap-2">
                  <Dot color="rose" /> {t("demo.finding2")}
                </li>
                <li className="flex items-start gap-2">
                  <Dot color="sky" /> {t("demo.finding3")}
                </li>
              </ul>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-amber-200/80">
                {t("demo.risk")}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/80">
                {t("demo.risk.body")}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                {t("demo.trend")}
              </p>
              <Sparkline values={spark} />
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-16 bottom-[-22px] h-10 rounded-full bg-black/40 blur-2xl" />
    </div>
  );
}

function Dot({ color }: { color: "amber" | "rose" | "sky" }) {
  const map = {
    amber: "bg-amber-300",
    rose: "bg-rose-300",
    sky: "bg-sky-300",
  } as const;
  return (
    <span className={"mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full " + map[color]} />
  );
}

function Sparkline({ values }: { values: number[] }) {
  const w = 280;
  const h = 64;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 4;
  const step = (w - pad * 2) / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = pad + i * step;
    const y =
      pad + (h - pad * 2) - ((v - min) / Math.max(1, max - min)) * (h - pad * 2);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const d = "M" + pts.join(" L ");
  const area = `${d} L ${w - pad},${h - pad} L ${pad},${h - pad} Z`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-2 h-16 w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="gline" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2ee39b" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#2ee39b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#gline)" />
      <path d={d} fill="none" stroke="#2ee39b" strokeWidth="2" />
    </svg>
  );
}
