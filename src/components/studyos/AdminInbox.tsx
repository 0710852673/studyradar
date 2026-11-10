import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Contact = { id: string; topic: string; name: string; email: string; message: string; status: string; created_at: string };
type Fb = { id: string; kind: string; message: string; status: string; created_at: string };

export function InboxPanel() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [feedback, setFeedback] = useState<Fb[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"open" | "done" | "all">("open");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    const [c, f] = await Promise.all([
      supabase.from("contact_messages").select("id,topic,name,email,message,status,created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("feedback").select("id,kind,message,status,created_at").order("created_at", { ascending: false }).limit(100),
    ]);
    const failure = c.error ?? f.error;
    if (failure) setError(failure.message);
    setContacts(c.data ?? []); setFeedback(f.data ?? []); setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const mark = async (table: "contact_messages" | "feedback", id: string, status: string) => {
    const { error: updateError } = await supabase.from(table).update({ status }).eq("id", id);
    if (updateError) { toast.error("Message status could not be updated", { description: updateError.message }); return; }
    toast.success("Status updated and audit recorded"); await load();
  };
  const visible = (status: string) => filter === "all" || (filter === "done" ? status === "done" : status !== "done");
  return <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Real stored contact and feedback messages. Status changes are audited.</p><div className="flex gap-2">{(["open", "done", "all"] as const).map((value) => <Button key={value} size="sm" variant={filter === value ? "default" : "outline"} onClick={() => setFilter(value)} className="capitalize">{value}</Button>)}</div></div>{error ? <div role="alert" className="panel p-5 text-sm text-destructive">{error}<Button className="ml-3" size="sm" variant="outline" onClick={() => void load()}>Retry</Button></div> : null}{loading ? <div className="panel p-8 text-center text-sm text-muted-foreground">Loading inbox…</div> : <div className="grid gap-4 xl:grid-cols-2"><List title="Contact messages" table="contact_messages" rows={contacts.filter((row) => visible(row.status)).map((row) => ({ ...row, head: `${row.topic} · ${row.name} <${row.email}>` }))} onMark={mark} /><List title="Student feedback" table="feedback" rows={feedback.filter((row) => visible(row.status)).map((row) => ({ ...row, head: row.kind }))} onMark={mark} /></div>}</div>;
}
function List({ title, rows, table, onMark }: { title: string; table: "contact_messages" | "feedback"; rows: { id: string; status: string; created_at: string; message: string; head: string }[]; onMark: (table: "contact_messages" | "feedback", id: string, status: string) => Promise<void> }) {
  return <section className="panel min-w-0 p-5"><h2 className="text-sm font-semibold">{title} ({rows.length})</h2>{!rows.length ? <p className="mt-3 text-sm text-muted-foreground">No messages in this view.</p> : <ul className="mt-3 divide-y divide-border">{rows.map((row) => <li key={row.id} className="space-y-2 py-4 text-sm"><p className="break-words text-xs text-muted-foreground">{row.head} · {new Date(row.created_at).toLocaleString()} · {row.status}</p><p className="whitespace-pre-wrap break-words">{row.message}</p><Button size="sm" variant="secondary" onClick={() => void onMark(table, row.id, row.status === "done" ? "new" : "done")}>{row.status === "done" ? "Reopen" : "Mark done"}</Button></li>)}</ul>}</section>;
}
