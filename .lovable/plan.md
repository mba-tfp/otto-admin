# Refinement plan

Five focused changes. All client-side, no backend. Where data needs to be shared between pages (status changes, unread counts, filters), I'll lift the hardcoded arrays into a small shared module so the Dashboard sidebar badge and Content table stay in sync.

---

## 1. Shared in-memory data store

Create `src/data/store.ts` with a `useSyncExternalStore`-backed store holding:
- `articles[]` (id, title, type, apps, status, date, author, body)
- `feedback[]` (id, type, app, subject, sender, email, time, message, unread, status)
- `branding` keyed by app: `{ "Otto Notes": { primaryColor, sidebarBg, displayName, logoFileName }, ... }`
- `team[]` (id, name, email, role)

Pages read/write through hooks (`useArticles`, `useFeedback`, etc.) so changes propagate live across screens.

---

## 2. Editor: New vs Edit mode

Split routing:
- `/editor/new` — empty editor, top bar title "New content", status defaults to `Draft`, no version info, no attachments, the right-sidebar Info panel hidden until first save.
- `/editor/$id` — loads article from the store, top bar title "Edit content", shows full Info panel with version history link.

"+ New content" buttons (Dashboard top bar, Content top bar) navigate to `/editor/new`. Row "Edit/Review/Publish" buttons navigate to `/editor/{id}`.

The current `/editor` route file becomes `/editor.new.tsx` and `/editor.$id.tsx` sharing one `EditorView` component that takes a `mode: "new" | "edit"` prop.

---

## 3. Workflow becomes real

Add `status: "Draft" | "In review" | "Approved" | "Live"` to the editor's local state, initialised from the article (or `"Draft"` for new).

- The 4-segment progress bar highlights the segment matching `status`.
- Sidebar Workflow panel shows the status label dynamically.
- Buttons:
  - **Approve** (visible when `In review`) → sets `Approved`
  - **Request changes** (visible when `In review`) → sets `Draft`
  - **Back to draft** (visible when not `Draft`) → sets `Draft`
  - **Publish** (visible when `Approved`) → sets `Live`
  - **Submit for review** in top bar (visible when `Draft`) → sets `In review`
- Top bar buttons swap based on status (Save draft + Submit for review when Draft; Save when Live; etc.).

Status changes write back to the store so the Content table and Dashboard reflect them immediately.

---

## 4. Settings: per-app branding + team modals

**Per-app branding:** state moves into the store keyed by app name. Switching the Otto Notes / Onboarding / Fertiwise tab reads/writes that app's record. Each app gets distinct seed values (different primary color, display name) so the difference is visible.

**Team modals** (built with the existing shadcn `Dialog`):
- **Edit member**: fields = name, email, role select (Admin / Editor). Save updates the row in store. Includes a "Remove member" link (with a confirm).
- **Invite member**: fields = email, role select. Save appends to store with name derived from the email (or "Pending invite").

API keys "Reveal" and Notifications stay decorative — out of scope for this round.

---

## 5. Real filters on Content, Feedback, Analytics

Use TanStack Router search params (zod-validated) so filters survive refresh and are linkable.

- **Content** (`/content`): `?q=&type=&app=&status=`. Search matches title (case-insensitive). Type/app/status filter the rows. Empty state: "No content matches these filters." with a "Clear filters" button.
- **Feedback** (`/feedback`): `?type=&app=&status=`. Filters the inbox list. If the currently-selected item is filtered out, auto-select the first visible one. Empty state in both list and detail panel.
- **Analytics** (`/analytics`): `?app=&range=`. The "Views by app" chart highlights the selected app (or shows all when "All apps"). Stats and bar charts get a small `(filtered)` hint when not on defaults. Range is decorative for now (no time-series data to filter), but the dropdown still updates the URL.

Sidebar Feedback badge becomes `feedback.filter(f => f.unread).length` from the store.

---

## Technical notes

- Store: tiny custom store + `useSyncExternalStore`. No external deps.
- Route changes:
  - delete `src/routes/editor.tsx`
  - add `src/routes/editor.new.tsx` and `src/routes/editor.$id.tsx`
  - both render `<EditorView mode=... articleId?=... />` from `src/components/EditorView.tsx`
- Search params: install `@tanstack/zod-adapter` (zod is already used indirectly by shadcn). Each filtered route gets `validateSearch: zodValidator(...)` and reads via `Route.useSearch()`.
- Update Dashboard "Pending approval" list to read from store and split into "In review" and "Approved" sub-lists, fixing the contradiction noted in the review.
- Sidebar nav badge reads from store.
- All existing visual styling, colors, and layout stay identical.

---

## Out of scope (call out, don't build)

- Article delete, attachment persistence across navigation, notification email sending, API key reveal, version history viewer, real preview window. These are all valid next steps but would inflate this round.
