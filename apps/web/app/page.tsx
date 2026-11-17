import { currentDay, TOTAL_DAYS } from "@np/shared";
import styles from "@/components/calendar/calendar.module.css";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { CalendarStats } from "@/components/calendar/calendar-stats";
import { formatToday } from "@/lib/date";
import { m } from "@/lib/messages";
import { getNow } from "@/lib/server/now";

// Página estática desde CDN. Se regenera cada minuto: un ticket aparece como mucho un minuto después de las 6:00,
// nunca antes, porque el servidor decide con su propia hora.
export const revalidate = 60;

export default function CalendarPage() {
  const now = getNow();
  const today = currentDay(now);
  const subtitle =
    today === null
      ? m.calendar.notStarted
      : `${m.calendar.today(formatToday(now))} ${today < TOTAL_DAYS ? m.calendar.next : m.calendar.finished}`;

  return (
    <main className="wrap screen">
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>{m.calendar.title}</h1>
          <p className="muted">{subtitle}</p>
        </div>
        <CalendarStats today={today} />
      </div>
      <CalendarGrid now={now} today={today} />
    </main>
  );
}
