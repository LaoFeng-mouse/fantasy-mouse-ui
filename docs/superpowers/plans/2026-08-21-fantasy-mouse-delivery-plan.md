# Fantasy Mouse QA, Export, and Agent Adapters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add original character assets, rights-safe fallback, real visual and accessibility QA, export packaging, thin cross-Agent adapters, and one evidence-backed acceptance command.

**Architecture:** Asset providers return provenance-bearing candidates that pass an identity gate before use. QA services consume real renderer artifacts and emit independent surface results; export packages only allowed assets and adapters around the canonical recipe.

**Tech Stack:** TypeScript, Vitest, Playwright, axe-core, pixelmatch, PNGJS, JSZip, Markdown.

---

## File map

- `catalog/characters/fantasy-mouse-original/manifest.json`: public pack anchors, assets, and rights.
- `catalog/characters/fantasy-mouse-original/assets/*.png`: approved standard states.
- `src/assets/provider.ts`: dynamic-provider contract and standard fallback.
- `src/assets/identity.ts`: metadata identity checks.
- `src/qa/web-qa.ts`, `desktop-qa.ts`, `pptx-qa.ts`: real surface gates.
- `src/qa/report.ts`: accepted/partial/failed aggregation.
- `src/export/package-project.ts`: rights-filtered ZIP export.
- `adapters/*`: thin Agent entrypoints.
- `scripts/acceptance.ts`: one end-to-end command.
- `outputs/qa/*`: generated evidence, kept outside Git.

### Task 1: Create the original public character pack

**Files:**
- Create: `catalog/characters/fantasy-mouse-original/manifest.json`
- Create: `catalog/characters/fantasy-mouse-original/assets/idle.png`
- Create: `catalog/characters/fantasy-mouse-original/assets/processing.png`
- Create: `catalog/characters/fantasy-mouse-original/assets/success.png`
- Create: `catalog/characters/fantasy-mouse-original/assets/failure.png`
- Create: `tests/assets/manifest.test.ts`

- [ ] **Step 1: Install the PNG inspector and write complete pack invariants**

Run: `pnpm add -D pngjs @types/pngjs`

```ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PNG } from "pngjs";
import manifest from "../../catalog/characters/fantasy-mouse-original/manifest.json";
import { describe, expect, it } from "vitest";
describe("public character pack", () => { it("declares independent public rights and identity anchors", () => { expect(manifest.rights).toEqual({ owner: "Fantasy Mouse UI project", publicExport: true, source: "original" }); expect(manifest.identityAnchors).toEqual(expect.arrayContaining(["grey-round-face", "toothy-smile", "white-bean-body"])); expect(Object.keys(manifest.assets)).toEqual(expect.arrayContaining(["idle", "processing", "success", "failure"])); }); for (const [state, relative] of Object.entries(manifest.assets)) it(`${state} is a large transparent PNG`, async () => { const png = PNG.sync.read(await readFile(join("catalog/characters/fantasy-mouse-original", relative))); expect(png.width).toBeGreaterThanOrEqual(512); expect(png.height).toBeGreaterThanOrEqual(512); let transparent = false; for (let index = 3; index < png.data.length; index += 4) if (png.data[index] === 0) { transparent = true; break; } expect(transparent).toBe(true); }); });
```

- [ ] **Step 2: Add the manifest before images and verify red**

```json
{
  "id": "fantasy-mouse-original",
  "version": 1,
  "identityAnchors": ["grey-round-face", "narrowed-eyes", "toothy-smile", "white-bean-body", "earnest-absurd-dreamer"],
  "rights": { "owner": "Fantasy Mouse UI project", "publicExport": true, "source": "original" },
  "assets": {
    "idle": "assets/idle.png",
    "processing": "assets/processing.png",
    "success": "assets/success.png",
    "failure": "assets/failure.png"
  }
}
```

Run: `pnpm vitest run tests/assets/manifest.test.ts`

Expected: rights and anchor assertions pass, while four PNG tests fail because the files do not exist.

- [ ] **Step 3: Generate four original transparent assets with ImageGen**

Use the `imagegen` skill with this fixed identity prompt and one state suffix per file:

