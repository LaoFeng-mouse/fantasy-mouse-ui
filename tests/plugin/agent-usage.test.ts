import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const fixedReleaseZip =
  "https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/download/v0.2.0/fantasy-mouse-ui.zip";

describe("Fantasy Mouse Agent usage documentation", () => {
  it("defines capability-bounded multi-host usage and honest failure behavior", async () => {
    const guide = await readFile("docs/agent-usage.md", "utf8");
    for (const marker of [
      fixedReleaseZip,
      "adapters/claude/SKILL.md",
      "adapters/gemini/SKILL.md",
      "adapters/deepseek/SKILL.md",
      "adapters/generic/AGENT.md",
      "Read files",
      "View images",
      "Run Node.js",
      "Edit the target project",
      "Run or render the target",
      "visual-grounding-unavailable",
      "## Input contract",
      "## Output contract",
      "## Install, update, and remove in Codex",
    ]) expect(guide, marker).toContain(marker);
    const boundedCompatibility = "does not mean every chatbot can complete the workflow";
    expect(guide).toContain(boundedCompatibility);
    expect(guide.replace(boundedCompatibility, "")).not.toMatch(
      /(?:all|every) (?:AI|chatbot|agent) (?:is|are|can)/iu,
    );
  });
});
