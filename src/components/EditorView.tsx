import { useRef, useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { TopBar, PrimaryButton, OutlineButton, PageContent, Card } from "./Layout";
import { TextInput, Select, Label } from "./Form";
import { TiptapEditor } from "./TiptapEditor";
import { FileText, X, ArrowLeft, Trash2, Plus, GripVertical } from "lucide-react";
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
  const [faqCategory, setFaqCategory] = useState(article?.faqCategory ?? "");
  const [faqPairs, setFaqPairs] = useState<{ id: string; question: string; answer: string }[]>(
    article?.faqPairs ??
      (article?.type === "FAQ" || (!article && false)
        ? [{ id: crypto.randomUUID(), question: "", answer: "" }]
        : []),
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
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
      setSubtitle(article.subtitle ?? "");
      setBody(article.body);
      setContentType(article.type);
      setAppTags(article.apps);
      setStatus(article.status);
      setCallout(article.callout ?? null);
      setSteps(article.steps ?? []);
      setRelatedIds(article.relatedIds ?? []);
      setFaqCategory(article.faqCategory ?? "");
      setFaqPairs(article.faqPairs ?? []);
    }
  }, [article?.id]);

  // Seed one empty FAQ pair when switching to FAQ with no pairs
  useEffect(() => {
    if (contentType === "FAQ" && faqPairs.length === 0) {
      setFaqPairs([{ id: crypto.randomUUID(), question: "", answer: "" }]);
    }
  }, [contentType]);

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
      subtitle: contentType === "Article" ? subtitle : undefined,
      callout: contentType === "Article" ? callout : null,
      steps: contentType === "Article" ? steps : undefined,
      relatedIds: contentType === "Article" ? relatedIds : undefined,
      faqCategory: contentType === "FAQ" ? faqCategory : undefined,
      faqPairs: contentType === "FAQ" ? faqPairs : undefined,
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

              {contentType === "Article" && (
                <>
                  <Label>Subtitle</Label>
                  <input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="A short description shown in article list views"
                    style={{
                      width: "100%",
                      fontSize: 13,
                      fontWeight: 400,
                      border: "1px solid #E2E6EF",
                      borderRadius: 8,
                      padding: "8px 10px",
                      marginBottom: 16,
                      outline: "none",
                      color: "#1A1F2E",
                    }}
                  />
                </>
              )}

              {contentType !== "FAQ" && (
                <TiptapEditor key={id} content={body} onChange={setBody} />
              )}

              {contentType === "FAQ" && (
                <div>
                  <Label>Category</Label>
                  <input
                    value={faqCategory}
                    onChange={(e) => setFaqCategory(e.target.value)}
                    placeholder="e.g. Account & Billing, Getting Started, Privacy & Security"
                    style={{
                      width: "100%",
                      fontSize: 13,
                      border: "1px solid #E2E6EF",
                      borderRadius: 8,
                      padding: "8px 10px",
                      outline: "none",
                      color: "#1A1F2E",
                    }}
                  />
                  <div style={{ fontSize: 11, color: "#8A96AA", marginTop: 6, marginBottom: 18 }}>
                    Groups related questions together in the help center
                  </div>

                  {faqPairs.length === 0 ? (
                    <div
                      className="flex items-center justify-center"
                      style={{
                        border: "1px dashed #E2E6EF",
                        borderRadius: 8,
                        padding: 24,
                        color: "#8A96AA",
                        fontSize: 13,
                        marginBottom: 10,
                      }}
                    >
                      No questions yet — click "+ Add question" to get started
                    </div>
                  ) : (
                    faqPairs.map((pair, i) => (
                      <div
                        key={pair.id}
                        draggable
                        onDragStart={() => setDragIndex(i)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (dragIndex === null || dragIndex === i) return;
                          setFaqPairs((p) => {
                            const next = [...p];
                            const [moved] = next.splice(dragIndex, 1);
                            next.splice(i, 0, moved);
                            return next;
                          });
                          setDragIndex(null);
                        }}
                        className="flex gap-2"
                        style={{
                          border: "1px solid #E2E6EF",
                          borderRadius: 8,
                          padding: 12,
                          background: "#fff",
                          marginBottom: 10,
                        }}
                      >
                        <div
                          style={{ color: "#8A96AA", cursor: "grab", paddingTop: 2, flexShrink: 0 }}
                          aria-label="Drag to reorder"
                        >
                          <GripVertical size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, color: "#8A96AA", fontWeight: 500 }}>Q{i + 1}</div>
                            <button
                              onClick={() => setFaqPairs((p) => p.filter((x) => x.id !== pair.id))}
                              style={{ color: "#8A96AA", padding: 4 }}
                              aria-label="Delete question"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <Label>Question</Label>
                          <input
                            value={pair.question}
                            onChange={(e) =>
                              setFaqPairs((p) =>
                                p.map((x) => (x.id === pair.id ? { ...x, question: e.target.value } : x)),
                              )
                            }
                            placeholder="e.g. How do I reset my password?"
                            style={{
                              width: "100%",
                              fontSize: 13,
                              border: "1px solid #E2E6EF",
                              borderRadius: 8,
                              padding: "8px 10px",
                              outline: "none",
                              color: "#1A1F2E",
                              marginBottom: 12,
                            }}
                          />
                          <Label>Answer</Label>
                          <TiptapEditor
                            key={pair.id}
                            content={pair.answer}
                            onChange={(html) =>
                              setFaqPairs((p) =>
                                p.map((x) => (x.id === pair.id ? { ...x, answer: html } : x)),
                              )
                            }
                          />
                        </div>
                      </div>
                    ))
                  )}

                  <button
                    onClick={() =>
                      setFaqPairs((p) => [...p, { id: crypto.randomUUID(), question: "", answer: "" }])
                    }
                    className="flex items-center gap-1"
                    style={{
                      fontSize: 12,
                      color: "#1B2B4B",
                      fontWeight: 500,
                      border: "1px solid #E2E6EF",
                      borderRadius: 8,
                      padding: "7px 12px",
                      background: "#fff",
                    }}
                  >
                    <Plus size={13} /> Add question
                  </button>
                </div>
              )}

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

              {contentType === "Article" && (
                <>
                  {/* Tips callout */}
                  <div style={{ marginTop: 20 }}>
                    <Label>Tips callout</Label>
                    {!callout ? (
                      <button
                        onClick={() => setCallout({ type: "Tip", body: "" })}
                        style={{
                          fontSize: 12,
                          color: "#1B2B4B",
                          fontWeight: 500,
                          border: "1px solid #E2E6EF",
                          borderRadius: 8,
                          padding: "7px 12px",
                          background: "#fff",
                        }}
                      >
                        + Add callout
                      </button>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                          <Select
                            value={callout.type}
                            onChange={(v) => setCallout({ ...callout, type: v as CalloutType })}
                            options={["Tip", "Warning", "Note"]}
                            width={140}
                          />
                          <button
                            onClick={() => setCallout(null)}
                            style={{ fontSize: 11, color: "#8A96AA", padding: "4px 6px" }}
                          >
                            Remove callout
                          </button>
                        </div>
                        <textarea
                          value={callout.body}
                          onChange={(e) => setCallout({ ...callout, body: e.target.value })}
                          placeholder="Enter callout text..."
                          rows={3}
                          style={{
                            width: "100%",
                            fontSize: 13,
                            border: "1px solid #E2E6EF",
                            borderRadius: 8,
                            padding: "8px 10px",
                            outline: "none",
                            color: "#1A1F2E",
                            resize: "vertical",
                            marginBottom: 10,
                          }}
                        />
                        <div
                          style={{
                            borderLeft: `4px solid ${calloutColors[callout.type].border}`,
                            background: calloutColors[callout.type].bg,
                            padding: "10px 12px",
                            borderRadius: 4,
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 700, color: calloutColors[callout.type].border, marginBottom: 4 }}>
                            {callout.type}
                          </div>
                          <div style={{ fontSize: 13, color: "#1A1F2E", whiteSpace: "pre-wrap" }}>
                            {callout.body || <span style={{ color: "#8A96AA" }}>Callout preview…</span>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Steps */}
                  <div style={{ marginTop: 20 }}>
                    <Label>Steps</Label>
                    {steps.length > 0 && (
                      <div className="space-y-2" style={{ marginBottom: 8 }}>
                        {steps.map((s, i) => (
                          <div
                            key={s.id}
                            className="flex items-start gap-2"
                            style={{ border: "1px solid #EEF1F7", borderRadius: 8, padding: 10, background: "#fff" }}
                          >
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                background: "#F0F3F8",
                                color: "#1B2B4B",
                                fontSize: 12,
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                marginTop: 2,
                              }}
                            >
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <input
                                value={s.title}
                                onChange={(e) =>
                                  setSteps((p) => p.map((x) => (x.id === s.id ? { ...x, title: e.target.value } : x)))
                                }
                                placeholder="Step title"
                                style={{
                                  width: "100%",
                                  fontSize: 13,
                                  fontWeight: 500,
                                  border: "1px solid #E2E6EF",
                                  borderRadius: 6,
                                  padding: "6px 8px",
                                  outline: "none",
                                  color: "#1A1F2E",
                                }}
                              />
                              <input
                                value={s.description ?? ""}
                                onChange={(e) =>
                                  setSteps((p) => p.map((x) => (x.id === s.id ? { ...x, description: e.target.value } : x)))
                                }
                                placeholder="Optional description"
                                style={{
                                  width: "100%",
                                  fontSize: 12,
                                  border: "1px solid #E2E6EF",
                                  borderRadius: 6,
                                  padding: "6px 8px",
                                  outline: "none",
                                  color: "#5A7099",
                                }}
                              />
                            </div>
                            <button
                              onClick={() => setSteps((p) => p.filter((x) => x.id !== s.id))}
                              style={{ color: "#8A96AA", padding: 4 }}
                              aria-label="Delete step"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() =>
                        setSteps((p) => [...p, { id: crypto.randomUUID(), title: "", description: "" }])
                      }
                      disabled={steps.length >= 10}
                      className="flex items-center gap-1"
                      style={{
                        fontSize: 12,
                        color: steps.length >= 10 ? "#B5BCC9" : "#1B2B4B",
                        fontWeight: 500,
                        border: "1px solid #E2E6EF",
                        borderRadius: 8,
                        padding: "7px 12px",
                        background: "#fff",
                        cursor: steps.length >= 10 ? "not-allowed" : "pointer",
                      }}
                    >
                      <Plus size={13} /> Add step
                    </button>
                    <div style={{ fontSize: 11, color: "#8A96AA", marginTop: 6 }}>Up to 10 steps</div>
                  </div>

                  {/* Related articles */}
                  <div style={{ marginTop: 20 }}>
                    <Label>Related articles</Label>
                    <div style={{ position: "relative" }}>
                      <input
                        value={relatedQuery}
                        onChange={(e) => setRelatedQuery(e.target.value)}
                        placeholder="Search articles to link…"
                        disabled={relatedIds.length >= 4}
                        style={{
                          width: "100%",
                          fontSize: 13,
                          border: "1px solid #E2E6EF",
                          borderRadius: 8,
                          padding: "8px 10px",
                          outline: "none",
                          color: "#1A1F2E",
                          background: relatedIds.length >= 4 ? "#F7F9FC" : "#fff",
                        }}
                      />
                      {relatedQuery.trim() && relatedIds.length < 4 && (() => {
                        const q = relatedQuery.trim().toLowerCase();
                        const matches = allArticles
                          .filter(
                            (a) =>
                              a.status === "Live" &&
                              a.id !== id &&
                              !relatedIds.includes(a.id) &&
                              a.title.toLowerCase().includes(q),
                          )
                          .slice(0, 6);
                        if (matches.length === 0) return null;
                        return (
                          <div
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              right: 0,
                              marginTop: 4,
                              background: "#fff",
                              border: "1px solid #E2E6EF",
                              borderRadius: 8,
                              boxShadow: "0 4px 14px rgba(20,30,55,0.08)",
                              zIndex: 10,
                              overflow: "hidden",
                            }}
                          >
                            {matches.map((a) => (
                              <button
                                key={a.id}
                                onClick={() => {
                                  setRelatedIds((p) => (p.length >= 4 ? p : [...p, a.id]));
                                  setRelatedQuery("");
                                }}
                                style={{
                                  display: "block",
                                  width: "100%",
                                  textAlign: "left",
                                  padding: "8px 12px",
                                  fontSize: 13,
                                  color: "#1A1F2E",
                                  background: "#fff",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F9FC")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                              >
                                {a.title}
                              </button>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                    {relatedIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5" style={{ marginTop: 8 }}>
                        {relatedIds.map((rid) => {
                          const a = allArticles.find((x) => x.id === rid);
                          return (
                            <div
                              key={rid}
                              className="flex items-center gap-1"
                              style={{
                                background: "#F0F3F8",
                                borderRadius: 10,
                                padding: "5px 6px 5px 11px",
                                fontSize: 12,
                                color: "#1A1F2E",
                              }}
                            >
                              {a?.title ?? "Unknown"}
                              <button
                                onClick={() => setRelatedIds((p) => p.filter((x) => x !== rid))}
                                style={{ color: "#8A96AA", padding: 2 }}
                                aria-label="Remove related article"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "#8A96AA", marginTop: 6 }}>
                      These appear at the bottom of the article in the help center
                    </div>
                  </div>
                </>
              )}
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
