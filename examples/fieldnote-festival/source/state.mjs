export const festivalSessions = Object.freeze({
  "fern-walk": Object.freeze({ id: "fern-walk", title: "Fern Walk at Mill Creek", day: "saturday", start: 600, end: 675 }),
  "seed-library": Object.freeze({ id: "seed-library", title: "Seed Library Exchange", day: "saturday", start: 630, end: 720 }),
  "river-moss": Object.freeze({ id: "river-moss", title: "River Moss Lab", day: "saturday", start: 810, end: 885 }),
  "night-pollinators": Object.freeze({ id: "night-pollinators", title: "Night Pollinator Atlas", day: "friday", start: 1110, end: 1200 }),
  "prairie-seed": Object.freeze({ id: "prairie-seed", title: "Prairie Seed Stories", day: "sunday", start: 660, end: 735 }),
});

export function initialFestivalState() {
  return {
    phase: "browse-program",
    day: "all",
    selectedId: null,
    plan: [],
    pendingId: null,
    liveRegion: "",
  };
}

export function sessionsClash(leftId, rightId) {
  const left = festivalSessions[leftId];
  const right = festivalSessions[rightId];
  return Boolean(
    left && right && left.day === right.day && left.start < right.end && right.start < left.end,
  );
}

function title(id) {
  return festivalSessions[id]?.title ?? id;
}

function joinTitles(ids) {
  const names = ids.map(title);
  if (names.length < 2) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

export function reduceFestival(state, event) {
  switch (event.type) {
    case "filter-day": {
      const day = String(event.day ?? "all").toLowerCase();
      const label = day === "all" ? "All festival" : `${day[0].toUpperCase()}${day.slice(1)}`;
      return { ...state, phase: "day-filtered", day, liveRegion: `Showing ${label} sessions` };
    }
    case "inspect":
      return { ...state, phase: "session-inspected", selectedId: event.id, liveRegion: `${title(event.id)} details opened` };
    case "add": {
      const id = event.id ?? event.sessionId;
      if (!festivalSessions[id]) return { ...state, phase: "program-error", liveRegion: "That session is unavailable" };
      if (state.plan.includes(id)) return { ...state, phase: "saved", pendingId: null, liveRegion: `${title(id)} is already in your plan` };
      const conflict = state.plan.find((plannedId) => sessionsClash(plannedId, id));
      if (conflict) {
        return { ...state, phase: "conflict", pendingId: id, liveRegion: `${title(id)} overlaps ${title(conflict)}` };
      }
      const plan = [...state.plan, id];
      return { ...state, phase: "saved", plan, pendingId: null, liveRegion: `Saved to your plan: ${title(id)}` };
    }
    case "replace": {
      const addId = event.addId ?? state.pendingId;
      const plan = state.plan.filter((id) => id !== event.removeId && id !== addId);
      plan.push(addId);
      return { ...state, phase: "saved", plan, pendingId: null, liveRegion: `Saved plan: ${joinTitles(plan)}` };
    }
    case "remove": {
      const plan = state.plan.filter((id) => id !== event.id);
      return {
        ...state,
        phase: plan.length ? "saved" : "empty-plan",
        plan,
        pendingId: null,
        liveRegion: plan.length
          ? `Removed ${title(event.id)}. Saved plan: ${joinTitles(plan)}`
          : `Removed ${title(event.id)}. Your plan is empty.`,
      };
    }
    case "close-dialog":
      return {
        ...state,
        phase: state.selectedId ? "session-inspected" : "browse-program",
        pendingId: null,
        liveRegion: state.plan.length ? `Kept ${title(state.plan[0])} in your plan` : "Conflict closed. Your plan is empty.",
      };
    default:
      throw new Error(`unknown-festival-event:${event.type}`);
  }
}
