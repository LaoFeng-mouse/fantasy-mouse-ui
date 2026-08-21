# Fantasy Mouse UI Design System

Status: Approved design

Date: 2026-08-21

Working product name: 幻想鼠 UI / Fantasy Mouse UI

## 1. Product definition

Fantasy Mouse UI is an agent-independent design system and local Web studio that turns one recognizable fantasy-character identity into editable, runnable, and visually verified software interfaces, websites, and PowerPoint presentations.

The product is inspired by the visual grammar of the Douyin “鼠鼠的幻想/耄耋的幻想” meme: an ordinary central character imagines exaggerated identities and achievements around itself. The referenced tutorial uses a grey cat head with narrowed eyes and a prominent human-like toothy smile, attached to a minimal white bean-shaped body. Variants preserve the face while replacing bodies, poses, props, partners, professions, and fantasy scenes.

Reference reviewed during design: `https://www.douyin.com/video/7639417258997197478`.

The reference is a visual-language study, not a distributable asset source. The public product ships an original character pack with independently created assets. Users may install private character packs, including their own pet, mascot, or licensed meme assets.

## 2. Goals

- Let Codex, Claude, Gemini, DeepSeek, and other Agents understand the same design intent through a model-neutral protocol.
- Preserve one strong character identity while producing many functional and fantasy variants.
- Recommend three coherent design directions from a project brief, with controls for refinement.
- Generate editable deliverables for Web, desktop-style software, and PowerPoint.
- Run and render outputs, inspect screenshots, repair visible problems, and provide QA evidence.
- Keep the core usable without MCP or a particular vendor's design skill.

## 3. Non-goals for the first release

- A cloud account system, team collaboration service, marketplace, or billing platform.
- A complete redesign of FlyingMouse Format. It remains a later full-scale reference implementation.
- Native UI renderers for every desktop framework. The first desktop sample uses a Web-based desktop shell.
- Public redistribution of unlicensed Douyin, meme, game, anime, or commercial character assets.
- Unlimited generated character forms without identity and quality checks.

## 4. First-release acceptance scope

The first release combines two approved directions:

1. A local Web design center for browsing, configuring, previewing, and exporting designs.
2. Three small but real reference deliverables:
   - one responsive website;
   - one runnable desktop-shell interface;
   - one editable `.pptx` presentation.

All three samples consume the same project recipe and character pack. Each sample must be rendered and visually checked.

## 5. Character model

### 5.1 Identity anchors

Every character pack declares features that remain recognizable across all states. The first public original pack uses these anchors:

- a grey rounded face;
- narrowed, slightly vacant eyes;
- a conspicuous toothy grin;
- a small white bean-shaped body;
- deliberately simple limbs and poses;
- an earnest but absurd dreamer temperament.

The exact source face from the reviewed meme is not bundled in the public pack. The original pack recreates the comic contrast without copying the source image.

### 5.2 Variable parts

The system may change:

- body pose and scale;
- clothes and profession;
- tools, props, vehicles, awards, and partners;
- background and thought-bubble content;
- expression intensity within the identity constraints;
- state animation;
- supporting copy.

The core face, silhouette cues, and temperament remain stable unless the user explicitly changes character packs.

### 5.3 Composition formula

Every result follows this model:

`character pack × persona mode × visual theme × product function × UI state × participation intensity`

- Character pack controls identity anchors and licensed assets.
- Persona mode controls voice and behavioral energy, not species or facial identity.
- Visual theme controls tokens, typography, line treatment, shadows, collage treatment, and backgrounds.
- Product function selects a fantasy metaphor.
- UI state selects pose, motion, copy, and feedback semantics.
- Participation intensity controls how much space and attention the character receives.

### 5.4 Persona modes

The first release contains six behavioral modes applied to the same core identity:

- earnest dreamer;
- diligent worker;
- calm technician;
- gentle companion;
- heroic achiever;
- sarcastic commentator.

### 5.5 Visual themes

The first release contains six themes:

- bold meme collage;
- cream scrapbook;
- clean professional;
- pixel game;
- cyber neon;
- Chinese poster.

The bold meme collage theme intentionally preserves some visible mismatch between photographic faces, simple drawn bodies, props, and backgrounds. It must remain legible and deliberate rather than appearing accidentally broken.

### 5.6 UI states

The first release defines twelve semantic states:

- idle;
- empty;
- input or upload;
- analyzing;
- processing;
- waiting;
- success;
- celebration;
- warning;
- failure;
- permission blocked;
- offline.

