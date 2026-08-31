import { execFile } from "node:child_process";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

const configPath = new URL(
  "../../plugins/fantasy-mouse-ui/config/execution-modes.json",
  import.meta.url,
);
const schemaPath = new URL(
  "../../plugins/fantasy-mouse-ui/protocol/execution-modes.schema.json",
  import.meta.url,
);
const resolverPath = new URL(
  "../../plugins/fantasy-mouse-ui/scripts/resolve-mode.mjs",
  import.meta.url,
);
const worktreePath = fileURLToPath(new URL("../..", import.meta.url));
const temporaryRoots = new Set<string>();

type ResolverResult = {
  code: number;
  stdout: string;
  stderr: string;
};

async function runResolver(
  args: string[],
  executableResolverPath = fileURLToPath(resolverPath),
): Promise<ResolverResult> {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [
      executableResolverPath,
      ...args,
    ]);
    return { code: 0, stdout, stderr };
  } catch (error) {
    const failure = error as Error & {
      code?: number;
      stdout?: string;
      stderr?: string;
    };
    return {
      code: failure.code ?? -1,
      stdout: failure.stdout ?? "",
      stderr: failure.stderr ?? "",
    };
  }
}

function expectOneBoundedJsonObject(output: string): unknown {
  expect(Buffer.byteLength(output)).toBeLessThanOrEqual(1024);
  expect(output.endsWith("\n")).toBe(true);
  expect(output.match(/\n/g)).toHaveLength(1);
  return JSON.parse(output) as unknown;
}

function expectNoPathLeak(output: string, additionalPaths: string[] = []): void {
  for (const sensitivePath of [
    worktreePath,
    fileURLToPath(configPath),
    ...additionalPaths,
  ]) {
    expect(output).not.toContain(sensitivePath);
    expect(output).not.toContain(JSON.stringify(sensitivePath).slice(1, -1));
  }
  expect(output).not.toContain("execution-modes.json");
  expect(output).not.toMatch(/[A-Za-z]:[\\/]/);
  expect(output).not.toMatch(/\\\\[^\\/\s]+[\\/][^\\/\s]+/);
}

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

type ModeProfile = {
  label: string;
  required: string[];
  mayOmit: string[];
  [key: string]: unknown;
};

type MutableExecutionModeConfig = {
  $schema: string;
  schemaVersion: number;
  defaultMode: string;
  strictTriggers: string[];
  modes: Record<string, ModeProfile>;
  [key: string]: unknown;
};

type MalformedConfigCase = {
  name: string;
  mutate: (config: MutableExecutionModeConfig) => unknown;
};

