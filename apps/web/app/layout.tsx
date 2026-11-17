import "@np/ui/tokens.css";
import "@np/ui/components.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Figtree, JetBrains_Mono, Young_Serif } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/toast";
import { m } from "@/lib/messages";

// next/font descarga las fuentes al compilar y las sirve desde nuestro dominio, con métricas de fallback ajustadas.
const display = Young_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-young-serif",
  display: "swap",
});
const body = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: { default: m.meta.title, template: `%s · ${m.brand}` },
  description: m.meta.description,
  applicationName: m.brand,
  openGraph: { title: m.meta.title, description: m.meta.description, siteName: m.brand, locale: "es_ES" },
};

export const viewport: Viewport = {
  themeColor: "#7a1424",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: algunas extensiones del navegador añaden atributos a <html> antes de que cargue
    // React (por ejemplo crxlauncher). Solo afecta a los atributos de esta etiqueta, no a sus hijos.
    <html
      lang="es"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Header />
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