State meaning cannot depend on color alone. Each state has a pose, copy pattern, icon or shape cue, and accessible text alternative.

### 5.7 Fantasy narrative

The narrative engine maps real product functions to exaggerated roles. Examples:

- upload becomes a logistics captain;
- conversion becomes a factory chief engineer;
- analysis becomes a laboratory scientist;
- security becomes a guard;
- presentation becomes a business leader;
- success becomes a champion or award winner;
- error becomes a visibly collapsed fantasy that returns the character to reality.

The narrative arc is:

`ordinary situation → fantasy starts → task performance → triumph or comic return to reality`

### 5.8 Participation intensity

- Light: character appears in empty states, help, warnings, and completion moments.
- Standard: character accompanies key workflow states without obstructing primary actions.
- Immersive: character and fantasy narrative dominate creative pages, campaigns, and playful presentations.

Serious contexts reduce humor and participation intensity automatically. The primary task and critical safety information always outrank character performance.

## 6. User workflow

1. Input a project brief or import an existing source project.
2. Detect the current Agent's capabilities: code, image generation, browser automation, presentation generation, rendering, and filesystem access.
3. Recommend three complete directions, each containing character behavior, theme, fantasy metaphors, component treatment, and participation intensity.
4. Let the user accept a direction or edit individual dimensions.
5. Compile the selection into a model-neutral project recipe.
6. Render one or more target surfaces.
7. Run the deliverables, capture screenshots, and execute visual, accessibility, editability, and consistency checks.
8. Repair failures and rerender within a bounded retry loop.
9. Export editable sources, assets, the project recipe, preview images, and a QA report.

## 7. Local Web design center

The studio runs locally in a browser and does not own the protocol. It is one consumer and editor of the same files that Agents read.

The primary modules are:

- Project Brief: purpose, audience, functions, target surfaces, brand constraints, and source imports.
- Recommendations: three coherent proposals with reasons and tradeoffs.
- Character Lab: character pack, identity anchors, state poses, props, fantasy roles, and participation intensity.
- Theme Editor: design tokens, typography, line and collage treatments, spacing, and component styling.
- Multi-surface Preview: Web, desktop-shell, and slide previews driven by one recipe.
- Render and QA: execution status, screenshots, accessibility checks, visual findings, and repair history.
- Export: editable sources, assets, recipe, adapters, preview evidence, and handoff manifest.

## 8. Model-neutral protocol

Markdown explains intent and execution rules. JSON Schema validates machine-readable recipes and catalog packs. Neither format contains vendor-specific tool calls.

The canonical recipe is `mouse-ui-project.json`. It records:

- protocol version;
- character pack and identity anchors;
- persona mode and theme;
- target surfaces;
- product functions and UI states;
- fantasy-role mappings;
- participation intensity;
- accessibility requirements;
- asset provenance and publication permissions;
- renderer configuration;
- QA requirements and results.

Agent-specific skills are thin adapters. They translate available tools into protocol operations without redefining product semantics.

## 9. Capability negotiation

Before generation, an Agent records its capabilities. The pipeline branches explicitly:

- A fully capable Agent generates, runs, renders, inspects, and repairs.
- An Agent without image generation uses approved standard assets.
- An Agent without a target renderer creates a complete handoff recipe and names the missing operation.
- An Agent without browser or screenshot inspection cannot mark visual QA as passed.
- An Agent without presentation tooling cannot mark `.pptx` generation or editability as passed.

Capability limits appear in the final report. The system never promotes a partial result to complete.

## 10. Architecture

The first release uses one repository and a single domain context. Modules expose explicit interfaces and remain independently testable.

```text
protocol/       JSON Schema and model-neutral instructions
catalog/
  characters/  identity anchors, assets, provenance, and licensing
  themes/      design tokens and visual rules
  states/      semantic state definitions
  fantasies/   product-function to fantasy-role mappings
adapters/       generic, Codex, Claude, Gemini, and DeepSeek entrypoints
studio/         local React and TypeScript Web application
renderers/
  web/          responsive Web output
  desktop/      Web-based desktop-shell output
  pptx/         editable PowerPoint output
qa/             schema, accessibility, visual, and character-consistency checks
examples/       Web, desktop, and PowerPoint reference projects
```

The local studio uses React, TypeScript, and Vite. A local Node process provides filesystem access, renderer orchestration, and export packaging. The first PowerPoint renderer uses PptxGenJS to produce editable native slide elements; the bundled workspace runtime already provides this dependency.

