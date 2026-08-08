import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/seed-demo")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const accounts = [
          { email: "sheharageeneth@gmail.com", password: "12345678", name: "Shehara Geeneth" },
          { email: "al.demo@studyradar.app", password: "12345678", name: "Nimal Perera" },
          { email: "ol.demo@studyradar.app", password: "12345678", name: "Sanduni Silva" },
        ];
        const out: Record<string, string> = {};
        const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
        for (const acc of accounts) {
          const existing = list?.users.find((u) => u.email === acc.email);
          if (existing) {
            await supabaseAdmin.auth.admin.updateUserById(existing.id, {
              password: acc.password, email_confirm: true, user_metadata: { name: acc.name },
            });
            out[acc.email] = existing.id;
          } else {
            const { data, error } = await supabaseAdmin.auth.admin.createUser({
              email: acc.email, password: acc.password, email_confirm: true,
              user_metadata: { name: acc.name },
            });
            if (error) return new Response(JSON.stringify({ error: acc.email + ": " + error.message }), { status: 500 });
            out[acc.email] = data.user!.id;
          }
        }
        return new Response(JSON.stringify(out), { headers: { "content-type": "application/json" } });
      },
    },
  },
});
