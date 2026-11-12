DROP POLICY IF EXISTS "anyone records activity" ON public.device_events;
REVOKE INSERT ON public.device_events FROM anon, authenticated;

DROP POLICY IF EXISTS "anyone can record a security event" ON public.security_events;
CREATE POLICY "clients record limited auth failure events" ON public.security_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    kind IN ('sign_in_failed', 'google_sign_in_failed')
    AND severity IN ('info', 'warning')
    AND (user_id IS NULL OR user_id = auth.uid())
    AND (detail IS NULL OR char_length(detail) <= 500)
    AND (email IS NULL OR char_length(email) <= 320)
    AND (path IS NULL OR char_length(path) <= 300)
    AND (user_agent IS NULL OR char_length(user_agent) <= 400)
  );