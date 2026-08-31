import { escapeHtml, initialSignalState, reduceSignal } from "./state.mjs";

const incidents = [
  { id: "INC-4821", severity: "SEV-1", title: "Checkout API latency surge", service: "payments", age: "08m", region: "us-east-1", started: "20:34 UTC", impact: "31% of checkout requests exceed 2.5s", runbook: "Gateway Saturation v4.2" },
  { id: "INC-4819", severity: "SEV-1", title: "Auth token validation failures", service: "auth-edge", age: "14m", region: "eu-west-1", started: "20:28 UTC", impact: "9.8% authentication error rate", runbook: "Token Validation v2.1" },
  { id: "INC-4817", severity: "SEV-2", title: "Queue consumer lag increasing", service: "events", age: "21m", region: "us-west-2", started: "20:21 UTC", impact: "18k messages behind current offset", runbook: "Consumer Lag v3.0" },
  { id: "INC-4815", severity: "SEV-2", title: "Inventory cache miss spike", service: "catalog", age: "27m", region: "ap-south-1", started: "20:15 UTC", impact: "Cache hit ratio declined to 71%", runbook: "Cache Recovery v1.8" },
  { id: "INC-4813", severity: "SEV-3", title: "Webhook delivery retries", service: "integrations", age: "34m", region: "global", started: "20:08 UTC", impact: "643 deliveries awaiting retry", runbook: "Webhook Replay v2.4" },
  { id: "INC-4810", severity: "SEV-2", title: "Search index replication drift", service: "search", age: "41m", region: "eu-central-1", started: "20:01 UTC", impact: "Replica is 46 seconds behind", runbook: "Index Drift v1.6" },
  { id: "INC-4808", severity: "SEV-3", title: "Image transform saturation", service: "media", age: "52m", region: "us-east-2", started: "19:50 UTC", impact: "Worker pool at 87% utilization", runbook: "Media Capacity v2.2" },
  { id: "INC-4806", severity: "SEV-2", title: "Database replica connection churn", service: "accounts", age: "01h", region: "us-east-1", started: "19:42 UTC", impact: "Connection turnover 4× baseline", runbook: "Replica Health v3.3" },
  { id: "INC-4804", severity: "SEV-3", title: "Email provider deferrals", service: "messaging", age: "01h", region: "global", started: "19:33 UTC", impact: "2.1% delivery deferral rate", runbook: "Provider Deferral v1.4" },
  { id: "INC-4801", severity: "SEV-2", title: "Feature flag evaluation timeout", service: "control", age: "01h", region: "ap-northeast-1", started: "19:21 UTC", impact: "Fallback values used for 4.3% calls", runbook: "Flag Service v2.0" },
  { id: "INC-4798", severity: "SEV-3", title: "Audit export job stalled", service: "compliance", age: "02h", region: "eu-west-1", started: "18:55 UTC", impact: "One enterprise export delayed", runbook: "Export Recovery v1.2" },
  { id: "INC-4795", severity: "SEV-1", title: "DNS resolution instability", service: "network", age: "02h", region: "sa-east-1", started: "18:38 UTC", impact: "Intermittent failures across two zones", runbook: "DNS Failover v4.0" },
];

const app = document.querySelector(".app-shell");
const list = document.querySelector(".incident-list");
const detail = document.querySelector(".detail-content");
const liveRegion = document.querySelector("[data-testid='live-region']");
const dispatcherImage = document.querySelector("[data-testid='dispatcher-image']");
const dispatcherMessage = document.querySelector("[data-testid='dispatcher-message']");
const dispatcherState = document.querySelector("[data-testid='dispatcher-state']");

let state = initialSignalState();

function severityClass(severity) {
  return severity.toLowerCase().replace("sev-", "sev-");
}

function selectedIncident() {
  return incidents.find((incident) => incident.id === state.incidentId) ?? null;
}

function renderList() {
  list.innerHTML = incidents.map((incident) => `
    <button class="incident-row" type="button" data-incident-id="${incident.id}" data-action="select-incident" aria-current="${incident.id === state.incidentId}">
      <span class="signal-main">
        <span class="signal-title"><span class="severity ${severityClass(incident.severity)}">${incident.severity}</span><span>${incident.title}</span></span>
        <span class="incident-id">${incident.id} · ${incident.region}</span>
      </span>
      <span class="service">${incident.service}</span>
      <span class="age">${incident.age}</span>
    </button>`).join("");
}

