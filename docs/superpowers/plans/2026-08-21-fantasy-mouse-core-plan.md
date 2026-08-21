# Fantasy Mouse Core Protocol Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a model-neutral, schema-validated recipe engine that produces three coherent Fantasy Mouse UI recommendations and an explicit capability handoff.

**Architecture:** TypeBox is the single source for TypeScript types and JSON Schema. Pure core modules validate recipes, expose the first-release catalog, negotiate Agent capabilities, and compile deterministic recommendations; a thin CLI proves the core works without the studio.

**Tech Stack:** TypeScript, pnpm, TypeBox, Ajv 2020, Vitest, tsx.

---

## File map

- `package.json`: scripts and dependencies for the core.
- `tsconfig.json`: strict TypeScript configuration.
- `vitest.config.ts`: unit-test configuration.
- `src/core/schema.ts`: canonical TypeBox schemas and static types.
- `src/core/validate.ts`: compiled Ajv validator.
- `src/core/catalog.ts`: first-release personas, themes, states, and fantasy mappings.
- `src/core/capabilities.ts`: capability negotiation and handoff decisions.
- `src/core/recommend.ts`: deterministic three-option recommendation compiler.
- `src/core/compile.ts`: converts a selected recommendation into a project recipe.
- `src/cli.ts`: validate and recommend commands.
- `scripts/export-schema.ts`: emits portable JSON Schema.
- `protocol/mouse-ui-project.schema.json`: generated schema artifact.
- `examples/briefs/file-converter.json`: canonical sample brief.
- `tests/core/*.test.ts`: focused core tests.

### Task 1: Bootstrap the strict TypeScript test harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `tests/core/smoke.test.ts`

- [ ] **Step 1: Write the failing smoke test**

```ts
import { describe, expect, it } from "vitest";
import { protocolVersion } from "../../src/core/schema";

describe("core bootstrap", () => {
  it("exposes protocol version 1", () => {
    expect(protocolVersion).toBe(1);
  });
});
```

- [ ] **Step 2: Create package and compiler configuration**

```json
{
  "name": "fantasy-mouse-ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "schema:export": "tsx scripts/export-schema.ts",
    "cli": "tsx src/cli.ts"
  },
  "dependencies": {
    "@sinclair/typebox": "^0.34.41",
    "ajv": "^8.17.1",
    "ajv-formats": "^3.0.1"
  },
  "devDependencies": {
    "@types/node": "^24.3.0",
    "tsx": "^4.20.5",
    "typescript": "^5.9.2",
    "vitest": "^3.2.4"
  }
}
```

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "types": ["node", "vitest/globals"]
  },
  "include": ["src", "tests", "scripts", "vitest.config.ts"]
}
```

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({ test: { environment: "node", coverage: { reporter: ["text", "json"] } } });
```

- [ ] **Step 3: Install and verify the expected red state**

Run: `pnpm install && pnpm test -- tests/core/smoke.test.ts`

Expected: FAIL because `src/core/schema.ts` does not exist.

- [ ] **Step 4: Add the minimal protocol constant**

```ts
export const protocolVersion = 1 as const;
```

- [ ] **Step 5: Verify green and commit**

Run: `pnpm test -- tests/core/smoke.test.ts && pnpm typecheck`

Expected: one passing test and zero TypeScript errors.

```bash
git add package.json pnpm-lock.yaml tsconfig.json vitest.config.ts src/core/schema.ts tests/core/smoke.test.ts
git commit -m "build: bootstrap fantasy mouse core"
```

### Task 2: Define and validate the canonical recipe

**Files:**
- Modify: `src/core/schema.ts`
- Create: `src/core/validate.ts`
- Create: `tests/core/validate.test.ts`

- [ ] **Step 1: Write recipe validation tests**

```ts
import { describe, expect, it } from "vitest";
import { validateRecipe } from "../../src/core/validate";

const valid = {
  protocolVersion: 1,
  id: "file-converter",
  title: "文件转换工具",
  characterPack: "fantasy-mouse-original",
  identityAnchors: ["grey-round-face", "toothy-smile", "white-bean-body"],
  persona: "diligent-worker",
  theme: "bold-meme-collage",
  surfaces: ["web", "desktop", "pptx"],
  participation: "standard",
  states: { processing: { fantasyRole: "chief-engineer", copy: "正在转换文件" } },
  rights: { publicExport: true, assetIds: ["mouse-processing-standard"] },
  qa: { visual: true, accessibility: true, editable: true }
};

describe("validateRecipe", () => {
  it("accepts the canonical recipe", () => expect(validateRecipe(valid)).toEqual({ ok: true, value: valid }));
  it("rejects unknown surfaces", () => {
    const result = validateRecipe({ ...valid, surfaces: ["mobile-native"] });
    expect(result.ok).toBe(false);
  });
  it("requires at least one identity anchor", () => {
    const result = validateRecipe({ ...valid, identityAnchors: [] });
    expect(result.ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify red**

Run: `pnpm test -- tests/core/validate.test.ts`

Expected: FAIL because `validateRecipe` is undefined.

- [ ] **Step 3: Replace `schema.ts` with the complete first-release schema**

```ts
import { Static, Type } from "@sinclair/typebox";

