import { execFile } from "node:child_process";
import { deflateSync } from "node:zlib";
import {
  copyFile,
  cp,
  link,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const validator = join("scripts", "validate-examples.mjs");
const temporaryRoots: string[] = [];
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data = Buffer.alloc(0)): Buffer {
  const typeBuffer = Buffer.from(type, "ascii");
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  typeBuffer.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return chunk;
}

function createPng(
  width = 320,
  height = 180,
  options: { raw?: Buffer; filter?: number } = {},
): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 0;
  const scanlines = options.raw ?? Buffer.alloc((width + 1) * height);
  if (options.filter !== undefined) {
    for (let row = 0; row < height; row += 1) {
      scanlines[row * (width + 1)] = options.filter;
    }
  }
  return Buffer.concat([
    pngSignature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(scanlines)),
    pngChunk("IEND"),
  ]);
}

const png = createPng();

type Invocation = {
  ok: boolean;
  stdout: string;
  stderr: string;
  code: number;
};

async function invokeValidator(
  args: string[] = [],
  root = repositoryRoot,
  cwd = root,
  env: NodeJS.ProcessEnv = process.env,
): Promise<Invocation> {
  const invocationEnv = { ...env };
  if (
    invocationEnv.NODE_ENV === "test" &&
    !invocationEnv.FANTASY_MOUSE_VALIDATOR_TEST_REPARSE_QUERY
  ) {
    invocationEnv.FANTASY_MOUSE_VALIDATOR_TEST_SKIP_REPARSE_QUERY = "1";
  }
  try {
    const result = await execFileAsync(process.execPath, [join(root, validator), ...args], {
      cwd,
      env: invocationEnv,
      encoding: "utf8",
      windowsHide: true,
    });
    return { ok: true, ...result, code: 0 };
  } catch (error) {
    const failure = error as Error & {
      stdout?: string;
      stderr?: string;
      code?: number;
    };
    return {
      ok: false,
      stdout: failure.stdout ?? "",
      stderr: failure.stderr ?? "",
      code: failure.code ?? 1,
    };
  }
}

function expectBoundedFailure(result: Invocation, code: string) {
  expect(result.ok).toBe(false);
  expect(result.code).toBe(1);
  expect(result.stdout).toBe("");
  expect(result.stderr.length).toBeLessThanOrEqual(1024);
  expect(result.stderr.trim().split(/\r?\n/u)).toHaveLength(1);
  expect(JSON.parse(result.stderr)).toEqual({ ok: false, code });
  expect(result.stderr).not.toContain(process.cwd());
}

async function createFixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "fantasy-mouse-examples-"));
  temporaryRoots.push(root);

  const examplesRoot = join(repositoryRoot, "examples");
  await cp(examplesRoot, join(root, "examples"), {
    recursive: true,
    filter: (source) => {
      const parts = relative(examplesRoot, source).split(sep);
      if (parts.length >= 2 && ["source", "output", "screenshots"].includes(parts[1]!)) {
        return false;
      }
      return !(parts.length === 3 && parts[1] === "evidence" && parts[2] === "comparison.png");
    },
  });
  const benchmark = await readJson(join(root, "examples", "benchmark.json")) as {
    cases: Array<{ id: string }>;
  };
  for (const benchmarkCase of benchmark.cases) {
    const caseRoot = join(root, "examples", benchmarkCase.id);
    const evidencePath = join(caseRoot, "evidence", "qa.json");
    const evidence = await readJson(evidencePath) as {
      gates: Record<string, boolean>;
      primaryJourney: { result: string };
      accessibility: Record<string, string>;
      comparison: { status: string; repeatedDimensions: string[]; repairs: string[] };
      artifacts: { source: string[]; output: string[]; screenshots: string[]; comparison: string };
    };
    for (const gate of Object.keys(evidence.gates)) evidence.gates[gate] = false;
    evidence.primaryJourney.result = "pending";
    for (const check of Object.keys(evidence.accessibility)) {
      evidence.accessibility[check] = "pending";
    }
    evidence.comparison = { status: "pending", repeatedDimensions: [], repairs: [] };
    evidence.artifacts = { source: [], output: [], screenshots: [], comparison: "" };
    await writeFile(evidencePath, JSON.stringify(evidence), "utf8");
  }
  await mkdir(join(root, "scripts"), { recursive: true });
  await copyFile(join(repositoryRoot, validator), join(root, validator));

  const pluginRoot = join(root, "plugins", "fantasy-mouse-ui");
  await mkdir(join(pluginRoot, "scripts"), { recursive: true });
  await mkdir(join(pluginRoot, "config"), { recursive: true });
  for (const path of [
    "scripts/validate-workflow.mjs",
    "scripts/resolve-mode.mjs",
  ]) {
    await copyFile(
      join(repositoryRoot, "plugins", "fantasy-mouse-ui", path),
      join(pluginRoot, path),
    );
  }
  await copyFile(
    join(repositoryRoot, "plugins/fantasy-mouse-ui/config/execution-modes.json"),
    join(pluginRoot, "config", "execution-modes.json"),
  );
  return root;
}

