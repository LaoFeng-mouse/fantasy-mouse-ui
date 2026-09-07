# Fantasy Mouse UI Agent Usage Implementation Plan

> **Status:** Completed on `main`, including the live v0.2.0 Release-body update. Unchecked boxes are retained as the original execution script, not as current pending work.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a copy-paste-first usage path for tool-capable AI Agents to README and the v0.2.0 Release, backed by one complete Agent guide and a clearly non-shipped roadmap.

**Architecture:** README remains the result-led entrypoint and gains two short prompts; `docs/agent-usage.md` becomes the complete capability-first integration authority; `docs/roadmap.md` records future work; `docs/release-notes-0.2.0.md` remains the source used to update the live Release body. Repository contract tests enforce wording, ordering, compatibility boundaries, failure behavior, and unchanged package identity.

**Tech Stack:** Markdown, TypeScript, Vitest, pnpm, Codex plugin CLI, Git, GitHub CLI.

---

## File map

- Modify `README.md`: copy-ready usage path and compact example disclosure.
- Create `docs/agent-usage.md`: complete multi-host usage authority.
- Create `docs/roadmap.md`: planned v0.2.1/v0.3.0 improvements only.
- Modify `docs/release-notes-0.2.0.md`: source for the live Release “How to use” section.
- Modify `tests/plugin/readme-showcase.test.ts`: README ordering and prompt contract.
- Create `tests/plugin/agent-usage.test.ts`: guide, roadmap, Release-source, compatibility, and overclaim contract.

### Task 1: Add the copy-paste README path

**Files:**
- Modify: `tests/plugin/readme-showcase.test.ts`
- Modify: `README.md`

- [ ] **Step 1: Write the failing README contract**

Add constants for the fixed URL and prompt markers, then add this test:

```ts
const fixedReleaseZip =
  "https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/download/v0.2.0/fantasy-mouse-ui.zip";

it("offers copy-ready download and installed-plugin prompts before long examples", async () => {
  const readme = await readFile("README.md", "utf8");
  expectOrdered(readme, [
    "## Quick Start",
    "### Download, install, and use / 下载、安装并使用",
    fixedReleaseZip,
    "不要只复制 SKILL.md",
    "### Use an existing installation / 已安装后直接使用",
    "自动选择 Fast、Standard 或 Strict 模式",
    "### Choose a mode / 选择模式",
    "<details>",
    "More examples / 更多示例",
  ]);
  expect(readme).toContain("docs/agent-usage.md");
  expect(readme).toContain("具备文件读取、图片查看、代码执行和项目编辑能力");
  expect(readme).not.toMatch(/(?:all|every) (?:AI|chatbot|agent)/iu);
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```powershell
pnpm vitest run tests/plugin/readme-showcase.test.ts
```

Expected: FAIL because the two prompt headings and `docs/agent-usage.md` do not exist in README.

- [ ] **Step 3: Implement the README Quick Start**

Keep the gallery and GIF unchanged. Replace the current Quick Start introduction with the two approved fenced prompts:

```text
请从 https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/download/v0.2.0/fantasy-mouse-ui.zip 下载并安装完整的 Fantasy Mouse UI 插件，然后使用它为【项目路径或链接】设计【需要设计的界面】；请让插件自动选择合适模式并先说明原因，查看随包角色素材，交付可编辑源码、真实运行或渲染结果和视觉验收证据，不要只复制 SKILL.md。
```

```text
请使用 Fantasy Mouse UI 插件为【项目路径或链接】设计【需要设计的界面】；自动选择 Fast、Standard 或 Strict 模式并先说明原因，保留鼠鼠角色特征，但界面布局、配色、字体和组件必须根据当前产品重新设计，最后交付可编辑源码并真实运行或渲染检查。
```

Add the capability-bounded compatibility sentence and `docs/agent-usage.md` link. Rename the mode-table lead to `### Choose a mode / 选择模式`. Wrap the three existing mode examples in one `<details>` block whose summary is `More examples / 更多示例`; do not rewrite those accepted prompts.

- [ ] **Step 4: Run the focused test and verify success**

Run:

```powershell
pnpm vitest run tests/plugin/readme-showcase.test.ts
```

Expected: 5 tests passed.

- [ ] **Step 5: Commit the README path**

```powershell
git add README.md tests/plugin/readme-showcase.test.ts
git commit -m "docs: add copy-paste Agent usage"
```

### Task 2: Create the complete Agent usage authority

**Files:**
- Create: `tests/plugin/agent-usage.test.ts`
- Create: `docs/agent-usage.md`

- [ ] **Step 1: Write the failing guide contract**

Create `tests/plugin/agent-usage.test.ts` with:

