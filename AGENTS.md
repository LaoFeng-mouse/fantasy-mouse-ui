# Agent rules

## Product boundary

- This repository delivers the reusable `plugins/fantasy-mouse-ui/` Skill/plugin, not a Studio application, renderer framework, sample product, or fixed UI template.
- Read `CONTEXT.md` and `docs/architecture.md` before changing the plugin.
- Character identity/anatomy authority and product UI authority are separate. Never derive layout, palette, typography, materials, components, or brand tokens from bundled character/composition images.
- Treat all bundled visual-grounding assets and the generated ZIP as private-reference-only.
- Do not import 乐不思鼠 workflow, UI, copy, data, or business rules. Only the hand contract in `CONTEXT.md` is retained.

## Required gates

Run `pnpm test`, `pnpm typecheck`, `pnpm plugin:verify`, `pnpm plugin:package`, and `git diff --check` before completion. Packaging must remain deterministic and fail closed on unknown files or unreliable filesystem identity.

Do not claim a future UI/deck/document output was run, rendered, visually checked, or accepted without evidence from its real target tool.

## Documentation

| Need | Read |
| --- | --- |
| Integrate or invoke the plugin | `docs/integration-guide.md` |
| Understand authority/protocol/security design | `docs/architecture.md` |
| Verify, package, troubleshoot, or install | `docs/operator-runbook.md` |
| Current delivered state and remaining boundaries | `docs/handoff.md` |

## Repository workflow

- Issues/specs use local Markdown under `.scratch/`; see `docs/agents/issue-tracker.md`.
- Use the five labels in `docs/agents/triage-labels.md`.
- Follow the domain vocabulary and document routing in `docs/agents/domain.md`.
