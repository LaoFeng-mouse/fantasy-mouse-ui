# Fantasy Mouse UI v0.2.0 Showcase and Release Implementation Plan

> **Status:** Completed for v0.2.0. Unchecked boxes are retained as the original execution script, not as current pending work.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the four accepted benchmarks into a result-led README and 22-second demonstration, then version, package, publish, reinstall, and verify the complete public v0.2.0 release.

**Architecture:** README content references accepted example artifacts rather than mock marketing images. A deterministic browser demo exposes exact frames from the real Archive Lantern states, FFmpeg produces GIF/MP4 assets, and release gates separately verify local ZIP, remote ZIP, marketplace installation, and fresh-process plugin loading.

**Tech Stack:** Markdown, HTML/CSS/JavaScript, Vitest, Playwright CLI, FFmpeg 8, pnpm, Codex CLI 0.151.0, Git, GitHub CLI 2.97.

---

## File map

- Create `tests/plugin/readme-showcase.test.ts`: README order, assets, prompts, links, and rights-language checks.
- Create `docs/demo/archive-lantern/index.html`, `styles.css`, and `demo.mjs`: deterministic 22-second split-screen demo using accepted Archive Lantern assets/states.
- Create `docs/assets/archive-lantern-demo.gif` and `docs/assets/archive-lantern-demo.mp4`: public demonstration assets.
- Create `scripts/capture-readme-demo.ps1`: reproducible frame capture and FFmpeg encoding.
- Create `CHANGELOG.md` and `docs/release-notes-0.2.0.md`.
- Modify `README.md`: Outcome Wall, GIF, Quick Start, modes, examples, then engineering details.
- Modify `package.json` and `plugins/fantasy-mouse-ui/.codex-plugin/plugin.json`: version 0.2.0.
- Modify `INSTALL_WITH_AI.md`, `CONTEXT.md`, `docs/architecture.md`, `docs/integration-guide.md`, `docs/operator-runbook.md`, and `docs/handoff.md`: final current-version and acceptance facts.

### Task 1: Lock the result-led README contract

**Files:**
- Create: `tests/plugin/readme-showcase.test.ts`
- Test target: `README.md`

- [ ] **Step 1: Write the failing README-order test**

