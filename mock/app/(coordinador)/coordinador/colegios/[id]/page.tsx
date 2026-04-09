import { notFound } from "next/navigation";

import { CoordinatorSchoolDetailView } from "@/components/coordinator/coordinator-school-detail-view";
import { getCoordinatorSchoolDetailById } from "@/lib/mocks/coordinator-colegios";

type CoordinatorSchoolDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ site?: string | string[] }>;
};

export default async function CoordinadorColegioDetailPage({
  params,
  searchParams: _searchParams,
}: CoordinatorSchoolDetailPageProps) {
  const routeParams = await params;
  const school = getCoordinatorSchoolDetailById(undefined, routeParams.id);

  if (!school) {
    notFound();
  }

  return <CoordinatorSchoolDetailView school={school} />;
}
