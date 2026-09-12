"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, checkPassword, issueToken } from "@/lib/admin-auth";
import { safeLocale } from "@/i18n/config";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export interface LoginState {
  error?: string;
}

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const lang = safeLocale(formData.get("lang"));

  const ip = await clientIp();
  if (!rateLimit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS)) {
    return { error: "Trop de tentatives. Réessaie dans quelques minutes." };
  }

  if (!checkPassword(password)) {
    return { error: "Mot de passe incorrect." };
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, issueToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
    secure: process.env.NODE_ENV === "production",
  });

  redirect(`/${lang}/admin`);
}

export async function logout(formData: FormData) {
  const lang = safeLocale(formData.get("lang"));
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect(`/${lang}/admin/login`);
}