export const protocolVersion = 1 as const;
export const SurfaceSchema = Type.Union([Type.Literal("web"), Type.Literal("desktop"), Type.Literal("pptx")]);
export const ParticipationSchema = Type.Union([Type.Literal("light"), Type.Literal("standard"), Type.Literal("immersive")]);
export const StateNameSchema = Type.Union([
  Type.Literal("idle"), Type.Literal("empty"), Type.Literal("input"), Type.Literal("analyzing"),
  Type.Literal("processing"), Type.Literal("waiting"), Type.Literal("success"), Type.Literal("celebration"),
  Type.Literal("warning"), Type.Literal("failure"), Type.Literal("permission-blocked"), Type.Literal("offline")
]);
export const StateDesignSchema = Type.Object({ fantasyRole: Type.String({ minLength: 1 }), copy: Type.String({ minLength: 1 }) });
export const RecipeSchema = Type.Object({
  protocolVersion: Type.Literal(protocolVersion),
  id: Type.String({ pattern: "^[a-z0-9-]+$" }),
  title: Type.String({ minLength: 1 }),
  characterPack: Type.String({ minLength: 1 }),
  identityAnchors: Type.Array(Type.String({ minLength: 1 }), { minItems: 1, uniqueItems: true }),
  persona: Type.String({ minLength: 1 }),
  theme: Type.String({ minLength: 1 }),
  surfaces: Type.Array(SurfaceSchema, { minItems: 1, uniqueItems: true }),
  participation: ParticipationSchema,
  states: Type.Record(StateNameSchema, StateDesignSchema),
  rights: Type.Object({ publicExport: Type.Boolean(), assetIds: Type.Array(Type.String(), { uniqueItems: true }) }),
  qa: Type.Object({ visual: Type.Boolean(), accessibility: Type.Boolean(), editable: Type.Boolean() })
}, { additionalProperties: false });

export type Recipe = Static<typeof RecipeSchema>;
export type Surface = Static<typeof SurfaceSchema>;
export type StateName = Static<typeof StateNameSchema>;
```

- [ ] **Step 4: Implement Ajv validation**

```ts
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { Recipe, RecipeSchema } from "./schema.js";

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile<Recipe>(RecipeSchema);

export type ValidationResult = { ok: true; value: Recipe } | { ok: false; errors: string[] };

export function validateRecipe(input: unknown): ValidationResult {
  if (validate(input)) return { ok: true, value: input };
  return { ok: false, errors: (validate.errors ?? []).map((error) => `${error.instancePath || "/"} ${error.message ?? "invalid"}`) };
}
```

- [ ] **Step 5: Verify and commit**

Run: `pnpm test -- tests/core/validate.test.ts && pnpm typecheck`

Expected: three passing tests and zero TypeScript errors.

```bash
git add src/core/schema.ts src/core/validate.ts tests/core/validate.test.ts
git commit -m "feat: define model-neutral recipe schema"
```

### Task 3: Implement the first-release catalog

**Files:**
- Create: `src/core/catalog.ts`
- Create: `tests/core/catalog.test.ts`

- [ ] **Step 1: Write catalog invariants**

```ts
import { describe, expect, it } from "vitest";
import { catalog, fantasyRoleFor } from "../../src/core/catalog";

describe("first-release catalog", () => {
  it("contains six personas, six themes, and twelve states", () => {
    expect(catalog.personas).toHaveLength(6);
    expect(catalog.themes).toHaveLength(6);
    expect(catalog.states).toHaveLength(12);
  });
  it("maps conversion to chief engineer", () => expect(fantasyRoleFor("conversion", "processing")).toBe("chief-engineer"));
  it("maps failure to collapsed fantasy", () => expect(fantasyRoleFor("conversion", "failure")).toBe("dream-collapsed"));
});
```

- [ ] **Step 2: Verify red**

Run: `pnpm test -- tests/core/catalog.test.ts`

Expected: FAIL because `catalog.ts` does not exist.

- [ ] **Step 3: Implement the explicit catalog**

```ts
import { StateName } from "./schema.js";

