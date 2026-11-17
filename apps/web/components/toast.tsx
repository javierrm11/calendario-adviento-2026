"use client";

import { useSyncExternalStore } from "react";
import styles from "./toast.module.css";

let message: string | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit(next: string | null) {
  message = next;
  for (const listener of listeners) listener();
}

/** Muestra un aviso en una capa fija: nunca empuja el contenido de la página. */
export function showToast(text: string) {
  clearTimeout(timer);
  emit(text);
  timer = setTimeout(() => emit(null), 4_000);
}

export function Toaster() {
  const text = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => message,
    () => null,
  );
  return (
    <div role="status" aria-live="polite" className={styles.layer}>
      {text && <p className={styles.toast}>{text}</p>}
    </div>
  );
}
