"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { SectionHeader } from "@/components/SectionHeader";
import { PhoneReport } from "@/components/PhoneReport";

export function DemoReport() {
  const { t } = useI18n();
  return (
    <section id="demo" className="section">
      <div className="container-wide grid items-center gap-12 md:grid-cols-[0.9fr_1.1fr]">
        <div className="order-2 md:order-1">
          <PhoneReport />
        </div>
        <div className="order-1 md:order-2">
          <SectionHeader
            eyebrow={t("demo.eyebrow")}
            title={t("demo.title")}
            sub={t("demo.sub")}
          />

          <div className="mt-8 grid gap-3">
            <Block title={t("demo.analysis")} body={t("demo.analysis.body")} />
            <div className="card">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                {t("demo.actions")}
              </p>
              <ul className="mt-3 grid gap-2 text-sm text-white/80">
                {[
                  t("demo.action1"),
                  t("demo.action2"),
                  t("demo.action3"),
                ].map((a) => (
                  <li key={a} className="flex items-start gap-2">
                    <CheckMark />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <Link href="/demo" className="btn-primary">
              {t("demo.cta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div className="card">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-white/80">{body}</p>
    </div>
  );
}

function CheckMark() {
  return (
    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-mint-400/15 text-mint-300">
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}
