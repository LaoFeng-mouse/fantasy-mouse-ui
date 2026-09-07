const prompt = "Design a local desktop research library. Import → index → tag → search → open. Preserve work on failure and retry safely.";
const states = ["empty-library", "indexing", "import-failed", "open-result"];
const journey = ["EMPTY", "IMPORT", "INDEX", "TAG", "SEARCH", "OPEN"];

const byId = (id) => document.getElementById(id);
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function renderPrompt(seconds) {
  const progress = clamp(seconds / 2.7);
  byId("prompt-text").textContent = prompt.slice(0, Math.ceil(prompt.length * progress));
  document.querySelector(".caret").style.opacity = seconds < 3 ? "1" : "0";
}

function renderModeAndBrief(seconds) {
  byId("mode-card").classList.toggle("visible", seconds >= 3);
  byId("workflow-card").classList.toggle("visible", seconds >= 6);
  const completed = Math.floor(clamp((seconds - 6) / 6) * journey.length);
  byId("flow").innerHTML = journey.map((step, index) => {
    const state = index < completed ? "complete" : index === completed ? "active" : "";
    return `<span class="flow-step ${state}">${step}</span>`;
  }).join("");
}

function currentScene(seconds) {
  if (seconds < 12) return { state: "empty-library", label: "STRUCTURE", note: "Product-first WPF workspace · real controls · local-only status" };
  if (seconds < 14.5) return { state: "indexing", label: "INDEXING", note: "Working librarian uses one connected action-hand pair" };
  if (seconds < 16.5) return { state: "import-failed", label: "SAFE RECOVERY", note: "Preserved file selection · fingertip meets the real Retry control" };
  return { state: "open-result", label: seconds < 18 ? "RETRY → OPEN" : "ACCEPTED", note: "Primary journey passed · editable source · rendered and visually checked" };
}

function renderArchiveLanternState(seconds) {
  const scene = currentScene(seconds);
  for (const image of document.querySelectorAll(".screen-frame img")) {
    image.classList.toggle("active", image.dataset.state === scene.state);
  }
  byId("state-pill").textContent = scene.label;
  byId("annotation").textContent = scene.note;
  byId("annotation").classList.toggle("visible", seconds >= 6);
  byId("screen-frame").classList.toggle("scanning", seconds >= 6 && seconds < 12);

  const gates = [
    ["gate-structure", seconds >= 9],
    ["gate-character", seconds >= 14],
    ["gate-recovery", seconds >= 16.5],
    ["gate-accepted", seconds >= 18],
  ];
  for (const [id, complete] of gates) {
    const icon = byId(id);
    icon.textContent = complete ? "●" : "○";
    icon.parentElement.classList.toggle("complete", complete);
  }
}

window.setDemoFrame = (frame) => {
  const seconds = frame / 12;
  document.documentElement.style.setProperty("--demo-time", `${seconds}s`);
  byId("clock").textContent = `00:${String(Math.min(22, Math.floor(seconds))).padStart(2, "0")}`;
  renderPrompt(seconds);
  renderModeAndBrief(seconds);
  renderArchiveLanternState(seconds);
};

window.setDemoFrame(0);
