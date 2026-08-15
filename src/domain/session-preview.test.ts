import { describe, expect, it } from "vitest";
import { compileClass } from "./compile-class";
import { getSessionPreview, previewLeadMs } from "./session-preview";

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
    expect(preview.circuitExerciseNames).toEqual(["Second", "Third"]);
  });
});

describe("previewLeadMs", () => {
  it("gives a long step the full ten-second lead", () => {
    expect(previewLeadMs(60_000)).toBe(10_000);
    expect(previewLeadMs(40_000)).toBe(10_000);
  });

  it("shortens the lead for a thirty-second drill", () => {
    expect(previewLeadMs(30_000)).toBe(5_000);
    expect(previewLeadMs(20_000)).toBe(5_000);
  });

  it("skips the preview entirely on steps under twenty seconds", () => {
    expect(previewLeadMs(19_999)).toBe(0);
    expect(previewLeadMs(10_000)).toBe(0);
    expect(previewLeadMs(0)).toBe(0);
  });

  it("never leads by more than a quarter of the step", () => {
    [20_000, 30_000, 40_000, 60_000, 180_000].forEach((duration) => {
      expect(previewLeadMs(duration)).toBeLessThanOrEqual(duration / 2);
    });
  });
});
