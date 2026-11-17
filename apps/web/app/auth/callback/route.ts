import type { Session } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getAdminClient, getServerClient } from "@/lib/supabase/server";

/** Solo rutas internas: evita redirigir a otra web después del login. */
function safeNext(next: string | null): string {
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/";
}

/** Guarda la fecha de creación de la cuenta de GitHub (para la antigüedad mínima de la clasificación). */
async function saveGithubAccountAge(session: Session) {
  if (!session.provider_token) return;
  const response = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${session.provider_token}`, Accept: "application/vnd.github+json" },
    cache: "no-store",
  }).catch(() => null);
  if (!response?.ok) return;
  const { created_at: createdAt } = (await response.json()) as { created_at?: string };
  if (createdAt) {
    await getAdminClient()
      .from("profiles")
      .update({ github_created_at: createdAt })
      .eq("id", session.user.id);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  if (code) {
    const supabase = await getServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      await saveGithubAccountAge(data.session);
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }
  return NextResponse.redirect(new URL("/?error=login", url.origin));
}