```ts
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const fixedReleaseZip =
  "https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/download/v0.2.0/fantasy-mouse-ui.zip";

describe("Fantasy Mouse Agent usage documentation", () => {
  it("defines capability-bounded multi-host usage and honest failure behavior", async () => {
    const guide = await readFile("docs/agent-usage.md", "utf8");
    for (const marker of [
      fixedReleaseZip,
      "adapters/claude/SKILL.md",
      "adapters/gemini/SKILL.md",
      "adapters/deepseek/SKILL.md",
      "adapters/generic/AGENT.md",
      "Read files",
      "View images",
      "Run Node.js",
      "Edit the target project",
      "Run or render the target",
      "visual-grounding-unavailable",
      "## Input contract",
      "## Output contract",
      "## Install, update, and remove in Codex",
    ]) expect(guide, marker).toContain(marker);
    expect(guide).toContain("does not mean every chatbot can complete the workflow");
    expect(guide).not.toMatch(/(?:all|every) (?:AI|chatbot|agent) (?:is|are|can)/iu);
  });
});
```

- [ ] **Step 2: Run the contract and verify failure**

Run:

```powershell
pnpm vitest run tests/plugin/agent-usage.test.ts
```

Expected: FAIL with `ENOENT` for `docs/agent-usage.md`.

- [ ] **Step 3: Write `docs/agent-usage.md`**

Use these sections in order:

```markdown
# Use Fantasy Mouse UI with AI Agents
## Copy this into an Agent
## Compatibility by capability
## Install, update, and remove in Codex
## Claude, Gemini, DeepSeek, and other Agents
## Execution flow
## Choose Fast, Standard, or Strict
## Input contract
## Output contract
## Failure and downgrade behavior
## Package identity
```

Include the two approved prompts verbatim. The compatibility table must cover Read files, View images, Run Node.js, Edit the target project, Run or render the target, and Capture or inspect results. State that Codex uses Marketplace; named hosts load their matching adapter; unknown capable hosts load `adapters/generic/AGENT.md`.

Use these exact Codex operations:

```powershell
codex plugin marketplace add https://github.com/LaoFeng-mouse/fantasy-mouse-ui --json
codex plugin marketplace upgrade fantasy-mouse-ui --json
codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json
codex plugin remove fantasy-mouse-ui@fantasy-mouse-ui --json
```

Require complete plugin installation, visual bundle verification, automatic mode reason, editable output, and real run/render evidence. Preserve `visual-grounding-unavailable` as the exact no-image capability token. State that a missing target runtime leaves runtime and visual acceptance open.

- [ ] **Step 4: Run the guide contract**

Run:

```powershell
pnpm vitest run tests/plugin/agent-usage.test.ts
```

Expected: 1 test passed.

- [ ] **Step 5: Commit the guide**

```powershell
git add docs/agent-usage.md tests/plugin/agent-usage.test.ts
git commit -m "docs: add multi-Agent usage guide"
```

### Task 3: Record improvement priorities without overclaiming

**Files:**
- Modify: `tests/plugin/agent-usage.test.ts`
- Create: `docs/roadmap.md`

- [ ] **Step 1: Add the failing roadmap test**

Add:

```ts
it("labels future plugin improvements as planned rather than shipped", async () => {
  const roadmap = await readFile("docs/roadmap.md", "utf8");
  for (const marker of [
    "## Planned for v0.2.1",
    "doctor",
    "shorter canonical Skill",
    "host-capability contract",
    "USE_WITH_AI.md",
    "## Candidate scope for v0.3.0",
    "owned or licensed original character assets",
    "real-host conformance tests",
    "benchmark regression",
  ]) expect(roadmap, marker).toContain(marker);
  expect(roadmap).toContain("None of the items below are shipped in v0.2.0");
});
```

- [ ] **Step 2: Run and verify the missing-file failure**

Run:

```powershell
pnpm vitest run tests/plugin/agent-usage.test.ts
```

Expected: FAIL with `ENOENT` for `docs/roadmap.md`.

- [ ] **Step 3: Create the roadmap**

Create `docs/roadmap.md` with the exact headings and markers in the test. Explain each item in one short paragraph, state why it matters, and avoid dates or completion claims. Link it from the bottom of `docs/agent-usage.md` as optional further reading.

- [ ] **Step 4: Run and verify the documentation contract**

Run:

```powershell
pnpm vitest run tests/plugin/agent-usage.test.ts
```

Expected: 2 tests passed.

- [ ] **Step 5: Commit the roadmap**

```powershell
git add docs/agent-usage.md docs/roadmap.md tests/plugin/agent-usage.test.ts
git commit -m "docs: record Fantasy Mouse roadmap"
```

### Task 4: Add the Release usage source

**Files:**
- Modify: `tests/plugin/agent-usage.test.ts`
- Modify: `docs/release-notes-0.2.0.md`

