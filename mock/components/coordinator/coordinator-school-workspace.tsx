"use client";

import { useState } from "react";

import { CoordinatorSchoolCatalog } from "@/components/coordinator/coordinator-school-catalog";
import { CoordinatorSchoolDirectory } from "@/components/coordinator/coordinator-school-directory";
import { CoordinatorSchoolCard } from "@/lib/types";
import { cn } from "@/lib/utils";

type CoordinatorSchoolWorkspaceProps = {
  schools: CoordinatorSchoolCard[];
  siteLabel: string;
};

type WorkspaceView = "board" | "catalog";

export function CoordinatorSchoolWorkspace({
  schools,
  siteLabel,
}: CoordinatorSchoolWorkspaceProps) {
  const [view, setView] = useState<WorkspaceView>("board");
  const [items, setItems] = useState(schools);

  function handleCreateSchool(school: CoordinatorSchoolCard) {
    setItems((current) => [school, ...current]);
  }

  function handleUpdateSchool(school: CoordinatorSchoolCard) {
    setItems((current) => current.map((item) => (item.id === school.id ? school : item)));
  }

  function handleDeleteSchool(schoolId: string) {
    setItems((current) => current.filter((item) => item.id !== schoolId));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[1rem] border border-border/70 bg-white/75 px-4 py-4 backdrop-blur">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Colegios
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            La vista principal sigue enfocada en lectura operativa. La gestion del inventario queda disponible como apoyo secundario.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: "board", label: "Vista operativa" },
            { id: "catalog", label: "Gestion de colegios" },
          ].map((option) => {
            const active = view === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setView(option.id as WorkspaceView)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_10px_20px_-16px_rgba(22,163,74,0.65)]"
                    : "border-border bg-white text-muted-foreground hover:border-primary/20 hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {view === "board" ? (
        <CoordinatorSchoolDirectory
          schools={items}
          siteLabel={siteLabel}
          onCreateSchool={handleCreateSchool}
        />
      ) : (
        <CoordinatorSchoolCatalog
          items={items}
          siteLabel={siteLabel}
          onCreateSchool={handleCreateSchool}
          onUpdateSchool={handleUpdateSchool}
          onDeleteSchool={handleDeleteSchool}
        />
      )}
    </div>
  );
}
