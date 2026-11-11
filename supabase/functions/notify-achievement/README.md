# Achievement email function disabled

Study Radar 1.0 does not send achievement emails or member notifications.

- Do not add a deployment workflow for this function.
- Do not configure or use a mail-provider secret for achievement delivery.
- The source is a disabled 410 response for any future deployment.
- If an older version is already deployed in Supabase, the owner must delete that deployed function manually. Repository changes do not remove a deployed Edge Function.
