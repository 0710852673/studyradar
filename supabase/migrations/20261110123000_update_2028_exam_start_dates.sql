-- Set provisional 2028 countdown dates to the first day of each exam month.
-- O/L: 1 December 2028; A/L: 1 August 2028.
UPDATE public.profiles
SET exam_date = CASE
  WHEN track = 'OL' AND exam_year = 2028 THEN DATE '2028-12-01'
  WHEN track = 'AL' AND exam_year = 2028 THEN DATE '2028-08-01'
  ELSE exam_date
END
WHERE (track = 'OL' AND exam_year = 2028)
   OR (track = 'AL' AND exam_year = 2028);
