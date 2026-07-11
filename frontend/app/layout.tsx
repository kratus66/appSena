import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ConfirmHost } from "@/components/ui/confirm-dialog";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AppSena — Sistema de Gestión SENA",
    template: "%s · AppSena",
  },
  description:
    "Plataforma integral para instructores del SENA: fichas, aprendices, asistencias, proceso disciplinario, PTC y planes de mejoramiento en un solo lugar.",
  applicationName: "AppSena",
  authors: [{ name: "AppSena" }],
  keywords: ["SENA", "instructores", "fichas", "aprendices", "asistencias", "gestión educativa"],
  openGraph: {
    title: "AppSena — Sistema de Gestión SENA",
    description:
      "Gestiona instructores, fichas, aprendices y procesos de formación del SENA desde una sola plataforma.",
    siteName: "AppSena",
    locale: "es_CO",
    type: "website",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#39A900",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" translate="no" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}",
          }}
        />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#16211B",
              color: "#F5F8F1",
              fontSize: "14px",
              fontWeight: 500,
              borderRadius: "12px",
              padding: "12px 16px",
              boxShadow: "0 10px 30px -12px rgba(20,33,26,.45)",
            },
            success: { iconTheme: { primary: "#39A900", secondary: "#F5F8F1" } },
            error: { iconTheme: { primary: "#D14343", secondary: "#F5F8F1" } },
          }}
        />
      </body>
    </html>
  );
}
