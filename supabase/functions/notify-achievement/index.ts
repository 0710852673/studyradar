// Outbound achievement email delivery is intentionally disabled in Study Radar 1.0.
// This replacement must be deployed only after owner approval; the currently deployed
// Supabase function, if any, must be deleted manually from the Supabase project.
Deno.serve(() => new Response("Achievement email delivery is disabled.", {
  status: 410,
  headers: {
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "no-store",
  },
}));
