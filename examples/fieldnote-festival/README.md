# Fieldnote Festival

Fieldnote Festival is the accepted Strict website benchmark for a regional botany event. Its verified journey is:

`browse-program -> filter-day -> inspect-session -> add-to-plan -> resolve-time-conflict -> saved-plan`

The standalone site lets visitors filter realistic sessions, inspect field details, build a plan, and resolve a genuine schedule overlap without mutating the existing plan before confirmation. The organic editorial direction comes from the event and website workflow, not from the Fantasy Mouse composition references.

The mouse participates only as a regional field guide in the opening editorial note and empty-plan invitation. The resting guide retains the chest U as the sole clasped hand pair. The notebook action guide removes the chest U and uses exactly one body-connected pair: one hand holds the open specimen notebook while the other points to it. Navigation, program cards, the conflict dialog, and saved confirmation remain character-free.

## Result

Source and mirrored output are dependency-free and byte-identical. Four screenshots record the opening program, desktop conflict, saved plan, and 390 by 844 mobile conflict. The native dialog preserves the old plan until replacement, supports Escape cancellation, and returns focus to the newly rendered initiating control. `evidence/comparison.png` places canonical identity, action-hand anatomy, one composition-only reference, and the rendered website in the same review context.

## Generated asset record

Authorities inspected in manifest order:

- `canonical-protagonist.png`
- `processing-action-hands.png`
- `processing-with-bubble.png`
- `processing-without-bubble.png`

Approved generated assets:

- `source/assets/field-guide-idle.png` — regional field guide at rest, moss neckerchief, chest U retained, notebook beside the body and not held.
- `source/assets/field-guide-notebook.png` — empty-plan guide holding an open specimen notebook and pointing to it with exactly one action-hand pair; chest U absent.

The idle generation prompt required the canonical compact gray photographic face, narrow eyes, toothy grin, thin ears, white bean body, moss neckerchief, chest U as the only clasped pair, and a closed notebook beside the character on a flat green key background. The action prompt required the same identity and neckerchief, exactly one connected pair of arms and hands, one hand holding an open specimen notebook, one pointing to it, no chest U, and the same flat green key background. The generator outputs were chroma-keyed to genuine alpha, trimmed visually, resized to 800 by 800, and checked for non-opaque bounds. Their generated-image records were `exec-bd81d21d-8b8d-4664-ab2f-3fc218eb7e16.png` and `exec-48e130b8-c33f-45e8-a018-ece5dd347b06.png`; source and output bytes match.

## Browser verification record

The accepted run used Playwright CLI against the standalone `output/` server. At 1440 by 900 it filtered Saturday, inspected Fern Walk at Mill Creek, added it, inspected Seed Library Exchange, opened the overlap dialog, proved the existing plan remained intact, cancelled, verified focus returned to `Add to my field plan`, reopened the conflict, replaced the session, and verified the saved plan contained only Seed Library Exchange.

At 390 by 844, the same path was activated by keyboard using Enter and Space. The dialog focused the primary recovery action, Escape restored focus, and measured horizontal overflow was 0 px. Reduced-motion emulation reduced animation and transition durations to 0.01 ms. Measured contrast ratios were 11.99 for body text and 4.93 for the clay primary action. A fresh browser session reported zero console and page errors.

Visual review produced these repairs:

- Converted generator key-color backgrounds into true alpha and optimized both role assets below the artifact limit.
- Replaced stale-element focus restoration with a stable session selector so cancellation returns focus after detail rerendering.
- Shortened the visible plan removal label while retaining the full session title in its accessible name, preventing the narrow itinerary column from collapsing.
- Kept the editorial guide and empty-plan guide scoped to their semantic states; the conflict and saved states remain literal and character-free.

The repository tests guard the reducer contract, clash immutability, atomic replacement, native dialog and focus hooks, live region, 44 px controls, responsive/reduced-motion rules, safe DOM construction, character-role scope, and source/output parity. The real-browser journey remains a recorded manual Playwright CLI acceptance run rather than a permanent Playwright dependency.
