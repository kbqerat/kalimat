import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Numbered pagination. `hrefFor(page)` builds the link for a given page —
 * the caller decides which search params to preserve (e.g. `?collection=`).
 */
export function Pagination({
  page,
  totalPages,
  hrefFor,
  prevLabel,
  nextLabel,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  prevLabel: string;
  nextLabel: string;
}) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      <PageLink
        href={page > 1 ? hrefFor(page - 1) : undefined}
        disabled={page <= 1}
        className="px-4"
      >
        ← {prevLabel}
      </PageLink>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-2 text-sm text-ink-soft">
            …
          </span>
        ) : (
          <PageLink
            key={p}
            href={hrefFor(p)}
            active={p === page}
            className="h-10 w-10 justify-center px-0"
          >
            {p}
          </PageLink>
        ),
      )}

      <PageLink
        href={page < totalPages ? hrefFor(page + 1) : undefined}
        disabled={page >= totalPages}
        className="px-4"
      >
        {nextLabel} →
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  active,
  disabled,
  className,
  children,
}: {
  href?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const base = cn(
    "inline-flex h-10 items-center rounded-full text-sm font-semibold transition-colors",
    active
      ? "bg-brand text-white"
      : disabled
        ? "text-ink-soft/40"
        : "text-ink hover:bg-paper-deep",
    className,
  );

  if (!href) return <span className={base}>{children}</span>;
  return (
    <Link href={href} className={base}>
      {children}
    </Link>
  );
}

/** Page numbers to show, with "…" gaps — always keeps first, last, and a window around `page`. */
function pageWindow(page: number, totalPages: number): (number | "…")[] {
  const span = 1;
  const out: (number | "…")[] = [];
  const add = (p: number | "…") => out.push(p);

  const low = Math.max(2, page - span);
  const high = Math.min(totalPages - 1, page + span);

  add(1);
  if (low > 2) add("…");
  for (let p = low; p <= high; p++) add(p);
  if (high < totalPages - 1) add("…");
  if (totalPages > 1) add(totalPages);

  return out;
}
