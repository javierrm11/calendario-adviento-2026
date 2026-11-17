import { LEVELS, type Level } from "@np/shared";
import { cx } from "./cx";

interface LevelTagProps {
  level: Level;
  /** Texto visible ("Fácil", "Media"…). Viene de los mensajes de la app. */
  label: string;
  className?: string;
}

/** Etiqueta de dificultad: color + puntos + texto. */
export function LevelTag({ level, label, className }: LevelTagProps) {
  const pips = LEVELS[level].pips;
  return (
    <span className={cx("np-level", `np-level--${level}`, className)}>
      {pips > 0 && (
        <span className="np-pips" aria-hidden="true">
          {[1, 2, 3].map((pip) => (
            <i key={pip} className={pip <= pips ? "on" : undefined} />
          ))}
        </span>
      )}
      {label}
    </span>
  );
}
