"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, DoorOpen, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CoordinatorEnvironmentMatrixRow } from "@/lib/types";
import { coordinatorSites } from "@/lib/mocks/coordinator-console";
import { cn } from "@/lib/utils";

type CoordinatorEnvironmentMatrixProps = {
  rows: CoordinatorEnvironmentMatrixRow[];
  blocks: string[];
};

type SelectedEnvironmentCell = {
  row: CoordinatorEnvironmentMatrixRow;
  block: string;
  cell: CoordinatorEnvironmentMatrixRow["cells"][number];
};

function cellStyles(state: CoordinatorEnvironmentMatrixRow["cells"][number]["state"]) {
  if (state === "Conflicto") {
    return "border-danger/35 bg-[linear-gradient(135deg,rgba(239,68,68,0.08),rgba(255,255,255,0.95))] ring-1 ring-danger/20";
  }

  if (state === "Ocupado") {
    return "border-primary/20 bg-[linear-gradient(135deg,rgba(22,163,74,0.07),rgba(255,255,255,0.98))]";
  }

  return "border-success/20 bg-[linear-gradient(135deg,rgba(220,252,231,0.75),rgba(255,255,255,0.98))]";
}

function stateLabel(state: CoordinatorEnvironmentMatrixRow["cells"][number]["state"]) {
  if (state === "Conflicto") {
    return "Conflicto";
  }

  if (state === "Ocupado") {
    return "Ocupado";
  }

  return "Libre";
}

function shortInstructorName(name?: string) {
  if (!name) {
    return "Sin instructor";
  }

  const parts = name.split(" ").filter(Boolean);

  if (parts.length < 2) {
    return name;
  }

  return `${parts[0]} ${parts[1]}`;
}

