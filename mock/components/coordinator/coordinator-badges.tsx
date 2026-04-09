import { Badge } from "@/components/ui/badge";
import {
  CoordinatorAssignmentStatus,
  CoordinatorArticulationMode,
  CoordinatorAvailability,
  CoordinatorConflictSeverity,
  CoordinatorEnvironmentStatus,
  CoordinatorFichaGeneralStatus,
  CoordinatorFichaStateTag,
  CoordinatorFichaOperationalStatus,
  CoordinatorFicha,
  CoordinatorInstructorStatus,
  CoordinatorOperationalInstructor,
  CoordinatorOperationalDependency,
  CoordinatorSchoolStatus,
} from "@/lib/types";

export function AvailabilityBadge({
  availability,
}: {
  availability: CoordinatorAvailability;
}) {
  const variant =
    availability === "Alta"
      ? "success"
      : availability === "Media"
        ? "warning"
        : "outline";

  return <Badge variant={variant}>{availability}</Badge>;
}

export function InstructorStatusBadge({
  status,
}: {
  status: CoordinatorInstructorStatus | CoordinatorOperationalInstructor["status"];
}) {
  const variant =
    status === "Disponible"
      ? "success"
      : status === "Parcial"
        ? "warning"
        : "outline";

  return <Badge variant={variant}>{status}</Badge>;
}

export function FichaStatusBadge({
  status,
}: {
  status: CoordinatorFicha["status"];
}) {
  const variant =
    status === "Lista para asignar"
      ? "success"
      : status === "Pendiente cobertura"
        ? "danger"
        : "secondary";

  return <Badge variant={variant}>{status}</Badge>;
}

export function DependencyBadge({
  dependency,
}: {
  dependency: CoordinatorFicha["dependency"];
}) {
  const label =
    dependency === "centro"
      ? "Centro"
      : dependency === "colegio"
        ? "Colegio"
        : "Virtual";

  const variant = dependency === "virtual" ? "outline" : "secondary";

  return <Badge variant={variant}>{label}</Badge>;
}

export function SchoolStatusBadge({
  status,
}: {
  status: CoordinatorSchoolStatus;
}) {
  const variant =
    status === "Activo"
      ? "success"
      : status === "Seguimiento"
        ? "warning"
        : "outline";

  return <Badge variant={variant}>{status}</Badge>;
}

export function EnvironmentStatusBadge({
  status,
}: {
  status: CoordinatorEnvironmentStatus;
}) {
  const variant =
    status === "Disponible"
      ? "success"
      : status === "Reservado"
        ? "warning"
        : "outline";

  return <Badge variant={variant}>{status}</Badge>;
}

export function AssignmentStatusBadge({
  status,
}: {
  status: CoordinatorAssignmentStatus;
}) {
  const variant =
    status === "Confirmada"
      ? "success"
      : status === "Requiere ajuste"
        ? "warning"
        : "outline";

  return <Badge variant={variant}>{status}</Badge>;
}

export function OperationalDependencyBadge({
  dependency,
}: {
  dependency: CoordinatorOperationalDependency;
}) {
  const variant =
    dependency === "Articulacion"
      ? "warning"
      : dependency === "Titulada"
        ? "default"
        : "secondary";

  return <Badge variant={variant}>{dependency}</Badge>;
}

export function OperationalFichaStatusBadge({
  status,
}: {
  status: CoordinatorFichaOperationalStatus;
}) {
  const variant =
    status === "Completa"
      ? "success"
      : status === "Parcial"
        ? "warning"
        : "danger";

  return <Badge variant={variant}>{status}</Badge>;
}

export function ArticulationModeBadge({
  mode,
}: {
  mode: CoordinatorArticulationMode;
}) {
  const variant = mode === "No aplica" ? "outline" : "secondary";

  return <Badge variant={variant}>{mode}</Badge>;
}

export function ConflictBadge({
  severity,
}: {
  severity: CoordinatorConflictSeverity;
}) {
  const variant =
    severity === "alta"
      ? "danger"
      : severity === "media"
        ? "warning"
        : "secondary";

  return <Badge variant={variant}>{severity}</Badge>;
}

export function FichaStateTagBadge({
  state,
}: {
  state: CoordinatorFichaStateTag;
}) {
  const variant =
    state === "Lista para operacion" || state === "Completa"
      ? "success"
      : state === "Carga parcial"
        ? "warning"
        : state === "Sin instructor" || state === "Sin ambiente" || state === "Sin aprendices"
          ? "danger"
          : "outline";

  return <Badge variant={variant}>{state}</Badge>;
}

export function FichaGeneralStatusBadge({
  status,
}: {
  status: CoordinatorFichaGeneralStatus;
}) {
  const variant =
    status === "Lista para operacion"
      ? "success"
      : status === "En alistamiento"
        ? "warning"
        : "outline";

  return <Badge variant={variant}>{status}</Badge>;
}
