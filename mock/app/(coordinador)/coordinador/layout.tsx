import { Suspense } from "react";

import { CoordinatorShell } from "@/components/coordinator/coordinator-shell";

export default function CoordinadorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background">{children}</div>}>
      <CoordinatorShell>{children}</CoordinatorShell>
    </Suspense>
  );
}
