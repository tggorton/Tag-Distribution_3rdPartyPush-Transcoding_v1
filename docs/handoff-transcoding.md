# Distribution Tags — Transcoding · Prototype Hand-off

> **Living document (draft).** Reflects the prototype as of **2026-10-22** and will be
> updated as the design evolves. See the Changelog at the bottom.
> Companion doc: **3rd-Party Push** (`handoff-3rd-party-push.md`).
> Jira: [WEB-1410](https://grabitmedia.atlassian.net/browse/WEB-1410).
> Picking this up fresh? Start at [`RESUME.md`](RESUME.md).

## Read this first

This is a **UX and functionality prototype**, not a partial implementation. There is no
backend and no real authentication — all state lives in the browser (localStorage), and
every external call (transcode, etc.) is **simulated**. Its job is to pin down the intended
behavior and screens so the team can scope and build the real thing. Each feature below is
split into *what the prototype does* vs. *what production needs to own*.

Stack: React + TypeScript + MUI. Runs at `localhost:5174` (`npm run dev`).

## Foundations (shared)

- **Roles.** A top-bar toggle flips between a regular user and an admin (a stand-in for real
  auth). Admin-only tools appear as an **edit pencil next to the relevant dropdown inside a
  modal** — never as extra top-level buttons.
- **Two status lifecycles.** Every distribution tag carries **two independent statuses**,
  one column each: **Transcode Status** (this doc) and **Platform Status** (the Push doc). A
  tag can be transcoded and live yet never pushed.
- **Readability.** Each status renders as a colored dot *and* a label. Several states share
  warm colors, so color alone never carries the meaning; same-hue states are told apart by a
  **ring vs. solid** dot.
- **Prototype affordance to ignore in production:** each row's `⋯` menu has a "Set transcode
  status" block so a reviewer can force any state during a walkthrough. It disappears once the
  real backend drives status.

## Feature inventory

Everything the Transcoding track adds, at a glance — each is detailed in the sections below.

**Applying presets**
- **Transcoding Settings** modal — a per-line-item sheet that applies **one or more presets**;
  every distro is transcoded **once per preset**.
- **Select presets only — no overrides.** A regular user **picks presets and applies**; they
  **cannot modify a preset's settings**. The field sheet is **read-only** here (expand a row to
  view its values). Changing settings is an admin action on the preset itself (below).
- **~15 fields** grouped Video / Audio (mirroring a publisher delivery spec), shared by every
  preset — presets differ only in *values*, never in which fields exist.
- **Standards-backed field inputs** (read-only here; editable in the admin preset manager):
  **Duration** = 15s / 30s / 45s / 60s / Original. **Video Bitrate** = a **multi-select of
  single rates** (1–50 Mbps) — a preset can carry several rates; **there are no ranges**. The
  single-rate ladder is chosen so at least one rate falls inside every known publisher/DSP spec
  range — see
  [`reference/video-encoding-bitrate-reference.md`](reference/video-encoding-bitrate-reference.md).
- **Custom is admin-only.** In the admin preset manager, Duration and Bitrate also accept a typed
  **custom** value (a custom *single* rate for bitrate), badged **"Custom"**. Bitrate surfaces an
  explicit **"Add custom rate…"** entry once a valid single number is typed (a range is rejected).
  Regular users never see custom.
- **Collapsible preset rows** — collapsed by default; expand a row to **view** its fields
  (read-only); hairline dividers (no boxed cards).
- **+ Add Preset** — inserts a new row at the top and scrolls to it.
- **Incremental apply** — only new or changed presets reprocess; unchanged presets keep each
  distro's current status.
