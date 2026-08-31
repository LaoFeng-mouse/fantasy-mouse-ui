# Fantasy Mouse UI adapter

Use this file only to load the shared plugin contract with the capabilities available in the current host.

Bundled images and plugin metadata are not source-brand or UI-style evidence.

1. Read `../../config/execution-modes.json` first to discover known triggers and identify every match.
2. From this adapter directory, run `node ../../scripts/resolve-mode.mjs [--requested fast|standard|strict] [--trigger <known-trigger> ...]`.
3. State the returned mode and reason, then read and follow `../../skills/fantasy-mouse-ui/SKILL.md`; load the canonical Skill and references it names, and defer all profile semantics to it.
4. Run `node ../../scripts/verify-bundle.mjs` from this adapter directory.
5. Read `../../assets/visual-grounding/manifest.json` and view the real images before selecting style or making a style claim.
6. If real image viewing is unavailable, report exactly `visual-grounding-unavailable` and stop before visual design.
7. Build a workflow brief only when the selected profile's `required` includes `workflow-brief`.
8. Validate it against `../../protocol/workflow-brief.schema.json` only when the selected profile's `required` includes `protocol-validation`.

The only hand invariant repeated here is a routing guard: the default chest V/U and action hands are mutually exclusive, with exactly one coherent hand pair. Defer every character, workflow, and design decision to the canonical Skill and references.
