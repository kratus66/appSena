import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlight?: string;
};

export function PageIntro({ eyebrow, title, description, highlight }: PageIntroProps) {
  return (
    <section className="space-y-4">
      <Badge variant="secondary" className="w-fit gap-2 px-3 py-1.5 text-xs normal-case tracking-[0.04em]">
        <ArrowUpRight className="h-4 w-4" />
        {eyebrow}
      </Badge>
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr] xl:items-start">
        <div className="max-w-4xl space-y-2">
          <h1 className="text-[1.9rem] font-semibold text-foreground sm:text-[2.15rem]">{title}</h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>
        {highlight ? (
          <div className="rounded-[1rem] border border-primary/15 bg-secondary/60 p-4 text-sm leading-6 text-foreground">
            {highlight}
          </div>
        ) : null}
      </div>
    </section>
  );
}
