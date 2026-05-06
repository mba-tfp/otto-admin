## Goal
When **Content Type = "FAQ"**, replace the rich text body and supporting blocks with a dedicated Q&A interface (Category + reorderable Q&A cards). Article and What's-new editors stay unchanged.

## 1. Data model — `src/data/store.ts`
Extend `Article` with two optional fields (kept optional so seed data and other types stay valid):

```ts
faqCategory?: string;
faqPairs?: { id: string; question: string; answer: string }[];
```

No seed data changes. `upsertArticle` already spreads the full object.

## 2. Editor state — `src/components/EditorView.tsx`
Add local state:
- `faqCategory: string` (init from `article?.faqCategory ?? ""`)
- `faqPairs: { id; question; answer }[]` — initialized from `article?.faqPairs`; if empty AND `contentType === "FAQ"`, default to one empty pair `[{ id: uuid, question: "", answer: "" }]`
- `dragIndex: number | null` for drag-and-drop reorder

Sync both inside the existing `useEffect([article?.id])`. Persist them in `persist()`'s `next: Article` object, gated on `contentType === "FAQ"` (otherwise undefined).

When the user switches `contentType` to "FAQ" and `faqPairs` is empty, seed one empty pair via a small effect on `[contentType]`.

## 3. UI changes inside the LEFT card (when `contentType === "FAQ"`)

Wrap the existing TiptapEditor + Video embed + Attachments blocks (lines ~271–366) in `{contentType !== "FAQ" && (…)}` so they disappear for FAQ. Keep the Title input as-is.

Render a new FAQ section directly after Title (replaces the Article's Subtitle/Body area when FAQ is selected):

### 3a. Category input
- Label "Category"
- `<input>` styled like Title (smaller fontSize 13)
- Placeholder "e.g. Account & Billing, Getting Started, Privacy & Security"
- Helper text below: "Groups related questions together in the help center" (muted, 11px)

### 3b. Q&A pair cards
For each pair, render a card (border `1px solid #E2E6EF`, radius 8, padding 12, white bg, marginBottom 10) using a flex layout:

- **Left edge**: drag handle button — a `GripVertical` icon (lucide-react) in muted color, `cursor: grab`. The card itself uses `draggable`, `onDragStart` sets `dragIndex=i`, `onDragOver` preventDefault, `onDrop` reorders by splicing.
- **Top row in body**: muted label `Q{i+1}` (11px, color `#8A96AA`) on the left, trash icon button on the right (`Trash2`, removes pair).
- **Question field**: Label "Question", plain `<input>` (same styling as Title input but fontSize 13)
- **Answer field**: Label "Answer", `<TiptapEditor key={pair.id} content={pair.answer} onChange={(html) => updatePair(pair.id, { answer: html })} />` — same editor/toolbar as the article body.

`updatePair(id, patch)` setter helper.

### 3c. Add question button
Below the last card: outline button `+ Add question` (reuse the styling pattern from `+ Add step`), appends `{ id: crypto.randomUUID(), question: "", answer: "" }`.

### 3d. Empty state
If `faqPairs.length === 0`, render a centered muted block (border-dashed, radius 8, padding 24, color `#8A96AA`, fontSize 13) saying:
"No questions yet — click '+ Add question' to get started"
The Add button is shown below the empty state too.

## 4. RIGHT sidebar gating
The right card already wraps Tips callout / Steps / Related articles in `{contentType === "Article" && (…)}` — no change needed; they stay hidden for FAQ. Content type / App tags / Workflow / Preview / Delete / metadata all stay.

## 5. Things explicitly unchanged
Title input, right sidebar (all sections), workflow logic, persistence flow, Article and What's-new editors.

## Technical notes
- Add `GripVertical` to the lucide-react import on line 7.
- Drag and drop: native HTML5 — set `draggable` on the card root, track `dragIndex` in state, on `onDrop` compute new array via splice. No new dependencies.
- Each TiptapEditor instance gets `key={pair.id}` so reordering doesn't share editor state.
- When persisting: `faqCategory: contentType === "FAQ" ? faqCategory : undefined`, `faqPairs: contentType === "FAQ" ? faqPairs : undefined`.
- The existing `body` field is left untouched for FAQ articles (kept as whatever it was); not displayed.
