import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { TopBar, PrimaryButton, PageContent, Card, StatusBadge } from "../components/Layout";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Otto Help Center Admin" }] }),
  component: Dashboard,
});

function StatCard({ label, value, sub, subColor }: { label: string; value: string; sub: string; subColor: string }) {
  return (
    <Card padding="16px 18px">
      <div style={{ fontSize: 11, color: "#8A96AA", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, color: "#1A1F2E", marginTop: 6, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: subColor, marginTop: 4 }}>{sub}</div>
    </Card>
  );
}

const pending = [
  { title: "Dictation & Recording", sub: "Article · Otto Notes, Onboarding", status: "In review" as const },
  { title: "Account & Billing FAQ", sub: "FAQ · Otto Notes, Fertiwise", status: "In review" as const },
  { title: "AI Writing Assistant v2", sub: "What's new · Otto Notes", status: "Approved" as const },
];

const activity = [
  { initials: "SS", bg: "#1B2B4B", color: "#fff", text: "Published 'Create Your First Session'", time: "2 hours ago" },
  { initials: "AM", bg: "#EAF3DE", color: "#2D7D46", text: "Submitted 'Managing Letters' for review", time: "Yesterday" },
  { initials: "RK", bg: "#FCEBEB", color: "#A32D2D", text: "Created 'Privacy & Security FAQ'", time: "2 days ago" },
];

const topArticles = [
  { name: "Create Your First Session", pct: 100, views: 248 },
  { name: "Using Templates", pct: 77, views: 191 },
  { name: "Dictation & Recording", pct: 60, views: 148 },
  { name: "Managing Letters", pct: 42, views: 103 },
  { name: "AI Assistant Basics", pct: 31, views: 76 },
];

function Dashboard() {
  const navigate = useNavigate();
  return (
    <>
      <TopBar
        title="Dashboard"
        action={<PrimaryButton onClick={() => navigate({ to: "/editor" })}>+ New content</PrimaryButton>}
      />
      <PageContent>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <StatCard label="Total articles" value="24" sub="+3 this month" subColor="#2D7D46" />
          <StatCard label="Published" value="18" sub="across all apps" subColor="#8A96AA" />
          <StatCard label="Pending approval" value="3" sub="needs review" subColor="#92580A" />
          <StatCard label="New feedback" value="5" sub="unread" subColor="#92580A" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card>
            <div className="flex items-center justify-between mb-2">
              <div style={{ fontSize: 13, fontWeight: 500, color: "#1B2B4B" }}>Pending approval</div>
              <Link to="/content" style={{ fontSize: 11, color: "#E5635A" }}>View all →</Link>
            </div>
            <div>
              {pending.map((p, i) => (
                <div
                  key={p.title}
                  className="flex items-center justify-between py-3"
                  style={{ borderTop: i === 0 ? "none" : "1px solid #F0F3F8" }}
                >
                  <div className="min-w-0">
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1F2E" }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: "#8A96AA", marginTop: 2 }}>{p.sub}</div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1B2B4B", marginBottom: 8 }}>Recent activity</div>
            <div>
              {activity.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-3"
                  style={{ borderTop: i === 0 ? "none" : "1px solid #F0F3F8" }}
                >
                  <div
                    className="flex items-center justify-center font-medium flex-shrink-0"
                    style={{ width: 26, height: 26, borderRadius: 999, background: a.bg, color: a.color, fontSize: 10 }}
                  >
                    {a.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 12, color: "#1A1F2E" }}>{a.text}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#8A96AA" }}>{a.time}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1B2B4B" }}>Top articles this week</div>
            <Link to="/analytics" style={{ fontSize: 11, color: "#E5635A" }}>Full analytics →</Link>
          </div>
          <div className="space-y-2.5">
            {topArticles.map((a) => (
              <div key={a.name} className="flex items-center gap-3">
                <div style={{ width: 170, fontSize: 12, color: "#1A1F2E" }}>{a.name}</div>
                <div className="flex-1" style={{ height: 7, background: "#EEF1F7", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: `${a.pct}%`, height: "100%", background: "#1B2B4B", borderRadius: 999 }} />
                </div>
                <div style={{ fontSize: 11, color: "#8A96AA", width: 36, textAlign: "right" }}>{a.views}</div>
              </div>
            ))}
          </div>
        </Card>
      </PageContent>
    </>
  );
}
