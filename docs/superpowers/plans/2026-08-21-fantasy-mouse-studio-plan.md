# Fantasy Mouse Local Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local browser studio that creates a brief, shows three recommendations, edits one recipe, previews states and surfaces, and persists the validated project.

**Architecture:** A React client owns transient editor state through a reducer; a small Fastify server owns validated filesystem persistence. The studio imports core functions directly and never duplicates protocol semantics.

**Tech Stack:** React, Vite, TypeScript, Fastify, Testing Library, Vitest, Playwright.

---

## File map

- `src/studio/client/*`: React shell, reducer, forms, recommendation picker, editor, and preview.
- `src/studio/server.ts`: local API and static host.
- `src/studio/project-store.ts`: atomic validated persistence.
- `tests/studio/*.test.tsx`: component and reducer tests.
- `tests/studio/project-store.test.ts`: filesystem boundary tests.
- `tests/e2e/studio.spec.ts`: real browser workflow.
- `index.html`, `vite.config.ts`, `playwright.config.ts`: browser tooling.

### Task 1: Bootstrap the local React studio shell

**Files:**
- Modify: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `src/studio/client/main.tsx`
- Create: `src/studio/client/App.tsx`
- Create: `src/studio/client/styles.css`
- Create: `tests/studio/app.test.tsx`
- Create: `tests/setup.ts`

- [ ] **Step 1: Install studio dependencies**

Run: `pnpm add react react-dom fastify @fastify/static && pnpm add -D vite @vitejs/plugin-react @types/react @types/react-dom @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @playwright/test`

Expected: lockfile updates successfully.

- [ ] **Step 2: Write the failing shell test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../../src/studio/client/App";

