-- Admin role for the founder
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'sheharageeneth@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Keep emails in sync on existing profiles
UPDATE public.profiles p SET email = u.email FROM auth.users u WHERE u.id = p.id AND p.email IS DISTINCT FROM u.email;

-- A/L demo profile
UPDATE public.profiles SET
  name = 'Nimal Perera',
  track = 'AL',
  exam_year = 2027,
  exam_date = '2027-11-01',
  stream = 'Physical Science',
  subjects = ARRAY['Combined Maths','Physics','Chemistry'],
  daily_target_hours = 6,
  onboarded = true
WHERE id = 'b2055801-f0f6-4809-8b28-3236b3d275f1';

-- O/L demo profile
UPDATE public.profiles SET
  name = 'Sanduni Silva',
  track = 'OL',
  exam_year = 2026,
  exam_date = '2026-12-01',
  stream = NULL,
  subjects = ARRAY['Mathematics','Science','English','Sinhala','History','Buddhism','ICT','Commerce','Art'],
  daily_target_hours = 4,
  onboarded = true
WHERE id = 'bbf8f537-10c3-4e07-b12c-739d52717ae7';

DELETE FROM public.study_sessions WHERE user_id IN ('b2055801-f0f6-4809-8b28-3236b3d275f1','bbf8f537-10c3-4e07-b12c-739d52717ae7');
DELETE FROM public.marks WHERE user_id IN ('b2055801-f0f6-4809-8b28-3236b3d275f1','bbf8f537-10c3-4e07-b12c-739d52717ae7');
DELETE FROM public.chapters WHERE user_id IN ('b2055801-f0f6-4809-8b28-3236b3d275f1','bbf8f537-10c3-4e07-b12c-739d52717ae7');

-- 70 days of A/L study logs (2-3 subjects per day, small gaps)
INSERT INTO public.study_sessions (user_id, date, subject, minutes, note)
SELECT
  'b2055801-f0f6-4809-8b28-3236b3d275f1',
  (CURRENT_DATE - d),
  s.subject,
  s.mins,
  s.note
FROM generate_series(0, 69) AS d
CROSS JOIN LATERAL (
  VALUES
    ('Combined Maths', 60 + ((d * 17) % 5) * 15, 'Past paper practice'),
    ('Physics', 45 + ((d * 11) % 4) * 15, NULL),
    ('Chemistry', 30 + ((d * 7) % 4) * 15, 'Organic revision')
) AS s(subject, mins, note)
WHERE (d % 9) <> 3 AND ((d + s.mins) % 7) <> 0;

-- 70 days of O/L study logs
INSERT INTO public.study_sessions (user_id, date, subject, minutes, note)
SELECT
  'bbf8f537-10c3-4e07-b12c-739d52717ae7',
  (CURRENT_DATE - d),
  s.subject,
  s.mins,
  NULL
FROM generate_series(0, 69) AS d
CROSS JOIN LATERAL (
  VALUES
    ('Mathematics', 45 + ((d * 13) % 4) * 15),
    ('Science', 30 + ((d * 5) % 4) * 15),
    ('English', 30 + ((d * 3) % 3) * 15),
    ('ICT', 30 + ((d * 19) % 3) * 15)
) AS s(subject, mins)
WHERE (d % 8) <> 5 AND ((d + s.mins) % 5) <> 0;

-- Marks: A/L
INSERT INTO public.marks (user_id, subject, exam_name, marks, total, date)
SELECT 'b2055801-f0f6-4809-8b28-3236b3d275f1', m.subject, m.exam_name, m.marks, 100, m.dt::date
FROM (VALUES
  ('Combined Maths','Term 1 Paper', 52, CURRENT_DATE - 150),
  ('Combined Maths','Term 2 Paper', 61, CURRENT_DATE - 100),
  ('Combined Maths','Model Paper 1', 68, CURRENT_DATE - 55),
  ('Combined Maths','Model Paper 2', 74, CURRENT_DATE - 12),
  ('Physics','Term 1 Paper', 48, CURRENT_DATE - 148),
  ('Physics','Term 2 Paper', 57, CURRENT_DATE - 98),
  ('Physics','Model Paper 1', 63, CURRENT_DATE - 50),
  ('Physics','Model Paper 2', 71, CURRENT_DATE - 10),
  ('Chemistry','Term 1 Paper', 55, CURRENT_DATE - 145),
  ('Chemistry','Term 2 Paper', 60, CURRENT_DATE - 95),
  ('Chemistry','Model Paper 1', 66, CURRENT_DATE - 45),
  ('Chemistry','Model Paper 2', 78, CURRENT_DATE - 8)
) AS m(subject, exam_name, marks, dt);

-- Marks: O/L
INSERT INTO public.marks (user_id, subject, exam_name, marks, total, date)
SELECT 'bbf8f537-10c3-4e07-b12c-739d52717ae7', m.subject, m.exam_name, m.marks, 100, m.dt::date
FROM (VALUES
  ('Mathematics','1st Term Test', 64, CURRENT_DATE - 140),
  ('Mathematics','2nd Term Test', 72, CURRENT_DATE - 80),
  ('Mathematics','3rd Term Test', 81, CURRENT_DATE - 15),
  ('Science','1st Term Test', 58, CURRENT_DATE - 138),
  ('Science','2nd Term Test', 69, CURRENT_DATE - 78),
  ('Science','3rd Term Test', 75, CURRENT_DATE - 13),
  ('English','1st Term Test', 70, CURRENT_DATE - 136),
  ('English','2nd Term Test', 76, CURRENT_DATE - 76),
  ('ICT','2nd Term Test', 85, CURRENT_DATE - 74),
  ('ICT','3rd Term Test', 91, CURRENT_DATE - 11)
) AS m(subject, exam_name, marks, dt);

-- Chapters: A/L
INSERT INTO public.chapters (user_id, subject, title, status, position)
SELECT 'b2055801-f0f6-4809-8b28-3236b3d275f1', c.subject, c.title, c.status, c.pos
FROM (VALUES
  ('Combined Maths','Algebra','done',0),
  ('Combined Maths','Trigonometry','done',1),
  ('Combined Maths','Calculus','doing',2),
  ('Combined Maths','Statistics','todo',3),
  ('Physics','Mechanics','done',0),
  ('Physics','Waves','doing',1),
  ('Physics','Electricity','todo',2),
  ('Physics','Thermodynamics','todo',3),
  ('Chemistry','Atomic Structure','done',0),
  ('Chemistry','Chemical Bonding','done',1),
  ('Chemistry','Organic Chemistry','doing',2),
  ('Chemistry','Electrochemistry','todo',3)
) AS c(subject, title, status, pos);

-- Chapters: O/L
INSERT INTO public.chapters (user_id, subject, title, status, position)
SELECT 'bbf8f537-10c3-4e07-b12c-739d52717ae7', c.subject, c.title, c.status, c.pos
FROM (VALUES
  ('Mathematics','Number Patterns','done',0),
  ('Mathematics','Geometry','done',1),
  ('Mathematics','Algebra','doing',2),
  ('Mathematics','Probability','todo',3),
  ('Science','Biology Basics','done',0),
  ('Science','Chemistry Basics','doing',1),
  ('Science','Physics Basics','todo',2),
  ('ICT','Computer Systems','done',0),
  ('ICT','Databases','doing',1),
  ('ICT','Web Development','todo',2),
  ('English','Grammar','done',0),
  ('English','Essay Writing','doing',1)
) AS c(subject, title, status, pos);