export const catalog = {
  personas: ["earnest-dreamer", "diligent-worker", "calm-technician", "gentle-companion", "heroic-achiever", "sarcastic-commentator"],
  themes: ["bold-meme-collage", "cream-scrapbook", "clean-professional", "pixel-game", "cyber-neon", "chinese-poster"],
  states: ["idle", "empty", "input", "analyzing", "processing", "waiting", "success", "celebration", "warning", "failure", "permission-blocked", "offline"] satisfies StateName[],
  character: {
    id: "fantasy-mouse-original",
    anchors: ["grey-round-face", "toothy-smile", "white-bean-body", "earnest-absurd-dreamer"]
  }
} as const;

const roles: Record<string, Partial<Record<StateName, string>>> = {
  conversion: { input: "logistics-captain", analyzing: "laboratory-scientist", processing: "chief-engineer", success: "champion", celebration: "award-winner", failure: "dream-collapsed" },
  upload: { input: "logistics-captain", processing: "cargo-commander", success: "mission-winner", failure: "dream-collapsed" },
  presentation: { analyzing: "strategy-advisor", processing: "business-leader", success: "keynote-star", failure: "dream-collapsed" }
};

export function fantasyRoleFor(productFunction: string, state: StateName): string {
  return roles[productFunction]?.[state] ?? (state === "failure" ? "dream-collapsed" : "earnest-helper");
}
```

- [ ] **Step 4: Verify and commit**

Run: `pnpm test -- tests/core/catalog.test.ts && pnpm typecheck`

Expected: three passing tests and zero TypeScript errors.

```bash
git add src/core/catalog.ts tests/core/catalog.test.ts
git commit -m "feat: add fantasy mouse design catalog"
```

### Task 4: Negotiate Agent capabilities without false completion

**Files:**
- Create: `src/core/capabilities.ts`
- Create: `tests/core/capabilities.test.ts`

- [ ] **Step 1: Write capability branch tests**

```ts
import { describe, expect, it } from "vitest";
import { negotiate } from "../../src/core/capabilities";

describe("negotiate", () => {
  it("allows full execution when all requested capabilities exist", () => {
    expect(negotiate(["web", "pptx"], { code: true, image: true, browser: true, pptx: true, filesystem: true })).toEqual({ mode: "execute", missing: [] });
  });
  it("requires handoff when pptx rendering is unavailable", () => {
    expect(negotiate(["pptx"], { code: true, image: false, browser: true, pptx: false, filesystem: true })).toEqual({ mode: "handoff", missing: ["pptx"] });
  });
  it("uses standard assets when only image generation is absent", () => {
    expect(negotiate(["web"], { code: true, image: false, browser: true, pptx: false, filesystem: true })).toEqual({ mode: "execute-with-standard-assets", missing: ["image"] });
  });
});
```

- [ ] **Step 2: Verify red**

Run: `pnpm test -- tests/core/capabilities.test.ts`

Expected: FAIL because `negotiate` does not exist.

- [ ] **Step 3: Implement capability negotiation**

```ts
import { Surface } from "./schema.js";

export type Capabilities = { code: boolean; image: boolean; browser: boolean; pptx: boolean; filesystem: boolean };
export type Negotiation = { mode: "execute" | "execute-with-standard-assets" | "handoff"; missing: string[] };

export function negotiate(surfaces: Surface[], capabilities: Capabilities): Negotiation {
  const required = new Set<string>(["code", "filesystem"]);
  if (surfaces.includes("web") || surfaces.includes("desktop")) required.add("browser");
  if (surfaces.includes("pptx")) required.add("pptx");
  const missing = [...required].filter((key) => !capabilities[key as keyof Capabilities]);
  if (missing.length > 0) return { mode: "handoff", missing };
  if (!capabilities.image) return { mode: "execute-with-standard-assets", missing: ["image"] };
  return { mode: "execute", missing: [] };
}
```

- [ ] **Step 4: Verify and commit**

Run: `pnpm test -- tests/core/capabilities.test.ts && pnpm typecheck`

Expected: three passing tests and zero TypeScript errors.

```bash
git add src/core/capabilities.ts tests/core/capabilities.test.ts
git commit -m "feat: add capability negotiation"
```

### Task 5: Recommend exactly three coherent directions

**Files:**
- Create: `src/core/recommend.ts`
- Create: `tests/core/recommend.test.ts`

- [ ] **Step 1: Write deterministic recommendation tests**

```ts
import { describe, expect, it } from "vitest";
import { recommend } from "../../src/core/recommend";

