# Fantasy Mouse UI v0.2.0 design

## Objective

Release Fantasy Mouse UI v0.2.0 as an easier-to-understand, faster-to-try, evidence-backed model-neutral UI design plugin. The release must preserve the existing character-grounding and product-style-independence contracts while adding tiered execution modes, four real benchmark cases, a result-led README, a short demonstration GIF, a concise Quick Start, and truthful asset provenance.

The release is complete only when the public GitHub tag, Release asset, repository page, installation route, and new-task plugin loading have all been verified. Local commits and passing tests alone are not release completion.

## Scope

v0.2.0 includes seven coordinated outcomes:

1. Put three to six real generated results at the top of the README, covering SaaS, website, presentation, and desktop software.
2. Produce a silent, naturally looping 15–30 second demonstration GIF.
3. Make the README first screen answer only what the plugin is, what it generates, and how to install it.
4. Add one-command Quick Start guidance and three bilingual example prompts.
5. Add machine-verifiable Fast, Standard, and Strict execution modes.
6. Add a repository-level `examples/` benchmark with prompts, briefs, editable source, real outputs, screenshots, role/style derivations, and QA evidence.
7. Add `ASSET_PROVENANCE.md` and align all license wording with the disclosed source history.

The release does not add a permanent Studio application, a fixed frontend template, a universal visual theme, or bundled renderers. Example dependencies and generated build caches are not shipped in the plugin ZIP.

## Release architecture

The work is divided into three independently testable subsystems:

- presentation: README first screen, result gallery, GIF, Quick Start, and case navigation;
- execution: one canonical Skill with shared invariants and three mode profiles;
- evidence: four Strict benchmark cases, provenance, QA records, packaging, installation, and public-release verification.

The implementation order is evidence-first:

1. implement and test execution modes;
2. generate and strictly validate the four benchmark cases;
3. derive README images and the GIF from those real results;
4. reconcile provenance and licensing statements;
5. run local, installed, and public-release verification.

This order prevents the marketing layer from claiming outputs that do not yet exist or have not been run and rendered.

## Execution modes

### Shared invariants

Every mode must:

- state the selected mode and a short reason before design work;
- verify the visual bundle and use real image viewing when character authority is required;
- inspect the real target source or supplied requirements;
- keep character continuity independent from product UI styling;
- produce editable output appropriate to the requested surface;
- avoid fabricated run, render, visual-check, or acceptance claims;
- preserve the one-hand-pair anatomy contract;
- escalate when the task exceeds the selected mode's safety or evidence boundary.

The default is Standard. A user may explicitly select any mode. An Agent may upgrade a mode with an explanation but may not silently downgrade it.

### Fast

Fast is for one-screen, low-risk, bounded concept or revision work. It requires source inspection, applicable visual grounding, editable output, a real open/render check, and focused visual/hand QA. It may omit three-direction exploration, a complete state matrix, a formal benchmark evidence package, and a long handoff.

Fast reduces decision and reporting overhead. It does not waive source truth, character authority, real output, or honest evidence.

### Standard

Standard is the default for ordinary product design. It adds a workflow brief, independent character-role and product-style derivation, the primary journey, applicable key states, responsive behavior, baseline accessibility, screenshots, and concise comparison evidence.

Standard may omit exhaustive permission/threat states and the full formal release evidence package when they are not material to the product.

### Strict

Strict is mandatory for public benchmarks, multi-page products, permissions, financial or medical workflows, destructive operations, and formal releases. It retains the complete twelve-step flow, protocol validation, every applicable state, keyboard and contrast checks, recovery paths, anti-template comparison, same-context visual comparison, provenance, and a full evidence handoff.

Strict gates may be reported as partial or unavailable when capability is missing, but they may not be silently skipped.

### Configuration and validation

The plugin will add:

```text
config/execution-modes.json
protocol/execution-modes.schema.json
```

Tests will validate profile structure, default selection, explicit override, upgrade triggers, downgrade refusal, shared invariants, canonical Skill wording, and adapter consistency. The profiles are behavioral contracts, not labels that all execute the same workflow.

## Benchmark portfolio

All four cases are newly generated for v0.2.0 and use Strict mode. They must differ in layout skeleton, density, palette, material, typography, component model, character placement, and interaction arrangement for product-specific reasons.

### Signal Harbor — SaaS dashboard

A dark, information-dense incident-operations dashboard. The primary journey is detecting, triaging, assigning, and resolving an incident. The mouse acts as a calm dispatcher and uses exactly one action-hand pair when interacting with operational controls. Serious status and permission copy remains literal.

### Fieldnote Festival — website

An organic editorial website for a regional botany festival. The primary journey is discovering the program, comparing sessions, and building a visit plan. The mouse participates as a field guide within the story rather than occupying permanent interface chrome.

### Grid Forward 2030 — presentation

An editable clean-energy strategy deck with a restrained Swiss/data-driven visual system. The mouse acts as a presenter only where it improves hierarchy and explanation. The deck must open and render correctly in a real presentation tool.

### Archive Lantern — desktop software

A Windows-native local research organizer. The primary journey is importing, indexing, tagging, finding, and recovering research material. The mouse acts as a librarian across empty, indexing, success, error, and recovery states. This case supplies the demonstration GIF.

