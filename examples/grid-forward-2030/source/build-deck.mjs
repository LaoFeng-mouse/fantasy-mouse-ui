import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const CASE_ROOT = process.env.GRID_FORWARD_CASE_ROOT
  ? path.resolve(process.env.GRID_FORWARD_CASE_ROOT)
  : fileURLToPath(new URL("..", import.meta.url));
const ASSET_DIR = path.join(CASE_ROOT, "source", "assets");
const OUTPUT = path.join(CASE_ROOT, "output", "Grid-Forward-2030.pptx");

const C = Object.freeze({
  paper: "#F4F2ED",
  ink: "#111827",
  muted: "#5F6670",
  rule: "#C9C7C0",
  visibility: "#3265D5",
  flexibility: "#9C5A00",
  resilience: "#A33C6C",
  recommendation: "#167A5A",
  risk: "#B6423A",
  white: "#FFFFFF",
});

const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const presenterListening = await fs.readFile(path.join(ASSET_DIR, "presenter-listening.png"));
const presenterPointer = await fs.readFile(path.join(ASSET_DIR, "presenter-pointer.png"));

function box(slide, name, left, top, width, height, fill, lineFill = "none", lineWidth = 0, geometry = "rect") {
  return slide.shapes.add({
    geometry,
    name,
    position: { left, top, width, height },
    fill,
    line: { style: "solid", fill: lineFill, width: lineWidth },
  });
}

function text(slide, name, value, left, top, width, height, options = {}) {
  const shape = box(slide, name, left, top, width, height, "none");
  shape.text = value;
  shape.text.style = {
    fontFace: "Arial",
    fontSize: options.fontSize ?? 22,
    color: options.color ?? C.ink,
    bold: options.bold ?? false,
    italic: options.italic ?? false,
    alignment: options.alignment ?? "left",
    verticalAlignment: options.verticalAlignment ?? "top",
  };
  return shape;
}

function rule(slide, name, left, top, width, color = C.rule, height = 2) {
  return box(slide, name, left, top, width, height, color);
}

function pageChrome(slide, number, section, title) {
  slide.background.fill = C.paper;
  text(slide, `section-${number}`, `${String(number).padStart(2, "0")} / ${section.toUpperCase()}`, 64, 38, 300, 24, { fontSize: 15, bold: true, color: C.muted });
  text(slide, `title-${number}`, title, 64, 76, 1110, 66, { fontSize: 48, bold: true });
  rule(slide, `header-rule-${number}`, 64, 150, 1152, C.ink, 2);
  text(slide, `scenario-label-${number}`, "Illustrative planning scenario — not a forecast", 64, 682, 560, 22, { fontSize: 14, bold: true, color: C.muted });
  text(slide, `page-${number}`, String(number).padStart(2, "0"), 1166, 680, 50, 22, { fontSize: 14, bold: true, color: C.muted, alignment: "right" });
}

function notes(slide, extra = []) {
  slide.speakerNotes.textFrame.setText([
    "[Sources]",
    "- Scenario content and all figures: fictional illustrative planning scenario authored for this benchmark; not an external forecast.",
    ...extra,
  ]);
}

function image(slide, name, bytes, alt, left, top, width, height) {
  return slide.images.add({
    blob: bytes,
    contentType: "image/png",
    alt,
    fit: "contain",
    position: { left, top, width, height },
    name,
  });
}

function buildTitle(slide) {
  slide.background.fill = C.paper;
  text(slide, "title-kicker", "REGIONAL GRID STEERING COMMITTEE / DECISION BRIEF", 64, 50, 660, 30, { fontSize: 16, bold: true, color: C.visibility });
  text(slide, "deck-title", "Grid Forward\n2030", 64, 130, 680, 220, { fontSize: 76, bold: true });
  text(slide, "deck-subtitle", "A staged portfolio for visibility, flexibility, and resilience", 70, 388, 640, 92, { fontSize: 30, color: C.muted });
  rule(slide, "title-rule", 70, 522, 1080, C.ink, 2);
  text(slide, "decision-horizon", "Decision horizon", 70, 552, 220, 28, { fontSize: 16, bold: true, color: C.muted });
  text(slide, "horizon-value", "2026 → 2030", 70, 584, 340, 50, { fontSize: 34, bold: true });
  box(slide, "horizon-block", 936, 110, 214, 430, C.ink);
  text(slide, "horizon-2030", "30", 944, 132, 190, 160, { fontSize: 112, bold: true, color: C.paper, alignment: "center" });
  text(slide, "horizon-copy", "Modernize as one sequence, not isolated projects.", 962, 340, 158, 116, { fontSize: 24, bold: true, color: C.paper, alignment: "center" });
  text(slide, "title-scenario", "Illustrative planning scenario — not a forecast", 70, 675, 560, 20, { fontSize: 14, bold: true, color: C.muted });
  notes(slide);
}

