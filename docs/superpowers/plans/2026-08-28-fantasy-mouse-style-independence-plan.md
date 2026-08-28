# Fantasy Mouse Style Independence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Fantasy Mouse preserve one character identity while deriving each product's UI style independently, reject unjustified template reuse, and prove the behavior with a dark photographic-workstation redesign of the photo-renamer sample.

**Architecture:** Add machine-readable style-authority fields to the visual manifest, a dedicated style-independence reference, and canonical Skill/QA gates that separate character derivation from product UI derivation. Keep the expense sample as the justified paper-ledger control and rebuild the photo-renamer evidence as a visually unrelated dark workstation; compare both against the same character authorities and against each other.

**Tech Stack:** Markdown Agent skills, JSON manifest, TypeScript/Vitest contract tests, dependency-free HTML/CSS/JavaScript evidence app, Playwright CLI, deterministic ZIP packaging.

---

## File responsibility map

- `plugins/fantasy-mouse-ui/assets/visual-grounding/manifest.json`: machine-readable authority boundaries; no bundled image has universal UI-style authority.
- `plugins/fantasy-mouse-ui/references/style-independence.md`: reusable product-style derivation and anti-template algorithm.
- `plugins/fantasy-mouse-ui/references/visual-grounding.md`: human-readable limits on what composition references may teach.
- `plugins/fantasy-mouse-ui/references/workflow-to-ui.md`: separate character-role and product-style translation tables.
- `plugins/fantasy-mouse-ui/references/qa.md`: cross-output `template-leakage` acceptance gate.
- `plugins/fantasy-mouse-ui/skills/fantasy-mouse-ui/SKILL.md`: canonical execution order for every Agent/model.
- `tests/plugin/visual-grounding.test.ts`: manifest authority contract.
- `tests/plugin/skill-contract.test.ts`: canonical prose/workflow contract.
- `tests/plugin/package.test.ts`: installable ZIP contents.
- `work/plugin-forward-tests/photo-renamer/index.html`: honest local-file preview workflow structure.
- `work/plugin-forward-tests/photo-renamer/styles.css`: dark photographic-workstation visual system.
- `work/plugin-forward-tests/photo-renamer/app.js`: unchanged functional state machine except selectors/copy required by the new structure.
- `work/plugin-forward-tests/photo-renamer/design-decisions.md`: selected direction rationale and explicit exclusions.
- `work/plugin-forward-tests/photo-renamer/run-evidence.md`: exercised states and anti-template comparison evidence.

### Task 1: Lock UI-style authority in failing tests

**Files:**
- Modify: `tests/plugin/visual-grounding.test.ts`
- Modify: `tests/plugin/skill-contract.test.ts`
- Modify: `tests/plugin/package.test.ts`

- [ ] **Step 1: Add the manifest contract test**

Add after the existing publication assertion in `tests/plugin/visual-grounding.test.ts`:

```ts
expect(manifest.stylePolicy).toEqual({
  fixedSystem: "character-identity-only",
  uiDerivation: "target-product-and-platform",
  templateLeakageThreshold: 3
});
expect(manifest.assets.every((asset) => asset.uiStyleAuthority === false)).toBe(true);
```

Replace the composition scope and exclusions assertion with:

```ts
expect(composition.authorityScope).toBe("single-example-composition-only");
expect(composition.knownExclusions).toEqual([
  "do-not-copy-chest-v-u-when-action-hands-exist",
  "do-not-treat-layout-as-default",
  "do-not-treat-palette-as-default",
  "do-not-treat-materials-as-default"
]);
```

- [ ] **Step 2: Add the canonical Skill/reference contract test**

Add this test to `tests/plugin/skill-contract.test.ts`:

```ts
it("fixes character identity while deriving product UI independently", async () => {
  const [skill, style, workflow, visual, qa] = await Promise.all([
    readPluginFile("skills/fantasy-mouse-ui/SKILL.md"),
    readPluginFile("references/style-independence.md"),
    readPluginFile("references/workflow-to-ui.md"),
    readPluginFile("references/visual-grounding.md"),
    readPluginFile("references/qa.md")
  ]);

  expect(skill).toContain("character identity is fixed; UI style is not");
  expect(skill).toContain("references/style-independence.md");
  expect(style).toContain("product-style rationale");
  expect(style).toContain("template-leakage");
  expect(style).toContain("three or more");
  expect(workflow).toContain("character-role translation table");
  expect(workflow).toContain("product-style derivation table");
  expect(visual).toContain("zero universal UI-style authority");
  expect(qa).toContain("compare against an unrelated prior output");
});
```

Also add `"references/style-independence.md"` to the expected package entries in `tests/plugin/package.test.ts`.

- [ ] **Step 3: Run the focused tests and confirm RED**

Run:

