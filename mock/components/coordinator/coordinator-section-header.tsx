import { ReactNode } from "react";

type CoordinatorSectionHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function CoordinatorSectionHeader({
  title,
  description,
  actions,
}: CoordinatorSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/70 pb-3 xl:flex-row xl:items-end xl:justify-between">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          Coordinacion operativa
        </p>
        <h1 className="text-[1.5rem] font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
