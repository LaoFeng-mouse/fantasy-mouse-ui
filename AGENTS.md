# Agent rules

## Product boundary

- This repository delivers the reusable `plugins/fantasy-mouse-ui/` Skill/plugin, not a Studio application, renderer framework, sample product, or fixed UI template.
- Read `CONTEXT.md` and `docs/architecture.md` before changing the plugin.
- Character identity/anatomy authority and product UI authority are separate. Never derive layout, palette, typography, materials, components, or brand tokens from bundled character/composition images.
- Treat all four bundled visual-grounding assets and the generated ZIP as MIT-licensed open-source release material while preserving their fixed manifest-declared authority, hashes, dimensions, exclusions, and security checks.
- Do not import 乐不思鼠 workflow, UI, copy, data, or business rules. Only the hand contract in `CONTEXT.md` is retained.

## Required gates

Run `pnpm test`, `pnpm typecheck`, `pnpm plugin:verify`, `pnpm plugin:package`, and `git diff --check` before completion. Run the official Skill and plugin validators when available. Package twice, require matching SHA-256 values, confirm exactly 20 entries, and confirm repository-only support assets are absent from the ZIP. Packaging must remain deterministic and fail closed on unknown files or unreliable filesystem identity.

Do not claim a host install or a future UI/deck/document output was loaded, run, rendered, visually checked, or accepted without evidence from its real target tool and lifecycle stage.

## Documentation

| Need | Read |
| --- | --- |
| Install with Codex, a release ZIP, or an Agent | `INSTALL_WITH_AI.md` |
| Integrate or invoke the plugin | `docs/integration-guide.md` |
| Understand authority/protocol/security design | `docs/architecture.md` |
| Verify, package, troubleshoot, or install | `docs/operator-runbook.md` |
| Current delivered state and remaining boundaries | `docs/handoff.md` |

## Repository workflow

- Issues/specs use local Markdown under `.scratch/`; see `docs/agents/issue-tracker.md`.
- Use the five labels in `docs/agents/triage-labels.md`.
- Follow the domain vocabulary and document routing in `docs/agents/domain.md`.
