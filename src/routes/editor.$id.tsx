import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { EditorView } from "../components/EditorView";

export const Route = createFileRoute("/editor/$id")({
  head: () => ({ meta: [{ title: "Edit content — Otto Help Center Admin" }] }),
  component: EditEditorPage,
  notFoundComponent: NotFound,
});

function EditEditorPage() {
  const { id } = Route.useParams();
  return <EditorView mode="edit" articleId={id} />;
}

function NotFound() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2 style={{ fontSize: 18, color: "#1B2B4B" }}>Article not found</h2>
      <p style={{ fontSize: 13, color: "#8A96AA", marginTop: 8 }}>This article may have been deleted.</p>
      <Link to="/content" style={{ color: "#E5635A", fontSize: 13, marginTop: 16, display: "inline-block" }}>← Back to content library</Link>
    </div>
  );
}
