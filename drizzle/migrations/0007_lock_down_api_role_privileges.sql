REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;
REVOKE UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon;

REVOKE INSERT, UPDATE, DELETE ON TABLE
  public.achievement_awards, public.admin_audit_events,
  public.referral_codes, public.referral_signups
FROM PUBLIC, anon, authenticated;

REVOKE INSERT, UPDATE ON TABLE public.device_events FROM PUBLIC, anon, authenticated;
REVOKE DELETE ON TABLE public.device_events FROM PUBLIC, anon;

REVOKE INSERT, UPDATE, DELETE ON TABLE public.security_events FROM PUBLIC, anon, authenticated;
GRANT INSERT (user_id, kind, severity, email, detail, user_agent, path)
  ON TABLE public.security_events TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE UPDATE, DELETE ON TABLES FROM PUBLIC, anon;

DROP POLICY IF EXISTS "admins delete resources" ON public.resources;
CREATE POLICY "admins delete resources" ON public.resources
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS resources_audit_delete ON public.resources;
CREATE TRIGGER resources_audit_delete AFTER DELETE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.record_admin_audit('Resource deleted');