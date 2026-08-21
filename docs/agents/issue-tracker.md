# Issue tracker: Local Markdown

Issues and specs for this repo live as Markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- Feature specification: `.scratch/<feature-slug>/spec.md`
- One implementation ticket per file:
  `.scratch/<feature-slug>/issues/<NN>-<slug>.md`
- Ticket numbering starts at `01`.
- Triage state is stored in a `Status:` line near the top.
- Discussion history is appended under `## Comments`.

## Publishing and reading

When a skill publishes an issue, create the corresponding Markdown file under `.scratch/`.

When a skill fetches a ticket, read the path or issue number supplied by the user.

## Wayfinding

- Map: `.scratch/<effort>/map.md`
- Child ticket: `.scratch/<effort>/issues/<NN>-<slug>.md`
- Ticket type: `Type: research|prototype|grilling|task`
- Ticket state: `Status: claimed|resolved`
- Dependencies: `Blocked by: NN, NN`
- Claim work by setting `Status: claimed` before starting.
- Resolve work by adding `## Answer`, setting `Status: resolved`, and recording the decision in `map.md`.
