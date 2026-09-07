# Fantasy Mouse UI open-source release design

> **Historical record:** This v0.1.0 design was implemented, but its blanket visual-asset redistribution assumptions were superseded by the packaged [`ASSET_PROVENANCE.md`](../../../plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md). Use current repository documentation for licensing and release guidance.

## Objective

Publish Fantasy Mouse UI as a genuinely installable open-source plugin rather than merely uploading the current private-local archive. The public release must include the user-authorized four visual authority images, source code, model adapters, installation metadata, an AI-executable deployment prompt, and verifiable release artifacts.

## Authorization and license

The user explicitly authorizes the four bundled mouse images for public release and redistribution with this project. The repository uses the MIT License and identifies the confirmed authenticated GitHub owner `LaoFeng-mouse` as the copyright holder.

The existing `private-reference-only`, `private-local`, and “do not publish” rules must be changed consistently. Public release must not leave contradictory rights metadata in manifests, verifier trust roots, tests, package names, Skill instructions, references, or documentation.

## Distribution architecture

The public GitHub repository will contain:

- the canonical plugin at `plugins/fantasy-mouse-ui/`;
- all four approved visual-grounding images;
- the repository test and deterministic packaging harness;
- an MIT `LICENSE` at repository root;
- a repository marketplace manifest at `.agents/plugins/marketplace.json`;
- user-facing installation documentation and an AI deployment prompt;
- a GitHub Release named `v0.1.0` with `fantasy-mouse-ui.zip` attached.

The repository history published to GitHub will be the current `main` history after the open-source release commit. The rejected dirty legacy worktree and its branch are excluded because only `main` is pushed.

## Rights and package contract

The manifest publication scope for the four visual assets becomes `open-source-distributable`. The verifier continues to pin exact paths, hashes, dimensions, authority roles, and hand anatomy; changing publication rights does not weaken character or filesystem security.

The generated archive becomes:

```text
dist/plugin/fantasy-mouse-ui.zip
```

The plugin archive will include a copy of the MIT license so that the downloaded artifact carries its license independently of the GitHub page. The deterministic packager allowlist and tests will be updated for that additional plugin file. Unknown files, links, unreliable identity, mutation, and path traversal remain fail-closed.

## Codex marketplace

The repository marketplace name will be `fantasy-mouse-ui`. Its entry points to `./plugins/fantasy-mouse-ui`, uses category `Design`, installation policy `AVAILABLE`, and authentication policy `ON_INSTALL`.

The documented Codex deployment path is:

```powershell
codex plugin marketplace add https://github.com/LaoFeng-mouse/fantasy-mouse-ui
codex plugin add fantasy-mouse-ui@fantasy-mouse-ui
```

The exact CLI syntax must be verified against the installed Codex CLI before publication. Documentation will use only commands proven by the live CLI.

## Cross-agent installation

Claude, Gemini, and DeepSeek use their existing adapters. Other file-capable and image-capable Agents use `adapters/generic/AGENT.md`. Installers must preserve the complete plugin directory; copying only `SKILL.md` is invalid because its assets, protocols, references, and scripts are required relative dependencies.

An `INSTALL_WITH_AI.md` document will contain:

- a short manual installation section;
- Codex marketplace installation;
- Release ZIP installation;
- host routing for Claude, Gemini, DeepSeek, and generic Agents;
- a Chinese copy-paste prompt telling an AI to detect its host, install the complete plugin, run bundle verification, report the real installation directory, and state whether a new session is required;
- an English equivalent for wider GitHub use.

The AI prompt must forbid unverified success claims and require the exact bundle result `{"ok":true,"assets":4}`.

## Documentation changes

`README.md`, `AGENTS.md`, `CONTEXT.md`, architecture, integration guide, runbook, handoff, canonical Skill, visual-grounding reference, and QA reference will be reconciled with the public MIT release. Historical private-local wording will be removed from active instructions.

The README will lead with what the plugin does, show GitHub installation commands, link to `INSTALL_WITH_AI.md`, document supported Agents, and explain that the mouse identity remains fixed while product UI style is derived independently.

## Optional support presentation

Follow the existing FlyingMouse Format README pattern: place a simple bilingual `Support / 支持` section near the end of the README, use one voluntary sentence, and show the user-provided WeChat payment image directly below it. Do not add popups, feature gates, repeated prompts, or sponsorship language inside generated UI work.

Use this wording:

```markdown
## Support / 支持

Fantasy Mouse UI is free and open source. If it helped you, you can buy Mouse a dried fish — completely optional. / Fantasy Mouse UI 免费开源。如果它帮到了你，欢迎请鼠鼠吃根小鱼干，纯自愿。

![WeChat payment QR / 微信收款码](docs/assets/sponsor-qr.jpg)
```

Store the newly supplied image at `docs/assets/sponsor-qr.jpg`. It is repository documentation media, not visual-grounding authority, and it must stay outside the plugin ZIP and asset manifest.

## Implementation sequence

1. Add failing tests for public rights metadata, archive filename, embedded license, marketplace manifest, and AI installation prompt.
2. Update rights metadata, verifier trust root, Skill/references, documentation, packager, and allowlist until the focused tests pass.
3. Add the approved support image and README section without including it in the plugin package.
4. Run full tests, typecheck, bundle verification, official Skill/plugin validators, deterministic double packaging, archive inspection, and diff checks.
5. Update the already installed personal plugin through the supported cachebuster/reinstall flow and validate the cached installation.
6. Re-authenticate GitHub CLI if required.
7. Create the public GitHub repository, add the remote, push only `main`, create tag/Release `v0.1.0`, and attach the verified archive.
8. Verify repository visibility, default branch, tag, release metadata, downloadable asset name, size, and SHA-256 from GitHub rather than relying only on local state.

## Error handling and safety

- If GitHub authentication remains invalid, stop before repository creation and report the exact login boundary.
- If the desired repository already exists, inspect ownership and visibility before pushing; never overwrite an unrelated repository.
- If marketplace commands differ from the live CLI, use CLI help as authority and update documentation/tests before publishing.
- If any asset hash or package input changes unexpectedly, stop publication and preserve the last verified archive.
- Never push the dirty `codex/fantasy-mouse` branch or its worktree.
- A failed release upload does not count as publication; inspect GitHub release state before retrying.

## Acceptance criteria

The work is complete only when:

- active source and documentation consistently describe an MIT public release;
- all repository gates and official validators pass;
- two clean package runs have identical SHA-256 values;
- the ZIP contains the complete plugin and its license, with no repository debris;
- the public GitHub repository exists under the authenticated owner with `main` as its default branch;
- the `v0.1.0` Release exists and its downloadable ZIP hash matches the verified local archive;
- the repository contains a tested AI deployment prompt and verified installation commands;
- the README contains the approved voluntary support wording and newly supplied WeChat image, while the plugin ZIP does not contain that image;
- a fresh local Codex installation can load the released plugin, with any new-session boundary stated honestly.
