# Hand-off docs

Prototype hand-off overviews for the **Tag Distribution — 3rd-Party Push & Transcoding**
build, one per feature. Written for team review and the job ticket.

Both are **living documents** — kept up to date as the design evolves. Each has a Changelog
at the bottom; update the date and add an entry when you change one.

| Feature | Doc | Covers |
|---|---|---|
| **3rd-Party Push** | [handoff-3rd-party-push.md](handoff-3rd-party-push.md) | Pushing tags to a platform (DSP/SSP), per-distro selection, **Platform Status** |
| **Transcoding** | [handoff-transcoding.md](handoff-transcoding.md) | Per-line-item transcode settings, publisher presets, admin catalog, **Transcode Status** |

Each doc is self-contained: behavior → status states → *prototype vs. production* → open
questions → walkthrough → limitations. Shareable visual versions exist as Artifacts (ask the
maintainer for the links).

> **Reminder:** this is a UX/functionality prototype — no backend, no real auth, all state in
> localStorage, every external call simulated. The docs mark what's a stand-in vs. what
> production must own.
