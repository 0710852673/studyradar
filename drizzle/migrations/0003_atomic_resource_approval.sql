-- Make resource approval and suggestion status transition one atomic operation.
-- The function checks the caller's admin role itself; it does not trust client input.
CREATE OR REPLACE FUNCTION public.approve_resource_suggestion(p_suggestion_id uuid, p_admin_response text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_suggestion public.resource_suggestions%ROWTYPE;
  v_resource_id uuid;
  v_publisher text;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_suggestion
  FROM public.resource_suggestions
  WHERE id = p_suggestion_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Suggestion not found' USING ERRCODE = 'P0002';
  END IF;

  -- Safe retry after a successful transaction whose response was lost.
  IF v_suggestion.status = 'approved' THEN
    SELECT id INTO v_resource_id
    FROM public.resources
    WHERE normalized_url = v_suggestion.normalized_url
      AND status = 'published'
    LIMIT 1;
    IF v_resource_id IS NULL THEN
      RAISE EXCEPTION 'Approved suggestion has no published resource';
    END IF;
    RETURN v_resource_id;
  END IF;

  IF v_suggestion.status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending suggestions can be approved';
  END IF;

  SELECT id INTO v_resource_id
  FROM public.resources
  WHERE normalized_url = v_suggestion.normalized_url
    AND status <> 'archived'
  LIMIT 1;

  IF v_resource_id IS NOT NULL THEN
    RAISE EXCEPTION 'A resource with this URL already exists';
  END IF;

  v_publisher := regexp_replace(
    regexp_replace(v_suggestion.url, '^https?://', '', 'i'),
    '^www\.', '', 'i'
  );
  v_publisher := split_part(v_publisher, '/', 1);

  INSERT INTO public.resources (
    name, url, normalized_url, description, category, subjects, exams,
    publisher, status, featured, created_by
  ) VALUES (
    v_suggestion.name, v_suggestion.url, v_suggestion.normalized_url,
    v_suggestion.description, v_suggestion.category, v_suggestion.subjects,
    v_suggestion.exams, v_publisher, 'published', false, auth.uid()
  )
  RETURNING id INTO v_resource_id;

  UPDATE public.resource_suggestions
  SET status = 'approved',
      admin_response = COALESCE(
        NULLIF(left(trim(p_admin_response), 600), ''),
        'Approved and added to the Resource Hub.'
      )
  WHERE id = p_suggestion_id;

  RETURN v_resource_id;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_resource_suggestion(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_resource_suggestion(uuid, text) TO authenticated;
