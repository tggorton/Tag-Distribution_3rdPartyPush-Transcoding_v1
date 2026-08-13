# Time Log — Radius Ad Tags Prototype

Tracks approximate effort across the project's lifecycle in two columns:

1. **AI Work** — wall-clock between meaningful checkpoints (commits, push
   points), minus obvious idle gaps.
2. **Prompting** — user time spent reading my output, deciding next
   steps, and typing prompts. Estimated per-message via archetype.

If a Prompting estimate feels off, say so and I'll recalibrate the
per-archetype defaults so future entries land closer.

## Methodology

### AI Work column (well-grounded)

Anchored on git commit timestamps and tool-call cadence. Each block is
wall-clock between commits or visible session boundaries, minus obvious
idle stretches (long gaps between messages where the user was clearly
away). Roughly accurate ±5–10 min.

### Prompting column (estimated)

Per user message:

```
prompting_time =
    reading_time   (user reading my prior response)
  + thinking_time  (deciding, weighing options)
  + typing_time    (user_message_chars / ~130 chars-per-min)
```

Three rough archetypes I classify each user message into:

| Type | Pattern | Reading | Thinking | Typing |
|---|---|---:|---:|---:|
| **Quick approval** | "go", "yes", "looks good" | 1–2m | ≤30s | ≤30s |
| **Decision / lightweight** | choosing between options, brief feedback | 2–3m | 1–2m | 1–3m |
| **Intricate** | technical prompts with context, bug reports with screenshots/repros, multi-decision messages | 3–5m | 3–8m | 4–10m |

**What's NOT counted as Prompting:**

- Time the AI is working (tool calls, file writes, builds, agent
  exploration) — user can be doing other things in parallel, even if
  some of it requires occasional approval clicks. Those clicks
  themselves are minimal and absorbed into the next message.
- Visual verification time clicking through the live app between
  prompts.
- Breaks, meetings, or errands during long gaps.

**What IS counted:**

- Reading my output before responding.
- Deciding on next steps or approach.
- Typing the message itself.
- Reviewing actual file changes before replying (e.g. opening files I
  edited and reading them).

### Calibration note

Commit-timestamp arithmetic over-credits AI Work for stretches where
the human is actually doing the work — reading, taking screenshots,
composing a debug report, verifying in the browser, away from the
desk. The AI is *not* running tools during those stretches even
though the wall-clock keeps moving.

The reduction factor depends on commit density. Dense-commit sessions
(steady AI-driven cadence) need a smaller cut than sparse-commit
sessions (one big commit covers hours of conversation):

| Commit pattern | Reduction off raw wall-clock |
|---|---|
| **Dense** (multiple commits per hour) | 20–25% |
| **Moderate** (1–2 commits per hour) | 30–40% |
| **Sparse** (1 commit per several hours, conversation-heavy) | 50–60% |

**Cross-session recalibration (2026-05-05).** Initial pass used a
flat ~20–25% reduction across all sessions — too generous for the
sparse-commit days. After user feedback that Session 5 (4h window,
2 commits) wasn't actually 4h of active AI tool time, applied the
density-aware reductions retroactively to all five sessions:

| Session | Commits | Density | Original | Recalibrated | Cut |
|---|---:|---|---:|---:|---:|
| S1 (04-25) | 2 | Moderate (heavy scaffolding) | 188m | 120m | 36% |
| S2 (04-27) | 3 | Moderate | 93m | 60m | 35% |
| S3 (04-28) | 2 | Moderate-dense | 45m | 35m | 22% |
| S4 (04-29) | 1 | Sparse | 98m | 55m | 44% |
| S5 (05-05) | 2 | Sparse | 263m | 117m | 56% |

Prompting figures stayed unchanged — those are anchored on
per-message archetype × character count, and the human is the
authority on their own time anyway. The codified methodology lives
at `.claude/skills/log-time/SKILL.md` for future sessions.

---

## Sessions

### 2026-04-25 — Session 1: Plan + scaffold + style iteration + first push

