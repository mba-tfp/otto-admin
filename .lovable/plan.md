## Goal

Change the sidebar from the current dark navy (`#1B2B4B`) with white text to a light blue-gray background with dark navy text, matching the uploaded screenshot.

## Color changes

- **Sidebar background**: `#EEF1F7` (pale blue-gray, same as the screenshot)
- **Section divider lines**: `#E2E6EF` (existing border token, instead of white-alpha)
- **Default nav item text**: `#5A7099` (muted navy)
- **Hover nav item text**: `#1B2B4B` (full navy)
- **Hover background**: `#FFFFFF` (white pill, like the "Letters" item in the screenshot)
- **Active nav item**: white background `#FFFFFF`, navy text `#1B2B4B`, subtle border `#E2E6EF`, and keep the coral `#E5635A` left accent bar
- **"CONFIG" section label**: `#8A96AA` (muted gray) instead of white-alpha
- **Header title ("Otto Help Center")**: `#1B2B4B`
- **Header subtitle ("Admin Panel")**: `#8A96AA`
- **Footer user name**: `#1B2B4B`; role: `#8A96AA`
- **Avatar circle**: keep coral tint background, coral text — already on-brand
- **Unread badge**: keep coral `#E5635A` with white text

## Files to edit

1. **`src/styles.css`** — change `--sidebar-bg` from `#1B2B4B` to `#EEF1F7`.
2. **`src/components/Layout.tsx`** — update the `Sidebar` component:
   - Header border: use `#E2E6EF` instead of `rgba(255,255,255,0.08)`.
   - Header title color: `#1B2B4B`; subtitle: `#8A96AA`.
   - Nav item default color: `#5A7099`; active: navy text on white pill with `#E2E6EF` border; hover: navy text on white background.
   - "Config" label color: `#8A96AA`.
   - Footer border + text colors swapped to navy/muted-gray equivalents.

## Out of scope

- No changes to page background, top bar, cards, or any other route — only the sidebar visual.
- Coral accent bar on active item and coral unread badge stay the same.
