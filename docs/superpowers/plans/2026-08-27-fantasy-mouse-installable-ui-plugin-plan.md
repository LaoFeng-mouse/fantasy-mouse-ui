# Fantasy Mouse Installable UI Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a self-contained, installable Fantasy Mouse UI plugin that visually grounds every capable Agent in the real character assets, translates an arbitrary software or workflow brief into the approved character-led design language, and produces a functional editable frontend or an honest capability handoff.

**Architecture:** The repository remains the source of truth. `plugins/fantasy-mouse-ui/` contains a valid Codex plugin manifest, one canonical model-neutral Skill, visual-grounding assets and manifests, workflow and QA references, zero-dependency validation scripts, a frontend starter, and thin platform adapters. The plugin always establishes character identity from images before interpreting workflow semantics; the Studio and existing renderers remain examples and consumers, not prerequisites.

**Tech Stack:** Codex plugin manifest, Markdown Skills, JSON Schema, Node.js ESM scripts, TypeScript/Vitest repository tests, existing React/Vite renderers, built-in image viewing/generation, real-browser and screenshot QA.

---

## Locked product rules

- A capable Agent must inspect the canonical and approved derivative images before visual design. Text-only reconstruction is a failed invocation.
- The canonical character image defines identity. Approved derivatives define permitted variation. Written principles define character-to-interface translation. The target workflow defines product behavior.
- Default chest `V/U` means one clasped hand pair. Action hands remove it completely. Exactly one coherent hand pair is visible.
- The generated result preserves real product functions, data boundaries, primary actions, and terminal/recovery states.
- The visual language applies to the whole interface. A generic SaaS page with a mascot pasted on top fails.
- Primary interactions must run with realistic local data. A moodboard, screenshot, or character-only image is not a completed frontend.
- Private references may be viewed by the local plugin but never enter a public export.
- 乐不思鼠 contributes only the explicitly imported hand-anatomy rule. Its pages, learning flow, terminology, data, and business rules are forbidden inputs.
- Agents without image inspection stop before style selection and emit `visual-grounding-unavailable`.
- Agents without code/rendering capability emit a precise handoff and never claim a runnable or visually accepted result.

## File map

- `plugins/fantasy-mouse-ui/.codex-plugin/plugin.json`: installable Codex manifest.
- `plugins/fantasy-mouse-ui/skills/fantasy-mouse-ui/SKILL.md`: canonical invocation workflow.
- `plugins/fantasy-mouse-ui/references/visual-grounding.md`: image authority, invariants, hand anatomy, and character-to-interface mapping.
- `plugins/fantasy-mouse-ui/references/workflow-to-ui.md`: product/workflow extraction and state-to-character translation.
- `plugins/fantasy-mouse-ui/references/qa.md`: functional, visual, accessibility, editability, and rights gates.
- `plugins/fantasy-mouse-ui/protocol/workflow-brief.schema.json`: model-neutral workflow input.
- `plugins/fantasy-mouse-ui/protocol/mouse-ui-project.schema.json`: bundled canonical project recipe schema.
- `plugins/fantasy-mouse-ui/assets/visual-grounding/manifest.json`: exact image roles, hashes, dimensions, and publication boundaries.
- `plugins/fantasy-mouse-ui/assets/visual-grounding/*.png`: canonical identity, approved action-hand anatomy, and explicitly scoped composition references.
- `plugins/fantasy-mouse-ui/assets/frontend-starter/*`: dependency-free functional starter copied and transformed by an Agent.
- `plugins/fantasy-mouse-ui/scripts/verify-bundle.mjs`: zero-dependency manifest/hash/dimension validation.
- `plugins/fantasy-mouse-ui/scripts/validate-workflow.mjs`: zero-dependency workflow-brief validation.
- `plugins/fantasy-mouse-ui/adapters/*`: generic, Claude, Gemini, and DeepSeek entrypoints that defer to the same Skill/protocol.
- `tests/plugin/*`: manifest, grounding, workflow, template, adapter, and package tests.
- `scripts/package-fantasy-mouse-plugin.ts`: deterministic private-local plugin ZIP.

