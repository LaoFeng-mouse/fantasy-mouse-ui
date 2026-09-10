# Install Fantasy Mouse UI with AI / 使用 AI 安装 Fantasy Mouse UI

> Source update (2026-09-10): UI-only preservation rules, component feedback, interruptible motion, recovery guidance, and compatible v2 recipe metadata validation are implemented. Existing character assets remain unchanged; new face/body production is paused. The published v0.2.0 ZIP and its recorded checksums remain the historical release baseline; they do not include these changes. See [upgrade evidence](docs/upgrade-2026-09-10.md).

For the shortest copy-paste path, use the [Agent usage guide](docs/agent-usage.md). This document is the detailed installation and verification runbook. / 最短复制使用方式见 [Agent 使用指南](docs/agent-usage.md)；本文保留详细安装与分层验证流程。

## What is installed and prerequisites / 安装内容与前置条件

Fantasy Mouse UI must be installed as a complete plugin directory. The installing Agent must be able to read and write files and view images. Node.js 24 or newer is required to run the bundle verifier. Keep the plugin's `skills/`, `adapters/`, `assets/`, `protocol/`, `references/`, and `scripts/` paths together.

Fantasy Mouse UI 必须作为完整插件目录安装。执行安装的 Agent 必须能够读写文件并查看图片。运行素材验证脚本需要 Node.js 24 或更高版本。请完整保留插件中的 `skills/`、`adapters/`、`assets/`、`protocol/`、`references/` 和 `scripts/` 目录结构。

The current installation contract is the exact 24-file plugin inventory. Execution defaults to Standard: `plugins/fantasy-mouse-ui/config/execution-modes.json` is governed by `plugins/fantasy-mouse-ui/protocol/execution-modes.schema.json`, and `plugins/fantasy-mouse-ui/scripts/resolve-mode.mjs` performs mode preflight. The MIT License covers the software code; the bundled visual assets have a separately disclosed, unverified internet-derived origin and unconfirmed underlying authorship/license in [Asset provenance](plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md).

当前安装契约是完整且精确的 24 文件插件清单。执行模式默认是 Standard：`plugins/fantasy-mouse-ui/config/execution-modes.json` 受 `plugins/fantasy-mouse-ui/protocol/execution-modes.schema.json` 约束，并由 `plugins/fantasy-mouse-ui/scripts/resolve-mode.mjs` 执行模式预检。MIT 许可证适用于软件代码；随包视觉素材的互联网衍生来源未经核实，底层作者与许可状态未确认，详见[素材来源说明](plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md)。

> **Never copy only SKILL.md. / 不要只复制单个 SKILL.md。**

## Codex marketplace / Codex 市场安装

### Manual English Codex workflow

The first mandatory operation is the targeted add for the exact expected repository:

```powershell
codex plugin marketplace add https://github.com/LaoFeng-mouse/fantasy-mouse-ui --json
```

Accept identity only when successful JSON reports `alreadyAdded` as `false` or `true` for that exact expected URL. If `alreadyAdded` is `true`, run `codex plugin marketplace upgrade fantasy-mouse-ui --json`. If the CLI reports a same-name/different-source collision or error, stop and report it. Do not continue through that marketplace identity.

After the add identity is accepted, confirm the expected available plugin and its accepted marketplace source before installation:

```powershell
codex plugin list --marketplace fantasy-mouse-ui --available --json
codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json
codex plugin list --marketplace fantasy-mouse-ui --json
```

The targeted available listing must contain plugin `fantasy-mouse-ui` from the accepted `fantasy-mouse-ui` marketplace before `plugin add`. The targeted installed listing must then show it as installed.

From the installed plugin root, run `node scripts/verify-bundle.mjs` and require `{"ok":true,"assets":4}`. Then run `node scripts/resolve-mode.mjs`; without an explicit request or strict trigger it must resolve Standard.

Only after the targeted flow, this command may be used for optional diagnostics:

```powershell
codex plugin marketplace list --json
```

The global marketplace list is optional diagnostics; its failure must not block this targeted flow. Actual loading in a new task/session is a separate final boundary.

### Codex 中文手动流程

第一个强制操作是针对精确预期仓库执行定向添加：

```powershell
codex plugin marketplace add https://github.com/LaoFeng-mouse/fantasy-mouse-ui --json
```

