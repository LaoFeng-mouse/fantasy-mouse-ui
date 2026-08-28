---
name: fantasy-mouse-ui-adapter
description: Load the shared Fantasy Mouse UI contract in Claude.
---

# Claude loading adapter

Use Claude's available file-reading, command-running, and real image-viewing capabilities only to load the shared plugin contract.

Bundled images and plugin metadata are not source-brand or UI-style evidence.

1. Run `node ../../scripts/verify-bundle.mjs` from this adapter directory.
2. Read `../../assets/visual-grounding/manifest.json` and view the real images before selecting style or making a style claim.
3. If real image viewing is unavailable, report exactly `visual-grounding-unavailable` and stop before visual design.
4. Read and follow `../../skills/fantasy-mouse-ui/SKILL.md`; load the canonical Skill and references it names.
5. Build and validate the target workflow against `../../protocol/workflow-brief.schema.json` as the canonical Skill requires.

The only hand invariant repeated here is a routing guard: the default chest V/U and action hands are mutually exclusive, with exactly one coherent hand pair. Defer every character, workflow, and design decision to the canonical Skill and references.
