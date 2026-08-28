# Install Fantasy Mouse UI with AI / 使用 AI 安装 Fantasy Mouse UI

## What is installed and prerequisites / 安装内容与前置条件

Fantasy Mouse UI must be installed as a complete plugin directory. The installing Agent must be able to read and write files and view images. Node.js 24 or newer is required to run the bundle verifier. Keep the plugin's `skills/`, `adapters/`, `assets/`, `protocol/`, `references/`, and `scripts/` paths together.

Fantasy Mouse UI 必须作为完整插件目录安装。执行安装的 Agent 必须能够读写文件并查看图片。运行素材验证脚本需要 Node.js 24 或更高版本。请完整保留插件中的 `skills/`、`adapters/`、`assets/`、`protocol/`、`references/` 和 `scripts/` 目录结构。

> **Never copy only `SKILL.md` / 不要只复制单个 `SKILL.md`.**

## Codex marketplace / Codex 市场安装

The installed Codex CLI supports a Git repository URL as the marketplace source and a `PLUGIN@MARKETPLACE` selector for installation. Run:

当前 Codex CLI 支持用 Git 仓库 URL 添加市场，并使用 `插件名@市场名` 安装。运行：

```powershell
codex plugin marketplace add https://github.com/LI-2004-feng/fantasy-mouse-ui
codex plugin add fantasy-mouse-ui@fantasy-mouse-ui
```

After installation, start a new Codex task/session. An already-running task does not reload newly installed plugin instructions.

安装完成后，请新建 Codex 任务/会话；已经打开的任务不会重新加载刚安装的插件指令。

## Release ZIP / Release ZIP 安装

Download `fantasy-mouse-ui.zip` from the GitHub [`v0.1.0` release](https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/tag/v0.1.0) or the [latest release](https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/latest). The latest-release asset also has this direct URL:

从 GitHub [`v0.1.0` Release](https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/tag/v0.1.0) 或 [latest Release](https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/latest) 下载 `fantasy-mouse-ui.zip`。latest Release 资源也可使用以下直链：

```text
https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/latest/download/fantasy-mouse-ui.zip
```

The ZIP stores the plugin entries at the archive root; it does not contain a wrapping directory. Create a destination directory named `fantasy-mouse-ui` first, then extract every ZIP entry into that directory. After extraction, that destination must contain `.codex-plugin/`, `skills/`, `adapters/`, `assets/`, `protocol/`, `references/`, `scripts/`, and `LICENSE` at its root. Do not flatten, rename, or separately copy its required relative dependencies.

ZIP 中的插件条目直接位于压缩包根层级，压缩包本身不包含外层目录。必须先创建名为 `fantasy-mouse-ui` 的目标目录，再把 ZIP 内的全部内容解压到该目录中。解压后，该目标目录的根层级必须包含 `.codex-plugin/`、`skills/`、`adapters/`、`assets/`、`protocol/`、`references/`、`scripts/` 和 `LICENSE`。不要打平目录、随意改名或单独复制其相对依赖。

## Agent entry points / Agent 入口

- Codex: install through the repository marketplace commands above.
- Claude: load `adapters/claude/SKILL.md`.
- Gemini: load `adapters/gemini/SKILL.md`.
- DeepSeek: load `adapters/deepseek/SKILL.md`.
- Other compatible Agents: load `adapters/generic/AGENT.md`.

The adapter is an entry point, not a standalone installation artifact. Every host still needs the complete plugin directory.

适配器只是入口文件，不是可单独安装的插件。无论使用哪种 Agent，都必须保留完整插件目录。

## Verify before reporting success / 验证后才能报告成功

From the installed plugin root, run:

在已安装插件的根目录运行：

```powershell
node scripts/verify-bundle.mjs
```

The exact success output is:

唯一可接受的成功输出是：

```json
{"ok":true,"assets":4}
```

Do not claim installation success without this verification. The installation report must include the actual absolute installation directory, every command used, the complete verification output, and whether a new task/session is required. If verification fails, report the failure and do not describe the installation as successful.

未经上述验证，不得声称安装成功。安装报告必须包含实际绝对安装目录、执行过的全部命令、完整验证输出，以及是否必须新建任务/会话。验证失败时应如实报告，不得把安装描述为成功。

## 中文一键部署提示词

复制下面整段内容交给具备文件和图片能力的 AI Agent：

```text
请部署 Fantasy Mouse UI 插件，仓库为 https://github.com/LI-2004-feng/fantasy-mouse-ui 。先识别当前 Agent 类型。Codex 使用仓库 marketplace；Claude、Gemini、DeepSeek 使用对应 adapters；其他 Agent 使用 adapters/generic/AGENT.md。必须安装完整插件目录，不要只复制单个 SKILL.md。安装后运行 scripts/verify-bundle.mjs，只有得到 {"ok":true,"assets":4} 才能报告素材验证通过。请返回实际安装目录、使用的命令、验证输出，以及是否必须新建会话。

如果当前 Agent 是 Codex，请使用以下命令：
codex plugin marketplace add https://github.com/LI-2004-feng/fantasy-mouse-ui
codex plugin add fantasy-mouse-ui@fantasy-mouse-ui
安装后必须新建 Codex 任务/会话。

如果使用 Release ZIP，请从 https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/tag/v0.1.0 或 https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/latest 下载 fantasy-mouse-ui.zip。ZIP 内的插件条目直接位于压缩包根层级；必须先创建名为 `fantasy-mouse-ui` 的目标目录，再把 ZIP 内的全部内容解压到该目录中。解压后，该目标目录的根层级必须包含 .codex-plugin/、skills/、adapters/、assets/、protocol/、references/、scripts/ 和 LICENSE。在安装后的插件根目录运行：
node scripts/verify-bundle.mjs

Claude 使用 adapters/claude/SKILL.md；Gemini 使用 adapters/gemini/SKILL.md；DeepSeek 使用 adapters/deepseek/SKILL.md；其他 Agent 使用 adapters/generic/AGENT.md。不得在验证前声称安装成功。
```

## English copy-paste deployment prompt

Copy the entire prompt below into a file-capable and image-capable AI Agent:

```text
Install the Fantasy Mouse UI plugin from https://github.com/LI-2004-feng/fantasy-mouse-ui. First identify the current Agent type. Codex must use the repository marketplace; Claude, Gemini, and DeepSeek must use their corresponding adapters; other Agents must use adapters/generic/AGENT.md. Install the complete plugin directory. Do not copy only SKILL.md. From the installed plugin root, run node scripts/verify-bundle.mjs, and report asset verification as successful only if the exact output is {"ok":true,"assets":4}. Return the actual absolute installation directory, every command used, the complete verification output, and whether a new task/session is required. Do not claim installation success without verification.

For Codex, run:
codex plugin marketplace add https://github.com/LI-2004-feng/fantasy-mouse-ui
codex plugin add fantasy-mouse-ui@fantasy-mouse-ui
Then start a new Codex task/session.

For the Release ZIP route, download fantasy-mouse-ui.zip from https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/tag/v0.1.0 or https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/latest. The plugin entries are stored at the ZIP root; the ZIP does not contain a wrapping directory. Create a destination directory named `fantasy-mouse-ui` first, then extract every ZIP entry into that directory. After extraction, the destination root must contain .codex-plugin/, skills/, adapters/, assets/, protocol/, references/, scripts/, and LICENSE. Claude uses adapters/claude/SKILL.md; Gemini uses adapters/gemini/SKILL.md; DeepSeek uses adapters/deepseek/SKILL.md; other Agents use adapters/generic/AGENT.md.
```
