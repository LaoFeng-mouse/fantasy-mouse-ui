import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// @ts-expect-error The benchmark runtime deliberately ships as plain ESM.
import { escapeHtml, initialSignalState, reduceSignal } from "../../examples/signal-harbor/source/state.mjs";

const caseRoot = fileURLToPath(new URL("../../examples/signal-harbor/", import.meta.url));

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
