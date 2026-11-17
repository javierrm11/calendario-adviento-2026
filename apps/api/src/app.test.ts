import { encodeCase, giftCounts, signApiToken } from "@np/shared";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "./app";

const SECRET = "secreto-de-prueba";
const app = createApp({ tokenSecret: SECRET });
let auth: Record<string, string>;

type ApiError = { error: { type: string } };
type Completion = { object: string; choices: Array<{ message: { content: string } }> };
type Embeddings = { data: Array<{ embedding: number[] }> };
const json = async <T>(res: Response) => (await res.json()) as T;

beforeAll(async () => {
  auth = {
    Authorization: `Bearer ${await signApiToken("usuario-1", SECRET)}`,
    "Content-Type": "application/json",
  };
});

describe("autenticación y CORS", () => {
  it("/salud no necesita token", async () => {
    expect((await app.request("/salud")).status).toBe(200);
  });

  it("sin token responde 401 con formato de OpenAI", async () => {
    const res = await app.request("/v1/regalos");
    expect(res.status).toBe(401);
    expect((await json<ApiError>(res)).error.type).toBe("authentication_error");
  });

  it("acepta la petición previa del navegador (CORS) sin token", async () => {
    const res = await app.request("/v1/regalos", {
      method: "OPTIONS",
      headers: { Origin: "https://northpole.dev", "Access-Control-Request-Method": "GET" },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("rechaza un caso inventado", async () => {
    expect((await app.request("/c/basura/v1/regalos", { headers: auth })).status).toBe(404);
  });
});

describe("regalos por caso", () => {
  const testCase = { scenario: "pendientes-varios", seed: "semilla-1" } as const;
  const base = `/c/${encodeCase(testCase)}`;

  it("devuelve los números del escenario y filtra por estado", async () => {
    const counts = giftCounts(testCase.scenario, testCase.seed);
    const all = await json<unknown[]>(await app.request(`${base}/v1/regalos`, { headers: auth }));
    const pending = await json<unknown[]>(
      await app.request(`${base}/v1/regalos?estado=pendiente`, { headers: auth }),
    );
    expect(all).toHaveLength(counts.pending + counts.delivered);
    expect(pending).toHaveLength(counts.pending);
  });

  it("es determinista: la misma petición da la misma respuesta", async () => {
    const a = await (await app.request(`${base}/v1/regalos`, { headers: auth })).text();
    const b = await (await app.request(`${base}/v1/regalos`, { headers: auth })).text();
    expect(a).toBe(b);
  });

  it("simula un 429 con Retry-After y luego responde bien", async () => {
    const failing = `/c/${encodeCase({ scenario: "fallo-429", seed: "s" })}`;
    const first = await app.request(`${failing}/v1/regalos`, { headers: auth });
    expect(first.status).toBe(429);
    expect(first.headers.get("Retry-After")).toBe("2");
    expect((await app.request(`${failing}/v1/regalos`, { headers: auth })).status).toBe(200);
  });
});

describe("modelo simulado", () => {
  const body = JSON.stringify({ messages: [{ role: "user", content: "Querido Santa: quiero un tren" }] });

  it("responde con el formato de OpenAI y siempre igual", async () => {
    const a = await json<Completion>(
      await app.request("/v1/chat/completions", { method: "POST", headers: auth, body }),
    );
    const b = await json<Completion>(
      await app.request("/v1/chat/completions", { method: "POST", headers: auth, body }),
    );
    expect(a.object).toBe("chat.completion");
    expect(a.choices[0]?.message.content).toBe(b.choices[0]?.message.content);
  });

  it("en modo JSON devuelve JSON válido", async () => {
    const jsonBody = JSON.stringify({
      messages: [{ role: "user", content: "Querido Santa" }],
      response_format: { type: "json_object" },
    });
    const res = await json<Completion>(
      await app.request("/v1/chat/completions", { method: "POST", headers: auth, body: jsonBody }),
    );
    expect(JSON.parse(res.choices[0]?.message.content ?? "")).toHaveProperty("categoria");
  });

  it("en streaming termina con [DONE]", async () => {
    const streamBody = JSON.stringify({ messages: [{ role: "user", content: "Hola" }], stream: true });
    const text = await (
      await app.request("/v1/chat/completions", { method: "POST", headers: auth, body: streamBody })
    ).text();
    expect(text.trim().endsWith("data: [DONE]")).toBe(true);
  });

  it("los embeddings son vectores unitarios", async () => {
    const res = await json<Embeddings>(
      await app.request("/v1/embeddings", {
        method: "POST",
        headers: auth,
        body: JSON.stringify({ input: ["tren", "cometa"] }),
      }),
    );
    expect(res.data).toHaveLength(2);
    expect(Math.hypot(...(res.data[0]?.embedding ?? []))).toBeCloseTo(1, 4);
  });
});
