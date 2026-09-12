"use server";

import { z } from "zod";
import { isValidMoroccanPhone, normalizeMoroccanPhone } from "@/lib/format";
import { createOrder } from "@/lib/data";

const schema = z.object({
  customerName: z.string().trim().min(2).max(80),
  phone: z.string().trim().refine(isValidMoroccanPhone),
  // Free text — suggested via autocomplete, but any city name is accepted.
  city: z.string().trim().min(2).max(60),
  address: z.string().trim().min(10).max(400),
  note: z.string().trim().max(300).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(20),
});

export type SubmitOrderResult =
  | { ok: true; ref: string }
  | { ok: false; field?: "name" | "phone" | "city" | "address" | "cart"; error: string };

export async function submitOrder(raw: unknown): Promise<SubmitOrderResult> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const path = parsed.error.issues[0]?.path[0];
    const field =
      path === "customerName"
        ? "name"
        : path === "phone"
          ? "phone"
          : path === "city"
            ? "city"
            : path === "address"
              ? "address"
              : path === "items"
                ? "cart"
                : undefined;
    return { ok: false, field, error: "invalid" };
  }

  const data = parsed.data;
  const result = await createOrder({
    customerName: data.customerName,
    phone: normalizeMoroccanPhone(data.phone),
    city: data.city,
    address: data.address,
    note: data.note || undefined,
    items: data.items,
  });

  if (!result.ok) {
    return {
      ok: false,
      field: result.error === "empty" ? "cart" : undefined,
      error: result.error,
    };
  }
  return { ok: true, ref: result.ref };
}
