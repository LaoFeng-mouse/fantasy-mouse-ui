import { festivalSessions, initialFestivalState, reduceFestival, sessionsClash } from "./state.mjs";

const sessionDetails = [
  { ...festivalSessions["night-pollinators"], time: "6:30–8:00 PM", date: "Friday 14", venue: "Lantern Meadow", habitat: "Meadow edge", guide: "Dr. Imani Cole", description: "Trace evening flower signals and record the moths, beetles, and night bees that answer them." },
  { ...festivalSessions["fern-walk"], time: "10:00–11:15 AM", date: "Saturday 15", venue: "Mill Creek Gate", habitat: "Shaded ravine", guide: "Mara Bell", description: "Read the creek through fern communities, sori patterns, and the cool pockets held by stone." },
  { ...festivalSessions["seed-library"], time: "10:30 AM–12:00 PM", date: "Saturday 15", venue: "Grange Hall", habitat: "Community archive", guide: "Owen Reyes", description: "Bring a story, take a locally adapted seed, and learn how regional memory travels in small envelopes." },
  { ...festivalSessions["river-moss"], time: "1:30–2:45 PM", date: "Saturday 15", venue: "Wet Lab Tent", habitat: "River margin", guide: "Prof. Lin Adebayo", description: "Use hand lenses and water clues to identify moss communities along the restored river edge." },
  { ...festivalSessions["prairie-seed"], time: "11:00 AM–12:15 PM", date: "Sunday 16", venue: "Rail Prairie", habitat: "Dry prairie", guide: "Nora Whitecloud", description: "Walk a remnant prairie and hear how collecting protocols protect both seed and relationship." },
];
const byId = new Map(sessionDetails.map((session) => [session.id, session]));
const dayLabels = { all: "All days", friday: "Friday", saturday: "Saturday", sunday: "Sunday" };

const sessionList = document.querySelector("[data-testid='session-list']");
const sessionCount = document.querySelector("[data-testid='session-count']");
const detail = document.querySelector("[data-testid='session-detail']");
const plan = document.querySelector("[data-testid='plan-content']");
const planCount = document.querySelector("[data-testid='plan-count']");
const liveRegion = document.querySelector("[data-testid='live-region']");
const dialog = document.querySelector("[data-testid='conflict-dialog']");
const conflictDescription = document.querySelector("[data-testid='conflict-description']");
const conflictTimes = document.querySelector("[data-testid='conflict-times']");

let state = initialFestivalState();
let initiatingControl = null;
let initiatingSessionId = null;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(label, action, className = "") {
  const control = element("button", className, label);
  control.type = "button";
  control.dataset.action = action;
  return control;
}

function renderFilters() {
  document.querySelectorAll("[data-day]").forEach((control) => {
    control.setAttribute("aria-pressed", String(control.dataset.day === state.day));
  });
}

function renderSessions() {
  const visible = sessionDetails.filter((session) => state.day === "all" || session.day === state.day);
  sessionCount.textContent = `${visible.length} ${visible.length === 1 ? "session" : "sessions"}`;
  const fragment = document.createDocumentFragment();
  for (const session of visible) {
    const card = element("article", "session-card");
    card.dataset.day = session.day;
    const meta = element("p", "session-meta", `${session.date} · ${session.time}`);
    const title = element("h4", "", session.title);
    const habitat = element("p", "habitat", session.habitat);
    const inspect = button(`Inspect ${session.title}`, "inspect", "session-open");
    inspect.dataset.sessionId = session.id;
    inspect.setAttribute("aria-label", `Inspect ${session.title}, ${session.date} at ${session.time}`);
    card.append(meta, title, habitat, inspect);
    fragment.append(card);
  }
  sessionList.replaceChildren(fragment);
}

function renderDetail() {
  const session = byId.get(state.selectedId);
  if (!session) {
    const note = element("div", "detail-placeholder");
    const heading = element("h3", "", "Choose a field session");
    heading.id = "detail-title";
    note.append(element("p", "overline", "SPECIMEN VIEW"), heading, element("p", "", "Open any program entry for habitat notes, meeting details, and planning."));
    detail.replaceChildren(note);
    return;
  }
  const meta = element("p", "overline", `${session.date} · ${session.time}`);
  const heading = element("h2", "", session.title);
  heading.id = "detail-title";
  const description = element("p", "detail-copy", session.description);
  const facts = element("dl", "detail-facts");
  for (const [label, value] of [["Meet", session.venue], ["Guide", session.guide], ["Habitat", session.habitat]]) {
    const group = element("div");
    group.append(element("dt", "", label), element("dd", "", value));
    facts.append(group);
  }
  const add = button(state.plan.includes(session.id) ? "Already in my plan" : "Add to my field plan", "add-session", "primary add-session");
  add.dataset.sessionId = session.id;
  add.disabled = state.plan.includes(session.id);
  detail.replaceChildren(meta, heading, description, facts, add);
}

