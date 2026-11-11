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
      "Study Radar is a study-tracking service for Sri Lankan GCE O/L and A/L students. This policy explains what information we handle and why.",
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
      "Wasted-time logs: duration, date and optional reason",
      "Optional school, grade, town, district, mobile, guardian contact details and biography that you choose to enter; these are not required for study tracking",
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
      "Network information, including IP address, may be processed by hosting and authentication providers to deliver and protect the Service",
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
    h: "6. Essential processing and optional choices",
    p: [
      "Account authentication, saving your study records, and essential security processing are needed to deliver the Service. Study Radar currently has no optional in-app activity tracking switch or browser-based product activity collection. Qualified Sri Lankan privacy review is still needed, including applicable legal grounds and protections for minors; we do not claim legal compliance.",
    ],
  },
  {
    h: "7. Service providers",
    p: [
      "Lovable Cloud provides authentication, database hosting and file storage; Lovable delivers the application. The hosting platform also provides the site owner with aggregate traffic metrics such as visitors, page views, popular pages, traffic sources, device classes and country-level breakdowns. These are provider-side metrics, not the disabled in-app activity logger. Hosting and authentication providers receive network information needed to deliver their services and may process it outside Sri Lanka. Provider-side logging, analytics methods and retention require review before launch. We do not sell personal data. The app no longer calls ipapi.co for IP or location lookup.",
    ],
  },
  {
    h: "8. Administrative access",
    p: [
      "A single administrator account can view platform analytics, user directories and, where necessary for support or abuse investigation, an individual student's account information and study records. Administrative access is authorised server-side and does not expose passwords or authentication secrets.",
    ],
  },
  {
    h: "9. Product and site analytics",
    p: [
      "Study Radar currently does not collect optional page-visit or login analytics through its browser app code. The previous Profile privacy switch has been removed and new client-side device_events tracking is disabled. Site traffic reporting is provided separately by the hosting platform to the site owner in aggregate form, including visitor and page-view counts, popular pages, traffic sources, device classes and country-level summaries. The hosting provider may process network information to produce and operate these reports; we do not promise that provider-side analytics contains no IP-derived or location information.",
      "Historical device activity records are not deleted by disabling new tracking. Some older records may contain account identifiers, email, IP address or location fields. Essential authentication and security processing remains separate from product analytics and is not controlled by a student-facing analytics switch.",
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
      "Account and study data are retained while your account exists. The application-level IP security logging function is currently disabled. Historical device activity records may still contain IP/location and email collected by earlier implementations; those records have not been removed and their retention requires review. Provider backups and operational logs may follow separate retention periods.",
    ],
  },
  {
    h: "12. Deleting your account and exporting your data",
    p: [
      "Request account deletion or a copy of your data through the contact page. Settings currently does not provide self-service deletion or a student data export. Requests require identity verification and review of retained security records and backups; we do not promise immediate removal from every backup.",
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
      "Study Radar is used by school students, including minors. The app currently has no optional in-app activity tracking switch. Do not put sensitive information in study notes, wasted-time reasons, or your biography. School, mobile and guardian details are optional. No verified parental-consent mechanism is currently implemented. Age-appropriate notices, the necessity of optional profile fields, administrator access, and provider-side analytics require qualified Sri Lankan review before launch.",
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
    p: ["Privacy questions and requests can be sent through the contact page."],
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
          Updated 11 November 2026 · Study Radar, Sri Lanka
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
