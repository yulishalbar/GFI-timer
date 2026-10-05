import { describe, expect, it } from "vitest";
import { compileClass } from "../domain/compile-class";
import { availableClasses, courseTagsById } from "./index";
import { matPilates0731, matPilates0731Catalog } from "./mat-pilates-07-31";
import { matPilatesWeights } from "./mat-pilates-weights";

describe("Mat Pilates with weight", () => {
  const original = compileClass(matPilates0731);
  const weighted = compileClass(matPilatesWeights);

  it("registers a separate weighted class with the adapted July 31 timeline", () => {
    expect(availableClasses.map((item) => item.definition.id)).toContain("mat-pilates-weights");
    expect(courseTagsById[matPilatesWeights.id]).toContain("weights");
    expect(weighted.totalDurationMs).toBe(3_420_000);
    expect(weighted.steps).toHaveLength(92);
    expect(weighted.steps.filter((step) => !["standing-lower-body", "quadruped-glutes-core", "core-circuit", "upper-body-back"].includes(step.phase.id)).map((step) => [step.sourceId, step.name, step.durationMs]))
      .toEqual(original.steps.filter((step) => !["standing-lower-body", "quadruped-glutes-core", "core-circuit", "upper-body-back"].includes(step.phase.id)).map((step) => [step.sourceId, step.name, step.durationMs]));
    expect(matPilates0731Catalog.course.tags).not.toContain("weights");
  });

  it("flows through five movements per side with only a 30-second side-switch rest", () => {
    expect(weighted.steps.filter((step) => step.phase.id === "standing-lower-body").map((step) => [step.name, step.exerciseReference?.side, step.durationMs])).toEqual([
      ["Squat -> add arms", undefined, 30_000], ["Squat hold", undefined, 30_000],
      ["Squat hold leg lift", "right", 30_000], ["Side to back kick", "right", 40_000],
      ["Single leg RDL", "right", 40_000], ["REST", undefined, 30_000],
      ["Squat -> add arms", undefined, 30_000], ["Squat hold", undefined, 30_000],
      ["Squat hold leg lift", "left", 30_000], ["Side to back kick", "left", 45_000],
      ["Single leg RDL", "left", 45_000]
    ]);
    for (const step of weighted.steps.filter((step) => step.name === "Single leg RDL")) {
      expect(step.rig).toBe("single-leg-rdl");
      expect(step.longDescription).not.toMatch(/knee tuck/i);
    }
  });

  it("runs the weighted bent-knee series then the unweighted extended series on both sides", () => {
    const steps = weighted.steps.filter((step) => step.phase.id === "quadruped-glutes-core");
    expect(steps[0]?.sourceId).toBe("quadruped-setup");
    for (const [side, start] of [["left", 1], ["right", 10]] as const) {
      const sequence = steps.slice(start, start + 8);
      expect(sequence.map((step) => step.sourceId)).toEqual([
        `donkey-kick-${side}`, `side-crunch-${side}`, `cross-body-crunch-${side}`, `combined-crunch-${side}`,
        `drop-weight-${side}`, `extended-leg-lift-${side}`, `extended-hamstring-curl-${side}`, `extended-leg-pulse-${side}`
      ]);
      expect(sequence.map((step) => step.durationMs)).toEqual([40_000, 40_000, 40_000, 40_000, 15_000, 40_000, 40_000, 40_000]);
      sequence.slice(0, 4).forEach((step) => expect(step.shortDescription).toContain(`weight behind the bent ${side} knee`));
      expect(sequence[4]?.shortDescription).toContain("remove it from behind the knee");
      sequence.filter((step) => step.kind === "exercise").forEach((step) => expect(step.exerciseReference?.side).toBe(side));
      sequence.slice(5).forEach((step) => expect(step.shortDescription).toContain("no weight"));
    }
    expect(steps[9]).toMatchObject({ sourceId: "quadruped-side-switch", durationMs: 30_000 });
  });

  it("replaces core with one pass in the requested order and durations", () => {
    const steps = weighted.steps.filter((step) => step.phase.id === "core-circuit");
    expect(steps.map((step) => [step.sourceId, step.durationMs, step.exerciseReference?.side])).toEqual([
      ["core-setup", 60_000, undefined], ["crunches", 40_000, undefined],
      ["crunch-pulses", 20_000, undefined], ["after-crunch-pulses", 10_000, undefined],
      ["single-leg-toe-reach-right", 40_000, "right"], ["after-toe-reach-right", 10_000, undefined],
      ["single-leg-toe-reach-left", 40_000, "left"], ["after-toe-reach-left", 10_000, undefined],
      ["sit-up-twist-left", 40_000, "left"], ["sit-up-twist-right", 40_000, "right"],
      ["russian-twists", 40_000, undefined], ["after-russian-twists", 10_000, undefined],
      ["boat-hold", 20_000, undefined], ["weighted-roll-up", 60_000, undefined]
    ]);
    expect(steps.at(-1)?.shortDescription).toContain("Hold one light weight");
  });

  it("sets up kneeling arms and rests after push-ups before the unchanged high-plank series", () => {
    const steps = weighted.steps.filter((step) => step.phase.id === "upper-body-back");
    expect(steps.map((step) => [step.sourceId, step.durationMs])).toEqual([
      ["upper-body-setup", 60_000], ["kneeling-biceps-curls", 40_000],
      ["kneeling-serve-platter", 40_000], ["kneeling-around-world", 40_000],
      ["kneeling-reverse-fly", 40_000], ["kneeling-triceps-extensions", 40_000],
      ["kneeling-flutter-arms", 40_000], ["pilates-push-ups", 30_000],
      ["before-high-planks", 30_000], ["plank-shoulder-taps", 30_000],
      ["alternating-side-planks", 30_000], ["high-plank-hold", 30_000],
      ["upper-body-finish-break", 20_000]
    ]);
    expect(steps[0]?.shortDescription).toContain("kneeling position on both knees");
    steps.slice(1, 7).forEach((step) => expect(step.shortDescription).toContain("light weights"));
    expect(steps[7]?.shortDescription).toContain("Set weights clear of the mat");
  });

  it("weights both standing sides and the final core roll-up, keeping the original cues", () => {
    const weightedIds = [
      "squat-arms-right-round", "squat-hold-right-round", "squat-hold-leg-lift-right",
      "squat-arms-left-round", "squat-hold-left-round", "squat-hold-leg-lift-left",
      "deadlift-knee-tuck-right", "deadlift-knee-tuck-left",

    ];
    for (const id of weightedIds) {
      const step = weighted.steps.find((item) => item.sourceId === id);
      expect(step?.shortDescription).toMatch(/weight/);
      const source = original.steps.find((item) => item.sourceId === id);
      if (source?.shortDescription && !id.startsWith("deadlift-knee-tuck-")) expect(step?.shortDescription).toContain(source.shortDescription);
    }
    expect(weighted.steps.filter((step) => !["quadruped-glutes-core", "core-circuit", "upper-body-back"].includes(step.phase.id) && step.kind === "exercise" && step.sourceId !== "class-introduction" && step.shortDescription !== original.steps.find((source) => source.sourceId === step.sourceId)?.shortDescription).map((step) => step.sourceId).sort()).toEqual([...weightedIds, "side-back-kick-right", "side-back-kick-left"].sort());
    for (const phaseId of ["standing-warmup", "side-body-circuit", "cooldown"]) {
      expect(weighted.steps.filter((step) => step.phase.id === phaseId && step.kind === "exercise").map((step) => step.shortDescription))
        .toEqual(original.steps.filter((step) => step.phase.id === phaseId && step.kind === "exercise").map((step) => step.shortDescription));
    }
  });

  it("uses existing rests for equipment changes and keeps planks on the mat", () => {
    for (const id of ["standing-circuit-preview", "upper-body-setup"]) {
      expect(weighted.steps.find((step) => step.sourceId === id)?.shortDescription).toMatch(/Pick up/);
    }
    expect(weighted.steps.find((step) => step.sourceId === "pilates-push-ups")?.shortDescription).toContain("Place palms directly on the mat");
    expect(weighted.steps.find((step) => step.sourceId === "class-introduction")?.shortDescription).toContain("without weights");
  });
});
