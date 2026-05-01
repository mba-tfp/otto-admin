# Otto Help Center Admin — full audit

I walked every page, route, component and the store. Here's everything that's broken, fake (no-ops), or missing — grouped by where it lives, with severity and the proposed fix. Bar = **click-through demo**: every button does *something visible*, no real backend.

---

## 1. Sidebar / global nav

| # | Issue | Severity | Fix |
|---|---|---|---|
| 1.1 | User chip ("SS · Shahid Saya · Administrator") is not clickable — no menu, no logout | Low | Wire to a small popover with "Profile · Sign out" toast actions |
| 1.2 | Active state for `/editor/...` doesn't highlight any sidebar item — feels like you've left the app | Low | Treat editor routes as part of "Content" (highlight Content when on `/editor/*`) |

## 2. Top bar (per page)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 2.1 | Settings page top bar has a **"Save changes"** button with no `onClick` — does nothing | **High** | Either remove (settings already auto-save per field) or make it toast "Settings saved" |
| 2.2 | Feedback page has no top-bar action — feels empty vs. other pages | Low | Add a "Mark all read" action |

## 3. Dashboard (`/`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 3.1 | "Recent activity" list is **hardcoded** — never reflects what you actually do (publish/submit/create) | **High** | Generate activity from real article state changes (last edited articles), or at minimum re-derive from store |
| 3.2 | "Top articles this week" — hardcoded names, some don't exist in the library (e.g. "AI Assistant Basics") | Medium | Derive from `articles` (top N by `date`), or rename to match real titles |
| 3.3 | Stat "Total articles +3 this month" — the "+3" is hardcoded | Low | Drop the delta or compute it from store |
| 3.4 | "New feedback" stat is correct, but clicking the card does nothing | Low | Make the card a Link to `/feedback?status=New` |

## 4. Content library (`/content`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 4.1 | Header checkbox + row checkboxes do nothing — no bulk select state, no bulk action bar | Medium | Either remove checkboxes (cleaner) or wire bulk-select with a "Delete / Change status" bar |
| 4.2 | No way to **delete** an article anywhere in the app | Medium | Add a row "..." menu with Delete (confirm dialog) |
| 4.3 | No empty-state CTA when the library has items but filters return nothing — message exists but no "Clear filters" inside the empty state | Low | Add a Clear filters button inside the empty cell |
| 4.4 | "Publish" button on Approved rows publishes via navigating into the editor — should publish in place | Low | Call `actions.setArticleStatus(id, "Live")` inline, with toast |

## 5. Editor (`/editor/new`, `/editor/$id`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 5.1 | **"Open preview ↗"** button is a no-op | **High** | Open a modal with a styled mock of the article as it would appear in the selected app, OR open a new tab with `/preview/$id` |
| 5.2 | **"View history"** link in the info card is plain text styled like a link — no click handler | Medium | Open a stub modal "Version history" with 2-3 fake versions |
| 5.3 | No **delete** action in the editor | Medium | Add a small "Delete" button in the workflow card (confirm dialog → navigate back to `/content`) |
| 5.4 | No back / breadcrumb — once in editor, only way out is sidebar | Low | Add "← Back to content" left of the title in TopBar |
| 5.5 | Save buttons give no feedback (no toast, no "Saved ✓") | Medium | Add a toast on every persist (use `sonner` — already installed) |
| 5.6 | Status changes don't toast either — easy to miss that "Submit for review" actually did something | Medium | Same — toast on workflow transitions |
| 5.7 | Attachments are just file metadata — clicking the filename does nothing | Low | Acceptable for demo; optionally make name look non-clickable (no underline/hover) |
| 5.8 | When you create a new article and immediately hit "Submit for review" without typing a title, it saves as "Untitled" silently | Low | Block the action with a toast "Add a title first" |

