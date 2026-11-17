"use client";

import { score } from "@np/shared";
import { Avatar, SkeletonBar, Stars } from "@np/ui";
import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { SignInButton } from "../sign-in-button";
import styles from "./header.module.css";

/** Zona del usuario en la cabecera. Ocupa siempre el mismo hueco para no mover nada al cargar. */
export function UserMenu() {
  const progress = useProgress();
  return (
    <div className={styles.user}>
      {progress.status === "loading" && <SkeletonBar width={150} height={36} />}
      {progress.status === "signed-out" && <SignInButton small />}
      {progress.status === "signed-in" && (
        <Link href="/perfil" className={styles.chip}>
          <Stars value={score(progress.solves)} className={styles.score} />
          <Avatar
            src={progress.viewer.avatarUrl}
            name={progress.viewer.name ?? progress.viewer.username}
            size={34}
          />
          <span>{progress.viewer.username}</span>
        </Link>
      )}
    </div>
  );
}
