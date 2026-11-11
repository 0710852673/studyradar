import { readFileSync } from "node:fs";
import { describe, expect, test } from "bun:test";

const migration = readFileSync(
  new URL("../supabase/migrations/20261111130000_lock_down_api_role_privileges.sql", import.meta.url),
  "utf8",
);

describe("API-role database privilege migration", () => {
  test("revokes TRUNCATE from public API roles on existing and future tables", () => {
    expect(migration).toMatch(/REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated/i);
    expect(migration).toMatch(/ALTER DEFAULT PRIVILEGES IN SCHEMA public\s+REVOKE TRUNCATE/i);
  });

  test("limits browser event inserts to approved fields", () => {
    expect(migration).toMatch(/GRANT INSERT \(kind, path, platform, user_agent\)\s+ON TABLE public\.device_events TO anon, authenticated/i);
    expect(migration).toMatch(/GRANT INSERT \(user_id, kind, severity, email, detail, user_agent, path\)\s+ON TABLE public\.security_events TO anon, authenticated/i);
  });

  test("prevents clients from attributing event rows to other accounts", () => {
    expect(migration).toMatch(/user_id IS NULL OR user_id = auth\.uid\(\)/i);
    expect(migration).toMatch(/REVOKE UPDATE, DELETE ON TABLE public\.security_events FROM PUBLIC, anon, authenticated/i);
  });
});
