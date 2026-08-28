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
    expect(installGuide).toContain("adapters/generic/AGENT.md");
    expect(installGuide).toContain('{"ok":true,"assets":4}');
    expect(installGuide).toContain("不要只复制单个 SKILL.md");
    expect(installGuide).toContain("Do not copy only SKILL.md");
    expect(installGuide).toContain(
      "Create a destination directory named `fantasy-mouse-ui` first, then extract every ZIP entry into that directory."
    );
    expect(installGuide).toContain(
      "必须先创建名为 `fantasy-mouse-ui` 的目标目录，再把 ZIP 内的全部内容解压到该目录中。"
    );
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