async function createAcceptedFixture(): Promise<{
  root: string;
  evidencePath: string;
}> {
  const root = await createFixture();
  const caseRoot = join(root, "examples", "signal-harbor");
  await mkdir(join(caseRoot, "source"));
  await mkdir(join(caseRoot, "output"));
  await mkdir(join(caseRoot, "screenshots"));
  await writeFile(join(caseRoot, "source", "index.html"), "<main>runtime</main>", "utf8");
  await writeFile(join(caseRoot, "output", "index.html"), "<main>runtime</main>", "utf8");
  await writeFile(join(caseRoot, "screenshots", "hero.png"), png);
  await writeFile(join(caseRoot, "evidence", "comparison.png"), png);

  const evidencePath = join(caseRoot, "evidence", "qa.json");
  const evidence = await readJson(evidencePath) as {
    gates: Record<string, boolean>;
    primaryJourney: { result: string };
    accessibility: Record<string, string>;
    comparison: { status: string; repeatedDimensions: string[]; repairs: string[] };
    artifacts: { source: string[]; output: string[]; screenshots: string[]; comparison: string };
  };
  for (const gate of Object.keys(evidence.gates)) evidence.gates[gate] = true;
  evidence.primaryJourney.result = "passed";
  for (const check of Object.keys(evidence.accessibility)) {
    evidence.accessibility[check] = "passed";
  }
  evidence.comparison = {
    status: "passed",
    repeatedDimensions: [],
    repairs: [],
  };
  evidence.artifacts = {
    source: ["source/index.html"],
    output: ["output/index.html"],
    screenshots: ["screenshots/hero.png"],
    comparison: "evidence/comparison.png",
  };
  await writeFile(evidencePath, JSON.stringify(evidence), "utf8");
  return { root, evidencePath };
}

async function readJson(path: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(path, "utf8")) as Record<string, unknown>;
}

function schemaAccepts(
  candidate: unknown,
  schema: Record<string, any>,
  root = schema,
): boolean {
  if (schema.$ref) {
    const target = schema.$ref
      .slice(2)
      .split("/")
      .reduce((value: any, key: string) => value[key], root);
    return schemaAccepts(candidate, target, root);
  }
  if (schema.const !== undefined && JSON.stringify(candidate) !== JSON.stringify(schema.const)) return false;
  if (schema.enum && !schema.enum.includes(candidate)) return false;
  if (schema.type === "object" && (candidate === null || typeof candidate !== "object" || Array.isArray(candidate))) return false;
  if (schema.required || schema.properties || schema.additionalProperties === false) {
    if (candidate === null || typeof candidate !== "object" || Array.isArray(candidate)) return true;
    const record = candidate as Record<string, unknown>;
    if (schema.required?.some((key: string) => !Object.hasOwn(record, key))) return false;
    if (schema.additionalProperties === false) {
      if (Object.keys(record).some((key) => !Object.hasOwn(schema.properties ?? {}, key))) return false;
    }
    if (schema.properties) {
      for (const [key, childSchema] of Object.entries(schema.properties)) {
        if (Object.hasOwn(record, key) && !schemaAccepts(record[key], childSchema as Record<string, any>, root)) return false;
      }
    }
  }
  if (schema.type === "array" && !Array.isArray(candidate)) return false;
  if (Array.isArray(candidate)) {
    if (schema.minItems !== undefined && candidate.length < schema.minItems) return false;
    if (schema.maxItems !== undefined && candidate.length > schema.maxItems) return false;
    if (schema.uniqueItems && new Set(candidate.map((item) => JSON.stringify(item))).size !== candidate.length) return false;
    if (schema.items && candidate.some((item) => !schemaAccepts(item, schema.items, root))) return false;
  }
  if (schema.type === "string" && typeof candidate !== "string") return false;
  if (typeof candidate === "string") {
    if (schema.minLength !== undefined && candidate.length < schema.minLength) return false;
    if (schema.maxLength !== undefined && candidate.length > schema.maxLength) return false;
    if (schema.pattern && !new RegExp(schema.pattern, "u").test(candidate)) return false;
  }
  if (schema.type === "integer" && !Number.isInteger(candidate)) return false;
  if (schema.type === "boolean" && typeof candidate !== "boolean") return false;
  if (schema.anyOf && !schema.anyOf.some((child: Record<string, any>) => schemaAccepts(candidate, child, root))) return false;
  if (schema.allOf && !schema.allOf.every((child: Record<string, any>) => schemaAccepts(candidate, child, root))) return false;
  if (schema.if && schemaAccepts(candidate, schema.if, root) && schema.then && !schemaAccepts(candidate, schema.then, root)) return false;
  return true;
}

