-- Harden client-originated event ingestion. No production data is modified.
CREATE TABLE IF NOT EXISTS public.event_ingest_limits (
  fingerprint text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  event_count integer NOT NULL DEFAULT 0
);
REVOKE ALL ON public.event_ingest_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.event_ingest_limits TO service_role;

CREATE OR REPLACE FUNCTION public.guard_event_ingest()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_headers jsonb;
  v_ip text;
  v_fingerprint text;
  v_limit integer;
  v_count integer;
BEGIN
  IF TG_TABLE_NAME = 'security_events' THEN
    IF NEW.kind NOT IN ('sign_in_failed', 'google_sign_in_failed') THEN
      RETURN NULL;
    END IF;
    v_limit := 10;
    NEW.user_id := auth.uid();
    NEW.severity := CASE WHEN NEW.severity IN ('warning', 'critical') THEN NEW.severity ELSE 'info' END;
    NEW.email := NULLIF(left(lower(trim(COALESCE(NEW.email, ''))), 254), '');
    NEW.detail := NULLIF(left(regexp_replace(COALESCE(NEW.detail, ''), '[[:cntrl:]]', ' ', 'g'), 160), '');
    NEW.user_agent := NULLIF(left(COALESCE(NEW.user_agent, ''), 200), '');
    NEW.path := NULLIF(left(COALESCE(NEW.path, ''), 200), '');
  ELSIF TG_TABLE_NAME = 'device_events' THEN
    IF auth.uid() IS NULL OR NEW.kind <> 'visit' THEN
      RETURN NULL;
    END IF;
    v_limit := 60;
    NEW.user_id := auth.uid();
    NEW.email := NULL;
    NEW.ip := NULL;
    NEW.country := NULL;
    NEW.region := NULL;
    NEW.city := NULL;
    NEW.referrer := NULL;
    NEW.kind := 'visit';
    NEW.user_agent := NULLIF(left(COALESCE(NEW.user_agent, ''), 40), '');
    NEW.platform := CASE WHEN NEW.platform IN ('mobile', 'desktop') THEN NEW.platform ELSE 'other' END;
    NEW.screen := NULL;
    NEW.timezone := NULL;
    NEW.language := NULLIF(left(COALESCE(NEW.language, ''), 30), '');
    NEW.path := CASE WHEN NEW.path IN ('dashboard','subjects','analytics','marks','revision','calendar','achievements','settings','ai') THEN NEW.path ELSE 'other' END;
  ELSE
    RETURN NULL;
  END IF;

  v_headers := COALESCE(NULLIF(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  v_ip := split_part(COALESCE(v_headers->>'x-real-ip', v_headers->>'x-forwarded-for', 'unknown'), ',', 1);
  v_fingerprint := md5(COALESCE(auth.uid()::text, 'anonymous') || ':' || left(v_ip, 80));

  INSERT INTO public.event_ingest_limits (fingerprint, window_started_at, event_count)
  VALUES (v_fingerprint, now(), 1)
  ON CONFLICT (fingerprint) DO UPDATE
    SET event_count = CASE
      WHEN public.event_ingest_limits.window_started_at < now() - interval '1 minute' THEN 1
      ELSE public.event_ingest_limits.event_count + 1
    END,
    window_started_at = CASE
      WHEN public.event_ingest_limits.window_started_at < now() - interval '1 minute' THEN now()
      ELSE public.event_ingest_limits.window_started_at
    END
  RETURNING event_count INTO v_count;

  IF v_count > v_limit THEN
    RETURN NULL;
  END IF;

  NEW.created_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS security_events_guard_ingest ON public.security_events;
CREATE TRIGGER security_events_guard_ingest
  BEFORE INSERT ON public.security_events
  FOR EACH ROW EXECUTE FUNCTION public.guard_event_ingest();

DROP TRIGGER IF EXISTS device_events_guard_ingest ON public.device_events;
CREATE TRIGGER device_events_guard_ingest
  BEFORE INSERT ON public.device_events
  FOR EACH ROW EXECUTE FUNCTION public.guard_event_ingest();

DROP POLICY IF EXISTS "anyone records activity" ON public.device_events;
CREATE POLICY "members record own activity" ON public.device_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
REVOKE INSERT ON public.device_events FROM anon;
GRANT INSERT ON public.device_events TO authenticated;

REVOKE ALL ON FUNCTION public.guard_event_ingest() FROM PUBLIC, anon, authenticated;
