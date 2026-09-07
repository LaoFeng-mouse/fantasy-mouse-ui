import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { expectedPluginFiles } from "./plugin-inventory.fixture.js";

import manifest from "../../plugins/fantasy-mouse-ui/.codex-plugin/plugin.json" with {
  type: "json"
};


function withoutHistoricalV010Baseline(document: string): string {
  return document.replace(
    /(?:^|\n)## Historical v0\.1\.0 baseline[^\n]*\n[\s\S]*?(?=\n## |$)/giu,
    "",
  );
}

function extractFencedTextLinesAfter(document: string, marker: string): string[] {
  const markerIndex = document.indexOf(marker);
  expect(markerIndex, `missing allowlist marker: ${marker}`).toBeGreaterThanOrEqual(0);
  const afterMarker = document.slice(markerIndex + marker.length);
  const match = afterMarker.match(/^\s*```text\r?\n([\s\S]*?)\r?\n```/u);
  expect(match, `missing fenced text block after: ${marker}`).not.toBeNull();
  return (match?.[1] ?? "").split(/\r?\n/u);
}

function extractPromptInventory(
  prompt: string,
  marker: "Allowlist:" | "允许清单：",
  delimiter: ";" | "；",
): string[] {
  const line = prompt.split(/\r?\n/u).find((candidate) => candidate.startsWith(marker));
  expect(line, `missing prompt inventory line: ${marker}`).toBeDefined();
  return (line ?? "")
    .slice(marker.length)
    .trim()
    .replace(/[.。]$/u, "")
    .split(delimiter)
    .map((entry) => entry.trim());
}

