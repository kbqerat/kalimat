# Kalimat — flashcard store

Risograph-printed language-learning flashcard decks. Cash on delivery, Morocco.
Next.js 16 (App Router) · Tailwind v4 · Supabase (pending) · deploy on Vercel.

## Run

```bash
npm install
cp .env.example .env.local   # already present for dev
npm run dev                  # http://localhost:3000  -> redirects to /fr
```

The app runs with **no external services**: a local seed catalogue
(`src/lib/data/seed.ts`) and an in-memory order store. Orders placed in dev are
visible in the admin until the server restarts.

## Structure

| Path | What |
| --- | --- |
| `src/app/[lang]/(storefront)/` | Public store — home, `/decks`, `/decks/[slug]`, `/cart`, `/checkout`, `/order/[ref]` |
| `src/app/[lang]/admin/` | Password-gated admin — orders, decks CRUD, settings |
| `src/proxy.ts` | Locale routing (Next 16 renamed middleware → proxy) |
| `src/i18n/` | `fr` (default) · `ar` (RTL) · `en` dictionaries + helpers |
| `src/lib/data/` | Data layer. Mock now; swap the `USING_SUPABASE` branches later |
| `src/lib/site.ts` | `SITE_NAME`, shipping fees, city list — **placeholder brand lives here** |
| `src/db/schema.sql` | Supabase schema + `place_order()` transaction, run when the project exists |

## Admin

`/{lang}/admin` → login with `ADMIN_PASSWORD` (`.env`, default `kalimat`).
Session is a 12h signed cookie (`ADMIN_SESSION_SECRET`).

## Connecting Supabase (later)

1. Create the project, run `src/db/schema.sql` in the SQL editor.
2. Put `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (and Vercel env).
3. Replace the `TODO` branches in `src/lib/data/index.ts` with Supabase queries.
   Everything is already behind that module — no page changes needed.

## Design

"Riso print shop" system in `src/app/globals.css` — paper/ink + spot-ink tokens,
grain overlay, halftone, crop marks, misregistration hover, card-flip. Fonts:
Archivo Black (display), Readex Pro (body + Arabic), Space Mono (captions).
