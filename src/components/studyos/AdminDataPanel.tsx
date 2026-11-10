import { useEffect, useState } from "react";
import { Database, Download, GraduationCap, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useStudyOS } from "@/lib/studyos/store";
import { createFullBackup, download, toCsv, type AdminSnapshot } from "@/lib/studyos/admin-data";
import { restoreBackup, type RestoreReport } from "@/lib/studyos/restore.functions";
import { useServerFn } from "@tanstack/react-start";
import { Block } from "./AdminPanels";

export function SiteSettingsPanel({ settings, onSaved }: { settings: ReturnType<typeof useStudyOS>["settings"]; onSaved: () => Promise<void> | void }) {
  const [draft, setDraft] = useState(settings);
  const [busy, setBusy] = useState(false);
  useEffect(() => setDraft(settings), [settings]);
  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("site_settings").update({ maintenance_mode: draft.maintenanceMode, maintenance_message: draft.maintenanceMessage, signups_enabled: draft.signupsEnabled, google_login_enabled: draft.googleLoginEnabled, announcement: draft.announcement, announcement_active: draft.announcementActive, max_writes_per_minute: draft.maxWritesPerMinute }).eq("id", true);
    setBusy(false);
    if (error) toast.error("Settings could not be saved", { description: error.message });
    else { toast.success("Site settings saved and audit recorded"); await onSaved(); }
  };
  return <div className="max-w-3xl space-y-4"><Block title="Availability"><Toggle label="Maintenance mode" hint="Students see the maintenance message; admins keep access." checked={draft.maintenanceMode} onChange={(value) => setDraft({ ...draft, maintenanceMode: value })} /><Textarea className="mt-3" rows={2} value={draft.maintenanceMessage} onChange={(event) => setDraft({ ...draft, maintenanceMessage: event.target.value })} /></Block><Block title="Authentication"><Toggle label="Allow new signups" hint="Controls both email and Google account creation; returning sign-in stays available." checked={draft.signupsEnabled} onChange={(value) => setDraft({ ...draft, signupsEnabled: value })} /><div className="h-3" /><Toggle label="Google sign-in" hint="Controls the Google button on the auth page." checked={draft.googleLoginEnabled} onChange={(value) => setDraft({ ...draft, googleLoginEnabled: value })} /></Block><Block title="In-app announcement banner"><Toggle label="Show banner" hint="Displays this text inside Study Radar. It does not send email or push notifications." checked={draft.announcementActive} onChange={(value) => setDraft({ ...draft, announcementActive: value })} /><Input className="mt-3" value={draft.announcement ?? ""} placeholder="Short in-app product update" onChange={(event) => setDraft({ ...draft, announcement: event.target.value || null })} /></Block><Block title="Browser write pacing"><p className="mb-3 text-xs leading-relaxed text-muted-foreground">This limits rapid writes from the app on one browser to reduce accidental bursts. It is not server-side abuse enforcement and does not replace database permissions.</p><Input aria-label="Maximum browser writes per minute" type="number" min={5} max={600} value={draft.maxWritesPerMinute} onChange={(event) => setDraft({ ...draft, maxWritesPerMinute: Number(event.target.value) || 60 })} className="max-w-32" /></Block><Button onClick={() => void save()} disabled={busy}>{busy ? "Saving…" : "Save settings"}</Button></div>;
}
function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-start justify-between gap-4"><div><p className="text-sm">{label}</p>{hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}</div><Switch checked={checked} onCheckedChange={onChange} /></div>; }

export function DataPanel({ snap }: { snap: AdminSnapshot }) {
  const [backupBusy, setBackupBusy] = useState(false);
  const stamp = new Date().toISOString().slice(0, 10);
  const exports: { name: string; rows: Record<string, unknown>[] }[] = [
    { name: "students-operational", rows: snap.profiles as unknown as Record<string, unknown>[] },
    { name: "sessions", rows: snap.sessions as unknown as Record<string, unknown>[] },
    { name: "wasted-time", rows: snap.wasted as unknown as Record<string, unknown>[] },
    { name: "marks", rows: snap.marks as unknown as Record<string, unknown>[] },
    { name: "chapters", rows: snap.chapters as unknown as Record<string, unknown>[] },
    { name: "achievements", rows: snap.achievements as unknown as Record<string, unknown>[] },
    { name: "security-events", rows: snap.events as unknown as Record<string, unknown>[] },
    { name: "coarse-activity", rows: snap.devices as unknown as Record<string, unknown>[] },
  ];
  const fullBackup = async () => {
    setBackupBusy(true);
    try { const backup = await createFullBackup(snap); download(`study-radar-backup-${stamp}.json`, JSON.stringify(backup, null, 2), "application/json"); toast.success("Backup downloaded"); }
    catch (error) { toast.error("Backup failed", { description: error instanceof Error ? error.message : "Please try again" }); }
    finally { setBackupBusy(false); }
  };
  return <div className="max-w-4xl space-y-4"><Block title="Full JSON backup"><p className="mb-3 text-xs leading-relaxed text-muted-foreground">Downloads the complete profile rows plus the current study, wasted-time, marks, syllabus, achievement, audit and operational snapshot. It contains personal data: store it encrypted and never share it in chat or logs.</p><Button onClick={() => void fullBackup()} disabled={backupBusy}>{backupBusy ? <LoaderCircle className="mr-1.5 h-4 w-4 animate-spin" /> : <Database className="mr-1.5 h-4 w-4" />}{backupBusy ? "Preparing…" : "Download full backup"}</Button></Block><Block title="Operational CSV exports"><p className="mb-3 text-xs text-muted-foreground">The student operational export excludes phone and guardian fields. Coarse activity exports contain no IP or location fields.</p><div className="flex flex-wrap gap-2">{exports.map((item) => <Button key={item.name} size="sm" variant="outline" disabled={!item.rows.length} onClick={() => download(`study-radar-${item.name}-${stamp}.csv`, toCsv(item.rows), "text/csv")}><Download className="mr-1.5 h-3.5 w-3.5" />{item.name} ({item.rows.length})</Button>)}</div></Block><RestoreBlock /><Block title="Managed backups"><p className="text-xs text-muted-foreground">Database backups are managed by the hosting platform. These downloads are separate offline copies; a restore only adds missing study, wasted-time, marks and chapter rows after a dry run.</p></Block></div>;
}

