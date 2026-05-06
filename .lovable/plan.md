
## Goal
Extend `src/components/EditorView.tsx` so that when **Content Type = "Article"**, the editor exposes a Subtitle field plus three optional content blocks (Tips Callout, Steps, Related Articles). All other content types keep their existing UI.

## 1. Data model — `src/data/store.ts`
Extend the `Article` type (all new fields optional so existing seed data stays valid):

```ts
subtitle?: string;
callout?: { type: "Tip" | "Warning" | "Note"; body: string };
steps?: { id: string; title: string; description?: string }[];
relatedIds?: string[];
```

No changes to seed articles; `upsertArticle` already spreads the full object.

## 2. Editor state — `src/components/EditorView.tsx`
Add local state initialized from `article`:
- `subtitle` (string)
- `callout` (`{type, body} | null`)
- `steps` (array, max 10)
- `relatedIds` (string[], max 4)
- `relatedQuery` (string, for the search input — not persisted)

Sync them in the existing `useEffect([article?.id])` block alongside title/body. Include them in the `next: Article` object built inside `persist()`.

## 3. UI — only when `contentType === "Article"`

### 3a. Subtitle (between Title and TiptapEditor)
Plain `<input>` styled identically to the existing Title input (same width, same border/padding) but with `fontSize: 13, fontWeight: 400`. Label "Subtitle", placeholder "A short description shown in article list views". Insert directly after the Title input block (around line 227), before `<TiptapEditor …/>`.

### 3b. New blocks below Attachments
Reuse the existing section-label pattern (`<Label>` component already used for "Video embed" / "Attachments"). Add three sibling `<div style={{ marginTop: 20 }}>` blocks after the Attachments block (after line 324), all gated by `contentType === "Article"`.

**TIPS CALLOUT** (single, toggled on/off)
- If `callout` is null: show a small `+ Add callout` outline button.
- If set: render
  - `Select` (existing `Form.tsx` component) with options `["Tip","Warning","Note"]` bound to `callout.type`.
  - `<textarea>` for body (3 rows, same border/padding as Title).
  - Live preview directly below: a div with `borderLeft: 4px solid <color>`, `background: <bg>`, `padding: 10px 12px`, type label in bold + body text under it.
  - "Remove callout" link button (muted).
- Color map:
  - Tip → border `#2D7D46`, bg `#EAF3DE`
  - Warning → border `#92580A`, bg `#FEF3E2`
  - Note → border `#1A5FA5`, bg `#E6F1FB`

**STEPS**
- Render `steps.map((s, i) => …)` as rows: number badge `{i+1}`, two stacked inputs (title + description placeholder "Optional description"), trash icon button (`Trash2` from `lucide-react`, already imported) that removes that step.
- Below the list: `+ Add step` outline button, disabled when `steps.length >= 10`. Helper text "Up to 10 steps" muted.

**RELATED ARTICLES**
- Compute candidates: `useStore(s => s.articles)`, filter `status === "Live"` AND `id !== currentId` AND not already in `relatedIds` AND title matches `relatedQuery` (case-insensitive). Show only when `relatedQuery.trim()` is non-empty.
- Search `<input>` with placeholder "Search articles to link…", bound to `relatedQuery`.
- Dropdown: absolutely positioned panel under the input listing matches (max ~6); clicking adds the id to `relatedIds` (cap 4) and clears the query.
- Selected chips below: render each related article's title in a pill with an `X` button to remove. Resolve title via the same articles list.
- "+ Add" disabled / hidden once `relatedIds.length >= 4`.
- Helper text below: "These appear at the bottom of the article in the help center".

## 4. Things explicitly unchanged
Title input, TiptapEditor, Video embed, Attachments, right sidebar (Content type, App tags, Workflow, Preview, metadata, Delete), workflow/persist/toast logic.

## Technical notes
- All new blocks must be wrapped in `{contentType === "Article" && (…)}` so FAQ and What's-new editors are unaffected.
- New IDs for steps via `crypto.randomUUID()` (already used for attachments).
- No new dependencies; reuse `lucide-react` icons (`Trash2`, `X`, `Plus` if needed — otherwise text "+ Add step").
- `Article` type changes are additive and optional — no migration of existing data needed.
