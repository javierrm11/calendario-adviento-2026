import styles from "@/components/profile/profile.module.css";
import { LeaderboardSkeleton, ProfileCardSkeleton } from "@/components/profile/skeletons";

export default function Loading() {
  return (
    <main className="wrap screen" aria-busy="true">
      <div className={styles.layout}>
        <ProfileCardSkeleton />
        <LeaderboardSkeleton />
      </div>
    </main>
  );
}
