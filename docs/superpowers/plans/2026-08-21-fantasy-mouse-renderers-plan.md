# Fantasy Mouse Surface Renderers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render one validated recipe into an editable responsive website, a runnable Electron desktop shell, and an editable PowerPoint deck.

**Architecture:** A small renderer contract isolates each surface. Web generates static editable source, Electron hosts that Web output without changing recipe semantics, and PptxGenJS maps semantic slides to native editable elements.

**Tech Stack:** TypeScript, React server rendering, Electron, Playwright Electron, PptxGenJS, Vitest.

---

## File map

- `src/renderers/types.ts`: renderer result and status contract.
- `src/renderers/web.tsx`: responsive static Web generator.
- `src/renderers/desktop.ts`: Electron project generator.
- `src/renderers/pptx.ts`: native PowerPoint generator.
- `src/renderers/render-all.ts`: independent surface orchestration.
- `src/desktop/main.cjs`: desktop-shell entrypoint template.
- `tests/renderers/*.test.ts`: renderer contract tests.
- `tests/e2e/desktop.spec.ts`: real Electron launch test.
- `examples/recipes/file-converter.json`: shared accepted fixture.

### Task 1: Define independent renderer results

**Files:**
- Create: `src/renderers/types.ts`
- Create: `src/renderers/render-all.ts`
- Create: `tests/renderers/render-all.test.ts`

- [ ] **Step 1: Write failure-isolation test**

```ts
import { describe, expect, it, vi } from "vitest";
import { renderAll } from "../../src/renderers/render-all";
import recipe from "../../examples/recipes/file-converter.json";

describe("renderAll", () => {
  it("preserves successful surfaces when one renderer fails", async () => {
    const results = await renderAll(recipe, {
      web: vi.fn().mockResolvedValue({ surface: "web", status: "rendered", artifacts: ["index.html"], diagnostics: [] }),
      desktop: vi.fn().mockRejectedValue(new Error("electron failed")),
      pptx: vi.fn().mockResolvedValue({ surface: "pptx", status: "rendered", artifacts: ["deck.pptx"], diagnostics: [] })
    });
    expect(results.map((item) => item.status)).toEqual(["rendered", "failed", "rendered"]);
  });
});
```

- [ ] **Step 2: Verify red**

Run: `pnpm vitest run tests/renderers/render-all.test.ts`

Expected: FAIL because renderer contract does not exist.

- [ ] **Step 3: Implement the contract and isolation loop**

```ts
// types.ts
import { Recipe, Surface } from "../core/schema.js";
export type RenderResult = { surface: Surface; status: "rendered" | "failed"; artifacts: string[]; diagnostics: string[] };
export type Renderer = (recipe: Recipe, outputDir: string) => Promise<RenderResult>;
export type Renderers = Record<Surface, Renderer>;
```

```ts
// render-all.ts
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { Recipe, Surface } from "../core/schema.js";
import { Renderers, RenderResult } from "./types.js";
export async function renderAll(recipe: Recipe, renderers: Renderers, root = "dist/projects"): Promise<RenderResult[]> {
  return Promise.all(recipe.surfaces.map(async (surface: Surface) => { const output = join(root, recipe.id, surface); await mkdir(output, { recursive: true }); try { return await renderers[surface](recipe, output); } catch (error) { return { surface, status: "failed", artifacts: [], diagnostics: [String(error)] }; } }));
}
```

- [ ] **Step 4: Verify and commit**

Run: `pnpm vitest run tests/renderers/render-all.test.ts && pnpm typecheck`

Expected: one passing test and zero TypeScript errors.

```bash
git add src/renderers/types.ts src/renderers/render-all.ts tests/renderers/render-all.test.ts
git commit -m "feat: isolate surface renderer outcomes"
```

### Task 2: Generate the responsive Web artifact

**Files:**
- Create: `src/renderers/web.ts`
- Create: `tests/renderers/web.test.ts`

- [ ] **Step 1: Write artifact tests**

