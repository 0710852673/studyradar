import { Link } from "@tanstack/react-router";
import { Github, Mail, Radar } from "lucide-react";

/** Public marketing footer — founder + contact details. */
export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-border bg-sidebar">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Radar className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Study Radar</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            A study tracker built for Sri Lankan GCE O/L and A/L students. Hours, streaks, marks
            and syllabus — in one calm dashboard.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium">Product</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="/#features" className="transition-colors hover:text-foreground">
                Features
              </a>
            </li>
            <li>
              <a href="/#how" className="transition-colors hover:text-foreground">
                How it works
              </a>
            </li>
            <li>
              <Link to="/auth" className="transition-colors hover:text-foreground">
                Sign in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium">Contact &amp; legal</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a
                href="mailto:sheharageeneth@gmail.com"
                className="transition-colors hover:text-foreground"
              >
                sheharageeneth@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              <span>Built in Sri Lanka 🇱🇰</span>
            </li>
            <li>
              <Link to="/privacy" className="transition-colors hover:text-foreground">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="transition-colors hover:text-foreground">
                Terms &amp; Conditions
              </Link>
            </li>
          </ul>
        </div>

      </div>

      <div className="border-t border-border px-5 py-5 text-center text-xs text-muted-foreground sm:px-8">
        © {new Date().getFullYear()} Study Radar · Founded &amp; built by{" "}
        <span className="text-foreground">Shehara Geeneth</span>
      </div>
    </footer>
  );
}
