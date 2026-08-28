# Fantasy Mouse UI integration guide

This guide is for an Agent or developer integrating the plugin into a new UI, website, presentation, document, or workflow task.

Public repository: https://github.com/LI-2004-feng/fantasy-mouse-ui

## Installation

For Codex, use the repository marketplace:

```powershell
codex plugin marketplace add https://github.com/LI-2004-feng/fantasy-mouse-ui --json
codex plugin list --marketplace fantasy-mouse-ui --available --json
codex plugin add fantasy-mouse-ui@fantasy-mouse-ui --json
codex plugin list --marketplace fantasy-mouse-ui --json
```

For assisted marketplace or public release-ZIP installation, follow the bilingual [Install with AI](../INSTALL_WITH_AI.md) guide. It requires the exact 20-file inventory, safe staging, bundle verification, target-host validation, and an honest new-task/session loading boundary.

## Canonical entrypoint

Use `plugins/fantasy-mouse-ui/skills/fantasy-mouse-ui/SKILL.md`. The files under `adapters/` are thin host loaders and must not redefine character, workflow, or style semantics.

| Host | Loader |
| --- | --- |
| Generic Agent | `adapters/generic/AGENT.md` |
| Claude | `adapters/claude/SKILL.md` |
| Gemini | `adapters/gemini/SKILL.md` |
| DeepSeek | `adapters/deepseek/SKILL.md` |
| Codex | Load the canonical Skill from `.codex-plugin/plugin.json` through the repository marketplace |

Any other model can use the generic adapter if it can read files, run Node.js, and view real images. A text-only Agent may prepare a provisional workflow brief but must emit `visual-grounding-unavailable` and stop before visual design.

Host adapters are compatibility layers, not alternate products. Validate the source bundle first, then the installed host copy/cache, and finally actual loading in a newly started task or session. A passing four-asset verifier alone proves neither complete installation nor host loading.

## Invocation sequence

1. Run the bundle verifier from the plugin root:

   ```powershell
   node scripts/verify-bundle.mjs
   ```

   Required result: `{"ok":true,"assets":4}`.

2. View, in manifest order:
   - `canonical-protagonist.png` for identity;
   - `processing-action-hands.png` for positive action anatomy;
   - both processing compositions for composition-only observation.
3. Inspect the target product or requirements.
4. Create and validate a workflow brief.
5. Produce two separate artifacts before implementation:
   - character-role translation table;
   - product-style derivation table.
6. Select or confirm one coherent direction.
7. Implement the real primary path and applicable states.
8. Run/render, visually compare, repair, and export editable source plus evidence.

## Workflow brief

Validate with:

```powershell
node scripts/validate-workflow.mjs path\to\workflow-brief.json
```

Example:

```json
{
  "protocolVersion": 1,
  "id": "expense-approval",
  "purpose": "Review and approve employee expenses",
  "users": ["finance-reviewer"],
  "entities": ["expense-report"],
  "screens": [{ "id": "queue", "purpose": "Review pending reports" }],
  "actions": [
    {
      "id": "approve",
      "label": "Approve",
      "kind": "primary",
      "from": "review",
      "to": "success"
    }
  ],
  "states": ["loading", "empty", "review", "blocked", "success", "failure"],
  "primaryJourney": ["queue", "approve"],
  "surfaces": ["web"],
  "constraints": ["A rejection requires a reason"]
}
```

State and surface identifiers are open lower-case hyphen-case slugs. Do not force the target product into bundled state names or a fixed list of output formats.

## Project recipe

`protocol/mouse-ui-project.schema.json` records the selected project-specific direction. Every state includes `handMode`:

```json
{
  "review": {
    "fantasyRole": "expense-auditor",
    "expression": "focused",
    "pose": "checking-receipt",
    "handMode": "action",
    "props": ["receipt", "approval-stamp"],
    "bubble": "hide",
    "copy": "Checking the submitted evidence"
  }
}
```

Use `default-clasped` only when the chest V/U is the visible clasped pair. Use `action` only after removing the V/U and adding exactly one connected action-hand pair.

## Style independence

The target product supplies functional truth. Product, user, platform, source brand, and accessibility evidence supply UI style. Character assets supply only their declared character/anatomy/composition scope.

Reject a result when it copies three or more unjustified dimensions from an unrelated output: skeleton, character placement, palette, material, edge/elevation system, title treatment, component composition, decoration, or interaction arrangement.

If no allowed unrelated baseline exists, report `anti-template-baseline-unavailable`; complete the product-evidence provenance check and leave only that cross-output subgate unavailable.

## Output contract

Return editable source, the brief, recipe, rationale, both derivation tables, run/render evidence, screenshots, repairs, unresolved limits, and an exact handoff. Never promote generated or tested output to visually accepted without real target-tool evidence.

