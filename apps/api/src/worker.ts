// Entrada de Cloudflare Workers: la API pública para probar desde tu ordenador.
import { createApp, type NorthPoleApp } from "./app";

interface Env {
  NP_TOKEN_SECRET: string;
}

let cached: { secret: string; app: NorthPoleApp } | undefined;

export default {
  fetch(request: Request, env: Env): Response | Promise<Response> {
    if (!cached || cached.secret !== env.NP_TOKEN_SECRET) {
      cached = { secret: env.NP_TOKEN_SECRET, app: createApp({ tokenSecret: env.NP_TOKEN_SECRET }) };
    }
    return cached.app.fetch(request, env);
  },
};
