"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useSession } from "@/components/providers/session-provider";

export function Topbar({ onMenuClick, unread = 0 }: { onMenuClick: () => void; unread?: number }) {
  const user = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-card/80 px-4 backdrop-blur lg:px-6">
      <button onClick={onMenuClick} className="rounded-md p-2 hover:bg-muted lg:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden text-sm text-muted-foreground sm:block">
        Welcome back, <span className="font-medium text-foreground">{user.name.split(" ")[0]}</span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Link href="/notifications" className="relative rounded-md p-2 hover:bg-muted" aria-label="Notifications">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
              {unread}
            </span>
          )}
        </Link>

        <ThemeToggle />

        <div className="relative" ref={ref}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md p-1 pr-2 hover:bg-muted"
          >
            <Avatar name={user.name} src={user.photoUrl} size="sm" />
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium leading-tight text-foreground">{user.name}</span>
              <span className="block text-xs leading-tight text-muted-foreground">{user.roleName}</span>
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-popover shadow-lg animate-in">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="p-1">
                <Link
                  href={`/employees/${user.id}`}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserRound className="h-4 w-4" /> My Profile
                </Link>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger-soft"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
