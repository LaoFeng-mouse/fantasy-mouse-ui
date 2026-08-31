# Fantasy Mouse UI handoff

## Current branch state

- The current delivered state is a local v0.2 core candidate in its feature worktree; it is not a final or remotely published v0.2 release.
- Public repository: https://github.com/LaoFeng-mouse/fantasy-mouse-ui.
- Repository marketplace metadata, bilingual [Install with AI](../INSTALL_WITH_AI.md), MIT code licenses, the exact 24-file plugin inventory, host adapters, and layered verification contract are present.
- `package.json` remains `"private": true` only to block accidental npm publication; it does not alter MIT software-code rights.
- Execution defaults to Standard. `config/execution-modes.json` is governed by `protocol/execution-modes.schema.json`, and `scripts/resolve-mode.mjs` performs default/requested/strict-trigger mode preflight.
- The bundled visual assets have an unverified internet-derived origin and unconfirmed underlying authorship/license, separate from the MIT software code; see [Asset provenance](../plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md).

## What exists

- A self-contained reusable plugin under `plugins/fantasy-mouse-ui/`.
- One canonical model-neutral Skill and four host loaders: generic, Claude, Gemini, and DeepSeek; Codex loads the canonical Skill through the plugin manifest.
- Four bundled visual-grounding assets with pinned identity, anatomy, composition, publication, hash, dimension, and separate provenance authority.
- Open workflow and project protocols for product-specific states and editable surfaces.
- Product-style independence and anti-template gates.
- Deterministic local packaging at `dist/plugin/fantasy-mouse-ui.zip` with an exact 24-file allowlist and TOCTOU protections.
- Contract, security, validator, adapter, visual-authority, and package tests.

## Current local v0.2 core candidate

- The package is a pre-release/core candidate only; v0.2 remote publication and remote installation are not claimed.
- Current local package SHA-256: `D7DF40D018FE10BA1B0B7223F939D3903EFF0F82856D403723F10C0A45CA5C3B`.
- Package path: `dist/plugin/fantasy-mouse-ui.zip`; expected inventory: exactly 24 entries.
- `scripts/verify-bundle.mjs` must return `{"ok":true,"assets":4}` and `scripts/resolve-mode.mjs` must resolve Standard by default.
- Optional support QR is repository documentation only and must remain absent from the plugin ZIP.

## Historical v0.1.0 baseline

- Verified on 2026-08-28: `84` tests passed and `1` POSIX FIFO test skipped on Windows; TypeScript, bundle, Skill, and plugin validation passed.
- The v0.1.0 release package used exactly 20 entries.
- Historical package SHA-256 runs matched at `8F1BA436A89C1F21AE0BCC3CA334AF1649BAAD55858D07226D3F293FED0DAD97`.
- These dated release facts are retained only as historical evidence and are not current v0.2 packaging, publication, or installation claims.

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
2. Follow [Install with AI](../INSTALL_WITH_AI.md) for marketplace or release-ZIP installation.
3. Follow `docs/integration-guide.md` for an invocation.
4. Use `docs/operator-runbook.md` before changing assets, packaging, or installation.
5. Run every repository gate and validate each deployment layer before handing off a changed plugin.
