CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  normalized_url text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  category text NOT NULL,
  subjects text[] NOT NULL DEFAULT '{}',
  exams text[] NOT NULL DEFAULT '{}' CHECK (exams <@ ARRAY['OL', 'AL']::text[]),
  publisher text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read published resources and admins read all"
  ON public.resources FOR SELECT TO authenticated
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins add resources"
  ON public.resources FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins edit resources"
  ON public.resources FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.resource_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  normalized_url text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  subjects text[] NOT NULL DEFAULT '{}',
  exams text[] NOT NULL DEFAULT '{}' CHECK (exams <@ ARRAY['OL', 'AL']::text[]),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  admin_response text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.resource_suggestions TO authenticated;
GRANT ALL ON public.resource_suggestions TO service_role;
ALTER TABLE public.resource_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read own suggestions and admins read all"
  ON public.resource_suggestions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "students submit own pending suggestions"
  ON public.resource_suggestions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "admins review suggestions"
  ON public.resource_suggestions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE UNIQUE INDEX resource_suggestions_open_link_idx
  ON public.resource_suggestions (normalized_url)
  WHERE status IN ('pending', 'approved');
CREATE INDEX resource_suggestions_user_idx
  ON public.resource_suggestions (user_id, created_at DESC);
CREATE INDEX resources_directory_idx
  ON public.resources (status, featured, created_at DESC);

CREATE OR REPLACE FUNCTION public.normalize_resource_url(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(trim(input), '#.*$', ''),
        '^https?://', '', 'i'
      ),
      '/+$', ''
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.prepare_resource()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.url IS NULL OR NEW.url !~* '^https?://[^[:space:]]+$' OR char_length(NEW.url) > 2048 THEN
    RAISE EXCEPTION 'A valid http or https URL is required';
  END IF;
  IF char_length(trim(NEW.name)) < 2 OR char_length(NEW.name) > 120 THEN
    RAISE EXCEPTION 'Resource name must be between 2 and 120 characters';
  END IF;
  IF char_length(NEW.description) > 600 OR char_length(NEW.publisher) > 120 THEN
    RAISE EXCEPTION 'Resource text is too long';
  END IF;
  NEW.normalized_url := public.normalize_resource_url(NEW.url);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER resources_prepare
  BEFORE INSERT OR UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.prepare_resource();

CREATE OR REPLACE FUNCTION public.prepare_resource_suggestion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.url IS NULL OR NEW.url !~* '^https?://[^[:space:]]+$' OR char_length(NEW.url) > 2048 THEN
    RAISE EXCEPTION 'A valid http or https URL is required';
  END IF;
  IF char_length(trim(NEW.name)) < 2 OR char_length(NEW.name) > 120
    OR char_length(NEW.description) < 10 OR char_length(NEW.description) > 600
    OR char_length(NEW.reason) < 10 OR char_length(NEW.reason) > 600 THEN
    RAISE EXCEPTION 'Please check the suggestion field lengths';
  END IF;
  NEW.normalized_url := public.normalize_resource_url(NEW.url);
  NEW.updated_at := now();

  IF TG_OP = 'INSERT' THEN
    NEW.user_id := auth.uid();
    NEW.status := 'pending';
    NEW.admin_response := NULL;
    NEW.reviewed_by := NULL;
    NEW.reviewed_at := NULL;
    IF NEW.user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
    IF (SELECT count(*) FROM public.resource_suggestions
      WHERE user_id = NEW.user_id AND created_at > now() - interval '1 hour') >= 5 THEN
      RAISE EXCEPTION 'Suggestion limit reached. Please try again later.';
    END IF;
    IF EXISTS (SELECT 1 FROM public.resources
      WHERE normalized_url = NEW.normalized_url AND status <> 'archived') THEN
      RAISE EXCEPTION 'This resource is already in the directory or review queue';
    END IF;
  ELSE
    NEW.reviewed_by := auth.uid();
    NEW.reviewed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER resource_suggestions_prepare
  BEFORE INSERT OR UPDATE ON public.resource_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.prepare_resource_suggestion();

CREATE TABLE public.admin_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admin_audit_events TO authenticated;
GRANT ALL ON public.admin_audit_events TO service_role;
ALTER TABLE public.admin_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit events"
  ON public.admin_audit_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX admin_audit_events_created_idx ON public.admin_audit_events (created_at DESC);

CREATE OR REPLACE FUNCTION public.record_admin_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  row_data jsonb;
BEGIN
  row_data := to_jsonb(CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END);
  INSERT INTO public.admin_audit_events (actor_id, action, entity_type, entity_id, detail)
  VALUES (auth.uid(), lower(TG_OP), TG_TABLE_NAME, row_data ->> 'id', TG_ARGV[0]);
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

CREATE TRIGGER resources_audit
  AFTER INSERT OR UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.record_admin_audit('Resource directory changed');
CREATE TRIGGER resource_suggestions_audit
  AFTER UPDATE ON public.resource_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.record_admin_audit('Resource suggestion reviewed');
CREATE TRIGGER profiles_moderation_audit
  AFTER UPDATE OF suspended, suspended_reason, suspended_at ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.record_admin_audit('Account moderation changed');
CREATE TRIGGER site_settings_audit
  AFTER UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.record_admin_audit('Site settings changed');
CREATE TRIGGER contact_messages_audit
  AFTER UPDATE OF status ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.record_admin_audit('Contact message status changed');
CREATE TRIGGER feedback_audit
  AFTER UPDATE OF status ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.record_admin_audit('Feedback status changed');

CREATE OR REPLACE FUNCTION public.protect_profile_moderation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role'
    AND NOT public.has_role(auth.uid(), 'admin')
    AND (NEW.suspended IS DISTINCT FROM OLD.suspended
      OR NEW.suspended_reason IS DISTINCT FROM OLD.suspended_reason
      OR NEW.suspended_at IS DISTINCT FROM OLD.suspended_at) THEN
    RAISE EXCEPTION 'Only administrators can change account moderation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_protect_moderation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_moderation();

ALTER TABLE public.achievement_awards
  ALTER COLUMN email_status SET DEFAULT 'skipped';

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

CREATE TRIGGER achievement_awards_local_only
  BEFORE INSERT ON public.achievement_awards
  FOR EACH ROW EXECUTE FUNCTION public.keep_achievement_awards_local();

COMMENT ON TABLE public.resources IS 'Admin-curated external learning links. Study Radar is independent and does not host publisher material.';
COMMENT ON TABLE public.resource_suggestions IS 'Student-submitted external links. Pending by default and never auto-published.';
COMMENT ON TABLE public.admin_audit_events IS 'Minimal privileged-action audit metadata; no student content or identifying payload snapshots.';
COMMENT ON COLUMN public.achievement_awards.email_status IS 'Outbound member email is disabled; new awards are always marked skipped.';
