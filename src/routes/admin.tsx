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
import { download, openPdfReport, sumMinutes, toCsv } from "@/lib/studyos/admin-data";
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

type SectionId = "overview" | "students" | "analytics" | "visitors" | "activity" | "security" | "inbox" | "resources" | "achievements" | "data" | "settings" | "previews";
type AdminNavItem = { id: SectionId; label: string; icon: typeof LayoutGrid };
const GROUPS: { label: string; items: AdminNavItem[] }[] = [
  { label: "Command", items: [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "students", label: "Student intelligence", icon: Users },
    { id: "analytics", label: "Analytics & reports", icon: BarChart3 },
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
    { id: "settings", label: "Platform settings", icon: Sliders },
    { id: "previews", label: "Preview laboratory", icon: Eye },
  ] },
];
const SECTIONS: AdminNavItem[] = GROUPS.flatMap((group) => group.items);
type Range = "7" | "30" | "90" | "all";

function AdminPage() {
  const { isAdmin, isAdminPreviewData, ready, settings, refreshSettings, setAdminPreviewTrack } = useStudyOS();
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
  const openPreview = async (track: "OL" | "AL") => { await setAdminPreviewTrack(track); await navigate({ to: "/dashboard" }); };
  const currentLabel = focus ? "Student details" : SECTIONS.find((item) => item.id === section)?.label;

  const sectionMeta: Record<SectionId, { eyebrow: string; description: string }> = {
    overview: { eyebrow: "Platform pulse", description: "A live operational picture of Study Radar, using verified platform records." },
    students: { eyebrow: "Student intelligence", description: "Search, segment and inspect real student accounts without mixing preview records." },
    analytics: { eyebrow: "Performance intelligence", description: "Understand growth, engagement and academic activity across selected dates." },
    visitors: { eyebrow: "Acquisition intelligence", description: "Privacy-conscious visitor reporting. Anonymous visitor identity is not collected here." },
    activity: { eyebrow: "Account operations", description: "Consented registered-user activity and coarse device information." },
    security: { eyebrow: "Trust & safety", description: "Review actual security events, application errors and administrator actions." },
    inbox: { eyebrow: "Student communications", description: "Manage real feedback, support messages and incoming resource suggestions." },
    resources: { eyebrow: "Content operations", description: "Create and manage resources, and moderate student-submitted suggestions." },
    achievements: { eyebrow: "Engagement operations", description: "Inspect achievement awards, participation and actual notification delivery states." },
    data: { eyebrow: "Data governance", description: "Export verified platform records and review backup and restore operations." },
    settings: { eyebrow: "Platform configuration", description: "Manage existing platform-wide controls with audited changes." },
    previews: { eyebrow: "Isolated preview lab", description: "Inspect O/L and A/L sample experiences without creating student accounts or production rows." },
  };
  const meta = focus ? { eyebrow: "Student intelligence", description: "A detailed view of one real platform account." } : sectionMeta[section];

  return <div className="min-h-screen bg-[#080d13] text-foreground lg:flex">
    <aside className="sticky top-0 z-40 hidden h-screen w-[286px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0c131b] lg:flex">
      <div className="border-b border-white/[0.07] px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_28px_-10px_hsl(var(--primary)/.8)]"><Radar className="h-5 w-5" /></span>
          <div className="min-w-0"><p className="font-display text-[15px] font-bold tracking-tight text-white">STUDY RADAR</p><p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[.2em] text-primary">Control Centre</p></div>
        </div>
        <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5">
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.65)]" /><span className="text-[11px] font-medium text-white/80">Platform workspace</span></div>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-300">Protected</span>
        </div>
      </div>
      <AdminNav section={section} onChoose={chooseSection} />
      <div className="border-t border-white/[0.07] p-4">
        <div className="mb-3 rounded-xl border border-primary/20 bg-primary/[0.06] p-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-primary"><ShieldAlert className="h-3.5 w-3.5" /> Data integrity</div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-white/55">Preview records are isolated. Platform metrics use real student data only.</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="w-full justify-start text-xs text-white/65 hover:bg-white/[0.06] hover:text-white"><Link to="/dashboard"><ArrowLeft className="mr-2 h-3.5 w-3.5" />Exit to student app</Link></Button>
      </div>
    </aside>

    <div className="min-w-0 flex-1">
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/[0.07] bg-[#0b1118]/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Button size="icon" variant="outline" aria-label="Open admin sections" onClick={() => setMenuOpen(true)} className="border-white/10 bg-white/[0.04]"><Menu className="h-4 w-4" /></Button>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Radar className="h-4 w-4" /></div>
        <div className="min-w-0"><p className="font-display text-sm font-semibold text-white">Control Centre</p><p className="truncate text-[10px] text-white/45">{currentLabel}</p></div>
        <Button size="icon" variant="ghost" aria-label="Refresh platform data" className="ml-auto" onClick={() => void reload()} disabled={loading}><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /></Button>
      </div>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}><SheetContent side="left" className="w-[min(20rem,88vw)] overflow-y-auto border-white/10 bg-[#0c131b] p-3 text-white"><SheetHeader className="sr-only"><SheetTitle>Admin sections</SheetTitle><SheetDescription>Choose a Control Centre section</SheetDescription></SheetHeader><AdminBrand /><AdminNav section={section} onChoose={chooseSection} /><Button asChild variant="ghost" size="sm" className="mt-4 w-full justify-start"><Link to="/dashboard"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" />Exit to student app</Link></Button></SheetContent></Sheet>

      <main className="min-w-0 px-4 pb-10 pt-5 sm:px-6 lg:px-9 lg:pt-7 xl:px-10">
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="mr-auto min-w-0">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-primary"><span>Study Radar</span><span className="text-white/20">/</span><span>Administration</span></div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-[30px]">{currentLabel}</h1>
              <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-white/50 sm:text-sm">{meta.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-[10px] text-white/55 xl:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Secure admin session</div>
              <Button size="sm" variant="outline" onClick={() => { const activeIds = new Set(rangedSessions.map((row) => row.user_id)); const subjects = [...new Set(rangedSessions.map((row) => row.subject))].map((subject) => [subject, fmtHours(sumMinutes(rangedSessions.filter((row) => row.subject === subject)))]); const sections = [{ heading: "Platform overview", rows: [["Registered accounts", String(people.length)], ["O/L accounts", String(people.filter((p) => p.track === "OL").length)], ["A/L accounts", String(people.filter((p) => p.track === "AL").length)], ["Active students", String(activeIds.size)], ["Study time", fmtHours(sumMinutes(rangedSessions))], ["Wasted time", fmtHours(sumMinutes(rangedWasted))], ["Marks recorded", String(rangedMarks.length)], ["Date range", range === "all" ? "All time" : "Last " + range + " days"]] }, { heading: "Subject activity", rows: subjects }]; if (!openPdfReport("Platform analytics report", "Study Radar · verified platform data", sections)) toast.error("PDF window blocked. Allow pop-ups and retry."); }} className="h-10 border-white/10 bg-primary/10 text-primary hover:bg-primary/15"><Database className="mr-2 h-3.5 w-3.5" />Export PDF</Button>
              <Button size="sm" variant="outline" onClick={() => void reload()} disabled={loading} className="h-10 border-white/10 bg-white/[0.035] text-white/80 hover:bg-white/[0.08]"><RefreshCw className={cn("mr-2 h-3.5 w-3.5", loading && "animate-spin")} />Refresh data</Button>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#101923] p-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <SearchBar value={query} onChange={setQuery} placeholder="Search within this section…" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-black/10 px-3 text-[10px] font-medium text-white/45">DATE RANGE
                <select aria-label="Admin date range" value={range} onChange={(event) => setRange(event.target.value as Range)} className="max-w-[116px] bg-transparent text-xs text-white outline-none"><option className="bg-[#101923]" value="7">7 days</option><option className="bg-[#101923]" value="30">30 days</option><option className="bg-[#101923]" value="90">90 days</option><option className="bg-[#101923]" value="all">All time</option></select>
              </label>
              <div className="hidden h-8 w-px bg-white/10 sm:block" />
              <span className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-[10px] font-medium text-emerald-300">{people.length.toLocaleString()} real student accounts</span>
            </div>
          </div>
        </header>

        {loadError ? <div role="alert" className="mb-5 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"><p className="font-semibold">Platform data could not be fully loaded</p><p className="mt-1 break-words text-xs">{loadError}</p><Button className="mt-3" size="sm" variant="outline" onClick={() => void reload()}>Retry data load</Button></div> : null}
        {loading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><div className="h-32 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" /><div className="h-32 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" /><div className="h-32 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" /><div className="h-56 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025] md:col-span-2 xl:col-span-3" /></div> : focus ? <StudentDetail profile={focus} snap={snap} isAdminUser={adminIds.has(focus.id)} onBack={() => setFocusId(null)} onChanged={() => void reload()} /> : <>
          {section === "overview" ? <Overview people={people} allSessions={sessions} sessions={rangedSessions} wasted={rangedWasted} marks={rangedMarks} chapters={chapters} snap={snap} rangeDays={rangeDays} /> : null}
          {section === "students" ? <StudentDirectory people={people} sessions={rangedSessions} wasted={rangedWasted} adminIds={adminIds} query={query} onQuery={setQuery} onFocus={setFocusId} /> : null}
          {section === "analytics" ? <Analytics people={people} sessions={rangedSessions} wasted={rangedWasted} marks={rangedMarks} chapters={chapters} devices={devices} referrals={referrals} rangeDays={rangeDays} /> : null}
          {section === "visitors" ? <VisitorPanel /> : null}
          {section === "activity" ? <ActivityPanel devices={devices} people={people} query={query} onQuery={setQuery} /> : null}
          {section === "security" ? <SecurityPanel events={snap.events} audit={snap.audit} query={query} onQuery={setQuery} /> : null}
          {section === "inbox" ? <InboxPanel /> : null}
          {section === "resources" ? <AdminResourceRequests /> : null}
          {section === "achievements" ? <AchievementsPanel awards={rangedAchievements} people={people} query={query} onQuery={setQuery} /> : null}
          {section === "data" ? <DataPanel snap={snap} /> : null}
          {section === "settings" ? <SiteSettingsPanel settings={settings} onSaved={refreshSettings} /> : null}
          {section === "previews" ? <PreviewPanel onPreview={openPreview} /> : null}
        </>}
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4 text-[10px] text-white/35"><span>STUDY RADAR · ADMIN CONTROL CENTRE</span><span>Platform analytics exclude browser-only preview records.</span></footer>
      </main>
    </div>
  </div>;
}

