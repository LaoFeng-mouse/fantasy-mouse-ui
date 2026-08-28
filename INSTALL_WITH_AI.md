# Install Fantasy Mouse UI with AI / 使用 AI 安装 Fantasy Mouse UI

## What is installed and prerequisites / 安装内容与前置条件

Fantasy Mouse UI must be installed as a complete plugin directory. The installing Agent must be able to read and write files and view images. Node.js 24 or newer is required to run the bundle verifier. Keep the plugin's `skills/`, `adapters/`, `assets/`, `protocol/`, `references/`, and `scripts/` paths together.

Fantasy Mouse UI 必须作为完整插件目录安装。执行安装的 Agent 必须能够读写文件并查看图片。运行素材验证脚本需要 Node.js 24 或更高版本。请完整保留插件中的 `skills/`、`adapters/`、`assets/`、`protocol/`、`references/` 和 `scripts/` 目录结构。

> **Never copy only `SKILL.md` / 不要只复制单个 `SKILL.md`.**

## Codex marketplace / Codex 市场安装

Use the live-supported JSON listing commands to preserve marketplace identity and fail closed on name collisions:

```powershell
codex plugin marketplace list --json
```

Inspect the configured marketplace named `fantasy-mouse-ui` and its reported source:

1. If the name is absent, add the expected repository and inspect the list again:

   ```powershell
   codex plugin marketplace add https://github.com/LI-2004-feng/fantasy-mouse-ui --json
   codex plugin marketplace list --json
   ```

2. If the same name points to the expected Git source `https://github.com/LI-2004-feng/fantasy-mouse-ui`, refresh that configured snapshot:

   ```powershell
   codex plugin marketplace upgrade fantasy-mouse-ui --json
   ```

3. If the same name points to a different source, stop and report the marketplace-name collision. Do not add, upgrade, or install through that identity until the user resolves it.

Confirm the expected available plugin before installation, then install and verify Codex registration:

```powershell
codex plugin list --marketplace fantasy-mouse-ui --available --json
codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json
codex plugin list --marketplace fantasy-mouse-ui --json
```

The available listing must contain `fantasy-mouse-ui` from marketplace `fantasy-mouse-ui` before `plugin add`. The final listing must show it as installed. Actual loading in a new task/session is a separate final boundary. Start a new Codex task/session and confirm the plugin instructions are actually available; an already-running task does not reload newly installed plugin instructions.

Codex 安装必须先用当前 CLI 支持的 JSON 列表命令核对市场身份，并在名称冲突时关闭失败：

```powershell
codex plugin marketplace list --json
```

检查名为 `fantasy-mouse-ui` 的已配置市场及其返回的来源：

1. 名称不存在时，添加预期仓库并重新检查列表：

   ```powershell
   codex plugin marketplace add https://github.com/LI-2004-feng/fantasy-mouse-ui --json
   codex plugin marketplace list --json
   ```

2. 同名市场指向预期 Git 来源 `https://github.com/LI-2004-feng/fantasy-mouse-ui` 时，刷新该市场快照：

   ```powershell
   codex plugin marketplace upgrade fantasy-mouse-ui --json
   ```

3. 同名市场指向不同来源时，必须停止并报告名称冲突。在用户解决冲突前，不得通过该身份添加、升级或安装。

安装前确认市场中存在预期插件，然后执行安装并验证 Codex 注册状态：

```powershell
codex plugin list --marketplace fantasy-mouse-ui --available --json
codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json
codex plugin list --marketplace fantasy-mouse-ui --json
```

执行 `plugin add` 前，可用插件列表必须包含市场 `fantasy-mouse-ui` 中的插件 `fantasy-mouse-ui`；最后的列表必须显示插件已安装。在新任务/会话中实际加载是单独的最终边界。必须新建 Codex 任务/会话并确认插件指令确实可用；已经打开的任务不会重新加载刚安装的插件指令。

## Release ZIP / Release ZIP 安装

Download `fantasy-mouse-ui.zip` from the GitHub [`v0.1.0` release](https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/tag/v0.1.0) or the [latest release](https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/latest). The latest-release asset also has this direct URL:

从 GitHub [`v0.1.0` Release](https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/tag/v0.1.0) 或 [latest Release](https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/latest) 下载 `fantasy-mouse-ui.zip`。latest Release 资源也可使用以下直链：

```text
https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/latest/download/fantasy-mouse-ui.zip
```

The ZIP stores plugin entries at the archive root and does not contain a wrapping directory. Use this collision-safe transaction:

