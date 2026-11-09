import { useCallback, useEffect, useState } from "react";
import { ExternalLink, RefreshCw, Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Suggestion = {
  id: string; user_id: string; name: string; url: string; normalized_url: string;
  description: string; category: string; subjects: string[]; exams: string[];
  reason: string; status: string; created_at: string;
};

export function AdminResourceRequests() {
  const [rows, setRows] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("resource_suggestions").select("*")
      .order("created_at", { ascending: false }).limit(200);
    if (error) toast.error("Could not load resource requests", { description: error.message });
    setRows((data ?? []) as Suggestion[]);
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const review = async (row: Suggestion, decision: "approved" | "rejected") => {
    setBusy(row.id);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Admin session expired. Sign in again.");
      if (decision === "approved") {
        const { error: publishError } = await supabase.from("resources").insert({
          name: row.name, url: row.url, normalized_url: row.normalized_url,
          description: row.description, category: row.category, subjects: row.subjects,
          exams: row.exams, publisher: "Community suggestion", status: "published",
          created_by: auth.user.id,
        });
        if (publishError) throw publishError;
      }
      const { error } = await supabase.from("resource_suggestions").update({
        status: decision, reviewed_by: auth.user.id, reviewed_at: new Date().toISOString(),
        admin_response: decision === "approved" ? "Approved and published." : "Not approved.",
      }).eq("id", row.id).eq("status", "pending");
      if (error) throw error;
      toast.success(decision === "approved" ? "Resource approved and published" : "Request rejected");
      await load();
    } catch (error) {
      toast.error("Could not review request", { description: error instanceof Error ? error.message : "Please try again." });
    } finally { setBusy(null); }
  };

  const pending = rows.filter((r) => r.status === "pending");
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div><h2 className="text-sm font-semibold">Student resource suggestions ({pending.length} pending)</h2>
        <p className="text-xs text-muted-foreground">Approve publishes the link to the public Resource Hub. Reject keeps it out of the directory.</p></div>
      <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className="mr-1.5 h-3.5 w-3.5"/>Refresh</Button>
    </div>
    {loading ? <div className="panel p-8 text-center text-sm text-muted-foreground">Loading requests…</div>
      : rows.length === 0 ? <div className="panel p-8 text-center text-sm text-muted-foreground">No resource suggestions have been submitted yet.</div>
      : <div className="space-y-3">{rows.map((r) => <article key={r.id} className="panel min-w-0 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{r.name}</h3><span className={`rounded-full border px-2 py-0.5 text-[10px] ${r.status === "pending" ? "border-amber-500/40 text-amber-600" : "border-border text-muted-foreground"}`}>{r.status}</span></div>
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 break-all text-xs text-primary hover:underline">{r.url}<ExternalLink className="h-3 w-3 shrink-0"/></a>
            <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs"><span className="rounded bg-elevated px-2 py-1">{r.category}</span>{r.exams.map(x=><span key={x} className="rounded bg-elevated px-2 py-1">{x}</span>)}{r.subjects.map(x=><span key={x} className="rounded bg-elevated px-2 py-1">{x}</span>)}</div>
        <p className="mt-2 text-xs"><span className="font-medium">Why useful:</span> {r.reason}</p>
        <p className="mt-1 break-all text-[11px] text-muted-foreground">Submitted by {r.user_id} · {r.id}</p>
        {r.status === "pending" ? <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => void review(r,"approved")} disabled={busy !== null}><Check className="mr-1 h-3.5 w-3.5"/>Approve & publish</Button>
          <Button size="sm" variant="outline" onClick={() => void review(r,"rejected")} disabled={busy !== null}><X className="mr-1 h-3.5 w-3.5"/>Reject</Button>
        </div> : null}
      </article>)}</div>}
  </div>;
}
