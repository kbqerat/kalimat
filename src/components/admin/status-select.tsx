"use client";

import { useRef } from "react";
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

export function StatusSelect({
  refCode,
  lang,
  value,
}: {
  refCode: string;
  lang: string;
  value: OrderStatus;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={updateOrderStatus} className="inline-block">
      <input type="hidden" name="ref" value={refCode} />
      <input type="hidden" name="lang" value={lang} />
      <select
        name="status"
        defaultValue={value}
        onChange={() => formRef.current?.requestSubmit()}
        className={`border-2 border-ink px-2 py-1 font-mono text-[11px] uppercase tracking-widest ${TONE[value]}`}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </form>
  );
}
