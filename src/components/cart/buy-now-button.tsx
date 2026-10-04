"use client";

import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/components/cart/cart-context";
import { cn } from "@/lib/utils";

/** Puts the product in the cart (once) and goes straight to checkout. */
export function BuyNowButton({
  item,
  label,
  checkoutHref,
  size = "md",
  className,
}: {
  item: Omit<CartItem, "qty">;
  label: string;
  checkoutHref: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const { items, add } = useCart();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (!items.some((i) => i.productId === item.productId)) add(item, 1);
        router.push(checkoutHref);
      }}
      className={cn("btn btn-primary w-full", size === "sm" && "!py-2 !text-sm", className)}
    >
      {label}
    </button>
  );
}
