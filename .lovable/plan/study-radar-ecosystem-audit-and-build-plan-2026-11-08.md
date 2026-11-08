# Study Radar ecosystem: audit and build plan

Nothing is edited yet. Statuses come from reading routes, `src/lib/studyos/*`, migrations and `__root.tsx`. Not tested in a browser this turn.

Status key: COMPLETE (real data, saves) / PARTIAL (works, local-only or incomplete) / PLACEHOLDER (UI with static or in-memory data) / BROKEN / MISSING.

## 1. Feature audit

| Area | Evidence | Status |
|---|---|---|
| Study core (dashboard, log, wasted time, subjects, marks, syllabus, calendar, timer, achievements, progress) | `dashboard.tsx`, `store.tsx`, tables `study_sessions`, `marks`, `chapters`, `wasted_time` with RLS | COMPLETE (saving/reload not yet browser-tested) |
| Auth, consent, Google, reset, avatars | `auth.tsx`, `reset-password.tsx`, `privacy-preferences.ts`, private avatar bucket | COMPLETE |
| Study assistant + widget | `assistant.ts` is an offline rule-based helper, not an AI model; `AssistantWidget.tsx` | PARTIAL: label honestly or wire a real model |
| AI Student Intelligence / recommendations | `ai.tsx` plus `assistant.ts` rules over the student's own data | PARTIAL: no stored recommendations or model |
| Pathway / university guidance | `pathway.tsx` static arrays, hidden | PLACEHOLDER |
| Content Hub (`learn.tsx`) | static items; Save kept in `useState`, not `saved.ts` | PLACEHOLDER |
| Reels | `reels.tsx` sample content, save/like in `useState`; page says "sample content" | PLACEHOLDER |
| Saved | `saved.ts` (localStorage hook) exists; no `/saved` route; learn/reels don't use it | MISSING (page), PARTIAL (store) |
| Community / subject rooms / chat rooms | `community.tsx` seeded messages in `useState`, "Send" is lost on refresh | PLACEHOLDER; no tables, no moderation |
| Ask a Senior | `ask-a-senior.tsx` questions held in `useState` only | PLACEHOLDER |
| Mentor / consulting / volunteer cases | no route, no table | MISSING |
| Portfolio | `portfolio.tsx` static | PLACEHOLDER |
| Opportunities Hub | `opportunities.tsx` static list; any real scholarship data must be admin-curated and sourced | PLACEHOLDER |
| Skill Lab | `skill-lab.tsx` checklist in `useState` | PLACEHOLDER |
| Help, Feedback, Community Guidelines | no routes | MISSING |
| Contact form | `contact.tsx` only shows a success toast; nothing is stored or sent | BROKEN (fake success) |
| Notifications | `notifications.ts` + `Notifications.tsx`: localStorage on one device, admin polling; no table | PARTIAL |
| Admin command centre | `admin.tsx` (1196 lines): overview, students, analytics, activity, security, site settings, data/backups, restore (`restore.functions.ts`) | PARTIAL: no moderation, content, consulting, announcements |
| Moderation / reports | none | MISSING |
| Security | `security_events`, RLS everywhere, consent-based analytics; client-only write throttle | PARTIAL |
| Curriculum architecture (international) | O/L and A/L hard-coded in `subjects.ts`; `profiles.track` is text | PARTIAL: no curriculum table |
| Email / announcements | no email domain, no server routes, no `src/routes/api` | MISSING |
| Automated tests | `tests/privacy.test.js` only; no e2e; no test script in `package.json` | PARTIAL |
| Gate for unreleased modules | `HIDDEN_PATHS` redirect in `__root.tsx`; nav links removed | COMPLETE: keep until each module is real |

## 2. Dependencies and risks

- **No fake flows.** Every hidden module is a UI mock, so each needs real tables with RLS before it is un-hidden. Un-hide one module at a time through a per-module flag in `site_settings`, admin-controlled.
- **Minors.** Community, chat and Ask a Senior carry the highest risk. Needs: guidelines acceptance, reporting, an admin moderation queue, no private DMs at first, no contact details shared, and rate limits enforced in the database (not client-only).
- **Mentor/consulting and volunteer cases.** These hold sensitive data. Strict RLS (the student and assigned mentors only), a mentor role in `user_roles` (never on profiles), a consent step, and mentors verified by an admin.
- **Real content.** Scholarships and career data must be admin-entered with a source link and a "last verified" date. Seeds are clearly labelled "Sample".
- **Email.** Needs a verified sender domain from you. Without it, announcement send stays disabled. Marketing email to minors needs guardian consent, so the default audience is adults with opt-in.
- **Real AI.** Needs Lovable AI Gateway via a server function. Send only the student's own aggregate stats and add rate limits. Uses credits.
- **Data safety.** All migrations are additive (new tables and columns only). No changes to existing tables beyond nullable columns. Take a backup export before phase 1.
- **Tests.** E2E needs test accounts; they must be created and removed by the test harness only, never touching real rows.
- **Open items from earlier.** Admin password reset, leftover `qacheck.studyradar@gmail.com` account (needs your OK to delete), an older backend security warning.

