"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FileSpreadsheet, FolderOpen, Layers3, PenSquare, Plus, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

import {
  FichaGeneralStatusBadge,
  FichaStateTagBadge,
  OperationalDependencyBadge,
} from "@/components/coordinator/coordinator-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  resolveCoordinatorFichaGeneralStatus,
  resolveCoordinatorFichaState,
} from "@/lib/mocks/coordinator-fichas";
import {
  CoordinatorFichaShift,
  CoordinatorFichaSummary,
  CoordinatorOperationalDependency,
  CoordinatorOperationalMetric,
} from "@/lib/types";

type CoordinatorFichaDirectoryProps = {
  fichas: CoordinatorFichaSummary[];
  metrics: CoordinatorOperationalMetric[];
  siteLabel: string;
};

type DrawerMode = "new" | "edit" | null;

type FichaFormValues = {
  number: string;
  program: string;
  dependency: CoordinatorOperationalDependency;
  programType: string;
  shift: CoordinatorFichaShift;
  site: string;
  expectedApprentices: string;
  assignedInstructor: string;
  assignedEnvironment: string;
  articulationSchool: string;
  articulationMode: string;
  locality: string;
  observations: string;
};

const dependencyOptions: CoordinatorOperationalDependency[] = [
  "Articulacion",
  "Titulada",
  "Complementaria",
];

const shiftOptions: CoordinatorFichaShift[] = ["Manana", "Tarde", "Noche"];

function buildFormValues(siteLabel: string, ficha?: CoordinatorFichaSummary): FichaFormValues {
  return {
    number: ficha?.number ?? "",
    program: ficha?.program ?? "",
    dependency: ficha?.dependency ?? "Titulada",
    programType: ficha?.programType ?? "Formacion titulada",
    shift: ficha?.shift ?? "Manana",
    site: ficha?.site ?? siteLabel,
    expectedApprentices: `${ficha?.expectedApprentices ?? 30}`,
    assignedInstructor: ficha?.assignedInstructor ?? "",
    assignedEnvironment: ficha?.assignedEnvironment ?? "",
    articulationSchool: ficha?.articulationSchool ?? "",
    articulationMode: ficha?.articulationMode ?? "Compartida",
    locality: ficha?.locality ?? "",
    observations: ficha?.observations ?? "",
  };
}

