import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudyOS } from "@/lib/studyos/store";

/**
 * Gentle, recurring reminder shown until the student's profile is complete.
 * Dismissal only lasts for the current tab session, so it comes back next visit.
 */
export function ProfileNudge() {
  const { profile, avatarSrc, uploadAvatar } = useStudyOS();
  const [hidden, setHidden] = useState(() => {
    if (typeof sessionStorage === "undefined") return false;
    return sessionStorage.getItem("sr_nudge_hidden") === "1";
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  if (!profile || hidden) return null;

  const missing: string[] = [];
  if (!profile.name || profile.name.trim() === "" || profile.name === "Student")
    missing.push("your name");
  if (!avatarSrc) missing.push("a profile picture");
  if (!profile.subjects.length) missing.push("your subjects");
  if (missing.length === 0) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      sessionStorage.setItem("sr_nudge_hidden", "1");
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
      <p className="pr-6 text-sm font-medium">Finish setting up your profile</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Add {missing.join(", ")} so your dashboard and reports look right.
      </p>
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
              {busy ? "Uploading…" : "Upload photo"}
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
