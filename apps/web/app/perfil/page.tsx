import { isLanguageId } from "@np/shared";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Leaderboard } from "@/components/profile/leaderboard";
import styles from "@/components/profile/profile.module.css";
import { ProfileCard } from "@/components/profile/profile-card";
import { LeaderboardSkeleton, ProfileCardSkeleton } from "@/components/profile/skeletons";
import { m } from "@/lib/messages";

export const metadata: Metadata = { title: m.nav.profile };

type Props = { searchParams: Promise<{ lenguaje?: string }> };

/** Perfil (privado) y clasificación (pública), en paralelo: cada parte llega con su propio esqueleto. */
export default function ProfilePage({ searchParams }: Props) {
  const language = searchParams.then(({ lenguaje }) => (isLanguageId(lenguaje) ? lenguaje : null));
  return (
    <main className="wrap screen">
      <div className={styles.layout}>
        <Suspense fallback={<ProfileCardSkeleton />}>
          <ProfileCard />
        </Suspense>
        <Suspense fallback={<LeaderboardSkeleton />}>
          <Leaderboard language={language} />
        </Suspense>
      </div>
    </main>
  );
}
