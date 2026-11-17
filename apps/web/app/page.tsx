import { currentDay } from "@np/shared";
import styles from "@/components/calendar/calendar.module.css";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { CalendarSidebar } from "@/components/calendar/calendar-sidebar";
import { getNow } from "@/lib/server/now";

// Página estática desde CDN. Se regenera cada minuto: un ticket aparece como mucho un minuto después de las 6:00,
// nunca antes, porque el servidor decide con su propia hora.
export const revalidate = 60;

export default function CalendarPage() {
  const now = getNow();
  const today = currentDay(now);
  return (
    <main className={`wrap ${styles.page}`}>
      <CalendarSidebar now={now} today={today} />
      <CalendarGrid now={now} today={today} />
    </main>
  );
}
