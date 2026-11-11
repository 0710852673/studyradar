-- Referral attribution is only valid for newly created accounts.
CREATE OR REPLACE FUNCTION public.record_my_referral(p_code text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_referrer_id uuid; v_created_at timestamptz;
BEGIN
  IF auth.uid() IS NULL OR p_code IS NULL OR length(trim(p_code)) = 0 THEN RETURN false; END IF;
  SELECT created_at INTO v_created_at FROM auth.users WHERE id = auth.uid();
  IF v_created_at IS NULL OR v_created_at < now() - interval '1 hour' THEN RETURN false; END IF;
  SELECT user_id INTO v_referrer_id FROM public.referral_codes WHERE code = upper(trim(p_code));
  IF v_referrer_id IS NULL OR v_referrer_id = auth.uid() THEN RETURN false; END IF;
  INSERT INTO public.referral_signups (referrer_id, referred_user_id) VALUES (v_referrer_id, auth.uid()) ON CONFLICT (referred_user_id) DO NOTHING;
  RETURN FOUND;
END;
$$;
GRANT EXECUTE ON FUNCTION public.record_my_referral(text) TO authenticated;
