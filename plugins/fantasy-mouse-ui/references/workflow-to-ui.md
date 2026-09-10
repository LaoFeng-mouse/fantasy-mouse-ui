# Workflow-to-interface translation

Use this reference after visual grounding and target-source inspection. Let the target software define what the design must do; let the character define how that truth is expressed.

## Build a valid workflow brief

Record all fields below before choosing a layout:

| Field | Required evidence |
| --- | --- |
| purpose | The real outcome and why it matters |
| users | Primary and affected user roles |
| entities | Objects users view, create, change, or decide on |
| screens | Required views and the purpose of each |
| actions | Primary, secondary, destructive, and recovery operations |
| state transitions | Source state, trigger, destination, validation, and reversibility |
| constraints | Permissions, validation, privacy, safety, platform, brand, and data limits |
| surfaces | Web, desktop, mobile, slide, or other editable output |

Add the information hierarchy, primary journey, realistic data needs, loading conditions, empty conditions, errors, blocked/permission states, success, and recovery. Resolve material ambiguity from the source or user; do not fill gaps from the bundled compositions.

## Character-role translation table

Map each real function/state to stable identity evidence, role, clothes, props, pose, expression intensity, hand mode, background, and optional bubble.

Keep the approved character family, photographic face texture, hand-drawn body language, and earnest absurd fantasy temperament recognizable. Select an approved expression face and body build using `visual-grounding.md`; teeth, eye shape, head color, and the bean silhouette are expression/default traits rather than universal requirements. Tie each chosen face, build, role, outfit, prop, pose, and motion to the target state.

Use `character base -> variable parts -> visual theme -> function/state -> whole-interface translation` to validate character participation in the target workflow truth. Do not use this character chain to derive the independent product UI system.

| Workflow function/state | User truth | Stable identity evidence | Role | Clothes | Props | Pose | Expression intensity | Hand mode | Background | Optional bubble |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| One real state per row | What happened and what the user must know or do | Canonical anchors preserved in this state | Workflow-specific job | State-relevant clothing | Action-relevant objects | Body action tied to the state | Restrained to intense | Default clasped or exactly one action-hand pair | Only when the workflow benefits | Purpose or none |

Do not reuse example roles automatically. Derive each role from the current workflow. Keep serious, destructive, permission, financial, medical, legal, and authoritative outcomes literal even when low-risk feedback is playful.

## Product-style derivation table

Map target-product evidence to surface/platform, hierarchy, navigation, layout, component model, palette, typography, density, materials, border/radius/shadow treatment, motion, feedback, accessibility, and responsive behavior. Do not cite bundled character or composition images as evidence for this table.

| Target-product evidence | Surface/platform | Hierarchy | Navigation | Layout | Component model | Palette | Typography | Density | Materials | Border/radius/shadow treatment | Motion | Feedback | Accessibility | Responsive behavior |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Product, user, workflow, source-brand, or accessibility evidence | Intended delivery surface and platform conventions | Information priority | Wayfinding model | Product-specific arrangement | Product-specific controls and content structures | Semantic and brand color rationale | Readability and brand rationale | Task-frequency and information-density rationale | Product-appropriate surfaces | Product-appropriate edge and elevation system | State-purpose and reduced-motion rationale | Status and recovery model | Focus, contrast, names, targets, and assistive behavior | Reflow, resizing, and overflow rules |

## Translate the whole interface

Derive whole-interface coherence from the deliberate product-style rationale plus meaningful character participation, not by repeating the processing sample's layout, palette, typography, materials, borders, shadows, components, title treatment, or character placement:

- Use the product-style derivation table to connect hierarchy, navigation, layout, components, palette, typography, density, materials, borders, elevation, motion, feedback, accessibility, and responsive behavior.
- Use the character-role translation table to connect workflow-specific roles, props, poses, expressions, hand modes, backgrounds, bubbles, headings, progress, empty states, and state feedback.
- Keep the photographic-face and drawn-body contrast in real layered character assets without making that asset treatment the interface's layout or material system.
- Carry the earnest absurd temperament through restrained low-risk participation while keeping instructions, warnings, permissions, and results precise.

Ensure the layout, copy tone, tokens, component shapes, motion, status feedback, and interaction metaphors remain related even if the character image is temporarily hidden. A correct character pasted into an unjustified or copied product template has not translated the whole interface.

## Select a direction

If the user already selected a direction, implement it without reopening selection. Otherwise propose exactly three coherent directions when a material design choice remains open. Bounded fixes, plugin maintenance, and already-authorized improvements continue from the existing or accepted direction. For each, specify:

- information hierarchy and primary journey;
- theme and participation intensity;
- workflow-state role/prop/pose mapping;
- optional bubble rationale;
- component, typography, motion, and feedback treatment;
- usability, accessibility, responsive/editability, and implementation tradeoffs.

Do not present three palettes or three isolated mascot costumes as directions.

## Components with observable feedback

For interactive products, define the primary control family and reuse its tokens within that product. Record default, hover, pressed, focus-visible, disabled, loading, success, and error behavior where applicable. Each control keeps an accessible name and a predictable layout while labels or icons change.

- Buttons: give primary, secondary, and destructive actions a clear hierarchy. Press feedback starts promptly; asynchronous work enters a distinct pending state and prevents duplicate submission. Provide cancellation only when the operation supports it. An unavailable action explains what is needed where useful.
- Inputs: labels remain visible, validation explains the repair near its field, entered data survives recoverable errors, and keyboard focus moves only for a real navigation/dialog/validation need.
- Dialogs/popovers: define opening trigger, initial focus, keyboard dismissal appropriate to risk, outside-click policy, focus containment for modals, and focus return. Avoid hiding a focused control when a mascot appears.
- Progress and notifications: real percentages require real measurable progress. Unknown work uses an indeterminate indicator. Completion feedback provides the actual next action and stays readable without the character.
- Layout: derive a spacing/type hierarchy from task density, use consistent alignment, make long labels and localization reflow, and define compact layouts at actual content breakpoints. Mascot space contracts or disappears before important controls do.

