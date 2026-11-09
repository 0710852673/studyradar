import { useCallback, useEffect, useState } from "react";
import { Check, ExternalLink, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Chip } from "@/components/studyos/ResourceHub";

type Suggestion = {
  id: string; user_id: string; name: string; url: string; description: string;
  category: string; subjects: string[]; exams: string[]; reason: string;
  status: string; admin_response: string | null; created_at: string;
};

export function AdminResourcesPanel() {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let request = supabase.from("resource_suggestions").select("*").order("created_at", { ascending: false }).limit(200);
    if (filter !== "all") request = request.eq("status", filter);
    const { data, error } = await request;
    if (error) toast.error("Could not load resource suggestions", { description: error.message });
    else setItems((data ?? []) as Suggestion[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  const review = async (item: Suggestion, decision: "approved" | "rejected") => {
    setBusyId(item.id);
    try {
      const response = (responses[item.id] ?? "").trim();
      if (decision === "approved") {
        const { data: userResult } = await supabase.auth.getUser();
        const publisher = new URL(item.url).hostname.replace(/^www\./, "");
        const { error: publishError } = await supabase.from("resources").insert({
          name: item.name,
          url: item.url,
          normalized_url: item.url.replace(/^https?:\/\//i, "").replace(/#.*$/, "").replace(/\/+$/, "").toLowerCase(),
          description: item.description,
          category: item.category,
          subjects: item.subjects,
          exams: item.exams,
          publisher,
          status: "published",
          featured: false,
          created_by: userResult.user?.id ?? null,
        });
        if (publishError) throw publishError;
      }
      const { error } = await supabase.from("resource_suggestions").update({
        status: decision,
        admin_response: response || (decision === "approved" ? "Approved and added to the Resource Hub." : "Thanks for the suggestion. It was not added to the directory."),
      }).eq("id", item.id);
      if (error) throw error;
      toast.success(decision === "approved" ? "Resource published" : "Suggestion declined");
      await load();
    } catch (error) {
      toast.error("Review could not be completed", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = items.filter((item) => item.status === "pending").length;
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-elevated p-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Resource moderation</h2>
          <p className="text-xs text-muted-foreground">Review student-submitted links before they appear publicly.</p>
        </div>
        <div className="flex items-center gap-2">
          <select aria-label="Filter suggestions" value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Declined</option><option value="all">All</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="panel p-3"><p className="text-xs text-muted-foreground">Loaded suggestions</p><p className="num mt-1 text-2xl font-semibold">{items.length}</p></div>
        <div className="panel p-3"><p className="text-xs text-muted-foreground">Pending in current view</p><p className="num mt-1 text-2xl font-semibold">{pendingCount}</p></div>
        <div className="panel p-3"><p className="text-xs text-muted-foreground">Review queue</p><p className="mt-1 text-sm font-medium">{filter === "pending" ? "Awaiting admin decision" : "Filtered history"}</p></div>
      </div>
      {loading ? <div className="panel p-8 text-center text-sm text-muted-foreground">Loading suggestions…</div> : items.length === 0 ? <div className="panel p-8 text-center text-sm text-muted-foreground">No suggestions in this view.</div> : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="panel space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0"><h3 className="font-medium">{item.name}</h3><a href={item.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="mt-1 inline-flex max-w-full items-center gap-1 break-all text-xs text-primary hover:underline">{item.url}<ExternalLink className="h-3 w-3 shrink-0" /></a></div>
                <Chip tone={item.status === "approved" ? "brand" : item.status === "rejected" ? "bad" : "default"}>{item.status}</Chip>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <div className="flex flex-wrap gap-1.5"><Chip>{item.category}</Chip>{item.exams.map((exam) => <Chip key={exam}>{exam === "AL" ? "A/L" : "O/L"}</Chip>)}{item.subjects.map((subject) => <Chip key={subject}>{subject}</Chip>)}</div>
              <div className="rounded-lg bg-muted/50 p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Why they recommend it</p><p className="mt-1 text-sm">{item.reason}</p></div>
              <p className="text-[11px] text-muted-foreground">Submitted {new Date(item.created_at).toLocaleString()} · Member {item.user_id.slice(0, 8)}</p>
              {item.admin_response ? <p className="text-xs text-muted-foreground">Previous response: {item.admin_response}</p> : null}
              {item.status === "pending" ? <>
                <Textarea value={responses[item.id] ?? ""} onChange={(e) => setResponses((old) => ({ ...old, [item.id]: e.target.value }))} maxLength={600} placeholder="Optional note to the member…" />
                <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => void review(item, "approved")} disabled={busyId === item.id}><Check className="mr-1.5 h-4 w-4" />{busyId === item.id ? "Saving…" : "Approve & publish"}</Button><Button size="sm" variant="outline" onClick={() => void review(item, "rejected")} disabled={busyId === item.id}><X className="mr-1.5 h-4 w-4" />Decline</Button></div>
              </> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
