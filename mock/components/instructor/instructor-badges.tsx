import { Badge } from "@/components/ui/badge";
import {
  InstructorArticulationMode,
  InstructorAssignmentState,
  InstructorDependency,
} from "@/lib/types";

export function InstructorDependencyBadge({
  dependency,
}: {
  dependency: InstructorDependency;
}) {
  const variant =
    dependency === "Centro"
      ? "secondary"
      : dependency === "Colegio"
        ? "warning"
        : "outline";

  return <Badge variant={variant}>{dependency}</Badge>;
}

export function InstructorStateBadge({
  state,
}: {
  state: InstructorAssignmentState;
}) {
  const variant =
    state === "Confirmada"
      ? "success"
      : state === "Programada"
        ? "secondary"
        : "warning";

  return <Badge variant={variant}>{state}</Badge>;
}

export function InstructorArticulationBadge({
  articulation,
}: {
  articulation: InstructorArticulationMode;
}) {
  const variant = articulation === "No aplica" ? "outline" : "default";

  return <Badge variant={variant}>{articulation}</Badge>;
}
