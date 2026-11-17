// Servidor Node: corre junto al runner (red interna del VPS) y en desarrollo local.
import { serve } from "@hono/node-server";
import { createApp } from "./app";

const secret = process.env.NP_TOKEN_SECRET;
if (!secret) {
  console.error("Falta NP_TOKEN_SECRET. Ponlo en el .env de la raíz (mira .env.example).");
  process.exit(1);
}

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: createApp({ tokenSecret: secret }).fetch, port }, (info) => {
  console.log(`API del Polo Norte en http://localhost:${info.port}`);
});
