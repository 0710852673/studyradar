import { createServerFn } from "@tanstack/react-start";

/** TEMPORARY: provisions demo accounts. Removed after seeding. */
export const seedDemo = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const accounts = [
    { email: "sheharageeneth@gmail.com", password: "12345678", name: "Shehara Geeneth", admin: true },
    { email: "al.demo@studyradar.app", password: "12345678", name: "Nimal Perera (A/L Demo)", admin: false },
    { email: "ol.demo@studyradar.app", password: "12345678", name: "Sanduni Silva (O/L Demo)", admin: false },
  ];

  const out: Record<string, string> = {};

  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
  for (const acc of accounts) {
    const existing = list?.users.find((u) => u.email === acc.email);
    if (existing) {
      await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password: acc.password,
        email_confirm: true,
        user_metadata: { name: acc.name },
      });
      out[acc.email] = existing.id;
    } else {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true,
        user_metadata: { name: acc.name },
      });
      if (error) throw new Error(`${acc.email}: ${error.message}`);
      out[acc.email] = data.user!.id;
    }
  }

  return out;
});
