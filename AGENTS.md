# Agent rules

## Product boundary

- This repository delivers the reusable `plugins/fantasy-mouse-ui/` Skill/plugin, not a Studio application, renderer framework, sample product, or fixed UI template.
- Read `CONTEXT.md` and `docs/architecture.md` before changing the plugin.
- Character identity/anatomy authority and product UI authority are separate. Never derive layout, palette, typography, materials, components, or brand tokens from bundled character/composition images.
- The MIT License covers the software code. The bundled visual assets have an unverified internet-derived origin and unconfirmed underlying authorship/license; preserve their manifest-declared authority, hashes, dimensions, exclusions, and security checks, and follow [Asset provenance](plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md).
- Do not import 乐不思鼠 workflow, UI, copy, data, or business rules. Only the hand contract in `CONTEXT.md` is retained.

## Required gates

Run `pnpm test`, `pnpm typecheck`, `pnpm plugin:verify`, `pnpm plugin:package`, and `git diff --check` before completion. Run the official Skill and plugin validators when available. Package twice, require matching SHA-256 values, confirm the exact 24-file plugin inventory, and confirm repository-only support assets are absent from the ZIP. Packaging must remain deterministic and fail closed on unknown files or unreliable filesystem identity.

Execution defaults to Standard. `plugins/fantasy-mouse-ui/config/execution-modes.json` is governed by `plugins/fantasy-mouse-ui/protocol/execution-modes.schema.json`; run `plugins/fantasy-mouse-ui/scripts/resolve-mode.mjs` for mode preflight and report strict-trigger upgrades honestly.

Do not claim a host install or a future UI/deck/document output was loaded, run, rendered, visually checked, or accepted without evidence from its real target tool and lifecycle stage.

## Documentation

| Need | Read |
| --- | --- |
| Install with Codex, a release ZIP, or an Agent | `INSTALL_WITH_AI.md` |
| Copy a prompt into a tool-capable Agent | `docs/agent-usage.md` |
| Integrate or invoke the plugin | `docs/integration-guide.md` |
| Understand authority/protocol/security design | `docs/architecture.md` |
| Verify, package, troubleshoot, or install | `docs/operator-runbook.md` |
| Current delivered state and remaining boundaries | `docs/handoff.md` |
| Distinguish shipped behavior from future ideas | `docs/roadmap.md` |

`docs/handoff.md` describes the published v0.2.0 state and keeps v0.1.0 evidence in a separately labeled historical section. For later changes, continue to verify local package, remote asset, marketplace installation, and fresh-task loading as separate gates instead of inheriting the v0.2.0 result.

## Repository workflow

- Issues/specs use local Markdown under `.scratch/`; see `docs/agents/issue-tracker.md`.
- Use the five labels in `docs/agents/triage-labels.md`.
- Follow the domain vocabulary and document routing in `docs/agents/domain.md`.

## Historical v0.1.0 baseline

The v0.1.0 release package used an exact 20-entry inventory. This is historical evidence only and is not current packaging or installation guidance.
