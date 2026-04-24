"use client";

import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/PageHero";

const sampleJson = `{
  "score": 82,
  "state": "good",
  "findings": [
    "sleep_quality_declined",
    "elevated_night_hr",
    "activity_-18%_w/w"
  ],
  "risk": {
    "type": "fatigue_accumulation",
    "confidence": 0.78
  },
  "actions": [
    "bed_30min_earlier",
    "cut_evening_blue_light",
    "light_movement_15min"
  ]
}`;

export default function DevelopersPage() {
  const { t } = useI18n();

  const pillars = [
    {
      key: "api",
      titleKey: "devs.api.title",
      descKey: "devs.api.desc",
      code: "POST /v1/report",
    },
    {
      key: "agent",
      titleKey: "devs.agent.title",
      descKey: "devs.agent.desc",
      code: "agent.ask('What changed this week?')",
    },
    {
      key: "sdk",
      titleKey: "devs.sdk.title",
      descKey: "devs.sdk.desc",
      code: "AIHeal.score(userData)",
    },
  ];
  return (
    <>
      <PageHero title={t("devs.title")} sub={t("devs.sub")} />

      <section className="section">
        <div className="container-wide grid gap-6 md:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.key} className="card">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60">
                {p.key}
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">
                {t(p.titleKey)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {t(p.descKey)}
              </p>
              <pre className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-ink-950/70 p-3 text-[11px] text-mint-200">
                <code>{p.code}</code>
              </pre>
            </div>
          ))}
        </div>

        <div className="container-wide mt-16 grid items-start gap-8 md:grid-cols-2">
          <div>
            <h3 className="font-display text-2xl font-semibold">
              /v1/report <span className="text-white/40">response</span>
            </h3>
            <p className="mt-2 text-sm text-white/70">
              {t("devs.api.desc")}
            </p>
          </div>
          <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/80 p-5 text-xs leading-relaxed text-white/80">
            <code>{sampleJson}</code>
          </pre>
        </div>
      </section>
    </>
  );
}
