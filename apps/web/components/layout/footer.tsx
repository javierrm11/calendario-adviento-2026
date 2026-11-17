import { m } from "@/lib/messages";
import { Molero } from "../molero";
import styles from "./footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <p>{m.footer}</p>
        <p className={styles.sponsor}>
          {m.sponsor.short} <Molero size="sm" />
        </p>
      </div>
    </footer>
  );
}
