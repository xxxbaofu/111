"use client";

import { useI18n } from "@/lib/i18n";
import { SectionHeader } from "@/components/SectionHeader";

export function Infrastructure() {
  const { t } = useI18n();
  const pillars = [
    {
      key: "sovereignty",
      titleKey: "infra.sovereignty.title",
      descKey: "infra.sovereignty.desc",
      icon: <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" />,
    },
    {
      key: "privacy",
      titleKey: "infra.privacy.title",
      descKey: "infra.privacy.desc",
      icon: (
        <>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 1 1 8 0v3" />
        </>
      ),
    },
    {
      key: "model",
      titleKey: "infra.model.title",
      descKey: "infra.model.desc",
      icon: (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
        </>
      ),
    },
    {
      key: "decentral",
      titleKey: "infra.decentral.title",
      descKey: "infra.decentral.desc",
      icon: (
        <>
          <circle cx="6" cy="6" r="2" />
          <circle cx="18" cy="6" r="2" />
          <circle cx="6" cy="18" r="2" />
          <circle cx="18" cy="18" r="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 6l6 6M18 6l-6 6M6 18l6-6M18 18l-6-6" />
        </>
      ),
    },
  ];
  return (
    <section className="section">
      <div className="container-wide">
        <SectionHeader
          eyebrow={t("infra.eyebrow")}
          title={t("infra.title")}
          sub={t("infra.sub")}
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <div key={p.key} className="card">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-300">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {p.icon}
                </svg>
              </div>
              <h3 className="mt-4 font-display text-base font-semibold">
                {t(p.titleKey)}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                {t(p.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