describe("App", () => {
  it("shows the five-step workflow", () => {
    render(<App />);
    for (const label of ["项目简报", "推荐方案", "设计编辑", "渲染验收", "导出交付"]) expect(screen.getByText(label)).toBeVisible();
  });
});
```

- [ ] **Step 3: Configure browser tests and verify red**

```ts
// vite.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
export default defineConfig({ plugins: [react()], root: ".", build: { outDir: "dist/studio", emptyOutDir: true }, test: { environment: "jsdom", setupFiles: ["tests/setup.ts"] } });
```

Create the test setup file:

```ts
import "@testing-library/jest-dom/vitest";
```

Run: `pnpm vitest run tests/studio/app.test.tsx`

Expected: FAIL because `App.tsx` does not exist.

- [ ] **Step 4: Implement the shell**

```tsx
// src/studio/client/App.tsx
const steps = ["项目简报", "推荐方案", "设计编辑", "渲染验收", "导出交付"];
export function App() {
  return <div className="studio"><aside><h1>幻想鼠 UI</h1>{steps.map((step, index) => <button key={step}>{index + 1}. {step}</button>)}</aside><main><h2>创建一个项目</h2><p>描述用途、功能和目标载体，系统会推荐三套完整方案。</p></main></div>;
}
```

```tsx
// src/studio/client/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";
ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
```

```html
<div id="root"></div><script type="module" src="/src/studio/client/main.tsx"></script>
```

```css
:root{font-family:Inter,"Microsoft YaHei",sans-serif;color:#202020;background:#f6f2ee}*{box-sizing:border-box}body{margin:0}.studio{display:grid;grid-template-columns:230px 1fr;min-height:100vh}.studio aside{padding:24px;border-right:2px solid #222;background:#fff}.studio aside button{display:block;width:100%;margin:8px 0;padding:12px;text-align:left;border:0;border-radius:10px;background:#f5f1ee}.studio main{padding:32px}
```

- [ ] **Step 5: Add scripts, verify, and commit**

Add to `package.json` scripts: `"studio:dev": "vite"`, `"studio:build": "vite build"`.

Run: `pnpm vitest run tests/studio/app.test.tsx && pnpm studio:build`

Expected: one passing test and a successful Vite build.

```bash
git add package.json pnpm-lock.yaml index.html vite.config.ts src/studio tests/setup.ts tests/studio/app.test.tsx
git commit -m "feat: bootstrap local fantasy mouse studio"
```

### Task 2: Model the editor workflow with a reducer

**Files:**
- Create: `src/studio/client/editor-state.ts`
- Create: `tests/studio/editor-state.test.ts`

- [ ] **Step 1: Write reducer transition tests**

```ts
import { describe, expect, it } from "vitest";
import { initialEditorState, reduceEditor } from "../../src/studio/client/editor-state";

describe("editor reducer", () => {
  it("moves from brief to recommendations", () => {
    const next = reduceEditor(initialEditorState, { type: "brief-submitted", brief: { id: "demo", title: "Demo", productFunction: "conversion", surfaces: ["web"], seriousness: "playful" } });
    expect(next.step).toBe("recommendations");
    expect(next.recommendations).toHaveLength(3);
  });
  it("compiles a selected recommendation", () => {
    const recommended = reduceEditor(initialEditorState, { type: "brief-submitted", brief: { id: "demo", title: "Demo", productFunction: "conversion", surfaces: ["web"], seriousness: "playful" } });
    const selected = reduceEditor(recommended, { type: "recommendation-selected", id: "direction-1" });
    expect(selected.step).toBe("editor");
    expect(selected.recipe?.theme).toBe("bold-meme-collage");
  });
});
```

- [ ] **Step 2: Verify red**

Run: `pnpm vitest run tests/studio/editor-state.test.ts`

Expected: FAIL because reducer module does not exist.

- [ ] **Step 3: Implement the reducer**

```ts
import { compileRecipe } from "../../core/compile.js";
import { Brief, Recommendation, recommend } from "../../core/recommend.js";
import { Recipe } from "../../core/schema.js";

type State = { step: "brief" | "recommendations" | "editor" | "qa" | "export"; brief?: Brief; recommendations: Recommendation[]; recipe?: Recipe };
type Action = { type: "brief-submitted"; brief: Brief } | { type: "recommendation-selected"; id: string } | { type: "recipe-updated"; recipe: Recipe };
export const initialEditorState: State = { step: "brief", recommendations: [] };

export function reduceEditor(state: State, action: Action): State {
  if (action.type === "brief-submitted") return { step: "recommendations", brief: action.brief, recommendations: recommend(action.brief) };
  if (action.type === "recommendation-selected" && state.brief) {
    const selected = state.recommendations.find((item) => item.id === action.id);
    if (!selected) throw new Error(`Unknown recommendation: ${action.id}`);
    return { ...state, step: "editor", recipe: compileRecipe(state.brief, selected) };
  }
  if (action.type === "recipe-updated") return { ...state, recipe: action.recipe };
  return state;
}
```

- [ ] **Step 4: Verify and commit**

Run: `pnpm vitest run tests/studio/editor-state.test.ts && pnpm typecheck`

Expected: two passing tests and zero TypeScript errors.

```bash
git add src/studio/client/editor-state.ts tests/studio/editor-state.test.ts
git commit -m "feat: model studio workflow state"
```

### Task 3: Build the brief and recommendation screens

**Files:**
- Create: `src/studio/client/BriefForm.tsx`
- Create: `src/studio/client/RecommendationPicker.tsx`
- Modify: `src/studio/client/App.tsx`
- Create: `tests/studio/brief-flow.test.tsx`

- [ ] **Step 1: Write the user-flow test**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../../src/studio/client/App";

describe("brief flow", () => {
  it("submits a brief and displays three recommendations", async () => {
    render(<App />);
    await userEvent.type(screen.getByLabelText("项目名称"), "文件转换工具");
    await userEvent.click(screen.getByRole("button", { name: "生成三套方案" }));
    expect(await screen.findAllByRole("button", { name: /采用方案/ })).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Verify red**

Run: `pnpm vitest run tests/studio/brief-flow.test.tsx`

Expected: FAIL because the form is absent.

- [ ] **Step 3: Implement both screens**

```tsx
// BriefForm.tsx
import { FormEvent, useState } from "react";
import { Brief } from "../../core/recommend";
export function BriefForm({ onSubmit }: { onSubmit: (brief: Brief) => void }) {
  const [title, setTitle] = useState("");
  function submit(event: FormEvent) { event.preventDefault(); onSubmit({ id: title.trim().toLowerCase().replace(/\s+/g, "-") || "untitled", title, productFunction: "conversion", surfaces: ["web", "desktop", "pptx"], seriousness: "playful" }); }
  return <form onSubmit={submit}><label>项目名称<input aria-label="项目名称" required value={title} onChange={(event) => setTitle(event.target.value)} /></label><button>生成三套方案</button></form>;
}
```

```tsx
// RecommendationPicker.tsx
import { Recommendation } from "../../core/recommend";
export function RecommendationPicker({ items, onSelect }: { items: Recommendation[]; onSelect: (id: string) => void }) {
  return <section><h2>推荐方案</h2><div className="cards">{items.map((item) => <article key={item.id}><h3>{item.persona} × {item.theme}</h3><p>{item.rationale}</p><button onClick={() => onSelect(item.id)}>采用方案 {item.id.slice(-1)}</button></article>)}</div></section>;
}
```

```tsx
// App.tsx at the end of Task 3
import { useReducer } from "react";
import { BriefForm } from "./BriefForm";
import { initialEditorState, reduceEditor } from "./editor-state";
import { RecommendationPicker } from "./RecommendationPicker";
const steps = ["项目简报", "推荐方案", "设计编辑", "渲染验收", "导出交付"];
export function App() {
  const [state, dispatch] = useReducer(reduceEditor, initialEditorState);
  return <div className="studio"><aside><h1>幻想鼠 UI</h1>{steps.map((step, index) => <button key={step}>{index + 1}. {step}</button>)}</aside><main>{state.step === "brief" && <BriefForm onSubmit={(brief) => dispatch({ type: "brief-submitted", brief })} />}{state.step === "recommendations" && <RecommendationPicker items={state.recommendations} onSelect={(id) => dispatch({ type: "recommendation-selected", id })} />}{state.step === "editor" && <p>方案已编译，进入设计编辑。</p>}</main></div>;
}
```

- [ ] **Step 4: Verify and commit**

Run: `pnpm vitest run tests/studio/brief-flow.test.tsx tests/studio/editor-state.test.ts && pnpm typecheck`

Expected: all tests pass.

```bash
git add src/studio/client tests/studio/brief-flow.test.tsx
git commit -m "feat: add brief and recommendation workflow"
```

### Task 4: Add recipe editing and multi-surface state preview

**Files:**
- Create: `src/studio/client/RecipeEditor.tsx`
- Create: `src/studio/client/SurfacePreview.tsx`
- Modify: `src/studio/client/App.tsx`
- Create: `tests/studio/editor-preview.test.tsx`

- [ ] **Step 1: Write preview behavior test**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { RecipeEditor } from "../../src/studio/client/RecipeEditor";
import recipe from "../../examples/recipes/file-converter.json";

describe("RecipeEditor", () => {
  it("switches surface and state without changing identity anchors", async () => {
    render(<RecipeEditor initialRecipe={recipe} onChange={() => undefined} />);
    await userEvent.click(screen.getByRole("button", { name: "PPT" }));
    await userEvent.selectOptions(screen.getByLabelText("状态"), "failure");
    expect(screen.getByTestId("preview")).toHaveTextContent("PPT");
    expect(screen.getByTestId("preview")).toHaveTextContent("dream-collapsed");
    expect(screen.getByTestId("identity-anchors")).toHaveTextContent("toothy-smile");
  });
});
```

- [ ] **Step 2: Verify red**

Run: `pnpm vitest run tests/studio/editor-preview.test.tsx`

Expected: FAIL because editor components do not exist.

- [ ] **Step 3: Implement focused editor and preview components**

```tsx
// SurfacePreview.tsx
import { Recipe, StateName, Surface } from "../../core/schema";
export function SurfacePreview({ recipe, surface, state }: { recipe: Recipe; surface: Surface; state: StateName }) {
  const design = recipe.states[state];
  return <div data-testid="preview"><strong>{surface === "pptx" ? "PPT" : surface}</strong><h3>{design?.fantasyRole ?? "earnest-helper"}</h3><p>{design?.copy ?? state}</p><small data-testid="identity-anchors">{recipe.identityAnchors.join(" · ")}</small></div>;
}
```

```tsx
// RecipeEditor.tsx
import { useState } from "react";
import { Recipe, StateName, Surface } from "../../core/schema";
import { SurfacePreview } from "./SurfacePreview";
export function RecipeEditor({ initialRecipe, onChange }: { initialRecipe: Recipe; onChange: (recipe: Recipe) => void }) {
  const [surface, setSurface] = useState<Surface>(initialRecipe.surfaces[0]!);
  const [state, setState] = useState<StateName>("processing");
  return <section><div>{initialRecipe.surfaces.map((item) => <button key={item} onClick={() => setSurface(item)}>{item === "pptx" ? "PPT" : item}</button>)}</div><label>状态<select aria-label="状态" value={state} onChange={(event) => setState(event.target.value as StateName)}>{Object.keys(initialRecipe.states).map((item) => <option key={item}>{item}</option>)}</select></label><SurfacePreview recipe={initialRecipe} surface={surface} state={state} /><button onClick={() => onChange(initialRecipe)}>保存设计</button></section>;
}
```

Replace the Task 3 `App` with this complete editor-aware version:

```tsx
import { useReducer } from "react";
import { BriefForm } from "./BriefForm";
import { initialEditorState, reduceEditor } from "./editor-state";
import { RecipeEditor } from "./RecipeEditor";
import { RecommendationPicker } from "./RecommendationPicker";
const steps = ["项目简报", "推荐方案", "设计编辑", "渲染验收", "导出交付"];
export function App() {
  const [state, dispatch] = useReducer(reduceEditor, initialEditorState);
  return <div className="studio"><aside><h1>幻想鼠 UI</h1>{steps.map((step, index) => <button key={step}>{index + 1}. {step}</button>)}</aside><main>{state.step === "brief" && <BriefForm onSubmit={(brief) => dispatch({ type: "brief-submitted", brief })} />}{state.step === "recommendations" && <RecommendationPicker items={state.recommendations} onSelect={(id) => dispatch({ type: "recommendation-selected", id })} />}{state.step === "editor" && state.recipe && <RecipeEditor initialRecipe={state.recipe} onChange={(recipe) => dispatch({ type: "recipe-updated", recipe })} />}</main></div>;
}
```

- [ ] **Step 4: Verify and commit**

Run: `pnpm vitest run tests/studio/editor-preview.test.tsx && pnpm typecheck`

Expected: one passing test and zero TypeScript errors.

```bash
git add src/studio/client/RecipeEditor.tsx src/studio/client/SurfacePreview.tsx src/studio/client/App.tsx tests/studio/editor-preview.test.tsx
git commit -m "feat: edit and preview project recipes"
```

### Task 5: Persist projects atomically behind a local API

**Files:**
- Create: `src/studio/project-store.ts`
- Create: `src/studio/server.ts`
- Create: `tests/studio/project-store.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Install local API CORS support**

Run: `pnpm add @fastify/cors`

Expected: lockfile updates successfully.

- [ ] **Step 2: Write atomic persistence tests**

```ts
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ProjectStore } from "../../src/studio/project-store";
import recipe from "../../examples/recipes/file-converter.json";