### Task 1: Scaffold and validate the plugin boundary

**Files:**
- Create: `plugins/fantasy-mouse-ui/.codex-plugin/plugin.json`
- Create: `plugins/fantasy-mouse-ui/skills/`
- Create: `plugins/fantasy-mouse-ui/assets/`
- Create: `plugins/fantasy-mouse-ui/scripts/`
- Create: `tests/plugin/plugin-manifest.test.ts`

- [ ] **Step 1: Write the failing manifest test**

```ts
import manifest from "../../plugins/fantasy-mouse-ui/.codex-plugin/plugin.json" with { type: "json" };
import { access } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Fantasy Mouse installable plugin", () => {
  it("declares one discoverable canonical Skill without fake integrations", async () => {
    expect(manifest.name).toBe("fantasy-mouse-ui");
    expect(manifest.version).toMatch(/^0\.1\.0(?:\+codex\.[a-z0-9-]+)?$/);
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.interface.displayName).toBe("Fantasy Mouse UI");
    expect(manifest.interface.capabilities).toEqual(
      expect.arrayContaining(["UI Design", "Frontend", "Workflow Translation"])
    );
    expect(manifest).not.toHaveProperty("mcpServers");
    expect(manifest).not.toHaveProperty("apps");
    await access("plugins/fantasy-mouse-ui/skills");
  });
});
```

- [ ] **Step 2: Run RED**

Run: `pnpm vitest run tests/plugin/plugin-manifest.test.ts`

Expected: fail because the plugin directory does not exist.

- [ ] **Step 3: Scaffold with the official helper and replace defaults**

Run from `C:\Users\34615\.codex\skills\.system\plugin-creator`:

```powershell
python scripts/create_basic_plugin.py fantasy-mouse-ui --path "C:\Users\34615\Documents\Codex\2026-08-21\wo-x\.worktrees\fantasy-mouse\plugins" --with-skills --with-assets --with-scripts
```

Set `.codex-plugin/plugin.json` to:

```json
{
  "name": "fantasy-mouse-ui",
  "version": "0.1.0",
  "description": "Create functional character-grounded Fantasy Mouse UI, frontends, presentations, and workflow designs.",
  "author": { "name": "Fantasy Mouse UI project" },
  "keywords": ["ui-design", "frontend", "workflow", "fantasy-mouse"],
  "skills": "./skills/",
  "interface": {
    "displayName": "Fantasy Mouse UI",
    "shortDescription": "Turn real workflows into complete Fantasy Mouse interfaces",
    "longDescription": "Visually ground an Agent in the approved character, translate software functions and states into a coherent character-led design system, build the primary interaction path, and verify rendered output.",
    "developerName": "Fantasy Mouse UI project",
    "category": "Design",
    "capabilities": ["UI Design", "Frontend", "Workflow Translation"],
    "defaultPrompt": [
      "Use Fantasy Mouse UI to redesign this software workflow.",
      "Build a functional Fantasy Mouse frontend for this brief.",
      "Turn this presentation into a Fantasy Mouse design."
    ],
    "brandColor": "#A8D25F"
  }
}
```

- [ ] **Step 4: Validate and commit**

Run:

```powershell
python C:\Users\34615\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py plugins\fantasy-mouse-ui
pnpm vitest run tests/plugin/plugin-manifest.test.ts
git diff --check
```

Commit: `feat: scaffold fantasy mouse ui plugin`

### Task 2: Bundle mandatory visual grounding