1. Choose the intended final plugin path. The final `fantasy-mouse-ui` destination must not exist or must be empty. If an existing installation is present, stop and report it; updating is a separate explicit operation. Updates require an explicit backup-and-replacement decision or a host-supported reinstall flow.
2. Create a newly allocated unique staging directory. Inside staging, prepare extraction as follows. Create a destination directory named `fantasy-mouse-ui` first, then extract every ZIP entry into that directory. Never extract directly into the host plugin root or final destination.
3. Require ordinary regular files only. Validate exactly 20 regular files and no unexpected entries before moving the staged plugin into the final destination. The exact relative inventory is:

   ```text
   .codex-plugin/plugin.json
   adapters/claude/SKILL.md
   adapters/deepseek/SKILL.md
   adapters/gemini/SKILL.md
   adapters/generic/AGENT.md
   assets/visual-grounding/canonical-protagonist.png
   assets/visual-grounding/manifest.json
   assets/visual-grounding/processing-action-hands.png
   assets/visual-grounding/processing-with-bubble.png
   assets/visual-grounding/processing-without-bubble.png
   LICENSE
   protocol/mouse-ui-project.schema.json
   protocol/workflow-brief.schema.json
   references/qa.md
   references/style-independence.md
   references/visual-grounding.md
   references/workflow-to-ui.md
   scripts/validate-workflow.mjs
   scripts/verify-bundle.mjs
   skills/fantasy-mouse-ui/SKILL.md
   ```

4. From the staged `fantasy-mouse-ui` root, run `node scripts/verify-bundle.mjs` and require `{"ok":true,"assets":4}`.
5. Recheck that the final destination is still absent or empty. Only then use a collision-failing host filesystem rename/move to place the staged `fantasy-mouse-ui` directory at the final path. Never merge into or overwrite an existing installation. If the host cannot move into a verified empty placeholder without merging, stop and select a nonexistent final path instead.

Do not delete or overwrite an existing installation. Do not flatten, rename, or separately copy required relative dependencies.

ZIP 中的插件条目直接位于压缩包根层级，不包含外层目录。使用以下关闭失败的安全事务：

1. 选择最终插件路径。最终的 `fantasy-mouse-ui` 目标目录必须不存在或为空。发现现有安装时必须停止并报告；更新是单独的显式操作。更新必须经过明确的备份与替换决策，或使用宿主支持的重新安装流程。
2. 新建一个唯一的暂存目录。在暂存目录内，必须先创建名为 `fantasy-mouse-ui` 的目标目录，再把 ZIP 内的全部内容解压到该目录中。绝不能直接解压到宿主插件根目录或最终目标目录。
3. 只接受普通常规文件。在把暂存插件移动到最终位置前，必须验证恰好 20 个常规文件且没有意外条目。相对路径必须与上面的 20 项清单完全一致。
4. 在暂存的 `fantasy-mouse-ui` 根目录运行 `node scripts/verify-bundle.mjs`，并要求输出 `{"ok":true,"assets":4}`。
5. 再次确认最终目标仍然不存在或为空，然后才能使用遇到目标冲突就失败的宿主文件系统重命名/移动操作，把暂存的 `fantasy-mouse-ui` 目录放到最终路径。绝不合并或覆盖现有安装。如果宿主无法在不合并的情况下移动到已验证为空的占位目录，必须停止并改用不存在的最终路径。

不得删除或覆盖现有安装。不要打平目录、随意改名或单独复制相对依赖。

## Agent entry points / Agent 入口

- Codex: install through the repository marketplace commands above.
- Claude: load `adapters/claude/SKILL.md`.
- Gemini: load `adapters/gemini/SKILL.md`.
- DeepSeek: load `adapters/deepseek/SKILL.md`.
- Other compatible Agents: load `adapters/generic/AGENT.md`.

The adapter is an entry point, not a standalone installation artifact. Every host still needs the complete plugin directory.

适配器只是入口文件，不是可单独安装的插件。无论使用哪种 Agent，都必须保留完整插件目录。

## Layered verification / 分层验证

These gates prove different things and must be reported separately:

1. **Inventory completeness:** validate the exact 20-file inventory above, all as regular files, with no missing or unexpected entries.
2. **Visual bundle integrity:** from the candidate plugin root, run:

   ```powershell
   node scripts/verify-bundle.mjs
   ```

   Require the exact output `{"ok":true,"assets":4}`. `verify-bundle.mjs` proves only the four pinned visual assets; it does not prove complete installation or host loading. Never call the installation successful based only on {"ok":true,"assets":4}. That result means **visual bundle verified**, not **installation successful**.
