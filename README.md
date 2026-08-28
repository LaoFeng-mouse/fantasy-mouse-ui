# Fantasy Mouse UI Plugin

Fantasy Mouse UI is a reusable, model-neutral Skill/plugin for designing software UI, websites, presentations, documents, and other editable workflows around one visually grounded mouse protagonist.

This repository ships the plugin contract and its private local visual references. It does **not** ship a Studio application, a photo-renaming product, or a fixed UI template.

## What stays fixed

- the canonical grey photographic face, tiny ears, narrowed eyes, human-like grin, white bean body, silhouette, proportions, and earnest absurd-dreamer temperament;
- the hand contract: the chest V/U is one clasped pair; action mode removes it and shows exactly one connected action-hand pair;
- private-reference and asset-authority boundaries pinned by the bundle verifier.

## What changes per product

- character role, clothing, props, pose, expression intensity, background, motion, and optional fantasy bubble;
- workflow functions, states, screens, data, and copy from the target product;
- the entire UI system—layout, navigation, palette, typography, density, materials, components, borders, shadows, motion, and responsive behavior—from product, user, platform, brand, and accessibility evidence.

Bundled character and composition images are never source-brand or universal UI-style authority.

## Repository layout

```text
plugins/fantasy-mouse-ui/
  .codex-plugin/        plugin metadata
  skills/               canonical Skill
  adapters/             generic, Claude, Gemini, and DeepSeek loaders
  assets/               private visual-grounding bundle
  protocol/             workflow and project JSON Schemas
  references/           grounding, translation, style, and QA rules
  scripts/              zero-dependency validation tools
scripts/                deterministic private ZIP packager
tests/plugin/           contract, security, and packaging tests
docs/                   integration, architecture, operations, and handoff
```

## Verify and package

Requirements: Node.js 24+, pnpm 11, and Python 3 for the optional official Skill/plugin validators.

```powershell
pnpm install
pnpm test
pnpm typecheck
pnpm plugin:verify
pnpm plugin:package
```

The package is written to:

```text
dist/plugin/fantasy-mouse-ui-private-local.zip
```

It is named `private-local` because it contains private visual authority. Do not publish that ZIP or claim redistribution rights.

## Use it

1. Give the Agent the plugin directory or unpacked private ZIP using the host's supported local plugin/Skill mechanism.
2. Start from `skills/fantasy-mouse-ui/SKILL.md`; platform adapters only load that canonical contract.
3. The Agent must run `scripts/verify-bundle.mjs` and view all four real images before visual design.
4. Supply a real project, screenshot, URL, deck, requirements document, or workflow brief.
5. Review the selected direction before implementation when no direction has already been approved.
6. Require editable output plus real run/render/visual evidence appropriate to the target surface.

See [Integration guide](docs/integration-guide.md), [Architecture](docs/architecture.md), [Operator runbook](docs/operator-runbook.md), and [Handoff](docs/handoff.md).

## Completion boundaries

- Automated tests prove contract and packaging behavior, not the visual quality of a future generated UI.
- Every invocation must separately run or render its target artifact and visually compare it with the character authorities.
- Host-specific installation or marketplace registration is separate from building the verified local ZIP.

