import { describe, expect, it } from "vitest";
import { hiitPilatesSliders } from "../classes/hiit-pilates-sliders";
import { compileClass } from "./compile-class";
import { getSessionPreview, PREVIEW_LEAD_MS } from "./session-preview";

const timeline = compileClass({
  schemaVersion: 1,
  id: "preview-test",
  version: 1,
  title: "Preview test",
  phases: [
    {
      id: "circuit",
      name: "Circuit",
      items: [
        { type: "exercise", id: "first", name: "First", durationSeconds: 30 },
        { type: "rest", id: "transition", name: "Transition", durationSeconds: 10 },
        {
          type: "repeat",
          id: "rounds",
          rounds: 2,
          items: [
            { type: "exercise", id: "second", name: "Second", durationSeconds: 30 },
            { type: "exercise", id: "third", name: "Third", durationSeconds: 30 }
          ]
        }
      ]
    }
  ]
});

describe("getSessionPreview", () => {
  it("shows the immediate exercise when no transition intervenes", () => {
    const preview = getSessionPreview(timeline.steps, 2);
    expect(preview.primary?.name).toBe("Third");
    expect(preview.circuitExerciseNames).toEqual([]);
  });

  it("shows an upcoming transition from the preceding exercise", () => {
    const preview = getSessionPreview(timeline.steps, 0);
    expect(preview.primary?.name).toBe("Transition");
    expect(preview.primary?.kind).toBe("rest");
  });

  it("lists unique upcoming circuit exercises during a transition", () => {
    const preview = getSessionPreview(timeline.steps, 1);
    expect(preview.primary?.name).toBe("Second");
    expect(preview.circuitExerciseNames).toEqual(["First", "Second", "Third"]);
    expect(preview.circuitOverview?.exerciseNames).toEqual(["First", "Second", "Third", "Second", "Third"]);
  });

  it("shows one complete side during setup, short breaks, and side switches", () => {
    const { steps } = compileClass(hiitPilatesSliders);
    for (const id of ["hiit-setup", "one-hiit-rest-3", "hiit-side-switch"]) {
      const preview = getSessionPreview(steps, steps.findIndex((step) => step.sourceId === id));
      expect(preview.circuitOverview?.perSide).toBe(true);
      expect(preview.circuitOverview?.exerciseNames).toHaveLength(5);
      expect(preview.circuitOverview?.exerciseNames[0]).toBe("Single-leg lunge with slider");
    }
    const sideBody = getSessionPreview(steps, steps.findIndex((step) => step.sourceId === "hiit-finish-break"));
    expect(sideBody.circuitOverview?.perSide).toBe(true);
    expect(sideBody.circuitOverview?.exerciseNames).toHaveLength(13);
    expect(sideBody.primary?.exerciseReference?.side).toBe("right");
    const pyramid = getSessionPreview(steps, steps.findIndex((step) => step.sourceId === "plank-pyramid-rest-1"));
    expect(pyramid.circuitOverview?.perSide).toBe(false);
    expect(pyramid.circuitOverview?.exerciseNames).toHaveLength(7);
  });

  it("keeps differing left and right sequences in the overview", () => {
    const { steps } = compileClass(hiitPilatesSliders);
    const modified = steps.map((step) => step.sourceId === "runner-lunge-two"
      ? { ...step, name: "Different right-side movement" } : step);
    const preview = getSessionPreview(modified, modified.findIndex((step) => step.sourceId === "hiit-setup"));
    expect(preview.circuitOverview?.perSide).toBe(false);
    expect(preview.circuitOverview?.exerciseNames).toHaveLength(10);
    expect(preview.circuitOverview?.exerciseNames).toContain("Different right-side movement");
  });

  it("gives one-minute circuit rests a numbered-order overview with break timing", () => {
    const overviewTimeline = compileClass({
      schemaVersion: 1,
      id: "overview-test",
      version: 1,
      title: "Overview test",
      phases: [{
        id: "circuit",
        name: "Circuit",
        items: [
          { type: "rest", id: "setup", name: "REST", durationSeconds: 60 },
          { type: "exercise", id: "first", name: "First", durationSeconds: 30 },
          { type: "rest", id: "break", name: "REST", durationSeconds: 10 },
          { type: "exercise", id: "second", name: "Second", durationSeconds: 30 }
        ]
      }]
    });

    expect(getSessionPreview(overviewTimeline.steps, 0).circuitOverview).toEqual({
      exerciseNames: ["First", "Second"],
      perSide: false,
      breakDurationsMs: [10_000, 60_000]
    });
  });
});

describe("PREVIEW_LEAD_MS", () => {
  it("leads the handover by ten seconds on every step", () => {
    expect(PREVIEW_LEAD_MS).toBe(10_000);
  });
});
