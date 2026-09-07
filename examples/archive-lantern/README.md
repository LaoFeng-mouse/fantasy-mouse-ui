# Archive Lantern

Archive Lantern is the accepted Strict desktop benchmark: a real PowerShell 7 and WPF personal-library application. Its verified journey is:

`empty-library -> import -> indexing -> indexed -> tag -> search -> open-result`

The same state and action functions drive the visible window, deterministic smoke run, and screenshot renderer. The recovery path preserves the current library and selected file, retries safely, detects a duplicate without overwriting tags, and recovers from a no-results search.

## Run it

```powershell
pwsh -Sta -NoProfile -File .\output\ArchiveLantern.ps1 -Mode Ui
```

Use `Try damaged sample` to exercise the visible failure and retry state. Importing a second time exercises duplicate preservation. Search activates with Enter, result rows open with Enter, every interactive control has a visible keyboard focus style, and the status bar is a polite live region.

The non-UI smoke contract is:

```powershell
pwsh -NoProfile -File .\output\ArchiveLantern.ps1 -Mode Smoke
```

It returns exactly:

```json
{"ok":true,"journey":["empty-library","import","indexing","indexed","tag","search","open-result"],"recovery":"passed"}
```

## Evidence

Four 1440 by 900 renders cover empty, indexing, open-result, and failed-import states. `evidence/comparison.png` reviews the canonical identity, action-hand authority, composition-only reference, this desktop result, and the three previously accepted benchmark surfaces together.

The librarian appears only in empty, indexing, and failed-import states. Empty keeps the chest U as its sole resting hand pair. Indexing and recovery remove that resting pair and use exactly one connected action-hand pair; the recovery pointer touches the real Retry button.

The UI was also launched as a visible WPF window and closed cleanly through the timed acceptance harness. Render mode captures that same real window tree off-screen at 1440 by 900; it does not substitute a static mockup.

## Generated asset record

- `librarian-empty.png`: restrained librarian waistcoat, empty catalogue tray, canonical resting anatomy.
- `librarian-indexing.png`: one connected hand pair operates a real index card; no chest U.
- `librarian-recovery.png`: one hand preserves the file card while the other points to Retry; no chest U.

All three generated assets preserve the grey photographic face, narrowed eyes, toothy grin, thin ears, white bean body, and compact proportions. Interface layout, typography, palette, controls, and materials derive from the archive workflow and Windows accessibility conventions—not from bundled composition images.
