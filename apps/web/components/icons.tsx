// Iconos en línea: sin peticiones extra y heredan el color del texto.
type IconProps = { className?: string };

export function LogoMark({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path fill="currentColor" d="M16 2 L19 13 L30 16 L19 19 L16 30 L13 19 L2 16 L13 13Z" />
    </svg>
  );
}

export function GitHubMark({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}

const PATHS = {
  check: (
    <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  ),
  cross: (
    <path
      d="M5 5l10 10M15 5L5 15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  ),
  lock: (
    <>
      <rect x="4" y="9" width="12" height="8.5" rx="2" fill="currentColor" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" fill="none" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  star: <path d="M10 2l2.4 5 5.4.6-4 3.7 1.1 5.4L10 14l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z" fill="currentColor" />,
  flame: (
    <path
      d="M10 2c1 3.5 5 5 5 9.5A5 5 0 0 1 5 11.5C5 9 6.5 7.5 7 6c.5 1.5 1.5 2.5 2.5 2.5C9.5 6 9 4 10 2z"
      fill="currentColor"
    />
  ),
  globe: (
    <>
      <circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M2.5 10h15M10 2.5c2.5 2.5 2.5 12.5 0 15M10 2.5c-2.5 2.5-2.5 12.5 0 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </>
  ),
  bulb: (
    <>
      <path d="M10 2.5a5.5 5.5 0 0 0-3 10.1V15h6v-2.4a5.5 5.5 0 0 0-3-10.1z" fill="currentColor" />
      <rect x="7.5" y="16" width="5" height="2" rx="1" fill="currentColor" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="8.5" width="14" height="9" rx="1.5" fill="currentColor" />
      <rect x="2" y="5.5" width="16" height="3.5" rx="1" fill="currentColor" />
    </>
  ),
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className }: IconProps & { name: IconName }) {
  return (
    <svg className={className} viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}
