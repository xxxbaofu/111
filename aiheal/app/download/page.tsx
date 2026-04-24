"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/PageHero";

export default function DownloadPage() {
  const { t } = useI18n();
  return (
    <>
      <PageHero title={t("download.title")} sub={t("download.sub")} />

      <section className="section">
        <div className="container-wide grid items-center gap-10 md:grid-cols-3">
          <Link
            href="#"
            className="card group flex items-center gap-4 transition hover:-translate-y-0.5"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-ink-950">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
                <path d="M16.5 3.1c0 1.2-.5 2.3-1.3 3.1-.8.9-2.1 1.5-3.2 1.4-.2-1.2.4-2.4 1.2-3.2.9-.9 2.3-1.5 3.3-1.3zm3.7 14.3c-.6 1.4-.9 2-1.7 3.2-1.1 1.7-2.8 3.8-4.8 3.8-1.8 0-2.3-1.2-4.8-1.2s-3 1.2-4.8 1.2c-2 0-3.6-1.9-4.8-3.6C-1.3 16-1.7 9.7 2 6.7c1.6-1.3 3.8-2.1 5.6-2.1 1.8 0 2.9 1.2 4.5 1.2 1.6 0 2.6-1.2 4.8-1.2 1.8 0 3.8 1 5.1 2.6-4.4 2.4-3.7 8.8-2 10.2z" />
              </svg>
            </span>
            <div>
              <p className="text-xs text-white/50">Download on the</p>
              <p className="font-display text-lg font-semibold">App Store</p>
            </div>
          </Link>

          <Link
            href="#"
            className="card group flex items-center gap-4 transition hover:-translate-y-0.5"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-mint-400 text-ink-950">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
                <path d="M3.6 2.3a2 2 0 0 0-.8 1.6v16.2a2 2 0 0 0 .8 1.6L13 12 3.6 2.3zM14.4 10.9l2.7-2.7L5.5 1.9l8.9 9zM5.5 22.1l11.6-6.3-2.7-2.7-8.9 9zM20.9 10.5l-2.6-1.5-2.9 3 2.9 3 2.7-1.5a2 2 0 0 0 0-3z" />
              </svg>
            </span>
            <div>
              <p className="text-xs text-white/50">Get it on</p>
              <p className="font-display text-lg font-semibold">Google Play</p>
            </div>
          </Link>

          <div className="card flex items-center gap-5">
            <QR />
            <div>
              <p className="text-xs text-white/50">{t("download.qr")}</p>
              <p className="mt-1 font-display text-lg font-semibold">
                aiheal.app
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function QR() {
  const size = 21;
  const seed = 1337;
  function rand(i: number) {
    const x = Math.sin(i * seed) * 10000;
    return x - Math.floor(x);
  }
  const cells: boolean[] = Array.from({ length: size * size }).map((_, i) =>
    rand(i + 1) > 0.55 ? true : false
  );
  function isFinder(x: number, y: number) {
    const inBox = (ox: number, oy: number) =>
      x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    return (
      inBox(0, 0) || inBox(size - 7, 0) || inBox(0, size - 7)
    );
  }
  function finder(ox: number, oy: number, x: number, y: number) {
    const dx = x - ox;
    const dy = y - oy;
    const outer = dx === 0 || dx === 6 || dy === 0 || dy === 6;
    const inner = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
    return outer || inner;
  }
  return (
    <div className="rounded-xl border border-white/10 bg-white p-2">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={96}
        height={96}
        shapeRendering="crispEdges"
        aria-hidden
      >
        <rect width={size} height={size} fill="#ffffff" />
        {cells.map((c, i) => {
          const x = i % size;
          const y = Math.floor(i / size);
          let on = c;
          if (isFinder(x, y)) {
            if (x < 7 && y < 7) on = finder(0, 0, x, y);
            else if (x >= size - 7 && y < 7) on = finder(size - 7, 0, x, y);
            else if (x < 7 && y >= size - 7) on = finder(0, size - 7, x, y);
          }
          return on ? (
            <rect key={i} x={x} y={y} width={1} height={1} fill="#05070d" />
          ) : null;
        })}
      </svg>
    </div>
  );
}