```powershell
pnpm vitest run tests/plugin/visual-grounding.test.ts tests/plugin/skill-contract.test.ts tests/plugin/package.test.ts
```

Expected: FAIL because `stylePolicy`, `uiStyleAuthority`, the new reference, and required contract text do not exist.

- [ ] **Step 4: Commit the failing tests**

```powershell
git add tests/plugin/visual-grounding.test.ts tests/plugin/skill-contract.test.ts tests/plugin/package.test.ts
git commit -m "test: require fantasy mouse style independence"
```

### Task 2: Implement machine-readable and human-readable style independence

**Files:**
- Modify: `plugins/fantasy-mouse-ui/assets/visual-grounding/manifest.json`
- Create: `plugins/fantasy-mouse-ui/references/style-independence.md`
- Modify: `plugins/fantasy-mouse-ui/references/visual-grounding.md`

- [ ] **Step 1: Add the manifest style policy**

Add this top-level object next to `schemaVersion`:

```json
"stylePolicy": {
  "fixedSystem": "character-identity-only",
  "uiDerivation": "target-product-and-platform",
  "templateLeakageThreshold": 3
}
```

Add `"uiStyleAuthority": false` to every asset. For both composition assets, set:

```json
"authorityScope": "single-example-composition-only",
"knownExclusions": [
  "do-not-copy-chest-v-u-when-action-hands-exist",
  "do-not-treat-layout-as-default",
  "do-not-treat-palette-as-default",
  "do-not-treat-materials-as-default"
]
```

- [ ] **Step 2: Create the style-independence algorithm**

Create `plugins/fantasy-mouse-ui/references/style-independence.md` with these exact sections and rules:

```markdown
# Character continuity and UI style independence

The character identity is fixed; UI style is not. Treat the target product, users, platform, workflow, source brand, and accessibility needs as the only authorities for interface layout and styling.

## Product-style rationale

Before proposing directions, record: target surface, user role, task frequency, information density, trust/emotional tone, source-brand constraints, color semantics, typography, spacing, materials, borders, radius, shadows, imagery, motion, accessibility, and responsive behavior.

## Two independent translation tables

1. The character-role translation table maps workflow meaning to role, clothes, props, pose, expression, optional bubble, and hand mode.
2. The product-style derivation table maps product evidence to layout, navigation, component model, palette, type, material, density, and interaction arrangement.

Never use the character images or processing compositions as evidence for the second table.

## Three-direction gate

Each direction must vary both character participation and the complete product UI system. Recolors, costume swaps, or the same skeleton with different decoration are not separate directions.

## Anti-template comparison

Compare the candidate against an unrelated prior output. Mark `template-leakage` when three or more of these repeat without product-specific justification: skeleton, character placement/scale, palette, material/texture, border/radius/shadow system, title/label treatment, component composition, decorative motifs, interaction arrangement.

Shared accessibility patterns, target-platform conventions, and documented brand tokens are allowed. Record the evidence and justification.
```

- [ ] **Step 3: Tighten composition authority prose**

In `references/visual-grounding.md`, replace wording that could imply layout authority with:

```markdown
Both processing compositions are single examples with zero universal UI-style authority. They may demonstrate that a character participates in work and that fantasy content can support hierarchy. They do not authorize copying their layout, palette, paper material, taped labels, thick borders, title treatment, spacing, window chrome, or character placement into another workflow.
```

- [ ] **Step 4: Run the focused tests**

Run the Task 1 Vitest command.

Expected: manifest assertions pass; Skill/QA tests still fail until Task 3.

- [ ] **Step 5: Commit the authority implementation**

```powershell
git add plugins/fantasy-mouse-ui/assets/visual-grounding/manifest.json plugins/fantasy-mouse-ui/references/style-independence.md plugins/fantasy-mouse-ui/references/visual-grounding.md
git commit -m "feat: separate character authority from ui style"
```

### Task 3: Integrate the two-axis design process into every Agent contract

**Files:**
- Modify: `plugins/fantasy-mouse-ui/skills/fantasy-mouse-ui/SKILL.md`
- Modify: `plugins/fantasy-mouse-ui/references/workflow-to-ui.md`
- Modify: `plugins/fantasy-mouse-ui/references/qa.md`

- [ ] **Step 1: Update the canonical Skill order**

After target-source inspection, add:

```markdown
### 4. Separate character continuity from product styling

Read [references/style-independence.md](../../references/style-independence.md). The character identity is fixed; UI style is not. Build the character-role translation table from canonical identity plus workflow meaning. Build a separate product-style derivation table only from the target product, users, platform, workflow, source brand, and accessibility requirements. Character and composition assets have zero universal authority over layout, palette, typography, materials, components, or character placement.
```