function workflowSteps() {
  const phaseOrder = { monitoring: 0, "incident-selected": 1, assigning: 2, blocked: 2, assigned: 2, resolving: 3, "failed-resolution": 3, resolved: 4 };
  const current = phaseOrder[state.phase] ?? 0;
  return ["Detected", "Reviewed", "Assigned", "Resolved"].map((label, index) => {
    const step = index + 1;
    const className = current > step ? "done" : current === step ? "active" : "";
    return `<span class="workflow-step ${className}">${label}</span>`;
  }).join("");
}

function actionMarkup() {
  switch (state.phase) {
    case "incident-selected":
      return state.owner
        ? `<div class="action-zone"><h4>Resolution retry ready</h4><p>${state.owner} remains the confirmed owner. Resume the resolution note.</p><button class="button primary" type="button" data-action="start-resolution">Resume resolution</button></div>`
        : `<div class="action-zone"><h4>Ownership required</h4><p>Confirm an accountable responder before mitigation work begins.</p><button class="button primary" type="button" data-action="start-assignment">Assign incident</button></div>`;
    case "assigning":
      return `<form class="action-zone" data-form="assignment" novalidate><h4>Assign an incident owner</h4><p>The owner receives command responsibility for this active signal.</p><div class="action-row"><label class="owner-field"><span class="field-label">On-call responder</span><select name="owner" data-testid="owner-input" aria-describedby="owner-help"><option value="">Choose owner…</option><option>Maya Chen</option><option>Jon Bell</option><option>Priya Shah</option><option>Diego Ruiz</option></select></label><button class="button primary" type="submit" data-action="confirm-assignment">Confirm assignment</button></div><span id="owner-help" class="sr-only">An owner is required.</span></form>`;
    case "blocked":
      return `<div class="action-zone"><div class="status-box error" role="alert"><span class="status-icon" aria-hidden="true">!</span><div><b>Assignment blocked</b><p>${state.error}</p><button class="button danger" type="button" data-action="retry">Review and retry</button></div></div></div>`;
    case "assigned":
      return `<div class="action-zone"><div class="status-box"><span class="status-icon" aria-hidden="true">✓</span><div><b>Owned by ${state.owner}</b><p>Ownership is confirmed. Add the verified mitigation outcome to resolve.</p><button class="button primary" type="button" data-action="start-resolution">Resolve incident</button></div></div></div>`;
    case "resolving":
      return `<form class="action-zone" data-form="resolution" novalidate><h4>Record the resolution</h4><p>Write a concise operational note for responders and the audit timeline.</p><label><span class="field-label">Resolution note</span><textarea class="note-field" name="note" data-testid="resolution-input" placeholder="What changed and how was service restored?">${escapeHtml(state.note)}</textarea></label><div class="action-row"><button class="button primary" type="submit" data-action="confirm-resolution">Confirm resolution</button></div></form>`;
    case "failed-resolution":
      return `<div class="action-zone"><div class="status-box error" role="alert"><span class="status-icon" aria-hidden="true">!</span><div><b>Resolution not recorded</b><p>${state.error}</p><button class="button danger" type="button" data-action="retry">Review and retry</button></div></div></div>`;
    case "resolved":
      return `<div class="action-zone"><div class="status-box"><span class="status-icon" aria-hidden="true">✓</span><div><b>Incident resolved</b><p>${escapeHtml(state.note)}</p><button class="button" type="button" data-action="return-monitoring">Return to queue</button></div></div></div>`;
    default:
      return "";
  }
}

function renderDetail() {
  const incident = selectedIncident();
  if (!incident) {
    detail.innerHTML = `<div class="empty-detail"><div><div class="empty-radar" aria-hidden="true"></div><h2 id="detail-title">No incident selected</h2><p>Use the incident queue to inspect impact, establish ownership, and begin a controlled response.</p></div></div>`;
    return;
  }
  detail.innerHTML = `
    <div class="incident-head">
      <div class="incident-meta"><span class="severity ${severityClass(incident.severity)}">${incident.severity}</span><span>${incident.id}</span><span>•</span><span>${incident.region}</span></div>
      <h3 id="detail-title">${incident.title}</h3>
      <p>${incident.impact}. Correlated signals indicate sustained pressure requiring responder review.</p>
    </div>
    <div class="context-grid"><div><span>Started</span><b>${incident.started}</b></div><div><span>Service</span><b>${incident.service}</b></div><div><span>Runbook</span><b>${incident.runbook}</b></div></div>
    <div class="workflow"><div class="workflow-steps" aria-label="Incident workflow">${workflowSteps()}</div>${actionMarkup()}</div>`;
}

