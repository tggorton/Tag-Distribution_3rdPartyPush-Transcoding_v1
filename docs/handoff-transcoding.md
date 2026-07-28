# Distribution Tags — Transcoding · Prototype Hand-off

> **Living document (draft).** Reflects the prototype as of **2026-07-28** and will be
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
a per-line-item settings sheet with a **preset picker** (searchable) over ~15 fields grouped
**Video / Audio** — container, codec, resolution, aspect ratio, duration, bitrate, frame
rate, scan type, chroma, color, audio codec / sample rate / bitrate / channels, loudness. The
section subheading always shows the current preset, e.g. `Transcoding: Hulu (Disney)`.

- Picking a preset **fills the sheet**.
- Editing any field is a **one-off override for this line item and never mutates the preset**;
  a "Modified" chip appears when the sheet diverges.
- **Applying** re-transcodes every tag: they go **Processing**, then land on the status the
  config implies (see below).

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

**Landing after Apply:** `outOfSpec` if hand-edited, `default` if left on the untouched
baseline, otherwise `live`. New tags inherit the line item's current landing status.

**Restart:** a per-row restart icon re-runs the pipeline, enabled only from **Inactive**
(rebuild) or **Error** (retry) — never Live, Processing, or Out of Spec, where re-running the
same overrides would just reproduce the problem. The disabled tooltip explains why.

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

1. **Add a distribution tag** — Distributions → *+ Add Distribution Tag*. It appears with a
   Transcode Status.
2. **Set the transcode spec** — *Transcoding Settings* → pick **Hulu** → **Apply**. Every tag
   goes Processing → `Live: Hulu`. Edit a field and Apply again to see them land **Out of
   Spec** (orange).
3. **Manage presets as admin** — flip the top-bar toggle to **Admin**, open Transcoding
   Settings, and use the **pencil** beside the preset picker to add or edit a publisher preset.
4. **Show failure & recovery** — use a row's `⋯` menu to force **Error**, then the **restart**
   icon to watch it recover.

## Known limitations & not-yet-built

- No backend or real auth; the role is a toggle and data resets if localStorage is cleared.
- The transcode itself is simulated (a timer), not a real pipeline.
- Illustrative preset specs for every publisher except Hulu.
- No per-pub option constraints yet.

## Changelog

- **2026-07-28** — Initial hand-off. Split out from the combined overview.
