# SplitAA — Roadmap

> A bill splitter that is **account-free, local-first, privacy-first, and beautiful**.
> This roadmap deliberately chases the things the incumbents (Splitwise, Tricount,
> Settle Up, Splid) *don't* do — because of their business model, their architecture,
> or simply their taste.
>
> **How to use this file:** check a box (`- [x]`) when the item ships. Phase 0 is
> already done. Keep the "why it's different" notes so we never lose the thread.

---

## North Star

**Splitting money with people you trust should feel effortless, private, and delightful —
no sign-up, no ads, no data harvesting, no ugly forms.**

Everything below is filtered through three questions:

1. **Does it respect the user?** (no account, no tracking, no upsell walls, data is theirs)
2. **Does it work offline / on any device via a link?** (local-first, no server dependency)
3. **Does it feel like a premium object, not a spreadsheet?** (motion, glass, restraint)

If a feature fails all three, it doesn't belong here — even if a competitor has it.

---

## The differentiation thesis

| Incumbents optimize for… | SplitAA optimizes for… |
| --- | --- |
| Accounts, email capture, retention loops | **Zero-friction, account-free** use from a URL |
| Server-owned data + premium paywalls | **Local-first, user-owned data**, no paywall on core |
| Dense utilitarian UI | **Liquid-glass, motion-led, calm** UI |
| "You"-centric ledgers | **Neutral, group-as-object** model that works for any member |
| Ads / selling anonymized spend data | **Privacy as a feature** (nothing leaves the device unless shared) |

The rest of this document is how we press that advantage.

---

## Phase 0 — Shipped (baseline)

The foundation is already live and is the thing every later phase builds on.

- [x] Groups → members → expenses → balances → **minimal-transfer settle-up**.
- [x] Equal & custom splits with over-total clamping and "assign remaining."
- [x] **Account-free read-only sharing** via compressed URL snapshots (`lz-string`).
- [x] **Local-first persistence** (localStorage), neutral no-"current-user" model.
- [x] **Liquid-glass design system**: light/dark themes, frost/clear glass, ambient gradients.
- [x] Full **i18n (en / ja / zh)**, onboarding, activity feed, settings.

---

## Phase 1 — Foundations & Polish
*Theme: make the account-free, local-first promise bulletproof and installable.*

- [ ] **Installable PWA + full offline.** Service worker, app manifest, "Add to Home
  Screen," works in airplane mode. → *Competitors gate real offline behind native apps + login.*
- [ ] **Editable share links, not just read-only.** Add an explicit "collaborative link"
  mode as the on-ramp to real sync (Phase 2).
- [x] **Data ownership tools.** One-tap **export/import** (JSON + CSV), full local backup,
  and a visible "your data never leaves this device unless you share it" statement.
- [ ] **Receipts / photos** attached to expenses (stored locally).
- [x] **Notes** on expenses. *(Threaded multi-author comments deferred to Phase 2, where sync/identity make them meaningful.)*
- [x] **Recurring expenses** (rent, subscriptions). *Weekly/monthly rule on an expense; due occurrences are materialized client-side on app load (no server needed).*
- [ ] **Split by percentage / shares / adjustment**, saved as reusable **split templates**.
- [ ] **Multi-currency done right:** per-expense currency + **FX rate captured at the
  expense's date**, so historical trips reconcile correctly instead of using today's rate.
- [ ] **Accessibility pass:** full keyboard nav, screen-reader labels, reduced-motion mode,
  AA contrast in both themes, dynamic type.

---

## Phase 2 — Signature Differentiators
*Theme: the stuff that is hard to copy because it requires our architecture.*

- [ ] **Account-free peer sync (the flagship).** Real multi-editor groups with **no server
  and no login** using CRDTs (Automerge/Yjs) exchanged over **WebRTC / QR handoff /
  optional relay**. Everyone edits offline; changes merge conflict-free when devices meet.
  → *No mainstream splitter offers true serverless, account-less collaborative sync.*
- [ ] **End-to-end encrypted links.** The share payload is encrypted; the key lives in the
  URL fragment (`#`) and never hits any server log. Privacy becomes provable, not promised.
