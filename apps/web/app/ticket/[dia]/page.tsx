import { isUnlocked, isValidDay } from "@np/shared";
import { getTicketMeta } from "@np/tickets";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TicketScreen } from "@/components/ticket/ticket-screen";
import { getNow } from "@/lib/server/now";

// Ningún día se genera al compilar (sería publicar tickets futuros): se generan al pedirlos y se cachean un minuto.
export const revalidate = 60;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ dia: string }> };

function parseDay(dia: string): number | null {
  const day = Number(dia);
  return isValidDay(day) ? day : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const day = parseDay((await params).dia);
  if (day === null) return {};
  // El título solo se publica cuando el día está abierto.
  const meta = isUnlocked(day, getNow()) ? getTicketMeta(day) : undefined;
  return { title: meta ? `${meta.id}: ${meta.title}` : `Día ${day}` };
}

export default async function TicketPage({ params }: Props) {
  const day = parseDay((await params).dia);
  if (day === null) notFound();
  return <TicketScreen day={day} now={getNow()} />;
}
