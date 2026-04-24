"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/PageHero";
import { PhoneReport } from "@/components/PhoneReport";

export default function DemoPage() {
  const { t } = useI18n();

  return (
    <>
      <PageHero title={t("demopage.title")} sub={t("demopage.sub")} />

      <section className="section">
        <div className="container-wide grid items-start gap-12 md:grid-cols-[0.9fr_1.1fr]">
          <PhoneReport />

          <div className="grid gap-4">
            <ReportBlock
              label={t("demo.score.label")}
              accent
              content={
                <div className="flex items-end justify-between">
                  <div>
                    <div className="font-display text-5xl font-semibold">
                      82
                      <span className="ml-2 text-base text-white/50">/100</span>
                    </div>
                    <p className="mt-1 text-sm text-mint-300">
                      {t("demo.score.state")}
                    </p>
                  </div>
                  <div className="text-right text-xs text-white/50">
                    +4 vs last week
                  </div>
                </div>
              }
            />
            <ReportBlock
              label={t("demo.findings")}
              content={
                <ul className="grid gap-1.5 text-sm text-white/80">
                  <li>• {t("demo.finding1")}</li>
                  <li>• {t("demo.finding2")}</li>
                  <li>• {t("demo.finding3")}</li>
                </ul>
              }
            />
            <ReportBlock
              label={t("demo.risk")}
              tone="amber"
              content={
                <p className="text-sm leading-relaxed text-white/80">
                  {t("demo.risk.body")}
                </p>
              }
            />
            <ReportBlock
              label={t("demo.analysis")}
              content={
                <p className="text-sm leading-relaxed text-white/80">
                  {t("demo.analysis.body")}
                </p>
              }
            />
            <ReportBlock
              label={t("demo.actions")}
              content={
                <ol className="grid gap-1.5 text-sm text-white/80">
                  <li>1. {t("demo.action1")}</li>
                  <li>2. {t("demo.action2")}</li>
                  <li>3. {t("demo.action3")}</li>
                </ol>
              }
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-wide grid gap-5 md:grid-cols-3">
          <FeatureCard
            title={t("demopage.logic.title")}
            body={t("demopage.logic.desc")}
          />
          <FeatureCard
            title={t("demopage.risk.title")}
            body={t("demopage.risk.desc")}
          />
          <FeatureCard
            title={t("demopage.plan.title")}
            body={t("demopage.plan.desc")}
          />
        </div>

        <div className="container-wide mt-12">
          <Link href="/download" className="btn-primary">
            {t("demo.cta")}
          </Link>
        </div>
      </section>
    </>
  );
}

function ReportBlock({
  label,
  content,
  tone = "default",
  accent = false,
}: {
  label: string;
  content: React.ReactNode;
  tone?: "default" | "amber";
  accent?: boolean;
}) {
  const base = "rounded-2xl border p-5";
  const style =
    tone === "amber"
      ? "border-amber-400/20 bg-amber-400/5"
      : accent
      ? "border-white/10 bg-gradient-to-br from-mint-400/15 via-sky-500/10 to-transparent"
      : "border-white/10 bg-white/[0.02]";
  return (
    <div className={base + " " + style}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/55">
        {label}
      </p>
      <div className="mt-2">{content}</div>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="card">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/70">{body}</p>
    </div>
  );
}
