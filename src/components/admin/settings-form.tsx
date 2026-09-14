"use client";

import { useActionState } from "react";
import { saveSettings, type SettingsFormState } from "@/app/[lang]/admin/(dash)/actions";
import type { Settings } from "@/lib/data/types";

export function SettingsForm({ lang, settings }: { lang: string; settings: Settings }) {
  const [state, formAction, pending] = useActionState<SettingsFormState, FormData>(
    saveSettings,
    {},
  );

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <input type="hidden" name="lang" value={lang} />

      <div className="rounded-xl border border-line p-4">
        <label className="block">
          <span className="text-xs text-ink-soft">Nom de la boutique</span>
          <input
            name="siteName"
            defaultValue={settings.siteName}
            required
            className="field mt-1"
          />
        </label>
      </div>

      <div className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-ink-soft">Frais de livraison (MAD)</span>
          <input
            name="shippingFlatMad"
            type="number"
            min={0}
            defaultValue={settings.shippingFlatMad}
            required
            className="field mt-1"
          />
        </label>
        <label className="block">
          <span className="text-xs text-ink-soft">Livraison offerte à partir de (MAD)</span>
          <input
            name="freeShippingThresholdMad"
            type="number"
            min={0}
            defaultValue={settings.freeShippingThresholdMad}
            required
            className="field mt-1"
          />
        </label>
      </div>

      <div className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-ink-soft">Téléphone (affiché sur le site)</span>
          <input
            name="contactPhone"
            dir="ltr"
            defaultValue={settings.contactPhone}
            required
            className="field mt-1"
          />
        </label>
        <label className="block">
          <span className="text-xs text-ink-soft">Email de contact</span>
          <input
            name="contactEmail"
            type="email"
            dir="ltr"
            defaultValue={settings.contactEmail}
            required
            className="field mt-1"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs text-ink-soft">
            Numéro WhatsApp — indicatif pays + numéro, sans espaces ni &quot;+&quot;
          </span>
          <input
            name="whatsappNumber"
            dir="ltr"
            placeholder="212600029060"
            defaultValue={settings.whatsappNumber}
            required
            className="field mt-1"
          />
        </label>
      </div>

      {state.error && (
        <p className="rounded-lg border border-riso-orange bg-riso-orange/10 p-3 text-sm text-riso-orange">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg border border-riso-teal bg-riso-teal/10 p-3 text-sm text-riso-teal">
          Enregistré ✓
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "…" : "Enregistrer"}
      </button>
    </form>
  );
}