## 6. Feedback inbox (`/feedback`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 6.1 | No **"Reply"** button anywhere — the whole point of an inbox | **High** | Add a "Reply via email" button that opens `mailto:` with subject prefilled, OR a stub reply modal that toasts "Reply sent" |
| 6.2 | "Save" button only marks unread — doesn't save the note explicitly (note auto-saves on every keystroke, but the button label implies otherwise) | Medium | Rename to "Mark resolved" (sets status=Resolved + toast), or wire it to do the obvious thing |
| 6.3 | Status dropdown changes status but gives no toast / no visual confirmation | Low | Toast on status change |
| 6.4 | No way to **delete / archive** feedback | Low | Add an archive button (filters out from list) |
| 6.5 | List shows "1 hour ago" / "Yesterday" — purely string, never updates. Fine for demo but inconsistent | Low | Leave as-is, document as static demo data |

## 7. Analytics (`/analytics`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 7.1 | Date range selector ("Last 30 days / 7 / 90") changes the URL but **doesn't change any numbers** | **High** | Either scale numbers proportionally (×0.25 for 7d, ×3 for 90d) or remove the selector |
| 7.2 | Stat cards "Avg. rating 4.2 / 5" and "Submissions 23" are hardcoded — don't reflect filters | Medium | Derive submissions from feedback store, drop or anchor the rating |
| 7.3 | "Submissions 23 · 5 unresolved" doesn't link to feedback | Low | Make the card click navigate to `/feedback` |
| 7.4 | No export / no time-series chart — current charts are static bars only | Low (out of scope) | Skip for demo bar |

## 8. Settings (`/settings`)

| # | Issue | Severity | Fix |
|---|---|---|---|
| 8.1 | "Save changes" top-bar button — see 2.1 | **High** | Remove or toast |
| 8.2 | **Bug**: `MemberDialog` uses `useState(() => {...})` instead of `useEffect` to sync props → editing a different member after editing one shows the previous member's data until next reopen | **High** | Replace with `useEffect([member])` — or unmount on close (already half-done with the `{memberDialog.open && ...}` guard, so it actually works, but the dead `useState(() => ...)` should go) |
| 8.3 | "Reveal" buttons next to each app's API key do nothing | Medium | Show a fake key (`sk_otto_••••1234`) inline + Copy button + toast |
| 8.4 | Branding: changing **Otto Notes' sidebar bg** does NOT change the actual admin sidebar — branding is per-app for the *consumer* help center, but there's no preview anywhere of what it looks like | Medium | Add a small "Live preview" card on the right of branding showing a mock of the consumer help center header using the chosen colors + logo |
| 8.5 | Logo upload only stores the *filename* — no preview of the actual image | Medium | Read as data URL, store and preview thumbnail |
| 8.6 | Notification toggles + email field don't persist anywhere (local state only, lost on navigation) | Low | Move to store, OR acceptable for demo |
| 8.7 | Invite flow doesn't validate email format | Low | Basic regex check + inline error |

---

## What I'll do (prioritized)

I'll group fixes into three commits so you can stop me at any point:

### Commit A — kill the dead buttons (the worst offenders)
Fixes: **2.1, 5.1, 5.2, 6.1, 7.1, 8.1, 8.2, 8.3**

After this, no button in the app is a silent no-op.

### Commit B — feedback & polish
Fixes: **5.5, 5.6, 5.8, 6.2, 6.3, 3.4, 4.4, 7.3, 5.4**

Adds toasts everywhere, makes stat cards clickable, adds a back button to the editor, replaces "Save" with "Mark resolved" in feedback.

### Commit C — make the dashboard real + branding preview
Fixes: **3.1, 3.2, 3.3, 4.1, 4.2, 5.3, 8.4, 8.5, 1.1, 1.2**

Recent activity from real store, top-articles from real data, delete actions for articles, branding live-preview, sidebar polish.

### Skipping for demo bar
- **6.4** archive feedback
- **7.4** time-series chart / export
- **8.6** persisting notification settings (local state is fine for demo)
- **5.7** attachment download

---

## One question before I start

The **biggest scope decision** is the editor preview (5.1). Three options:

1. **Modal preview** — opens a styled card showing the article as it'd render in the selected consumer app (fast, in-app, no new route)
2. **New route `/preview/$id`** — opens in a new tab, full consumer-style page (more realistic, more work)
3. **Just toast "Preview coming soon"** — cheapest, but feels like a cop-out

I'd recommend **#1 modal**. Tell me if you want #2 or #3 instead, or just approve and I'll go with the modal + start on Commit A.