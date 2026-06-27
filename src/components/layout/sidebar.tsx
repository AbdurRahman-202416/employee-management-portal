"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAVIGATION } from "@/config/navigation.config";
import { APP_CONFIG } from "@/config/app.config";
import { useSession } from "@/components/providers/session-provider";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const user = useSession();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} aria-hidden />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between gap-2 px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-active font-bold text-sidebar-active-foreground">
              {APP_CONFIG.company[0]}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">{APP_CONFIG.name}</p>
              <p className="text-[11px] text-sidebar-muted">{APP_CONFIG.company} HR</p>
            </div>
          </Link>
          <button onClick={onClose} className="text-sidebar-muted hover:text-white lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {NAVIGATION.map((section) => {
            const items = section.items.filter((i) => user.permissions.includes(i.permission));
            if (items.length === 0) return null;
            return (
              <div key={section.title}>
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
                  {section.title}
                </p>
                <ul className="space-y-1">
                  {items.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            active
                              ? "bg-sidebar-active text-sidebar-active-foreground"
                              : "text-sidebar-foreground hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-5 py-3 text-[11px] text-sidebar-muted">
          {APP_CONFIG.fullName} · v1.0
        </div>
      </aside>
    </>
  );
}
