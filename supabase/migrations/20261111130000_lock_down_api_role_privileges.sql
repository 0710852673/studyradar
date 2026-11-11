-- Lock down API-role privileges that bypass or undermine row-level security.
-- TRUNCATE is not protected by RLS. The live schema audit found it granted to
-- both anon and authenticated on every public table.

REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;
REVOKE REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;
REVOKE UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon;

-- No client writes are needed for durable award, referral, or audit tables.
REVOKE INSERT, UPDATE, DELETE ON TABLE
  public.achievement_awards,
  public.admin_audit_events,
  public.referral_codes,
  public.referral_signups
FROM PUBLIC, anon, authenticated;

-- Client activity and security events are append-only from the browser.
-- Restrict inserts to the exact fields used by the client; IP, location,
-- email and account attribution fields on device_events remain server-only.
REVOKE INSERT ON TABLE public.device_events FROM PUBLIC, anon, authenticated;
GRANT INSERT (kind, path, platform, user_agent)
  ON TABLE public.device_events TO anon, authenticated;

REVOKE INSERT ON TABLE public.security_events FROM PUBLIC, anon, authenticated;
GRANT INSERT (user_id, kind, severity, email, detail, user_agent, path)
  ON TABLE public.security_events TO anon, authenticated;

REVOKE UPDATE ON TABLE public.device_events FROM PUBLIC, anon, authenticated;
REVOKE DELETE ON TABLE public.device_events FROM PUBLIC, anon;
REVOKE UPDATE, DELETE ON TABLE public.security_events FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "anyone records activity" ON public.device_events;
CREATE POLICY "visitors record coarse activity"
  ON public.device_events FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "anyone can record a security event" ON public.security_events;
CREATE POLICY "visitors record own security events"
  ON public.security_events FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Keep future public tables from inheriting the same unsafe privileges.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE UPDATE, DELETE ON TABLES FROM PUBLIC, anon;
