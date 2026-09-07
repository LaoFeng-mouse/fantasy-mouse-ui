import { createHash } from "node:crypto";
import { link, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

import { beforeAll, describe, expect, it } from "vitest";

import { expectedPluginFiles } from "./plugin-inventory.fixture.js";

const execFileAsync = promisify(execFile);
const repoRoot = new URL("../../", import.meta.url);
const repoRootPath = fileURLToPath(repoRoot);
const publicOutput = "dist/plugin/fantasy-mouse-ui.zip";

type ZipEntry = {
  name: string;
  data: Buffer;
  flags: number;
  method: number;
  dosTime: number;
  dosDate: number;
  externalAttributes: number;
  crc32: number;
};

const crcTable = new Uint32Array(256);
for (let index = 0; index < crcTable.length; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) === 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  crcTable[index] = value >>> 0;
}

function crc32(bytes: Buffer): number {
  let value = 0xffffffff;
  for (const byte of bytes) value = crcTable[(value ^ byte) & 0xff]! ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

function parseStoredZip(bytes: Buffer): ZipEntry[] {
  const eocdOffset = bytes.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  expect(eocdOffset).toBeGreaterThanOrEqual(0);
  expect(eocdOffset + 22).toBe(bytes.length);
  expect(bytes.readUInt16LE(eocdOffset + 4)).toBe(0);
  expect(bytes.readUInt16LE(eocdOffset + 6)).toBe(0);
  expect(bytes.readUInt16LE(eocdOffset + 8)).toBe(bytes.readUInt16LE(eocdOffset + 10));
  expect(bytes.readUInt16LE(eocdOffset + 20)).toBe(0);
  const entryCount = bytes.readUInt16LE(eocdOffset + 10);
  const centralSize = bytes.readUInt32LE(eocdOffset + 12);
  const centralOffset = bytes.readUInt32LE(eocdOffset + 16);
  expect(centralOffset + centralSize).toBe(eocdOffset);
  const entries: ZipEntry[] = [];
  let offset = centralOffset;

  for (let index = 0; index < entryCount; index += 1) {
    expect(bytes.readUInt32LE(offset)).toBe(0x02014b50);
    const flags = bytes.readUInt16LE(offset + 8);
    const method = bytes.readUInt16LE(offset + 10);
    const dosTime = bytes.readUInt16LE(offset + 12);
    const dosDate = bytes.readUInt16LE(offset + 14);
    const centralCrc32 = bytes.readUInt32LE(offset + 16);
    const compressedSize = bytes.readUInt32LE(offset + 20);
    const uncompressedSize = bytes.readUInt32LE(offset + 24);
    const nameLength = bytes.readUInt16LE(offset + 28);
    const extraLength = bytes.readUInt16LE(offset + 30);
    const commentLength = bytes.readUInt16LE(offset + 32);
    const externalAttributes = bytes.readUInt32LE(offset + 38);
    const localOffset = bytes.readUInt32LE(offset + 42);
    const name = bytes.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");

    expect(bytes.readUInt32LE(localOffset)).toBe(0x04034b50);
    expect(bytes.readUInt16LE(localOffset + 6)).toBe(flags);
    expect(bytes.readUInt16LE(localOffset + 8)).toBe(method);
    expect(bytes.readUInt16LE(localOffset + 10)).toBe(dosTime);
    expect(bytes.readUInt16LE(localOffset + 12)).toBe(dosDate);
    expect(bytes.readUInt32LE(localOffset + 14)).toBe(centralCrc32);
    expect(bytes.readUInt32LE(localOffset + 18)).toBe(compressedSize);
    expect(bytes.readUInt32LE(localOffset + 22)).toBe(uncompressedSize);
    const localNameLength = bytes.readUInt16LE(localOffset + 26);
    const localExtraLength = bytes.readUInt16LE(localOffset + 28);
    expect(localNameLength).toBe(nameLength);
    expect(localExtraLength).toBe(0);
    expect(
      bytes.subarray(localOffset + 30, localOffset + 30 + localNameLength).toString("utf8"),
    ).toBe(name);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    const data = bytes.subarray(dataOffset, dataOffset + compressedSize);
    expect(compressedSize).toBe(uncompressedSize);
    expect(crc32(data)).toBe(centralCrc32);
    entries.push({
      name,
      data,
      flags,
      method,
      dosTime,
      dosDate,
      externalAttributes,
      crc32: centralCrc32,
    });
    offset += 46 + nameLength + extraLength + commentLength;
  }

  expect(offset).toBe(eocdOffset);

  return entries;
}

type PackageResult = {
  bytes: Buffer;
  output: string;
  outputPath: string;
};

function resolveReportedOutput(output: unknown): { output: string; outputPath: string } {
  if (
    typeof output !== "string" ||
    output.length === 0 ||
    isAbsolute(output) ||
    /^[A-Za-z]:[\\/]/u.test(output) ||
    /^[/\\]{2}/u.test(output)
  ) {
    throw new Error("invalid-package-output");
  }

  const outputPath = resolve(repoRootPath, output);
  const repositoryRelativePath = relative(repoRootPath, outputPath);
  if (
    repositoryRelativePath === "" ||
    repositoryRelativePath === ".." ||
    repositoryRelativePath.startsWith(`..${sep}`) ||
    isAbsolute(repositoryRelativePath)
  ) {
    throw new Error("package-output-outside-repository");
  }

  return { output, outputPath };
}

async function packagePlugin(): Promise<PackageResult> {
  const { stdout, stderr } = await execFileAsync(process.execPath, [
    "--import",
    "tsx",
    "scripts/package-fantasy-mouse-plugin.ts",
  ], {
    cwd: repoRootPath,
    windowsHide: true,
  });
  expect(stderr).toBe("");
  const report = JSON.parse(stdout) as { ok?: unknown; output?: unknown };
  expect(report.ok).toBe(true);
  const resolvedOutput = resolveReportedOutput(report.output);
  return {
    ...resolvedOutput,
    bytes: await readFile(resolvedOutput.outputPath),
  };
}

function fileSystemErrorCode(error: unknown): string | undefined {
  return (error as NodeJS.ErrnoException).code;
}

async function nlinkInjectionPreload(
  targetPath: string,
  phase: "collection" | "handle-before" | "handle-after" | "zero-identity" | "oversized",
): Promise<string> {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "fantasy-mouse-package-nlink-"));
  const preloadPath = join(temporaryRoot, "inject-nlink.cjs");
  await writeFile(preloadPath, `
const fileSystem = require("node:fs/promises");
const { syncBuiltinESMExports } = require("node:module");
const { resolve } = require("node:path");
const targetPath = resolve(${JSON.stringify(targetPath)});
const phase = ${JSON.stringify(phase)};
function withInjectedNlink(stats) {
  return new Proxy(stats, { get(target, property, receiver) {
    if (property === "nlink") return typeof target.nlink === "bigint" ? 2n : 2;
    const value = Reflect.get(target, property, receiver);
    return typeof value === "function" ? value.bind(target) : value;
  }});
}
function withZeroIdentity(stats) {
  return new Proxy(stats, { get(target, property, receiver) {
    if (property === "dev" || property === "ino") return typeof target[property] === "bigint" ? 0n : 0;
    const value = Reflect.get(target, property, receiver);
    return typeof value === "function" ? value.bind(target) : value;
  }});
}
function withOversizedSize(stats) {
  return new Proxy(stats, { get(target, property, receiver) {
    if (property === "size") return typeof target.size === "bigint" ? 268435457n : 268435457;
    const value = Reflect.get(target, property, receiver);
    return typeof value === "function" ? value.bind(target) : value;
  }});
}
const realLstat = fileSystem.lstat;
fileSystem.lstat = async function injectedLstat(path, options) {
  const stats = await realLstat(path, options);
  if (resolve(path) !== targetPath) return stats;
  if (phase === "collection") return withInjectedNlink(stats);
  if (phase === "zero-identity") return withZeroIdentity(stats);
  if (phase === "oversized") return withOversizedSize(stats);
  return stats;
};
const realOpen = fileSystem.open;
fileSystem.open = async function injectedOpen(path, ...args) {
  const handle = await realOpen(path, ...args);
  if (phase === "collection" || resolve(path) !== targetPath) return handle;
  let statCalls = 0;
  return new Proxy(handle, { get(target, property, receiver) {
    if (property === "stat") return async (...statArgs) => {
      const stats = await target.stat(...statArgs);
      statCalls += 1;
      return phase === "handle-before" || statCalls > 1 ? withInjectedNlink(stats) : stats;
    };
    const value = Reflect.get(target, property, receiver);
    return typeof value === "function" ? value.bind(target) : value;
  }});
};
syncBuiltinESMExports();
`);
  return preloadPath;
}