function renderDispatcher() {
  const actionMode = state.phase === "assigning" || state.phase === "resolving";
  const labels = {
    monitoring: ["Monitoring", "Twelve active signals are under watch. Select a row to begin."],
    "incident-selected": ["Signal reviewed", "Context is ready. Establish an accountable owner next."],
    assigning: ["Routing owner", "Opening the command channel for a confirmed responder."],
    blocked: ["Recovery ready", "No owner was chosen. Review the incident and try again."],
    assigned: ["Owner confirmed", `${state.owner} now holds command responsibility.`],
    resolving: ["Recording outcome", "Capturing the verified mitigation note for the command log."],
    "failed-resolution": ["Recovery ready", "The note was empty. Review the incident before retrying."],
    resolved: ["Signal closed", "The incident is resolved and the final status is recorded."],
  };
  dispatcherImage.src = actionMode ? "./assets/dispatcher-action.png" : "./assets/dispatcher-idle.png";
  dispatcherImage.dataset.handMode = actionMode ? "single-action-pair" : "default-clasped";
  dispatcherImage.alt = actionMode
    ? `Signal Harbor dispatcher working on ${state.phase === "assigning" ? "incident assignment" : "incident resolution"}`
    : "Signal Harbor dispatcher at rest with clasped hands";
  [dispatcherState.textContent, dispatcherMessage.textContent] = labels[state.phase];
}

function render() {
  app.dataset.phase = state.phase;
  renderList();
  renderDetail();
  renderDispatcher();
  liveRegion.textContent = state.liveRegion;
}

function focusAfter(action) {
  const selectors = {
    select: "[data-action='start-assignment']",
    "start-assigning": "[data-testid='owner-input']",
    assign: state.phase === "assigned" ? "[data-action='start-resolution']" : "[data-action='retry']",
    "start-resolving": "[data-testid='resolution-input']",
    resolve: state.phase === "resolved" ? "[data-action='return-monitoring']" : "[data-action='retry']",
    retry: state.incidentId ? state.owner ? "[data-action='start-resolution']" : "[data-action='start-assignment']" : "[data-incident-id]",
  };
  requestAnimationFrame(() => document.querySelector(selectors[action])?.focus());
}

function dispatch(event) {
  state = reduceSignal(state, event);
  render();
  focusAfter(event.type);
}

document.addEventListener("click", (event) => {
  const control = event.target.closest("[data-action]");
  if (!control) return;
  const action = control.dataset.action;
  if (action === "select-incident") dispatch({ type: "select", incidentId: control.dataset.incidentId });
  if (action === "start-assignment") dispatch({ type: "start-assigning" });
  if (action === "start-resolution") dispatch({ type: "start-resolving" });
  if (action === "retry") dispatch({ type: "retry" });
  if (action === "return-monitoring") { state = initialSignalState(); render(); requestAnimationFrame(() => document.querySelector("[data-incident-id]")?.focus()); }
});

document.addEventListener("submit", (event) => {
  if (event.target.matches("[data-form='assignment']")) {
    event.preventDefault();
    dispatch({ type: "assign", owner: new FormData(event.target).get("owner") });
  }
  if (event.target.matches("[data-form='resolution']")) {
    event.preventDefault();
    dispatch({ type: "resolve", note: new FormData(event.target).get("note") });
  }
});

list.addEventListener("keydown", (event) => {
  if (!event.target.matches("[data-incident-id]") || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const rows = [...list.querySelectorAll("[data-incident-id]")];
  const current = rows.indexOf(event.target);
  const next = event.key === "Home" ? 0 : event.key === "End" ? rows.length - 1 : event.key === "ArrowDown" ? Math.min(rows.length - 1, current + 1) : Math.max(0, current - 1);
  rows[next].focus();
});

render();
