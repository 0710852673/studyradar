import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/studyos/AppShell";
import { EmptyState, Panel } from "@/components/studyos/Primitives";
import { Button } from "@/components/ui/button";
import { useSaved } from "@/lib/studyos/saved";
import { useStudyOS } from "@/lib/studyos/store";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved — Study Radar" },
      { name: "description", content: "Your private list of saved guides, videos and answers." },
      { property: "og:title", content: "Saved — Study Radar" },
      { property: "og:description", content: "Your private saved study content." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { session } = useStudyOS();
  const { items, loading, error, remove, refresh } = useSaved(session?.user?.id);
  return (
    <AppShell title="Saved" subtitle="Only you can see this list.">
      <Panel title={`${items.length} saved`}>
        {error ? (
          <div role="alert" className="space-y-2 text-sm text-destructive">
            <p>Saved items could not be loaded: {error}</p>
            <Button size="sm" variant="outline" onClick={() => void refresh()}>Retry</Button>
          </div>
        ) : loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <EmptyState text="Nothing saved yet. Items you save will appear here on every device." />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{i.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.kind} · saved {new Date(i.savedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove ${i.title}`}
                  onClick={() =>
                    remove(i.id).catch(() => toast.error("Couldn't remove. Try again."))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}
