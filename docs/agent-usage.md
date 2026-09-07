# Use Fantasy Mouse UI with AI Agents

Fantasy Mouse UI is a complete, visually grounded UI-design workflow for tool-capable Agents. The Agent needs the full plugin directory—not a copied `SKILL.md`—so it can read the canonical instructions, inspect the bundled character references, resolve the execution mode, edit the target, and verify the result.

## Copy this into an Agent

To ask an Agent to download, install, and use the plugin, replace the two bracketed fields and send this single prompt:

```text
请从 https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/download/v0.2.0/fantasy-mouse-ui.zip 下载并安装完整的 Fantasy Mouse UI 插件，然后使用它为【项目路径或链接】设计【需要设计的界面】；请让插件自动选择合适模式并先说明原因，查看随包角色素材，交付可编辑源码、真实运行或渲染结果和视觉验收证据，不要只复制 SKILL.md。
```

If the plugin is already installed, send this shorter prompt:

```text
请使用 Fantasy Mouse UI 插件为【项目路径或链接】设计【需要设计的界面】；自动选择 Fast、Standard 或 Strict 模式并先说明原因，保留鼠鼠角色特征，但界面布局、配色、字体和组件必须根据当前产品重新设计，最后交付可编辑源码并真实运行或渲染检查。
```

## Compatibility by capability

Compatibility depends on what the host Agent can actually do. A host that can read the complete bundle and use the following capabilities can follow the workflow; this does not mean every chatbot can complete the workflow.

| Capability | Why it is required | If unavailable |
| --- | --- | --- |
| Read files | Load the canonical Skill, adapter, references, schemas, and project source. | Do not claim the plugin was loaded from a copied prompt alone. |
| View images | Inspect the four bundled character authorities and compare the rendered result. | Report `visual-grounding-unavailable`; do not claim visual acceptance. |
| Run Node.js | Run the bundled verifier and mode resolver. | Leave bundle and mode verification open. |
| Edit the target project | Produce editable source in the user's actual project. | Return guidance only and state that implementation is open. |
| Run or render the target | Exercise the design in its real application, browser, slide, or desktop surface. | Leave runtime and visual acceptance open. |
| Capture or inspect results | Review screenshots, frames, pages, or the live UI for layout and character defects. | State which visual checks remain open. |

Network access is also needed when the Agent must download the release. A host may instead receive the complete ZIP from the user.

## Install, update, and remove in Codex

Codex can install Fantasy Mouse UI through its plugin Marketplace. Add the repository as a marketplace and install the plugin:

```powershell
codex plugin marketplace add https://github.com/LaoFeng-mouse/fantasy-mouse-ui --json
codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json
```

Refresh the marketplace, then inspect the installed and available versions:

```powershell
codex plugin marketplace upgrade fantasy-mouse-ui --json
codex plugin list --marketplace fantasy-mouse-ui --available --json
```

The marketplace upgrade refreshes the snapshot; it does not by itself prove that the installed copy changed. If the JSON reports that the desired marketplace version is not installed, replace the installed copy, then run the list command again to verify the reported version:

```powershell
codex plugin remove fantasy-mouse-ui@fantasy-mouse-ui --json
codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json
```

After installation or replacement, start a fresh Codex task. Plugin discovery is evaluated during fresh-task initialization; a task that was already running does not prove that the new installation loaded. Installation, reported version, and fresh-task loading are separate checks.

To remove the plugin without reinstalling it, run only the `codex plugin remove` command above.

## Claude, Gemini, DeepSeek, and other Agents

Download and extract the complete release ZIP. Then point the host to the matching thin adapter inside the extracted plugin:

| Host | Adapter |
| --- | --- |
| A Claude-capable coding host with project instructions and tools | `adapters/claude/SKILL.md` |
| A Gemini-capable coding host with project instructions and tools | `adapters/gemini/SKILL.md` |
| A DeepSeek-capable coding host with project instructions and tools | `adapters/deepseek/SKILL.md` |
| Another tool-capable Agent | `adapters/generic/AGENT.md` |

Each adapter routes the host to the same canonical Skill; it does not redefine the workflow. Use the host's supported project-instruction or Skill-loading mechanism to load that adapter. Host-specific menu names and installation locations can differ, so verify that the Agent can access the extracted directory before asking it to design.

