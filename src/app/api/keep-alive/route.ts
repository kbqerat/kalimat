import { supabaseAdmin } from "@/lib/supabase";

/**
 * Hit daily by a Vercel cron (see vercel.json). Supabase pauses free-tier
 * projects after 7 days without database activity, and the storefront is
 * statically cached, so a quiet week of traffic would otherwise pause it.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { error } = await supabaseAdmin
    .from("products")
    .select("id", { head: true, count: "exact" })
    .limit(1);

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true, at: new Date().toISOString() });
}
