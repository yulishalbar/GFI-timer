import { describe, expect, it } from "vitest";
import { compileClass } from "../domain/compile-class";
import { availableClasses } from "./index";
import { matPilatesWeightsBlock } from "./mat-pilates-weights-block";
import { matPilatesWeightsBlockPlank } from "./mat-pilates-weights-block-plank";

describe("block and weights plank copy", () => {
  it("keeps the original, introduction, Circuit 4, and cooldown intact under a separate class ID", () => {
    expect(availableClasses.some((item) => item.definition.id === matPilatesWeightsBlock.id)).toBe(true);
    expect(availableClasses.some((item) => item.definition.id === matPilatesWeightsBlockPlank.id)).toBe(true);
    expect(matPilatesWeightsBlockPlank.phases.filter((_, index) => index === 0 || index === 5 || index === 7))
      .toEqual(matPilatesWeightsBlock.phases.filter((_, index) => index === 0 || index === 5 || index === 7));
    expect(compileClass(matPilatesWeightsBlock).totalDurationMs).toBe(3_500_000);
    expect(compileClass(matPilatesWeightsBlockPlank).totalDurationMs).toBe(3_370_000);
  });

  it("adds thirty seconds of squat pulses directly after regular squats", () => {
    const steps = compileClass(matPilatesWeightsBlockPlank).steps;
    const squatIndex = steps.findIndex((step) => step.name === "Regular squats");
    expect(squatIndex).toBeGreaterThan(-1);
    expect(steps[squatIndex + 1]).toMatchObject({ name: "Regular squat pulses", durationMs: 30_000 });
    const original = matPilatesWeightsBlock.phases.find((phase) => phase.id === "lower-body");
    const updated = matPilatesWeightsBlockPlank.phases.find((phase) => phase.id === "lower-body");
    expect(updated?.items.filter((item) => item.id !== "regular-squat-pulses")).toEqual(original?.items.filter((item) => !["lower-body-left-rest-2", "lower-body-right-rest-1", "lower-body-right-rest-2"].includes(item.id)));
    expect(matPilatesWeightsBlockPlank.version).toBe(5);
  });

  it("splits side planks and adds rests while preserving asymmetric timing and notes", () => {
    const steps = compileClass(matPilatesWeightsBlockPlank).steps.filter((step) => step.phase.id === "plank-side-body");
    expect(steps.map((step) => [step.name, step.durationMs / 1000])).toEqual([
      ["Downward facing dog to side plank leg bend (holding block) (L)", 40],
      ["REST", 10],
      ["Side plank bends (holding block) (L)", 20],
      ["Side plank twist (holding block) (L)", 20],
      ["REST", 10],
      ["High plank Knee drive (L)", 40],
      ["REST", 10],
      ["Bear plank side twists", 40],
      ["REST", 15],
      ["Lying kneedrive (R) balance block on side of foot", 60],
      ["Lying leg lift (R) balance block on side of foot", 60],
      ["REST", 20],
      ["Downward facing dog to side plank leg bend (holding block) (R)", 40],
      ["REST", 10],
      ["Side plank bends (holding block) (R)", 20],
      ["Side plank twist (holding block) (R)", 20],
      ["REST", 10],
      ["High plank Knee drive (L)", 10],
      ["REST", 10],
      ["Bear plank side twists", 40],
      ["REST", 15],
      ["Lying kneedrive (L) balance block on side of foot", 40],
      ["Lying leg lift (L) balance block on side of foot", 40]
    ]);
    expect(steps.filter((step) => step.kind === "rest")).toHaveLength(9);
    expect(steps.find((step) => step.sourceId === "lying-right-knee-drive")?.shortDescription).toBe("Left leg on top Balancing block on heel/side of foot");
    expect(steps.find((step) => step.sourceId === "bear-twists-second")?.shortDescription).toBe("Same hand’s forearms on block, weight behind knee");
  });
  it("updates warm-up, both strength sides, and the core exercise", () => {
    const steps = compileClass(matPilatesWeightsBlockPlank).steps;
    expect(steps.find((step) => step.sourceId === "warmup-circuit-preview")?.durationMs).toBe(120_000);
    for (const side of ["l", "r"]) {
      for (const id of ["ninety-ninety-lunge", "narrow-press-knee-tap", "hinge-knee-taps", "b-stance-squats"]) {
        expect(steps.find((step) => step.sourceId === `${id}-${side}`)?.durationMs).toBe(30_000);
      }
      for (const [first, next] of [["lunge", "lunge-rdl"], ["lunge-rdl", "lunge-pulses"], ["b-stance-squats", "b-stance-pulse"]]) {
        const index = steps.findIndex((step) => step.sourceId === `${first}-${side}`);
        expect(steps[index + 1]?.sourceId).toBe(`${next}-${side}`);
      }
      expect(steps.find((step) => step.sourceId === `single-leg-pike-${side}`)?.name).toContain("Single leg pike knee drive");
    }
    const crunchIndex = steps.findIndex((step) => step.sourceId === "crunches-block");
    expect(crunchIndex).toBeGreaterThan(-1);
    expect(steps[crunchIndex + 1]).toMatchObject({ name: "Crunch pulses", durationMs: 30_000 });
    expect(steps[crunchIndex + 2]?.sourceId).toBe("core-end-rest");
    expect(steps.find((step) => step.sourceId === "tabletop-toe-taps")).toMatchObject({
      name: "Leg lowers (block between ankles)", durationMs: 40_000
    });
  });
});
