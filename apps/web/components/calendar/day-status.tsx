"use client";

import { Icon } from "@/components/icons";
import { m } from "@/lib/messages";
import { useProgress } from "@/lib/progress";
import styles from "./calendar.module.css";
import type { DayState } from "./day-state";

interface DayStatusProps {
  day: number;
  state: DayState;
  /** Los minijuegos no tienen ticket: nunca salen como «Sin resolver». */
  minigame: boolean;
}

/** Pastilla de estado de un día. Va en posición absoluta: aparecer no mueve nada. */
export function DayStatus({ day, state, minigame }: DayStatusProps) {
  const progress = useProgress();

  if (state === "locked") {
    return (
      <span className={styles.status} aria-hidden="true">
        <Icon name="lock" className={styles.statusIcon} />
      </span>
    );
  }

  if (minigame) return <span className={styles.status}>{m.calendar.statusMinigame}</span>;

  if (progress.status === "signed-in") {
    const stars = Math.max(
      0,
      ...progress.solves.filter((solve) => solve.day === day).map((solve) => solve.stars),
    );
    if (stars > 0) {
      return (
        <span className={styles.status}>
          <span className={styles.stars}>{"★".repeat(Math.ceil(stars))}</span>
        </span>
      );
    }
    if (state === "open") return <span className={styles.status}>{m.calendar.statusPending}</span>;
  }

  return state === "today" ? <span className={styles.status}>{m.calendar.statusToday}</span> : null;
}
