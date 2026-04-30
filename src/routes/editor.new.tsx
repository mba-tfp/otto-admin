import { createFileRoute } from "@tanstack/react-router";
import { EditorView } from "../components/EditorView";

export const Route = createFileRoute("/editor/new")({
  head: () => ({ meta: [{ title: "New content — Otto Help Center Admin" }] }),
  component: NewEditorPage,
});

function NewEditorPage() {
  return <EditorView mode="new" />;
}
