import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The admin UI is French-only, regardless of the `[lang]` URL segment used
  // to get here (e.g. an admin link opened from the Arabic storefront) — so
  // it must stay left-to-right even when the root <html> is dir="rtl".
  return (
    <div dir="ltr" lang="fr" className="min-h-screen bg-paper">
      {children}
    </div>
  );
}