3. **Host registration:** for Codex, verify the installed listing with only the live-supported syntax:

   ```powershell
   codex plugin list --marketplace fantasy-mouse-ui --json
   ```

   Other hosts must use their supported plugin/Skill registration or listing check.
4. **Actual load:** Actual loading in a new task/session is a separate final boundary. Start a new task/session and confirm that the correct adapter or Skill instructions are available before reporting end-to-end installation success.

The installation report must include the actual absolute installation directory, every command used, the inventory result, complete visual-bundle output, host registration/listing output, and new-session loading result. Report any failed tier honestly.

各层验证证明的内容不同，必须分别报告：

1. **清单完整性：**核对上面的精确 20 文件清单；全部必须为常规文件，不得缺失，也不得出现意外条目。
2. **视觉素材包完整性：**在候选插件根目录运行 `node scripts/verify-bundle.mjs`，并要求精确输出 `{"ok":true,"assets":4}`。`verify-bundle.mjs` 只证明四个固定视觉素材，不证明安装完整，也不证明宿主已加载插件。{"ok":true,"assets":4} 只代表“视觉素材包验证通过”，不代表“安装成功”。
3. **宿主注册：**Codex 必须使用当前 CLI 支持的 `codex plugin list --marketplace fantasy-mouse-ui --json` 验证已安装列表；其他宿主使用其支持的插件/Skill 注册或列表检查。
4. **实际加载：**在新任务/会话中实际加载是单独的最终边界。必须新建任务/会话，确认正确的适配器或 Skill 指令可用后，才能报告端到端安装成功。

安装报告必须包含实际绝对安装目录、全部执行命令、清单结果、完整视觉素材包输出、宿主注册/列表输出，以及新会话加载结果。任何一层失败都必须如实报告。

## 中文一键部署提示词

复制下面整段内容交给具备文件和图片能力的 AI Agent：

```text
请部署 Fantasy Mouse UI 插件，仓库为 https://github.com/LI-2004-feng/fantasy-mouse-ui 。先识别当前 Agent 类型。Codex 使用仓库 marketplace；Claude 使用 adapters/claude/SKILL.md；Gemini 使用 adapters/gemini/SKILL.md；DeepSeek 使用 adapters/deepseek/SKILL.md；其他 Agent 使用 adapters/generic/AGENT.md。必须安装完整插件目录，不要只复制单个 SKILL.md。

Codex 必须先运行 codex plugin marketplace list --json。名称不存在时，运行 codex plugin marketplace add https://github.com/LI-2004-feng/fantasy-mouse-ui --json，然后重新运行 codex plugin marketplace list --json。同名市场指向预期 Git 来源 https://github.com/LI-2004-feng/fantasy-mouse-ui 时，运行 codex plugin marketplace upgrade fantasy-mouse-ui --json。同名市场指向不同来源时，必须停止并报告名称冲突。确认身份后，先运行 codex plugin list --marketplace fantasy-mouse-ui --available --json，并确认预期插件存在；然后运行 codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json；最后运行 codex plugin list --marketplace fantasy-mouse-ui --json 验证注册。

如果使用 Release ZIP，请从 https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/tag/v0.1.0、https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/latest 或 https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/latest/download/fantasy-mouse-ui.zip 获取资源。最终的 `fantasy-mouse-ui` 目标目录必须不存在或为空。发现现有安装时必须停止并报告；更新是单独的显式操作。更新必须采用明确的备份与替换决策或宿主支持的重新安装流程。新建一个唯一的暂存目录。在暂存目录内，必须先创建名为 `fantasy-mouse-ui` 的目标目录，再把 ZIP 内的全部内容解压到该目录中。绝不合并或覆盖现有安装。

在把暂存插件移动到最终位置前，必须验证恰好 20 个常规文件且没有意外条目。精确相对路径为：.codex-plugin/plugin.json；adapters/claude/SKILL.md；adapters/deepseek/SKILL.md；adapters/gemini/SKILL.md；adapters/generic/AGENT.md；assets/visual-grounding/canonical-protagonist.png；assets/visual-grounding/manifest.json；assets/visual-grounding/processing-action-hands.png；assets/visual-grounding/processing-with-bubble.png；assets/visual-grounding/processing-without-bubble.png；LICENSE；protocol/mouse-ui-project.schema.json；protocol/workflow-brief.schema.json；references/qa.md；references/style-independence.md；references/visual-grounding.md；references/workflow-to-ui.md；scripts/validate-workflow.mjs；scripts/verify-bundle.mjs；skills/fantasy-mouse-ui/SKILL.md。只接受常规文件。清单通过后，在暂存插件根目录运行 node scripts/verify-bundle.mjs；只有输出 {"ok":true,"assets":4} 才能报告视觉素材包验证通过。再次确认最终目标不存在或为空，之后才能使用遇到冲突就失败的重命名/移动把暂存插件放到最终路径；不能安全移动时必须停止，不得合并、删除或覆盖。

`verify-bundle.mjs` 只证明四个固定视觉素材，不证明安装完整，也不证明宿主已加载插件。{"ok":true,"assets":4} 只代表“视觉素材包验证通过”，不代表“安装成功”。在新任务/会话中实际加载是单独的最终边界。请分别返回实际安装目录、全部命令、20 文件清单结果、视觉素材包输出、宿主列表/注册输出、新会话加载结果；任何一层失败都不得声称安装成功。
```

