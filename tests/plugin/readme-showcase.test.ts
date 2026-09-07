import { access, readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

function expectOrdered(text: string, markers: string[]) {
  let previous = -1;
  for (const marker of markers) {
    const current = text.indexOf(marker);
    expect(current, marker).toBeGreaterThan(previous);
    previous = current;
  }
}

describe("README v0.2 showcase", () => {
  it("leads with the install command, accepted outcomes, demo, and Quick Start", async () => {
    const readme = await readFile("README.md", "utf8");
    expectOrdered(readme, [
      "# Fantasy Mouse UI",
      "codex plugin marketplace add https://github.com/LaoFeng-mouse/fantasy-mouse-ui --json",
      "codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json",
      "## Real results",
      "Signal Harbor",
      "Fieldnote Festival",
      "Grid Forward 2030",
      "Archive Lantern",
      "archive-lantern-demo.gif",
      "## Quick Start",
      "Fast",
      "Standard",
      "Strict",
      "## How it works",
      "## Architecture and verification",
    ]);
  });

  it("references only accepted benchmark media and case records", async () => {
    for (const path of [
      "examples/signal-harbor/screenshots/hero-monitoring.png",
      "examples/fieldnote-festival/screenshots/hero-program.png",
      "examples/grid-forward-2030/screenshots/slide-03.png",
      "examples/archive-lantern/screenshots/empty-library.png",
      "docs/assets/archive-lantern-demo.gif",
    ]) {
      await expect(access(path), path).resolves.toBeUndefined();
    }

    const readme = await readFile("README.md", "utf8");
    for (const caseId of [
      "signal-harbor",
      "fieldnote-festival",
      "grid-forward-2030",
      "archive-lantern",
    ]) {
      expect(readme).toContain(`examples/${caseId}/README.md`);
      const evidence = JSON.parse(
        await readFile(`examples/${caseId}/evidence/qa.json`, "utf8"),
      ) as { gates: { accepted: boolean } };
      expect(evidence.gates.accepted, caseId).toBe(true);
    }
  });

  it("provides three bilingual fenced prompts with explicit mode reasoning", async () => {
    const readme = await readFile("README.md", "utf8");
    for (const mode of ["Fast", "Standard", "Strict"]) {
      const start = readme.indexOf(`### ${mode}`);
      const next = readme.indexOf("\n### ", start + 1);
      const section = start < 0 ? "" : readme.slice(start, next < 0 ? undefined : next);
      expect(section, `${mode} fenced prompt`).toContain("```text");
      expect(section, `${mode} English mode`).toContain("Mode");
      expect(section, `${mode} Chinese mode`).toContain("模式");
      expect(section, `${mode} English reason`).toContain("reason");
      expect(section, `${mode} Chinese reason`).toContain("原因");
    }
  });

  it("links the truthful provenance record and rejects active rights overclaims", async () => {
    const readme = await readFile("README.md", "utf8");
    expect(readme).toContain("plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md");
    expect(readme).toContain("unverified internet-derived origin");
    expect(readme).not.toMatch(/four bundled visual assets (?:are|remain) (?:fully )?MIT-licensed/iu);
    expect(readme).not.toMatch(/four bundled visual assets (?:are|remain) copyright-free/iu);
  });
});
