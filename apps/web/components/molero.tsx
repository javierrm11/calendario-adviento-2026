import { cx } from "@np/ui";
import styles from "./molero.module.css";

/** Marca del patrocinador. Provisional hasta tener el logo definitivo (CLAUDE.md). */
export function Molero({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span className={cx(styles.molero, size === "sm" && styles.small)}>
      <span className={styles.mark} aria-hidden="true">
        M
      </span>
      Molero
    </span>
  );
}
