## Remove Feedback Inbox (Phase 2 deferral)

Strip the Feedback Inbox feature from the app so it can be reintroduced later.

### Changes

1. **Sidebar nav** (`src/components/Layout.tsx`)
   - Remove the `{ to: "/feedback", label: "Feedback Inbox", … }` nav item and the unused `Inbox` import.
   - Remove the `unread` badge selector tied to `s.feedback`.

2. **Route** (`src/routes/feedback.tsx`)
   - Delete the file. The router plugin will regenerate `routeTree.gen.ts`.

3. **Dashboard** (`src/routes/index.tsx`)
   - Remove the "New feedback" stat card (and its `<Link to="/feedback">` wrapper).
   - Drop the `feedback`/`unread` selectors. Change the stats grid from `grid-cols-4` to `grid-cols-3`.

4. **Analytics** (`src/routes/analytics.tsx`)
   - Remove the "Submissions" stat card (and its `<Link to="/feedback">`).
   - Drop the `feedback`, `submissions`, `unresolved` derivations.
   - Change the top stats grid from `grid-cols-3` to `grid-cols-2` (Total views + Avg. rating remain).

5. **Settings → Notifications** (`src/routes/settings.tsx`)
   - Remove the "New feedback submissions" `SettingRow` (keep the other notification rows and the rest of the section unchanged).

### Kept intentionally

- `feedback` data and `actions.*Feedback*` in `src/data/store.ts` stay in place so Phase 2 can wire the UI back without re-seeding data. Let me know if you'd prefer to also strip the store now.