```text
Create an original meme-collage mascot on a transparent background. It is not any existing internet cat or copyrighted character. Preserve these identity anchors across every image: rounded smoky-grey face, narrowed vacant eyes, a broad exaggerated toothy grin with clearly fictional teeth, tiny white bean-shaped hand-drawn body, black doodle outline, earnest absurd dreamer energy. Intentionally combine a softly textured face with a simple flat doodle body. Centered full-body PNG, no words, no watermark, generous transparent padding.

State suffixes:
- idle: standing still with one tiny U-shaped chest mark.
- processing: wearing a chief engineer helmet and operating a small format-conversion control panel.
- success: holding a trophy with a pink check badge.
- failure: fantasy props have fallen down; the mascot is back in ordinary reality with a blue warning badge.
```

Save the returned assets at the four exact manifest paths. Visually inspect all four together and regenerate any image whose face, grin, body, or outline no longer matches.

- [ ] **Step 4: Verify transparent PNGs and commit**

Run: `pnpm vitest run tests/assets/manifest.test.ts`

Expected: all manifest, existence, dimension, and transparency checks pass.

```bash
git add catalog/characters/fantasy-mouse-original tests/assets/manifest.test.ts package.json pnpm-lock.yaml
git commit -m "feat: add original fantasy mouse character pack"
```

### Task 2: Enforce identity and rights-safe fallback

**Files:**
- Create: `src/assets/provider.ts`
- Create: `src/assets/identity.ts`
- Create: `tests/assets/provider.test.ts`

- [ ] **Step 1: Write drift and rights tests**

```ts
import { describe, expect, it } from "vitest";
import { resolveAsset } from "../../src/assets/provider";
const standard = { id: "standard-processing", path: "processing.png", anchors: ["grey-round-face", "toothy-smile", "white-bean-body"], publicExport: true, source: "original" as const };
describe("resolveAsset", () => { it("uses a valid generated candidate", async () => { const candidate = { ...standard, id: "generated", path: "generated.png" }; expect(await resolveAsset(["grey-round-face", "toothy-smile", "white-bean-body"], standard, async () => candidate)).toEqual({ asset: candidate, fallback: false, diagnostics: [] }); }); it("falls back when identity drifts", async () => { const drifted = { ...standard, id: "drifted", anchors: ["round-hamster"], path: "drifted.png" }; const result = await resolveAsset(standard.anchors, standard, async () => drifted); expect(result.asset).toBe(standard); expect(result.fallback).toBe(true); }); it("falls back when public rights are false", async () => { const privateAsset = { ...standard, id: "private", publicExport: false, source: "user" as const }; expect((await resolveAsset(standard.anchors, standard, async () => privateAsset, true)).asset).toBe(standard); }); });
```

- [ ] **Step 2: Verify red**

Run: `pnpm vitest run tests/assets/provider.test.ts`

Expected: FAIL because provider modules do not exist.

- [ ] **Step 3: Implement the provider boundary**

```ts
// identity.ts
export function missingAnchors(required: readonly string[], actual: readonly string[]): string[] { return required.filter((anchor) => !actual.includes(anchor)); }
```

```ts
// provider.ts
import { missingAnchors } from "./identity.js";
export type Asset = { id: string; path: string; anchors: string[]; publicExport: boolean; source: "original" | "generated" | "user" };
export async function resolveAsset(required: readonly string[], standard: Asset, generate: () => Promise<Asset>, publicExport = false) { try { const candidate = await generate(); const missing = missingAnchors(required, candidate.anchors); const rightsBlocked = publicExport && !candidate.publicExport; if (missing.length === 0 && !rightsBlocked) return { asset: candidate, fallback: false, diagnostics: [] }; return { asset: standard, fallback: true, diagnostics: [...missing.map((item) => `missing-anchor:${item}`), ...(rightsBlocked ? ["rights-blocked"] : [])] }; } catch (error) { return { asset: standard, fallback: true, diagnostics: [`provider-error:${String(error)}`] }; } }
```

- [ ] **Step 4: Verify and commit**

Run: `pnpm vitest run tests/assets/provider.test.ts && pnpm typecheck`

Expected: three passing tests and zero TypeScript errors.

```bash
git add src/assets tests/assets/provider.test.ts
git commit -m "feat: enforce character identity and rights fallback"
```

### Task 3: Run real Web accessibility and visual QA

