"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export function CTA() {
  const { t } = useI18n();
  return (
    <section className="section">
      <div className="container-wide">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-mint-400/20 via-sky-500/10 to-transparent p-8 sm:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-mint-400/20 blur-3xl"
          />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {t("cta.title")}
              </h2>
              <p className="mt-3 text-white/75">{t("cta.sub")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/download" className="btn-primary">
                {t("cta.primary")}
              </Link>
              <Link href="/demo" className="btn-ghost">
                {t("cta.secondary")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
