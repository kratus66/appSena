"use client";

import { useMemo, useState } from "react";

import { CoordinatorAssignmentConsole } from "@/components/coordinator/coordinator-assignment-console";
import { CoordinatorFichaQueue } from "@/components/coordinator/coordinator-ficha-queue";
import { CoordinatorInstructorPool } from "@/components/coordinator/coordinator-instructor-pool";
import { coordinatorAssignmentConflicts } from "@/lib/mocks/coordinator-console";
import {
  CoordinatorOperationalFicha,
  CoordinatorOperationalInstructor,
} from "@/lib/types";

type CoordinatorOperationsBoardProps = {
  instructors: CoordinatorOperationalInstructor[];
  fichas: CoordinatorOperationalFicha[];
  note?: string;
};

export function CoordinatorOperationsBoard({
  instructors,
  fichas,
  note,
}: CoordinatorOperationsBoardProps) {
  const [selectedInstructorId, setSelectedInstructorId] = useState(instructors[0]?.id ?? "");
  const [selectedFichaId, setSelectedFichaId] = useState(
    fichas.find((item) => item.status !== "Completa")?.id ?? fichas[0]?.id ?? "",
  );
  const selectedInstructor = useMemo(
    () => instructors.find((item) => item.id === selectedInstructorId),
    [instructors, selectedInstructorId],
  );
  const selectedFicha = useMemo(
    () => fichas.find((item) => item.id === selectedFichaId),
    [fichas, selectedFichaId],
  );

  const [school, setSchool] = useState("");
  const [environment, setEnvironment] = useState("");
  const effectiveSchool =
    selectedFicha?.schoolOptions.includes(school) && school
      ? school
      : selectedFicha?.schoolOptions[0] ?? "";
  const effectiveEnvironment =
    selectedFicha?.environmentOptions.includes(environment) && environment
      ? environment
      : selectedFicha?.environmentOptions[0] ?? "";

  return (
    <div className="grid items-start gap-4 2xl:grid-cols-[1.05fr_0.95fr_1fr]">
      <CoordinatorInstructorPool
        instructors={instructors}
        selectedId={selectedInstructorId}
        onSelect={setSelectedInstructorId}
        note={note}
      />
      <CoordinatorFichaQueue
        fichas={fichas}
        selectedId={selectedFichaId}
        onSelect={setSelectedFichaId}
      />
      <CoordinatorAssignmentConsole
        instructor={selectedInstructor}
        ficha={selectedFicha}
        school={effectiveSchool}
        onSchoolChange={setSchool}
        environment={effectiveEnvironment}
        onEnvironmentChange={setEnvironment}
        conflicts={coordinatorAssignmentConflicts}
      />
    </div>
  );
}
