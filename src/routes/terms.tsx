import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/studyos/Footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Study Radar" },
      {
        name: "description",
        content:
          "The terms that govern your use of Study Radar, the study tracker for Sri Lankan GCE O/L and A/L students.",
      },
      { property: "og:title", content: "Terms & Conditions — Study Radar" },
      { property: "og:description", content: "Terms governing the use of Study Radar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "1. Introduction",
    p: [
      "These Terms & Conditions govern your access to and use of Study Radar (the \"Service\"), operated by Shehara Geeneth from Sri Lanka. By creating an account or using the Service you agree to these terms.",
    ],
  },
  {
    h: "2. The service",
    p: [
      "Study Radar is a study-management tool that lets students record study sessions, subjects, marks, syllabus progress and goals, and view analytics based on the information they enter.",
    ],
  },
  {
    h: "3. Eligibility and student use",
    p: [
      "The Service is intended for students preparing for Sri Lankan GCE O/L and A/L examinations. It may be used by minors. If you are below the age of legal capacity in your jurisdiction, you should use the Service with the awareness and permission of a parent or guardian.",
    ],
  },
  {
    h: "4. Accounts and authentication",
    p: [
      "You may register with Google or, where offered, with an email address and password. You are responsible for keeping your credentials secure and for activity that occurs under your account. Notify us immediately if you believe your account has been accessed without authorisation.",
    ],
  },
  {
    h: "5. Google authentication",
    p: [
      "When you continue with Google, we receive only the basic profile information needed to create and secure your account: your name, email address, profile picture where available, and a Google account identifier. We do not request access to Gmail, Drive, Contacts, Calendar or messages.",
    ],
  },
  {
    h: "6. Your responsibilities",
    p: [
      "You agree to provide accurate information, to use the Service lawfully, and not to attempt to access data belonging to other users, disrupt the Service, probe or bypass security controls, scrape data at scale, or upload malicious content.",
    ],
  },
  {
    h: "7. Your content",
    p: [
      "Study sessions, notes, marks, syllabus entries and problem reports you submit remain yours. You grant us the limited right to store and process this content solely to operate, secure and improve the Service.",
    ],
  },
  {
    h: "8. Academic disclaimer",
    p: [
      "Study Radar reports on the data you enter. It does not predict, guarantee or influence examination results. Readiness scores, forecasts and insights are informational estimates only and must not be relied on as academic advice.",
    ],
  },
  {
    h: "9. Analytics",
    p: [
      "We generate aggregated and de-identified statistics about how the Service is used — for example total platform study hours, subject popularity and retention — to operate and improve the product. We do not sell identifiable personal data to data brokers.",
    ],
  },
  {
    h: "10. Intellectual property",
    p: [
      "The Study Radar name, interface, design and software are owned by the operator. You may not copy, resell or create derivative works from the Service without written permission.",
    ],
  },
  {
    h: "11. Third-party services",
    p: [
      "The Service relies on third-party infrastructure for authentication, database hosting, storage and delivery. Their availability and terms are outside our control.",
    ],
  },
  {
    h: "12. Availability and changes",
    p: [
      "The Service is provided on an ongoing best-effort basis. Features may change, and access may be interrupted for maintenance, upgrades or events outside our control.",
    ],
  },
  {
    h: "13. Suspension and termination",
    p: [
      "We may suspend or terminate an account that breaches these terms, threatens the security of the platform, or is used unlawfully. You may delete your account at any time from Settings.",
    ],
  },
  {
    h: "14. Data after termination",
    p: [
      "When you delete your account, your profile and study records are removed from the live system. Copies may persist briefly in encrypted backups and in security or audit records retained for legitimate operational and legal purposes.",
    ],
  },
  {
    h: "15. Security",
    p: [
      "We apply layered controls including provider-managed authentication, server-side authorisation, row-level database access policies, and restricted uploads. No online service can be guaranteed completely secure.",
    ],
  },
  {
    h: "16. Disclaimers and liability",
    p: [
      "To the fullest extent permitted by applicable law, the Service is provided \"as is\" without warranties of any kind, and our liability for loss arising from your use of the Service is limited to the extent the law allows. Nothing in these terms excludes liability that cannot lawfully be excluded.",
    ],
  },
  {
    h: "17. Indemnity",
    p: [
      "You agree to indemnify the operator against claims arising from your unlawful use of the Service or your breach of these terms, to the extent permitted by applicable law.",
    ],
  },
  {
    h: "18. Privacy",
    p: [
      "Our handling of personal information is described in the Privacy Policy, which forms part of these terms.",
    ],
  },
  {
    h: "19. Changes to these terms",
    p: [
      "We may update these terms as the Service evolves. Material changes will be reflected on this page with a new effective date; continued use after that date constitutes acceptance.",
    ],
  },
  {
    h: "20. Governing law, severability and entire agreement",
    p: [
      "These terms are governed by the laws of Sri Lanka. If any provision is found unenforceable, the remainder continues in effect. Together with the Privacy Policy, these terms form the entire agreement between you and the operator regarding the Service.",
    ],
  },
  {
    h: "21. Contact",
    p: ["Questions about these terms: sheharageeneth@gmail.com."],
  },
];

function TermsPage() {
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
          Terms &amp; Conditions
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
            </section>
          ))}
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          This document is written to describe the platform accurately. It is not legal advice and
          should be reviewed by a qualified professional before commercial launch.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
