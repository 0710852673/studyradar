import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowed = new Set([
  "sign_in_failed",
  "google_sign_in_failed",
  "sign_in_success",
  "sign_up_failed",
  "sign_up_success",
]);
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function sourceIp(req: Request) {
  // Supabase's edge gateway appends the remote address to X-Forwarded-For.
  // Use the final hop to avoid trusting a client-supplied leading value.
  const forwarded = req.headers.get("x-forwarded-for");
  const candidate = forwarded?.split(",").map((part) => part.trim()).filter(Boolean).at(-1)
    ?? req.headers.get("x-real-ip")?.trim()
    ?? "";
  if (!candidate || candidate.length > 64 || !/^[0-9a-fA-F:.]+$/.test(candidate)) return null;
  return candidate;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const ip = sourceIp(req);
  if (!ip) return json({ ok: true, recorded: false, reason: "Trusted source IP unavailable" });

  let body: { kind?: unknown };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const kind = typeof body.kind === "string" ? body.kind : "";
  if (!allowed.has(kind)) return json({ error: "Unsupported security event" }, 400);

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !service) return json({ error: "Security logger is not configured" }, 503);

  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  // Public unauthenticated attempts are accepted only for the allow-listed auth events.
  // A user ID is attached only when the bearer token independently verifies.
  let userId: string | null = null;
  const authorization = req.headers.get("Authorization");
  if (authorization?.startsWith("Bearer ")) {
    const authClient = createClient(url, anon, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await authClient.auth.getUser();
    userId = data.user?.id ?? null;
  }

  const { count } = await admin.from("security_ip_events").select("id", { count: "exact", head: true })
    .eq("ip_address", ip).gte("created_at", new Date(Date.now() - 60_000).toISOString());
  if ((count ?? 0) >= 20) return json({ ok: true, recorded: false, reason: "Rate limited" }, 429);

  await admin.from("security_ip_events").delete().lt("created_at", new Date(Date.now() - 30 * 86400_000).toISOString());
  const { error } = await admin.from("security_ip_events").insert({
    user_id: userId,
    event_kind: kind,
    ip_address: ip,
  });
  if (error) return json({ error: "Security event could not be stored" }, 500);
  return json({ ok: true, recorded: true });
});
