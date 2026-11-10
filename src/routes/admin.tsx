import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity, ArrowLeft, BarChart3, Database, Eye, Globe, GraduationCap, Inbox,
  LayoutGrid, Link2, Menu, Radar, RefreshCw, ShieldAlert, Sliders, Trophy, Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { InboxPanel } from "@/components/studyos/AdminInbox";
import { AdminResourceRequests } from "@/components/studyos/AdminResourceRequests";
import { DataPanel, PreviewPanel, SiteSettingsPanel } from "@/components/studyos/AdminDataPanel";
import { StudentDetail } from "@/components/studyos/AdminStudentDetail";
import {
  AchievementsPanel, ActivityPanel, Analytics, Card, Empty, Overview, SearchBar,
  SecurityPanel, VisitorPanel,
} from "@/components/studyos/AdminPanels";
import { useStudyOS } from "@/lib/studyos/store";
import {
  EMPTY_SNAPSHOT, isPlatformProfile, loadSnapshot, platformRows, withinDays,
  type AdminProfile, type AdminSnapshot,
} from "@/lib/studyos/admin-data";
import { fmtHours } from "@/lib/studyos/analytics";
import { sumMinutes } from "@/lib/studyos/admin-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Control Room — Study Radar" },
    { name: "description", content: "Study Radar administration and real platform operations." },
    { property: "og:title", content: "Control Room — Study Radar" },
    { property: "og:description", content: "Platform analytics, students, resources and safety." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: AdminPage,
});

const GROUPS = [
  { label: "Command", items: [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "students", label: "Students", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "visitors", label: "Visitor intelligence", icon: Globe },
  ] },
  { label: "Operations", items: [
    { id: "activity", label: "Activity & devices", icon: Activity },
    { id: "security", label: "Security & audit", icon: ShieldAlert },
    { id: "inbox", label: "Inbox & feedback", icon: Inbox },
    { id: "resources", label: "Resource Hub", icon: Link2 },
    { id: "achievements", label: "Achievements", icon: Trophy },
  ] },
  { label: "System", items: [
    { id: "data", label: "Data & backups", icon: Database },
    { id: "settings", label: "Site settings", icon: Sliders },
    { id: "previews", label: "O/L & A/L previews", icon: Eye },
  ] },
] as const;
const SECTIONS = GROUPS.flatMap((group) => group.items);
type SectionId = (typeof SECTIONS)[number]["id"];
type Range = "7" | "30" | "90" | "all";

