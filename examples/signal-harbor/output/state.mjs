export function initialSignalState() {
  return {
    phase: "monitoring",
    incidentId: null,
    owner: "",
    note: "",
    error: null,
    liveRegion: "Monitoring 12 active incidents",
  };
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function reduceSignal(state, event) {
  switch (event.type) {
    case "select":
      return {
        ...state,
        phase: "incident-selected",
        incidentId: event.incidentId,
        error: null,
        liveRegion: `Incident ${event.incidentId} selected`,
      };
    case "start-assigning":
      return {
        ...state,
        phase: "assigning",
        error: null,
        liveRegion: `Assigning incident ${state.incidentId}`,
      };
    case "assign": {
      const owner = String(event.owner ?? "").trim();
      if (!owner) {
        return {
          ...state,
          phase: "blocked",
          owner: "",
          error: "Choose an owner before assigning",
          liveRegion: "Assignment blocked. Choose an owner and retry.",
        };
      }
      return {
        ...state,
        phase: "assigned",
        owner,
        error: null,
        liveRegion: `Incident ${state.incidentId} assigned to ${owner}`,
      };
    }
    case "start-resolving":
      return {
        ...state,
        phase: "resolving",
        error: null,
        liveRegion: `Resolving incident ${state.incidentId}`,
      };
    case "resolve": {
      const note = String(event.note ?? "").trim();
      if (!note) {
        return {
          ...state,
          phase: "failed-resolution",
          note: "",
          error: "Add a resolution note before resolving",
          liveRegion: "Resolution failed. Add a note and retry.",
        };
      }
      return {
        ...state,
        phase: "resolved",
        note,
        error: null,
        liveRegion: `Incident ${state.incidentId} resolved`,
      };
    }
    case "retry":
      return state.incidentId
        ? {
            ...state,
            phase: "incident-selected",
            error: null,
            liveRegion: `Retry ready for incident ${state.incidentId}`,
          }
        : initialSignalState();
    default:
      throw new Error(`unknown-signal-event:${event.type}`);
  }
}
