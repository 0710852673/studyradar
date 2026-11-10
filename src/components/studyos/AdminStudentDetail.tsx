import { useState } from "react";
import { Activity, AlertTriangle, ArrowLeft, Ban, BarChart3, Clock, LayoutGrid, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { fmtHours } from "@/lib/studyos/analytics";
import { sumMinutes, type AdminProfile, type AdminSnapshot } from "@/lib/studyos/admin-data";
import { Block, Card, Empty, KV, Tag } from "./AdminPanels";

export function StudentDetail({ profile, snap, isAdminUser, onBack, onChanged }: {
  profile: AdminProfile; snap: AdminSnapshot; isAdminUser: boolean; onBack: () => void; onChanged: () => void;
}) {
  const [reason, setReason] = useState(profile.suspended_reason ?? "");
  const [busy, setBusy] = useState(false);
  const sessions = snap.sessions.filter((row) => row.user_id === profile.id).sort((a, b) => b.date.localeCompare(a.date));
  const wasted = snap.wasted.filter((row) => row.user_id === profile.id).sort((a, b) => b.date.localeCompare(a.date));
  const marks = snap.marks.filter((row) => row.user_id === profile.id).sort((a, b) => b.date.localeCompare(a.date));
  const chapters = snap.chapters.filter((row) => row.user_id === profile.id);
  const devices = snap.devices.filter((row) => row.user_id === profile.id);
  const awards = snap.achievements.filter((row) => row.user_id === profile.id);

  const setSuspended = async (next: boolean) => {
    const message = next ? `Suspend ${profile.name}'s account? They will lose access until restored. This action is audited.` : `Restore ${profile.name}'s account? This action is audited.`;
    if (!window.confirm(message)) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      suspended: next,
      suspended_reason: next ? reason.trim() || "Violation of the Study Radar terms." : null,
      suspended_at: next ? new Date().toISOString() : null,
    }).eq("id", profile.id);
    setBusy(false);
    if (error) toast.error("Account status could not be changed", { description: error.message });
    else { toast.success(next ? "Account suspended and audit recorded" : "Account restored and audit recorded"); onChanged(); }
  };

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-3"><Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="mr-1.5 h-3.5 w-3.5" />All students</Button><h2 className="font-display text-lg font-semibold">{profile.name}</h2>{profile.suspended ? <Tag tone="bad">suspended</Tag> : null}{isAdminUser ? <Tag tone="good">admin</Tag> : null}{profile.is_demo ? <Tag>demo · excluded</Tag> : null}</div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><Card label="Total study" value={fmtHours(sumMinutes(sessions))} icon={Clock} /><Card label="Total wasted time" value={fmtHours(sumMinutes(wasted))} icon={AlertTriangle} /><Card label="Study entries" value={String(sessions.length)} icon={Activity} /><Card label="Marks" value={String(marks.length)} icon={BarChart3} /><Card label="Syllabus done" value={chapters.length ? `${Math.round(chapters.filter((c) => c.status === "done").length / chapters.length * 100)}%` : "—"} icon={LayoutGrid} /></div>
    <div className="grid gap-4 lg:grid-cols-2">
      <Block title="Student profile"><div className="space-y-2"><KV label="Email" value={profile.email ?? "—"} /><KV label="Track" value={`${profile.track} ${profile.exam_year}`} /><KV label="Exam date" value={profile.exam_date ?? "Not set"} /><KV label="Stream" value={profile.stream ?? "—"} /><KV label="Grade" value={profile.grade ?? "—"} /><KV label="School" value={profile.school ?? "—"} /><KV label="Town / district" value={[profile.city, profile.district].filter(Boolean).join(", ") || "—"} /><KV label="Subjects" value={(profile.subjects ?? []).join(", ") || "—"} /><KV label="Daily target" value={`${profile.daily_target_hours} h`} /><KV label="Joined" value={new Date(profile.created_at).toLocaleString()} /><KV label="Last seen" value={profile.last_seen_at ? new Date(profile.last_seen_at).toLocaleString() : "Never recorded"} /><KV label="Terms accepted" value={profile.terms_accepted_at ? new Date(profile.terms_accepted_at).toLocaleString() : "Not recorded"} /></div><p className="mt-3 text-[10px] text-muted-foreground">Guardian and phone fields are intentionally omitted from this operational view.</p></Block>
      <div className="space-y-4"><Block title="Account status & audit"><p className="mb-3 text-xs text-muted-foreground">Suspension signs the student out of protected pages. Every change requires confirmation and is recorded in the admin audit trail.</p>{isAdminUser ? <p className="text-xs text-muted-foreground">Admin accounts cannot be suspended from this panel.</p> : <><Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason shown to the student…" rows={3} maxLength={500} /><div className="mt-3">{profile.suspended ? <Button size="sm" disabled={busy} onClick={() => void setSuspended(false)}>Restore account</Button> : <Button size="sm" variant="destructive" disabled={busy} onClick={() => void setSuspended(true)}><Ban className="mr-1.5 h-3.5 w-3.5" />Suspend account</Button>}</div></>}</Block><Block title={`Coarse activity (${devices.length})`}><div className="max-h-56 space-y-1.5 overflow-y-auto">{devices.slice(0, 50).map((row) => <div key={row.id} className="rounded-lg border border-border bg-background px-3 py-2 text-[11px]"><div className="flex justify-between gap-2"><span>{row.kind} · {row.path ?? "other"}</span><span className="num text-muted-foreground">{new Date(row.created_at).toLocaleDateString()}</span></div><p className="text-muted-foreground">{[row.platform, row.user_agent].filter(Boolean).join(" · ") || "No device label"}</p></div>)}{!devices.length ? <p className="text-xs text-muted-foreground">No account-linked activity records.</p> : null}</div></Block></div>
    </div>
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4"><RecordBlock title={`Study (${sessions.length})`} rows={sessions.map((row) => ({ id: row.id, left: row.subject, right: `${row.date} · ${fmtHours(row.minutes)}` }))} /><RecordBlock title={`Wasted time (${wasted.length})`} rows={wasted.map((row) => ({ id: row.id, left: row.reason || "No reason recorded", right: `${row.date} · ${fmtHours(row.minutes)}` }))} /><RecordBlock title={`Marks (${marks.length})`} rows={marks.map((row) => ({ id: row.id, left: `${row.subject} · ${row.exam_name}`, right: `${row.marks}/${row.total}` }))} /><RecordBlock title={`Syllabus (${chapters.length})`} rows={chapters.map((row) => ({ id: row.id, left: `${row.subject} · ${row.title}`, right: row.status }))} /></div>
    <Block title={`Achievements (${awards.length})`}><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{awards.map((award) => <div key={award.id} className="rounded-lg border border-border bg-background p-3 text-xs"><Trophy className="h-4 w-4 text-primary" /><p className="mt-2 font-medium">{award.title}</p><p className="mt-1 text-muted-foreground">{new Date(award.awarded_at).toLocaleDateString()} · email {award.email_status}</p></div>)}{!awards.length ? <Empty text="No durable achievement awards yet." /> : null}</div></Block>
  </div>;
}
function RecordBlock({ title, rows }: { title: string; rows: { id: string; left: string; right: string }[] }) { return <Block title={title}><div className="max-h-72 space-y-1.5 overflow-y-auto">{rows.slice(0, 200).map((row) => <div key={row.id} className="rounded-lg border border-border bg-background px-3 py-2 text-xs"><p className="break-words">{row.left}</p><p className="num mt-1 text-muted-foreground">{row.right}</p></div>)}{!rows.length ? <p className="text-xs text-muted-foreground">None recorded.</p> : null}</div></Block>; }
