# Functional and visual QA

Use this reference after implementation. Treat acceptance as evidence from the real output, not confidence in source code.

## Keep gates distinct

Code and tests are not visible acceptance.

| Gate | Required evidence |
| --- | --- |
| Generated | Editable source and assets exist |
| Tested | Relevant automated checks passed |
| Run | The real app, page, or source opened and executed |
| Rendered | The target browser, desktop shell, or presentation tool produced visible output |
| Visually checked | References and output were judged together at intended size/state |
| Accepted | Functional, editable, accessible, visually correct, and all requested gates passed |

Do not claim the app or deck was run, rendered, or visually checked when that operation did not occur. Mark a missing renderer, browser, presentation tool, image viewer, or permission as an explicit handoff and keep the result partial.

## Exercise the workflow

- Use real primary controls, inputs, navigation, validation, and state changes.
- Complete the primary journey with realistic local data.
- Trigger applicable loading, empty, error, blocked, success, and recovery states.
- Verify destructive and permission actions, cancellation, retry, and authoritative results where relevant.
- Check keyboard order, visible focus, accessible names, status announcements, contrast, target sizes, reduced motion, responsive behavior, overflow, and editability.

Do not pass a static screenshot, disconnected buttons, visual-only form, or fabricated state label as functional evidence.

## Compare in one visual context

Capture the intended viewport and meaningful states. Put the following in the same comparison input:

1. canonical protagonist;
2. approved action-hand image;
3. the selected bubble or no-bubble composition reference;
4. rendered output screenshot.

Judge the images together, not in separate tool calls or from memory. Repeat after repairs.

Check:

- face, teeth, tiny ears, round grey head, white bean body, proportions, texture contrast, and temperament;
- default versus action hand mode, body-connected forearms, real contact point, occlusion, and exactly one coherent hand pair;
- workflow-specific role, clothes, props, pose, expression, and optional bubble;
- hierarchy, alignment, spacing, clipping, crop, overflow, typography, borders, shadows, contrast, focus, and state clarity;
- working primary path and correspondence between visible status and actual state;
- whole-interface Fantasy Mouse DNA rather than a generic UI with a mascot pasted on top;
- absence of unrelated business terms, data, page structures, or reference-product semantics.

Repair visible defects, rerun, recapture, and compare again. A screenshot by itself is evidence of rendering, not proof of correctness.

## Cross-output anti-template gate

Compare against an unrelated prior output before acceptance. To satisfy this gate, compare against an unrelated prior output only when the baseline is user-supplied, a packaged comparison baseline in the active plugin bundle, or an unrelated output created in the current run. Do not search prior conversations, memory, sibling repositories, or similarly named products for a baseline.

If no allowed baseline exists, report this exact result on its own line:

`anti-template-baseline-unavailable`

An unavailable cross-output comparison does not block delivery. Report that subgate as unavailable, then complete a product-evidence provenance check for every style-independence dimension and do not mark the unavailable subgate passed. Fail with `template-leakage` when three or more dimensions repeat from an available unrelated output without target-product, platform, accessibility, or brand evidence. Compare skeleton, character placement/scale, palette, material/texture, border/radius/shadow system, title/label treatment, component composition, decorative motifs, and interaction arrangement. List repeated dimensions, evidence, and repairs. A correct character inside a copied UI template is not accepted.

## Check hands exactly

- Accept the chest V/U only as the default clasped pair.
- Require action mode to remove the V/U completely.
- Require one body-connected, action-appropriate pair and no duplicate or floating hands.
- Treat both composition references as zero anatomy authority and reject their known chest-hand conflict.

## Report rights and completion honestly

Read [ASSET_PROVENANCE.md](../ASSET_PROVENANCE.md) before reporting or redistributing the bundle. The software code is MIT licensed; the underlying author is unconfirmed and the underlying license is unconfirmed. Keep the code license separate from the bundled visual origin, do not imply rights in unknown third-party source material, and do not claim that publication expands an asset's declared identity, anatomy, or composition authority.

Report passed, failed, partial, and unavailable gates separately. Export the editable source, brief, recipe, rationale, screenshots, comparison findings, repairs, and exact handoff. Reserve complete/accepted status for a result the user can run or render, edit, use, and visually verify.
