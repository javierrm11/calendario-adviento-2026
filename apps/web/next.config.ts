import path from "node:path";
import type { NextConfig } from "next";

// En local, todas las variables viven en el .env de la raíz del monorepo (Next solo mira apps/web).
// No pisa las que ya existen: apps/web/.env.local, si lo hay, y las de Vercel tienen prioridad.
try {
  process.loadEnvFile(path.resolve(process.cwd(), "../../.env"));
} catch {
  // Sin .env en la raíz (por ejemplo, en Vercel): se usan las variables del entorno.
}

const config: NextConfig = {
  transpilePackages: ["@np/shared", "@np/ui", "@np/tickets"],
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Las pestañas ya visitadas se reutilizan desde la caché del navegador: volver a una es inmediato.
    staleTimes: { dynamic: 300, static: 300 },
  },
};

export default config;
