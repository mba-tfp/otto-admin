import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { TopBar, PrimaryButton, PageContent, StatusBadge, AppBadge, TypeBadge, OutlineButton } from "../components/Layout";
import { Select, TextInput } from "../components/Form";
import { Search } from "lucide-react";
import { useStore } from "../data/store";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  type: fallback(z.string(), "All types").default("All types"),
  app: fallback(z.string(), "All apps").default("All apps"),
  status: fallback(z.string(), "All statuses").default("All statuses"),
});

export const Route = createFileRoute("/content")({
  head: () => ({ meta: [{ title: "Content — Otto Help Center Admin" }] }),
  validateSearch: zodValidator(searchSchema),
  component: ContentPage,
});

function ContentPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const articles = useStore((s) => s.articles);

  const update = (patch: Partial<typeof search>) => {
    navigate({ to: "/content", search: (prev: typeof search) => ({ ...prev, ...patch }) });
  };

  const filtered = articles.filter((a) => {
    if (search.q && !a.title.toLowerCase().includes(search.q.toLowerCase())) return false;
    if (search.type !== "All types" && a.type !== search.type) return false;
    if (search.app !== "All apps" && !a.apps.includes(search.app) && !a.apps.includes("All apps")) return false;
    if (search.status !== "All statuses" && a.status !== search.status) return false;
    return true;
  });

  const filtersActive = !!search.q || search.type !== "All types" || search.app !== "All apps" || search.status !== "All statuses";

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
      <TopBar title="Content library" action={<PrimaryButton onClick={() => navigate({ to: "/editor/new" })}>+ New content</PrimaryButton>} />
      <PageContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative" style={{ width: 200 }}>
            <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#8A96AA" }} />
            <TextInput
              value={search.q}
              onChange={(v) => update({ q: v })}
              placeholder="Search content..."
              style={{ paddingLeft: 28, width: "100%" }}
            />
          </div>
          <Select value={search.type} onChange={(v) => update({ type: v })} options={["All types", "Article", "FAQ", "What's new"]} />
          <Select value={search.app} onChange={(v) => update({ app: v })} options={["All apps", "Otto Notes", "Onboarding", "Fertiwise"]} />
          <Select value={search.status} onChange={(v) => update({ status: v })} options={["All statuses", "Draft", "In review", "Approved", "Live"]} />
          {filtersActive && (
            <button
              onClick={() => navigate({ to: "/content", search: {} })}
              style={{ fontSize: 12, color: "#E5635A", padding: "7px 10px" }}
            >
              Clear filters
            </button>
          )}
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px 14px", textAlign: "center", color: "#8A96AA", fontSize: 12 }}>
                    No content matches these filters.
                  </td>
                </tr>
              ) : filtered.map((r, i) => {
                const action = r.status === "Approved" ? "Publish" : (r.status === "In review" ? "Review" : "Edit");
                return (
                  <tr
                    key={r.id}
                    className="transition-colors"
                    style={{ borderTop: i === 0 ? "none" : "1px solid #EEF1F7" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F9FC")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={td}><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
                    <td style={{ ...td, fontWeight: 500 }}>
                      <Link to="/editor/$id" params={{ id: r.id }} style={{ color: "#1A1F2E", textDecoration: "none" }}>
                        {r.title}
                      </Link>
                    </td>
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
                      {action === "Publish" ? (
                        <PrimaryButton onClick={() => navigate({ to: "/editor/$id", params: { id: r.id } })}>Publish</PrimaryButton>
                      ) : (
                        <OutlineButton onClick={() => navigate({ to: "/editor/$id", params: { id: r.id } })}>{action}</OutlineButton>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PageContent>
    </>
  );
}
