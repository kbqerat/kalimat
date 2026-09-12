import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Server-only client, authenticated with the service-role key. Every query
 * this app makes runs from Server Components / Server Actions, never the
 * browser, so there's no separate anon-key client — RLS is enforced by
 * policy for anything that *could* be queried publicly, and this key
 * bypasses it entirely for the rest (see src/db/schema.sql).
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);