**Files:**
- Create: `src/qa/types.ts`
- Create: `src/qa/web-qa.ts`
- Create: `tests/qa/web-qa.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Install axe and write the failing QA test**

Run: `pnpm add axe-core`

```ts
import { describe, expect, it } from "vitest";
import { qaWeb } from "../../src/qa/web-qa";
describe("qaWeb", () => { it("captures desktop and mobile evidence with no serious accessibility findings", async () => { const result = await qaWeb("dist/projects/file-converter/web/index.html", "outputs/qa/web"); expect(result.status).toBe("accepted"); expect(result.evidence).toEqual(expect.arrayContaining([expect.stringContaining("desktop.png"), expect.stringContaining("mobile.png")])); expect(result.findings).toEqual([]); }, 30_000); });
```

- [ ] **Step 2: Verify red**

Run: `pnpm vitest run tests/qa/web-qa.test.ts`

Expected: FAIL because `qaWeb` does not exist.

- [ ] **Step 3: Implement real browser QA**

```ts
// types.ts
import { Surface } from "../core/schema.js";
export type QaResult = { surface: Surface; status: "accepted" | "partial" | "failed"; evidence: string[]; findings: string[] };
```

```ts
// web-qa.ts
import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import axeSource from "axe-core";
import { QaResult } from "./types.js";
export async function qaWeb(htmlPath: string, evidenceDir: string): Promise<QaResult> { await mkdir(evidenceDir, { recursive: true }); const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1440, height: 900 } }); await page.goto(`file://${resolve(htmlPath).replaceAll("\\", "/")}`); await page.addScriptTag({ content: axeSource.source }); const violations = await page.evaluate(async () => (await (window as any).axe.run()).violations.filter((item: any) => ["serious", "critical"].includes(item.impact))); const desktop = resolve(evidenceDir, "desktop.png"); await page.screenshot({ path: desktop, fullPage: true }); await page.setViewportSize({ width: 390, height: 844 }); const mobile = resolve(evidenceDir, "mobile.png"); await page.screenshot({ path: mobile, fullPage: true }); const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth); await browser.close(); const findings = [...violations.map((item: any) => `a11y:${item.id}`), ...(overflow ? ["horizontal-overflow"] : [])]; return { surface: "web", status: findings.length === 0 ? "accepted" : "partial", evidence: [desktop, mobile], findings }; }
```

- [ ] **Step 4: Render sample, verify, and commit**

Run: `pnpm render:sample && pnpm vitest run tests/qa/web-qa.test.ts`

Expected: Web QA passes and writes two screenshots.

```bash
git add package.json pnpm-lock.yaml src/qa tests/qa/web-qa.test.ts
git commit -m "feat: add real Web accessibility and visual QA"
```

### Task 4: Aggregate desktop and PowerPoint evidence without false success

**Files:**
- Create: `src/qa/report.ts`
- Create: `src/qa/visual-review.ts`
- Create: `tests/qa/report.test.ts`

- [ ] **Step 1: Write completion-state tests**

```ts
import { describe, expect, it } from "vitest";
import { aggregateQa } from "../../src/qa/report";
const accepted = (surface: "web" | "desktop" | "pptx") => ({ surface, status: "accepted" as const, evidence: [`${surface}.png`], findings: [] });
describe("aggregateQa", () => { it("accepts only when every requested surface is accepted", () => expect(aggregateQa([accepted("web"), accepted("desktop"), accepted("pptx")])).toMatchObject({ status: "accepted" })); it("stays partial when one surface is partial", () => expect(aggregateQa([accepted("web"), { surface: "desktop", status: "partial", evidence: [], findings: ["window-not-inspected"] }, accepted("pptx")])).toMatchObject({ status: "partial", findings: ["desktop:window-not-inspected"] })); it("fails when one renderer failed", () => expect(aggregateQa([accepted("web"), { surface: "desktop", status: "failed", evidence: [], findings: ["launch-failed"] }])).toMatchObject({ status: "failed" })); });
```

- [ ] **Step 2: Verify red**

Run: `pnpm vitest run tests/qa/report.test.ts`

Expected: FAIL because `aggregateQa` does not exist.

- [ ] **Step 3: Implement strict aggregation**

```ts
import { QaResult } from "./types.js";
export function aggregateQa(results: QaResult[]) { const status = results.some((item) => item.status === "failed") ? "failed" : results.every((item) => item.status === "accepted") ? "accepted" : "partial"; return { status, surfaces: Object.fromEntries(results.map((item) => [item.surface, item.status])), evidence: results.flatMap((item) => item.evidence), findings: results.flatMap((item) => item.findings.map((finding) => `${item.surface}:${finding}`)) }; }
```

Add a separate visual-review gate so automated screenshot creation is not mistaken for inspection:

```ts
// visual-review.ts
import { readFile } from "node:fs/promises";
export type VisualReview = { reviewedEvidence: string[]; findings: string[]; accepted: boolean };
export async function loadVisualReview(path: string): Promise<VisualReview | undefined> { try { return JSON.parse(await readFile(path, "utf8")) as VisualReview; } catch { return undefined; } }
export function applyVisualReview<T extends { status: string; evidence: string[]; findings: string[] }>(report: T, review?: VisualReview) { if (!review) return { ...report, status: report.status === "failed" ? "failed" : "partial", findings: [...report.findings, "visual-review:missing"] }; const missing = report.evidence.filter((path) => !review.reviewedEvidence.includes(path)); const findings = [...report.findings, ...missing.map((path) => `visual-review:unreviewed:${path}`), ...review.findings.map((item) => `visual-review:${item}`)]; return { ...report, status: report.status === "failed" ? "failed" : review.accepted && missing.length === 0 && findings.length === 0 ? "accepted" : "partial", findings }; }
```

Add these assertions to `tests/qa/report.test.ts`:

```ts
import { applyVisualReview } from "../../src/qa/visual-review";
it("requires explicit inspection of every screenshot", () => { const report = aggregateQa([accepted("web"), accepted("desktop"), accepted("pptx")]); expect(applyVisualReview(report).status).toBe("partial"); expect(applyVisualReview(report).findings).toContain("visual-review:missing"); const review = { reviewedEvidence: report.evidence, findings: [], accepted: true }; expect(applyVisualReview(report, review).status).toBe("accepted"); });
```

- [ ] **Step 4: Add real desktop and PowerPoint evidence producers**

```ts
// src/qa/desktop-qa.ts
import { _electron as electron } from "playwright";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { QaResult } from "./types.js";
export async function qaDesktop(projectDir: string, evidenceDir: string): Promise<QaResult> { await mkdir(evidenceDir, { recursive: true }); try { const app = await electron.launch({ args: [resolve(projectDir, "main.cjs")] }); const window = await app.firstWindow(); await window.waitForSelector("h1"); const overflow = await window.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth); const screenshot = resolve(evidenceDir, "desktop-processing.png"); await window.screenshot({ path: screenshot }); await app.close(); const findings = overflow ? ["horizontal-overflow"] : []; return { surface: "desktop", status: findings.length === 0 ? "accepted" : "partial", evidence: [screenshot], findings }; } catch (error) { return { surface: "desktop", status: "failed", evidence: [], findings: [`launch-failed:${String(error)}`] }; } }
```

```ts
// src/qa/pptx-qa.ts
import { mkdir, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";
import { QaResult } from "./types.js";
export type SlideRenderer = (pptxPath: string, outputDir: string) => Promise<void>;
export async function qaPptx(pptxPath: string, evidenceDir: string, renderSlides: SlideRenderer): Promise<QaResult> { await mkdir(evidenceDir, { recursive: true }); try { const zip = await JSZip.loadAsync(await readFile(pptxPath)); const slideCount = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name)).length; await renderSlides(resolve(pptxPath), resolve(evidenceDir)); const images = (await readdir(evidenceDir)).filter((name) => name.endsWith(".png")).map((name) => resolve(evidenceDir, name)); const findings = images.length === slideCount ? [] : [`rendered-slide-count:${images.length}/${slideCount}`]; return { surface: "pptx", status: findings.length === 0 ? "accepted" : "partial", evidence: images, findings }; } catch (error) { return { surface: "pptx", status: "failed", evidence: [], findings: [`pptx-render-failed:${String(error)}`] }; } }
```

```ts
// tests/qa/surface-qa.test.ts
import { mkdir, writeFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { qaPptx } from "../../src/qa/pptx-qa";
describe("surface evidence", () => { it("cannot accept PPTX when not every slide rendered", async () => { const result = await qaPptx("dist/projects/file-converter/pptx/file-converter.pptx", "outputs/qa/pptx-test", async (_pptx, output) => { await mkdir(output, { recursive: true }); await writeFile(`${output}/slide-1.png`, "not-a-real-render"); }); expect(result.status).toBe("partial"); expect(result.findings[0]).toMatch(/^rendered-slide-count:/); }); });
```

The real acceptance callback invokes the verified workspace renderer:

```ts
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execFileAsync = promisify(execFile);
export async function renderSlidesWithWorkspace(pptxPath: string, outputDir: string) { const python = process.env.MOUSE_UI_PYTHON; const script = process.env.MOUSE_UI_SLIDES_RENDERER; if (!python || !script) throw new Error("MOUSE_UI_PYTHON and MOUSE_UI_SLIDES_RENDERER are required"); await execFileAsync(python, [script, pptxPath, "--output_dir", outputDir]); }
```

Store that callback in `src/qa/workspace-slides.ts` and pass it to `qaPptx` from the acceptance script.

- [ ] **Step 5: Run and commit**

Run: `pnpm vitest run tests/qa && pnpm typecheck`

Expected: report, desktop, and PPTX QA tests pass.

```bash
git add src/qa tests/qa
git commit -m "feat: enforce strict cross-surface completion"
```

### Task 5: Export a rights-filtered editable project package

**Files:**
- Create: `src/export/package-project.ts`
- Create: `tests/export/package-project.test.ts`

- [ ] **Step 1: Write export filtering test**

```ts
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { packageProject } from "../../src/export/package-project";
import recipe from "../../examples/recipes/file-converter.json";
describe("packageProject", () => { it("includes editable artifacts and excludes private assets", async () => { const out = join(await mkdtemp(join(tmpdir(), "mouse-export-")), "project.zip"); await packageProject(recipe, out, [{ id: "public", path: "catalog/characters/fantasy-mouse-original/assets/idle.png", publicExport: true }, { id: "private", path: "private.png", publicExport: false }], [{ archivePath: "surfaces/web/index.html", path: "dist/projects/file-converter/web/index.html" }, { archivePath: "surfaces/pptx/file-converter.pptx", path: "dist/projects/file-converter/pptx/file-converter.pptx" }]); const zip = await JSZip.loadAsync(await readFile(out)); expect(zip.file("mouse-ui-project.json")).not.toBeNull(); expect(zip.file("assets/public.png")).not.toBeNull(); expect(zip.file("assets/private.png")).toBeNull(); expect(zip.file("surfaces/web/index.html")).not.toBeNull(); expect(zip.file("surfaces/pptx/file-converter.pptx")).not.toBeNull(); }); });
```

- [ ] **Step 2: Verify red**

Run: `pnpm vitest run tests/export/package-project.test.ts`

Expected: FAIL because exporter does not exist.

- [ ] **Step 3: Implement packaging**

```ts
import { readFile, writeFile } from "node:fs/promises";
import JSZip from "jszip";
import { Recipe } from "../core/schema.js";
export async function packageProject(recipe: Recipe, output: string, assets: { id: string; path: string; publicExport: boolean }[], artifacts: { archivePath: string; path: string }[]) { const zip = new JSZip(); zip.file("mouse-ui-project.json", `${JSON.stringify(recipe, null, 2)}\n`); for (const asset of assets.filter((item) => item.publicExport)) zip.file(`assets/${asset.id}.png`, await readFile(asset.path)); for (const artifact of artifacts) zip.file(artifact.archivePath, await readFile(artifact.path)); zip.file("handoff.json", `${JSON.stringify({ protocolVersion: recipe.protocolVersion, recipe: "mouse-ui-project.json", incomplete: [] }, null, 2)}\n`); await writeFile(output, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })); }
```

- [ ] **Step 4: Verify and commit**

Run: `pnpm vitest run tests/export/package-project.test.ts && pnpm typecheck`

Expected: one passing test and zero TypeScript errors.

```bash
git add src/export tests/export
git commit -m "feat: export rights-safe editable project packages"
```

### Task 6: Publish thin model-neutral Agent adapters

**Files:**
- Create: `adapters/generic/AGENT.md`
- Create: `adapters/codex/SKILL.md`
- Create: `adapters/claude/SKILL.md`
- Create: `adapters/gemini/SKILL.md`
- Create: `adapters/deepseek/SKILL.md`
- Create: `tests/adapters/adapters.test.ts`

- [ ] **Step 1: Write adapter pointer tests**

```ts
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
const files = ["generic/AGENT.md", "codex/SKILL.md", "claude/SKILL.md", "gemini/SKILL.md", "deepseek/SKILL.md"];
describe("Agent adapters", () => { for (const file of files) it(`${file} points to the canonical protocol`, async () => { const text = await readFile(`adapters/${file}`, "utf8"); expect(text).toContain("protocol/mouse-ui-project.schema.json"); expect(text).toContain("mouse-ui-project.json"); expect(text).toContain("Never mark visual QA passed without rendered screenshots"); }); });
```

- [ ] **Step 2: Verify red**

Run: `pnpm vitest run tests/adapters/adapters.test.ts`

Expected: FAIL because adapters do not exist.

- [ ] **Step 3: Write the generic adapter body**

```md
# Fantasy Mouse UI Agent Adapter

