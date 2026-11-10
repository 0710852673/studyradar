import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Radar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { logSecurityEvent, rememberConsent } from "@/lib/studyos/security";
import { googleConsentAction } from "@/lib/studyos/privacy-preferences";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Study Radar" },
      {
        name: "description",
        content: "Sign in or create your Study Radar account to track GCE O/L and A/L study.",
      },
      { property: "og:title", content: "Sign in — Study Radar" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        property: "og:description",
        content: "Track study hours, streaks and marks for GCE O/L and A/L.",
      },
    ],
  }),
  component: AuthPage,
});

/** Turn backend auth errors into something a student can act on. */
function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "That email and password don't match. Check them and try again.";
  if (m.includes("email not confirmed"))
    return "Confirm your email first — check your inbox for the link.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Try signing in instead.";
  if (m.includes("password should be"))
    return "Your password must be at least 6 characters.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Wait a minute and try again.";
  return message;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.6-5.2 3.6-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8h-4v3.1A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6v-3.1h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8Z"
      />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "forgot">(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("mode") === "signup"
      ? "up"
      : "in",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [agree, setAgree] = useState(false);
  const referralCode = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("ref");

  const fail = (message: string) => {
    const text = friendly(message);
    setError(text);
    toast.error(text);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    if (mode === "forgot") {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) fail(err.message);
      else {
        setSent(true);
        toast.success("Reset link sent — check your email.");
      }
    } else if (mode === "up") {
      if (!agree) {
        setBusy(false);
        fail("Please accept the Terms and Privacy Policy to create an account.");
        return;
      }
      rememberConsent();
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { name: name.trim() || email.split("@")[0], referred_by: referralCode ?? undefined },
        },
      });
      if (err) fail(err.message);
      else if (!data.session) {
        setSent(true);
        toast.success("Account created — confirm your email to continue.");
      } else {
        void navigate({ to: "/dashboard", replace: true });
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) {
        fail(err.message);
        void logSecurityEvent("sign_in_failed", {
          severity: "warning",
          email: email.trim(),
          detail: err.message,
        });
      } else void navigate({ to: "/dashboard", replace: true });
    }
    setBusy(false);
  };

  const google = async () => {
    if (busy) return;
    const action = googleConsentAction(mode, agree);
    if (action === "block") {
      fail("Please accept the Terms and Privacy Policy to create an account.");
      return;
    }
    setBusy(true);
    setError(null);
    if (action === "remember") rememberConsent();
    if (referralCode) {
      try {
        sessionStorage.setItem("sr_pending_referral", referralCode);
      } catch {
        /* Referral tracking is optional if browser storage is unavailable. */
      }
    }
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    const err = (result as { error?: unknown }).error;
    if (err) {
      try {
        sessionStorage.removeItem("sr_pending_referral");
      } catch {
        /* ignore */
      }
      fail(err instanceof Error ? err.message : "Google sign-in failed.");
      void logSecurityEvent("google_sign_in_failed", {
        severity: "warning",
        detail: err instanceof Error ? err.message : "unknown",
      });
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/dashboard", replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="panel rise p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Radar className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-xl font-semibold">Study Radar</h1>
              <p className="text-sm text-muted-foreground">
                {mode === "in"
                  ? "Welcome back."
                  : mode === "up"
                    ? "Set up your student account."
                    : "Reset your password."}
              </p>
            </div>
          </div>

          {mode !== "forgot" ? (
            <>
              {mode === "up" ? (
                <label className="mb-4 flex items-start gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 accent-primary" />
                  <span>I accept the <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>. Optional product analytics is a separate choice, off by default.</span>
                </label>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="mb-4 w-full"
                onClick={() => void google()}
                disabled={busy}
              >
                <GoogleIcon /> Continue with Google
              </Button>

              <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or use email{" "}
                <span className="h-px flex-1 bg-border" />
              </div>

              <div className="mb-5 flex rounded-xl bg-elevated p-1">
                {(["in", "up"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      setError(null);
                      setSent(false);
                    }}
                    className={cn(
                      "flex-1 rounded-lg px-3 py-2 text-sm transition-colors",
                      mode === m
                        ? "bg-brand-soft font-medium text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {m === "in" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {sent ? (
            <div className="rounded-xl border border-border bg-elevated p-4 text-sm">
              <p className="font-medium">Check your inbox</p>
              <p className="mt-1 text-muted-foreground">
                We sent a link to <span className="text-foreground">{email}</span>. Open it to
                continue.
              </p>
              <Button
                variant="ghost"
                className="mt-3 w-full"
                onClick={() => {
                  setSent(false);
                  setMode("in");
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              {mode === "up" ? (
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              ) : null}
              <Input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                autoComplete="email"
              />
              {mode !== "forgot" ? (
                <Input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  autoComplete={mode === "in" ? "current-password" : "new-password"}
                />
              ) : null}

              {error ? (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </p>
              ) : null}

              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy
                  ? "Please wait…"
                  : mode === "in"
                    ? "Sign in"
                    : mode === "up"
                      ? "Create account"
                      : "Send reset link"}
              </Button>
            </form>
          )}

          {!sent ? (
            <button
              type="button"
              onClick={() => {
                setMode(mode === "forgot" ? "in" : "forgot");
                setError(null);
              }}
              className="mt-4 w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {mode === "forgot" ? "Back to sign in" : "Forgot your password?"}
            </button>
          ) : null}

          <p className="mt-5 text-center text-xs text-muted-foreground">
            You stay signed in on this device until you sign out.
          </p>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Read our{" "}
            <Link to="/terms" className="text-primary underline-offset-4 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            . Google sign-in shares only your name, email and profile picture.
          </p>

        </div>
      </div>
    </main>
  );
}
