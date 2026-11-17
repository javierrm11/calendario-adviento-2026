import { cx } from "./cx";

interface SkeletonBarProps {
  width: number | string;
  height?: number;
  className?: string;
}

/** Barra de carga para textos y números. Usa las mismas medidas que el contenido final. */
export function SkeletonBar({ width, height = 14, className }: SkeletonBarProps) {
  return <span aria-hidden="true" className={cx("np-skeleton", className)} style={{ width, height }} />;
}

/** Círculo de carga para avatares. */
export function SkeletonCircle({ size, className }: { size: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx("np-skeleton", "np-skeleton--circle", className)}
      style={{ width: size, height: size }}
    />
  );
}
