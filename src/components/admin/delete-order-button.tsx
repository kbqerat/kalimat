"use client";

import { deleteOrderAction } from "@/app/[lang]/admin/(dash)/actions";
import { cn } from "@/lib/utils";

/** Deletes an order after a confirm; `back` returns to the list afterwards. */
export function DeleteOrderButton({
  refCode,
  lang,
  back = false,
  compact = false,
}: {
  refCode: string;
  lang: string;
  back?: boolean;
  compact?: boolean;
}) {
  return (
    <form
      action={deleteOrderAction}
      onSubmit={(e) => {
        const ok = confirm(
          `Supprimer définitivement la commande ${refCode} ?\nSes articles seront remis en stock.`,
        );
        if (!ok) e.preventDefault();
      }}
      className="inline-block"
    >
      <input type="hidden" name="ref" value={refCode} />
      <input type="hidden" name="lang" value={lang} />
      {back && <input type="hidden" name="back" value="1" />}
      <button
        type="submit"
        title="Supprimer la commande"
        aria-label={`Supprimer la commande ${refCode}`}
        className={cn(
          "border-2 border-riso-orange font-mono text-[11px] uppercase tracking-widest text-riso-orange hover:bg-riso-orange hover:text-paper",
          compact ? "px-2 py-1" : "px-3 py-1",
        )}
      >
        {compact ? "✕" : "Supprimer"}
      </button>
    </form>
  );
}
