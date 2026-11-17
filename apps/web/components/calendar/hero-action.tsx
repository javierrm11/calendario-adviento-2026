"use client";

import { SkeletonBar } from "@np/ui";
import Link from "next/link";
import { m } from "@/lib/messages";
import { useProgress } from "@/lib/progress";
import { SignInButton } from "../sign-in-button";

/** Botón principal de la portada: entrar con GitHub o abrir el ticket de hoy. Ocupa siempre el mismo hueco. */
export function HeroAction({ hasToday }: { hasToday: boolean }) {
  const progress = useProgress();
  if (progress.status === "loading") return <SkeletonBar width={230} height={44} />;
  if (progress.status === "signed-out") return <SignInButton />;
  if (!hasToday) return null;
  return (
    <Link href="/ticket" className="np-btn np-btn--primary">
      {m.calendar.openToday}
    </Link>
  );
}