### Example contract

Each `examples/<case>/` directory contains:

```text
README.md
prompt.md
workflow-brief.json
mode.json
character-role.md
product-style.md
source/
output/
screenshots/
evidence/qa.json
evidence/comparison.png
```

`source/` contains editable source. `output/` contains the actual usable or rendered artifact. `screenshots/` contains intended-viewport evidence. The evidence record distinguishes generated, tested, run, rendered, visually checked, and accepted states.

The root-level `examples/` tree is part of the public repository benchmark but is excluded from the lightweight plugin ZIP. Dependencies, caches, browser profiles, `node_modules`, and unrelated build products are excluded from source control.

## README information architecture

The README is English-first with Chinese Quick Start and example prompts.

Its order is:

1. product name, one-sentence value proposition, and installation command;
2. a four-result Outcome Wall showing the real SaaS, website, presentation, and desktop outputs;
3. the Archive Lantern demonstration GIF;
4. one-command Quick Start and three bilingual prompts;
5. the Fast, Standard, and Strict comparison;
6. links to the four complete benchmark cases;
7. working principles and quality guarantees;
8. provenance, licensing, architecture, packaging, and completion boundaries.

The first common GitHub desktop viewport must answer:

- what is this;
- what can it generate;
- how do I install it.

Architecture, hashes, protocols, packaging inventory, and operational boundaries move below the introductory and usage content.

### Quick Start prompts

The three prompts demonstrate real behavioral differences:

- Fast: redesign a low-risk website first screen;
- Standard: design a desktop research-organizing application with real states;
- Strict: design a SaaS dashboard with permissions, failures, recovery, accessibility, and complete evidence.

The documented installation command must be revalidated against the released CLI and remote marketplace before publication.

## Demonstration GIF

The selected direction is a 22-second silent split-screen recording based on Archive Lantern:

- 0–3 seconds: the request is typed on the left;
- 3–6 seconds: Strict mode and the short workflow brief appear;
- 6–12 seconds: the product-specific layout takes shape on the right;
- 12–18 seconds: the mouse role and meaningful workflow states appear;
- 18–22 seconds: the complete working result is shown and returns naturally to the opening frame.

The Prompt remains readable while the result develops. The GIF must be understandable without audio and legible at README display size. Frame rate, dimensions, and palette may be optimized for repository size, while a higher-quality MP4 master is retained for reuse. A static montage may not be presented as an actual recorded GIF.

## Asset provenance and licensing

The plugin will add a packaged `ASSET_PROVENANCE.md` so provenance travels with the four visual files.

The document must state substantially:

> The character assets originate from internet meme material and were personally collaged, drawn, and produced by the project maintainer. The original authors and license status of the underlying internet material have not been confirmed.

It must also distinguish description from permission: the statement records the known source history and must not claim that unknown third-party material has no copyright or that provenance alone grants reuse rights.

The repository will describe the software code as MIT-licensed. Active documentation and package notices must not represent the underlying unverified internet material as confirmed original MIT-licensed third-party content. A contact and takedown route will be documented for a rights holder.

This specification records a disclosure and release policy; it is not a legal opinion or a substitute for legal review.

## Tests and failure handling

### Repository and mode tests

Tests must cover:

- execution-mode schema and configuration;
- default Standard selection;
- explicit mode selection;
- required Strict escalation;
- rejection of silent downgrade;
- shared invariant preservation;
- canonical Skill and adapter consistency;
- example directory and evidence manifests;
- README links, image paths, prompts, and mode names;
- packaged provenance and exact plugin inventory;
- deterministic packaging after the allowlist changes.

### Visual and functional evidence

Each case must provide editable source, real output, screenshots, and QA evidence. Web, SaaS, and desktop cases must exercise their primary interactions. The presentation must be opened and inspected in a real presentation application.

The four outputs must pass cross-case anti-template comparison. Three or more unjustified repeated dimensions require repair before they can appear in the README.

### Failure rules

- Missing image viewing blocks visual completion claims.
- Missing browser, desktop runtime, or presentation renderer leaves that case partial.
- Bundle, schema, test, typecheck, or deterministic-package failure blocks release.
- A failed GIF recording cannot be replaced by a static image represented as a GIF.
- Unknown provenance must be disclosed without inventing an author or license.
- A successful GitHub upload without remote download, installation, and new-task loading verification is not a complete release.

## Acceptance criteria

v0.2.0 is accepted only when:

- local tests, typecheck, validators, and deterministic packaging pass;
- all four Strict examples are editable, run or opened in their real target, rendered, visually checked, and accepted;
- README images come from the accepted outputs;
- the 22-second GIF plays, loops, and remains readable on the actual GitHub page;
- Quick Start commands and links work against the public release;
- provenance and license wording are internally consistent and packaged with the visual assets;
- local and remote Release ZIP inventories and SHA-256 values match;
- installation from the public GitHub Release or repository marketplace succeeds;
- a newly started task loads the v0.2.0 Skill;
- the public tag, Release, downloadable asset, and repository documentation are reachable.

Any missing external renderer, installation layer, publication step, or owner acceptance remains an explicitly open gate rather than being inferred from source code or tests.
