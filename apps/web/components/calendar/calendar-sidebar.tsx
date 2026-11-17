import { DAYS, LANGUAGE_IDS } from "@np/shared";
import { LangBadge } from "@np/ui";
import { m } from "@/lib/messages";
import { Molero } from "../molero";
import styles from "./calendar.module.css";
import { DayIndex, type IndexDay } from "./day-index";
import { dayState } from "./day-state";
import { HeroAction } from "./hero-action";

/** Panel de la portada: titular con las palabras clave, botón, lenguajes e índice de los 24 días por dificultad. */
export function CalendarSidebar({ now, today }: { now: Date; today: number | null }) {
  const days: IndexDay[] = DAYS.map((day) => ({
    day: day.day,
    level: day.level,
    state: dayState(day.day, now, today),
  }));

  return (
    <aside className={styles.sidebar}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>{m.calendar.heroTitle}</h1>
        <p className={styles.heroSub}>{m.calendar.heroSub}</p>
        {today === null && <p className={styles.heroNote}>{m.calendar.notStarted}</p>}
        <div className={styles.ctaRow}>
          <HeroAction hasToday={today !== null} />
          <span className={styles.langIcons} role="img" aria-label={m.calendar.languagesLabel}>
            {LANGUAGE_IDS.map((language) => (
              <LangBadge key={language} language={language} />
            ))}
          </span>
        </div>
      </div>
      <DayIndex days={days} />
      <p className={styles.projectBy}>
        {m.calendar.projectBy} <Molero size="sm" />
      </p>
    </aside>
  );
}