**Files:**
- Create: `plugins/fantasy-mouse-ui/assets/visual-grounding/manifest.json`
- Create: `plugins/fantasy-mouse-ui/assets/visual-grounding/canonical-protagonist.png`
- Create: `plugins/fantasy-mouse-ui/assets/visual-grounding/processing-action-hands.png`
- Create: `plugins/fantasy-mouse-ui/assets/visual-grounding/processing-with-bubble.png`
- Create: `plugins/fantasy-mouse-ui/assets/visual-grounding/processing-without-bubble.png`
- Create: `plugins/fantasy-mouse-ui/scripts/verify-bundle.mjs`
- Create: `tests/plugin/visual-grounding.test.ts`

- [ ] **Step 1: Write RED bundle tests**

```ts
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import manifest from "../../plugins/fantasy-mouse-ui/assets/visual-grounding/manifest.json" with { type: "json" };
import { describe, expect, it } from "vitest";
const execFileAsync = promisify(execFile);

it("pins each visual reference to an explicit authority scope", async () => {
  expect(manifest.assets.map((asset) => asset.role)).toEqual([
    "canonical-identity",
    "approved-action-hand-pose",
    "composition-only-with-bubble",
    "composition-only-without-bubble"
  ]);
  expect(manifest.assets.every((asset) => asset.publication === "private-reference-only")).toBe(true);
  const { stdout } = await execFileAsync(process.execPath, [
    "plugins/fantasy-mouse-ui/scripts/verify-bundle.mjs"
  ]);
  expect(JSON.parse(stdout)).toEqual({ ok: true, assets: 4 });
});
```

- [ ] **Step 2: Run RED**

Run: `pnpm vitest run tests/plugin/visual-grounding.test.ts`

Expected: fail because the visual bundle and verifier do not exist.

- [ ] **Step 3: Copy exact approved bytes and write manifest**

Copy without image recompression:

```text
docs/design-references/fantasy-mouse-canonical-prototype.png
  -> assets/visual-grounding/canonical-protagonist.png
src/studio/assets/processing-chief-engineer.png
  -> assets/visual-grounding/processing-action-hands.png
docs/design-references/fantasy-mouse-processing-with-bubble.png
  -> assets/visual-grounding/processing-with-bubble.png
docs/design-references/fantasy-mouse-processing-without-bubble.png
  -> assets/visual-grounding/processing-without-bubble.png
```

The manifest records the exact current SHA-256 values and a per-asset authority scope. Both composition-only images must declare `anatomyAuthority: false` and the known exclusion `do-not-copy-chest-v-u-when-action-hands-exist`; the corrected action-hand image is the only positive processing anatomy authority.

```text
canonical-protagonist.png = 4C85BCE3AD50F33FC04BBF05147EFD96ED0BAE98866C12E1DB5E7096C8557316
processing-action-hands.png = A22C3E5EBA3E4F417075F54F38DA3D7B6E177D294D42ED627F350AB38C7652A1
processing-with-bubble.png = 68376DD901AE3D10A311CBCA6BD06ED8D86A7BD58F8B24069203358711577EA5
processing-without-bubble.png = 7C8461D4DC13319C60AFDA34525B70F3C6467B07D40CA9A987217AB489FFD401
```

`verify-bundle.mjs` resolves every path under the plugin root, rejects symlinks and path escape, hashes bytes, reads PNG width/height from IHDR, and prints only bounded JSON.

- [ ] **Step 4: Verify exact bytes and commit**

Run:

```powershell
node plugins/fantasy-mouse-ui/scripts/verify-bundle.mjs
pnpm vitest run tests/plugin/visual-grounding.test.ts
git diff --check
```

Commit: `feat: bundle fantasy mouse visual grounding`

### Task 3: Define the canonical image-first Skill

**Files:**
- Create: `plugins/fantasy-mouse-ui/skills/fantasy-mouse-ui/SKILL.md`
- Create: `plugins/fantasy-mouse-ui/references/visual-grounding.md`
- Create: `plugins/fantasy-mouse-ui/references/workflow-to-ui.md`
- Create: `plugins/fantasy-mouse-ui/references/qa.md`
- Create: `tests/plugin/skill-contract.test.ts`

