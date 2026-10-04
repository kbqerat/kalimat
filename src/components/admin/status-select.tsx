"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/[lang]/admin/(dash)/actions";
import type { OrderStatus } from "@/lib/data/types";

const OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "cancelled", label: "Annulée" },
];

const TONE: Record<OrderStatus, string> = {
  pending: "bg-riso-yellow",
  confirmed: "bg-riso-blue text-paper",
  cancelled: "bg-riso-orange text-paper",
};

/**
 * A controlled select calling the action directly. (Inside a `<form action>`,
 * React resets the fields once the action finishes, so the select showed a
 * stale status until the page was reloaded.)
 */
export function StatusSelect({
  refCode,
  lang,
  value,
}: {
  refCode: string;
  lang: string;
  value: OrderStatus;
}) {
  const [status, setStatus] = useState(value);
  const [synced, setSynced] = useState(value);
  const [pending, startTransition] = useTransition();

  // A fresh value from the server (after revalidation) wins.
  if (value !== synced) {
    setSynced(value);
    setStatus(value);
  }

  const change = (next: OrderStatus) => {
    const previous = status;
    setStatus(next);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("ref", refCode);
      formData.set("lang", lang);
      formData.set("status", next);
      try {
        await updateOrderStatus(formData);
      } catch {
        setStatus(previous);
        alert("Échec de la mise à jour du statut. Réessaie.");
      }
    });
  };

  return (
    <select
      name="status"
      value={status}
      disabled={pending}
      onChange={(e) => change(e.target.value as OrderStatus)}
      className={`border-2 border-ink px-2 py-1 font-mono text-[11px] uppercase tracking-widest disabled:opacity-60 ${TONE[status]}`}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
