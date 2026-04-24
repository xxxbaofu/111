"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export function DeveloperEntry() {
  const { t } = useI18n();
  return (
    <section className="section">
      <div className="container-wide">
        <div className="glass grid items-center gap-8 p-8 md:grid-cols-[1.1fr_0.9fr] md:p-12">
          <div>
            <span className="eyebrow">{t("dev.eyebrow")}</span>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("dev.title")}
            </h2>
            <p className="mt-3 max-w-xl text-white/70">{t("dev.sub")}</p>
            <Link href="/developers" className="btn-ghost mt-6">
              {t("dev.entry")}
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
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "api", label: t("dev.api") },
              { key: "agent", label: t("dev.agent") },
              { key: "sdk", label: t("dev.sdk") },
            ].map((i) => (
              <div
                key={i.key}
                className="rounded-xl border border-white/10 bg-ink-900/60 p-4 text-center"
              >
                <div className="mx-auto grid h-8 w-8 place-items-center rounded-md bg-white/10 text-[10px] uppercase tracking-[0.18em] text-white/70">
                  {i.key}
                </div>
                <p className="mt-3 text-sm font-medium">{i.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