function buildDecision(slide) {
  pageChrome(slide, 2, "Decision", "Authorize a staged portfolio with explicit gates");
  text(slide, "decision-statement", "Approve the sequence.\nRelease each phase only when its evidence is ready.", 64, 194, 720, 160, { fontSize: 44, bold: true });
  rule(slide, "decision-accent", 64, 382, 720, C.recommendation, 8);
  text(slide, "decision-definition", "The portfolio advances three linked capabilities together and preserves stop / reshape / proceed decisions at every boundary.", 64, 420, 700, 112, { fontSize: 24, color: C.muted });
  text(slide, "gate-label", "THREE CONDITIONS FOR RELEASE", 850, 202, 330, 28, { fontSize: 16, bold: true, color: C.recommendation });
  const gateRows = [
    ["01", "Evidence", "Measured readiness against phase criteria"],
    ["02", "Owner", "Named executive and delivery accountability"],
    ["03", "Choice", "Proceed, reshape, or stop — explicitly"],
  ];
  gateRows.forEach(([index, heading, copy], row) => {
    const top = 252 + row * 108;
    text(slide, `gate-index-${row}`, index, 850, top, 48, 36, { fontSize: 22, bold: true, color: C.recommendation });
    text(slide, `gate-heading-${row}`, heading, 916, top, 230, 34, { fontSize: 26, bold: true });
    text(slide, `gate-copy-${row}`, copy, 916, top + 38, 260, 50, { fontSize: 18, color: C.muted });
    rule(slide, `gate-rule-${row}`, 850, top + 92, 330, C.rule, 1);
  });
  notes(slide);
}

function buildGap(slide) {
  pageChrome(slide, 3, "Gap", "Isolated projects leave a 19-point controllability gap");
  text(slide, "gap-context", "2030 index (2026 = 100)", 64, 188, 320, 30, { fontSize: 18, bold: true, color: C.muted });
  const chartLeft = 154;
  const chartBase = 590;
  const chartHeight = 330;
  [100, 110, 120, 130].forEach((tick) => {
    const y = chartBase - (tick - 90) * 8;
    rule(slide, `grid-${tick}`, chartLeft, y, 610, C.rule, 1);
    text(slide, `tick-${tick}`, String(tick), 88, y - 12, 52, 24, { fontSize: 16, color: C.muted, alignment: "right" });
  });
  box(slide, "demand-bar", 260, chartBase - 304, 150, 304, C.visibility);
  box(slide, "capacity-bar", 510, chartBase - 152, 150, 152, C.flexibility);
  text(slide, "demand-value", "128", 260, 246, 150, 40, { fontSize: 30, bold: true, color: C.visibility, alignment: "center" });
  text(slide, "capacity-value", "109", 510, 398, 150, 40, { fontSize: 30, bold: true, color: C.flexibility, alignment: "center" });
  text(slide, "demand-label", "Illustrative peak\ndemand", 250, 604, 170, 52, { fontSize: 18, bold: true, alignment: "center" });
  text(slide, "capacity-label", "Controllable\ncapacity", 500, 604, 170, 52, { fontSize: 18, bold: true, alignment: "center" });
  box(slide, "gap-bracket", 710, 286, 8, 152, C.risk);
  rule(slide, "gap-top", 710, 286, 52, C.risk, 4);
  rule(slide, "gap-bottom", 710, 434, 52, C.risk, 4);
  text(slide, "gap-callout", "19", 980, 304, 130, 72, { fontSize: 62, bold: true, color: C.risk });
  text(slide, "gap-callout-copy", "index points remain outside informed control", 980, 382, 220, 84, { fontSize: 23, bold: true });
  text(slide, "gap-implication", "Capacity alone does not create informed control.", 980, 506, 215, 90, { fontSize: 22, color: C.muted });
  const presenter = image(slide, "presenter-pointer-gap", presenterPointer, "Fantasy Mouse presenter points to the lower bound of the illustrative controllability gap", 755, 408, 150, 150);
  presenter.flipHorizontal = true;
  notes(slide, ["- Presenter asset: source/assets/presenter-pointer.png, generated from bundled Fantasy Mouse identity and action-hand authorities."]);
}

