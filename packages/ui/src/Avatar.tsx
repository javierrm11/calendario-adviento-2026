import { cx } from "./cx";

interface AvatarProps {
  src?: string | null;
  name: string;
  size: number;
  className?: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/** Avatar de GitHub con tamaño fijo (no mueve el diseño al cargar). Sin foto, muestra las iniciales. */
export function Avatar({ src, name, size, className }: AvatarProps) {
  if (src) {
    return (
      // Los avatares vienen de GitHub, ya pequeños y optimizados: un <img> con tamaño fijo basta.
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={cx("np-avatar", className)}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cx("np-avatar", className)}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </span>
  );
}
