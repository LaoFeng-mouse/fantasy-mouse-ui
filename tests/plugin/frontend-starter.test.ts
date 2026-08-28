import { access, readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const starterRoot = "plugins/fantasy-mouse-ui/assets/frontend-starter";

describe("no packaged frontend starter", () => {
  it("contains no frontend-starter source directory or files", async () => {
    await expect(access(starterRoot)).rejects.toMatchObject({ code: "ENOENT" });
    for (const file of ["index.html", "styles.css", "app.js"]) {
      await expect(access(`${starterRoot}/${file}`)).rejects.toMatchObject({ code: "ENOENT" });
    }
  });

  it("directs agents to product-derived editable source without a bundled starter instruction", async () => {
    const skill = await readFile(
      "plugins/fantasy-mouse-ui/skills/fantasy-mouse-ui/SKILL.md",
      "utf8",
    );

    expect(skill).not.toContain("assets/frontend-starter");
    expect(skill).not.toContain("Use the bundled frontend starter");
    expect(skill).toContain("create surface-appropriate editable source only after the selected direction");
    expect(skill).toContain("derived from the product-style derivation table");
    expect(skill).toContain("Never copy a packaged starter or template or fabricate behavior");
  });

  it("contains no stale starter instruction in the packaged workflow reference", async () => {
    const workflow = await readFile(
      "plugins/fantasy-mouse-ui/references/workflow-to-ui.md",
      "utf8",
    );
    expect(workflow).not.toContain("bundled dependency-free starter");
  });
});
