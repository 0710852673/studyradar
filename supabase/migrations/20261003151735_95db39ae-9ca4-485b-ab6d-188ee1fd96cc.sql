CREATE TABLE public.wasted_time (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  minutes integer NOT NULL CHECK (minutes > 0 AND minutes <= 1440),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wasted_time TO authenticated;
GRANT ALL ON public.wasted_time TO service_role;
ALTER TABLE public.wasted_time ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wasted read" ON public.wasted_time FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "wasted insert" ON public.wasted_time FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wasted update" ON public.wasted_time FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wasted delete" ON public.wasted_time FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE INDEX wasted_time_user_date ON public.wasted_time(user_id, date);