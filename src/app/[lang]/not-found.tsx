import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-[var(--page-margin)] text-center">
      <div>
        <p className="font-display text-[clamp(3rem,12vw,7rem)] leading-none text-riso-orange">
          404
        </p>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-ink-soft">
          Page introuvable · الصفحة غير موجودة · Not found
        </p>
        <Link
          href="/fr"
          className="mt-6 inline-block border-2 border-ink px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest hover:bg-riso-yellow"
        >
          ← Accueil
        </Link>
      </div>
    </div>
  );
}
