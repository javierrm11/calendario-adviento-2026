import { cx } from "./cx";

const numberFormat = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });

export function formatStars(value: number): string {
  return numberFormat.format(value);
}

/** Estrellas con el número al lado: "★ 13" o "★ 1,5". */
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cx("np-stars", className)}>
      <span aria-hidden="true">★</span>
      {formatStars(value)}
    </span>
  );
}
