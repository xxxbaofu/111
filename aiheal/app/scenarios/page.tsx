"use client";

import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/PageHero";

export default function ScenariosPage() {
  const { t } = useI18n();
  const groups = [
    {
      key: "office",
      titleKey: "uc.office.title",
      descKey: "uc.office.desc",
      tag: "office_workers",
      bullets: [
        { zh: "压力感知", en: "Stress sensing" },
        { zh: "昼夜节律校准", en: "Circadian alignment" },
        { zh: "疲劳预警", en: "Fatigue alerts" },
      ],
    },
    {
      key: "family",
      titleKey: "uc.family.title",
      descKey: "uc.family.desc",
      tag: "family_health",
      bullets: [
        { zh: "父母基线追踪", en: "Parent baseline tracking" },
        { zh: "异常主动推送", en: "Proactive anomaly alerts" },
        { zh: "可共享报告", en: "Shareable reports" },
      ],
    },
    {
      key: "fitness",
      titleKey: "uc.fitness.title",
      descKey: "uc.fitness.desc",
      tag: "fitness_users",
      bullets: [
        { zh: "恢复度评分", en: "Recovery score" },
        { zh: "心率区间优化", en: "HR zone tuning" },
        { zh: "训练负荷建议", en: "Load suggestions" },
      ],
    },
    {
      key: "chronic",
      titleKey: "uc.chronic.title",
      descKey: "uc.chronic.desc",
      tag: "chronic_conditions",
      bullets: [
        { zh: "长期趋势", en: "Long-term trends" },
        { zh: "干预前后对比", en: "Pre/post intervention" },
        { zh: "导出给医生", en: "Export for clinicians" },
      ],
    },
  ];
  const { locale } = useI18n();
  return (
    <>
      <PageHero title={t("scenarios.title")} sub={t("scenarios.sub")} />

      <section className="section">
        <div className="container-wide grid gap-6 md:grid-cols-2">
          {groups.map((g, idx) => (
            <article
              key={g.key}
              className="card relative overflow-hidden transition hover:-translate-y-0.5"
            >
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-mint-400/15 via-sky-500/10 to-transparent blur-2xl"
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="eyebrow">{g.tag}</span>
                  <span className="text-xs text-white/40">0{idx + 1}</span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold">
                  {t(g.titleKey)}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {t(g.descKey)}
                </p>
                <ul className="mt-5 grid gap-2 text-sm text-white/80">
                  {g.bullets.map((b) => (
                    <li key={b.en} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
                      <span>{locale === "zh" ? b.zh : b.en}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
