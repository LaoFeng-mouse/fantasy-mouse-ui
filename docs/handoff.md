# Fantasy Mouse UI handoff

## Current branch state

- v0.2.0 is published and independently verified at https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/tag/v0.2.0.
- Public repository: https://github.com/LaoFeng-mouse/fantasy-mouse-ui.
- The repository `main` branch now includes the post-release [Agent usage guide](agent-usage.md), two copy-ready prompts in README, a future-only [roadmap](roadmap.md), and the source used to add `How to use` to the live Release body. These documentation updates did not move the v0.2.0 tag or replace its asset.
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
- Four accepted Strict benchmark cases under `examples/`, covering SaaS, website, presentation, and Windows desktop surfaces with editable source, real output, screenshots, comparisons, and QA records.
- A result-led README, two copy-ready Agent prompts, three mode-specific bilingual examples, and a deterministic 22-second Archive Lantern GIF/MP4 workflow demonstration.

## Verified v0.2.0 release

- Annotated tag `v0.2.0` resolves to release commit `fc1dd24d8bc45ef5a9050f748c74c22892dbe279`; the non-draft, non-prerelease GitHub Release was published on 2026-09-07.
- Two post-versioning package builds were byte-for-byte identical at SHA-256 `4AA588B0DA90A6E669B3EE833A1BC3F48DA10E6009654668016B75AA3837AEB3`.
- Package path: `dist/plugin/fantasy-mouse-ui.zip`; verified inventory: exactly 24 regular entries.
- The complete post-documentation local gate passed with `208` tests and `1` platform skip; TypeScript, benchmark, bundle, Skill, plugin, and package validation also passed.
- `scripts/verify-bundle.mjs` must return `{"ok":true,"assets":4}` and `scripts/resolve-mode.mjs` must resolve Standard by default.
- `scripts/validate-examples.mjs` must return `{"ok":true,"cases":4,"accepted":4}`.
- Optional support QR is repository documentation only and must remain absent from the plugin ZIP.
- The Release asset was independently downloaded: 7,416,625 bytes, exactly 24 entries, byte-for-byte identical to the local package, with the same SHA-256.
- Marketplace installation resolved `fantasy-mouse-ui@fantasy-mouse-ui` as version `0.2.0`; the older `fantasy-mouse-ui@personal` installation was removed after the new installation succeeded.
- A fresh ephemeral Codex process read version `0.2.0` from the installed cache, resolved the `public-benchmark` trigger to Strict, and identified visual grounding as the first visual action.

## Historical v0.1.0 baseline

- Verified on 2026-08-28: `84` tests passed and `1` POSIX FIFO test skipped on Windows; TypeScript, bundle, Skill, and plugin validation passed.
- The v0.1.0 release package used exactly 20 entries.
- Historical package SHA-256 runs matched at `8F1BA436A89C1F21AE0BCC3CA334AF1649BAAD55858D07226D3F293FED0DAD97`.
- These dated release facts are retained only as historical evidence and are not current v0.2 packaging, publication, or installation claims.

## Deliberately excluded

- local Studio software;
- a reusable renderer framework, Studio product, or fixed visual template library;
- photo-renamer or expense-approval example products;
- frontend starter/templates;
- fixed theme, palette, component, or layout presets;
- 乐不思鼠 workflow, page, data, copy, or business semantics.

The retained 乐不思鼠-derived rule is only the user-confirmed hand contract: default chest V/U and action hands are mutually exclusive, with exactly one coherent pair.

## Remaining boundaries

- The repository, tag, Release asset, remote/local ZIP identity, marketplace installation, and fresh-process loading gates are complete for v0.2.0.
- Future generated UI, website, deck, document, or workflow outputs require their own real run/render and visual acceptance; repository tests do not pre-accept them.
- The rejected legacy branch/worktree `codex/fantasy-mouse` remains outside the release branch and is not product authority.

## Start here

1. Read `CONTEXT.md` and `docs/architecture.md`.
2. Copy a ready-to-use prompt from [Agent usage](agent-usage.md), or follow [Install with AI](../INSTALL_WITH_AI.md) for detailed marketplace or release-ZIP installation.
3. Follow `docs/integration-guide.md` for protocol-level integration.
4. Use `docs/operator-runbook.md` before changing assets, packaging, or installation.
5. Check [Roadmap](roadmap.md) before describing an idea as shipped.
6. Run every repository gate and validate each deployment layer before handing off a changed plugin.