const malformedConfigCases: MalformedConfigCase[] = [
  {
    name: "wrong top-level key",
    mutate: ({ $schema, schemaVersion, defaultMode, strictTriggers, modes }) => ({
      $schema,
      version: schemaVersion,
      defaultMode,
      strictTriggers,
      modes,
    }),
  },
  {
    name: "extra top-level key",
    mutate: (config) => ({ ...config, extra: true }),
  },
  {
    name: "reordered top-level keys",
    mutate: ({ $schema, schemaVersion, defaultMode, strictTriggers, modes }) => ({
      schemaVersion,
      $schema,
      defaultMode,
      strictTriggers,
      modes,
    }),
  },
  {
    name: "wrong schema reference",
    mutate: (config) => ({ ...config, $schema: "../protocol/other.schema.json" }),
  },
  {
    name: "wrong schema version",
    mutate: (config) => ({ ...config, schemaVersion: 2 }),
  },
  {
    name: "unknown default mode",
    mutate: (config) => ({ ...config, defaultMode: "turbo" }),
  },
  {
    name: "empty strict triggers",
    mutate: (config) => ({ ...config, strictTriggers: [] }),
  },
  {
    name: "duplicate strict trigger",
    mutate: (config) => ({
      ...config,
      strictTriggers: [...config.strictTriggers, config.strictTriggers[0]],
    }),
  },
  {
    name: "blank strict trigger",
    mutate: (config) => ({ ...config, strictTriggers: [" "] }),
  },
  {
    name: "wrong mode key",
    mutate: (config) => ({
      ...config,
      modes: {
        fast: config.modes.fast,
        standard: config.modes.standard,
        careful: config.modes.strict,
      },
    }),
  },
  {
    name: "extra mode key",
    mutate: (config) => ({
      ...config,
      modes: { ...config.modes, careful: config.modes.strict },
    }),
  },
  {
    name: "reordered mode keys",
    mutate: (config) => ({
      ...config,
      modes: {
        standard: config.modes.standard,
        fast: config.modes.fast,
        strict: config.modes.strict,
      },
    }),
  },
  {
    name: "wrong profile key",
    mutate: (config) => ({
      ...config,
      modes: {
        ...config.modes,
        fast: {
          title: config.modes.fast.label,
          required: config.modes.fast.required,
          mayOmit: config.modes.fast.mayOmit,
        },
      },
    }),
  },
  {
    name: "extra profile key",
    mutate: (config) => ({
      ...config,
      modes: {
        ...config.modes,
        fast: { ...config.modes.fast, extra: true },
      },
    }),
  },
  {
    name: "reordered profile keys",
    mutate: (config) => ({
      ...config,
      modes: {
        ...config.modes,
        fast: {
          required: config.modes.fast.required,
          label: config.modes.fast.label,
          mayOmit: config.modes.fast.mayOmit,
        },
      },
    }),
  },
  {
    name: "blank profile label",
    mutate: (config) => ({
      ...config,
      modes: {
        ...config.modes,
        fast: { ...config.modes.fast, label: " " },
      },
    }),
  },
  {
    name: "empty required list",
    mutate: (config) => ({
      ...config,
      modes: {
        ...config.modes,
        fast: { ...config.modes.fast, required: [] },
      },
    }),
  },
  {
    name: "duplicate required item",
    mutate: (config) => ({
      ...config,
      modes: {
        ...config.modes,
        fast: {
          ...config.modes.fast,
          required: [
            ...config.modes.fast.required,
            config.modes.fast.required[0],
          ],
        },
      },
    }),
  },
  {
    name: "blank required item",
    mutate: (config) => ({
      ...config,
      modes: {
        ...config.modes,
        fast: { ...config.modes.fast, required: [" "] },
      },
    }),
  },
  {
    name: "missing shared required invariant",
    mutate: (config) => ({
      ...config,
      modes: {
        ...config.modes,
        fast: {
          ...config.modes.fast,
          required: config.modes.fast.required.filter(
            (item) => item !== "honest-evidence",
          ),
        },
      },
    }),
  },
  {
    name: "duplicate mayOmit item",
    mutate: (config) => ({
      ...config,
      modes: {
        ...config.modes,
        fast: {
          ...config.modes.fast,
          mayOmit: [
            ...config.modes.fast.mayOmit,
            config.modes.fast.mayOmit[0],
          ],
        },
      },
    }),
  },
  {
    name: "blank mayOmit item",
    mutate: (config) => ({
      ...config,
      modes: {
        ...config.modes,
        fast: { ...config.modes.fast, mayOmit: [" "] },
      },
    }),
  },
  {
    name: "required and mayOmit overlap",
    mutate: (config) => ({
      ...config,
      modes: {
        ...config.modes,
        fast: {
          ...config.modes.fast,
          mayOmit: [...config.modes.fast.mayOmit, "open-or-render"],
        },
      },
    }),
  },
  {
    name: "shared required invariant and mayOmit overlap",
    mutate: (config) => ({
      ...config,
      modes: {
        ...config.modes,
        standard: {
          ...config.modes.standard,
          mayOmit: [...config.modes.standard.mayOmit, "honest-evidence"],
        },
      },
    }),
  },
];

async function runCopiedResolver(config: unknown): Promise<{
  result: ResolverResult;
  temporaryRoot: string;
}> {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "fantasy-mouse-mode-"));
  temporaryRoots.add(temporaryRoot);
  const scriptsDirectory = join(temporaryRoot, "scripts");
  const configDirectory = join(temporaryRoot, "config");
  const copiedResolverPath = join(scriptsDirectory, "resolve-mode.mjs");

  await Promise.all([
    mkdir(scriptsDirectory, { recursive: true }),
    mkdir(configDirectory, { recursive: true }),
  ]);
  await Promise.all([
    copyFile(fileURLToPath(resolverPath), copiedResolverPath),
    writeFile(
      join(configDirectory, "execution-modes.json"),
      `${JSON.stringify(config)}\n`,
      "utf8",
    ),
  ]);

  return {
    result: await runResolver([], copiedResolverPath),
    temporaryRoot,
  };
}

