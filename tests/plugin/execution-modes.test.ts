import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const configPath = new URL(
  "../../plugins/fantasy-mouse-ui/config/execution-modes.json",
  import.meta.url,
);
const schemaPath = new URL(
  "../../plugins/fantasy-mouse-ui/protocol/execution-modes.schema.json",
  import.meta.url,
);

const approvedConfig = {
  $schema: "../protocol/execution-modes.schema.json",
  schemaVersion: 1,
  defaultMode: "standard",
  strictTriggers: [
    "public-benchmark",
    "formal-release",
    "permissions",
    "financial",
    "medical",
    "destructive",
    "multi-page",
  ],
  modes: {
    fast: {
      label: "Fast",
      required: [
        "declare-mode",
        "verify-bundle",
        "view-required-images",
        "inspect-target-source",
        "derive-product-style",
        "produce-editable-output",
        "open-or-render",
        "focused-visual-qa",
        "honest-evidence",
      ],
      mayOmit: [
        "three-direction-gate",
        "complete-state-matrix",
        "formal-benchmark-package",
        "long-form-handoff",
      ],
    },
    standard: {
      label: "Standard",
      required: [
        "declare-mode",
        "verify-bundle",
        "view-required-images",
        "inspect-target-source",
        "workflow-brief",
        "derive-character-role",
        "derive-product-style",
        "primary-journey",
        "key-states",
        "responsive-behavior",
        "baseline-accessibility",
        "produce-editable-output",
        "open-or-render",
        "screenshot-comparison",
        "honest-evidence",
      ],
      mayOmit: ["exhaustive-threat-states", "formal-release-package"],
    },
    strict: {
      label: "Strict",
      required: [
        "declare-mode",
        "verify-bundle",
        "view-required-images",
        "inspect-target-source",
        "protocol-validation",
        "workflow-brief",
        "derive-character-role",
        "derive-product-style",
        "direction-gate",
        "all-applicable-states",
        "keyboard-access",
        "contrast-check",
        "recovery-paths",
        "produce-editable-output",
        "run-real-target",
        "same-context-comparison",
        "anti-template-comparison",
        "provenance",
        "full-evidence-package",
        "honest-evidence",
      ],
      mayOmit: [],
    },
  },
};

describe("Fantasy Mouse execution modes", () => {
  it("locks the canonical execution-mode profile", async () => {
    const config = JSON.parse(await readFile(configPath, "utf8")) as {
      modes: Record<string, unknown>;
    };

    expect(config).toEqual(approvedConfig);
    expect(Object.keys(config)).toEqual([
      "$schema",
      "schemaVersion",
      "defaultMode",
      "strictTriggers",
      "modes",
    ]);
    expect(Object.keys(config.modes)).toEqual(["fast", "standard", "strict"]);
  });

  it("locks the execution-mode schema structure", async () => {
    const schema = JSON.parse(await readFile(schemaPath, "utf8")) as {
      $schema: string;
      type: string;
      additionalProperties: boolean;
      required: string[];
      properties: {
        $schema: Record<string, unknown>;
        schemaVersion: Record<string, unknown>;
        defaultMode: Record<string, unknown>;
        strictTriggers: Record<string, unknown>;
        modes: {
          type: string;
          additionalProperties: boolean;
          required: string[];
          properties: Record<
            string,
            {
              type: string;
              additionalProperties: boolean;
              required: string[];
              properties: Record<string, unknown>;
            }
          >;
        };
      };
      $defs: Record<string, Record<string, unknown>>;
    };

    expect(schema.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.required).toEqual([
      "$schema",
      "schemaVersion",
      "defaultMode",
      "strictTriggers",
      "modes",
    ]);
    expect(schema.properties.$schema).toEqual({
      type: "string",
      const: "../protocol/execution-modes.schema.json",
    });
    expect(schema.properties.schemaVersion).toEqual({
      type: "integer",
      const: 1,
    });
    expect(schema.properties.defaultMode).toEqual({
      type: "string",
      enum: ["fast", "standard", "strict"],
    });
    expect(schema.properties.strictTriggers).toEqual({
      $ref: "#/$defs/nonEmptyUniqueStringArray",
    });

    const modes = schema.properties.modes;
    expect(modes.type).toBe("object");
    expect(modes.additionalProperties).toBe(false);
    expect(modes.required).toEqual(["fast", "standard", "strict"]);
    expect(Object.keys(modes.properties)).toEqual(["fast", "standard", "strict"]);

    for (const profile of Object.values(modes.properties)) {
      expect(profile.type).toBe("object");
      expect(profile.additionalProperties).toBe(false);
      expect(profile.required).toEqual(["label", "required", "mayOmit"]);
      expect(profile.properties).toEqual({
        label: { $ref: "#/$defs/nonEmptyString" },
        required: { $ref: "#/$defs/nonEmptyUniqueStringArray" },
        mayOmit: { $ref: "#/$defs/uniqueStringArray" },
      });
    }

    expect(schema.$defs.nonEmptyString).toEqual({
      type: "string",
      minLength: 1,
      pattern: "\\S",
    });
    expect(schema.$defs.uniqueStringArray).toEqual({
      type: "array",
      uniqueItems: true,
      items: { $ref: "#/$defs/nonEmptyString" },
    });
    expect(schema.$defs.nonEmptyUniqueStringArray).toEqual({
      allOf: [
        { $ref: "#/$defs/uniqueStringArray" },
        { minItems: 1 },
      ],
    });
  });
});
