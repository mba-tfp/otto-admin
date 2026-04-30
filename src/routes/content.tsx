import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar, PrimaryButton, PageContent, Card, StatusBadge, AppBadge, TypeBadge, OutlineButton } from "../components/Layout";
import { Select, TextInput } from "../components/Form";
import { Search } from "lucide-react";

export const Route = createFileRoute("/content")({
  head: () => ({ meta: [{ title: "Content — Otto Help Center Admin" }] }),
  component: ContentPage,
});

type Row = {
  title: string;
  type: "Article" | "FAQ" | "What's new";
  apps: string[];
  status: "Live" | "In review" | "Approved" | "Draft";
  date: string;
  author: string;
  action: "Edit" | "Review" | "Publish";
};

const rows: Row[] = [
  { title: "Create Your First Session", type: "Article", apps: ["Otto Notes"], status: "Live", date: "Apr 28", author: "Shahid S.", action: "Edit" },
  { title: "Using Templates", type: "Article", apps: ["Otto Notes"], status: "Live", date: "Apr 27", author: "Shahid S.", action: "Edit" },
  { title: "Dictation & Recording", type: "Article", apps: ["Otto Notes", "Onboarding"], status: "In review", date: "Apr 26", author: "A. Malik", action: "Review" },
  { title: "Managing Letters", type: "Article", apps: ["Otto Notes"], status: "In review", date: "Apr 25", author: "A. Malik", action: "Review" },
  { title: "Templates & Notes FAQ", type: "FAQ", apps: ["Otto Notes"], status: "Live", date: "Apr 22", author: "R. Khan", action: "Edit" },
  { title: "Account & Billing FAQ", type: "FAQ", apps: ["Otto Notes", "Fertiwise"], status: "In review", date: "Apr 21", author: "R. Khan", action: "Review" },
  { title: "AI Writing Assistant v2", type: "What's new", apps: ["Otto Notes"], status: "Approved", date: "Apr 19", author: "Shahid S.", action: "Publish" },
  { title: "Privacy & Security FAQ", type: "FAQ", apps: ["All apps"], status: "Draft", date: "Apr 18", author: "R. Khan", action: "Edit" },
];

function ContentPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All types");
  const [app, setApp] = useState("All apps");
  const [status, setStatus] = useState("All statuses");

  const goEditor = () => navigate({ to: "/editor" });

  const th: React.CSSProperties = {
    padding: "10px 14px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 500,
    color: "#8A96AA",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    background: "#F7F9FC",
    borderBottom: "1px solid #EEF1F7",
  };
  const td: React.CSSProperties = { padding: "10px 14px", fontSize: 12, color: "#1A1F2E", verticalAlign: "middle" };

  return (
    <>
      <TopBar title="Content library" action={<PrimaryButton onClick={goEditor}>+ New content</PrimaryButton>} />
      <PageContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative" style={{ width: 200 }}>
            <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#8A96AA" }} />
            <TextInput
              value={search}
              onChange={setSearch}
              placeholder="Search content..."
              style={{ paddingLeft: 28, width: "100%" }}
            />
          </div>
          <Select value={type} onChange={setType} options={["All types", "Article", "FAQ", "What's new"]} />
          <Select value={app} onChange={setApp} options={["All apps", "Otto Notes", "Onboarding", "Fertiwise"]} />
          <Select value={status} onChange={setStatus} options={["All statuses", "Draft", "In review", "Approved", "Live"]} />
        </div>

        <div style={{ background: "#fff", border: "1px solid #E2E6EF", borderRadius: 10, overflow: "hidden" }}>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...th, width: 38 }}><input type="checkbox" /></th>
                <th style={th}>Title</th>
                <th style={th}>Type</th>
                <th style={th}>Apps</th>
                <th style={th}>Status</th>
                <th style={th}>Last edited</th>
                <th style={th}>Author</th>
                <th style={{ ...th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.title}
                  className="transition-colors"
                  style={{ borderTop: i === 0 ? "none" : "1px solid #EEF1F7", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F9FC")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={td}><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
                  <td style={{ ...td, fontWeight: 500 }}>{r.title}</td>
                  <td style={td}><TypeBadge type={r.type} /></td>
                  <td style={td}>
                    <div className="flex gap-1 flex-wrap">
                      {r.apps.map((a) => <AppBadge key={a} name={a} />)}
                    </div>
                  </td>
                  <td style={td}><StatusBadge status={r.status} /></td>
                  <td style={{ ...td, color: "#8A96AA" }}>{r.date}</td>
                  <td style={{ ...td, color: "#8A96AA" }}>{r.author}</td>
                  <td style={{ ...td, textAlign: "right" }}>
                    {r.action === "Publish" ? (
                      <PrimaryButton onClick={goEditor}>Publish</PrimaryButton>
                    ) : (
                      <OutlineButton onClick={goEditor}>{r.action}</OutlineButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageContent>
    </>
  );
}
