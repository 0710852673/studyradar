import { useCallback, useEffect, useState } from "react";
import { Bell, ShieldAlert, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useStudyOS } from "@/lib/studyos/store";
import { ACHIEVEMENTS } from "@/lib/studyos/achievements";
import { streaks, totalMinutes } from "@/lib/studyos/analytics";
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
    const s = streaks(data.sessions);
    const ctx = {
      totalHours: totalMinutes(data.sessions) / 60,
      currentStreak: s.current,
      longestStreak: s.longest,
      sessions: data.sessions,
    };
    for (const a of ACHIEVEMENTS) {
      if (a.progress(ctx) < a.goal) continue;
      const isNew = pushNotice(userId, {
        id: `ach:${a.id}`,
        kind: "achievement",
        title: `Achievement unlocked — ${a.title}`,
        body: `${a.description}. Congratulations, that took real work.`,
      });
      if (isNew) toast.success(`Achievement unlocked: ${a.title}`, { description: a.description });
    }
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
