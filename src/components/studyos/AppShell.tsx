import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Settings,
  Timer,
  Trophy,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { QuickLogButton } from "./QuickLog";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/timer", label: "Timer", icon: Timer },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/marks", label: "Marks", icon: GraduationCap },
  { to: "/revision", label: "Revision", icon: ListChecks },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/achievements", label: "Awards", icon: Trophy },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const MOBILE = NAV.filter((n) =>
  ["/", "/timer", "/analytics", "/marks", "/settings"].includes(n.to),
);

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

  return (
    <div className="min-h-screen w-full bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-sidebar px-3 py-5 lg:flex">
        <Link to="/" className="mb-7 flex items-center gap-2.5 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            S
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">StudyOS</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
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
          Local-first · your data stays on this device
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
          <QuickLogButton />
        </header>

        <main className="px-4 pb-28 pt-5 sm:px-6 lg:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {MOBILE.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
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
        })}
      </nav>
    </div>
  );
}
