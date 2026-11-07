# Readiness pass
- [x] Affirmative Google signup consent without changing returning sign-in consent.
- [x] Remove network/location analytics; optional consent control and accurate privacy notice.
- [x] Review throttle; leave database writes unchanged because safe server enforcement requires a separate design and concurrency review.
- [x] Non-destructive public browser checks and synthetic privacy tests.
- [ ] Live OAuth/post-session validation and hosted provider logging review: requires a separate consent-aware account gate and provider-settings audit; not tested against real student records in this pass.