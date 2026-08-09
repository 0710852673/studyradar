import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/studyos/Footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Study Radar" },
      {
        name: "description",
        content:
          "How Study Radar collects, uses, stores and protects student information, written to match what the platform actually does.",
      },
      { property: "og:title", content: "Privacy Policy — Study Radar" },
      {
        property: "og:description",
        content: "What Study Radar collects, why, and the rights students have over their data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

const SECTIONS: { h: string; p: string[]; list?: string[] }[] = [
  {
    h: "1. Who we are",
    p: [
      "Study Radar is a study-tracking service for Sri Lankan GCE O/L and A/L students, operated by Shehara Geeneth. This policy explains what information we handle and why.",
    ],
  },
  {
    h: "2. Information you give us",
    p: ["When you create an account and use the Service we store:"],
    list: [
      "Name, email address and profile picture (from Google, or entered by you)",
      "An authentication identifier from the sign-in provider",
      "Examination type (O/L or A/L), examination year and stream",
      "Selected subjects and daily/weekly study goals",
      "Study sessions: subject, duration, date and optional notes",
      "Marks: exam name, subject, score, total and date",
      "Syllabus/chapter progress and achievement history",
      "Problem reports you submit, including any screenshot you attach",
    ],
  },
  {
    h: "3. Information from Google",
    p: [
      "If you continue with Google, we receive only basic profile data — name, email address, profile picture where available and an account identifier. We do not request or receive Gmail messages, Drive files, Contacts, Calendar entries, microphone, camera or precise location data.",
    ],
  },
  {
    h: "4. Technical information",
    p: [
      "Our infrastructure providers process technical data that is necessary to deliver and secure the Service:",
    ],
    list: [
      "IP address and approximate network origin",
      "Browser and device type",
      "Login, session and token-refresh timestamps",
      "Authentication and security logs, including failed sign-in attempts",
      "Error and crash information",
      "Essential cookies and browser local storage used to keep you signed in",
    ],
  },
  {
    h: "5. Why we use it",
    p: [
      "To create and secure your account; to store and display your study data; to calculate streaks, analytics and progress; to detect abuse and protect the platform; to fix bugs; to respond to your support reports; and to understand aggregate usage so the product can improve.",
    ],
  },
  {
    h: "6. Legal basis",
    p: [
      "We process this information to perform the service you asked for, on the basis of your consent where consent is required, and for our legitimate interest in operating a secure and reliable platform — consistent with the Personal Data Protection Act No. 9 of 2022 of Sri Lanka.",
    ],
  },
  {
    h: "7. Service providers",
    p: [
      "We rely on third-party providers for authentication, database hosting, file storage and application delivery. They process data on our instructions and may store it on servers outside Sri Lanka. We do not sell identifiable personal data.",
    ],
  },
  {
    h: "8. Administrative access",
    p: [
      "A single administrator account can view platform analytics, user directories and, where necessary for support or abuse investigation, an individual student's account information and study records. Administrative access is authorised server-side and does not expose passwords or authentication secrets.",
    ],
  },
  {
    h: "9. Aggregated analytics",
    p: [
      "We produce aggregated and de-identified statistics — such as total platform study hours, subject popularity, retention and O/L versus A/L distribution — which cannot identify an individual student. Demo accounts are excluded from these figures.",
    ],
  },
  {
    h: "10. Student data isolation",
    p: [
      "Access rules are enforced in the database itself, not only in the interface. One student cannot read, modify or export another student's profile, study sessions, marks, syllabus or reports, even by manipulating requests from the browser.",
    ],
  },
  {
    h: "11. Retention",
    p: [
      "We keep your account data while your account exists. Security and audit records may be retained for a limited period after deletion where necessary for operational or legal reasons. Encrypted backups roll off over time.",
    ],
  },
  {
    h: "12. Deleting your account and exporting your data",
    p: [
      "You can delete your account from Settings. Deletion removes your profile and study records from the live system; copies may persist briefly in backups and retained security records. Where available, you can also download a copy of your Study Radar data from Settings.",
    ],
  },
  {
    h: "13. Security",
    p: [
      "We use provider-managed authentication, encrypted transport, server-side authorisation, row-level database access policies, private file storage and restricted upload types. No system can be guaranteed perfectly secure; we work to detect and respond to incidents promptly and will notify affected users where required by law.",
    ],
  },
  {
    h: "14. Students and minors",
    p: [
      "The Service is designed for school students and may be used by minors. We deliberately avoid collecting sensitive categories of personal information. Where applicable law requires parental consent or additional safeguards, we will support the required mechanism.",
    ],
  },
  {
    h: "15. Your rights",
    p: [
      "You may request access to, correction of, or deletion of your personal information, and may withdraw consent where processing is based on consent. Most of this can be done directly in the app; otherwise contact us and we will respond within a reasonable period. You may also complain to the relevant Sri Lankan data protection authority.",
    ],
  },
  {
    h: "16. Changes",
    p: [
      "We will update this page when our practices change, with a new effective date. This policy is written to describe what the platform actually does; we do not claim features that do not exist.",
    ],
  },
  {
    h: "17. Contact",
    p: ["Privacy questions and requests: sheharageeneth@gmail.com."],
  },
];

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Effective from 9 August 2026 · Study Radar, Sri Lanka
        </p>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="text-base font-medium">{s.h}</h2>
              {s.p.map((t) => (
                <p key={t} className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t}
                </p>
              ))}
              {s.list ? (
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {s.list.map((li) => (
                    <li key={li} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {li}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          This document is not legal advice and should be reviewed by a qualified professional
          before commercial launch.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
