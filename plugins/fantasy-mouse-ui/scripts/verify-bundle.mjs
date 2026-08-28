import { createHash } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_ASSET_COUNT = 4;
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

class VerificationError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

function fail(code) {
  throw new VerificationError(code);
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

async function rejectSymlinkChain(root, relativePath) {
  let cursor = root;
  for (const segment of relativePath.split(/[\\/]+/)) {
    if (!segment || segment === "." || segment === "..") fail("invalid-asset-path");
    cursor = path.join(cursor, segment);
    const info = await lstat(cursor);
    if (info.isSymbolicLink()) fail("symlink-not-allowed");
  }
}

function readPngDimensions(bytes) {
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    fail("invalid-png");
  }
  if (bytes.readUInt32BE(8) !== 13 || bytes.toString("ascii", 12, 16) !== "IHDR") {
    fail("invalid-png-header");
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width === 0 || height === 0) fail("invalid-png-dimensions");
  return { width, height };
}

function assertAssetShape(asset) {
  if (
    !asset ||
    typeof asset.path !== "string" ||
    typeof asset.sha256 !== "string" ||
    !/^[A-F0-9]{64}$/.test(asset.sha256) ||
    !Number.isSafeInteger(asset.width) ||
    !Number.isSafeInteger(asset.height)
  ) {
    fail("invalid-manifest-entry");
  }
}

async function verify() {
  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const pluginRoot = path.resolve(scriptDirectory, "..");
  const pluginRootReal = await realpath(pluginRoot);
  const manifestPath = path.join(pluginRoot, "assets", "visual-grounding", "manifest.json");
  await rejectSymlinkChain(pluginRoot, "assets/visual-grounding/manifest.json");

  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch {
    fail("invalid-manifest");
  }
  if (!manifest || !Array.isArray(manifest.assets) || manifest.assets.length !== EXPECTED_ASSET_COUNT) {
    fail("invalid-asset-count");
  }

  const seenPaths = new Set();
  const seenRealPaths = new Set();
  for (const asset of manifest.assets) {
    assertAssetShape(asset);
    const candidate = path.resolve(pluginRoot, asset.path);
    if (!isInside(pluginRoot, candidate)) fail("asset-path-escape");

    const relativePath = path.relative(pluginRoot, candidate);
    if (seenPaths.has(relativePath)) fail("duplicate-asset-path");
    seenPaths.add(relativePath);
    await rejectSymlinkChain(pluginRoot, relativePath);

    const candidateReal = await realpath(candidate);
    if (!isInside(pluginRootReal, candidateReal)) fail("asset-path-escape");
    const comparableRealPath =
      process.platform === "win32" ? candidateReal.toLowerCase() : candidateReal;
    if (seenRealPaths.has(comparableRealPath)) fail("duplicate-asset-path");
    seenRealPaths.add(comparableRealPath);
    const bytes = await readFile(candidate);
    const sha256 = createHash("sha256").update(bytes).digest("hex").toUpperCase();
    if (sha256 !== asset.sha256) fail("asset-hash-mismatch");

    const dimensions = readPngDimensions(bytes);
    if (dimensions.width !== asset.width || dimensions.height !== asset.height) {
      fail("asset-dimension-mismatch");
    }
  }
}

try {
  await verify();
  process.stdout.write(JSON.stringify({ ok: true, assets: EXPECTED_ASSET_COUNT }));
} catch (error) {
  const code = error instanceof VerificationError ? error.code : "verification-failed";
  process.stderr.write(JSON.stringify({ ok: false, error: code }));
  process.exitCode = 1;
}
