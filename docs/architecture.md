# Fantasy Mouse UI architecture

## Boundary

The repository contains one reusable plugin, its verification/packaging harness, and the public examples/ benchmark portfolio of four accepted product-specific cases. It does not ship a general product Studio or reusable surface renderer. The benchmark cases and demo media are repository evidence outside the exact 24-file install ZIP; the plugin still instructs the invoking Agent to work inside the user's real target project or create surface-appropriate editable source when no project exists.

## Authority model

```text
canonical-protagonist.png ── identity authority
processing-action-hands.png ── action-anatomy authority
processing compositions ── single-example composition observation
target product + users + platform + brand + accessibility ── UI authority
```

These channels are deliberately independent. No image or plugin metadata may supply business semantics, source-brand tokens, or a universal UI style.

The verifier embeds the expected asset paths, hashes, dimensions, publication scopes, authority flags, hand rule, exclusions, and style policy as its trust root. Changing both a manifest and an image cannot silently redefine authority.

## Execution flow

```text
verify bundle
  → resolve Fast, Standard, or Strict
  → view four images in authority order
  → inspect target source
  → validate workflow brief
  → derive character role and product UI independently
  → select direction
  → modify/create editable target source
  → implement real behavior and states
  → run/render and compare
  → repair
  → export evidence and handoff
```

## Protocols

`config/execution-modes.json` defines Fast, Standard, and Strict profiles, with Standard as the default. `protocol/execution-modes.schema.json` defines its closed shape, and `scripts/resolve-mode.mjs` validates and resolves the default, an explicit request, or a strict-trigger upgrade before invocation.

`workflow-brief.schema.json` describes product truth: users, entities, screens, actions, transitions, states, surfaces, constraints, and primary journey.

`mouse-ui-project.schema.json` describes the selected design recipe. Protocol v1 keeps the exact legacy default-pose anchors. Protocol v2 uses character-family anchors and adds face asset IDs, body variants, source/crop metadata, layer order, component states, product-style evidence, and interruptible motion contracts. Each state binds a real face/body choice alongside role, expression, pose, hand mode, props, bubble policy, and copy. Persona, theme, states, and surfaces remain project-specific. `validate-workflow.mjs --recipe` validates both recipe versions and v2 cross-references; this is metadata validation, not visual acceptance.

Both protocols reject unknown structural fields while keeping domain state and surface identifiers open.

## Model neutrality

The canonical Skill and references are the semantic source. Codex loads the canonical Skill through the plugin manifest; the Claude, Gemini, DeepSeek, and generic adapters only map host capabilities to that same contract. A host without image viewing cannot make visual claims; a host without a target renderer cannot mark that surface rendered or accepted.

## Packaging and security

The packager accepts the exact 24-file plugin inventory, including `ASSET_PROVENANCE.md`, `config/execution-modes.json`, `protocol/execution-modes.schema.json`, `scripts/resolve-mode.mjs`, and the plugin MIT License. Unknown files—including `.env`, credentials, backups, examples, repository docs, tests, support images, caches, or scratch outputs—fail packaging instead of being silently included.

For every source file it:

- rejects symlinks, non-regular files, and multiple hard links;
- requires nonzero BigInt device/inode identity;
- revalidates identity, size, timestamps, and link count through the open handle before and after reading;
- bounds total input size;
- emits deterministic, stored ZIP entries with fixed metadata;
- preserves the last valid archive when a new package attempt fails.

The visual bundle verifier rejects path escape, symlink chains, duplicate paths, authority changes, hash changes, and dimension changes. Errors are bounded JSON and do not expose host paths.

## Distribution boundary

The MIT License covers the software code. The four bundled visual assets have a separately disclosed, unverified internet-derived origin and unconfirmed underlying authorship/license; see [Asset provenance](../plugins/fantasy-mouse-ui/ASSET_PROVENANCE.md). Bundling does not assert that unknown underlying material is MIT-licensed, copyright-free, or public domain. Each image remains limited to the identity, action-anatomy, or single-example composition scope pinned by the manifest and verifier.

The local release archive build is `dist/plugin/fantasy-mouse-ui.zip`; repository documentation, examples, tests, and the optional support QR are outside its exact 24-entry allowlist. A complete installation copies all 24 entries, then runs `scripts/verify-bundle.mjs`; mode preflight runs `scripts/resolve-mode.mjs` and defaults to Standard.

## Acceptance model

Repository gates prove the plugin contract and package. Each future invocation has separate generated, tested, run, rendered, visually checked, and accepted states. Only the evidence appropriate to the actual target surface can advance those gates.

The root `examples/` validator applies that same acceptance model to Signal Harbor, Fieldnote Festival, Grid Forward 2030, and Archive Lantern. It verifies artifact containment, PNG credibility, source/output parity, Strict mode resolution, and complete evidence before reporting four accepted cases.

Remote installation uses the repository marketplace or Release ZIP documented in [Install with AI](../INSTALL_WITH_AI.md). Source verification, installed-cache verification, and actual loading in a newly started task/session are separate layers; none can be inferred from another.

