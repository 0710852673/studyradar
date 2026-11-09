-- Durable achievement awards, admin visibility, and email delivery state.
CREATE TABLE IF NOT EXISTS public.achievement_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  email_status text NOT NULL DEFAULT 'pending'
    CHECK (email_status IN ('pending', 'sending', 'sent', 'failed', 'skipped')),
  email_sent_at timestamptz,
  UNIQUE (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS achievement_awards_awarded_idx
  ON public.achievement_awards (awarded_at DESC);
CREATE INDEX IF NOT EXISTS achievement_awards_user_idx
  ON public.achievement_awards (user_id, awarded_at DESC);

GRANT SELECT ON public.achievement_awards TO authenticated;
GRANT ALL ON public.achievement_awards TO service_role;
ALTER TABLE public.achievement_awards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students and admins read achievement awards" ON public.achievement_awards;
CREATE POLICY "students and admins read achievement awards"
  ON public.achievement_awards FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Existing milestones are visible to admins, but are not emailed retroactively.
WITH session_metrics AS (
  SELECT user_id, COALESCE(SUM(minutes), 0)::numeric / 60 AS total_hours,
    COUNT(*)::integer AS session_count
  FROM public.study_sessions
  GROUP BY user_id
),
day_islands AS (
  SELECT user_id,
    date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY date)::integer AS streak_group
  FROM (SELECT DISTINCT user_id, date FROM public.study_sessions) AS days
),
streak_metrics AS (
  SELECT user_id, MAX(days_in_a_row)::integer AS longest_streak
  FROM (
    SELECT user_id, streak_group, COUNT(*)::integer AS days_in_a_row
    FROM day_islands
    GROUP BY user_id, streak_group
  ) AS streak_groups
  GROUP BY user_id
),
metrics AS (
  SELECT sm.user_id, sm.total_hours, sm.session_count,
    COALESCE(st.longest_streak, 0) AS longest_streak
  FROM session_metrics sm
  LEFT JOIN streak_metrics st ON st.user_id = sm.user_id
)
INSERT INTO public.achievement_awards
  (user_id, achievement_id, title, description, email_status)
SELECT metrics.user_id, eligible.achievement_id, eligible.title,
  eligible.description, 'skipped'
FROM metrics
CROSS JOIN LATERAL (
  VALUES
    ('first', 'The First Step', 'Log your very first study session', metrics.session_count >= 1),
    ('h10', 'First 10 Hours', 'Log 10 total study hours', metrics.total_hours >= 10),
    ('h100', 'First 100 Hours', 'Log 100 total study hours', metrics.total_hours >= 100),
    ('h500', '500 Study Hours', 'The long game pays off', metrics.total_hours >= 500),
    ('s7', '7 Day Streak', 'Study 7 days in a row', metrics.longest_streak >= 7),
    ('s30', '30 Day Streak', 'A full month of consistency', metrics.longest_streak >= 30)
) AS eligible(achievement_id, title, description, unlocked)
WHERE eligible.unlocked
ON CONFLICT (user_id, achievement_id) DO NOTHING;

-- Students cannot insert or edit award rows directly. This SECURITY DEFINER
-- function calculates eligibility from trusted study_sessions rows.
CREATE OR REPLACE FUNCTION public.award_my_eligible_achievements()
RETURNS TABLE (
  id uuid,
  achievement_id text,
  title text,
  description text,
  awarded_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_total_hours numeric := 0;
  v_session_count integer := 0;
  v_longest_streak integer := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT COALESCE(SUM(minutes), 0)::numeric / 60, COUNT(*)::integer
    INTO v_total_hours, v_session_count
    FROM public.study_sessions
    WHERE user_id = v_user_id;

  WITH study_days AS (
    SELECT DISTINCT date AS study_date
    FROM public.study_sessions
    WHERE user_id = v_user_id
  ),
  islands AS (
    SELECT study_date - ROW_NUMBER() OVER (ORDER BY study_date)::integer AS streak_group
    FROM study_days
  ),
  streak_lengths AS (
    SELECT COUNT(*)::integer AS days_in_a_row
    FROM islands
    GROUP BY streak_group
  )
  SELECT COALESCE(MAX(days_in_a_row), 0)
    INTO v_longest_streak
    FROM streak_lengths;

  RETURN QUERY
  INSERT INTO public.achievement_awards
    (user_id, achievement_id, title, description)
  SELECT v_user_id, eligible.achievement_id, eligible.title, eligible.description
  FROM (
    VALUES
      ('first', 'The First Step', 'Log your very first study session', v_session_count >= 1),
      ('h10', 'First 10 Hours', 'Log 10 total study hours', v_total_hours >= 10),
      ('h100', 'First 100 Hours', 'Log 100 total study hours', v_total_hours >= 100),
      ('h500', '500 Study Hours', 'The long game pays off', v_total_hours >= 500),
      ('s7', '7 Day Streak', 'Study 7 days in a row', v_longest_streak >= 7),
      ('s30', '30 Day Streak', 'A full month of consistency', v_longest_streak >= 30)
  ) AS eligible(achievement_id, title, description, unlocked)
  WHERE eligible.unlocked
  ON CONFLICT (user_id, achievement_id) DO NOTHING
  RETURNING achievement_awards.id, achievement_awards.achievement_id,
    achievement_awards.title, achievement_awards.description, achievement_awards.awarded_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_my_eligible_achievements() TO authenticated;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.achievement_awards;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END;
$$;


-- Per-student invite links and one-time signup attribution.
CREATE TABLE IF NOT EXISTS public.referral_codes (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.referral_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (referrer_id <> referred_user_id)
);

GRANT SELECT ON public.referral_signups TO authenticated;
GRANT ALL ON public.referral_codes, public.referral_signups TO service_role;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students and admins read referral signups" ON public.referral_signups;
CREATE POLICY "students and admins read referral signups"
  ON public.referral_signups FOR SELECT TO authenticated
  USING (
    auth.uid() = referrer_id OR auth.uid() = referred_user_id
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE OR REPLACE FUNCTION public.get_my_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  INSERT INTO public.referral_codes (user_id)
    VALUES (auth.uid())
    ON CONFLICT (user_id) DO NOTHING;
  SELECT code INTO v_code FROM public.referral_codes WHERE user_id = auth.uid();
  RETURN v_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_my_referral(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id uuid;
BEGIN
  IF auth.uid() IS NULL OR p_code IS NULL OR length(trim(p_code)) = 0 THEN
    RETURN false;
  END IF;
  SELECT user_id INTO v_referrer_id
    FROM public.referral_codes
    WHERE code = upper(trim(p_code));
  IF v_referrer_id IS NULL OR v_referrer_id = auth.uid() THEN
    RETURN false;
  END IF;
  INSERT INTO public.referral_signups (referrer_id, referred_user_id)
    VALUES (v_referrer_id, auth.uid())
    ON CONFLICT (referred_user_id) DO NOTHING;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.capture_referral_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
BEGIN
  v_code := NEW.raw_user_meta_data->>'referred_by';
  IF v_code IS NOT NULL AND length(trim(v_code)) > 0 THEN
    INSERT INTO public.referral_signups (referrer_id, referred_user_id)
    SELECT user_id, NEW.id
    FROM public.referral_codes
    WHERE code = upper(trim(v_code)) AND user_id <> NEW.id
    ON CONFLICT (referred_user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_referred ON auth.users;
CREATE TRIGGER on_auth_user_referred
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.capture_referral_signup();

GRANT EXECUTE ON FUNCTION public.get_my_referral_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_my_referral(text) TO authenticated;
