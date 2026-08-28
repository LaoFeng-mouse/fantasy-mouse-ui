import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

import manifest from "../../plugins/fantasy-mouse-ui/.codex-plugin/plugin.json" with {
  type: "json"
};

describe("Fantasy Mouse UI plugin manifest", () => {
  it("defines the exact installation boundary without apps or MCP servers", () => {
    const { version, ...manifestWithoutVersion } = manifest;

    expect(version).toMatch(/^0\.1\.0(?:\+codex\.[a-z0-9-]+)?$/);
    expect(manifestWithoutVersion).toEqual({
      name: "fantasy-mouse-ui",
      description:
        "Reusable Skill for creating software UI, websites, presentations, and workflow designs with fixed Fantasy Mouse identity and independently product-derived styling.",
      author: { name: "Fantasy Mouse UI project" },
      keywords: ["ui-design", "frontend", "workflow", "fantasy-mouse"],
      skills: "./skills/",
      interface: {
        displayName: "Fantasy Mouse UI",
        shortDescription:
          "Fixed mouse identity, product-derived cross-surface UI",
        longDescription:
          "Preserve the approved mouse identity while deriving each interface from the target product, users, platform, workflow, source brand, and accessibility needs across software, websites, presentations, and workflows.",
        developerName: "Fantasy Mouse UI project",
        category: "Design",
        capabilities: [
          "Software UI Design",
          "Website Design",
          "Presentation Design",
          "Workflow Translation"
        ],
        defaultPrompt: [
          "Redesign this software with fixed Fantasy Mouse identity and UI derived from the product.",
          "Design this website from its product and source-brand evidence while preserving the Fantasy Mouse character.",
          "Turn this presentation or workflow into an editable Fantasy Mouse treatment without importing a fixed UI theme."
        ],
        brandColor: "#A8D25F"
      }
    });
    expect(manifest).not.toHaveProperty("mcpServers");
    expect(manifest).not.toHaveProperty("apps");
  });

  it.each(["skills", "assets", "scripts"])(
    "%s/ is a directory",
    (directory) => {
      const directoryUrl = new URL(
        `../../plugins/fantasy-mouse-ui/${directory}/`,
        import.meta.url
      );

      expect(statSync(directoryUrl).isDirectory()).toBe(true);
    }
  );

  it("publishes the exact Codex plugin marketplace entry", () => {
    const marketplace = JSON.parse(
      readFileSync(
        new URL("../../.agents/plugins/marketplace.json", import.meta.url),
        "utf8"
      )
    );

    expect(marketplace).toEqual({
      name: "fantasy-mouse-ui",
      interface: { displayName: "Fantasy Mouse UI" },
      plugins: [
        {
          name: "fantasy-mouse-ui",
          source: {
            source: "local",
            path: "./plugins/fantasy-mouse-ui"
          },
          policy: {
            installation: "AVAILABLE",
            authentication: "ON_INSTALL"
          },
          category: "Design"
        }
      ]
    });
  });

  it("documents complete AI-assisted installation", () => {
    const installGuide = readFileSync(
      new URL("../../INSTALL_WITH_AI.md", import.meta.url),
      "utf8"
    );

    expect(installGuide).toContain("codex plugin marketplace add");
    expect(installGuide).toContain('{"ok":true,"assets":4}');
    expect(installGuide).toContain("不要只复制单个 SKILL.md");
    expect(installGuide).toContain("Do not copy only SKILL.md");
    expect(installGuide).toContain(
      "Create a destination directory named `fantasy-mouse-ui` first, then extract every ZIP entry into that directory."
    );
    expect(installGuide).toContain(
      "必须先创建名为 `fantasy-mouse-ui` 的目标目录，再把 ZIP 内的全部内容解压到该目录中。"
    );

    for (const expectedPath of [
      ".codex-plugin/plugin.json",
      "adapters/claude/SKILL.md",
      "adapters/deepseek/SKILL.md",
      "adapters/gemini/SKILL.md",
      "adapters/generic/AGENT.md",
      "assets/visual-grounding/canonical-protagonist.png",
      "assets/visual-grounding/manifest.json",
      "assets/visual-grounding/processing-action-hands.png",
      "assets/visual-grounding/processing-with-bubble.png",
      "assets/visual-grounding/processing-without-bubble.png",
      "LICENSE",
      "protocol/mouse-ui-project.schema.json",
      "protocol/workflow-brief.schema.json",
      "references/qa.md",
      "references/style-independence.md",
      "references/visual-grounding.md",
      "references/workflow-to-ui.md",
      "scripts/validate-workflow.mjs",
      "scripts/verify-bundle.mjs",
      "skills/fantasy-mouse-ui/SKILL.md"
    ]) {
      expect(installGuide).toContain(expectedPath);
    }

    for (const releaseRoute of [
      "https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/tag/v0.1.0",
      "https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/latest",
      "https://github.com/LI-2004-feng/fantasy-mouse-ui/releases/latest/download/fantasy-mouse-ui.zip"
    ]) {
      expect(installGuide).toContain(releaseRoute);
    }

    for (const adapterPath of [
      "adapters/claude/SKILL.md",
      "adapters/gemini/SKILL.md",
      "adapters/deepseek/SKILL.md",
      "adapters/generic/AGENT.md"
    ]) {
      expect(installGuide).toContain(adapterPath);
    }

    expect(installGuide).toContain(
      "`verify-bundle.mjs` proves only the four pinned visual assets; it does not prove complete installation or host loading."
    );
    expect(installGuide).toContain(
      "Actual loading in a new task/session is a separate final boundary."
    );
    expect(installGuide).toContain(
      'Never call the installation successful based only on {"ok":true,"assets":4}.'
    );
  });

  it("orders preflight and targeted marketplace checks in every install route", () => {
    const installGuide = readFileSync(
      new URL("../../INSTALL_WITH_AI.md", import.meta.url),
      "utf8"
    );

    const sectionBetween = (startMarker: string, endMarker: string) => {
      const start = installGuide.indexOf(startMarker);
      const end = installGuide.indexOf(endMarker, start + startMarker.length);
      expect(start, `missing section start: ${startMarker}`).toBeGreaterThanOrEqual(0);
      expect(end, `missing section end: ${endMarker}`).toBeGreaterThan(start);
      return installGuide.slice(start, end);
    };
    const fencedPrompt = (heading: string, nextHeading?: string) => {
      const region = nextHeading
        ? sectionBetween(heading, nextHeading)
        : installGuide.slice(installGuide.indexOf(heading));
      const match = region.match(/```text\r?\n([\s\S]*?)\r?\n```/);
      expect(match, `missing text fence under: ${heading}`).not.toBeNull();
      return match?.[1] ?? "";
    };
    const expectOrdered = (region: string, markers: string[]) => {
      let previous = -1;
      for (const marker of markers) {
        const current = region.indexOf(marker);
        expect(current, `missing ordered marker: ${marker}`).toBeGreaterThan(previous);
        previous = current;
      }
    };

    const manualEnglishMarketplace = sectionBetween(
      "### Manual English Codex workflow",
      "### Codex 中文手动流程"
    );
    const manualChineseMarketplace = sectionBetween(
      "### Codex 中文手动流程",
      "## Release ZIP / Release ZIP 安装"
    );
    const manualEnglishZip = sectionBetween(
      "### Manual English ZIP workflow",
      "### 中文手动 ZIP 流程"
    );
    const manualChineseZip = sectionBetween(
      "### 中文手动 ZIP 流程",
      "## Agent entry points / Agent 入口"
    );
    const chinesePrompt = fencedPrompt(
      "## 中文一键部署提示词",
      "## English copy-paste deployment prompt"
    );
    const englishPrompt = fencedPrompt("## English copy-paste deployment prompt");
    expect(chinesePrompt).toContain(
      "请返回实际绝对安装目录、执行过的每一条命令、各层完整验证输出，以及是否需要并已完成新任务/会话加载；任何一项缺失或失败都不得声称安装成功。"
    );
    expect(englishPrompt).toContain(
      "Return the actual absolute installation directory, every command used, the complete output from every verification tier, and whether a new task/session is required and has loaded the plugin; do not claim installation success when any item is missing or failed."
    );

    const englishZipRoutes = [manualEnglishZip, englishPrompt];
    const chineseZipRoutes = [manualChineseZip, chinesePrompt];
    for (const route of englishZipRoutes) {
      expectOrdered(route, [
        "[1. Archive preflight]",
        "[2. Extraction]",
        "[3. Post-extraction lstat and inventory]",
        "[4. Visual bundle verification]",
        "[5. Collision-failing final move]"
      ]);
      for (const requirement of [
        "Before extracting anything, enumerate ZIP central-directory entries and metadata.",
        "Raw entry names containing backslashes are rejected.",
        "Normalized forward-slash names must exactly equal the independent 20-file allowlist.",
        "Reject absolute paths, drive-letter paths, UNC paths, empty names, `.` or `..` components, path escape, duplicate names, and case-colliding names.",
        "Reject directory entries and link, symlink, junction, reparse-point, device, or other non-regular entries.",
        "Use an extraction API that enforces every output destination remains inside the staged `fantasy-mouse-ui` root and refuses links and reparse points.",
        "After extraction, lstat exactly 20 regular files and reject extras."
      ]) {
        expect(route).toContain(requirement);
      }
    }
    for (const route of chineseZipRoutes) {
      expectOrdered(route, [
        "[1. 压缩包预检]",
        "[2. 解压]",
        "[3. 解压后 lstat 与清单检查]",
        "[4. 视觉素材验证]",
        "[5. 遇到冲突即失败的最终移动]"
      ]);
      for (const requirement of [
        "解压任何内容前，必须枚举 ZIP 中央目录的全部条目和元数据。",
        "原始条目名包含反斜杠时必须拒绝。",
        "规范化后的正斜杠名称必须与独立的 20 文件允许清单完全一致。",
        "必须拒绝绝对路径、盘符路径、UNC 路径、空名称、`.` 或 `..` 组件、路径逃逸、重复名称和大小写冲突名称。",
        "必须拒绝目录条目以及链接、符号链接、junction、重解析点、设备或其他非常规条目。",
        "必须使用能够强制每个输出目标都位于暂存 `fantasy-mouse-ui` 根目录内，并拒绝链接和重解析点的解压 API。",
        "解压后必须用 lstat 核对恰好 20 个常规文件并拒绝额外条目。"
      ]) {
        expect(route).toContain(requirement);
      }
    }

    const expectedInventory = [
      ".codex-plugin/plugin.json",
      "adapters/claude/SKILL.md",
      "adapters/deepseek/SKILL.md",
      "adapters/gemini/SKILL.md",
      "adapters/generic/AGENT.md",
      "assets/visual-grounding/canonical-protagonist.png",
      "assets/visual-grounding/manifest.json",
      "assets/visual-grounding/processing-action-hands.png",
      "assets/visual-grounding/processing-with-bubble.png",
      "assets/visual-grounding/processing-without-bubble.png",
      "LICENSE",
      "protocol/mouse-ui-project.schema.json",
      "protocol/workflow-brief.schema.json",
      "references/qa.md",
      "references/style-independence.md",
      "references/visual-grounding.md",
      "references/workflow-to-ui.md",
      "scripts/validate-workflow.mjs",
      "scripts/verify-bundle.mjs",
      "skills/fantasy-mouse-ui/SKILL.md"
    ];
    for (const route of [...englishZipRoutes, ...chineseZipRoutes]) {
      for (const expectedPath of expectedInventory) {
        expect(route).toContain(expectedPath);
      }
    }

    const englishMarketplaceRoutes = [manualEnglishMarketplace, englishPrompt];
    const chineseMarketplaceRoutes = [manualChineseMarketplace, chinesePrompt];
    const addCommand =
      "codex plugin marketplace add https://github.com/LI-2004-feng/fantasy-mouse-ui --json";
    const targetedAvailable =
      "codex plugin list --marketplace fantasy-mouse-ui --available --json";
    const pluginAdd = "codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json";
    const targetedInstalled =
      "codex plugin list --marketplace fantasy-mouse-ui --json";
    const optionalGlobal = "codex plugin marketplace list --json";
    for (const route of [...englishMarketplaceRoutes, ...chineseMarketplaceRoutes]) {
      expectOrdered(route, [addCommand, targetedAvailable, pluginAdd, targetedInstalled, optionalGlobal]);
      expect(route.indexOf(addCommand)).toBeLessThan(route.indexOf(optionalGlobal));
    }
    for (const route of englishMarketplaceRoutes) {
      expect(route).toContain(
        "Accept identity only when successful JSON reports `alreadyAdded` as `false` or `true` for that exact expected URL."
      );
      expect(route).toContain(
        "If `alreadyAdded` is `true`, run `codex plugin marketplace upgrade fantasy-mouse-ui --json`."
      );
      expect(route).toContain(
        "If the CLI reports a same-name/different-source collision or error, stop and report it."
      );
      expect(route).toContain(
        "The global marketplace list is optional diagnostics; its failure must not block this targeted flow."
      );
    }
    for (const route of chineseMarketplaceRoutes) {
      expect(route).toContain(
        "只有成功 JSON 针对该精确预期 URL 返回 `alreadyAdded` 为 `false` 或 `true` 时，才接受市场身份。"
      );
      expect(route).toContain(
        "如果 `alreadyAdded` 为 `true`，运行 `codex plugin marketplace upgrade fantasy-mouse-ui --json`。"
      );
      expect(route).toContain(
        "如果 CLI 报告同名不同来源冲突或错误，必须停止并报告。"
      );
      expect(route).toContain(
        "全局市场列表仅是可选诊断；其失败不得阻断此定向流程。"
      );
    }
  });

  it("documents optional support without packaging its QR image", () => {
    const readme = readFileSync(
      new URL("../../README.md", import.meta.url),
      "utf8"
    );
    const sponsorQr = new URL(
      "../../docs/assets/sponsor-qr.jpg",
      import.meta.url
    );

    expect(readme).toContain("## Support / 支持");
    expect(readme).toContain("欢迎请鼠鼠吃根小鱼干，纯自愿");
    expect(readme).toContain("docs/assets/sponsor-qr.jpg");
    expect(statSync(sponsorQr).isFile()).toBe(true);
  });
});
