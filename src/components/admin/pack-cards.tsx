"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import {
  importPackCards,
  removePackCard,
  uploadPackCardImages,
  type PackCardsImportState,
} from "@/app/[lang]/admin/(dash)/actions";

const EXAMPLE = `1 ; تفاحة ; une pomme ; apple
2 ; موزة ; une banane ; banana
3 ; برتقالة ; une orange ; orange`;

export function PackCardsImport({ lang, productId }: { lang: string; productId: string }) {
  const [state, formAction, pending] = useActionState<PackCardsImportState, FormData>(
    importPackCards,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={productId} />
      <input type="hidden" name="lang" value={lang} />
      <p className="text-sm text-ink-soft">
        Une ligne par carte : <b>numéro ; arabe ; français ; anglais</b>. Tu peux copier-coller
        directement depuis Excel. Optionnel, à la suite : phrase en arabe ; en français ; en
        anglais. Une carte qui existe déjà est mise à jour (son image est gardée).
      </p>
      <textarea
        name="rows"
        rows={8}
        required
        placeholder={EXAMPLE}
        className="field font-mono text-sm"
        dir="auto"
      />
      {state.error && (
        <p className="rounded-lg border border-riso-orange bg-riso-orange/10 p-3 text-sm text-riso-orange">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg border border-riso-teal bg-riso-teal/10 p-3 text-sm text-riso-teal">
          {state.count} carte{(state.count ?? 0) > 1 ? "s" : ""} enregistrée
          {(state.count ?? 0) > 1 ? "s" : ""} ✓
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-brand">
        {pending ? "…" : "Importer"}
      </button>
    </form>
  );
}

// Server Actions accept 12 MB per request (next.config.ts): send the
// images in batches that stay well under it.
const BATCH_BYTES = 8 * 1024 * 1024;
const BATCH_FILES = 10;

function batches(files: File[]): File[][] {
  const out: File[][] = [];
  let current: File[] = [];
  let size = 0;
  for (const file of files) {
    if (current.length && (size + file.size > BATCH_BYTES || current.length >= BATCH_FILES)) {
      out.push(current);
      current = [];
      size = 0;
    }
    current.push(file);
    size += file.size;
  }
  if (current.length) out.push(current);
  return out;
}

export function PackCardImagesUpload({ productId }: { productId: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [report, setReport] = useState<{ matched: number; skipped: string[]; error?: string }>();

  async function upload() {
    const all = batches(files);
    let matched = 0;
    const skipped: string[] = [];
    let error: string | undefined;
    setReport(undefined);
    setProgress({ done: 0, total: files.length });
    let done = 0;
    for (const batch of all) {
      const fd = new FormData();
      fd.set("id", productId);
      batch.forEach((f) => fd.append("images", f));
      const res = await uploadPackCardImages(fd);
      matched += res.matched.length;
      skipped.push(...res.skipped);
      done += batch.length;
      setProgress({ done, total: files.length });
      if (res.error) {
        error = res.error;
        break;
      }
    }
    setProgress(null);
    setReport({ matched, skipped, error });
    setFiles([]);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-soft">
        Le numéro dans le nom du fichier choisit la carte : <b>12.png</b>, <b>012.webp</b> ou{" "}
        <b>carte-12.jpg</b> vont sur la carte 12. Tu peux toutes les sélectionner d’un coup.
        Les cartes doivent exister (importe les mots d’abord).
      </p>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        className="field file:me-3 file:rounded-full file:border-0 file:bg-brand file:px-3 file:py-1 file:text-xs file:font-bold file:text-white"
      />
      {progress && (
        <p className="text-sm text-ink-soft">
          Envoi… {progress.done} / {progress.total}
        </p>
      )}
      {report && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            report.error
              ? "border-riso-orange bg-riso-orange/10 text-riso-orange"
              : "border-riso-teal bg-riso-teal/10 text-riso-teal"
          }`}
        >
          <p>{report.matched} image{report.matched > 1 ? "s" : ""} ajoutée{report.matched > 1 ? "s" : ""}.</p>
          {report.skipped.length > 0 && (
            <p className="mt-1 text-riso-orange">
              Aucune carte pour : {report.skipped.join(", ")}
            </p>
          )}
          {report.error && <p className="mt-1">{report.error}</p>}
        </div>
      )}
      <button
        type="button"
        onClick={upload}
        disabled={files.length === 0 || progress !== null}
        className="btn btn-brand"
      >
        {files.length > 0 ? `Uploader ${files.length} image${files.length > 1 ? "s" : ""}` : "Uploader"}
      </button>
    </div>
  );
}

export function DeletePackCardButton({
  lang,
  productId,
  n,
}: {
  lang: string;
  productId: string;
  n: number;
}) {
  return (
    <form
      action={removePackCard}
      onSubmit={(e) => {
        if (
          !confirm(
            `Supprimer la carte ${n} ? Si elle est déjà imprimée, son QR code ne marchera plus.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={productId} />
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="n" value={n} />
      <button type="submit" className="text-xs font-bold text-riso-orange hover:underline">
        Supprimer
      </button>
    </form>
  );
}
