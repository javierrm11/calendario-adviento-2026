import "server-only";
import { isLanguageId, type LanguageId, LEADERBOARD_MIN_ACCOUNT_AGE_DAYS } from "@np/shared";
import { unstable_cache } from "next/cache";
import { getPublicClient } from "@/lib/supabase/server";

export interface LeaderboardRow {
  userId: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  language: LanguageId;
  stars: number;
  days: number;
}

const LIMIT = 50;

async function fetchLeaderboard(language: LanguageId | null): Promise<LeaderboardRow[]> {
  // Las dos vistas tienen las mismas columnas; en "leaderboard", `language` es el mejor lenguaje de cada persona.
  let query = getPublicClient()
    .from(language ? "language_leaderboard" : "leaderboard")
    .select("user_id, username, name, avatar_url, language, stars, days, github_created_at");
  if (language) query = query.eq("language", language);
  if (LEADERBOARD_MIN_ACCOUNT_AGE_DAYS !== null) {
    const cutoff = new Date(Date.now() - LEADERBOARD_MIN_ACCOUNT_AGE_DAYS * 86_400_000).toISOString();
    query = query.lte("github_created_at", cutoff);
  }
  const { data, error } = await query
    .order("stars", { ascending: false })
    .order("days", { ascending: false })
    .limit(LIMIT);
  if (error) throw new Error(`Clasificación: ${error.message}`);

  return (data ?? []).flatMap((row: Record<string, unknown>) => {
    const rowLanguage = row.language;
    if (!isLanguageId(rowLanguage)) return [];
    return [
      {
        userId: String(row.user_id),
        username: String(row.username),
        name: typeof row.name === "string" ? row.name : null,
        avatarUrl: typeof row.avatar_url === "string" ? row.avatar_url : null,
        language: rowLanguage,
        stars: Number(row.stars),
        days: Number(row.days),
      },
    ];
  });
}

/** Clasificación cacheada 30 s: es pública e igual para todos, así que no se consulta en cada visita. */
export const getLeaderboard = unstable_cache(fetchLeaderboard, ["leaderboard"], { revalidate: 30 });