```ts
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderWeb } from "../../src/renderers/web";
import recipe from "../../examples/recipes/file-converter.json";
describe("renderWeb", () => {
  it("writes editable HTML, CSS, and project data", async () => { const root = await mkdtemp(join(tmpdir(), "mouse-web-")); const result = await renderWeb(recipe, root); expect(result.status).toBe("rendered"); expect(await readFile(join(root, "index.html"), "utf8")).toContain("data-state=\"processing\""); expect(await readFile(join(root, "styles.css"), "utf8")).toContain("@media"); });
});
```

- [ ] **Step 2: Verify red**

Run: `pnpm vitest run tests/renderers/web.test.ts`

Expected: FAIL because `renderWeb` does not exist.

- [ ] **Step 3: Implement deterministic editable output**

```ts
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Recipe } from "../core/schema.js";
import { RenderResult } from "./types.js";
const esc = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
export async function renderWeb(recipe: Recipe, outputDir: string): Promise<RenderResult> {
  const processing = recipe.states.processing ?? { fantasyRole: "earnest-helper", copy: "处理中" };
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(recipe.title)}</title><link rel="stylesheet" href="styles.css"></head><body><main data-state="processing"><section class="hero"><div class="character" aria-label="幻想鼠正在扮演${esc(processing.fantasyRole)}">幻想鼠</div><h1>${esc(recipe.title)}</h1><p>${esc(processing.copy)}</p><button>选择文件</button></section></main><script type="application/json" id="mouse-ui-recipe">${esc(JSON.stringify(recipe))}</script></body></html>`;
  const css = `:root{--ink:#222;--pink:#ffdbe3;--cream:#fff0c2;font-family:Inter,"Microsoft YaHei",sans-serif}*{box-sizing:border-box}body{margin:0;background:linear-gradient(135deg,var(--pink),var(--cream));color:var(--ink)}.hero{min-height:100vh;display:grid;place-items:center;align-content:center;gap:16px;padding:32px;text-align:center}.character{width:220px;aspect-ratio:1;border:4px solid var(--ink);border-radius:50%;display:grid;place-items:center;background:white;font-weight:800}button{min-height:44px;padding:0 24px;border:3px solid var(--ink);border-radius:999px;background:white;font:inherit;font-weight:800}@media(max-width:600px){.character{width:150px}.hero{padding:20px}}`;
  await Promise.all([writeFile(join(outputDir, "index.html"), html), writeFile(join(outputDir, "styles.css"), css), writeFile(join(outputDir, "mouse-ui-project.json"), `${JSON.stringify(recipe, null, 2)}\n`)]);
  return { surface: "web", status: "rendered", artifacts: ["index.html", "styles.css", "mouse-ui-project.json"], diagnostics: [] };
}
```

- [ ] **Step 4: Verify and commit**

Run: `pnpm vitest run tests/renderers/web.test.ts && pnpm typecheck`

Expected: one passing test and zero TypeScript errors.

```bash
git add src/renderers/web.ts tests/renderers/web.test.ts
git commit -m "feat: render editable responsive websites"
```

### Task 3: Generate and launch the Electron desktop shell

**Files:**
- Create: `src/renderers/desktop.ts`
- Create: `src/desktop/main.cjs`
- Create: `scripts/render-desktop-sample.ts`
- Create: `tests/renderers/desktop.test.ts`
- Create: `tests/e2e/desktop.spec.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Electron test dependencies**

Run: `pnpm add -D electron @playwright/test`

Expected: lockfile updates successfully.

- [ ] **Step 2: Write desktop generator test**

```ts
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderDesktop } from "../../src/renderers/desktop";
import recipe from "../../examples/recipes/file-converter.json";
describe("renderDesktop", () => { it("writes an Electron shell around Web output", async () => { const root = await mkdtemp(join(tmpdir(), "mouse-desktop-")); const result = await renderDesktop(recipe, root); expect(result.artifacts).toContain("main.cjs"); expect(await readFile(join(root, "main.cjs"), "utf8")).toContain("BrowserWindow"); }); });
```

- [ ] **Step 3: Verify red**

Run: `pnpm vitest run tests/renderers/desktop.test.ts`

