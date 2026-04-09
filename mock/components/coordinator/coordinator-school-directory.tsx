"use client";

import { useMemo, useState } from "react";
import { Building2, CalendarDays, CheckCircle2, Clock3, GraduationCap, MapPin, Plus, School, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  CoordinatorSchoolCard,
  CoordinatorSchoolKind,
  CoordinatorSchoolOperationalStatus,
} from "@/lib/types";
import { buildCoordinatorSchoolDetailFromCard } from "@/lib/mocks/coordinator-colegios";
import { cn } from "@/lib/utils";

type CoordinatorSchoolDirectoryProps = {
  schools: CoordinatorSchoolCard[];
  siteLabel: string;
  onCreateSchool?: (school: CoordinatorSchoolCard) => void;
};

type SchoolFilter =
  | "Todos"
  | "Publicos"
  | "Privados"
  | "Tecnicos"
  | "Con horario definido"
  | "Listos para asignacion";

type SchoolForm = {
  name: string;
  kind: CoordinatorSchoolKind;
  address: string;
  city: string;
  site: string;
  scheduleLabel: string;
  operatingDays: string;
  senaCoverageSummary: string;
  monthlyRule: string;
  operationalStatus: CoordinatorSchoolOperationalStatus;
};

const quickFilters: SchoolFilter[] = [
  "Todos",
  "Publicos",
  "Privados",
  "Tecnicos",
  "Con horario definido",
  "Listos para asignacion",
];

function kindBadgeVariant(kind: CoordinatorSchoolKind) {
  if (kind === "Publico") {
    return "default";
  }

  if (kind === "Privado") {
    return "secondary";
  }

  return "warning";
}

function statusBadgeVariant(status: CoordinatorSchoolOperationalStatus) {
  if (status === "Listo para asignacion") {
    return "success";
  }

  if (status === "Con horario definido") {
    return "secondary";
  }

  return "warning";
}

function buildForm(siteLabel: string): SchoolForm {
  return {
    name: "",
    kind: "Publico",
    address: "",
    city: "",
    site: siteLabel,
    scheduleLabel: "",
    operatingDays: "",
    senaCoverageSummary: "",
    monthlyRule: "",
    operationalStatus: "Pendiente horario",
  };
}

