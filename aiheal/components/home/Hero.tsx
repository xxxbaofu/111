"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { PhoneReport } from "@/components/PhoneReport";

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden pt-16 sm:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[620px] w-[1100px] max-w-full bg-grid-fade"
      />
      <div className="container-wide grid gap-12 pb-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:pb-28">
        <div>
          <span className="eyebrow">{t("hero.eyebrow")}</span>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl md:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            {t("hero.sub")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/download" className="btn-primary">
              {t("hero.primary")}
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/demo" className="btn-ghost">
              {t("hero.secondary")}
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2 text-xs text-white/60">
            {[t("hero.badge1"), t("hero.badge2"), t("hero.badge3")].map((b) => (
              <li
                key={b}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <PhoneReport />
        </div>
      </div>
      <div className="hairline" />
    </section>
  );
}
