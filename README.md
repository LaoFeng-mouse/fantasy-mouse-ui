# Fantasy Mouse UI

Fantasy Mouse UI is a free, open-source, model-neutral Skill/plugin that helps an Agent create product-specific software UI, websites, presentations, documents, and workflows while preserving one visually grounded mouse protagonist. The character identity stays fixed; layout, palette, typography, components, behavior, and accessibility come from the target product rather than a bundled template.

Public repository: https://github.com/LaoFeng-mouse/fantasy-mouse-ui

## Install with Codex

```powershell
codex plugin marketplace add https://github.com/LaoFeng-mouse/fantasy-mouse-ui --json
codex plugin list --marketplace fantasy-mouse-ui --available --json
codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json
codex plugin list --marketplace fantasy-mouse-ui --json
```

If the marketplace already exists, follow the targeted upgrade path in [Install with AI](INSTALL_WITH_AI.md). That bilingual guide also provides a release-ZIP route, safe extraction requirements, complete 20-file inventory, host adapter entrypoints, and copy-paste prompts for an installation Agent.

## What stays fixed

- the canonical grey photographic face, tiny ears, narrowed eyes, human-like grin, white bean body, silhouette, proportions, and earnest absurd-dreamer temperament;
- the hand contract: the chest V/U is one clasped pair; action mode removes it and shows exactly one connected action-hand pair;
- asset-authority boundaries pinned by hashes, dimensions, publication scope, and the bundle verifier.

## What changes per product

- character role, clothing, props, pose, expression intensity, background, motion, and optional fantasy bubble;
- workflow functions, states, screens, data, and copy from the target product;
- the entire UI system—layout, navigation, palette, typography, density, materials, components, borders, shadows, motion, and responsive behavior—from product, user, platform, brand, and accessibility evidence.

Bundled character and composition images are never source-brand or universal UI-style authority.

## Distribution

The plugin and all four approved visual-grounding assets are distributed under the MIT License. The deterministic release archive build contains exactly 20 plugin entries and is written locally to:

```text
dist/plugin/fantasy-mouse-ui.zip
```

The repository remains marked `"private": true` in `package.json` only to block accidental npm publication; it does not restrict the MIT-licensed repository or release ZIP.

## Repository layout

```text
.agents/plugins/         repository marketplace metadata
plugins/fantasy-mouse-ui/
  .codex-plugin/        plugin metadata
  skills/               canonical Skill
  adapters/             generic, Claude, Gemini, and DeepSeek loaders
  assets/               MIT-licensed visual-grounding bundle
  protocol/             workflow and project JSON Schemas
  references/           grounding, translation, style, and QA rules
  scripts/              zero-dependency validation tools
scripts/                deterministic public ZIP packager
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

Verification is layered:

1. repository tests and typecheck validate contracts and packaging behavior;
2. `verify-bundle.mjs` validates the four pinned visual assets;
3. the official Skill/plugin validators validate their respective structures;
4. archive inventory and repeated SHA-256 checks validate the exact 20-entry public ZIP;
5. targeted host installation validates the deployed source and installed cache;
6. actual loading in a new task/session remains a separate final boundary.

## Use it with any supported host

The canonical entrypoint is `skills/fantasy-mouse-ui/SKILL.md`. Codex loads it through the plugin manifest; Claude, Gemini, DeepSeek, and generic Agents use the thin loaders under `adapters/`. Adapters map host capabilities to the same contract and may not redefine character, workflow, style, or security authority.

For every design invocation, the Agent must verify the bundle, view all four real images, inspect the target source, confirm a direction when needed, implement editable output and behavior, then gather run/render/visual evidence appropriate to the real target tool.

See the [Integration guide](docs/integration-guide.md), [Architecture](docs/architecture.md), [Operator runbook](docs/operator-runbook.md), and [Handoff](docs/handoff.md).

## Completion boundaries

- Automated repository gates prove the plugin contract and release package, not the visual quality of a future generated UI.
- Every invocation must separately run or render its target artifact and visually compare it with the character authorities.
- A validated install does not prove that a newly started task/session loaded the plugin.
- Building this ZIP does not prove that a GitHub repository, tag, release, or asset has been published.

## Support / 支持

Fantasy Mouse UI is free and open source. If it helped you, you can buy Mouse a dried fish — completely optional. / Fantasy Mouse UI 免费开源。如果它帮到了你，欢迎请鼠鼠吃根小鱼干，纯自愿。

![WeChat payment QR / 微信收款码](docs/assets/sponsor-qr.jpg)
