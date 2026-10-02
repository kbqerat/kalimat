import { strToU8, zipSync } from "fflate";
import QRCode from "qrcode";
import { isAdmin } from "@/lib/admin-auth";
import { getPackCards, getProductById } from "@/lib/data";
import { listenUrl, requestOrigin } from "@/lib/pack-qr";

/**
 * Downloads a pack's QR codes as a ZIP for the card designer: one vector
 * SVG per card (`qr-001.svg` …) plus `liens.csv` listing what each encodes.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const product = await getProductById(id);
  if (!product?.audioEnabled) return new Response("Not found", { status: 404 });
  const cards = await getPackCards(id);
  if (cards.length === 0) return new Response("Ce pack n’a pas encore de cartes.", { status: 404 });

  const origin = await requestOrigin();
  const width = String(Math.max(3, String(cards[cards.length - 1].n).length));
  const files: Record<string, Uint8Array> = {};
  const csv = ["numero;lien;francais"];

  for (const card of cards) {
    const url = listenUrl(origin, product.slug, card.n);
    // Level M survives a scuffed or slightly blurred print; a 1-module
    // margin keeps it compact — leave white space around it in the design.
    const svg = await QRCode.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 1 });
    files[`qr-${String(card.n).padStart(Number(width), "0")}.svg`] = strToU8(svg);
    csv.push(`${card.n};${url};${card.word.fr.replaceAll(";", ",")}`);
  }
  files["liens.csv"] = strToU8("﻿" + csv.join("\n")); // BOM so Excel reads UTF-8

  const zip = zipSync(files, { level: 6 });
  return new Response(zip, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="qr-${product.slug}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
