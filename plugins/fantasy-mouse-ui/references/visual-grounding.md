# Visual grounding and character authority

Use this reference after the bundle verifier passes and before choosing any visual direction. View the files with the host's real image capability in manifest order.

## Authority order

| Asset | Authority | Use | Never infer |
| --- | --- | --- | --- |
| `canonical-protagonist.png` | `canonical-protagonist.png answers who the character is`; it is immutable identity authority | Establish the default character family, texture contrast, and temperament; apply approved expression/build extensions below | Action anatomy, layout, UI-style authority, or rights beyond the disclosed provenance |
| `processing-action-hands.png` | `processing-action-hands.png is the sole positive action anatomy authority` | Learn body-connected forearms, real prop contact, one action hand pair, and occlusion | A new canonical face, layout, theme, or business workflow |
| `processing-with-bubble.png` | layout-only observation; single example with zero anatomy authority and zero universal UI-style authority | Observe that a character can participate in work and fantasy content can support hierarchy | Its conflicting chest V/U or any UI-style treatment |
| `processing-without-bubble.png` | layout-only observation; single example with zero anatomy authority and zero universal UI-style authority | Observe that a character can participate in work and fantasy content can support hierarchy | Its conflicting chest V/U or any UI-style treatment |

See [ASSET_PROVENANCE.md](../ASSET_PROVENANCE.md) for the disclosure covering all four bundled assets. The software code is MIT licensed; the underlying author is unconfirmed and the underlying license is unconfirmed. The code license is separate from the bundled visual origin and does not grant rights in unknown third-party source material. Asset publication does not make compositions a universal UI-style authority.

Both processing compositions are single examples with zero universal UI-style authority. They may demonstrate that a character participates in work and that fantasy content can support hierarchy. They do not authorize copying their layout, palette, paper material, taped labels, thick borders, title treatment, spacing, window chrome, or character placement into another workflow.

## Character family and default reference

The pinned image is immutable identity authority for the default reference bytes. It is not a ban on user-approved expression faces or body builds. The following describe the default pose:

- compact round grey photographic or texture-rich head;
- tiny horizontal ears;
- narrowed vacant eyes;
- prominent human-like toothy grin;
- compact white hand-drawn bean body;
- default clasped hands expressed as the chest V/U;
- earnest absurd dreamer temperament.

Do not replace the character with a generic cute mouse, anime mascot, polished 3D animal, icon, emoji, or vector approximation. Preserve the intentional contrast between the photographic face and the hand-drawn body. Keep each supplied expression recognizable; open eyes, a closed mouth, missing visible teeth, red coloration, and a muscular body are permitted when grounded in the approved family.

## Hand contract

Treat the `default chest V/U is one clasped hand pair, not a belly mark` as anatomy.

- In default mode, show the V/U as the only clasped hand pair.
- In action mode, delete the default chest V/U completely before adding action hands.
- Show exactly one coherent hand pair. Never show the old V/U and new hands together.
- Let new hands take any action-appropriate shape; do not force them into V/U geometry.
- Attach forearms below the head/body seam, never to the face or cheeks.
- Make hands touch the real grip, press, point, support, or hold location.
- Establish a readable body/arms/hands/clothes/props occlusion order.
- Mirror two-handed actions unless the real action requires intentional asymmetry.
- Keep limbs off the eyes, teeth, ears, and defining silhouette; check connection at final UI size.

Ignore the chest-hand conflict in both composition assets. Their `knownExclusions` are mandatory, not optional review notes.

## Permitted variation

Vary expression face, intensity, body build, pose, clothes, profession, tools, props, vehicles, awards, partners, background, motion, and fantasy scene. Preserve recognizable family continuity, face texture, hand-drawn treatment, intentional proportions, and temperament. The default bean body is one variant; muscular, tall, rounded, seated, and clothed builds may follow the user brief. The one-pair hand contract still applies.

The bubble is optional. Use it only when imagined role or outcome improves hierarchy and comprehension. Omit it in dense workspaces, clear action poses, or serious states. Never use it as mandatory decoration or as a substitute for status, instructions, data, or controls.

## Modular character: select, compose, inspect