Expected: FAIL because `renderDesktop` does not exist.

- [ ] **Step 4: Implement shell generation**

```js
// src/desktop/main.cjs
const { app, BrowserWindow } = require("electron");
const path = require("node:path");
app.whenReady().then(() => { const window = new BrowserWindow({ width: 1180, height: 760, minWidth: 800, minHeight: 600, webPreferences: { contextIsolation: true, sandbox: true } }); window.loadFile(path.join(__dirname, "web", "index.html")); });
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
```

```ts
// desktop.ts
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Recipe } from "../core/schema.js";
import { renderWeb } from "./web.js";
import { RenderResult } from "./types.js";
export async function renderDesktop(recipe: Recipe, outputDir: string): Promise<RenderResult> { const web = join(outputDir, "web"); await mkdir(web, { recursive: true }); await renderWeb(recipe, web); await copyFile(resolve("src/desktop/main.cjs"), join(outputDir, "main.cjs")); await writeFile(join(outputDir, "package.json"), `${JSON.stringify({ private: true, main: "main.cjs" }, null, 2)}\n`); return { surface: "desktop", status: "rendered", artifacts: ["main.cjs", "package.json", "web/index.html"], diagnostics: [] }; }
```

- [ ] **Step 5: Add a real Electron launch test**

```ts
import { _electron as electron, expect, test } from "@playwright/test";
test("desktop sample launches", async () => { const app = await electron.launch({ args: ["dist/projects/file-converter/desktop/main.cjs"] }); const window = await app.firstWindow(); await expect(window.locator("h1")).toContainText("文件转换工具"); await window.screenshot({ path: "outputs/qa/desktop-processing.png" }); await app.close(); });
```

- [ ] **Step 6: Generate sample, run, and commit**

Create the focused desktop generation script:

```ts
import { mkdir } from "node:fs/promises";
import recipe from "../examples/recipes/file-converter.json" with { type: "json" };
import { renderDesktop } from "../src/renderers/desktop.js";
const output = "dist/projects/file-converter/desktop";
await mkdir(output, { recursive: true });
console.log(JSON.stringify(await renderDesktop(recipe, output), null, 2));
```

Add script: `"render:desktop-sample": "tsx scripts/render-desktop-sample.ts"`.

Run: `pnpm render:desktop-sample && pnpm playwright test tests/e2e/desktop.spec.ts`

Expected: Electron opens, heading is visible, screenshot is written, and test passes.

```bash
git add package.json pnpm-lock.yaml src/desktop src/renderers/desktop.ts scripts/render-desktop-sample.ts tests/renderers/desktop.test.ts tests/e2e/desktop.spec.ts
git commit -m "feat: render runnable desktop shell"
```

### Task 4: Generate an editable native PowerPoint deck