function buildPriorities(slide) {
  pageChrome(slide, 4, "Priorities", "Three linked capabilities turn pressure into reliability");
  const items = [
    ["01", "Visibility", "See constraints early", "Telemetry, asset state, and shared operating picture", C.visibility],
    ["02", "Flexibility", "Act before limits bind", "Demand response, storage, and adaptive control", C.flexibility],
    ["03", "Resilience", "Limit disruption impact", "Hardening, sectionalization, and recovery discipline", C.resilience],
  ];
  rule(slide, "priority-spine", 150, 350, 900, C.ink, 4);
  items.forEach(([index, heading, claim, copy, color], column) => {
    const left = 86 + column * 390;
    box(slide, `priority-node-${column}`, left + 64, 316, 72, 72, color, "none", 0, "ellipse");
    text(slide, `priority-index-${column}`, index, left + 64, 334, 72, 32, { fontSize: 22, bold: true, color: C.white, alignment: "center" });
    text(slide, `priority-heading-${column}`, heading, left, 214, 270, 52, { fontSize: 34, bold: true, color });
    text(slide, `priority-claim-${column}`, claim, left, 272, 286, 34, { fontSize: 22, bold: true });
    text(slide, `priority-copy-${column}`, copy, left, 430, 300, 86, { fontSize: 19, color: C.muted });
  });
  text(slide, "priority-sequence", "Visibility enables informed control  →  Flexibility absorbs variability  →  Resilience limits consequences", 86, 566, 1080, 44, { fontSize: 24, bold: true, alignment: "center" });
  notes(slide);
}

function buildPortfolio(slide) {
  pageChrome(slide, 5, "Portfolio", "Balanced staging preserves all three capabilities");
  const x = [555, 710, 865];
  ["Visibility", "Flexibility", "Resilience"].forEach((label, index) => {
    text(slide, `portfolio-axis-${index}`, label, x[index] - 42, 192, 130, 30, { fontSize: 17, bold: true, color: [C.visibility, C.flexibility, C.resilience][index], alignment: "center" });
  });
  const rows = [
    ["Patchwork renewals", "Low near-term disruption", [1, 1, 1], "Leaves systemic gaps"],
    ["Resilience-first", "Hardens critical assets", [1, 1, 3], "Delays informed flexibility"],
    ["Balanced staged", "Builds, scales, then hardens", [3, 3, 3], "RECOMMENDED"],
  ];
  rows.forEach(([name, description, scores, verdict], row) => {
    const top = 250 + row * 130;
    if (row === 2) box(slide, "recommended-plane", 60, top - 18, 1120, 116, "#E3EEE9");
    text(slide, `portfolio-name-${row}`, name, 78, top, 270, 34, { fontSize: 26, bold: true, color: row === 2 ? C.recommendation : C.ink });
    text(slide, `portfolio-copy-${row}`, description, 78, top + 42, 350, 42, { fontSize: 18, color: C.muted });
    scores.forEach((score, column) => {
      for (let dot = 0; dot < 3; dot += 1) {
        box(slide, `score-${row}-${column}-${dot}`, x[column] + dot * 24, top + 12, 14, 14, dot < score ? [C.visibility, C.flexibility, C.resilience][column] : C.rule, "none", 0, "ellipse");
      }
    });
    text(slide, `portfolio-verdict-${row}`, verdict, 1000, top + 8, 170, 32, { fontSize: 18, bold: true, color: row === 2 ? C.recommendation : C.muted, alignment: "right" });
    rule(slide, `portfolio-rule-${row}`, 64, top + 100, 1116, row === 2 ? C.recommendation : C.rule, row === 2 ? 3 : 1);
  });
  notes(slide);
}

function buildRoadmap(slide) {
  pageChrome(slide, 6, "Roadmap", "Foundations precede scale; scale precedes hardening");
  const phases = [
    ["2026–27", "FOUNDATIONS", "Instrument critical assets\nUnify operating data\nProve control loops", C.visibility],
    ["2028–29", "SCALE FLEXIBILITY", "Expand flexible capacity\nAutomate constraints\nValidate operating value", C.flexibility],
    ["2030", "HARDEN & RECOVER", "Target critical exposure\nSection disruption\nExercise recovery", C.resilience],
  ];
  phases.forEach(([years, heading, copy, color], index) => {
    const left = 70 + index * 390;
    text(slide, `roadmap-years-${index}`, years, left, 202, 300, 58, { fontSize: 34, bold: true, color });
    rule(slide, `roadmap-phase-rule-${index}`, left, 278, 300, color, 8);
    text(slide, `roadmap-heading-${index}`, heading, left, 308, 300, 36, { fontSize: 20, bold: true });
    text(slide, `roadmap-copy-${index}`, copy, left, 360, 300, 126, { fontSize: 21, color: C.muted });
  });
  rule(slide, "roadmap-spine", 70, 544, 1070, C.ink, 4);
  [["G1", 425, "Evidence: coverage + control"], ["G2", 815, "Evidence: response + recovery"]].forEach(([gate, left, copy], index) => {
    box(slide, `roadmap-gate-${index}`, left, 514, 62, 62, C.ink, "none", 0, "ellipse");
    text(slide, `roadmap-gate-text-${index}`, gate, left, 531, 62, 26, { fontSize: 19, bold: true, color: C.white, alignment: "center" });
    text(slide, `roadmap-gate-copy-${index}`, copy, left - 90, 590, 240, 46, { fontSize: 17, bold: true, alignment: "center" });
  });
  notes(slide);
}

