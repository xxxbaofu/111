"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-20 border-t border-white/5 bg-ink-950/60">
      <div className="container-wide grid gap-10 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-white/60">{t("footer.tag")}</p>
        </div>
        <FooterCol title={t("footer.product")}>
          <FooterLink href="/product">{t("nav.product")}</FooterLink>
          <FooterLink href="/demo">{t("nav.demo")}</FooterLink>
          <FooterLink href="/download">{t("nav.download")}</FooterLink>
        </FooterCol>
        <FooterCol title={t("footer.resources")}>
          <FooterLink href="/scenarios">{t("nav.scenarios")}</FooterLink>
          <FooterLink href="/technology">{t("nav.technology")}</FooterLink>
          <FooterLink href="/developers">{t("nav.developers")}</FooterLink>
        </FooterCol>
        <FooterCol title={t("footer.legal")}>
          <FooterLink href="#">{t("footer.privacy")}</FooterLink>
          <FooterLink href="#">{t("footer.terms")}</FooterLink>
        </FooterCol>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-white/40">
        {t("footer.rights")}
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
        {title}
      </h4>
      <ul className="mt-4 space-y-2 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link href={href} className="text-white/70 transition hover:text-white">
        {children}
      </Link>
    </li>
  );
}
