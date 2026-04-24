"use client";

import { useI18n } from "@/lib/i18n";
import { SectionHeader } from "@/components/SectionHeader";

export function CoreFeatures() {
  const { t } = useI18n();
  const items = [
    {
      titleKey: "core.f1.title",
      descKey: "core.f1.desc",
      icon: (
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      ),
      tone: "from-mint-400/20",
    },
    {
      titleKey: "core.f2.title",
      descKey: "core.f2.desc",
      icon: <path d="M3 17l5-6 4 4 4-8 5 10" />,
      tone: "from-sky-500/20",
    },
    {
      titleKey: "core.f3.title",
      descKey: "core.f3.desc",
      icon: (
        <>
          <path d="M12 2l2.5 5 5.5.8-4 3.9 1 5.5L12 14.7 6.9 17.2l1-5.5L4 7.8 9.5 7z" />
        </>
      ),
      tone: "from-violet-500/20",
    },
  ];
  return (
    <section className="section">
      <div className="container-wide">
        <SectionHeader
          eyebrow={t("core.eyebrow")}
          title={t("core.title")}
          align="left"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.titleKey}
              className={
                "card relative overflow-hidden bg-gradient-to-br " +
                item.tone +
                " via-white/[0.02] to-white/[0.02] transition hover:-translate-y-0.5 hover:shadow-glow"
              }
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
              <div className="relative">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-mint-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    {item.icon}
                  </svg>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">
                  {t(item.titleKey)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {t(item.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
