-- ============ 1. Richer profiles + moderation ============
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS mobile text,
  ADD COLUMN IF NOT EXISTS school text,
  ADD COLUMN IF NOT EXISTS grade text,
  ADD COLUMN IF NOT EXISTS guardian_name text,
  ADD COLUMN IF NOT EXISTS guardian_phone text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspended_reason text,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- Admins get full control over student records
DROP POLICY IF EXISTS "admins update any profile" ON public.profiles;
CREATE POLICY "admins update any profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins delete any profile" ON public.profiles;
CREATE POLICY "admins delete any profile" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can clean up / correct student data
DROP POLICY IF EXISTS "admins manage sessions" ON public.study_sessions;
CREATE POLICY "admins manage sessions" ON public.study_sessions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage marks" ON public.marks;
CREATE POLICY "admins manage marks" ON public.marks
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage chapters" ON public.chapters;
CREATE POLICY "admins manage chapters" ON public.chapters
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admins can grant / revoke roles
DROP POLICY IF EXISTS "admins insert roles" ON public.user_roles;
CREATE POLICY "admins insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins delete roles" ON public.user_roles;
CREATE POLICY "admins delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

GRANT INSERT, DELETE ON public.user_roles TO authenticated;

-- ============ 2. Device / activity log ============
CREATE TABLE IF NOT EXISTS public.device_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  kind text NOT NULL DEFAULT 'visit',
  ip text,
  country text,
  region text,
  city text,
  user_agent text,
  platform text,
  screen text,
  timezone text,
  language text,
  path text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.device_events TO anon, authenticated;
GRANT SELECT, DELETE ON public.device_events TO authenticated;
GRANT ALL ON public.device_events TO service_role;

ALTER TABLE public.device_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone records activity" ON public.device_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "admins read activity" ON public.device_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins clear activity" ON public.device_events
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS device_events_user_idx ON public.device_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS device_events_created_idx ON public.device_events (created_at DESC);

-- ============ 3. Site settings (single row) ============
CREATE TABLE IF NOT EXISTS public.site_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  maintenance_mode boolean NOT NULL DEFAULT false,
  maintenance_message text NOT NULL DEFAULT 'Study Radar is briefly down for maintenance. Please try again in a few minutes.',
  signups_enabled boolean NOT NULL DEFAULT true,
  google_login_enabled boolean NOT NULL DEFAULT true,
  announcement text,
  announcement_active boolean NOT NULL DEFAULT false,
  max_writes_per_minute integer NOT NULL DEFAULT 60,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "everyone reads settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "admins write settings" ON public.site_settings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins seed settings" ON public.site_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;