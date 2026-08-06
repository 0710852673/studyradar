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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useStudyOS } from "@/lib/studyos/store";
import { STUDY_TYPES, type StudyType } from "@/lib/studyos/types";
import { fmtHours, toKey } from "@/lib/studyos/analytics";

const PRESETS = [30, 45, 60, 120];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-sm transition-all duration-150 active:scale-95",
        active
          ? "border-primary bg-brand-soft font-medium text-primary"
          : "border-border bg-elevated text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

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
  const [minutes, setMinutes] = useState(initialMinutes ?? 60);
  const [custom, setCustom] = useState(!PRESETS.includes(initialMinutes ?? 60));
  const [type, setType] = useState<StudyType>("Theory");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!subject && subjects[0]) setSubject(subjects[0]);
  }, [subject, subjects]);

  const save = () => {
    if (!subject || minutes <= 0) return;
    addSession({ date: toKey(new Date()), subject, minutes, type, note: note || undefined });
    toast.success(`${fmtHours(minutes)} of ${subject} logged`);
    onDone();
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Duration
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((m) => (
            <Chip
              key={m}
              active={!custom && minutes === m}
              onClick={() => {
                setCustom(false);
                setMinutes(m);
              }}
            >
              {m < 60 ? `${m} min` : `${m / 60} hour${m > 60 ? "s" : ""}`}
            </Chip>
          ))}
          <Chip active={custom} onClick={() => setCustom(true)}>
            Custom
          </Chip>
        </div>
        {custom ? (
          <div className="mt-3 flex items-center gap-2">
            <Input
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">minutes</span>
          </div>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Study type
        </p>
        <div className="flex flex-wrap gap-2">
          {STUDY_TYPES.map((t) => (
            <Chip key={t} active={t === type} onClick={() => setType(t)}>
              {t}
            </Chip>
          ))}
        </div>
      </div>

      <Textarea
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
      />

      <Button className="w-full" size="lg" onClick={save} disabled={!subject}>
        Save session
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
          <span className="hidden sm:inline">Log study</span>
          <span className="sm:hidden">Log</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log a study session</DialogTitle>
        </DialogHeader>
        <LogForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
