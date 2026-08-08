import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, KeyRound, LogOut } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/studyos/AppShell";
import { Panel } from "@/components/studyos/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useStudyOS } from "@/lib/studyos/store";
import { AL_STREAMS, OL_COMPULSORY, OL_OPTIONAL, defaultExamDate } from "@/lib/studyos/subjects";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Profile — Study Radar" },
      {
        name: "description",
        content: "Update your name, exam year, subjects and daily study target.",
      },
      { property: "og:title", content: "Profile — Study Radar" },
      {
        property: "og:description",
        content: "Your account, subjects and study target in one place.",
      },
    ],
  }),
  component: ProfilePage,
});

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-4 last:border-0">
      <p className="text-sm">{label}</p>
      {children}
    </div>
  );
}

function ProfilePage() {
  const { profile, user, avatarSrc, updateProfile, uploadAvatar, signOut } = useStudyOS();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  if (!profile) return null;

  const pickAvatar = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Please pick an image under 3 MB.");
      return;
    }
    setUploading(true);
    await uploadAvatar(file);
    setUploading(false);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (pw !== pw2) {
      toast.error("The two passwords don't match.");
      return;
    }
    setPwBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setPwBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPw("");
    setPw2("");
    toast.success("Password changed");
  };

  const sendResetEmail = async () => {
    const email = user?.email;
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Reset link sent to your email.");
  };

  const thisYear = new Date().getFullYear();
  const optionalPool =
    profile.track === "AL" ? (AL_STREAMS[profile.stream ?? ""] ?? []) : OL_OPTIONAL;
  const chosenOptional = profile.subjects.filter((s) => !OL_COMPULSORY.includes(s));

  const toggleSubject = (s: string) => {
    const has = chosenOptional.includes(s);
    if (!has && chosenOptional.length >= 3) return;
    const next = has ? chosenOptional.filter((x) => x !== s) : [...chosenOptional, s];
    const subjects = profile.track === "AL" ? next : [...OL_COMPULSORY, ...next];
    void updateProfile({ subjects });
  };

  return (
    <AppShell title="Profile" subtitle={user?.email ?? "Your account"}>
      <div className="mx-auto max-w-2xl space-y-4">
        <Panel title="Account">
          <div className="flex items-center gap-4 border-b border-border pb-4">
            <Avatar className="h-16 w-16">
              {avatarSrc ? <AvatarImage src={avatarSrc} alt={profile.name} /> : null}
              <AvatarFallback className="text-lg">
                {profile.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{profile.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
                {uploading ? "Uploading…" : "Change picture"}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void pickAvatar(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
          <Row label="Name">
            <Input
              defaultValue={profile.name}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && v !== profile.name) {
                  void updateProfile({ name: v });
                  toast.success("Name updated");
                }
              }}
              className="w-48"
            />
          </Row>
          <Row label="Exam">
            <span className="text-sm text-muted-foreground">
              GCE {profile.track === "AL" ? "Advanced" : "Ordinary"} Level
              {profile.stream ? ` · ${profile.stream}` : ""}
            </span>
          </Row>
          <Row label="Exam year">
            <div className="flex gap-2">
              {[thisYear, thisYear + 1, thisYear + 2].map((y) => (
                <button
                  key={y}
                  onClick={() =>
                    void updateProfile({
                      examYear: y,
                      examDate: defaultExamDate(profile.track, y),
                    })
                  }
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                    profile.examYear === y
                      ? "border-primary bg-brand-soft text-primary"
                      : "border-border bg-elevated text-muted-foreground",
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </Row>
        </Panel>

        <Panel title="Daily target">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Hours per day</p>
            <span className="num text-lg font-semibold">{profile.dailyGoalHours}h</span>
          </div>
          <Slider
            value={[profile.dailyGoalHours]}
            min={1}
            max={14}
            step={0.5}
            onValueChange={([v]) => void updateProfile({ dailyGoalHours: v ?? 1 })}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Weekly target: {profile.dailyGoalHours * 7}h
          </p>
        </Panel>

        <Panel title={profile.track === "AL" ? "Subjects" : "Optional subjects"}>
          {profile.track === "OL" ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {OL_COMPULSORY.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border bg-elevated px-3 py-1.5 text-xs text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-3">
            {optionalPool.map((s) => {
              const active = chosenOptional.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSubject(s)}
                  disabled={!active && chosenOptional.length >= 3}
                  className={cn(
                    "rounded-xl border p-3 text-left text-sm transition-colors",
                    active
                      ? "border-primary bg-brand-soft text-primary"
                      : "border-border bg-elevated text-muted-foreground disabled:opacity-40",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel title="Password">
          <form onSubmit={changePassword} className="space-y-3">
            <Input
              type="password"
              placeholder="New password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="new-password"
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              autoComplete="new-password"
            />
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pwBusy}>
                <KeyRound className="h-4 w-4" />
                {pwBusy ? "Saving…" : "Change password"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => void sendResetEmail()}>
                Email me a reset link
              </Button>
            </div>
          </form>
        </Panel>

        <Panel>
          <Button
            variant="secondary"
            className="w-full"
            onClick={async () => {
              await signOut();
              void navigate({ to: "/", replace: true });
            }}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </Panel>
      </div>
    </AppShell>
  );
}
