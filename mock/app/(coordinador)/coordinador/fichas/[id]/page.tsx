import { notFound } from "next/navigation";

import { CoordinatorFichaDetailView } from "@/components/coordinator/coordinator-ficha-detail-view";
import { getCoordinatorFichaDetailById } from "@/lib/mocks/coordinator-fichas";

type CoordinatorFichaDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ action?: string | string[] }>;
};

export default async function CoordinadorFichaDetailPage({
  params,
  searchParams,
}: CoordinatorFichaDetailPageProps) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const action = Array.isArray(query.action) ? query.action[0] : query.action;
  const ficha = getCoordinatorFichaDetailById(id);

  if (!ficha) {
    notFound();
  }

  return <CoordinatorFichaDetailView ficha={ficha} initialAction={action} />;
}
