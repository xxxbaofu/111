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
        <aside className="col-span-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-4 md:col-span-3 lg:col-span-2">
          <h1 className="mb-1 text-sm font-semibold tracking-wide text-[var(--text-main)]">
            跨境赚钱操作系统
          </h1>
          <p className="mb-4 text-xs text-[var(--text-muted)]">少数据，多结论：30秒看今天做什么</p>

          <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-2">
            <div className="mb-2 text-xs text-[var(--text-muted)]">快速切换区域</div>
            <div className="grid grid-cols-4 gap-1">
              {REGION_OPTIONS.map((region) => (
                <Link
                  key={region}
                  href={withRegion(pathname, region)}
                  className="rounded-md border border-white/15 px-1 py-1 text-center text-[10px] text-[var(--text-muted)] hover:border-white/30 hover:text-white"
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
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-[var(--bg-hover)] text-white"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-4 md:p-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