只有成功 JSON 针对该精确预期 URL 返回 `alreadyAdded` 为 `false` 或 `true` 时，才接受市场身份。如果 `alreadyAdded` 为 `true`，运行 `codex plugin marketplace upgrade fantasy-mouse-ui --json`。如果 CLI 报告同名不同来源冲突或错误，必须停止并报告。不得继续使用该市场身份。

接受添加返回的身份后，安装前必须定向确认预期插件及其已接受的市场来源：

```powershell
codex plugin list --marketplace fantasy-mouse-ui --available --json
codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json
codex plugin list --marketplace fantasy-mouse-ui --json
```

执行 `plugin add` 前，定向可用列表必须包含已接受的 `fantasy-mouse-ui` 市场中的 `fantasy-mouse-ui` 插件；随后定向已安装列表必须显示该插件已安装。

随后从已安装插件根目录运行 `node scripts/verify-bundle.mjs` 并要求 `{"ok":true,"assets":4}`；再运行 `node scripts/resolve-mode.mjs`。没有显式请求或严格触发器时，结果必须解析为 Standard。

只有完成定向流程后，才可把以下命令用于可选诊断：

```powershell
codex plugin marketplace list --json
```

全局市场列表仅是可选诊断；其失败不得阻断此定向流程。在新任务/会话中实际加载是单独的最终边界。

## Release ZIP / Release ZIP 安装

**Historical v0.1.0 release record / 历史 v0.1.0 发布记录:** only the fixed `releases/tag/v0.1.0` URL identifies the historical v0.1.0 release. The `releases/latest` page and `releases/latest/download/fantasy-mouse-ui.zip` URL are mutable discovery endpoints / 可变发现端点; they do not identify a version or establish trust.

The fixed current release is `https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/tag/v0.2.0`. Its published ZIP was independently downloaded and verified byte-for-byte at SHA-256 `4AA588B0DA90A6E669B3EE833A1BC3F48DA10E6009654668016B75AA3837AEB3`. 当前固定版本是上述 GitHub v0.2.0 Release；其 ZIP 已独立回下载并按同一 SHA-256 完成逐字节验证。A local source build remains an acceptable alternative only when it produces that same complete archive identity.

A downloaded ZIP may be treated as the current package only when the exact 24-entry inventory and applicable validators pass and the complete ZIP matches the verified v0.2.0 SHA-256 above, or is byte-for-byte identical to that release asset. 下载的 ZIP 只有在精确 24 项清单与适用验证器全部通过，并且完整 ZIP 匹配上方已验证的 v0.2.0 SHA-256，或与该 Release 资产逐字节相同时，才可视为当前包。

Inventory validation and `verify-bundle.mjs` authenticate only archive structure and the four pinned visual bytes; they do not authenticate every script, schema, or Skill file. 清单验证和 `verify-bundle.mjs` 只认证压缩包结构与四个固定视觉文件的字节；它们不认证每个脚本、Schema 或 Skill 文件。Whole-archive SHA-256 identity supplies the missing complete-byte binding.

### Manual English ZIP workflow

Download the fixed v0.2.0 archive from `https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/download/v0.2.0/fantasy-mouse-ui.zip`, or build it locally from the version-pinned source. The fixed GitHub [`v0.1.0` release](https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/tag/v0.1.0) is historical. The [latest release](https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/latest) page and direct latest download are mutable discovery endpoints and may resolve to different versions over time; any downloaded ZIP must satisfy the inventory, validator, and trusted whole-archive identity requirements above:

```text
https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/latest/download/fantasy-mouse-ui.zip
```

The final `fantasy-mouse-ui` destination must not exist or must be empty. If an existing installation is present, stop and report it; updating requires a separate explicit backup-and-replacement decision or host-supported reinstall flow.

**[1. Archive preflight]** Before extracting anything, enumerate ZIP central-directory entries and metadata. Raw entry names containing backslashes are rejected. Normalize accepted names to forward-slash form. Normalized forward-slash names must exactly equal the independent 24-file allowlist. Reject absolute paths, drive-letter paths, UNC paths, empty names, `.` or `..` components, path escape, duplicate names, and case-colliding names. Reject directory entries and link, symlink, junction, reparse-point, device, or other non-regular entries.

The independent allowlist is exactly:

