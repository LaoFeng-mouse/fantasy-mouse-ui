# Archive Lantern benchmark prompt

Design and implement Archive Lantern as a Windows desktop personal-library application using PowerShell 7, WPF, and XAML. Treat the target workflow, Windows desktop conventions, and accessibility requirements as the only authority for the interface system.

Implement this primary journey exactly:

`empty-library -> import -> indexing -> indexed -> tag -> search -> open-result`

The user starts with an empty library, invokes a real import control, sees indexing progress, reaches an indexed collection, adds a tag, searches by title or tag, and opens the selected result. Also implement a failed import with a precise error, a keyboard-reachable retry that resumes safely, duplicate detection that keeps one canonical item without silently overwriting metadata, and a no-results state that can recover by clearing or changing the query.

Use real WPF controls and shared state/action functions. Support keyboard traversal and activation, visible focus, accessible names, status announcements for importing, indexing, duplicate detection, success, failure, search results, and recovery, plus reduced-motion behavior. Preserve user data on failed import and retry.

The Fantasy Mouse character is a workflow participant, not UI-style evidence. Use the canonical identity anchors unchanged. Show the mouse as a librarian only in empty-library, indexing, and recovery states. Empty-library uses the default clasped chest V/U as the only hand pair. Indexing and recovery use exactly one body-connected action-hand pair, remove the chest V/U completely, and make the hands touch the real book/card/index or retry control. Do not copy the bundled composition layouts, palette, materials, typography, components, or character placement.

Run in strict mode because this is a public benchmark. Keep generated, tested, run, rendered, visually checked, and accepted gates separate. Do not claim any gate until its required evidence exists.