function RestoreBlock() {
  const restore = useServerFn(restoreBackup);
  const [file, setFile] = useState<{ sessions?: unknown[]; wasted?: unknown[]; marks?: unknown[]; chapters?: unknown[] } | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ dryRun: boolean; reports: RestoreReport[] } | null>(null);
  const payload = (dryRun: boolean) => ({ dryRun, sessions: (file?.sessions ?? []) as Record<string, unknown>[], wasted: (file?.wasted ?? []) as Record<string, unknown>[], marks: (file?.marks ?? []) as Record<string, unknown>[], chapters: (file?.chapters ?? []) as Record<string, unknown>[] });
  const run = async (dryRun: boolean) => {
    if (!file) return;
    if (!dryRun && !window.confirm("Restore missing rows from this backup? Existing data is never overwritten.")) return;
    setBusy(true);
    try { setResult(await restore({ data: payload(dryRun) })); toast.success(dryRun ? "Dry run complete — nothing changed" : "Restore complete and verified"); }
    catch (error) { toast.error("Restore failed", { description: error instanceof Error ? error.message : "Please try again" }); }
    finally { setBusy(false); }
  };
  return <Block title="Restore missing study data"><p className="mb-3 text-xs leading-relaxed text-muted-foreground">Run the dry run first. Restore never overwrites existing rows, skips deleted accounts, and reads every inserted row back for verification.</p><input aria-label="Study Radar JSON backup" type="file" accept="application/json,.json" className="mb-3 block w-full text-xs" onChange={async (event) => { const selected = event.target.files?.[0]; setResult(null); if (!selected) return setFile(null); try { const parsed = JSON.parse(await selected.text()); if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.sessions)) throw new Error("Invalid backup"); setFile(parsed); setName(selected.name); } catch { setFile(null); toast.error("That file is not a Study Radar backup"); } }} />{file ? <p className="mb-3 text-xs text-muted-foreground">{name}: {(file.sessions ?? []).length} sessions, {(file.wasted ?? []).length} wasted-time, {(file.marks ?? []).length} marks, {(file.chapters ?? []).length} chapters</p> : null}<div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={!file || busy} onClick={() => void run(true)}>Check backup</Button><Button size="sm" disabled={!file || busy || !result?.dryRun} onClick={() => void run(false)}>{busy ? "Working…" : "Restore missing data"}</Button></div>{result ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[36rem] text-xs"><thead className="text-left text-muted-foreground"><tr><th className="py-1 pr-3">Data</th><th className="pr-3">In file</th><th className="pr-3">Already here</th><th className="pr-3">Skipped</th><th className="pr-3">{result.dryRun ? "Would add" : "Added"}</th>{!result.dryRun ? <th>Verified</th> : null}</tr></thead><tbody>{result.reports.map((report) => { const toAdd = report.valid - report.skippedUnknownUser - report.alreadyPresent; const ok = report.verified === report.valid - report.skippedUnknownUser; return <tr key={report.table} className="border-t border-border"><td className="py-1 pr-3">{report.table.replace("_", " ")}</td><td className="pr-3">{report.inBackup}</td><td className="pr-3">{report.alreadyPresent}</td><td className="pr-3">{report.inBackup - report.valid + report.skippedUnknownUser}</td><td className="pr-3">{result.dryRun ? toAdd : report.inserted}</td>{!result.dryRun ? <td className={ok ? "text-primary" : "text-destructive"}>{ok ? "All present" : `${report.verified} found`}</td> : null}</tr>; })}</tbody></table></div> : null}</Block>;
}

export function PreviewPanel({ onPreview }: { onPreview: (track: "OL" | "AL") => void }) {
  return <div className="max-w-4xl space-y-4"><Block title="Isolated student experience previews"><p className="text-sm leading-relaxed text-muted-foreground">Choose an exam track to open the student dashboard with illustrative browser-only records. These are not student accounts or database rows. Preview edits stay in this browser and never enter platform metrics, referrals, emails, backups or student lists.</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><Button size="lg" variant="outline" className="h-auto justify-start p-5" onClick={() => onPreview("OL")}><GraduationCap className="mr-3 h-5 w-5 text-primary" /><span className="text-left"><span className="block font-semibold">Preview O/L dashboard</span><span className="mt-1 block text-xs font-normal text-muted-foreground">Compulsory and optional-subject experience</span></span></Button><Button size="lg" variant="outline" className="h-auto justify-start p-5" onClick={() => onPreview("AL")}><GraduationCap className="mr-3 h-5 w-5 text-primary" /><span className="text-left"><span className="block font-semibold">Preview A/L dashboard</span><span className="mt-1 block text-xs font-normal text-muted-foreground">Stream and three-subject experience</span></span></Button></div></Block><Block title="Isolation guarantee"><ul className="list-disc space-y-2 pl-5 text-xs leading-relaxed text-muted-foreground"><li>Preview record IDs are browser-only and cannot be written to student tables.</li><li>The main admin dashboard starts with preview off.</li><li>Use “Exit preview” in the student app to return to your real account data.</li><li>No fictional student appears in the directory or any platform count.</li></ul></Block></div>;
}
