"use client";

import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/PageHero";

export default function TechnologyPage() {
  const { t } = useI18n();
  const pillars = [
    {
      key: "ownership",
      titleKey: "tech.ownership.title",
      descKey: "tech.ownership.desc",
    },
    {
      key: "privacy",
      titleKey: "tech.privacy.title",
      descKey: "tech.privacy.desc",
    },
    {
      key: "model",
      titleKey: "tech.model.title",
      descKey: "tech.model.desc",
    },
    {
      key: "decentral",
      titleKey: "tech.decentral.title",
      descKey: "tech.decentral.desc",
    },
  ];
  return (
    <>
      <PageHero title={t("tech.title")} sub={t("tech.sub")} />

      <section className="section">
        <div className="container-wide grid gap-6 lg:grid-cols-2">
          {pillars.map((p, idx) => (
            <div key={p.key} className="card relative overflow-hidden">
              <div
                aria-hidden
                className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-mint-400/15 to-transparent blur-2xl"
              />
              <div className="relative">
                <span className="text-xs text-white/40">
                  0{idx + 1}/0{pillars.length}
                </span>
                <h3 className="mt-3 font-display text-2xl font-semibold">
                  {t(p.titleKey)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {t(p.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="container-wide mt-16">
          <ArchitectureDiagram />
        </div>
      </section>
    </>
  );
}

function ArchitectureDiagram() {
  const { t } = useI18n();
  const rows = [
    {
      title: "Device",
      items: ["Apple Health", "Wearables", "Manual"],
    },
    {
      title: "On-Device AI",
      items: [t("tech.privacy.title"), t("tech.model.title")],
    },
    {
      title: "Encrypted Sync",
      items: [t("tech.ownership.title"), t("tech.decentral.title")],
    },
  ];
  return (
    <div className="glass overflow-hidden">
      <div className="grid gap-0 divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
        {rows.map((r) => (
          <div key={r.title} className="p-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
              {r.title}
            </p>
            <ul className="mt-4 grid gap-2">
              {r.items.map((it) => (
                <li
                  key={it}
                  className="rounded-lg border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
                >
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
