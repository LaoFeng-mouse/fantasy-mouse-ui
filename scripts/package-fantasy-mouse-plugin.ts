import { createHash } from "node:crypto";
import {
  constants,
  lstat,
  mkdir,
  open,
  readdir,
  realpath,
  rename,
  unlink,
  writeFile,
} from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const pluginRoot = resolve(repositoryRoot, "plugins", "fantasy-mouse-ui");
const outputPath = resolve(
  repositoryRoot,
  "dist",
  "plugin",
  "fantasy-mouse-ui-private-local.zip",
);
const textDecoder = new TextDecoder("utf-8", { fatal: true });
const UTF8_FLAG = 0x0800;
const DOS_TIME = 0;
const DOS_DATE = 0x21;
const FILE_MODE = 0o100644;
const MAX_UINT16 = 0xffff;
const MAX_UINT32 = 0xffffffff;
const MAX_ARCHIVE_SOURCE_BYTES = 256 * 1024 * 1024;
const ALLOWED_PLUGIN_FILES = new Set([
  ".codex-plugin/plugin.json",
  "adapters/claude/SKILL.md",
  "adapters/deepseek/SKILL.md",
  "adapters/gemini/SKILL.md",
  "adapters/generic/AGENT.md",
  "assets/visual-grounding/canonical-protagonist.png",
  "assets/visual-grounding/manifest.json",
  "assets/visual-grounding/processing-action-hands.png",
  "assets/visual-grounding/processing-with-bubble.png",
  "assets/visual-grounding/processing-without-bubble.png",
  "protocol/mouse-ui-project.schema.json",
  "protocol/workflow-brief.schema.json",
  "references/qa.md",
  "references/style-independence.md",
  "references/visual-grounding.md",
  "references/workflow-to-ui.md",
  "scripts/validate-workflow.mjs",
  "scripts/verify-bundle.mjs",
  "skills/fantasy-mouse-ui/SKILL.md",
]);

class PackagingError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

function fail(code: string): never {
  throw new PackagingError(code);
}

type ArchiveEntry = {
  name: string;
  data: Buffer;
  crc32: number;
  offset: number;
};

type SourceFile = {
  name: string;
  source: string;
  identity: {
    dev: bigint;
    ino: bigint;
    size: bigint;
    mtimeNs: bigint;
    ctimeNs: bigint;
  };
};

function isInside(root: string, candidate: string): boolean {
  const normalizedRoot = process.platform === "win32" ? root.toLowerCase() : root;
  const normalizedCandidate = process.platform === "win32" ? candidate.toLowerCase() : candidate;
  return normalizedCandidate === normalizedRoot || normalizedCandidate.startsWith(`${normalizedRoot}${sep}`);
}

async function collectFiles(): Promise<SourceFile[]> {
  const rootRealPath = await realpath(pluginRoot);
  const files: SourceFile[] = [];

  async function walk(directory: string): Promise<void> {
    const children = await readdir(directory, { withFileTypes: true });
    children.sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);

    for (const child of children) {
      const source = resolve(directory, child.name);
      const metadata = await lstat(source, { bigint: true });
      if (metadata.isSymbolicLink()) {
        fail("symlink-not-allowed");
      }

      const archivePath = relative(pluginRoot, source).split(sep).join("/");
      if (!archivePath || archivePath.startsWith("../") || archivePath.includes("/../")) {
        fail("plugin-path-escape");
      }

      if (metadata.isDirectory()) {
        await walk(source);
        continue;
      }
      if (!metadata.isFile()) {
        fail("non-regular-plugin-entry");
      }
      if (!ALLOWED_PLUGIN_FILES.has(archivePath)) {
        fail("unexpected-plugin-entry");
      }
      if (metadata.nlink !== 1n) {
        fail("plugin-source-multi-link");
      }
      if (metadata.dev === 0n || metadata.ino === 0n) {
        fail("plugin-source-unreliable-identity");
      }

      const sourceRealPath = await realpath(source);
      if (!isInside(rootRealPath, sourceRealPath)) {
        fail("plugin-path-escape");
      }
      const nameLength = Buffer.byteLength(archivePath, "utf8");
      if (nameLength === 0 || nameLength > MAX_UINT16) fail("archive-name-too-long");
      files.push({
        name: archivePath,
        source,
        identity: {
          dev: metadata.dev,
          ino: metadata.ino,
          size: metadata.size,
          mtimeNs: metadata.mtimeNs,
          ctimeNs: metadata.ctimeNs,
        },
      });
    }
  }

  await walk(pluginRoot);
  files.sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);
  if (files.length !== ALLOWED_PLUGIN_FILES.size) fail("missing-plugin-entry");
  return files;
}

function sameIdentity(
  left: { dev: bigint; ino: bigint },
  right: { dev: bigint; ino: bigint },
): boolean {
  return left.dev === right.dev && left.ino === right.ino;
}

async function readVerifiedSource(file: SourceFile): Promise<Buffer> {
  let handle;
  try {
    handle = await open(file.source, constants.O_RDONLY | constants.O_NOFOLLOW);
  } catch {
    fail("plugin-source-open-failed");
  }

  try {
    const before = await handle.stat({ bigint: true });
    if (
      !before.isFile() ||
      before.nlink !== 1n ||
      before.dev === 0n ||
      before.ino === 0n ||
      !sameIdentity(before, file.identity) ||
      before.size !== file.identity.size ||
      before.mtimeNs !== file.identity.mtimeNs ||
      before.ctimeNs !== file.identity.ctimeNs
    ) {
      fail("plugin-source-changed");
    }
    const bytes = await handle.readFile();
    const after = await handle.stat({ bigint: true });
    if (
      !after.isFile() ||
      after.nlink !== 1n ||
      after.dev === 0n ||
      after.ino === 0n ||
      !sameIdentity(after, before) ||
      before.size !== after.size ||
      before.mtimeNs !== after.mtimeNs ||
      before.ctimeNs !== after.ctimeNs ||
      BigInt(bytes.length) !== after.size
    ) {
      fail("plugin-source-changed");
    }
    return bytes;
  } finally {
    await handle.close();
  }
}