## 3. Phased plan (each phase ends with typecheck, lint, tests, diff review)

**Phase 0: Safety and test base**
- Add a `test` script, expand unit tests, and add a Playwright e2e suite (see section 4).
- Confirm the HIDDEN gate still works. Export a backup first.

**Phase 1: Real foundations (unblocks everything)**
- Additive migration: `saved_items` (per user), `notifications` (per user, read state), `feedback`, `contact_messages`, `reports`, `audit_log`. RLS: owner only, admin read.
- Wire the contact form to `contact_messages`, so no more fake success toast.
- Add `/saved` and `/feedback` routes, plus `/help` and `/guidelines` (public). Move notifications from localStorage to the table.
- Add `module_flags` in `site_settings` so the admin can release each module.

**Phase 2: Content Hub, Reels, Saved**
- Tables: `content_items` (guide, video, reel; level, subject, source, status). Admin CRUD in `admin.tsx`. Learn and Reels read from the table and save via `saved_items`. Seed content labelled "Sample".

**Phase 3: Community, subject rooms, Ask a Senior**
- Tables: `rooms`, `room_messages`, `questions`, `answers`. Guidelines acceptance is required first. Report button on every post. Admin moderation queue (hide, warn, suspend). DB-enforced rate limit and length limits. Realtime if simple.

**Phase 4: Mentor, consulting and volunteer cases**
- Tables: `mentor_profiles`, `cases` (status flow: requested, assigned, active, closed), `case_notes`. Add a `mentor` role. Student request form, mentor inbox, admin assignment and case view.

**Phase 5: Pathway, Opportunities, Skill Lab, Portfolio**
- Admin-curated `opportunities` and `pathways` (source and verified date). Skill Lab progress and Portfolio items saved per user. Portfolio is private by default.

**Phase 6: AI Student Intelligence**
- Server function using the AI Gateway: weekly insight and recommendations from the student's own data, stored in `recommendations`. Rate-limited, with a disclaimer. The offline helper stays as a fallback.

**Phase 7: Admin command centre expansion**
- New sections: Moderation, Content, Cases, Opportunities, Announcements, Module release. Reuse the existing admin patterns and the backup/restore flow (extend the backup to cover new tables).

**Phase 8: Curriculum architecture**
- Additive `curricula` and `curriculum_subjects` tables (O/L and A/L seeded from `subjects.ts`; Cambridge/Edexcel as empty stubs). The app keeps reading the current constants until a migration path is verified.

**Phase 9: Release announcements (no sending in this task)**
- Tables: `announcements` (draft, tested, sent), `announcement_sends` (unique per recipient and announcement for idempotency), `email_prefs`.
- Admin screen: draft, preview recipient count and content, send test to the admin only, then a typed confirmation for a one-time send.
- A readiness checklist keeps Send disabled until all pass: provider configured, verified sender domain, audience query (opted-in, adult or guardian-consented only), unsubscribe and preferences page, dedupe constraint, delivery/error log, test sent.
- Nothing sends on publish. In-app notices are separate and transactional. At the end I show you the exact audience, message and report and ask before any send.

## 4. Acceptance tests

Unit (bun test):
- Rate limit blocks the 61st write in a minute.
- Consent: a new user has analytics off; Google signup without acknowledgement is blocked (existing tests kept).
- Announcement send is disabled unless every readiness check is true.
- Dedupe: the same recipient and announcement cannot be inserted twice.
- Audience query excludes opted-out users, minors without consent, and suspended users.

E2E (Playwright, two throwaway accounts created and removed by the harness):
1. Student A logs a 45 min study session and a 20 min wasted entry. Both appear, and both persist after a refresh.
2. Student B cannot see A's sessions, wasted time, saved items, cases or notifications (UI and direct API read returns 0 rows).
3. Student saves a content item and a reel. It shows on `/saved` after a refresh.
4. Contact and feedback submit create a row. The admin sees it; a student cannot read it.
5. A community post is rejected before guidelines acceptance. After acceptance it persists, a report appears in the admin queue, and hiding it removes it for students.
6. A student creates a mentor case. Only that student, the assigned mentor and admin can read it.
7. A non-admin is redirected from `/admin`. A hidden module redirects until the admin releases it.
8. Admin backup then restore dry-run reports correct counts and changes nothing.
9. Announcement screen: Send is disabled with any failed check. No email is sent in any test (provider mocked).
10. Mobile viewport (390px) has no horizontal overflow on the main routes.

Final gate: typecheck, lint, build and all tests green, a backend security scan with no new findings, and a row-count comparison of existing tables before and after (unchanged).

## Decisions I need from you
1. Start with Phases 0 to 2 first? (Recommended: ships Saved, Help, Feedback, Guidelines and real Contact quickly.)
2. Real AI model for the assistant (uses credits) or keep it labelled as a rules-based helper?
3. Do you have a sender domain for email? If not, Phase 9 is built but stays disabled.
4. Who are the first mentors, and is the volunteer programme open to under-18s?
