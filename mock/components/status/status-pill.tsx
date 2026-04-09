import { Badge } from "@/components/ui/badge";

type StatusPillProps = {
  status: "Al dia" | "En revision" | "Pendiente" | "Programada" | "Requiere ajuste" | "Confirmada";
};

const statusMap = {
  "Al dia": "success",
  "En revision": "warning",
  Pendiente: "danger",
  Programada: "outline",
  "Requiere ajuste": "warning",
  Confirmada: "success",
} as const;

export function StatusPill({ status }: StatusPillProps) {
  return <Badge variant={statusMap[status]}>{status}</Badge>;
}
