import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

const adapters = [
  "generic/AGENT.md",
  "claude/SKILL.md",
  "gemini/SKILL.md",
  "deepseek/SKILL.md",
] as const;

const adapterRoot = new URL(
  "../../plugins/fantasy-mouse-ui/adapters/",
  import.meta.url,
);

function expectMarkersInOrder(text: string, markers: readonly string[]): void {
  let previous = -1;
  for (const marker of markers) {
    const current = text.indexOf(marker, previous + 1);
    expect(current, `missing or out-of-order marker: ${marker}`).toBeGreaterThan(
      previous,
    );
    previous = current;
  }
}

describe.each(adapters)("%s", (adapter) => {
  it("loads the shared image-first contract and defers its semantics", async () => {
    const text = await readFile(new URL(adapter, adapterRoot), "utf8");
    const resolverCommand =
      "node ../../scripts/resolve-mode.mjs [--requested fast|standard|strict] [--trigger <known-trigger> ...]";

    expect(text).toContain("../../skills/fantasy-mouse-ui/SKILL.md");
    expect(text).toContain("../../config/execution-modes.json");
    expect(text).toContain(resolverCommand);
    expect(text).toContain("../../protocol/workflow-brief.schema.json");
    expect(text).toContain("../../assets/visual-grounding/manifest.json");
    expect(text).toContain("../../scripts/verify-bundle.mjs");
    expectMarkersInOrder(text, [
      "../../config/execution-modes.json",
      "discover known triggers",
      resolverCommand,
      "returned mode and reason",
      "../../scripts/verify-bundle.mjs",
    ]);
    expect(text).toMatch(/canonical Skill[^\n]*profile semantics/i);
    expect(text).toContain(
      "Build a workflow brief only when the selected profile's `required` includes `workflow-brief`.",
    );
    expect(text).toContain(
      "Validate it against `../../protocol/workflow-brief.schema.json` only when the selected profile's `required` includes `protocol-validation`.",
    );
    expect(text).toContain("visual-grounding-unavailable");
    expect(text).toMatch(/view (?:the )?real images before (?:selecting|claiming|designing) style/i);
    expect(text).toContain("exactly one coherent hand pair");
    expect(text).toMatch(/default chest V\/U.*action hands.*mutually exclusive/is);
    expect(text).toMatch(/canonical Skill and references/i);
    expect(text).toContain(
      "Bundled images and plugin metadata are not source-brand or UI-style evidence",
    );
  });

  it("is only a loading and capability wrapper", async () => {
    const text = await readFile(new URL(adapter, adapterRoot), "utf8");

    expect(text).not.toMatch(/#[# ]*(?:colors?|palette|identity anchors?|role mappings?|page structure|business content|workflow semantics)/i);
    expect(text).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(text).not.toMatch(/\b(?:MCP|API endpoint|tool placeholder)\b/i);
    expect(text).not.toMatch(/^\s*(?:Fast|Standard|Strict)\s*:/im);
    expect(text.split(/\r?\n/).length).toBeLessThanOrEqual(60);
  });

  it("runs the resolver and bundle verifier from the adapter directory", async () => {
    const cwd = fileURLToPath(new URL("./", new URL(adapter, adapterRoot)));
    const resolver = await execFileAsync(
      process.execPath,
      ["../../scripts/resolve-mode.mjs"],
      { cwd },
    );
    expect(resolver.stderr).toBe("");
    expect(JSON.parse(resolver.stdout)).toEqual({
      ok: true,
      mode: "standard",
      reason: "default",
      upgradedFrom: null,
    });

    const verifier = await execFileAsync(
      process.execPath,
      ["../../scripts/verify-bundle.mjs"],
      { cwd },
    );
    expect(verifier.stderr).toBe("");
    expect(JSON.parse(verifier.stdout)).toEqual({ ok: true, assets: 4 });
  });
});

it("keeps generic instructions host-neutral and names only supported host wrappers", async () => {
  const texts = Object.fromEntries(
    await Promise.all(
      adapters.map(async (adapter) => [
        adapter,
        await readFile(new URL(adapter, adapterRoot), "utf8"),
      ]),
    ),
  );

  expect(texts["generic/AGENT.md"]).not.toMatch(/Claude|Gemini|DeepSeek|Codex/i);
  expect(texts["claude/SKILL.md"]).toContain("Claude");
  expect(texts["gemini/SKILL.md"]).toContain("Gemini");
  expect(texts["deepseek/SKILL.md"]).toContain("DeepSeek");
});
