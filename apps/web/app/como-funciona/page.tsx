import { DAYS, LEVEL_IDS } from "@np/shared";
import { LevelTag } from "@np/ui";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Molero } from "@/components/molero";
import credits from "@/content/photo-credits.json";
import { m } from "@/lib/messages";
import styles from "./how.module.css";

export const metadata: Metadata = { title: m.nav.how };

interface Credit {
  d: number;
  a: string;
  l: string;
  u: string;
}

const MOSAIC_DAYS = [1, 3, 12];

export default function HowItWorksPage() {
  return (
    <main>
      <section className={`wrap ${styles.hero}`}>
        <div>
          <h1 className={styles.title}>{m.how.title}</h1>
          <p className={styles.lede}>{m.how.lede}</p>
          <Link href="/" className="np-btn np-btn--primary">
            {m.how.goToCalendar}
          </Link>
          <ul className={styles.facts}>
            {m.how.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
        <div className={styles.mosaic} aria-hidden="true">
          {MOSAIC_DAYS.map((dayNumber) => {
            const day = DAYS[dayNumber - 1];
            if (!day) return null;
            return (
              <div key={day.day} className={styles.postcard}>
                <Image
                  src={day.photo.src}
                  alt=""
                  fill
                  sizes="260px"
                  className={styles.photo}
                  style={{ backgroundColor: day.photo.color }}
                />
                <LevelTag level={day.level} label={m.levels[day.level]} className={styles.postcardLevel} />
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.band}>
        <div className="wrap">
          <h2>{m.how.stepsTitle}</h2>
          <ol className={styles.steps}>
            {m.how.steps.map((step, index) => (
              <li key={step.title}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <h3>{step.title}</h3>
                <p className="muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.band}>
        <div className="wrap">
          <h2>{m.how.levelsTitle}</h2>
          <ul className={styles.levels}>
            {LEVEL_IDS.map((level) => (
              <li key={level}>
                <LevelTag level={level} label={m.levels[level]} />
                <p className="muted">{m.how.levels[level]}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.band}>
        <div className={`wrap ${styles.keys}`}>
          <div className={styles.keysText}>
            <h2>{m.how.keysTitle}</h2>
            {m.how.keys.map((paragraph) => (
              <p key={paragraph} className="muted">
                {paragraph}
              </p>
            ))}
          </div>
          <pre className={styles.code}>{`POST https://api.devadviento.dev/v1/chat/completions
Authorization: Bearer np_tok_de_tu_cuenta

{
  "model": "elfo-mini",
  "messages": [
    { "role": "user", "content": "Querido Santa: este año quiero..." }
  ]
}`}</pre>
        </div>
      </section>

      <section className={styles.band}>
        <div className="wrap">
          <div className={styles.sponsor}>
            <Molero />
            <p className="muted">{m.sponsor.long}</p>
          </div>
        </div>
      </section>

      <section className={styles.band}>
        <div className="wrap">
          <details className={styles.credits}>
            <summary>{m.how.creditsTitle}</summary>
            <p className="muted">{m.how.creditsNote}</p>
            <ul>
              {(credits as Credit[]).map((credit) => (
                <li key={credit.d}>
                  {m.how.creditDay(credit.d)}:{" "}
                  <a href={credit.u} target="_blank" rel="noopener noreferrer">
                    {credit.a || new URL(credit.u).hostname.replace("www.", "")}
                  </a>
                  , {credit.l}
                </li>
              ))}
            </ul>
          </details>
        </div>
      </section>
    </main>
  );
}
