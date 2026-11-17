import Link from "next/link";
import styles from "./notice.module.css";

/** Aviso a pantalla completa con una salida clara (ticket cerrado, página que no existe…). */
export function Notice({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action: { href: string; label: string };
}) {
  return (
    <main className="wrap screen">
      <div className={`np-card ${styles.notice}`}>
        <h1 className={styles.title}>{title}</h1>
        <p className="muted">{text}</p>
        <Link href={action.href} className="np-btn np-btn--primary">
          {action.label}
        </Link>
      </div>
    </main>
  );
}