**Wall-clock span:** afternoon, with several hours of style iteration.
Commits: `fe3a985` (16:10).

| Block | Prompting | AI Work | Notes |
|---|---:|---:|---|
| Plan mode — 3 Explore agents (Primary-Page, Admin/templates, KV-Macros + CSV) running in parallel reading the `_Code-Reference/` and `_Image-Reference/` folders, plan file iteration | 12m | 16m | Decision-heavy stretch: stack picks (Vite + TS + MUI), persistence (localStorage), role gating (header toggle). |
| Vite + MUI scaffold (~20 source files: types, theme, paramCatalog, tagBuilder, csvExport, AppContext, seedData, all stub components) + first `npm install` | 6m | 35m | Mostly silent AI work; user approving in chunks. Heavy file-write block. |
| Restyle pass 1 — brighter pink primary, exact dark backgrounds, refined component overrides; also restyling the editor dialog (large pink title, pink section labels, +/trash/pencil toolbar visual, solid pink Add KV/Add Macro buttons, CANCEL+ADD footer) | 8m | 22m | Driven by a screenshot from the user comparing my output to the Figma reference. |
| Restyle pass 2 — full chrome restructure: `KervLogo` SVG (6 polygons copied from prior project), 80px sidebar with external icon URLs, top bar (breadcrumb + role toggle + bell), hero card → horizontal 11-field grid, Creatives/Pixels stub sections, outlined pink action buttons | 14m | 32m | Intricate prompts with the line-item-multi-creative target screenshot + agent-driven repo clone to extract exact theme values. |
| Layout fix — content full width hugging right edge (drop `maxWidth: 1440`) | 2m | 2m | Quick decision. |
| Tag Template label/placeholder overlap bug fix | 4m | 3m | Intricate prompt with screenshot; `InputLabelProps={{ shrink: true }}` + custom `renderValue`. |
| `git init` + first push (rebased on remote auto-README) | 4m | 10m | Commit `fe3a985`. PAT used inline only. |
| **Session subtotal** | **~50m** | **~120m** | Recalibrated from ~188m. Moderate density (2 commits in a multi-hour scaffolding day). Heaviest block was the file scaffold; restyle passes were chunky but conversational. |

### 2026-04-27 — Session 2: Merge add flow + Save/Update gating + NUL fix

**Wall-clock span:** ~14:00 → ~16:30. Commits: `6488ccb` (15:09),
`65bf264` (15:30), `6b86904` (16:13).

| Block | Prompting | AI Work | Notes |
|---|---:|---:|---|
| Merge two-step Add flow into a single editor (template dropdown moved inline, autofill on pick, admin radio inside the editor itself); also collapsed the dual KV/Macro UI into a single `+ Add Key Value / Macro` button + unified `customKeyValues` data model with localStorage migration; deleted `AddDistroDialog.tsx`, `CustomKeyValueList.tsx`, `CustomMacroList.tsx` | 12m | 32m | Single bundled commit `6488ccb` — large refactor. |
| Reposition Distro Name + Tag Template (first-cut moved them to bottom; user clarified intent → swap order at top: Distro Name first, Tag Template second) | 4m | 5m | Decision prompt that I initially misread as "move location." |
| Disable "Update Template" until form actually diverges from the picked template's saved configuration | 4m | 10m | Commit `65bf264` — added `originalTemplate` + `hasTemplateChanges` useMemo with set/array comparators. |
| NUL-byte cleanup in TagEditorDialog (caught on push verification — file showed binary diff, `JSON` template literal had embedded `\0` separators) | 3m | 5m | Commit `6b86904` — replaced with `JSON.stringify([key, value])`. |
| Two pushes (one rejected for non-fast-forward → fetch + rebase + push; one straightforward) | 4m | 8m | |
| **Session subtotal** | **~27m** | **~60m** | Recalibrated from ~93m. Moderate density (3 commits in ~2.5h). |

### 2026-04-28 — Session 3: Admin save-flow polish

