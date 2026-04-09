"use client";

import { useMemo, useState } from "react";
import { Eye, PenSquare, Plus, Power, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  CoordinatorEnvironmentCatalogItem,
  CoordinatorEnvironmentCatalogStatus,
  CoordinatorOperationalDependency,
} from "@/lib/types";

type CoordinatorEnvironmentCatalogProps = {
  items: CoordinatorEnvironmentCatalogItem[];
  siteLabel: string;
};

type CatalogMode = "create" | "view" | "edit" | null;

type CatalogForm = {
  code: string;
  site: string;
  capacity: string;
  type: CoordinatorOperationalDependency;
  status: CoordinatorEnvironmentCatalogStatus;
};

function statusVariant(status: CoordinatorEnvironmentCatalogStatus) {
  if (status === "Activo") {
    return "success";
  }

  if (status === "Mantenimiento") {
    return "warning";
  }

  return "outline";
}

function buildForm(siteLabel: string, item?: CoordinatorEnvironmentCatalogItem): CatalogForm {
  return {
    code: item?.code ?? "",
    site: item?.site ?? siteLabel,
    capacity: `${item?.capacity ?? 30}`,
    type: item?.type ?? "Titulada",
    status: item?.status ?? "Activo",
  };
}

export function CoordinatorEnvironmentCatalog({
  items,
  siteLabel,
}: CoordinatorEnvironmentCatalogProps) {
  const [catalog, setCatalog] = useState(items);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<CatalogMode>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<CatalogForm>(buildForm(siteLabel));

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return catalog.filter((item) => {
      return (
        !normalized ||
        item.code.toLowerCase().includes(normalized) ||
        item.site.toLowerCase().includes(normalized) ||
        item.type.toLowerCase().includes(normalized)
      );
    });
  }, [catalog, search]);

  const selected = catalog.find((item) => item.id === selectedId);
  const readOnly = mode === "view";

  function openCreate() {
    setMode("create");
    setSelectedId(null);
    setForm(buildForm(siteLabel));
  }

  function openView(item: CoordinatorEnvironmentCatalogItem) {
    setMode("view");
    setSelectedId(item.id);
    setForm(buildForm(siteLabel, item));
  }

  function openEdit(item: CoordinatorEnvironmentCatalogItem) {
    setMode("edit");
    setSelectedId(item.id);
    setForm(buildForm(siteLabel, item));
  }

  function closePanel() {
    setMode(null);
    setSelectedId(null);
  }

  function saveItem() {
    const payload: CoordinatorEnvironmentCatalogItem = {
      id: selectedId ?? `CAT-${Date.now()}`,
      code: form.code.trim() || `Ambiente ${Date.now().toString().slice(-2)}`,
      site: form.site,
      capacity: Number(form.capacity || 30),
      type: form.type,
      status: form.status,
    };

    setCatalog((current) =>
      mode === "edit"
        ? current.map((item) => (item.id === selectedId ? payload : item))
        : [payload, ...current],
    );
    closePanel();
  }

  function deactivateItem(id: string) {
    const confirmed = window.confirm(
      "Vas a desactivar este ambiente del catalogo. Podras reactivarlo luego editando su estado.",
    );

    if (!confirmed) {
      return;
    }

    setCatalog((current) =>
      current.map((item) => (item.id === id ? { ...item, status: "Inactivo" } : item)),
    );
  }

  return (
    <>
      <Card className="border-border/70 bg-white/78 shadow-none">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <CardTitle>Catalogo de ambientes</CardTitle>
              <CardDescription>
                Vista secundaria para crear, consultar, editar o desactivar ambientes sin desplazar el foco del tablero operativo.
              </CardDescription>
            </div>
            <Button type="button" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Crear ambiente
            </Button>
          </div>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ambiente, sede o tipo"
            className="max-w-md"
          />
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 rounded-[1rem] border border-border/70 bg-background/55 px-4 py-4 md:grid-cols-[minmax(0,1.1fr)_140px_120px_140px_auto]"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{item.code}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.site}</p>
              </div>
              <p className="text-sm text-muted-foreground">{item.capacity} cupos</p>
              <p className="text-sm text-muted-foreground">{item.type}</p>
              <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => openView(item)}>
                  <Eye className="h-4 w-4" />
                  Ver
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => openEdit(item)}>
                  <PenSquare className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-danger/30 text-danger hover:bg-danger/10 hover:text-danger"
                  onClick={() => deactivateItem(item.id)}
                >
                  <Power className="h-4 w-4" />
                  Desactivar
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {mode ? (
        <>
          <div className="fixed inset-0 z-40 bg-slate-950/20" onClick={closePanel} />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border/80 bg-white/95 shadow-2xl backdrop-blur-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    Gestion de ambientes
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">
                    {mode === "create"
                      ? "Crear ambiente"
                      : mode === "edit"
                        ? "Editar ambiente"
                        : "Detalle de ambiente"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closePanel}
                  className="rounded-[0.9rem] border border-border/80 p-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                <Input
                  value={form.code}
                  onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                  placeholder="Nombre o codigo"
                  disabled={readOnly}
                />
                <Input
                  value={form.site}
                  onChange={(event) => setForm((current) => ({ ...current, site: event.target.value }))}
                  placeholder="Sede"
                  disabled={readOnly}
                />
                <Input
                  value={form.capacity}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, capacity: event.target.value }))
                  }
                  placeholder="Capacidad"
                  disabled={readOnly}
                />
                <Select
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target.value as CoordinatorOperationalDependency,
                    }))
                  }
                  disabled={readOnly}
                >
                  <option value="Titulada">Titulada</option>
                  <option value="Complementaria">Complementaria</option>
                </Select>
                <Select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as CoordinatorEnvironmentCatalogStatus,
                    }))
                  }
                  disabled={readOnly}
                >
                  <option value="Activo">Activo</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Inactivo">Inactivo</option>
                </Select>
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-border/70 px-5 py-4">
                <Button type="button" variant="outline" onClick={closePanel}>
                  Cerrar
                </Button>
                {!readOnly ? (
                  <Button type="button" onClick={saveItem}>
                    Guardar ambiente
                  </Button>
                ) : null}
              </div>
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}
