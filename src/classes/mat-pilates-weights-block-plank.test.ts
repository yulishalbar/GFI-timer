import { describe, expect, it } from "vitest";
import { compileClass } from "../domain/compile-class";
import { availableClasses } from "./index";
import { matPilatesWeightsBlock } from "./mat-pilates-weights-block";
import { matPilatesWeightsBlockPlank } from "./mat-pilates-weights-block-plank";

describe("block and weights plank copy", () => {
  it("keeps the original and all other phases intact under a separate class ID", () => {
    expect(availableClasses.some((item) => item.definition.id === matPilatesWeightsBlock.id)).toBe(true);
    expect(availableClasses.some((item) => item.definition.id === matPilatesWeightsBlockPlank.id)).toBe(true);
    expect(matPilatesWeightsBlockPlank.phases.filter((_, index) => index !== 2 && index !== 3))
      .toEqual(matPilatesWeightsBlock.phases.filter((_, index) => index !== 2 && index !== 3));
    expect(compileClass(matPilatesWeightsBlock).totalDurationMs).toBe(3_500_000);
    expect(compileClass(matPilatesWeightsBlockPlank).totalDurationMs).toBe(3_360_000);
  });

  it("adds thirty seconds of squat pulses directly after regular squats", () => {
    const steps = compileClass(matPilatesWeightsBlockPlank).steps;
    const squatIndex = steps.findIndex((step) => step.name === "Regular squats");
    expect(squatIndex).toBeGreaterThan(-1);
    expect(steps[squatIndex + 1]).toMatchObject({ name: "Regular squat pulses", durationMs: 30_000 });
    const original = matPilatesWeightsBlock.phases.find((phase) => phase.id === "lower-body");
    const updated = matPilatesWeightsBlockPlank.phases.find((phase) => phase.id === "lower-body");
    expect(updated?.items.filter((item) => item.id !== "regular-squat-pulses")).toEqual(original?.items);
    expect(matPilatesWeightsBlockPlank.version).toBe(2);
  });

  it("preserves all fifteen supplied rows, asymmetric timing, and instructor notes", () => {
    const steps = compileClass(matPilatesWeightsBlockPlank).steps.filter((step) => step.phase.id === "plank-side-body");
    expect(steps.map((step) => [step.name, step.durationMs / 1000])).toEqual([
      ["Downward facing dog to side plank leg bend (holding block) (L)", 40],
      ["Side plank arm twist to mat and up (holding block) (L)", 40],
      ["High plank Knee drive (L)", 40],
      ["Bear plank side twists", 40],
      ["REST", 15],
      ["Lying kneedrive (R) balance block on side of foot", 60],
      ["Lying leg lift (R) balance block on side of foot", 60],
      ["REST", 20],
      ["Downward facing dog to side plank leg bend (holding block) (R)", 40],
      ["Side plank arm twist to mat and up (holding block) (R)", 40],
      ["High plank Knee drive (L)", 10],
      ["Bear plank side twists", 40],
      ["REST", 15],
      ["Lying kneedrive (L) balance block on side of foot", 40],
      ["Lying leg lift (L) balance block on side of foot", 40]
    ]);
    expect(steps.filter((step) => step.kind === "rest")).toHaveLength(3);
    expect(steps[5]?.shortDescription).toBe("Left leg on top Balancing block on heel/side of foot");
    expect(steps[11]?.shortDescription).toBe("Same hand’s forearms on block, weight behind knee");
  });
});
