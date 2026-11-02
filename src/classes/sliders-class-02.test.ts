import { expect, it } from "vitest";
import { compileClass } from "../domain/compile-class";
import { hiitPilatesSliders } from "./hiit-pilates-sliders";
import { slidersClass02 } from "./sliders-class-02";

it("runs the revised core sequence right then left with explicit mat transitions", () => {
  const compiled = compileClass(slidersClass02);
  const core = compiled.steps.filter((step) => step.phase.id === "abs-circuit");
  const sequence = ["Opposite arm slides", "Opposite arm slides + leg crunch", "REST", "Single-leg bicycle", "Single-arm toe reach", "Supine cross-body crunch", "Roll-ups"];
  expect(core.map((step) => step.name)).toEqual([...sequence, ...sequence, "REST"]);
  expect(core.map((step) => step.durationMs)).toEqual([40, 40, 10, 40, 40, 40, 60, 40, 40, 10, 40, 40, 40, 60, 60].map((seconds) => seconds * 1000));
  for (const [offset, side] of [[0, "right"], [7, "left"]] as const) {
    expect(core.slice(offset, offset + 6).filter((step) => step.kind === "exercise").every((step) => step.exerciseReference?.side === side)).toBe(true);
  }
  expect(core[0]?.longDescription).toContain("using the obliques to drive the rotation");
  expect(core[1]?.longDescription).toContain("90° angle at hip and knee");
  expect(core.some((step) => step.name === "Leg + arm extension")).toBe(false);
});

it("sets both upper-body/core sections to 30 seconds and preserves other sections", () => {
  const revised = compileClass(slidersClass02);
  const original = compileClass(hiitPilatesSliders);
  for (const phase of original.phases) {
    const actual = revised.steps.filter((step) => step.phase.id === phase.id);
    const before = original.steps.filter((step) => step.phase.id === phase.id);
    if (["plank-pyramid", "upper-core-one"].includes(phase.id)) {
      expect(actual.map((step) => [step.name, step.durationMs])).toEqual(before.map((step) => [step.name === "Glute bridge curl" ? "Glute bridge single leg extensions" : step.name, step.kind === "exercise" ? (step.name === "Glute bridge pulse" ? 20000 : 30000) : step.durationMs]));
    } else if (!["abs-circuit", "side-body", "hiit-legs"].includes(phase.id)) {
      const content = (steps: typeof actual) => steps.map((step) => ({ ...step, runtimeId: "", startsAtMs: 0, endsAtMs: 0 }));
      expect(content(actual)).toEqual(content(before));
    }
  }
});

it("runs the new side-body sequence on both sides with the bottom leg opposite", () => {
  const steps = compileClass(slidersClass02).steps.filter((step) => step.phase.id === "side-body");
  const names = ["Side plank top leg slide knee to elbow", "Side plank hip lowers", "Side plank to teaser", "REST", "Leg lift", "Big leg circles", "Small leg circles", "Straight leg crunches", "Tricep side push-up", "Bottom leg lifts", "Bottom leg pulses"];
  expect(steps.map((step) => step.name)).toEqual([...names, "REST", ...names]);
  expect(steps.filter((step) => step.kind === "exercise").every((step) => step.durationMs === (step.name.startsWith("Side plank") ? 30000 : 40000))).toBe(true);
  expect(steps.filter((step) => step.kind === "rest").map((step) => step.durationMs)).toEqual([10000, 30000, 10000]);
  expect(steps[9]?.exerciseReference?.side).toBe("left");
  expect(steps[21]?.exerciseReference?.side).toBe("right");
  expect(steps[2]?.longDescription).toContain("Option to add the crunch.");
});

it("replaces both runner lunges with Good morning + leg extension at the same duration and side", () => {
  const revised = compileClass(slidersClass02).steps.filter((step) => step.phase.id === "hiit-legs");
  const original = compileClass(hiitPilatesSliders).steps.filter((step) => step.phase.id === "hiit-legs");
  expect(revised.map((step) => [step.name, step.durationMs, step.exerciseReference?.side])).toEqual(original.filter((step) => !["one-hiit-rest-4", "two-hiit-rest-4"].includes(step.sourceId)).map((step) => [step.name === "High runner's lunge leg in-and-out" ? "Good morning + leg extension" : step.name, step.durationMs, step.exerciseReference?.side]));
  expect(revised.filter((step) => step.name === "Good morning + leg extension")).toHaveLength(2);
});
