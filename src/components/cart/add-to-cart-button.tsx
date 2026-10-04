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
  icon,
  className,
}: {
  item: Omit<CartItem, "qty">;
  labelAdd: string;
  labelAdded: string;
  labelOut: string;
  soldOut?: boolean;
  size?: "sm" | "md";
  /** "ghost" when a stronger button (Buy now) sits next to it. */
  tone?: "primary" | "ghost";
  /**
   * Show a cart icon instead of the label, for narrow spots: "always", or
   * "mobile" (the label comes back on large screens).
   */
  icon?: "always" | "mobile";
  className?: string;
}) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const base = cn(size === "sm" ? "btn w-full !py-2 !text-sm" : "btn w-full", className);

  if (soldOut) {
    return (
      <button disabled className={cn(base, "btn-ghost")}>
        {labelOut}
      </button>
    );
  }

  const label = justAdded ? `✓ ${labelAdded}` : labelAdd;

  return (
    <button
      type="button"
      onClick={() => {
        add(item, 1);
        setJustAdded(true);
        window.setTimeout(() => setJustAdded(false), 1400);
      }}
      aria-label={icon ? label : undefined}
      title={icon ? labelAdd : undefined}
      className={cn(
        base,
        justAdded ? "btn-brand" : tone === "ghost" ? "btn-ghost" : "btn-primary",
        icon && "!px-2",
      )}
    >
      {icon ? (
        <>
          <span className={cn("inline-flex items-center", icon === "mobile" && "lg:hidden")}>
            {justAdded ? "✓" : <CartPlusIcon />}
          </span>
          {icon === "mobile" && <span className="hidden lg:inline">{label}</span>}
        </>
      ) : (
        label
      )}
    </button>
  );
}

function CartPlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden className="shrink-0">
      <path
        d="M1 2h2l1.6 8.2a1 1 0 0 0 1 .8h6.1a1 1 0 0 0 1-.8L15 4H4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M9.5 5v4M7.5 7h4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6.5" cy="14" r="1.2" fill="currentColor" />
      <circle cx="12.5" cy="14" r="1.2" fill="currentColor" />
    </svg>
  );
}
