"use client";

import { useI18n } from "@/lib/i18n";

export function LocaleToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-0.5 text-xs">
      <button
        type="button"
        onClick={() => setLocale("zh")}
        className={
          "rounded-full px-2.5 py-1 font-medium transition " +
          (locale === "zh"
            ? "bg-white text-ink-950"
            : "text-white/70 hover:text-white")
        }
        aria-pressed={locale === "zh"}
      >
        中
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={
          "rounded-full px-2.5 py-1 font-medium transition " +
          (locale === "en"
            ? "bg-white text-ink-950"
            : "text-white/70 hover:text-white")
        }
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
