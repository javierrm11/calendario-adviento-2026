import {
  type CaseData,
  decodeCase,
  type GiftState,
  generateGifts,
  giftCounts,
  scenarioFailures,
  verifyApiToken,
} from "@np/shared";
import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import { FailureCounter } from "./failures";
import {
  completion,
  completionChunks,
  DEFAULT_MODEL,
  embed,
  estimateTokens,
  parseChatRequest,
} from "./model";

type AppEnv = { Variables: { userId: string; testCase: CaseData } };
type AppContext = Context<AppEnv>;

export interface AppOptions {
  tokenSecret: string;
  failures?: FailureCounter;
}

/** Error con el formato de OpenAI, para que los clientes de verdad lo entiendan igual. */
function apiError(c: AppContext, status: 400 | 401 | 404 | 429 | 503, message: string, type: string) {
  return c.json({ error: { message, type, code: status } }, status);
}

/** Sin caso en la URL (/v1/...): datos fijos de uso libre, distintos por usuario. */
const FREE_CASE = (userId: string): CaseData => ({ scenario: "por-defecto", seed: userId });

/** Semilla de una petición: el mismo usuario con el mismo caso recibe siempre la misma respuesta. */
const seedOf = (c: AppContext) => `${c.get("userId")}:${c.get("testCase").seed}`;

export function createApp({ tokenSecret, failures = new FailureCounter() }: AppOptions) {
  const app = new Hono<AppEnv>();

  // El código de los participantes llama a la API desde el navegador.
  app.use(
    "*",
    cors({
      origin: "*",
      allowHeaders: ["Authorization", "Content-Type"],
      allowMethods: ["GET", "POST", "OPTIONS"],
      exposeHeaders: ["Retry-After"],
      maxAge: 86_400,
    }),
  );

  app.get("/salud", (c) => c.json({ ok: true }));

  app.use("*", async (c, next) => {
    const header = c.req.header("Authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
    const userId = token ? await verifyApiToken(token, tokenSecret) : null;
    if (!userId) {
      return apiError(
        c,
        401,
        "Falta el token o no es válido. Mándalo en la cabecera `Authorization: Bearer <token>`.",
        "authentication_error",
      );
    }
    c.set("userId", userId);
    await next();
  });

  app.use("/v1/*", async (c, next) => {
    c.set("testCase", FREE_CASE(c.get("userId")));
    await next();
  });

  app.use("/c/:case/*", async (c, next) => {
    const testCase = decodeCase(c.req.param("case"));
    if (!testCase) return apiError(c, 404, "Ese caso de prueba no existe.", "not_found");
    c.set("testCase", testCase);
    await next();
  });

  const listGifts = (c: AppContext) => {
    const { scenario } = c.get("testCase");
    const failure = failures.next(seedOf(c), scenarioFailures(scenario));
    if (failure) {
      if (failure.retryAfterSeconds !== undefined) c.header("Retry-After", String(failure.retryAfterSeconds));
      return failure.status === 429
        ? apiError(c, 429, "Demasiadas peticiones. Espera lo que indica Retry-After.", "rate_limit_error")
        : apiError(
            c,
            503,
            "La API de regalos no está disponible ahora mismo. Inténtalo de nuevo.",
            "server_error",
          );
    }
    const state = c.req.query("estado");
    if (state !== undefined && state !== "pendiente" && state !== "entregado") {
      return apiError(c, 400, "`estado` solo admite `pendiente` o `entregado`.", "invalid_request_error");
    }
    const { seed } = c.get("testCase");
    const gifts = generateGifts(seed, giftCounts(scenario, seed));
    return c.json(state ? gifts.filter((gift) => gift.estado === (state as GiftState)) : gifts);
  };

  const chat = async (c: AppContext) => {
    const request = parseChatRequest(await c.req.json().catch(() => null));
    if (typeof request === "string") return apiError(c, 400, request, "invalid_request_error");
    const seed = seedOf(c);
    if (!request.stream) return c.json(completion(request, seed));
    return streamSSE(c, async (stream) => {
      for (const chunk of completionChunks(request, seed))
        await stream.writeSSE({ data: JSON.stringify(chunk) });
      await stream.writeSSE({ data: "[DONE]" });
    });
  };

  const embeddings = async (c: AppContext) => {
    const body = (await c.req.json().catch(() => null)) as { input?: unknown; model?: unknown } | null;
    const input = body?.input;
    const texts = typeof input === "string" ? [input] : Array.isArray(input) ? input : null;
    if (!texts || texts.length === 0 || !texts.every((text) => typeof text === "string")) {
      return apiError(
        c,
        400,
        "`input` tiene que ser un texto o una lista de textos.",
        "invalid_request_error",
      );
    }
    const seed = seedOf(c);
    const tokens = texts.reduce((total: number, text: string) => total + estimateTokens(text), 0);
    return c.json({
      object: "list",
      data: texts.map((text: string, index: number) => ({
        object: "embedding",
        index,
        embedding: embed(text, seed),
      })),
      model: typeof body?.model === "string" ? body.model : `${DEFAULT_MODEL}-embed`,
      usage: { prompt_tokens: tokens, total_tokens: tokens },
    });
  };

  // Cada ruta existe en /v1/... (uso libre) y en /c/:case/v1/... (casos de test de una ejecución).
  for (const base of ["", "/c/:case"]) {
    app.get(`${base}/v1/regalos`, listGifts);
    app.post(`${base}/v1/chat/completions`, chat);
    app.post(`${base}/v1/embeddings`, embeddings);
  }

  app.notFound((c) =>
    apiError(c as AppContext, 404, `No existe ${c.req.method} ${c.req.path}.`, "not_found"),
  );

  return app;
}

export type NorthPoleApp = ReturnType<typeof createApp>;
