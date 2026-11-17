import Link from "next/link";
import { m } from "@/lib/messages";
import { LogoMark } from "../icons";
import styles from "./header.module.css";
import { NavTabs } from "./nav-tabs";
import { UserMenu } from "./user-menu";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          <LogoMark className={styles.logoMark} />
          {m.brand}
        </Link>
        <NavTabs />
        <UserMenu />
      </div>
    </header>
  );
}
