"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { LocaleToggle } from "./LocaleToggle";
import { useI18n } from "@/lib/i18n";

const links = [
  { href: "/product", key: "nav.product" },
  { href: "/demo", key: "nav.demo" },
  { href: "/scenarios", key: "nav.scenarios" },
  { href: "/technology", key: "nav.technology" },
  { href: "/download", key: "nav.download" },
  { href: "/developers", key: "nav.developers" },
];

export function Nav() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <div className="container-wide flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active =
                pathname === l.href ||
                (l.href !== "/" && pathname?.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={
                    "rounded-full px-3 py-1.5 text-sm transition " +
                    (active
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:text-white")
                  }
                >
                  {t(l.key)}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <LocaleToggle />
          <Link href="/download" className="btn-primary hidden sm:inline-flex">
            {t("nav.cta")}
          </Link>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 md:hidden"
            aria-label="menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-white/5 bg-ink-950/95 md:hidden">
          <div className="container-wide grid gap-1 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/5"
              >
                {t(l.key)}
              </Link>
            ))}
            <Link
              href="/download"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 justify-center"
            >
              {t("nav.cta")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
