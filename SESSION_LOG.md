# Session Log — Radius Ad Tags Prototype

**Coverage:** 2026-04-25 — present (this project's lifetime).
**Audience:** Anyone (you, an engineer, future-me after compaction) who needs the *narrative* context behind the commits — what was discussed, what trade-offs were weighed, what the user observed visually, what's still open.

The git log is the authoritative technical record (every change has a detailed commit message). [`TIME_LOG.md`](TIME_LOG.md) covers hours. **This file fills the gap between "what changed" and "why we made that call"** — and surfaces user-facing observations and future considerations that don't fit naturally in any other doc.

---

## How to use this doc

- **Just landed on the project?** Skim the [Engagement framing](#engagement-framing) for context, then jump to the most recent session for current state.
- **Trying to remember a specific decision?** Search this doc by keyword — every major call is captured with the rationale, often with the user's exact framing.
- **Trying to find a specific commit?** Use the commit reference table at the bottom.
- **Want to know what's still open?** See [§ Future considerations](#future-considerations) and [§ Open threads](#open-threads).

---

## Engagement framing

The user (UX/UI designer) wanted to build an interactive React prototype demonstrating the workflow for managing **ad distribution tags** ("distros") associated with multiple distributors, plus an admin workflow for managing the **tag templates** that drive distro creation. The prototype lives at the **line-item level** of a larger campaign hierarchy (campaign → segment → advertiser); the prototype focuses specifically on the distros + templates area.

**Core flows:**
- **Regular User:** Add Distribution Tag → optionally pick a template (autofills params) → customize → save distro. Copy URL per row, multi-select export to CSV.
- **Admin:** Same Add flow + a separate **Manage Templates** dialog for creating, updating, and deleting templates. Templates can optionally be scoped to a specific advertiser (`advertiser-01` through `advertiser-12`).

**Stack:** Vite + React 18 + TypeScript + MUI v5, state via React Context + reducer, persisted to `localStorage`. Single page (no router). Built from scratch with Figma + a previous project ([`line-item-multi-creative`](https://github.com/tggorton/Line-Item-Multi-Creative)) as visual references.

**Production destination (updated 2026-07-28):** the original prototype lived at
[`tggorton/Ad-Tag-Export-Management`](https://github.com/tggorton/Ad-Tag-Export-Management).
When the project expanded into the **Transcoding + 3rd-Party Push** feature line (see
Sessions 8+ below), the user moved active work to a **new** repo,
[`tggorton/Tag-Distribution_3rdPartyPush-Transcoding_v1`](https://github.com/tggorton/Tag-Distribution_3rdPartyPush-Transcoding_v1),
keeping the original untouched. The git **history is continuous** — the new repo
contains the full old history; only the remote changed. Locally: `origin` = the new
repo, `old-origin` = the original. Pushed via temporary PATs (revoked after each use).
Local development on `main`; pushes happen explicitly when the user authorizes.
See [`docs/RESUME.md`](docs/RESUME.md) for the full pick-up guide (repo settings,
what transfers across a Claude-account switch, how to run).

**Reference materials kept in-tree:** `_Code-Reference/` (Figma JSON exports + raw HTML snippets) and `_Image-Reference/` (screenshots of every dialog state). Both committed alongside source as durable design artifacts; they're not part of the build.

> **Two chapters.** Sessions 1–6 built the original **tag + template** tool (distros,
> admin templates, advertiser scoping, mutable param catalog). Sessions 7–12 added
> two new tracks — **Transcoding** and **3rd-Party Push** — each with its own status
> column, and moved the work to the new repo. If you only need the recent feature
> line, jump to Session 8.

---

## Sessions

### 2026-04-25 — Session 1: Plan + scaffold + style iteration + first push

**Wall-clock span:** Afternoon, multi-hour. Commits: `266bb44` (auto-README, 16:07), `fe3a985` (16:10).

**Ground rules established early:**
- **Port hygiene** (saved to memory): always check `lsof -i :PORT` before starting `npm run dev`. User flagged: *"In the future, for any/all new projects, please check the port before you push to it."* Dev server hardcoded to `--port 5174 --strictPort` so collisions fail loudly rather than silently jumping ports.
- **Asset hygiene:** `node_modules`, `dist`, `.DS_Store`, `.vite`, `*.tsbuildinfo` all gitignored from day one.
- **Reference materials are durable:** the `_Code-Reference/` and `_Image-Reference/` folders the user provided live in the repo — they're the design ground truth and survive any code restructure.

**Plan-mode kickoff.** User opened with a high-level project description and said *"This is for the planning of the tool. I will provide some visuals and further guidance next."* Three Explore agents launched in parallel to skim the reference materials and surface structural cues — distro section layout, admin template dialog, KV/macro flow + CSV format. Plan settled on: Vite + React + TS + MUI, `localStorage` persistence, role toggle in header (Admin ↔ User), single page (no router), wait-for-visuals-then-scaffold cadence.

User then dumped a substantial visual + textual brief: Figma URLs (with specific `node-id` deep links), `_Code-Reference/` folder pointers, `_Image-Reference/` folder pointers, and three exact reference tag strings (one Nexxen-only, one TTD-only, one Creative-only) that defined the exact `&key=value` substring each parameter checkbox should emit. The reference strings were the ground truth I anchored the param catalog on — every entry in `paramCatalog.ts` mapped a checkbox label to an exact output substring.

**Two ambiguities I flagged for confirmation before scaffolding:**

1. **`AppBundle` vs `app_bundle`** — both visible as separate checkboxes in the Figma. User: *"AppBundle and app_bundle are two separate entries that are currently available -- not entirely certain of the difference, but both are available."* I tentatively mapped `app_bundle` → `&app_bundle=$!{APP_ID}` (from reference) and `AppBundle` → `&app={{APP_NAME}}` (the only remaining unmapped substring in the all-Nexxen reference output). Flagged in [Open threads](#open-threads) for backend confirmation.
2. **Region effect on tag string** — region radio (US-East-1 / Australia / Europe) appeared in the UI but didn't show up in the reference outputs. User confirmed: region is **metadata only**, doesn't affect the rendered tag string.

**Scaffold landed cleanly.** ~20 source files: `types.ts`, `theme.ts`, `paramCatalog.ts`, `tagBuilder.ts`, `csvExport.ts`, `state/AppContext.tsx`, `state/seedData.ts`, plus all the component stubs (`AppHeader`, `CampaignDetailsStub`, `CreativesStub`, `TagPreview`, `ParamCheckboxGroup`, `CustomKeyValueList`, `CustomMacroList`, `TagEditorDialog`, `AddDistroDialog`, `DistroTable`, `DistrosSection`). Six seed templates included (NEXXEN-1/2/3 + TTD-1/2/3) so the dropdown wasn't empty on first load. `tsc` clean, dev server up on 5174.

**Style iteration — multiple rounds.** First version landed with my best-guess theme + layout. User shared screenshots comparing my output to the Figma references and said *"visually it needs to match my references better."* This kicked off a series of restyle passes:

- **Restyle pass 1**: brightened the pink primary, refined the dark backgrounds to match Figma exactly, added pink section labels (Region, Nexxen Params, Creative Params), moved to a large pink h4 dialog title, added the `+ / trash / pencil` toolbar visual next to family params headers, made the `+ Add Key Value` / `+ Add Macro` buttons solid pink (not text-style).

- **Restyle pass 2 — full chrome restructure.** User pointed at a previous project of theirs ([`line-item-multi-creative`](https://github.com/tggorton/Line-Item-Multi-Creative)) as the reference for the page chrome (sidebar, top bar, hero card layout). Cloned the repo into `/tmp/`, used an Explore agent to extract the exact theme tokens (`#EF0078` pink, `#001529` nav blue, `#383838` paper, system font stack, `borderRadius: 4`, `fontWeight: 600` on buttons, table cell padding `12px 16px` with `#5D5D5D` borders), then ported them into `theme.ts`. Replaced my placeholder K-text logo with the actual KERV SVG (6-polygon two-tone pink, copied verbatim from `kerv-one-theme/components/sidebar.tsx`). Sidebar grew from 56px to 80px and now references the line-item-multi-creative project's external icon URLs (Vercel blob storage) for visual parity. Top bar slimmed down to bell + role toggle.

- **Hero card → horizontal field row.** The original first-cut hero was a 4-col field grid; the user's reference showed all 11 fields (Line Item ID / Status / Start / End / Rate / Impression Budget / Reverse Wrap Tag / 3rd Party Tag / External Name / Type / Creative) as a single horizontal row with edit-pencil and calendar icons next to editable fields. Restructured to match. "Creative Playback Version: CTV" added as a sub-row beneath. Big pink solid `CLONE THIS LINE ITEM` button positioned outside the card, top-right.

- **Creatives + Pixels stub sections.** Both added as flat (non-card) sections with their own `SectionHeader` + outlined-pink action buttons + plain MUI tables. Initially empty; in Session 4 I added two stub creatives (Stratos_Hero_30s, Stratos_Cutdown_15s) so the page reads as a populated line item rather than half-empty.

**The "just option A" scope-control moment.** When the user pointed at line-item-multi-creative, I asked whether they wanted (A) just styles ported over, (B) styles + 1–2 features (inline-editable hero, Add Creative dialog), (C) full feature port, or (D) something custom. User: *"Lets just do option A for now."* This kept the scope sane — line-item-multi-creative has substantial feature surface (creative weighting, dayparting, date pickers) that would have been a multi-day port for tangential UX value. We absorbed the visual language, not the functionality.

**Layout fix — content hugs right edge.** First-cut had `maxWidth: 1440` on the content column, leaving empty space on wider viewports. User: *"things should line up to the 'bell' versus inset from that."* Dropped `maxWidth` so the content column spans full width; left padding matches the right padding of the bell.

**Tag Template overlap bug fix.** User screenshot showed the dropdown rendering "Tag Template" label and "Select Template" placeholder both stacked in the field's vertical center — classic MUI `select` + `displayEmpty` + `label` interaction where the label fails to shrink to the top notch. Fix: `InputLabelProps={{ shrink: true }}` to pin the label, plus `SelectProps.renderValue` to render the gray placeholder text inside the field instead of relying on a hidden empty `<MenuItem>`.

**First push to GitHub.** User created a fresh repo (`Ad-Tag-Export-Management`) and provided a temporary PAT. Initial push was rejected — the remote had a single auto-generated README commit from GitHub's "initialize with README" checkbox. Rebased my commit on top of the README rather than force-pushing, so the README stayed (non-destructive). PAT used inline in the URL only — never written to `.git/config`. Verified post-push that no token leaked.

**Session 1 outcome:** A working prototype with the full distros workflow, six seed templates, all the form sections wired up, the Manage Templates flow not yet split out (admins used the same dialog with extra buttons at this point), and a clean push to the partner repo. User clicked through end-to-end before logging off.

---

### 2026-04-27 — Session 2: Merge add flow + Save/Update gating + NUL fix

**Wall-clock span:** ~14:00 → ~16:30. Commits: `6488ccb` (15:09), `65bf264` (15:30), `6b86904` (16:13).

**The two-step → one-step Add flow merge.** User: *"Rather than the user having the 'select' a template and then hit 'next' and then the 'details' load, we can merge that together. So you hit 'add' and then the full 'unfilled' list loads (similar to creating a new template) and then the 'choose template' dropdown exists in that view."*

This was a substantial UX simplification. The previous flow was: click `+ Add` → small dialog with template dropdown → click Next → big editor opens with autofilled params. New flow: click `+ Add` → big editor opens immediately with empty form + a `Tag Template` dropdown at the top → picking a template autofills the form → click Add to save the distro.

Implementation: deleted `AddDistroDialog.tsx` entirely. Moved the template selector + admin radio inline into `TagEditorDialog`. Admins still saw the Tag Type radio (`Choose Template` / `Create New Template`) but it lived inside the editor instead of the predecessor dialog. `DistrosSection` now mounts `TagEditorDialog` directly for both add and edit.

**Field-reorder misinterpretation.** User: *"Please shift the location of the 'distro name' and 'template' dropdown."* I read "shift the location" as "move them somewhere else" and put both fields at the bottom of the form, side-by-side, just above the Cancel/Add buttons. User clarified: they meant **swap their order** at the top — Distro Name first, Tag Template second (originally Tag Template was first, Distro Name underneath). One of the more memorable miscommunications of the project — vague-but-short prompts in design conversations tend to read multiple ways. Rule of thumb taken away: ask for explicit placement when "shift" is the verb.

**KV/Macro consolidation** (also part of `6488ccb`). User: *"Combine the 'key values' and 'macro' add buttons into a single button - 'Add Key Value / Macro'."* Then refined further: *"When you hit 'add' only one set of fields needs to be added. A user can use that for either a key value or a macro --- they're essentially the same thing. So they can add as many of them as they want."*

Net effect: replaced the dual `+ Add Key Value` / `+ Add Macro` buttons + their separate textfield panels with a single `+ Add Key Value / Macro` button that appends one new editable row per click. Each row has Key + Value text fields and a delete icon. Direct-edit (no separate "commit" button per row). Newly-added rows scroll into view + auto-focus the Key field.

Underlying data model also collapsed: `customMacros: CustomMacro[]` field removed from `Distro` and `Template`; everything now lives in a single `customKeyValues: CustomKeyValue[]` array. Added a localStorage migration in `loadFromStorage` so existing saves with `customMacros` get their entries mapped to `customKeyValues` (`{macro, token}` → `{key, value}`) on load. Build clean, types pruned, no migration prompts needed.

**`hasTemplateChanges` gating** (`65bf264`). User: *"IF an Admin selects a template but does NOT modify any settings, the 'update template' should be disabled."* Added an `originalTemplate` `useMemo` that resolves to the picked template's saved state, plus a `hasTemplateChanges` `useMemo` that deep-compares the current form to that saved state (sets compared as sorted arrays for `selectedParams` / `selectedCreativeParams`; `customKeyValues` compared by content via `JSON.stringify([key, value])` since IDs regenerate on autofill). The Update Template button's disabled state now tracks this.

The user explicitly excluded the Distro Name field from the comparison — that's the distro's identity, not part of the template's settings.

**The NUL byte saga** (`6b86904`). After committing `65bf264` and pushing, I noticed the commit showed as a binary diff (`Bin 13312 -> 13334 bytes`, `0 insertions, 0 deletions`). Used `python3` to scan the file for NUL bytes — found two at positions 5956 and 6068, both inside the `customKeyValues` comparison helper I'd just added. The intended code was:

```ts
.map((kv) => `${kv.key}\0${kv.value}`)  // NUL as separator
```

The `\0` was meant to separate key from value to avoid collisions (e.g., `"key1=value1"` vs `"key1value1=..."` ambiguity), but the literal NUL byte made git treat the whole file as binary going forward. Replaced with `JSON.stringify([kv.key, kv.value])` — unambiguous, human-readable, plain UTF-8.

Lesson: never use `\0` as a string separator in source files. Stay in printable ASCII or use `JSON.stringify` for unambiguous encoding.

**Two pushes** in this session:
1. After the first commit (`6488ccb`), push was rejected for non-fast-forward — needed to fetch + rebase first because a previous session had landed something I hadn't pulled. Resolved cleanly.
2. After the NUL fix, push went through. Verified `.git/config` clean after every push (no PAT residue).

---

### 2026-04-28 — Session 3: Admin save-flow polish

**Wall-clock span:** ~13:30 → ~15:00. Commits: `92b362c` (13:57), `5ac6090` (14:50).

**Removing the auto-fill of distro name.** Previous behavior: picking a template auto-filled the Distro Name field with `${tpl.name} – Distro N`. User feedback: that's wrong — the distro name and the template name are separate things; the user should always type their own distro name. *"It should not effect the ditro name field at all."* Removed the auto-fill from `handleTemplateChange`. Now picking a template autofills params + region + family + customs but never touches the user's typed name.

**Name-required alert with scroll-into-view.** Once the auto-fill was removed, clicking Add (or Save Template / Save / Update) with an empty Distro Name needed to alert the user clearly. User caveat: *"on a smaller screen, they cannot see the 'alert' to fill in the name, so we need to make that more obvious."* Added a `nameInputRef` + on validation failure, the field error helper text appears AND the field smooth-scrolls into view (`block: "center"`) AND auto-focuses. The combination is unmissable regardless of viewport.

**Save / Update sub-dialog restyle.** When admin picks a template and clicks Save / Update, a sub-dialog opens with two choices (Save New Template / Update Existing). User wanted this to match the **original** AddDistroDialog style (the one I deleted in Session 2), specifically the small h6 title + close icon + radio group layout. Restyled accordingly — plain h6 title (not the large pink h4 from the editor itself), small close icon top-right, FormControl with FormLabel "Save Type" + radio group + a single "Save" action button. Earlier version had two action buttons (Save as New / Update Existing) directly in the footer; new design uses one radio + one Save.

User also asked to rename: **"Save as New Template"** → **"Save New Template"** (drop the "as"). Small wording change but consistent with how they spoke about it elsewhere.

**Keep editor open after save.** Previous behavior: clicking Save Template or Update Template would close the entire editor. User: *"rather than 'closing' the dialogue and parameters box, a notification should appear that the template has been saved and/or updated, and the dialogue box will still stay open—this will allow the admin to immediately use that template if they would like."*

Implementation: removed the `onClose()` calls from `persistAsNewTemplate` and `persistAsUpdatedTemplate`. The snackbar fires (already wired). The sub-dialog closes (`setUpdateChoiceOpen(false)`) but the main editor stays open. Save New Template additionally auto-selects the newly-created template in the dropdown so admin can immediately Add a distro from it.

The MUI Snackbar uses `zIndex.snackbar = 1400` which is above `zIndex.modal = 1300`, so the snackbar renders above the editor backdrop without any custom z-index work.

---

### 2026-04-29 — Session 4: Template name decouple + multi-select template delete + creatives stubs

**Wall-clock span:** ~13:00 → ~15:30. Commit: `a96f735` (14:08).

**Full Distro/Template name decouple.** User caught an issue I'd missed: the form had ONE name field that played dual purposes (Distro Name when adding distros, Template Name when saving templates). With the auto-fill removed in Session 3, this was now visibly confusing — users couldn't tell which name they were setting at any given moment. User: *"the 'template' and 'distro' names are totally separate."*

Major restructure: split the modal flow so the **save-template sub-dialog has its own Template Name input field**, separate from the editor's Distro Name field. New state in `TagEditorDialog`: `templateNameDraft` (string) + `templateNameError` (boolean). The Save / Update sub-dialog now contains its own TextField for Template Name. When the radio toggles between Save New / Update Existing, the field default updates: empty for new (admin types fresh), picked template's name for update (so they can keep it or rename in place).

Validation moved: Distro Name is required only for the **Add** action. Save Template / Save / Update validate the Template Name field instead. If the template-name field is empty when Save is clicked, that field gets the red border + helper text + scroll-into-view (same UX pattern as the distro name).

**Update Existing path — Autocomplete (`freeSolo`).** With the template-name input promoted to a dedicated field, the user wanted that field to also let admins **switch which template gets updated** without closing the modal: *"there should be a dropdown added to the 'update' modal that includes the 'current' name of a template/templates. It will default to the 'template' they're updating, and they can modify/change the name if they'd like. The idea being that they can modify any template from that view."*

Implemented as MUI `Autocomplete` with `freeSolo: true` and `options = state.templates`. Picking an existing template from the dropdown switches the update target (`updateTargetId` state) and syncs the name + advertiser fields to that template's saved values. Typing free text doesn't change the target — it just renames whatever's currently targeted. Helper text reads `Pick another template to update, or type to rename` so the dual behavior is discoverable.

**Multi-select Delete Templates dialog.** User: *"WHEN an Admin hits 'add' under the 'template selector' there should be a text-btn to 'delete' templates. IF the admin selects the 'delete' option, it'll open a panel with the current templates in the list, and the option to select them (via mui select/check box), and they can select any number of templates to 'delete' those templates."*

Added a small `Delete templates...` text button below the Tag Template dropdown (admin only, gray, understated). Clicking opens new `DeleteTemplatesDialog` component — a separate dialog with a scrollable List of every template (name + family) with a Checkbox per row. Multi-select. Bottom action shows live count: `Delete Selected (3)`. Clicking that fires a `window.confirm` (matching the distro-delete pattern: *"An alert similar to when deleting a distro should come up to confirm"*). On confirm, dispatches `deleteTemplates(ids)` (new reducer action).

**Built-in templates can be deleted too.** Previously, `mergeBuiltInTemplates` ran on every `loadFromStorage` and re-added any seed template that was missing from the stored set. This made admin deletions of NEXXEN-1, etc. seem to "stick" but reappear on refresh. Per the user's intent that admin actions should persist, removed `mergeBuiltInTemplates` entirely. New users (no localStorage) still get all six seeds via `initialState`; existing users keep whatever they've curated. If an admin nukes everything and wants the seeds back, they can clear `radius.adtags.v1` from devtools and refresh.

**Edge cases handled in the delete flow:**
- If the editor's currently-picked `templateId` is among the deleted set, clear it so the dropdown reverts to "Select Template (optional)". The form's other fields (params, region, etc.) stay as-is — admin's in-progress work isn't wiped.
- If the multi-select panel is empty, the Delete Selected button is disabled.

**Distros are decoupled from templates by design.** Verified at user request: deleting a template never affects existing distros. Each distro is a self-contained snapshot — `Distro.selectedParams`, `selectedCreativeParams`, `customKeyValues`, `family`, `region` are all stored on the distro itself at creation time. `Distro.templateId` is just an "originated from" tag; nothing in the app re-resolves it back to a Template at render time. Confirmed via grep that the only place `distro.templateId` is *written* is in `TagEditorDialog`'s submit (`templateId: templateId || "manual"`); it's never *read* by any render path.

**Two stub creatives.** User: *"Will you add 'two' fake creatives to the creative section? I just want it to look like a complete page."* Added Stratos_Hero_30s (Creative ID 8421, CTV, Active, 60%) and Stratos_Cutdown_15s (8422, Mobile, Active, 40%) to `CreativesStub.tsx`. Replaced the empty-state ("No creatives associated") with a populated table. Six columns: Name / Creative ID / Playback Mode / Status (green chip) / Weighting / Actions (`...` ellipsis). Matches the stub pattern in the Pixels section directly below.

**Misc UI cleanup.** User asked to drop the trailing "..." from the `Delete templates...` text button and capitalize to `Delete Templates`. Tiny change but the kind of polish that compounds. (The hero card's "Creative" field still showed "<no creative assigned>"; user flagged this in Session 5 and I updated to "2 assigned" to match the populated table.)

---

### 2026-04-30 → 2026-05-05 — Session 5: Manage Templates split + mutable catalog + final polish

**Wall-clock span:** Spread across several days; user away between working stretches. Commits: `12b4306` (05-05 15:04), `432898e` (05-05 15:31). The single biggest session by AI work; covered the largest architectural decision of the project.

**The "Manage Templates" architectural split.** User: *"I would essentially like to create a NEW button, that ONLY appears for Admin Users that is for 'Manage Templates'. This would live next to the 'add distro tag' button, and only appear for admins."*

The motivation: by Session 4 the `TagEditorDialog` had grown three modes (regular Add for users, Add for admins with Save/Update branching, Edit existing) plus the inline template-save sub-dialog. Admins saw a different version of the same dialog than reg users. The user wanted a clear separation of concerns: Add Distribution Tag is the same for everyone; Manage Templates is its own surface for the admin's template authoring + maintenance.

**Implementation — two dialogs instead of one mode-switched dialog:**

- **`TagEditorDialog` stripped down** to a role-agnostic distro editor. Removed the admin radio (`Choose Template` vs `Create New Template`), the Save Template / Save / Update buttons, the Save/Update sub-dialog with its name field, and the `Delete templates...` text button. Now it's just: Distro Name → Tag Template dropdown (autofills) → Region → Preview → NEXXEN/TTD tabs → Creative Params → Custom KV/Macro → Cancel/Add. The dropdown still filters by current advertiser scope.

- **New `ManageTemplatesDialog`** mounted from a new admin-only `Manage Templates` button next to `+ Add Distribution Tag` in `DistrosSection`. Template-focused: Template Name field at the top, Tag Template dropdown showing **every** template (no advertiser filter — admins manage across all advertisers), Advertiser dropdown, all the param sections (Nexxen/TTD/Creative + Custom KV/Macro). No Distro Name field anywhere. Footer: Cancel + Save New Template + (when a template is picked) Update.

The split also enabled per-flow visibility rules cleanly: **the main Add Distribution Tag dropdown filters by `CURRENT_ADVERTISER_ID = "advertiser-01"`** (configurable, but hardcoded in the prototype to mirror the line-item we're rendering); **Manage Templates dropdown shows everything** because admins routinely manage templates scoped to other advertisers.

**Advertiser scoping — new feature.** User: *"if the Admin selects a specific advertiser to associate with a new template, or when updating a template, then that template would ONLY be visible when a 'user/admin' are in a campaign set to a specific advertiser."* New optional `advertiserId?: string` field on `Template`. New `lib/advertisers.ts`: `CURRENT_ADVERTISER_ID` constant + `ADVERTISER_OPTIONS` array (`advertiser-01` through `advertiser-12`) + `isVisibleForCurrentAdvertiser(id)` helper. Save/Update modal got an Advertiser dropdown (None / advertiser-01..12). Templates without an advertiserId stay visible to all (unscoped); templates with one are hidden from the current advertiser unless they match.

Real-world semantic: in the full app this would resolve from the campaign hierarchy (campaign → segment → advertiser); for the prototype it's hardcoded.

**Mutable param catalog — major refactor.** User: *"The 'add (+) / Delete (trash can) / edit (pencil) icons in the 'admin' section should be functional. ... If the admin selects the 'add' option, then they can add new inputs in that section. If they hit 'edit' they can edit the pre-existing parameters in each specific section. The 'delete' will allow them to remove items from a parameters section."*

Up to this point the param catalog was static — three constants in `paramCatalog.ts` (`NEXXEN_PARAMS`, `TTD_PARAMS`, `CREATIVE_PARAMS`) imported by the components. Making them mutable required moving the catalog into `AppState`. Refactor:

- Added `ParamDef`, `ParamsCatalog`, `ParamFamilyKey` types in `types.ts`.
- Added `paramsCatalog: ParamsCatalog` field to `AppState`, seeded from the existing constants (renamed `SEED_NEXXEN_PARAMS` etc.).
- Added reducer actions `addParam`, `updateParam`, `deleteParam` (each takes `family: ParamFamilyKey + ParamDef | paramId`).
- localStorage migration: `loadFromStorage` falls back to `SEED_PARAMS_CATALOG` if the stored state lacks a `paramsCatalog` field.
- **Refactored `buildTagString` and `buildDistroUrl` to take `catalog` as an argument.** Threaded through every consumer: `TagEditorDialog`, `ManageTemplatesDialog`, `DistrosSection` (handleCopy + handleExport), `DistroTable` (per-row URL), `csvExport.ts` (downloadCsv signature). Required updating the type imports in each caller and grabbing `state.paramsCatalog` from `useApp()`.

This means edits to a param's output propagate everywhere a distro using it gets rendered — preview, table URL, copy clipboard, CSV export — in real time.

**Functional toolbar — `ParamCheckboxGroup` + `ManageParamsDialog`.** Initially I built three separate toolbar icons (`+` / trash / pencil) with three callback props (`onAddRequest`, `onDeleteRequest`, `onEditRequest`). User pushed back: *"lets combine them all, and just use 'edit' icon, and then that will reveal all the params within that section, and the 'trash can' icon will be there (like it is in the current build) that way the single action will allow the admin to 'delete, modify or add' vs. having to have all three icons for each section."* Consolidated to a single pencil icon per section header (admin only, opens `ManageParamsDialog`).

`ManageParamsDialog` is the all-in-one editor: opens for one family at a time (`nexxen` | `ttd` | `creative`). Lists every param for that family with two inline TextFields (Label + Output) + a per-row delete button. Edits commit on every keystroke (each keystroke dispatches `updateParam`). Below the list is a `+ Add Param` button that expands a row with empty Label + Output + an Add button. Deleting a param fires `window.confirm` first.

**Add → snap + notification.** User followed up after the catalog refactor landed: *"IF they actually add, can you ensure the window snaps to the new parameter after it is added"* and *"can you show a 'parameter added to ...' notification (similar to delete but ensure the parameter has been added)."*

Wired both:
- `lastRowRef` on the params list's last row + `pendingScrollId` state. On Add, set the scroll target → `useEffect` calls `scrollIntoView({ behavior: "smooth", block: "center" })` after the list re-renders with the new row.
- `onSaved?` callback prop on `ManageParamsDialog`, threaded through `ManageTemplatesDialog`'s own `onSaved` to `DistrosSection`'s snackbar. Fires `Added "<label>" to Nexxen Params` on add and `Removed "<label>" from Nexxen Params` on delete. Inline label/output edits stay silent (a snackbar per keystroke would be noise).

**Save / Update naming flow — separate Template Name input.** Earlier (Session 4) I'd put the template name in a TextField inside the sub-dialog. User confirmed that should remain the pattern: *"Save template - When they hit save, a modal should pop up asking to provide the 'template' name. Save/update template - When a user is creating a new template from an existing one, or updating an existing one, in the modal that pops up to have them choose new/update, the name fields for the 'template' should appear there."* The implementation in Session 4 already matched this; in Session 5 I confirmed the field auto-defaults based on the radio choice (empty for new; picked template's name for update — admin can rename in place).

**Drop the Delete Template footer button.** User: *"The 'delete' template can stay associated specifically with the 'delete templates' under the template selection dropdown functionality that already exists - remove it from the UI buttons from the bottom with 'save / update / cancel' – this will help clean that section up."* Removed `handleDeleteCurrent` and the conditional Delete Template button from the `ManageTemplatesDialog` footer. Bulk delete via the `Delete Templates...` link under the dropdown is the only delete affordance now (single-template delete is still possible inside the multi-select panel by checking just one row).

**Save vs Update visibility.** User restated the desired behavior: *"IF an admin uses the 'manage' function, and they do NOT select a pre-set template, then they will ONLY see 'save new template'. IF an admin uses the 'manage' function, and they DO select a pre-set template, then they will see both 'update' and 'save new'."* This was already the implementation — `Save New Template` always shows (when there's params to save); `Update` is conditionally rendered when `selectedTemplate` is non-null. Confirmed and moved on.

**Add toolbar to Creative Params** (was missing — only Nexxen/TTD had it before). One-line addition: passed the same `onEditRequest` prop down to the Creative Params group inside `ManageTemplatesDialog`.

**Misc late-session polish:**
- Removed the helper text *"Admins see every template here, regardless of advertiser scope."* from under the dropdown in Manage Templates. User: *"This line is unecessary to include under the 'template' dropdown."*
- Updated the Creative field on the hero card from "<no creative assigned>" to "2 assigned" to match the populated Creatives table.
- Stripped the `+ / trash / pencil` toolbar from the regular `+ Add Distribution Tag` editor (kept only in Manage Templates). User flagged: *"reg users will never modify those settings. Even if the admin is in that section, those should no longer be in the main 'add distro' section."*

**Time log + skill creation (housekeeping).** Toward the end of Session 5 the user asked for a time log similar to one they'd built for another project. Created `TIME_LOG.md` with per-session blocks anchored on git commit timestamps. First-cut estimate over-credited AI Work for sparse-commit days (one big commit covering hours of conversation iteration). User pushed back: *"You did not spend 4 straight hours on this project. We may have had the window going for up to 4 hours today, but active ai time was definitely not 4 total hours."* Recalibrated Session 5 from ~263m → ~117m. Then the user asked to apply the same logic to S1–S4 + create a skill that codifies the calibration. Recalibrated all sessions retroactively; total dropped from ~11h to ~6.5h AI Work. Skill landed at `.claude/skills/log-time/SKILL.md` with the density-aware reduction table (dense / moderate / sparse → 20–25% / 30–40% / 50–60% off raw wall-clock) and the prompting archetype methodology so future sessions stay consistent.

---

### 2026-05-06 — Session 6: Documentation + (name, advertiser) uniqueness validation

**Wall-clock span:** Afternoon, sparse-commit (one push at end of day). Commit: `82c50a5` (15:xx).

**`SESSION_LOG.md` introduced.** User asked for a narrative companion to `TIME_LOG.md` so future sessions or a fresh project starting from this one's state has the human-side context — which decisions were debated, what trade-offs got weighed, what user-verbatim framing drove each major call. Modeled on the user's sample SESSION_LOG from another project. The doc lives at the project root, mirrors `TIME_LOG.md`'s session boundaries, and includes Future Considerations / Open Threads / Process Commitments sections plus a chronological commit reference table.

**`(name, advertiser)` uniqueness validation in Manage Templates.** User: *"IF an Admin selects a template, and then is trying to 'save a new template' rather than 'updating' that particular template, then the Admin must provide a slightly different name. We would not want the users to see two of any template with the same name, as then it would be difficult to know which is which."* With a clarification: same name + different advertiser is fine because the dropdown renders "name — advertiser-XX", which differentiates them visually.

The rule is uniqueness on the **(name, advertiserId) tuple**, not just name. Implementation:

- Renamed the field-error state from boolean `nameError` to string `nameErrorMessage` so the helper text can be context-aware (different messages for "required" vs. "duplicate detected").
- Added `findNameConflict(excludeId?)` which scans `state.templates` for any entry whose `(name, advertiserId)` matches the form's current values (case-insensitive, trim-aware, treating `undefined` and `""` advertiserId as equal).
- Added `conflictMessage(conflict)` which returns a sentence explaining the existing template's advertiser scope and suggesting both resolutions: rename (e.g. `template-01` → `template-01b`) or pick a different advertiser.
- `handleSaveNew` calls `findNameConflict()` (no exclude — any match is a conflict, since this is a new template).
- `handleUpdate` calls `findNameConflict(selectedTemplate.id)` — excludes the template currently being updated, since updating a template to its own values is a no-op, not a conflict. Renaming/rescoping into another template's tuple does still get blocked.
- Error clears on either name OR advertiser change (since either could resolve the conflict).
- On block, the field gets the same scroll-into-view + auto-focus treatment as the empty-name validator — unmissable on shorter viewports.

**Push** (`82c50a5`). Single commit covering: TIME_LOG.md (new), SESSION_LOG.md (new), `.claude/skills/log-time/SKILL.md` (new), `ManageTemplatesDialog.tsx` (uniqueness validation). All four artifacts served the same theme — durable engineering documentation + hardening of an existing flow before declaring "good for now."

**Closing observation.** User flagged this as a stopping point: *"Okay. This should be good for now."* The prototype is feature-complete relative to the original brief: distros workflow + admin templates + advertiser scoping + mutable catalog + delete affordances + uniqueness guarantees. The doc artifacts (TIME_LOG / SESSION_LOG / log-time skill) make this state easy to resume from later or hand off cleanly to another developer or AI tool. If a future iteration begins here, this doc + the skill at `.claude/skills/log-time/` are the entry points for context.

---

### 2026-05-12 — Session 7: Mutable region catalog

**Commit:** `c8978a8` (12:10).

**Regions became mutable admin state.** Until now the region radio (US-East-1 /
Australia / Europe) was static metadata. The user wanted admins to manage regions the
same way they manage params — so region moved into `AppState` as `{ name, baseUrl }`
per region, with a `ManageRegionsDialog` (Add / edit / delete) reached via the same
admin pencil pattern, and a `migrateEntityRegion` migration in `loadFromStorage` for
existing saves. This is small on its own but it **cemented the "mutable seeded
catalog" pattern** — seed constant → state array → reducer CRUD → localStorage
migration — that every later catalog (transcode presets especially) reuses.
`ManageRegionsDialog` is now the canonical small-dialog example cited in
[`../CLAUDE.md`](../CLAUDE.md).

---

### 2026-07-15 — Session 8: The pivot — Push, Transcode Status, transcoding presets, design sweep

**Commits:** `b74e481` (15:43, the big checkpoint), `2d8dec4` (15:46).

This is where the project's second chapter opens. The user came back wanting two new
capabilities layered onto the tag tool, plus a consistency sweep. `b74e481` is a large
checkpoint commit; the narrative below is reconstructed from it, the follow-ups, and
the end-state captured in [`../CLAUDE.md`](../CLAUDE.md).

**"Platform," not "DSP."** When naming the push-target concept, the user deliberately
chose **Platform** over DSP: today a target is a DSP (Nexxen, The Trade Desk), but the
naming has to span **SSPs** too when they arrive. Codified in CLAUDE.md so nobody
narrows it back to "DSP" later. Also renamed *Export distribution tags* → **Export
Tags**.

**Distro Transcode Status + restart.** Introduced the status lifecycle the backend
will eventually own: `default` (green ring), `live` (green), `processing` (amber),
`error` (red), `outOfSpec` (orange), `inactive` (grey). Two visual-design calls the
user drove: **out-of-spec is orange, not red** — it's a *config* problem, not a *run*
failure, and must read differently from Error; and **`default` (green ring) vs `live`
(solid green)** are told apart by ring-vs-fill, not hue, so the label can never be
dropped. "cold" was renamed **inactive**. Restart is valid only from `inactive` and
`error` (never re-run overridden settings that produced `outOfSpec`).

**Transcoding presets + admin CRUD.** A per-line-item settings sheet (`TRANSCODE_FIELDS`,
mirroring a publisher delivery spec) with presets that are **publisher** specs — Hulu
from a real sheet the user supplied, the rest illustrative and marked as such. DSPs are
push targets, *not* transcode presets. Presets are mutable admin state
(`SEED_TRANSCODE_PRESETS`), following the Session-7 catalog pattern; the `default`
baseline is protected.

**Admin entry points moved into modals (`2d8dec4`).** The user rejected top-level admin
buttons in favor of a **pencil next to the relevant dropdown inside a modal**. Template
management moved from a header button to a pencil in the Tag Editor; preset management
is a pencil in Transcoding Settings. This is now a hard convention in CLAUDE.md — new
admin catalog managers hang off a dropdown pencil, never a Distributions-header button.

**Dialog design sweep.** A consistency pass over dialogs: shared `DialogHeader`
(primary/sub tiers), the promise-based `useConfirm`/`ConfirmDialog` (no
`window.confirm` — it breaks the dark theme), `sx`-only styling with theme tokens, no
hardcoded hex. These rules are the "Conventions" section of CLAUDE.md.

---

### 2026-07-27 → 07-28 — Session 9: Platform Status column + split hand-off docs

**Commits:** `f21c062` (07-27 12:54), `958370e` (07-28 09:23), `ba869a7` (07-28 09:24).

**A second, independent status column.** The push lifecycle got its own column —
`Platform Status` (`notPushed` grey-ring, `pushing` amber, `success` green, `error`
red, later `inactive`) — rendered by the same shared `StatusChip` as Transcode Status.
The first column was renamed **Transcode Status** so the two read as distinct
lifecycles: a tag can be Live but never pushed, or pushed and rejected. Added the
per-distro push selection and the dependent **Platform → Advertiser** dropdowns
(advertisers are platform-scoped, so Platform must be chosen first).

**Hand-off docs, split by feature.** The user wanted shareable overviews for team
review / a job ticket, kept as **living documents**: `docs/handoff-transcoding.md` and
`docs/handoff-3rd-party-push.md`, plus an index `docs/README.md`. Each doc is
self-contained (behavior → status states → prototype-vs-production → open questions →
walkthrough → limitations) with its own dated Changelog. Visual (Artifact) versions
came later — see [`RESUME.md`](docs/RESUME.md) for their URLs and ownership caveat.

---

### 2026-07-30 → 07-31 — Session 10: Push model settled + multi-preset transcoding + incremental apply

**Commits:** `0cad697` (07-30 15:42), `24cc1ce` (07-30 22:25), `14ccc47` (07-31 12:45).

**The push UI model settled on "platform drives selection" (`0cad697`).** A tag is
built for one platform (its `family`) and can only be pushed there. After trying a
**bidirectional lock** (selecting tags narrowed the platform picker), the user landed
on the cleaner model: the platform picker always lists every platform, and **choosing a
platform auto-selects that platform's tags** (disabling the rest). Switch platform →
selection swaps. Also added **Add + Push** in the tag editor (create a tag and open push
pre-scoped). This decision is important enough that it's saved to Claude memory
(`push-multi-platform-ui-open.md`): *don't reintroduce the bidirectional lock.*

**Multiple presets per line-item (`24cc1ce`).** The biggest data-model change of the
chapter: a line-item now applies a **list** of presets, and every distro is transcoded
**once per preset**. `Distro.status` (single) became `Distro.transcodes:
{presetId, status}[]`, with a migration. The Transcode Status column shows a **stack of
chips**, one per preset (e.g. `Live: Hulu (Disney)` over `Out of Spec: Netflix`). The
modal became collapsible preset rows with **+ Add Preset** (inserts at top + scrolls to
it), hairline dividers instead of boxed cards, and a muted "not-active" styling for a
row still on the Default baseline. Deleting the last preset confirms → resets to Default.

**Incremental apply + advertiser name/ID (`14ccc47`).** Applying now reprocesses **only
new or changed presets** — an unchanged preset keeps each distro's current status; a
newly added or edited preset goes Processing → its landing status. So adding "Netflix"
to an already-applied "Hulu, ABC, Peacock" reprocesses only Netflix. Advertisers now
display as **name + ID** (`Advertiser 3 · 012345`).

---

### 2026-08-03 — Session 11: Link/unlink, advertiser lock, confirmations

**Commits:** `83a614f` (14:04), `bf97c74` (15:21), `666e177` (15:45), `6e0e618` (15:56).

**Link/unlink as a first-class row action (`83a614f`).** Unlinking a pushed tag sets
Platform Status to **Inactive** (keeping the target, so the chip reads `Inactive:
Nexxen`); re-linking restores **Success**. The toggle was promoted out of the `⋯` menu
to an **exposed row icon** (MUI `Link` / `LinkOff`) right of the restart icon. Icon
orientation was initially backwards; the user's rule: **Success → link-on**, **Error /
Inactive → link-off**. Also added **Save + Push** in *edit* mode, closing the gap where
a tag added-without-pushing had no easy per-tag push later.

**Sticky, then locked, advertiser (`bf97c74`).** First the advertiser became sticky per
platform (remember the last one). Then the user asked to truly **lock** it: *"nexxen
could never have more than one advertiser association per line item."* One advertiser
per platform per line-item; the first push sets it, later pushes reuse it. Rationale:
backend platform+advertiser linking is non-trivial, so it shouldn't churn. Same commit
added **confirmations** before restart, re-link, **and** unlink — with the user's
explicit steer to keep the wording **generic**, not per-platform-dynamic (*"all warning
dialogues would have to be dynamic and match with each platform — that is
overcomplicated"*).

**Fully-disabled locked advertiser (`666e177`).** A refinement the user noticed later:
read-only wasn't enough — the locked advertiser field is now **disabled** (greyed,
un-focusable), with a MUI `LockOutlined` icon at its right edge and a tooltip directing
the user to **contact support** to change it. Makes clear it's a support operation, not
a self-serve control. (The user specifically verified the icon was a genuine MUI icon.)

**Removed the redundant Transcoding subheading (`6e0e618`).** The Distributions section
title carried a `Transcoding: <presets>` subtitle echoing the line-item plan. Redundant
now that each distro's Transcode Status column shows a chip per preset — so the
subheading (and the section's only subtitle) was removed.

---

### 2026-08-13 — Session 12: Continuity hand-off for the Claude-account switch

**Commit:** doc-only (this entry, `RESUME.md`, and the log updates).

The user is **migrating from a personal Claude connection to a Team account** and wanted
to guarantee that the repo, commit settings, and full project context survive the switch
with nothing lost when future work resumes under the new client.

- **`docs/RESUME.md` created** — the single pick-up entry point: what transfers across a
  Claude-account switch and what doesn't (repo/git = on-disk, transfers automatically;
  chat history = does not; Artifacts = owned by the old account, must be republished;
  file-memory = machine-local), plus repo settings, run/typecheck/reset commands, and
  current state + next steps.
- **`SESSION_LOG.md` + `TIME_LOG.md` brought current** — this whole second chapter
  (Sessions 7–12, commits `c8978a8`…`6e0e618`) had never been logged; the last entry was
  Session 6 on the old repo. Commit reference table extended to all 25 commits.
- **Hand-off Artifacts** — earlier in the run, the two visual hand-off pages were
  enhanced with UI-mockup "storyboards" and realigned to the **real dark-app palette**
  (bare `StatusChip` dots not pills, the actual five-column table, MUI outlined fields,
  the disabled+lock advertiser field). They remain owned by the old account; RESUME.md
  documents rebuilding them under the new one.

**Why it matters:** this session produced no feature code — it's the bridge that makes
the account switch safe. If you're reading this as the first session under the new
account: [`docs/RESUME.md`](docs/RESUME.md) is your starting point.

---

## Future considerations

These are user-flagged items or implementation seams that are **not** part of the current build but that the structure should accommodate cleanly when they come up.

### Real backend integration
- `localStorage` persistence + hardcoded `CURRENT_ADVERTISER_ID` are prototype-only. A real deployment would resolve advertiser from the campaign hierarchy and persist via API.
- `AppContext`'s reducer-based state is server-replaceable: the dispatch boundary is the natural place to add API calls.

### Param catalog scope
- The mutable catalog lives in `AppState` and persists per-browser via localStorage. In a real backend, this would be server-side and shared across users. Admin edits would need an API + permission check.
- Catalog mutations affect existing distros silently — if admin deletes "Weather_Alpha" from Nexxen, distros that had it selected just stop emitting that output. Acceptable for a prototype demo but worth flagging as a decision point for production semantics (block delete if referenced? preserve outputs on the distro itself? snapshot at distro creation?).

### Additional advertiser scopes
- Hardcoded `advertiser-01` through `advertiser-12`. Real config would come from the advertiser registry.
- Templates filter on a single `advertiserId` — multi-advertiser templates aren't supported. Could extend to `advertiserIds: string[]` with a multi-select if needed.

### Creative section is read-only stub
- Two hardcoded creatives, no add/edit/delete. The `+ Add Creative` button is a no-op. A real implementation would mirror the distro pattern (table + dialog + state in AppContext).

### Pixels section is read-only stub
- Same as Creatives — three hardcoded rows, all action buttons are no-ops.

### Distro row "More actions" menu — three dead items
- `Edit Tag` and `Delete Tag` are functional. `Launch Test Page`, `Launch Test Page (3rd Party Tag)`, and `View Report` are deliberately dead per user spec: *"those elements do not need to change. The others should do normal selection actions as far as hover/etc, but should be dead for the purposes of this demo since I do not have the specific actions/data to provide."*

### Auth / role gating
- Role toggle in the header is prototype-scaffolding (`Admin` ↔ `User`). A real rollout would gate the Admin role behind real auth (Cognito-style). The role state is centrally tracked in `AppContext.state.role`, so swapping the source from header-toggle to auth-token is a one-place change.

---

## Open threads

Items I noticed and flagged but haven't acted on. Pick them up when they become relevant.

- **`AppBundle` vs `app_bundle` mapping is a guess.** I mapped `AppBundle` to `&app={{APP_NAME}}` (the only remaining unmapped Nexxen output substring), but the user wasn't 100% sure about the distinction either. If the real backend disagrees, both definitions live in the param catalog (now in seed data + mutable in state) and can be edited via the Manage Templates → Nexxen Params → pencil flow at runtime, or by editing `paramCatalog.ts` directly.

- **No tests.** Project has no Vitest scaffold, no Playwright, no CI workflow. For a designer-driven prototype that's fine; if the project graduates to production, the line-item-multi-creative project's test net is a reasonable model (Vitest + Playwright golden path + GitHub Actions).

- **No README.md.** The project root has no `README.md`. The `_Code-Reference/` and `_Image-Reference/` folders are the de facto source of design intent; this `SESSION_LOG.md` + `TIME_LOG.md` are the engineering-side artifacts.

- **Param catalog edits are immediate (per-keystroke commit).** Inline editing in `ManageParamsDialog` dispatches `updateParam` on every keystroke. For a prototype this is fine and gives visible-live feedback in the preview. If admins start using it in earnest they may want a "save changes" confirmation step instead — easy to add (collect drafts → commit on Done).

- **PAT push hygiene.** Every push in this project used a temporary PAT inline in the URL (never written to `.git/config`, verified clean after each push). Tokens shared in chat were revoked by the user after each session. If this project moves to a long-running CI pipeline, the GitHub Actions workflow file pattern (vault-stored token, never in chat history) is the next step.

- **No demo recording.** User asked at one point about generating a demo video walkthrough; we discussed Playwright auto-recording vs. a written walkthrough script + Loom recording. They opted to record manually, but no `_progress-demo/` script exists yet. If a stakeholder demo is needed, the structure is: open in role=User, walk through Add Distribution Tag with a template, show the table populate, copy a row, export CSV; switch to role=Admin, walk through Manage Templates (Save New Template + Update + Delete + the param toolbar + advertiser scoping); back to role=User to confirm advertiser filtering hides scoped templates.

---

## Process commitments

- **Time logging:** I update `TIME_LOG.md` on user request or after meaningful work blocks. Methodology codified at `.claude/skills/log-time/SKILL.md`.
- **Pushes:** never auto-pushed. Always wait for explicit user authorization + a temporary PAT. PAT is used inline in the URL only (never saved to git config). After every push, verify `.git/config` is clean and remind the user to revoke the token.
- **Asset hygiene:** `node_modules/`, `dist/`, `.vite/`, `*.tsbuildinfo`, `.DS_Store` always gitignored.
- **Port hygiene** (memory rule): always check `lsof -i :PORT` before starting `npm run dev`. The dev server is hardcoded to port 5174 (`vite --port 5174 --strictPort`) so collisions fail loudly rather than silently jumping ports.
- **Plan-mode discipline:** for any non-trivial task (new feature, major refactor, scope question) draft a plan first; for minor edits and bug fixes, just do them.

---

## Commit reference (chronological)

All commits on `main`, since project start.

| # | Hash | Date | Title |
|---:|---|---|---|
| 1 | `266bb44` | 04-25 16:07 | Initial commit (auto-generated README from GitHub) |
| 2 | `fe3a985` | 04-25 16:10 | Initial commit: Ad Tag Export Management prototype |
| 3 | `6488ccb` | 04-27 15:09 | Unify add/edit/template flows into single TagEditorDialog |
| 4 | `65bf264` | 04-27 15:30 | Disable Update Template until form diverges from template |
| 5 | `6b86904` | 04-27 16:13 | Replace NUL separator with JSON.stringify in KV comparison |
| 6 | `92b362c` | 04-28 13:57 | Refine admin save flow and surface name-required alert |
| 7 | `5ac6090` | 04-28 14:50 | Keep editor open after Save Template / Update Template |
| 8 | `a96f735` | 04-29 14:08 | Decouple template name from distro name; add template delete + creatives |
| 9 | `12b4306` | 05-05 15:04 | Split admin template management into dedicated dialog; mutable param catalog |
| 10 | `432898e` | 05-05 15:31 | Notify and auto-scroll on param add/remove in ManageParamsDialog |
| 11 | `82c50a5` | 05-06       | Enforce (name, advertiser) uniqueness on templates; add TIME_LOG / SESSION_LOG / log-time skill |
| 12 | `de5a1f7` | 05-06 12:12 | TIME_LOG + SESSION_LOG: append Session 6 entries |
| 13 | `c8978a8` | 05-12 12:10 | Mutable region catalog (name + baseUrl per region, admin CRUD) |
| 14 | `b74e481` | 07-15 15:43 | Checkpoint: push-to-platform, distro status + restart, transcoding presets/admin CRUD, dialog design sweep |
| 15 | `2d8dec4` | 07-15 15:46 | Move admin template management from header button to in-modal edit icon |
| 16 | `f21c062` | 07-27 12:54 | Add Platform Status column and per-distro push selection |
| 17 | `958370e` | 07-28 09:23 | docs: add split hand-off overviews (Transcoding, 3rd-Party Push) |
| 18 | `ba869a7` | 07-28 09:24 | docs: add index README linking the two hand-off overviews |
| 19 | `0cad697` | 07-30 15:42 | 3rd-Party Push: family→platform lock, Add + Push, platform-drives-selection |
| 20 | `24cc1ce` | 07-30 22:25 | Transcoding: apply multiple presets per line-item, status per preset |
| 21 | `14ccc47` | 07-31 12:45 | Incremental transcode apply + advertiser name/ID |
| 22 | `83a614f` | 08-03 14:04 | Push: link/unlink row icon + Inactive status + Save + Push in edit mode |
| 23 | `bf97c74` | 08-03 15:21 | 3rd-Party Push: lock advertiser per platform + confirm link/unlink |
| 24 | `666e177` | 08-03 15:45 | 3rd-Party Push: fully disable locked advertiser with lock icon + support tooltip |
| 25 | `6e0e618` | 08-03 15:56 | Distributions: remove redundant transcoding subheading |

> Active work moved to the new repo (`Tag-Distribution_3rdPartyPush-Transcoding_v1`)
> around the hand-off-docs commits (07-28); the history above is continuous and lives
> in full on both remotes' shared ancestry. See [`docs/RESUME.md`](docs/RESUME.md).

---

## How this doc gets updated

I append to this doc when the user asks for a checkpoint or after a significant session of work. If a session crosses a major architectural decision or has a notable user observation, the relevant section gets a paragraph capturing the *why*. The commit reference table grows monotonically.

If this doc and the git log disagree, the git log is authoritative for the technical record. This doc is the *connective tissue* — it explains the human side of decisions that the commits only describe technically.
