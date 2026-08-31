import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// @ts-expect-error The benchmark runtime deliberately ships as plain ESM.
import { escapeHtml, initialSignalState, reduceSignal } from "../../examples/signal-harbor/source/state.mjs";

// @ts-expect-error The benchmark runtime deliberately ships as plain ESM.
import { initialFestivalState, reduceFestival } from "../../examples/fieldnote-festival/source/state.mjs";

const caseRoot = fileURLToPath(new URL("../../examples/signal-harbor/", import.meta.url));
const festivalRoot = fileURLToPath(new URL("../../examples/fieldnote-festival/", import.meta.url));
const gridForwardRoot = fileURLToPath(new URL("../../examples/grid-forward-2030/", import.meta.url));

describe("Signal Harbor state reducer", () => {
  it("starts by monitoring the active incident queue", () => {
    expect(initialSignalState()).toEqual({
      phase: "monitoring",
      incidentId: null,
      owner: "",
      note: "",
      error: null,
      liveRegion: "Monitoring 12 active incidents",
    });
  });

  it("selects an incident for review", () => {
    expect(
      reduceSignal(initialSignalState(), {
        type: "select",
        incidentId: "INC-4821",
      }),
    ).toMatchObject({
      phase: "incident-selected",
      incidentId: "INC-4821",
      error: null,
    });
  });

  it("assigns a selected incident to a nonempty owner", () => {
    const selected = reduceSignal(initialSignalState(), {
      type: "select",
      incidentId: "INC-4821",
    });

    expect(
      reduceSignal(selected, { type: "assign", owner: "Maya Chen" }),
    ).toMatchObject({
      phase: "assigned",
      owner: "Maya Chen",
      error: null,
      liveRegion: "Incident INC-4821 assigned to Maya Chen",
    });
  });

  it("blocks assignment when the owner is empty", () => {
    const selected = reduceSignal(initialSignalState(), {
      type: "select",
      incidentId: "INC-4821",
    });

    expect(
      reduceSignal(selected, { type: "assign", owner: "   " }),
    ).toMatchObject({
      phase: "blocked",
      owner: "",
      error: "Choose an owner before assigning",
      liveRegion: "Assignment blocked. Choose an owner and retry.",
    });
  });

  it("resolves an assigned incident with a nonempty note", () => {
    const assigned = {
      ...initialSignalState(),
      phase: "assigned",
      incidentId: "INC-4821",
      owner: "Maya Chen",
    };

    expect(
      reduceSignal(assigned, {
        type: "resolve",
        note: "Traffic shifted to the healthy region.",
      }),
    ).toMatchObject({
      phase: "resolved",
      note: "Traffic shifted to the healthy region.",
      error: null,
      liveRegion: "Incident INC-4821 resolved",
    });
  });

  it("fails resolution when the note is empty", () => {
    const assigned = {
      ...initialSignalState(),
      phase: "assigned",
      incidentId: "INC-4821",
      owner: "Maya Chen",
    };

    expect(
      reduceSignal(assigned, { type: "resolve", note: "\n\t" }),
    ).toMatchObject({
      phase: "failed-resolution",
      note: "",
      error: "Add a resolution note before resolving",
      liveRegion: "Resolution failed. Add a note and retry.",
    });
  });

  it("retries at the selected incident when an incident is retained", () => {
    const failed = {
      ...initialSignalState(),
      phase: "failed-resolution",
      incidentId: "INC-4821",
      error: "Add a resolution note before resolving",
    };

    expect(reduceSignal(failed, { type: "retry" })).toMatchObject({
      phase: "incident-selected",
      incidentId: "INC-4821",
      error: null,
      liveRegion: "Retry ready for incident INC-4821",
    });
  });

  it("retries at monitoring when no incident is retained", () => {
    const blocked = {
      ...initialSignalState(),
      phase: "blocked",
      error: "Choose an owner before assigning",
    };

    expect(reduceSignal(blocked, { type: "retry" })).toEqual(
      initialSignalState(),
    );
  });

  it("throws for unknown events", () => {
    expect(() =>
      reduceSignal(initialSignalState(), { type: "evacuate" }),
    ).toThrow("unknown-signal-event:evacuate");
  });

  it("escapes resolution notes before they enter HTML templates", () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">&')).toBe(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;",
    );
  });

  it("ships the browser accessibility hooks exercised by the recorded run", async () => {
    const [html, app, css] = await Promise.all([
      readFile(`${caseRoot}source/index.html`, "utf8"),
      readFile(`${caseRoot}source/app.mjs`, "utf8"),
      readFile(`${caseRoot}source/styles.css`, "utf8"),
    ]);
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('id="on-call"');
    expect(app).toContain('list.addEventListener("keydown"');
    expect(app).toContain("requestAnimationFrame");
    expect(app).not.toContain('role="listitem"');
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain(":focus-visible");
  });
});

