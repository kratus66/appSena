"use client";

import Link from "next/link";
import { PropsWithChildren, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DoorOpen,
  FileSpreadsheet,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  School,
  Search,
  Users,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  coordinatorArticulationContextOption,
  coordinatorCenterName,
  getCoordinatorAlertChips,
  isCoordinatorArticulationContext,
  coordinatorQuickFilters,
  resolveCoordinatorFilters,
  coordinatorSites,
} from "@/lib/mocks/coordinator-console";
import { cn } from "@/lib/utils";

type CoordinatorNavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

const navItems: CoordinatorNavItem[] = [
  { label: "Resumen operativo", href: "/coordinador/dashboard", icon: LayoutDashboard },
  { label: "Instructores", href: "/coordinador/instructores", icon: Users },
  { label: "Fichas", href: "/coordinador/fichas", icon: FolderKanban },
  { label: "Ambientes", href: "/coordinador/ambientes", icon: DoorOpen },
  { label: "Colegios", href: "/coordinador/colegios", icon: School },
  { label: "Planeacion", href: "/coordinador/programas", icon: BookOpenText },
  { label: "Asignaciones", href: "/coordinador/asignaciones", icon: ClipboardList },
  { label: "Importaciones", href: "/coordinador/importacion-excel", icon: FileSpreadsheet },
];

function alertVariant(severity: "alta" | "media" | "baja") {
  if (severity === "alta") {
    return "danger";
  }

  if (severity === "media") {
    return "warning";
  }

  return "secondary";
}

