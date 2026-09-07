import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const fixedReleaseZip =
  "https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/download/v0.2.0/fantasy-mouse-ui.zip";
const fixedReleaseHash =
  "4AA588B0DA90A6E669B3EE833A1BC3F48DA10E6009654668016B75AA3837AEB3";

function expectOrdered(text: string, markers: string[]) {
  let previous = -1;
  for (const marker of markers) {
    const current = text.indexOf(marker, previous + 1);
    expect(current, marker).toBeGreaterThan(previous);
    previous = current;
  }
}

describe("Fantasy Mouse Agent usage documentation", () => {
  it("labels future plugin improvements as planned rather than shipped", async () => {
    const roadmap = await readFile("docs/roadmap.md", "utf8");
    const plannedMarkers = [
      "## Planned for v0.2.1",
      "doctor",
      "shorter canonical Skill",
      "host-capability contract",
      "machine-readable",
      "USE_WITH_AI.md",
    ];
    const candidateMarkers = [
      "## Candidate scope for v0.3.0",
      "owned or licensed original character assets",
      "real-host conformance tests",
      "benchmark regression",
    ];
    expectOrdered(roadmap, [
      "None of the items below are shipped in v0.2.0",
      ...plannedMarkers,
      ...candidateMarkers,
    ]);

    const candidateStart = roadmap.indexOf(candidateMarkers[0]);
    const plannedSection = roadmap.slice(
      roadmap.indexOf(plannedMarkers[0]),
      candidateStart,
    );
    const candidateSection = roadmap.slice(candidateStart);
    for (const marker of plannedMarkers.slice(1)) {
      expect(plannedSection, marker).toContain(marker);
      expect(candidateSection, marker).not.toContain(marker);
    }
    for (const marker of candidateMarkers.slice(1)) {
      expect(candidateSection, marker).toContain(marker);
      expect(plannedSection, marker).not.toContain(marker);
    }
    expect(roadmap).toContain("None of the items below are shipped in v0.2.0");
    expect(roadmap).not.toMatch(/\b20\d{2}-\d{2}-\d{2}\b/u);
    expect(roadmap).not.toMatch(/\b(?:already|currently|now) (?:shipped|released|complete|available)\b/iu);

    const guide = await readFile("docs/agent-usage.md", "utf8");
    expectOrdered(guide, [
      "## Package identity",
      "## Optional further reading",
      "[roadmap](roadmap.md)",
      "not shipped in v0.2.0",
    ]);
    expect(guide.slice(guide.indexOf("## Optional further reading"))).not.toContain(
      "\n## ",
    );
  });

  it("defines capability-bounded multi-host usage and honest failure behavior", async () => {
    const guide = await readFile("docs/agent-usage.md", "utf8");
    for (const marker of [
      fixedReleaseZip,
      fixedReleaseHash,
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

    expectOrdered(guide, [
      "# Use Fantasy Mouse UI with AI Agents",
      "## Copy this into an Agent",
      "## Compatibility by capability",
      "## Install, update, and remove in Codex",
      "## Claude, Gemini, DeepSeek, and other Agents",
      "## Execution flow",
      "## Choose Fast, Standard, or Strict",
      "## Input contract",
      "## Output contract",
      "## Failure and downgrade behavior",
      "## Package identity",
    ]);
    expectOrdered(guide, [
      "codex plugin marketplace upgrade fantasy-mouse-ui --json",
      "codex plugin list --marketplace fantasy-mouse-ui --available --json",
      "codex plugin remove fantasy-mouse-ui@fantasy-mouse-ui --json",
      "codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json",
      "codex plugin list --marketplace fantasy-mouse-ui --json",
      "fresh-task initialization",
    ]);
    expectOrdered(guide, [
      "Inspect the request and known scope",
      "node scripts/resolve-mode.mjs",
      "state the selected mode and reason",
      "Inspect the target product",
      "new Strict trigger",
      "Design and implement",
    ]);
    expect(guide).toContain(
      "If images cannot be viewed, report `visual-grounding-unavailable`",
    );
    expect(guide).toContain(
      "If the target runtime is missing or cannot be launched, runtime and visual acceptance remain open",
    );
    expect(guide).toContain("version-pinned");
    expect(guide).toContain("Marketplace installation can resolve to a different version");
    expect(guide).not.toMatch(/\bimmutable\b/iu);

    const boundedCompatibility = "does not mean every chatbot can complete the workflow";
    expect(guide).toContain(boundedCompatibility);
    const claimsWithoutDisclaimer = guide.split(boundedCompatibility).join("");
    for (const universalClaim of [
      /(?:all|every|any) (?:AI|chatbots?|agents?) (?:is|are|can|works?)/iu,
      /works? with (?:all|every|any) (?:AI|chatbots?|agents?)/iu,
    ]) expect(claimsWithoutDisclaimer).not.toMatch(universalClaim);
  });
});
