"use client";

import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/PageHero";
import { PhoneReport } from "@/components/PhoneReport";

export default function ProductPage() {
  const { t } = useI18n();
  const pillars = [
    {
      key: "snapshot",
      titleKey: "product.snapshot.title",
      descKey: "product.snapshot.desc",
    },
    {
      key: "trend",
      titleKey: "product.trend.title",
      descKey: "product.trend.desc",
    },
    {
      key: "report",
      titleKey: "product.report.title",
      descKey: "product.report.desc",
    },
  ];
  const rows = [
    ["product.compare.row1.a", "product.compare.row1.b"],
    ["product.compare.row2.a", "product.compare.row2.b"],
    ["product.compare.row3.a", "product.compare.row3.b"],
    ["product.compare.row4.a", "product.compare.row4.b"],
  ];
  return (
    <>
      <PageHero
        eyebrow={t("product.eyebrow")}
        title={t("product.title")}
        sub={t("product.sub")}
      />

      <section className="section">
        <div className="container-wide grid items-center gap-12 md:grid-cols-[1fr_1fr]">
          <div className="grid gap-5">
            {pillars.map((p, idx) => (
              <div key={p.key} className="card">
                <div className="flex items-start gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-xs text-white/70">
                    0{idx + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">
                      {t(p.titleKey)}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                      {t(p.descKey)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <PhoneReport />
        </div>
      </section>

      <section className="section">
        <div className="container-wide">
          <h2 className="section-title">{t("product.compare.title")}</h2>
          <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-white/[0.04] text-white/70">
                <tr>
                  <th className="px-5 py-4 font-medium">&nbsp;</th>
                  <th className="px-5 py-4 font-medium">
                    {t("product.compare.col1")}
                  </th>
                  <th className="px-5 py-4 font-medium text-mint-300">
                    {t("product.compare.col2")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([a, b], i) => (
                  <tr
                    key={i}
                    className="border-t border-white/5 odd:bg-white/[0.015]"
                  >
                    <td className="px-5 py-4 text-white/50">#{i + 1}</td>
                    <td className="px-5 py-4 text-white/70">{t(a)}</td>
                    <td className="px-5 py-4 font-medium">{t(b)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