- [ ] **Live "Tab" mode.** Start a session at a dinner; everyone scans one QR and **claims
  items in real time from a shared receipt** ("tap what you ate"). The bill splits itself
  as people tap. → *Receipt photos exist elsewhere; live per-item claiming does not.*
- [ ] **Receipt line-item OCR, on-device.** Scan a receipt (WASM OCR, no upload), auto-extract
  line items, then assign each item to people. Tax/tip distributed proportionally.
- [ ] **Cross-group net settlement.** "Sam owes you across 3 groups → one payment." Net a
  person's balance **across every group at once**, with an opt-in per group.
- [ ] **Fairness engine.** A **rotating "who pays next" suggestion**, a per-person fairness
  meter, and gentle "you've been fronting most costs lately" insights — all computed locally.

---

## Phase 3 — Delight & Intelligence
*Theme: make it feel alive, and let the device do the thinking (privately).*

- [ ] **Natural-language & voice entry.** "I paid 40 for tacos, split with Sam and me" →
  parsed into a structured expense. On-device / optional-cloud, user's choice. Siri
  Shortcuts + share-sheet capture.
- [ ] **The debt graph, visualized.** An interactive **force-directed map** of who owes whom,
  where settling animates edges collapsing. Settlement should feel physically satisfying.
- [ ] **"Trip Wrapped."** An end-of-trip / end-of-year **shareable summary card**: total
  spent, top categories, funniest expense name, biggest spender — generated locally,
  exportable as an image. → *A viral, privacy-safe moment competitors monetize instead.*
- [ ] **Live Activity / widgets / watch.** iOS Live Activity for an open tab, home-screen
  widget for "you're owed / to settle," a glanceable watch complication.
- [ ] **Ambient, tactile finish.** Haptics on settle, spring-based sheet motion, a subtle
  **parallax "money card" metaphor**, and per-group accent theming.
- [ ] **Smart, non-spammy nudges.** Local reminders that produce a *link to send*, never an
  automated dunning email to your friends.

---

## Phase 4 — Moonshots
*Theme: bets that would define the category if they land.*

- [ ] **Programmable splits.** Rules engine: "rent by room size," "utilities 60/40," "driver
  pays no gas" — expressed once, applied forever, shareable as community templates.
- [ ] **Household / couple ledger.** A persistent shared-finances mode: recurring bills,
  subscription tracking, and a running "who's ahead" without feeling transactional.
- [ ] **Optional self-hosted relay.** For groups that want always-on sync, a **tiny relay you
  can self-host** (or a paid managed one) — sync as a feature, never a lock-in.
- [ ] **Pay-to-settle, provider-agnostic.** Hand off a settlement to the user's payment app of
  choice (deep links to local rails, not a rent-seeking middle layer).
- [ ] **Federated / open protocol.** Publish the share + sync format as an open spec so other
  clients can read a SplitAA group. Data portability as a principle, not a feature.

---

## Cross-cutting principles (apply to every phase)

These are commitments to uphold on **every** item above — not one-off tasks to tick off.

- **Privacy first.** Default is on-device. Anything that leaves the device is explicit,
  encrypted, and user-initiated. No analytics that identify a person or their spending.
- **No dark patterns.** No artificial paywalls on core splitting, no "invite to unlock,"
  no nagging. Any premium is for *convenience* (managed relay, cloud OCR), never fairness.
- **i18n & locality by default.** Every new string ships in en/ja/zh at minimum; RTL-ready;
  locale-aware money, dates, and number formatting.
- **Performance & size.** Fast cold start, small bundle, 60fps motion; graceful offline.
- **Design restraint.** Glass and motion serve legibility, not decoration. If it doesn't
  make the money clearer, it doesn't ship.

---

## Explicit non-goals

- ❌ Mandatory accounts / email capture.
- ❌ Advertising or selling (even anonymized) spending data.
- ❌ Becoming a bank / holding user funds / KYC.
- ❌ Feature bloat that turns a calm tool into a dashboard.
- ❌ Cloud lock-in with no export path.

---

*This roadmap is a direction, not a commitment. Phases are thematic, not strictly
sequential — anything can be pulled forward if it sharpens the core promise: **the
most private, most beautiful way to split money with people you trust.***
