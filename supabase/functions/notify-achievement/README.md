# Achievement email notifications

The app now records achievement awards in the database and shows them in the admin Control Room. Existing achievements are imported as historical records and are **not** emailed retroactively. New unlocks create an in-app notification and request an email to the student's own sign-in address.

## Deploy the database migration

From the repository root, with the Supabase CLI linked to the Study Radar project:

```bash
supabase db push
```

This creates `achievement_awards`, the secure award-calculation RPC, row-level security policies, and the realtime publication entry used by the admin panel.

## Configure email delivery

Study Radar uses Resend for transactional achievement emails. Verify a sender domain in Resend first, then configure these Supabase Edge Function secrets:

```bash
supabase secrets set RESEND_API_KEY=re_your_key
supabase secrets set RESEND_FROM_EMAIL="Study Radar <achievements@your-verified-domain>"
```

The Edge Function also uses the standard Supabase function environment values `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Do not put the service-role key or Resend key in frontend code, GitHub files, or Vite environment variables.

Deploy the function:

```bash
supabase functions deploy notify-achievement
```

Optionally set `SITE_ORIGIN` to the production Study Radar origin to restrict browser CORS.

## Verify

1. Sign in as a student and log enough study time to unlock an achievement.
2. Confirm the student sees the achievement in the notification bell.
3. Confirm an email arrives at that student's sign-in email.
4. Open Admin → Achievements and verify the student, award, and email status appear.
5. If delivery failed or was not configured, set the secrets and use **Retry email** in the admin panel.

Historical awards are marked `skipped` for email so existing members do not receive a burst of old milestone emails.
