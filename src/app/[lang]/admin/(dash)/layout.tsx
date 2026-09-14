import Link from "next/link";
import { logout } from "@/app/[lang]/admin/login/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { getSettings } from "@/lib/data";

export default async function AdminDashLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  await requireAdmin(lang);
  const settings = await getSettings();

  const nav = [
    { href: `/${lang}/admin`, label: "Commandes" },
    { href: `/${lang}/admin/collections`, label: "Collections" },
    { href: `/${lang}/admin/products`, label: "Produits" },
    { href: `/${lang}/admin/settings`, label: "Réglages" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-[var(--page-margin)] py-6">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line pb-4">
        <Link href={`/${lang}/admin`} className="font-display text-lg text-brand">
          {settings.siteName}
          <span className="ms-2 text-xs font-normal text-ink-soft">ADMIN</span>
        </Link>
        <nav className="flex gap-4 text-sm font-semibold text-ink-soft">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-brand">
              {n.label}
            </Link>
          ))}
        </nav>
        <form action={logout} className="ms-auto">
          <input type="hidden" name="lang" value={lang} />
          <button className="rounded-full border border-line px-3 py-1 text-xs hover:bg-paper-deep">
            Quitter
          </button>
        </form>
      </header>

      <main className="py-8">{children}</main>
    </div>
  );
}
