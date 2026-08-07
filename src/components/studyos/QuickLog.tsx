import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useStudyOS } from "@/lib/studyos/store";
import { fmtHours, toKey } from "@/lib/studyos/analytics";

const ADD = [
  { label: "+15m", minutes: 15 },
  { label: "+30m", minutes: 30 },
  { label: "+1h", minutes: 60 },
  { label: "+2h", minutes: 120 },
  { label: "+3h", minutes: 180 },
];

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2.5 text-sm transition-all duration-150 active:scale-95",
        active
          ? "border-primary bg-brand-soft font-medium text-primary"
          : "border-border bg-elevated text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/** Subject → time chips → save. Nothing else in the way. */
export function LogForm({
  onDone,
  initialMinutes,
  initialSubject,
}: {
  onDone: () => void;
  initialMinutes?: number;
  initialSubject?: string;
}) {
  const { profile, addSession } = useStudyOS();
  const subjects = profile?.subjects ?? [];
  const [subject, setSubject] = useState(initialSubject ?? subjects[0] ?? "");
  const [minutes, setMinutes] = useState(initialMinutes ?? 0);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!subject && subjects[0]) setSubject(subjects[0]);
  }, [subject, subjects]);

  const save = async () => {
    if (!subject || minutes <= 0 || saving) return;
    setSaving(true);
    await addSession({
      date: toKey(new Date()),
      subject,
      minutes,
      note: note.trim() || undefined,
    });
    toast.success(`${fmtHours(minutes)} of ${subject} logged`);
    setSaving(false);
    onDone();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Subject
        </p>
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <Chip key={s} active={s === subject} onClick={() => setSubject(s)}>
              {s}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Time
        </p>
        <div className="flex flex-wrap gap-2">
          {ADD.map((a) => (
            <Chip key={a.label} onClick={() => setMinutes((m) => m + a.minutes)}>
              {a.label}
            </Chip>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-elevated px-4 py-3">
          <span className="num text-2xl font-semibold">
            {minutes > 0 ? fmtHours(minutes) : "0m"}
          </span>
          {minutes > 0 ? (
            <button
              type="button"
              onClick={() => setMinutes(0)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {noteOpen ? (
        <Textarea
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          autoFocus
        />
      ) : (
        <button
          type="button"
          onClick={() => setNoteOpen(true)}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Add note
        </button>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={save}
        disabled={!subject || minutes <= 0 || saving}
      >
        {saving ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}

export function QuickLogButton() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="shrink-0 rounded-full px-4">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Log Study</span>
          <span className="sm:hidden">Log</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log study</DialogTitle>
        </DialogHeader>
        <LogForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
