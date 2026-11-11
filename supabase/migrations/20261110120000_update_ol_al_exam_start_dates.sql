-- Align existing student profiles with the confirmed 2026 O/L and 2027 A/L start dates.
-- Countdown uses the first examination day only; end dates are intentionally not stored.
UPDATE public.profiles
SET exam_date = CASE
  WHEN track = 'OL' AND exam_year = 2026 THEN DATE '2026-12-08'
  WHEN track = 'AL' AND exam_year = 2027 THEN DATE '2027-08-03'
  WHEN track = 'OL' AND exam_year = 2027 THEN DATE '2027-12-07'
  ELSE exam_date
END
WHERE (track = 'OL' AND exam_year = 2026)
   OR (track = 'AL' AND exam_year = 2027)
   OR (track = 'OL' AND exam_year = 2027);
