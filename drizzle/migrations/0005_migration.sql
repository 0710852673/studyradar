DROP POLICY IF EXISTS "everyone reads settings" ON public.site_settings;
CREATE POLICY "signed-in users read settings" ON public.site_settings
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
REVOKE SELECT ON public.site_settings FROM anon;

CREATE OR REPLACE FUNCTION public.get_public_auth_settings()
RETURNS TABLE(signups_enabled boolean, google_login_enabled boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT signups_enabled, google_login_enabled FROM public.site_settings WHERE id = true LIMIT 1; $$;
GRANT EXECUTE ON FUNCTION public.get_public_auth_settings() TO anon, authenticated;

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Users read own avatar or admins read all" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND ((auth.uid())::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin')));