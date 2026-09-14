import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/login-form";
import { isAdmin } from "@/lib/admin-auth";
import { safeLocale } from "@/i18n/config";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (await isAdmin()) redirect(`/${safeLocale(lang)}/admin`);
  const settings = await getSettings();

  return (
    <div className="grid min-h-screen place-items-center bg-paper px-[var(--page-margin)]">
      <div className="w-full max-w-sm">
        <div className="crop-frame border-2 border-ink bg-paper p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-soft">
            {settings.siteName} · Atelier
          </p>
          <h1 className="mt-2 font-display text-3xl uppercase tracking-tight">
            Administration
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Espace réservé à la gestion des jeux et des commandes.
          </p>
          <div className="mt-6">
            <AdminLoginForm lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}