```text
.codex-plugin/plugin.json
ASSET_PROVENANCE.md
LICENSE
adapters/claude/SKILL.md
adapters/deepseek/SKILL.md
adapters/gemini/SKILL.md
adapters/generic/AGENT.md
assets/visual-grounding/canonical-protagonist.png
assets/visual-grounding/manifest.json
assets/visual-grounding/processing-action-hands.png
assets/visual-grounding/processing-with-bubble.png
assets/visual-grounding/processing-without-bubble.png
config/execution-modes.json
protocol/execution-modes.schema.json
protocol/mouse-ui-project.schema.json
protocol/workflow-brief.schema.json
references/qa.md
references/style-independence.md
references/visual-grounding.md
references/workflow-to-ui.md
scripts/resolve-mode.mjs
scripts/validate-workflow.mjs
scripts/verify-bundle.mjs
skills/fantasy-mouse-ui/SKILL.md
```

**[2. Extraction]** Create a newly allocated unique staging directory. Create a destination directory named `fantasy-mouse-ui` first, then extract every ZIP entry into that directory. Use an extraction API that enforces every output destination remains inside the staged `fantasy-mouse-ui` root and refuses links and reparse points. Never extract directly into the host plugin root or final destination.

**[3. Post-extraction lstat and inventory]** After extraction, lstat exactly 24 regular files and reject extras. Recheck the same independent allowlist, reject links and reparse points, and fail on every missing, unexpected, duplicate, or case-colliding output.

**[4. Visual bundle verification]** From the staged plugin root, run `node scripts/verify-bundle.mjs` and require `{"ok":true,"assets":4}`. Then run `node scripts/resolve-mode.mjs`; the no-argument result must be `{"ok":true,"mode":"standard","reason":"default","upgradedFrom":null}`. The resolver validates `config/execution-modes.json` against the contract represented by `protocol/execution-modes.schema.json`.

**[5. Collision-failing final move]** Recheck that final is still absent or empty, then use a collision-failing rename/move to place the staged plugin at final. Never merge, delete, or overwrite an existing installation. If the host cannot move safely into an empty placeholder, stop and choose a nonexistent final path.

### 中文手动 ZIP 流程

请从 `https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/download/v0.2.0/fantasy-mouse-ui.zip` 下载固定的 v0.2.0 压缩包，或从该版本固定源码本地构建。固定的 GitHub [`v0.1.0` Release](https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/tag/v0.1.0) 属于历史记录。[latest Release](https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/latest) 页面和以下 latest 下载直链属于可变发现端点，可能随时间指向不同版本；任何下载 ZIP 都必须满足上文的清单、验证器和可信完整压缩包身份要求：

```text
https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/latest/download/fantasy-mouse-ui.zip
```

最终的 `fantasy-mouse-ui` 目标目录必须不存在或为空。发现现有安装时必须停止并报告；更新必须作为单独的明确备份与替换决策，或使用宿主支持的重新安装流程。

**[1. 压缩包预检]** 解压任何内容前，必须枚举 ZIP 中央目录的全部条目和元数据。原始条目名包含反斜杠时必须拒绝。只把已接受的名称规范化为正斜杠形式。规范化后的正斜杠名称必须与独立的 24 文件允许清单完全一致。必须拒绝绝对路径、盘符路径、UNC 路径、空名称、`.` 或 `..` 组件、路径逃逸、重复名称和大小写冲突名称。必须拒绝目录条目以及链接、符号链接、junction、重解析点、设备或其他非常规条目。

独立允许清单恰好为：

```text
.codex-plugin/plugin.json
ASSET_PROVENANCE.md
LICENSE
adapters/claude/SKILL.md
adapters/deepseek/SKILL.md
adapters/gemini/SKILL.md
adapters/generic/AGENT.md
assets/visual-grounding/canonical-protagonist.png
assets/visual-grounding/manifest.json
assets/visual-grounding/processing-action-hands.png
assets/visual-grounding/processing-with-bubble.png
assets/visual-grounding/processing-without-bubble.png
config/execution-modes.json
protocol/execution-modes.schema.json
protocol/mouse-ui-project.schema.json
protocol/workflow-brief.schema.json
references/qa.md
references/style-independence.md
references/visual-grounding.md
references/workflow-to-ui.md
scripts/resolve-mode.mjs
scripts/validate-workflow.mjs
scripts/verify-bundle.mjs
skills/fantasy-mouse-ui/SKILL.md
```

