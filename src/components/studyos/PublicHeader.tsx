import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Radar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudyOS } from "@/lib/studyos/store";

const LINKS = [
  { to: "/features", label: "Features" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/ol-al", label: "O/L & A/L" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

/** Shared marketing navigation for every public page. */
export function PublicHeader() {
  const { session } = useStudyOS();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform duration-200 hover:scale-105">
            <Radar className="h-4 w-4" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight sm:text-lg">
            Study Radar
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-foreground" }}
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <Button asChild size="sm">
              <Link to="/dashboard">Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="transition-transform hover:scale-[1.03]">
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          )}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border bg-background px-5 py-3 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          {!session ? (
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-2.5 text-sm text-primary"
            >
              Sign in
            </Link>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}

/** Standard hero block for the public sub-pages. */
export function PageHero({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border px-5 py-14 sm:px-8 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-8rem] h-[22rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary/12 blur-[120px]"
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center rounded-full border border-border bg-elevated px-3 py-1 text-xs text-muted-foreground">
          {eyebrow}
        </span>
        <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">{lead}</p>
      </div>
    </section>
  );
}