```ts
import { access, readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const ordered = (text: string, markers: string[]) => {
  let previous = -1;
  for (const marker of markers) {
    const current = text.indexOf(marker);
    expect(current, marker).toBeGreaterThan(previous);
    previous = current;
  }
};

describe("README v0.2 showcase", () => {
  it("leads with outcomes, install, demo, and Quick Start", async () => {
    const readme = await readFile("README.md", "utf8");
    ordered(readme, [
      "# Fantasy Mouse UI",
      "codex plugin add fantasy-mouse-ui@fantasy-mouse-ui",
      "## Real results",
      "Signal Harbor",
      "Fieldnote Festival",
      "Grid Forward 2030",
      "Archive Lantern",
      "archive-lantern-demo.gif",
      "## Quick Start",
      "Fast",
      "Standard",
      "Strict",
      "## How it works",
      "## Architecture and verification"
    ]);
  });

  it("references only accepted benchmark media", async () => {
    for (const path of [
      "examples/signal-harbor/screenshots/hero.png",
      "examples/fieldnote-festival/screenshots/hero.png",
      "examples/grid-forward-2030/screenshots/hero.png",
      "examples/archive-lantern/screenshots/hero.png",
      "docs/assets/archive-lantern-demo.gif"
    ]) await expect(access(path)).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 2: Add failing prompt and provenance assertions**

Require three fenced bilingual prompts containing explicit `Fast`, `Standard`, and `Strict`; require links to all four case READMEs and `plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md`; reject active phrases that claim the four visual assets are fully MIT-licensed or copyright-free.

- [ ] **Step 3: Run the focused test and verify failure**

Run: `pnpm vitest run tests/plugin/readme-showcase.test.ts`

Expected: FAIL because the current README is engineering-first and the demo does not exist.

- [ ] **Step 4: Commit the failing contract**

```powershell
git add tests/plugin/readme-showcase.test.ts
git commit -m "test: define v0.2 README showcase contract"
```

### Task 2: Rewrite the README first screen and Quick Start

**Files:**
- Modify: `README.md`
- Modify: `examples/*/screenshots/hero.png` only if an accepted case lacks a representative hero crop.

- [ ] **Step 1: Build the Outcome Wall from accepted screenshots**

Use a two-by-two Markdown table. Each cell must include a real hero screenshot, case name, surface, and one sentence explaining the product-specific difference. Do not crop away critical workflow content or upscale blurry images.

- [ ] **Step 2: Write the first-screen copy**

Keep the opening to:

```markdown
# Fantasy Mouse UI

Design product-specific SaaS, websites, presentations, and desktop software with one visually grounded mouse character — without forcing every product into one template.

```powershell
codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json
```
```

Then place `## Real results`. Move architecture, hashes, protocols, and completion boundaries below Quick Start and examples.

- [ ] **Step 3: Add three bilingual prompts**

The prompts must request:

- Fast: a bounded low-risk website hero redesign with an editable result and render check;
- Standard: Archive-Lantern-like desktop research organization with primary journey and key states;
- Strict: a SaaS incident dashboard with permissions, failure/recovery, keyboard access, comparisons, and evidence.

Each prompt tells the Agent to state mode and reason first.

- [ ] **Step 4: Add mode and example navigation**

Use one compact table for Fast/Standard/Strict. Link the four case READMEs and provenance. Keep technical verification after `## How it works`.

- [ ] **Step 5: Run focused tests**

Run: `pnpm vitest run tests/plugin/readme-showcase.test.ts`

Expected: only the missing GIF assertion remains failing.

- [ ] **Step 6: Commit the README restructuring**

```powershell
git add README.md
git commit -m "docs: lead README with real Fantasy Mouse results"
```

### Task 3: Produce the deterministic 22-second demo GIF and MP4

**Files:**
- Create: `docs/demo/archive-lantern/index.html`
- Create: `docs/demo/archive-lantern/styles.css`
- Create: `docs/demo/archive-lantern/demo.mjs`
- Create: `scripts/capture-readme-demo.ps1`
- Create: `docs/assets/archive-lantern-demo.gif`
- Create: `docs/assets/archive-lantern-demo.mp4`
- Modify: `README.md`

- [ ] **Step 1: Build a frame-addressable demonstration page**

The page must expose:

```js
window.setDemoFrame = (frame) => {
  const seconds = frame / 12;
  document.documentElement.style.setProperty("--demo-time", `${seconds}s`);
  renderPrompt(seconds);
  renderModeAndBrief(seconds);
  renderArchiveLanternState(seconds);
};
```

Use real accepted Archive Lantern screenshots/assets and real state names. Label the page `Workflow demonstration`; do not call it real-time model generation. Timeline: prompt 0–3s, Strict/brief 3–6s, structure 6–12s, mouse/states 12–18s, complete result 18–22s.

- [ ] **Step 2: Add deterministic frame capture**

In `capture-readme-demo.ps1`, create a temporary directory under `work/`, launch a local static server, open the demo with the Playwright CLI wrapper, and use one necessary `run-code` loop to call `setDemoFrame(frame)` and `page.screenshot()` for frames 0–263 at 1280×720. Close the browser session and server in `finally`.

- [ ] **Step 3: Encode MP4 and GIF with FFmpeg**

Use exact commands equivalent to:

```powershell
ffmpeg -y -framerate 12 -i frame-%03d.png -c:v libx264 -pix_fmt yuv420p -movflags +faststart docs/assets/archive-lantern-demo.mp4
ffmpeg -y -framerate 12 -i frame-%03d.png -vf "fps=12,scale=960:-1:flags=lanczos,palettegen=stats_mode=diff" palette.png
ffmpeg -y -framerate 12 -i frame-%03d.png -i palette.png -lavfi "fps=12,scale=960:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3" -loop 0 docs/assets/archive-lantern-demo.gif
```

Require duration between 21.5 and 22.5 seconds using `ffprobe`; require GIF and MP4 to be non-empty. If GIF size is excessive, reduce width or fps while preserving legibility, then rerun the duration/readability check.

- [ ] **Step 4: Inspect the actual animation**

Open both GIF and MP4. Inspect opening, 3s, 6s, 12s, 18s, and final frames at README display size. Confirm silent comprehension, readable Prompt, no clipped UI, truthful `Workflow demonstration` label, and a natural loop.

- [ ] **Step 5: Link the GIF directly below the Outcome Wall**

Use Markdown image syntax with meaningful alt text; link the image to the MP4 master or case README without autoplaying video.

- [ ] **Step 6: Run README tests and commit**

```powershell
pnpm vitest run tests/plugin/readme-showcase.test.ts
git add docs/demo docs/assets/archive-lantern-demo.gif docs/assets/archive-lantern-demo.mp4 scripts/capture-readme-demo.ps1 README.md
git commit -m "docs: add Archive Lantern workflow demonstration"
```

Expected: README showcase tests pass.

### Task 4: Version and document v0.2.0

**Files:**
- Modify: `package.json`
- Modify: `plugins/fantasy-mouse-ui/.codex-plugin/plugin.json`
- Create: `CHANGELOG.md`
- Create: `docs/release-notes-0.2.0.md`
- Modify: `INSTALL_WITH_AI.md`
- Modify: `CONTEXT.md`
- Modify: `docs/architecture.md`
- Modify: `docs/integration-guide.md`
- Modify: `docs/operator-runbook.md`
- Modify: `docs/handoff.md`
- Modify: relevant tests under `tests/plugin/`

- [ ] **Step 1: Add failing version assertions**

Require both JSON files to report `0.2.0`, release notes to name all seven outcomes, and current docs to say 24 plugin files. Reject stale active statements that examples are deliberately excluded from the repository or that all four images are MIT-licensed.

- [ ] **Step 2: Run tests and verify the 0.1.0 failure**

Run: `pnpm test`

Expected: FAIL on version and release-note assertions.

- [ ] **Step 3: Bump versions and write release notes**

Release notes must list modes, four benchmarks, result-led README, Quick Start, GIF, provenance disclosure, exact package inventory, known asset-rights limitation, and the separate installation/new-process loading gate.

- [ ] **Step 4: Reconcile operational documentation**

Update package count, commands, mode resolver usage, benchmark validator, provenance wording, and current completion facts. Keep historical v0.1 records clearly historical rather than silently rewriting old evidence.

- [ ] **Step 5: Run all local gates**

```powershell
pnpm examples:verify
pnpm test
pnpm typecheck
pnpm plugin:verify
pnpm plugin:package
git diff --check
```

Expected: all pass.

- [ ] **Step 6: Commit versioning**

```powershell
git add package.json plugins/fantasy-mouse-ui/.codex-plugin/plugin.json CHANGELOG.md README.md INSTALL_WITH_AI.md CONTEXT.md docs tests
git commit -m "chore: prepare Fantasy Mouse UI v0.2.0"
```

### Task 5: Verify the local release candidate

**Files:**
- Modify only if verification reveals a defect.

- [ ] **Step 1: Build twice and record the final hash**

```powershell
pnpm plugin:package
$hash1 = (Get-FileHash -Algorithm SHA256 dist\plugin\fantasy-mouse-ui.zip).Hash
pnpm plugin:package
$hash2 = (Get-FileHash -Algorithm SHA256 dist\plugin\fantasy-mouse-ui.zip).Hash
if ($hash1 -ne $hash2) { throw "nondeterministic package" }
$hash1
```

Expected: identical uppercase SHA-256 values and exactly 24 entries.

- [ ] **Step 2: Validate the source and local package**

Run the official Skill and plugin validators, bundle verifier, ZIP inventory tests, and provenance checks. Save command outputs in a temporary release ledger under `work/`, not in the plugin ZIP.

- [ ] **Step 3: Confirm remote-only evidence remains open**

Record marketplace installation and fresh-process loading as deliberately pending before publication. The configured marketplace points at the remote repository, so upgrading it before pushing v0.2.0 would only retest the old release. Do not hand-edit Codex registry/cache files and do not report an installed v0.2.0 yet.

### Task 6: Publish and verify GitHub v0.2.0

**Files:**
- No source edits unless a remote verification defect requires a new patch commit and a new release candidate.

- [ ] **Step 1: Confirm publication preconditions**

```powershell
git status --short --branch
git log -5 --oneline
git ls-remote --tags origin refs/tags/v0.2.0
gh auth status
```

Expected: clean accepted branch, no existing `v0.2.0` tag, authenticated GitHub account with repository access. Never overwrite an existing tag or Release.

- [ ] **Step 2: Integrate the implementation branch safely**

Use the `finishing-a-development-branch` skill. Fast-forward the accepted commits to local `main` only after confirming main has not diverged. Preserve unrelated files and never reset main.

- [ ] **Step 3: Push main, tag, and create the Release**

```powershell
git push origin main
git tag -a v0.2.0 -m "Fantasy Mouse UI v0.2.0"
git push origin v0.2.0
gh release create v0.2.0 dist\plugin\fantasy-mouse-ui.zip --repo LaoFeng-mouse/fantasy-mouse-ui --title "Fantasy Mouse UI v0.2.0" --notes-file docs\release-notes-0.2.0.md
```

If any command fails or returns an uncertain result, inspect remote state before retrying; never recreate or overwrite blindly.

- [ ] **Step 4: Verify the remote repository and Release**

Use `gh api`, `gh release view`, and a real browser to verify the README Outcome Wall, GIF playback, case links, tag commit, release notes, and downloadable asset.

- [ ] **Step 5: Download and compare the remote ZIP**

Download into a new temporary directory, compute SHA-256, enumerate central-directory entries, and compare against the local 24-file inventory. Expected: byte-for-byte hash match and no examples/docs/tests/debris in the plugin archive.

- [ ] **Step 6: Upgrade marketplace and reinstall from remote**

First inspect `codex plugin marketplace list --json` and `codex plugin list --available --json`. Upgrade the existing `fantasy-mouse-ui` marketplace, or add `https://github.com/LaoFeng-mouse/fantasy-mouse-ui` only when no matching marketplace exists; inspect returned JSON instead of guessing its name. Then remove/add `fantasy-mouse-ui@fantasy-mouse-ui`, run source/cache validators and the bundle verifier, and require the installed record to resolve to version 0.2.0.

Finally run this fresh read-only process from the repository:

```powershell
codex exec --ephemeral --json --sandbox read-only -C . "Use Fantasy Mouse UI in Strict mode for a public benchmark preflight only. Do not edit files. Report the loaded plugin version, selected mode, mode reason, and the first required visual-grounding action."
```

Expected: final output reports v0.2.0, Strict, the public-benchmark/formal-release reason, and bundle/image grounding. A cached 0.1.0 response leaves the loading gate open. This post-publication run is the final install/load evidence.

- [ ] **Step 7: Record exact completion evidence**

Update `docs/handoff.md` only if all final facts are known: tag, commit, Release URL, ZIP SHA-256, exact test results, local/remote hash match, installed version, fresh-process output, and any open renderer or owner-acceptance gate. Commit and push a documentation-only correction only when it records verified facts and does not alter the released ZIP; otherwise include facts in the Release notes or final handoff without moving the tag.
