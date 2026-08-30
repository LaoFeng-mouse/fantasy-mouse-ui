# Fantasy Mouse UI handoff

## Current branch state

- Release preparation is on branch `codex/open-source-release` in the dedicated open-source-release worktree.
- GitHub repository target (publication pending): https://github.com/LI-2004-feng/fantasy-mouse-ui.
- Local repository marketplace metadata, bilingual [Install with AI](../INSTALL_WITH_AI.md), MIT licenses, 20-entry packager, host adapters, and layered verification contract are present. No remote repository or Release availability is claimed.
- `package.json` remains `"private": true` only to block accidental npm publication; it does not alter MIT distribution rights.

## What exists

- A self-contained reusable plugin under `plugins/fantasy-mouse-ui/`.
- One canonical model-neutral Skill and four host loaders: generic, Claude, Gemini, and DeepSeek; Codex loads the canonical Skill through the plugin manifest.
- Four MIT-licensed visual-grounding assets with pinned identity, anatomy, composition, publication, hash, and dimension authority.
- Open workflow and project protocols for product-specific states and editable surfaces.
- Product-style independence and anti-template gates.
- Deterministic public packaging at `dist/plugin/fantasy-mouse-ui.zip` with an exact 20-file allowlist and TOCTOU protections.
- Contract, security, validator, adapter, visual-authority, and package tests.

## Verified baseline — 2026-08-28

- Full repository suite passed: `84` tests passed and `1` POSIX FIFO test skipped on Windows.
- TypeScript typecheck passed.
- Bundle verification returned `{"ok":true,"assets":4}`; the official Skill and plugin validators passed.
- Final package SHA-256, run 1: `8F1BA436A89C1F21AE0BCC3CA334AF1649BAAD55858D07226D3F293FED0DAD97`.
- Final package SHA-256, run 2: `8F1BA436A89C1F21AE0BCC3CA334AF1649BAAD55858D07226D3F293FED0DAD97`.
- Final package path: `dist/plugin/fantasy-mouse-ui.zip`; expected inventory: exactly 20 entries.
- Optional support QR is repository documentation only and must remain absent from the plugin ZIP.

## Deliberately excluded

- local Studio software;
- renderer framework and fixed Web/desktop/PPT sample applications;
- photo-renamer or expense-approval example products;
- frontend starter/templates;
- fixed theme, palette, component, or layout presets;
- 乐不思鼠 workflow, page, data, copy, or business semantics.

The retained 乐不思鼠-derived rule is only the user-confirmed hand contract: default chest V/U and action hands are mutually exclusive, with exactly one coherent pair.

## Remaining boundaries

- Task 5 may build, verify, commit, and update the supported local deployment, but actual loading in a newly started task/session remains separate evidence.
- Publishing or updating the GitHub repository, tag, release, or downloadable asset is separate Task 6 and is not claimed here.
- Future generated UI, website, deck, document, or workflow outputs require their own real run/render and visual acceptance; repository tests do not pre-accept them.
- The rejected legacy branch/worktree `codex/fantasy-mouse` remains outside the release branch and is not product authority.

## Start here

1. Read `CONTEXT.md` and `docs/architecture.md`.
2. Follow [Install with AI](../INSTALL_WITH_AI.md) for the current local route and post-publication marketplace or release-ZIP installation.
3. Follow `docs/integration-guide.md` for an invocation.
4. Use `docs/operator-runbook.md` before changing assets, packaging, or installation.
5. Run every repository gate and validate each deployment layer before handing off a changed plugin.