function renderPlan() {
  planCount.textContent = String(state.plan.length);
  if (!state.plan.length) {
    const empty = element("div", "empty-plan");
    const image = element("img");
    image.src = "./assets/field-guide-notebook.png";
    image.alt = "The festival field guide points to an open specimen notebook with one pair of action hands";
    image.dataset.handMode = "single-action-pair";
    empty.append(image, element("h3", "", "Your pages are open"), element("p", "", "Inspect a session, then add it here. We will flag overlapping times before anything changes."), button("Browse Saturday", "browse-saturday", "text-button"));
    plan.replaceChildren(empty);
    return;
  }
  const list = element("ol", "plan-list");
  for (const id of state.plan) {
    const session = byId.get(id);
    const item = element("li");
    const copy = element("div");
    copy.append(element("time", "", session.time), element("strong", "", session.title), element("span", "", session.venue));
    const remove = button("Remove", "remove-session", "remove-session");
    remove.setAttribute("aria-label", `Remove ${session.title}`);
    remove.dataset.sessionId = id;
    item.append(copy, remove);
    list.append(item);
  }
  const saved = element("p", "saved-note", state.phase === "saved" ? "✓ Plan saved on this device" : "Your current field plan");
  plan.replaceChildren(saved, list);
}

function conflictPair() {
  const pending = state.pendingId;
  const existing = state.plan.find((id) => sessionsClash(id, pending));
  return { existing, pending };
}

function openConflict() {
  const { existing, pending } = conflictPair();
  const oldSession = byId.get(existing);
  const newSession = byId.get(pending);
  conflictDescription.textContent = `${newSession.title} overlaps ${oldSession.title}. Your current plan has not changed.`;
  const current = element("div", "conflict-row");
  current.append(element("span", "", "CURRENT"), element("strong", "", oldSession.title), element("time", "", oldSession.time));
  const requested = element("div", "conflict-row requested");
  requested.append(element("span", "", "REQUESTED"), element("strong", "", newSession.title), element("time", "", newSession.time));
  conflictTimes.replaceChildren(current, requested);
  dialog.showModal();
  requestAnimationFrame(() => dialog.querySelector("[data-action='replace-session']")?.focus());
}

function render() {
  renderFilters();
  renderSessions();
  renderDetail();
  renderPlan();
  liveRegion.textContent = state.liveRegion;
  document.body.dataset.phase = state.phase;
}

function dispatch(event) {
  state = reduceFestival(state, event);
  render();
}

function focusInitiator() {
  if (initiatingControl?.isConnected) {
    initiatingControl?.focus();
    return;
  }
  document.querySelector(`[data-action="add-session"][data-session-id="${initiatingSessionId}"]`)?.focus();
}

document.querySelector("[data-testid='day-filters']").addEventListener("click", (event) => {
  const control = event.target.closest("[data-day]");
  if (!control) return;
  dispatch({ type: "filter-day", day: control.dataset.day });
});

document.addEventListener("click", (event) => {
  const control = event.target.closest("[data-action]");
  if (!control) return;
  const action = control.dataset.action;
  if (action === "inspect") {
    dispatch({ type: "inspect", id: control.dataset.sessionId });
    requestAnimationFrame(() => detail.focus());
  }
  if (action === "add-session") {
    initiatingControl = control;
    initiatingSessionId = control.dataset.sessionId;
    dispatch({ type: "add", id: control.dataset.sessionId });
    if (state.phase === "conflict") openConflict();
    else requestAnimationFrame(() => document.querySelector("[data-testid='plan-region']")?.focus());
  }
  if (action === "remove-session") {
    dispatch({ type: "remove", id: control.dataset.sessionId });
    requestAnimationFrame(() => document.querySelector("[data-testid='plan-region']")?.focus());
  }
  if (action === "browse-saturday") {
    dispatch({ type: "filter-day", day: "saturday" });
    document.querySelector("#program")?.scrollIntoView({ block: "start" });
  }
  if (action === "cancel-conflict") {
    dispatch({ type: "close-dialog" });
    dialog.close("cancel");
    requestAnimationFrame(focusInitiator);
  }
  if (action === "replace-session") {
    const { existing, pending } = conflictPair();
    dispatch({ type: "replace", removeId: existing, addId: pending });
    dialog.close("replace");
    requestAnimationFrame(() => document.querySelector("[data-testid='plan-region']")?.focus());
  }
});

dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  dispatch({ type: "close-dialog" });
  dialog.close("cancel");
  requestAnimationFrame(focusInitiator);
});

render();
