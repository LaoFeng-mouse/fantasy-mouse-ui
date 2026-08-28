import { statSync } from "node:fs";
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
});
