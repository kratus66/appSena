"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Power, School, Trash2, X } from "lucide-react";

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

type CoordinatorSchoolCatalogProps = {
  items: CoordinatorSchoolCard[];
  siteLabel: string;
  onCreateSchool: (school: CoordinatorSchoolCard) => void;
  onUpdateSchool: (school: CoordinatorSchoolCard) => void;
  onDeleteSchool: (schoolId: string) => void;
};

type DrawerMode = "create" | "view" | "edit" | null;

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

function buildForm(siteLabel: string, school?: CoordinatorSchoolCard): SchoolForm {
  return {
    name: school?.name ?? "",
    kind: school?.kind ?? "Publico",
    address: school?.address ?? "",
    city: school?.city ?? "",
    site: school?.site ?? siteLabel,
    scheduleLabel: school?.scheduleLabel ?? "",
    operatingDays: school?.operatingDays ?? "",
    senaCoverageSummary: school?.senaCoverageSummary ?? "",
    monthlyRule: school?.monthlyRule ?? "",
    operationalStatus: school?.operationalStatus ?? "Pendiente horario",
  };
}

export function CoordinatorSchoolCatalog({
  items,
  siteLabel,
  onCreateSchool,
  onUpdateSchool,
  onDeleteSchool,
}: CoordinatorSchoolCatalogProps) {
  const [search, setSearch] = useState("");
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<SchoolForm>(buildForm(siteLabel));

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return items.filter((item) => {
      return (
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.address.toLowerCase().includes(normalized) ||
        item.city.toLowerCase().includes(normalized)
      );
    });
  }, [items, search]);

  const selectedSchool = items.find((item) => item.id === selectedId) ?? null;

  function openCreate() {
    setDrawerMode("create");
    setSelectedId(null);
    setForm(buildForm(siteLabel));
  }

  function openView(school: CoordinatorSchoolCard) {
    setDrawerMode("view");
    setSelectedId(school.id);
    setForm(buildForm(siteLabel, school));
  }

  function openEdit(school: CoordinatorSchoolCard) {
    setDrawerMode("edit");
    setSelectedId(school.id);
    setForm(buildForm(siteLabel, school));
  }

  function closeDrawer() {
    setDrawerMode(null);
    setSelectedId(null);
    setForm(buildForm(siteLabel));
  }

  function buildPayload(id?: string): CoordinatorSchoolCard {
    const operationalStatus = form.operationalStatus;

    return {
      id: id ?? `MAN-${Date.now()}`,
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
      operationalStatus,
      hasSchedule: operationalStatus !== "Pendiente horario",
      readyForAssignment: operationalStatus === "Listo para asignacion",
    };
  }

  function saveSchool() {
    if (drawerMode === "create") {
      onCreateSchool(buildPayload());
      closeDrawer();
      return;
    }

    if (drawerMode === "edit" && selectedSchool) {
      onUpdateSchool(buildPayload(selectedSchool.id));
      closeDrawer();
    }
  }

  function deactivateSchool() {
    if (!selectedSchool) {
      return;
    }

    onUpdateSchool({
      ...selectedSchool,
      operationalStatus: "Pendiente horario",
      hasSchedule: false,
      readyForAssignment: false,
    });
    closeDrawer();
  }

  function deleteSchool() {
    if (!selectedSchool) {
      return;
    }

    const confirmed = window.confirm(
      `Vas a eliminar ${selectedSchool.name} del inventario de colegios. Esta accion no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    onDeleteSchool(selectedSchool.id);
    closeDrawer();
  }

  const readOnly = drawerMode === "view";

  return (
    <>
      <Card className="border-border/70 bg-white/78 shadow-none">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <CardTitle>Gestion de colegios</CardTitle>
              <CardDescription>
                Inventario secundario para crear, consultar, editar y retirar colegios sin quitar protagonismo a la vista operativa.
              </CardDescription>
            </div>
            <Button type="button" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Nuevo colegio
            </Button>
          </div>

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, direccion o ciudad"
          />
        </CardHeader>

        <CardContent>
          {!filtered.length ? (
            <EmptyState
              icon={School}
              title="Sin colegios en el inventario"
              description="Crea un colegio nuevo o ajusta la busqueda para recuperar registros."
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((school) => (
                <div
                  key={school.id}
                  className="rounded-[1rem] border border-border/70 bg-background/65 px-4 py-4"
                >
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{school.name}</p>
                        <Badge variant={kindBadgeVariant(school.kind)}>{school.kind}</Badge>
                        <Badge variant={statusBadgeVariant(school.operationalStatus)}>
                          {school.operationalStatus}
                        </Badge>
                      </div>
                      <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                        <p>{school.address}</p>
                        <p>{school.city}</p>
                        <p>{school.scheduleLabel}</p>
                        <p>{school.senaCoverageSummary}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => openView(school)}>
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => openEdit(school)}>
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {drawerMode ? (
        <>
          <div className="fixed inset-0 z-40 bg-slate-950/20" onClick={closeDrawer} />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border/80 bg-white/95 shadow-2xl backdrop-blur-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    Gestion de colegios
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">
                    {drawerMode === "create"
                      ? "Nuevo colegio"
                      : drawerMode === "edit"
                        ? "Editar colegio"
                        : selectedSchool?.name ?? "Ver colegio"}
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
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Nombre del colegio"
                  disabled={readOnly}
                />
                <Select
                  value={form.kind}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, kind: event.target.value as CoordinatorSchoolKind }))
                  }
                  disabled={readOnly}
                >
                  <option value="Publico">Publico</option>
                  <option value="Privado">Privado</option>
                  <option value="Tecnico">Tecnico</option>
                </Select>
                <Input
                  value={form.address}
                  onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                  placeholder="Direccion"
                  disabled={readOnly}
                />
                <Input
                  value={form.city}
                  onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                  placeholder="Ciudad o localidad"
                  disabled={readOnly}
                />
                <Input
                  value={form.scheduleLabel}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, scheduleLabel: event.target.value }))
                  }
                  placeholder="Horario"
                  disabled={readOnly}
                />
                <Input
                  value={form.senaCoverageSummary}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, senaCoverageSummary: event.target.value }))
                  }
                  placeholder="Condicion operativa"
                  disabled={readOnly}
                />
                <Input
                  value={form.operatingDays}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, operatingDays: event.target.value }))
                  }
                  placeholder="Dias de operacion"
                  disabled={readOnly}
                />
                <Select
                  value={form.operationalStatus}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      operationalStatus: event.target.value as CoordinatorSchoolOperationalStatus,
                    }))
                  }
                  disabled={readOnly}
                >
                  <option value="Pendiente horario">Pendiente horario</option>
                  <option value="Con horario definido">Con horario definido</option>
                  <option value="Listo para asignacion">Listo para asignacion</option>
                </Select>
                <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                  {form.monthlyRule || "La regla operativa se ajusta segun el tipo de colegio."}
                </div>
              </div>

              <div className="flex flex-wrap justify-between gap-2 border-t border-border/70 px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  {selectedSchool ? (
                    <>
                      <Button type="button" variant="outline" onClick={deactivateSchool}>
                        <Power className="h-4 w-4" />
                        Desactivar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-danger/30 text-danger hover:bg-danger/10 hover:text-danger"
                        onClick={deleteSchool}
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    </>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={closeDrawer}>
                    {readOnly ? "Cerrar" : "Cancelar"}
                  </Button>
                  {!readOnly ? (
                    <Button type="button" onClick={saveSchool}>
                      {drawerMode === "create" ? "Guardar colegio" : "Guardar cambios"}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}
