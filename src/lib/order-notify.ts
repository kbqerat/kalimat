import "server-only";

import { getOrderByRef } from "@/lib/data";
import type { Order } from "@/lib/data/types";
import { formatMad } from "@/lib/format";

/**
 * Emails the shop owner when a customer places an order, with a link
 * straight to the order in the admin. Sent through Resend's HTTP API.
 *
 * Off until RESEND_API_KEY and ORDER_NOTIFY_EMAIL are set. Without a domain
 * verified in Resend, mail can only come from `onboarding@resend.dev` and go
 * to the Resend account's own address — enough for notifying the owner.
 */

const API_KEY = process.env.RESEND_API_KEY;
const TO = process.env.ORDER_NOTIFY_EMAIL;
const FROM = process.env.ORDER_NOTIFY_FROM || "Kalimat <onboarding@resend.dev>";

/** Never throws: a failed email must not affect the order. */
export async function notifyNewOrder(ref: string, origin: string): Promise<void> {
  if (!API_KEY || !TO) return;
  try {
    const order = await getOrderByRef(ref);
    if (!order) return;

    const target = `/fr/admin/orders/${order.ref}`;
    const link = `${origin}/fr/admin/login?next=${encodeURIComponent(target)}`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: TO.split(",").map((s) => s.trim()),
        subject: `Nouvelle commande ${order.ref} — ${formatMad(order.totalMad, "fr")}`,
        html: html(order, link),
        text: text(order, link),
      }),
    });
    if (!res.ok) console.error("Order email failed:", res.status, await res.text());
  } catch (err) {
    console.error("Order email failed:", err);
  }
}

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

function text(o: Order, link: string): string {
  return [
    `Nouvelle commande ${o.ref}`,
    "",
    `Client : ${o.customerName}`,
    `Téléphone : ${o.phone}`,
    `Ville : ${o.city}`,
    `Adresse : ${o.address}`,
    ...(o.note ? [`Note : ${o.note}`] : []),
    "",
    ...o.items.map((i) => `${i.qty} × ${i.productTitle} — ${formatMad(i.unitPriceMad * i.qty, "fr")}`),
    `Livraison : ${o.shippingMad ? formatMad(o.shippingMad, "fr") : "gratuite"}`,
    `Total : ${formatMad(o.totalMad, "fr")}`,
    "",
    `Appeler le client : ${o.phone}`,
    `Voir la commande : ${link}`,
  ].join("\n");
}

function html(o: Order, link: string): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">${label}</td><td style="padding:4px 0">${value}</td></tr>`;
  const items = o.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${i.qty} × ${esc(i.productTitle)}</td><td style="padding:6px 0;text-align:right;white-space:nowrap">${formatMad(i.unitPriceMad * i.qty, "fr")}</td></tr>`,
    )
    .join("");

  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:520px;margin:0 auto;color:#111827;font-size:15px;line-height:1.5">
  <h1 style="font-size:20px;margin:0 0 4px">Nouvelle commande ${esc(o.ref)}</h1>
  <p style="margin:0 0 20px;color:#6b7280">Paiement à la livraison · ${formatMad(o.totalMad, "fr")}</p>
  <table style="border-collapse:collapse;margin-bottom:20px">
    ${row("Client", esc(o.customerName))}
    ${row("Téléphone", `<a href="tel:${esc(o.phone)}" style="color:#111827;font-weight:700;font-size:17px;text-decoration:none">${esc(o.phone)}</a>`)}
    ${row("Ville", esc(o.city))}
    ${row("Adresse", esc(o.address))}
    ${o.note ? row("Note", esc(o.note)) : ""}
  </table>
  <table style="border-collapse:collapse;width:100%;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;margin-bottom:8px">${items}</table>
  <table style="border-collapse:collapse;width:100%;margin-bottom:24px">
    <tr><td style="padding:2px 0;color:#6b7280">Livraison</td><td style="text-align:right">${o.shippingMad ? formatMad(o.shippingMad, "fr") : "gratuite"}</td></tr>
    <tr><td style="padding:2px 0;font-weight:700">Total</td><td style="text-align:right;font-weight:700">${formatMad(o.totalMad, "fr")}</td></tr>
  </table>
  <p style="margin:0 0 8px;color:#6b7280;font-size:13px">2e confirmation avec le client :</p>
  <a href="tel:${esc(o.phone)}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:999px">📞 Appeler le client</a>
  <p style="margin:8px 0 24px;font-size:22px;font-weight:700;letter-spacing:0.5px"><a href="tel:${esc(o.phone)}" style="color:#111827;text-decoration:none">${esc(o.phone)}</a></p>
  <a href="${esc(link)}" style="display:inline-block;background:#e53935;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:999px">Voir la commande</a>
</div>`;
}