- [ ] **Step 1: Write RED contract tests**

```ts
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

it("requires images before style and a working product before completion", async () => {
  const skill = await readFile("plugins/fantasy-mouse-ui/skills/fantasy-mouse-ui/SKILL.md", "utf8");
  expect(skill).toContain("view every required visual-grounding image");
  expect(skill).toContain("visual-grounding-unavailable");
  expect(skill).toContain("exactly one coherent hand pair");
  expect(skill).toContain("implement the primary interaction path");
  expect(skill).toContain("same comparison input");
  expect(skill).toContain("generic UI with a mascot pasted on top");
});
```

- [ ] **Step 2: Run RED**

Run: `pnpm vitest run tests/plugin/skill-contract.test.ts`

Expected: fail because the canonical Skill does not exist.

- [ ] **Step 3: Write the Skill and progressive references**

The Skill must use imperative steps in this order:

1. Verify the bundle script.
2. Read `visual-grounding.md` and view every manifest image with the host's real image-viewing capability.
3. Stop with `visual-grounding-unavailable` if images cannot be viewed.
4. Inspect the target project, screenshot, URL, deck, or workflow source.
5. Create a valid workflow brief covering purpose, users, entities, screens, actions, state transitions, constraints, and surfaces.
6. Write the project-specific character-to-interface translation table.
7. Propose three coherent directions only when the user has not selected one.
8. Generate or edit real source using the closest existing product patterns and the bundled starter only when no project exists.
9. Implement the primary interaction path and applicable loading/empty/error/blocked/success/recovery states.
10. Use real assets; never draw mascot anatomy with CSS/SVG/emoji.
11. Run the output, capture screenshots, combine references and output in the same comparison input, repair defects, and retain honest gates.
12. Export editable source, workflow brief, recipe, rationale, evidence, and handoff.

Keep `SKILL.md` under 500 lines. Put detailed image anatomy, translation examples, workflow extraction, and QA matrices in the three references.

- [ ] **Step 4: Validate and commit**

Run:

```powershell
python C:\Users\34615\.codex\skills\.system\skill-creator\scripts\quick_validate.py plugins\fantasy-mouse-ui\skills\fantasy-mouse-ui
pnpm vitest run tests/plugin/skill-contract.test.ts
git diff --check
```

Commit: `feat: define image-first fantasy mouse skill`

### Task 4: Add workflow protocol and functional starter

**Files:**
- Create: `plugins/fantasy-mouse-ui/protocol/workflow-brief.schema.json`
- Copy: `protocol/mouse-ui-project.schema.json` to `plugins/fantasy-mouse-ui/protocol/mouse-ui-project.schema.json`
- Create: `plugins/fantasy-mouse-ui/scripts/validate-workflow.mjs`
- Create: `plugins/fantasy-mouse-ui/assets/frontend-starter/index.html`
- Create: `plugins/fantasy-mouse-ui/assets/frontend-starter/styles.css`
- Create: `plugins/fantasy-mouse-ui/assets/frontend-starter/app.js`
- Create: `tests/plugin/workflow-protocol.test.ts`
- Create: `tests/plugin/frontend-starter.test.ts`

- [ ] **Step 1: Write RED workflow and starter tests**

```ts
const validWorkflow = {
  protocolVersion: 1,
  id: "expense-approval",
  purpose: "Review and approve employee expenses",
  users: ["finance-reviewer"],
  entities: ["expense-report"],
  screens: [{ id: "queue", purpose: "Review pending reports" }],
  actions: [{ id: "approve", label: "Approve", kind: "primary", from: "review", to: "success" }],
  states: ["loading", "empty", "review", "blocked", "success", "failure"],
  primaryJourney: ["queue", "approve"],
  surfaces: ["web"],
  constraints: ["approval reason is required for rejection"]
};
```