**Wall-clock span:** ~13:30 → ~15:00. Commits: `92b362c` (13:57),
`5ac6090` (14:50).

| Block | Prompting | AI Work | Notes |
|---|---:|---:|---|
| Stop auto-filling Distro Name when a template is picked + name validation alert (scroll-into-view + focus on validation failure so the alert is unmissable on shorter viewports) | 5m | 14m | Commit `92b362c` first half. |
| Restyle the Save / Update sub-dialog to match the original AddDistroDialog style (plain h6 title, close icon, radio group, single Save button); rename "Save as New Template" → "Save New Template" | 4m | 9m | Commit `92b362c` second half. |
| Keep editor open after Save Template / Update Template (drop `onClose()` from persist functions; auto-select newly-saved template in the dropdown) | 4m | 8m | Commit `5ac6090`. |
| Push | 2m | 4m | |
| **Session subtotal** | **~15m** | **~35m** | Recalibrated from ~45m. Moderate-dense (2 commits in ~1h, focused work). |

### 2026-04-29 — Session 4: Template name decouple + multi-select template delete + creatives stubs

**Wall-clock span:** ~13:00 → ~15:30. Commit: `a96f735` (14:08).

| Block | Prompting | AI Work | Notes |
|---|---:|---:|---|
| Decouple Template Name from Distro Name (separate `templateNameDraft` state, validation moved to template-name field for save-template actions, `Distro Name` no longer required for template ops) | 6m | 14m | |
| Save / Update sub-dialog: replace Template Name TextField with `Autocomplete` (`freeSolo`, options = all templates) so admin can pick a different template to update OR rename via free text; track `updateTargetId` separately from the editor's picked `templateId` | 8m | 17m | |
| Multi-select **Delete Templates** dialog + admin-only "Delete templates…" link under the dropdown; reducer action `deleteTemplates(ids)`; drop the auto-merge-built-ins-on-load behavior so admin deletions persist across reloads | 6m | 14m | New file `DeleteTemplatesDialog.tsx`. |
| Two stub creatives in the Creatives section (Stratos_Hero_30s, Stratos_Cutdown_15s) so the page reads as a populated line item; new columns Name / Creative ID / Playback Mode / Status / Weighting / Actions | 3m | 6m | |
| Misc UI: drop "…" + capitalize "Delete Templates" link | 1m | 2m | Quick adjustment. |
| Push | 2m | 2m | Commit `a96f735`. |
| **Session subtotal** | **~26m** | **~55m** | Recalibrated from ~98m. Sparse (single bundled commit covering several distinct features). |

### 2026-04-30 → 2026-05-05 — Session 5: Manage Templates dialog + mutable catalog + notifications

**Wall-clock span:** spread across several days; user away between
working stretches. Commits: `12b4306` (05-05 15:04), `432898e`
(05-05 15:31).