- **Delete a preset row** — dropping one of several is immediate; deleting the **last** confirms →
  resets to the Default baseline (which always remains — it's the floor).

**Presets & the admin catalog**
- Presets are **publisher specs** (Hulu from a real sheet; ~23 CTV pubs illustrative). DSPs are
  **push targets, not presets**.
- **Mutable admin catalog** — admin pencil beside the preset picker → Save New / Update /
  Delete. The `Default` baseline is protected (not editable or deletable). **Regular users only
  *select* presets** — they can't edit or create them.
- **Updating a preset propagates.** An admin edits the preset's settings, and **every
  distribution using that preset automatically re-transcodes to match** (Processing → Live),
  across the whole line item. Admins change the preset; they don't override it per line-item.
- The **Default baseline reads as "not set"** — muted picker, no floating label — distinct from
  an official preset selection.

**Transcode Status (per distro)**
- A dedicated **Transcode Status** column, fully independent of Platform Status, rendered by the
  shared `StatusChip`.
- **Five states** — Default (green ring) / Live / Processing / Error / Inactive. There is **no
  "Out of Spec"**: presets can't be overridden, so nothing can diverge from a publisher spec.
- **One chip per applied preset**, stacked; each names its publisher (`Live: Hulu (Disney)`),
  shortening to `Live: Hulu` on narrow screens.
- **Landing logic** — a config lands `default` if it's the untouched baseline, otherwise `live`.
  New tags inherit the line-item's current plan.
- **Restart row icon** — re-transcodes the whole plan; enabled **only** when a transcode is
  Inactive or Error; confirms first.

**Prototype-only affordances (gone in production)**
- `⋯` menu "Set transcode status" block to force any state during a walkthrough.
- `Processing → landing` is a fixed timer (`RESTART_SIMULATION_MS`), a stand-in for the pipeline.

## What it does

**Transcoding Settings** (button in the Distributions section, available to all users) opens
a per-line-item panel that applies **one or more presets**. Every distribution tag is
transcoded **once per preset**, and each tag's applied presets and their statuses show as a
stack of chips in its **Transcode Status** column — so the plan is read per-distro in the
table, not from a section subheading.

- The panel shows a **list of preset rows**. Each row is a **preset picker** over ~15 fields
  grouped **Video / Audio** (container, codec, resolution, aspect ratio, duration, bitrate,
  frame rate, scan type, chroma, color, audio codec / sample rate / bitrate / channels,
  loudness).
- **Duration and Video Bitrate are standards-backed selectors, not free text.** Duration =
  **15s / 30s / 45s / 60s / Original** (Original keeps the source runtime intact). **Video Bitrate
  is a multi-select of single rates** (1–50 Mbps) — a preset can carry several rates; there are
  **no ranges** (the platform works in fixed rates, not averaged bands). The single-rate ladder is
  chosen so at least one rate falls inside every known publisher/DSP spec range (see
  [`reference/video-encoding-bitrate-reference.md`](reference/video-encoding-bitrate-reference.md)).
  Both are **read-only for regular users**; in the **admin preset manager** each accepts a typed
  **custom** value (a custom single rate for bitrate), badged **"Custom"** — custom is admin-only.
  Bitrate surfaces an explicit **"Add custom rate…"** entry once a valid single number is typed
  (ranges are rejected), so entering a specific rate is discoverable, not just free-type.
- **The settings are collapsed by default.** Expand a row (chevron) to **view** its fields
  (read-only for regular users); collapse it again to keep the panel tidy.
- A **"+ Add Preset"** adds a new row **at the top** (collapsed) and **scrolls to it**, so
  the addition is visible even when a row lower down is expanded. Rows are separated by
  hairline dividers (no boxed cards).
- A **trash** icon removes a preset. Deleting one of several just drops it; deleting the
  **last** one prompts a confirm ("returns the transcoding settings to Default") and, on
  confirm, resets the plan to the Default baseline. Delete is **disabled** only when the sole
  preset is *already* Default — Default is the floor and always remains.
- Picking a preset **fills that row's sheet** (read-only). A regular user **cannot override** any
  field — there are no per-line-item overrides. To change settings, an admin edits the preset
  itself, which re-transcodes every distribution using it (see below).
- **Applying only reprocesses what's new or changed.** A preset unchanged since the last
  apply keeps each tag's current status; a **newly added** preset, or one whose **settings
  were edited**, goes Processing → its landing status. So adding "Netflix" to an
  already-applied "Hulu, ABC, Peacock" reprocesses **only Netflix** — the rest stay put.
  (Changed = same preset with different settings, or a preset the previous plan didn't have.)

## Presets & the admin catalog

- Presets are **publisher specs** — a protected `Default` baseline plus **23 CTV publishers**
  (Hulu, Disney+, ESPN, Peacock, Paramount+, Netflix, Amazon, Max, Tubi, Roku Channel, Pluto,
  Xumo, Samsung TV Plus, LG Channels, Vizio WatchFree+, …).
- **Only Hulu's numbers come from a real spec sheet.** The rest are **illustrative**, varied
  by platform tier (premium ad-SVOD run higher bitrate / 5.1; FAST channels run lighter) and
  clearly marked as such in code.
- The catalog is **mutable admin state**. Admins get a **pencil** beside the preset picker
  that opens a manager to **Save New / Update / Delete** presets — i.e. add new pubs. The
  `Default` baseline can't be edited or deleted. **Regular users only select presets** — they
  can't edit or create them, and can't override settings per line-item.
- **Updating a preset re-transcodes everything that uses it.** Settings live on the preset (not
  per line-item), so an admin's **Update** propagates: every distribution across the line item
  that uses that preset re-transcodes (Processing → Live) to the new settings.
- DSPs (Nexxen, The Trade Desk) are **push targets, not transcode presets** — they live in the
  Push flow, not here.

## Transcode Status — the states

| State | Color | Means | Restart? |
|---|---|---|---|
| **Default** | Green **ring** | Running on the video baseline — no publisher preset officially applied. Serves fine, but distinct from Live so an un-set line item is visible. | — |
| **Live** | Green | Conformed to a chosen preset; ready to serve. Chip names the pub — `Live: Hulu (Disney)`, shortening to `Live: Hulu` on narrow screens. | — |
| **Processing** | Amber | Transcoding in flight (after Apply, or after a restart). | — |
| **Error** | Red | The transcode **run** failed. Retrying may fix it. | **Yes** — retry |
| **Inactive** | Grey | Dormant / off. | **Yes** — rebuild |

**One status per applied preset.** Each tag shows a **stack of status chips in the Transcode
Status column — one per preset applied** (e.g. `Live: Hulu (Disney)` above `Live: Netflix`).
Each chip names its preset. **Landing per config:** `default` if it's the untouched baseline,
otherwise `live`. New tags inherit the line item's current plan (one transcode per applied preset).

**Restart:** a per-row restart icon re-transcodes the tag against the **current line-item
plan** (all its transcodes → Processing → their landing statuses). It's enabled when any of
the tag's transcodes is **Inactive** or **Error**; disabled otherwise. **Restart asks for
confirmation first** so it can't be triggered by accident. The `⋯` "Set transcode status"
affordance forces **all** of a tag's transcodes to one status (prototype only).

## In the prototype vs. For production

| In the prototype | For production |
|---|---|
| Preset numbers are **illustrative** — only Hulu is a real sheet. | Load **real publisher specs**; likely constrain valid options per pub. |
| `Processing → Live` is a fixed timer, not a real transcode. | Apply kicks a **real re-transcode**; status comes from the pipeline (webhook / poll). |
| Option lists are a flat superset (any option on any preset). | Model **per-publisher option constraints** in the admin preset editor. |
| Catalog edits persist to localStorage. | Persist the admin **preset catalog** server-side with real auth. |
| Backend does not exist. | The **backend owns the transcode lifecycle** — the UI reflects state and offers restart. |

## Implementation map (for the build team)

Same architecture as the Push track — one `useReducer` in
[`../src/state/AppContext.tsx`](../src/state/AppContext.tsx), `localStorage`-persisted, helpers
off `useApp()`, pure logic in `src/lib/` (no React imports).

**Types** ([`../src/types.ts`](../src/types.ts))
- `DistroStatus = "default" | "live" | "processing" | "error" | "inactive"` (no `outOfSpec`).
- `DistroTranscode = { presetId; status: DistroStatus }`; `Distro.transcodes: DistroTranscode[]`
  — one entry per applied preset (replaced a single `status`, with a migration).
- `TranscodingConfig = { presetId; settings }` — a row in the line-item plan;
  `AppState.transcoding: TranscodingConfig[]`.
- `TranscodePreset` (id, name, settings, …); `AppState.transcodePresets: TranscodePreset[]` —
  the mutable admin catalog.

**Domain logic**
- [`../src/lib/transcodePresets.ts`](../src/lib/transcodePresets.ts) — `TRANSCODE_FIELDS` (the
  shared field sheet; `bitrate` is a `multiselect` of single rates, `duration` is `select-custom`),
  `SEED_TRANSCODE_PRESETS`, `DEFAULT_PRESET_ID`, `isProtectedPreset`, `canonicalizeRates` (parse /
  validate the comma-joined single-rate list), `transcodeLandingStatus` (`default` | `live`),
  `transcodePublisher`, `describeTranscodings`.
- [`../src/lib/distroStatus.ts`](../src/lib/distroStatus.ts) — `STATUS_META` (dot color / label /
  description / `outlined` per state), `STATUS_ORDER`, `isRestartable`, and
  `RESTART_SIMULATION_MS` (the prototype Processing→landing timer).

**State / reducer** ([`../src/state/AppContext.tsx`](../src/state/AppContext.tsx))
- `setTranscodings(configs)` — set the line-item plan (drives the incremental-apply diff).
- `setDistroTranscodes` / `setDistrosTranscodes` — set one / many distros' per-preset statuses.
- Preset CRUD — add / update / delete transcode presets (`Default` protected). **`updateTranscodePreset`
  also re-syncs every line-item config using that preset** to the new settings; the per-distro
  re-transcode (Processing → Live) is driven by `DistrosSection.handleUpdatePreset`.

**Components**
- [`../src/components/TranscodingSettingsDialog.tsx`](../src/components/TranscodingSettingsDialog.tsx)
  — the apply modal (collapsible rows, + Add Preset, incremental apply).
- [`../src/components/ManageTranscodePresetsDialog.tsx`](../src/components/ManageTranscodePresetsDialog.tsx)
  — the admin catalog manager (Save New / Update / Delete).
- [`../src/components/TranscodeFieldsGrid.tsx`](../src/components/TranscodeFieldsGrid.tsx) — the
  shared Video/Audio field sheet. A `readOnly` prop renders it non-editable (the user settings
  dialog); it's editable, with custom entry, only in the admin preset manager.
- [`../src/components/DistroTable.tsx`](../src/components/DistroTable.tsx) — the Transcode Status
  column (stacked chips) + the restart row icon.
- [`../src/components/StatusChip.tsx`](../src/components/StatusChip.tsx) — the shared chip (also
  used by Platform Status).

**Backend swap points**
1. The `Processing → landing` timer (`RESTART_SIMULATION_MS`) → the real transcode pipeline;
   status arrives via webhook/poll. The backend owns the lifecycle; the UI reflects it.
2. Preset catalog persistence → server-side with real auth (today localStorage).
3. Per-publisher **option constraints** → validate overrides against the target pub's real spec
   (today the field options are a flat superset with no per-pub constraint).

## Open questions for the team

1. **Preset-update propagation scope.** Editing a preset now re-transcodes **every** distribution
   that uses it, across the line item (resolved for the prototype). Confirm the real-world scope
   (whole account? just this line item?) and whether it should be immediate or queued.
2. **Is the Default baseline "in spec"?** A clean Default lands green (its own state), not Live.
   Confirm that's the intended treatment for "no publisher chosen yet."
3. **Per-publisher option constraints.** Real specs allow only certain codecs / resolutions /
   rates per publisher. Model that in the admin preset editor, or keep the flat option set?

## Walkthrough

1. **Add a distribution tag** — Distributions → *+ Add Distribution Tag*. It appears with one
   Transcode Status chip per applied preset.
2. **Apply multiple presets** — *Transcoding Settings* → the first row is Default → change it
   to **Hulu** → **+ Add preset** → set the new row to **Netflix** → **Apply**. Every tag now
   shows two chips: `Live: Hulu` and `Live: Netflix`.
3. **View settings (read-only)** — expand a preset row to see its fields. As a regular user they
   can't be edited; Video Bitrate shows one or more single-rate chips.
4. **Update a preset as admin → auto re-transcode** — flip the top-bar toggle to **Admin**, open
   Transcoding Settings → **pencil** → Manage Presets → pick a preset, change its bitrate (add a
   rate, or type a custom single rate), **Update**. Every distribution using that preset
   re-transcodes (Processing → Live) to match.
5. **Show failure & recovery** — use a row's `⋯` menu to force **Error**, then the **restart**
   icon to re-transcode the whole plan.

## Known limitations & not-yet-built

- No backend or real auth; the role is a toggle and data resets if localStorage is cleared.
- The transcode itself is simulated (a timer), not a real pipeline.
- Preset **bitrates** now trace to published specs for the publishers that document them
  (Disney+/Hulu, Prime Video, Peacock, Roku, …); other preset fields remain illustrative.
- No per-pub option constraints yet.

## Changelog

- **2026-10-23** — **Discoverable custom bitrate; line-item page aligned to the platform.** The
  Video Bitrate field now surfaces an explicit **"Add custom rate…"** option as soon as a valid
  single number is typed (a range is rejected), so entering a specific rate is discoverable rather
  than free-type-only — still **admin-only**, in the preset manager. Dropped the confusing "one
  rendition per rate" wording from the field helper text. (Separately, the line-item screen was
  restructured to mirror the real platform — header Prev/Next + Set Default Creative, a vertical
  line-item detail list, Creatives split into **Weighted** + **Direct**, Pixels column order, and
  all section tables made horizontally scroll-contained; see `SESSION_LOG.md`.)
- **2026-10-22** — **Single-rate multi-select bitrate; no overrides; "Out of Spec" removed;
  preset updates propagate.** Video Bitrate is now a **multi-select of single rates** (no ranges,
  no averaging) — each selected rate is transcoded as-is, and the ladder covers
  every known spec range. **Regular users can no longer override presets** — the settings field
  sheet is read-only; they only *select* presets. The **Custom** entry (duration & bitrate) is
  **admin-only**, in the preset manager. The **`outOfSpec` status was removed** entirely (nothing
  can diverge from a preset — types, status meta/order, theme color, landing logic, the "Modified"
  chip, and the restart/outOfSpec copy all gone). **An admin's preset *Update* now propagates** —
  every distribution using that preset re-transcodes to match (reducer re-syncs the line-item
  configs; `handleUpdatePreset` animates Processing → Live).
- **2026-10-15** — **Duration & Video Bitrate are now standards-backed selectors.** Both moved
  from free text to dropdowns with an in-field **Custom…** entry (blank on open; non-standard
  values badged "Custom"; blank reverts to the prior selection). Duration = 15s/30s/45s/60s/
  Original. Video Bitrate = a published-spec master list **grouped Playback-rendition vs
  Source/mezzanine** (IAB 2026 + Trade Desk / Amazon / Disney/Hulu / Prime / FreeWheel / DV360),
  with seed presets re-mapped to published per-publisher bitrates. Added
  `docs/reference/video-encoding-bitrate-reference.md` as the source of truth. (Field model gains
  `select-custom` + grouped options; a legacy `:30`-style duration canonicalizes to `30s` on load.)
- **2026-08-13** — **Expanded for the build team.** Added a **Feature inventory** (every unique
  behavior at a glance) and an **Implementation map** (types, domain logic, state actions,
  components, and the backend swap points). No behavior change — documentation only.
- **2026-08-03** — **Dropped the Distributions section subheading.** The line-item's transcode
  plan was echoed as a `Transcoding: …` subtitle under the section title; it's redundant now
  that each distro's Transcode Status column shows a chip per applied preset, so the subheading
  was removed (the section has no subtitle).
- **2026-08-03** — **Restart now confirms.** A confirmation dialog guards the per-row restart
  so a re-transcode isn't triggered by accident.
- **2026-07-31** — **Incremental apply.** Applying now reprocesses only new or changed presets
  (Processing → landing); presets unchanged since the last apply keep each distro's current
  status. Editing a preset's settings counts as changed. (State: apply diffs the new plan
  against the previously-applied one and updates each distro's transcodes per-preset.)
- **2026-07-30** — A row set to the **Default baseline** shows its preset picker in an
  enabled-but-not-active state: **no floating "Preset" label** and muted interior text (solid
  border unchanged), so it doesn't read as an official preset selection — mirroring the
  green-ring `default` status chip. A chosen preset shows the label and normal text.
- **2026-07-30** — Preset rows lost their boxed cards (hairline dividers between them instead).
  Delete is now always available: deleting the last preset confirms and resets the plan to
  Default rather than being blocked.
- **2026-07-30** — "+ Add Preset" now inserts the new row at the **top** and scrolls to it, so
  the addition stays in the user's sightline instead of appearing off-screen below an expanded
  row.
- **2026-07-30** — **Multiple presets per line-item.** The modal now applies a list of presets
  (collapsible rows, "+ Add preset" / remove); every distro is transcoded once per preset and
  the Transcode Status column shows one chip per applied preset. Restart re-transcodes the
  whole plan. Data model: `AppState.transcoding` is now a `TranscodingConfig[]` and each
  distro holds a `transcodes: { presetId, status }[]` (was a single `status`), with a
  migration from the old shape.
- **2026-07-28** — Initial hand-off. Split out from the combined overview.