Assert the validator accepts this object, rejects missing actions or states, and never substitutes file-converter semantics. Assert the starter contains a real button, form/input, status region, and state transition in `app.js`, but contains no fixed product title, fixed fantasy role, inline SVG, emoji mascot, or accepted claim.

- [ ] **Step 2: Run RED**

Run: `pnpm vitest run tests/plugin/workflow-protocol.test.ts tests/plugin/frontend-starter.test.ts`

Expected: fail because the workflow protocol and starter do not exist.

- [ ] **Step 3: Implement the model-neutral boundary**

`workflow-brief.schema.json` requires:

```text
protocolVersion, id, purpose, users, entities, screens, actions,
states, primaryJourney, surfaces, constraints
```

Each action declares `id`, `label`, `kind`, `from`, and `to`. IDs use lower-case hyphen-case. `validate-workflow.mjs <path>` rejects unknown properties, duplicate IDs, missing primary-journey references, and transitions whose states are undeclared. It prints JSON and never exposes an absolute path or stack.

The dependency-free starter provides semantic regions, tokens, visible focus, 44 px controls, status announcements, one form input, one primary action, and a small state machine. It is deliberately content-neutral. The invoking Agent must replace all sample labels and state mapping from the validated workflow brief.

- [ ] **Step 4: Verify and commit**

Run:

```powershell
pnpm vitest run tests/plugin/workflow-protocol.test.ts tests/plugin/frontend-starter.test.ts
pnpm typecheck
git diff --check
```

Commit: `feat: add workflow protocol and frontend starter`

### Task 5: Export thin cross-Agent adapters and package

