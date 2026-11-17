import { isLanguageId, type Solve } from "@np/shared";
import { useEffect, useSyncExternalStore } from "react";
import { getBrowserClient } from "./supabase/browser";
import { isSupabaseConfigured } from "./supabase/config";

export interface Viewer {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
}

export type Progress =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; viewer: Viewer; solves: Solve[] };

const LOADING: Progress = { status: "loading" };
let state: Progress = LOADING;
let started = false;
const listeners = new Set<() => void>();

function emit(next: Progress) {
  state = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

async function load() {
  if (!isSupabaseConfigured()) return emit({ status: "signed-out" });
  const supabase = getBrowserClient();
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return emit({ status: "signed-out" });

  const meta = user.user_metadata as Record<string, unknown>;
  const viewer: Viewer = {
    id: user.id,
    username: String(meta.user_name ?? meta.preferred_username ?? "usuario"),
    name: typeof meta.full_name === "string" ? meta.full_name : null,
    avatarUrl: typeof meta.avatar_url === "string" ? meta.avatar_url : null,
  };
  const { data: rows } = await supabase.from("solves").select("day, language, stars");
  const solves: Solve[] = (rows ?? []).flatMap(
    (row: { day: number; language: string; stars: number | string }) =>
      isLanguageId(row.language) ? [{ day: row.day, language: row.language, stars: Number(row.stars) }] : [],
  );
  emit({ status: "signed-in", viewer, solves });
}

function start() {
  if (started) return;
  started = true;
  void load();
  if (!isSupabaseConfigured()) return;
  getBrowserClient().auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") emit({ status: "signed-out" });
    if (event === "SIGNED_IN" && state.status !== "signed-in") void load();
  });
}

/**
 * Sesión y tickets resueltos del usuario, en el navegador.
 * Las páginas públicas se sirven estáticas desde CDN y no pueden leer la sesión en el servidor sin dejar de serlo,
 * así que el progreso se pide aquí: una sola vez por visita y compartido entre pestañas.
 */
export function useProgress(): Progress {
  useEffect(start, []);
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => LOADING,
  );
}

/** Añade un ticket recién resuelto sin volver a pedir nada (UI optimista). */
export function recordSolve(solve: Solve) {
  if (state.status !== "signed-in") return;
  const exists = state.solves.some((s) => s.day === solve.day && s.language === solve.language);
  if (!exists) emit({ ...state, solves: [...state.solves, solve] });
}
