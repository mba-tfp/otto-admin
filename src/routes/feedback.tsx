import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { TopBar, PageContent, Card, AppBadge, Badge, PrimaryButton } from "../components/Layout";
import { Select } from "../components/Form";
import { useStore, actions, type FeedbackType, type FeedbackStatus } from "../data/store";

const searchSchema = z.object({
  type: fallback(z.string(), "All types").default("All types"),
  app: fallback(z.string(), "All apps").default("All apps"),
  status: fallback(z.string(), "All statuses").default("All statuses"),
  selected: fallback(z.string().optional(), undefined),
});

export const Route = createFileRoute("/feedback")({
  head: () => ({ meta: [{ title: "Feedback Inbox — Otto Help Center Admin" }] }),
  validateSearch: zodValidator(searchSchema),
  component: FeedbackPage,
});

const typeColors: Record<FeedbackType, { color: string; bg: string }> = {
  "Bug report": { color: "#A32D2D", bg: "#FCEBEB" },
  Support: { color: "#085041", bg: "#E1F5EE" },
  Feedback: { color: "#5A7099", bg: "#F0F3F8" },
  Rating: { color: "#5A7099", bg: "#F0F3F8" },
};

function FeedbackPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const feedback = useStore((s) => s.feedback);

  const filtered = feedback.filter((f) => {
    if (search.type !== "All types" && f.type !== search.type) return false;
    if (search.app !== "All apps" && f.app !== search.app) return false;
    if (search.status !== "All statuses" && f.status !== search.status) return false;
    return true;
  });

  const update = (patch: Record<string, string | undefined>) => {
    navigate({ to: "/feedback", search: (prev) => ({ ...prev, ...patch }) });
  };

  const selectedId = search.selected ?? filtered[0]?.id;
  const current = feedback.find((f) => f.id === selectedId) ?? filtered[0];

  // Keep selection valid as filters change
  useEffect(() => {
    if (filtered.length === 0) return;
    if (!filtered.find((f) => f.id === selectedId)) {
      update({ selected: filtered[0].id });
    }
  }, [selectedId, filtered.length]);

  // Mark current as read on selection
  useEffect(() => {
    if (current && current.unread) {
      actions.markFeedbackRead(current.id);
    }
  }, [current?.id]);

  const unreadCount = feedback.filter((f) => f.unread).length;

  return (
    <>
      <TopBar title="Feedback inbox" />
      <PageContent>
        <div className="flex items-center gap-2 mb-4">
          <Select value={search.type} onChange={(v) => update({ type: v })} options={["All types", "Bug report", "Support", "Feedback", "Rating"]} />
          <Select value={search.app} onChange={(v) => update({ app: v })} options={["All apps", "Otto Notes", "Onboarding", "Fertiwise"]} />
          <Select value={search.status} onChange={(v) => update({ status: v })} options={["All statuses", "New", "In progress", "Resolved"]} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Left: list */}
          <Card padding={0}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid #EEF1F7", color: "#8A96AA", fontSize: 11, fontWeight: 500 }}>
              {unreadCount} unread · {filtered.length} shown
            </div>
            <div>
              {filtered.length === 0 && (
                <div style={{ padding: "32px 18px", textAlign: "center", color: "#8A96AA", fontSize: 12 }}>
                  No feedback matches these filters.
                </div>
              )}
              {filtered.map((it, i) => {
                const tc = typeColors[it.type];
                const isSel = it.id === current?.id;
                return (
                  <div
                    key={it.id}
                    onClick={() => update({ selected: it.id })}
                    className="flex items-start gap-3 cursor-pointer transition-colors"
                    style={{
                      padding: "11px 18px",
                      borderBottom: i === filtered.length - 1 ? "none" : "1px solid #EEF1F7",
                      background: isSel ? "#F7F9FC" : "transparent",
                    }}
                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = "#F7F9FC"; }}
                    onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        background: it.unread ? "#E5635A" : "transparent",
                        border: it.unread ? "none" : "1px solid #C8CDD8",
                        marginTop: 5,
                        flexShrink: 0,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Badge text={it.type} color={tc.color} bg={tc.bg} />
                        <AppBadge name={it.app} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1F2E" }}>{it.subject}</div>
                      <div style={{ fontSize: 11, color: "#8A96AA", marginTop: 2 }}>{it.sender} · {it.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Right: detail */}
          <Card>
            {current ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-1.5">
                    <Badge text={current.type} color={typeColors[current.type].color} bg={typeColors[current.type].bg} />
                    <AppBadge name={current.app} />
                  </div>
                  <div style={{ fontSize: 11, color: "#8A96AA" }}>{current.time}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#1A1F2E", marginBottom: 3 }}>{current.subject}</div>
                <div style={{ fontSize: 12, color: "#8A96AA", marginBottom: 14 }}>{current.sender} · {current.email}</div>
                <div style={{ background: "#F7F9FC", border: "1px solid #EEF1F7", borderRadius: 8, padding: 12, fontSize: 12, color: "#3D5070", lineHeight: 1.6, marginBottom: 14 }}>
                  {current.message}
                </div>
                <div style={{ color: "#8A96AA", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
                  Internal note
                </div>
                <textarea
                  value={current.note}
                  onChange={(e) => actions.updateFeedback(current.id, { note: e.target.value })}
                  rows={3}
                  placeholder="Add a note for your team..."
                  style={{
                    width: "100%",
                    background: "#F7F9FC",
                    border: "1px solid #E2E6EF",
                    borderRadius: 8,
                    padding: 10,
                    fontSize: 12,
                    color: "#1A1F2E",
                    outline: "none",
                    marginBottom: 10,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Select
                      value={current.status}
                      onChange={(v) => actions.updateFeedback(current.id, { status: v as FeedbackStatus })}
                      options={["New", "In progress", "Resolved"]}
                      width="100%"
                    />
                  </div>
                  <PrimaryButton onClick={() => actions.updateFeedback(current.id, { unread: false })}>Save</PrimaryButton>
                </div>
              </>
            ) : (
              <div style={{ padding: "40px 0", textAlign: "center", color: "#8A96AA", fontSize: 12 }}>
                Select a feedback item to view details.
              </div>
            )}
          </Card>
        </div>
      </PageContent>
    </>
  );
}
