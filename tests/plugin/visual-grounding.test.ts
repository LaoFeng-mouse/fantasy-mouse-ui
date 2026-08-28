import { execFile } from "node:child_process";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

import manifest from "../../plugins/fantasy-mouse-ui/assets/visual-grounding/manifest.json" with {
  type: "json"
};

const execFileAsync = promisify(execFile);

describe("Fantasy Mouse visual grounding bundle", () => {
  it("pins each visual reference to its exact authority scope", () => {
    expect(manifest.schemaVersion).toBe(1);
    expect(
      (manifest as typeof manifest & { stylePolicy?: unknown }).stylePolicy
    ).toEqual({
      fixedSystem: "character-identity-only",
      uiDerivation: "target-product-and-platform",
      templateLeakageThreshold: 3
    });
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
        (asset) => asset.publication === "open-source-distributable"
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
    const root = await mkdtemp(join(tmpdir(), "fantasy-mouse-authority-"));
    const copiedPlugin = join(root, "fantasy-mouse-ui");
    await cp(fileURLToPath(new URL("../../plugins/fantasy-mouse-ui", import.meta.url)), copiedPlugin, {
      recursive: true,
    });
    try {
      const manifestPath = join(copiedPlugin, "assets", "visual-grounding", "manifest.json");
      const altered = JSON.parse(await readFile(manifestPath, "utf8"));
      altered.assets[2].uiStyleAuthority = true;
      await writeFile(manifestPath, JSON.stringify(altered), "utf8");

      let stderr = "";
      try {
        await execFileAsync(process.execPath, [join(copiedPlugin, "scripts", "verify-bundle.mjs")]);
      } catch (error) {
        stderr = (error as Error & { stderr?: string }).stderr ?? "";
      }
      expect(JSON.parse(stderr)).toEqual({ ok: false, error: "invalid-asset-authority" });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
