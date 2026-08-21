# Fantasy Mouse UI Implementation Roadmap

> **For agentic workers:** Execute the four linked plans in order. At execution time, create an isolated worktree with `using-git-worktrees`; use `subagent-driven-development` (recommended) or `executing-plans` for each plan.

**Goal:** Deliver the approved Fantasy Mouse UI local design center, model-neutral protocol, three editable output surfaces, and evidence-backed QA.

**Architecture:** One TypeScript repository exposes a deep core protocol consumed by a React local studio, independent renderers, QA services, and thin Agent adapters. Every phase ends with working software and a clean commit boundary.

**Tech Stack:** TypeScript, pnpm, TypeBox, Ajv, Vitest, React, Vite, Playwright, Electron, PptxGenJS, axe-core.

---

## Plan order

1. [Core protocol and catalog](2026-08-21-fantasy-mouse-core-plan.md)
2. [Local Web design center](2026-08-21-fantasy-mouse-studio-plan.md)
3. [Web, desktop, and PowerPoint renderers](2026-08-21-fantasy-mouse-renderers-plan.md)
4. [QA, export, and Agent adapters](2026-08-21-fantasy-mouse-delivery-plan.md)

## Program gates

- Plan 2 starts only after Plan 1's CLI produces a schema-valid recipe.
- Plan 3 starts only after Plan 2 can persist and reload the recipe.
- Plan 4 starts only after all three renderers produce real artifacts.
- The program is complete only after the end-to-end acceptance command reports `accepted` for Web, desktop, and PowerPoint.

## Specification coverage

| Approved design requirement | Owning plan |
| --- | --- |
| Model-neutral recipe, twelve states, six personas, six themes, fantasy mapping | Core protocol and catalog |
| Capability negotiation and honest handoff | Core protocol and catalog |
| Three recommended directions and hybrid editing workflow | Core protocol and local studio |
| Local browser design center and atomic project persistence | Local studio |
| Editable responsive Web output | Surface renderers |
| Runnable desktop-shell output | Surface renderers |
| Editable PowerPoint and rendered slide images | Surface renderers and delivery |
| Original character pack and dynamic standard-asset fallback | Delivery |
| Rights-safe public export | Delivery |
| Real browser, Electron, PPT rendering, accessibility, and explicit visual review | Delivery |
| Generic, Codex, Claude, Gemini, and DeepSeek adapters | Delivery |
| Accepted/partial/failed completion semantics | Delivery |
