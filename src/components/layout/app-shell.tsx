"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

/** The frame around every signed-in page: sidebar + topbar + scrolling main. */
export function AppShell({ children, unread }: { children: React.ReactNode; unread: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setOpen(true)} unread={unread} />
        <main className="mx-auto w-full max-w-7xl space-y-6 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
