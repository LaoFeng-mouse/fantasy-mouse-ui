# Fantasy Mouse UI operator runbook

## Prerequisites

- Windows, macOS, or Linux with Node.js 24 or later;
- pnpm 11;
- Python 3 only when running the official Skill/plugin validators.

## Clean setup

```powershell
pnpm install
```

The workspace permits the `esbuild` post-install step through `pnpm-workspace.yaml`. Do not broadly enable unreviewed dependency build scripts.

## Required repository gates

```powershell
pnpm test
pnpm typecheck
pnpm plugin:verify
pnpm plugin:package
git diff --check
```

Expected test scope is `tests/plugin/**/*.test.ts`. `.worktrees`, `node_modules`, and `dist` are excluded so stale linked worktrees cannot contaminate the main-branch result.

The FIFO validation test is skipped on Windows because Windows has no POSIX FIFO. All other plugin tests must pass.

## Optional official validators

```powershell
py -3 -X utf8 C:\Users\34615\.codex\skills\.system\skill-creator\scripts\quick_validate.py plugins\fantasy-mouse-ui\skills\fantasy-mouse-ui
py -3 C:\Users\34615\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py plugins\fantasy-mouse-ui
```

These paths are local Codex installations. On another host, use that host's official validators or omit this optional step.

## Package verification

Run packaging twice and compare hashes:

```powershell
pnpm plugin:package
Get-FileHash -Algorithm SHA256 dist\plugin\fantasy-mouse-ui-private-local.zip
pnpm plugin:package
Get-FileHash -Algorithm SHA256 dist\plugin\fantasy-mouse-ui-private-local.zip
```

The hashes must match. A changed plugin source intentionally produces a new hash.

## Common failures

| Error | Meaning | Action |
| --- | --- | --- |
| `invalid-asset-authority` | Manifest authority differs from the verifier trust root | Restore the approved manifest or deliberately update verifier, tests, docs, and review together |
| `asset-hash-mismatch` | Visual bytes changed | Restore approved bytes; do not recompress assets silently |
| `unexpected-plugin-entry` | A file outside the 19-file allowlist exists | Inspect it; remove it or explicitly review and update the allowlist/tests |
| `plugin-source-multi-link` | A package source has another hard link | Replace it with an independent regular file |
| `plugin-source-unreliable-identity` | Filesystem returned zero device/inode identity | Package from a filesystem with reliable identities |
| `plugin-source-changed` | Source mutated while being read | Stop concurrent writers and retry |
| `visual-grounding-unavailable` | Invoking Agent cannot view all required images | Hand off visual work to an image-capable Agent |
| `anti-template-baseline-unavailable` | No allowed unrelated comparison exists | Complete provenance checks and report only that subgate unavailable |

## Publication and installation

- Never publish `fantasy-mouse-ui-private-local.zip`.
- Do not hand-edit a host's plugin registry or marketplace file.
- Host-specific installation must use that host's supported plugin/Skill mechanism and should be tested in a new task.
- Installation status is not implied by a successful local build.

## Release checklist

- working tree clean;
- all required gates pass;
- two package hashes match;
- ZIP contains exactly the expected plugin files;
- private-reference warning is present in the handoff;
- no sample software, frontend starter, tests, docs, `.env`, or repository debris is inside the ZIP.