const brief = { id: "file-converter", title: "文件转换工具", productFunction: "conversion", surfaces: ["web", "desktop", "pptx"] as const, seriousness: "playful" as const };

describe("recommend", () => {
  it("returns exactly three distinct coherent options", () => {
    const options = recommend(brief);
    expect(options).toHaveLength(3);
    expect(new Set(options.map((option) => `${option.persona}:${option.theme}`)).size).toBe(3);
    expect(options.every((option) => option.states.processing.fantasyRole === "chief-engineer")).toBe(true);
  });
  it("reduces participation for serious projects", () => {
    expect(recommend({ ...brief, seriousness: "serious" }).every((option) => option.participation === "light")).toBe(true);
  });
});
```

- [ ] **Step 2: Verify red**

Run: `pnpm test -- tests/core/recommend.test.ts`

Expected: FAIL because `recommend` does not exist.

- [ ] **Step 3: Implement recommendation templates and state mapping**

```ts
import { fantasyRoleFor } from "./catalog.js";
import { ParticipationSchema, StateName, Surface } from "./schema.js";
import { Static } from "@sinclair/typebox";

type Participation = Static<typeof ParticipationSchema>;
export type Brief = { id: string; title: string; productFunction: string; surfaces: readonly Surface[]; seriousness: "playful" | "balanced" | "serious" };
export type Recommendation = { id: string; persona: string; theme: string; participation: Participation; rationale: string; states: Record<string, { fantasyRole: string; copy: string }> };

const directions = [
  ["diligent-worker", "bold-meme-collage", "保留耄耋式拼贴反差，功能反馈最鲜明"],
  ["calm-technician", "clean-professional", "降低装饰密度，适合工具型界面"],
  ["heroic-achiever", "cyber-neon", "强化幻想升级感，适合年轻化展示"]
] as const;

const requiredStates: StateName[] = ["idle", "input", "analyzing", "processing", "success", "failure"];

export function recommend(brief: Brief): Recommendation[] {
  const participation: Participation = brief.seriousness === "serious" ? "light" : "standard";
  return directions.map(([persona, theme, rationale], index) => ({
    id: `direction-${index + 1}`,
    persona,
    theme,
    participation,
    rationale,
    states: Object.fromEntries(requiredStates.map((state) => [state, { fantasyRole: fantasyRoleFor(brief.productFunction, state), copy: `${brief.title}：${state}` }]))
  }));
}
```

- [ ] **Step 4: Verify and commit**

Run: `pnpm test -- tests/core/recommend.test.ts && pnpm typecheck`

Expected: two passing tests and zero TypeScript errors.

```bash
git add src/core/recommend.ts tests/core/recommend.test.ts
git commit -m "feat: recommend three fantasy mouse directions"
```

### Task 6: Compile a recommendation into a valid recipe

**Files:**
- Create: `src/core/compile.ts`
- Create: `tests/core/compile.test.ts`
- Create: `examples/recipes/file-converter.json`

- [ ] **Step 1: Write compilation test**

```ts
import { describe, expect, it } from "vitest";
import { compileRecipe } from "../../src/core/compile";
import { validateRecipe } from "../../src/core/validate";

describe("compileRecipe", () => {
  it("produces a schema-valid public recipe", () => {
    const recipe = compileRecipe(
      { id: "file-converter", title: "文件转换工具", productFunction: "conversion", surfaces: ["web", "desktop", "pptx"], seriousness: "playful" },
      { id: "direction-1", persona: "diligent-worker", theme: "bold-meme-collage", participation: "standard", rationale: "test", states: { processing: { fantasyRole: "chief-engineer", copy: "正在转换" } } }
    );
    expect(validateRecipe(recipe).ok).toBe(true);
    expect(recipe.rights.publicExport).toBe(true);
  });
});
```

- [ ] **Step 2: Verify red**

Run: `pnpm test -- tests/core/compile.test.ts`

Expected: FAIL because `compileRecipe` does not exist.

- [ ] **Step 3: Implement compilation**

```ts
import { catalog } from "./catalog.js";
import { Brief, Recommendation } from "./recommend.js";
import { Recipe, Surface } from "./schema.js";

