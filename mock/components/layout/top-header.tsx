"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRoleProfile } from "@/lib/permissions";
import { UserRole } from "@/lib/types";
import { formatPageTitle } from "@/lib/utils";

type TopHeaderProps = {
  role: UserRole;
  onOpenSidebar: () => void;
};

export function TopHeader({ role, onOpenSidebar }: TopHeaderProps) {
  const pathname = usePathname();
  const profile = getRoleProfile(role);
  const segments = pathname.split("/").filter(Boolean);
  const currentSegment = segments[segments.length - 1] ?? "inicio";

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-white/96">
      <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="lg:hidden" onClick={onOpenSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                SENA · {profile.label}
              </p>
              <p className="text-xl font-semibold text-foreground">
                {formatPageTitle(currentSegment)}
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button asChild variant="outline">
              <Link href={profile.homeHref}>
                <Sparkles className="h-4 w-4" />
                {profile.quickAction}
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/login">
                <LogOut className="h-4 w-4" />
                Cerrar sesion
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Inicio</span>
            <span>/</span>
            <span className="capitalize">{role}</span>
            <span>/</span>
            <span className="text-foreground">{formatPageTitle(currentSegment)}</span>
          </div>
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Buscar instructor, ficha, sede o programa..."
            />
          </div>
        </div>
        <div className="flex sm:hidden">
          <Button asChild variant="ghost" className="w-full">
            <Link href="/login">
              <LogOut className="h-4 w-4" />
              Cerrar sesion
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
