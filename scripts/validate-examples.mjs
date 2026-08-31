import { constants } from "node:fs";
import { lstat, open, opendir, realpath, writeFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { inflateSync } from "node:zlib";
import { setTimeout as delay } from "node:timers/promises";

const execFileAsync = promisify(execFile);
const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const EXAMPLES_ROOT = resolve(ROOT, "examples");
const PLUGIN_ROOT = resolve(ROOT, "plugins", "fantasy-mouse-ui");
const MAX_FILE_BYTES = 1024 * 1024;
const MAX_ITEMS = 256;
const DEFAULT_TREE_LIMITS = Object.freeze({
  depth: 32,
  entries: 4096,
  dirs: 512,
  bytes: 64 * 1024 * 1024,
});
const OPEN_FLAGS =
  constants.O_RDONLY |
  (constants.O_NONBLOCK ?? 0) |
  (constants.O_NOFOLLOW ?? 0);
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const STATUS_VALUES = new Set(["pending", "passed", "failed", "unavailable"]);
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const MAX_PNG_DECODED_BYTES = 64 * 1024 * 1024;
const EXPECTED_CASES = [
  { id: "signal-harbor", surface: "saas-dashboard", mode: "strict" },
  { id: "fieldnote-festival", surface: "website", mode: "strict" },
  { id: "grid-forward-2030", surface: "presentation", mode: "strict" },
  { id: "archive-lantern", surface: "desktop", mode: "strict" },
];
const METADATA_PATHS = [
  "README.md",
  "prompt.md",
  "workflow-brief.json",
  "mode.json",
  "character-role.md",
  "product-style.md",
  "evidence/qa.json",
];
const RUNTIME_PATHS = [
  "source",
  "output",
  "screenshots",
  "evidence/comparison.png",
];

class ValidationError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

function fail(code) {
  process.stderr.write(`${JSON.stringify({ ok: false, code })}\n`);
  process.exitCode = 1;
}

function assert(condition, code) {
  if (!condition) throw new ValidationError(code);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(value, keys) {
  return (
    isRecord(value) &&
    Object.keys(value).length === keys.length &&
    keys.every((key) => Object.hasOwn(value, key))
  );
}

function isInside(parent, candidate) {
  const pathFromParent = relative(parent, candidate);
  return (
    pathFromParent === "" ||
    (!pathFromParent.startsWith("..") && !isAbsolute(pathFromParent))
  );
}

function sameIdentity(left, right) {
  return left.dev === right.dev && left.ino === right.ino;
}

function sameSnapshot(left, right) {
  return (
    sameIdentity(left, right) &&
    left.size === right.size &&
    left.nlink === right.nlink &&
    left.mtimeMs === right.mtimeMs &&
    left.ctimeMs === right.ctimeMs
  );
}

function treeLimits() {
  const limits = { ...DEFAULT_TREE_LIMITS };
  if (process.env.NODE_ENV !== "test") return limits;
  const match = /^(depth|entries|dirs|bytes)=([1-9][0-9]*)$/u.exec(
    process.env.FANTASY_MOUSE_VALIDATOR_TEST_LIMITS ?? "",
  );
  if (match) limits[match[1]] = Math.min(limits[match[1]], Number(match[2]));
  return limits;
}

function createTreeBudget() {
  return {
    limits: treeLimits(),
    entries: 0,
    dirs: 0,
    bytes: 0,
    canonicalRoot: undefined,
  };
}

function consumeTreeBudget(budget, stat, depth) {
  budget.entries += 1;
  if (stat.isDirectory()) budget.dirs += 1;
  if (stat.isFile()) budget.bytes += stat.size;
  assert(
    depth <= budget.limits.depth &&
      budget.entries <= budget.limits.entries &&
      budget.dirs <= budget.limits.dirs &&
      budget.bytes <= budget.limits.bytes,
    "example-tree-limit",
  );
}

async function safeFile(path, emptyCode = "empty-example-file") {
  let handle;
  let failure;
  try {
    const before = await lstat(path);
    assert(before.isFile() && !before.isSymbolicLink(), "unsafe-example-entry");
    assert(before.nlink === 1, "unsafe-example-entry");
    assert(before.size > 0, emptyCode);
    assert(before.size <= MAX_FILE_BYTES, "example-file-too-large");
    const canonicalBefore = await realpath(path);

    handle = await open(path, OPEN_FLAGS);
    const opened = await handle.stat();
    assert(opened.isFile() && opened.nlink === 1, "unsafe-example-entry");
    assert(sameSnapshot(before, opened), "unsafe-example-entry");

    const buffer = Buffer.alloc(opened.size);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    assert(bytesRead === buffer.length, "unsafe-example-entry");

    const [afterPath, afterHandle, canonicalAfter] = await Promise.all([
      lstat(path),
      handle.stat(),
      realpath(path),
    ]);
    assert(
      afterPath.isFile() &&
        !afterPath.isSymbolicLink() &&
        afterPath.nlink === 1 &&
        afterHandle.isFile() &&
        afterHandle.nlink === 1 &&
        sameSnapshot(before, afterPath) &&
        sameSnapshot(opened, afterHandle) &&
        canonicalBefore === canonicalAfter,
      "unsafe-example-entry",
    );
    return buffer;
  } catch (error) {
    failure = error instanceof ValidationError
      ? error
      : new ValidationError(error?.code === "ENOENT" ? "missing-example-file" : "unsafe-example-entry");
    throw failure;
  } finally {
    if (handle) {
      try {
        await handle.close();
      } catch {
        if (!failure) throw new ValidationError("unsafe-example-entry");
      }
    }
  }
}

async function readJson(path, invalidCode) {
  const source = await safeFile(path);
  try {
    return JSON.parse(source.toString("utf8"));
  } catch {
    throw new ValidationError(invalidCode);
  }
}

async function assertNoWindowsReparseTree(path) {
  if (process.platform !== "win32") return;
  const query = [
    "$ErrorActionPreference='Stop'",
    "$root=$env:FANTASY_MOUSE_REPARSE_ROOT",
    "$items=@(Get-Item -LiteralPath $root -Force -ErrorAction Stop)",
    "$items+=@(Get-ChildItem -LiteralPath $root -Force -Recurse -ErrorAction Stop)",
    "foreach($item in $items){if(($item.Attributes -band [IO.FileAttributes]::ReparsePoint)-ne 0){exit 10}}",
    "exit 0",
  ].join(";");
  try {
    await pauseForWindowsReparseQueryTest();
    await execFileAsync("powershell.exe", [
      "-NoLogo",
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      query,
    ], {
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 4096,
      timeout: 5000,
      env: {
        ...process.env,
        FANTASY_MOUSE_REPARSE_ROOT: path,
      },
    });
  } catch (error) {
    throw new ValidationError("unsafe-example-entry");
  }
}

async function pauseForWindowsReparseQueryTest() {
  if (process.env.NODE_ENV !== "test") return;
  const target = process.env.FANTASY_MOUSE_VALIDATOR_TEST_REPARSE_QUERY;
  const marker = process.env.FANTASY_MOUSE_VALIDATOR_TEST_REPARSE_QUERY_MARKER;
  if (!target || !marker) return;
  const targetPath = resolve(ROOT, target);
  assert(isInside(ROOT, targetPath), "unsafe-example-entry");
  const before = await lstat(targetPath);
  await writeFile(marker, "ready", { flag: "wx" });
  await delay(1000);
  const after = await lstat(targetPath);
  assert(sameSnapshot(before, after), "unsafe-example-entry");
}

async function pauseForDirectoryRaceTest(path) {
  if (process.env.NODE_ENV !== "test") return;
  const target = process.env.FANTASY_MOUSE_VALIDATOR_TEST_DIRECTORY_RACE;
  const marker = process.env.FANTASY_MOUSE_VALIDATOR_TEST_DIRECTORY_RACE_MARKER;
  if (!target || !marker) return;
  const relativePath = relative(ROOT, path).replaceAll("\\", "/");
  if (relativePath !== target) return;
  await writeFile(marker, "ready", { flag: "wx" });
  await delay(1000);
}

async function inspectTree(path, budget = createTreeBudget(), depth = 0) {
  let directoryHandle;
  let failure;
  try {
    const before = await lstat(path);
    assert(!before.isSymbolicLink(), "unsafe-example-entry");
    assert(before.isFile() || before.isDirectory(), "unsafe-example-entry");
    if (before.isFile()) assert(before.nlink === 1, "unsafe-example-entry");
    consumeTreeBudget(budget, before, depth);

    const canonicalBefore = await realpath(path);
    if (budget.canonicalRoot === undefined) budget.canonicalRoot = canonicalBefore;
    assert(isInside(budget.canonicalRoot, canonicalBefore), "unsafe-example-entry");

    if (before.isFile()) {
      await safeFile(path);
      return;
    }

    directoryHandle = await open(path, OPEN_FLAGS);
    const opened = await directoryHandle.stat();
    assert(opened.isDirectory() && sameSnapshot(before, opened), "unsafe-example-entry");
    await pauseForDirectoryRaceTest(path);

    let childCount = 0;
    const directory = await opendir(path);
    for await (const entry of directory) {
      childCount += 1;
      await inspectTree(resolve(path, entry.name), budget, depth + 1);
    }
    assert(childCount > 0, "empty-example-directory");

    const [afterPath, afterHandle, canonicalAfter] = await Promise.all([
      lstat(path),
      directoryHandle.stat(),
      realpath(path),
    ]);
    assert(
      afterPath.isDirectory() &&
        !afterPath.isSymbolicLink() &&
        afterHandle.isDirectory() &&
        sameSnapshot(before, afterPath) &&
        sameSnapshot(opened, afterHandle) &&
        sameIdentity(afterPath, afterHandle) &&
        canonicalBefore === canonicalAfter,
      "unsafe-example-entry",
    );
  } catch (error) {
    failure = error instanceof ValidationError
      ? error
      : new ValidationError(error?.code === "ENOENT" ? "missing-example-file" : "unsafe-example-entry");
    throw failure;
  } finally {
    if (directoryHandle) {
      try {
        await directoryHandle.close();
      } catch {
        if (!failure) throw new ValidationError("unsafe-example-entry");
      }
    }
  }
}

function validateStringArray(value, { ids = false, paths = false } = {}) {
  if (!Array.isArray(value) || value.length > MAX_ITEMS) return false;
  if (new Set(value).size !== value.length) return false;
  return value.every(
    (item) =>
      typeof item === "string" &&
      item.length > 0 &&
      /\S/u.test(item) &&
      item.length <= 512 &&
      (!ids || ID_PATTERN.test(item)) &&
      (!paths || !item.includes("\0")),
  );
}

function isDeclaredArtifactPath(caseRoot, artifactPath, category, pattern) {
  const candidate = resolve(caseRoot, artifactPath);
  if (isAbsolute(artifactPath) || !isInside(caseRoot, candidate)) return true;
  const categoryRoot = resolve(caseRoot, category);
  return (
    pattern.test(artifactPath) &&
    candidate !== categoryRoot &&
    isInside(categoryRoot, candidate)
  );
}

function validateEvidence(evidence, caseId, caseRoot) {
  const rootKeys = [
    "schemaVersion",
    "caseId",
    "mode",
    "gates",
    "primaryJourney",
    "accessibility",
    "comparison",
    "artifacts",
    "limits",
  ];
  assert(hasExactKeys(evidence, rootKeys), "invalid-evidence");
  assert(evidence.schemaVersion === 1, "invalid-evidence");
  assert(evidence.caseId === caseId, "invalid-evidence");
  assert(evidence.mode === "strict", "invalid-evidence");

  const gateKeys = [
    "generated",
    "tested",
    "run",
    "rendered",
    "visuallyChecked",
    "accepted",
  ];
  assert(hasExactKeys(evidence.gates, gateKeys), "invalid-evidence");
  assert(gateKeys.every((key) => typeof evidence.gates[key] === "boolean"), "invalid-evidence");

  assert(hasExactKeys(evidence.primaryJourney, ["steps", "result"]), "invalid-evidence");
  assert(validateStringArray(evidence.primaryJourney.steps, { ids: true }), "invalid-evidence");
  assert(STATUS_VALUES.has(evidence.primaryJourney.result), "invalid-evidence");

  const accessibilityKeys = ["keyboard", "contrast", "reducedMotion"];
  assert(hasExactKeys(evidence.accessibility, accessibilityKeys), "invalid-evidence");
  assert(
    accessibilityKeys.every((key) => STATUS_VALUES.has(evidence.accessibility[key])),
    "invalid-evidence",
  );

  assert(
    hasExactKeys(evidence.comparison, ["status", "repeatedDimensions", "repairs"]),
    "invalid-evidence",
  );
  assert(STATUS_VALUES.has(evidence.comparison.status), "invalid-evidence");
  assert(validateStringArray(evidence.comparison.repeatedDimensions), "invalid-evidence");
  assert(validateStringArray(evidence.comparison.repairs), "invalid-evidence");

  const artifactKeys = ["source", "output", "screenshots", "comparison"];
  assert(hasExactKeys(evidence.artifacts, artifactKeys), "invalid-evidence");
  for (const key of ["source", "output", "screenshots"]) {
    assert(validateStringArray(evidence.artifacts[key], { paths: true }), "invalid-evidence");
  }
  assert(
    typeof evidence.artifacts.comparison === "string" &&
      evidence.artifacts.comparison.length <= 512 &&
      (evidence.artifacts.comparison.length === 0 || /\S/u.test(evidence.artifacts.comparison)),
    "invalid-evidence",
  );
  assert(validateStringArray(evidence.limits), "invalid-evidence");

  assert(
    evidence.artifacts.source.every(
      (path) => isDeclaredArtifactPath(caseRoot, path, "source", /^source\/.+/u),
    ) &&
      evidence.artifacts.output.every(
        (path) => isDeclaredArtifactPath(caseRoot, path, "output", /^output\/.+/u),
      ) &&
      evidence.artifacts.screenshots.every(
        (path) =>
          isDeclaredArtifactPath(
            caseRoot,
            path,
            "screenshots",
            /^screenshots\/.+\.png$/u,
          ),
      ) &&
      (evidence.artifacts.comparison === "" ||
        resolve(caseRoot, evidence.artifacts.comparison) ===
          resolve(caseRoot, "evidence", "comparison.png")),
    "invalid-evidence",
  );

  if (evidence.gates.accepted) {
    assert(gateKeys.every((key) => evidence.gates[key] === true), "invalid-evidence");
    assert(
      evidence.primaryJourney.steps.length > 0 &&
        evidence.primaryJourney.result === "passed" &&
        accessibilityKeys.every((key) => evidence.accessibility[key] === "passed") &&
        evidence.comparison.status === "passed" &&
        evidence.artifacts.source.length > 0 &&
        evidence.artifacts.output.length > 0 &&
        evidence.artifacts.screenshots.length > 0 &&
        evidence.artifacts.comparison.length > 0,
      "invalid-evidence",
    );
  }
  return evidence.gates.accepted;
}

function artifactDeclarations(evidence) {
  return [
    ...evidence.artifacts.source.map((path) => ({ path, png: false })),
    ...evidence.artifacts.output.map((path) => ({ path, png: false })),
    ...evidence.artifacts.screenshots.map((path) => ({ path, png: true })),
    ...(evidence.artifacts.comparison
      ? [{ path: evidence.artifacts.comparison, png: true }]
      : []),
  ];
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function validatePng(buffer) {
  const validBitDepths = new Map([
    [0, new Set([1, 2, 4, 8, 16])],
    [2, new Set([8, 16])],
    [3, new Set([1, 2, 4, 8])],
    [4, new Set([8, 16])],
    [6, new Set([8, 16])],
  ]);
  const channels = new Map([[0, 1], [2, 3], [3, 1], [4, 2], [6, 4]]);
  assert(buffer.length >= 57, "invalid-png-artifact");
  assert(buffer.subarray(0, 8).equals(PNG_SIGNATURE), "invalid-png-artifact");
  let offset = PNG_SIGNATURE.length;
  let ihdr;
  let paletteEntries = 0;
  let seenPlte = false;
  let seenIdat = false;
  let endedIdat = false;
  let seenIend = false;
  const idat = [];

  while (offset < buffer.length) {
    assert(buffer.length - offset >= 12, "invalid-png-artifact");
    const length = buffer.readUInt32BE(offset);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const chunkEnd = dataEnd + 4;
    assert(dataEnd >= dataStart && chunkEnd <= buffer.length, "invalid-png-artifact");
    const typeBuffer = buffer.subarray(offset + 4, offset + 8);
    const type = typeBuffer.toString("ascii");
    assert(/^[A-Za-z]{4}$/u.test(type), "invalid-png-artifact");
    const data = buffer.subarray(dataStart, dataEnd);
    assert(
      buffer.readUInt32BE(dataEnd) === crc32(buffer.subarray(offset + 4, dataEnd)),
      "invalid-png-artifact",
    );

    if (!ihdr) {
      assert(type === "IHDR" && length === 13, "invalid-png-artifact");
      ihdr = data;
    } else {
      assert(type !== "IHDR", "invalid-png-artifact");
      if (/^[A-Z]/u.test(type)) {
        assert(["PLTE", "IDAT", "IEND"].includes(type), "invalid-png-artifact");
      }
      if (type === "PLTE") {
        assert(!seenPlte && !seenIdat && length > 0 && length % 3 === 0, "invalid-png-artifact");
        paletteEntries = length / 3;
        assert(paletteEntries <= 256, "invalid-png-artifact");
        seenPlte = true;
      } else if (type === "IDAT") {
        assert(!endedIdat && !seenIend && length > 0, "invalid-png-artifact");
        seenIdat = true;
        idat.push(data);
      } else if (type === "IEND") {
        assert(seenIdat && !seenIend && length === 0, "invalid-png-artifact");
        seenIend = true;
        assert(chunkEnd === buffer.length, "invalid-png-artifact");
      } else if (seenIdat) {
        endedIdat = true;
      }
    }
    offset = chunkEnd;
  }

  assert(ihdr && seenIdat && seenIend && offset === buffer.length, "invalid-png-artifact");
  const width = ihdr.readUInt32BE(0);
  const height = ihdr.readUInt32BE(4);
  const bitDepth = ihdr[8];
  const colorType = ihdr[9];
  assert(width >= 320 && width <= 32768, "invalid-png-artifact");
  assert(height >= 180 && height <= 32768, "invalid-png-artifact");
  assert(width * height <= 268_435_456, "invalid-png-artifact");
  assert(validBitDepths.get(colorType)?.has(bitDepth), "invalid-png-artifact");
  assert(ihdr[10] === 0 && ihdr[11] === 0 && ihdr[12] === 0, "invalid-png-artifact");
  assert(colorType !== 3 || (seenPlte && paletteEntries <= 2 ** bitDepth), "invalid-png-artifact");
  assert(!seenPlte || ![0, 4].includes(colorType), "invalid-png-artifact");

  const rowBytes = Math.ceil((width * channels.get(colorType) * bitDepth) / 8);
  const expectedBytes = (rowBytes + 1) * height;
  assert(expectedBytes <= MAX_PNG_DECODED_BYTES, "invalid-png-artifact");
  let scanlines;
  try {
    scanlines = inflateSync(Buffer.concat(idat), { maxOutputLength: expectedBytes });
  } catch {
    throw new ValidationError("invalid-png-artifact");
  }
  assert(scanlines.length === expectedBytes, "invalid-png-artifact");
  for (let row = 0; row < height; row += 1) {
    assert(scanlines[row * (rowBytes + 1)] <= 4, "invalid-png-artifact");
  }
}

function hasExpectedCases(cases) {
  return (
    Array.isArray(cases) &&
    cases.length === EXPECTED_CASES.length &&
    cases.every((entry, index) => {
      const expected = EXPECTED_CASES[index];
      return (
        hasExactKeys(entry, ["id", "surface", "mode"]) &&
        entry.id === expected.id &&
        entry.surface === expected.surface &&
        entry.mode === expected.mode
      );
    })
  );
}

async function validateArtifactPaths(caseRoot, evidence, accepted, allowPending) {
  for (const declaration of artifactDeclarations(evidence)) {
    const artifactPath = declaration.path;
    const candidate = resolve(caseRoot, artifactPath);
    assert(
      !isAbsolute(artifactPath) && isInside(caseRoot, candidate),
      "artifact-path-escape",
    );
    try {
      const canonical = await realpath(candidate);
      assert(isInside(caseRoot, canonical), "artifact-path-escape");
      const buffer = await safeFile(candidate);
      const canonicalAfter = await realpath(candidate);
      assert(canonical === canonicalAfter && isInside(caseRoot, canonicalAfter), "unsafe-example-entry");
      if (declaration.png) validatePng(buffer);
    } catch (error) {
      if (
        error instanceof ValidationError &&
        error.code === "missing-example-file" &&
        allowPending &&
        !accepted
      ) {
        continue;
      }
      if (error?.code === "ENOENT" && allowPending && !accepted) continue;
      throw error instanceof ValidationError
        ? error
        : new ValidationError("unsafe-example-entry");
    }
  }
}

async function validateRuntimeParity(caseRoot, evidence, accepted) {
  if (!accepted) return;

  const sourceTails = evidence.artifacts.source.map((path) => path.slice("source/".length));
  const outputTails = evidence.artifacts.output.map((path) => path.slice("output/".length));
  assert(
    sourceTails.length === outputTails.length &&
      sourceTails.every((tail) => outputTails.includes(tail)),
    "runtime-output-mismatch",
  );

  for (const tail of sourceTails) {
    const source = await safeFile(resolve(caseRoot, "source", tail));
    const output = await safeFile(resolve(caseRoot, "output", tail));
    assert(source.equals(output), "runtime-output-mismatch");
  }
}

async function invokeJson(script, args, invalidCode) {
  let result;
  try {
    result = await execFileAsync(process.execPath, [script, ...args], {
      cwd: ROOT,
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 64 * 1024,
      timeout: 10_000,
    });
  } catch {
    throw new ValidationError(invalidCode);
  }
  assert(result.stderr === "", invalidCode);
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new ValidationError(invalidCode);
  }
}

async function validateWorkflow(caseRoot) {
  const workflowPath = resolve(caseRoot, "workflow-brief.json");
  const output = await invokeJson(
    resolve(PLUGIN_ROOT, "scripts", "validate-workflow.mjs"),
    [workflowPath],
    "invalid-workflow",
  );
  assert(output?.ok === true, "invalid-workflow");
}

async function validateMode(caseRoot) {
  const mode = await readJson(resolve(caseRoot, "mode.json"), "invalid-mode");
  assert(hasExactKeys(mode, ["requested", "triggers"]), "invalid-mode");
  assert(["fast", "standard", "strict"].includes(mode.requested), "invalid-mode");
  assert(validateStringArray(mode.triggers), "invalid-mode");
  assert(mode.triggers.includes("public-benchmark"), "invalid-mode");

  const args = ["--requested", mode.requested];
  for (const trigger of mode.triggers) args.push("--trigger", trigger);
  const output = await invokeJson(
    resolve(PLUGIN_ROOT, "scripts", "resolve-mode.mjs"),
    args,
    "invalid-mode",
  );
  assert(output?.ok === true && output.mode === "strict", "invalid-mode");
}

async function validateCase(entry, allowPending) {
  const caseRoot = resolve(EXAMPLES_ROOT, entry.id);
  assert(isInside(EXAMPLES_ROOT, caseRoot), "unsafe-example-entry");
  let caseStat;
  try {
    caseStat = await lstat(caseRoot);
  } catch (error) {
    if (error?.code === "ENOENT") throw new ValidationError("missing-example-file");
    throw new ValidationError("unsafe-example-entry");
  }
  assert(caseStat.isDirectory() && !caseStat.isSymbolicLink(), "unsafe-example-entry");

  for (const metadataPath of METADATA_PATHS) {
    await safeFile(resolve(caseRoot, metadataPath));
  }
  await validateWorkflow(caseRoot);
  await validateMode(caseRoot);

  const evidence = await readJson(resolve(caseRoot, "evidence", "qa.json"), "invalid-evidence");
  const accepted = validateEvidence(evidence, entry.id, caseRoot);
  assert(allowPending || accepted, "benchmark-not-accepted");
  await validateArtifactPaths(caseRoot, evidence, accepted, allowPending);
  await validateRuntimeParity(caseRoot, evidence, accepted);

  for (const runtimePath of RUNTIME_PATHS) {
    try {
      await inspectTree(resolve(caseRoot, runtimePath));
    } catch (error) {
      if (
        error instanceof ValidationError &&
        error.code === "missing-example-file" &&
        allowPending &&
        !accepted
      ) {
        continue;
      }
      throw error;
    }
  }
  return accepted;
}

async function main() {
  const args = process.argv.slice(2);
  const allowPending = args.length === 1 && args[0] === "--allow-pending";
  assert(args.length === 0 || allowPending, "invalid-arguments");

  await assertNoWindowsReparseTree(EXAMPLES_ROOT);
  const manifest = await readJson(resolve(EXAMPLES_ROOT, "benchmark.json"), "invalid-manifest");
  assert(
    hasExactKeys(manifest, ["schemaVersion", "cases"]) &&
      manifest.schemaVersion === 1 &&
      hasExpectedCases(manifest.cases),
    "invalid-manifest",
  );
  await inspectTree(EXAMPLES_ROOT);

  let accepted = 0;
  for (const entry of EXPECTED_CASES) {
    if (await validateCase(entry, allowPending)) accepted += 1;
  }
  const pending = EXPECTED_CASES.length - accepted;
  assert(allowPending || pending === 0, "benchmark-not-accepted");
  process.stdout.write(
    `${JSON.stringify({ ok: true, cases: EXPECTED_CASES.length, accepted, pending })}\n`,
  );
}

try {
  await main();
} catch (error) {
  fail(error instanceof ValidationError ? error.code : "validation-failed");
}
