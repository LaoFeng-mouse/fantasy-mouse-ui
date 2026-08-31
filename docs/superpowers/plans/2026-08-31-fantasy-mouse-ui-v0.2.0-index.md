# Fantasy Mouse UI v0.2.0 Implementation Plan Index

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Coordinate the three independently testable implementation plans that produce and publicly verify Fantasy Mouse UI v0.2.0.

**Architecture:** Execute core contracts first, benchmarks second, and public showcase/release last. Each phase ends with its own tests and commit; later phases may consume only accepted artifacts from earlier phases.

**Tech Stack:** Node.js 24+, TypeScript 5.9, Vitest 3, zero-dependency Node validators, HTML/CSS/JavaScript, PowerShell/WPF, `@oai/artifact-tool`, Playwright CLI, FFmpeg, Codex CLI, GitHub CLI.

---

## Plan set

1. [Core modes, provenance, and package contract](2026-08-31-fantasy-mouse-ui-v0.2.0-core-plan.md)
2. [Four Strict benchmark cases](2026-08-31-fantasy-mouse-ui-v0.2.0-benchmarks-plan.md)
3. [README, GIF, versioning, and public release](2026-08-31-fantasy-mouse-ui-v0.2.0-showcase-release-plan.md)

The approved design authority is [the v0.2.0 design specification](../specs/2026-08-31-fantasy-mouse-ui-v0.2.0-design.md).

## Execution prerequisites

- [ ] **Step 1: Create an isolated implementation worktree**

Use the `using-git-worktrees` skill at execution time. Base it on commit `154f731` or a later commit that contains these plans. Do not implement directly in the dirty or diverged main checkout.

- [ ] **Step 2: Record the initial repository baseline**

Run:

```powershell
git status --short --branch
git log -3 --oneline
pnpm test
pnpm typecheck
pnpm plugin:verify
```

Expected: the worktree is clean; the existing suite passes apart from the documented Windows FIFO skip; bundle verification prints `{"ok":true,"assets":4}`.

- [ ] **Step 3: Execute the core plan completely**

Do not start benchmark implementation until mode resolution, provenance wording, the expanded package inventory, and repository tests pass.

- [ ] **Step 4: Execute the benchmark plan completely**

Do not place images in the README until all four cases are editable, run or opened in their real target, rendered, visually checked, and marked accepted in their evidence.

- [ ] **Step 5: Execute the showcase and release plan**

The public release plan may push, tag, and publish only after local repository, benchmark, and deterministic-package gates pass. Remote marketplace installation, remote ZIP comparison, and fresh-process loading are post-publication gates and must pass before the release is reported complete.

## Cross-plan invariants

- [ ] Every mode states its name and reason; Strict triggers can upgrade but nothing silently downgrades.
- [ ] Every visible mouse uses real raster assets and exactly one coherent hand pair.
- [ ] Character assets never supply product layout, palette, typography, components, or workflow semantics.
- [ ] Every benchmark contains editable source, actual output, real screenshots, derivation artifacts, and QA evidence.
- [ ] `examples/` remains outside the plugin ZIP.
- [ ] Code licensing and unverified internet-derived asset provenance remain explicitly separate.
- [ ] Generated, tested, run, rendered, visually checked, installed, published, and loaded are reported as separate gates.

## Final stop conditions

Stop and report partial status instead of publishing when any of these remains unresolved:

- a benchmark cannot run or render in its real target;
- a visual comparison shows identity, hand, hierarchy, clipping, accessibility, or template-leakage defects;
- package hashes differ across repeated builds;
- the remote ZIP inventory or hash differs from local;
- Codex cannot reinstall the remote plugin or a new task cannot load v0.2.0;
- public repository, tag, Release, or assets are not reachable.
