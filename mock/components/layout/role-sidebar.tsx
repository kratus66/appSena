"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  Building2,
  CalendarDays,
  ClipboardList,
  DoorOpen,
  Folders,
  GitBranchPlus,
  GraduationCap,
  House,
  LayoutDashboard,
  MapPinned,
  ScanSearch,
  School,
  Sheet,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { navigationByRole, roleProfiles } from "@/lib/mocks/navigation";
import { IconName, UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

const iconMap: Record<IconName, typeof LayoutDashboard> = {
  "layout-dashboard": LayoutDashboard,
  "building-2": Building2,
  "map-pinned": MapPinned,
  users: Users,
  "shield-check": ShieldCheck,
  "graduation-cap": GraduationCap,
  "book-open-text": BookOpenText,
  folders: Folders,
  school: School,
  "door-open": DoorOpen,
  "git-branch-plus": GitBranchPlus,
  "scan-search": ScanSearch,
  sheet: Sheet,
  house: House,
  "calendar-days": CalendarDays,
  "clipboard-list": ClipboardList,
};

type RoleSidebarProps = {
  role: UserRole;
  onNavigate?: () => void;
};

export function RoleSidebar({ role, onNavigate }: RoleSidebarProps) {
  const pathname = usePathname();
  const profile = roleProfiles[role];
  const navigation = navigationByRole[role];

  return (
    <div className="flex h-full flex-col gap-5 p-4 lg:p-5">
      <div className="border-b border-border/80 px-2 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
            {profile.initials}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Portal SENA</p>
            <p className="mt-1 text-base font-semibold text-foreground">{profile.label}</p>
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center justify-between rounded-[0.95rem] px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {item.badge ? (
                <Badge variant={isActive ? "outline" : "secondary"} className="border-white/20 bg-white/10 text-current">
                  {item.badge}
                </Badge>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border/80 px-2 pt-4">
        <Button asChild variant="ghost" className="w-full justify-start rounded-[0.95rem] px-3">
          <Link href="/login">Cerrar sesion</Link>
        </Button>
      </div>
    </div>
  );
}
