import { hash, seededRandom } from "@np/shared";

/**
 * Modelo simulado "elfo-mini". Responde con el formato de OpenAI, sin IA detrás:
 * la respuesta sale de un hash del mensaje, así que es gratis y siempre igual.
 */
export const DEFAULT_MODEL = "elfo-mini";
/** Fecha fija (1 dic 2026) para que las respuestas sean idénticas byte a byte. */
const CREATED = 1_796_083_200;

const CATEGORIES = ["bueno", "travieso", "regular"] as const;

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

export interface ChatRequest {
  model?: string;
  messages: ChatMessage[];
  response_format?: { type: "text" | "json_object" };
  stream?: boolean;
}

export function parseChatRequest(body: unknown): ChatRequest | string {
  if (typeof body !== "object" || body === null) return "El cuerpo tiene que ser un objeto JSON.";
  const { model, messages, response_format, stream } = body as Record<string, unknown>;
  if (!Array.isArray(messages) || messages.length === 0)
    return "Falta `messages`: una lista con al menos un mensaje.";
  for (const message of messages) {
    const { role, content } = (message ?? {}) as Record<string, unknown>;
    if (!["system", "user", "assistant", "tool"].includes(String(role)) || typeof content !== "string") {
      return "Cada mensaje necesita `role` (system, user, assistant o tool) y `content` de texto.";
    }
  }
  if (model !== undefined && typeof model !== "string") return "`model` tiene que ser texto.";
  const format = (response_format as { type?: unknown } | undefined)?.type;
  if (format !== undefined && format !== "text" && format !== "json_object") {
    return "`response_format.type` solo admite `text` o `json_object`.";
  }
  return {
    model: model ?? DEFAULT_MODEL,
    messages: messages as ChatMessage[],
    response_format: format ? { type: format } : undefined,
    stream: stream === true,
  };
}

const estimateTokens = (text: string) => Math.max(1, Math.ceil(text.length / 4));

/** Texto de la respuesta del modelo para una petición. */
export function replyFor(request: ChatRequest, seed: string): string {
  const lastUser = [...request.messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const category = CATEGORIES[hash(`${seed}:${lastUser}`) % CATEGORIES.length] ?? "regular";
  const confidence = Math.round((0.6 + seededRandom(`${seed}:${lastUser}`)() * 0.39) * 100) / 100;
  if (request.response_format?.type === "json_object") {
    return JSON.stringify({ categoria: category, confianza: confidence });
  }
  return `Después de leer la carta, la clasifico como ${category}. Confianza: ${confidence}.`;
}

export function completion(request: ChatRequest, seed: string) {
  const content = replyFor(request, seed);
  const promptTokens = request.messages.reduce(
    (total, message) => total + estimateTokens(message.content),
    0,
  );
  const completionTokens = estimateTokens(content);
  return {
    id: `chatcmpl-np-${hash(`${seed}:${content}`).toString(36)}`,
    object: "chat.completion",
    created: CREATED,
    model: request.model ?? DEFAULT_MODEL,
    choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens,
    },
  };
}

/** Trozos de una respuesta en streaming, palabra a palabra, como `chat.completion.chunk`. */
export function completionChunks(request: ChatRequest, seed: string) {
  const content = replyFor(request, seed);
  const id = `chatcmpl-np-${hash(`${seed}:${content}`).toString(36)}`;
  const base = {
    id,
    object: "chat.completion.chunk",
    created: CREATED,
    model: request.model ?? DEFAULT_MODEL,
  };
  const words = content.split(/(?<= )/);
  return [
    ...words.map((word, index) => ({
      ...base,
      choices: [
        {
          index: 0,
          delta: index === 0 ? { role: "assistant", content: word } : { content: word },
          finish_reason: null,
        },
      ],
    })),
    { ...base, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] },
  ];
}

const EMBEDDING_DIMENSIONS = 8;

/** Vector unitario determinista para un texto. */
export function embed(text: string, seed: string): number[] {
  const random = seededRandom(`${seed}:${text}`);
  const vector = Array.from({ length: EMBEDDING_DIMENSIONS }, () => random() * 2 - 1);
  const norm = Math.hypot(...vector) || 1;
  return vector.map((value) => Math.round((value / norm) * 1e6) / 1e6);
}

export { estimateTokens };
