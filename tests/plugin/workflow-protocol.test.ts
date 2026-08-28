import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, truncate, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const validator = "plugins/fantasy-mouse-ui/scripts/validate-workflow.mjs";
const temporaryRoots: string[] = [];

const validWorkflow = {
  protocolVersion: 1,
  id: "expense-approval",
  purpose: "Review and approve employee expenses",
  users: ["finance-reviewer"],
  entities: ["expense-report"],
  screens: [{ id: "queue", purpose: "Review pending reports" }],
  actions: [
    {
      id: "approve",
      label: "Approve",
      kind: "primary",
      from: "review",
      to: "success",
    },
  ],
  states: ["loading", "empty", "review", "blocked", "success", "failure"],
  primaryJourney: ["queue", "approve"],
  surfaces: ["web"],
  constraints: ["approval reason is required for rejection"],
};

async function invokeWorkflow(contents: string | object) {
  const root = await mkdtemp(join(tmpdir(), "fantasy-mouse-workflow-"));
  temporaryRoots.push(root);
  const input = join(root, "brief.json");
  await writeFile(input, typeof contents === "string" ? contents : JSON.stringify(contents), "utf8");

  try {
    const result = await execFileAsync(process.execPath, [validator, input], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    return { ok: true as const, ...result, input };
  } catch (error) {
    const failure = error as Error & { stdout?: string; stderr?: string; code?: number };
    return {
      ok: false as const,
      stdout: failure.stdout ?? "",
      stderr: failure.stderr ?? "",
      code: failure.code,
      input,
    };
  }
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("Fantasy Mouse workflow protocol", () => {
  it("uses an arbitrary project-specific theme slug instead of legacy presets", async () => {
    const bundled = await readFile(
      "plugins/fantasy-mouse-ui/protocol/mouse-ui-project.schema.json",
      "utf8",
    );
    const schema = JSON.parse(bundled) as {
      required: string[];
      properties: {
        theme: Record<string, unknown>;
      };
    };

    expect(schema.required).toContain("theme");
    expect(schema.properties.theme).toEqual({
      type: "string",
      minLength: 1,
      maxLength: 64,
      pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      description:
        "Project-specific theme slug derived from the product-style rationale; it is not a bundled preset.",
    });
    expect(schema.properties.theme).not.toHaveProperty("anyOf");
    expect(schema.properties.theme).not.toHaveProperty("enum");
    expect(schema.properties.theme).not.toHaveProperty("const");
    for (const legacyPreset of [
      "bold-meme-collage",
      "cream-scrapbook",
      "clean-professional",
      "pixel-game",
      "cyber-neon",
      "chinese-poster",
    ]) {
      expect(bundled).not.toContain(legacyPreset);
    }
  });

  it("keeps workflow surfaces open to product-specific editable targets", async () => {
    const schema = JSON.parse(
      await readFile("plugins/fantasy-mouse-ui/protocol/workflow-brief.schema.json", "utf8"),
    ) as { properties: { surfaces: { items: Record<string, unknown> } } };

    expect(schema.properties.surfaces.items).toEqual({
      type: "string",
      minLength: 1,
      maxLength: 64,
      pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    });
    expect(schema.properties.surfaces.items).not.toHaveProperty("enum");
  });

  it("rejects special paths before a nonblocking no-follow open and bounded read", async () => {
    const source = await readFile(validator, "utf8");
    expect(source).not.toMatch(/await\s+readFile\s*\(\s*inputPath\s*\)/);
    expect(source).toContain('import { constants } from "node:fs"');
    expect(source).toContain('import { lstat, open } from "node:fs/promises"');
    expect(source).toMatch(
      /const OPEN_FLAGS =\s*constants\.O_RDONLY\s*\|\s*\(constants\.O_NONBLOCK \?\? 0\)\s*\|\s*\(constants\.O_NOFOLLOW \?\? 0\);/,
    );
    expect(source).toContain("if (!inputLinkStat.isFile())");

    const lstatIndex = source.indexOf("await lstat(inputPath)");
    const linkIsFileIndex = source.indexOf("inputLinkStat.isFile()");
    const openIndex = source.indexOf("await open(inputPath, OPEN_FLAGS)");
    const statIndex = source.indexOf("await inputHandle.stat()");
    const isFileIndex = source.indexOf("inputStat.isFile()");
    const sizeIndex = source.indexOf("inputStat.size");
    const readIndex = source.indexOf("await inputHandle.read(");
    const closeIndex = source.indexOf("await inputHandle.close()");

    expect(lstatIndex).toBeGreaterThanOrEqual(0);
    expect(linkIsFileIndex).toBeGreaterThan(lstatIndex);
    expect(openIndex).toBeGreaterThan(linkIsFileIndex);
    expect(statIndex).toBeGreaterThan(openIndex);
    expect(isFileIndex).toBeGreaterThan(statIndex);
    expect(sizeIndex).toBeGreaterThan(isFileIndex);
    expect(readIndex).toBeGreaterThan(sizeIndex);
    expect(closeIndex).toBeGreaterThan(readIndex);
    expect(source).toContain("Buffer.alloc(MAX_INPUT_BYTES + 1)");
    expect(source).toMatch(
      /inputHandle\.read\(\s*inputBuffer,\s*0,\s*MAX_INPUT_BYTES \+ 1,\s*0,?\s*\)/,
    );
  });

  it.skipIf(process.platform === "win32")(
    "rejects a FIFO with no writer before the execution timeout",
    async () => {
      const root = await mkdtemp(join(tmpdir(), "fantasy-mouse-workflow-fifo-"));
      temporaryRoots.push(root);
      const input = join(root, "brief.fifo");
      await execFileAsync("mkfifo", [input], { windowsHide: true });

      let failure:
        | (Error & { stdout?: string; stderr?: string; killed?: boolean; signal?: string })
        | undefined;
      try {
        await execFileAsync(process.execPath, [validator, input], {
          cwd: process.cwd(),
          encoding: "utf8",
          timeout: 1_500,
          killSignal: "SIGKILL",
        });
      } catch (error) {
        failure = error as Error & {
          stdout?: string;
          stderr?: string;
          killed?: boolean;
          signal?: string;
        };
      }

      expect(failure).toBeDefined();
      expect(failure?.killed).not.toBe(true);
      expect(failure?.signal).toBeUndefined();
      expect(failure?.stdout ?? "").toBe("");
      const stderr = failure?.stderr ?? "";
      expect(stderr.length).toBeLessThanOrEqual(1024);
      expect(JSON.parse(stderr)).toMatchObject({ ok: false, code: "input-unavailable" });
      expect(stderr).not.toContain(input);
      expect(stderr).not.toContain(process.cwd());
    },
  );

  it("rejects input larger than 1 MiB with bounded structured output", async () => {
    const root = await mkdtemp(join(tmpdir(), "fantasy-mouse-workflow-large-"));
    temporaryRoots.push(root);
    const input = join(root, "brief.json");
    await writeFile(input, "");
    await truncate(input, 1024 * 1024 + 1);

    let stderr = "";
    let stdout = "";
    try {
      await execFileAsync(process.execPath, [validator, input], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
    } catch (error) {
      const failure = error as Error & { stdout?: string; stderr?: string };
      stdout = failure.stdout ?? "";
      stderr = failure.stderr ?? "";
    }

    expect(stdout).toBe("");
    expect(stderr.length).toBeLessThanOrEqual(1024);
    expect(JSON.parse(stderr)).toMatchObject({ ok: false, code: "input-too-large" });
    expect(stderr).not.toContain(input);
    expect(stderr).not.toContain(process.cwd());
  });

  it("accepts a complete content-neutral workflow brief with bounded JSON output", async () => {
    const result = await invokeWorkflow(validWorkflow);
    expect(result.ok).toBe(true);
    expect(result.stderr).toBe("");
    expect(result.stdout.length).toBeLessThanOrEqual(512);
    expect(JSON.parse(result.stdout)).toEqual({
      ok: true,
      id: "expense-approval",
      screens: 1,
      actions: 1,
      states: 6,
    });
    expect(result.stdout.toLowerCase()).not.toMatch(/convert|upload|file/);
  });

  it.each(["primary", "secondary", "destructive", "recovery"])(
    "accepts the documented %s action kind",
    async (kind) => {
      const workflow = {
        ...validWorkflow,
        actions: [{ ...validWorkflow.actions[0], kind }],
      };
      const result = await invokeWorkflow(workflow);
      expect(result.ok).toBe(true);
    },
  );

  it.each(["web", "desktop", "mobile", "slide", "pptx", "document", "spreadsheet", "kiosk"])(
    "accepts the documented %s surface",
    async (surface) => {
      const result = await invokeWorkflow({ ...validWorkflow, surfaces: [surface] });
      expect(result.ok).toBe(true);
    },
  );

  it.each([
    ["missing actions", { ...validWorkflow, actions: undefined }],
    ["missing states", { ...validWorkflow, states: undefined }],
    ["unknown root property", { ...validWorkflow, invented: true }],
    ["path-shaped unknown property", { ...validWorkflow, [process.cwd()]: true }],
    [
      "unknown screen property",
      { ...validWorkflow, screens: [{ id: "queue", purpose: "Review", invented: true }] },
    ],
    [
      "unknown action property",
      { ...validWorkflow, actions: [{ ...validWorkflow.actions[0], invented: true }] },
    ],
    ["invalid id", { ...validWorkflow, id: "Expense_Approval" }],
    ["invalid kind", { ...validWorkflow, actions: [{ ...validWorkflow.actions[0], kind: "magic" }] }],
    ["invalid surface", { ...validWorkflow, surfaces: ["Native iOS"] }],
    ["duplicate users", { ...validWorkflow, users: ["finance-reviewer", "finance-reviewer"] }],
    [
      "duplicate screen ids",
      { ...validWorkflow, screens: [...validWorkflow.screens, { id: "queue", purpose: "Duplicate" }] },
    ],
    [
      "duplicate action ids",
      { ...validWorkflow, actions: [...validWorkflow.actions, { ...validWorkflow.actions[0] }] },
    ],
    ["duplicate states", { ...validWorkflow, states: [...validWorkflow.states, "success"] }],
    ["missing journey reference", { ...validWorkflow, primaryJourney: ["queue", "missing-action"] }],
    [
      "undeclared transition state",
      { ...validWorkflow, actions: [{ ...validWorkflow.actions[0], from: "undeclared" }] },
    ],
  ])("rejects %s without leaking host details", async (_label, workflow) => {
    const sanitized = JSON.parse(JSON.stringify(workflow));
    const result = await invokeWorkflow(sanitized);
    expect(result.ok).toBe(false);
    expect(result.stdout).toBe("");
    expect(result.stderr.length).toBeGreaterThan(0);
    expect(result.stderr.length).toBeLessThanOrEqual(1024);
    expect(() => JSON.parse(result.stderr)).not.toThrow();
    const payload = JSON.parse(result.stderr) as { errors: string[] };
    expect(payload.errors.join("\n")).not.toContain(process.cwd());
    expect(result.stderr).not.toContain(result.input);
    expect(result.stderr).not.toContain(process.cwd());
    expect(result.stderr).not.toMatch(/\bat\s+.*:\d+:\d+|Error:\s/);
  });

  it("rejects invalid JSON with bounded structured stderr", async () => {
    const result = await invokeWorkflow("{ definitely-not-json }");
    expect(result.ok).toBe(false);
    expect(result.stdout).toBe("");
    expect(result.stderr.length).toBeLessThanOrEqual(1024);
    expect(JSON.parse(result.stderr)).toMatchObject({ ok: false, code: "invalid-json" });
    expect(result.stderr).not.toContain(result.input);
    expect(result.stderr).not.toContain(process.cwd());
    expect(result.stderr).not.toContain("SyntaxError");
  });

  it("keeps schema and validator aligned for whitespace-only text", async () => {
    const schema = JSON.parse(
      await readFile("plugins/fantasy-mouse-ui/protocol/workflow-brief.schema.json", "utf8"),
    ) as { $defs: { nonEmptyText: { pattern: string } } };
    expect(schema.$defs.nonEmptyText.pattern).toBe("\\S");

    const result = await invokeWorkflow({ ...validWorkflow, purpose: "   " });
    expect(result.ok).toBe(false);
    expect(JSON.parse(result.stderr)).toMatchObject({ ok: false, code: "invalid-workflow" });
  });

  it("rejects oversized collections without accumulating unbounded errors", async () => {
    const result = await invokeWorkflow({
      ...validWorkflow,
      users: Array.from({ length: 20_000 }, () => "INVALID"),
    });
    expect(result.ok).toBe(false);
    const payload = JSON.parse(result.stderr) as { errors: string[] };
    expect(payload.errors.length).toBeLessThanOrEqual(8);
    expect(payload.errors).toContain("users must contain at most 256 items");
    expect(result.stderr.length).toBeLessThanOrEqual(1024);
  });
});
