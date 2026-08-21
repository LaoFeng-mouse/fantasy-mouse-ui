# Domain docs

This repository uses a single-context domain layout.

## Before exploring

Read these files when they exist:

- `CONTEXT.md` at the repository root.
- Relevant architecture decisions under `docs/adr/`.

Missing domain documents are created only when terminology or architectural decisions need to be recorded.

## Vocabulary

Use domain terms exactly as defined in `CONTEXT.md`. Avoid introducing synonyms for concepts already defined there.

If a required concept is absent, record the gap for domain-modeling rather than silently inventing competing terminology.

## Architecture decisions

Surface any conflict with an existing ADR explicitly. Do not silently override an accepted decision.

Expected layout:

```text
/
├── CONTEXT.md
├── docs/
│   ├── agents/
│   └── adr/
└── src/
```
