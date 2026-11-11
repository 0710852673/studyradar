# Study Radar 1.0 completion

Rules: preserve all member records, additive migrations only, privacy by default, no outbound member sending, no AI credits, and no publishing without owner approval. Deferred modules stay hidden.

- [x] Focused preview pass at current head: check mobile/tablet/desktop layouts; repair reproduced dashboard overflow and signup hydration mismatch only.
- [ ] Verify remaining live member writes, onboarding completion and invite attribution with owner-authorized test data; current preview pass blocks database mutations.

- [ ] Repair current type/build errors and remove achievement-email triggers
- [ ] Finish admin command centre: grouped desktop navigation, accessible mobile drawer, errors, loading and empty states
- [ ] Add real date-range metrics, separate study/wasted-time reporting, student detail and audit visibility
- [x] Remove optional in-app activity tracking and its Profile toggle; use hosting-platform aggregate site metrics separately, with provider-side privacy caveats
- [ ] Finish atomic resource CRUD/review and truthful suggestion states
- [ ] Add isolated O/L and A/L admin preview modes with no database writes
- [ ] Update homepage and public feature copy for actual 1.0 capabilities and create-account CTA
- [ ] Verify auth settings, saved resources, contact/feedback, backups and hidden-route gates
- [ ] Add focused tests; run tests, lint, typecheck, production build and browser checks
- [ ] Resolve live database API-role grants and permissive event INSERT policies; the corrective migration is source-only and has not been applied
- [ ] Review historical device_events retention: 246 rows remain, including 243 rows with IP/location fields and 194 rows with account IDs/emails; no records were deleted
- [ ] Verify the security-IP Edge Function before enabling it; its target security_ip_events table is absent from the live database
- [ ] Report unverified live flows and exact remaining risks without publishing
