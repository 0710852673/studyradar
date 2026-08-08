import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Study Radar" },
      { name: "description", content: "Choose a new password for your Study Radar account." },
      { property: "og:title", content: "Reset password — Study Radar" },
      { property: "og:description", content: "Set a new password and get back to studying." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canReset, setCanReset] = useState(false);

  useEffect(() => {
    // Supabase delivers a recovery session via the URL hash on arrival.
    void supabase.auth.getSession().then(({ data }) => setCanReset(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setCanReset(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(err.message);
      toast.error(err.message);
      return;
    }
    toast.success("Password updated");
    void navigate({ to: "/dashboard", replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="panel rise w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-xl font-semibold">New password</h1>
            <p className="text-sm text-muted-foreground">Choose something you'll remember.</p>
          </div>
        </div>

        {!canReset ? (
          <p className="rounded-xl border border-border bg-elevated p-4 text-sm text-muted-foreground">
            This reset link is invalid or has expired. Request a new one from the sign-in page.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <Input
              type="password"
              required
              minLength={6}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Input
              type="password"
              required
              minLength={6}
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
            {error ? (
              <p
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Saving…" : "Update password"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
