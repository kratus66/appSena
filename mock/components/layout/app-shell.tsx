"use client";

import { PropsWithChildren, useState } from "react";

import { RoleSidebar } from "@/components/layout/role-sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

type AppShellProps = PropsWithChildren<{
  role: UserRole;
}>;

export function AppShell({ role, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <div
          className={cn(
            "fixed inset-0 z-40 bg-slate-950/35 transition-opacity lg:hidden",
            sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={() => setSidebarOpen(false)}
        />
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-[280px] border-r border-white/60 bg-white/90 backdrop-blur-xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <RoleSidebar role={role} onNavigate={() => setSidebarOpen(false)} />
        </aside>
        <div className="flex min-h-screen flex-col">
          <TopHeader role={role} onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
