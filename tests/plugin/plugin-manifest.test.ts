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

    const expectOccurrences = (phrase: string, minimum: number) => {
      expect(
        installGuide.split(phrase).length - 1,
        `expected at least ${minimum} occurrences of: ${phrase}`
      ).toBeGreaterThanOrEqual(minimum);
    };

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

    for (const command of [
      "codex plugin marketplace list --json",
      "codex plugin marketplace add https://github.com/LI-2004-feng/fantasy-mouse-ui",
      "codex plugin marketplace upgrade fantasy-mouse-ui --json",
      "codex plugin list --marketplace fantasy-mouse-ui --available --json",
      "codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json",
      "codex plugin list --marketplace fantasy-mouse-ui --json"
    ]) {
      expectOccurrences(command, 2);
    }

    for (const phrase of [
      "Create a newly allocated unique staging directory.",
      "The final `fantasy-mouse-ui` destination must not exist or must be empty.",
      "Never merge into or overwrite an existing installation.",
      "Validate exactly 20 regular files and no unexpected entries before moving the staged plugin into the final destination.",
      "If an existing installation is present, stop and report it; updating is a separate explicit operation.",
      "If the same name points to a different source, stop and report the marketplace-name collision.",
      "`verify-bundle.mjs` proves only the four pinned visual assets; it does not prove complete installation or host loading.",
      "Actual loading in a new task/session is a separate final boundary.",
      'Never call the installation successful based only on {"ok":true,"assets":4}.'
    ]) {
      expectOccurrences(phrase, 2);
    }

    for (const phrase of [
      "新建一个唯一的暂存目录。",
      "最终的 `fantasy-mouse-ui` 目标目录必须不存在或为空。",
      "绝不合并或覆盖现有安装。",
      "在把暂存插件移动到最终位置前，必须验证恰好 20 个常规文件且没有意外条目。",
      "发现现有安装时必须停止并报告；更新是单独的显式操作。",
      "同名市场指向不同来源时，必须停止并报告名称冲突。",
      "`verify-bundle.mjs` 只证明四个固定视觉素材，不证明安装完整，也不证明宿主已加载插件。",
      "在新任务/会话中实际加载是单独的最终边界。",
      '{"ok":true,"assets":4} 只代表“视觉素材包验证通过”，不代表“安装成功”。'
    ]) {
      expectOccurrences(phrase, 2);
    }

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
