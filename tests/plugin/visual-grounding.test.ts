import { execFile } from "node:child_process";
import {
  appendFile,
  cp,
  link,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

import manifest from "../../plugins/fantasy-mouse-ui/assets/visual-grounding/manifest.json" with {
  type: "json"
};

const execFileAsync = promisify(execFile);
const pluginSource = fileURLToPath(
  new URL("../../plugins/fantasy-mouse-ui", import.meta.url)
);
const approvedStatement =
  "The character assets originate from internet meme material and were personally collaged, drawn, and produced by the project maintainer. The original authors and license status of the underlying internet material have not been confirmed.";
const expectedRightsPolicy = {
  codeLicense: "MIT",
  assetOrigin: "internet-meme-derived-maintainer-collage",
  underlyingAuthor: "unconfirmed",
  underlyingLicense: "unconfirmed",
  provenancePath: "ASSET_PROVENANCE.md"
};
const capabilityErrorCodes = new Set([
  "EACCES",
  "ENOSYS",
  "ENOTSUP",
  "EOPNOTSUPP",
  "EPERM"
]);

type MutableManifestAsset = Record<string, unknown> & {
  publication: string;
  uiStyleAuthority: boolean;
};

type MutableRightsPolicy = Record<string, unknown> & {
  codeLicense: string;
  assetOrigin: string;
  underlyingAuthor: string;
  underlyingLicense: string;
  provenancePath: string;
};

type MutableManifest = Record<string, unknown> & {
  schemaVersion: number;
  stylePolicy: Record<string, unknown>;
  rightsPolicy: MutableRightsPolicy;
  assets: MutableManifestAsset[];
};

type CopiedPluginExecution = {
  preloadPath?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMutableManifest(value: unknown): value is MutableManifest {
  return (
    isRecord(value) &&
    typeof value.schemaVersion === "number" &&
    isRecord(value.stylePolicy) &&
    isRecord(value.rightsPolicy) &&
    typeof value.rightsPolicy.codeLicense === "string" &&
    typeof value.rightsPolicy.assetOrigin === "string" &&
    typeof value.rightsPolicy.underlyingAuthor === "string" &&
    typeof value.rightsPolicy.underlyingLicense === "string" &&
    typeof value.rightsPolicy.provenancePath === "string" &&
    Array.isArray(value.assets) &&
    value.assets.every(
      (asset): asset is MutableManifestAsset =>
        isRecord(asset) &&
        typeof asset.publication === "string" &&
        typeof asset.uiStyleAuthority === "boolean"
    )
  );
}

function isCapabilityError(error: unknown) {
  return (
    isRecord(error) &&
    typeof error.code === "string" &&
    capabilityErrorCodes.has(error.code)
  );
}

async function withCopiedPlugin(
  label: string,
  mutate: (copiedPlugin: string) => Promise<CopiedPluginExecution | void>,
  expectedError: string
) {
  const temporaryRoot = await mkdtemp(join(tmpdir(), `fantasy-mouse-${label}-`));
  const copiedPlugin = join(temporaryRoot, "fantasy-mouse-ui");
  await cp(pluginSource, copiedPlugin, { recursive: true });
  try {
    const execution = await mutate(copiedPlugin);

    let stdout = "";
    let stderr = "";
    try {
      const result = await execFileAsync(process.execPath, [
        ...(execution?.preloadPath === undefined
          ? []
          : ["--require", execution.preloadPath]),
        join(copiedPlugin, "scripts", "verify-bundle.mjs")
      ]);
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (error) {
      stdout = (error as Error & { stdout?: string }).stdout ?? "";
      stderr = (error as Error & { stderr?: string }).stderr ?? "";
    }

    expect(stdout).toBe("");
    expect(Buffer.byteLength(stderr, "utf8")).toBeLessThanOrEqual(128);
    expect(stderr.trim().split(/\r?\n/u)).toHaveLength(1);
    expect(JSON.parse(stderr)).toEqual({ ok: false, error: expectedError });
    expect(stderr).not.toContain(temporaryRoot);
    expect(stderr).not.toContain(copiedPlugin);
    expect(stderr).not.toContain("manifest.json");
    expect(stderr).not.toContain("ASSET_PROVENANCE.md");
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

async function updateCopiedManifest(
  copiedPlugin: string,
  mutate: (manifest: MutableManifest) => MutableManifest | void
) {
  const manifestPath = join(
    copiedPlugin,
    "assets",
    "visual-grounding",
    "manifest.json"
  );
  const parsed: unknown = JSON.parse(await readFile(manifestPath, "utf8"));
  if (!isMutableManifest(parsed)) throw new Error("invalid test manifest fixture");
  const copiedManifest = mutate(parsed) ?? parsed;
  await writeFile(manifestPath, JSON.stringify(copiedManifest), "utf8");
}

describe("Fantasy Mouse visual grounding bundle", () => {
  it("pins each visual reference to its exact authority scope", () => {
    expect(manifest.schemaVersion).toBe(1);
    expect(Object.keys(manifest)).toEqual([
      "schemaVersion",
      "stylePolicy",
      "rightsPolicy",
      "assets"
    ]);
    expect(
      (manifest as typeof manifest & { stylePolicy?: unknown }).stylePolicy
    ).toEqual({
      fixedSystem: "character-identity-only",
      uiDerivation: "target-product-and-platform",
      templateLeakageThreshold: 3
    });
    expect(
      (manifest as typeof manifest & { rightsPolicy?: unknown }).rightsPolicy
    ).toEqual(expectedRightsPolicy);
    expect(
      manifest.assets.map(({ path, sha256, width, height }) => ({
        path,
        sha256,
        width,
        height
      }))
    ).toEqual([
      {
        path: "assets/visual-grounding/canonical-protagonist.png",
        sha256:
          "4C85BCE3AD50F33FC04BBF05147EFD96ED0BAE98866C12E1DB5E7096C8557316",
        width: 1387,
        height: 1134
      },
      {
        path: "assets/visual-grounding/processing-action-hands.png",
        sha256:
          "A22C3E5EBA3E4F417075F54F38DA3D7B6E177D294D42ED627F350AB38C7652A1",
        width: 1254,
        height: 1254
      },
      {
        path: "assets/visual-grounding/processing-with-bubble.png",
        sha256:
          "68376DD901AE3D10A311CBCA6BD06ED8D86A7BD58F8B24069203358711577EA5",
        width: 1487,
        height: 1058
      },
      {
        path: "assets/visual-grounding/processing-without-bubble.png",
        sha256:
          "7C8461D4DC13319C60AFDA34525B70F3C6467B07D40CA9A987217AB489FFD401",
        width: 1487,
        height: 1058
      }
    ]);
    expect(manifest.assets.map((asset) => asset.role)).toEqual([
      "canonical-identity",
      "approved-action-hand-pose",
      "composition-only-with-bubble",
      "composition-only-without-bubble"
    ]);
    expect(
      manifest.assets.every(
        (asset) =>
          asset.publication === "bundled-with-disclosed-unverified-origin"
      )
    ).toBe(true);
    expect(
      manifest.assets.every(
        (asset) =>
          (
            asset as typeof asset & {
              uiStyleAuthority?: boolean;
            }
          ).uiStyleAuthority === false
      )
    ).toBe(true);

    const canonical = manifest.assets[0]!;
    expect(canonical.identityAuthority).toBe(true);
    expect(canonical.anatomyAuthority).toBe(false);
    expect(canonical.authorityScope).toBe("canonical-character-identity");

    const actionHands = manifest.assets[1]!;
    expect(actionHands.identityAuthority).toBe(false);
    expect(actionHands.anatomyAuthority).toBe(true);
    expect(actionHands.authorityScope).toBe("action-hand-anatomy");
    expect(actionHands.handRule).toBe(
      "action-hands-replace-default-chest-v-u"
    );

    for (const composition of manifest.assets.slice(2)) {
      expect(composition.identityAuthority).toBe(false);
      expect(composition.anatomyAuthority).toBe(false);
      expect(composition.authorityScope).toBe(
        "single-example-composition-only"
      );
      expect(composition.knownExclusions).toEqual([
        "do-not-copy-chest-v-u-when-action-hands-exist",
        "do-not-treat-layout-as-default",
        "do-not-treat-palette-as-default",
        "do-not-treat-materials-as-default"
      ]);
    }
  });

  it("verifies exact bytes and PNG dimensions without leaking paths", async () => {
    const verifier = new URL(
      "../../plugins/fantasy-mouse-ui/scripts/verify-bundle.mjs",
      import.meta.url
    );
    const { stdout, stderr } = await execFileAsync(process.execPath, [
      fileURLToPath(verifier)
    ]);

    expect(stderr).toBe("");
    expect(JSON.parse(stdout)).toEqual({ ok: true, assets: 4 });
  });

  it("rejects a manifest that changes authority-defining fields", async () => {
    await withCopiedPlugin(
      "authority",
      async (copiedPlugin) => {
        await updateCopiedManifest(copiedPlugin, (copiedManifest) => {
          copiedManifest.assets[2].uiStyleAuthority = true;
        });
      },
      "invalid-asset-authority"
    );
  });

  it("rejects an extra top-level manifest field without leaking paths", async () => {
    await withCopiedPlugin(
      "manifest-extra-field",
      async (copiedPlugin) => {
        await updateCopiedManifest(copiedPlugin, (copiedManifest) => {
          copiedManifest.assetRightsClaim = "copyright-free";
        });
      },
      "invalid-manifest"
    );
  });

  it("rejects reordered top-level manifest fields", async () => {
    await withCopiedPlugin(
      "manifest-reordered",
      async (copiedPlugin) => {
        await updateCopiedManifest(copiedPlugin, (copiedManifest) => ({
          assets: copiedManifest.assets,
          rightsPolicy: copiedManifest.rightsPolicy,
          stylePolicy: copiedManifest.stylePolicy,
          schemaVersion: copiedManifest.schemaVersion
        }));
      },
      "invalid-manifest"
    );
  });

  it("rejects a missing top-level manifest field", async () => {
    await withCopiedPlugin(
      "manifest-missing-field",
      async (copiedPlugin) => {
        await updateCopiedManifest(copiedPlugin, (copiedManifest) => {
          Reflect.deleteProperty(copiedManifest, "rightsPolicy");
        });
      },
      "invalid-manifest"
    );
  });

  it("rejects tampered rights policy without leaking paths", async () => {
    await withCopiedPlugin(
      "rights-policy",
      async (copiedPlugin) => {
        await updateCopiedManifest(copiedPlugin, (copiedManifest) => {
          copiedManifest.rightsPolicy = {
            ...expectedRightsPolicy,
            underlyingLicense: "MIT"
          };
        });
      },
      "invalid-rights-policy"
    );
  });

  it("rejects the former asset publication claim without leaking paths", async () => {
    await withCopiedPlugin(
      "publication",
      async (copiedPlugin) => {
        await updateCopiedManifest(copiedPlugin, (copiedManifest) => {
          copiedManifest.assets[0].publication = "open-source-distributable";
        });
      },
      "invalid-asset-authority"
    );
  });

  it("rejects an escaped provenance path without leaking paths", async () => {
    await withCopiedPlugin(
      "provenance-escape",
      async (copiedPlugin) => {
        await updateCopiedManifest(copiedPlugin, (copiedManifest) => {
          copiedManifest.rightsPolicy = {
            ...expectedRightsPolicy,
            provenancePath: "../outside-provenance.md"
          };
        });
      },
      "provenance-path-escape"
    );
  });

  it("rejects a safe in-root but noncanonical provenance path", async () => {
    await withCopiedPlugin(
      "provenance-noncanonical",
      async (copiedPlugin) => {
        await updateCopiedManifest(copiedPlugin, (copiedManifest) => {
          copiedManifest.rightsPolicy = {
            ...expectedRightsPolicy,
            provenancePath: "OTHER_PROVENANCE.md"
          };
        });
      },
      "invalid-rights-policy"
    );
  });

  it("rejects a missing provenance file without leaking paths", async () => {
    await withCopiedPlugin(
      "provenance-missing",
      async (copiedPlugin) => {
        await rm(join(copiedPlugin, "ASSET_PROVENANCE.md"), { force: true });
      },
      "invalid-provenance-file"
    );
  });

  it("rejects a provenance symlink where the platform permits creating one", async ({ skip }) => {
    await withCopiedPlugin(
      "provenance-symlink",
      async (copiedPlugin) => {
        const provenancePath = join(copiedPlugin, "ASSET_PROVENANCE.md");
        const externalPath = join(copiedPlugin, "external-provenance.md");
        await rm(provenancePath, { force: true });
        await writeFile(externalPath, approvedStatement, "utf8");
        try {
          await symlink(externalPath, provenancePath, "file");
        } catch (error) {
          if (
            isCapabilityError(error)
          ) {
            skip("platform does not permit creating a file symlink");
            return;
          }
          throw error;
        }
      },
      "symlink-not-allowed"
    );
  });

  it("rejects a hard-linked provenance file where the platform permits creating one", async ({ skip }) => {
    await withCopiedPlugin(
      "provenance-hardlink",
      async (copiedPlugin) => {
        const provenancePath = join(copiedPlugin, "ASSET_PROVENANCE.md");
        const secondLink = join(copiedPlugin, "ASSET_PROVENANCE-HARDLINK.md");
        try {
          await link(provenancePath, secondLink);
        } catch (error) {
          if (isCapabilityError(error)) {
            skip("platform does not permit creating a hard link");
            return;
          }
          throw error;
        }
      },
      "invalid-provenance-file"
    );
  });

  it("rejects when containment-checked provenance identity differs from the opened handle", async () => {
    await withCopiedPlugin(
      "provenance-identity",
      async (copiedPlugin) => {
        const provenancePath = join(copiedPlugin, "ASSET_PROVENANCE.md");
        const preloadPath = join(copiedPlugin, "inject-provenance-identity.cjs");
        await writeFile(
          preloadPath,
          `
const fileSystem = require("node:fs/promises");
const { syncBuiltinESMExports } = require("node:module");
const { resolve } = require("node:path");
const targetPath = resolve(${JSON.stringify(provenancePath)});
const realLstat = fileSystem.lstat;
fileSystem.lstat = async function injectedLstat(path, options) {
  const stats = await realLstat(path, options);
  if (resolve(path) !== targetPath || options?.bigint !== true) return stats;
  return new Proxy(stats, { get(target, property, receiver) {
    if (property === "dev" || property === "ino") return target[property] + 1n;
    const value = Reflect.get(target, property, receiver);
    return typeof value === "function" ? value.bind(target) : value;
  }});
};
syncBuiltinESMExports();
`,
          "utf8"
        );
        return { preloadPath };
      },
      "invalid-provenance-file"
    );
  });

  it("rejects an empty provenance file", async () => {
    await withCopiedPlugin(
      "provenance-empty",
      async (copiedPlugin) => {
        await writeFile(join(copiedPlugin, "ASSET_PROVENANCE.md"), "", "utf8");
      },
      "invalid-provenance-file"
    );
  });

  it("rejects provenance larger than 64 KiB", async () => {
    await withCopiedPlugin(
      "provenance-oversized",
      async (copiedPlugin) => {
        const provenancePath = join(copiedPlugin, "ASSET_PROVENANCE.md");
        const canonical = await readFile(provenancePath);
        await writeFile(
          provenancePath,
          Buffer.concat([canonical, Buffer.alloc(64 * 1024, 0x20)])
        );
      },
      "invalid-provenance-file"
    );
  });

  it("rejects provenance that omits the approved factual statement", async () => {
    await withCopiedPlugin(
      "provenance-content",
      async (copiedPlugin) => {
        await writeFile(
          join(copiedPlugin, "ASSET_PROVENANCE.md"),
          "Software code is MIT licensed, but provenance is unavailable.",
          "utf8"
        );
      },
      "invalid-provenance-content"
    );
  });

  it("rejects contradictory content appended to canonical provenance", async () => {
    await withCopiedPlugin(
      "provenance-contradiction",
      async (copiedPlugin) => {
        await appendFile(
          join(copiedPlugin, "ASSET_PROVENANCE.md"),
          "\nThe underlying internet material is copyright-free.\n",
          "utf8"
        );
      },
      "invalid-provenance-content"
    );
  });
});
