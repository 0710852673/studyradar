-- Protect admin-controlled profile metadata from self-service edits.
CREATE OR REPLACE FUNCTION public.protect_profile_moderation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role'
    AND NOT public.has_role(auth.uid(), 'admin')
    AND (
      NEW.suspended IS DISTINCT FROM OLD.suspended
      OR NEW.suspended_reason IS DISTINCT FROM OLD.suspended_reason
      OR NEW.suspended_at IS DISTINCT FROM OLD.suspended_at
      OR NEW.is_demo IS DISTINCT FROM OLD.is_demo
      OR NEW.email IS DISTINCT FROM OLD.email
    ) THEN
    RAISE EXCEPTION 'Only administrators can change protected profile fields';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_moderation ON public.profiles;
CREATE TRIGGER profiles_protect_moderation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_moderation();
