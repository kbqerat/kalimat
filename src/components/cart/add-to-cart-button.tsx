"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/components/cart/cart-context";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  item,
  labelAdd,
  labelAdded,
  labelOut,
  soldOut = false,
  size = "md",
  tone = "primary",
}: {
  item: Omit<CartItem, "qty">;
  labelAdd: string;
  labelAdded: string;
  labelOut: string;
  soldOut?: boolean;
  size?: "sm" | "md";
  /** "ghost" when a stronger button (Buy now) sits next to it. */
  tone?: "primary" | "ghost";
}) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const base = size === "sm" ? "btn w-full !py-2 !text-sm" : "btn w-full";

  if (soldOut) {
    return (
      <button disabled className={cn(base, "btn-ghost")}>
        {labelOut}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        add(item, 1);
        setJustAdded(true);
        window.setTimeout(() => setJustAdded(false), 1400);
      }}
      className={cn(base, justAdded ? "btn-brand" : tone === "ghost" ? "btn-ghost" : "btn-primary")}
    >
      {justAdded ? `✓ ${labelAdded}` : labelAdd}
    </button>
  );
}
