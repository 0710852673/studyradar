import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StudyOSProvider, useStudyOS } from "../lib/studyos/store";
import { Onboarding } from "../components/studyos/Onboarding";
import { ProfileNudge } from "../components/studyos/ProfileNudge";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "Study Radar" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#111318" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/** Public pages anyone can open without a session. */
const PUBLIC_PATHS = ["/", "/auth", "/reset-password", "/terms", "/privacy"];

/** Full-screen message used for suspensions and maintenance. */
function Interstitial({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="panel max-w-md p-7 text-center">
        <h1 className="font-display text-xl font-semibold">{title}</h1>
        <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{body}</p>
        {children}
      </div>
    </div>
  );
}

function Gate() {
  const { ready, session, profile, isAdmin, settings, signOut } = useStudyOS();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const onAuth = pathname === "/auth";

  useEffect(() => {
    if (!ready) return;
    if (!session && !isPublic) void navigate({ to: "/auth", replace: true });
    if (session && onAuth) void navigate({ to: "/dashboard", replace: true });
  }, [ready, session, isPublic, onAuth, navigate]);

  // Disclosed activity logging — see the Privacy Policy.
  useEffect(() => {
    if (!ready) return;
    recordVisitOnce(pathname, session?.user?.id ?? null, session?.user?.email ?? null);
  }, [ready, pathname, session]);

  // Always render <Outlet /> so the SSR tree matches the first client render;
  // the session only exists in the browser and arrives after hydration.
  const authedArea = ready && session && !isPublic;

  if (authedArea && profile?.suspended) {
    return (
      <Interstitial
        title="Your account is suspended"
        body={
          profile.suspendedReason ||
          "An administrator has suspended this account. Email sheharageeneth@gmail.com if you think this is a mistake."
        }
      >
        <button
          onClick={() => void signOut()}
          className="mt-5 rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
        >
          Sign out
        </button>
      </Interstitial>
    );
  }

  if (ready && settings.maintenanceMode && !isAdmin && !isPublic) {
    return <Interstitial title="Back in a moment" body={settings.maintenanceMessage} />;
  }

  const showOnboarding = authedArea && (!profile || !profile.onboarded);

  return (
    <>
      {ready && settings.announcementActive && settings.announcement ? (
        <div className="bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground">
          {settings.announcement}
        </div>
      ) : null}
      <Outlet />
      {showOnboarding ? <Onboarding /> : null}
      {authedArea && !showOnboarding ? <ProfileNudge /> : null}
    </>
  );
}


function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <StudyOSProvider>
        <Gate />
        <Toaster position="top-center" />
      </StudyOSProvider>
    </QueryClientProvider>
  );
}
