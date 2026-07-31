# Distribution Tags — Transcoding · Prototype Hand-off

> **Living document (draft).** Reflects the prototype as of **2026-07-30** and will be
> updated as the design evolves. See the Changelog at the bottom.
> Companion doc: **3rd-Party Push** (`handoff-3rd-party-push.md`).

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

## What it does

**Transcoding Settings** (button in the Distributions section, available to all users) opens
a per-line-item panel that applies **one or more presets**. Every distribution tag is
transcoded **once per preset**. The section subheading lists what's applied, e.g.
`Transcoding: Hulu (Disney), Netflix (Ads)`.

- The panel shows a **list of preset rows**. Each row is a **preset picker** over ~15 fields
  grouped **Video / Audio** (container, codec, resolution, aspect ratio, duration, bitrate,
  frame rate, scan type, chroma, color, audio codec / sample rate / bitrate / channels,
  loudness).
- **The settings are collapsed by default.** Expand a row (chevron) to see and edit its
  fields; collapse it again to keep the panel tidy.
- A **"+ Add Preset"** adds a new row **at the top** (collapsed) and **scrolls to it**, so
  the addition is visible even when a row lower down is expanded. Rows are separated by
  hairline dividers (no boxed cards).
- A **trash** icon removes a preset. Deleting one of several just drops it; deleting the
  **last** one prompts a confirm ("returns the transcoding settings to Default") and, on
  confirm, resets the plan to the Default baseline. Delete is **disabled** only when the sole
  preset is *already* Default — Default is the floor and always remains.
- Picking a preset **fills that row's sheet**. Editing any field is a **one-off override for
  this line-item and never mutates the preset**; a "Modified" chip appears on that row when it
  diverges.
- **Applying** re-transcodes every tag against the whole list: all transcodes go
  **Processing**, then each lands on the status its config implies (see below).

## Presets & the admin catalog

- Presets are **publisher specs** — a protected `Default` baseline plus **23 CTV publishers**
  (Hulu, Disney+, ESPN, Peacock, Paramount+, Netflix, Amazon, Max, Tubi, Roku Channel, Pluto,
  Xumo, Samsung TV Plus, LG Channels, Vizio WatchFree+, …).
- **Only Hulu's numbers come from a real spec sheet.** The rest are **illustrative**, varied
  by platform tier (premium ad-SVOD run higher bitrate / 5.1; FAST channels run lighter) and
  clearly marked as such in code.
- The catalog is **mutable admin state**. Admins get a **pencil** beside the preset picker
  that opens a manager to **Save New / Update / Delete** presets — i.e. add new pubs. The
  `Default` baseline can't be edited or deleted. Regular users just pick and apply.
- DSPs (Nexxen, The Trade Desk) are **push targets, not transcode presets** — they live in the
  Push flow, not here.

## Transcode Status — the states

| State | Color | Means | Restart? |
|---|---|---|---|
| **Default** | Green **ring** | Running on the video baseline — no publisher preset officially applied. Serves fine, but distinct from Live so an un-set line item is visible. | — |
| **Live** | Green | Conformed to a chosen preset; ready to serve. Chip names the pub — `Live: Hulu (Disney)`, shortening to `Live: Hulu` on narrow screens. | — |
| **Processing** | Amber | Transcoding in flight (after Apply, or after a restart). | — |
| **Error** | Red | The transcode **run** failed. Retrying may fix it. | **Yes** — retry |
| **Out of Spec** | Orange | Settings were manually overridden and may not meet the target pub's spec. A **config** problem, not a run failure — orange to separate it from Error red. | **No** — fix settings |
| **Inactive** | Grey | Dormant / off. | **Yes** — rebuild |

**One status per applied preset.** Each tag now shows a **stack of status chips in the
Transcode Status column — one per preset applied** (e.g. `Live: Hulu (Disney)` above
`Out of Spec: Netflix`). Each chip names its preset. **Landing per config:** `outOfSpec` if
that row was hand-edited, `default` if it's the untouched baseline, otherwise `live`. New tags
inherit the line item's current plan (one transcode per applied preset).

**Restart:** a per-row restart icon re-transcodes the tag against the **current line-item
plan** (all its transcodes → Processing → their landing statuses). It's enabled when any of
the tag's transcodes is **Inactive** or **Error**; disabled otherwise. The `⋯` "Set transcode
status" affordance forces **all** of a tag's transcodes to one status (prototype only).

## In the prototype vs. For production

| In the prototype | For production |
|---|---|
| Preset numbers are **illustrative** — only Hulu is a real sheet. | Load **real publisher specs**; likely constrain valid options per pub. |
| `Processing → Live` is a fixed timer, not a real transcode. | Apply kicks a **real re-transcode**; status comes from the pipeline (webhook / poll). |
| Option lists are a flat superset; a preset does not **constrain** which options are valid. | Model **per-pub option constraints** and validate overrides against them. |
| Catalog edits persist to localStorage. | Persist the admin **preset catalog** server-side with real auth. |
| Backend does not exist. | The **backend owns the transcode lifecycle** — the UI reflects state and offers restart. |

## Open questions for the team

1. **Should editing a preset re-flag line items that already used it?** A line item snapshots
   its settings, so after an admin edits (say) the Hulu preset, an existing "Live: Hulu" item
   reads as "Hulu (modified)" against the new spec. Desirable signal, or should edits leave
   existing line items untouched?
2. **Is the Default baseline "in spec"?** Currently a clean Default lands green (its own
   state), not Live and not Out of Spec. Confirm that's the intended treatment for "no pub
   chosen yet."
3. **Per-pub option constraints.** Real specs allow only certain codecs/resolutions per
   publisher. Model that, or keep the flat option set?

## Walkthrough

1. **Add a distribution tag** — Distributions → *+ Add Distribution Tag*. It appears with one
   Transcode Status chip per applied preset.
2. **Apply multiple presets** — *Transcoding Settings* → the first row is Default → change it
   to **Hulu** → **+ Add preset** → set the new row to **Netflix** → **Apply**. Every tag now
   shows two chips: `Live: Hulu` and `Live: Netflix`.
3. **Override one preset** — expand the Netflix row (chevron), tweak a field ("Modified"
   appears), Apply → that tag's Netflix chip lands **Out of Spec** while Hulu stays Live.
4. **Manage presets as admin** — flip the top-bar toggle to **Admin**, open Transcoding
   Settings, and use the **pencil** to add or edit a publisher preset.
5. **Show failure & recovery** — use a row's `⋯` menu to force **Error**, then the **restart**
   icon to re-transcode the whole plan.

## Known limitations & not-yet-built

- No backend or real auth; the role is a toggle and data resets if localStorage is cleared.
- The transcode itself is simulated (a timer), not a real pipeline.
- Illustrative preset specs for every publisher except Hulu.
- No per-pub option constraints yet.

## Changelog

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
