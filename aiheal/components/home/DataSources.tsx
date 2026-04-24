"use client";

import { useI18n } from "@/lib/i18n";
import { SectionHeader } from "@/components/SectionHeader";

export function DataSources() {
  const { t } = useI18n();
  const items = [
    {
      key: "apple",
      label: "ds.apple",
      icon: (
        <path d="M16.5 3c-1.5 0-2.9.8-3.7 2-0.7-1.2-2-2-3.6-2A4.2 4.2 0 0 0 5 7.2c0 5 5.6 10.3 7.3 11.6 1.7-1.3 7.3-6.6 7.3-11.6A4.2 4.2 0 0 0 16.5 3z" />
      ),
    },
    {
      key: "device",
      label: "ds.device",
      icon: (
        <>
          <rect x="6" y="3" width="12" height="18" rx="3" />
          <path d="M10 7h4M10 17h4" />
        </>
      ),
    },
    {
      key: "manual",
      label: "ds.manual",
      icon: <path d="M4 20l4-1 11-11-3-3L5 16l-1 4zM14 7l3 3" />,
    },
    {
      key: "medical",
      label: "ds.medical",
      icon: (
        <>
          <path d="M6 3h9l3 3v15H6z" />
          <path d="M9 13h6M12 10v6" />
        </>
      ),
    },
  ];

  return (
    <section className="section">
      <div className="container-wide">
        <SectionHeader
          eyebrow={t("ds.eyebrow")}
          title={t("ds.title")}
          sub={t("ds.sub")}
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {items.map((i) => (
            <div
              key={i.key}
              className="glass flex items-center gap-3 px-5 py-4 text-sm"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-mint-300">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {i.icon}
                </svg>
              </span>
              <span className="font-medium text-white/85">{t(i.label)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