## Execution flow

1. Obtain and extract the complete plugin, or load the installed Codex plugin.
2. Load the native Codex entrypoint or the matching host adapter.
3. Run `node scripts/verify-bundle.mjs` from the plugin root and inspect the bundled character images.
4. Inspect the request and known scope for an explicit mode and every matching trigger in `config/execution-modes.json`.
5. From the plugin root, run `node scripts/resolve-mode.mjs [--requested fast|standard|strict] [--trigger <known-trigger> ...]`, then state the selected mode and reason before any design work.
6. Inspect the target product, platform, brand, content, states, constraints, and real build or run path.
7. If source inspection reveals a new Strict trigger, rerun the resolver and upgrade the mode before making edits. Never silently downgrade a result.
8. Design and implement product-specific UI while preserving the character identity contract.
9. Run or render the real target and exercise the required states.
10. Inspect the result, record evidence, and report every acceptance gate that remains open.

## Choose Fast, Standard, or Strict

| Mode | Use it for | Required depth |
| --- | --- | --- |
| Fast | One bounded, low-risk screen or revision. | Inspect, ground, edit, run or render, and perform focused visual and hand QA. |
| Standard | Most product UI and multi-state feature work. | Add a workflow brief, key states, behavior checks, and a concise handoff. This is the default. |
| Strict | Public benchmarks, multi-page systems, permissions, finance, medical, destructive flows, and releases. | Use the complete evidence chain, recovery and accessibility checks, provenance, and acceptance records. A Strict trigger cannot be downgraded. |

The Agent should select the lightest valid mode from the actual risk and scope, not from prompt length. An explicit Strict trigger remains Strict.

## Input contract

Give the Agent:

- the target project path or accessible link;
- the exact screen, flow, deck, or desktop surface to design;
- product goals, users, content, brand, platform, and accessibility constraints that are already known;
- required states and interactions, especially failure, empty, permission, recovery, and destructive states;
- an explicit mode only when you need one—otherwise ask the plugin to choose and explain it.

If a path, credential, runtime, or required asset is unavailable, the Agent must identify the missing input instead of inventing evidence.

## Output contract

A complete handoff includes:

- the selected mode and reason, stated before implementation;
- confirmation that the complete plugin and visual bundle were loaded and verified;
- editable source files in the target project;
- the real command or method used to run, render, or open the target;
- screenshots or equivalent inspection evidence for the required states;
- focused behavior, layout, character, hand, and accessibility findings appropriate to the mode;
- a clear list of unresolved acceptance gates.

A mockup, a code snippet, or a passing unit test by itself is not proof that the real target rendered correctly.

## Failure and downgrade behavior

- If images cannot be viewed, report `visual-grounding-unavailable` and stop before claiming character or visual acceptance.
- If the full directory is unavailable, ask for the complete plugin; do not reconstruct it from `SKILL.md` alone.
- If Node.js cannot run, report that bundle verification and automatic mode resolution remain open.
- If the target cannot be edited, label the result as guidance or a proposal rather than editable delivery.
- If the target runtime is missing or cannot be launched, runtime and visual acceptance remain open even when source checks pass.
- If a Strict trigger applies, do not silently downgrade it. Report the blocked Strict gates and what capability or input is required to finish them.

## Package identity

The version-pinned download in this guide is the published `v0.2.0` release archive:

`https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/download/v0.2.0/fantasy-mouse-ui.zip`

Verify the downloaded file before use:

```text
SHA-256  4AA588B0DA90A6E669B3EE833A1BC3F48DA10E6009654668016B75AA3837AEB3
```

Install the complete ZIP and keep its directory structure intact. This `docs/agent-usage.md` guide is post-release documentation maintained on the repository's `main` branch; it is not part of the `v0.2.0` tag or its 24-file plugin ZIP. This documentation update does not mutate that tag or asset.

Marketplace installation can resolve to a different version after a later release because the Marketplace follows its refreshed repository snapshot. Use `codex plugin list --marketplace fantasy-mouse-ui --available --json` to verify the installed version; use the fixed URL and checksum above when an exact `v0.2.0` package is required.