| Block | Prompting | AI Work | Notes |
|---|---:|---:|---|
| Add `advertiserId?` to Template + advertiser scoping (`CURRENT_ADVERTISER_ID = "advertiser-01"`, options 01–12); filter the main Tag Template dropdown by visibility; Save/Update modal Advertiser select; persist `advertiserId` on save/update | 10m | 15m | New file `lib/advertisers.ts`. |
| Update Existing path: replace Template Name TextField with `Autocomplete`; update behaves as both target picker and renamer | 6m | 10m | Some friction iterating on UX semantics (pick-vs-type ambiguity). |
| **Major refactor — split admin functions out of TagEditorDialog into a dedicated `ManageTemplatesDialog`.** New admin-only "Manage Templates" button next to "+ Add Distribution Tag" in DistrosSection. TagEditorDialog now role-agnostic. New dialog has its own state shape, Template Name field (no Distro Name), all-templates dropdown (no advertiser filter), advertiser dropdown, Save New / Update / multi-select Delete affordances. | 14m | 30m | Largest single block of the session. |
| Strip `+ / trash / pencil` toolbar from the regular Add Distribution Tag editor | 2m | 2m | Quick decision. |
| **Mutable param catalog** — moved Nexxen / TTD / Creative param lists from static constants into AppState (`paramsCatalog`); reducer actions `addParam` / `updateParam` / `deleteParam`; localStorage migration; refactored `buildTagString` + `buildDistroUrl` + `csvExport` to take catalog as an arg; threaded through every consumer | 8m | 22m | Touched: `types.ts`, `paramCatalog.ts`, `tagBuilder.ts`, `csvExport.ts`, `AppContext.tsx`, every component consuming build helpers. |
| Functional toolbar inside Manage Templates — `ParamCheckboxGroup` accepts `onEditRequest` callback; new `ManageParamsDialog` lets admin inline-edit Label/Output, delete per row, and `+ Add Param` at the bottom; toolbar reduced from three icons to a single pencil after iteration | 9m | 15m | Iterated on the toolbar shape (started with all three, user asked to consolidate). |
| Save/Update sub-dialog name field: pop the Template Name input into the modal itself with radio-driven default | 5m | 8m | Decoupled flow per user clarification. |
| Drop "Delete Template" footer button from Manage Templates (kept in the multi-select Delete Templates panel) | 1m | 1m | Quick cleanup. |
| Add `showToolbar` to Creative Params section + small copy fix ("Admins see every template here…" helper line removed) + `2 assigned` Creative count on the hero card | 3m | 3m | Small polish prompts. |
| Push (single big commit covering all the above) | 2m | 3m | Commit `12b4306`. |
| Param add/remove notifications + scroll-to-new-param in `ManageParamsDialog` (snackbar `Added "<label>" to <Section> Params` / `Removed "<label>" from <Section> Params`; `lastRowRef` + `scrollIntoView`) | 3m | 6m | Commit `432898e`. |
| Final push of session | 1m | 2m | |
| **Session subtotal** | **~64m** | **~117m** | Recalibrated down from ~263m first-cut after user pointed out wall-clock between sparse commits significantly over-credits AI Work — most of the elapsed window was conversation iterations, verification, and idle gaps rather than active tool time. |

### 2026-05-06 — Session 6: Documentation + (name, advertiser) uniqueness validation

**Wall-clock span:** afternoon, sparse-commit (one push at the end).
Commit: `82c50a5`.

| Block | Prompting | AI Work | Notes |
|---|---:|---:|---|
| Initial `TIME_LOG.md` creation following the user's sample (methodology, 5 session blocks anchored on git commit timestamps, prompting archetypes, running totals) | 8m | 14m | Long-form doc write. |
| Recalibration round 1 — Session 5 down from ~263m → ~117m after user pushback that wall-clock between sparse commits over-credits AI Work | 4m | 4m | Decision prompt: *"You did not spend 4 straight hours on this project."* |
| Recalibration round 2 — apply same logic to S1–S4; create `.claude/skills/log-time/SKILL.md` codifying the density-aware methodology | 6m | 8m | Intricate prompt asking for both retroactive recalibration + skill creation. Total AI Work dropped ~11h → ~6.5h after recalibration. |
| `SESSION_LOG.md` creation — narrative companion doc with per-session decisions, verbatim user quotes, multi-iteration sagas, future considerations + open threads + commit reference table | 8m | 16m | Largest doc-write of the day. Modeled on the user's sample SESSION_LOG. |
| Manage Templates: enforce `(name, advertiser)` uniqueness on Save New + Update. Boolean `nameError` → string `nameErrorMessage` (so error helper text is context-aware: required vs. duplicate). New `findNameConflict(excludeId?)` + `conflictMessage(conflict)` helpers. Error clears on name OR advertiser change. Scroll-into-view + focus on validation failure (existing pattern) | 8m | 10m | Intricate prompt with explicit example list (`template-01` / `template-01b` / `template-01 — advertiser-01`). |
| Push (`82c50a5`, single commit covering all the above) + this time-log + session-log update | 3m | 6m | |
| **Session subtotal** | **~37m** | **~58m** | Sparse session by commit count (one push at end of day). Bulk of AI Work was long-form doc generation (TIME_LOG + SESSION_LOG + skill); the uniqueness validation was a smaller code change at the end. |