export function CoordinatorEnvironmentMatrix({
  rows,
  blocks,
}: CoordinatorEnvironmentMatrixProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [dependencyFilter, setDependencyFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState<"all" | "free" | "occupied" | "conflict">(
    "all",
  );
  const [selectedCell, setSelectedCell] = useState<SelectedEnvironmentCell | null>(null);
  const visibleDays = useMemo(
    () => Array.from(new Set(blocks.map((block) => block.split(" ")[0]))),
    [blocks],
  );
  const [selectedDay, setSelectedDay] = useState(visibleDays[0] ?? "Lun");

  const selectedSite = searchParams.get("site") ?? coordinatorSites[0]?.id ?? "";

  function handleSiteChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("site", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  const filteredRows = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return rows.filter((row) => {
      const dependencyMatch = dependencyFilter === "Todas" || row.type === dependencyFilter;
      const statusMatch =
        statusFilter === "all"
          ? true
          : statusFilter === "free"
            ? row.cells.some((cell) => cell.state === "Libre")
            : statusFilter === "occupied"
              ? row.cells.some((cell) => cell.state === "Ocupado")
              : row.cells.some((cell) => cell.state === "Conflicto");
      const rowMatch =
        row.name.toLowerCase().includes(normalized) ||
        row.site.toLowerCase().includes(normalized) ||
        row.type.toLowerCase().includes(normalized);
      const cellMatch = row.cells.some(
        (cell) =>
          cell.ficha?.toLowerCase().includes(normalized) ||
          cell.instructor?.toLowerCase().includes(normalized),
      );

      const searchMatch = !normalized || rowMatch || cellMatch;

      return dependencyMatch && statusMatch && searchMatch;
    });
  }, [dependencyFilter, rows, search, statusFilter]);

  const boardTotals = useMemo(() => {
    const cells = filteredRows.flatMap((row) => row.cells);

    return {
      environments: filteredRows.length,
      free: cells.filter((cell) => cell.state === "Libre").length,
      occupied: cells.filter((cell) => cell.state === "Ocupado").length,
      conflicts: cells.filter((cell) => cell.state === "Conflicto").length,
    };
  }, [filteredRows]);
  const visibleBlocks = useMemo(
    () => blocks.filter((block) => block.startsWith(`${selectedDay} `)),
    [blocks, selectedDay],
  );

  const drawerTone =
    selectedCell?.cell.state === "Conflicto"
      ? "border-danger/20 bg-danger/5"
      : selectedCell?.cell.state === "Ocupado"
        ? "border-primary/15 bg-primary/5"
        : "border-border/80 bg-background/70";
  const gridTemplate = `240px repeat(${visibleBlocks.length}, minmax(190px, 1fr))`;

  return (
    <>
      <Card className="overflow-hidden border-border/70 bg-white/82 shadow-none">
        <CardHeader className="gap-4 border-b border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.88))]">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Consola de ocupacion
              </p>
              <CardTitle className="mt-2">Tablero de ocupacion por bloque</CardTitle>
              <CardDescription>
                Cada fila representa un ambiente y cada celda muestra la disponibilidad real por bloque. La jornada noche queda prevista como franja que termina a las 6:00 a. m. del dia siguiente.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border/80 bg-white px-3 py-1">Libre</span>
              <span className="rounded-full border border-primary/15 bg-primary/6 px-3 py-1">Ocupado</span>
              <span className="rounded-full border border-danger/20 bg-danger/8 px-3 py-1">Conflicto</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[0.95rem] border border-border/70 bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Ambientes visibles
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">{boardTotals.environments}</p>
            </div>
            <div className="rounded-[0.95rem] border border-success/20 bg-success/5 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-success">
                Bloques libres
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">{boardTotals.free}</p>
            </div>
            <div className="rounded-[0.95rem] border border-primary/15 bg-primary/5 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                Bloques ocupados
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">{boardTotals.occupied}</p>
            </div>
            <div className="rounded-[0.95rem] border border-danger/20 bg-danger/5 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-danger">
                Conflictos
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">{boardTotals.conflicts}</p>
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-[180px_180px_minmax(260px,1fr)_auto] xl:items-center">
            <Select value={selectedSite} onChange={(event) => handleSiteChange(event.target.value)}>
              {coordinatorSites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.label}
                </option>
              ))}
            </Select>

            <Select
              value={dependencyFilter}
              onChange={(event) => setDependencyFilter(event.target.value)}
            >
              <option value="Todas">Todas las dependencias</option>
              <option value="Titulada">Titulada</option>
              <option value="Complementaria">Complementaria</option>
            </Select>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
                placeholder="Buscar ambiente, ficha o instructor"
              />
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              {[
                { id: "free", label: "Solo libres" },
                { id: "occupied", label: "Solo ocupados" },
                { id: "conflict", label: "Solo conflictos" },
              ].map((filter) => {
                const active = statusFilter === filter.id;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() =>
                      setStatusFilter((current) =>
                        current === filter.id ? "all" : (filter.id as typeof statusFilter),
                      )
                    }
                    className={cn(
                      "rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-white text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {filter.label}
                  </button>
                );
              })}
              </div>
            </div>

          <div className="flex flex-col gap-3 rounded-[0.95rem] border border-border/70 bg-background/55 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Vista por dia
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cambia el dia visible para revisar manana, tarde y noche con bloques mas amplios y legibles.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleDays.map((day) => {
                  const active = selectedDay === day;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-white text-muted-foreground hover:border-primary/20 hover:text-foreground",
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[0.95rem] border border-border/70 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Dia visible
                </p>
                <p className="mt-1 text-base font-semibold text-foreground">{selectedDay}</p>
              </div>
              <div className="rounded-[0.95rem] border border-border/70 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Jornadas del dia
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {visibleBlocks.map((block) => block.split(" ").slice(1).join(" ")).join(" · ")}
                </p>
              </div>
              <div className="rounded-[0.95rem] border border-border/70 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Ambientes visibles
                </p>
                <p className="mt-1 text-base font-semibold text-foreground">{filteredRows.length}</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1040px]">
              <div
                className="grid border-b border-border/70 bg-background/70"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                <div className="sticky left-0 z-20 border-r border-border/70 bg-background/90 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground backdrop-blur">
                  Ambiente
                </div>
                {visibleBlocks.map((block) => (
                  <div
                    key={block}
                    className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    {block}
                  </div>
                ))}
              </div>

              {filteredRows.map((row) => (
                <div
                  key={row.id}
                  className="grid border-b border-border/60 last:border-0"
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  <div className="sticky left-0 z-10 border-r border-border/70 bg-white/95 px-5 py-4 backdrop-blur">
                    <p className="font-semibold text-foreground">{row.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {row.site} · {row.type}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      Capacidad {row.capacity}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full border border-success/20 bg-success/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-success">
                        {row.cells.filter((cell) => cell.state === "Libre").length} libres
                      </span>
                      <span className="rounded-full border border-danger/20 bg-danger/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-danger">
                        {row.cells.filter((cell) => cell.state === "Conflicto").length} conflicto
                      </span>
                    </div>
                  </div>

                  {visibleBlocks.map((block) => {
                    const cell = row.cells.find((item) => item.block === block) ?? {
                      id: `${row.id}-${block}`,
                      block,
                      state: "Libre" as const,
                    };

                    return (
                      <div key={`${row.id}-${block}`} className="p-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCell({ row, block, cell })}
                          className={cn(
                            "min-h-[132px] w-full rounded-[1rem] border px-4 py-4 text-left transition-all hover:-translate-y-[1px] hover:border-primary/30 hover:shadow-[0_10px_24px_-22px_rgba(15,23,42,0.45)]",
                            cellStyles(cell.state),
                            selectedCell?.row.id === row.id &&
                              selectedCell?.block === block &&
                              "ring-2 ring-primary/25",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <Badge
                              variant={
                                cell.state === "Conflicto"
                                  ? "danger"
                                  : cell.state === "Ocupado"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="px-2.5 py-1 text-[10px]"
                            >
                              {stateLabel(cell.state)}
                            </Badge>
                            {cell.state === "Conflicto" ? (
                              <AlertTriangle className="h-4 w-4 text-danger" />
                            ) : cell.state === "Libre" ? (
                              <DoorOpen className="h-4 w-4 text-primary" />
                            ) : null}
                          </div>

                          {cell.state === "Libre" ? (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-foreground">Disponible</p>
                              <p className="mt-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                {block.split(" ").slice(1).join(" ")}
                              </p>
                            </div>
                          ) : (
                            <div className="mt-3 space-y-2">
                              <p className="text-sm font-semibold leading-5 text-foreground">
                                Ficha {cell.ficha}
                              </p>
                              <p className="text-xs leading-5 text-muted-foreground">
                                {shortInstructorName(cell.instructor)}
                              </p>
                              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                                {block.split(" ").slice(1).join(" ")}
                              </p>
                              <Badge variant="outline" className="px-2.5 py-1 text-[10px]">
                                {row.type}
                              </Badge>
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}

              {!filteredRows.length ? (
                <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                  No hay ambientes visibles con el filtro actual.
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCell ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/20"
            onClick={() => setSelectedCell(null)}
          />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border/80 bg-white/95 shadow-2xl backdrop-blur-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    Detalle de bloque
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">
                    {selectedCell.row.name} · {selectedCell.block}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedCell.row.site} · capacidad {selectedCell.row.capacity}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCell(null)}
                  className="rounded-[0.9rem] border border-border/80 p-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                <div className={cn("rounded-[1rem] border p-4", drawerTone)}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Estado
                      </p>
                      <p className="mt-1 text-base font-semibold text-foreground">
                        {stateLabel(selectedCell.cell.state)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        selectedCell.cell.state === "Conflicto"
                          ? "danger"
                          : selectedCell.cell.state === "Ocupado"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {stateLabel(selectedCell.cell.state)}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {selectedCell.cell.state === "Libre"
                      ? "Bloque disponible para ubicar una ficha pendiente."
                      : selectedCell.cell.state === "Ocupado"
                        ? "Bloque en uso actual dentro de la programacion operativa."
                        : "Bloque con riesgo operativo y necesidad de revision inmediata."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Ambiente
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {selectedCell.row.name}
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Bloque
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {selectedCell.block}
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Sede
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {selectedCell.row.site}
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Dependencia
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {selectedCell.row.type}
                    </p>
                  </div>
                </div>

                {selectedCell.cell.state === "Libre" ? (
                  <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                    Este bloque esta disponible para futura asignacion. Puedes usarlo para ubicar una ficha pendiente sin salir del tablero operativo.
                  </div>
                ) : null}

                {selectedCell.cell.state === "Ocupado" ? (
                  <div className="space-y-3">
                    <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Ficha
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {selectedCell.cell.ficha}
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Instructor
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {selectedCell.cell.instructor}
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                      Este ambiente esta ocupado en el bloque seleccionado por una ficha de {selectedCell.row.type.toLowerCase()}.
                    </div>
                    <div className="rounded-[1rem] border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground">
                      Siguiente lectura util: valida si esta ocupacion puede mantenerse o si necesitas liberar este bloque para otra ficha prioritaria.
                    </div>
                  </div>
                ) : null}

                {selectedCell.cell.state === "Conflicto" ? (
                  <div className="space-y-3">
                    <div className="rounded-[1rem] border border-danger/20 bg-danger/6 p-4">
                      <div className="flex items-center gap-2 font-medium text-danger">
                        <AlertTriangle className="h-4 w-4" />
                        Conflicto operativo
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        El bloque presenta cruce de uso o inconsistencia de asignacion. Requiere validacion antes de mover otra ficha a este ambiente.
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Ficha comprometida
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {selectedCell.cell.ficha}
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Contexto
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {selectedCell.cell.instructor}
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-danger/20 bg-danger/5 p-4 text-sm text-muted-foreground">
                      Recomendacion: revisar cruce de bloque, disponibilidad del instructor y reubicar si la ficha requiere continuidad en este horario.
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}
