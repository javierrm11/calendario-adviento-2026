"use client";

import { bestLanguage, languageName, solvedDays, starsByLanguage, streak } from "@np/shared";
import { SkeletonBar, Stars } from "@np/ui";
import { m } from "@/lib/messages";
import { useProgress } from "@/lib/progress";
import { SignInButton } from "../sign-in-button";
import styles from "./calendar.module.css";

/** Estrellas, resueltos y racha. Sin sesión, el botón de GitHub. Siempre con la misma altura. */
export function CalendarStats({ today }: { today: number | null }) {
  const progress = useProgress();

  if (progress.status === "loading") {
    return (
      <div className={styles.stats} aria-hidden="true">
        <SkeletonBar width={260} height={44} />
      </div>
    );
  }

  if (progress.status === "signed-out") {
    return (
      <div className={styles.stats}>
        <p className={styles.prompt}>{m.auth.prompt}</p>
        <SignInButton small />
      </div>
    );
  }

  const best = bestLanguage(starsByLanguage(progress.solves));
  const days = solvedDays(progress.solves);
  return (
    <dl className={styles.stats}>
      <div>
        <dt>{m.calendar.statStars(best ? languageName(best.language) : "—")}</dt>
        <dd>
          <Stars value={best?.stars ?? 0} />
        </dd>
      </div>
      <div>
        <dt>{m.calendar.statSolved}</dt>
        <dd>{m.calendar.ofTotal(days.size)}</dd>
      </div>
      <div>
        <dt>{m.calendar.statStreak}</dt>
        <dd>{m.calendar.days(streak(days, today))}</dd>
      </div>
    </dl>
  );
}
