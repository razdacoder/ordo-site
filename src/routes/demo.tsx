import { createFileRoute } from "@tanstack/react-router";
import type { DemoKind } from "@/lib/site-api";
import DemoPage from "@/pages/demo";

const KINDS: DemoKind[] = ["demo", "setup", "question"];

export const Route = createFileRoute("/demo")({
  // ?kind=setup or ?kind=question opens the form on that tab.
  validateSearch: (search: Record<string, unknown>): { kind?: DemoKind } =>
    KINDS.includes(search.kind as DemoKind) ? { kind: search.kind as DemoKind } : {},
  head: () => ({
    meta: [
      { title: "Book a demo | Ordo" },
      {
        name: "description",
        content: "Book a demo of Ordo, get help setting it up for your institution, or ask the team a question.",
      },
    ],
  }),
  component: function Demo() {
    const { kind } = Route.useSearch();
    return <DemoPage initialKind={kind ?? "demo"} />;
  },
});