describe("Fieldnote Festival state reducer", () => {
  it("starts with the complete program and an empty plan", () => {
    expect(initialFestivalState()).toEqual({
      phase: "browse-program",
      day: "all",
      selectedId: null,
      plan: [],
      pendingId: null,
      liveRegion: "",
    });
  });

  it("filters a day and inspects a session", () => {
    const filtered = reduceFestival(initialFestivalState(), {
      type: "filter-day",
      day: "saturday",
    });
    expect(filtered).toMatchObject({
      phase: "day-filtered",
      day: "saturday",
      liveRegion: "Showing Saturday sessions",
    });

    expect(
      reduceFestival(filtered, { type: "inspect", id: "fern-walk" }),
    ).toMatchObject({
      phase: "session-inspected",
      selectedId: "fern-walk",
      day: "saturday",
    });
  });

  it("saves a non-clashing session", () => {
    expect(
      reduceFestival(initialFestivalState(), {
        type: "add",
        id: "fern-walk",
      }),
    ).toMatchObject({
      phase: "saved",
      plan: ["fern-walk"],
      pendingId: null,
      liveRegion: "Saved to your plan: Fern Walk at Mill Creek",
    });
  });

  it("holds a clashing session pending without mutating the existing plan", () => {
    const existing = {
      ...initialFestivalState(),
      phase: "session-inspected",
      selectedId: "seed-library",
      plan: ["fern-walk"],
    };
    const result = reduceFestival(existing, {
      type: "add",
      id: "seed-library",
    });

    expect(result).toMatchObject({
      phase: "conflict",
      plan: ["fern-walk"],
      pendingId: "seed-library",
    });
    expect(result.plan).toBe(existing.plan);
  });

  it("atomically replaces the clashing session and announces the saved plan", () => {
    const conflict = {
      ...initialFestivalState(),
      phase: "conflict",
      selectedId: "seed-library",
      plan: ["fern-walk", "river-moss"],
      pendingId: "seed-library",
    };

    expect(
      reduceFestival(conflict, {
        type: "replace",
        removeId: "fern-walk",
        addId: "seed-library",
      }),
    ).toEqual({
      ...conflict,
      phase: "saved",
      plan: ["river-moss", "seed-library"],
      pendingId: null,
      liveRegion: "Saved plan: River Moss Lab and Seed Library Exchange",
    });
  });

  it("removes a session and returns to the empty plan", () => {
    expect(
      reduceFestival(
        { ...initialFestivalState(), phase: "saved", plan: ["fern-walk"] },
        { type: "remove", id: "fern-walk" },
      ),
    ).toMatchObject({
      phase: "empty-plan",
      plan: [],
      liveRegion: "Removed Fern Walk at Mill Creek. Your plan is empty.",
    });
  });

  it("cancels a pending conflict and restores the inspected session", () => {
    expect(
      reduceFestival(
        {
          ...initialFestivalState(),
          phase: "conflict",
          selectedId: "seed-library",
          plan: ["fern-walk"],
          pendingId: "seed-library",
        },
        { type: "close-dialog" },
      ),
    ).toMatchObject({
      phase: "session-inspected",
      plan: ["fern-walk"],
      pendingId: null,
      liveRegion: "Kept Fern Walk at Mill Creek in your plan",
    });
  });

  it("throws for unknown events", () => {
    expect(() =>
      reduceFestival(initialFestivalState(), { type: "harvest" }),
    ).toThrow("unknown-festival-event:harvest");
  });

  it("ships accessible, responsive runtime hooks and scoped character roles", async () => {
    const [html, app, css] = await Promise.all([
      readFile(`${festivalRoot}source/index.html`, "utf8"),
      readFile(`${festivalRoot}source/app.mjs`, "utf8"),
      readFile(`${festivalRoot}source/styles.css`, "utf8"),
    ]);

    expect(html).toContain('data-testid="day-filters"');
    expect(html).toContain('data-testid="session-detail"');
    expect(html).toContain('data-testid="plan-region"');
    expect(html).toContain('data-testid="conflict-dialog"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-describedby="conflict-description"');
    expect(html.match(/field-guide-idle\.png/g)).toHaveLength(1);
    expect(html).not.toContain("field-guide-notebook.png");
    expect(app).toContain("field-guide-notebook.png");
    expect(app).toContain("dialog.showModal()");
    expect(app).toContain("initiatingControl?.focus()");
    expect(app).not.toContain("innerHTML");
    expect(css).toContain("min-height: 44px");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain(":focus-visible");
    expect(css).toContain("overflow-x: clip");
  });

  it("keeps every declared runtime file byte-identical between source and output", async () => {
    for (const path of [
      "index.html",
      "styles.css",
      "state.mjs",
      "app.mjs",
      "assets/field-guide-idle.png",
      "assets/field-guide-notebook.png",
    ]) {
      const [source, output] = await Promise.all([
        readFile(`${festivalRoot}source/${path}`),
        readFile(`${festivalRoot}output/${path}`),
      ]);
      expect(output.equals(source), path).toBe(true);
    }
  });
});

describe("Grid Forward 2030 presentation", () => {
  it("keeps an explicit eight-slide editable authoring sequence and source notes", async () => {
    const builder = await readFile(`${gridForwardRoot}source/build-deck.mjs`, "utf8");

    expect(builder).toContain('Presentation.create({ slideSize: { width: 1280, height: 720 } })');
    expect(builder.match(/^function build(?:Title|Decision|Gap|Priorities|Portfolio|Roadmap|Risks|Approval)\(/gmu)).toHaveLength(8);
    expect(builder).toContain("if (deck.slides.items.length !== 8)");
    expect(builder).toContain("slide.speakerNotes.textFrame.setText");
    expect(builder).toContain("[Sources]");
    expect(builder).toContain("Illustrative planning scenario — not a forecast");
    expect(builder).toContain("presenter.flipHorizontal = true");
    expect(builder).not.toContain("Codex Grid");
  });

  it("keeps the accepted editable PPTX byte-identical between source and output", async () => {
    const [source, output] = await Promise.all([
      readFile(`${gridForwardRoot}source/Grid-Forward-2030.pptx`),
      readFile(`${gridForwardRoot}output/Grid-Forward-2030.pptx`),
    ]);

    expect(source.subarray(0, 2).toString("ascii")).toBe("PK");
    expect(output.equals(source)).toBe(true);
  });
});
