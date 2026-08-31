# Fieldnote Festival

Fieldnote Festival is the strict website benchmark for a regional botany event. Its planned experience lets visitors browse the program, filter by day, inspect a session, add it to a personal plan, resolve a time conflict, and reach a saved plan.

## Direction

The product direction is organic editorial: a field-journal hierarchy, regionally grounded botanical content, and calm, legible planning controls. The Fantasy Mouse appears as an embedded field guide in editorial and empty-plan states. It is not persistent navigation, a floating assistant, or decorative chrome.

Character identity and action anatomy come from the Fantasy Mouse authorities. Layout, typography, palette, components, interaction, and responsive behavior come only from the event, website surface, planning workflow, and accessibility requirements. See `character-role.md` and `product-style.md` for the independent derivations.

## Primary journey

`browse-program -> filter-day -> inspect-session -> add-to-plan -> resolve-time-conflict -> saved-plan`

The time-conflict step must not silently alter the plan. Adding a clashing session leaves the existing plan intact until the visitor explicitly replaces or removes a session; the resolution is then announced and saved atomically.

## Current benchmark status

This case is a metadata-only pending scaffold. Strict mode is selected by the `public-benchmark` trigger. Source, runnable output, screenshots, and comparison evidence are intentionally absent. Every generation, test, run, render, visual-check, accessibility, journey, comparison, and acceptance gate remains pending or false in `evidence/qa.json`.

## Files in this phase

- `prompt.md` — implementation prompt and acceptance boundaries
- `workflow-brief.json` — model-neutral workflow contract
- `mode.json` — strict-mode request and trigger
- `character-role.md` — character participation derived from workflow meaning
- `product-style.md` — independent UI derivation from product evidence
- `evidence/qa.json` — pending benchmark evidence record
