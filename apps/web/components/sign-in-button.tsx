"use client";

import { cx } from "@np/ui";
import { useState } from "react";
import { m } from "@/lib/messages";
import { getBrowserClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { GitHubMark } from "./icons";
import { showToast } from "./toast";

/** Único método de acceso: GitHub. Vuelve a la página actual al terminar. */
export function SignInButton({ small = false }: { small?: boolean }) {
  const [busy, setBusy] = useState(false);

  async function signIn() {
    if (!isSupabaseConfigured()) return showToast(m.auth.notConfigured);
    setBusy(true);
    const next = encodeURIComponent(window.location.pathname);
    const { error } = await getBrowserClient().auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}`, scopes: "read:user" },
    });
    if (error) {
      setBusy(false);
      showToast(m.auth.error);
    }
  }

  return (
    <button
      type="button"
      className={cx("np-btn", "np-btn--github", small && "np-btn--sm")}
      onClick={signIn}
      disabled={busy}
    >
      <GitHubMark />
      {m.auth.signIn}
    </button>
  );
}
