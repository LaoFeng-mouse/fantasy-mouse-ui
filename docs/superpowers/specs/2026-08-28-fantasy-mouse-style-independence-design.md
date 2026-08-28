# Fantasy Mouse Style Independence Design

Status: Approved direction, pending written-spec review

Date: 2026-08-28

## 1. Problem

The first cross-workflow samples preserved the character successfully but over-reused the processing composition's paper collage, thick black borders, yellow/green accents, three-column layout, taped labels, and right-side mouse panel. This made unrelated products look like reskins of one template.

That behavior is incorrect. The visual-grounding bundle establishes the Fantasy Mouse character and demonstrates one possible composition. It does not establish a universal interface theme.

## 2. Design principle

The plugin separates two independent systems:

1. **Character continuity** preserves the protagonist.
2. **Product design derivation** creates the interface from the target workflow, users, platform, brand context, information density, and emotional tone.

The character may influence the interface's personality, but it may not force one palette, material, layout, typography, component family, or decorative treatment onto every product.

## 3. Fixed character contract

The following remain fixed across outputs:

- the canonical grey face, tiny horizontal ears, narrowed eyes, and human-like grin;
- the compact white sack body and defining silhouette;
- the intentionally awkward meme contrast between the photographic face and drawn body;
- the earnest, absurd dreamer temperament;
- the hand-mode contract: idle uses the chest V/U clasp only; action mode removes it and shows exactly one coherent action-hand pair.

These anchors identify the protagonist. They are not a UI theme.

## 4. Workflow-derived character variables

Every output must first translate the target workflow into a role table:

| Product question | Character derivative |
| --- | --- |
| Who is the user in this workflow? | profession or situational role |
| What is the primary action? | pose and hand contact |
| What object represents that action? | tool or prop |
| What does success mean? | expression, posture, optional fantasy content |
| What does failure or waiting mean? | alternate pose or canonical idle recovery state |

Clothing, tools, props, pose, expression intensity, and optional fantasy bubbles are therefore variable. They must be specific to the workflow and cannot be copied from another sample merely because an asset already exists.

## 5. Independent UI derivation

Before choosing UI styling, the Agent must produce a separate product-style rationale covering:

- target surface and platform conventions;
- user role and task frequency;
- information hierarchy and density;
- emotional tone and trust requirements;
- brand or source-product context when supplied;
- color semantics required by the workflow;
- typography, spacing, materials, borders, radius, shadows, imagery, and motion;
- accessibility and responsive behavior.

The UI system must be selected from that rationale. Character references have zero authority over these choices unless the target product explicitly calls for the same handmade collage style.

## 6. Composition-reference authority

The two processing compositions remain useful only for studying general relationships such as:

- a character can participate in a workflow instead of being pasted on top;
- fantasy content can support, rather than obscure, the primary task;
- states can change the character's role and participation.

They have zero authority over universal layout, palette, texture, border treatment, card style, title treatment, spacing, typography, window chrome, or character placement. Their paper collage, green/yellow palette, taped labels, thick outlines, three-column structure, and right-side character panel are examples, not defaults.

## 7. Anti-template gate

For every new output, compare it with at least one unrelated output when an allowed baseline is available. Allowed baselines are user-supplied, packaged for comparison, or created in the current run; Agents must not search private history or unrelated workspaces. If no allowed baseline exists, report `anti-template-baseline-unavailable`. This does not block delivery: complete a product-evidence provenance check for every dimension below, keep only the cross-output subgate unavailable, and never claim that unavailable subgate passed. When a baseline exists, mark `template-leakage` and stop visual acceptance if three or more of these are substantially repeated without product-specific justification:

- page or window skeleton;
- character placement and scale;
- primary palette;
- surface material or texture;
- border, radius, and shadow system;
- title and label treatment;
- component composition;
- decorative motifs;
- interaction arrangement.

Repeated accessibility patterns, platform-native conventions, or genuinely shared brand tokens are allowed when documented. Repetition is not a failure by itself; unjustified repetition is.

## 8. Direction-generation change

The required three design directions must vary along both axes:

- **character role axis:** pose, profession, prop, state participation;
- **product UI axis:** layout model, visual language, color system, typography, materials, density, and interaction model.

Three recolors of the same layout do not count as three directions. Three mouse costumes placed in the same UI do not count either.

The direction table must explicitly list:

- what comes from the workflow;
- what comes from the target platform or brand;
- how the mouse is adapted;
- which composition-reference traits are intentionally excluded.

## 9. Corrected reference samples

The expense-approval sample may retain its warm paper-ledger style because receipt review, stamping, and audit trails justify that metaphor.

The photo-renamer sample must demonstrate independence:

- dark photographic workstation rather than paper collage;
- charcoal surfaces with cool blue/violet state colors rather than green/yellow;
- thumbnail timeline and inspector/tool panels rather than the same three-column ledger;
- restrained modern desktop typography, soft dividers, and luminous focus states rather than thick black borders and taped labels;
- the blue-hatted photo archivist remains workflow-specific, but appears as a compact contextual helper rather than occupying the same right-side mascot rail;
- no engineer hardhat, lever, upload, conversion, or processing-workshop semantics;
- truthful frontend-preview wording: no claim that local files were renamed unless an actual filesystem integration exists.

## 10. Validation

The corrected sample passes only when:

- the canonical identity and hand contract remain visibly correct;
- the photo role and props are specific to naming and cataloguing;
- the expense and photo interfaces no longer share the same palette, material, skeleton, character placement, or component system;
- all primary interactions and applicable loading, empty, invalid, conflict, progress, cancel, success, and recovery states work;
- desktop and mobile screenshots are inspected with the canonical and action-hand references in the same comparison input;
- a fresh reviewer finds no `template-leakage` or misleading completion claim;
- the private plugin package remains deterministic and passes all existing gates.

## 11. Scope

This change updates the reusable plugin contract, references, QA gates, and tests, then rebuilds the photo-renamer forward-test sample. It does not replace the approved canonical character, publicize private assets, or add a production filesystem backend to the browser prototype.
