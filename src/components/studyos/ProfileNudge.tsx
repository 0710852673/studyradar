import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStudyOS } from "@/lib/studyos/store";

/**
 * Gentle, recurring reminder shown until the student's profile is complete.
 * Dismissal only lasts for the current tab session, so it comes back next visit.
 */
export function ProfileNudge() {
  const { profile, avatarSrc, uploadAvatar } = useStudyOS();
  const [hidden, setHidden] = useState(() => {
    if (typeof sessionStorage === "undefined") return false;
    return sessionStorage.getItem("sr_nudge_hidden_" + (profile?.id ?? "guest")) === "1";
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  if (!profile || hidden) return null;

  const missing: string[] = [];
  if (!profile.name || profile.name.trim() === "" || profile.name === "Student")
    missing.push("your name");
  if (!profile.examYear || profile.examYear < new Date().getFullYear())
    missing.push("your exam year");
  if (profile.track === "AL" && !profile.stream) missing.push("your A/L stream");
  if (!profile.school?.trim()) missing.push("your school");
  if (!profile.grade?.trim()) missing.push("your grade");
  if (!profile.subjects.length) missing.push("your subjects");
  if (!profile.dailyGoalHours || profile.dailyGoalHours <= 0)
    missing.push("your daily study goal");
  if (!profile.onboarded) missing.push("finish onboarding");
  if (missing.length === 0) return null;

  const requiredFields = profile.track === "AL" ? 8 : 7;
  const completedFields = Math.max(0, requiredFields - missing.length);

  const dismiss = () => {
    setHidden(true);
    try {
      sessionStorage.setItem("sr_nudge_hidden_" + profile.id, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-sm rounded-2xl border border-border bg-elevated/95 p-4 shadow-xl backdrop-blur-xl lg:inset-x-auto lg:right-6 lg:bottom-6">
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-3 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="pr-6 text-sm font-medium">Complete your study profile</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Add {missing.join(", ")} to personalise your study plan and progress reports.
      </p>
      <div className="mt-3">
        <div className="mb-1.5 flex justify-between text-[11px] text-muted-foreground">
          <span>Study profile</span>
          <span>{completedFields}/{requiredFields} essentials</span>
        </div>
        <Progress value={(completedFields / requiredFields) * 100} className="h-1.5" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {!avatarSrc ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setBusy(true);
                await uploadAvatar(file);
                setBusy(false);
              }}
            />
            <Button size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
              <Camera className="mr-1.5 h-3.5 w-3.5" />
              {busy ? "Uploading…" : "Add optional photo"}
            </Button>
          </>
        ) : null}
        <Button size="sm" variant="outline" asChild>
          <Link to="/settings" onClick={dismiss}>
            Open profile
          </Link>
        </Button>
      </div>
    </div>
  );
}
