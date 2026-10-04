"use client";

import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/components/cart/cart-context";

/** Puts the product in the cart (once) and goes straight to checkout. */
export function BuyNowButton({
  item,
  label,
  checkoutHref,
}: {
  item: Omit<CartItem, "qty">;
  label: string;
  checkoutHref: string;
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
      className="btn btn-primary w-full"
    >
      {label}
    </button>
  );
}