async function packageFailure(preloadPath?: string): Promise<string> {
  try {
    await execFileAsync(process.execPath, [
      ...(preloadPath === undefined ? [] : ["--require", preloadPath]),
      "--import", "tsx", "scripts/package-fantasy-mouse-plugin.ts",
    ], { cwd: repoRootPath, windowsHide: true });
  } catch (error) {
    return (error as Error & { stderr?: string }).stderr ?? "";
  }
  return "";
}

let firstPackage: Buffer;
let secondPackage: Buffer;
let firstReportedOutput: string;
let secondReportedOutput: string;
let actualOutputPath: string;

beforeAll(async () => {
  const firstResult = await packagePlugin();
  const secondResult = await packagePlugin();
  firstPackage = firstResult.bytes;
  secondPackage = secondResult.bytes;
  firstReportedOutput = firstResult.output;
  secondReportedOutput = secondResult.output;
  actualOutputPath = secondResult.outputPath;
}, 30_000);

describe("public plugin package", () => {
  it("keeps the common MIT grant while using distinct asset notice paths", async () => {
    const [repositoryLicense, pluginLicense] = await Promise.all([
      readFile(new URL("../../LICENSE", import.meta.url), "utf8").catch(() => null),
      readFile(new URL("../../plugins/fantasy-mouse-ui/LICENSE", import.meta.url), "utf8").catch(
        () => null,
      ),
    ]);

    expect(repositoryLicense, "repository LICENSE").not.toBeNull();
    expect(pluginLicense, "plugin LICENSE").not.toBeNull();
    if (repositoryLicense === null || pluginLicense === null) return;

    const normalizeLf = (text: string) => text.replace(/\r\n?/g, "\n");
    const normalizedRepositoryLicense = normalizeLf(repositoryLicense);
    const normalizedPluginLicense = normalizeLf(pluginLicense);
    const commonMitText = [
      "MIT License",
      "Copyright (c) 2026 LaoFeng-mouse",
      "Permission is hereby granted, free of charge, to any person obtaining a copy",
      "THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND",
    ];
    for (const text of commonMitText) {
      expect(normalizedRepositoryLicense).toContain(text);
      expect(normalizedPluginLicense).toContain(text);
    }
    expect(normalizedPluginLicense).not.toBe(normalizedRepositoryLicense);
    expect(normalizedRepositoryLicense).toContain(
      "see plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md for its disclosed origin and unconfirmed underlying license status.",
    );
    expect(normalizedPluginLicense).toContain(
      "see ASSET_PROVENANCE.md for its disclosed origin and unconfirmed underlying license status.",
    );
    expect(normalizedRepositoryLicense).not.toContain("see ASSET_PROVENANCE.md for");
    expect(normalizedPluginLicense).not.toContain("see plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md");
  });

  it("exposes the exact verification and packaging scripts", async () => {
    const packageJson = JSON.parse(
      await readFile(new URL("../../package.json", import.meta.url), "utf8"),
    ) as { scripts: Record<string, string> };
    expect(packageJson.scripts["plugin:verify"]).toBe(
      "node plugins/fantasy-mouse-ui/scripts/verify-bundle.mjs",
    );
    expect(packageJson.scripts["plugin:package"]).toBe(
      "tsx scripts/package-fantasy-mouse-plugin.ts",
    );
  });

  it("emits the public plugin archive path", () => {
    expect(firstReportedOutput).toBe(publicOutput);
    expect(secondReportedOutput).toBe(publicOutput);
  });

  it("is byte-for-byte deterministic with fixed safe ZIP metadata", async () => {
    expect(secondPackage.length).toBe(firstPackage.length);
    expect(Buffer.compare(secondPackage, firstPackage)).toBe(0);

    const entries = parseStoredZip(firstPackage);
    expect(expectedPluginFiles).toHaveLength(24);
    expect(entries.map(({ name }) => name)).toEqual(expectedPluginFiles);
    for (const entry of entries) {
      expect(entry.flags & 0x0800).toBe(0x0800);
      expect(entry.method).toBe(0);
      expect(entry.dosTime).toBe(0);
      expect(entry.dosDate).toBe(0x21);
      expect(entry.externalAttributes >>> 16).toBe(0o100644);
      expect(entry.name).not.toMatch(/^(?:[A-Za-z]:|[/\\])/);
      expect(entry.name.split("/")).not.toContain("..");
      expect(entry.name).not.toContain("\\");
    }
  });

  it("contains the complete model-neutral plugin and no repository debris", async () => {
    const entries = parseStoredZip(secondPackage);
    const names = entries.map(({ name }) => name);
    expect(names).toEqual(expectedPluginFiles);
    expect(names).toContain("ASSET_PROVENANCE.md");
    expect(names).toContain("config/execution-modes.json");
    expect(names).toContain("protocol/execution-modes.schema.json");
    expect(names).toContain("scripts/resolve-mode.mjs");
    expect(names.some((name) => name.startsWith("examples/"))).toBe(false);
    expect(names.some((name) => name.startsWith("assets/frontend-starter/"))).toBe(false);
    expect(names.some((name) => /(?:^|\/)(?:tests?|\.git|dist|work|docs|src|cache|tmp)(?:\/|$)/i.test(name))).toBe(false);
    expect(names.some((name) => /(?:\.gitkeep|\.DS_Store|Thumbs\.db|\.log|\.tmp|~)$/i.test(name))).toBe(false);
    expect(names).not.toContain("README.md");
    expect(names).not.toContain("INSTALL_WITH_AI.md");
    expect(names).not.toContain("CONTEXT.md");
  });

  it("contains the repository MIT License", () => {
    const entries = parseStoredZip(secondPackage);
    const license = entries.find(({ name }) => name === "LICENSE");
    expect(license, "LICENSE").toBeDefined();
    expect(license!.data.toString("utf8")).toContain("MIT License");
  });

  it("bundles every pinned visual asset with its separate provenance disclosure", () => {
    const entries = parseStoredZip(secondPackage);
    const manifest = JSON.parse(
      entries.find(({ name }) => name === "assets/visual-grounding/manifest.json")!.data.toString("utf8"),
    ) as {
      rightsPolicy: { codeLicense: string; underlyingLicense: string; provenancePath: string };
      assets: Array<{ path: string; sha256: string; publication: string }>;
    };
    expect(manifest.rightsPolicy).toMatchObject({
      codeLicense: "MIT",
      underlyingLicense: "unconfirmed",
      provenancePath: "ASSET_PROVENANCE.md",
    });
    expect(entries.find(({ name }) => name === manifest.rightsPolicy.provenancePath)).toBeDefined();
    for (const asset of manifest.assets) {
      const entry = entries.find(({ name }) => name === asset.path);
      expect(entry, asset.path).toBeDefined();
      expect(createHash("sha256").update(entry!.data).digest("hex").toUpperCase()).toBe(asset.sha256);
      expect(asset.publication).toBe("bundled-with-disclosed-unverified-origin");
    }
  });

  it("excludes the optional sponsor QR from the plugin archive", () => {
    const names = parseStoredZip(secondPackage).map(({ name }) => name);
    expect(names.some((name) => name.includes("sponsor-qr"))).toBe(false);
    expect(names).not.toContain("docs/assets/sponsor-qr.jpg");
  });

  it("normalizes text to UTF-8 LF while preserving PNG bytes", async () => {
    const entries = parseStoredZip(secondPackage);
    for (const entry of entries) {
      if (entry.name.endsWith(".png")) {
        const source = await readFile(
          new URL(`../../plugins/fantasy-mouse-ui/${entry.name}`, import.meta.url),
        );
        expect(entry.data.length).toBe(source.length);
        expect(Buffer.compare(entry.data, source)).toBe(0);
      } else {
        expect(entry.data.subarray(0, 3)).not.toEqual(Buffer.from([0xef, 0xbb, 0xbf]));
        expect(entry.data.toString("utf8")).not.toContain("\r");
        expect(Buffer.from(entry.data.toString("utf8"), "utf8")).toEqual(entry.data);
      }
    }
  });

  it("rejects a multi-link plugin source during collection without replacing the archive", async () => {
    const sourceUrl = new URL("../../plugins/fantasy-mouse-ui/.codex-plugin/plugin.json", import.meta.url);
    const sourcePath = fileURLToPath(sourceUrl);
    const temporaryRoot = await mkdtemp(join(repoRootPath, "work", "fantasy-mouse-package-link-"));
    const aliasPath = join(temporaryRoot, "alias.txt");
    let preloadPath: string | undefined;
    try {
      try {
        await link(sourcePath, aliasPath);
      } catch (error) {
        const code = fileSystemErrorCode(error);
        if (code === undefined || !["EACCES", "ENOSYS", "ENOTSUP", "EOPNOTSUPP", "EPERM"].includes(code)) throw error;
        preloadPath = await nlinkInjectionPreload(sourcePath, "collection");
      }
      const stderr = await packageFailure(preloadPath);
      expect(JSON.parse(stderr)).toEqual({ ok: false, error: "plugin-source-multi-link" });
      expect(stderr).not.toContain(repoRootPath);
      expect(Buffer.compare(await readFile(actualOutputPath), secondPackage)).toBe(0);
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
      if (preloadPath !== undefined) await rm(dirname(preloadPath), { recursive: true, force: true });
      await writeFile(actualOutputPath, secondPackage);
    }
  });

  it("rejects an unexpected secret-like file instead of silently packaging it", async () => {
    const secretUrl = new URL("../../plugins/fantasy-mouse-ui/.env", import.meta.url);
    await writeFile(secretUrl, "TOKEN=do-not-package");
    try {
      const stderr = await packageFailure();
      expect(JSON.parse(stderr)).toEqual({ ok: false, error: "unexpected-plugin-entry" });
      expect(stderr).not.toContain("TOKEN");
      expect(Buffer.compare(await readFile(actualOutputPath), secondPackage)).toBe(0);
    } finally {
      await rm(secretUrl, { force: true });
      await writeFile(actualOutputPath, secondPackage);
    }
  });

  it("rejects a source with unavailable filesystem identity", async () => {
    const sourcePath = fileURLToPath(
      new URL("../../plugins/fantasy-mouse-ui/.codex-plugin/plugin.json", import.meta.url),
    );
    const preloadPath = await nlinkInjectionPreload(sourcePath, "zero-identity");
    try {
      const stderr = await packageFailure(preloadPath);
      expect(JSON.parse(stderr)).toEqual({ ok: false, error: "plugin-source-unreliable-identity" });
      expect(Buffer.compare(await readFile(actualOutputPath), secondPackage)).toBe(0);
    } finally {
      await rm(dirname(preloadPath), { recursive: true, force: true });
      await writeFile(actualOutputPath, secondPackage);
    }
  });

  it.each([["before reading", "handle-before"], ["after reading", "handle-after"]] as const)(
    "rejects a plugin source that gains another link %s through handle revalidation",
    async (_timing, phase) => {
      const sourceUrl = new URL("../../plugins/fantasy-mouse-ui/.codex-plugin/plugin.json", import.meta.url);
      const sourcePath = fileURLToPath(sourceUrl);
      const preloadPath = await nlinkInjectionPreload(sourcePath, phase);
      try {
        const stderr = await packageFailure(preloadPath);
        expect(JSON.parse(stderr)).toEqual({ ok: false, error: "plugin-source-changed" });
        expect(stderr).not.toContain(repoRootPath);
        expect(Buffer.compare(await readFile(actualOutputPath), secondPackage)).toBe(0);
      } finally {
        await rm(dirname(preloadPath), { recursive: true, force: true });
        await writeFile(actualOutputPath, secondPackage);
      }
    },
  );

  it("rejects oversized plugin input without destroying the last valid archive", async () => {
    const sourcePath = fileURLToPath(
      new URL("../../plugins/fantasy-mouse-ui/.codex-plugin/plugin.json", import.meta.url),
    );
    const preloadPath = await nlinkInjectionPreload(sourcePath, "oversized");
    try {
      const stderr = await packageFailure(preloadPath);

      expect(JSON.parse(stderr)).toEqual({ ok: false, error: "plugin-source-too-large" });
      expect(stderr).not.toContain(repoRootPath);
      const survivingArchive = await readFile(actualOutputPath);
      expect(Buffer.compare(survivingArchive, secondPackage)).toBe(0);
    } finally {
      await rm(dirname(preloadPath), { recursive: true, force: true });
      await writeFile(actualOutputPath, secondPackage);
    }
  }, 30_000);
});
