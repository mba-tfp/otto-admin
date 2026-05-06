import { useRef, useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { TopBar, PrimaryButton, OutlineButton, PageContent, Card } from "./Layout";
import { TextInput, Select, Label } from "./Form";
import { TiptapEditor } from "./TiptapEditor";
import { FileText, X, ArrowLeft, Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { actions, useStore, type Status, type ContentType, type Article, type CalloutType, type ArticleStep } from "../data/store";

const calloutColors: Record<CalloutType, { border: string; bg: string }> = {
  Tip: { border: "#2D7D46", bg: "#EAF3DE" },
  Warning: { border: "#92580A", bg: "#FEF3E2" },
  Note: { border: "#1A5FA5", bg: "#E6F1FB" },
};

type Attachment = { id: string; name: string; size: number };

const stageOrder: Status[] = ["Draft", "In review", "Approved", "Live"];
const stageMeta: Record<Status, { color: string; bg: string; label: string }> = {
  Draft: { color: "#2D7D46", bg: "#EAF3DE", label: "1 · Draft" },
  "In review": { color: "#92580A", bg: "#FEF3E2", label: "2 · In review" },
  Approved: { color: "#1A5FA5", bg: "#E6F1FB", label: "3 · Approved" },
  Live: { color: "#2D7D46", bg: "#EAF3DE", label: "4 · Live" },
};

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ALL_APPS = ["Otto Notes", "Onboarding", "Fertiwise"];

export function EditorView({ mode, articleId }: { mode: "new" | "edit"; articleId?: string }) {
  const navigate = useNavigate();
  const article = useStore((s) =>
    articleId ? s.articles.find((a) => a.id === articleId) : undefined
  );

  // Local form state
  const [id] = useState(() => articleId ?? actions.newArticleId());
  const [title, setTitle] = useState(article?.title ?? "");
  const [subtitle, setSubtitle] = useState(article?.subtitle ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [contentType, setContentType] = useState<ContentType>(article?.type ?? "Article");
  const [appTags, setAppTags] = useState<string[]>(article?.apps ?? ["Otto Notes"]);
  const [status, setStatus] = useState<Status>(article?.status ?? "Draft");
  const [previewApp, setPreviewApp] = useState("Otto Notes");
  const [videoUrl, setVideoUrl] = useState("");
  const [callout, setCallout] = useState<{ type: CalloutType; body: string } | null>(article?.callout ?? null);
  const [steps, setSteps] = useState<ArticleStep[]>(article?.steps ?? []);
  const [relatedIds, setRelatedIds] = useState<string[]>(article?.relatedIds ?? []);
  const [relatedQuery, setRelatedQuery] = useState("");
  const allArticles = useStore((s) => s.articles);
  const [attachments, setAttachments] = useState<Attachment[]>(
    mode === "edit" ? [{ id: "att1", name: "patient-consent-form.pdf", size: 214 * 1024 }] : []
  );
  const [dragOver, setDragOver] = useState(false);
  const [savedOnce, setSavedOnce] = useState(mode === "edit");
  const fileRef = useRef<HTMLInputElement>(null);

  // If switching from a route that navigates between articles, sync state
  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setBody(article.body);
      setContentType(article.type);
      setAppTags(article.apps);
      setStatus(article.status);
    }
  }, [article?.id]);

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

  const [previewOpen, setPreviewOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const persist = (nextStatus?: Status, opts?: { silent?: boolean }) => {
    const newStatus = nextStatus ?? status;
    if (!title.trim() && newStatus !== "Draft") {
      toast.error("Add a title before submitting");
      return false;
    }
    const next: Article = {
      id,
      title: title.trim() || "Untitled",
      type: contentType,
      apps: appTags.length ? appTags : ["Otto Notes"],
      status: newStatus,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      author: article?.author ?? "Shahid S.",
      body,
    };
    actions.upsertArticle(next);
    setStatus(newStatus);
    setSavedOnce(true);
    if (mode === "new") {
      navigate({ to: "/editor/$id", params: { id }, replace: true });
    }
    if (!opts?.silent) {
      const map: Record<Status, string> = {
        Draft: "Draft saved",
        "In review": "Submitted for review",
        Approved: "Approved",
        Live: "Published — now live",
      };
      toast.success(map[newStatus]);
    }
    return true;
  };

  const onSaveDraft = () => persist();
  const onSubmitForReview = () => persist("In review");
  const onApprove = () => persist("Approved");
  const onRequestChanges = () => { persist("Draft", { silent: true }); toast("Changes requested — back to draft"); };
  const onBackToDraft = () => persist("Draft");
  const onPublish = () => persist("Live");

  const onDelete = () => {
    if (mode === "edit" && articleId) {
      actions.deleteArticle(articleId);
      toast(`Deleted "${title || "Untitled"}"`);
      navigate({ to: "/content", search: {} });
    } else {
      navigate({ to: "/content", search: {} });
    }
  };

  // Top bar action varies with status
  const topBarAction = (() => {
    if (status === "Draft") {
      return (
        <>
          <OutlineButton onClick={onSaveDraft}>Save draft</OutlineButton>
          <PrimaryButton onClick={onSubmitForReview}>Submit for review</PrimaryButton>
        </>
      );
    }
    if (status === "In review") {
      return <OutlineButton onClick={onSaveDraft}>Save</OutlineButton>;
    }
    if (status === "Approved") {
      return (
        <>
          <OutlineButton onClick={onSaveDraft}>Save</OutlineButton>
          <PrimaryButton onClick={onPublish}>Publish</PrimaryButton>
        </>
      );
    }
    return <OutlineButton onClick={onSaveDraft}>Save</OutlineButton>;
  })();

  return (
    <>
      <TopBar
        title={
          <>
            <Link to="/content" search={{ q: "", type: "All types", app: "All apps", status: "All statuses" }} style={{ color: "#8A96AA", display: "inline-flex", alignItems: "center", padding: 4, marginLeft: -4 }}>
              <ArrowLeft size={16} />
            </Link>
            <span>{mode === "new" ? "New content" : "Edit content"}</span>
          </>
        }
        action={topBarAction}
      />
      <PageContent>
        {/* Workflow progress */}
        <div className="flex mb-5" style={{ borderRadius: 8, overflow: "hidden" }}>
          {stageOrder.map((s) => {
            const meta = stageMeta[s];
            const current = s === status;
            const past = stageOrder.indexOf(s) < stageOrder.indexOf(status);
            return (
              <div
                key={s}
                className="flex-1 text-center"
                style={{
                  background: current || past ? meta.bg : "#F0F3F8",
                  color: current || past ? meta.color : "#8A96AA",
                  fontSize: 11,
                  padding: "10px 4px",
                  fontWeight: current ? 500 : 400,
                }}
              >
                {meta.label}
              </div>
            );
          })}
        </div>

        <div className="flex gap-4">
          {/* LEFT */}
          <div className="flex-1 min-w-0">
            <Card padding={20}>
              <Label>Title</Label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={mode === "new" ? "Give your content a title..." : ""}
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

              <TiptapEditor key={id} content={body} onChange={setBody} />

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
                <Select
                  value={contentType}
                  onChange={(v) => setContentType(v as ContentType)}
                  options={["Article", "FAQ", "What's new"]}
                  width="100%"
                />
              </div>
              <Label>App tags</Label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_APPS.map((t) => {
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
                <span style={{ color: stageMeta[status].color, fontWeight: 500 }}>{status}</span>
              </div>
              <div className="flex flex-col" style={{ gap: 7 }}>
                {status === "Draft" && (
                  <button
                    className="text-white font-medium"
                    style={{ width: "100%", background: "#1B2B4B", borderRadius: 8, padding: "8px 0", fontSize: 12 }}
                    onClick={onSubmitForReview}
                  >
                    Submit for review
                  </button>
                )}
                {status === "In review" && (
                  <>
                    <button
                      className="text-white font-medium"
                      style={{ width: "100%", background: "#1B2B4B", borderRadius: 8, padding: "8px 0", fontSize: 12 }}
                      onClick={onApprove}
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
                      onClick={onRequestChanges}
                    >
                      Request changes
                    </button>
                  </>
                )}
                {status === "Approved" && (
                  <button
                    className="text-white font-medium"
                    style={{ width: "100%", background: "#1B2B4B", borderRadius: 8, padding: "8px 0", fontSize: 12 }}
                    onClick={onPublish}
                  >
                    Publish
                  </button>
                )}
                {status === "Live" && (
                  <div style={{ fontSize: 11, color: "#8A96AA", textAlign: "center", padding: "4px 0" }}>
                    Live — visible to users
                  </div>
                )}
                {status === "Live" && (
                  <div>
                    <button
                      style={{ width: "100%", color: "#A32D2D", fontSize: 11, padding: "4px 0", fontWeight: 500 }}
                      onClick={() => persist("Approved")}
                    >
                      Unpublish
                    </button>
                    <div style={{ fontSize: 10, color: "#8A96AA", textAlign: "center", marginTop: 2 }}>
                      Removes from help center immediately
                    </div>
                  </div>
                )}
                {(status === "In review" || status === "Approved") && (
                  <button
                    style={{ width: "100%", color: "#8A96AA", fontSize: 11, padding: "4px 0" }}
                    onClick={onBackToDraft}
                  >
                    Back to draft
                  </button>
                )}
              </div>
            </Card>

            {/* Preview */}
            <Card padding={16}>
              <Label>Preview in app</Label>
              <div className="flex flex-wrap gap-1.5" style={{ marginBottom: 10 }}>
                {appTags.length ? appTags.map((a) => {
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
                }) : <div style={{ fontSize: 11, color: "#8A96AA" }}>Select an app tag first</div>}
              </div>
              <button
                onClick={() => setPreviewOpen(true)}
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

            {/* Danger zone */}
            <Card padding={16}>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center justify-center gap-1.5"
                style={{ width: "100%", color: "#A32D2D", fontSize: 12, padding: "6px 0", fontWeight: 500 }}
              >
                <Trash2 size={13} /> Delete article
              </button>
            </Card>

            {/* Info */}
            {savedOnce && (
              <Card padding="0 16px">
                {[
                  { l: "Last edited", v: article?.date ?? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
                  { l: "Author", v: article?.author ?? "Shahid S." },
                  {
                    l: "Version",
                    v: (
                      <>
                        v{article ? 3 : 1} ·{" "}
                        <button onClick={() => setHistoryOpen(true)} style={{ color: "#E5635A", padding: 0 }}>View history</button>
                      </>
                    ),
                  },
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
            )}
          </div>
        </div>
      </PageContent>

      {/* Preview modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview · {previewApp}</DialogTitle>
          </DialogHeader>
          <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #E2E6EF", maxHeight: "60vh", overflowY: "auto" }}>
            <div style={{ background: "#F7F9FC", padding: "10px 14px", borderBottom: "1px solid #E2E6EF", fontSize: 12, color: "#5A7099" }}>
              {previewApp} Help Center
            </div>
            <div style={{ background: "#fff", padding: "20px 22px" }}>
              <div style={{ fontSize: 11, color: "#8A96AA", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>{contentType}</div>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: "#1A1F2E", marginBottom: 14 }}>{title || "Untitled"}</h1>
              <div className="tiptap-content" style={{ fontSize: 14, color: "#1A1F2E", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: body || "<p style='color:#8A96AA'>No content yet.</p>" }} />
            </div>
          </div>
          <DialogFooter>
            <OutlineButton onClick={() => setPreviewOpen(false)}>Close</OutlineButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History modal */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Version history</DialogTitle>
          </DialogHeader>
          <div>
            {[
              { v: "v3", who: article?.author ?? "Shahid S.", when: article?.date ?? "Today", note: "Current" },
              { v: "v2", who: "A. Malik", when: "Apr 24", note: "Edits to intro" },
              { v: "v1", who: "Shahid S.", when: "Apr 20", note: "Initial draft" },
            ].map((h, i) => (
              <div key={h.v} className="flex items-center justify-between" style={{ padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid #EEF1F7" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1F2E" }}>{h.v} · {h.note}</div>
                  <div style={{ fontSize: 11, color: "#8A96AA", marginTop: 2 }}>{h.who} · {h.when}</div>
                </div>
                {i === 0 ? (
                  <span style={{ fontSize: 11, color: "#8A96AA" }}>Current</span>
                ) : (
                  <button onClick={() => { setHistoryOpen(false); toast(`Restored ${h.v}`); }} style={{ fontSize: 11, color: "#E5635A", fontWeight: 500 }}>Restore</button>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <OutlineButton onClick={() => setHistoryOpen(false)}>Close</OutlineButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this article?</DialogTitle>
          </DialogHeader>
          <p style={{ fontSize: 13, color: "#5A7099" }}>
            "{title || "Untitled"}" will be permanently removed. This cannot be undone.
          </p>
          <DialogFooter>
            <OutlineButton onClick={() => setConfirmDelete(false)}>Cancel</OutlineButton>
            <button
              onClick={onDelete}
              style={{ background: "#A32D2D", color: "#fff", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500 }}
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
