---
name: fantasy-mouse-ui
description: Use whenever the user invokes Fantasy Mouse UI, 鼠鼠的幻想, or this plugin for designing or redesigning software UI, websites, presentations, or workflows.
---

# Fantasy Mouse UI

Each bundled image is authoritative only for its manifest-declared scope: canonical character identity, action anatomy, or single-example composition. The target product, user, platform, workflow, explicit source brand, and accessibility evidence are the only UI-style authority; the target product is the functional authority. Do not reconstruct the character from prose or paste a mascot onto a generic interface.

## Execute in order

### 1. Verify the bundle

Resolve the plugin root from this Skill, then run `scripts/verify-bundle.mjs`. Require `{ "ok": true, "assets": 4 }`. Stop on a hash, dimension, path, or manifest failure; do not substitute remembered or external images.

### 2. Ground the design visually

Read [references/visual-grounding.md](../../references/visual-grounding.md) and the visual-grounding manifest. Use the host's real image-viewing capability to **view every required visual-grounding image**. Inspect the canonical identity first, the approved action-hand image second, then both composition-only images while excluding their known chest-hand conflict.

Do not accept filenames, metadata, OCR, textual summaries, or prior memory as proof that the images were viewed.

#### Fail honestly without image access

If the host cannot actually view every required image, emit this exact token on its own line:

`visual-grounding-unavailable`

Allow a text-only Agent to parse the target workflow and prepare a provisional brief, but stop before style selection, character generation, identity claims, visual QA, or completion claims. Name the missing image-viewing handoff.

### 3. Inspect the target source

Inspect the real project, screenshot, URL, deck, requirements, or workflow source before proposing visuals. For an existing product, find its current flows, screens, components, tokens, assets, and build/run path. For a URL, capture and view the source at the relevant viewport before designing. Preserve the product's data boundaries and behavior.

### 4. Separate character continuity from product styling

Read [references/style-independence.md](../../references/style-independence.md). The character identity is fixed; UI style is not. The character-role translation table is bounded to canonical identity plus workflow meaning. The product-style derivation table is bounded to the target product, users, platform, workflow, source brand, and accessibility requirements. Character and composition assets have zero universal authority over layout, palette, typography, materials, components, or character placement.

Bundled images and plugin metadata are not source-brand or UI-style evidence. Source-brand evidence comes only from the target product or user; UI style also derives from platform conventions, workflow, and accessibility requirements. The character's photographic-face/drawn-body contrast does not prescribe interface materials.

### 5. Create the workflow brief

Read [references/workflow-to-ui.md](../../references/workflow-to-ui.md). Record purpose, users, entities, screens, actions, state transitions, constraints, and surfaces. Reject a brief that omits the primary journey or invents semantics from a reference image.

### 6. Translate character into interface

Write both independent artifacts before implementation. The character-role translation table derives only character participation from canonical identity plus workflow meaning. The product-style derivation table derives layout, copy, tokens, components, motion, status feedback, and interaction metaphors only from the target product, users, platform, workflow, source brand, and accessibility evidence. Preserve usability, accessibility, and workflow truth.

### 7. Select one coherent direction

Propose three coherent directions only when the user has not selected one. Make each direction a complete functional treatment, not three color palettes. Require every direction to state its product evidence, character adaptation, complete UI system, and intentionally excluded composition traits. Include layout, interaction flow, role/props/pose, expression intensity, theme, component treatment, optional bubble use, participation intensity, accessibility, and tradeoffs. Stop and ask the user to select or approve one before implementation. Continue directly only when the user has already selected or approved a direction.

### 8. Modify real source

Modify real source using the closest existing product patterns. Preserve the product's framework, routing, components, and design tokens unless the request requires a change. If no project exists, create surface-appropriate editable source only after the selected direction, derived from the product-style derivation table. Never copy a packaged starter or template or fabricate behavior.

### 9. Implement behavior and states

Build and **implement the primary interaction path** with realistic local data. Implement applicable loading, empty, error, blocked, success, and recovery states. Make navigation, inputs, primary actions, validation, status announcements, and recovery controls actually work. Keep destructive, permission, and authoritative messages precise.

### 10. Use real visual assets

Use approved source assets or generate real raster assets with an image-capable tool. Never draw mascot anatomy with CSS, SVG, or emoji. Never use ASCII, div art, placeholder boxes, or text symbols as visible character substitutes.

Preserve exactly one coherent hand pair: retain the chest V/U only for the default clasped pose; in action mode remove it completely and use one action-appropriate pair.

### 11. Run and compare

Read [references/qa.md](../../references/qa.md). Run or render the output in its real target tool. Exercise the primary path and relevant states, then capture screenshots at the intended viewports.

Before visual acceptance, perform the unrelated-output anti-template comparison when an allowed baseline exists. Use only a user-supplied baseline, a packaged comparison baseline in the active plugin bundle, or an unrelated output created in the current run. Do not search prior conversations, memory, sibling repositories, or similarly named products. If no allowed baseline is available, emit `anti-template-baseline-unavailable`; this does not block delivery, but report that the cross-output subgate remains unavailable and still complete the product-evidence provenance check. Stop on `template-leakage` and repair the unjustified repeated dimensions before continuing.

Put the canonical image, approved action-hand image, selected composition reference, and rendered output in the **same comparison input**. Repair visible identity, hand, hierarchy, clipping, spacing, typography, contrast, focus, state, and workflow defects. Reject a generic UI with a mascot pasted on top. Keep generated, tested, run, rendered, visually checked, and accepted gates separate.

### 12. Export and hand off

Export the editable source plus the workflow brief, recipe, rationale, evidence, and handoff. Include both the character-role translation table and the product-style derivation table, run/render evidence, comparison findings, repairs, unresolved limits, and capability-dependent next action. Preserve the bundled MIT License in redistributed copies and report any third-party target-project asset limitations separately.
