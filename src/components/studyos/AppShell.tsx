import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Home,
  ListChecks,
  Plus,
  Shield,
  Timer,
  Trophy,
  User,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LogForm, QuickLogButton } from "./QuickLog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStudyOS } from "@/lib/studyos/store";
import { NotificationBell } from "./Notifications";


const PRIMARY = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/subjects", label: "Subjects", icon: BookOpen },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/settings", label: "Profile", icon: User },
] as const;

const SECONDARY = [
  { to: "/timer", label: "Timer", icon: Timer },
  { to: "/marks", label: "Marks", icon: GraduationCap },
  { to: "/revision", label: "Syllabus", icon: ListChecks },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/achievements", label: "Achievements", icon: Trophy },
] as const;

function isActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(to + "/");
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAdmin } = useStudyOS();
  const [logOpen, setLogOpen] = useState(false);

  const desktopNav = [
    ...PRIMARY,
    ...SECONDARY,
    ...(isAdmin ? ([{ to: "/admin", label: "Admin", icon: Shield }] as const) : []),
  ];

  return (
    <div className="min-h-screen w-full bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-sidebar px-3 py-5 lg:flex">
        <Link to="/dashboard" className="mb-7 flex items-center gap-2.5 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            S
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Study Radar</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {desktopNav.map((item) => {
            const active = isActive(pathname, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                  active
                    ? "bg-sidebar-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                <item.icon className={cn("h-4 w-4", active && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pt-4 text-[11px] text-muted-foreground">
          Synced to your account
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3.5 backdrop-blur-xl sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold sm:text-xl">{title}</h1>
            {subtitle ? (
              <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <NotificationBell />
            <div className="hidden sm:block">
              <QuickLogButton />
            </div>
          </div>

        </header>

        <main className="px-4 pb-28 pt-5 sm:px-6 lg:pb-10">{children}</main>

        <footer className="border-t border-border px-4 py-6 text-center text-[11px] text-muted-foreground sm:px-6 lg:pb-8">
          Study Radar · built by{" "}
          <span className="text-foreground">Shehara Geeneth</span> ·{" "}
          <a href="mailto:sheharageeneth@gmail.com" className="underline-offset-2 hover:underline">
            sheharageeneth@gmail.com
          </a>
        </footer>
      </div>

      {/* Mobile: Home · Subjects · Log · Progress · Profile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-end justify-around border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {PRIMARY.slice(0, 2).map((item) => (
          <NavItem key={item.to} item={item} pathname={pathname} />
        ))}
        <button
          onClick={() => setLogOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] text-primary"
          aria-label="Log study"
        >
          <span className="flex h-11 w-11 -translate-y-3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Plus className="h-5 w-5" />
          </span>
          <span className="-mt-2">Log</span>
        </button>
        {PRIMARY.slice(2).map((item) => (
          <NavItem key={item.to} item={item} pathname={pathname} />
        ))}
      </nav>

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Log study</DialogTitle>
          </DialogHeader>
          <LogForm onDone={() => setLogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NavItem({
  item,
  pathname,
}: {
  item: { to: string; label: string; icon: typeof Home };
  pathname: string;
}) {
  const active = isActive(pathname, item.to);
  return (
    <Link
      to={item.to}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition-colors",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <item.icon className="h-5 w-5" />
      {item.label}
    </Link>
  );
}