Renumber later headings. In direction selection, require each option to state its product evidence, character adaptation, complete UI system, and intentionally excluded composition traits. Before visual acceptance, require the unrelated-output anti-template comparison and stop on `template-leakage`.

- [ ] **Step 2: Split workflow translation into two tables**

In `references/workflow-to-ui.md`, replace the single translation framing with:

```markdown
## Character-role translation table

Map each real function/state to stable identity evidence, role, clothes, props, pose, expression intensity, hand mode, background, and optional bubble.

## Product-style derivation table

Map target-product evidence to surface/platform, hierarchy, navigation, layout, component model, palette, typography, density, materials, border/radius/shadow treatment, motion, feedback, accessibility, and responsive behavior. Do not cite bundled character or composition images as evidence for this table.
```

Keep the whole-interface requirement, but clarify that coherence comes from deliberate product rationale plus character participation, not from repeating the processing sample's visual tokens.

- [ ] **Step 3: Add the anti-template QA gate**

Add to `references/qa.md`:

```markdown
## Cross-output anti-template gate

Compare against an unrelated prior output before acceptance. Fail with `template-leakage` when three or more style-independence dimensions repeat without target-product, platform, accessibility, or brand evidence. List repeated dimensions, evidence, and repairs. A correct character inside a copied UI template is not accepted.
```

- [ ] **Step 4: Run all plugin contract tests**

```powershell
pnpm vitest run tests/plugin
```

Expected: all plugin tests pass.

- [ ] **Step 5: Commit the Agent-contract change**

```powershell
git add plugins/fantasy-mouse-ui/skills/fantasy-mouse-ui/SKILL.md plugins/fantasy-mouse-ui/references/workflow-to-ui.md plugins/fantasy-mouse-ui/references/qa.md
git commit -m "feat: add anti-template design workflow"
```

### Task 4: Redesign the photo renamer as a dark photographic workstation

**Files:**
- Modify: `work/plugin-forward-tests/photo-renamer/design-decisions.md`
- Modify: `work/plugin-forward-tests/photo-renamer/index.html`
- Replace: `work/plugin-forward-tests/photo-renamer/styles.css`
- Modify: `work/plugin-forward-tests/photo-renamer/app.js`

- [ ] **Step 1: Record the independent product-style rationale**

Replace the selected-direction section with:

```markdown
## Product-style derivation table

| Evidence | Decision |
| --- | --- |
| Repeated local photo-management task | dense desktop workstation, persistent inspector, keyboard-visible controls |
| Photography content | charcoal viewing surfaces, accurate thumbnails, cool blue/violet status light |
| Filename comparison | aligned monospace preview and high-density rows |
| Local/no-write prototype boundary | persistent `预演` labelling and no upload/conversion/write claim |
| Responsive requirement | desktop multi-pane layout collapses to stacked mobile inspector |

Excluded from the processing compositions: paper texture, taped labels, thick black outlines, warm yellow/green palette, three-column ledger, right-side mascot rail, workshop chrome.
```

- [ ] **Step 2: Replace the page skeleton**

Restructure `index.html` to this hierarchy while retaining the existing IDs used by JavaScript:

```html
<div class="app-shell">
  <nav class="rail" aria-label="照片批次">
    <div class="brand">FM</div>
    <button class="rail-item active">本批次</button>
    <button class="rail-item">历史</button>
  </nav>
  <main class="workbench">
    <header class="topbar">...</header>
    <section class="contact-sheet">
      <div id="rule-error" class="alert hidden">...</div>
      <div id="conflict" class="alert hidden">...</div>
      <div id="rows" class="photo-grid"></div>
      <div id="empty" class="empty hidden">...</div>
    </section>
  </main>
  <aside class="inspector">
    <section class="mouse-helper">
      <img src="assets/renamer-mouse.png" alt="戴蓝帽、用一双手操作标签机的鼠鼠">
      <p id="mouse-say">...</p>
    </section>
    <section class="rename-rules">...</section>
  </aside>
  <footer class="taskbar">...</footer>
</div>
```

Do not use tape, paper, faux window dots, heavy outline cards, or a full-height mascot rail.

- [ ] **Step 3: Replace the visual system**

Start `styles.css` with these exact tokens and use them consistently:

```css
:root {
  color-scheme: dark;
  --canvas: #090b10;
  --rail: #10131a;
  --surface: #151922;
  --surface-raised: #1c2230;
  --line: #2a3140;
  --text: #f4f6fb;
  --muted: #8e99ab;
  --blue: #61a9ff;
  --violet: #9b87ff;
  --danger: #ff6b78;
  --success: #55d6a5;
  --radius: 12px;
  font-family: Inter, "Microsoft YaHei", system-ui, sans-serif;
}
```

