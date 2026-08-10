ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

UPDATE public.profiles p SET is_demo = true
WHERE p.email IN ('al.demo@studyradar.app','ol.demo@studyradar.app');

CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  kind text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  detail text,
  user_agent text,
  path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.security_events TO authenticated;
GRANT INSERT ON public.security_events TO anon;
GRANT ALL ON public.security_events TO service_role;

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can record a security event"
  ON public.security_events FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "admins read security events"
  ON public.security_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS security_events_created_at_idx
  ON public.security_events (created_at DESC);