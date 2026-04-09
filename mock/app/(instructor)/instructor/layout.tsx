import { AppShell } from "@/components/layout/app-shell";

export default function InstructorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell role="instructor">{children}</AppShell>;
}
