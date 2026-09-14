import { SettingsForm } from "@/components/admin/settings-form";
import { safeLocale } from "@/i18n/config";
import { getSettings } from "@/lib/data";
import { MOROCCAN_CITIES } from "@/lib/site";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = safeLocale(lang);
  const settings = await getSettings();

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl uppercase tracking-tight">Réglages</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Modifiez ces valeurs et elles s&apos;appliquent immédiatement sur le site — elles
        sont stockées dans la table <code>settings</code> de Supabase.
      </p>

      <div className="mt-6">
        <SettingsForm lang={locale} settings={settings} />
      </div>

      <dl className="mt-8 border-2 border-ink">
        <div className="flex justify-between gap-4 p-3">
          <dt className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
            Villes desservies
          </dt>
          <dd className="text-end text-sm">{MOROCCAN_CITIES.length}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-ink/30 p-3">
          <dt className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
            Paiement
          </dt>
          <dd className="text-end text-sm">Espèces à la livraison uniquement</dd>
        </div>
      </dl>
    </div>
  );
}
