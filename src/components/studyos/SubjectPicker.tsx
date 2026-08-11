import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Subject chooser that accepts anything the student types, not just the preset
 * syllabus lists — Sri Lankan schools offer combinations the presets miss.
 */
export function SubjectPicker({
  pool,
  selected,
  onChange,
  recommended,
  locked = [],
}: {
  /** Preset suggestions for the chosen track/stream. */
  pool: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  /** Soft guidance only — students may go over or under. */
  recommended?: number;
  /** Compulsory subjects shown but not removable. */
  locked?: string[];
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const toggle = (s: string) =>
    onChange(selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s]);

  const addCustom = () => {
    const v = draft.trim().replace(/\s+/g, " ");
    if (!v) return;
    const clash = [...selected, ...locked].some((s) => s.toLowerCase() === v.toLowerCase());
    if (!clash) onChange([...selected, v]);
    setDraft("");
    setAdding(false);
  };

  // Anything selected that isn't a preset is a student-created subject.
  const custom = selected.filter((s) => !pool.includes(s));

  return (
    <div className="space-y-3">
      {locked.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {locked.map((s) => (
            <span
              key={s}
              className="rounded-full border border-border bg-elevated px-3 py-1.5 text-xs text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      ) : null}

      {recommended ? (
        <p className="text-xs text-muted-foreground">
          {selected.length} selected · {recommended} recommended — add your own if yours isn't
          listed.
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-3">
        {pool.map((s) => {
          const active = selected.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => toggle(s)}
              className={cn(
                "flex items-center justify-between gap-2 rounded-xl border p-3 text-left text-sm transition-colors",
                active
                  ? "border-primary bg-brand-soft text-primary"
                  : "border-border bg-elevated text-muted-foreground hover:border-muted-foreground/40",
              )}
            >
              {s}
              {active ? <Check className="h-4 w-4 shrink-0" /> : null}
            </button>
          );
        })}
      </div>

      {custom.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {custom.map((s) => (
            <span
              key={s}
              className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-brand-soft px-3 py-1.5 text-xs text-primary"
            >
              {s}
              <button
                type="button"
                onClick={() => toggle(s)}
                aria-label={`Remove ${s}`}
                className="opacity-60 transition-opacity hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {adding ? (
        <div className="flex gap-2">
          <Input
            autoFocus
            value={draft}
            placeholder="e.g. Japanese, Statistics, Art & Design"
            maxLength={60}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
              if (e.key === "Escape") setAdding(false);
            }}
          />
          <Button type="button" onClick={addCustom} disabled={!draft.trim()}>
            Add
          </Button>
          <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setAdding(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add your own subject
        </Button>
      )}
    </div>
  );
}