## 11. Data flow

`Project brief → capability profile → three recommendations → user selection → validated recipe → target renderer → runtime output → QA evidence → repair loop → export package`

Each renderer consumes the validated recipe and returns an independent result. One failed surface does not erase successful surfaces. The final project status remains partial until every user-requested surface passes its required gates.

## 12. Asset strategy

The system uses a hybrid asset pipeline:

- reviewed standard assets for common states;
- dynamically generated assets for new fantasy roles;
- identity-anchor checks on every generated variant;
- deterministic fallback to standard assets when generation fails;
- provenance and publication-permission metadata on every asset.

Public export excludes assets whose rights are unknown or private-only. A private project may reference user-supplied assets while preserving that restriction in the recipe and export report.

## 13. Error handling

- Missing image capability: use standard assets or produce a handoff requirement.
- Character drift: retry with identity anchors, then fall back to a standard approved state asset.
- Missing or incompatible character pack: stop recipe compilation and identify the exact pack and protocol mismatch.
- Unclear rights: exclude the asset from public export and switch to the public original pack.
- Renderer failure: preserve the recipe, partial sources, logs, and independent status for every surface.
- Visual QA failure: repair clipping, overlap, hierarchy, contrast, state ambiguity, or character inconsistency, then rerender.
- Retry exhaustion: mark the affected surface failed and report the remaining findings.
- Agent limitation: emit a handoff manifest rather than a success claim.

## 14. Completion states

- Generated: source files or assets exist.
- Rendered: the target tool opened or rendered the deliverable successfully.
- Visually checked: screenshots were inspected against layout and character rules.
- Accepted: the deliverable is editable, usable, visually correct, and all required checks pass.
- Partial: at least one requested surface or gate remains incomplete.
- Failed: a required surface cannot be completed and has a retained diagnosis.

Only `Accepted` is a complete outcome.

## 15. Testing and QA

### 15.1 Protocol and catalog

- Validate every project recipe and catalog pack against JSON Schema.
- Verify protocol-version compatibility.
- Exercise persona, theme, state, fantasy-role, and participation constraints.
- Verify every public asset has provenance and publication permission.

### 15.2 Character consistency

- Compare generated variants with declared identity anchors.
- Reject missing face, silhouette, body, or temperament anchors.
- Verify state changes preserve identity while changing pose and props.
- Verify fallback assets replace rejected generated variants cleanly.

### 15.3 Web

- Run the output in a real browser.
- Test responsive breakpoints, keyboard navigation, focus, overflow, contrast, and primary actions.
- Capture screenshots for core and failure states.

### 15.4 Desktop shell

- Launch the packaged or development desktop sample.
- Exercise the primary workflow and terminal states.
- Capture screenshots at the real application dimensions.
- Verify character assets do not block window controls or primary actions.

### 15.5 PowerPoint

- Open and render the generated `.pptx`.
- Verify text, shapes, images, and charts remain editable where applicable.
- Check slide bounds, font fallback, contrast, and reading order.
- Render every slide to images and visually inspect them.

### 15.6 Cross-surface evidence

- Use the same recipe for all three first-release samples.
- Confirm identity anchors and state semantics remain recognizable across surfaces.
- Include screenshots, passed checks, failed checks, fallbacks, and unresolved limitations in the QA report.

## 16. Deliverable package

Each completed project exports:

- `mouse-ui-project.json`;
- human-readable design rationale;
- character and state assets allowed for the target distribution;
- design tokens and component rules;
- editable source files for requested surfaces;
- rendered previews and screenshots;
- QA report and repair history;
- Agent handoff manifest for any unfinished capability-dependent work.

## 17. Success criteria

The first release succeeds when:

- the local design center can create and edit a valid recipe;
- at least the generic, Codex, Claude, Gemini, and DeepSeek adapters point to the same protocol semantics;
- the studio recommends three coherent options from one brief;
- one recipe produces the three reference deliverables;
- all reference deliverables open, remain editable, and pass their visual gates;
- character identity is preserved across all required states;
- rights-restricted assets cannot leak into public exports;
- a capability-limited Agent produces an accurate handoff instead of a false completion claim.

## 18. Deferred extensions

- Optional MCP server for automated studio operations.
- Cloud collaboration and shared character-pack marketplace.
- Additional character packs, including user pets and brand mascots.
- Native renderer adapters for additional desktop and mobile frameworks.
- Full FlyingMouse Format redesign using the accepted protocol.
