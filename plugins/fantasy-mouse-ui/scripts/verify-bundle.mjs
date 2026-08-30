import { createHash } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_STYLE_POLICY = {
  fixedSystem: "character-identity-only",
  uiDerivation: "target-product-and-platform",
  templateLeakageThreshold: 3,
};
const EXPECTED_ASSETS = [
  {
    path: "assets/visual-grounding/canonical-protagonist.png",
    role: "canonical-identity",
    publication: "open-source-distributable",
    sha256: "4C85BCE3AD50F33FC04BBF05147EFD96ED0BAE98866C12E1DB5E7096C8557316",
    width: 1387,
    height: 1134,
    identityAuthority: true,
    anatomyAuthority: false,
    uiStyleAuthority: false,
    authorityScope: "canonical-character-identity",
  },
  {
    path: "assets/visual-grounding/processing-action-hands.png",
    role: "approved-action-hand-pose",
    publication: "open-source-distributable",
    sha256: "A22C3E5EBA3E4F417075F54F38DA3D7B6E177D294D42ED627F350AB38C7652A1",
    width: 1254,
    height: 1254,
    identityAuthority: false,
    anatomyAuthority: true,
    uiStyleAuthority: false,
    authorityScope: "action-hand-anatomy",
    handRule: "action-hands-replace-default-chest-v-u",
  },
  {
    path: "assets/visual-grounding/processing-with-bubble.png",
    role: "composition-only-with-bubble",
    publication: "open-source-distributable",
    sha256: "68376DD901AE3D10A311CBCA6BD06ED8D86A7BD58F8B24069203358711577EA5",
    width: 1487,
    height: 1058,
    identityAuthority: false,
    anatomyAuthority: false,
    uiStyleAuthority: false,
    authorityScope: "single-example-composition-only",
    knownExclusions: [
      "do-not-copy-chest-v-u-when-action-hands-exist",
      "do-not-treat-layout-as-default",
      "do-not-treat-palette-as-default",
      "do-not-treat-materials-as-default",
    ],
  },
  {
    path: "assets/visual-grounding/processing-without-bubble.png",
    role: "composition-only-without-bubble",
    publication: "open-source-distributable",
    sha256: "7C8461D4DC13319C60AFDA34525B70F3C6467B07D40CA9A987217AB489FFD401",
    width: 1487,
    height: 1058,
    identityAuthority: false,
    anatomyAuthority: false,
    uiStyleAuthority: false,
    authorityScope: "single-example-composition-only",
    knownExclusions: [
      "do-not-copy-chest-v-u-when-action-hands-exist",
      "do-not-treat-layout-as-default",
      "do-not-treat-palette-as-default",
      "do-not-treat-materials-as-default",
    ],
  },
];
const EXPECTED_ASSET_COUNT = EXPECTED_ASSETS.length;
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

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function assertAssetAuthority(asset, expected) {
  if (stableJson(asset) !== stableJson(expected)) fail("invalid-asset-authority");
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
  if (
    !manifest ||
    manifest.schemaVersion !== 1 ||
    stableJson(manifest.stylePolicy) !== stableJson(EXPECTED_STYLE_POLICY) ||
    !Array.isArray(manifest.assets) ||
    manifest.assets.length !== EXPECTED_ASSET_COUNT
  ) {
    fail("invalid-asset-count");
  }

  const seenPaths = new Set();
  const seenRealPaths = new Set();
  for (const [index, asset] of manifest.assets.entries()) {
    assertAssetAuthority(asset, EXPECTED_ASSETS[index]);
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
