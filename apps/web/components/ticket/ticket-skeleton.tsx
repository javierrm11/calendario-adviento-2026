import { SkeletonBar } from "@np/ui";
import styles from "./ticket.module.css";

/** Mismo esqueleto que la pantalla del ticket: cabecera, enunciado y editor con sus medidas. */
export function TicketSkeleton() {
  return (
    <main className="wrap screen" aria-busy="true">
      <div className={styles.crumbs}>
        <SkeletonBar width={140} height={16} />
      </div>
      <SkeletonBar width="min(560px, 90%)" height={40} />
      <div className={styles.pills}>
        <SkeletonBar width={260} height={22} />
      </div>
      <div className={styles.grid}>
        <div className={`np-card ${styles.body}`}>
          {[90, 100, 80, 100, 70, 95].map((width, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: esqueleto estático
            <SkeletonBar key={index} width={`${width}%`} height={16} />
          ))}
        </div>
        <div className={`np-card ${styles.editor}`}>
          <SkeletonBar width="100%" height={34} />
          <SkeletonBar width="100%" height={340} />
          <SkeletonBar width={300} height={44} />
        </div>
      </div>
    </main>
  );
}
