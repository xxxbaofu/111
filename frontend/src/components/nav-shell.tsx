"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard" },
  { href: "/market-pulse", label: "Market Pulse" },
  { href: "/category", label: "Category" },
  { href: "/products", label: "Products" },
  { href: "/ads", label: "Ads" },
  { href: "/leaders", label: "Leaders" },
  { href: "/growth", label: "Growth" },
  { href: "/strategy", label: "Strategy" },
];

export function NavShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F4F7FE]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-4 px-4 py-4">
        <aside className="col-span-12 rounded-xl border border-[#1A2340] bg-[#12182B] p-4 md:col-span-3 lg:col-span-2">
          <h1 className="mb-4 text-sm font-semibold tracking-wide text-[#9CA8C3]">
            跨境数据操作系统
          </h1>
          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-[#1A2340] text-white"
                      : "text-[#9CA8C3] hover:bg-[#1A2340] hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="col-span-12 md:col-span-9 lg:col-span-10">{children}</main>
      </div>
    </div>
  );
}
