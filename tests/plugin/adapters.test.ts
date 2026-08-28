import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

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

describe.each(adapters)("%s", (adapter) => {
  it("loads the shared image-first contract and defers its semantics", async () => {
    const text = await readFile(new URL(adapter, adapterRoot), "utf8");

    expect(text).toContain("../../skills/fantasy-mouse-ui/SKILL.md");
    expect(text).toContain("../../protocol/workflow-brief.schema.json");
    expect(text).toContain("../../assets/visual-grounding/manifest.json");
    expect(text).toContain("../../scripts/verify-bundle.mjs");
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
    expect(text.split(/\r?\n/).length).toBeLessThanOrEqual(55);
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
