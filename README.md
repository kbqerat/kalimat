# Kalimat — flashcard store

Educational flashcards for children (Arabic · French · English), sold in
Morocco with **cash on delivery**. Guest checkout, prices in MAD, storefront in
French (default), Arabic (RTL) and English, plus a full admin.

Next.js 16 (App Router) · React 19 · Tailwind v4 · Supabase (Postgres + Storage)
· Resend (order emails) · Azure Speech (card audio) · deployed on Vercel.

Live: <https://kalimat-theta.vercel.app>

## Status

Live and taking orders. Done:

- **Storefront** — home, products, collections, product page (gallery, *Buy
  now* straight to checkout, *Add to cart* as secondary), cart, COD checkout,
  order confirmation and order tracking, contact page.
- **Orders** — placed through the `place_order()` transaction (stock is
  decremented atomically) and emailed to the owner with a direct admin link,
  a call button and the customer's number. Orders are confirmed by calling
  the customer. Order lookup and admin login are rate-limited.
- **Admin** — orders (status: pending / confirmed / cancelled, 10 per page,
  delete puts items back in stock), products and collections CRUD with photo
  uploads, editable settings (site name, shipping fee, free-shipping threshold,
  contact email).
- **Audio packs** — any product can be turned into an audio pack: one public
  listen page per card (`/ecoute/<slug>/<n>`) with pre-generated Azure Speech
  MP3s in the three languages, and a ZIP of QR codes for the card designer.
- **Amri · 100 cartes photo** — the printed pack (`amri-photo-80` slug, 100
  cards), all card images, QR'd print PDFs and audio done.
- **Ops** — daily Vercel cron hits `/api/keep-alive` so the Supabase free tier
  doesn't pause.

> [!WARNING]
> Printed QR codes can never change. Never rename the `amri-photo-80` slug,
> remove the `/amri/<n>` redirect, or break `/ecoute/<slug>/<n>` URLs. A pack's
> slug is locked once it has cards. Moving to another domain (e.g. kalimat.ma)
> requires `kalimat-theta.vercel.app` to keep redirecting.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev                  # http://localhost:3000  -> redirects to /fr
```

With no Supabase keys the app still runs: a local seed catalogue
(`src/lib/data/seed.ts`), an in-memory order store, and uploads written to
`public/uploads/`. Orders placed this way disappear on restart.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase. Blank → mock data layer |
| `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | Admin login; 12h signed session cookie |
| `RESEND_API_KEY`, `ORDER_NOTIFY_EMAIL`, `ORDER_NOTIFY_FROM` | New-order email to the owner. Blank → off |
| `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` | Generating listen-page MP3s |
| `CRON_SECRET` | Protects `/api/keep-alive` (set automatically by Vercel cron) |

All of them must also be set in Vercel's project env.

## Scripts

| Command | What |
| --- | --- |
| `npm run db:seed` | Upserts the local catalogue (collections, products, pack cards) into Supabase |
| `npm run db:add-amri` | Adds only the Amri packs, never overwriting admin edits |
| `npm run audio:generate` | Generates missing card MP3s (same as *Générer les audios* in admin). Re-run after editing words |
| `scripts/amri-photo/build.py` | Builds the photo pack's QR'd print PDFs and site images from the designer's files in `incoming/` (gitignored) |
| `scripts/amri/add-qr-codes.py` | Puts real QR codes on the first Amri print PDF |

## Structure

| Path | What |
| --- | --- |
| `src/app/[lang]/(storefront)/` | Public store — `/`, `/products`, `/collections`, `/cart`, `/checkout`, `/order`, `/contact`, `/ecoute/<slug>/<n>`, `/amri/<n>` (permanent redirect) |
| `src/app/[lang]/admin/` | Password-gated admin — orders, products (+ `/cards` for audio packs), collections, settings |
| `src/app/api/` | `admin/packs/[id]/qr` (QR ZIP), `keep-alive` (cron) |
| `src/proxy.ts` | Locale routing (Next 16 renamed middleware → proxy) |
| `src/i18n/` | `fr` · `ar` · `en` dictionaries + helpers |
| `src/lib/data/` | Data layer: Supabase when configured, local seed otherwise. Pack card data in `amri-*.ts` |
| `src/lib/audio.ts`, `pack-audio.ts`, `pack-qr.ts` | Audio clip naming/generation (content-addressed by voice + text) and QR URLs |
| `src/lib/order-notify.ts` | Order email via Resend |
| `src/lib/site.ts` | Brand name, domain, shipping defaults, city list |
| `src/db/schema.sql` | Supabase schema, `place_order()` and dated migrations |

## Setting up Supabase from scratch

1. Create the project and run `src/db/schema.sql` in the SQL editor.
2. Create a public Storage bucket named `uploads` (photos and `audio/`).
3. Fill the Supabase keys in `.env.local` and Vercel.
4. `npm run db:seed`, then `npm run audio:generate`.

## Design

Clean shop look modelled on montessoribox.ma: products + collections, white
cards on a light canvas, brand blue `#2f3aa3`. Tokens in
`src/app/globals.css`; font is Readex Pro (Latin + Arabic).
