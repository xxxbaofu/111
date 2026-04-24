"use client";

import { useI18n } from "@/lib/i18n";
import { SectionHeader } from "@/components/SectionHeader";

export function UseCases() {
  const { t } = useI18n();
  const items = [
    { key: "office", titleKey: "uc.office.title", descKey: "uc.office.desc" },
    { key: "family", titleKey: "uc.family.title", descKey: "uc.family.desc" },
    { key: "fitness", titleKey: "uc.fitness.title", descKey: "uc.fitness.desc" },
    { key: "chronic", titleKey: "uc.chronic.title", descKey: "uc.chronic.desc" },
  ];
  return (
    <section className="section">
      <div className="container-wide">
        <SectionHeader eyebrow={t("uc.eyebrow")} title={t("uc.title")} />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((i, idx) => (
            <div
              key={i.key}
              className="card group relative overflow-hidden transition hover:-translate-y-0.5"
            >
              <div
                aria-hidden
                className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-mint-400/20 via-sky-500/15 to-transparent blur-2xl"
              />
              <div className="relative">
                <div className="inline-flex h-7 items-center rounded-full border border-white/10 bg-white/[0.04] px-2 text-[10px] uppercase tracking-[0.18em] text-white/60">
                  0{idx + 1}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {t(i.titleKey)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {t(i.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
