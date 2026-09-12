import {
  FREE_SHIPPING_THRESHOLD_MAD,
  MOROCCAN_CITIES,
  SHIPPING_FLAT_MAD,
  SITE_NAME,
} from "@/lib/site";

export default function AdminSettingsPage() {
  const rows: [string, string][] = [
    ["Nom de la boutique", SITE_NAME],
    ["Frais de livraison", `${SHIPPING_FLAT_MAD} MAD`],
    ["Livraison offerte à partir de", `${FREE_SHIPPING_THRESHOLD_MAD} MAD`],
    ["Villes desservies", `${MOROCCAN_CITIES.length}`],
    ["Paiement", "Espèces à la livraison uniquement"],
  ];

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl uppercase tracking-tight">Réglages</h1>

      <dl className="mt-6 border-2 border-ink">
        {rows.map(([k, v], i) => (
          <div
            key={k}
            className={`flex justify-between gap-4 p-3 ${i > 0 ? "border-t border-ink/30" : ""}`}
          >
            <dt className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
              {k}
            </dt>
            <dd className="text-end text-sm">{v}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 font-mono text-[11px] uppercase leading-relaxed tracking-widest text-ink-soft">
        Ces valeurs sont définies dans <code>src/lib/site.ts</code>. Quand Supabase
        sera connecté, elles passeront dans une table <code>settings</code> éditable
        ici.
      </p>
    </div>
  );
}