**[2. 解压]** 新建一个唯一的暂存目录。必须先创建名为 `fantasy-mouse-ui` 的目标目录，再把 ZIP 内的全部内容解压到该目录中。必须使用能够强制每个输出目标都位于暂存 `fantasy-mouse-ui` 根目录内，并拒绝链接和重解析点的解压 API。绝不能直接解压到宿主插件根目录或最终目录。

**[3. 解压后 lstat 与清单检查]** 解压后必须用 lstat 核对恰好 24 个常规文件并拒绝额外条目。再次核对同一份独立允许清单，拒绝链接和重解析点，并对任何缺失、意外、重复或大小写冲突输出关闭失败。

**[4. 视觉素材验证]** 在暂存插件根目录运行 `node scripts/verify-bundle.mjs`，并要求输出 `{"ok":true,"assets":4}`。随后运行 `node scripts/resolve-mode.mjs`；无参数结果必须为 `{"ok":true,"mode":"standard","reason":"default","upgradedFrom":null}`。解析器会按 `protocol/execution-modes.schema.json` 所表达的契约验证 `config/execution-modes.json`。

**[5. 遇到冲突即失败的最终移动]** 再次确认最终目标仍不存在或为空，然后使用遇到目标冲突即失败的重命名/移动，把暂存插件放到最终位置。绝不合并、删除或覆盖现有安装。无法安全移动到空占位目录时，必须停止并选择不存在的最终路径。

## Agent entry points / Agent 入口

- Codex: use the targeted marketplace workflow above.
- Claude: load `adapters/claude/SKILL.md`.
- Gemini: load `adapters/gemini/SKILL.md`.
- DeepSeek: load `adapters/deepseek/SKILL.md`.
- Other compatible Agents: load `adapters/generic/AGENT.md`.

The adapter is an entry point, not a standalone installation artifact. Every host still needs the complete plugin directory.

适配器只是入口文件，不是可单独安装的插件。无论使用哪种 Agent，都必须保留完整插件目录。

## Layered verification / 分层验证

1. Inventory completeness proves only the exact 24 regular files and no extras.
2. `verify-bundle.mjs` proves only the four pinned visual assets; it does not prove complete installation or host loading. Never call the installation successful based only on {"ok":true,"assets":4}.
3. Host registration is separate. Codex uses `codex plugin list --marketplace fantasy-mouse-ui --json`; other hosts use their supported registration/listing check.
4. Actual loading in a new task/session is a separate final boundary.

`{"ok":true,"assets":4}` 只代表视觉素材验证，不证明安装完整、宿主注册或新会话实际加载。安装报告必须分别包含实际绝对安装目录、全部命令、预检结果、解压后 lstat/清单结果、视觉验证输出、宿主注册输出和新会话加载结果。

## 中文一键部署提示词

复制下面整段内容交给具备文件和图片能力的 AI Agent：