async function waitForFile(path: string): Promise<void> {
  for (let attempt = 0; attempt < 500; attempt += 1) {
    try {
      await readFile(path);
      return;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      await delay(10);
    }
  }
  throw new Error(`Timed out waiting for ${path}`);
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 100,
    })),
  );
});

describe("v0.2 benchmark contract", () => {
  it("accepts the complete four-case portfolio without a pending escape hatch", async () => {
    const result = await invokeValidator();
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toEqual({
      ok: true,
      cases: 4,
      accepted: 4,
    });
  }, 15_000);

  it("lists four Strict cases in README order", async () => {
    const manifest = JSON.parse(
      await readFile("examples/benchmark.json", "utf8"),
    );
    expect(manifest).toEqual({
      schemaVersion: 1,
      cases: [
        { id: "signal-harbor", surface: "saas-dashboard", mode: "strict" },
        { id: "fieldnote-festival", surface: "website", mode: "strict" },
        { id: "grid-forward-2030", surface: "presentation", mode: "strict" },
        { id: "archive-lantern", surface: "desktop", mode: "strict" },
      ],
    });

    const readme = await readFile("examples/README.md", "utf8");
    const positions = manifest.cases.map(({ id }: { id: string }) =>
      readme.indexOf(`./${id}/`),
    );
    expect(positions.every((position: number) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
  });

  it("publishes a closed evidence schema with an accepted dependency", async () => {
    const schema = JSON.parse(
      await readFile("examples/evidence.schema.json", "utf8"),
    ) as {
      additionalProperties?: boolean;
      required?: string[];
      properties?: Record<string, Record<string, unknown>>;
      allOf?: unknown[];
    };

    expect(schema.additionalProperties).toBe(false);
    expect(schema.required).toEqual([
      "schemaVersion",
      "caseId",
      "mode",
      "gates",
      "primaryJourney",
      "accessibility",
      "comparison",
      "artifacts",
      "limits",
    ]);
    for (const key of [
      "gates",
      "primaryJourney",
      "accessibility",
      "comparison",
      "artifacts",
    ]) {
      expect(schema.properties?.[key]?.additionalProperties, key).toBe(false);
    }
    expect(JSON.stringify(schema.allOf)).toContain('"accepted":{"const":true}');
    expect(JSON.stringify(schema.allOf)).toContain('"generated":{"const":true}');
    expect(JSON.stringify(schema.allOf)).toContain('"visuallyChecked":{"const":true}');
    expect(JSON.stringify(schema.allOf)).toContain('"result":{"const":"passed"}');
    expect(JSON.stringify(schema.allOf)).toContain('"keyboard":{"const":"passed"}');
    expect(JSON.stringify(schema.allOf)).toContain('"reducedMotion":{"const":"passed"}');
    expect(JSON.stringify(schema.allOf)).toContain('"status":{"const":"passed"}');
    expect(JSON.stringify(schema.allOf)).not.toContain('"repeatedDimensions":{"minItems":1}');
    expect(JSON.stringify(schema.allOf)).not.toContain('"repairs":{"minItems":1}');
    expect(JSON.stringify(schema.allOf)).toContain('"source":{"minItems":1,');
    expect(JSON.stringify(schema.allOf)).toContain('"comparison":{"minLength":1');

    const pending = await readJson("examples/signal-harbor/evidence/qa.json");
    expect(schemaAccepts(pending, schema)).toBe(true);
    const accepted = structuredClone(pending) as Record<string, any>;
    for (const gate of Object.keys(accepted.gates)) accepted.gates[gate] = true;
    accepted.primaryJourney.result = "passed";
    for (const check of Object.keys(accepted.accessibility)) accepted.accessibility[check] = "passed";
    accepted.comparison = { status: "passed", repeatedDimensions: [], repairs: [] };
    accepted.artifacts = {
      source: ["source/index.html"],
      output: ["output/index.html"],
      screenshots: ["screenshots/hero.png"],
      comparison: "evidence/comparison.png",
    };
    expect(schemaAccepts(accepted, schema)).toBe(true);

    const rejectedMutations: Array<(evidence: Record<string, any>) => void> = [
      (evidence) => { evidence.gates.generated = false; },
      (evidence) => { evidence.primaryJourney.result = "pending"; },
      (evidence) => { evidence.accessibility.keyboard = "failed"; },
      (evidence) => { evidence.comparison.status = "unavailable"; },
      (evidence) => { evidence.artifacts.source = []; },
      (evidence) => { evidence.artifacts.comparison = ""; },
    ];
    for (const mutate of rejectedMutations) {
      const rejected = structuredClone(accepted);
      mutate(rejected);
      expect(schemaAccepts(rejected, schema)).toBe(false);
    }
  });

  it("anchors the repository and plugin scripts independently of caller cwd", async () => {
    const root = await createFixture();
    const hostile = await mkdtemp(join(tmpdir(), "fantasy-mouse-hostile-"));
    temporaryRoots.push(hostile);
    await mkdir(join(hostile, "examples"));
    await writeFile(join(hostile, "examples", "benchmark.json"), "{}", "utf8");
    const hostileScripts = join(hostile, "plugins", "fantasy-mouse-ui", "scripts");
    const marker = join(hostile, "caller-script-executed");
    await mkdir(hostileScripts, { recursive: true });
    for (const script of ["validate-workflow.mjs", "resolve-mode.mjs"]) {
      await writeFile(
        join(hostileScripts, script),
        `import { writeFileSync } from "node:fs"; writeFileSync(${JSON.stringify(marker)}, "executed"); process.stdout.write('{"ok":true,"mode":"strict"}');`,
        "utf8",
      );
    }

    const result = await invokeValidator(["--allow-pending"], root, hostile);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toEqual({
      ok: true,
      cases: 4,
      accepted: 0,
      pending: 4,
    });
    await expect(readFile(marker, "utf8")).rejects.toMatchObject({ code: "ENOENT" });
  }, 15_000);

  it("reports the four cases as pending before artifacts are built", async () => {
    const root = await createFixture();
    const result = await invokeValidator(["--allow-pending"], root);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toEqual({
      ok: true,
      cases: 4,
      accepted: 0,
      pending: 4,
    });
  }, 15_000);

  it("fails closed without --allow-pending", async () => {
    const root = await createFixture();
    expectBoundedFailure(await invokeValidator([], root), "benchmark-not-accepted");
  });

  it("accepts only the exact --allow-pending argument", async () => {
    expectBoundedFailure(
      await invokeValidator(["--allow-pending", "--allow-pending"]),
      "invalid-arguments",
    );
    expectBoundedFailure(await invokeValidator(["--unknown"]), "invalid-arguments");
  });

  it("rejects unknown evidence keys and premature acceptance", async () => {
    const unknownRoot = await createFixture();
    const unknownPath = join(
      unknownRoot,
      "examples",
      "signal-harbor",
      "evidence",
      "qa.json",
    );
    const unknownEvidence = await readJson(unknownPath);
    unknownEvidence.invented = true;
    await writeFile(unknownPath, JSON.stringify(unknownEvidence), "utf8");
    expectBoundedFailure(
      await invokeValidator(["--allow-pending"], unknownRoot),
      "invalid-evidence",
    );

    const acceptedRoot = await createFixture();
    const acceptedPath = join(
      acceptedRoot,
      "examples",
      "signal-harbor",
      "evidence",
      "qa.json",
    );
    const acceptedEvidence = await readJson(acceptedPath) as {
      gates: Record<string, boolean>;
    };
    acceptedEvidence.gates.accepted = true;
    await writeFile(acceptedPath, JSON.stringify(acceptedEvidence), "utf8");
    expectBoundedFailure(
      await invokeValidator(["--allow-pending"], acceptedRoot),
      "invalid-evidence",
    );
  });

  it("enforces the complete accepted evidence matrix", async () => {
    const valid = await createAcceptedFixture();
    const validResult = await invokeValidator(["--allow-pending"], valid.root);
    expect(validResult.stderr).toBe("");
    expect(JSON.parse(validResult.stdout)).toEqual({
      ok: true,
      cases: 4,
      accepted: 1,
      pending: 3,
    });

    const gateMutations = [
      "generated",
      "tested",
      "run",
      "rendered",
      "visuallyChecked",
    ].map((gate) => (evidence: Record<string, any>) => {
      evidence.gates[gate] = false;
      evidence.gates.accepted = true;
    });
    const mutations: Array<(evidence: Record<string, any>) => void> = [
      ...gateMutations,
      (evidence) => { evidence.primaryJourney.steps = []; },
      (evidence) => { evidence.primaryJourney.result = "pending"; },
      (evidence) => { evidence.accessibility.keyboard = "pending"; },
      (evidence) => { evidence.accessibility.contrast = "unavailable"; },
      (evidence) => { evidence.accessibility.reducedMotion = "failed"; },
      (evidence) => { evidence.comparison.status = "pending"; },
      (evidence) => { evidence.artifacts.source = []; },
      (evidence) => { evidence.artifacts.output = []; },
      (evidence) => { evidence.artifacts.screenshots = []; },
      (evidence) => { evidence.artifacts.comparison = ""; },
    ];
    for (const mutate of mutations) {
      const fixture = await createAcceptedFixture();
      const evidence = await readJson(fixture.evidencePath);
      mutate(evidence);
      await writeFile(fixture.evidencePath, JSON.stringify(evidence), "utf8");
      expectBoundedFailure(
        await invokeValidator(["--allow-pending"], fixture.root),
        "invalid-evidence",
      );
    }
  }, 90_000);

  it("requires accepted artifact declarations under their fixed case paths", async () => {
    const mutations: Array<(artifacts: Record<string, string[] | string>) => void> = [
      (artifacts) => { artifacts.source = ["output/index.html"]; },
      (artifacts) => { artifacts.output = ["source/index.html"]; },
      (artifacts) => { artifacts.screenshots = ["evidence/comparison.png"]; },
      (artifacts) => { artifacts.comparison = "screenshots/hero.png"; },
      (artifacts) => { artifacts.source = ["source"]; },
      (artifacts) => { artifacts.source = ["source\\index.html"]; },
    ];
    for (const mutate of mutations) {
      const fixture = await createAcceptedFixture();
      const evidence = await readJson(fixture.evidencePath) as {
        artifacts: Record<string, string[] | string>;
      };
      mutate(evidence.artifacts);
      await writeFile(fixture.evidencePath, JSON.stringify(evidence), "utf8");

      expectBoundedFailure(
        await invokeValidator(["--allow-pending"], fixture.root),
        "invalid-evidence",
      );
    }
  }, 60_000);

  it("requires complete, decodable, credible PNG evidence", async () => {
    const screenshotFixture = await createAcceptedFixture();
    await writeFile(
      join(screenshotFixture.root, "examples", "signal-harbor", "screenshots", "hero.png"),
      "not a png",
      "utf8",
    );
    expectBoundedFailure(
      await invokeValidator(["--allow-pending"], screenshotFixture.root),
      "invalid-png-artifact",
    );

    const comparisonFixture = await createAcceptedFixture();
    await writeFile(
      join(comparisonFixture.root, "examples", "signal-harbor", "evidence", "comparison.png"),
      "not a png",
      "utf8",
    );
    expectBoundedFailure(
      await invokeValidator(["--allow-pending"], comparisonFixture.root),
      "invalid-png-artifact",
    );

    const mutations: Array<{ name: string; image: Buffer }> = [
      { name: "33-byte header", image: png.subarray(0, 33) },
      {
        name: "bad CRC",
        image: Buffer.from(png).fill(0, 29, 33),
      },
      { name: "truncated chunk", image: png.subarray(0, png.length - 3) },
      {
        name: "missing IDAT",
        image: Buffer.concat([pngSignature, png.subarray(8, 33), pngChunk("IEND")]),
      },
      { name: "missing IEND", image: png.subarray(0, png.length - 12) },
      { name: "trailing bytes", image: Buffer.concat([png, Buffer.from("trailing")]) },
      {
        name: "invalid compressed data",
        image: Buffer.concat([
          pngSignature,
          png.subarray(8, 33),
          pngChunk("IDAT", Buffer.from("not-zlib")),
          pngChunk("IEND"),
        ]),
      },
      { name: "wrong scanline length", image: createPng(320, 180, { raw: Buffer.alloc(1) }) },
      { name: "invalid filter byte", image: createPng(320, 180, { filter: 5 }) },
      { name: "too narrow", image: createPng(319, 180) },
      { name: "too short", image: createPng(320, 179) },
    ];

    for (const mutation of mutations) {
      const fixture = await createAcceptedFixture();
      await writeFile(
        join(fixture.root, "examples", "signal-harbor", "screenshots", "hero.png"),
        mutation.image,
      );
      const result = await invokeValidator(["--allow-pending"], fixture.root);
      expectBoundedFailure(result, "invalid-png-artifact");
    }
  }, 30_000);

  it("queries generic Windows reparse attributes for files", async () => {
    if (process.platform !== "win32") return;
    const root = await createFixture();
    const marker = join(root, "file-reparse-query-ready");

    const validation = invokeValidator(["--allow-pending"], root, root, {
      ...process.env,
      NODE_ENV: "test",
      FANTASY_MOUSE_VALIDATOR_TEST_REPARSE_QUERY:
        "examples/README.md",
      FANTASY_MOUSE_VALIDATOR_TEST_REPARSE_QUERY_MARKER: marker,
    });
    await waitForFile(marker);

    const result = await validation;
    expect(result, result.stderr).toMatchObject({ ok: true, stderr: "" });
  }, 15_000);

  it("fails closed when a Windows reparse query cannot classify a path", async () => {
    if (process.platform !== "win32") return;
    const root = await createFixture();
    const target = join(root, "examples", "README.md");
    const marker = join(root, "ambiguous-reparse-query-ready");

    const validation = invokeValidator(["--allow-pending"], root, root, {
      ...process.env,
      NODE_ENV: "test",
      FANTASY_MOUSE_VALIDATOR_TEST_REPARSE_QUERY: "examples/README.md",
      FANTASY_MOUSE_VALIDATOR_TEST_REPARSE_QUERY_MARKER: marker,
    });
    await waitForFile(marker);
    await rm(target);

    expectBoundedFailure(await validation, "unsafe-example-entry");
  }, 15_000);

  it("rejects hard-linked example files", async () => {
    const root = await createFixture();
    const sourceRoot = join(root, "examples", "signal-harbor", "source");
    const external = join(root, "external-source.html");
    await mkdir(sourceRoot);
    await writeFile(external, "external", "utf8");
    await link(external, join(sourceRoot, "index.html"));

    expectBoundedFailure(
      await invokeValidator(["--allow-pending"], root),
      "unsafe-example-entry",
    );
  }, 30_000);

  it("rejects stale accepted output that does not mirror source", async () => {
    const fixture = await createAcceptedFixture();
    await writeFile(
      join(fixture.root, "examples", "signal-harbor", "output", "index.html"),
      "<main>stale output</main>",
      "utf8",
    );
    expectBoundedFailure(
      await invokeValidator(["--allow-pending"], fixture.root),
      "runtime-output-mismatch",
    );
  });

  it("rejects a directory path replacement during held-handle enumeration", async () => {
    const root = await createFixture();
    const source = join(root, "examples", "signal-harbor", "source");
    const original = join(root, "original-source");
    const replacement = join(root, "replacement-source");
    const marker = join(root, "directory-race-ready");
    await mkdir(source);
    await writeFile(join(source, "index.html"), "original", "utf8");
    await mkdir(replacement);
    await writeFile(join(replacement, "index.html"), "replacement", "utf8");

    const validation = invokeValidator(["--allow-pending"], root, root, {
      ...process.env,
      NODE_ENV: "test",
      FANTASY_MOUSE_VALIDATOR_TEST_DIRECTORY_RACE:
        "examples/signal-harbor/source",
      FANTASY_MOUSE_VALIDATOR_TEST_DIRECTORY_RACE_MARKER: marker,
    });
    await waitForFile(marker);
    await rename(source, original);
    await rename(replacement, source);

    expectBoundedFailure(await validation, "unsafe-example-entry");
  }, 15_000);

  it("enforces total traversal depth, entry, directory, and byte bounds", async () => {
    for (const limits of ["depth=1", "entries=8", "dirs=2", "bytes=128"]) {
      const root = await createFixture();
      expectBoundedFailure(
        await invokeValidator(["--allow-pending"], root, root, {
          ...process.env,
          NODE_ENV: "test",
          FANTASY_MOUSE_VALIDATOR_TEST_LIMITS: limits,
        }),
        "example-tree-limit",
      );
    }
  }, 15_000);

  it("invokes the workflow validator and Strict public-benchmark resolver", async () => {
    const workflowRoot = await createFixture();
    const workflowPath = join(
      workflowRoot,
      "examples",
      "signal-harbor",
      "workflow-brief.json",
    );
    const workflow = await readJson(workflowPath);
    workflow.invented = true;
    await writeFile(workflowPath, JSON.stringify(workflow), "utf8");
    expectBoundedFailure(
      await invokeValidator(["--allow-pending"], workflowRoot),
      "invalid-workflow",
    );

    const modeRoot = await createFixture();
    const modePath = join(modeRoot, "examples", "signal-harbor", "mode.json");
    await writeFile(
      modePath,
      JSON.stringify({ requested: "strict", triggers: [] }),
      "utf8",
    );
    expectBoundedFailure(
      await invokeValidator(["--allow-pending"], modeRoot),
      "invalid-mode",
    );
  });

  it("rejects empty metadata, empty runtime files, and escaping artifact paths", async () => {
    const emptyRoot = await createFixture();
    await writeFile(
      join(emptyRoot, "examples", "signal-harbor", "prompt.md"),
      "",
      "utf8",
    );
    expectBoundedFailure(
      await invokeValidator(["--allow-pending"], emptyRoot),
      "empty-example-file",
    );

    const emptyRuntimeRoot = await createFixture();
    const sourceRoot = join(
      emptyRuntimeRoot,
      "examples",
      "signal-harbor",
      "source",
    );
    await mkdir(sourceRoot);
    await writeFile(join(sourceRoot, "index.html"), "", "utf8");
    expectBoundedFailure(
      await invokeValidator(["--allow-pending"], emptyRuntimeRoot),
      "empty-example-file",
    );

    const escapeRoot = await createFixture();
    const evidencePath = join(
      escapeRoot,
      "examples",
      "signal-harbor",
      "evidence",
      "qa.json",
    );
    const evidence = await readJson(evidencePath) as {
      artifacts: Record<string, string[] | string>;
    };
    evidence.artifacts.source = ["../outside.txt"];
    await writeFile(evidencePath, JSON.stringify(evidence), "utf8");
    expectBoundedFailure(
      await invokeValidator(["--allow-pending"], escapeRoot),
      "artifact-path-escape",
    );
  });

  it("rejects fake empty runtime directories", async () => {
    const root = await createFixture();
    await mkdir(join(root, "examples", "signal-harbor", "source"));

    expectBoundedFailure(
      await invokeValidator(["--allow-pending"], root),
      "empty-example-directory",
    );
  });

  it("rejects symlinks and reparse-point directory links", async () => {
    const root = await createFixture();
    const external = join(root, "external-source");
    const link = join(root, "examples", "signal-harbor", "source");
    await mkdir(external);
    await writeFile(join(external, "index.html"), "external", "utf8");
    await symlink(external, link, process.platform === "win32" ? "junction" : "dir");

    expectBoundedFailure(
      await invokeValidator(["--allow-pending"], root),
      "unsafe-example-entry",
    );
  });
});