Treat a character as independently replaceable face, body, clothing, action hands, and props with an explicit occlusion order. Keep a stable head attachment point and artboard across variants so a state change does not shift surrounding layout.

Each approved expression has its own source face shape, feature placement, aspect ratio, ears and jaw. Preserve that source's complete visible face; never project every expression into the canonical head's silhouette or reuse one mask for all faces. Circle/avatar masks, cover-fit cropping and stretching must not remove or rearrange eyes, mouth, cheeks, forehead or ears. `headPolicy: preserve-source-silhouette` means the selected source's silhouette. `headReference` records identity context, not a universal stencil. Remove background separately from face geometry; a source-specific cutout needs visual inspection. If the source already truncates a head, report that limitation and use another complete source when a full head is required.

Body variation follows the selected reference's proportions, gesture and rendering. Simple linework does not mean a round bean body: preserve broad shoulders, chest, segmented abs, long arms, narrow waist, human legs and dynamic poses when selected. The owner's references include white line-drawn muscles, basketball/table-tennis actions, clothed human poses, short daily-life bodies, and textured hiking equipment. These are valid variants; do not impose tiny feet, sparse anatomy or one body template on all of them. Maintain the recognizable photographic meme face and deliberate collage quality. Prefer a supplied complete character or body when it already matches the request; do not regenerate it merely to make it more polished.

1. Inspect the user-provided face family alongside the canonical reference. Choose named expressions for actual states; infer an emotion label only as a provisional description, not the user's intended meaning.
2. Record a face asset ID, relative source path, SHA-256, source dimensions, expression label, intensity, intended display width, and approval/quality status. For contact sheets also record the pixel crop rectangle. Keep captions and neighboring cells out of the crop. A contact sheet is not automatically a complete high-resolution production face library.
3. Reuse the source face pixels. Isolate each complete face in a suitable image editor, with its own natural outline; a rectangular native image viewport may select a whole tile or complete character without altering it. Use generated variants only if requested or accepted, and mark their origin. Preserve the selected eyes/mouth/teeth rather than regenerating the same grin for every emotion. If using a complete source character, keep it intact and do not claim that it is a reusable face/body layer set.
4. Make the body separately in the existing hand-drawn language. Define its actual raster source and crop, build, clothing, pose, hand mode, normalized face attachment frame, and layers. A user-supplied body reference controls that variant's proportions and gesture: a small photographic head on broad human-like shoulders, long raised arms, pronounced chest/abs, or a waist-only crop can be intentional. Preserve such a selected pose, including asymmetric arms, rather than forcing the default bean silhouette or mirrored flex. For action hands remove the default chest V/U completely. Muscles and clothes change body drawing, not photographic face texture.
5. Match each face's own outline, neck join, scale, and tilt per pose. Scale uniformly with contain fitting; adjust the attachment frame or body neckline instead of cropping facial content to fill a frame. Any intended occlusion must be source-grounded and reviewed. Use each body's attachment frame instead of one fixed head size for every build. Keep text controls and layout anchors outside sprite motion. Use independent raster layers or an editable native document; do not synthesize anatomy with CSS/SVG shapes.
6. Inspect the combined asset at intended size against the exact selected expression and the relevant hand reference. Check crop halos, squared-off faces, old faces showing underneath, captions, seams, hand count, and dark/light backgrounds. Record source-width limits; enlarging a thumbnail does not restore detail.

Use expression intensity intentionally: calm/attentive for frequent work; satisfaction for completion; stronger shock/red anger for user-selected playful contexts. In failure states, help recovery and avoid mocking the user. Character emotion supplements literal status and never replaces it.

Additional face material belongs to the target project's asset manifest with its own source and use scope. Keep the four pinned baseline images and their verification intact. User permission to use a supplied image in this task does not silently add it to a public distributable plugin.

## Scope isolation

Use the target product as the only source of workflow, page structure, copy, data, and business rules. Do not import 乐不思鼠 business content, UI, copy, data, or workflow semantics. Only the imported hand-anatomy rule is relevant: default V/U and action hands are mutually exclusive, and only one pair may be visible.

Do not search prior conversations, memories, sibling repositories, or similarly named products for missing visual meaning. Stop and request the exact missing authority instead of inventing it.