describe("ProjectStore", () => {
  it("round-trips a validated recipe", async () => {
    const root = await mkdtemp(join(tmpdir(), "mouse-studio-"));
    const store = new ProjectStore(root);
    await store.save(recipe);
    expect(await store.load(recipe.id)).toEqual(recipe);
    expect(JSON.parse(await readFile(join(root, recipe.id, "mouse-ui-project.json"), "utf8"))).toEqual(recipe);
  });
  it("rejects invalid recipes before writing", async () => {
    const root = await mkdtemp(join(tmpdir(), "mouse-studio-"));
    await expect(new ProjectStore(root).save({ id: "broken" })).rejects.toThrow("Invalid recipe");
  });
});
```

- [ ] **Step 3: Verify red**

Run: `pnpm vitest run tests/studio/project-store.test.ts`

Expected: FAIL because store does not exist.

- [ ] **Step 4: Implement store and API**

```ts
// project-store.ts
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Recipe } from "../core/schema.js";
import { validateRecipe } from "../core/validate.js";
export class ProjectStore {
  constructor(private readonly root: string) {}
  async save(input: unknown): Promise<Recipe> { const result = validateRecipe(input); if (!result.ok) throw new Error(`Invalid recipe: ${result.errors.join("; ")}`); const dir = join(this.root, result.value.id); await mkdir(dir, { recursive: true }); const target = join(dir, "mouse-ui-project.json"); const temp = `${target}.tmp`; await writeFile(temp, `${JSON.stringify(result.value, null, 2)}\n`); await rename(temp, target); return result.value; }
  async load(id: string): Promise<Recipe> { const parsed: unknown = JSON.parse(await readFile(join(this.root, id, "mouse-ui-project.json"), "utf8")); const result = validateRecipe(parsed); if (!result.ok) throw new Error(`Stored recipe invalid: ${result.errors.join("; ")}`); return result.value; }
}
```

```ts
// server.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { resolve } from "node:path";
import { ProjectStore } from "./project-store.js";
const app = Fastify({ logger: true });
await app.register(cors, { origin: "http://127.0.0.1:4173" });
await app.register(fastifyStatic, { root: resolve("dist/studio") });
const store = new ProjectStore(resolve(process.env.MOUSE_UI_PROJECTS ?? "projects"));
app.post("/api/projects", async (request, reply) => { try { return await store.save(request.body); } catch (error) { return reply.code(400).send({ error: String(error) }); } });
app.get<{ Params: { id: string } }>("/api/projects/:id", async (request, reply) => { try { return await store.load(request.params.id); } catch (error) { return reply.code(404).send({ error: String(error) }); } });
await app.listen({ host: "127.0.0.1", port: Number(process.env.PORT ?? 4174) });
```

- [ ] **Step 5: Add server script, verify, and commit**

Add: `"studio:server": "tsx src/studio/server.ts"`.

Run: `pnpm vitest run tests/studio/project-store.test.ts && pnpm typecheck`

Expected: two passing tests and zero TypeScript errors.

```bash
git add src/studio/project-store.ts src/studio/server.ts tests/studio/project-store.test.ts package.json
git commit -m "feat: persist validated studio projects"
```

### Task 6: Verify the complete studio in a real browser

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/studio.spec.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing browser flow**

```ts
import { expect, test } from "@playwright/test";
test("brief to editable preview", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("项目名称").fill("文件转换工具");
  await page.getByRole("button", { name: "生成三套方案" }).click();
  await expect(page.getByRole("button", { name: /采用方案/ })).toHaveCount(3);
  await page.getByRole("button", { name: "采用方案 1" }).click();
  await expect(page.getByTestId("identity-anchors")).toContainText("toothy-smile");
  await page.getByRole("button", { name: "PPT" }).click();
  await expect(page.getByTestId("preview")).toContainText("PPT");
});
```

- [ ] **Step 2: Configure Playwright**

```ts
import { defineConfig } from "@playwright/test";
export default defineConfig({ testDir: "tests/e2e", use: { baseURL: "http://127.0.0.1:4173", screenshot: "only-on-failure" }, webServer: [{ command: "pnpm studio:server", port: 4174, reuseExistingServer: false }, { command: "pnpm studio:dev --host 127.0.0.1", port: 4173, reuseExistingServer: false }] });
```

- [ ] **Step 3: Add script and run the red browser test**

Add: `"test:e2e": "playwright test"`.

Run: `pnpm test:e2e`

Expected: FAIL at any integration wiring still missing from `App.tsx`.

- [ ] **Step 4: Add validated save feedback to `App.tsx`**

Replace `App.tsx` with this complete persisted editor flow:

```tsx
import { useReducer, useState } from "react";
import { BriefForm } from "./BriefForm";
import { initialEditorState, reduceEditor } from "./editor-state";
import { RecipeEditor } from "./RecipeEditor";
import { RecommendationPicker } from "./RecommendationPicker";
const steps = ["项目简报", "推荐方案", "设计编辑", "渲染验收", "导出交付"];
export function App() {
  const [state, dispatch] = useReducer(reduceEditor, initialEditorState);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  async function save(recipe: NonNullable<typeof state.recipe>) { dispatch({ type: "recipe-updated", recipe }); setSaveStatus("saving"); try { const response = await fetch("http://127.0.0.1:4174/api/projects", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(recipe) }); if (!response.ok) throw new Error(await response.text()); setSaveStatus("saved"); } catch { setSaveStatus("failed"); } }
  return <div className="studio"><aside><h1>幻想鼠 UI</h1>{steps.map((step, index) => <button key={step}>{index + 1}. {step}</button>)}</aside><main>{state.step === "brief" && <BriefForm onSubmit={(brief) => dispatch({ type: "brief-submitted", brief })} />}{state.step === "recommendations" && <RecommendationPicker items={state.recommendations} onSelect={(id) => dispatch({ type: "recommendation-selected", id })} />}{state.step === "editor" && state.recipe && <><RecipeEditor initialRecipe={state.recipe} onChange={save} />{saveStatus === "saved" && <p role="status">项目已保存</p>}{saveStatus === "failed" && <p role="alert">保存失败，请检查本地服务</p>}</>}</main></div>;
}
```

- [ ] **Step 5: Run full studio gates and commit**

Run: `pnpm test && pnpm typecheck && pnpm studio:build && pnpm test:e2e`

Expected: all unit and browser tests pass, typecheck is clean, and Vite builds successfully.

```bash
git add src/studio/client/App.tsx playwright.config.ts tests/e2e/studio.spec.ts package.json
git commit -m "test: verify complete local studio flow"
```
