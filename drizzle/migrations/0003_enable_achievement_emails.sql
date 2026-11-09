-- Outbound achievement emails are enabled; do not force new awards to skipped.
DROP TRIGGER IF EXISTS achievement_awards_local_only ON public.achievement_awards;
DROP FUNCTION IF EXISTS public.keep_achievement_awards_local();
ALTER TABLE public.achievement_awards
  ALTER COLUMN email_status SET DEFAULT 'pending';
COMMENT ON COLUMN public.achievement_awards.email_status IS 'Outbound achievement email delivery state.';
