"use client";

import { LANGUAGES, type LanguageId, languageName } from "@np/shared";
import type { TestResult } from "@np/tickets";
import { formatStars } from "@np/ui";
import { type KeyboardEvent, useState } from "react";
import { Icon } from "@/components/icons";
import { showToast } from "@/components/toast";
import type { HintResponse, RunPlanResponse, SubmissionResponse } from "@/lib/api-types";
import { m } from "@/lib/messages";
import { recordSolve, useProgress } from "@/lib/progress";
import { isPythonReady, runCode } from "@/lib/runner/run-code";
import styles from "./ticket.module.css";

interface EditorProps {
  day: number;
  templates: Record<LanguageId, string>;
}

type Phase = "idle" | "preparing" | "loading-python" | "running" | "judging";

/** Lo que se enseña bajo el editor después de ejecutar. */
type Outcome =
  | {
      kind: "results";
      results: TestResult[];
      passed: number;
      total: number;
      earned: number;
      language: LanguageId;
    }
  | { kind: "run-error"; message: string };

const PHASE_LABEL: Record<Phase, string> = {
  idle: m.ticket.run,
  preparing: m.ticket.preparing,
  "loading-python": m.ticket.loadingPython,
  running: m.ticket.running,
  judging: m.ticket.judging,
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await response.json()) as T;
  } catch {
    return { status: "error", message: m.api.unexpected } as T;
  }
}

/**
 * Editor del ticket. El código se ejecuta en el navegador (Web Worker) y el servidor juzga las respuestas:
 * 1. /api/runs da casos con datos nuevos, firmados; 2. se ejecuta aquí; 3. /api/submissions compara y puntúa.
 */
export function Editor({ day, templates }: EditorProps) {
  const progress = useProgress();
  const [language, setLanguage] = useState<LanguageId>("js");
  const [code, setCode] = useState<Record<LanguageId, string>>(templates);
  const [phase, setPhase] = useState<Phase>("idle");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [hint, setHint] = useState<string | null>(null);

  const signedIn = progress.status === "signed-in";
  const busy = phase !== "idle";

  async function run() {
    if (!signedIn) return showToast(m.ticket.signInToRun);
    const runLanguage = language;
    setPhase("preparing");
    const plan = await postJson<RunPlanResponse>("/api/runs", { day, language: runLanguage });
    if (plan.status === "error") {
      setPhase("idle");
      return showToast(plan.message);
    }

    setPhase(runLanguage === "py" && !isPythonReady() ? "loading-python" : "running");
    const result = await runCode(
      {
        language: runLanguage,
        code: code[runLanguage],
        call: plan.call,
        token: plan.apiToken,
        cases: plan.cases,
      },
      () => setPhase("loading-python"),
    );
    if (result.kind !== "done") {
      setPhase("idle");
      setLogs(result.kind === "error" ? result.logs : []);
      setOutcome({
        kind: "run-error",
        message: result.kind === "timeout" ? m.ticket.timeout : result.message,
      });
      return;
    }

    setLogs(result.logs);
    setPhase("judging");
    const verdict = await postJson<SubmissionResponse>("/api/submissions", {
      runToken: plan.runToken,
      outputs: result.outputs,
    });
    setPhase("idle");
    if (verdict.status === "error") return showToast(verdict.message);
    setOutcome({ kind: "results", ...verdict, language: runLanguage });
    if (verdict.solved && verdict.earned > 0)
      recordSolve({ day, language: runLanguage, stars: verdict.earned });
  }

  async function askHint() {
    if (!signedIn) return showToast(m.ticket.signInToRun);
    const response = await postJson<HintResponse>("/api/hints", { day });
    if (response.status === "error") return showToast(response.message);
    setHint(response.hint);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Tab" || event.shiftKey) return;
    event.preventDefault();
    const target = event.currentTarget;
    const { selectionStart, selectionEnd, value } = target;
    const next = `${value.slice(0, selectionStart)}    ${value.slice(selectionEnd)}`;
    setCode((current) => ({ ...current, [language]: next }));
    requestAnimationFrame(() => target.setSelectionRange(selectionStart + 4, selectionStart + 4));
  }

  return (
    <section className={`np-card ${styles.editor}`} aria-label={m.ticket.code}>
      <div className={styles.toolbar}>
        <fieldset className={styles.languages}>
          <legend className={styles.srOnly}>{m.ticket.language}</legend>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              aria-pressed={lang.id === language}
              onClick={() => setLanguage(lang.id)}
            >
              {lang.name}
            </button>
          ))}
        </fieldset>
        <button
          type="button"
          className={styles.reset}
          onClick={() => setCode((current) => ({ ...current, [language]: templates[language] }))}
        >
          {m.ticket.reset}
        </button>
      </div>

      <label className={styles.srOnly} htmlFor="code">
        {m.ticket.code}
      </label>
      <textarea
        id="code"
        className={styles.code}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        value={code[language]}
        onChange={(event) => setCode((current) => ({ ...current, [language]: event.target.value }))}
        onKeyDown={onKeyDown}
      />

      <div className={styles.actions}>
        <button type="button" className="np-btn np-btn--primary" onClick={run} disabled={busy}>
          {PHASE_LABEL[phase]}
        </button>
        <button type="button" className="np-btn np-btn--ghost" onClick={askHint} disabled={hint !== null}>
          {m.ticket.hint}
        </button>
        <span className="muted">{m.ticket.hintCost}</span>
      </div>

      {hint && (
        <div className={styles.hint}>
          <strong>{m.ticket.hintTitle}:</strong> {hint}
        </div>
      )}

      <div aria-live="polite">
        <OutcomeView outcome={outcome} />
      </div>

      {logs.length > 0 && (
        <details className={styles.logs}>
          <summary>{m.ticket.logsTitle(logs.length)}</summary>
          <pre>{logs.join("\n")}</pre>
        </details>
      )}
    </section>
  );
}

function OutcomeView({ outcome }: { outcome: Outcome | null }) {
  if (!outcome) return <p className="muted">{m.ticket.noResults}</p>;
  if (outcome.kind === "run-error") {
    return (
      <div className={styles.runError}>
        <p>{m.ticket.runError}</p>
        <pre>{outcome.message}</pre>
      </div>
    );
  }
  const allPassed = outcome.passed === outcome.total;
  const language = languageName(outcome.language);
  return (
    <>
      <ul className={styles.results}>
        {outcome.results.map((result) => (
          <li key={result.name} className={result.ok ? styles.pass : styles.fail}>
            <Icon name={result.ok ? "check" : "cross"} className={styles.resultIcon} />
            <span>
              {result.name}
              {result.msg && <small>{result.msg}</small>}
            </span>
          </li>
        ))}
      </ul>
      <p className={allPassed ? styles.summaryOk : styles.summary}>
        {m.ticket.summary(outcome.passed, outcome.total)}{" "}
        {allPassed
          ? outcome.earned > 0
            ? m.ticket.solved(formatStars(outcome.earned), language)
            : m.ticket.alreadySolved(language)
          : m.ticket.fixAndRetry}
      </p>
    </>
  );
}
