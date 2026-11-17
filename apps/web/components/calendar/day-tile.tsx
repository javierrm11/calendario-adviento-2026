import type { PublicDay } from "@np/shared";
import { cx, LevelTag } from "@np/ui";
import Image from "next/image";
import Link from "next/link";
import { m } from "@/lib/messages";
import styles from "./calendar.module.css";
import type { DayState } from "./day-state";
import { DayStatus } from "./day-status";

/** big-desktop: grande en escritorio y normal en móvil (para que la cuadrícula de 2 columnas no deje huecos). */
export type TileShape = "normal" | "big" | "big-desktop" | "tall" | "wide" | "banner";

const SHAPE_CLASS: Record<TileShape, string | undefined> = {
  normal: undefined,
  big: styles.big,
  "big-desktop": cx(styles.big, styles.singleOnMobile),
  tall: styles.tall,
  wide: styles.wide,
  banner: styles.banner,
};

/** Ancho real de la foto en cada forma, para que el navegador descargue el tamaño justo. */
const SHAPE_SIZES: Record<TileShape, string> = {
  normal: "(max-width: 640px) 50vw, (max-width: 1000px) 25vw, 200px",
  big: "(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 400px",
  "big-desktop": "(max-width: 640px) 50vw, (max-width: 1000px) 50vw, 400px",
  tall: "(max-width: 640px) 50vw, (max-width: 1000px) 25vw, 200px",
  wide: "(max-width: 640px) 50vw, (max-width: 1000px) 50vw, 400px",
  banner: "(max-width: 640px) 50vw, 1000px",
};

interface DayTileProps {
  day: PublicDay;
  state: DayState;
  shape: TileShape;
  eager: boolean;
}

/** Una postal del calendario: número, dificultad, foto y estado. Sin títulos ni descripción (CLAUDE.md). */
export function DayTile({ day, state, shape, eager }: DayTileProps) {
  const level = m.levels[day.level];
  const stateText =
    state === "locked"
      ? m.calendar.stateLocked(day.day)
      : state === "today"
        ? m.calendar.stateToday
        : m.calendar.stateOpen;
  const label = m.calendar.dayLabel(day.day, level, stateText);
  const className = cx(
    styles.tile,
    SHAPE_CLASS[shape],
    state === "locked" && styles.locked,
    state === "today" && styles.today,
  );

  const content = (
    <>
      <Image
        src={day.photo.src}
        alt=""
        fill
        sizes={SHAPE_SIZES[shape]}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        className={styles.photo}
        style={{ backgroundColor: day.photo.color }}
      />
      <span className={styles.number}>{day.day}</span>
      <LevelTag level={day.level} label={level} className={styles.level} />
      <DayStatus day={day.day} state={state} minigame={day.level === "extra"} />
    </>
  );

  // id="dia-N": el índice del panel lateral baja hasta aquí.
  const anchor = `dia-${day.day}`;
  if (state === "locked") {
    return (
      <div id={anchor} className={className} role="img" aria-label={label}>
        {content}
      </div>
    );
  }
  // Solo se precarga el ticket de hoy: los días pasados se cargan al entrar.
  return (
    <Link
      id={anchor}
      href={`/ticket/${day.day}`}
      prefetch={state === "today" ? undefined : false}
      className={className}
      aria-label={label}
    >
      {content}
    </Link>
  );
}
