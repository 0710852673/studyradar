import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/studyos/AppShell";
import { ResourceHub } from "@/components/studyos/ResourceHub";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resource Hub — Study Radar" },
      { name: "description", content: "Curated external learning resources for Sri Lankan O/L and A/L students." },
      { property: "og:title", content: "Resource Hub — Study Radar" },
      { property: "og:description", content: "Find and suggest useful independent learning websites." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResourceHubPage,
});

function ResourceHubPage() {
  return (
    <AppShell title="Resource Hub" subtitle="Independent learning links, curated for O/L and A/L">
      <ResourceHub />
    </AppShell>
  );
}
