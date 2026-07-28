# Distribution Tags — 3rd-Party Push · Prototype Hand-off

> **Living document (draft).** Reflects the prototype as of **2026-07-28** and will be
> updated as the design evolves. See the Changelog at the bottom.
> Companion doc: **Transcoding** (`handoff-transcoding.md`).

## Read this first

This is a **UX and functionality prototype**, not a partial implementation. There is no
backend and no real authentication — all state lives in the browser (localStorage), and
every external call (advertiser lookup, push) is **simulated**. Its job is to pin down the
intended behavior and screens so the team can scope and build the real thing. Each feature
below is split into *what the prototype does* vs. *what production needs to own*.

Stack: React + TypeScript + MUI. Runs at `localhost:5174` (`npm run dev`).

## Foundations (shared)

- **Two status lifecycles.** Every distribution tag carries **two independent statuses**,
  one column each: **Platform Status** (this doc) and **Transcode Status** (the Transcoding
  doc). A tag can be transcoded and live yet never pushed — or pushed and rejected.
- **Platform, not DSP.** Today a platform means a **DSP** (Nexxen, The Trade Desk); the
  naming deliberately spans **DSP and SSP** so supply-side targets fit later without renaming.
- **Readability.** Each status renders as a colored dot *and* a label; same-hue states are
  told apart by a **ring vs. solid** dot.
- **Prototype affordance to ignore in production:** each row's `⋯` menu has a "Set platform
  status" block so a reviewer can force any state (e.g. show an error) during a walkthrough.
  It disappears once the real push API drives status.

## What it does

**Push Tags to Platform** (button in the Distributions section, disabled until at least one
tag exists) opens a dialog to choose a destination and exactly which tags to send.

- Advertisers are **scoped to the platform** — each platform returns its own set — so the
  platform must be chosen before the advertiser field enables.
- The advertiser list loads **asynchronously** with a spinner, and a stale-response guard
  keeps a slow reply from overwriting a newer platform's list.

## Choosing what to push

- The dialog lists every tag with a checkbox, defaulting to **all selected**, plus a
  select-all toggle and a live "3 of 6 selected" count.
- Each row shows its current **platform status**, so a user pushing "just the new ones" can
  see what's already gone out.
- The button reflects the count — `Push 3 Tags` — and stays disabled until a platform, an
  advertiser, and at least one tag are chosen.

## Platform Status — the states

| State | Color | Means |
|---|---|---|
| **Not pushed** | Grey **ring** | Never pushed to a platform (default for a new tag). |
| **Pushing** | Amber | Push in flight. |
| **Success** | Green | The platform accepted the tag. Chip names the destination — `Success: Nexxen`. |
| **Error** | Red | The push failed **or** the platform rejected the tag. |

On push, the selected tags go **Pushing**, then land **Success**, with the destination
recorded per tag (from the platform + advertiser chosen).

## In the prototype vs. For production

| In the prototype | For production |
|---|---|
| Advertiser lists are **mocked** — a fixed "Advertiser 1–10" per platform, with simulated latency. | Real **per-platform advertiser API** (each platform authenticated independently). |
| Pushing is **optimistic**: every push lands Success. No request leaves the browser. | Real **push API** returning success / error / rejection — the UI already models `pushing → success/error`. |
| Error/rejection shown only via the `⋯` "Set platform status" affordance. | Surface **rejection reasons** and a retry path on Error. |
| Only the **last** push target + status is kept per tag. | Persist **push history** (platform, advertiser, timestamp, outcome). |

## Open questions for the team

1. **Do SSPs use "advertisers," or a different association?** Supply-side may bind to a
   publisher or seat instead. If so, the second dropdown's *label* becomes platform-dependent,
   and the advertiser API needs to return the field name alongside the list.
2. **Should transcode state gate a push?** Right now any tag is pushable regardless of its
   transcode status. Should a non-Live tag (still processing, or errored) be blocked or warned
   before it can be pushed?
3. **Re-push semantics.** What happens when a tag already Successful is pushed again —
   overwrite, version, or no-op?

## Walkthrough

1. **Add distribution tags** — Distributions → *+ Add Distribution Tag*. Each appears with a
   `Not pushed` Platform Status.
2. **Push to a platform** — *Push Tags to Platform* → pick **Nexxen** → an advertiser → check
   the tags to send → **Push**. Platform Status goes Pushing → `Success: Nexxen`.
3. **Push just the additional** — add a few more tags, reopen the dialog, and deselect the ones
   already showing `Success` before pushing.
4. **Show a rejection** — use a row's `⋯` menu to force **Error** on the platform status.

## Known limitations & not-yet-built

- No backend or real auth; all data is in the browser and resets if localStorage is cleared.
- Advertiser lookup and push are simulated (timers + mock data); no request leaves the browser.
- No push history and no retry/rejection-reason UI yet — both flagged above as production work.

## Changelog

- **2026-07-28** — Initial hand-off. Split out from the combined overview.
