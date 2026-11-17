import { LANGUAGES, type LanguageId, languageName } from "@np/shared";
import { Avatar, cx, Stars } from "@np/ui";
import Link from "next/link";
import { m } from "@/lib/messages";
import { getLeaderboard, type LeaderboardRow } from "@/lib/server/leaderboard";
import { getUser } from "@/lib/supabase/server";
import styles from "./profile.module.css";

const TABS: ReadonlyArray<{ id: LanguageId | null; label: string }> = [
  { id: null, label: m.profile.general },
  ...LANGUAGES.map((language) => ({ id: language.id, label: language.name })),
];

export function LeaderboardTabs({ active }: { active: LanguageId | null }) {
  return (
    <nav className={styles.tabs} aria-label={m.profile.leaderboardTitle}>
      {TABS.map((tab) => (
        <Link
          key={tab.id ?? "general"}
          href={tab.id ? `/perfil?lenguaje=${tab.id}` : "/perfil"}
          aria-current={tab.id === active ? "page" : undefined}
          scroll={false}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export async function Leaderboard({ language: languagePromise }: { language: Promise<LanguageId | null> }) {
  const language = await languagePromise;
  const [user, rows] = await Promise.all([getUser(), getLeaderboard(language).catch(() => null)]);

  return (
    <section className={`np-card ${styles.leaderboard}`}>
      <h2 className={styles.subtitle}>{m.profile.leaderboardTitle}</h2>
      <LeaderboardTabs active={language} />
      {rows === null ? (
        <p className="muted">{m.profile.leaderboardError}</p>
      ) : rows.length === 0 ? (
        <p className="muted">{m.profile.emptyLeaderboard}</p>
      ) : (
        <LeaderboardTable rows={rows} viewerId={user?.id ?? null} />
      )}
    </section>
  );
}

function LeaderboardTable({ rows, viewerId }: { rows: LeaderboardRow[]; viewerId: string | null }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col" className={styles.num}>
              {m.profile.columns.position}
            </th>
            <th scope="col">{m.profile.columns.person}</th>
            <th scope="col">{m.profile.columns.language}</th>
            <th scope="col" className={styles.num}>
              {m.profile.columns.stars}
            </th>
            <th scope="col" className={styles.num}>
              {m.profile.columns.days}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const isViewer = row.userId === viewerId;
            return (
              <tr key={`${row.userId}-${row.language}`} className={cx(isViewer && styles.viewer)}>
                <td className={styles.num}>{index + 1}</td>
                <td>
                  <span className={styles.person}>
                    <Avatar src={row.avatarUrl} name={row.name ?? row.username} size={32} />
                    <span className={styles.personText}>
                      <b>
                        {row.name ?? row.username} {isViewer && m.profile.you}
                      </b>
                      <small>@{row.username}</small>
                    </span>
                  </span>
                </td>
                <td>{languageName(row.language)}</td>
                <td className={styles.num}>
                  <Stars value={row.stars} />
                </td>
                <td className={styles.num}>{row.days}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