Use `protocol/mouse-ui-project.schema.json` as the machine contract and the approved design specification as the semantic contract.

1. Read or create `mouse-ui-project.json`.
2. Validate it before generating assets or surfaces.
3. Declare code, image, browser, PowerPoint, and filesystem capabilities.
4. Use approved standard assets when image generation is unavailable.
5. Render every requested surface independently.
6. Inspect rendered screenshots and retain QA evidence.
7. Never mark visual QA passed without rendered screenshots.
8. Export a handoff manifest for every unavailable operation.

Only a result with every requested surface accepted is complete.
```

- [ ] **Step 4: Create four thin platform wrappers**

```md
---
name: fantasy-mouse-ui-codex
description: Use Fantasy Mouse UI to design, render, inspect, and export software UI, websites, or PowerPoint with the canonical fantasy character protocol.
---
# Codex adapter
Read `../generic/AGENT.md` completely. Use `protocol/mouse-ui-project.schema.json` to validate `mouse-ui-project.json`. Declare available Codex tools before rendering. Never mark visual QA passed without rendered screenshots. Emit a handoff manifest for unavailable operations.
```

```md
---
name: fantasy-mouse-ui-claude
description: Use Fantasy Mouse UI to design, render, inspect, and export software UI, websites, or PowerPoint with the canonical fantasy character protocol.
---
# Claude adapter
Read `../generic/AGENT.md` completely. Use `protocol/mouse-ui-project.schema.json` to validate `mouse-ui-project.json`. Declare available Claude tools before rendering. Never mark visual QA passed without rendered screenshots. Emit a handoff manifest for unavailable operations.
```

```md
---
name: fantasy-mouse-ui-gemini
description: Use Fantasy Mouse UI to design, render, inspect, and export software UI, websites, or PowerPoint with the canonical fantasy character protocol.
---
# Gemini adapter
Read `../generic/AGENT.md` completely. Use `protocol/mouse-ui-project.schema.json` to validate `mouse-ui-project.json`. Declare available Gemini tools before rendering. Never mark visual QA passed without rendered screenshots. Emit a handoff manifest for unavailable operations.
```

```md
---
name: fantasy-mouse-ui-deepseek
description: Use Fantasy Mouse UI to design, render, inspect, and export software UI, websites, or PowerPoint with the canonical fantasy character protocol.
---
# DeepSeek adapter
Read `../generic/AGENT.md` completely. Use `protocol/mouse-ui-project.schema.json` to validate `mouse-ui-project.json`. Declare available DeepSeek tools before rendering. Never mark visual QA passed without rendered screenshots. Emit a handoff manifest for unavailable operations.
```

- [ ] **Step 5: Verify and commit**

Run: `pnpm vitest run tests/adapters/adapters.test.ts`

Expected: five passing tests.

```bash
git add adapters tests/adapters
git commit -m "feat: add model-neutral Agent adapters"
```

### Task 7: Run one end-to-end acceptance command

**Files:**
- Create: `scripts/acceptance.ts`
- Create: `tests/acceptance/acceptance.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write acceptance status test**

