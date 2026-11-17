import {
  BADGES,
  bestLanguage,
  currentDay,
  earnedBadges,
  isLanguageId,
  LANGUAGES,
  languageName,
  type Solve,
  solvedDays,
  starsByLanguage,
  streak,
} from "@np/shared";
import { Avatar, cx, Stars } from "@np/ui";
import { Icon } from "@/components/icons";
import { m } from "@/lib/messages";
import { getNow } from "@/lib/server/now";
import { getServerClient, getUser } from "@/lib/supabase/server";
import { SignInButton } from "../sign-in-button";
import styles from "./profile.module.css";

const BAR_MIN_MAX = 15;

export async function ProfileCard() {
  const user = await getUser();
  if (!user) {
    return (
      <aside className={`np-card ${styles.card}`}>
        <h1 className={styles.name}>{m.profile.title}</h1>
        <p className="muted">{m.profile.signInText}</p>
        <SignInButton />
      </aside>
    );
  }

  // Las tres consultas van en paralelo (sin cascada).
  const supabase = await getServerClient();
  const [profileResult, solvesResult, hintsResult] = await Promise.all([
    supabase.from("profiles").select("username, name, avatar_url").eq("id", user.id).maybeSingle(),
    supabase.from("solves").select("day, language, stars"),
    supabase.from("hint_uses").select("day"),
  ]);

  const profile = profileResult.data as {
    username: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
  const solves: Solve[] = (solvesResult.data ?? []).flatMap(
    (row: { day: number; language: string; stars: number }) =>
      isLanguageId(row.language) ? [{ day: row.day, language: row.language, stars: Number(row.stars) }] : [],
  );
  const hintDays = new Set((hintsResult.data ?? []).map((row: { day: number }) => row.day));

  const totals = starsByLanguage(solves);
  const best = bestLanguage(totals);
  const days = solvedDays(solves);
  const currentStreak = streak(days, currentDay(getNow()));
  const badges = earnedBadges({ solves, hintDays, streak: currentStreak });
  const barMax = Math.max(BAR_MIN_MAX, ...Object.values(totals));
  const username = profile?.username ?? "usuario";
  const displayName = profile?.name ?? username;

  return (
    <aside className={`np-card ${styles.card}`}>
      <Avatar src={profile?.avatar_url} name={displayName} size={88} />
      <div>
        <h1 className={styles.name}>{displayName}</h1>
        <p className="muted">{m.profile.connected(username)}</p>
      </div>
      <dl className={styles.stats}>
        <div>
          <dt>{m.profile.score}</dt>
          <dd>
            <Stars value={best?.stars ?? 0} />
          </dd>
        </div>
        <div>
          <dt>{m.profile.counts}</dt>
          <dd>{best ? languageName(best.language) : "—"}</dd>
        </div>
        <div>
          <dt>{m.profile.streak}</dt>
          <dd>{m.calendar.days(currentStreak)}</dd>
        </div>
        <div>
          <dt>{m.profile.solved}</dt>
          <dd>{m.calendar.ofTotal(days.size)}</dd>
        </div>
      </dl>

      <h2 className={styles.subtitle}>{m.profile.byLanguageTitle}</h2>
      <p className="muted">
        {best ? m.profile.byLanguageNote(languageName(best.language)) : m.profile.noStarsYet}
      </p>
      <ul className={styles.bars}>
        {LANGUAGES.map((language) => {
          const isBest = best?.language === language.id;
          return (
            <li key={language.id} className={cx(isBest && styles.best)}>
              <span>
                {language.name}
                {isBest && <span className={styles.countsTag}>{m.profile.countsTag}</span>}
              </span>
              <span className={styles.bar}>
                <i style={{ width: `${(totals[language.id] / barMax) * 100}%` }} />
              </span>
              <Stars value={totals[language.id]} className={styles.barValue} />
            </li>
          );
        })}
      </ul>

      <h2 className={styles.subtitle}>{m.profile.badgesTitle}</h2>
      <ul className={styles.badges}>
        {BADGES.map((badge) => {
          const earned = badges.has(badge.id);
          return (
            <li key={badge.id} className={cx(!earned && styles.lockedBadge)}>
              <span className={styles.badgeIcon}>
                <Icon name={earned ? badge.icon : "lock"} />
              </span>
              <span>
                <b>{m.badges[badge.id].name}</b>
                <small>{m.badges[badge.id].description}</small>
              </span>
            </li>
          );
        })}
      </ul>

      <form action="/auth/signout" method="post">
        <button type="submit" className={styles.signOut}>
          {m.auth.signOut}
        </button>
      </form>
    </aside>
  );
}