afterEach(async () => {
  const roots = [...temporaryRoots];
  temporaryRoots.clear();
  await Promise.all(
    roots.map((root) =>
      rm(root, {
        recursive: true,
        force: true,
        maxRetries: 3,
        retryDelay: 50,
      }),
    ),
  );
});

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

  it.each([
    {
      args: [],
      expected: {
        ok: true,
        mode: "standard",
        reason: "default",
        upgradedFrom: null,
      },
    },
    {
      args: ["--requested", "fast"],
      expected: {
        ok: true,
        mode: "fast",
        reason: "requested:fast",
        upgradedFrom: null,
      },
    },
    {
      args: ["--requested", "strict"],
      expected: {
        ok: true,
        mode: "strict",
        reason: "requested:strict",
        upgradedFrom: null,
      },
    },
    {
      args: ["--requested", "fast", "--trigger", "public-benchmark"],
      expected: {
        ok: true,
        mode: "strict",
        reason: "trigger:public-benchmark",
        upgradedFrom: "fast",
      },
    },
    {
      args: ["--requested", "standard", "--trigger", "medical"],
      expected: {
        ok: true,
        mode: "strict",
        reason: "trigger:medical",
        upgradedFrom: "standard",
      },
    },
    {
      args: [
        "--requested",
        "fast",
        "--trigger",
        "financial",
        "--trigger",
        "medical",
      ],
      expected: {
        ok: true,
        mode: "strict",
        reason: "trigger:financial",
        upgradedFrom: "fast",
      },
    },
  ])("resolves execution mode for $args", async ({ args, expected }) => {
    const result = await runResolver(args);

    expect(result.code).toBe(0);
    expect(result.stderr).toBe("");
    expect(expectOneBoundedJsonObject(result.stdout)).toEqual(expected);
    expectNoPathLeak(result.stdout);
  });

  it.each([
    {
      name: "invalid requested mode",
      args: ["--requested", "turbo"],
      error: "invalid-requested-mode",
    },
    {
      name: "unknown trigger",
      args: ["--trigger", "private-preview"],
      error: "unknown-trigger",
    },
    {
      name: "duplicate identical requested mode",
      args: ["--requested", "fast", "--requested", "fast"],
      error: "duplicate-requested",
    },
    {
      name: "duplicate conflicting requested mode",
      args: ["--requested", "fast", "--requested", "strict"],
      error: "duplicate-requested",
    },
    {
      name: "duplicate identical trigger",
      args: ["--trigger", "medical", "--trigger", "medical"],
      error: "duplicate-trigger",
    },
    {
      name: "missing requested value",
      args: ["--requested"],
      error: "missing-requested-value",
    },
    {
      name: "missing trigger value",
      args: ["--trigger"],
      error: "missing-trigger-value",
    },
    {
      name: "unknown flag",
      args: ["--config", "elsewhere.json"],
      error: "unknown-argument",
    },
    {
      name: "positional argument",
      args: ["fast"],
      error: "unknown-argument",
    },
  ])("rejects $name", async ({ args, error }) => {
    const result = await runResolver(args);

    expect(result.code).toBe(1);
    expect(result.stdout).toBe("");
    expect(expectOneBoundedJsonObject(result.stderr)).toEqual({
      ok: false,
      error,
    });
    expectNoPathLeak(result.stderr);
  });

  it.each(malformedConfigCases)(
    "rejects malformed bundled config: $name",
    async ({ mutate }) => {
      const config = structuredClone(
        approvedConfig,
      ) as MutableExecutionModeConfig;
      const { result, temporaryRoot } = await runCopiedResolver(mutate(config));

      expect(result.code).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toBe(
        `${JSON.stringify({ ok: false, error: "invalid-config" })}\n`,
      );
      expect(expectOneBoundedJsonObject(result.stderr)).toEqual({
        ok: false,
        error: "invalid-config",
      });
      expectNoPathLeak(result.stderr, [temporaryRoot]);
    },
  );
});
