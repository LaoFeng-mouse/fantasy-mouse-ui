# Fantasy Mouse UI v0.2.0 Benchmarks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce four genuinely different Strict-mode benchmark cases with editable source, real outputs, working primary journeys, screenshots, derivation records, and visual QA evidence.

**Architecture:** A root benchmark manifest and zero-dependency validator enforce a shared evidence contract. Signal Harbor and Fieldnote Festival are standalone browser applications, Archive Lantern is a PowerShell/WPF desktop application, and Grid Forward 2030 is an editable PowerPoint built with `@oai/artifact-tool`; all generated mouse visuals are raster assets grounded in the four canonical references.

**Tech Stack:** HTML/CSS/JavaScript, Node.js ESM, Vitest, Playwright CLI, PowerShell 7/WPF, `@oai/artifact-tool`, bundled presentation renderers, FFmpeg only where capture conversion is needed.

---

## File map

- Create `examples/README.md`: benchmark navigation and evidence definitions.
- Create `examples/benchmark.json`: ordered case inventory and required surface/mode.
- Create `examples/evidence.schema.json`: QA evidence contract.
- Create `scripts/validate-examples.mjs`: root-only validator; never packaged in the plugin ZIP.
- Create `tests/plugin/examples-contract.test.ts`: manifest, file, evidence, and ZIP-exclusion tests.
- Create `tests/plugin/examples-runtime.test.ts`: pure browser state and WPF smoke-contract tests.
- Create four directories under `examples/`: `signal-harbor`, `fieldnote-festival`, `grid-forward-2030`, and `archive-lantern`.
- Modify `package.json`: add `examples:verify` without changing `test` scope.

### Task 1: Establish the benchmark and evidence contract

