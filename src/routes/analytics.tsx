import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar, PageContent, Card } from "../components/Layout";
import { Select } from "../components/Form";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Otto Help Center Admin" }] }),
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

const topArticles = [
  { name: "Create Your First Session", pct: 100, views: 487 },
  { name: "Using Templates", pct: 78, views: 381 },
  { name: "Dictation & Recording", pct: 59, views: 288 },
  { name: "Managing Letters", pct: 44, views: 214 },
  { name: "AI Assistant Basics", pct: 33, views: 159 },
  { name: "Account & Billing FAQ", pct: 24, views: 118 },
];
const topSearch = [
  { name: "transcribe", pct: 100, count: 142 },
  { name: "template", pct: 82, count: 116 },
  { name: "GP letter", pct: 66, count: 94 },
  { name: "dictate", pct: 50, count: 71 },
  { name: "export PDF", pct: 35, count: 50 },
  { name: "billing", pct: 22, count: 31 },
];
const byApp = [
  { name: "Otto Notes", height: 64, value: 1241 },
  { name: "Onboarding", height: 21, value: 412 },
  { name: "Fertiwise", height: 10, value: 194 },
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
  const [app, setApp] = useState("All apps");
  const [range, setRange] = useState("Last 30 days");

  return (
    <>
      <TopBar title="Analytics" />
      <PageContent>
        <div className="flex items-center gap-2 mb-4">
          <Select value={app} onChange={setApp} options={["All apps", "Otto Notes", "Onboarding", "Fertiwise"]} />
          <Select value={range} onChange={setRange} options={["Last 30 days", "Last 7 days", "Last 90 days"]} />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <StatCard label="Total views" value="1,847" sub="+12% vs last month" subColor="#2D7D46" />
          <StatCard label="Avg. rating" value="4.2 / 5" sub="+0.3 vs last month" subColor="#2D7D46" />
          <StatCard label="Submissions" value="23" sub="5 unresolved" subColor="#92580A" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1B2B4B", marginBottom: 14 }}>Top articles by views</div>
            <div className="space-y-2.5">
              {topArticles.map((a) => <BarRow key={a.name} name={a.name} pct={a.pct} value={a.views} color="#1B2B4B" />)}
            </div>
          </Card>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1B2B4B", marginBottom: 14 }}>Top search terms</div>
            <div className="space-y-2.5">
              {topSearch.map((s) => <BarRow key={s.name} name={s.name} pct={s.pct} value={s.count} color="#E5635A" />)}
            </div>
          </Card>
        </div>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#1B2B4B", marginBottom: 20 }}>Views by app</div>
          <div className="flex items-end justify-around" style={{ height: 110, padding: "0 40px" }}>
            {byApp.map((b) => (
              <div key={b.name} className="flex flex-col items-center" style={{ width: 100 }}>
                <div style={{ fontSize: 11, color: "#8A96AA", marginBottom: 6 }}>{b.value.toLocaleString()}</div>
                <div style={{ width: 60, height: b.height, background: "#1B2B4B", borderRadius: "4px 4px 0 0" }} />
                <div style={{ fontSize: 11, color: "#8A96AA", marginTop: 8 }}>{b.name}</div>
              </div>
            ))}
          </div>
        </Card>
      </PageContent>
    </>
  );
}
