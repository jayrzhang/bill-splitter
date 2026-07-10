# CLAUDE.md

SplitAA — a client-side bill-splitting app. Groups → members → expenses → balances → settle up.
React 19 + TypeScript + Vite + Tailwind. **No backend**: all data lives in `localStorage`; groups
are shared between people as compressed, read-only URL snapshots (`lz-string`).

## Commands

```bash
npm run dev      # vite dev server
npm run build    # tsc -b && vite build
npm run lint     # eslint .
npm run preview  # serve the production build
```

Path alias: `@/` → `src/`.

## Architecture

Two clearly separated layers — keep them separated.

### Logic / data layer (stable — reuse, don't rewrite)
- `src/context/AppContext.tsx` — all app state + persistence. Group/member/expense/settlement CRUD,
  `localStorage` load/save, and the `?share=`/`?readonly=true` URL import flow. Members are equal
  peers; there is **no "current user"** concept.
- `src/lib/calculations.ts` — `calculateBalances` (nets out expenses + settlements),
  `simplifyDebts` (min-transfer greedy match), `calculateEqualSplits`, `validateSplits`.
- `src/lib/storage.ts`, `src/lib/constants.ts` (currencies + `EXPENSE_CATEGORIES` / `GROUP_CATEGORIES`),
  `src/types/index.ts`.
- i18n: `src/i18n/translations.ts` (typed, existing strings → `t`) and
  `src/i18n/LanguageContext.tsx`. Languages: `en` / `ja` / `zh`.

### UI layer — the "Liquid Glass" redesign
- `src/components/app/AppShell.tsx` — the whole app in one 432px mobile shell: top bar, tab bar
  (Groups / Activity / Settings), FAB, and every view (home, group, settle, invite, activity,
  settings, create/edit group) plus the bottom-sheet expense editor, group menu, and confirm dialog.
  In-app navigation is **internal `view` state**, not the router.
- `src/components/app/Onboarding.tsx`, `src/components/app/glass.ts` (style helpers + the `V` CSS-var map).
- `src/context/UIContext.tsx` — theme (`light`/`dark`), glass style (`frost`/`clear`), onboarding flag,
  default currency. Persisted under `splitaa_*` localStorage keys.
- `src/lib/icons.tsx` — line-art SVG `Icon` set; `expenseCatKey`/`groupCatKey` map category ids → glyphs.
- `src/i18n/redesignStrings.ts` — redesign-only strings → `tx` (onboarding, settle, glass, etc.),
  in all three languages.

### Routing
`src/App.tsx` mounts `LanguageProvider > UIProvider > AppProvider` and renders `AppShell` for both
`/` and `/group/:groupId`. The group route only exists so share/deep links resolve; `AppShell`
reads the param once to open (or, with `?readonly=true`, load from `sessionStorage`) that group.

## Styling: two token systems, don't mix

1. **Legacy** Tailwind/shadcn HSL tokens (`--background`, `--primary`, `.dark`) at the top of
   `src/index.css`. Only the orphaned legacy components use these.
2. **Liquid Glass** — CSS vars scoped to `.dc-app` (`--bg`, `--surface`, `--accent-c`, `--glass-*`,
   `--frame-bg`, …), with `.theme-dark` / `.glass-clear` overrides and `dc-*` keyframes. The redesign
   UI uses these via **inline styles** and the `V` map / helpers in `glass.ts` — not Tailwind classes.
   `--accent-c`/`--border-c` are renamed on purpose so they don't collide with the legacy `--accent`/`--border`.

## Gotchas (learned the hard way)

- **Seed group members atomically.** `createGroup(name, desc?, currency?, category?, start?, end?, memberNames?)`
  takes an optional `memberNames[]`. Do **not** call `createGroup` then `addPerson` in a loop — `addPerson`
  reads `groups` from a stale closure and throws "Group not found".
- **Overlays are called as functions, not rendered as components.** In `AppShell`, `expenseSheet()` /
  `groupMenu()` / `confirmDialog()` are invoked inline (`{addOpen && draft && expenseSheet()}`). Rendering
  them as `<ExpenseSheet />` gives a new component identity every keystroke → React remounts the sheet,
  replaying its slide-in animation and dropping input focus.
- **Neutral model.** No "You"/current user. Home shows counts + per-group total spent (not owed/owe);
  balances stay per-member; Settings has no profile. Preserve this when extending.
- **Currency formatting:** JPY/CNY (symbol `¥`) render with 0 decimals; everything else 2.
- **FAB / round icon buttons** use SVG glyphs (`Icon name="plus"`), not text `+`/`✓`, so they center exactly.

## Orphaned legacy code

The pre-redesign UI is still on disk but no longer imported: `src/pages/`, most of
`src/components/{expense,group,person,balance,shared}/`, `src/components/ui/*`, and
`src/styles/animations.ts`. Safe to ignore; ask before deleting.
