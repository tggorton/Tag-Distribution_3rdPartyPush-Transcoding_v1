# Hand-off docs

Prototype hand-off overviews for the **Tag Distribution — 3rd-Party Push & Transcoding**
build, one per feature. Written for team review and the job ticket.

Both are **living documents** — kept up to date as the design evolves. Each has a Changelog
at the bottom; update the date and add an entry when you change one.

| Feature | Doc | Covers |
|---|---|---|
| **3rd-Party Push** | [handoff-3rd-party-push.md](handoff-3rd-party-push.md) | Pushing tags to a platform (DSP/SSP), per-distro selection, **Platform Status** |
| **Transcoding** | [handoff-transcoding.md](handoff-transcoding.md) | Per-line-item transcode settings, publisher presets, admin catalog, **Transcode Status** |

**Build order:** the team takes **3rd-Party Push first**, then Transcoding. Each doc now
opens with a **Feature inventory** (every unique behavior at a glance) and — near the end —
an **Implementation map** (types, domain logic, state actions, components, and the backend
swap points) for whoever builds the real thing.

Each doc is self-contained: behavior → status states → *prototype vs. production* → open
questions → walkthrough → limitations.

**Picking this project back up (new machine or new Claude account)?** Start with
[RESUME.md](RESUME.md) — repo/git settings, what transfers across a Claude-account switch,
how to run, and current state.

**Shareable visual versions (Artifacts):**

| Feature | Artifact URL |
|---|---|
| 🎬 Transcoding | https://claude.ai/code/artifact/4d591c16-e0ca-47a3-821b-aeb8e410039f |
| 📡 3rd-Party Push | https://claude.ai/code/artifact/3d3e2a14-5296-4beb-b21c-654a60b5451e |

> These Artifacts are owned by the original Claude account. A different account can view
> them but must **republish** to maintain them — see [RESUME.md](RESUME.md) → *Artifacts*.

> **Reminder:** this is a UX/functionality prototype — no backend, no real auth, all state in
> localStorage, every external call simulated. The docs mark what's a stand-in vs. what
> production must own.
