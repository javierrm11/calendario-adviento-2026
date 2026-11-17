import { currentDay } from "@np/shared";
import type { Metadata } from "next";
import { TicketScreen } from "@/components/ticket/ticket-screen";
import { m } from "@/lib/messages";
import { getNow } from "@/lib/server/now";

// Estática y regenerada cada minuto: a las 6:00 pasa a mostrar el ticket nuevo.
export const revalidate = 60;

export const metadata: Metadata = { title: m.nav.ticket };

export default function TodayTicketPage() {
  const now = getNow();
  return <TicketScreen day={currentDay(now)} now={now} />;
}
