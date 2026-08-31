import { readFile } from "node:fs/promises";

const CONFIG_URL = new URL("../config/execution-modes.json", import.meta.url);
const TOP_LEVEL_KEYS = [
  "$schema",
  "schemaVersion",
  "defaultMode",
  "strictTriggers",
  "modes",
];
const MODE_NAMES = ["fast", "standard", "strict"];
const PROFILE_KEYS = ["label", "required", "mayOmit"];
const SHARED_REQUIRED = [
  "declare-mode",
  "verify-bundle",
  "view-required-images",
  "inspect-target-source",
  "derive-product-style",
  "produce-editable-output",
  "honest-evidence",
];
const rank = { fast: 0, standard: 1, strict: 2 };

class ResolverError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

function hasExactKeys(value, expected) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === expected.length &&
    Object.keys(value).every((key, index) => key === expected[index])
  );
}

function isUniqueNonblankStringArray(value, allowEmpty) {
  return (
    Array.isArray(value) &&
    (allowEmpty || value.length > 0) &&
    value.every((item) => typeof item === "string" && /\S/.test(item)) &&
    new Set(value).size === value.length
  );
}

function isValidConfig(config) {
  if (!hasExactKeys(config, TOP_LEVEL_KEYS)) return false;
  if (config.$schema !== "../protocol/execution-modes.schema.json") return false;
  if (config.schemaVersion !== 1) return false;
  if (!MODE_NAMES.includes(config.defaultMode)) return false;
  if (!isUniqueNonblankStringArray(config.strictTriggers, false)) return false;
  if (!hasExactKeys(config.modes, MODE_NAMES)) return false;

  for (const modeName of MODE_NAMES) {
    const profile = config.modes[modeName];
    if (!hasExactKeys(profile, PROFILE_KEYS)) return false;
    if (typeof profile.label !== "string" || !/\S/.test(profile.label)) return false;
    if (!isUniqueNonblankStringArray(profile.required, false)) return false;
    if (!isUniqueNonblankStringArray(profile.mayOmit, true)) return false;
    if (profile.mayOmit.some((item) => profile.required.includes(item))) return false;
    if (!SHARED_REQUIRED.every((item) => profile.required.includes(item))) return false;
  }

  return true;
}

async function loadConfig() {
  try {
    const config = JSON.parse(await readFile(CONFIG_URL, "utf8"));
    if (!isValidConfig(config)) throw new ResolverError("invalid-config");
    return config;
  } catch (error) {
    if (error instanceof ResolverError) throw error;
    throw new ResolverError("invalid-config");
  }
}

function parseArguments(args, knownTriggers) {
  let requested;
  const triggers = [];

  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];

    if (flag === "--requested") {
      if (requested !== undefined) throw new ResolverError("duplicate-requested");
      const value = args[index + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new ResolverError("missing-requested-value");
      }
      if (!MODE_NAMES.includes(value)) throw new ResolverError("invalid-requested-mode");
      requested = value;
      index += 1;
      continue;
    }

    if (flag === "--trigger") {
      const value = args[index + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new ResolverError("missing-trigger-value");
      }
      if (!knownTriggers.includes(value)) throw new ResolverError("unknown-trigger");
      if (triggers.includes(value)) throw new ResolverError("duplicate-trigger");
      triggers.push(value);
      index += 1;
      continue;
    }

    throw new ResolverError("unknown-argument");
  }

  return { requested, triggers };
}

function writeJson(stream, value) {
  stream.write(`${JSON.stringify(value)}\n`);
}

async function main() {
  const config = await loadConfig();
  const parsed = parseArguments(process.argv.slice(2), config.strictTriggers);
  const requested = parsed.requested ?? config.defaultMode;
  const strictTrigger = parsed.triggers.find((value) =>
    config.strictTriggers.includes(value),
  );
  const mode = strictTrigger ? "strict" : requested;
  const reason = strictTrigger
    ? `trigger:${strictTrigger}`
    : parsed.requested
      ? `requested:${requested}`
      : "default";

  writeJson(process.stdout, {
    ok: true,
    mode,
    reason,
    upgradedFrom: rank[mode] > rank[requested] ? requested : null,
  });
}

try {
  await main();
} catch (error) {
  const code = error instanceof ResolverError ? error.code : "resolver-failed";
  writeJson(process.stderr, { ok: false, error: code });
  process.exitCode = 1;
}