**Files:**
- Create: `plugins/fantasy-mouse-ui/adapters/generic/AGENT.md`
- Create: `plugins/fantasy-mouse-ui/adapters/claude/SKILL.md`
- Create: `plugins/fantasy-mouse-ui/adapters/gemini/SKILL.md`
- Create: `plugins/fantasy-mouse-ui/adapters/deepseek/SKILL.md`
- Create: `scripts/package-fantasy-mouse-plugin.ts`
- Create: `tests/plugin/adapters.test.ts`
- Create: `tests/plugin/package.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write RED adapter and package tests**

Assert every adapter points to the same canonical Skill, workflow schema, visual-grounding manifest, image-first requirement, hand rule, and honest capability handoff. Assert no adapter redefines colors, character identity, or workflow semantics.

Package into `dist/plugin/fantasy-mouse-ui-private-local.zip`. Assert the ZIP contains `.codex-plugin/plugin.json`, the canonical Skill, all references, schemas, scripts, frontend starter, adapters, and all four hash-pinned visual assets. Assert it excludes repository work outputs, canonical source paths outside the plugin, tests, Git metadata, and unrelated product content.

- [ ] **Step 2: Run RED**

Run: `pnpm vitest run tests/plugin/adapters.test.ts tests/plugin/package.test.ts`

Expected: fail because adapters and packager do not exist.

- [ ] **Step 3: Implement thin adapters and deterministic ZIP**

Adapters contain only platform loading instructions and capability names. They defer all semantics to `skills/fantasy-mouse-ui/SKILL.md` and bundled references.

The packager sorts archive paths, fixes timestamps, writes UTF-8/LF text, preserves PNG bytes, and names the artifact `private-local` because it includes private visual authority. It must not produce or imply a public distribution package.

Add scripts:

```json
{
  "plugin:verify": "node plugins/fantasy-mouse-ui/scripts/verify-bundle.mjs",
  "plugin:package": "tsx scripts/package-fantasy-mouse-plugin.ts"
}
```

- [ ] **Step 4: Validate and commit**

Run:

```powershell
pnpm plugin:verify
pnpm plugin:package
python C:\Users\34615\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py plugins\fantasy-mouse-ui
pnpm vitest run tests/plugin
git diff --check
```

Commit: `feat: package model-neutral fantasy mouse plugin`

### Task 6: Forward-test different UI and workflow requests

**Files:**
- Create only ignored evidence under: `work/plugin-forward-tests/`
- Modify plugin files only when a test exposes a transferable defect.

- [ ] **Step 1: Verify clean baseline and prepare isolated evidence roots**

Run: `pnpm test && pnpm typecheck && pnpm studio:build && git status --short`

Expected: tracked worktree clean; all existing suites pass.

- [ ] **Step 2: Run fresh-Agent functional Web test**

Give a fresh visual-capable Agent only the packaged plugin and this request:

```text
Use Fantasy Mouse UI to build a responsive expense-approval frontend for a finance reviewer. It needs a pending queue, receipt detail, approve/reject actions, a required rejection reason, loading, empty, blocked, success, and failure states. Use realistic local data and make the primary path work.
```

The Agent must inspect the bundled images, write a workflow brief and translation table, create runnable source, exercise approve/reject, capture desktop/mobile screenshots, and avoid file-converter or 乐不思鼠 semantics.

- [ ] **Step 3: Run fresh-Agent unrelated workflow test**

Give a second fresh Agent only the packaged plugin and this request:

```text
Use Fantasy Mouse UI to build a local desktop-style batch photo renamer. It needs file selection, naming-rule preview, conflict detection, processing progress, cancel, success, and recoverable failure. Do not use an upload/conversion metaphor unless the workflow itself requires it.
```

Require runnable source and screenshots. The result must derive a new role/prop mapping from the workflow rather than repeat the chief-engineer lever composition.

- [ ] **Step 4: Run capability-limited adapter test**

Give a text-only Agent the generic adapter and a presentation redesign request. It must parse the workflow but stop before style selection with `visual-grounding-unavailable`. Treat any invented visual claim as failure.

- [ ] **Step 5: Review each task twice**

For each forward test, dispatch a specification reviewer first and a code-quality reviewer second. Fix Critical and Important plugin defects, rebuild the ZIP, and rerun the affected fresh-Agent test. Do not teach the test Agent the expected output beyond the raw plugin and user request.

- [ ] **Step 6: Visual comparison gate**

For each visual-capable output, place the canonical image, approved action-hand reference, selected composition reference, and rendered desktop/mobile screenshots in the same comparison input. Check:

```text
identity, exactly one hand pair, workflow-specific role/props, whole-interface visual DNA,
real primary interactions, state clarity, hierarchy, clipping, overflow, contrast,
focus, typography, borders, shadows, and absence of unrelated business semantics
```

Owner acceptance remains pending until the user inspects the final comparison.

### Task 7: Completion and optional personal installation

**Files:**
- Modify only files required by final review findings.

- [ ] **Step 1: Run complete verification**

Run:

```powershell
pnpm test
pnpm typecheck
pnpm studio:build
pnpm plugin:verify
pnpm plugin:package
python C:\Users\34615\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py plugins\fantasy-mouse-ui
git diff --check
git status --short
```

- [ ] **Step 2: Final independent review**

Review the full implementation range against the approved design specification and this plan. Resolve every Critical or Important issue and rerun complete verification.

- [ ] **Step 3: Commit the verified source**

Commit: `feat: deliver installable fantasy mouse ui plugin`

- [ ] **Step 4: Install only with explicit user confirmation**

After the user approves the comparison and asks to install, use the plugin-creator personal-marketplace scaffold/update flow. Do not hand-edit `C:\Users\34615\.agents\plugins\marketplace.json`. Copy the verified plugin to the helper-selected personal plugin path, create/update the marketplace entry through the official helper, validate again, install with the marketplace name returned by `read_marketplace_name.py`, and ask the user to test it in a new task.

The implementation is complete when the repository contains a validated private-local plugin ZIP, two materially different fresh visual Agents produce functional workflow-specific interfaces from it, a capability-limited Agent fails honestly, all automated gates pass, and the Owner has been shown the same-input visual comparisons. Personal installation is a separate explicit approval boundary.