```text
请部署 Fantasy Mouse UI 插件，仓库为 https://github.com/LaoFeng-mouse/fantasy-mouse-ui。必须安装完整插件目录，不要只复制单个 SKILL.md。Codex 的第一个强制操作必须是：
codex plugin marketplace add https://github.com/LaoFeng-mouse/fantasy-mouse-ui --json
只有成功 JSON 针对该精确预期 URL 返回 `alreadyAdded` 为 `false` 或 `true` 时，才接受市场身份。如果 `alreadyAdded` 为 `true`，运行 `codex plugin marketplace upgrade fantasy-mouse-ui --json`。如果 CLI 报告同名不同来源冲突或错误，必须停止并报告。
随后依次运行：
codex plugin list --marketplace fantasy-mouse-ui --available --json
codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json
codex plugin list --marketplace fantasy-mouse-ui --json
安装后从完整插件根目录运行 node scripts/verify-bundle.mjs 并要求 {"ok":true,"assets":4}；再运行 node scripts/resolve-mode.mjs，默认必须解析为 Standard。
定向可用列表必须先确认预期插件及已接受来源，安装后再确认已安装列表。最后可选运行：
codex plugin marketplace list --json
全局市场列表仅是可选诊断；其失败不得阻断此定向流程。

当前固定版本是 https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/tag/v0.2.0；其发布 ZIP 已独立回下载并验证为 SHA-256 4AA588B0DA90A6E669B3EE833A1BC3F48DA10E6009654668016B75AA3837AEB3。固定的 https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/tag/v0.1.0 是历史 v0.1.0 发布记录；https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/latest 和 https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/latest/download/fantasy-mouse-ui.zip 是可变发现端点，不单独建立版本或信任。下载 ZIP 必须通过精确 24 项清单与适用验证器，并匹配上述 v0.2.0 SHA-256，或与该 Release 资产逐字节相同。最终目标必须不存在或为空；存在安装时停止并报告，更新走单独的备份替换或宿主重装流程。

[1. 压缩包预检] 解压任何内容前，必须枚举 ZIP 中央目录的全部条目和元数据。原始条目名包含反斜杠时必须拒绝。只把已接受名称规范化为正斜杠。规范化后的正斜杠名称必须与独立的 24 文件允许清单完全一致。必须拒绝绝对路径、盘符路径、UNC 路径、空名称、`.` 或 `..` 组件、路径逃逸、重复名称和大小写冲突名称。必须拒绝目录条目以及链接、符号链接、junction、重解析点、设备或其他非常规条目。
允许清单：.codex-plugin/plugin.json；ASSET_PROVENANCE.md；LICENSE；adapters/claude/SKILL.md；adapters/deepseek/SKILL.md；adapters/gemini/SKILL.md；adapters/generic/AGENT.md；assets/visual-grounding/canonical-protagonist.png；assets/visual-grounding/manifest.json；assets/visual-grounding/processing-action-hands.png；assets/visual-grounding/processing-with-bubble.png；assets/visual-grounding/processing-without-bubble.png；config/execution-modes.json；protocol/execution-modes.schema.json；protocol/mouse-ui-project.schema.json；protocol/workflow-brief.schema.json；references/qa.md；references/style-independence.md；references/visual-grounding.md；references/workflow-to-ui.md；scripts/resolve-mode.mjs；scripts/validate-workflow.mjs；scripts/verify-bundle.mjs；skills/fantasy-mouse-ui/SKILL.md。
[2. 解压] 新建唯一暂存目录。必须先创建名为 `fantasy-mouse-ui` 的目标目录，再把 ZIP 内的全部内容解压到该目录中。必须使用能够强制每个输出目标都位于暂存 `fantasy-mouse-ui` 根目录内，并拒绝链接和重解析点的解压 API。
[3. 解压后 lstat 与清单检查] 解压后必须用 lstat 核对恰好 24 个常规文件并拒绝额外条目。再次核对允许清单并拒绝缺失、意外、重复、大小写冲突、链接或重解析点。
[4. 视觉素材验证] 在暂存插件根目录运行 node scripts/verify-bundle.mjs，并要求 {"ok":true,"assets":4}。再运行 node scripts/resolve-mode.mjs；无显式请求或严格触发器时必须解析为 Standard。
[5. 遇到冲突即失败的最终移动] 再次确认最终目标不存在或为空，仅使用遇到冲突即失败的移动。绝不合并、删除或覆盖现有安装。

`verify-bundle.mjs` 只证明四个固定视觉素材，不证明安装完整，也不证明宿主已加载插件。{"ok":true,"assets":4} 只代表“视觉素材包验证通过”，不代表“安装成功”。在新任务/会话中实际加载是单独的最终边界。Claude 使用 adapters/claude/SKILL.md；Gemini 使用 adapters/gemini/SKILL.md；DeepSeek 使用 adapters/deepseek/SKILL.md；其他 Agent 使用 adapters/generic/AGENT.md。请分别报告预检、清单、视觉验证、宿主注册和新会话加载证据。
请返回实际绝对安装目录、执行过的每一条命令、各层完整验证输出，以及是否需要并已完成新任务/会话加载；任何一项缺失或失败都不得声称安装成功。
```

## English copy-paste deployment prompt

Copy the entire prompt below into a file-capable and image-capable AI Agent:

