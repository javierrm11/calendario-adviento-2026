import { LANGUAGES, type LanguageId } from "@np/shared";
import type { CSSProperties } from "react";
import { cx } from "./cx";

interface LangBadgeProps {
  language: LanguageId;
  /** Lado del cuadrado en píxeles. */
  size?: number;
  className?: string;
}

/** Icono de un lenguaje: su código corto (JS, TS, PY) en los colores de su marca. El nombre va en el title. */
export function LangBadge({ language, size = 40, className }: LangBadgeProps) {
  const data = LANGUAGES.find((item) => item.id === language);
  return (
    <span
      className={cx("np-lang", `np-lang--${language}`, className)}
      style={{ "--size": `${size}px` } as CSSProperties}
      title={data?.name}
    >
      {data?.short}
    </span>
  );
}
