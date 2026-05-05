"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bars3Icon,
  BanknotesIcon,
  Cog6ToothIcon,
  HomeIcon,
  MapIcon,
  UsersIcon,
  XMarkIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

import { Button } from "@/ui/components";
import { cn } from "@/ui/utils/cn";
import { useAuth } from "@/ui/providers/AuthProvider";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/trips", label: "Trips", icon: MapIcon },
  { href: "/members", label: "Members", icon: UsersIcon },
  { href: "/master-items", label: "Master Items", icon: CubeIcon },
  { href: "/finance", label: "Funds / Finance", icon: BanknotesIcon },
  { href: "/settings", label: "Settings", icon: Cog6ToothIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-200 bg-white transition-transform lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
            <h1 className="text-base font-semibold">Trip Budgeting</h1>
            <button className="rounded-md p-1 text-slate-500 lg:hidden" onClick={() => setMobileOpen(false)}>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-1 p-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                  onClick={() => setMobileOpen(true)}
                >
                  <Bars3Icon className="h-5 w-5" />
                </button>
                <p className="text-sm text-slate-500">Enterprise Console</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-800">{user?.name ?? "-"}</p>
                  <p className="text-xs capitalize text-slate-500">{user?.role ?? "guest"}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-slate-900/25 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
    </div>
  );
}