> **Chapter 2 note (Sessions 7–12).** These sessions were logged in arrears on
> 2026-08-13 (see Session 12). Figures are reconstructed from commit cadence + the
> narrative in `SESSION_LOG.md` rather than live per-message tracking, so treat them
> as good-faith estimates at the same density-aware calibration as Sessions 1–6.

### 2026-05-12 — Session 7: Mutable region catalog

**Commit:** `c8978a8` (12:10).

| Block | Prompting | AI Work | Notes |
|---|---:|---:|---|
| Move regions from static metadata into `AppState` (`{name, baseUrl}` per region), reducer CRUD, `ManageRegionsDialog`, `migrateEntityRegion` migration | 12m | 30m | Reused the mutable-catalog pattern; small but foundational for later preset work. |
| **Session subtotal** | **~12m** | **~30m** | Single focused commit. |

### 2026-07-15 — Session 8: The pivot — Push, Transcode Status, transcoding presets, design sweep

**Commits:** `b74e481` (15:43), `2d8dec4` (15:46).

| Block | Prompting | AI Work | Notes |
|---|---:|---:|---|
| Push Tags to Platform (dialog, platform/advertiser, per-distro send) | 14m | 40m | New feature surface. |
| Transcode Status lifecycle + per-row restart (default/live/processing/error/outOfSpec/inactive; ring-vs-fill; out-of-spec orange; "cold"→inactive) | 16m | 40m | Several design calls (orange vs red, ring vs solid). |
| Transcoding presets + admin CRUD (`TRANSCODE_FIELDS`, publisher specs, Hulu real / rest illustrative, protected Default) | 18m | 45m | Reused the mutable-catalog pattern. |
| Move admin management into modals (pencil next to dropdown); dialog design sweep (shared DialogHeader, useConfirm, sx-only) | 17m | 35m | Commit `2d8dec4` + convention-setting cleanup. |
| **Session subtotal** | **~65m** | **~160m** | Sparse density (2 close commits), but the single largest build session of chapter 2. Recalibrated ~55% off raw wall-clock. |

### 2026-07-27 → 07-28 — Session 9: Platform Status column + split hand-off docs

**Commits:** `f21c062` (07-27 12:54), `958370e` (07-28 09:23), `ba869a7` (07-28 09:24).

| Block | Prompting | AI Work | Notes |
|---|---:|---:|---|
| Second independent **Platform Status** column (shared `StatusChip`); rename first column Transcode Status; per-distro push selection; dependent Platform→Advertiser dropdowns | 18m | 45m | Commit `f21c062`. |
| Split hand-off docs (Transcoding + 3rd-Party Push) + index README | 12m | 30m | Long-form doc writing. Commits `958370e`, `ba869a7`. |
| **Session subtotal** | **~30m** | **~75m** | Moderate density across two days. |

### 2026-07-30 → 07-31 — Session 10: Push model settled + multi-preset transcoding + incremental apply

**Commits:** `0cad697` (07-30 15:42), `24cc1ce` (07-30 22:25), `14ccc47` (07-31 12:45).

| Block | Prompting | AI Work | Notes |
|---|---:|---:|---|
| family→platform lock + Add + Push + platform-drives-selection (replacing the bidirectional lock) | 16m | 35m | Commit `0cad697`. Settled UI model (saved to memory). |
| Multiple presets per line-item: `Distro.status` → `transcodes[]`, stacked chips, collapsible rows, + Add Preset (top + scroll), dividers, muted Default row, delete-last→confirm→Default; migration | 22m | 60m | Commit `24cc1ce`. Biggest data-model change of the chapter. |
| Incremental apply (only reprocess new/changed presets) + advertiser name + ID | 17m | 35m | Commit `14ccc47`. |
| **Session subtotal** | **~55m** | **~130m** | Moderate-sparse across two days; one large refactor. |

### 2026-08-03 — Session 11: Link/unlink, advertiser lock, confirmations

