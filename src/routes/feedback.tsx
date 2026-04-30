import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar, PageContent, Card, AppBadge, Badge, PrimaryButton } from "../components/Layout";
import { Select } from "../components/Form";

export const Route = createFileRoute("/feedback")({
  head: () => ({ meta: [{ title: "Feedback Inbox — Otto Help Center Admin" }] }),
  component: FeedbackPage,
});

type FeedbackType = "Bug report" | "Support" | "Feedback" | "Rating";

type Item = {
  id: number;
  unread: boolean;
  type: FeedbackType;
  app: string;
  subject: string;
  sender: string;
  email: string;
  time: string;
  message: string;
};

const items: Item[] = [
  { id: 1, unread: true, type: "Bug report", app: "Otto Notes", subject: "Transcript stops mid-session", sender: "Dr. Amara Patel", email: "amara@clinic.com", time: "1 hour ago", message: "When I record a session longer than about 8 minutes, the transcript stops updating but the recording timer keeps running. I have to stop and restart, losing the audio between." },
  { id: 2, unread: true, type: "Support", app: "Onboarding", subject: "Can't find patient import option", sender: "Clinic Admin", email: "admin@example.com", time: "3 hours ago", message: "I'm trying to bulk-import our patient list from a CSV but the import button is not visible in the workflow setup screen. Where is it?" },
  { id: 3, unread: true, type: "Bug report", app: "Otto Notes", subject: "Letter not generating from session", sender: "Dr. Ben Harlow", email: "ben@harlow.uk", time: "Yesterday", message: "After completing a session and clicking 'Generate letter', nothing happens. No error, no letter. Tried in Chrome and Safari." },
  { id: 4, unread: false, type: "Feedback", app: "Otto Notes", subject: "Love the new template editor UI", sender: "Anonymous", email: "—", time: "2 days ago", message: "The redesign is gorgeous. Much faster to build a template now. One ask: please add keyboard shortcut for inserting a section." },
  { id: 5, unread: false, type: "Rating", app: "Fertiwise", subject: "★★★★☆ — Good but slow to load", sender: "Anonymous", email: "—", time: "3 days ago", message: "App is great once it loads, but initial load on cellular is painfully slow. Could you add an offline mode for cycle tracking?" },
];

const typeColors: Record<FeedbackType, { color: string; bg: string }> = {
  "Bug report": { color: "#A32D2D", bg: "#FCEBEB" },
  Support: { color: "#085041", bg: "#E1F5EE" },
  Feedback: { color: "#5A7099", bg: "#F0F3F8" },
  Rating: { color: "#5A7099", bg: "#F0F3F8" },
};

function FeedbackPage() {
  const [selected, setSelected] = useState<number>(1);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("New");
  const [type, setType] = useState("All types");
  const [app, setApp] = useState("All apps");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const current = items.find((i) => i.id === selected)!;

  return (
    <>
      <TopBar title="Feedback inbox" />
      <PageContent>
        <div className="flex items-center gap-2 mb-4">
          <Select value={type} onChange={setType} options={["All types", "Bug report", "Support", "Feedback", "Rating"]} />
          <Select value={app} onChange={setApp} options={["All apps", "Otto Notes", "Onboarding", "Fertiwise"]} />
          <Select value={statusFilter} onChange={setStatusFilter} options={["All statuses", "New", "In progress", "Resolved"]} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Left: list */}
          <Card padding={0}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid #EEF1F7", color: "#8A96AA", fontSize: 11, fontWeight: 500 }}>
              5 unread submissions
            </div>
            <div>
              {items.map((it, i) => {
                const tc = typeColors[it.type];
                const isSel = it.id === selected;
                return (
                  <div
                    key={it.id}
                    onClick={() => setSelected(it.id)}
                    className="flex items-start gap-3 cursor-pointer transition-colors"
                    style={{
                      padding: "11px 18px",
                      borderBottom: i === items.length - 1 ? "none" : "1px solid #EEF1F7",
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
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
                <Select value={status} onChange={setStatus} options={["New", "In progress", "Resolved"]} width="100%" />
              </div>
              <PrimaryButton>Save</PrimaryButton>
            </div>
          </Card>
        </div>
      </PageContent>
    </>
  );
}