Use a `72px minmax(0,1fr) 320px` desktop grid, 1px dividers, soft 16-24px spacing, no paper texture, no offset black shadows, and no yellow/green accents. Render `#rows` as a contact-sheet grid with photographic thumbnails above filename pairs. Place the mouse in a compact `mouse-helper` card no larger than 160px high. At `max-width: 760px`, collapse rail, workbench, inspector, and taskbar into one column without horizontal overflow.

- [ ] **Step 4: Adapt row rendering to cards without changing state truth**

Change the `render()` row template to:

```js
rows.innerHTML = files.map((file, index) => `
  <article class="photo-card ${invalid || (conflict && index === 2) ? "has-error" : ""}">
    <img class="thumb" src="${file[1]}" alt="">
    <div class="file-pair">
      <span class="old-name">${file[0]}</span>
      <span class="new-name">${newName(index)}</span>
    </div>
    <span class="status ${invalid || (conflict && index === 2) ? "bad" : "ok"}">
      ${invalid ? "名称无效" : conflict && index === 2 ? "名称冲突" : "可以使用"}
    </span>
  </article>
`).join("");
```

Keep the honest `预演` wording, both file-picker handlers, invalid-name recovery, conflict recovery, progress, cancel, success, and empty recovery.

- [ ] **Step 5: Run the local app and exercise every state**

Run:

```powershell
py -3 -m http.server 43100 --bind 127.0.0.1
```

With the already-approved Playwright CLI browser, exercise conflict, invalid, recovered, progress, cancel, success, empty, selected, desktop, and 390x844 mobile states. Expected: 0 console errors and 0 warnings; no claim that files were changed.

- [ ] **Step 6: Keep forward-test evidence outside the shipped ZIP**

Verify:

```powershell
git status --short
```

Expected: the ignored `work/plugin-forward-tests` redesign does not appear in tracked changes.

### Task 5: Visual anti-template acceptance and final package

**Files:**
- Modify: `work/plugin-forward-tests/photo-renamer/run-evidence.md`
- Regenerate: `work/plugin-forward-tests/photo-renamer/output/playwright/*.png`
- Regenerate: `dist/plugin/fantasy-mouse-ui-private-local.zip`

- [ ] **Step 1: Perform the same-input visual comparison**

Put these in one visual comparison input:

1. `plugins/fantasy-mouse-ui/assets/visual-grounding/canonical-protagonist.png`;
2. `plugins/fantasy-mouse-ui/assets/visual-grounding/processing-action-hands.png`;
3. current expense desktop/mobile screenshots;
4. redesigned photo-renamer desktop/mobile screenshots.

Verify identity, exactly one action-hand pair, photo-specific role/props, clipping, hierarchy, typography, focus, contrast, and responsive behavior.

- [ ] **Step 2: Record the anti-template matrix**

Add this completed matrix to `run-evidence.md` with observed values:

```markdown
| Dimension | Expense approval | Photo renamer | Unjustified repeat? |
| --- | --- | --- | --- |
| Skeleton | ledger queue/detail/reviewer | rail/contact-sheet/inspector | no |
| Character placement | full-height right reviewer | compact contextual helper | no |
| Palette | warm paper, green, red | charcoal, blue, violet | no |
| Material | paper ledger | dark photographic workstation | no |
| Border/shadow | thick ink and offset shadow | 1px dividers and soft elevation | no |
| Title/labels | stamped and taped | restrained desktop type | no |
| Components | receipts and checklists | photo cards and naming inspector | no |
| Interaction arrangement | queue then approve/reject | select, preview, conflict, preflight | no |
```

Expected: fewer than three unjustified repeated dimensions; no `template-leakage`.

- [ ] **Step 3: Run full regression gates**

```powershell
pnpm test
pnpm typecheck
pnpm studio:build
pnpm plugin:verify
pnpm plugin:package
git diff --check
```

Expected: 413+ tests pass with only documented skips; typecheck/build/verifier/package/diff-check pass.

- [ ] **Step 4: Verify deterministic packaging**

Run `pnpm plugin:package` twice and hash after each run:

```powershell
Get-FileHash -Algorithm SHA256 dist/plugin/fantasy-mouse-ui-private-local.zip
```

Expected: both SHA-256 values are identical. Record the new size and hash; do not reuse the pre-style-independence hash.

- [ ] **Step 5: Request two-stage review**

First request a fresh specification/visual review against the approved style-independence design. After it passes, request code/package quality review. Fix all Critical and Important findings and rerun affected gates.

- [ ] **Step 6: Commit the plugin implementation**

```powershell
git add plugins/fantasy-mouse-ui tests/plugin
git commit -m "feat: prevent fantasy mouse ui template leakage"
```

- [ ] **Step 7: Final handoff**

Return the local preview URL first, then the private ZIP path, exact SHA-256, test/build totals, visual evidence paths, and the remaining boundary that the user must visually accept the redesigned sample. Do not publish or deploy.