function buildRisks(slide) {
  pageChrome(slide, 7, "Risks", "Every risk has an owner and a gate consequence");
  const headers = [["RISK", 70, 300], ["MITIGATION", 420, 420], ["OWNER / GATE", 900, 280]];
  headers.forEach(([label, left, width]) => text(slide, `risk-header-${label}`, label, left, 194, width, 30, { fontSize: 16, bold: true, color: C.risk }));
  const rows = [
    ["Data coverage stalls", "Prioritize critical observability; defer low-value scope", "Grid planning / G1"],
    ["Flexible capacity under-delivers", "Scale only after measured response and dispatchability", "Operations / G2"],
    ["Delivery capacity fragments", "Single portfolio cadence, dependency map, and escalation owner", "Sponsor / monthly"],
    ["Hardening outruns evidence", "Target exposure after visibility and flexibility results are proven", "Risk lead / G2"],
  ];
  rows.forEach(([risk, mitigation, owner], row) => {
    const top = 246 + row * 96;
    rule(slide, `risk-row-rule-${row}`, 64, top - 10, 1150, row === 0 ? C.ink : C.rule, row === 0 ? 2 : 1);
    text(slide, `risk-${row}`, risk, 70, top + 12, 300, 50, { fontSize: 22, bold: true });
    text(slide, `mitigation-${row}`, mitigation, 420, top + 10, 420, 58, { fontSize: 19, color: C.muted });
    text(slide, `owner-${row}`, owner, 900, top + 12, 280, 44, { fontSize: 20, bold: true });
  });
  rule(slide, "risk-final-rule", 64, 630, 1150, C.ink, 2);
  notes(slide);
}

function buildApproval(slide) {
  pageChrome(slide, 8, "Approval", "Approve the staged portfolio — subject to phase gates");
  text(slide, "approval-ask", "APPROVE", 64, 200, 560, 110, { fontSize: 82, bold: true, color: C.recommendation });
  text(slide, "approval-scope", "Foundations now.\nScaled flexibility after G1.\nResilience hardening after G2.", 70, 330, 560, 142, { fontSize: 31, bold: true });
  text(slide, "approval-conditions-label", "APPROVAL CONDITIONS", 730, 202, 320, 28, { fontSize: 16, bold: true, color: C.recommendation });
  const conditions = ["Named sponsor and workstream owners", "Gate criteria baselined before release", "Monthly portfolio review starts in 30 days"];
  conditions.forEach((condition, index) => {
    text(slide, `approval-number-${index}`, String(index + 1).padStart(2, "0"), 730, 254 + index * 78, 48, 30, { fontSize: 18, bold: true, color: C.recommendation });
    text(slide, `approval-condition-${index}`, condition, 798, 250 + index * 78, 350, 54, { fontSize: 22, bold: true });
  });
  rule(slide, "approval-next-rule", 730, 500, 410, C.ink, 2);
  text(slide, "approval-next-label", "NEXT 30 DAYS", 730, 526, 180, 28, { fontSize: 16, bold: true, color: C.muted });
  text(slide, "approval-next", "Baseline G1 evidence · confirm owners · launch foundations", 730, 562, 420, 64, { fontSize: 22, bold: true });
  image(slide, "presenter-listening-approval", presenterListening, "Fantasy Mouse presenter listens beside the final approval decision", 500, 448, 220, 220);
  notes(slide, ["- Presenter asset: source/assets/presenter-listening.png, generated from bundled Fantasy Mouse canonical identity authority."]);
}

for (const buildSlide of [
  buildTitle,
  buildDecision,
  buildGap,
  buildPriorities,
  buildPortfolio,
  buildRoadmap,
  buildRisks,
  buildApproval,
]) buildSlide(deck.slides.add());

if (deck.slides.items.length !== 8) throw new Error(`expected-8-slides:${deck.slides.items.length}`);
await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(OUTPUT);
console.log(JSON.stringify({ ok: true, slides: deck.slides.items.length, output: OUTPUT }));