function AdminPage() {
  const { isAdmin, ready, settings, refreshSettings, setAdminPreviewTrack } = useStudyOS();
  const navigate = useNavigate();
  const [snap, setSnap] = useState<AdminSnapshot>(EMPTY_SNAPSHOT);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [section, setSection] = useState<SectionId>("overview");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<Range>("30");
  const [focusId, setFocusId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true); setLoadError("");
    try { setSnap(await loadSnapshot()); }
    catch (error) { const message = error instanceof Error ? error.message : "Admin data could not be loaded"; setLoadError(message); toast.error("Control Room data failed to load", { description: message }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (isAdmin) void reload(); else setLoading(false); }, [isAdmin, reload]);

  const people = useMemo(() => snap.profiles.filter(isPlatformProfile), [snap.profiles]);
  const realIds = useMemo(() => new Set(people.map((person) => person.id)), [people]);
  const rangeDays = range === "all" ? null : Number(range);
  const sessions = useMemo(() => platformRows(snap.sessions, people), [snap.sessions, people]);
  const wasted = useMemo(() => platformRows(snap.wasted, people), [snap.wasted, people]);
  const marks = useMemo(() => platformRows(snap.marks, people), [snap.marks, people]);
  const chapters = useMemo(() => platformRows(snap.chapters, people), [snap.chapters, people]);
  const achievements = useMemo(() => platformRows(snap.achievements, people), [snap.achievements, people]);
  const devices = useMemo(() => snap.devices.filter((row) => !row.user_id || realIds.has(row.user_id)), [snap.devices, realIds]);
  const rangedSessions = sessions.filter((row) => withinDays(row.date, rangeDays));
  const rangedWasted = wasted.filter((row) => withinDays(row.date, rangeDays));
  const rangedMarks = marks.filter((row) => withinDays(row.date, rangeDays));
  const rangedAchievements = achievements.filter((row) => withinDays(row.awarded_at, rangeDays));
  const referrals = snap.referrals.filter((row) => realIds.has(row.referrer_id) && realIds.has(row.referred_user_id) && withinDays(row.created_at, rangeDays));
  const adminIds = new Set(snap.roles.filter((role) => role.role === "admin").map((role) => role.user_id));
  const focus = focusId ? people.find((person) => person.id === focusId) : null;
  const term = query.trim().toLowerCase();

  if (!ready) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading account…</div>;
  if (!isAdmin) return <div className="flex min-h-screen items-center justify-center px-5"><div className="panel max-w-sm p-7 text-center"><ShieldAlert className="mx-auto h-6 w-6 text-primary" /><h1 className="mt-3 font-display text-lg font-semibold">Restricted</h1><p className="mt-2 text-sm text-muted-foreground">This area requires an administrator account. Database permissions also block direct data access.</p><Button asChild className="mt-5"><Link to="/dashboard">Back to dashboard</Link></Button></div></div>;

  const chooseSection = (next: SectionId) => { setSection(next); setFocusId(null); setQuery(""); setMenuOpen(false); };
  const openPreview = (track: "OL" | "AL") => { setAdminPreviewTrack(track); void navigate({ to: "/dashboard" }); };
  const currentLabel = focus ? "Student details" : SECTIONS.find((item) => item.id === section)?.label;

  return <div className="min-h-screen bg-background lg:flex">
    <aside className="sticky top-0 z-30 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
      <AdminBrand />
      <AdminNav section={section} onChoose={chooseSection} />
      <div className="border-t border-border p-3"><Button asChild variant="ghost" size="sm" className="w-full justify-start text-xs"><Link to="/dashboard"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" />Exit to student app</Link></Button></div>
    </aside>
    <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden"><Button size="icon" variant="outline" aria-label="Open admin sections" onClick={() => setMenuOpen(true)}><Menu className="h-4 w-4" /></Button><Radar className="h-5 w-5 text-primary" /><div><p className="font-display text-sm font-semibold">Control Room</p><p className="text-[10px] text-muted-foreground">{currentLabel}</p></div></div>
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}><SheetContent side="left" className="w-[min(20rem,88vw)] overflow-y-auto bg-sidebar p-3"><SheetHeader className="sr-only"><SheetTitle>Admin sections</SheetTitle><SheetDescription>Choose a Control Room section</SheetDescription></SheetHeader><AdminBrand /><AdminNav section={section} onChoose={chooseSection} /><Button asChild variant="ghost" size="sm" className="mt-4 w-full justify-start"><Link to="/dashboard"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" />Exit to student app</Link></Button></SheetContent></Sheet>

    <main className="min-w-0 flex-1 px-4 py-5 sm:px-5 lg:px-7 lg:py-7">
      <header className="sticky top-[61px] z-20 -mx-4 mb-5 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-5 sm:px-5 lg:top-0 lg:-mx-7 lg:px-7">
        <div className="flex flex-wrap items-center gap-3"><div className="mr-auto min-w-0"><h1 className="truncate font-display text-xl font-semibold">{currentLabel}</h1><p className="text-xs text-muted-foreground">{people.length} real students · demo and browser previews excluded</p></div>{["overview", "analytics"].includes(section) && !focus ? <label className="flex items-center gap-2 text-xs text-muted-foreground">Range<select aria-label="Analytics date range" value={range} onChange={(event) => setRange(event.target.value as Range)} className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="all">All time</option></select></label> : null}<Button size="sm" variant="outline" onClick={() => void reload()} disabled={loading}><RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />Refresh</Button></div>
      </header>
      {loadError ? <div role="alert" className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"><p className="font-medium">Some platform data is unavailable</p><p className="mt-1 break-words text-xs">{loadError}</p><Button className="mt-3" size="sm" variant="outline" onClick={() => void reload()}>Try again</Button></div> : null}
      {loading ? <div className="panel p-10 text-center text-sm text-muted-foreground">Loading verified platform data…</div> : focus ? <StudentDetail profile={focus} snap={snap} isAdminUser={adminIds.has(focus.id)} onBack={() => setFocusId(null)} onChanged={() => void reload()} /> : <>
        {section === "overview" ? <Overview people={people} allSessions={sessions} sessions={rangedSessions} wasted={rangedWasted} marks={rangedMarks} chapters={chapters} snap={snap} rangeDays={rangeDays} /> : null}
        {section === "students" ? <StudentDirectory people={people} sessions={rangedSessions} wasted={rangedWasted} adminIds={adminIds} query={query} onQuery={setQuery} onFocus={setFocusId} /> : null}
        {section === "analytics" ? <Analytics people={people} sessions={rangedSessions} wasted={rangedWasted} marks={rangedMarks} chapters={chapters} devices={devices} referrals={referrals} rangeDays={rangeDays} /> : null}
        {section === "visitors" ? <VisitorPanel devices={devices.filter((row) => withinDays(row.created_at, rangeDays))} /> : null}
        {section === "activity" ? <ActivityPanel devices={devices} people={people} query={query} onQuery={setQuery} /> : null}
        {section === "security" ? <SecurityPanel events={snap.events} audit={snap.audit} query={query} onQuery={setQuery} /> : null}
        {section === "inbox" ? <InboxPanel /> : null}
        {section === "resources" ? <AdminResourceRequests /> : null}
        {section === "achievements" ? <AchievementsPanel awards={rangedAchievements} people={people} query={query} onQuery={setQuery} /> : null}
        {section === "data" ? <DataPanel snap={snap} /> : null}
        {section === "settings" ? <SiteSettingsPanel settings={settings} onSaved={refreshSettings} /> : null}
        {section === "previews" ? <PreviewPanel onPreview={openPreview} /> : null}
      </>}
    </main>
  </div>;
}