export function compileRecipe(brief: Brief, recommendation: Recommendation): Recipe {
  return {
    protocolVersion: 1,
    id: brief.id,
    title: brief.title,
    characterPack: catalog.character.id,
    identityAnchors: [...catalog.character.anchors],
    persona: recommendation.persona,
    theme: recommendation.theme,
    surfaces: [...brief.surfaces] as Surface[],
    participation: recommendation.participation,
    states: recommendation.states,
    rights: { publicExport: true, assetIds: [] },
    qa: { visual: true, accessibility: true, editable: true }
  };
}
```

- [ ] **Step 4: Verify and commit**

Create the canonical shared-recipe fixture from the compiled values:

```json
{
  "protocolVersion": 1,
  "id": "file-converter",
  "title": "文件转换工具",
  "characterPack": "fantasy-mouse-original",
  "identityAnchors": ["grey-round-face", "toothy-smile", "white-bean-body", "earnest-absurd-dreamer"],
  "persona": "diligent-worker",
  "theme": "bold-meme-collage",
  "surfaces": ["web", "desktop", "pptx"],
  "participation": "standard",
  "states": {
    "processing": { "fantasyRole": "chief-engineer", "copy": "正在操控格式工厂" },
    "success": { "fantasyRole": "champion", "copy": "幻想成真，转换完成" },
    "failure": { "fantasyRole": "dream-collapsed", "copy": "幻想暂时破灭，请检查文件" }
  },
  "rights": { "publicExport": true, "assetIds": [] },
  "qa": { "visual": true, "accessibility": true, "editable": true }
}
```

Run: `pnpm test -- tests/core/compile.test.ts && pnpm typecheck`

Expected: one passing test and zero TypeScript errors.

```bash
git add src/core/compile.ts tests/core/compile.test.ts examples/recipes/file-converter.json
git commit -m "feat: compile validated project recipes"
```

### Task 7: Export JSON Schema and prove the CLI workflow

**Files:**
- Create: `scripts/export-schema.ts`
- Create: `src/cli.ts`
- Create: `examples/briefs/file-converter.json`
- Create: `tests/core/cli.test.ts`
- Generate: `protocol/mouse-ui-project.schema.json`

- [ ] **Step 1: Write CLI integration test**

```ts
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("core CLI", () => {
  it("recommends three directions from the sample brief", () => {
    const output = execFileSync("pnpm", ["cli", "recommend", "examples/briefs/file-converter.json"], { encoding: "utf8", shell: process.platform === "win32" });
    expect(JSON.parse(output)).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Add the sample brief**

```json
{
  "id": "file-converter",
  "title": "文件转换工具",
  "productFunction": "conversion",
  "surfaces": ["web", "desktop", "pptx"],
  "seriousness": "playful"
}
```

- [ ] **Step 3: Verify red**

Run: `pnpm test -- tests/core/cli.test.ts`

Expected: FAIL because `src/cli.ts` does not exist.

- [ ] **Step 4: Implement schema export and CLI**

```ts
// scripts/export-schema.ts
import { mkdir, writeFile } from "node:fs/promises";
import { RecipeSchema } from "../src/core/schema.js";

await mkdir("protocol", { recursive: true });
await writeFile("protocol/mouse-ui-project.schema.json", `${JSON.stringify({ $schema: "https://json-schema.org/draft/2020-12/schema", $id: "mouse-ui-project.schema.json", ...RecipeSchema }, null, 2)}\n`);
```

```ts
// src/cli.ts
import { readFile } from "node:fs/promises";
import { recommend } from "./core/recommend.js";
import { validateRecipe } from "./core/validate.js";

const [command, filename] = process.argv.slice(2);
if (!command || !filename) throw new Error("Usage: pnpm cli <recommend|validate> <file>");
const input: unknown = JSON.parse(await readFile(filename, "utf8"));
if (command === "recommend") process.stdout.write(`${JSON.stringify(recommend(input as Parameters<typeof recommend>[0]), null, 2)}\n`);
else if (command === "validate") {
  const result = validateRecipe(input);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 1;
} else throw new Error(`Unknown command: ${command}`);
```

- [ ] **Step 5: Generate, verify all gates, and commit**

Run: `pnpm schema:export && pnpm test && pnpm typecheck && pnpm cli recommend examples/briefs/file-converter.json`

Expected: all tests pass, TypeScript reports zero errors, schema file exists, and CLI prints three recommendations.

```bash
git add scripts/export-schema.ts src/cli.ts examples/briefs/file-converter.json tests/core/cli.test.ts protocol/mouse-ui-project.schema.json
git commit -m "feat: ship portable protocol CLI"
```
