"use client";

import Link from "next/link";
import { useState } from "react";

export function MobileNav({
  menuLabel,
  closeLabel,
  productsHref,
  productsLabel,
  contactHref,
  contactLabel,
  collectionsHref,
  collectionsLabel,
  collectionLinks,
  trackHref,
  trackLabel,
}: {
  menuLabel: string;
  closeLabel: string;
  productsHref: string;
  productsLabel: string;
  contactHref: string;
  contactLabel: string;
  collectionsHref: string;
  collectionsLabel: string;
  collectionLinks: { href: string; label: string }[];
  trackHref: string;
  trackLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? closeLabel : menuLabel}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink"
      >
        {open ? (
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4l12 12M16 4L4 16" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-line bg-paper shadow-[var(--shadow-soft)]">
          <nav className="mx-auto flex max-w-6xl flex-col px-[var(--page-margin)] py-2 text-sm font-semibold text-ink">
            <Link href={productsHref} onClick={close} className="border-b border-line py-3">
              {productsLabel}
            </Link>
            <Link href={contactHref} onClick={close} className="border-b border-line py-3">
              {contactLabel}
            </Link>
            {collectionLinks.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={close}
                className="border-b border-line py-3 font-normal text-ink-soft"
              >
                {c.label}
              </Link>
            ))}
            <Link href={collectionsHref} onClick={close} className="border-b border-line py-3 text-brand">
              {collectionsLabel} →
            </Link>
            <Link href={trackHref} onClick={close} className="flex items-center gap-1.5 py-3 text-brand">
              📦 {trackLabel}
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
