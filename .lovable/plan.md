# Settings & Editor refinement

## 1. `src/data/store.ts` — Branding type
- Replace `Branding` shape with: `{ displayName: string; slug: string }`. Drop `primaryColor`, `sidebarBg`, `logoFileName`, `logoDataUrl`.
- Update `initialBranding`:
  - Otto Notes → `{ displayName: "Otto Notes", slug: "otto-notes" }`
  - Onboarding → `{ displayName: "Otto Onboarding", slug: "onboarding" }`
  - Fertiwise → `{ displayName: "Fertiwise", slug: "fertiwise" }`

## 2. `src/routes/settings.tsx` — App Branding section
- Remove the Primary colour, Sidebar background, and Logo `SettingRow`s and the `onLogoUpload`/`fileRef` logic.
- Remove the entire "Live preview · {app} help center" block (lines ~245–265).
- Replace the branding `Card` body with two `SettingRow`s:
  1. **App display name** — `TextInput` bound to `branding.displayName`. Sub-label: "Shown in help center header and breadcrumbs".
  2. **App slug** — `TextInput` bound to `branding.slug`, placeholder = current slug. `onChange` sanitizes input to lowercase + hyphens (`v.toLowerCase().replace(/[^a-z-]/g, "")`). Sub-label: "Used for URL routing (help.otto.com/[slug]) and API key scoping". Add a small helper `<div>` below the row reading "Lowercase letters and hyphens only".
- Keep the app-tab switcher, Team Members, Notifications, API Keys sections untouched.

## 3. `src/components/EditorView.tsx` — Workflow "Live" state
- When `status === "Live"`, render the back-to-draft button labeled **"Unpublish"** wired to a new handler `onUnpublish = () => persist("Approved")`.
- Add a helper line below the button: "Removes from help center immediately" (small grey text, matching existing 11px `#8A96AA` style).
- For non-Live, non-Draft states, keep the existing "Back to draft" button (`onBackToDraft`) unchanged. Achieve this by splitting the current `status !== "Draft"` block into two branches: one for `status === "Live"` (Unpublish + helper) and one for `status === "In review" | "Approved"` (Back to draft as before).

## Notes
- No other consumers of removed Branding fields exist (verified: only Settings page reads them); the type change is safe.
- Toast on Unpublish will fire via existing `persist` flow (status-change toast).
