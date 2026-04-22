"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bookmark,
  Compass,
  FileText,
  Layers,
  Megaphone,
  Rocket,
  SquareKanban,
  TrendingUp,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "总览 Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
  { href: "/market-pulse", label: "市场脉冲", icon: <TrendingUp className="h-4 w-4" /> },
  { href: "/category", label: "品类雷达", icon: <Compass className="h-4 w-4" /> },
  { href: "/products", label: "产品机会池", icon: <Layers className="h-4 w-4" /> },
  { href: "/workflow", label: "执行看板", icon: <SquareKanban className="h-4 w-4" /> },
  { href: "/bookmarks", label: "收藏与备注", icon: <Bookmark className="h-4 w-4" /> },
  { href: "/daily-report", label: "自动日报", icon: <FileText className="h-4 w-4" /> },
  { href: "/ads", label: "广告洞察", icon: <Megaphone className="h-4 w-4" /> },
  { href: "/leaders", label: "头部榜单", icon: <Rocket className="h-4 w-4" /> },
  { href: "/growth", label: "增长中心", icon: <TrendingUp className="h-4 w-4" /> },
  { href: "/strategy", label: "投放策略", icon: <Wrench className="h-4 w-4" /> },
];

const REGION_OPTIONS = ["US", "UK", "EU", "SEA", "JP", "KR", "XHS"] as const;

export function NavShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const withRegion = (href: string, region: string) => `${href}?region=${region}`;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <div className="mx-auto grid max-w-[1460px] grid-cols-12 gap-4 px-4 py-4">
        <aside className="glass-panel col-span-12 rounded-2xl p-4 md:col-span-3 lg:col-span-2">
          <div className="relative mb-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(101,116,255,.35),transparent_65%)]" />
            <h1 className="mb-1 text-sm font-semibold tracking-wide text-[var(--text-main)]">
              跨境赚钱操作系统
            </h1>
            <p className="text-xs text-[var(--text-muted)]">少数据，多结论：30秒看今天做什么</p>
          </div>

          <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.03] p-2">
            <div className="mb-2 text-xs text-[var(--text-muted)]">快速切换区域</div>
            <div className="grid grid-cols-4 gap-1">
              {REGION_OPTIONS.map((region) => (
                <Link
                  key={region}
                  href={withRegion(pathname, region)}
                  className="rounded-md border border-white/15 px-1 py-1 text-center text-[10px] text-[var(--text-muted)] transition hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
                >
                  {region}
                </Link>
              ))}
            </div>
          </div>

          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={withRegion(item.href, "US")}
                  className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-[linear-gradient(135deg,rgba(97,109,255,0.25),rgba(55,187,255,0.16))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                      : "text-[var(--text-muted)] hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {active ? (
                    <span className="absolute left-1 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-[var(--accent-blue)]" />
                  ) : null}
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          <div className="glass-panel rounded-2xl p-4 md:p-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
