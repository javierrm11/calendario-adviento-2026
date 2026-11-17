"use client";

import { Icon } from "@/components/icons";
import { m } from "@/lib/messages";
import { useProgress } from "@/lib/progress";
import styles from "./calendar.module.css";
import type { DayTileState } from "./day-tile";

/** Pastilla de estado de un día. Va en posición absoluta: aparecer no mueve nada. */
export function DayStatus({ day, state }: { day: number; state: DayTileState }) {
  const progress = useProgress();

  if (state === "locked") {
    return (
      <span className={styles.status} aria-hidden="true">
        <Icon name="lock" className={styles.statusIcon} />
      </span>
    );
  }

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
