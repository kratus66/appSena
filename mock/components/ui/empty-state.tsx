import { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-border/80 bg-white/65">
      <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="rounded-3xl bg-primary/10 p-4 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">{title}</p>
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
