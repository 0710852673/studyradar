import { useCallback, useEffect, useState } from "react";
import { Bell, ShieldAlert, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useStudyOS } from "@/lib/studyos/store";
import {
  clearNotices,
  getNotices,
  markAllRead,
  pushNotice,
  subscribeNotices,
  type Notice,
} from "@/lib/studyos/notifications";

function useNotices(userId: string | null) {
  const [list, setList] = useState<Notice[]>([]);
  const sync = useCallback(() => {
    setList(userId ? [...getNotices(userId)] : []);
  }, [userId]);
  useEffect(() => {
    sync();
    return subscribeNotices(sync);
  }, [sync]);
  return list;
}

function when(ts: number) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

/**
 * Watches for newly unlocked achievements and (for admins) fresh security
 * events, turning both into in-app notifications plus a toast.
 */
function useNotificationWatchers() {
  const { session, data, isAdmin, ready } = useStudyOS();
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!ready || !userId) return;
    let alive = true;

    const syncAchievements = async () => {
      // The database function calculates awards from saved study sessions and
      // enforces one award per user/achievement. Browser storage is only the UI cache.
      const { data: unlocked, error } = await (supabase as any).rpc(
        "award_my_eligible_achievements",
      );
      if (!alive) return;
      if (error) {
        console.error("[StudyRadar] Could not sync achievements:", error.message);
        return;
      }

      for (const award of unlocked ?? []) {
        const isNew = pushNotice(userId, {
          id: `award:${award.id}`,
          kind: "achievement",
          title: `Achievement unlocked — ${award.title}`,
          body: `${award.description}. Congratulations, that took real work.`,
          at: new Date(award.awarded_at).getTime(),
        });
        if (isNew) {
          toast.success(`Achievement unlocked: ${award.title}`, {
            description: award.description,
          });
          const { error: emailError } = await supabase.functions.invoke("notify-achievement", {
            body: { awardId: award.id },
          });
          if (emailError) {
            console.warn("[StudyRadar] Achievement email is pending configuration or retry:", emailError.message);
          }
        }
      }

      // Restore notices on a new device/browser from the durable award history.
      const { data: allAwards, error: readError } = await (supabase as any)
        .from("achievement_awards")
        .select("id, title, description, awarded_at")
        .eq("user_id", userId)
        .order("awarded_at", { ascending: false })
        .limit(40);
      if (readError) {
        console.error("[StudyRadar] Could not load achievement history:", readError.message);
        return;
      }
      for (const award of allAwards ?? []) {
        pushNotice(userId, {
          id: `award:${award.id}`,
          kind: "achievement",
          title: `Achievement unlocked — ${award.title}`,
          body: award.description,
          at: new Date(award.awarded_at).getTime(),
        });
      }
    };

    void syncAchievements();
    return () => {
      alive = false;
    };
  }, [ready, userId, data.sessions]);

  useEffect(() => {
    if (!ready || !userId || !isAdmin) return;
    let alive = true;
    const check = async () => {
      const since = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
      const { data: rows } = await supabase
        .from("security_events")
        .select("id, kind, severity, email, detail, created_at")
        .neq("severity", "info")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(15);
      if (!alive) return;
      for (const r of rows ?? []) {
        const isNew = pushNotice(userId, {
          id: `sec:${r.id}`,
          kind: "security",
          title: `Security: ${r.kind}`,
          body: [r.email, r.detail].filter(Boolean).join(" · ") || "Review the Security tab.",
          at: new Date(r.created_at as string).getTime(),
        });
        if (isNew && r.severity === "critical") {
          toast.error(`Security alert: ${r.kind}`, { description: r.email ?? undefined });
        }
      }

      const { data: awards } = await (supabase as any)
        .from("achievement_awards")
        .select("id, user_id, title, awarded_at, email_status")
        .neq("email_status", "skipped")
        .gte("awarded_at", since)
        .order("awarded_at", { ascending: false })
        .limit(30);
      const awardUserIds = [...new Set((awards ?? []).map((a: any) => a.user_id))];
      const { data: studentProfiles } = awardUserIds.length
        ? await supabase.from("profiles").select("id, name").in("id", awardUserIds)
        : { data: [] };
      const studentNames = new Map((studentProfiles ?? []).map((p: any) => [p.id, p.name]));
      for (const award of awards ?? []) {
        const studentName = studentNames.get(award.user_id) ?? "A student";
        const isNew = pushNotice(userId, {
          id: `admin-award:${award.id}`,
          kind: "achievement",
          title: `${studentName} unlocked an achievement`,
          body: award.title,
          at: new Date(award.awarded_at).getTime(),
        });
        if (isNew) toast.info(`${studentName} earned ${award.title}`);
      }
    };
    void check();
    const t = setInterval(() => void check(), 120_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [ready, userId, isAdmin]);
}

const ICON = { achievement: Trophy, security: ShieldAlert, system: Sparkles } as const;

export function NotificationBell({ className }: { className?: string }) {
  const { session } = useStudyOS();
  const userId = session?.user?.id ?? null;
  useNotificationWatchers();
  const list = useNotices(userId);
  const unread = list.filter((n) => !n.read).length;

  if (!userId) return null;

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) markAllRead(userId);
      }}
    >
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className={cn(
            "relative flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            className,
          )}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-medium">Notifications</p>
          {list.length ? (
            <Button variant="ghost" size="sm" onClick={() => clearNotices(userId)}>
              Clear
            </Button>
          ) : null}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {list.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-muted-foreground">
              Nothing yet. Milestones and account alerts land here.
            </p>
          ) : (
            list.map((n) => {
              const Icon = ICON[n.kind];
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 border-b border-border/60 px-4 py-3 last:border-0",
                    !n.read && "bg-accent/40",
                  )}
                >
                  <Icon
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      n.kind === "security" ? "text-destructive" : "text-primary",
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{n.title}</p>
                    <p className="mt-0.5 break-words text-xs text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{when(n.at)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
