import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Archive, ExternalLink, Plus, RefreshCw, Check, X, Pencil, Star, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RESOURCE_CATEGORIES, normalizeWebUrl, resourceUrlKey, splitSubjects, type Resource } from "@/lib/studyos/resources";

type Suggestion = {
  id: string; user_id: string; name: string; url: string; normalized_url: string;
  description: string; category: string; subjects: string[]; exams: string[];
  reason: string; status: string; created_at: string;
};

type ResourceDraft = {
  id?: string; name: string; url: string; description: string; category: string;
  subjects: string; exams: string[]; publisher: string; status: "draft" | "published" | "archived";
  featured: boolean;
};
const blankDraft: ResourceDraft = {
  name: "", url: "", description: "", category: "Notes", subjects: "",
  exams: ["OL", "AL"], publisher: "", status: "published", featured: false,
};

export function AdminResourceRequests() {
  const [rows, setRows] = useState<Suggestion[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [tab, setTab] = useState<"directory" | "requests">("directory");
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "archived">("all");
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<ResourceDraft>(blankDraft);

  const load = useCallback(async () => {
    setLoading(true);
    const [resourceResult, suggestionResult] = await Promise.all([
      supabase.from("resources").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("resource_suggestions").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    const error = resourceResult.error ?? suggestionResult.error;
    if (error) toast.error("Could not load resource data", { description: error.message });
    setResources((resourceResult.data ?? []) as Resource[]);
    setRows((suggestionResult.data ?? []) as Suggestion[]);
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const filteredResources = useMemo(() => resources.filter((r) =>
    (filter === "all" || r.status === filter) &&
    (!query.trim() || `${r.name} ${r.description} ${r.publisher} ${r.category} ${r.subjects.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()))
  ), [resources, filter, query]);
  const pending = rows.filter((r) => r.status === "pending");

  const openNew = () => { setDraft(blankDraft); setEditorOpen(true); };
  const openEdit = (r: Resource) => {
    setDraft({ id: r.id, name: r.name, url: r.url, description: r.description, category: r.category,
      subjects: r.subjects.join(", "), exams: r.exams, publisher: r.publisher, status: r.status, featured: r.featured });
    setEditorOpen(true);
  };

  const saveResource = async (event: FormEvent) => {
    event.preventDefault();
    setBusy("save");
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Admin session expired. Sign in again.");
      const url = normalizeWebUrl(draft.url);
      const payload = {
        name: draft.name.trim(), url, normalized_url: resourceUrlKey(url),
        description: draft.description.trim(), category: draft.category.trim() || "Other",
        subjects: splitSubjects(draft.subjects), exams: draft.exams, publisher: draft.publisher.trim(),
        status: draft.status, featured: draft.featured,
      };
      if (payload.name.length < 2 || payload.description.length < 10 || payload.publisher.length < 1 || payload.exams.length === 0) {
        throw new Error("Complete all required fields and choose at least one exam.");
      }
      const result = draft.id
        ? await supabase.from("resources").update(payload).eq("id", draft.id)
        : await supabase.from("resources").insert({ ...payload, created_by: auth.user.id });
      if (result.error) throw result.error;
      toast.success(draft.id ? "Resource updated" : draft.status === "published" ? "Resource published" : "Resource saved as draft");
      setEditorOpen(false);
      await load();
    } catch (error) {
      toast.error("Could not save resource", { description: error instanceof Error ? error.message : "Please check the fields." });
    } finally { setBusy(null); }
  };

  const setResourceStatus = async (resource: Resource, status: "published" | "draft" | "archived") => {
    setBusy(resource.id);
    const { error } = await supabase.from("resources").update({ status }).eq("id", resource.id);
    if (error) toast.error("Could not update resource", { description: error.message });
    else { toast.success(status === "published" ? "Resource published" : status === "archived" ? "Resource archived" : "Resource unpublished"); await load(); }
    setBusy(null);
  };

  const toggleFeatured = async (resource: Resource) => {
    setBusy(resource.id);
    const { error } = await supabase.from("resources").update({ featured: !resource.featured }).eq("id", resource.id);
    if (error) toast.error("Could not update featured status", { description: error.message });
    else { toast.success(resource.featured ? "Feature removed" : "Resource featured"); await load(); }
    setBusy(null);
  };

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

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-sm font-semibold">Resource Hub management</h2>
        <p className="text-xs text-muted-foreground">Create and manage the public directory here. Student suggestions are reviewed separately.</p></div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className="mr-1.5 h-3.5 w-3.5"/>Refresh</Button>
        <Button size="sm" onClick={openNew}><Plus className="mr-1.5 h-3.5 w-3.5"/>Add resource</Button>
      </div>
    </div>
    <div className="flex flex-wrap gap-2 border-b border-border pb-3">
      <Button size="sm" variant={tab === "directory" ? "default" : "outline"} onClick={() => setTab("directory")}>Directory ({resources.length})</Button>
      <Button size="sm" variant={tab === "requests" ? "default" : "outline"} onClick={() => setTab("requests")}>Student requests ({pending.length} pending)</Button>
    </div>

    {tab === "directory" ? <>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px]">
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" placeholder="Search resources…" value={query} onChange={(e)=>setQuery(e.target.value)}/></div>
        <select aria-label="Filter resource status" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={filter} onChange={(e)=>setFilter(e.target.value as typeof filter)}>
          <option value="all">All statuses</option><option value="published">Published</option><option value="draft">Drafts</option><option value="archived">Archived</option>
        </select>
      </div>
      {loading ? <div className="panel p-8 text-center text-sm text-muted-foreground">Loading resources…</div>
        : filteredResources.length === 0 ? <div className="panel p-8 text-center text-sm text-muted-foreground">No resources found. Use “Add resource” to publish the first one.</div>
        : <div className="space-y-2">{filteredResources.map((r) => <article key={r.id} className="panel min-w-0 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{r.name}</h3><span className="rounded-full border border-border px-2 py-0.5 text-[10px] capitalize text-muted-foreground">{r.status}</span>{r.featured ? <span className="rounded-full border border-primary/30 bg-brand-soft px-2 py-0.5 text-[10px] text-primary">Featured</span> : null}</div>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 break-all text-xs text-primary hover:underline">{r.url}<ExternalLink className="h-3 w-3 shrink-0"/></a>
              <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">{r.publisher} · {r.category} · {r.exams.join(", ")} · {r.subjects.join(", ") || "No subjects"}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" onClick={()=>openEdit(r)}><Pencil className="mr-1 h-3.5 w-3.5"/>Edit</Button>
              <Button size="sm" variant="outline" onClick={()=>void toggleFeatured(r)} disabled={busy!==null}><Star className="mr-1 h-3.5 w-3.5"/>{r.featured ? "Unfeature" : "Feature"}</Button>
              {r.status !== "published" ? <Button size="sm" onClick={()=>void setResourceStatus(r,"published")} disabled={busy!==null}>Publish</Button> : <Button size="sm" variant="outline" onClick={()=>void setResourceStatus(r,"draft")} disabled={busy!==null}>Unpublish</Button>}
              {r.status !== "archived" ? <Button size="sm" variant="ghost" onClick={()=>void setResourceStatus(r,"archived")} disabled={busy!==null}><Archive className="h-3.5 w-3.5"/></Button> : null}
            </div>
          </div>
        </article>)}</div>}
    </> : <>
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-muted-foreground">Approve publishes the link to the student Resource Hub. Reject keeps it out of the directory.</p><span className="text-xs font-medium">{pending.length} awaiting review</span></div>
      {loading ? <div className="panel p-8 text-center text-sm text-muted-foreground">Loading requests…</div>
        : rows.length === 0 ? <div className="panel p-8 text-center text-sm text-muted-foreground">No resource suggestions have been submitted yet.</div>
        : <div className="space-y-3">{rows.map((r) => <article key={r.id} className="panel min-w-0 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{r.name}</h3><span className="rounded-full border border-border px-2 py-0.5 text-[10px]">{r.status}</span></div>
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 break-all text-xs text-primary hover:underline">{r.url}<ExternalLink className="h-3 w-3 shrink-0"/></a><p className="mt-2 text-sm text-muted-foreground">{r.description}</p></div><span className="shrink-0 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span></div>
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs"><span className="rounded bg-elevated px-2 py-1">{r.category}</span>{r.exams.map(x=><span key={x} className="rounded bg-elevated px-2 py-1">{x}</span>)}{r.subjects.map(x=><span key={x} className="rounded bg-elevated px-2 py-1">{x}</span>)}</div>
          <p className="mt-2 text-xs"><span className="font-medium">Why useful:</span> {r.reason}</p><p className="mt-1 break-all text-[11px] text-muted-foreground">Submitted by {r.user_id}</p>
          {r.status === "pending" ? <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" onClick={() => void review(r,"approved")} disabled={busy!==null}><Check className="mr-1 h-3.5 w-3.5"/>Approve & publish</Button><Button size="sm" variant="outline" onClick={() => void review(r,"rejected")} disabled={busy!==null}><X className="mr-1 h-3.5 w-3.5"/>Reject</Button></div> : null}
        </article>)}</div>}
    </>}

    <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>{draft.id ? "Edit resource" : "Add a resource"}</DialogTitle><DialogDescription>Manage a link in the student Resource Hub. Only published resources are visible to students.</DialogDescription></DialogHeader>
        <form onSubmit={(e)=>void saveResource(e)} className="space-y-3">
          <Field label="Resource name"><Input required minLength={2} maxLength={120} value={draft.name} onChange={(e)=>setDraft({...draft,name:e.target.value})}/></Field>
          <Field label="Website URL"><Input required type="url" placeholder="https://example.com" value={draft.url} onChange={(e)=>setDraft({...draft,url:e.target.value})}/></Field>
          <Field label="Description"><Textarea required minLength={10} maxLength={600} value={draft.description} onChange={(e)=>setDraft({...draft,description:e.target.value})}/></Field>
          <div className="grid gap-3 sm:grid-cols-2"><Field label="Category"><Input required list="admin-resource-categories" value={draft.category} onChange={(e)=>setDraft({...draft,category:e.target.value})}/><datalist id="admin-resource-categories">{RESOURCE_CATEGORIES.map((c)=><option key={c} value={c}/>)}</datalist></Field><Field label="Publisher / owner"><Input required maxLength={120} value={draft.publisher} onChange={(e)=>setDraft({...draft,publisher:e.target.value})} placeholder="e.g. Department of Education"/></Field></div>
          <Field label="Subjects (comma separated)"><Input value={draft.subjects} onChange={(e)=>setDraft({...draft,subjects:e.target.value})} placeholder="Physics, Chemistry"/></Field>
          <fieldset><legend className="mb-2 text-xs font-medium">Relevant exams</legend><div className="flex gap-4">{["OL","AL"].map((code)=><label key={code} className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-primary" checked={draft.exams.includes(code)} onChange={()=>setDraft({...draft,exams:draft.exams.includes(code)?draft.exams.filter(x=>x!==code):[...draft.exams,code]})}/>{code==="OL"?"O/L":"A/L"}</label>)}</div></fieldset>
          <div className="grid gap-3 sm:grid-cols-2"><Field label="Visibility"><select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.status} onChange={(e)=>setDraft({...draft,status:e.target.value as ResourceDraft["status"]})}><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select></Field><label className="flex items-center gap-2 pt-6 text-sm"><input type="checkbox" className="h-4 w-4 accent-primary" checked={draft.featured} onChange={(e)=>setDraft({...draft,featured:e.target.checked})}/>Feature in directory</label></div>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={()=>setEditorOpen(false)}>Cancel</Button><Button type="submit" disabled={busy!==null}>{busy==="save"?"Saving…":draft.id?"Save changes":draft.status==="published"?"Publish resource":"Save resource"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium">{label}</span>{children}</label>;
}