## English copy-paste deployment prompt

Copy the entire prompt below into a file-capable and image-capable AI Agent:

```text
Install the Fantasy Mouse UI plugin from https://github.com/LI-2004-feng/fantasy-mouse-ui. First identify the current Agent type. Codex must use the repository marketplace; Claude uses adapters/claude/SKILL.md; Gemini uses adapters/gemini/SKILL.md; DeepSeek uses adapters/deepseek/SKILL.md; other Agents use adapters/generic/AGENT.md. Install the complete plugin directory. Do not copy only SKILL.md.

For Codex, first run codex plugin marketplace list --json. If fantasy-mouse-ui is absent, run codex plugin marketplace add https://github.com/LI-2004-feng/fantasy-mouse-ui --json and list again. If the same name points to the expected Git source https://github.com/LI-2004-feng/fantasy-mouse-ui, run codex plugin marketplace upgrade fantasy-mouse-ui --json. If the same name points to a different source, stop and report the marketplace-name collision. After identity is confirmed, run codex plugin list --marketplace fantasy-mouse-ui --available --json and confirm the expected plugin before running codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json. Then run codex plugin list --marketplace fantasy-mouse-ui --json to verify registration.

For the Release ZIP route, use https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/tag/v0.1.0, https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/latest, or https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/latest/download/fantasy-mouse-ui.zip. The final `fantasy-mouse-ui` destination must not exist or must be empty. If an existing installation is present, stop and report it; updating is a separate explicit operation. Updates require an explicit backup-and-replacement decision or host-supported reinstall flow. Create a newly allocated unique staging directory. Inside staging, prepare extraction as follows. Create a destination directory named `fantasy-mouse-ui` first, then extract every ZIP entry into that directory. Never merge into or overwrite an existing installation.

Validate exactly 20 regular files and no unexpected entries before moving the staged plugin into the final destination. The exact relative paths are: .codex-plugin/plugin.json; adapters/claude/SKILL.md; adapters/deepseek/SKILL.md; adapters/gemini/SKILL.md; adapters/generic/AGENT.md; assets/visual-grounding/canonical-protagonist.png; assets/visual-grounding/manifest.json; assets/visual-grounding/processing-action-hands.png; assets/visual-grounding/processing-with-bubble.png; assets/visual-grounding/processing-without-bubble.png; LICENSE; protocol/mouse-ui-project.schema.json; protocol/workflow-brief.schema.json; references/qa.md; references/style-independence.md; references/visual-grounding.md; references/workflow-to-ui.md; scripts/validate-workflow.mjs; scripts/verify-bundle.mjs; skills/fantasy-mouse-ui/SKILL.md. Accept regular files only. After inventory passes, run node scripts/verify-bundle.mjs from the staged plugin root and require {"ok":true,"assets":4}. Recheck that final is absent or empty, then use a collision-failing rename/move to place the staged plugin at final; if that cannot be done safely, stop without merging, deleting, or overwriting.

`verify-bundle.mjs` proves only the four pinned visual assets; it does not prove complete installation or host loading. Never call the installation successful based only on {"ok":true,"assets":4}. That output means "visual bundle verified," not "installation successful." Actual loading in a new task/session is a separate final boundary. Return the actual installation directory, all commands, exact inventory result, visual-bundle output, host registration/listing output, and new-session loading result separately; do not claim success when any tier fails.
```