export function CoordinatorSchoolDirectory({
  schools,
  siteLabel,
  onCreateSchool,
}: CoordinatorSchoolDirectoryProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<SchoolFilter>("Todos");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [form, setForm] = useState<SchoolForm>(buildForm(siteLabel));

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return schools.filter((item) => {
      const searchMatch =
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.address.toLowerCase().includes(normalized);
      const filterMatch =
        activeFilter === "Todos"
          ? true
          : activeFilter === "Publicos"
            ? item.kind === "Publico"
            : activeFilter === "Privados"
              ? item.kind === "Privado"
              : activeFilter === "Tecnicos"
                ? item.kind === "Tecnico"
                : activeFilter === "Con horario definido"
                  ? item.hasSchedule
                  : item.readyForAssignment;

      return searchMatch && filterMatch;
    });
  }, [activeFilter, schools, search]);

  function openCreate() {
    setDrawerOpen(true);
    setForm(buildForm(siteLabel));
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function closeDetail() {
    setSelectedSchoolId(null);
  }

  function saveSchool() {
    const payload: CoordinatorSchoolCard = {
      id: `MAN-${Date.now()}`,
      name: form.name.trim() || "Nuevo colegio",
      kind: form.kind,
      address: form.address.trim() || "Direccion pendiente",
      city: form.city.trim() || siteLabel,
      site: form.site,
      scheduleLabel: form.scheduleLabel.trim() || "Pendiente configurar horario",
      operatingDays: form.operatingDays.trim() || "Sin dias definidos",
      senaCoverageSummary:
        form.senaCoverageSummary.trim() || "Cobertura SENA pendiente por definir",
      monthlyRule:
        form.monthlyRule.trim() || "Regla operativa pendiente de configurar.",
      operationalStatus: form.operationalStatus,
      hasSchedule: form.operationalStatus !== "Pendiente horario",
      readyForAssignment: form.operationalStatus === "Listo para asignacion",
    };

    onCreateSchool?.(payload);
    closeDrawer();
  }

  const selectedSchool = selectedSchoolId
    ? schools.find((item) => item.id === selectedSchoolId) ?? null
    : null;
  const selectedSchoolIndex = selectedSchool
    ? schools.findIndex((item) => item.id === selectedSchool.id)
    : -1;
  const detailSchool = selectedSchool
    ? buildCoordinatorSchoolDetailFromCard(
        selectedSchool,
        selectedSchoolIndex >= 0 ? selectedSchoolIndex : 0,
      )
    : null;
  const detailHasOperationalCondition = detailSchool
    ? Boolean(
        detailSchool.senaCoverageSummary &&
          detailSchool.participationMode &&
          detailSchool.monthlyRule,
      )
    : false;
  const detailHasAssociatedFichas = detailSchool
    ? detailSchool.associatedFichas.length > 0
    : false;
  const detailIsReady = detailSchool
    ? detailSchool.hasSchedule &&
      detailHasOperationalCondition &&
      detailHasAssociatedFichas
    : false;

  return (
    <>
      <div className="space-y-4">
        <Card className="border-border/70 bg-white/82 shadow-none">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <CardTitle>Colegios de articulacion</CardTitle>
                <CardDescription>
                  Vista operativa para revisar tipo de colegio, horario y cobertura SENA
                  antes de preparar la asignacion de instructores de articulacion.
                </CardDescription>
              </div>
              <Button type="button" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Nuevo colegio
              </Button>
            </div>

            <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_auto] xl:items-center">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre o direccion"
              />

              <div className="flex flex-wrap gap-2 xl:justify-end">
                {quickFilters.map((filter) => {
                  const active = activeFilter === filter;

                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={cn(
                        "rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all",
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
            </div>
          </CardHeader>

          <CardContent>
            {!filtered.length ? (
              <EmptyState
                icon={School}
                title="Sin colegios visibles"
                description="Ajusta la busqueda o el filtro rapido para recuperar colegios de articulacion."
              />
            ) : (
              <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                {filtered.map((school) => (
                  <article
                    key={school.id}
                    className="rounded-[1.1rem] border border-border/70 bg-background/60 p-4"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{school.name}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={kindBadgeVariant(school.kind)}>{school.kind}</Badge>
                        <Badge variant={statusBadgeVariant(school.operationalStatus)}>
                          {school.operationalStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                      <p className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                        <span>
                          {school.address}
                          <br />
                          {school.city}
                        </span>
                      </p>
                      <div className="rounded-[0.95rem] border border-border/70 bg-white px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Horario configurado
                        </p>
                        <p className="mt-1 text-sm text-foreground">{school.scheduleLabel}</p>
                      </div>
                      <div className="rounded-[0.95rem] border border-border/70 bg-white px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Dias de operacion
                        </p>
                        <p className="mt-1 text-sm text-foreground">{school.operatingDays}</p>
                      </div>
                      <div className="rounded-[0.95rem] border border-border/70 bg-white px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Cobertura SENA
                        </p>
                        <p className="mt-1 text-sm text-foreground">
                          {school.senaCoverageSummary}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSchoolId(school.id)}
                      >
                        Ver detalle
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {drawerOpen ? (
        <>
          <div className="fixed inset-0 z-40 bg-slate-950/20" onClick={closeDrawer} />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border/80 bg-white/95 shadow-2xl backdrop-blur-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    Colegios
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">
                    Nuevo colegio
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-[0.9rem] border border-border/80 p-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Nombre del colegio"
                />
                <Select
                  value={form.kind}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      kind: event.target.value as CoordinatorSchoolKind,
                    }))
                  }
                >
                  <option value="Publico">Publico</option>
                  <option value="Privado">Privado</option>
                  <option value="Tecnico">Tecnico</option>
                </Select>
                <Input
                  value={form.address}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, address: event.target.value }))
                  }
                  placeholder="Direccion"
                />
                <Input
                  value={form.city}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, city: event.target.value }))
                  }
                  placeholder="Ciudad o localidad"
                />
                <Input
                  value={form.scheduleLabel}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, scheduleLabel: event.target.value }))
                  }
                  placeholder="Horario configurado"
                />
                <Input
                  value={form.operatingDays}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, operatingDays: event.target.value }))
                  }
                  placeholder="Dias de operacion"
                />
                <Input
                  value={form.senaCoverageSummary}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      senaCoverageSummary: event.target.value,
                    }))
                  }
                  placeholder="Cobertura SENA"
                />
                <Select
                  value={form.operationalStatus}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      operationalStatus:
                        event.target.value as CoordinatorSchoolOperationalStatus,
                    }))
                  }
                >
                  <option value="Pendiente horario">Pendiente horario</option>
                  <option value="Con horario definido">Con horario definido</option>
                  <option value="Listo para asignacion">Listo para asignacion</option>
                </Select>
                <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                  {form.monthlyRule ||
                    "La regla operativa mensual se definira segun el tipo de colegio."}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-border/70 px-5 py-4">
                <Button type="button" variant="outline" onClick={closeDrawer}>
                  Cancelar
                </Button>
                <Button type="button" onClick={saveSchool}>
                  Guardar colegio
                </Button>
              </div>
            </div>
          </aside>
        </>
      ) : null}

      {detailSchool ? (
        <>
          <div className="fixed inset-0 z-40 bg-slate-950/20" onClick={closeDetail} />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-[720px] border-l border-border/80 bg-white/95 shadow-2xl backdrop-blur-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    Detalle del colegio
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">
                    {detailSchool.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeDetail}
                  className="rounded-[0.9rem] border border-border/80 p-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={kindBadgeVariant(detailSchool.kind)}>{detailSchool.kind}</Badge>
                    <Badge variant={statusBadgeVariant(detailSchool.operationalStatus)}>
                      {detailSchool.operationalStatus}
                    </Badge>
                  </div>

                  <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                    <p className="font-medium text-foreground">{detailSchool.address}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{detailSchool.city}</p>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_280px]">
                  <div className="space-y-4">
                    <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                      <div className="flex items-center gap-2 text-foreground">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <p className="text-sm font-semibold">Horario</p>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {detailSchool.operatingDays}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {detailSchool.scheduleWindows.length ? (
                          detailSchool.scheduleWindows.map((window) => (
                            <Badge key={window} variant="outline" className="bg-white">
                              {window}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="warning">Sin franjas definidas</Badge>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                      <div className="flex items-center gap-2 text-foreground">
                        <Building2 className="h-4 w-4 text-primary" />
                        <p className="text-sm font-semibold">Condicion operativa</p>
                      </div>
                      <div className="mt-3 space-y-3 text-sm">
                        <p className="text-foreground">{detailSchool.senaCoverageSummary}</p>
                        <p className="text-muted-foreground">{detailSchool.participationMode}</p>
                        <p className="text-muted-foreground">{detailSchool.observations}</p>
                      </div>
                    </div>

                    <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                      <div className="flex items-center gap-2 text-foreground">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <p className="text-sm font-semibold">Fichas asociadas</p>
                      </div>
                      {detailSchool.associatedFichas.length ? (
                        <div className="mt-3 space-y-2">
                          {detailSchool.associatedFichas.map((ficha) => (
                            <div
                              key={ficha.id}
                              className="rounded-[0.95rem] border border-border/70 bg-white px-3 py-3"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-medium text-foreground">Ficha {ficha.number}</p>
                                  <p className="text-sm text-muted-foreground">{ficha.program}</p>
                                </div>
                                <Badge
                                  variant={
                                    ficha.status === "Lista"
                                      ? "success"
                                      : ficha.status === "Parcial"
                                        ? "warning"
                                        : "outline"
                                  }
                                >
                                  {ficha.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-3 rounded-[0.95rem] border border-dashed border-border/80 bg-white/70 px-3 py-4 text-sm text-muted-foreground">
                          Aun no hay fichas asociadas a este colegio.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                      <div className="flex items-center gap-2 text-foreground">
                        <Clock3 className="h-4 w-4 text-primary" />
                        <p className="text-sm font-semibold">Preparacion</p>
                      </div>
                      <div className="mt-3 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm text-muted-foreground">Horario definido</p>
                          <Badge variant={detailSchool.hasSchedule ? "success" : "warning"}>
                            {detailSchool.hasSchedule ? "Si" : "No"}
                          </Badge>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm text-muted-foreground">
                            Condicion operativa
                          </p>
                          <Badge
                            variant={detailHasOperationalCondition ? "success" : "warning"}
                          >
                            {detailHasOperationalCondition ? "Definida" : "Pendiente"}
                          </Badge>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm text-muted-foreground">Fichas asociadas</p>
                          <Badge
                            variant={detailHasAssociatedFichas ? "success" : "warning"}
                          >
                            {detailHasAssociatedFichas ? "Si" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                      <div className="flex items-center gap-2 text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <p className="text-sm font-semibold">Estado final</p>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {detailIsReady
                          ? "El colegio cuenta con condiciones basicas para pasar a futura asignacion."
                          : "Todavia faltan definiciones operativas antes de usar este colegio en asignacion."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant={detailIsReady ? "success" : "warning"}>
                          {detailIsReady ? "Listo para asignacion" : "Pendiente"}
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          {detailSchool.site}
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          <MapPin className="mr-1 h-3.5 w-3.5" />
                          {detailSchool.city}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-border/70 px-5 py-4">
                <Button type="button" variant="outline" onClick={closeDetail}>
                  Cerrar
                </Button>
              </div>
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}