**Commits:** `83a614f` (14:04), `bf97c74` (15:21), `666e177` (15:45), `6e0e618` (15:56).

| Block | Prompting | AI Work | Notes |
|---|---:|---:|---|
| Unlink→Inactive + link/unlink toggle promoted to exposed row icon (MUI Link/LinkOff), orientation fix; Save + Push in edit mode | 14m | 30m | Commit `83a614f` + iteration on icon state. |
| Sticky→locked advertiser (one per platform per line-item) + confirmations before restart / re-link / unlink (generic wording) | 16m | 35m | Commit `bf97c74`. Wording iterated per user steer. |
| Fully-disabled locked advertiser (MUI LockOutlined icon + contact-support tooltip) | 9m | 18m | Commit `666e177`. |
| Remove redundant Transcoding subheading | 6m | 12m | Commit `6e0e618`. |
| **Session subtotal** | **~45m** | **~95m** | Dense (4 commits in ~2h); ~25% reduction off raw wall-clock. |

### 2026-08-13 — Session 12: Continuity hand-off for the Claude-account switch

**Commit:** doc-only (RESUME.md + log updates).

| Block | Prompting | AI Work | Notes |
|---|---:|---:|---|
| Enhance both hand-off Artifacts with UI-mockup storyboards, then realign them to the real dark-app palette (bare StatusChip, five-column table, MUI outlined fields, disabled+lock advertiser) | 20m | 55m | Substantial inline HTML/CSS; republished to same URLs. |
| `docs/RESUME.md` (pick-up guide: what transfers across a Claude-account switch, repo settings, run/reset commands, current state) | 12m | 20m | New durable entry point. |
| Bring `SESSION_LOG.md` + `TIME_LOG.md` current (chapter 2, Sessions 7–12; extend commit table) | 8m | 15m | Logged in arrears. |
| **Session subtotal** | **~40m** | **~90m** | Doc/continuity session — no feature code. |

---

## Running totals

| | Prompting | AI Work |
|---|---:|---:|
| Session 1 (2026-04-25) — Plan + scaffold + style + first push | 50m | 120m |
| Session 2 (2026-04-27) — Merge flows + gating + NUL fix | 27m | 60m |
| Session 3 (2026-04-28) — Admin save-flow polish | 15m | 35m |
| Session 4 (2026-04-29) — Name decouple + delete + creatives | 26m | 55m |
| Session 5 (2026-04-30 → 05-05) — Manage Templates split + mutable catalog | 64m | 117m |
| Session 6 (2026-05-06) — Documentation + uniqueness validation | 37m | 58m |
| Session 7 (2026-05-12) — Mutable region catalog | 12m | 30m |
| Session 8 (2026-07-15) — Pivot: Push + Transcode Status + presets + design sweep | 65m | 160m |
| Session 9 (2026-07-27 → 07-28) — Platform Status column + hand-off docs | 30m | 75m |
| Session 10 (2026-07-30 → 07-31) — Push model + multi-preset + incremental apply | 55m | 130m |
| Session 11 (2026-08-03) — Link/unlink + advertiser lock + confirmations | 45m | 95m |
| Session 12 (2026-08-13) — Continuity hand-off (docs/artifacts, account switch) | 40m | 90m |
| **Total** | **~7h 46m** | **~17h 05m** |

> Sessions 1–6 (original tag + template tool) = ~3h 39m Prompting / ~7h 25m AI Work.
> Sessions 7–12 (Transcoding + 3rd-Party Push chapter) = ~4h 07m Prompting / ~9h 40m AI Work.

---

## How this gets updated

After each push (or whenever you ask for a checkpoint), I append a row
to the current session's table. AI Work is anchored on commit
timestamps; Prompting follows the methodology above.

You can adjust any Prompting estimate that feels off — when you do,
mention it and I'll also recalibrate the per-archetype defaults so
future estimates land closer.

If you want a finer-grained breakdown (per-commit instead of per-block),
or a separate calendar-day rollup for reporting, say the word.
