import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Bookmark, ExternalLink, Plus, Search, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useStudyOS } from "@/lib/studyos/store";
import { useSaved } from "@/lib/studyos/saved";
import {
  RESOURCE_CATEGORIES,
  examLabel,
  isRecentlyAdded,
  normalizeWebUrl,
  resourceUrlKey,
  splitSubjects,
  type Resource,
  type ResourceSuggestion,
} from "@/lib/studyos/resources";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, Panel } from "./Primitives";
import { cn } from "@/lib/utils";

const emptyForm = { name: "", url: "", description: "", category: "Notes", subjects: "", reason: "" };

export function ResourceHub() {
  const { session } = useStudyOS();
  const userId = session?.user?.id;
  const saved = useSaved();
  const [resources, setResources] = useState<Resource[]>([]);
  const [suggestions, setSuggestions] = useState<ResourceSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [exam, setExam] = useState("all");
  const [subject, setSubject] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [exams, setExams] = useState<string[]>(["OL", "AL"]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    const [directory, own] = await Promise.all([
      supabase.from("resources").select("*").eq("status", "published").order("featured", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("resource_suggestions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);
    const failure = directory.error ?? own.error;
    if (failure) setError(failure.message);
    setResources(directory.data ?? []);
    setSuggestions(own.data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  const categories = useMemo(() => [...new Set(resources.map((r) => r.category))].sort(), [resources]);
  const subjects = useMemo(() => [...new Set(resources.flatMap((r) => r.subjects))].sort(), [resources]);
  const visible = resources.filter((resource) => {
    const haystack = `${resource.name} ${resource.description} ${resource.publisher} ${resource.subjects.join(" ")}`.toLowerCase();
    return (!query.trim() || haystack.includes(query.trim().toLowerCase()))
      && (category === "all" || resource.category === category)
      && (exam === "all" || resource.exams.includes(exam))
      && (subject === "all" || resource.subjects.includes(subject));
  });

  const submitSuggestion = async (event: FormEvent) => {
    event.preventDefault();
    if (!userId) return;
    setBusy(true);
    try {
      const url = normalizeWebUrl(form.url);
      const key = resourceUrlKey(url);
      if (resources.some((r) => r.normalized_url === key) || suggestions.some((s) => s.normalized_url === key && ["pending", "approved"].includes(s.status))) {
        throw new Error("That link is already listed or awaiting review.");
      }
      const payload = {
        user_id: userId,
        name: form.name.trim(),
        url,
        normalized_url: key,
        description: form.description.trim(),
        category: form.category.trim() || "Other",
        subjects: splitSubjects(form.subjects),
        exams,
        reason: form.reason.trim(),
        status: "pending",
      };
      const { error: insertError } = await supabase.from("resource_suggestions").insert(payload);
      if (insertError) throw insertError;
      toast.success("Suggestion sent for review", { description: "It will not appear in the directory unless an admin publishes it." });
      setForm(emptyForm);
      setExams(["OL", "AL"]);
      setOpen(false);
      await load();
    } catch (submitError) {
      toast.error("Could not send suggestion", { description: submitError instanceof Error ? submitError.message : "Please check the form." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-elevated/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <h2 className="font-display text-lg font-semibold">Learn from trusted external sources</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Study Radar is independent and is not affiliated with these publishers. Links open their own websites; copyright and material ownership remain with the original publishers.</p>
          </div>
          <Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" />Suggest a resource</Button>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr]">
        <label className="relative block">
          <span className="sr-only">Search resources</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, subject or publisher" className="pl-9" />
        </label>
        <FilterSelect label="Category" value={category} onChange={setCategory} options={categories} />
        <FilterSelect label="Exam" value={exam} onChange={setExam} options={["OL", "AL"]} labels={{ OL: "O/L", AL: "A/L" }} />
        <FilterSelect label="Subject" value={subject} onChange={setSubject} options={subjects} />
      </div>

      {error ? <Panel><p role="alert" className="text-sm text-destructive">{error}</p><Button className="mt-3" variant="outline" size="sm" onClick={() => void load()}>Try again</Button></Panel> : null}
      {loading ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{[1,2,3].map((n) => <Skeleton key={n} className="h-56 rounded-2xl" />)}</div> : null}
      {!loading && !error && visible.length === 0 ? <EmptyState text={resources.length ? "No resources match these filters." : "No resources have been published yet."} /> : null}
      {!loading ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{visible.map((resource) => {
        const isSaved = saved.isSaved(`resource:${resource.id}`);
        return <article key={resource.id} className="panel flex min-w-0 flex-col p-4 transition-colors hover:border-primary/30">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <Chip>{resource.category}</Chip>
              {resource.featured ? <Chip tone="brand">Featured</Chip> : null}
              {isRecentlyAdded(resource.created_at) ? <Chip>Recently added</Chip> : null}
            </div>
            <button aria-label={`${isSaved ? "Remove" : "Save"} ${resource.name}`} onClick={() => void saved.toggle({ id: `resource:${resource.id}`, title: resource.name, kind: "Resource", note: resource.publisher, href: resource.url }).then(() => toast.success(isSaved ? "Removed from Saved" : "Saved to your library")).catch((e) => toast.error(e.message))} className={cn("rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground", isSaved && "text-primary")}>
              <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold">{resource.name}</h3>
          <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{resource.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{resource.exams.map((e) => <Chip key={e}>{examLabel(e)}</Chip>)}{resource.subjects.slice(0,3).map((s) => <Chip key={s}>{s}</Chip>)}</div>
          <p className="mt-4 text-xs text-muted-foreground">Published and owned by <span className="text-foreground">{resource.publisher}</span></p>
          <Button asChild variant="outline" className="mt-3 w-full"><a href={resource.url} target="_blank" rel="noopener noreferrer external" referrerPolicy="no-referrer">Visit {new URL(resource.url).hostname}<ExternalLink className="ml-1.5 h-4 w-4" /></a></Button>
        </article>;
      })}</div> : null}

      <Panel title="Your suggestions">
        {suggestions.length === 0 ? <p className="text-sm text-muted-foreground">You have not suggested a resource yet.</p> : <div className="space-y-2">{suggestions.map((suggestion) => <div key={suggestion.id} className="rounded-xl border border-border bg-elevated p-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium">{suggestion.name}</p><Chip tone={suggestion.status === "approved" ? "brand" : suggestion.status === "rejected" ? "bad" : "default"}>{suggestion.status}</Chip></div>
          <p className="mt-1 break-all text-xs text-muted-foreground">{suggestion.url} · sent {new Date(suggestion.created_at).toLocaleDateString()}</p>
          {suggestion.admin_response ? <p className="mt-2 text-xs text-muted-foreground">Admin response: {suggestion.admin_response}</p> : null}
        </div>)}</div>}
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader><DialogTitle>Suggest a learning resource</DialogTitle><DialogDescription>Every suggestion starts pending. Only you and admins can see its review status; nothing publishes automatically.</DialogDescription></DialogHeader>
          <form onSubmit={(e) => void submitSuggestion(e)} className="space-y-3">
            <Field label="Resource name"><Input required minLength={2} maxLength={120} value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} /></Field>
            <Field label="Website URL"><Input required type="url" inputMode="url" placeholder="https://example.com" value={form.url} onChange={(e) => setForm({...form,url:e.target.value})} /></Field>
            <Field label="Description"><Textarea required minLength={10} maxLength={600} value={form.description} onChange={(e) => setForm({...form,description:e.target.value})} /></Field>
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Category"><Input required list="resource-categories" value={form.category} onChange={(e) => setForm({...form,category:e.target.value})} /><datalist id="resource-categories">{RESOURCE_CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist></Field><Field label="Relevant subjects (comma separated)"><Input value={form.subjects} onChange={(e) => setForm({...form,subjects:e.target.value})} placeholder="Physics, Chemistry" /></Field></div>
            <fieldset><legend className="mb-2 text-xs font-medium">Relevant exam</legend><div className="flex gap-4">{["OL","AL"].map((code) => <label key={code} className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-primary" checked={exams.includes(code)} onChange={() => setExams((old) => old.includes(code) ? old.filter((e) => e !== code) : [...old,code])} />{examLabel(code)}</label>)}</div></fieldset>
            <Field label="Why is it useful?"><Textarea required minLength={10} maxLength={600} value={form.reason} onChange={(e) => setForm({...form,reason:e.target.value})} /></Field>
            <Button type="submit" disabled={busy || exams.length === 0}>{busy ? "Sending…" : <><Send className="mr-1.5 h-4 w-4" />Send for review</>}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, labels = {} }: { label: string; value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string,string> }) {
  return <label><span className="sr-only">Filter by {label}</span><select aria-label={`Filter by ${label}`} value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"><option value="all">All {label.toLowerCase()}s</option>{options.map((option) => <option key={option} value={option}>{labels[option] ?? option}</option>)}</select></label>;
}

export function Chip({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "brand" | "bad" }) {
  return <span className={cn("inline-flex rounded-full border border-border px-2 py-0.5 text-[10px] capitalize text-muted-foreground", tone === "brand" && "border-primary/30 bg-brand-soft text-primary", tone === "bad" && "border-destructive/40 text-destructive")}>{children}</span>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium">{label}</span>{children}</label>;
}
