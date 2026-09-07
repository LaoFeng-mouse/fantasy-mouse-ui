# Fantasy Mouse UI roadmap

None of the items below are shipped in v0.2.0. This roadmap separates intended improvements from the capabilities available in that release.

## Planned for v0.2.1

- **doctor** — Add a diagnostic entrypoint that checks the bundle, runtime, and host prerequisites so setup failures are easier to identify.
- **shorter canonical Skill** — Reduce the always-loaded workflow while preserving its required gates so Agents spend less context on instructions without weakening acceptance.
- **host-capability contract** — Define the capabilities and fallback behavior expected from each host so integrations make bounded, testable claims.
- **package-local `USE_WITH_AI.md`** — Put concise Agent installation and invocation guidance inside the package so users do not need repository-only documentation to get started.

## Candidate scope for v0.3.0

- **owned or licensed original character assets** — Establish clear redistribution rights and provenance so the visual bundle can be used with lower legal and maintenance risk.
- **real-host conformance tests** — Exercise supported adapters in their actual hosts so compatibility claims are backed by observed host behavior.
- **benchmark regression** — Compare representative outputs across plugin changes so workflow, character, and product-specific design quality regressions are detected.
