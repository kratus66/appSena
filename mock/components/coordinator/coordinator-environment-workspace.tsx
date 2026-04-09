"use client";

import { useState } from "react";

import { CoordinatorEnvironmentCatalog } from "@/components/coordinator/coordinator-environment-catalog";
import { CoordinatorEnvironmentMatrix } from "@/components/coordinator/coordinator-environment-matrix";
import { CoordinatorEnvironmentCatalogItem, CoordinatorEnvironmentMatrixRow } from "@/lib/types";
import { cn } from "@/lib/utils";

type CoordinatorEnvironmentWorkspaceProps = {
  rows: CoordinatorEnvironmentMatrixRow[];
  blocks: string[];
  catalog: CoordinatorEnvironmentCatalogItem[];
  siteLabel: string;
};

type WorkspaceView = "board" | "catalog";

export function CoordinatorEnvironmentWorkspace({
  rows,
  blocks,
  catalog,
  siteLabel,
}: CoordinatorEnvironmentWorkspaceProps) {
  const [view, setView] = useState<WorkspaceView>("board");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[1rem] border border-border/70 bg-white/75 px-4 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Ambientes
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              El tablero operativo sigue siendo la vista principal. El catalogo queda disponible como gestion secundaria.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
        {[
          { id: "board", label: "Tablero operativo" },
          { id: "catalog", label: "Catalogo de ambientes" },
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
        <CoordinatorEnvironmentMatrix rows={rows} blocks={blocks} />
      ) : (
        <CoordinatorEnvironmentCatalog items={catalog} siteLabel={siteLabel} />
      )}
    </div>
  );
}
