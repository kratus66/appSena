import type { Metadata } from "next";
import { Manrope, Source_Serif_4 } from "next/font/google";

import "@/app/globals.css";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Gestor de Instructores",
  description: "Base SaaS para la gestion institucional de instructores, fichas y asignaciones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${sans.variable} ${display.variable}`}>
        <div className="sena-top-strip h-2 w-full" />
        {children}
      </body>
    </html>
  );
}
