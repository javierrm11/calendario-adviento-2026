import type { NextConfig } from "next";

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
