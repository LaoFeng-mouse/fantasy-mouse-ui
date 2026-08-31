# Character-role derivation

| Workflow state | Participation | Role and behavior | Hand contract |
| --- | --- | --- | --- |
| `monitoring` | Restrained | The `incident-dispatcher` supports queue orientation without competing with incident data. | Preserve the chest V/U as the sole default clasped hand pair; no action-hand pair. |
| `incident-selected` | Restrained | The dispatcher acknowledges that a responder has selected an incident and yields priority to operational details. | Preserve the chest V/U as the sole default clasped hand pair; no action-hand pair. |
| `assigning` | Active | The dispatcher participates in the ownership handoff and may connect to the real assignment control. | Use exactly one coherent action-hand pair; no chest V/U. |
| `assigned` | Restrained | The dispatcher confirms ownership without implying another action is underway. | Preserve the chest V/U as the sole default clasped hand pair; no action-hand pair. |
| `resolving` | Active | The dispatcher participates in resolution confirmation and may connect to the real resolution control. | Use exactly one coherent action-hand pair; no chest V/U. |
| `resolved` | Restrained | The dispatcher supports closure while the resolved status remains primary. | Preserve the chest V/U as the sole default clasped hand pair; no action-hand pair. |
| `blocked-assignment` | Recovery | The dispatcher may direct attention to the owner requirement without blame or alarm inflation. | Preserve the chest V/U as the sole default clasped hand pair; no action-hand pair. |
| `failed-resolution` | Recovery | The dispatcher may direct attention to the missing note and retry path without implying resolution succeeded. | Preserve the chest V/U as the sole default clasped hand pair; no action-hand pair. |

## Boundaries

- Character identity and anatomy must come only from the canonical visual authorities after they are actually viewed.
- The mouse is not persistent navigation chrome and must not be pasted over a generic dashboard.
- Action mode is limited to `assigning` and `resolving`; it is prohibited in every other state.
- Default and resting appearances preserve the chest V/U as the sole default clasped hand pair; only `assigning` and `resolving` action mode removes it and replaces it with exactly one coherent action-hand pair.
- No generated character asset or visual-continuity judgment exists yet; this table is a pending implementation contract.
