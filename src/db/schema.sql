-- ============================================================
--  Supabase schema — educational products shop
--  Run in the Supabase SQL editor once the project exists, then
--  fill NEXT_PUBLIC_SUPABASE_URL / keys in .env.local and swap the
--  TODO branches in src/lib/data/index.ts for real queries.
--
--  Collections are managed from the admin (create / edit / delete).
--  A product belongs to at most one collection.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- collections ----------
create table if not exists collections (
  slug        text primary key,
  name        jsonb not null,               -- { fr, ar, en }
  blurb       jsonb not null default '{}'::jsonb,
  image       text,                         -- /uploads/collections/xxx.jpg
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists collections_order_idx on collections (sort_order);

alter table collections enable row level security;
create policy "public reads collections" on collections for select using (true);

-- ---------- products ----------
create table if not exists products (
  id              text primary key default ('prd_' || replace(gen_random_uuid()::text, '-', '')),
  slug            text unique not null,
  type            text not null,            -- cards | box | poster | pack | activity | syllables
  collection_slug text references collections (slug) on delete set null,
  price_mad       integer not null,
  compare_at_mad  integer,
  stock           integer not null default 0,
  rating          numeric(3,2) not null default 5,       -- 0.00 – 5.00
  rating_count    integer not null default 0,
  sales_count     integer not null default 0,
  card_count      integer,                  -- optional, for cards/packs
  title           jsonb not null,           -- { fr, ar, en }
  tagline         jsonb not null default '{}'::jsonb,
  description     jsonb not null default '{}'::jsonb,
  highlights      jsonb not null default '[]'::jsonb,    -- [{ fr, ar, en }]
  images          jsonb not null default '[]'::jsonb,    -- ["/uploads/products/x.jpg"]
  featured        boolean not null default false,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);
create index if not exists products_active_idx on products (is_active, created_at desc);
create index if not exists products_collection_idx on products (collection_slug);

-- ---------- orders ----------
create type order_status as enum
  ('pending', 'confirmed', 'cancelled');

create table if not exists orders (
  id             uuid primary key default gen_random_uuid(),
  ref            text unique not null,      -- e.g. KAL-7F3Q2
  status         order_status not null default 'pending',
  customer_name  text not null,
  phone          text not null,
  city           text not null,
  address        text not null,
  note           text,
  subtotal_mad   integer not null,
  shipping_mad   integer not null,
  total_mad      integer not null,
  created_at     timestamptz not null default now()
);
create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists orders_status_idx on orders (status);

create table if not exists order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references orders (id) on delete cascade,
  product_id      text not null references products (id),
  product_title   text not null,            -- snapshot at purchase time
  slug            text not null,
  unit_price_mad  integer not null,
  qty             integer not null check (qty > 0)
);
create index if not exists order_items_order_idx on order_items (order_id);

-- ---------- settings (single row) ----------
create table if not exists settings (
  id                       integer primary key default 1 check (id = 1),
  shipping_flat_mad        integer not null default 25,
  free_shipping_threshold  integer not null default 180,
  store_phone              text,
  updated_at               timestamptz not null default now()
);
insert into settings (id) values (1) on conflict (id) do nothing;

-- Migration (2026-09-14): editable shop name / contact fields, admin
-- "Réglages" page. Safe to re-run — for an existing project, run this
-- block once in the Supabase SQL editor.
alter table settings add column if not exists site_name text;
alter table settings add column if not exists contact_email text;
alter table settings add column if not exists whatsapp_number text;
update settings set
  site_name = coalesce(site_name, 'Kalimat'),
  store_phone = coalesce(store_phone, '+212 6 00 00 00 00'),
  contact_email = coalesce(contact_email, 'Medamri4848@gmail.com'),
  whatsapp_number = coalesce(whatsapp_number, '212600029060')
where id = 1;

-- ---------- place-order transaction ----------
-- Creates an order + items and decrements stock atomically.
create or replace function place_order(
  p_ref text,
  p_customer_name text,
  p_phone text,
  p_city text,
  p_address text,
  p_note text,
  p_items jsonb          -- [{ "product_id": "...", "qty": 2 }, ...]
) returns text
language plpgsql
as $$
declare
  v_order_id uuid;
  v_subtotal integer := 0;
  v_shipping integer;
  v_item jsonb;
  v_product products%rowtype;
  v_free_threshold integer;
  v_flat integer;
begin
  select free_shipping_threshold, shipping_flat_mad
    into v_free_threshold, v_flat from settings where id = 1;

  insert into orders (ref, customer_name, phone, city, address, note,
                      subtotal_mad, shipping_mad, total_mad)
  values (p_ref, p_customer_name, p_phone, p_city, p_address, nullif(p_note, ''),
          0, 0, 0)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from products
      where id = (v_item->>'product_id') and is_active for update;
    if not found then
      raise exception 'product % unavailable', v_item->>'product_id';
    end if;
    if v_product.stock < (v_item->>'qty')::int then
      raise exception 'product % out of stock', v_product.slug;
    end if;

    update products set stock = stock - (v_item->>'qty')::int where id = v_product.id;

    insert into order_items (order_id, product_id, product_title, slug, unit_price_mad, qty)
    values (v_order_id, v_product.id, v_product.title->>'fr', v_product.slug,
            v_product.price_mad, (v_item->>'qty')::int);

    v_subtotal := v_subtotal + v_product.price_mad * (v_item->>'qty')::int;
  end loop;

  v_shipping := case when v_subtotal >= v_free_threshold then 0 else v_flat end;
  update orders set subtotal_mad = v_subtotal,
                    shipping_mad = v_shipping,
                    total_mad = v_subtotal + v_shipping
   where id = v_order_id;

  return p_ref;
end;
$$;

-- ---------- Row Level Security ----------
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table settings enable row level security;

-- Public can read active products only.
create policy "public reads active products" on products
  for select using (is_active = true);

-- Everything else (writes, order reads, settings) goes through the
-- service-role key from server code, which bypasses RLS. No anon policies.

-- Migration (2026-10-02): audio packs. A product with `audio_enabled` gets
-- public listen pages at /ecoute/<slug>/<n>, one per card; each printed
-- card carries a QR code to its page. Safe to re-run — for an existing
-- project, run this block once in the Supabase SQL editor.
alter table products add column if not exists audio_enabled boolean not null default false;

create table if not exists pack_cards (
  product_id  text not null references products (id) on delete cascade,
  n           integer not null check (n > 0),   -- number printed on the card
  word        jsonb not null,                    -- { ar, fr, en }
  sentence    jsonb,                             -- { ar, fr, en }, optional
  image       text,                              -- /uploads/cards/xxx.webp
  primary key (product_id, n)
);

alter table pack_cards enable row level security;
-- No anon policies: read and written from server code with the service role.
