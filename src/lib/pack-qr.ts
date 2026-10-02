import "server-only";

import { headers } from "next/headers";

/**
 * What a printed card's QR code encodes. No locale prefix on purpose: the
 * proxy sends each visitor to their own language.
 */
export function listenUrl(origin: string, slug: string, n: number): string {
  return `${origin}/ecoute/${slug}/${n}`;
}

/**
 * The site's public origin as the current request sees it — so QR codes
 * downloaded from the live admin point at the live domain.
 */
export async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