```text
Install Fantasy Mouse UI from https://github.com/LaoFeng-mouse/fantasy-mouse-ui. Install the complete plugin directory. Do not copy only SKILL.md. For Codex, the first mandatory operation is:
codex plugin marketplace add https://github.com/LaoFeng-mouse/fantasy-mouse-ui --json
Accept identity only when successful JSON reports `alreadyAdded` as `false` or `true` for that exact expected URL. If `alreadyAdded` is `true`, run `codex plugin marketplace upgrade fantasy-mouse-ui --json`. If the CLI reports a same-name/different-source collision or error, stop and report it.
Then run, in order:
codex plugin list --marketplace fantasy-mouse-ui --available --json
codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json
codex plugin list --marketplace fantasy-mouse-ui --json
After installation, from the complete plugin root run node scripts/verify-bundle.mjs and require {"ok":true,"assets":4}; then run node scripts/resolve-mode.mjs and require the default Standard mode.
The targeted available listing must first confirm the expected plugin and accepted source; after installation, confirm the installed listing. Only then optionally run:
codex plugin marketplace list --json
The global marketplace list is optional diagnostics; its failure must not block this targeted flow.

The fixed current release is https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/tag/v0.2.0; its published ZIP was independently downloaded and verified at SHA-256 4AA588B0DA90A6E669B3EE833A1BC3F48DA10E6009654668016B75AA3837AEB3. The fixed https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/tag/v0.1.0 URL is the historical v0.1.0 release record; https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/latest and https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/latest/download/fantasy-mouse-ui.zip are mutable discovery endpoints and alone establish neither version nor trust. A downloaded ZIP must pass the exact 24-entry inventory and applicable validators and match the verified v0.2.0 SHA-256, or be byte-for-byte identical to that Release asset. Final must be absent or empty; stop and report an existing installation, and handle updates only through a separate backup/replacement or host reinstall flow.

[1. Archive preflight] Before extracting anything, enumerate ZIP central-directory entries and metadata. Raw entry names containing backslashes are rejected. Normalize accepted names to forward slashes. Normalized forward-slash names must exactly equal the independent 24-file allowlist. Reject absolute paths, drive-letter paths, UNC paths, empty names, `.` or `..` components, path escape, duplicate names, and case-colliding names. Reject directory entries and link, symlink, junction, reparse-point, device, or other non-regular entries.
Allowlist: .codex-plugin/plugin.json; ASSET_PROVENANCE.md; LICENSE; adapters/claude/SKILL.md; adapters/deepseek/SKILL.md; adapters/gemini/SKILL.md; adapters/generic/AGENT.md; assets/visual-grounding/canonical-protagonist.png; assets/visual-grounding/manifest.json; assets/visual-grounding/processing-action-hands.png; assets/visual-grounding/processing-with-bubble.png; assets/visual-grounding/processing-without-bubble.png; config/execution-modes.json; protocol/execution-modes.schema.json; protocol/mouse-ui-project.schema.json; protocol/workflow-brief.schema.json; references/qa.md; references/style-independence.md; references/visual-grounding.md; references/workflow-to-ui.md; scripts/resolve-mode.mjs; scripts/validate-workflow.mjs; scripts/verify-bundle.mjs; skills/fantasy-mouse-ui/SKILL.md.
[2. Extraction] Create a unique staging directory. Create a destination directory named `fantasy-mouse-ui` first, then extract every ZIP entry into that directory. Use an extraction API that enforces every output destination remains inside the staged `fantasy-mouse-ui` root and refuses links and reparse points.
[3. Post-extraction lstat and inventory] After extraction, lstat exactly 24 regular files and reject extras. Recheck the allowlist and reject missing, unexpected, duplicate, case-colliding, linked, or reparse-point outputs.
[4. Visual bundle verification] From staged plugin root run node scripts/verify-bundle.mjs and require {"ok":true,"assets":4}. Then run node scripts/resolve-mode.mjs; with no explicit request or strict trigger it must resolve Standard.
[5. Collision-failing final move] Recheck final is absent or empty and use only a collision-failing move. Never merge, delete, or overwrite an existing installation.

`verify-bundle.mjs` proves only the four pinned visual assets; it does not prove complete installation or host loading. Never call the installation successful based only on {"ok":true,"assets":4}. Actual loading in a new task/session is a separate final boundary. Claude uses adapters/claude/SKILL.md; Gemini uses adapters/gemini/SKILL.md; DeepSeek uses adapters/deepseek/SKILL.md; other Agents use adapters/generic/AGENT.md. Report preflight, inventory, visual verification, host registration, and new-session loading evidence separately.
Return the actual absolute installation directory, every command used, the complete output from every verification tier, and whether a new task/session is required and has loaded the plugin; do not claim installation success when any item is missing or failed.
```