```ts
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runAcceptance } from "../../scripts/acceptance";
describe("first release acceptance", () => { it("requires review and then accepts all three surfaces", async () => { const first = await runAcceptance("missing-review.json"); expect(first.status).toBe("partial"); const reviewPath = join(await mkdtemp(join(tmpdir(), "mouse-review-")), "review.json"); await writeFile(reviewPath, JSON.stringify({ reviewedEvidence: first.evidence, findings: [], accepted: true })); const report = await runAcceptance(reviewPath); expect(report.status).toBe("accepted"); expect(report.surfaces).toEqual({ web: "accepted", desktop: "accepted", pptx: "accepted" }); expect(report.evidence.length).toBeGreaterThanOrEqual(4); }, 120_000); });
```

- [ ] **Step 2: Implement orchestration**

```ts
import { mkdir, writeFile } from "node:fs/promises";
import { renderSample } from "../src/renderers/render-sample.js";
import { aggregateQa } from "../src/qa/report.js";
import { qaDesktop } from "../src/qa/desktop-qa.js";
import { qaPptx } from "../src/qa/pptx-qa.js";
import { qaWeb } from "../src/qa/web-qa.js";
import { renderSlidesWithWorkspace } from "../src/qa/workspace-slides.js";
import { applyVisualReview, loadVisualReview } from "../src/qa/visual-review.js";
export async function runAcceptance(reviewPath = "outputs/qa/visual-review.json") { const rendered = await renderSample(); if (rendered.some((item) => item.status === "failed")) return { status: "failed", surfaces: Object.fromEntries(rendered.map((item) => [item.surface, item.status])), evidence: [], findings: rendered.flatMap((item) => item.diagnostics) }; const results = await Promise.all([qaWeb("dist/projects/file-converter/web/index.html", "outputs/qa/web"), qaDesktop("dist/projects/file-converter/desktop", "outputs/qa/desktop"), qaPptx("dist/projects/file-converter/pptx/file-converter.pptx", "outputs/qa/pptx", renderSlidesWithWorkspace)]); const report = applyVisualReview(aggregateQa(results), await loadVisualReview(reviewPath)); await mkdir("outputs/qa", { recursive: true }); await writeFile("outputs/qa/report.json", `${JSON.stringify(report, null, 2)}\n`); return report; }
if (import.meta.url === `file://${process.argv[1]?.replaceAll("\\", "/")}`) { const report = await runAcceptance(); console.log(JSON.stringify(report, null, 2)); if (report.status !== "accepted") process.exitCode = 1; }
```

- [ ] **Step 3: Add script and verify the complete program**

Add: `"acceptance": "tsx scripts/acceptance.ts"`.

Set the verified local renderer paths, then run all gates:

```powershell
$env:MOUSE_UI_PYTHON='C:\Users\34615\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
$env:MOUSE_UI_SLIDES_RENDERER='C:\Users\34615\.codex\plugins\cache\openai-primary-runtime\presentations\26.819.11345\skills\presentations\container_tools\render_slides.py'
pnpm test
pnpm typecheck
pnpm studio:build
pnpm test:e2e
pnpm acceptance
```

On the first run, expected: tests and builds pass; acceptance exits nonzero with `visual-review:missing` after producing all screenshots.

Inspect every path listed under `evidence` using the available image-viewing tool. Check clipping, hierarchy, contrast, state clarity, identity anchors, and whether the character blocks primary actions. After every image passes, write `outputs/qa/visual-review.json` with the exact paths from the report:

```json
{
  "reviewedEvidence": [
    "outputs/qa/web/desktop.png",
    "outputs/qa/web/mobile.png",
    "outputs/qa/desktop/desktop-processing.png",
    "outputs/qa/pptx/1.png",
    "outputs/qa/pptx/2.png",
    "outputs/qa/pptx/3.png"
  ],
  "findings": [],
  "accepted": true
}
```

Run `pnpm acceptance` again. Expected: exit `0` and `outputs/qa/report.json` reports `accepted`. If filenames differ, copy the exact paths from the generated report rather than the example list.

- [ ] **Step 4: Check diffs and commit**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; only acceptance-script changes are uncommitted.

```bash
git add scripts/acceptance.ts tests/acceptance/acceptance.test.ts package.json
git commit -m "test: add first-release acceptance gate"
```
