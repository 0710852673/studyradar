-- Study Radar 1.0 integrity guards.
-- This migration is additive and intentionally not applied by the readiness pass.

CREATE OR REPLACE FUNCTION public.enforce_signup_setting()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  registration_enabled boolean;
BEGIN
  SELECT signups_enabled
    INTO registration_enabled
    FROM public.site_settings
   WHERE id = true
   LIMIT 1;

  IF COALESCE(registration_enabled, false) IS NOT TRUE THEN
    RAISE EXCEPTION 'Registration is currently closed.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_signup_setting ON auth.users;
CREATE TRIGGER enforce_signup_setting
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.enforce_signup_setting();

CREATE OR REPLACE FUNCTION public.prevent_member_demo_flag_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() = OLD.id AND NEW.is_demo IS DISTINCT FROM OLD.is_demo THEN
    RAISE EXCEPTION 'Only an administrator may change the demo-account flag.'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_member_demo_flag_change ON public.profiles;
CREATE TRIGGER profiles_prevent_member_demo_flag_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_member_demo_flag_change();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'study_sessions_minutes_max_24h'
       AND conrelid = 'public.study_sessions'::regclass
  ) THEN
    ALTER TABLE public.study_sessions
      ADD CONSTRAINT study_sessions_minutes_max_24h
      CHECK (minutes <= 1440) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'marks_valid_range'
       AND conrelid = 'public.marks'::regclass
  ) THEN
    ALTER TABLE public.marks
      ADD CONSTRAINT marks_valid_range
      CHECK (marks >= 0 AND total > 0 AND marks <= total) NOT VALID;
  END IF;
END;
$$;

COMMENT ON CONSTRAINT study_sessions_minutes_max_24h ON public.study_sessions
  IS 'A single study record cannot exceed 24 hours; existing rows remain unvalidated until reviewed.';
COMMENT ON CONSTRAINT marks_valid_range ON public.marks
  IS 'New or updated mark records must be between zero and the positive total; existing rows remain unvalidated until reviewed.';
