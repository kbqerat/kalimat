"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/[lang]/admin/login/actions";

export function AdminLoginForm({ lang }: { lang: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="lang" value={lang} />
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
          Mot de passe
        </span>
        <input
          type="password"
          name="password"
          autoFocus
          required
          className="riso-input mt-1"
        />
      </label>

      {state.error && (
        <p className="border-2 border-riso-orange bg-riso-orange/10 p-2 font-mono text-[11px] uppercase tracking-widest text-riso-orange">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="riso-shadow-ink w-full border-2 border-ink bg-ink px-5 py-3 font-mono text-sm font-bold uppercase tracking-widest text-paper transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "…" : "Entrer"}
      </button>
    </form>
  );
}
