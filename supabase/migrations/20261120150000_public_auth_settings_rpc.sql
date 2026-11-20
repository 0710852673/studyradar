-- Expose only the two public authentication switches needed by the sign-in page.
-- The underlying site_settings table remains protected by its existing RLS policies.
CREATE OR REPLACE FUNCTION public.get_public_auth_settings()
RETURNS TABLE (
  signups_enabled boolean,
  google_login_enabled boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT settings.signups_enabled, settings.google_login_enabled
  FROM public.site_settings AS settings
  WHERE settings.id = true
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_auth_settings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_auth_settings() TO anon, authenticated;
