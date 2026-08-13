# Resume / Pick-Up Guide

> **Purpose:** everything needed to pick this project back up in a **new Claude
> account / client** (e.g. a Team account) without losing context. Read this
> first. Written 2026-08-13.

If you are a fresh Claude session that has never seen this project: this file +
[`../CLAUDE.md`](../CLAUDE.md) + [`../SESSION_LOG.md`](../SESSION_LOG.md) are your
entry points. The git history is the authoritative technical record.

---

## TL;DR — what carries over when you switch Claude accounts

The short version: **the repo is everything, and the repo is on disk.** Git does
not know or care which Claude account you use. Open the same folder on the same
machine and all of it is there.

| Thing | Transfers to a new Claude account? | Why |
|---|---|---|
| **Code, full git history, commits, branches** | ✅ Yes, automatically | Lives in `.git/` on disk — account-independent. |
| **Git remotes + push URLs** (`origin`, `old-origin`) | ✅ Yes, automatically | Stored in `.git/config` on disk. |
| **Local git identity** (`user.name` / `user.email`) | ✅ Yes | In `.git/config`. See below to re-verify. |
| **CLAUDE.md, SESSION_LOG.md, TIME_LOG.md, docs/** | ✅ Yes | Ordinary tracked files in the repo. |
| **Project-local skills** (`.claude/skills/log-time/`) | ✅ Yes | Committed in the repo. |
| **Claude file-memory** (`~/.claude/projects/<hash>/memory/`) | ⚠️ Same machine only | On disk, keyed by project **path**, not account. Survives an account switch on this Mac; will **not** follow to a different machine. |
| **This chat's conversation history** | ❌ No | Tied to the current Claude session/account. The new account starts fresh — which is exactly why the on-disk docs above exist. |
| **Published Artifacts** (the two hand-off web pages) | ⚠️ View yes, edit no | Owned by the **old** account. The new account can open the URLs if shared but **cannot update them in place**. To maintain them, republish fresh (see [Artifacts](#artifacts)). |

**Net:** nothing important is lost by switching accounts, as long as you (a) work
in the same repo folder and (b) don't rely on this chat's memory — rely on the
committed docs instead. The one thing to consciously re-do under the new account
is **re-publishing the hand-off Artifacts** if you want to keep editing them.

---

## The project in one paragraph

A clickable **React + TypeScript + MUI v5 (Vite)** prototype of a redesigned VAST
distribution-tag manager, at the **line-item level**. No backend — all state is a
single `useReducer` in [`../src/state/AppContext.tsx`](../src/state/AppContext.tsx),
persisted to `localStorage` under `radius.adtags.v1`. Two feature tracks were built
on top of the original tag/template tool: **Transcoding** (per-line-item preset
sheets, multi-preset, admin catalog, a per-preset **Transcode Status** column) and
**3rd-Party Push** (push tags to platforms like Nexxen / The Trade Desk, per-distro
selection, locked advertiser, a **Platform Status** column). Full domain rules are
in [`../CLAUDE.md`](../CLAUDE.md); the two feature hand-offs are in
[`handoff-transcoding.md`](handoff-transcoding.md) and
[`handoff-3rd-party-push.md`](handoff-3rd-party-push.md).

---

## Repo & git settings

```
origin      https://github.com/tggorton/Tag-Distribution_3rdPartyPush-Transcoding_v1.git   ← current work
old-origin  https://github.com/tggorton/Ad-Tag-Export-Management.git                        ← original prototype (superseded for this feature line)
```

- **Branch:** `main`. The history is **continuous** — the new repo contains the
  entire old-repo history (25 commits as of 2026-08-13), so nothing was lost in the
  repo split; only the *remote* changed.
- **Local iteration branches** (`iteration/manage-templates-button`,
  `iteration/single-transcoding-preset`) are old checkpoints — safe to delete.
- **Local git identity** (re-verify under the new account/machine):
  ```
  git config user.name    # → Grant Gorton
  git config user.email   # → ggorton@kerv.ai
  ```
- **Commit convention:** every commit ends with
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

### Push hygiene (unchanged rule)

Pushes are **never** automatic — only on explicit request. Auth is a **temporary
PAT used inline in the push URL only**, never written to `.git/config`:

```bash
git push "https://<user>:<PAT>@github.com/tggorton/Tag-Distribution_3rdPartyPush-Transcoding_v1.git" main:main
```

After every push: verify `.git/config` has no token (`grep ghp_ .git/config` → nothing)
and **revoke the PAT**. All PATs used so far have been revoked.

---

## Running it

- `npm install` (first time on a new machine).
- `npm run dev` → **http://localhost:5174** (strict port; check `lsof -i :5174` first).
- `npm run build` = `tsc --noEmit` then Vite build.
- **The gate:** `npx tsc --noEmit`. There is **no test suite and no linter** —
  typecheck is the only automated check. `noUnusedLocals`/`noUnusedParameters` are on.
- **Reset demo state** (browser DevTools console on the running tab):
  ```js
  localStorage.removeItem('radius.adtags.v1'); location.reload()
  ```

---

## Artifacts

Two shareable visual hand-off pages were published from this account:

| Page | URL |
|---|---|
| 🎬 Transcoding | https://claude.ai/code/artifact/4d591c16-e0ca-47a3-821b-aeb8e410039f |
| 📡 3rd-Party Push | https://claude.ai/code/artifact/3d3e2a14-5296-4beb-b21c-654a60b5451e |

**Important for the account switch:** these are owned by the **old** account. The
new (Team) account can view them if the links are shared, but **cannot republish to
the same URLs** — updating an artifact requires owning it. The raw HTML was built in
the session scratchpad and is **not** in the repo. To maintain visual versions under
the new account, **rebuild them from the markdown hand-off docs** (which are the
content source of truth and are fully in-repo) and publish new Artifacts. The pages
render each doc's content plus UI-mockup "storyboards" drawn in the real dark-app
palette (paper `#383838`, pink `#EF0078`, the status hues, etc.).

---

## Where things stand (2026-08-13)

Working tree clean, typecheck green, everything through `6e0e618` pushed to `origin`.
Most recent work (newest first):

- Removed the redundant `Transcoding: …` subheading under the Distributions title
  (the Transcode Status column already shows a chip per preset).
- Advertiser lock hardened: once set for a platform the field is **disabled** (not
  just read-only), with a MUI `LockOutlined` icon + a "contact support" tooltip.
- Locked, sticky advertiser (one advertiser per platform per line-item); unlink /
  re-link both confirm first.
- Link/unlink as an exposed row icon; `Inactive` platform status; `Save + Push` in
  edit mode.
- Multi-preset transcoding with incremental apply; advertiser name + ID.

## Likely next steps / open threads

- **Rebuild the hand-off Artifacts** under the new account (see above).
- Open product/design questions are listed at the bottom of each hand-off doc
  ("Open questions for the team") — e.g. whether transcode state should gate a push,
  re-push semantics, SSP "advertiser" vs. other association, per-publisher option
  constraints.
- Older, still-standing items are in
  [`../SESSION_LOG.md`](../SESSION_LOG.md) → *Future considerations* / *Open threads*.
- Everything backend-facing is simulated (localStorage, timers, mock advertiser
  lookups); the prototype exists to pin down UX so the real thing can be scoped.

---

## Doc map

| File | What it is |
|---|---|
| [`../CLAUDE.md`](../CLAUDE.md) | Architecture + conventions + domain rules. Read before coding. |
| [`RESUME.md`](RESUME.md) | This file — how to pick the project back up. |
| [`../SESSION_LOG.md`](../SESSION_LOG.md) | Narrative history (the *why* behind decisions), per session. |
| [`../TIME_LOG.md`](../TIME_LOG.md) | Effort log (AI Work + Prompting), per session. |
| [`handoff-transcoding.md`](handoff-transcoding.md) | Transcoding feature hand-off (living doc). |
| [`handoff-3rd-party-push.md`](handoff-3rd-party-push.md) | 3rd-Party Push feature hand-off (living doc). |
| [`README.md`](README.md) | Index of the hand-off docs. |
