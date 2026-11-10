CREATE OR REPLACE FUNCTION public.keep_achievement_awards_local()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.email_status := 'skipped';
  NEW.email_sent_at := NULL;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'achievement_awards_local_only'
      AND tgrelid = 'public.achievement_awards'::regclass
  ) THEN
    CREATE TRIGGER achievement_awards_local_only
      BEFORE INSERT ON public.achievement_awards
      FOR EACH ROW EXECUTE FUNCTION public.keep_achievement_awards_local();
  END IF;
END;
$$;

ALTER TABLE public.achievement_awards
  ALTER COLUMN email_status SET DEFAULT 'skipped';

COMMENT ON COLUMN public.achievement_awards.email_status IS 'Outbound member email is disabled; new awards are always marked skipped. Historical delivery states are preserved.';

CREATE OR REPLACE FUNCTION public.review_resource_suggestion(
  p_id uuid,
  p_decision text,
  p_response text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_suggestion public.resource_suggestions%ROWTYPE;
  v_actor uuid := auth.uid();
BEGIN
  IF v_actor IS NULL OR NOT public.has_role(v_actor, 'admin') THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;
  IF p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid review decision';
  END IF;

  SELECT * INTO v_suggestion
  FROM public.resource_suggestions
  WHERE id = p_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Resource suggestion not found';
  END IF;
  IF v_suggestion.status <> 'pending' THEN
    RAISE EXCEPTION 'This suggestion has already been reviewed';
  END IF;

  IF p_decision = 'approved' AND EXISTS (
    SELECT 1 FROM public.resources
    WHERE normalized_url = v_suggestion.normalized_url
      AND status <> 'archived'
  ) THEN
    RAISE EXCEPTION 'This link is already in the resource directory';
  END IF;

  UPDATE public.resource_suggestions
  SET status = p_decision,
    admin_response = COALESCE(NULLIF(trim(p_response), ''), CASE WHEN p_decision = 'approved' THEN 'Approved and published.' ELSE 'Not approved.' END),
    reviewed_by = v_actor,
    reviewed_at = now()
  WHERE id = p_id;

  IF p_decision = 'approved' THEN
    INSERT INTO public.resources (
      name, url, normalized_url, description, category, subjects, exams,
      publisher, status, featured, created_by
    ) VALUES (
      v_suggestion.name, v_suggestion.url, v_suggestion.normalized_url,
      v_suggestion.description, v_suggestion.category, v_suggestion.subjects,
      v_suggestion.exams, 'Student suggestion', 'published', false, v_actor
    );
  END IF;

  RETURN jsonb_build_object('id', p_id, 'status', p_decision);
END;
$$;

GRANT EXECUTE ON FUNCTION public.review_resource_suggestion(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_resource_suggestion(uuid, text, text) TO service_role;