"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "@/lib/messages";
import styles from "./header.module.css";

const TABS = [
  { href: "/", label: m.nav.calendar, match: (path: string) => path === "/" },
  { href: "/ticket", label: m.nav.ticket, match: (path: string) => path.startsWith("/ticket") },
  { href: "/perfil", label: m.nav.profile, match: (path: string) => path.startsWith("/perfil") },
  { href: "/como-funciona", label: m.nav.how, match: (path: string) => path.startsWith("/como-funciona") },
];

/** Pestañas principales. Next precarga las cuatro en cuanto se ven, así que cambiar entre ellas es inmediato. */
export function NavTabs() {
  const path = usePathname();
  return (
    <nav className={styles.tabs} aria-label="Secciones">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={styles.tab}
          aria-current={tab.match(path) ? "page" : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