export function CoordinatorShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const supportsArticulationContext = useMemo(
    () =>
      pathname.startsWith("/coordinador/dashboard") ||
      pathname.startsWith("/coordinador/instructores") ||
      pathname.startsWith("/coordinador/fichas") ||
      pathname.startsWith("/coordinador/asignaciones") ||
      pathname.startsWith("/coordinador/programas"),
    [pathname],
  );
  const siteOptions = useMemo(
    () =>
      supportsArticulationContext
        ? [...coordinatorSites, coordinatorArticulationContextOption]
        : coordinatorSites,
    [supportsArticulationContext],
  );
  const selectedSite =
    siteOptions.find((site) => site.id === searchParams.get("site"))?.id ??
    coordinatorSites[0]?.id ??
    "";
  const activeQuickFilters = useMemo(
    () => resolveCoordinatorFilters(searchParams.getAll("filter")),
    [searchParams],
  );
  const alertChips = useMemo(
    () => getCoordinatorAlertChips(selectedSite, activeQuickFilters),
    [activeQuickFilters, selectedSite],
  );
  const visibleQuickFilters = useMemo(() => {
    if (
      pathname.startsWith("/coordinador/colegios") ||
      pathname.startsWith("/coordinador/asignaciones") ||
      pathname.startsWith("/coordinador/programas")
    ) {
      return [];
    }

    if (pathname.startsWith("/coordinador/ambientes")) {
      return coordinatorQuickFilters.filter((filter) => filter !== "Articulacion");
    }

    return coordinatorQuickFilters;
  }, [pathname]);
  const usesSiteSelector = !pathname.startsWith("/coordinador/colegios");

  const pageLabel = useMemo(() => {
    return navItems.find((item) => pathname.startsWith(item.href))?.label ?? "Coordinacion";
  }, [pathname]);

  function withCurrentParams(
    href: string,
    filters = activeQuickFilters,
    site = selectedSite,
  ) {
    const params = new URLSearchParams();
    const targetUsesSite = !href.startsWith("/coordinador/colegios");
    const targetSupportsArticulation =
      href.startsWith("/coordinador/dashboard") ||
      href.startsWith("/coordinador/instructores") ||
      href.startsWith("/coordinador/fichas") ||
      href.startsWith("/coordinador/asignaciones") ||
      href.startsWith("/coordinador/programas");
    const normalizedSite =
      isCoordinatorArticulationContext(site) && !targetSupportsArticulation
        ? coordinatorSites[0]?.id ?? ""
        : site;
    if (normalizedSite && targetUsesSite) {
      params.set("site", normalizedSite);
    }
    filters.forEach((filter) => params.append("filter", filter));
    const query = params.toString();

    return query ? `${href}?${query}` : href;
  }

  function toggleQuickFilter(filter: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = resolveCoordinatorFilters(searchParams.getAll("filter"));
    const next = current.includes(filter)
      ? current.filter((item) => item !== filter)
      : [...current, filter];

    params.delete("filter");
    next.forEach((item) => params.append("filter", item));
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSiteChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("site", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(248,250,252,0.92)_0%,rgba(244,247,245,0.96)_100%)]">
      <div
        className={cn(
          "grid min-h-screen",
          sidebarCollapsed ? "xl:grid-cols-[76px_1fr]" : "xl:grid-cols-[220px_1fr]",
        )}
      >
        <div
          className={cn(
            "fixed inset-0 z-40 bg-slate-950/35 transition-opacity xl:hidden",
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-slate-200/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(247,250,248,0.94)_100%)] px-3.5 py-5 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.28)] backdrop-blur-xl transition-transform xl:sticky xl:top-0 xl:h-screen xl:translate-x-0",
            sidebarCollapsed && "xl:w-[76px] xl:px-2.5",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="rounded-[1.1rem] border border-white/70 bg-white/55 px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <div className="flex items-center justify-between gap-3 px-2 pb-4">
              <div className={cn(sidebarCollapsed && "xl:hidden")}>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">SENA</p>
                <p className="mt-2 text-base font-semibold text-foreground">Coordinacion</p>
              </div>
              <div
                className={cn(
                  "hidden xl:flex",
                  sidebarCollapsed ? "w-full justify-center" : "justify-end",
                )}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed((current) => !current)}
                  aria-label={sidebarCollapsed ? "Expandir menu" : "Minimizar menu"}
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <nav className="mt-3 space-y-1 rounded-[1.1rem] border border-white/65 bg-white/50 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={withCurrentParams(item.href)}
                  onClick={() => setMobileOpen(false)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-[0.95rem] px-3 py-2.5 text-sm font-medium transition-all",
                    sidebarCollapsed && "xl:justify-center xl:px-0",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span className={cn(sidebarCollapsed && "xl:hidden")}>{item.label}</span>
                  </span>
                  {active ? (
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full bg-white/80",
                        sidebarCollapsed && "xl:hidden",
                      )}
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[1.1rem] border border-white/65 bg-white/50 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
            <Button
              asChild
              variant="ghost"
              className={cn(
                "w-full rounded-[0.95rem] px-3",
                sidebarCollapsed ? "justify-center xl:px-0" : "justify-start",
              )}
            >
              <Link href="/login">
                <LogOut className="h-4 w-4" />
                <span className={cn(sidebarCollapsed && "xl:hidden")}>Cerrar sesion</span>
              </Link>
            </Button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(248,251,249,0.9)_100%)] shadow-[0_16px_30px_-28px_rgba(15,23,42,0.32)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 xl:px-8">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="xl:hidden"
                    onClick={() => setMobileOpen(true)}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {coordinatorCenterName}
                    </p>
                    <p className="mt-1 text-base font-semibold text-foreground">{pageLabel}</p>
                  </div>
                </div>

                <div
                  className={cn(
                    "grid gap-3 xl:items-center",
                    usesSiteSelector
                      ? "xl:grid-cols-[220px_minmax(260px,360px)]"
                      : "xl:grid-cols-[minmax(320px,420px)]",
                  )}
                >
                  {usesSiteSelector ? (
                    <div className="rounded-[1rem] border border-primary/25 bg-primary/5 px-3 py-2">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                        Sede activa
                      </p>
                      <Select
                        value={selectedSite}
                        onChange={(event) => handleSiteChange(event.target.value)}
                        className="h-10 border-primary/30 bg-white font-semibold shadow-none"
                      >
                        {siteOptions.map((site) => (
                          <option key={site.id} value={site.id}>
                            {site.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  ) : null}

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      placeholder="Buscar instructor, ficha, colegio o ambiente"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap gap-2">
                  {visibleQuickFilters.map((filter) => {
                    const active = activeQuickFilters.includes(filter);

                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => toggleQuickFilter(filter)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-white text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  {alertChips.map((alert) => (
                    <Badge
                      key={alert.id}
                      variant={alertVariant(alert.severity)}
                      className="gap-2 normal-case tracking-[0.08em]"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      {alert.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="h-px w-full bg-[linear-gradient(90deg,rgba(34,197,94,0)_0%,rgba(34,197,94,0.18)_18%,rgba(59,130,246,0.12)_82%,rgba(59,130,246,0)_100%)]" />
          </header>

          <main className="flex-1 px-4 py-5 sm:px-6 xl:px-8 xl:py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