describe("Fantasy Mouse UI plugin manifest", () => {
  it("defines the exact installation boundary without apps or MCP servers", () => {
    const { version, ...manifestWithoutVersion } = manifest;

    expect(version).toMatch(/^0\.2\.0(?:\+codex\.[a-z0-9-]+)?$/);
    expect(manifestWithoutVersion).toEqual({
      name: "fantasy-mouse-ui",
      description:
        "Reusable Skill for creating software UI, websites, presentations, and workflow designs with fixed Fantasy Mouse identity and independently product-derived styling.",
      author: { name: "Fantasy Mouse UI project" },
      keywords: ["ui-design", "frontend", "workflow", "fantasy-mouse"],
      skills: "./skills/",
      interface: {
        displayName: "Fantasy Mouse UI",
        shortDescription:
          "Fixed mouse identity, product-derived cross-surface UI",
        longDescription:
          "Preserve the approved mouse identity while deriving each interface from the target product, users, platform, workflow, source brand, and accessibility needs across software, websites, presentations, and workflows.",
        developerName: "Fantasy Mouse UI project",
        category: "Design",
        capabilities: [
          "Software UI Design",
          "Website Design",
          "Presentation Design",
          "Workflow Translation"
        ],
        defaultPrompt: [
          "Redesign this software with fixed Fantasy Mouse identity and UI derived from the product.",
          "Design this website from its product and source-brand evidence while preserving the Fantasy Mouse character.",
          "Turn this presentation or workflow into an editable Fantasy Mouse treatment without importing a fixed UI theme."
        ],
        brandColor: "#A8D25F"
      }
    });
    expect(manifest).not.toHaveProperty("mcpServers");
    expect(manifest).not.toHaveProperty("apps");
  });

  it.each(["skills", "assets", "scripts"])(
    "%s/ is a directory",
    (directory) => {
      const directoryUrl = new URL(
        `../../plugins/fantasy-mouse-ui/${directory}/`,
        import.meta.url
      );

      expect(statSync(directoryUrl).isDirectory()).toBe(true);
    }
  );

  it("publishes the exact Codex plugin marketplace entry", () => {
    const marketplace = JSON.parse(
      readFileSync(
        new URL("../../.agents/plugins/marketplace.json", import.meta.url),
        "utf8"
      )
    );

    expect(marketplace).toEqual({
      name: "fantasy-mouse-ui",
      interface: { displayName: "Fantasy Mouse UI" },
      plugins: [
        {
          name: "fantasy-mouse-ui",
          source: {
            source: "local",
            path: "./plugins/fantasy-mouse-ui"
          },
          policy: {
            installation: "AVAILABLE",
            authentication: "ON_INSTALL"
          },
          category: "Design"
        }
      ]
    });
  });

  it("documents complete AI-assisted installation", () => {
    const installGuide = readFileSync(
      new URL("../../INSTALL_WITH_AI.md", import.meta.url),
      "utf8"
    );

    expect(installGuide).toContain("codex plugin marketplace add");
    expect(installGuide).toContain('{"ok":true,"assets":4}');
    expect(installGuide).toContain("不要只复制单个 SKILL.md");
    expect(installGuide).toContain("Do not copy only SKILL.md");
    expect(installGuide).toContain(
      "Create a destination directory named `fantasy-mouse-ui` first, then extract every ZIP entry into that directory."
    );
    expect(installGuide).toContain(
      "必须先创建名为 `fantasy-mouse-ui` 的目标目录，再把 ZIP 内的全部内容解压到该目录中。"
    );

    expect(expectedPluginFiles).toHaveLength(24);
    expect([...expectedPluginFiles].sort()).toEqual(expectedPluginFiles);
    for (const expectedPath of expectedPluginFiles) {
      expect(installGuide).toContain(expectedPath);
    }

    for (const releaseRoute of [
      "https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/tag/v0.1.0",
      "https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/latest",
      "https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/latest/download/fantasy-mouse-ui.zip"
    ]) {
      expect(installGuide).toContain(releaseRoute);
    }

    for (const adapterPath of [
      "adapters/claude/SKILL.md",
      "adapters/gemini/SKILL.md",
      "adapters/deepseek/SKILL.md",
      "adapters/generic/AGENT.md"
    ]) {
      expect(installGuide).toContain(adapterPath);
    }

    expect(installGuide).toContain(
      "`verify-bundle.mjs` proves only the four pinned visual assets; it does not prove complete installation or host loading."
    );
    expect(installGuide).toContain(
      "Actual loading in a new task/session is a separate final boundary."
    );
    expect(installGuide).toContain(
      'Never call the installation successful based only on {"ok":true,"assets":4}.'
    );
  });

  it("declares the complete v0.2.0 release candidate and all seven outcomes", () => {
    const packageJson = JSON.parse(
      readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
    ) as { version: string };
    expect(packageJson.version).toBe("0.2.0");
    expect(manifest.version).toBe("0.2.0");

    const releaseNotes = readFileSync(
      new URL("../../docs/release-notes-0.2.0.md", import.meta.url),
      "utf8",
    );
    for (const outcome of [
      "four real results",
      "22-second workflow demonstration",
      "result-led README",
      "Quick Start",
      "Fast / Standard / Strict",
      "four accepted benchmark cases",
      "asset provenance",
    ]) {
      expect(releaseNotes, outcome).toContain(outcome);
    }
    expect(releaseNotes).toContain("24-file plugin inventory");
    expect(releaseNotes).toContain("fresh-process loading");
    expect(releaseNotes).toContain("unconfirmed underlying authorship/license");

    const changelog = readFileSync(new URL("../../CHANGELOG.md", import.meta.url), "utf8");
    expect(changelog).toContain("## [0.2.0]");

    const architecture = readFileSync(
      new URL("../../docs/architecture.md", import.meta.url),
      "utf8",
    );
    expect(architecture).not.toContain("does not contain a product Studio, surface renderer, or sample application");
    expect(architecture).toContain("examples/ benchmark portfolio");
  });

  it("documents the current 24-file mode and asset-rights contract in every active guide", () => {
    const activeDocs = [
      { path: "../../AGENTS.md", provenance: "plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md" },
      { path: "../../README.md", provenance: "plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md" },
      { path: "../../INSTALL_WITH_AI.md", provenance: "plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md" },
      { path: "../../CONTEXT.md", provenance: "plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md" },
      { path: "../../docs/architecture.md", provenance: "../plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md" },
      { path: "../../docs/handoff.md", provenance: "../plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md" },
      { path: "../../docs/integration-guide.md", provenance: "../plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md" },
      { path: "../../docs/operator-runbook.md", provenance: "../plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md" }
    ] as const;
    const rejectedActiveClaims = [
      /MIT-licensed plugin and four approved visual assets/iu,
      /all four images are MIT licensed/iu,
      /open-source-distributable/iu,
      /\b20-(?:file|entry)/iu,
      /(?:confirm|contains?|inventory:)?\s*exactly 20 entries/iu,
      /MIT-licensed visual(?:-grounding)? assets?/iu,
      /visual(?:-grounding)? assets?[^\n.]*(?:under|with) the MIT License/iu,
      /(?:are|is) copyright-free/iu,
      /(?:are|is) public[- ]domain/iu
    ];

    for (const { path, provenance } of activeDocs) {
      const documentUrl = new URL(path, import.meta.url);
      const document = readFileSync(documentUrl, "utf8");
      const currentDocument = withoutHistoricalV010Baseline(document);
      expect(currentDocument, path).toMatch(/(?:exact|complete) 24-(?:file|entry) plugin inventory/iu);
      expect(currentDocument, path).toContain("config/execution-modes.json");
      expect(currentDocument, path).toContain("protocol/execution-modes.schema.json");
      expect(currentDocument, path).toContain("scripts/resolve-mode.mjs");
      expect(currentDocument, path).toContain("Standard");
      expect(currentDocument, path).toContain(`](${provenance})`);
      expect(statSync(new URL(provenance, documentUrl)).isFile(), path).toBe(true);
      expect(currentDocument, path).toMatch(/MIT[^\n]*(?:software )?code|(?:software )?code[^\n]*MIT/iu);
      expect(currentDocument, path).toMatch(/visual assets?[^\n]*(?:unverified|unconfirmed)|(?:unverified|unconfirmed)[^\n]*visual assets?/iu);
      for (const rejectedClaim of rejectedActiveClaims) {
        expect(currentDocument, path).not.toMatch(rejectedClaim);
      }
    }

    for (const historicalDoc of ["../../AGENTS.md", "../../docs/handoff.md"]) {
      expect(readFileSync(new URL(historicalDoc, import.meta.url), "utf8"), historicalDoc).toContain(
        "## Historical v0.1.0 baseline",
      );
    }
  });

  it("distinguishes fixed v0.1 history from mutable discovery and requires trusted ZIP identity", () => {
    const installGuide = readFileSync(
      new URL("../../INSTALL_WITH_AI.md", import.meta.url),
      "utf8"
    );
    expect(installGuide).toContain(
      "https://github.com/LaoFeng-mouse/fantasy-mouse-ui"
    );
    expect(installGuide).toContain(
      "https://github.com/LaoFeng-mouse/fantasy-mouse-ui/releases/tag/v0.1.0"
    );
    expect(installGuide).toContain("Historical v0.1.0 release record");
    expect(installGuide).toContain("历史 v0.1.0 发布记录");
    expect(installGuide).toContain("mutable discovery endpoints");
    expect(installGuide).toContain("可变发现端点");
    expect(installGuide).toContain("trusted release-published SHA-256 digest");
    expect(installGuide).toContain("可信发布流程公布的 SHA-256 摘要");
    expect(installGuide).toContain(
      "byte-for-byte identical to a separately trusted locally built archive",
    );
    expect(installGuide).toContain("与另一个单独受信任的本地构建压缩包逐字节相同");
    expect(installGuide).toContain(
      "Inventory validation and `verify-bundle.mjs` authenticate only archive structure and the four pinned visual bytes; they do not authenticate every script, schema, or Skill file.",
    );
    expect(installGuide).toContain(
      "清单验证和 `verify-bundle.mjs` 只认证压缩包结构与四个固定视觉文件的字节；它们不认证每个脚本、Schema 或 Skill 文件。",
    );
    expect(installGuide).toContain(
      "Until the GitHub v0.2.0 Release and its digest are independently verified, the trusted release-candidate route is a local source build.",
    );
    expect(installGuide).toContain(
      "在 GitHub v0.2.0 Release 及其摘要完成独立验证前，受信任的发布候选路径是本地源码构建。",
    );
    expect(installGuide).not.toContain("its `latest` aliases are retained below as historical routes");
    expect(installGuide).not.toContain("latest asset remain historical discovery routes");
    expect(installGuide).not.toContain("历史 v0.1.0 发布记录/别名");
    expect(installGuide).not.toContain("historical v0.1.0 release records/aliases");
    expect(installGuide).not.toMatch(
      /(?:releases\/latest|latest release|latest download)[^.\n]*(?:is|are|remain)[^.\n]*historical/iu,
    );
    expect(installGuide).not.toMatch(/latest[^。\n]*(?:是|属于|作为)[^。\n]*历史/iu);
    expect(installGuide).not.toContain("Publication status: pending");
    expect(installGuide).not.toContain("发布状态：待完成");
    expect(installGuide).not.toContain("Task 6 publication");
  });

  it("documents both manual ZIP allowlists as the exact ordered inventory", () => {
    const installGuide = readFileSync(
      new URL("../../INSTALL_WITH_AI.md", import.meta.url),
      "utf8",
    );
    const documentedInventories = [
      extractFencedTextLinesAfter(installGuide, "The independent allowlist is exactly:"),
      extractFencedTextLinesAfter(installGuide, "独立允许清单恰好为："),
    ];

    for (const inventory of documentedInventories) {
      expect(inventory).toEqual(expectedPluginFiles);
      expect(inventory).toHaveLength(24);
      expect(new Set(inventory).size).toBe(24);
      expect(new Set(inventory.map((entry) => entry.toLocaleLowerCase("en-US"))).size).toBe(24);
    }
  });

  it("orders preflight and targeted marketplace checks in every install route", () => {
    const installGuide = readFileSync(
      new URL("../../INSTALL_WITH_AI.md", import.meta.url),
      "utf8"
    );

    const sectionBetween = (startMarker: string, endMarker: string) => {
      const start = installGuide.indexOf(startMarker);
      const end = installGuide.indexOf(endMarker, start + startMarker.length);
      expect(start, `missing section start: ${startMarker}`).toBeGreaterThanOrEqual(0);
      expect(end, `missing section end: ${endMarker}`).toBeGreaterThan(start);
      return installGuide.slice(start, end);
    };
    const fencedPrompt = (heading: string, nextHeading?: string) => {
      const region = nextHeading
        ? sectionBetween(heading, nextHeading)
        : installGuide.slice(installGuide.indexOf(heading));
      const match = region.match(/```text\r?\n([\s\S]*?)\r?\n```/);
      expect(match, `missing text fence under: ${heading}`).not.toBeNull();
      return match?.[1] ?? "";
    };
    const expectOrdered = (region: string, markers: string[]) => {
      let previous = -1;
      for (const marker of markers) {
        const current = region.indexOf(marker);
        expect(current, `missing ordered marker: ${marker}`).toBeGreaterThan(previous);
        previous = current;
      }
    };

    const manualEnglishMarketplace = sectionBetween(
      "### Manual English Codex workflow",
      "### Codex 中文手动流程"
    );
    const manualChineseMarketplace = sectionBetween(
      "### Codex 中文手动流程",
      "## Release ZIP / Release ZIP 安装"
    );
    const manualEnglishZip = sectionBetween(
      "### Manual English ZIP workflow",
      "### 中文手动 ZIP 流程"
    );
    const manualChineseZip = sectionBetween(
      "### 中文手动 ZIP 流程",
      "## Agent entry points / Agent 入口"
    );
    const chinesePrompt = fencedPrompt(
      "## 中文一键部署提示词",
      "## English copy-paste deployment prompt"
    );
    const englishPrompt = fencedPrompt("## English copy-paste deployment prompt");
    expect(chinesePrompt).toContain(
      "请返回实际绝对安装目录、执行过的每一条命令、各层完整验证输出，以及是否需要并已完成新任务/会话加载；任何一项缺失或失败都不得声称安装成功。"
    );
    expect(englishPrompt).toContain(
      "Return the actual absolute installation directory, every command used, the complete output from every verification tier, and whether a new task/session is required and has loaded the plugin; do not claim installation success when any item is missing or failed."
    );

    const promptInventories = [
      extractPromptInventory(englishPrompt, "Allowlist:", ";"),
      extractPromptInventory(chinesePrompt, "允许清单：", "；"),
    ];
    for (const inventory of promptInventories) {
      expect(inventory).toEqual(expectedPluginFiles);
      expect(inventory).toHaveLength(24);
      expect(new Set(inventory).size).toBe(24);
      expect(new Set(inventory.map((entry) => entry.toLocaleLowerCase("en-US"))).size).toBe(24);
    }

    const englishZipRoutes = [manualEnglishZip, englishPrompt];
    const chineseZipRoutes = [manualChineseZip, chinesePrompt];
    for (const route of englishZipRoutes) {
      expectOrdered(route, [
        "[1. Archive preflight]",
        "[2. Extraction]",
        "[3. Post-extraction lstat and inventory]",
        "[4. Visual bundle verification]",
        "[5. Collision-failing final move]"
      ]);
      for (const requirement of [
        "Before extracting anything, enumerate ZIP central-directory entries and metadata.",
        "Raw entry names containing backslashes are rejected.",
        "Normalized forward-slash names must exactly equal the independent 24-file allowlist.",
        "Reject absolute paths, drive-letter paths, UNC paths, empty names, `.` or `..` components, path escape, duplicate names, and case-colliding names.",
        "Reject directory entries and link, symlink, junction, reparse-point, device, or other non-regular entries.",
        "Use an extraction API that enforces every output destination remains inside the staged `fantasy-mouse-ui` root and refuses links and reparse points.",
        "After extraction, lstat exactly 24 regular files and reject extras."
      ]) {
        expect(route).toContain(requirement);
      }
    }
    for (const route of chineseZipRoutes) {
      expectOrdered(route, [
        "[1. 压缩包预检]",
        "[2. 解压]",
        "[3. 解压后 lstat 与清单检查]",
        "[4. 视觉素材验证]",
        "[5. 遇到冲突即失败的最终移动]"
      ]);
      for (const requirement of [
        "解压任何内容前，必须枚举 ZIP 中央目录的全部条目和元数据。",
        "原始条目名包含反斜杠时必须拒绝。",
        "规范化后的正斜杠名称必须与独立的 24 文件允许清单完全一致。",
        "必须拒绝绝对路径、盘符路径、UNC 路径、空名称、`.` 或 `..` 组件、路径逃逸、重复名称和大小写冲突名称。",
        "必须拒绝目录条目以及链接、符号链接、junction、重解析点、设备或其他非常规条目。",
        "必须使用能够强制每个输出目标都位于暂存 `fantasy-mouse-ui` 根目录内，并拒绝链接和重解析点的解压 API。",
        "解压后必须用 lstat 核对恰好 24 个常规文件并拒绝额外条目。"
      ]) {
        expect(route).toContain(requirement);
      }
    }

    for (const route of [...englishZipRoutes, ...chineseZipRoutes]) {
      for (const expectedPath of expectedPluginFiles) {
        expect(route).toContain(expectedPath);
      }
    }

    const englishMarketplaceRoutes = [manualEnglishMarketplace, englishPrompt];
    const chineseMarketplaceRoutes = [manualChineseMarketplace, chinesePrompt];
    const addCommand =
      "codex plugin marketplace add https://github.com/LaoFeng-mouse/fantasy-mouse-ui --json";
    const targetedAvailable =
      "codex plugin list --marketplace fantasy-mouse-ui --available --json";
    const pluginAdd = "codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json";
    const targetedInstalled =
      "codex plugin list --marketplace fantasy-mouse-ui --json";
    const optionalGlobal = "codex plugin marketplace list --json";
    for (const route of [...englishMarketplaceRoutes, ...chineseMarketplaceRoutes]) {
      expectOrdered(route, [addCommand, targetedAvailable, pluginAdd, targetedInstalled, optionalGlobal]);
      expect(route.indexOf(addCommand)).toBeLessThan(route.indexOf(optionalGlobal));
    }
    for (const route of englishMarketplaceRoutes) {
      expect(route).toContain(
        "Accept identity only when successful JSON reports `alreadyAdded` as `false` or `true` for that exact expected URL."
      );
      expect(route).toContain(
        "If `alreadyAdded` is `true`, run `codex plugin marketplace upgrade fantasy-mouse-ui --json`."
      );
      expect(route).toContain(
        "If the CLI reports a same-name/different-source collision or error, stop and report it."
      );
      expect(route).toContain(
        "The global marketplace list is optional diagnostics; its failure must not block this targeted flow."
      );
    }
    for (const route of chineseMarketplaceRoutes) {
      expect(route).toContain(
        "只有成功 JSON 针对该精确预期 URL 返回 `alreadyAdded` 为 `false` 或 `true` 时，才接受市场身份。"
      );
      expect(route).toContain(
        "如果 `alreadyAdded` 为 `true`，运行 `codex plugin marketplace upgrade fantasy-mouse-ui --json`。"
      );
      expect(route).toContain(
        "如果 CLI 报告同名不同来源冲突或错误，必须停止并报告。"
      );
      expect(route).toContain(
        "全局市场列表仅是可选诊断；其失败不得阻断此定向流程。"
      );
    }
  });

  it("documents optional support without packaging its QR image", () => {
    const readme = readFileSync(
      new URL("../../README.md", import.meta.url),
      "utf8"
    );
    const sponsorQr = new URL(
      "../../docs/assets/sponsor-qr.jpg",
      import.meta.url
    );

    expect(readme).toContain("## Support / 支持");
    expect(readme).toContain("欢迎请鼠鼠吃根小鱼干，纯自愿");
    expect(readme).toContain("docs/assets/sponsor-qr.jpg");
    expect(statSync(sponsorQr).isFile()).toBe(true);
  });
});