**Files:**
- Create: `src/renderers/pptx.ts`
- Create: `tests/renderers/pptx.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Install the renderer and ZIP inspector**

Run: `pnpm add pptxgenjs && pnpm add -D jszip`

Expected: lockfile updates successfully.

- [ ] **Step 2: Write editability test**

```ts
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { renderPptx } from "../../src/renderers/pptx";
import recipe from "../../examples/recipes/file-converter.json";
describe("renderPptx", () => { it("creates native editable text and shapes", async () => { const root = await mkdtemp(join(tmpdir(), "mouse-pptx-")); const result = await renderPptx(recipe, root); const zip = await JSZip.loadAsync(await readFile(join(root, "file-converter.pptx"))); const slide = await zip.file("ppt/slides/slide1.xml")!.async("text"); expect(slide).toContain("文件转换工具"); expect(slide).toContain("<p:sp>"); expect(result.status).toBe("rendered"); }); });
```

- [ ] **Step 3: Verify red**

Run: `pnpm vitest run tests/renderers/pptx.test.ts`

Expected: FAIL because `renderPptx` does not exist.

- [ ] **Step 4: Implement the three-slide native deck**

```ts
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import pptxgen from "pptxgenjs";
import { Recipe } from "../core/schema.js";
import { RenderResult } from "./types.js";
export async function renderPptx(recipe: Recipe, outputDir: string): Promise<RenderResult> { await mkdir(outputDir, { recursive: true }); const pptx = new pptxgen(); pptx.layout = "LAYOUT_WIDE"; pptx.author = "Fantasy Mouse UI"; pptx.subject = recipe.id; pptx.title = recipe.title; const states = ["processing", "success", "failure"] as const; for (const state of states) { const design = recipe.states[state] ?? { fantasyRole: "earnest-helper", copy: state }; const slide = pptx.addSlide(); slide.background = { color: state === "failure" ? "EEF4FF" : "FFF3D5" }; slide.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 0.7, w: 3.1, h: 5.8, fill: { color: "FFE0E7" }, line: { color: "222222", width: 2 } }); slide.addText("幻想鼠", { x: 1.25, y: 2.5, w: 2.2, h: 0.6, fontFace: "Microsoft YaHei", fontSize: 28, bold: true, align: "center" }); slide.addText(recipe.title, { x: 4.4, y: 1.4, w: 7.8, h: 0.7, fontFace: "Microsoft YaHei", fontSize: 30, bold: true, color: "222222" }); slide.addText(design.fantasyRole, { x: 4.4, y: 2.4, w: 7.8, h: 0.6, fontFace: "Microsoft YaHei", fontSize: 22, color: "E95D74" }); slide.addText(design.copy, { x: 4.4, y: 3.2, w: 7.5, h: 1.2, fontFace: "Microsoft YaHei", fontSize: 18, color: "333333" }); slide.addText(state, { x: 4.4, y: 5.5, w: 2.2, h: 0.45, fontFace: "Aptos", fontSize: 13, color: "666666" }); } const filename = `${recipe.id}.pptx`; await pptx.writeFile({ fileName: join(outputDir, filename) }); return { surface: "pptx", status: "rendered", artifacts: [filename], diagnostics: [] }; }
```

- [ ] **Step 5: Verify and commit**

Run: `pnpm vitest run tests/renderers/pptx.test.ts && pnpm typecheck`

Expected: one passing test and zero TypeScript errors.

```bash
git add package.json pnpm-lock.yaml src/renderers/pptx.ts tests/renderers/pptx.test.ts
git commit -m "feat: render editable PowerPoint decks"
```

### Task 5: Render all three shared-recipe samples

**Files:**
- Modify: `src/renderers/render-sample.ts`
- Create: `tests/renderers/sample-integration.test.ts`

- [ ] **Step 1: Write shared-recipe integration test**

```ts
import { access } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { renderSample } from "../../src/renderers/render-sample";
describe("reference samples", () => { it("renders all requested surfaces independently", async () => { const results = await renderSample(); expect(results.map((result) => [result.surface, result.status])).toEqual([["web", "rendered"], ["desktop", "rendered"], ["pptx", "rendered"]]); await Promise.all([access("dist/projects/file-converter/web/index.html"), access("dist/projects/file-converter/desktop/main.cjs"), access("dist/projects/file-converter/pptx/file-converter.pptx")]); }); });
```

- [ ] **Step 2: Implement the orchestration entrypoint**

```ts
import recipe from "../../examples/recipes/file-converter.json" with { type: "json" };
import { renderAll } from "./render-all.js";
import { renderDesktop } from "./desktop.js";
import { renderPptx } from "./pptx.js";
import { renderWeb } from "./web.js";
export function renderSample() { return renderAll(recipe, { web: renderWeb, desktop: renderDesktop, pptx: renderPptx }); }
if (import.meta.url === `file://${process.argv[1]?.replaceAll("\\", "/")}`) console.log(JSON.stringify(await renderSample(), null, 2));
```

- [ ] **Step 3: Run all renderer gates and commit**

Run: `pnpm vitest run tests/renderers && pnpm typecheck && pnpm render:sample`

Expected: all renderer tests pass and all three artifacts exist.

```bash
git add src/renderers/render-sample.ts tests/renderers/sample-integration.test.ts
git commit -m "feat: render three shared-recipe samples"
```
