import { SkeletonBar, SkeletonCircle } from "@np/ui";
import styles from "./profile.module.css";

const ROWS = 8;

/** Esqueleto de la tarjeta de perfil, con las medidas de la tarjeta real. */
export function ProfileCardSkeleton() {
  return (
    <aside className={`np-card ${styles.card}`} aria-hidden="true">
      <SkeletonCircle size={88} />
      <SkeletonBar width={180} height={30} />
      <SkeletonBar width={220} height={16} />
      <div className={styles.stats}>
        {[0, 1, 2, 3].map((key) => (
          <SkeletonBar key={key} width={90} height={40} />
        ))}
      </div>
      <SkeletonBar width="100%" height={180} />
    </aside>
  );
}

/** Esqueleto de la clasificación: mismas filas, misma altura (como la referencia de AdventJS). */
export function LeaderboardSkeleton() {
  return (
    <section className={`np-card ${styles.leaderboard}`} aria-hidden="true">
      <SkeletonBar width={160} height={24} />
      <div className={styles.tabs}>
        <SkeletonBar width={420} height={32} />
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <tbody>
            {Array.from({ length: ROWS }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: filas de esqueleto estáticas
              <tr key={index}>
                <td className={styles.num}>
                  <SkeletonBar width={18} height={18} />
                </td>
                <td>
                  <span className={styles.person}>
                    <SkeletonCircle size={32} />
                    <SkeletonBar width={140} height={14} />
                  </span>
                </td>
                <td>
                  <SkeletonBar width={80} height={14} />
                </td>
                <td className={styles.num}>
                  <SkeletonBar width={40} height={14} />
                </td>
                <td className={styles.num}>
                  <SkeletonBar width={24} height={14} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
