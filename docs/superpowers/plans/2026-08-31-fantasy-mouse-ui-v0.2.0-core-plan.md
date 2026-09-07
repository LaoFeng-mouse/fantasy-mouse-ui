# Fantasy Mouse UI v0.2.0 Core Contracts Implementation Plan

> **Status:** Completed for v0.2.0. Unchecked boxes are retained as the original execution script, not as current pending work.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add machine-verifiable Fast, Standard, and Strict execution modes, truthful packaged provenance, and the expanded deterministic plugin contract.

**Architecture:** Keep one canonical Skill and four thin host adapters. A zero-dependency resolver reads a strict JSON mode profile, applies explicit Strict triggers, refuses silent downgrade, and returns bounded JSON; provenance and asset-rights metadata travel inside the plugin ZIP.

**Tech Stack:** Node.js 24 ESM, JSON Schema draft 2020-12, TypeScript, Vitest, deterministic stored ZIP packaging.

---

## File map

- Create `plugins/fantasy-mouse-ui/config/execution-modes.json`: canonical machine-readable mode profiles and escalation triggers.
- Create `plugins/fantasy-mouse-ui/protocol/execution-modes.schema.json`: structural contract for the mode profile.
- Create `plugins/fantasy-mouse-ui/scripts/resolve-mode.mjs`: zero-dependency CLI resolver and validator.
- Create `plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md`: packaged source history, license separation, and contact route.
- Modify root `LICENSE` and `plugins/fantasy-mouse-ui/LICENSE`: retain the MIT grant for software code while pointing bundled character imagery to the separate provenance terms.
- Create `tests/plugin/execution-modes.test.ts`: profile, resolver, Skill, and adapter contract tests.
- Modify `plugins/fantasy-mouse-ui/skills/fantasy-mouse-ui/SKILL.md`: select/declare a mode before the shared workflow and branch requirements without duplicating the whole Skill.
- Modify all four files under `plugins/fantasy-mouse-ui/adapters/`: route to the mode config and resolver while remaining thin.
- Modify `plugins/fantasy-mouse-ui/assets/visual-grounding/manifest.json` and `scripts/verify-bundle.mjs`: replace the unsupported blanket MIT-publication claim with disclosed unverified-source metadata without weakening hashes or authority.
- Modify `references/visual-grounding.md`, `references/qa.md`, root `README.md`, `CONTEXT.md`, `docs/architecture.md`, `docs/integration-guide.md`, `docs/operator-runbook.md`, and `INSTALL_WITH_AI.md`: align active rights and inventory language.
- Modify `scripts/package-fantasy-mouse-plugin.ts`: expand the exact allowlist from 20 to 24 files.
- Modify `tests/plugin/skill-contract.test.ts`, `adapters.test.ts`, `visual-grounding.test.ts`, `package.test.ts`, and `plugin-manifest.test.ts`: lock the new contract.

### Task 1: Lock the mode profile with failing tests

**Files:**
- Create: `tests/plugin/execution-modes.test.ts`
- Create: `plugins/fantasy-mouse-ui/config/execution-modes.json`
- Create: `plugins/fantasy-mouse-ui/protocol/execution-modes.schema.json`

- [ ] **Step 1: Write the failing profile test**

Add this first test before creating either JSON file:

```ts
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const root = new URL("../../plugins/fantasy-mouse-ui/", import.meta.url);
const readJson = async (path: string) =>
  JSON.parse(await readFile(new URL(path, root), "utf8")) as Record<string, unknown>;

describe("Fantasy Mouse execution modes", () => {
  it("defines one default and three bounded profiles", async () => {
    const config = await readJson("config/execution-modes.json") as {
      schemaVersion: number;
      defaultMode: string;
      strictTriggers: string[];
      modes: Record<string, { required: string[]; mayOmit: string[] }>;
    };
    expect(config.schemaVersion).toBe(1);
    expect(config.defaultMode).toBe("standard");
    expect(Object.keys(config.modes)).toEqual(["fast", "standard", "strict"]);
    expect(config.strictTriggers).toEqual(expect.arrayContaining([
      "public-benchmark", "formal-release", "permissions",
      "financial", "medical", "destructive", "multi-page"
    ]));
    for (const invariant of [
      "declare-mode", "verify-bundle", "view-required-images",
      "inspect-target-source", "derive-product-style",
      "produce-editable-output", "honest-evidence"
    ]) {
      for (const profile of Object.values(config.modes)) {
        expect(profile.required).toContain(invariant);
      }
    }
  });
});
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run:

```powershell
pnpm vitest run tests/plugin/execution-modes.test.ts
```

Expected: FAIL with `ENOENT` for `config/execution-modes.json`.

- [ ] **Step 3: Add the canonical configuration**

Create `execution-modes.json` with exactly this top-level shape and ordered mode keys:

```json
{
  "$schema": "../protocol/execution-modes.schema.json",
  "schemaVersion": 1,
  "defaultMode": "standard",
  "strictTriggers": ["public-benchmark", "formal-release", "permissions", "financial", "medical", "destructive", "multi-page"],
  "modes": {
    "fast": {
      "label": "Fast",
      "required": ["declare-mode", "verify-bundle", "view-required-images", "inspect-target-source", "derive-product-style", "produce-editable-output", "open-or-render", "focused-visual-qa", "honest-evidence"],
      "mayOmit": ["three-direction-gate", "complete-state-matrix", "formal-benchmark-package", "long-form-handoff"]
    },
    "standard": {
      "label": "Standard",
      "required": ["declare-mode", "verify-bundle", "view-required-images", "inspect-target-source", "workflow-brief", "derive-character-role", "derive-product-style", "primary-journey", "key-states", "responsive-behavior", "baseline-accessibility", "produce-editable-output", "open-or-render", "screenshot-comparison", "honest-evidence"],
      "mayOmit": ["exhaustive-threat-states", "formal-release-package"]
    },
    "strict": {
      "label": "Strict",
      "required": ["declare-mode", "verify-bundle", "view-required-images", "inspect-target-source", "protocol-validation", "workflow-brief", "derive-character-role", "derive-product-style", "direction-gate", "all-applicable-states", "keyboard-access", "contrast-check", "recovery-paths", "produce-editable-output", "run-real-target", "same-context-comparison", "anti-template-comparison", "provenance", "full-evidence-package", "honest-evidence"],
      "mayOmit": []
    }
  }
}
```

- [ ] **Step 4: Add the JSON Schema**

The schema must set `additionalProperties: false`, require the five top-level fields, constrain `defaultMode` and mode keys to `fast|standard|strict`, require non-empty unique string arrays, and require exactly `label`, `required`, and `mayOmit` inside each profile.

- [ ] **Step 5: Run the focused test**

Run: `pnpm vitest run tests/plugin/execution-modes.test.ts`

Expected: PASS for the profile test.

- [ ] **Step 6: Commit the profile contract**

```powershell
git add tests/plugin/execution-modes.test.ts plugins/fantasy-mouse-ui/config/execution-modes.json plugins/fantasy-mouse-ui/protocol/execution-modes.schema.json
git commit -m "feat: define Fantasy Mouse execution modes"
```

### Task 2: Implement the zero-dependency mode resolver

**Files:**
- Create: `plugins/fantasy-mouse-ui/scripts/resolve-mode.mjs`
- Modify: `tests/plugin/execution-modes.test.ts`

- [ ] **Step 1: Add failing resolver tests**

Test these exact invocations with `execFile(process.execPath, [resolver, ...args])`:

```ts
it.each([
  { args: [], mode: "standard", reason: "default" },
  { args: ["--requested", "fast"], mode: "fast", reason: "requested:fast" },
  { args: ["--requested", "fast", "--trigger", "public-benchmark"], mode: "strict", reason: "trigger:public-benchmark" },
  { args: ["--requested", "standard", "--trigger", "medical"], mode: "strict", reason: "trigger:medical" }
])("resolves $args", async ({ args, mode, reason }) => {
  const result = await execFileAsync(process.execPath, [resolver, ...args]);
  expect(JSON.parse(result.stdout)).toMatchObject({ ok: true, mode, reason });
});
```

Also require invalid modes, unknown triggers, duplicate flags, missing values, and conflicting requested flags to exit 1 with bounded JSON `{ "ok": false, "error": "..." }` and no absolute paths.

- [ ] **Step 2: Verify the tests fail because the resolver is absent**

Run: `pnpm vitest run tests/plugin/execution-modes.test.ts`

Expected: FAIL with `MODULE_NOT_FOUND` for `resolve-mode.mjs`.

- [ ] **Step 3: Implement the resolver**

The resolver must:

```js
const rank = { fast: 0, standard: 1, strict: 2 };
const requested = parsed.requested ?? config.defaultMode;
const strictTrigger = parsed.triggers.find((value) => config.strictTriggers.includes(value));
const mode = strictTrigger ? "strict" : requested;
const reason = strictTrigger ? `trigger:${strictTrigger}` : parsed.requested ? `requested:${requested}` : "default";
process.stdout.write(`${JSON.stringify({ ok: true, mode, reason, upgradedFrom: rank[mode] > rank[requested] ? requested : null })}\n`);
```

Before resolving, validate the loaded config's exact keys, schema version, array uniqueness, known mode names, and required shared invariants. Read configuration relative to `import.meta.url`; never accept an arbitrary config path.

- [ ] **Step 4: Run focused and full tests**

Run:

```powershell
pnpm vitest run tests/plugin/execution-modes.test.ts
pnpm test
```

Expected: resolver tests PASS; existing suite remains green.

- [ ] **Step 5: Commit the resolver**

```powershell
git add plugins/fantasy-mouse-ui/scripts/resolve-mode.mjs tests/plugin/execution-modes.test.ts
git commit -m "feat: resolve Fantasy Mouse execution mode"
```

### Task 3: Route the canonical Skill and adapters through the mode contract

**Files:**
- Modify: `plugins/fantasy-mouse-ui/skills/fantasy-mouse-ui/SKILL.md`
- Modify: `plugins/fantasy-mouse-ui/adapters/generic/AGENT.md`
- Modify: `plugins/fantasy-mouse-ui/adapters/claude/SKILL.md`
- Modify: `plugins/fantasy-mouse-ui/adapters/gemini/SKILL.md`
- Modify: `plugins/fantasy-mouse-ui/adapters/deepseek/SKILL.md`
- Modify: `tests/plugin/execution-modes.test.ts`
- Modify: `tests/plugin/adapters.test.ts`

- [ ] **Step 1: Add failing text-contract assertions**

Require the canonical Skill to contain, in order:

```ts
expectOrdered(skill, [
  "Resolve the execution mode",
  "state the selected mode and reason",
  "Fast",
  "Standard",
  "Strict",
  "Verify the bundle"
]);
expect(skill).toContain("may upgrade but must not silently downgrade");
expect(skill).toContain("public-benchmark");
```

Require every adapter to reference both `../../config/execution-modes.json` and `../../scripts/resolve-mode.mjs`, while staying at or below 60 lines and deferring semantics to the canonical Skill.

- [ ] **Step 2: Run tests and observe the missing-contract failure**

Run: `pnpm vitest run tests/plugin/execution-modes.test.ts tests/plugin/adapters.test.ts`

Expected: FAIL on missing resolver/config references and mode declaration text.

- [ ] **Step 3: Add a compact preflight before the existing twelve steps**

The Skill preflight must instruct the Agent to run:

```text
node scripts/resolve-mode.mjs [--requested fast|standard|strict] [--trigger <known-trigger> ...]
```

It must state the returned mode and reason, use the profile's `required` and `mayOmit` lists, keep the existing twelve sections as the Strict path, and explain Fast/Standard compression without duplicating all sections.

- [ ] **Step 4: Update each adapter as a routing wrapper**

Insert mode resolution before bundle verification and retain the existing image-viewing and one-hand-pair guards. Do not add palettes, UI layouts, business rules, or host APIs.

- [ ] **Step 5: Run focused and full tests**

Run:

```powershell
pnpm vitest run tests/plugin/execution-modes.test.ts tests/plugin/adapters.test.ts tests/plugin/skill-contract.test.ts
pnpm test
```

Expected: all pass.

- [ ] **Step 6: Commit Skill integration**

```powershell
git add plugins/fantasy-mouse-ui/skills plugins/fantasy-mouse-ui/adapters tests/plugin
git commit -m "feat: route design work through execution modes"
```

### Task 4: Correct asset provenance and rights metadata

**Files:**
- Create: `plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md`
- Modify: `plugins/fantasy-mouse-ui/assets/visual-grounding/manifest.json`
- Modify: `plugins/fantasy-mouse-ui/scripts/verify-bundle.mjs`
- Modify: `plugins/fantasy-mouse-ui/references/visual-grounding.md`
- Modify: `plugins/fantasy-mouse-ui/references/qa.md`
- Modify: `LICENSE`
- Modify: `plugins/fantasy-mouse-ui/LICENSE`
- Modify: `tests/plugin/visual-grounding.test.ts`
- Modify: `tests/plugin/skill-contract.test.ts`

- [ ] **Step 1: Replace the old blanket-MIT assertions with failing provenance assertions**

Require:

```ts
expect(manifest.rightsPolicy).toEqual({
  codeLicense: "MIT",
  assetOrigin: "internet-meme-derived-maintainer-collage",
  underlyingAuthor: "unconfirmed",
  underlyingLicense: "unconfirmed",
  provenancePath: "ASSET_PROVENANCE.md"
});
for (const asset of manifest.assets) {
  expect(asset.publication).toBe("bundled-with-disclosed-unverified-origin");
}
```

Remove tests that require `open-source-distributable` or claim the four images are MIT-licensed.

- [ ] **Step 2: Run focused tests and verify failure on the old metadata**

Run: `pnpm vitest run tests/plugin/visual-grounding.test.ts tests/plugin/skill-contract.test.ts`

Expected: FAIL because the manifest still says `open-source-distributable`.

- [ ] **Step 3: Write packaged provenance**

Use the approved factual statement:

```markdown
The character assets originate from internet meme material and were personally collaged, drawn, and produced by the project maintainer. The original authors and license status of the underlying internet material have not been confirmed.
```

Then state that the repository software code is MIT-licensed, the statement does not declare the source material copyright-free or grant third-party rights, and rights holders may open a GitHub issue or contact the repository owner for review/takedown.

- [ ] **Step 4: Bound the MIT license to software code**

Preserve the standard MIT text and copyright line in both license files, then append a short asset notice. In root `LICENSE`, link to `plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md`; inside the packaged plugin `LICENSE`, link to `ASSET_PROVENANCE.md`:

```text
This MIT License applies to the software code in this repository/package. Bundled character imagery is not represented as MIT-licensed third-party source material; see <path-to-ASSET_PROVENANCE.md> for its disclosed origin and unconfirmed underlying license status.
```

Replace `<path-to-ASSET_PROVENANCE.md>` with the path appropriate to each license file. Add a test that both license files retain `Permission is hereby granted`, contain the asset notice, and resolve their provenance link to an existing file. Do not describe the images as public domain, copyright-free, or relicensed by the maintainer.

- [ ] **Step 5: Update manifest and verifier trust root together**

Change rights metadata only. Preserve all four paths, hashes, dimensions, identity/anatomy authority, hand rule, and composition exclusions exactly.

- [ ] **Step 6: Update visual-grounding and QA wording**

Replace active claims that the images are MIT-distributable with the packaged provenance reference and unconfirmed underlying-license statement. Keep the code-license requirement separate.

- [ ] **Step 7: Run bundle and contract tests**

Run:

```powershell
pnpm plugin:verify
pnpm vitest run tests/plugin/visual-grounding.test.ts tests/plugin/skill-contract.test.ts
```

Expected: verifier still prints `{"ok":true,"assets":4}`; focused tests pass.

- [ ] **Step 8: Commit provenance correction**

```powershell
git add LICENSE plugins/fantasy-mouse-ui/LICENSE plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md plugins/fantasy-mouse-ui/assets plugins/fantasy-mouse-ui/scripts/verify-bundle.mjs plugins/fantasy-mouse-ui/references tests/plugin
git commit -m "docs: disclose Fantasy Mouse asset provenance"
```

### Task 5: Expand the deterministic package and installation inventory

**Files:**
- Modify: `scripts/package-fantasy-mouse-plugin.ts:33-55`
- Modify: `tests/plugin/package.test.ts:313-360`
- Modify: `tests/plugin/plugin-manifest.test.ts:100-122,241-292`
- Modify: `INSTALL_WITH_AI.md`
- Modify: `docs/operator-runbook.md`
- Modify: `docs/integration-guide.md`
- Modify: `README.md`
- Modify: `CONTEXT.md`
- Modify: `docs/architecture.md`

- [ ] **Step 1: Add the four new package entries to failing inventory tests**

Add these sorted entries:

```text
ASSET_PROVENANCE.md
config/execution-modes.json
protocol/execution-modes.schema.json
scripts/resolve-mode.mjs
```

Change exact inventory wording and checks from 20 to 24 files. Require the archive to include provenance and modes, and continue to reject `examples/`, tests, docs, support QR, caches, and unknown files.

- [ ] **Step 2: Run package tests and verify failure**

Run: `pnpm vitest run tests/plugin/package.test.ts tests/plugin/plugin-manifest.test.ts`

Expected: FAIL because the packager allowlist still rejects or omits the four files.

- [ ] **Step 3: Expand the packager allowlist**

Add only the four approved files to `ALLOWED_PLUGIN_FILES`. Preserve sorting, TOCTOU checks, normalized text handling, PNG byte preservation, and the 256 MiB source limit.

- [ ] **Step 4: Reconcile all active 20-file and rights statements**

Update English and Chinese installation routes to the independent exact 24-file allowlist. Replace “MIT-licensed plugin and four approved visual assets” with language that separates MIT software code from bundled, provenance-disclosed visual assets.

- [ ] **Step 5: Run packaging twice**

```powershell
pnpm plugin:package
$first = (Get-FileHash -Algorithm SHA256 dist\plugin\fantasy-mouse-ui.zip).Hash
pnpm plugin:package
$second = (Get-FileHash -Algorithm SHA256 dist\plugin\fantasy-mouse-ui.zip).Hash
if ($first -ne $second) { throw "nondeterministic package" }
```

Expected: both hashes match and package tests report exactly 24 entries.

- [ ] **Step 6: Commit package and documentation alignment**

```powershell
git add scripts tests README.md INSTALL_WITH_AI.md CONTEXT.md docs plugins/fantasy-mouse-ui
git commit -m "build: package v0.2 core contracts"
```

### Task 6: Verify the complete core phase

**Files:**
- Modify only if a failing gate reveals a defect in files owned by Tasks 1–5.

- [ ] **Step 1: Run required gates**

```powershell
pnpm test
pnpm typecheck
pnpm plugin:verify
pnpm plugin:package
git diff --check
```

Expected: all pass; only the documented Windows FIFO test may skip.

- [ ] **Step 2: Run official validators**

```powershell
py -3 -X utf8 C:\Users\34615\.codex\skills\.system\skill-creator\scripts\quick_validate.py plugins\fantasy-mouse-ui\skills\fantasy-mouse-ui
py -3 C:\Users\34615\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py plugins\fantasy-mouse-ui
```

Expected: both validators pass.

- [ ] **Step 3: Verify no benchmark entered the ZIP**

Use the existing ZIP parser test and confirm no entry begins with `examples/`.

- [ ] **Step 4: Record the phase commit**

```powershell
git status --short --branch
git log -5 --oneline
```

Expected: clean worktree with the core phase commits present.