export function CoordinatorFichaDirectory({
  fichas,
  metrics,
  siteLabel,
}: CoordinatorFichaDirectoryProps) {
  const searchParams = useSearchParams();
  const [items, setItems] = useState(fichas);
  const [search, setSearch] = useState("");
  const [dependencyFilter, setDependencyFilter] = useState("Todas");
  const [programTypeFilter, setProgramTypeFilter] = useState("Todos");
  const [shiftFilter, setShiftFilter] = useState("Todas");
  const [stateFilter, setStateFilter] = useState("Todos");
  const [instructorFilter, setInstructorFilter] = useState("Todos");
  const [environmentFilter, setEnvironmentFilter] = useState("Todos");
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FichaFormValues>(buildFormValues(siteLabel));

  const programTypeOptions = ["Todos", ...new Set(items.map((item) => item.programType))];
  const stateOptions = ["Todos", ...new Set(items.flatMap((item) => item.stateTags))];

  function buildHref(path: string, extra?: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(extra ?? {}).forEach(([key, value]) => {
      params.set(key, value);
    });

    const query = params.toString();
    return query ? `${path}?${query}` : path;
  }

  function openNewDrawer() {
    setDrawerMode("new");
    setEditingId(null);
    setFormValues(buildFormValues(siteLabel));
  }

  function openEditDrawer(ficha: CoordinatorFichaSummary) {
    setDrawerMode("edit");
    setEditingId(ficha.id);
    setFormValues(buildFormValues(siteLabel, ficha));
  }

  function closeDrawer() {
    setDrawerMode(null);
    setEditingId(null);
  }

  function updateFormValue<Key extends keyof FichaFormValues>(key: Key, value: FichaFormValues[Key]) {
    setFormValues((current) => ({ ...current, [key]: value }));
  }

  function saveFicha() {
    const expectedApprentices = Number(formValues.expectedApprentices || 30);
    const assignedInstructor = formValues.assignedInstructor.trim() || undefined;
    const requiresEnvironment = formValues.dependency !== "Articulacion";
    const assignedEnvironment =
      requiresEnvironment && formValues.assignedEnvironment.trim()
        ? formValues.assignedEnvironment.trim()
        : undefined;
    const articulationSchool =
      formValues.dependency === "Articulacion"
        ? formValues.articulationSchool.trim() || undefined
        : undefined;
    const articulationMode =
      formValues.dependency === "Articulacion"
        ? ((formValues.articulationMode || "Compartida") as CoordinatorFichaSummary["articulationMode"])
        : undefined;
    const locality =
      formValues.dependency === "Articulacion"
        ? formValues.locality.trim() || undefined
        : undefined;
    const stateTags = resolveCoordinatorFichaState(
      0,
      expectedApprentices,
      assignedInstructor,
      assignedEnvironment,
      requiresEnvironment,
    );
    const payload: CoordinatorFichaSummary = {
      id: editingId ?? `FIC-MANUAL-${Date.now()}`,
      number: formValues.number.trim() || `34${Date.now().toString().slice(-5)}`,
      program: formValues.program.trim() || "Nueva ficha",
      dependency: formValues.dependency,
      programType: formValues.programType,
      shift: formValues.shift,
      site: formValues.site,
      expectedApprentices,
      apprenticeCount: editingId
        ? items.find((item) => item.id === editingId)?.apprenticeCount ?? 0
        : 0,
      assignedInstructor,
      assignedEnvironment,
      articulationSchool,
      articulationMode,
      locality,
      requiresEnvironment,
      generalStatus: resolveCoordinatorFichaGeneralStatus(stateTags),
      stateTags,
      observations:
        formValues.observations.trim() || "Ficha creada manualmente desde el modulo operativo.",
      createdAt: editingId
        ? items.find((item) => item.id === editingId)?.createdAt ?? "2026-03-31 10:40"
        : "2026-03-31 10:40",
      updatedAt: "2026-03-31 10:40",
      lastImportAt: editingId ? items.find((item) => item.id === editingId)?.lastImportAt : undefined,
      updatedBy: "Natalia Barbosa",
    };

    setItems((current) => {
      if (!editingId) {
        return [payload, ...current];
      }

      return current.map((item) => (item.id === editingId ? payload : item));
    });
    closeDrawer();
  }

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !normalized ||
        item.number.toLowerCase().includes(normalized) ||
        item.program.toLowerCase().includes(normalized);
      const matchesDependency =
        dependencyFilter === "Todas" || item.dependency === dependencyFilter;
      const matchesProgramType =
        programTypeFilter === "Todos" || item.programType === programTypeFilter;
      const matchesShift = shiftFilter === "Todas" || item.shift === shiftFilter;
      const matchesState =
        stateFilter === "Todos" || item.stateTags.includes(stateFilter as typeof item.stateTags[number]);
      const matchesInstructor =
        instructorFilter === "Todos" ||
        (instructorFilter === "Con instructor" ? Boolean(item.assignedInstructor) : !item.assignedInstructor);
      const matchesEnvironment =
        environmentFilter === "Todos" ||
        (environmentFilter === "Con ambiente" ? Boolean(item.assignedEnvironment) : !item.assignedEnvironment);

      return (
        matchesSearch &&
        matchesDependency &&
        matchesProgramType &&
        matchesShift &&
        matchesState &&
        matchesInstructor &&
        matchesEnvironment
      );
    });
  }, [
    dependencyFilter,
    environmentFilter,
    instructorFilter,
    items,
    programTypeFilter,
    search,
    shiftFilter,
    stateFilter,
  ]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-[1rem] border border-border/80 bg-white px-4 py-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {metric.label}
            </p>
            <p className="mt-1 text-[1.3rem] font-semibold leading-none text-foreground">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <CardTitle>Directorio de fichas</CardTitle>
              <CardDescription>
                Cada ficha se gestiona como una unidad operativa con detalle propio, carga de aprendices y seguimiento de asignacion.
              </CardDescription>
            </div>
            <Button type="button" onClick={openNewDrawer}>
              <Plus className="h-4 w-4" />
              Nueva ficha
            </Button>
          </div>

          <div className="grid gap-3 xl:grid-cols-[minmax(240px,1.2fr)_repeat(3,minmax(140px,1fr))] 2xl:grid-cols-[minmax(240px,1.3fr)_repeat(5,minmax(120px,1fr))]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
                placeholder="Buscar por numero de ficha o programa"
              />
            </div>
            <Select value={dependencyFilter} onChange={(event) => setDependencyFilter(event.target.value)}>
              <option value="Todas">Dependencia</option>
              {dependencyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <Select value={programTypeFilter} onChange={(event) => setProgramTypeFilter(event.target.value)}>
              <option value="Todos">Tipo de programa</option>
              {programTypeOptions
                .filter((option) => option !== "Todos")
                .map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </Select>
            <Select value={shiftFilter} onChange={(event) => setShiftFilter(event.target.value)}>
              <option value="Todas">Jornada</option>
              {shiftOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <Select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}>
              {stateOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "Todos" ? "Estado" : option}
                </option>
              ))}
            </Select>
            <Select value={instructorFilter} onChange={(event) => setInstructorFilter(event.target.value)}>
              <option value="Todos">Instructor</option>
              <option value="Con instructor">Con instructor</option>
              <option value="Sin instructor">Sin instructor</option>
            </Select>
            <Select value={environmentFilter} onChange={(event) => setEnvironmentFilter(event.target.value)}>
              <option value="Todos">Ambiente</option>
              <option value="Con ambiente">Con ambiente</option>
              <option value="Sin ambiente">Sin ambiente</option>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {!filtered.length ? (
            <EmptyState
              icon={Layers3}
              title="No hay fichas visibles"
              description="Ajusta los filtros para recuperar fichas dentro de la sede activa."
            />
          ) : (
            <div className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[1.1rem] border border-border/80 bg-white p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-foreground">Ficha {item.number}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.program} ·{" "}
                        {item.dependency === "Articulacion"
                          ? `${item.articulationMode ?? "Modalidad pendiente"} · ${item.shift} · ${item.locality ?? item.site}`
                          : `${item.shift} · ${item.site}`}
                      </p>
                    </div>
                    <FichaGeneralStatusBadge status={item.generalStatus} />
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">Aprendices:</span>{" "}
                      {item.apprenticeCount}/{item.expectedApprentices}
                    </p>
                    {item.dependency === "Articulacion" ? (
                      <>
                        <p>
                          <span className="font-medium text-foreground">Colegio:</span>{" "}
                          {item.articulationSchool ?? "Pendiente"}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">Localidad:</span>{" "}
                          {item.locality ?? item.site}
                        </p>
                      </>
                    ) : null}
                    <p>
                      <span className="font-medium text-foreground">Instructor:</span>{" "}
                      {item.assignedInstructor ?? "Pendiente"}
                    </p>
                    {item.requiresEnvironment ? (
                      <p>
                        <span className="font-medium text-foreground">Ambiente:</span>{" "}
                        {item.assignedEnvironment ?? "Pendiente"}
                      </p>
                    ) : (
                      <p>
                        <span className="font-medium text-foreground">Modalidad:</span>{" "}
                        {item.articulationMode ?? "Pendiente"}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <OperationalDependencyBadge dependency={item.dependency} />
                    {item.stateTags.map((state) => (
                      <FichaStateTagBadge key={`${item.id}-${state}`} state={state} />
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={buildHref(`/coordinador/fichas/${item.id}`)}>
                        <FolderOpen className="h-4 w-4" />
                        Ver detalle
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={buildHref(`/coordinador/fichas/${item.id}`, { action: "importar" })}>
                        <FileSpreadsheet className="h-4 w-4" />
                        Importar Excel
                      </Link>
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => openEditDrawer(item)}>
                      <PenSquare className="h-4 w-4" />
                      Editar ficha
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {drawerMode ? (
        <div className="fixed inset-0 z-40 bg-slate-950/25">
          <div className="absolute inset-y-0 right-0 w-full max-w-xl border-l border-border/80 bg-white shadow-2xl">
            <div className="flex h-full flex-col">
              <div className="border-b border-border/80 px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Fichas
                </p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">
                  {drawerMode === "new" ? "Nueva ficha" : "Editar ficha"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajusta los datos base de la ficha sin salir del directorio operativo.
                </p>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    value={formValues.number}
                    onChange={(event) => updateFormValue("number", event.target.value)}
                    placeholder="Numero de ficha"
                  />
                  <Input
                    value={formValues.program}
                    onChange={(event) => updateFormValue("program", event.target.value)}
                    placeholder="Programa"
                  />
                  <Select
                    value={formValues.dependency}
                    onChange={(event) =>
                      updateFormValue(
                        "dependency",
                        event.target.value as CoordinatorOperationalDependency,
                      )
                    }
                  >
                    {dependencyOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                  <Input
                    value={formValues.programType}
                    onChange={(event) => updateFormValue("programType", event.target.value)}
                    placeholder="Tipo de programa"
                  />
                  <Select
                    value={formValues.shift}
                    onChange={(event) =>
                      updateFormValue("shift", event.target.value as CoordinatorFichaShift)
                    }
                  >
                    {shiftOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                  <Input
                    value={formValues.site}
                    onChange={(event) => updateFormValue("site", event.target.value)}
                    placeholder="Sede"
                  />
                  <Input
                    value={formValues.expectedApprentices}
                    onChange={(event) => updateFormValue("expectedApprentices", event.target.value)}
                    placeholder="Cantidad esperada"
                  />
                  <Input
                    value={formValues.assignedInstructor}
                    onChange={(event) => updateFormValue("assignedInstructor", event.target.value)}
                    placeholder="Instructor asignado"
                  />
                  {formValues.dependency === "Articulacion" ? (
                    <>
                      <Input
                        value={formValues.articulationSchool}
                        onChange={(event) => updateFormValue("articulationSchool", event.target.value)}
                        placeholder="Colegio"
                      />
                      <Select
                        value={formValues.articulationMode}
                        onChange={(event) => updateFormValue("articulationMode", event.target.value)}
                      >
                        <option value="Compartida">Compartida</option>
                        <option value="Unica">Unica</option>
                        <option value="Colegio privado">Colegio privado</option>
                      </Select>
                      <Input
                        value={formValues.locality}
                        onChange={(event) => updateFormValue("locality", event.target.value)}
                        placeholder="Localidad o ciudad"
                      />
                      <div className="sm:col-span-2 rounded-[1rem] border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                        Articulacion trabaja por colegio y modalidad. No requiere ambiente del centro.
                      </div>
                    </>
                  ) : (
                    <div className="sm:col-span-2">
                      <Input
                        value={formValues.assignedEnvironment}
                        onChange={(event) => updateFormValue("assignedEnvironment", event.target.value)}
                        placeholder="Ambiente asignado"
                      />
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <Textarea
                      value={formValues.observations}
                      onChange={(event) => updateFormValue("observations", event.target.value)}
                      placeholder="Observaciones operativas"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-border/80 px-5 py-4">
                <Button type="button" variant="outline" onClick={closeDrawer}>
                  Cancelar
                </Button>
                <Button type="button" onClick={saveFicha}>
                  Guardar ficha
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
