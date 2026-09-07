# Fantasy Mouse UI Open-Source Release Implementation Plan

> **Historical record:** This v0.1.0 plan was executed. Its unchecked boxes are retained as the original execution script, and its blanket visual-asset MIT assumptions were superseded by the packaged [`ASSET_PROVENANCE.md`](../../../plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the verified private-local Fantasy Mouse UI plugin into an MIT-licensed public GitHub marketplace plugin with a deterministic release ZIP and copy-paste AI deployment instructions.

**Architecture:** Preserve the existing character, style-independence, verifier, and fail-closed packaging architecture. Change only the publication-rights contract, add an embedded license and repository marketplace, then publish the tested `main` branch and release artifact through GitHub CLI. Installation documentation treats Codex marketplace loading and adapter-based generic loading as separate host routes.

**Tech Stack:** Node.js 24, TypeScript, Vitest, pnpm, Codex plugin CLI, Python plugin validators, Git, GitHub CLI.

---

## File map

- `plugins/fantasy-mouse-ui/assets/visual-grounding/manifest.json`: public publication scope for the four pinned images.
- `plugins/fantasy-mouse-ui/scripts/verify-bundle.mjs`: immutable verifier trust root for the same scope.
- `plugins/fantasy-mouse-ui/LICENSE`: license carried inside the standalone ZIP.
- `LICENSE`: repository-level MIT license.
- `scripts/package-fantasy-mouse-plugin.ts`: public archive filename and 20-file allowlist.
- `.agents/plugins/marketplace.json`: repository marketplace metadata.
- `INSTALL_WITH_AI.md`: manual installation and copy-paste Chinese/English AI deployment prompts.
- `docs/assets/sponsor-qr.jpg`: user-supplied optional WeChat support image, outside plugin authority and packaging.
- `tests/plugin/visual-grounding.test.ts`: public asset-rights contract.
- `tests/plugin/skill-contract.test.ts`: public Skill/reference language contract.
- `tests/plugin/package.test.ts`: public archive name, embedded license, and deterministic package contract.
- `tests/plugin/plugin-manifest.test.ts`: repository marketplace and AI installer contract.
- `README.md`, `AGENTS.md`, `CONTEXT.md`, `docs/*.md`, canonical Skill and references: active public-release instructions.

### Task 1: Lock the public-rights contract with failing tests

**Files:**
- Modify: `tests/plugin/visual-grounding.test.ts`
- Modify: `tests/plugin/skill-contract.test.ts`
- Modify: `tests/plugin/package.test.ts`
- Modify: `tests/plugin/plugin-manifest.test.ts`

- [ ] **Step 1: Change visual-grounding expectations to the approved public scope**

Replace the private publication assertion with:

```ts
expect(
  manifest.assets.every(
    (asset) => asset.publication === "open-source-distributable"
  )
).toBe(true);
```

- [ ] **Step 2: Change Skill/reference expectations to public-release language**

Rename the test to `locks visual authority, hand anatomy, and open-source scope` and assert:

```ts
expect(visual).toContain("open-source-distributable");
expect(visual).toContain("MIT License");
expect(visual).not.toContain("private-reference-only");

expect(qa).toContain("Bundled visual-grounding assets are distributed under the repository MIT License");
expect(qa).not.toContain("public rights claim");
```

- [ ] **Step 3: Change package expectations to the public artifact**

Use:

```ts
const outputUrl = new URL(
  "../../dist/plugin/fantasy-mouse-ui.zip",
  import.meta.url,
);

describe("public plugin package", () => {
```

Add `LICENSE` to the required entries and assert:

```ts
expect(names).toContain("LICENSE");
expect(
  entries.find(({ name }) => name === "LICENSE")!.data.toString("utf8")
).toContain("MIT License");
expect(asset.publication).toBe("open-source-distributable");
```

- [ ] **Step 4: Add repository marketplace and AI installer tests**

Change the existing Node filesystem import to `import { readFileSync, statSync } from "node:fs";`, then append:

```ts
import { readFileSync } from "node:fs";

it("publishes a repository marketplace entry", () => {
  const marketplace = JSON.parse(
    readFileSync(new URL("../../.agents/plugins/marketplace.json", import.meta.url), "utf8")
  );
  expect(marketplace).toEqual({
    name: "fantasy-mouse-ui",
    interface: { displayName: "Fantasy Mouse UI" },
    plugins: [{
      name: "fantasy-mouse-ui",
      source: { source: "local", path: "./plugins/fantasy-mouse-ui" },
      policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
      category: "Design"
    }]
  });
});

it("ships an AI-executable deployment prompt", () => {
  const guide = readFileSync(new URL("../../INSTALL_WITH_AI.md", import.meta.url), "utf8");
  expect(guide).toContain("codex plugin marketplace add");
  expect(guide).toContain("adapters/generic/AGENT.md");
  expect(guide).toContain('{"ok":true,"assets":4}');
  expect(guide).toContain("不要只复制单个 SKILL.md");
  expect(guide).toContain("Do not copy only SKILL.md");
});

it("presents optional support outside the plugin bundle", () => {
  const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
  expect(readme).toContain("## Support / 支持");
  expect(readme).toContain("欢迎请鼠鼠吃根小鱼干，纯自愿");
  expect(readme).toContain("docs/assets/sponsor-qr.jpg");
  expect(
    statSync(new URL("../../docs/assets/sponsor-qr.jpg", import.meta.url)).isFile()
  ).toBe(true);
});
```

In the package-content test, add:

```ts
expect(names).not.toContain("docs/assets/sponsor-qr.jpg");
expect(names.some((name) => name.includes("sponsor-qr"))).toBe(false);
```

- [ ] **Step 5: Run focused tests and verify RED**

Run:

```powershell
pnpm vitest run tests/plugin/visual-grounding.test.ts tests/plugin/skill-contract.test.ts tests/plugin/package.test.ts tests/plugin/plugin-manifest.test.ts
```

Expected: failures mention the old `private-reference-only` scope, missing `fantasy-mouse-ui.zip`, missing `LICENSE`, missing marketplace manifest, missing `INSTALL_WITH_AI.md`, and missing support image/README section.

- [ ] **Step 6: Commit the RED contract**

```powershell
git add tests/plugin
git commit -m "test: define public plugin release contract"
```

### Task 2: Implement public asset rights without weakening authority

**Files:**
- Modify: `plugins/fantasy-mouse-ui/assets/visual-grounding/manifest.json`
- Modify: `plugins/fantasy-mouse-ui/scripts/verify-bundle.mjs`
- Modify: `plugins/fantasy-mouse-ui/references/visual-grounding.md`
- Modify: `plugins/fantasy-mouse-ui/references/qa.md`
- Modify: `plugins/fantasy-mouse-ui/skills/fantasy-mouse-ui/SKILL.md`
- Modify: `CONTEXT.md`

- [ ] **Step 1: Change only the publication field in both trust sources**

For all four assets in the manifest and `EXPECTED_ASSETS`, replace:

```text
private-reference-only
```

with:

```text
open-source-distributable
```

Do not alter paths, roles, hashes, dimensions, authority flags, hand rules, or known exclusions.

- [ ] **Step 2: Reconcile canonical rights instructions**

Use this exact rule in `references/visual-grounding.md`:

```markdown
Every bundled asset is `open-source-distributable` under the repository MIT License. Public redistribution is permitted with the license notice; asset publication does not make compositions a universal UI-style authority.
```

Use this exact rule in `references/qa.md`:

```markdown
Bundled visual-grounding assets are distributed under the repository MIT License. Preserve the license notice when redistributing the plugin or its assets, and do not claim that publication expands an asset's declared identity, anatomy, or composition authority.
```

Replace the final private-rights warning in the canonical Skill with:

```markdown
Preserve the bundled MIT License in redistributed copies and report any third-party target-project asset limitations separately.
```

Change `CONTEXT.md` so the canonical image is described as `open-source-distributable under the MIT License` while retaining its dimensions, hash, and highest identity authority.

- [ ] **Step 3: Run focused rights tests and bundle verification**

```powershell
pnpm vitest run tests/plugin/visual-grounding.test.ts tests/plugin/skill-contract.test.ts
pnpm plugin:verify
```

Expected: rights tests pass and verifier prints `{"ok":true,"assets":4}`.

- [ ] **Step 4: Commit public rights implementation**

```powershell
git add CONTEXT.md plugins/fantasy-mouse-ui tests/plugin/visual-grounding.test.ts tests/plugin/skill-contract.test.ts
git commit -m "feat: authorize public visual bundle distribution"
```

### Task 3: Produce a licensed deterministic public ZIP

**Files:**
- Create: `LICENSE`
- Create: `plugins/fantasy-mouse-ui/LICENSE`
- Modify: `scripts/package-fantasy-mouse-plugin.ts`
- Modify: `tests/plugin/package.test.ts`

- [ ] **Step 1: Add the MIT license**

Create both license files with the standard MIT License text headed:

```text
MIT License

Copyright (c) 2026 LaoFeng-mouse
```

The two files must be byte-identical after LF normalization.

- [ ] **Step 2: Update the package output and allowlist**

Change the output leaf and emitted JSON to `fantasy-mouse-ui.zip`, and add this entry to `ALLOWED_PLUGIN_FILES`:

```ts
"LICENSE",
```

- [ ] **Step 3: Run package tests and verify GREEN**

```powershell
pnpm vitest run tests/plugin/package.test.ts
```

Expected: all package tests pass, including deterministic bytes, embedded license, open-source publication fields, and fail-closed source checks.

- [ ] **Step 4: Package twice and compare hashes**

```powershell
pnpm plugin:package
$first = (Get-FileHash -Algorithm SHA256 dist\plugin\fantasy-mouse-ui.zip).Hash
pnpm plugin:package
$second = (Get-FileHash -Algorithm SHA256 dist\plugin\fantasy-mouse-ui.zip).Hash
if ($first -ne $second) { throw "nondeterministic-package" }
```

Expected: no exception and identical uppercase SHA-256 values.

- [ ] **Step 5: Commit the public package**

```powershell
git add LICENSE plugins/fantasy-mouse-ui/LICENSE scripts/package-fantasy-mouse-plugin.ts tests/plugin/package.test.ts
git commit -m "feat: package licensed public plugin"
```

### Task 4: Add repository marketplace and AI deployment prompt

**Files:**
- Create: `.agents/plugins/marketplace.json`
- Create: `INSTALL_WITH_AI.md`
- Modify: `tests/plugin/plugin-manifest.test.ts`

- [ ] **Step 1: Create the repository marketplace manifest**

Use exactly:

```json
{
  "name": "fantasy-mouse-ui",
  "interface": { "displayName": "Fantasy Mouse UI" },
  "plugins": [
    {
      "name": "fantasy-mouse-ui",
      "source": { "source": "local", "path": "./plugins/fantasy-mouse-ui" },
      "policy": { "installation": "AVAILABLE", "authentication": "ON_INSTALL" },
      "category": "Design"
    }
  ]
}
```

- [ ] **Step 2: Verify live Codex CLI syntax before documenting it**

```powershell
codex plugin marketplace add --help
codex plugin add --help
```

Record only syntax accepted by this CLI. The intended repository URL is `https://github.com/LaoFeng-mouse/fantasy-mouse-ui`.

- [ ] **Step 3: Create `INSTALL_WITH_AI.md`**

Include a Chinese prompt whose operational core is:

```text
请部署 Fantasy Mouse UI 插件，仓库为 https://github.com/LaoFeng-mouse/fantasy-mouse-ui 。先识别当前 Agent 类型。Codex 使用仓库 marketplace；Claude、Gemini、DeepSeek 使用对应 adapters；其他 Agent 使用 adapters/generic/AGENT.md。必须安装完整插件目录，不要只复制单个 SKILL.md。安装后运行 scripts/verify-bundle.mjs，只有得到 {"ok":true,"assets":4} 才能报告素材验证通过。请返回实际安装目录、使用的命令、验证输出，以及是否必须新建会话。
```

Add an English prompt with the same requirements and include manual Release ZIP instructions.

- [ ] **Step 4: Run marketplace and installer tests**

```powershell
pnpm vitest run tests/plugin/plugin-manifest.test.ts
py -3 C:\Users\34615\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py plugins\fantasy-mouse-ui
```

Expected: tests and plugin validation pass.

- [ ] **Step 5: Commit distribution metadata**

```powershell
git add .agents/plugins/marketplace.json INSTALL_WITH_AI.md tests/plugin/plugin-manifest.test.ts
git commit -m "feat: add marketplace and ai installer"
```

### Task 5: Reconcile public documentation and local installation

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `docs/architecture.md`
- Modify: `docs/handoff.md`
- Modify: `docs/integration-guide.md`
- Modify: `docs/operator-runbook.md`
- Modify: `package.json`
- Create: `docs/assets/sponsor-qr.jpg`
- Update deployed copy: `C:\Users\34615\plugins\fantasy-mouse-ui`

- [ ] **Step 1: Add the FlyingMouse-style optional support section**

Copy the newly supplied image and verify its exact source hash:

```powershell
$sourceQr = 'C:\Users\34615\AppData\Local\Temp\codex-clipboard-361aae2c-d599-4361-b8c0-c15bba6759b4.jpg'
if ((Get-FileHash -Algorithm SHA256 -LiteralPath $sourceQr).Hash -ne '01EFD13E907D4745DF9D7F492E0B2969E11FFB8DF8586D2EC385E7506AFE68DB') { throw 'unexpected-support-image' }
New-Item -ItemType Directory -Force docs\assets | Out-Null
Copy-Item -LiteralPath $sourceQr -Destination docs\assets\sponsor-qr.jpg
```

Add this section near the end of `README.md`:

```markdown
## Support / 支持

Fantasy Mouse UI is free and open source. If it helped you, you can buy Mouse a dried fish — completely optional. / Fantasy Mouse UI 免费开源。如果它帮到了你，欢迎请鼠鼠吃根小鱼干，纯自愿。

![WeChat payment QR / 微信收款码](docs/assets/sponsor-qr.jpg)
```

Do not place the QR image under `plugins/fantasy-mouse-ui/`, its visual manifest, or the release ZIP allowlist.

- [ ] **Step 2: Replace active private-release wording**

Document `fantasy-mouse-ui.zip`, MIT redistribution, repository marketplace installation, Release ZIP installation, and `INSTALL_WITH_AI.md`. Remove active instructions containing `private-reference-only`, `private-local`, `Never publish`, or “not cleared for public redistribution”. Keep `package.json` field `"private": true` because it prevents accidental npm publication and does not restrict the MIT repository license.

- [ ] **Step 3: Scan for contradictory active guidance**

```powershell
rg -n "private-reference-only|private-local|Never publish|not cleared for public redistribution|Do not publish" README.md AGENTS.md CONTEXT.md docs plugins scripts tests
```

Expected: no active private-publication rule remains; historical design/plan wording may remain only inside the approved release design and implementation plan.

- [ ] **Step 4: Run all local repository gates**

```powershell
pnpm test
pnpm typecheck
pnpm plugin:verify
pnpm plugin:package
git diff --check
py -3 C:\Users\34615\.codex\skills\.system\skill-creator\scripts\quick_validate.py plugins\fantasy-mouse-ui\skills\fantasy-mouse-ui
py -3 C:\Users\34615\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py plugins\fantasy-mouse-ui
```

Expected: 0 failures, the Windows FIFO test may be skipped, bundle verification reports 4 assets, both official validators pass, and the public ZIP is emitted.

- [ ] **Step 5: Commit documentation and support presentation**

```powershell
git add README.md AGENTS.md CONTEXT.md docs package.json
git commit -m "docs: publish open source installation guide"
```

- [ ] **Step 6: Refresh the local personal plugin through the supported flow**

Copy the canonical 20 plugin files to `C:\Users\34615\plugins\fantasy-mouse-ui`, run the cachebuster helper, read the personal marketplace name, and reinstall:

```powershell
py -3 C:\Users\34615\.codex\skills\.system\plugin-creator\scripts\update_plugin_cachebuster.py C:\Users\34615\plugins\fantasy-mouse-ui
$market = py -3 C:\Users\34615\.codex\skills\.system\plugin-creator\scripts\read_marketplace_name.py
codex plugin add "fantasy-mouse-ui@$market"
```

Validate the installed cache with the official plugin validator and `scripts/verify-bundle.mjs`. Report that a new task is required for the refreshed Skill to load.

### Task 6: Publish and verify GitHub repository and Release

**Files:**
- Git remote: `origin`
- GitHub repository: `LaoFeng-mouse/fantasy-mouse-ui`
- GitHub Release: `v0.1.0`
- Release asset: `dist/plugin/fantasy-mouse-ui.zip`

- [ ] **Step 1: Run final clean-source verification**

```powershell
git status --short
git log -1 --oneline
pnpm test
pnpm typecheck
pnpm plugin:verify
pnpm plugin:package
git diff --check
```

Expected: clean status, all gates pass, and the public archive is freshly generated.

- [ ] **Step 2: Re-authenticate GitHub CLI**

```powershell
gh auth status
gh auth login -h github.com -w
gh auth status
```

Expected: active authenticated account `LaoFeng-mouse`. If authentication is not restored, stop before creating external state.

- [ ] **Step 3: Check repository identity before creation**

```powershell
gh repo view LaoFeng-mouse/fantasy-mouse-ui --json nameWithOwner,visibility,url
```

If absent, create it public from the current repository:

```powershell
gh repo create LaoFeng-mouse/fantasy-mouse-ui --public --source . --remote origin --description "Model-neutral Fantasy Mouse UI design plugin for Codex, Claude, Gemini, DeepSeek, and generic Agents"
```

If it exists, verify it belongs to `LaoFeng-mouse` before setting or using `origin`.

- [ ] **Step 4: Push only `main`**

```powershell
git push -u origin main
```

Do not use `--all`; the dirty legacy branch must remain local.

- [ ] **Step 5: Create tag and release with the verified ZIP**

```powershell
git tag -a v0.1.0 -m "Fantasy Mouse UI v0.1.0"
git push origin v0.1.0
gh release create v0.1.0 dist\plugin\fantasy-mouse-ui.zip --repo LaoFeng-mouse/fantasy-mouse-ui --title "Fantasy Mouse UI v0.1.0" --notes "First MIT-licensed public release with Codex marketplace metadata, cross-agent adapters, four approved visual authority assets, and AI-assisted installation instructions."
```

- [ ] **Step 6: Verify live GitHub state and downloaded bytes**

```powershell
gh repo view LaoFeng-mouse/fantasy-mouse-ui --json nameWithOwner,visibility,url,defaultBranchRef
gh release view v0.1.0 --repo LaoFeng-mouse/fantasy-mouse-ui --json tagName,url,assets
$download = Join-Path ([System.IO.Path]::GetTempPath()) 'fantasy-mouse-ui-v0.1.0.zip'
gh release download v0.1.0 --repo LaoFeng-mouse/fantasy-mouse-ui --pattern fantasy-mouse-ui.zip --output $download --clobber
$localHash = (Get-FileHash -Algorithm SHA256 dist\plugin\fantasy-mouse-ui.zip).Hash
$remoteHash = (Get-FileHash -Algorithm SHA256 $download).Hash
if ($localHash -ne $remoteHash) { throw "release-hash-mismatch" }
```

Expected: visibility `PUBLIC`, default branch `main`, release tag `v0.1.0`, one `fantasy-mouse-ui.zip` asset, and matching hashes.

- [ ] **Step 7: Record final evidence**

Report the repository URL, release URL, commit, tag, ZIP SHA-256, test counts, validator results, local installation status, and the required new-task boundary. Do not claim a marketplace install from GitHub unless that exact remote route was tested.
