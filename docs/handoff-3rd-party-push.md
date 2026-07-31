# Distribution Tags — 3rd-Party Push · Prototype Hand-off

> **Living document (draft).** Reflects the prototype as of **2026-07-31** and will be
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
- Each advertiser shows as **name + advertiser ID** — e.g. `Advertiser 1 · 012345`. *(The ID
  format is a placeholder; the real format is TBD.)*
- The advertiser list loads **asynchronously** with a spinner, and a stale-response guard
  keeps a slow reply from overwriting a newer platform's list.

## A tag can only go to its own platform

A tag is **built for one platform** — its `family` (Nexxen or TTD today) — and can only be
pushed there: a Nexxen tag → Nexxen, a TTD tag → The Trade Desk. One push targets a single
platform, and the platform **drives the selection**:

- The **platform picker always lists every platform** — the user can switch to any of them at
  any time.
- **Choosing a platform auto-selects that platform's tags** and disables the rest. Pick
  Nexxen and every Nexxen tag is checked, ready to push; switch to The Trade Desk and the
  selection swaps to the TTD tags. The user can still uncheck individual tags for a partial
  push.

So a distro list mixing Nexxen + TTD (+ future platforms) needs no manual sorting — the user
just picks the platform and pushes, then picks the next and pushes those. The mapping is a
direct lookup, so future platforms are covered as their family is added.

> In the prototype every tag is a Nexxen or TTD tag, so the platform options are exactly those
> two. **In the final version, tags sync with the platforms (DSPs / SSPs / etc.) directly** —
> the family→platform lock is the prototype stand-in for that sync. Users can still add
> custom key-values / macros regardless.

## Choosing what to push

- Until a platform is chosen, **nothing is selected** — the checklist prompts "Pick a platform
  to select its tags." Choosing one selects that platform's tags automatically.
- The dialog lists every tag with a checkbox; each row shows its **platform + current platform
  status**, and — for a tag already pushed — the **advertiser + ID it was last assigned to**
  (`Advertiser 1 · 012345`). So a user can see what's already gone out and where. Tags that
  don't belong to the chosen platform are disabled.
- A select-all toggle and a live "3 of 6 Nexxen tags selected" count cover the chosen
  platform's tags. The push button reflects the count — `Push 3 Tags` — and stays disabled
  until a platform, an advertiser, and at least one tag are selected.

## Add + Push (from the tag editor)

When **adding** a new tag, alongside **Add** there's an **Add + Push** button. It creates the
tag, then opens the push flow **pre-scoped**: the platform is **locked to the tag's family**
(a Nexxen tag opens push locked to Nexxen) and that one tag is pre-selected. The user just
picks the advertiser and confirms. This is the fast path for "make a tag and send it now"
without re-choosing the platform.

*(This is the current design; may change after testing — e.g. a fully one-click auto-push with
a default advertiser, or an inline advertiser field in the editor.)*

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

1. **Add distribution tags** — Distributions → *+ Add Distribution Tag*, choosing the **Nexxen**
   or **TTD** tab. Each appears with a `Not pushed` Platform Status.
2. **Add + Push** — while adding a Nexxen tag, click **Add + Push**. The push dialog opens with
   the platform **locked to Nexxen** and the new tag pre-selected; pick an advertiser and push.
3. **Platform drives the selection** — with a mix of Nexxen and TTD tags, open *Push Tags to
   Platform*, pick **Nexxen** → all Nexxen tags auto-select (TTD disabled) → push; then pick
   **The Trade Desk** → the selection swaps to the TTD tags → push those.
4. **Push just some** — after picking a platform, uncheck any of its tags you want to hold back
   before pushing.
5. **Show a rejection** — use a row's `⋯` menu to force **Error** on the platform status.

## Known limitations & not-yet-built

- No backend or real auth; all data is in the browser and resets if localStorage is cleared.
- Advertiser lookup and push are simulated (timers + mock data); no request leaves the browser.
- No push history and no retry/rejection-reason UI yet — both flagged above as production work.

## Changelog

- **2026-07-31** — Advertisers now show **name + advertiser ID** (`Advertiser 1 · 012345`;
  ID format is a placeholder). The push dialog's tag list also shows the **advertiser + ID
  each already-pushed tag is assigned to**.
- **2026-07-30** — Fixed **Add + Push** showing "No options" for advertisers: the advertiser
  fetch now also refires when the dialog opens (not only on platform change), so a pre-locked
  platform loads its advertisers even when it matches the previously-used platform.
- **2026-07-30** — Reworked the push editor to a **platform-drives-selection** model: the
  platform picker always lists every platform, and choosing one auto-selects that platform's
  tags (disabling the rest) so a mixed Nexxen+TTD list needs no manual sorting. Replaces the
  bidirectional lock (which limited the dropdown by the selection).
- **2026-07-29** — Added the family→platform push lock (a tag can only be pushed to the
  platform it was built for) and the **Add + Push** button in the tag editor (creates the tag
  and opens push pre-scoped, platform locked to the tag's family). Made the main push editor's
  lock **bidirectional** — selecting tags now limits the platform picker to their platform,
  not just the reverse. Noted that tags will sync with platforms directly in the final version.
- **2026-07-28** — Initial hand-off. Split out from the combined overview.
