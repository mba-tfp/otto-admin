import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { TopBar, PageContent, Card } from "../components/Layout";
import { Select } from "../components/Form";
import { useStore } from "../data/store";

const searchSchema = z.object({
  app: fallback(z.string(), "All apps").default("All apps"),
  range: fallback(z.string(), "Last 30 days").default("Last 30 days"),
});

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Otto Help Center Admin" }] }),
  validateSearch: zodValidator(searchSchema),
  component: AnalyticsPage,
});

function StatCard({ label, value, sub, subColor }: { label: string; value: string; sub: string; subColor: string }) {
  return (
    <Card padding="16px 18px">
      <div style={{ fontSize: 11, color: "#8A96AA", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, color: "#1A1F2E", marginTop: 6, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: subColor, marginTop: 4 }}>{sub}</div>
    </Card>
  );
}

const baseTopArticles = [
  { name: "Create Your First Session", views: 487, app: "Otto Notes" },
  { name: "Using Templates", views: 381, app: "Otto Notes" },
  { name: "Dictation & Recording", views: 288, app: "Otto Notes" },
  { name: "Managing Letters", views: 214, app: "Otto Notes" },
  { name: "AI Assistant Basics", views: 159, app: "Otto Notes" },
  { name: "Account & Billing FAQ", views: 118, app: "Otto Notes" },
  { name: "Onboarding checklist", views: 94, app: "Onboarding" },
  { name: "Importing patients", views: 71, app: "Onboarding" },
  { name: "Cycle tracking basics", views: 68, app: "Fertiwise" },
];

const baseSearchTerms = [
  { name: "transcribe", count: 142, app: "Otto Notes" },
  { name: "template", count: 116, app: "Otto Notes" },
  { name: "GP letter", count: 94, app: "Otto Notes" },
  { name: "dictate", count: 71, app: "Otto Notes" },
  { name: "export PDF", count: 50, app: "Otto Notes" },
  { name: "billing", count: 31, app: "Otto Notes" },
  { name: "import csv", count: 28, app: "Onboarding" },
  { name: "cycle", count: 22, app: "Fertiwise" },
];

const byApp = [
  { name: "Otto Notes", value: 1241 },
  { name: "Onboarding", value: 412 },
  { name: "Fertiwise", value: 194 },
];

function BarRow({ name, pct, value, color }: { name: string; pct: number; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div style={{ width: 170, fontSize: 12, color: "#1A1F2E" }}>{name}</div>
      <div className="flex-1" style={{ height: 7, background: "#EEF1F7", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999 }} />
      </div>
      <div style={{ fontSize: 11, color: "#8A96AA", width: 36, textAlign: "right" }}>{value}</div>
    </div>
  );
}

function AnalyticsPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const feedback = useStore((s) => s.feedback);

  const update = (patch: Partial<typeof search>) => {
    navigate({ to: "/analytics", search: (prev: typeof search) => ({ ...prev, ...patch }) });
  };

  const rangeMultiplier = search.range === "Last 7 days" ? 0.25 : search.range === "Last 90 days" ? 2.8 : 1;
  const scale = (n: number) => Math.round(n * rangeMultiplier);

  const filtered = (search.app === "All apps" ? baseTopArticles : baseTopArticles.filter((a) => a.app === search.app))
    .map((a) => ({ ...a, views: scale(a.views) }));
  const filteredSearch = (search.app === "All apps" ? baseSearchTerms : baseSearchTerms.filter((s) => s.app === search.app))
    .map((t) => ({ ...t, count: scale(t.count) }));

  const articleMax = filtered[0]?.views ?? 1;
  const termMax = filteredSearch[0]?.count ?? 1;

  const totalViews = filtered.reduce((sum, a) => sum + a.views, 0);
  const visibleApps = (search.app === "All apps" ? byApp : byApp.filter((b) => b.name === search.app))
    .map((b) => ({ ...b, value: scale(b.value) }));
  const appMax = Math.max(...visibleApps.map((b) => b.value), 1);

  const submissions = feedback.length;
  const unresolved = feedback.filter((f) => f.status !== "Resolved").length;

  const isFiltered = search.app !== "All apps" || search.range !== "Last 30 days";

  return (
    <>
      <TopBar title="Analytics" />
      <PageContent>
        <div className="flex items-center gap-2 mb-4">
          <Select value={search.app} onChange={(v) => update({ app: v })} options={["All apps", "Otto Notes", "Onboarding", "Fertiwise"]} />
          <Select value={search.range} onChange={(v) => update({ range: v })} options={["Last 30 days", "Last 7 days", "Last 90 days"]} />
          {isFiltered && (
            <span style={{ fontSize: 11, color: "#8A96AA" }}>
              Showing filtered view
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <StatCard label="Total views" value={totalViews.toLocaleString()} sub={`${search.range.toLowerCase()}`} subColor="#2D7D46" />
          <StatCard label="Avg. rating" value="4.2 / 5" sub="+0.3 vs last period" subColor="#2D7D46" />
          <Link to="/feedback" search={{}} style={{ textDecoration: "none" }}>
            <StatCard label="Submissions" value={String(submissions)} sub={`${unresolved} unresolved →`} subColor="#92580A" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1B2B4B", marginBottom: 14 }}>Top articles by views</div>
            <div className="space-y-2.5">
              {filtered.length === 0 ? (
                <div style={{ fontSize: 12, color: "#8A96AA", textAlign: "center", padding: "20px 0" }}>No data for this app.</div>
              ) : filtered.slice(0, 6).map((a) => (
                <BarRow key={a.name} name={a.name} pct={Math.round((a.views / articleMax) * 100)} value={a.views} color="#1B2B4B" />
              ))}
            </div>
          </Card>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1B2B4B", marginBottom: 14 }}>Top search terms</div>
            <div className="space-y-2.5">
              {filteredSearch.length === 0 ? (
                <div style={{ fontSize: 12, color: "#8A96AA", textAlign: "center", padding: "20px 0" }}>No data for this app.</div>
              ) : filteredSearch.slice(0, 6).map((s) => (
                <BarRow key={s.name} name={s.name} pct={Math.round((s.count / termMax) * 100)} value={s.count} color="#E5635A" />
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#1B2B4B", marginBottom: 20 }}>Views by app</div>
          <div className="flex items-end justify-around" style={{ height: 110, padding: "0 40px" }}>
            {visibleApps.map((b) => {
              const h = Math.round((b.value / appMax) * 80) + 8;
              return (
                <div key={b.name} className="flex flex-col items-center" style={{ width: 100 }}>
                  <div style={{ fontSize: 11, color: "#8A96AA", marginBottom: 6 }}>{b.value.toLocaleString()}</div>
                  <div style={{ width: 60, height: h, background: "#1B2B4B", borderRadius: "4px 4px 0 0" }} />
                  <div style={{ fontSize: 11, color: "#8A96AA", marginTop: 8 }}>{b.name}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </PageContent>
    </>
  );
}
