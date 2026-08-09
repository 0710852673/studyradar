import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/studyos/AppShell";
import { EmptyState, Panel } from "@/components/studyos/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useStudyOS } from "@/lib/studyos/store";
import { markStats, toKey } from "@/lib/studyos/analytics";

export const Route = createFileRoute("/marks")({
  head: () => ({
    meta: [
      { title: "Marks Tracker — Study Radar" },
      {
        name: "description",
        content: "Record exam marks per subject and watch your improvement trend over time.",
      },
      { property: "og:title", content: "Marks Tracker — Study Radar" },
      {
        property: "og:description",
        content: "Averages, highs, lows and improvement trends for every subject.",
      },
    ],
  }),
  component: MarksPage,
});

function MarksPage() {
  const { data, profile, addMark, removeMark } = useStudyOS();
  const [subject, setSubject] = useState(profile?.subjects[0] ?? "");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    examName: "",
    date: toKey(new Date()),
    marks: "",
    total: "100",
  });

  if (!profile) return null;
  const active = subject || profile.subjects[0] || "";
  const marks = data.marks.filter((m) => m.subject === active);
  const stats = markStats(marks);

  const save = () => {
    const m = Number(form.marks);
    const t = Number(form.total);
    if (!form.examName || !t || Number.isNaN(m)) return;
    addMark({ subject: active, examName: form.examName, date: form.date, marks: m, total: t });
    setForm({ examName: "", date: toKey(new Date()), marks: "", total: "100" });
    setOpen(false);
  };

  return (
    <AppShell title="Marks Tracker" subtitle="Every paper, plotted">
      <div className="mb-4 flex flex-wrap gap-2">
        {profile.subjects.map((s) => (
          <button
            key={s}
            onClick={() => setSubject(s)}
            className={cn(
              "rounded-full border px-3.5 py-2 text-sm transition-colors",
              s === active
                ? "border-primary bg-brand-soft text-primary"
                : "border-border bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {stats ? (
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ["Average", `${stats.average}%`],
            ["Highest", `${stats.highest}%`],
            ["Lowest", `${stats.lowest}%`],
          ].map(([l, v]) => (
            <div key={l} className="panel p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{l}</p>
              <p className="num mt-2 text-2xl font-semibold">{v}</p>
            </div>
          ))}
          <div className="panel p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Trend</p>
            <p
              className={cn(
                "num mt-2 flex items-center gap-1.5 text-2xl font-semibold",
                stats.trend >= 0 ? "text-primary" : "text-destructive",
              )}
            >
              {stats.trend >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              {stats.trend > 0 ? "+" : ""}
              {stats.trend}%
            </p>
          </div>
        </div>
      ) : null}

      <Panel
        title={`${active} results`}
        className="mt-4"
        action={
          <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add exam
          </Button>
        }
      >
        {!stats ? (
          <EmptyState text="No marks recorded for this subject yet." />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={stats.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="pct"
                  stroke="var(--brand)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "var(--brand)" }}
                />
              </LineChart>
            </ResponsiveContainer>

            <ul className="mt-4 divide-y divide-border">
              {[...marks]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{m.examName}</p>
                      <p className="text-xs text-muted-foreground">{m.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="num text-sm">
                        {m.marks}/{m.total}
                      </span>
                      <span className="num rounded-full bg-brand-soft px-2.5 py-1 text-xs text-primary">
                        {Math.round((m.marks / m.total) * 100)}%
                      </span>
                      <button
                        onClick={() => removeMark(m.id)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </>
        )}
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add exam result — {active}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Exam name (e.g. Term 2 Paper)"
              value={form.examName}
              onChange={(e) => setForm({ ...form, examName: e.target.value })}
            />
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="Marks"
                value={form.marks}
                onChange={(e) => setForm({ ...form, marks: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Total"
                value={form.total}
                onChange={(e) => setForm({ ...form, total: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={save}>
              Save result
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
