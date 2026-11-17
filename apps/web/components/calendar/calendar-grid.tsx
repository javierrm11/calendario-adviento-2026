import { DAYS, isUnlocked } from "@np/shared";
import { Fragment } from "react";
import { m } from "@/lib/messages";
import { Molero } from "../molero";
import styles from "./calendar.module.css";
import { DayTile, type DayTileState, type TileShape } from "./day-tile";

/** Forma de cada postal en la cuadrícula de 6 columnas. Con estas formas los números quedan en orden de lectura. */
const SHAPES: Partial<Record<number, TileShape>> = {
  1: "big",
  4: "tall",
  9: "wide",
  12: "big",
  18: "big-desktop",
  24: "banner",
};

/** El patrocinador ocupa el hueco anterior a este día. */
const SPONSOR_BEFORE_DAY = 17;
/** Días de la primera fila: sus fotos se cargan sin esperar (LCP). */
const FIRST_ROW = 5;

export function CalendarGrid({ now, today }: { now: Date; today: number | null }) {
  return (
    <div className={styles.grid}>
      {DAYS.map((day) => {
        const state: DayTileState = !isUnlocked(day.day, now)
          ? "locked"
          : day.day === today
            ? "today"
            : "open";
        return (
          <Fragment key={day.day}>
            {day.day === SPONSOR_BEFORE_DAY && (
              <aside className={styles.sponsor} aria-label={m.sponsor.label}>
                <small>{m.sponsor.label}</small>
                <Molero />
                <small>{m.sponsor.thanks}</small>
              </aside>
            )}
            <DayTile
              day={day}
              state={state}
              shape={SHAPES[day.day] ?? "normal"}
              eager={day.day <= FIRST_ROW}
            />
          </Fragment>
        );
      })}
    </div>
  );
}
