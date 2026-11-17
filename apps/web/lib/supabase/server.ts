import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";
import { isSupabaseConfigured, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";

/** Cliente con la sesión del usuario (cookies). Respeta las políticas RLS. */
export async function getServerClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) cookieStore.set(name, value, options);
        } catch {
          // Desde un Server Component no se pueden escribir cookies: el proxy ya refresca la sesión.
        }
      },
    },
  });
}

/** Usuario de la petición actual, o null. Se calcula una vez por petición aunque lo pidan varios componentes. */
export const getUser = cache(async (): Promise<User | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await getServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});

/** Cliente anónimo sin cookies, para datos públicos que se pueden cachear (clasificación). */
export function getPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Cliente con la service role: salta RLS. Solo para escribir puntuaciones, pistas y envíos. */
export function getAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.");
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
