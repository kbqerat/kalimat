"use client";

import { usePathname } from "next/navigation";

/** Listen pages (reached by scanning a card's QR code) stay free of it. */
const HIDDEN_ON = /\/ecoute(\/|$)/;

export function WhatsappButton({
  label,
  whatsappNumber,
}: {
  label: string;
  whatsappNumber: string;
}) {
  const pathname = usePathname() ?? "";
  if (HIDDEN_ON.test(pathname)) return null;

  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="fixed bottom-5 end-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-105 active:scale-95"
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-60"
      />
      <svg width="30" height="30" viewBox="0 0 32 32" fill="currentColor" aria-hidden>
        <path d="M16.02 3C9.4 3 4 8.4 4 15.02c0 2.4.68 4.63 1.85 6.53L4 29l7.62-1.8a12.9 12.9 0 0 0 4.4.77h.01c6.62 0 12.02-5.4 12.02-12.02C28.05 8.4 22.65 3 16.02 3Zm0 22.02h-.01a10 10 0 0 1-5.1-1.4l-.37-.22-4.52 1.07 1.2-4.4-.24-.38a9.9 9.9 0 0 1-1.52-5.27C5.46 9.5 10.24 4.98 16.02 4.98c2.67 0 5.18 1.04 7.07 2.93a9.93 9.93 0 0 1 2.93 7.1c0 5.78-4.78 10.01-10 10.01Zm5.5-7.48c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.24-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.53.07-.8.38-.28.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.13 3.26 5.17 4.57.72.31 1.29.5 1.73.64.73.23 1.39.2 1.91.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.57-.35Z" />
      </svg>
    </a>
  );
}
