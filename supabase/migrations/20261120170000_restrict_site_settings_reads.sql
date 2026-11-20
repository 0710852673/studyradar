-- Keep the full site_settings row private to administrators.
-- Public clients receive only the fields required to render the site through a fixed RPC.
DROP POLICY IF EXISTS "signed-in users read settings" ON public.site_settings;

CREATE POLICY "admins read settings"
ON public.site_settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.get_public_site_settings()
RETURNS TABLE (
  maintenance_mode boolean,
  maintenance_message text,
  signups_enabled boolean,
  google_login_enabled boolean,
  announcement text,
  announcement_active boolean,
  max_writes_per_minute integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    settings.maintenance_mode,
    settings.maintenance_message,
    settings.signups_enabled,
    settings.google_login_enabled,
    settings.announcement,
    settings.announcement_active,
    settings.max_writes_per_minute
  FROM public.site_settings AS settings
  WHERE settings.id = true
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_site_settings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_site_settings() TO anon, authenticated;