function normalizeText(bytes: Buffer): Buffer {
  const decoded = textDecoder.decode(bytes);
  const withoutBom = decoded.startsWith("\uFEFF") ? decoded.slice(1) : decoded;
  return Buffer.from(withoutBom.replace(/\r\n?/g, "\n"), "utf8");
}

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
  for (const byte of bytes) {
    value = crcTable[(value ^ byte) & 0xff]! ^ (value >>> 8);
  }
  return (value ^ 0xffffffff) >>> 0;
}

function localHeader(entry: ArchiveEntry): Buffer {
  const name = Buffer.from(entry.name, "utf8");
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(UTF8_FLAG, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(DOS_TIME, 10);
  header.writeUInt16LE(DOS_DATE, 12);
  header.writeUInt32LE(entry.crc32, 14);
  header.writeUInt32LE(entry.data.length, 18);
  header.writeUInt32LE(entry.data.length, 22);
  header.writeUInt16LE(name.length, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, name]);
}

function centralHeader(entry: ArchiveEntry): Buffer {
  const name = Buffer.from(entry.name, "utf8");
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(0x0314, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(UTF8_FLAG, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(DOS_TIME, 12);
  header.writeUInt16LE(DOS_DATE, 14);
  header.writeUInt32LE(entry.crc32, 16);
  header.writeUInt32LE(entry.data.length, 20);
  header.writeUInt32LE(entry.data.length, 24);
  header.writeUInt16LE(name.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE((FILE_MODE << 16) >>> 0, 38);
  header.writeUInt32LE(entry.offset, 42);
  return Buffer.concat([header, name]);
}

function endOfCentralDirectory(entryCount: number, centralSize: number, centralOffset: number): Buffer {
  const footer = Buffer.alloc(22);
  footer.writeUInt32LE(0x06054b50, 0);
  footer.writeUInt16LE(0, 4);
  footer.writeUInt16LE(0, 6);
  footer.writeUInt16LE(entryCount, 8);
  footer.writeUInt16LE(entryCount, 10);
  footer.writeUInt32LE(centralSize, 12);
  footer.writeUInt32LE(centralOffset, 16);
  footer.writeUInt16LE(0, 20);
  return footer;
}

async function buildZip(): Promise<Buffer> {
  const files = await collectFiles();
  if (files.length === 0 || files.length > MAX_UINT16) fail("zip-entry-count-out-of-range");
  const sourceBytes = files.reduce((total, file) => total + file.identity.size, 0n);
  if (sourceBytes > BigInt(MAX_ARCHIVE_SOURCE_BYTES)) fail("plugin-source-too-large");

  const entries: ArchiveEntry[] = [];
  const localParts: Buffer[] = [];
  let offset = 0;
  for (const file of files) {
    const verifiedBytes = await readVerifiedSource(file);
    const data = file.name.endsWith(".png") ? verifiedBytes : normalizeText(verifiedBytes);
    if (data.length > MAX_UINT32) fail("zip-entry-too-large");
    const entry = { name: file.name, data, crc32: crc32(data), offset };
    const header = localHeader(entry);
    if (offset > MAX_UINT32 - header.length - data.length) fail("zip-local-data-too-large");
    entries.push(entry);
    localParts.push(header, data);
    offset += header.length + data.length;
  }

  const centralParts = entries.map(centralHeader);
  const centralSize = centralParts.reduce((size, part) => size + part.length, 0);
  if (centralSize > MAX_UINT32 || offset > MAX_UINT32 - centralSize - 22) {
    fail("zip-central-directory-too-large");
  }
  return Buffer.concat([
    ...localParts,
    ...centralParts,
    endOfCentralDirectory(entries.length, centralSize, offset),
  ]);
}

async function replaceOutput(temporaryPath: string): Promise<void> {
  try {
    await rename(temporaryPath, outputPath);
    return;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (!new Set(["EEXIST", "EPERM", "ENOTEMPTY"]).has(code ?? "")) throw error;
  }

  const backupPath = `${outputPath}.backup-${process.pid}`;
  await unlink(backupPath).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
  await rename(outputPath, backupPath);
  try {
    await rename(temporaryPath, outputPath);
  } catch (error) {
    await rename(backupPath, outputPath).catch(() => undefined);
    throw error;
  }
  await unlink(backupPath);
}

async function main(): Promise<void> {
  const archive = await buildZip();
  await mkdir(dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.tmp-${process.pid}`;
  try {
    await writeFile(temporaryPath, archive, { flag: "wx" });
    await replaceOutput(temporaryPath);
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }

  const sha256 = createHash("sha256").update(archive).digest("hex").toUpperCase();
  process.stdout.write(`${JSON.stringify({
    ok: true,
    output: "dist/plugin/fantasy-mouse-ui-private-local.zip",
    sha256,
  })}\n`);
}

main().catch((error: unknown) => {
  const code = error instanceof PackagingError ? error.code : "packaging-failed";
  process.stderr.write(`${JSON.stringify({ ok: false, error: code })}\n`);
  process.exitCode = 1;
});