**Files:**
- Create: `examples/README.md`
- Create: `examples/benchmark.json`
- Create: `examples/evidence.schema.json`
- Create: `scripts/validate-examples.mjs`
- Create: `tests/plugin/examples-contract.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing inventory test**

```ts
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("v0.2 benchmark contract", () => {
  it("lists four Strict cases in README order", async () => {
    const manifest = JSON.parse(await readFile("examples/benchmark.json", "utf8"));
    expect(manifest).toEqual({
      schemaVersion: 1,
      cases: [
        { id: "signal-harbor", surface: "saas-dashboard", mode: "strict" },
        { id: "fieldnote-festival", surface: "website", mode: "strict" },
        { id: "grid-forward-2030", surface: "presentation", mode: "strict" },
        { id: "archive-lantern", surface: "desktop", mode: "strict" }
      ]
    });
  });

  it("reports the four cases as pending before artifacts are built", async () => {
    const result = await execFileAsync(process.execPath, ["scripts/validate-examples.mjs", "--allow-pending"]);
    expect(JSON.parse(result.stdout)).toEqual({ ok: true, cases: 4, accepted: 0, pending: 4 });
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm vitest run tests/plugin/examples-contract.test.ts`

Expected: FAIL with `ENOENT` for `examples/benchmark.json`.

- [ ] **Step 3: Add the root manifest and evidence schema**

The evidence schema must require:

```json
{
  "schemaVersion": 1,
  "caseId": "lower-kebab-case",
  "mode": "strict",
  "gates": {
    "generated": false,
    "tested": false,
    "run": false,
    "rendered": false,
    "visuallyChecked": false,
    "accepted": false
  },
  "primaryJourney": { "steps": [], "result": "pending" },
  "accessibility": { "keyboard": "pending", "contrast": "pending", "reducedMotion": "pending" },
  "comparison": { "status": "pending", "repeatedDimensions": [], "repairs": [] },
  "artifacts": { "source": [], "output": [], "screenshots": [], "comparison": "" },
  "limits": []
}
```

Constrain statuses to `pending|passed|failed|unavailable`, reject unknown keys, and require `accepted: true` only when every preceding gate is true and journey result is `passed`.

- [ ] **Step 4: Implement the validator**

For each accepted manifest case, require exactly:

```text
README.md
prompt.md
workflow-brief.json
mode.json
character-role.md
product-style.md
source/
output/
screenshots/
evidence/qa.json
evidence/comparison.png
```

Validate `workflow-brief.json` by invoking the plugin's `validate-workflow.mjs`, require `mode.json` to resolve to Strict with `public-benchmark`, reject symlinks/reparse points and empty files, and verify every evidence artifact path stays inside its case directory. With `--allow-pending`, permit missing source/output/screenshot/comparison artifacts only while `accepted` is false; without that flag, any pending case exits 1 with `benchmark-not-accepted`.

- [ ] **Step 5: Add the package script**

Add:

```json
"examples:verify": "node scripts/validate-examples.mjs"
```

- [ ] **Step 6: Create four case metadata sets with pending evidence**

Create `README.md`, `prompt.md`, `workflow-brief.json`, `mode.json`, `character-role.md`, `product-style.md`, and `evidence/qa.json` for every case. Use the concrete journeys and product evidence from Tasks 2–5, but keep every gate false/pending. Do not create fake comparison PNGs or fake outputs. The `--allow-pending` test must pass, while `pnpm examples:verify` must exit 1 with `benchmark-not-accepted`.

- [ ] **Step 7: Commit the benchmark contract**

```powershell
git add examples scripts/validate-examples.mjs tests/plugin/examples-contract.test.ts package.json
git commit -m "test: define v0.2 benchmark evidence contract"
```

### Task 2: Build and accept Signal Harbor

**Files:**
- Create: `examples/signal-harbor/source/index.html`
- Create: `examples/signal-harbor/source/styles.css`
- Create: `examples/signal-harbor/source/state.mjs`
- Create: `examples/signal-harbor/source/app.mjs`
- Create: `examples/signal-harbor/source/assets/*.png`
- Create: matching runnable files under `examples/signal-harbor/output/`
- Modify: all required metadata and evidence files in `examples/signal-harbor/`
- Modify: `tests/plugin/examples-runtime.test.ts`

- [ ] **Step 1: Finalize the Strict brief and derivation artifacts**

The primary journey is:

```text
monitoring -> incident-selected -> assigning -> assigned -> resolving -> resolved
```

Include blocked assignment, failed resolution, retry, keyboard navigation, visible focus, status announcements, and reduced motion. The mouse role is `incident-dispatcher`; action mode appears only while assigning/resolving and removes the chest V/U.

- [ ] **Step 2: Generate product-specific mouse raster assets**

Use the `imagegen` skill after viewing the four authorities together. Generate a dispatcher idle state and one coherent action-hand state. Do not derive the dark dashboard palette, layout, or components from the character references. Save approved PNGs under `source/assets/` and record prompts and repair notes in the case README.

- [ ] **Step 3: Write the failing reducer tests**

```ts
import { initialSignalState, reduceSignal } from "../../examples/signal-harbor/source/state.mjs";

it("completes the incident assignment and resolution journey", () => {
  let state = initialSignalState();
  state = reduceSignal(state, { type: "select", incidentId: "INC-2048" });
  state = reduceSignal(state, { type: "assign", owner: "Mina Chen" });
  state = reduceSignal(state, { type: "resolve", note: "Queue restored and checks passed" });
  expect(state).toMatchObject({ phase: "resolved", owner: "Mina Chen", liveRegion: "Incident INC-2048 resolved" });
});

it("keeps blocked assignment recoverable", () => {
  const state = reduceSignal(initialSignalState(), { type: "assign", owner: "" });
  expect(state).toMatchObject({ phase: "blocked", error: "Choose an owner before assigning" });
});
```

- [ ] **Step 4: Run tests and verify failure**

Run: `pnpm vitest run tests/plugin/examples-runtime.test.ts`

Expected: FAIL because `state.mjs` has no implementation.

- [ ] **Step 5: Implement the pure state model and browser UI**

Export `initialSignalState()` and `reduceSignal(state, event)` with this public state boundary:

```js
export const initialSignalState = () => ({
  phase: "monitoring", incidentId: null, owner: "", note: "",
  error: null, liveRegion: "Monitoring 12 active incidents"
});

export function reduceSignal(state, event) {
  switch (event.type) {
    case "select": return { ...state, phase: "incident-selected", incidentId: event.incidentId, error: null };
    case "assign": return event.owner.trim()
      ? { ...state, phase: "assigned", owner: event.owner.trim(), error: null, liveRegion: `Incident ${state.incidentId} assigned to ${event.owner.trim()}` }
      : { ...state, phase: "blocked", error: "Choose an owner before assigning" };
    case "resolve": return event.note.trim()
      ? { ...state, phase: "resolved", note: event.note.trim(), error: null, liveRegion: `Incident ${state.incidentId} resolved` }
      : { ...state, phase: "failed-resolution", error: "Add a resolution note before resolving" };
    case "retry": return { ...state, phase: state.incidentId ? "incident-selected" : "monitoring", error: null };
    default: throw new Error(`unknown-signal-event:${event.type}`);
  }
}
```

Bind semantic buttons, incident rows, owner input, resolution note, retry, an `aria-live="polite"` region, and deterministic post-action focus in `app.mjs`. Use a dark dense layout justified by incident monitoring, not by bundled compositions.

- [ ] **Step 6: Build the runnable output**

Copy only the four source runtime files and approved assets into `output/`; do not copy design notes or evidence. Serve with a local static server.

- [ ] **Step 7: Exercise the real browser journey**

Use the Playwright skill wrapper. Snapshot before every referenced interaction, complete the happy path, trigger blocked assignment and failed resolution, retry, test keyboard focus, and capture intended 1440×900 screenshots under `screenshots/`.

- [ ] **Step 8: Create and inspect the same-context comparison**

Build a local HTML comparison containing canonical identity, approved action hands, one composition reference, and the rendered dashboard screenshot. Capture it as `evidence/comparison.png` and inspect at original size. Repair identity, hands, crop, hierarchy, contrast, focus, or leakage defects before setting evidence true.

- [ ] **Step 9: Mark evidence accepted and commit**

Run `node scripts/validate-examples.mjs --allow-pending`; it should report one accepted case and three pending cases. `pnpm examples:verify` must still exit 1. Commit:

```powershell
git add examples/signal-harbor tests/plugin/examples-runtime.test.ts
git commit -m "feat: add Signal Harbor benchmark"
```

### Task 3: Build and accept Fieldnote Festival

**Files:**
- Create: `examples/fieldnote-festival/source/index.html`
- Create: `examples/fieldnote-festival/source/styles.css`
- Create: `examples/fieldnote-festival/source/state.mjs`
- Create: `examples/fieldnote-festival/source/app.mjs`
- Create: `examples/fieldnote-festival/source/assets/*.png`
- Create: matching runnable files under `examples/fieldnote-festival/output/`
- Modify: required metadata/evidence files and `tests/plugin/examples-runtime.test.ts`

- [ ] **Step 1: Finalize the Strict brief and derivations**

Primary journey:

```text
browse-program -> filter-day -> inspect-session -> add-to-plan -> resolve-time-conflict -> saved-plan
```

Use an organic editorial layout justified by a regional botany event. The mouse is a field guide embedded in editorial content and an empty-plan state, not persistent navigation chrome.

- [ ] **Step 2: Generate the field-guide raster assets**

Use `imagegen` with the canonical authorities. Create one default-clasped guide and one action-hand specimen-note pose; use exactly one hand pair. Save source prompts and repair notes.

- [ ] **Step 3: Add failing state tests**

```ts
import { initialFestivalState, reduceFestival } from "../../examples/fieldnote-festival/source/state.mjs";

it("builds a visit plan and resolves a time conflict", () => {
  let state = initialFestivalState();
  state = reduceFestival(state, { type: "filter-day", day: "saturday" });
  state = reduceFestival(state, { type: "add", sessionId: "fern-walk" });
  state = reduceFestival(state, { type: "add", sessionId: "seed-library" });
  expect(state.phase).toBe("conflict");
  state = reduceFestival(state, { type: "replace", removeId: "fern-walk", addId: "seed-library" });
  expect(state).toMatchObject({ phase: "saved", plan: ["seed-library"] });
});
```

- [ ] **Step 4: Implement, run, and capture**

Implement `initialFestivalState()` as `{ phase: "browse-program", day: "all", selectedId: null, plan: [], pendingId: null, liveRegion: "" }`. `reduceFestival` must handle `filter-day`, `inspect`, `add`, `replace`, `remove`, and `close-dialog`; `add` places a clashing session in `pendingId` without mutating `plan`, and `replace` atomically removes `removeId`, adds `addId`, clears `pendingId`, and announces the saved plan. Unknown events throw `unknown-festival-event:<type>`.

Bind semantic filters, session detail, plan drawer, an accessible conflict dialog with focus return, replacement, empty state, and saved confirmation. Use Playwright CLI to exercise mouse and keyboard paths at desktop and 390px mobile widths. Capture hero, session detail, conflict, and saved-plan screenshots.

- [ ] **Step 5: Compare and repair**

Create `evidence/comparison.png` with the required four visual inputs. Compare this case against Signal Harbor for skeleton, character placement, palette, material, edge system, titles, components, decoration, and interaction arrangement. Record repeated dimensions and evidence-backed justifications; repair three or more unjustified repeats.

- [ ] **Step 6: Mark accepted and commit**

```powershell
git add examples/fieldnote-festival tests/plugin/examples-runtime.test.ts
git commit -m "feat: add Fieldnote Festival benchmark"
```

### Task 4: Build and accept Grid Forward 2030

**Files:**
- Create: `examples/grid-forward-2030/source/build-deck.mjs`
- Create: `examples/grid-forward-2030/source/assets/*.png`
- Create: `examples/grid-forward-2030/output/Grid-Forward-2030.pptx`
- Create: rendered slides under `examples/grid-forward-2030/screenshots/`
- Modify: required metadata and evidence files.

- [ ] **Step 1: Define the communication job and slide sequence**

Use this communication job:

```text
By the end, a fictional regional-grid steering committee should approve a staged 2030 modernization portfolio because the illustrative scenario shows reliability gains require sequencing visibility, flexibility, and resilience investments together.
```

Use eight slides: title; decision; illustrative demand/reliability gap; three priorities; portfolio choices; phased roadmap; risks/mitigations; approval and next actions. Label all figures `Illustrative planning scenario — not a forecast` and do not present invented claims as external facts.

- [ ] **Step 2: Set up the presentation runtime exactly**

Use the Presentations skill and bundled paths:

```text
RUNTIME_NODE=C:\Users\34615\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe
RUNTIME_NODE_MODULES=C:\Users\34615\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules
RUNTIME_BIN_DIR=C:\Users\34615\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\override
```

Create a writable case-specific temp directory and a `node_modules` junction to `RUNTIME_NODE_MODULES`. Read `artifact_tool_docs/API_QUICK_START.md` and `artifact_tool_docs/api/API_DOCS.md` before authoring.

- [ ] **Step 3: Mark the artifact operation exactly once**

From the Presentations skill directory run as a standalone command:

```powershell
& $env:RUNTIME_NODE container_tools/mark_artifact_operation_started.mjs --operation-kind create --expected-output-count 1 --output-format pptx
```

Expected: success. Do not rerun the marker for this deck creation.

- [ ] **Step 4: Generate restrained presenter assets**

Use `imagegen` for a presenter with a pointer and one default-clasped listening state. The explicit custom visual direction is Swiss/data-driven; do not use Codex Grid or derive slide styling from mouse references.

- [ ] **Step 5: Author the deck with `@oai/artifact-tool`**

Build in the temp directory, use at least 50pt deck title, 35pt slide titles, 24pt subheads, and 16pt body text. Keep one composition per slide, avoid UI-like card grids, use native charts/shapes only where they materially explain the illustrative scenario, and add `[Sources]` notes for every mouse/generated asset and any external item.

Start the builder with the verified export path and keep slide construction in named functions:

```js
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });
for (const buildSlide of [
  buildTitle, buildDecision, buildGap, buildPriorities,
  buildPortfolio, buildRoadmap, buildRisks, buildApproval
]) buildSlide(deck.slides.add());

const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(new URL("../output/Grid-Forward-2030.pptx", import.meta.url));
```

Each function must add its audience-facing title/content plus `[Sources]` notes through the artifact API. The script must fail if the deck does not contain exactly eight slides.

- [ ] **Step 6: Export and preserve editable source**

Export the PPTX to `output/Grid-Forward-2030.pptx`. After successful rendering and repair, copy the final clean `.mjs` builder to `source/build-deck.mjs`; omit temp plans, junctions, caches, and source-note scratch files.

- [ ] **Step 7: Render and inspect every slide**

Use `render_slides.py`, `slides_test.py`, and `create_montage.py`. Inspect every slide individually at full size, then inspect the montage for narrative flow. Fix all unintended overlap, clipping, wrapping, inconsistent alignment, low contrast, or blurry imagery.

- [ ] **Step 8: Create the same-context and cross-case comparisons**

Include the canonical identity, action-hands authority, selected composition, and representative rendered slide in `evidence/comparison.png`. Compare against both accepted Web cases and record style-provenance evidence for every dimension.

- [ ] **Step 9: Mark accepted and commit**

```powershell
git add examples/grid-forward-2030
git commit -m "feat: add Grid Forward 2030 benchmark"
```

### Task 5: Build and accept Archive Lantern

**Files:**
- Create: `examples/archive-lantern/source/ArchiveLantern.ps1`
- Create: `examples/archive-lantern/source/ArchiveLantern.xaml`
- Create: `examples/archive-lantern/source/assets/*.png`
- Create: runnable files under `examples/archive-lantern/output/`
- Modify: required metadata/evidence files and `tests/plugin/examples-runtime.test.ts`

- [ ] **Step 1: Finalize the desktop brief and derivations**

Primary journey:

```text
empty-library -> import -> indexing -> indexed -> tag -> search -> open-result
```

Also implement failed import, retry, duplicate handling, keyboard navigation, status announcements, and recovery. The mouse acts as librarian in empty/indexing/recovery states; action hands touch the real book/card/index control.

- [ ] **Step 2: Generate librarian raster states**

Use `imagegen` after the four-image grounding. Create default-clasped empty state, action-hand indexing state, and restrained recovery state. Save only approved PNGs.

- [ ] **Step 3: Add the failing non-UI smoke test**

The script must support:

```powershell
pwsh -NoProfile -File examples\archive-lantern\source\ArchiveLantern.ps1 -Mode Smoke
```

Expected JSON after implementation:

```json
{"ok":true,"journey":["empty-library","import","indexing","indexed","tag","search","open-result"],"recovery":"passed"}
```

Add a Vitest `execFile` assertion for that exact object.

- [ ] **Step 4: Implement the WPF application**

Use PowerShell 7 plus `PresentationFramework`, keeping UI in XAML and state/action functions in the script. Support `-Mode Ui|Smoke|Render` and `-RenderPath <absolute.png>`. `Render` must create the actual window tree and use `RenderTargetBitmap` to save a 1440×900 PNG without fabricating a separate mock layout.

Use this entry contract and one shared window constructor:

```powershell
param(
  [ValidateSet('Ui','Smoke','Render')][string]$Mode = 'Ui',
  [string]$RenderPath
)

function Save-WindowPng {
  param([Windows.Window]$Window, [string]$Path)
  $Window.Measure([Windows.Size]::new(1440,900)); $Window.Arrange([Windows.Rect]::new(0,0,1440,900))
  $bitmap = [Windows.Media.Imaging.RenderTargetBitmap]::new(1440,900,96,96,[Windows.Media.PixelFormats]::Pbgra32)
  $bitmap.Render($Window)
  $encoder = [Windows.Media.Imaging.PngBitmapEncoder]::new(); $encoder.Frames.Add([Windows.Media.Imaging.BitmapFrame]::Create($bitmap))
  $stream = [IO.File]::Open($Path,[IO.FileMode]::Create); try { $encoder.Save($stream) } finally { $stream.Dispose() }
}
```

Implement `New-ArchiveLanternWindow` immediately after the parameter block: read `ArchiveLantern.xaml` relative to `$PSScriptRoot`, parse it with `[Windows.Markup.XamlReader]`, find named controls, and bind every handler to shared `Set-ArchiveState`, `Import-Archive`, `Add-ArchiveTag`, `Search-Archive`, and `Retry-ArchiveImport` functions. Implement `Invoke-SmokeJourney` by calling those same state functions against an in-memory state and emitting only the exact compressed JSON expected by the test. `Smoke` must branch before loading WPF assemblies or constructing the window, `Render` must require an absolute `RenderPath`, and `Ui` must call `ShowDialog()` on the shared window.

- [ ] **Step 5: Build and exercise the output**

Copy script, XAML, and assets to `output/`. Run Smoke, Render, then launch Ui visibly. Exercise import, search, error, and retry in the actual app. Do not hide the window during the user-visible runtime check.

- [ ] **Step 6: Capture and compare**

Store empty, indexing, result, and recovery screenshots. Create the required same-context comparison and compare against all three accepted cases. Repair desktop scaling, clipping, focus, contrast, hand connection, and any repeated unexplained template dimension.

- [ ] **Step 7: Mark accepted and commit**

```powershell
git add examples/archive-lantern tests/plugin/examples-runtime.test.ts
git commit -m "feat: add Archive Lantern benchmark"
```

### Task 6: Close the complete benchmark gate

**Files:**
- Modify: `tests/plugin/examples-contract.test.ts`
- Modify only other evidence or implementation files needed to fix a failed gate.

- [ ] **Step 1: Convert the pending contract into the final acceptance contract**

Change the initial `--allow-pending` assertion to invoke the validator without that flag and require the exact object:

```ts
expect(JSON.parse(result.stdout)).toEqual({ ok: true, cases: 4, accepted: 4 });
```

- [ ] **Step 2: Validate all four cases**

```powershell
pnpm examples:verify
pnpm vitest run tests/plugin/examples-contract.test.ts tests/plugin/examples-runtime.test.ts
```

Expected: `{"ok":true,"cases":4,"accepted":4}` and all focused tests pass.

- [ ] **Step 3: Run repository gates**

```powershell
pnpm test
pnpm typecheck
pnpm plugin:verify
pnpm plugin:package
git diff --check
```

Expected: all pass; the plugin ZIP contains no `examples/` entries.

- [ ] **Step 4: Inspect the four hero screenshots together**

Create a temporary four-up review page, inspect at original size, and confirm the cases differ for product-specific reasons across skeleton, placement, palette, material, edges, title treatment, components, decoration, and interaction.

- [ ] **Step 5: Commit benchmark closeout**

```powershell
git add examples tests scripts package.json
git commit -m "test: accept v0.2 benchmark portfolio"
git status --short --branch
```

Expected: clean worktree and four accepted cases.