function AdminBrand() { return <div className="flex items-center gap-2 px-3 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Radar className="h-5 w-5" /></span><div><p className="font-display text-sm font-semibold text-white">Study Radar</p><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-primary">Control Centre</p></div></div>; }
function AdminNav({ section, onChoose }: { section: SectionId; onChoose: (section: SectionId) => void }) { return <nav aria-label="Admin sections" className="flex-1 space-y-5 overflow-y-auto px-3 py-5 pb-4">{GROUPS.map((group) => <div key={group.label}><p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[.2em] text-white/35">{group.label}</p><div className="space-y-1">{group.items.map((item) => <button key={item.id} onClick={() => onChoose(item.id)} aria-current={section === item.id ? "page" : undefined} className={cn("flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] transition-all", section === item.id ? "border border-primary/20 bg-primary/[0.12] font-semibold text-primary shadow-[inset_2px_0_0_hsl(var(--primary))]" : "border border-transparent text-white/55 hover:bg-white/[0.045] hover:text-white")}><item.icon className="h-4 w-4 shrink-0" />{item.label}</button>)}</div></div>)}</nav>; }

function StudentDirectory({ people, sessions, wasted, adminIds, query, onQuery, onFocus }: { people: AdminProfile[]; sessions: AdminSnapshot["sessions"]; wasted: AdminSnapshot["wasted"]; adminIds: Set<string>; query: string; onQuery: (value: string) => void; onFocus: (id: string) => void }) {
  const [track, setTrack] = useState("all");
  const [stream, setStream] = useState("all");
  const [grade, setGrade] = useState("all");
  const [status, setStatus] = useState("all");
  const grades = [...new Set(people.map((person) => person.grade).filter((value): value is string => Boolean(value)))].sort();
  const term = query.trim().toLowerCase();
  const rows = people.filter((person) => {
    const matchesTrack = track === "all" || person.track === track;
    const matchesStream = stream === "all" || person.stream === stream;
    const matchesGrade = grade === "all" || person.grade === grade;
    const matchesStatus = status === "all" || (status === "suspended" ? person.suspended : status === "onboarding" ? !person.onboarded : status === "onboarded" ? person.onboarded && !person.suspended : !person.suspended);
    const matchesTerm = !term || `${person.name} ${person.email ?? ""} ${person.school ?? ""} ${person.city ?? ""} ${person.district ?? ""} ${person.grade ?? ""} ${person.stream ?? ""} ${(person.subjects ?? []).join(" ")}`.toLowerCase().includes(term);
    return matchesTrack && matchesStream && matchesGrade && matchesStatus && matchesTerm;
  });
  const streams = [...new Set(people.map((person) => person.stream).filter((value): value is string => Boolean(value)))].sort();
  const exportRows = rows.map((person) => ({
    id: person.id, name: person.name, email: person.email ?? "", track: person.track,
    stream: person.stream ?? "", grade: person.grade ?? "", school: person.school ?? "",
    joined: person.created_at, last_active: person.last_seen_at ?? "",
    study_minutes: sumMinutes(sessions.filter((row) => row.user_id === person.id)),
    wasted_minutes: sumMinutes(wasted.filter((row) => row.user_id === person.id)),
    account_status: person.suspended ? "Suspended" : person.onboarded ? "Onboarded" : "Onboarding",
  }));
  return <div className="space-y-4">
    <div className="rounded-2xl border border-white/[0.07] bg-[#101923] p-4">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_120px_150px_120px_145px_auto]">
        <SearchBar value={query} onChange={onQuery} placeholder="Search name, email, school, town or subject…" />
        <select aria-label="Filter student exam track" value={track} onChange={(event) => setTrack(event.target.value)} className="h-9 rounded-lg border border-white/10 bg-[#0b1118] px-3 text-xs text-white/80"><option value="all">All tracks</option><option value="OL">O/L only</option><option value="AL">A/L only</option></select>
        <select aria-label="Filter student stream" value={stream} onChange={(event) => setStream(event.target.value)} className="h-9 rounded-lg border border-white/10 bg-[#0b1118] px-3 text-xs text-white/80"><option value="all">All streams</option>{streams.map((value) => <option key={value} value={value}>{value}</option>)}</select>
        <select aria-label="Filter student grade" value={grade} onChange={(event) => setGrade(event.target.value)} className="h-9 rounded-lg border border-white/10 bg-[#0b1118] px-3 text-xs text-white/80"><option value="all">All grades</option>{grades.map((value) => <option key={value} value={value}>{value}</option>)}</select>
        <select aria-label="Filter student status" value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded-lg border border-white/10 bg-[#0b1118] px-3 text-xs text-white/80"><option value="all">All statuses</option><option value="onboarded">Onboarded</option><option value="onboarding">Onboarding</option><option value="suspended">Suspended</option></select>
        <Button size="sm" variant="outline" className="h-9 border-white/10 bg-white/[0.035] text-white/75" disabled={!rows.length} onClick={() => download("study-radar-students.csv", toCsv(exportRows), "text/csv;charset=utf-8")}><Database className="mr-2 h-3.5 w-3.5" />Export</Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-white/40"><span>{rows.length.toLocaleString()} matching student accounts</span><span>Study and wasted time are independent metrics · {rangeLabelForDirectory(sessions, wasted)}</span></div>
    </div>
    <div className="hidden grid-cols-[minmax(0,2fr)_90px_110px_110px_105px_105px_110px] gap-3 px-4 text-[9px] font-semibold uppercase tracking-[.15em] text-white/35 xl:grid"><span>Student</span><span>Track</span><span>Joined</span><span>Last active</span><span>Study</span><span>Wasted</span><span>Status</span></div>
    <div className="space-y-2">
      {rows.map((person) => {
        const study = sumMinutes(sessions.filter((row) => row.user_id === person.id));
        const waste = sumMinutes(wasted.filter((row) => row.user_id === person.id));
        return <button key={person.id} onClick={() => onFocus(person.id)} className="grid w-full gap-2 rounded-2xl border border-white/[0.07] bg-[#101923] p-4 text-left transition-all hover:border-primary/25 hover:bg-[#14202b] xl:grid-cols-[minmax(0,2fr)_90px_110px_110px_105px_105px_110px] xl:items-center">
          <div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-semibold text-primary">{person.name.slice(0,1).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-xs font-semibold text-white">{person.name}{adminIds.has(person.id) ? <span className="ml-2 rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary">ADMIN</span> : null}</p><p className="truncate text-[10px] text-white/40">{person.email ?? "No email"} · {person.school ?? "School not provided"}</p></div></div>
          <span className="text-[11px] text-white/70">{person.track} {person.exam_year}</span>
          <span className="text-[10px] text-white/50 xl:truncate">Joined {new Date(person.created_at).toLocaleDateString()}</span>
          <span className="text-[10px] text-white/50 xl:truncate">Seen {person.last_seen_at ? new Date(person.last_seen_at).toLocaleDateString() : "—"}</span>
          <span className="num text-[11px] text-white/80"><span className="mr-1 text-white/35 xl:hidden">Study</span>{fmtHours(study)}</span>
          <span className="num text-[11px] text-white/80"><span className="mr-1 text-white/35 xl:hidden">Wasted</span>{fmtHours(waste)}</span>
          <span className={cn("text-[10px] font-medium", person.suspended ? "text-destructive" : person.onboarded ? "text-emerald-400" : "text-amber-300")}>{person.suspended ? "Suspended" : person.onboarded ? "Onboarded" : "Onboarding"}</span>
        </button>;
      })}
      {!rows.length ? <Empty text="No students match these filters." /> : null}
    </div>
    <p className="text-[10px] leading-relaxed text-white/35">Study and wasted-time columns use the selected global date range. Student details show the available all-time profile and academic records. Anonymous visitors are not included in this directory.</p>
  </div>;
}
function rangeLabelForDirectory(sessions: AdminSnapshot["sessions"], wasted: AdminSnapshot["wasted"]) {
  return `${sessions.length + wasted.length} study and wasted-time entries in this range`;
}
