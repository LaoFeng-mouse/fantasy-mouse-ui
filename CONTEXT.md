# Fantasy Mouse UI Context

## Product boundary

Fantasy Mouse UI is a self-contained, reusable Agent plugin for creating or redesigning software UI, websites, presentations, and workflows. Each invocation must preserve the requested product's real functions and state model while producing a complete editable, surface-appropriate design. Runnable output is required only for runnable software and web targets; presentations require an editable deck, and other workflows require workflow-appropriate artifacts. It is not a mascot asset pack, a static style gallery, or a skin for another product, and it does not inherit semantics, components, colors, assets, or business rules from similarly named projects.

The plugin is visually grounded. An Agent must inspect the bundled canonical protagonist and approved derivative images before selecting a style or generating a UI. Text descriptions alone are insufficient: they explain invariants and methods, while the images establish the actual character identity, proportions, texture, expression, and permissible variation. The Agent derives character role from canonical character identity plus target workflow meaning. The character identity is fixed; UI style is independently derived from the target product, user, platform, workflow, source brand, and accessibility requirements.

## Canonical protagonist

The immutable identity source is the user-provided `plugins/fantasy-mouse-ui/assets/visual-grounding/canonical-protagonist.png`. It has highest visual authority, is private-reference-only, measures 1387×1134, and is pinned by SHA-256 `4C85BCE3AD50F33FC04BBF05147EFD96ED0BAE98866C12E1DB5E7096C8557316`. Its ordered identity anchors are `compact-grey-round-head`, `tiny-horizontal-ears`, `narrowed-vacant-eyes`, `human-like-toothy-grin`, `compact-white-bean-body`, `default-clasped-hands-v-or-u`, and `earnest-absurd-dreamer`.

Derivatives may change only state expression, pose, clothing, profession, props, and fantasy scene. They must preserve the prototype's face, ears, teeth, silhouette and proportions, and temperament. The chest V/U is not a belly mark: it is the default pair of clasped hands. The two processing UI goldens are derivative layout and composition references only; they must never redefine the protagonist.

Variable poses still obey one limb-construction contract: forearms attach below the grey-head/white-body seam, hands meet the intended interaction point, and limbs/props have an explicit occlusion order. The default clasped-hands V/U and action hands are mutually exclusive: an action pose removes the V/U before rendering exactly one pair of action hands. Two-handed actions are mirrored unless the pose intentionally declares asymmetry. Limbs never cover identity anchors and must remain body-connected and readable at UI size.

`processing-action-hands.png` is the sole positive action-anatomy reference for connected forearms, the two-handed red-lever grip, and occlusion order. The two processing composition images have zero anatomy authority because they retain the known chest-hand conflict. None of these derivative images replaces the canonical prototype as the identity source.

## Style authority

Beyond fixed identity, the only shared visual invariant is the character asset itself, including its earnest absurd temperament; the interface has no inherited style theme. Bundled compositions and character imagery are not UI-style or source-brand authority. Photographic-face/drawn-body contrast applies only to the character asset.

Rough black outlines, cut-paper or sticker composition, bold Chinese display type, chunky controls, offset shadows, grain, paper texture, and palette are not universal Fantasy Mouse UI constraints. They may appear only when justified by target product, user, platform, workflow, source-brand, or accessibility evidence. The newer `plugins/fantasy-mouse-ui/references/style-independence.md` specification supersedes older shared-visual-language assumptions.

## Context isolation

Agents read only the exported package by default. Previous conversations, memory, sibling repositories, FlyingMouse Format, 乐不思鼠, and other workspaces are unrelated unless the user explicitly imports a named source. The only imported 乐不思鼠 rule currently retained is the Owner-confirmed hand anatomy: default chest V/U means one clasped hand pair; action hands replace it completely; exactly one pair is visible. No 乐不思鼠 workflow, page, data, copy, or business rule is imported.
