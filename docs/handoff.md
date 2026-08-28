# Fantasy Mouse UI handoff

## What exists

- A self-contained reusable plugin under `plugins/fantasy-mouse-ui/`.
- One canonical model-neutral Skill and four host loaders: generic, Claude, Gemini, and DeepSeek; Codex loads the canonical Skill through the plugin manifest.
- Four private visual-grounding assets with pinned identity, anatomy, composition, rights, hash, and dimension authority.
- Open workflow and project protocols for product-specific states and editable surfaces.
- Product-style independence and anti-template gates.
- Deterministic private-local packaging with an explicit 19-file allowlist and TOCTOU protections.
- Contract, security, validator, adapter, visual-authority, and package tests.

## Verified baseline — 2026-08-28

- `75` tests passed; `1` POSIX FIFO test skipped on Windows.
- TypeScript typecheck passed.
- Bundle verification returned `{"ok":true,"assets":4}`.
- Official Skill and plugin validators passed.
- Two consecutive package runs produced SHA-256 `6A80AB3723F85D10E353BFFBE249C26DB6738B94C376DFDD2C0EFD1DF0724994`.
- Final package path: `dist/plugin/fantasy-mouse-ui-private-local.zip`.
- Independent standards/security and specification reviews returned PASS with no Critical or Important findings.

## Deliberately excluded

- local Studio software;
- renderer framework and fixed Web/desktop/PPT sample applications;
- photo-renamer or expense-approval example products;
- frontend starter/templates;
- fixed theme, palette, component, or layout presets;
- 乐不思鼠 workflow, page, data, copy, or business semantics.

The retained 乐不思鼠-derived rule is only the user-confirmed hand contract: default chest V/U and action hands are mutually exclusive, with exactly one coherent pair.

## Remaining boundaries

- The ZIP is built and verified but host-specific installation/marketplace registration is a separate action.
- Private visual references are not cleared for public redistribution.
- Future generated UI, website, deck, document, or workflow outputs require their own real run/render and visual acceptance; repository tests do not pre-accept them.
- The rejected legacy branch/worktree `codex/fantasy-mouse` remains outside `main` and is not product authority.

## Start here

1. Read `CONTEXT.md` and `docs/architecture.md`.
2. Follow `docs/integration-guide.md` for an invocation.
3. Use `docs/operator-runbook.md` before changing assets, packaging, or installation.
4. Run all repository gates before handing off a changed plugin.

