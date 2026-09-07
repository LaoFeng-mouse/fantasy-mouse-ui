# Fantasy Mouse UI v0.2.0

Fantasy Mouse UI v0.2.0 makes the plugin faster to understand, easier to try, and independently reviewable without turning the character into a universal UI template.

## Seven release outcomes

1. **four real results** — the README opens with accepted SaaS, website, presentation, and desktop outputs.
2. **22-second workflow demonstration** — a deterministic Archive Lantern GIF and MP4 show Prompt → Strict selection → workflow brief → character states → accepted result.
3. **result-led README** — architecture, hashes, and protocol details move below the outcomes and first-use path.
4. **Quick Start** — one install command and three bilingual, copy-ready prompts.
5. **Fast / Standard / Strict** — a small request can stay focused, ordinary product work uses Standard, and public or high-risk work upgrades to Strict.
6. **four accepted benchmark cases** — Signal Harbor, Fieldnote Festival, Grid Forward 2030, and Archive Lantern include editable source, real output, screenshots, comparisons, and QA evidence.
7. **asset provenance** — the package now states the visual material's known history and the limits of that knowledge.

## Package and verification

The release ZIP contains the exact 24-file plugin inventory. It includes the mode resolver and schema, workflow/project protocols, canonical Skill, host adapters, visual authorities, verifier, and provenance notice. Repository examples, demo media, docs, tests, caches, and support imagery are intentionally outside the install ZIP.

Local release gates require:

- `pnpm examples:verify` → four accepted cases;
- `pnpm test` and `pnpm typecheck`;
- `pnpm plugin:verify` → four pinned assets;
- two deterministic package builds with identical SHA-256 and exactly 24 regular entries;
- official Skill/plugin validation where the host provides those validators.

Marketplace installation, remote ZIP comparison, and fresh-process loading are separate post-publication gates. A local package or installed cache is not enough to claim that a new task loaded v0.2.0.

## Asset-rights limitation

The MIT License applies to the software code. The four bundled visual assets are disclosed as having an unverified internet-derived origin and unconfirmed underlying authorship/license. They are not represented as MIT-licensed third-party source material, copyright-free, or public domain. See `ASSET_PROVENANCE.md`; a rights holder may request review or takedown through the repository issue/contact route.

## How to use

Codex Marketplace plus install: `codex plugin marketplace add https://github.com/LaoFeng-mouse/fantasy-mouse-ui --json; codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json`

Download the fixed v0.2.0 plugin ZIP: https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/download/v0.2.0/fantasy-mouse-ui.zip

```text
请从 https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/download/v0.2.0/fantasy-mouse-ui.zip 下载并安装完整的 Fantasy Mouse UI 插件，然后使用它为【项目路径或链接】设计【需要设计的界面】；请让插件自动选择合适模式并先说明原因，查看随包角色素材，交付可编辑源码、真实运行或渲染结果和视觉验收证据，不要只复制 SKILL.md。
```

```text
请使用 Fantasy Mouse UI 插件为【项目路径或链接】设计【需要设计的界面】；自动选择 Fast、Standard 或 Strict 模式并先说明原因，保留鼠鼠角色特征，但界面布局、配色、字体和组件必须根据当前产品重新设计，最后交付可编辑源码并真实运行或渲染检查。
```

Claude uses `adapters/claude/SKILL.md`, Gemini uses `adapters/gemini/SKILL.md`, DeepSeek uses `adapters/deepseek/SKILL.md`, and other capable hosts use `adapters/generic/AGENT.md`.

Compatibility is capability-bounded: use only a tool-capable host that can load the full plugin directory, read files, view images, run Node.js, edit the target project, and run or render the target; this does not mean every chatbot can complete the workflow.

Full guide: https://github.com/LaoFeng-mouse/fantasy-mouse-ui/blob/main/docs/agent-usage.md. This guide is post-release documentation on `main`; it is not part of the v0.2.0 tag or ZIP contents. This documentation-only update does not modify the existing v0.2.0 tag, GitHub Release, or release asset.
