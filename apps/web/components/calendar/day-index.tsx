"use client";

import { LEVEL_IDS, type Level } from "@np/shared";
import { cx } from "@np/ui";
import { m } from "@/lib/messages";
import { useProgress } from "@/lib/progress";
import styles from "./calendar.module.css";
import type { DayState } from "./day-state";

export interface IndexDay {
  day: number;
  level: Level;
  state: DayState;
}

/**
 * Índice de los 24 días con el color de su dificultad. Cerrado y «hoy» vienen del servidor; los ✓ de los días
 * resueltos se pintan aquí, en su sitio y sin mover nada. Al pulsar un día se baja hasta su postal.
 */
export function DayIndex({ days }: { days: IndexDay[] }) {
  const progress = useProgress();
  const solved = new Set(progress.status === "signed-in" ? progress.solves.map((solve) => solve.day) : []);

  return (
    <section className={`np-card ${styles.indexCard}`}>
      <div className={styles.indexHead}>
        <h2>{m.calendar.indexTitle}</h2>
        <span className="muted">
          {progress.status === "signed-in" ? m.calendar.indexDone(solved.size) : ""}
        </span>
      </div>
      <nav className={styles.dayIndex} aria-label={m.calendar.indexLabel}>
        {days.map(({ day, level, state }) => (
          <a
            key={day}
            href={`#dia-${day}`}
            className={cx(
              styles.ix,
              styles[`ix_${level}`],
              state === "locked" && styles.ixLocked,
              state === "today" && styles.ixToday,
            )}
            aria-label={m.calendar.indexItem(day, m.levels[level])}
          >
            {day}
            {solved.has(day) && (
              <span className={styles.ixDone} aria-hidden="true">
                ✓
              </span>
            )}
          </a>
        ))}
      </nav>
      <div className={styles.levelLegend}>
        {LEVEL_IDS.map((level) => (
          <span key={level} className={styles[`legend_${level}`]}>
            {m.levels[level]}
          </span>
        ))}
      </div>
    </section>
  );
}