- [ ] **Step 1: Add the failing Release-source contract**

Add:

```ts
it("keeps the v0.2.0 Release source copy-ready and post-release-link honest", async () => {
  const notes = await readFile("docs/release-notes-0.2.0.md", "utf8");
  expect(notes).toContain("## How to use");
  expect(notes).toContain(fixedReleaseZip);
  expect(notes).toContain("不要只复制 SKILL.md");
  expect(notes).toContain("自动选择 Fast、Standard 或 Strict 模式");
  expect(notes).toContain(
    "https://github.com/LaoFeng-mouse/fantasy-mouse-ui/blob/main/docs/agent-usage.md",
  );
  expect(notes).toContain("post-release documentation");
});
```

- [ ] **Step 2: Run and verify failure**

Run:

```powershell
pnpm vitest run tests/plugin/agent-usage.test.ts
```

Expected: FAIL because the Release source has no `How to use` section.

- [ ] **Step 3: Append the concise Release section**

Append `## How to use` to `docs/release-notes-0.2.0.md`. Include:

- the one-line Codex Marketplace-plus-install command;
- both approved Chinese copy-ready prompts;
- one sentence mapping named hosts to adapters and other hosts to the generic adapter;
- the capability-bounded compatibility warning;
- the full main-branch Agent guide URL;
- an explicit note that the guide is post-release documentation and not part of the version-pinned tag contents.

- [ ] **Step 4: Run both focused documentation suites**

Run:

```powershell
pnpm vitest run tests/plugin/agent-usage.test.ts tests/plugin/readme-showcase.test.ts tests/plugin/plugin-manifest.test.ts
```

Expected: all focused tests pass.

- [ ] **Step 5: Commit the Release source**

```powershell
git add docs/release-notes-0.2.0.md tests/plugin/agent-usage.test.ts
git commit -m "docs: add v0.2.0 Agent usage notes"
```

### Task 5: Verify the repository and unchanged package boundary

**Files:**
- Verify only; modify only if a test exposes a documentation defect.

- [ ] **Step 1: Run all local gates**

```powershell
pnpm examples:verify
pnpm test
pnpm typecheck
pnpm plugin:verify
```

Expected outputs include:

```text
{"ok":true,"cases":4,"accepted":4}
203 or more tests passed, with only the existing platform skip
{"ok":true,"assets":4}
```

- [ ] **Step 2: Build twice and verify package identity**

```powershell
pnpm plugin:package
Get-FileHash -Algorithm SHA256 dist/plugin/fantasy-mouse-ui.zip
pnpm plugin:package
Get-FileHash -Algorithm SHA256 dist/plugin/fantasy-mouse-ui.zip
```

Expected: both hashes equal `4AA588B0DA90A6E669B3EE833A1BC3F48DA10E6009654668016B75AA3837AEB3`; package tests continue to enforce exactly 24 files, proving documentation did not enter the ZIP.

- [ ] **Step 3: Check the diff and repository state**

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors and no uncommitted files.

### Task 6: Publish and independently verify the documentation update

**Files:**
- Remote mutation: GitHub `main` and existing v0.2.0 Release body.
- No tag or asset mutation.

- [ ] **Step 1: Snapshot the version-pinned Release facts**

```powershell
gh release view v0.2.0 --json tagName,isDraft,isPrerelease,assets,targetCommitish,url
git rev-list -n 1 v0.2.0
```

Record the current tag commit `fc1dd24d8bc45ef5a9050f748c74c22892dbe279`, asset ID, 7,416,625-byte size, and digest `sha256:4aa588b0da90a6e669b3ee833a1bc3f48da10e6009654668016b75aa3837aeb3`.

- [ ] **Step 2: Push the documentation commits**

```powershell
git push origin main
```

Expected: `main` advances without force-push.

- [ ] **Step 3: Update only the Release body**

```powershell
gh release edit v0.2.0 --notes-file docs/release-notes-0.2.0.md
```

Expected: the command returns the unchanged v0.2.0 Release URL.

- [ ] **Step 4: Verify remote README and live Release body**

Use `gh api` to read `README.md` at `main` and the v0.2.0 Release JSON. Decode README content and assert the fixed ZIP URL, both prompt markers, and `docs/agent-usage.md`. Assert the Release body contains `## How to use`, both prompt markers, and the main-branch guide link.

- [ ] **Step 5: Recheck version-pinned facts**

Run the same Release snapshot commands from Step 1. Require the same tag commit, asset ID, size, and digest. Verify `git rev-list --left-right --count origin/main...main` returns `0 0` and `git status --short` is empty.

- [ ] **Step 6: Open the Release for owner review**

Open `https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/tag/v0.2.0` in Codex. Report the usage-doc commit, test count, unchanged ZIP hash, and any remaining owner visual/copy acceptance separately.