Treat these as behavior decisions, not a universal palette/radius/material template. Audit the existing control implementation first and preserve working product conventions.

## Motion tied to state

Specify trigger, animated property, duration, easing, interruption/cancellation behavior, repetition limit, and reduced-motion fallback. As starting values to tune in the actual target, use roughly 100–160 ms for hover/press and 180–280 ms for small reveals. A one-off character reaction can last longer when it does not delay the next action. These are design defaults, not compliance claims or mandatory timing tokens.

Use a single source of state for the button, literal status, selected face/body, and character reaction. A successful timer or animation is not evidence that the underlying operation succeeded. Discard stale responses after cancellation, retry, or navigation. Keep repeat clicks and rapid state changes coherent.

Prefer transform and opacity on bounded layers where the platform supports them; retain image artboard dimensions and avoid moving hit targets. Keep frequent actions quiet, stop loops when their state ends or surface is hidden, and clean up listeners/timers. Under reduced motion use immediate state changes or brief fades, preserve all status information, and omit shake/bounce/particle effects. Provide a quiet presentation for dense or long sessions; it should retain the same controls and state semantics.

For static decks/documents, express the same hierarchy with static states and annotations. A motion specification is not an implemented animation.

## UI-only improvements and learning from libraries

When the user asks to improve UI and motion while keeping the core character, freeze the active raster files and their source/crop/attachment metadata. Record or compare hashes when practical. Keep paused face/body work paused. A UI improvement does not require new character assets or a modular recipe migration. Motion may fade or uniformly transform a complete existing image container; it must not redraw, distort or replace anatomy.

Start with the existing primary flow and a fresh rendered baseline. Identify concrete friction: unreadable supporting text, competing actions, excess explanation, unclear selection, missing focus, long labels, unstable hit targets, inaccessible overlays, missing failure recovery or unrelated motion. Use the user's existing approved design as the starting point. Move provenance and implementation detail into secondary help when they are not needed to make a product decision.

Borrow behavior principles from available design skills and primary documentation, not an unrelated product's complete visual template. Check the current stack before adding a dependency. For example: Product Design's capture-and-inspect method; Figma motion guidance on separating static layout transforms from animated inner layers; [Carbon's productive and expressive motion](https://carbondesignsystem.com/elements/motion/overview/); [Motion's reduced-motion guidance](https://motion.dev/docs/react-accessibility); and [Radix Dialog's keyboard/focus behavior](https://www.radix-ui.com/primitives/docs/components/dialog). These are technique references, not mandatory tool invocations, installations, frameworks or universal styling. Verify current documentation before applying a library API. Prefer native CSS/Web Animations and dialogs in an existing small vanilla page; reuse the established animation/component library in a framework application.

Separate frequent functional feedback from occasional expressive feedback. Hover, press, selection and small reveals should respond promptly. Stronger movement belongs to a user-triggered preview or a meaningful event, not every click. Define a small named timing/easing set in code instead of copying many unrelated animation literals. Keep click targets stationary; animate their inner content or visual state. Keep static centering and responsive layout on an outer wrapper so animated transforms do not replace them.

Image/content switching must wait for the next resource to be ready, retain the current valid result during loading, and provide a retry on failure. Use a revision/request token so rapid selection, cancellation or navigation cannot commit obsolete content. A fade/entrance timeline may be interrupted at any point and must return to a valid resting state without stale success text. A preview progress indicator measures its real timeline only; it does not imply a business task succeeded.

For overlays, implement accessible title/description, initial focus, focus containment, Escape dismissal, a deliberate backdrop policy and focus return. For notifications and export, describe the real outcome: generating a file or starting a download does not prove it reached disk. Keep a retry/download action available where useful. Browser storage being unavailable must not break the primary controls.

Apply reduced motion across selection, playback, hover, overlays and notifications, and respond to preference changes while animations are running. Stop active effects when the page is hidden or a related operation ends. Preserve literal state and all controls. Reuse a complete approved character without implying face/body decomposition or new artwork acceptance.

## Recipe v2 bindings

Use `protocol/mouse-ui-project.schema.json` protocolVersion 2 for replaceable faces or variable builds. Keep project-specific `states` and `surfaces`. Record `character` face assets/body variants/layer order, `components`, `motion`, and `productStyle`; state entries bind `faceAssetId` and `bodyVariantId`. Run `node scripts/validate-workflow.mjs --recipe <recipe.json>` to check the schema and cross-references. The command does not inspect image contents, measure contrast, or certify UI behavior. Legacy v1 recipes remain readable with their default-pose anchors; migrate explicitly when adopting modular variants.

## Implement within the target product

Inspect and reuse the closest existing flows, routes, components, tokens, icon library, and source patterns. Preserve working architecture and user data semantics. When no project exists, create surface-appropriate editable source only after deriving the product-specific direction from the workflow brief and product-style table. Do not copy a packaged starter or fixed template.

Implement the primary interaction path and every applicable loading, empty, error, blocked, success, and recovery state. Give visible controls real behavior, realistic local data, keyboard access, visible focus, accessible names, status announcements, sufficient contrast, and reduced-motion behavior. Preserve usability and accessibility without weakening the character system or target workflow truth.
