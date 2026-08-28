# Fantasy Mouse UI architecture

## Boundary

The repository contains one reusable plugin and its verification/packaging harness. It does not contain a product Studio, surface renderer, or sample application. The plugin instructs the invoking Agent to work inside the user's real target project or to create surface-appropriate editable source when no project exists.

## Authority model

```text
canonical-protagonist.png ── identity authority
processing-action-hands.png ── action-anatomy authority
processing compositions ── single-example composition observation
target product + users + platform + brand + accessibility ── UI authority
```

These channels are deliberately independent. No image or plugin metadata may supply business semantics, source-brand tokens, or a universal UI style.

The verifier embeds the expected asset paths, hashes, dimensions, publication scopes, authority flags, hand rule, exclusions, and style policy as its trust root. Changing both a manifest and an image cannot silently redefine authority.

## Execution flow

```text
verify bundle
  → view four images in authority order
  → inspect target source
  → validate workflow brief
  → derive character role and product UI independently
  → select direction
  → modify/create editable target source
  → implement real behavior and states
  → run/render and compare
  → repair
  → export evidence and handoff
```

## Protocols

`workflow-brief.schema.json` describes product truth: users, entities, screens, actions, transitions, states, surfaces, constraints, and primary journey.

`mouse-ui-project.schema.json` describes the selected design recipe. Identity anchors remain exact, while persona, theme, states, and surfaces are project-specific. Each state records role, expression, pose, hand mode, props, bubble policy, and copy.

Both protocols reject unknown structural fields while keeping domain state and surface identifiers open.

## Model neutrality

The canonical Skill and references are the semantic source. Adapters only map host capabilities to that contract. A host without image viewing cannot make visual claims; a host without a target renderer cannot mark that surface rendered or accepted.

## Packaging and security

The packager accepts exactly 19 known plugin files. Unknown files—including `.env`, credentials, backups, tests, or scratch outputs—fail packaging instead of being silently included.

For every source file it:

- rejects symlinks, non-regular files, and multiple hard links;
- requires nonzero BigInt device/inode identity;
- revalidates identity, size, timestamps, and link count through the open handle before and after reading;
- bounds total input size;
- emits deterministic, stored ZIP entries with fixed metadata;
- preserves the last valid archive when a new package attempt fails.

The visual bundle verifier rejects path escape, symlink chains, duplicate paths, authority changes, hash changes, and dimension changes. Errors are bounded JSON and do not expose host paths.

## Rights boundary

All four visual-grounding assets are `private-reference-only`. They may be inspected locally but are not licensed for public redistribution, tracing, or rights claims. The generated private-local ZIP inherits this restriction.

## Acceptance model

Repository gates prove the plugin contract and package. Each future invocation has separate generated, tested, run, rendered, visually checked, and accepted states. Only the evidence appropriate to the actual target surface can advance those gates.

