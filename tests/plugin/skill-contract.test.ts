import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import manifest from "../../plugins/fantasy-mouse-ui/assets/visual-grounding/manifest.json" with {
  type: "json"
};

const root = new URL(
  "../../plugins/fantasy-mouse-ui/",
  import.meta.url
);

const readPluginFile = (path: string) => readFile(new URL(path, root), "utf8");
const readDomainContext = () =>
  readFile(new URL("../../CONTEXT.md", import.meta.url), "utf8");

describe("Fantasy Mouse image-first Skill contract", () => {
  it("keeps root domain context aligned with independent UI-style authority", async () => {
    const context = await readDomainContext();

    expect(context).toContain(
      "The character identity is fixed; UI style is independently derived from the target product, user, platform, workflow, source brand, and accessibility requirements."
    );
    expect(context).toContain(
      "Bundled compositions and character imagery are not UI-style or source-brand authority."
    );
    expect(context).toContain(
      "Photographic-face/drawn-body contrast applies only to the character asset."
    );
    expect(context).not.toContain(
      "Every treatment inherits photographic-face and drawn-body contrast, rough black outlines"
    );
    expect(context).toContain("complete editable, surface-appropriate design");
    expect(context).toContain(
      "Runnable output is required only for runnable software and web targets; presentations require an editable deck, and other workflows require workflow-appropriate artifacts."
    );
    expect(context).not.toContain("runnable Fantasy Mouse frontend treatment");
  });

  it("triggers on explicit plugin and character-language requests", async () => {
    const skill = await readPluginFile("skills/fantasy-mouse-ui/SKILL.md");
    const frontmatter = skill.slice(0, skill.indexOf("---", 3) + 3);

    expect(frontmatter).toContain(
      "description: Use whenever the user invokes Fantasy Mouse UI, 鼠鼠的幻想, or this plugin for designing or redesigning software UI, websites, presentations, or workflows."
    );
    expect(skill).not.toContain("image-grounded Fantasy Mouse design language");
  });

  it("scopes bundled-image authority before the execution workflow", async () => {
    const skill = await readPluginFile("skills/fantasy-mouse-ui/SKILL.md");
    const opening = skill.slice(
      skill.indexOf("# Fantasy Mouse UI"),
      skill.indexOf("## Execute in order")
    );

    expect(skill).not.toContain("Treat the bundled images as visual authority");
    expect(opening).toContain(
      "Each bundled image is authoritative only for its manifest-declared scope: canonical character identity, action anatomy, or single-example composition."
    );
    expect(opening).toContain(
      "The target product, user, platform, workflow, explicit source brand, and accessibility evidence are the only UI-style authority; the target product is the functional authority."
    );
  });

  it("keeps the canonical workflow image-first and in the required order", async () => {
    const skill = await readPluginFile("skills/fantasy-mouse-ui/SKILL.md");
    const orderedMarkers = [
      "Verify the bundle",
      "view every required visual-grounding image",
      "visual-grounding-unavailable",
      "Inspect the target source",
      "Create the workflow brief",
      "Write both independent artifacts before implementation",
      "Propose three coherent directions only when the user has not selected one",
      "Modify real source",
      "implement the primary interaction path",
      "Never draw mascot anatomy with CSS, SVG, or emoji",
      "same comparison input",
      "Export the editable source"
    ];

    let previous = -1;
    for (const marker of orderedMarkers) {
      const current = skill.indexOf(marker);
      expect(current, `missing ordered marker: ${marker}`).toBeGreaterThan(
        previous
      );
      previous = current;
    }

    const separation = skill.slice(
      skill.indexOf("### 4. Separate character continuity from product styling"),
      skill.indexOf("### 5. Create the workflow brief")
    );
    expect(separation).toContain("character-role translation table");
    expect(separation).toContain("product-style derivation table");
    expect(separation).toContain("zero universal authority");
    expect(separation).not.toContain("Build the character-role translation table");
    expect(separation).not.toContain("Build a separate product-style derivation table");
    expect(skill).not.toContain(
      "Write the project-specific character-to-interface translation table"
    );

    expect(skill.split(/\r?\n/u).length).toBeLessThan(500);
    expect(skill).toContain("references/visual-grounding.md");
    expect(skill).toContain("references/workflow-to-ui.md");
    expect(skill).toContain("references/qa.md");
    expect(skill).toContain("generic UI with a mascot pasted on top");
    expect(skill).toContain(
      "loading, empty, error, blocked, success, and recovery states"
    );
    expect(skill).toContain(
      "workflow brief, recipe, rationale, evidence, and handoff"
    );
    expect(skill).toContain(
      "Stop and ask the user to select or approve one before implementation"
    );
  });

  it("fixes character identity while deriving product UI independently", async () => {
    const [skill, styleIndependence, workflow, visual, qa] = await Promise.all([
      readPluginFile("skills/fantasy-mouse-ui/SKILL.md"),
      readPluginFile("references/style-independence.md").catch(() => ""),
      readPluginFile("references/workflow-to-ui.md"),
      readPluginFile("references/visual-grounding.md"),
      readPluginFile("references/qa.md")
    ]);

    expect(skill).toContain("character identity is fixed; UI style is not");
    expect(skill).toContain("references/style-independence.md");
    expect(styleIndependence).toContain("## Product-style rationale");
    expect(styleIndependence).toContain("template-leakage");
    expect(styleIndependence).toContain("three or more");
    expect(styleIndependence).toContain(
      "Bundled character and composition imagery is not source-brand evidence or UI-style-token evidence"
    );
    expect(styleIndependence).toContain(
      "Do not infer or reinterpret any of them as Fantasy Mouse source-brand constraints"
    );
    for (const nonAuthoritativeTrait of [
      "rough black outlines",
      "cut-paper or sticker treatment",
      "blocky controls",
      "grain",
      "paper texture",
      "palette",
      "offset shadows"
    ]) {
      expect(styleIndependence).toContain(nonAuthoritativeTrait);
    }
    expect(styleIndependence).toContain(
      "Photographic-face/drawn-body contrast applies only to the character asset, not to interface materials"
    );
    const separation = skill.slice(
      skill.indexOf("### 4. Separate character continuity from product styling"),
      skill.indexOf("### 5. Create the workflow brief")
    );
    expect(separation).toContain(
      "Bundled images and plugin metadata are not source-brand or UI-style evidence"
    );
    expect(separation).not.toContain(
      "only the target product or user can supply that evidence"
    );
    expect(separation).toContain(
      "Source-brand evidence comes only from the target product or user; UI style also derives from platform conventions, workflow, and accessibility requirements."
    );
    expect(separation).toContain(
      "The character's photographic-face/drawn-body contrast does not prescribe interface materials."
    );
    expect(workflow).toContain("character-role translation table");
    expect(workflow).toContain("product-style derivation table");
    expect(visual).toContain("zero universal UI-style authority");
    expect(qa).toContain("compare against an unrelated prior output");
  });

  it("keeps the packaged project recipe open to product-specific states and surfaces", async () => {
    const schema = JSON.parse(await readPluginFile("protocol/mouse-ui-project.schema.json")) as {
      properties: {
        surfaces: { items: { pattern?: string } };
        states: { additionalProperties: boolean | Record<string, unknown>; propertyNames?: { pattern?: string } };
      };
    };
    expect(schema.properties.surfaces.items.pattern).toBe("^[a-z0-9]+(?:-[a-z0-9]+)*$");
    expect(schema.properties.states.additionalProperties).toBeTypeOf("object");
    expect(schema.properties.states.propertyNames?.pattern).toBe("^[a-z0-9]+(?:-[a-z0-9]+)*$");
  });

  it("does not deadlock first-run delivery when no unrelated baseline exists", async () => {
    const [skill, qa, styleIndependence] = await Promise.all([
      readPluginFile("skills/fantasy-mouse-ui/SKILL.md"),
      readPluginFile("references/qa.md"),
      readPluginFile("references/style-independence.md")
    ]);
    for (const text of [skill, qa, styleIndependence]) {
      expect(text).toContain("anti-template-baseline-unavailable");
      expect(text).toContain("does not block delivery");
    }
    expect(skill).not.toContain("and do not claim the gate passed");
  });

  it("locks visual authority, hand anatomy, and private-reference scope", async () => {
    const visual = await readPluginFile("references/visual-grounding.md");

    expect(visual).toContain(
      "canonical-protagonist.png answers who the character is"
    );
    expect(visual).toContain("immutable identity authority");
    expect(visual).toContain(
      "processing-action-hands.png is the sole positive action anatomy authority"
    );
    expect(visual).toContain(
      "default chest V/U is one clasped hand pair, not a belly mark"
    );
    expect(visual).toContain(
      "delete the default chest V/U completely"
    );
    expect(visual).toContain("exactly one coherent hand pair");
    expect(visual).toContain("layout-only");
    expect(visual).toContain("zero anatomy authority");
    expect(visual).toContain("bubble is optional");
    expect(visual).toContain("private-reference-only");
    expect(visual).toContain(
      "Do not import 乐不思鼠 business content, UI, copy, data, or workflow semantics"
    );
    expect(visual).toContain(
      "Only the imported hand-anatomy rule is relevant"
    );
    for (const asset of manifest.assets) {
      expect(visual).toContain(asset.path.split("/").at(-1));
    }
  });

  it("translates the character and the real workflow into the whole interface", async () => {
    const workflow = await readPluginFile("references/workflow-to-ui.md");

    for (const field of [
      "purpose",
      "users",
      "entities",
      "screens",
      "actions",
      "state transitions",
      "constraints",
      "surfaces"
    ]) {
      expect(workflow).toContain(field);
    }
    for (const anchor of [
      "face",
      "human-like teeth",
      "tiny horizontal ears",
      "round grey head",
      "white bean body",
      "earnest absurd fantasy temperament"
    ]) {
      expect(workflow).toContain(anchor);
    }
    for (const variable of [
      "roles",
      "clothes",
      "props",
      "pose",
      "expression intensity",
      "background",
      "bubble"
    ]) {
      expect(workflow).toContain(variable);
    }
    for (const interfaceTrait of [
      "layout",
      "copy tone",
      "tokens",
      "component shapes",
      "motion",
      "status feedback",
      "interaction metaphors"
    ]) {
      expect(workflow).toContain(interfaceTrait);
    }
    expect(workflow).toContain(
      "character base -> variable parts -> visual theme -> function/state -> whole-interface translation"
    );
    expect(workflow).toContain("target workflow truth");
    expect(workflow).toContain("usability and accessibility");
  });

  it("separates automated evidence from visible acceptance and honest completion", async () => {
    const qa = await readPluginFile("references/qa.md");

    expect(qa).toContain("Code and tests are not visible acceptance");
    expect(qa).toContain("real primary controls");
    expect(qa).toContain("same comparison input");
    expect(qa).toContain("exactly one coherent hand pair");
    expect(qa).toContain("generic UI with a mascot pasted on top");
    expect(qa).toContain(
      "Do not claim the app or deck was run, rendered, or visually checked"
    );
    expect(qa).toContain("public rights claim");
  });

  it("remains model-neutral and isolated from unrelated product semantics", async () => {
    const files = await Promise.all([
      readPluginFile("skills/fantasy-mouse-ui/SKILL.md"),
      readPluginFile("references/visual-grounding.md"),
      readPluginFile("references/workflow-to-ui.md"),
      readPluginFile("references/qa.md")
    ]);
    const combined = files.join("\n");

    for (const vendorCall of [
      "mcp__",
      "codex_app",
      "Claude Code",
      "Gemini CLI",
      "DeepSeek API"
    ]) {
      expect(combined).not.toContain(vendorCall);
    }
    for (const leakedProductTerm of [
      "file-converter semantics",
      "conversion factory",
      "upload queue",
      "learning workflow"
    ]) {
      expect(combined).not.toContain(leakedProductTerm);
    }
  });
});
