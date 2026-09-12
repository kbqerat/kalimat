"use client";

/* eslint-disable @next/next/no-img-element */
import { useActionState, useEffect, useRef } from "react";
import {
  removeProductImageAction,
  uploadProductImages,
  type ProductImagesState,
} from "@/app/[lang]/admin/(dash)/actions";

export function ProductImages({
  lang,
  productId,
  images,
}: {
  lang: string;
  productId: string;
  images: string[];
}) {
  const [state, formAction, pending] = useActionState<ProductImagesState, FormData>(
    uploadProductImages,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <section className="mt-10 max-w-3xl">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg">Photos</h2>
        <span className="text-xs text-ink-soft">{images.length} en ligne</span>
      </div>

      <fieldset className="mt-4 rounded-xl border border-line p-4">
        <legend className="px-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
          Bibliothèque
        </legend>

        {images.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-soft">
            Aucune photo pour ce produit.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((url) => (
              <li key={url} className="relative overflow-hidden rounded-lg border border-line">
                <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
                <form
                  action={removeProductImageAction}
                  className="absolute end-1 top-1"
                >
                  <input type="hidden" name="id" value={productId} />
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="url" value={url} />
                  <button
                    type="submit"
                    aria-label="Supprimer la photo"
                    className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold hover:bg-riso-orange hover:text-white"
                  >
                    Suppr.
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <form ref={formRef} action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="id" value={productId} />
        <input type="hidden" name="lang" value={lang} />

        <label className="block">
          <span className="text-xs text-ink-soft">
            Ajouter des photos — JPG, PNG, WebP, AVIF · 5 Mo max
          </span>
          <input
            type="file"
            name="images"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            required
            className="field mt-1 file:me-3 file:rounded-full file:border-0 file:bg-brand file:px-3 file:py-1 file:text-xs file:font-bold file:text-white"
          />
        </label>

        {state.error && (
          <p className="rounded-lg border border-riso-orange bg-riso-orange/10 p-3 text-sm text-riso-orange">
            {state.error}
          </p>
        )}
        {state.ok && (
          <p className="rounded-lg border border-riso-teal bg-riso-teal/10 p-3 text-sm text-riso-teal">
            {state.added} photo{(state.added ?? 0) > 1 ? "s" : ""} ajoutée
            {(state.added ?? 0) > 1 ? "s" : ""} ✓
          </p>
        )}

        <button type="submit" disabled={pending} className="btn btn-brand">
          {pending ? "Envoi…" : "Uploader"}
        </button>
      </form>
    </section>
  );
}
