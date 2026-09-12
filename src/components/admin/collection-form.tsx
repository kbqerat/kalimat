"use client";

/* eslint-disable @next/next/no-img-element */
import { useActionState } from "react";
import Link from "next/link";
import {
  saveCollection,
  type CollectionFormState,
} from "@/app/[lang]/admin/(dash)/actions";
import type { Collection } from "@/lib/data/types";

export function CollectionForm({
  lang,
  collection,
  isNew,
}: {
  lang: string;
  collection: Collection;
  isNew: boolean;
}) {
  const [state, formAction, pending] = useActionState<CollectionFormState, FormData>(
    saveCollection,
    {},
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <input type="hidden" name="slug" value={collection.slug} />
      <input type="hidden" name="lang" value={lang} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl">
          {isNew ? "Nouvelle collection" : collection.name.fr}
        </h1>
        <Link
          href={`/${lang}/admin/collections`}
          className="text-xs text-ink-soft hover:text-brand"
        >
          ← Retour
        </Link>
      </div>

      <div className="rounded-xl border border-line p-4">
        <label className="block">
          <span className="text-xs text-ink-soft">Nom</span>
          <input
            name="name_fr"
            defaultValue={collection.name.fr}
            required
            autoFocus={isNew}
            className="field mt-1"
          />
        </label>
      </div>

      <div className="rounded-xl border border-line p-4">
        <span className="text-xs text-ink-soft">
          Photo (optionnelle) — JPG, PNG, WebP, AVIF · 5 Mo max
        </span>
        {collection.image && (
          <div className="mt-2 flex items-center gap-3">
            <img
              src={collection.image}
              alt=""
              className="h-16 w-16 rounded-lg object-cover"
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="removeImage" className="h-4 w-4" />
              Supprimer la photo
            </label>
          </div>
        )}
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="field mt-2 file:me-3 file:rounded-full file:border-0 file:bg-brand file:px-3 file:py-1 file:text-xs file:font-bold file:text-white"
        />
      </div>

      <details className="rounded-xl border border-line p-4">
        <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-ink-soft">
          Options avancées
        </summary>

        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs text-ink-soft">Nom AR</span>
              <input
                name="name_ar"
                dir="rtl"
                defaultValue={collection.name.ar}
                className="field mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">Nom EN</span>
              <input
                name="name_en"
                defaultValue={collection.name.en}
                className="field mt-1"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs text-ink-soft">Description FR</span>
              <textarea
                name="blurb_fr"
                rows={3}
                defaultValue={collection.blurb.fr}
                className="field mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">Description AR</span>
              <textarea
                name="blurb_ar"
                dir="rtl"
                rows={3}
                defaultValue={collection.blurb.ar}
                className="field mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">Description EN</span>
              <textarea
                name="blurb_en"
                rows={3}
                defaultValue={collection.blurb.en}
                className="field mt-1"
              />
            </label>
          </div>

          <label className="block max-w-xs">
            <span className="text-xs text-ink-soft">Ordre d&apos;affichage</span>
            <input
              name="order"
              type="number"
              defaultValue={collection.order}
              className="field mt-1"
            />
          </label>
        </div>
      </details>

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
