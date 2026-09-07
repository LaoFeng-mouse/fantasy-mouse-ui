# Fantasy Mouse UI Agent Usage Design

- **Date:** 2026-09-07
- **Status:** Implemented on `main`; live v0.2.0 Release body updated
- **Release context:** v0.2.0

## Goal

Make Fantasy Mouse UI usable from a copy-paste prompt without requiring an Agent developer to study the repository first. Keep the README result-led, provide a complete technical integration guide, and add a short usage section to the existing v0.2.0 GitHub Release without moving its tag or replacing its verified ZIP.

The primary audience is AI Agent developers and tool-capable Agent users. Codex has a native Marketplace route. Claude, Gemini, DeepSeek, and other Agents use the complete plugin directory through their named or generic adapter. The documentation must say that most sufficiently capable Agents can use the plugin; it must not claim universal compatibility with every chatbot.

## Documentation architecture

### README

Keep the existing real-result gallery and 22-second demonstration prominent. In Quick Start, lead with two copy-ready prompts before technical mode details:

1. **Download, install, and use** — fixed v0.2.0 ZIP URL, complete-plugin requirement, automatic mode selection, visual grounding, editable output, and real run/render evidence.
2. **Use an existing installation** — target project and UI placeholders, automatic mode selection, character continuity, product-derived styling, editable output, and real run/render verification.

Retain the Fast/Standard/Strict table. Move the three long mode-specific examples into a collapsible “More examples” section so the simple path stays simple. Add one capability statement and link to the complete Agent usage guide.

### Complete Agent guide

Add `docs/agent-usage.md` as the single complete usage authority. It contains:

- a capability-first compatibility matrix;
- Codex Marketplace installation, update, removal, and invocation;
- Claude, Gemini, DeepSeek, and generic Agent entrypoints;
- plugin loading and execution flow;
- mode selection rules;
- input and output contracts;
- failure and downgrade behavior;
- copy-ready invocation examples;
- package identity and verification boundaries.

Brand-specific sections may name their adapter paths, but they must share one execution contract rather than duplicate or redefine the canonical Skill.

### Roadmap

Add `docs/roadmap.md` to record confirmed improvement priorities without representing them as implemented:

- v0.2.1: capability/installation doctor, a shorter canonical Skill that routes into references, a host-capability contract, and a package-local `USE_WITH_AI.md`;
- v0.3.0: explicitly owned or licensed original character assets, broader real-host conformance tests, and version-to-version benchmark regression checks.

### GitHub Release

Append a concise “How to use” section to the existing v0.2.0 Release notes. Include the two copy-ready prompts, the native Codex command, the generic adapter rule, the capability limitation, and a link to `docs/agent-usage.md` on `main`. The guide is a post-release documentation addition and therefore must not be represented as part of the version-pinned v0.2.0 tag contents.

Editing Release notes must not move tag `v0.2.0`, replace `fantasy-mouse-ui.zip`, or change the published archive digest.

## Copy-ready prompts

### Download, install, and use

```text
请从 https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/download/v0.2.0/fantasy-mouse-ui.zip 下载并安装完整的 Fantasy Mouse UI 插件，然后使用它为【项目路径或链接】设计【需要设计的界面】；请让插件自动选择合适模式并先说明原因，查看随包角色素材，交付可编辑源码、真实运行或渲染结果和视觉验收证据，不要只复制 SKILL.md。
```

### Use an existing installation

```text
请使用 Fantasy Mouse UI 插件为【项目路径或链接】设计【需要设计的界面】；自动选择 Fast、Standard 或 Strict 模式并先说明原因，保留鼠鼠角色特征，但界面布局、配色、字体和组件必须根据当前产品重新设计，最后交付可编辑源码并真实运行或渲染检查。
```

## Compatibility contract

An Agent can complete the full workflow only when it can:

| Capability | Required for |
| --- | --- |
| Read files | Loading the complete plugin, adapters, rules, and target source |
| View images | Visual grounding and character-identity verification |
| Run Node.js | Bundle verification, mode resolution, and protocol checks |
| Edit the target project | Producing real editable output |
| Run or render the target | Behavioral and visual acceptance |
| Capture or inspect results | Comparison and evidence-backed handoff |

Codex may install through Marketplace. Other hosts may download the complete fixed ZIP and load `adapters/claude/SKILL.md`, `adapters/gemini/SKILL.md`, `adapters/deepseek/SKILL.md`, or `adapters/generic/AGENT.md` as appropriate.

## Execution flow

1. Resolve the complete plugin root; reject a lone copied `SKILL.md`.
2. Verify the v0.2.0 package identity where downloading is involved.
3. Run the bundled visual verifier.
4. Resolve Fast, Standard, or Strict and report the reason before design work.
5. Inspect the target project, URL, deck, or requirements.
6. View every required grounding image.
7. Derive product UI styling from the target product and workflow, not from the composition examples.
8. Produce editable source and implement the applicable states.
9. Run or render the real target and inspect the result.
10. Report evidence, repairs, and unresolved capability limits.

## Failure behavior

- Missing or incomplete plugin files: stop and request the complete plugin or fixed ZIP.
- Bundle hash, dimension, path, or manifest failure: stop; do not substitute remembered or external images.
- No real image-viewing capability: emit `visual-grounding-unavailable` and stop before style selection, character generation, visual QA, or completion claims.
- No target-editing capability: provide no implementation-complete claim.
- No run/render capability: editable source may be handed off, but runtime and visual acceptance remain explicitly open.
- Unknown or weak host integration: use the generic adapter and capability contract; do not invent a native installation command.

## Verification and acceptance

Repository tests will enforce that:

- both copy-ready prompts appear in README before the long examples;
- the fixed v0.2.0 ZIP URL, complete-plugin warning, automatic mode selection, editable output, and run/render evidence are present;
- the compatibility statement is capability-bounded and does not claim every chatbot is supported;
- `docs/agent-usage.md` includes every supported adapter path, capability requirement, failure token, install/update/remove guidance, input contract, and output contract;
- `docs/roadmap.md` distinguishes planned work from released behavior;
- the Release source notes include the concise usage section and the explicit post-release guide link on `main`;
- existing package tests still prove the install ZIP has exactly 24 files and the same deterministic identity, because this change does not modify plugin-package contents.

After the repository tests pass, update the existing GitHub Release notes and verify through the GitHub API that the usage section is live while tag target, asset size, asset digest, and asset ID remain unchanged.

## Out of scope

- Implementing the proposed doctor or host-capability schema.
- Shortening the canonical Skill.
- Adding `USE_WITH_AI.md` to the plugin ZIP.
- Changing visual assets or their provenance.
- Publishing v0.2.1 or moving/replacing v0.2.0 artifacts.
