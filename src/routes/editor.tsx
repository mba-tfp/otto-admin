import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useMemo } from "react";
import { TopBar, PrimaryButton, OutlineButton, PageContent, Card } from "../components/Layout";
import { TextInput, Select, Label } from "../components/Form";
import { TiptapEditor } from "../components/TiptapEditor";
import { FileText, X } from "lucide-react";

export const Route = createFileRoute("/editor")({
  head: () => ({ meta: [{ title: "Editor — Otto Help Center Admin" }] }),
  component: EditorPage,
});

type Attachment = { id: string; name: string; size: number };

const stages = [
  { label: "1 · Draft", color: "#2D7D46", bg: "#EAF3DE", current: false },
  { label: "2 · In review", color: "#92580A", bg: "#FEF3E2", current: true },
  { label: "3 · Approved", color: "#8A96AA", bg: "#F0F3F8", current: false },
  { label: "4 · Live", color: "#8A96AA", bg: "#F0F3F8", current: false },
];

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  // YouTube
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  // Vimeo
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function EditorPage() {
  const [title, setTitle] = useState("Dictation & Recording");
  const [contentType, setContentType] = useState("Article");
  const [appTags, setAppTags] = useState<string[]>(["Otto Notes", "Onboarding"]);
  const [previewApp, setPreviewApp] = useState("Otto Notes");
  const [videoUrl, setVideoUrl] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([
    { id: "1", name: "patient-consent-form.pdf", size: 214 * 1024 },
  ]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const embedUrl = useMemo(() => getEmbedUrl(videoUrl), [videoUrl]);

  const toggleTag = (tag: string) => {
    setAppTags((p) => (p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]));
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const allowed = [".pdf", ".docx", ".doc", ".png", ".jpeg", ".jpg"];
    const next: Attachment[] = [];
    Array.from(files).forEach((f) => {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (allowed.includes(ext)) {
        next.push({ id: crypto.randomUUID(), name: f.name, size: f.size });
      }
    });
    setAttachments((p) => [...p, ...next]);
  };

  return (
    <>
      <TopBar
        title="Edit content"
        action={
          <>
            <OutlineButton>Save draft</OutlineButton>
            <PrimaryButton>Submit for review</PrimaryButton>
          </>
        }
      />
      <PageContent>
        {/* Workflow progress */}
        <div className="flex mb-5" style={{ borderRadius: 8, overflow: "hidden" }}>
          {stages.map((s) => (
            <div
              key={s.label}
              className="flex-1 text-center"
              style={{
                background: s.bg,
                color: s.color,
                fontSize: 11,
                padding: "10px 4px",
                fontWeight: s.current ? 500 : 400,
              }}
            >
              {s.label}
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          {/* LEFT */}
          <div className="flex-1 min-w-0">
            <Card padding={20}>
              <Label>Title</Label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: "100%",
                  fontSize: 15,
                  fontWeight: 500,
                  border: "1px solid #E2E6EF",
                  borderRadius: 8,
                  padding: "8px 10px",
                  marginBottom: 16,
                  outline: "none",
                  color: "#1A1F2E",
                }}
              />

              <TiptapEditor />

              {/* Video */}
              <div style={{ marginTop: 20 }}>
                <Label>Video embed</Label>
                <div className="flex items-center gap-2 mb-2">
                  <TextInput
                    value={videoUrl}
                    onChange={setVideoUrl}
                    placeholder="Paste a YouTube or Vimeo URL..."
                    style={{ width: "100%" }}
                  />
                  {videoUrl && <OutlineButton onClick={() => setVideoUrl("")}>Remove</OutlineButton>}
                </div>
                {embedUrl ? (
                  <div style={{ aspectRatio: "16 / 9", borderRadius: 8, overflow: "hidden", border: "1px solid #E2E6EF" }}>
                    <iframe
                      src={embedUrl}
                      style={{ width: "100%", height: "100%", border: 0 }}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center"
                    style={{
                      background: "#F7F9FC",
                      border: "1px dashed #E2E6EF",
                      borderRadius: 8,
                      height: 80,
                      color: "#8A96AA",
                      fontSize: 12,
                    }}
                  >
                    {videoUrl ? "Not a recognised YouTube or Vimeo URL" : "No video added yet"}
                  </div>
                )}
              </div>

              {/* Attachments */}
              <div style={{ marginTop: 20 }}>
                <Label>Attachments</Label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    addFiles(e.dataTransfer.files);
                  }}
                  className="flex items-center justify-center cursor-pointer"
                  style={{
                    background: dragOver ? "#EEF1F7" : "#F7F9FC",
                    border: "1px dashed #E2E6EF",
                    borderRadius: 8,
                    height: 48,
                    color: "#8A96AA",
                    fontSize: 12,
                    transition: "background 0.15s",
                  }}
                >
                  Drag & drop or click to attach files — PDF, DOCX, PNG, JPEG
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,.png,.jpeg,.jpg"
                  style={{ display: "none" }}
                  onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
                />
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {attachments.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-2"
                        style={{ background: "#fff", border: "1px solid #EEF1F7", borderRadius: 8, padding: "8px 10px" }}
                      >
                        <FileText size={14} style={{ color: "#8A96AA" }} />
                        <div className="flex-1 min-w-0" style={{ fontSize: 12, color: "#1A1F2E" }}>
                          {a.name} <span style={{ color: "#8A96AA" }}>· {formatSize(a.size)}</span>
                        </div>
                        <button
                          onClick={() => setAttachments((p) => p.filter((x) => x.id !== a.id))}
                          style={{ color: "#8A96AA", padding: 4 }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT */}
          <div style={{ width: 290, flexShrink: 0 }} className="flex flex-col gap-3">
            {/* Publish settings */}
            <Card padding={16}>
              <Label>Content type</Label>
              <div style={{ marginBottom: 12 }}>
                <Select value={contentType} onChange={setContentType} options={["Article", "FAQ", "What's new"]} width="100%" />
              </div>
              <Label>App tags</Label>
              <div className="flex flex-wrap gap-1.5">
                {["Otto Notes", "Onboarding", "Fertiwise"].map((t) => {
                  const sel = appTags.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTag(t)}
                      style={{
                        padding: "5px 11px",
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 500,
                        background: sel ? "#1B2B4B" : "#F0F3F8",
                        color: sel ? "#fff" : "#8A96AA",
                        border: sel ? "1px solid #1B2B4B" : "1px solid #E2E6EF",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Workflow */}
            <Card padding={16}>
              <Label>Workflow</Label>
              <div style={{ fontSize: 12, marginBottom: 12 }}>
                <span style={{ color: "#8A96AA" }}>Status: </span>
                <span style={{ color: "#92580A", fontWeight: 500 }}>In review</span>
              </div>
              <div className="flex flex-col" style={{ gap: 7 }}>
                <button
                  className="text-white font-medium"
                  style={{ width: "100%", background: "#1B2B4B", borderRadius: 8, padding: "8px 0", fontSize: 12 }}
                >
                  Approve
                </button>
                <button
                  style={{
                    width: "100%",
                    background: "#fff",
                    border: "1px solid #E2E6EF",
                    borderRadius: 8,
                    padding: "8px 0",
                    fontSize: 12,
                    color: "#1B2B4B",
                    fontWeight: 500,
                  }}
                >
                  Request changes
                </button>
                <button
                  style={{ width: "100%", color: "#8A96AA", fontSize: 11, padding: "4px 0" }}
                >
                  Back to draft
                </button>
              </div>
            </Card>

            {/* Preview */}
            <Card padding={16}>
              <Label>Preview in app</Label>
              <div className="flex flex-wrap gap-1.5" style={{ marginBottom: 10 }}>
                {["Otto Notes", "Onboarding"].map((a) => {
                  const sel = previewApp === a;
                  return (
                    <button
                      key={a}
                      onClick={() => setPreviewApp(a)}
                      style={{
                        padding: "5px 11px",
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 500,
                        background: sel ? "#1B2B4B" : "#F0F3F8",
                        color: sel ? "#fff" : "#8A96AA",
                        border: sel ? "1px solid #1B2B4B" : "1px solid #E2E6EF",
                      }}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
              <button
                style={{
                  width: "100%",
                  background: "#fff",
                  border: "1px solid #E2E6EF",
                  borderRadius: 8,
                  padding: "8px 0",
                  fontSize: 12,
                  color: "#1B2B4B",
                  fontWeight: 500,
                }}
              >
                Open preview ↗
              </button>
            </Card>

            {/* Info */}
            <Card padding="0 16px">
              {[
                { l: "Last edited", v: "Apr 26, 2026" },
                { l: "Author", v: "A. Malik" },
                { l: "Version", v: <>v3 · <span style={{ color: "#E5635A" }}>View history</span></> },
              ].map((row, i) => (
                <div
                  key={row.l}
                  className="flex items-center justify-between"
                  style={{ padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid #EEF1F7" }}
                >
                  <div style={{ fontSize: 11, color: "#8A96AA" }}>{row.l}</div>
                  <div style={{ fontSize: 11, color: "#1A1F2E" }}>{row.v}</div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </PageContent>
    </>
  );
}
