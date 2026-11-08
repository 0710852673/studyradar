import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Contact = {
  id: string;
  topic: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
};
type Fb = { id: string; kind: string; message: string; status: string; created_at: string };

/** Admin-only inbox: contact messages and in-app feedback (RLS restricts reads to admins). */
export function InboxPanel() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [feedback, setFeedback] = useState<Fb[]>([]);

  const load = useCallback(async () => {
    const [c, f] = await Promise.all([
      supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("feedback")
        .select("id,kind,message,status,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    setContacts(c.data ?? []);
    setFeedback(f.data ?? []);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const mark = async (table: "contact_messages" | "feedback", id: string, status: string) => {
    const { error } = await supabase.from(table).update({ status }).eq("id", id);
    if (error) {
      toast.error("Couldn't update");
      return;
    }
    void load();
  };

  const List = ({
    title,
    rows,
    table,
  }: {
    title: string;
    rows: { id: string; status: string; created_at: string; message: string; head: string }[];
    table: "contact_messages" | "feedback";
  }) => (
    <div className="panel p-5">
      <h2 className="text-sm font-semibold">
        {title} ({rows.length})
      </h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Nothing yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {rows.map((r) => (
            <li key={r.id} className="space-y-1 py-3 text-sm">
              <p className="text-xs text-muted-foreground">
                {r.head} · {new Date(r.created_at).toLocaleString()} · {r.status}
              </p>
              <p className="whitespace-pre-wrap">{r.message}</p>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => mark(table, r.id, r.status === "done" ? "new" : "done")}
              >
                {r.status === "done" ? "Reopen" : "Mark done"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <List
        title="Contact messages"
        table="contact_messages"
        rows={contacts.map((c) => ({ ...c, head: `${c.topic} · ${c.name} <${c.email}>` }))}
      />
      <List
        title="Student feedback"
        table="feedback"
        rows={feedback.map((f) => ({ ...f, head: f.kind }))}
      />
    </div>
  );
}
