import { describe, expect, it } from "vitest";
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
    expect(preview.circuitExerciseNames).toEqual(["Second", "Third"]);
  });
});

describe("PREVIEW_LEAD_MS", () => {
  it("leads the handover by ten seconds on every step", () => {
    expect(PREVIEW_LEAD_MS).toBe(10_000);
  });
});
