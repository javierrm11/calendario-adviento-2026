import { LANGUAGE_IDS, type LanguageId, LEVELS } from "@np/shared";
import { LevelTag } from "@np/ui";
import Link from "next/link";
import { m } from "@/lib/messages";
import { resolveTicket } from "@/lib/server/tickets";
import { Notice } from "../notice";
import { Editor } from "./editor";
import { Markdown } from "./markdown";
import styles from "./ticket.module.css";

/** Pantalla de un ticket según su estado. El servidor decide qué se puede enseñar en este momento. */
export function TicketScreen({ day, now }: { day: number | null; now: Date }) {
  const view = resolveTicket(day, now);

  switch (view.kind) {
    case "not-started":
      return <TicketNotice title={m.ticket.notStartedTitle} text={m.ticket.notStarted} />;
    case "locked":
      return <TicketNotice title={m.ticket.lockedTitle(view.day)} text={m.ticket.locked(view.day)} />;
    case "minigame":
      return (
        <TicketNotice title={`${m.ticket.minigameTitle}: ${view.meta.title}`} text={m.ticket.minigame} />
      );
    case "missing":
      return <TicketNotice title={m.ticket.missingTitle} text={m.ticket.missing} />;
    case "open": {
      const { meta, level, content } = view;
      const minutes = LEVELS[level].minutes;
      const templates = Object.fromEntries(
        LANGUAGE_IDS.map((language) => [language, content.languages[language].template]),
      ) as Record<LanguageId, string>;
      return (
        <main className="wrap screen">
          <nav className={styles.crumbs} aria-label="Ruta">
            <Link href="/">{m.ticket.breadcrumb}</Link>
            <span aria-hidden="true">/</span>
            <span>{meta.id}</span>
          </nav>
          <h1 className={styles.title}>{meta.title}</h1>
          <ul className={styles.pills}>
            <li>
              <LevelTag level={level} label={m.levels[level]} />
            </li>
            <li>{m.ticketTypes[meta.type]}</li>
            {minutes && <li>{m.ticket.minutes(minutes)}</li>}
            <li>{m.ticket.stars(LEVELS[level].stars)}</li>
          </ul>
          <div className={styles.grid}>
            <article className={`np-card ${styles.body}`}>
              <Markdown source={content.statement} className={styles.statement} />
              <h2 className={styles.subtitle}>{m.ticket.testsTitle}</h2>
              <p className="muted">{m.ticket.testsNote(content.tests.length)}</p>
              <ul className={styles.testList}>
                {content.tests.map((test) => (
                  <li key={test.name}>{test.name}</li>
                ))}
              </ul>
            </article>
            <Editor day={meta.day} templates={templates} />
          </div>
        </main>
      );
    }
  }
}

function TicketNotice({ title, text }: { title: string; text: string }) {
  return <Notice title={title} text={text} action={{ href: "/", label: m.ticket.backToCalendar }} />;
}
