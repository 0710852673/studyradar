import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]!);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = req.headers.get("Authorization");
  if (!authorization) return json({ error: "Authentication required" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "Supabase function secrets are not configured" }, 500);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser();
  if (authError || !authData.user) return json({ error: "Invalid session" }, 401);

  let awardId = "";
  try {
    const body = await req.json();
    awardId = typeof body?.awardId === "string" ? body.awardId : "";
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }
  if (!awardId) return json({ error: "awardId is required" }, 400);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: award, error: awardError } = await admin
    .from("achievement_awards")
    .select("id, user_id, title, description, email_status")
    .eq("id", awardId)
    .maybeSingle();

  if (awardError || !award) return json({ error: "Achievement not found" }, 404);

  if (award.user_id !== authData.user.id) {
    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", authData.user.id);
    if (!(roles ?? []).some((row) => row.role === "admin")) {
      return json({ error: "Not allowed" }, 403);
    }
  }

  if (award.email_status === "sent") return json({ ok: true, alreadySent: true });

  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM_EMAIL");
  if (!apiKey || !from) {
    return json({
      error: "Email delivery is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.",
    }, 503);
  }

  // Claim only pending/failed rows so two browser tabs cannot send duplicates.
  const { data: claimed, error: claimError } = await admin
    .from("achievement_awards")
    .update({ email_status: "sending" })
    .eq("id", awardId)
    .in("email_status", ["pending", "failed"])
    .select("id")
    .maybeSingle();

  if (claimError) return json({ error: "Could not claim email delivery" }, 500);
  if (!claimed) return json({ ok: true, skipped: true });

  const { data: account, error: accountError } = await admin.auth.admin.getUserById(award.user_id);
  const recipient = account?.user?.email;
  if (accountError || !recipient) {
    await admin.from("achievement_awards").update({ email_status: "failed" }).eq("id", awardId);
    return json({ error: "Student account has no email address" }, 422);
  }

  const title = escapeHtml(award.title);
  const description = escapeHtml(award.description);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      subject: `Study Radar achievement unlocked: ${award.title}`,
      text: `Congratulations! You unlocked "${award.title}" on Study Radar. ${award.description}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#172033"><p style="color:#64748b;font-size:12px;letter-spacing:1px;text-transform:uppercase">Study Radar achievement</p><h1 style="font-size:26px;margin:12px 0">🏆 ${title}</h1><p style="line-height:1.6;color:#475569">${description}</p><p style="margin-top:28px;color:#64748b;font-size:13px">Keep learning, one session at a time.</p></div>`,
    }),
  });

  if (!response.ok) {
    await admin.from("achievement_awards").update({ email_status: "failed" }).eq("id", awardId);
    return json({ error: "Email provider rejected the message" }, 502);
  }

  await admin
    .from("achievement_awards")
    .update({ email_status: "sent", email_sent_at: new Date().toISOString() })
    .eq("id", awardId);
  return json({ ok: true });
});
