# Signal Harbor implementation prompt

Create a product-specific incident-monitoring SaaS dashboard for operations responders. Use the validated Signal Harbor workflow brief and resolve execution mode through `public-benchmark`; the effective mode must be Strict.

Implement the primary journey exactly as `monitoring -> incident-selected -> assigning -> assigned -> resolving -> resolved`. Also implement recoverable blocked assignment when no owner is chosen, failed resolution when no resolution note is supplied, and explicit retry controls. Bind semantic incident rows, buttons, owner input, resolution note input, deterministic post-action focus, a polite live region, keyboard navigation, visible focus, sufficient contrast, and reduced-motion behavior.

Use a dark, dense dashboard only because fast incident scanning, queue triage, and operational status differentiation require it. Do not derive layout, palette, typography, materials, components, or decoration from character or composition references.

The mouse role is `incident-dispatcher`. In default, resting, and recovery appearances, retain the chest V/U as the sole clasped hand pair. Show action mode only while assigning or resolving; in action mode remove the chest V/U and replace it with exactly one coherent action-hand pair connected to the relevant workflow control. Do not use the mouse as persistent navigation chrome or as a decorative mascot pasted over a generic dashboard.

Keep generated, tested, run, rendered, visually checked, and accepted truth separate. Do not mark any gate complete until real source, browser behavior, screenshots, same-context comparison, anti-template review, accessibility checks, and repair evidence exist.
