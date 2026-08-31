# Fieldnote Festival implementation prompt

Create an editable, responsive website for a regional botany event. Use an organic editorial direction grounded in field notes, local habitats, specimen records, and a public festival program; do not derive the interface system from Fantasy Mouse reference compositions.

Implement this primary journey exactly:

`browse-program -> filter-day -> inspect-session -> add-to-plan -> resolve-time-conflict -> saved-plan`

Visitors must be able to browse realistic sessions, filter the program by day, open an accessible session detail, and add a session to a personal plan. When a new session overlaps an existing selection, preserve the current plan, place the new selection in a pending conflict state, and open an accessible conflict dialog. Let the visitor replace the clashing session or cancel, return focus to the initiating control, and announce the saved result. Include loading, empty-plan, error, conflict, saved, and recovery states.

Use semantic controls, visible keyboard focus, accessible names, sufficient contrast, status announcements, large touch targets, and a reduced-motion treatment. At narrow widths, preserve reading order and make filters, session details, the plan, and conflict resolution usable without horizontal scrolling.

The Fantasy Mouse is a regional field guide embedded only in the editorial introduction and the empty-plan state. Preserve the canonical compact grey photographic head, tiny horizontal ears, narrowed eyes, human-like toothy grin, compact white drawn bean body, and earnest absurd temperament. The editorial guide uses the default clasped hand pair. The empty-plan guide may use exactly one action-hand pair holding or pointing to a real field notebook; if action hands are used, remove the chest V/U completely. Do not place the mouse in persistent navigation, a floating widget, every card, the conflict dialog, or authoritative saved-state messaging. Do not draw mascot anatomy with CSS, SVG, emoji, text symbols, or placeholders.

Run the benchmark in strict mode because this is a public benchmark. Keep generated, tested, run, rendered, visually checked, and accepted gates separate. Exercise the full journey with mouse and keyboard at desktop and 390 px mobile widths before changing any gate. Capture hero, session-detail, conflict, and saved-plan evidence only after a real runnable implementation exists. Comparison evidence must use only an allowed baseline and must document repeated dimensions, justification, and repairs.

For the current metadata-only phase, do not create source, output, raster assets, screenshots, or comparison artifacts, and do not mark any gate as passed or accepted.
