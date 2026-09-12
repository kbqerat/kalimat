"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveProduct, type ProductFormState } from "@/app/[lang]/admin/(dash)/actions";
import type { CollectionWithCount } from "@/lib/data";
import { PRODUCT_TYPES, type Product, type ProductType } from "@/lib/data/types";

const TYPE_LABELS_FR: Record<ProductType, string> = {
  cards: "Cartes",
  box: "Coffret",
  poster: "Affiche",
  pack: "Pack",
  activity: "Activité",
  syllables: "Syllabes",
};

export function ProductForm({
  lang,
  product,
  collections,
  isNew,
}: {
  lang: string;
  product: Product;
  collections: CollectionWithCount[];
  isNew: boolean;
}) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    saveProduct,
    {},
  );

  const highlights = (loc: "fr" | "ar" | "en") =>
    product.highlights.map((h) => h[loc]).join("\n");

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="lang" value={lang} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl">
          {isNew ? "Nouveau produit" : product.title.fr}
        </h1>
        <Link
          href={`/${lang}/admin/products`}
          className="text-xs text-ink-soft hover:text-brand"
        >
          ← Retour
        </Link>
      </div>

      <Fieldset legend="Essentiel">
        <Text name="title_fr" label="Titre" defaultValue={product.title.fr} />
        <Select
          name="collectionSlug"
          label="Collection"
          defaultValue={product.collectionSlug ?? ""}
        >
          <option value="">— Aucune —</option>
          {collections.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name.fr}
            </option>
          ))}
        </Select>
        <Select name="type" label="Type" defaultValue={product.type}>
          {PRODUCT_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS_FR[t]}
            </option>
          ))}
        </Select>
        <Text name="priceMad" label="Prix (MAD)" type="number" defaultValue={product.priceMad} />
        <Text name="stock" label="Stock" type="number" defaultValue={product.stock} />
        <div className="flex items-end gap-4">
          <Check name="isActive" label="Actif" defaultChecked={product.isActive} />
          <Check name="featured" label="En vitrine" defaultChecked={product.featured} />
        </div>
      </Fieldset>

      <details className="rounded-xl border border-line p-4">
        <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-ink-soft">
          Options avancées
        </summary>

        <div className="mt-4 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Text name="slug" label="Slug (laisser vide pour générer)" defaultValue={product.slug} />
            <Text
              name="compareAtMad"
              label="Prix barré (MAD)"
              type="number"
              defaultValue={product.compareAtMad ?? ""}
            />
            <Text
              name="cardCount"
              label="Nombre de cartes"
              type="number"
              defaultValue={product.cardCount ?? ""}
            />
            <Text name="rating" label="Note (0–5)" type="number" step="0.01" defaultValue={product.rating} />
            <Text
              name="ratingCount"
              label="Nombre d'avis"
              type="number"
              defaultValue={product.ratingCount}
            />
            <Text
              name="salesCount"
              label="Ventes affichées"
              type="number"
              defaultValue={product.salesCount}
            />
          </div>

          <Fieldset legend="Titre — traductions (vide = reprend le FR)">
            <Text name="title_ar" label="AR" defaultValue={product.title.ar} dir="rtl" />
            <Text name="title_en" label="EN" defaultValue={product.title.en} />
          </Fieldset>

          <Fieldset legend="Accroche" cols={3}>
            <Text name="tagline_fr" label="FR" defaultValue={product.tagline.fr} />
            <Text name="tagline_ar" label="AR" defaultValue={product.tagline.ar} dir="rtl" />
            <Text name="tagline_en" label="EN" defaultValue={product.tagline.en} />
          </Fieldset>

          <Fieldset legend="Description" cols={3}>
            <Area name="description_fr" label="FR" defaultValue={product.description.fr} />
            <Area name="description_ar" label="AR" defaultValue={product.description.ar} dir="rtl" />
            <Area name="description_en" label="EN" defaultValue={product.description.en} />
          </Fieldset>

          <Fieldset legend="Points forts (une ligne = un point, alignés entre langues)" cols={3}>
            <Area name="highlights_fr" label="FR" defaultValue={highlights("fr")} />
            <Area name="highlights_ar" label="AR" defaultValue={highlights("ar")} dir="rtl" />
            <Area name="highlights_en" label="EN" defaultValue={highlights("en")} />
          </Fieldset>
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

function Fieldset({
  legend,
  cols = 2,
  children,
}: {
  legend: string;
  cols?: 2 | 3;
  children: React.ReactNode;
}) {
  return (
    <fieldset
      className={`grid gap-4 rounded-xl border border-line p-4 ${
        cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
      }`}
    >
      <legend className="px-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

function Text({
  name,
  label,
  defaultValue,
  type = "text",
  step,
  dir,
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
  type?: string;
  step?: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <label className="block">
      <span className="text-xs text-ink-soft">{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        dir={dir}
        defaultValue={defaultValue}
        className="field mt-1"
      />
    </label>
  );
}

function Area({
  name,
  label,
  defaultValue,
  dir,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <label className="block">
      <span className="text-xs text-ink-soft">{label}</span>
      <textarea
        name={name}
        dir={dir}
        rows={4}
        defaultValue={defaultValue}
        className="field mt-1"
      />
    </label>
  );
}

function Select({
  name,
  label,
  defaultValue,
  children,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs text-ink-soft">{label}</span>
      <select name={name} defaultValue={defaultValue} className="field mt-1">
        {children}
      </select>
    </label>
  );
}

function Check({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4"
      />
      {label}
    </label>
  );
}
