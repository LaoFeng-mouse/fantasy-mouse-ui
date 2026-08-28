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

Keep these character-base anchors stable: face, human-like teeth, tiny horizontal ears, round grey head, white bean body, and earnest absurd fantasy temperament. Choose only permitted variable parts: roles, clothes, props, pose, expression intensity, background, bubble, and motion. Tie every variation to a real action or state, not to decoration.

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

If the user already selected a direction, implement it without reopening selection. Otherwise propose exactly three coherent directions. For each, specify:

- information hierarchy and primary journey;
- theme and participation intensity;
- workflow-state role/prop/pose mapping;
- optional bubble rationale;
- component, typography, motion, and feedback treatment;
- usability, accessibility, responsive/editability, and implementation tradeoffs.

Do not present three palettes or three isolated mascot costumes as directions.

## Implement within the target product

Inspect and reuse the closest existing flows, routes, components, tokens, icon library, and source patterns. Preserve working architecture and user data semantics. When no project exists, create surface-appropriate editable source only after deriving the product-specific direction from the workflow brief and product-style table. Do not copy a packaged starter or fixed template.

Implement the primary interaction path and every applicable loading, empty, error, blocked, success, and recovery state. Give visible controls real behavior, realistic local data, keyboard access, visible focus, accessible names, status announcements, sufficient contrast, and reduced-motion behavior. Preserve usability and accessibility without weakening the character system or target workflow truth.
