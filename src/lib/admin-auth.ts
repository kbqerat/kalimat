import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeLocale } from "@/i18n/config";

export const ADMIN_COOKIE = "kal_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12h

/**
 * Falls back to an insecure dev default so local setup works out of the
 * box — but in production a missing env var must fail loudly, not silently
 * reopen the well-known default password/secret from source control.
 */
function requireEnv(name: string, devFallback: string): string {
  const value = process.env[name];
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `${name} is not set. Add it in your hosting provider's project settings before the admin area can be used in production.`,
    );
  }
  return devFallback;
}

function secret(): string {
  return requireEnv("ADMIN_SESSION_SECRET", "dev-insecure-secret-change-me");
}

export function adminPassword(): string {
  return requireEnv("ADMIN_PASSWORD", "kalimat");
}

/**
 * Constant-time password check. Hashing both sides to a fixed-length digest
 * before comparing means `timingSafeEqual` never sees mismatched lengths, so
 * neither the password's length nor its content leaks through timing.
 */
export function checkPassword(candidate: string): boolean {
  const a = createHmac("sha256", secret()).update(candidate).digest();
  const b = createHmac("sha256", secret()).update(adminPassword()).digest();
  return timingSafeEqual(a, b);
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

/** Token shape: `<expiryMs>.<hmac>` */
export function issueToken(): string {
  const exp = String(Date.now() + SESSION_TTL_MS);
  return `${exp}.${sign(exp)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [exp, mac] = token.split(".");
  if (!exp || !mac) return false;
  if (Number(exp) < Date.now()) return false;
  const expected = sign(exp);
  try {
    return timingSafeEqual(Buffer.from(mac), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(ADMIN_COOKIE)?.value);
}

/** Redirects to the admin login page when the session is missing or expired. */
export async function requireAdmin(lang: string): Promise<void> {
  if (!(await isAdmin())) redirect(`/${safeLocale(lang)}/admin/login`);
}

/** Where to go after logging in: an admin path from `?next=`, else the dashboard. */
export function safeNext(raw: unknown, lang: string): string {
  const next = typeof raw === "string" ? raw : "";
  return /^\/(fr|ar|en)\/admin(\/[\w\-/]*)?$/.test(next) ? next : `/${lang}/admin`;
}