function AdminBrand() { return <div className="flex items-center gap-2 px-3 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Radar className="h-5 w-5" /></span><div><p className="font-display text-sm font-semibold">Control Room</p><p className="text-[11px] text-muted-foreground">Study Radar 1.0 admin</p></div></div>; }
function AdminNav({ section, onChoose }: { section: SectionId; onChoose: (section: SectionId) => void }) { return <nav aria-label="Admin sections" className="flex-1 space-y-4 overflow-y-auto px-2 pb-4">{GROUPS.map((group) => <div key={group.label}><p className="mb-1 px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{group.label}</p><div className="space-y-1">{group.items.map((item) => <button key={item.id} onClick={() => onChoose(item.id)} aria-current={section === item.id ? "page" : undefined} className={cn("flex min-h-10 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors", section === item.id ? "bg-sidebar-accent font-medium text-primary" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground")}><item.icon className="h-4 w-4 shrink-0" />{item.label}</button>)}</div></div>)}</nav>; }

function StudentDirectory({ people, sessions, wasted, adminIds, query, onQuery, onFocus }: { people: AdminProfile[]; sessions: AdminSnapshot["sessions"]; wasted: AdminSnapshot["wasted"]; adminIds: Set<string>; query: string; onQuery: (value: string) => void; onFocus: (id: string) => void }) {
  const [track, setTrack] = useState("all");
  const term = query.trim().toLowerCase();
  const rows = people.filter((person) => (track === "all" || person.track === track) && (!term || `${person.name} ${person.email ?? ""} ${person.school ?? ""} ${person.city ?? ""} ${person.district ?? ""} ${person.grade ?? ""} ${person.stream ?? ""} ${(person.subjects ?? []).join(" ")}`.toLowerCase().includes(term)));
  return <div className="space-y-4"><div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_160px]"><SearchBar value={query} onChange={onQuery} placeholder="Search name, email, school, town or subject…" /><select aria-label="Filter student exam track" value={track} onChange={(event) => setTrack(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="all">O/L + A/L</option><option value="OL">O/L only</option><option value="AL">A/L only</option></select></div><div className="hidden grid-cols-[minmax(0,2fr)_100px_110px_110px_100px] gap-3 px-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground md:grid"><span>Student</span><span>Track</span><span>Study</span><span>Wasted</span><span>Status</span></div><div className="space-y-2">{rows.map((person) => { const study = sumMinutes(sessions.filter((row) => row.user_id === person.id)); const waste = sumMinutes(wasted.filter((row) => row.user_id === person.id)); return <button key={person.id} onClick={() => onFocus(person.id)} className="grid w-full gap-2 rounded-xl border border-border bg-elevated p-3 text-left transition-colors hover:border-primary/40 md:grid-cols-[minmax(0,2fr)_100px_110px_110px_100px] md:items-center"><div className="min-w-0"><p className="truncate text-sm font-medium">{person.name}{adminIds.has(person.id) ? <span className="ml-2 text-[10px] text-primary">admin</span> : null}</p><p className="truncate text-xs text-muted-foreground">{person.email ?? "No email"} · {person.school ?? "No school"}{person.grade ? ` · ${person.grade}` : ""}</p></div><span className="text-xs">{person.track} {person.exam_year}</span><span className="num text-xs"><span className="mr-1 text-muted-foreground md:hidden">Study </span>{fmtHours(study)}</span><span className="num text-xs"><span className="mr-1 text-muted-foreground md:hidden">Wasted </span>{fmtHours(waste)}</span><span className={cn("text-xs", person.suspended ? "text-destructive" : "text-muted-foreground")}>{person.suspended ? "Suspended" : person.onboarded ? "Active account" : "Onboarding"}</span></button>; })}{!rows.length ? <Empty text="No students match these filters." /> : null}</div><p className="text-[10px] text-muted-foreground">Study and wasted columns use the selected global range (default 30 days). Open a student for all-time details.</p></div>;
}
