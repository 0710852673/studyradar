-- Security-only source IP records. Never use these rows for product analytics.
CREATE TABLE IF NOT EXISTS public.security_ip_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_kind text NOT NULL CHECK (event_kind IN (
    'sign_in_failed', 'google_sign_in_failed', 'sign_in_success',
    'sign_up_failed', 'sign_up_success'
  )),
  ip_address inet NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS security_ip_events_created_idx
  ON public.security_ip_events (created_at DESC);
CREATE INDEX IF NOT EXISTS security_ip_events_ip_created_idx
  ON public.security_ip_events (ip_address, created_at DESC);

ALTER TABLE public.security_ip_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.security_ip_events FROM anon, authenticated;
GRANT SELECT ON public.security_ip_events TO authenticated;
GRANT ALL ON public.security_ip_events TO service_role;

DROP POLICY IF EXISTS "admins read security ip events" ON public.security_ip_events;
CREATE POLICY "admins read security ip events"
  ON public.security_ip_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Best-effort scheduled purge; the Edge Function also purges expired rows on each write.
DO $$
BEGIN
  EXECUTE $job$
    SELECT cron.schedule(
      'study-radar-security-ip-retention',
      '23 3 * * *',
      'DELETE FROM public.security_ip_events WHERE created_at < now() - interval ''30 days'''
    )
  $job$;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron unavailable; expired IP rows will be purged on the next security event write.';
END $$;
