import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary/10 bg-primary/10 text-primary",
        secondary: "border-secondary bg-secondary text-secondary-foreground",
        outline: "border-border/80 bg-white text-foreground",
        success: "border-success/10 bg-success/12 text-success",
        warning: "border-warning/20 bg-warning/18 text-warning-foreground",
        danger: "border-danger/10 bg-danger/12 text-danger",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
