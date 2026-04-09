"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowLeft,
  Clock3,
  FileSpreadsheet,
  PenSquare,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
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
import {
  resolveCoordinatorFichaGeneralStatus,
  resolveCoordinatorFichaState,
} from "@/lib/mocks/coordinator-fichas";
import { CoordinatorFichaDetail } from "@/lib/types";

type CoordinatorFichaDetailViewProps = {
  ficha: CoordinatorFichaDetail;
  initialAction?: string;
};

type ManualLearnerForm = {
  fullName: string;
  documentNumber: string;
  email: string;
  phone: string;
};

function buildEmptyLearnerForm(): ManualLearnerForm {
  return {
    fullName: "",
    documentNumber: "",
    email: "",
    phone: "",
  };
}

export function CoordinatorFichaDetailView({
  ficha,
  initialAction: _initialAction,
}: CoordinatorFichaDetailViewProps) {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentFicha, setCurrentFicha] = useState(ficha);
  const [learnerSearch, setLearnerSearch] = useState("");
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState<ManualLearnerForm>(buildEmptyLearnerForm());
  const [editingLearnerId, setEditingLearnerId] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const visibleApprentices = useMemo(() => {
    const normalized = learnerSearch.trim().toLowerCase();

    return currentFicha.apprentices.filter((item) => {
      return (
        !normalized ||
        item.fullName.toLowerCase().includes(normalized) ||
        item.documentNumber.includes(normalized)
      );
    });
  }, [currentFicha.apprentices, learnerSearch]);

  const completionLabel = `${currentFicha.apprenticeCount}/${currentFicha.expectedApprentices}`;

  function buildHref(path: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("action");
    const query = params.toString();

    return query ? `${path}?${query}` : path;
  }

  function refreshFichaState(nextApprenticeCount: number, lastImportAt?: string) {
    const stateTags = resolveCoordinatorFichaState(
      nextApprenticeCount,
      currentFicha.expectedApprentices,
      currentFicha.assignedInstructor,
      currentFicha.assignedEnvironment,
      currentFicha.requiresEnvironment,
    );

    return {
      stateTags,
      generalStatus: resolveCoordinatorFichaGeneralStatus(stateTags),
      updatedAt: "2026-03-31 10:55",
      lastImportAt: lastImportAt ?? currentFicha.lastImportAt,
      updatedBy: "Natalia Barbosa",
    };
  }

  function handlePickExcel() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }
    setCurrentFicha((current) => {
      if (!current.importMock) {
        return current;
      }

      const existingDocuments = new Set(current.apprentices.map((item) => item.documentNumber));
      const availableSlots = Math.max(current.expectedApprentices - current.apprenticeCount, 0);
      const importedLearners = current.importMock.previewRows
        .filter((row) => !existingDocuments.has(row.values.documento))
        .slice(0, availableSlots)
        .map((row, index) => ({
          id: `${current.number}-XLS-${Date.now()}-${index}`,
          documentType: "CC",
          documentNumber: row.values.documento,
          fullName: row.values.nombre_completo,
          email: row.values.correo || "pendiente@mail.com",
          phone: row.values.telefono || "Sin telefono",
          source: "Excel" as const,
          registeredAt: "2026-03-31 10:48",
        }));

      const nextApprentices = [...current.apprentices, ...importedLearners];
      const nextApprenticeCount = nextApprentices.length;
      const nextState = refreshFichaState(nextApprenticeCount, "2026-03-31 10:48");

      setImportSummary(
        importedLearners.length
          ? `${importedLearners.length} aprendices cargados desde ${file.name}. Ahora todos hacen parte del mismo pool editable de la ficha.`
          : "No se agregaron aprendices nuevos desde el archivo porque ya existen o no hay cupo disponible.",
      );

      return {
        ...current,
        apprentices: nextApprentices,
        apprenticeCount: nextApprenticeCount,
        importMock: {
          ...current.importMock,
          fileName: file.name,
          uploadedAt: "2026-03-31 10:48",
        },
        traceability: {
          ...current.traceability,
          updatedAt: nextState.updatedAt,
          lastImportAt: nextState.lastImportAt,
          updatedBy: nextState.updatedBy,
          lastImportBy: "Natalia Barbosa",
        },
        ...nextState,
      };
    });
    event.target.value = "";
  }

  function openLearnerForm() {
    setEditingLearnerId(null);
    setManualForm(buildEmptyLearnerForm());
    setShowManualForm(true);
  }

  function openLearnerEdit(learnerId: string) {
    const learner = currentFicha.apprentices.find((item) => item.id === learnerId);

    if (!learner) {
      return;
    }

    setEditingLearnerId(learnerId);
    setManualForm({
      fullName: learner.fullName,
      documentNumber: learner.documentNumber,
      email: learner.email,
      phone: learner.phone,
    });
    setShowManualForm(true);
  }

  function saveLearner() {
    if (!manualForm.fullName.trim() || !manualForm.documentNumber.trim()) {
      return;
    }

    const nextLearner = editingLearnerId
      ? currentFicha.apprentices.find((item) => item.id === editingLearnerId)
      : null;
    const learnerPayload = {
      id: nextLearner?.id ?? `${currentFicha.number}-MAN-${Date.now()}`,
      documentType: nextLearner?.documentType ?? "CC",
      documentNumber: manualForm.documentNumber.trim(),
      fullName: manualForm.fullName.trim(),
      email: manualForm.email.trim() || "pendiente@mail.com",
      phone: manualForm.phone.trim() || "Sin telefono",
      source: nextLearner?.source ?? ("Manual" as const),
      registeredAt: nextLearner?.registeredAt ?? "2026-03-31 10:55",
    };
    const nextApprentices = editingLearnerId
      ? currentFicha.apprentices.map((item) =>
          item.id === editingLearnerId ? learnerPayload : item,
        )
      : [...currentFicha.apprentices, learnerPayload].slice(0, currentFicha.expectedApprentices);
    const nextApprenticeCount = nextApprentices.length;
    const nextState = refreshFichaState(nextApprenticeCount);

    setCurrentFicha((current) => ({
      ...current,
      apprentices: nextApprentices,
      apprenticeCount: nextApprenticeCount,
      traceability: {
        ...current.traceability,
        updatedAt: nextState.updatedAt,
        updatedBy: nextState.updatedBy,
      },
      ...nextState,
    }));
    setManualForm(buildEmptyLearnerForm());
    setEditingLearnerId(null);
    setShowManualForm(false);
    setImportSummary(
      editingLearnerId
        ? "Aprendiz actualizado dentro del contexto de la ficha."
        : "Aprendiz agregado manualmente dentro del contexto de la ficha.",
    );
  }

  function removeLearner(learnerId: string) {
    const learner = currentFicha.apprentices.find((item) => item.id === learnerId);

    if (!learner) {
      return;
    }

    const confirmed = window.confirm(
      `Vas a eliminar a ${learner.fullName} de la ficha ${currentFicha.number}. Esta accion no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    const nextApprentices = currentFicha.apprentices.filter((item) => item.id !== learnerId);
    const nextApprenticeCount = nextApprentices.length;
    const nextState = refreshFichaState(nextApprenticeCount);

    setCurrentFicha((current) => ({
      ...current,
      apprentices: nextApprentices,
      apprenticeCount: nextApprenticeCount,
      traceability: {
        ...current.traceability,
        updatedAt: nextState.updatedAt,
        updatedBy: nextState.updatedBy,
      },
      ...nextState,
    }));
    if (editingLearnerId === learnerId) {
      setEditingLearnerId(null);
      setManualForm(buildEmptyLearnerForm());
      setShowManualForm(false);
    }
    setImportSummary("Aprendiz eliminado de la ficha.");
  }

  return (
    <div className="space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xls,.xlsx,.csv"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Button asChild variant="outline" size="sm" className="border-primary/25 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary">
          <Link href={buildHref("/coordinador/fichas")}>
            <ArrowLeft className="h-4 w-4" />
            Volver a fichas
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <OperationalDependencyBadge dependency={currentFicha.dependency} />
                <FichaGeneralStatusBadge status={currentFicha.generalStatus} />
              </div>
              <div>
                <CardTitle className="text-[1.55rem]">
                  Ficha {currentFicha.number} · {currentFicha.program}
                </CardTitle>
                <CardDescription>
                  {currentFicha.programType} · {currentFicha.shift || "Por definir"} · {currentFicha.site}
                </CardDescription>
              </div>
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-4">
            <div className="rounded-[1rem] border border-border/80 bg-background/70 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Jornada
              </p>
              <p className="mt-1 font-semibold text-foreground">
                {currentFicha.shift || "Por definir"}
              </p>
            </div>
            <div className="rounded-[1rem] border border-border/80 bg-background/70 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {currentFicha.dependency === "Articulacion" ? "Modalidad" : "Aprendices"}
              </p>
              <p className="mt-1 font-semibold text-foreground">
                {currentFicha.dependency === "Articulacion"
                  ? currentFicha.articulationMode ?? "Pendiente"
                  : completionLabel}
              </p>
            </div>
            <div className="rounded-[1rem] border border-border/80 bg-background/70 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {currentFicha.dependency === "Articulacion" ? "Colegio" : "Instructor"}
              </p>
              <p className="mt-1 font-semibold text-foreground">
                {currentFicha.dependency === "Articulacion"
                  ? currentFicha.articulationSchool ?? "Pendiente"
                  : currentFicha.assignedInstructor ?? "Pendiente"}
              </p>
            </div>
            <div className="rounded-[1rem] border border-border/80 bg-background/70 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {currentFicha.dependency === "Articulacion" ? "Localidad" : "Ambiente"}
              </p>
              <p className="mt-1 font-semibold text-foreground">
                {currentFicha.dependency === "Articulacion"
                  ? currentFicha.locality ?? currentFicha.site
                  : currentFicha.assignedEnvironment ?? "Pendiente"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentFicha.stateTags.map((state) => (
              <FichaStateTagBadge key={`${currentFicha.id}-${state}`} state={state} />
            ))}
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_320px]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Datos generales</CardTitle>
              <CardDescription>
                Informacion academica y operativa base de la ficha dentro de la sede seleccionada.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Numero de ficha
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{currentFicha.number}</p>
              </div>
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Programa
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{currentFicha.program}</p>
              </div>
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Dependencia
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{currentFicha.dependency}</p>
              </div>
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Tipo de programa
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{currentFicha.programType}</p>
              </div>
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Sede
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{currentFicha.site}</p>
              </div>
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Cupo esperado
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {currentFicha.expectedApprentices} aprendices
                </p>
              </div>
              {currentFicha.dependency === "Articulacion" ? (
                <>
                  <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Colegio
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {currentFicha.articulationSchool ?? "Pendiente"}
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Modalidad
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {currentFicha.articulationMode ?? "Pendiente"}
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Localidad
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {currentFicha.locality ?? currentFicha.site}
                    </p>
                  </div>
                </>
              ) : null}
              <div className="sm:col-span-2 rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Observaciones
                </p>
                <p className="mt-1 text-sm text-foreground">{currentFicha.observations}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <CardTitle>Asociar aprendices</CardTitle>
                  <CardDescription>
                    Directorio del grupo con buscador y acciones de cargue dentro del contexto de la ficha.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={handlePickExcel}>
                    <FileSpreadsheet className="h-4 w-4" />
                    Importar Excel
                  </Button>
                  <Button
                    type="button"
                    className="min-w-[170px] px-5"
                    onClick={() => {
                      if (showManualForm && !editingLearnerId) {
                        setShowManualForm(false);
                        setManualForm(buildEmptyLearnerForm());
                        return;
                      }

                      openLearnerForm();
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Agregar aprendiz
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={learnerSearch}
                  onChange={(event) => setLearnerSearch(event.target.value)}
                  className="pl-9"
                  placeholder="Buscar por nombre o documento"
                />
              </div>

              {showManualForm ? (
                <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                  <p className="font-medium text-foreground">
                    {editingLearnerId ? "Editar aprendiz" : "Alta manual de aprendiz"}
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <Input
                      value={manualForm.fullName}
                      onChange={(event) =>
                        setManualForm((current) => ({ ...current, fullName: event.target.value }))
                      }
                      placeholder="Nombre completo"
                    />
                    <Input
                      value={manualForm.documentNumber}
                      onChange={(event) =>
                        setManualForm((current) => ({
                          ...current,
                          documentNumber: event.target.value,
                        }))
                      }
                      placeholder="Documento"
                    />
                    <Input
                      value={manualForm.email}
                      onChange={(event) =>
                        setManualForm((current) => ({ ...current, email: event.target.value }))
                      }
                      placeholder="Correo personal"
                    />
                    <Input
                      value={manualForm.phone}
                      onChange={(event) =>
                        setManualForm((current) => ({ ...current, phone: event.target.value }))
                      }
                      placeholder="Telefono"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowManualForm(false);
                        setEditingLearnerId(null);
                        setManualForm(buildEmptyLearnerForm());
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="button" onClick={saveLearner}>
                      {editingLearnerId ? "Guardar cambios" : "Guardar aprendiz"}
                    </Button>
                  </div>
                </div>
              ) : null}

              {!visibleApprentices.length ? (
                <EmptyState
                  icon={Users}
                  title="Sin aprendices visibles"
                  description="La ficha aun no tiene aprendices. Puedes cargarlos desde Excel o agregarlos manualmente."
                />
              ) : (
                <div className="space-y-2">
                  {visibleApprentices.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[1rem] border border-border/70 bg-white px-4 py-3"
                    >
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1.1fr)_140px_minmax(0,1fr)] md:items-center">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{item.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.documentType} {item.documentNumber}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.phone}</p>
                        <p className="truncate text-sm text-muted-foreground">{item.email}</p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openLearnerEdit(item.id)}
                        >
                          <PenSquare className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-danger/30 text-danger hover:bg-danger/10 hover:text-danger"
                          onClick={() => removeLearner(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Asignacion</CardTitle>
              <CardDescription>
                Estado actual del instructor, ambiente y operacion de la ficha.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Instructor actual
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {currentFicha.assignedInstructor ?? "Pendiente por asignar"}
                </p>
              </div>
              {currentFicha.requiresEnvironment ? (
                <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Ambiente actual
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {currentFicha.assignedEnvironment ?? "Pendiente por asignar"}
                  </p>
                </div>
              ) : (
                <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Contexto de articulacion
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {currentFicha.articulationSchool ?? "Colegio pendiente"} ·{" "}
                    {currentFicha.articulationMode ?? "Modalidad pendiente"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {currentFicha.locality ?? currentFicha.site}
                  </p>
                </div>
              )}
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Estado operativo
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentFicha.stateTags.map((state) => (
                    <FichaStateTagBadge key={`${state}-assignment`} state={state} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trazabilidad basica</CardTitle>
              <CardDescription>
                Lectura rapida de quien movio la ficha y cuando fue la ultima carga.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Fecha de creacion
                </p>
                <p className="mt-1 text-sm text-foreground">{currentFicha.traceability.createdAt}</p>
              </div>
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Ultima actualizacion
                </p>
                <p className="mt-1 text-sm text-foreground">{currentFicha.traceability.updatedAt}</p>
              </div>
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Ultima importacion
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {currentFicha.traceability.lastImportAt ?? "Aun no registra importacion"}
                </p>
              </div>
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Usuario responsable
                </p>
                <p className="mt-1 text-sm text-foreground">{currentFicha.traceability.updatedBy}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lectura operativa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Clock3 className="h-4 w-4 text-primary" />
                  Estado del grupo
                </div>
                <p className="mt-2">
                  La ficha tiene {currentFicha.apprenticeCount} aprendices registrados de un cupo esperado de {currentFicha.expectedApprentices}.
                </p>
              </div>
              {importSummary ? (
                <div className="rounded-[1rem] border border-success/20 bg-success/5 p-4 text-success">
                  {importSummary}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
