import { describe, expect, it } from "vitest";
import { matPilates0724 } from "../classes/mat-pilates-07-24";
import { matPilates0731 } from "../classes/mat-pilates-07-31";
import {
  hiitPilatesSliders,
  hiitPilatesSlidersLegacy
} from "../classes/hiit-pilates-sliders";
import { matPilatesBand, matPilatesBandLegacy } from "../classes/mat-pilates-band";
import { matPilatesRing } from "../classes/mat-pilates-ring";
import {
  matPilatesWeightsBlock,
  matPilatesWeightsBlockLegacy
} from "../classes/mat-pilates-weights-block";
import { compileClass } from "./compile-class";
import { ClassValidationError } from "./validate-class";

describe("compileClass", () => {
  it("compiles the weights and block class with stable totals and catalog equivalence", () => {
    const compiled = compileClass(matPilatesWeightsBlock);
    const legacy = compileClass(matPilatesWeightsBlockLegacy);

    expect(compiled.steps).toHaveLength(94);
    expect(compiled.totalDurationMs).toBe(3_485_000);
    const playbackFields = ({ durationMs, kind, shortDescription, longDescription }:
      (typeof compiled.steps)[number]) => ({ durationMs, kind, shortDescription, longDescription });
    expect(compiled.steps.map(playbackFields)).toEqual(legacy.steps.map(playbackFields));
    expect(compiled.steps.filter((step) =>
      step.phase.id === "upper-body" && step.kind === "exercise"
    ).map((step) => step.name)).toEqual([
      "Front arm raises",
      "Arm raises to the side",
      "Bent Over Dumbbell Reverse Fly",
      "Biceps curls",
      "Close-Grip Push-Up hand on block",
      "Close-grip high plank",
      "Close-Grip Push-Up hand on block",
      "Biceps curls",
      "Bent Over Dumbbell Reverse Fly",
      "Arm raises to the side",
      "Front arm raises"
    ]);
    expect(compiled.steps.at(-1)?.name).toBe("Shavasana");
  });

  it("expands phases and repeated rounds in authored order", () => {
    const compiled = compileClass(matPilates0724);

    expect(compiled.steps).toHaveLength(100);
    expect(compiled.totalDurationMs).toBe(3_680_000);
    expect(compiled.phases).toEqual([
      { id: "introduction", name: "Introduction", index: 1, stepCount: 1, durationMs: 120_000 },
      { id: "warmup", name: "Warm-Up", index: 2, stepCount: 6, durationMs: 240_000 },
      { id: "core-circuit", name: "Circuit 1 — Core", index: 3, stepCount: 11, durationMs: 310_000 },
      { id: "glutes-circuit", name: "Circuit 2 — Glutes", index: 4, stepCount: 10, durationMs: 400_000 },
      { id: "posterior-core-circuit", name: "Circuit 3 — Core, Glutes, and Back", index: 5, stepCount: 14, durationMs: 400_000 },
      { id: "lower-body-circuit", name: "Circuit 4 — Lower Body", index: 6, stepCount: 18, durationMs: 490_000 },
      { id: "side-body-circuit", name: "Circuit 5 — Side Body", index: 7, stepCount: 32, durationMs: 1_060_000 },
      { id: "cooldown", name: "Cooldown", index: 8, stepCount: 8, durationMs: 660_000 }
    ]);

    expect(compiled.steps[0]?.name).toBe("Class introduction");
    expect(compiled.steps.at(-1)?.name).toBe("Child's pose");
    expect(compiled.steps.filter((step) => step.kind === "rest").every((step) => step.name === "REST"))
      .toBe(true);
  });

  it("assigns round and within-round step labels", () => {
    const compiled = compileClass({
      schemaVersion: 1,
      id: "repeat-test",
      version: 1,
      title: "Repeat test",
      phases: [{
        id: "main",
        name: "Main",
        items: [{
          type: "repeat",
          id: "rounds",
          rounds: 3,
          items: [
            { type: "exercise", id: "move", name: "Move", durationSeconds: 30 },
            { type: "rest", id: "break", durationSeconds: 10 }
          ]
        }]
      }]
    });

    expect(compiled.steps.map((step) => step.round)).toEqual([
      { repeatId: "rounds", index: 1, count: 3 },
      { repeatId: "rounds", index: 1, count: 3 },
      { repeatId: "rounds", index: 2, count: 3 },
      { repeatId: "rounds", index: 2, count: 3 },
      { repeatId: "rounds", index: 3, count: 3 },
      { repeatId: "rounds", index: 3, count: 3 }
    ]);
    expect(compiled.steps.map((step) => step.step)).toEqual([
      { index: 1, count: 2 },
      { index: 2, count: 2 },
      { index: 1, count: 2 },
      { index: 2, count: 2 },
      { index: 1, count: 2 },
      { index: 2, count: 2 }
    ]);
  });

  it("compiles the July 31 source rows with stable totals", () => {
    const compiled = compileClass(matPilates0731);

    expect(compiled.steps).toHaveLength(103);
    expect(compiled.totalDurationMs).toBe(3_480_000);
    expect(compiled.phases).toEqual([
      { id: "introduction", name: "Introduction", index: 1, stepCount: 1, durationMs: 120_000 },
      { id: "standing-warmup", name: "Warm-Up (Standing)", index: 2, stepCount: 7, durationMs: 300_000 },
      { id: "standing-lower-body", name: "Circuit #1: Standing lower body", index: 3, stepCount: 14, durationMs: 440_000 },
      { id: "quadruped-glutes-core", name: "Circuit #2: glutes and core", index: 4, stepCount: 24, durationMs: 670_000 },
      { id: "core-circuit", name: "Circuit #3: core", index: 5, stepCount: 20, durationMs: 630_000 },
      { id: "side-body-circuit", name: "Circuit #4: side body", index: 6, stepCount: 20, durationMs: 550_000 },
      { id: "upper-body-back", name: "Circuit #5: upper body and back", index: 7, stepCount: 9, durationMs: 290_000 },
      { id: "cooldown", name: "Cooldown", index: 8, stepCount: 8, durationMs: 480_000 }
    ]);
    expect(compiled.steps[1]).toMatchObject({
      runtimeId: "mat-pilates-07-31/standing-warmup/alternating-knee-pulls",
      name: "Knee pulls alternating legs"
    });
    expect(compiled.steps.filter((step) => step.kind === "rest").every((step) => step.name === "REST"))
      .toBe(true);
    expect(compiled.steps.some((step) => step.name === "Alternating bird dogs")).toBe(true);
    expect(compiled.steps.filter((step) => step.name.startsWith("Donkey kick")).map((step) => ({
      name: step.name,
      side: step.exerciseReference?.side
    }))).toEqual([
      { name: "Donkey kick", side: "left" },
      { name: "Donkey kick", side: "right" }
    ]);
    expect(compiled.steps.some((step) => step.name.startsWith("Side crunch with leg extension")))
      .toBe(false);
    expect(compiled.steps.at(-1)?.name).toBe("Shavasana");
  });

  it("compiles the sliders class with stable totals", () => {
    const compiled = compileClass(hiitPilatesSliders);

    expect(compiled.steps).toHaveLength(104);
    expect(compiled.totalDurationMs).toBe(3_600_000);
    expect(compiled.phases).toEqual([
      { id: "warmup", name: "Warm-Up", index: 1, stepCount: 4, durationMs: 180_000 },
      { id: "abs-circuit", name: "Circuit #1: Abs", index: 2, stepCount: 23, durationMs: 590_000 },
      { id: "upper-core-one", name: "Circuit #2: Upper Body and Core", index: 3, stepCount: 6, durationMs: 210_000 },
      { id: "hiit-legs", name: "Circuit #3: Legs Focused", index: 4, stepCount: 32, durationMs: 730_000 },
      { id: "plank-pyramid", name: "Circuit #4: Upper Body and Core Pyramid", index: 5, stepCount: 7, durationMs: 280_000 },
      { id: "upper-core-two", name: "Circuit #5: Upper Body and Core", index: 6, stepCount: 12, durationMs: 420_000 },
      { id: "side-body", name: "Circuit #6: Side Body", index: 7, stepCount: 14, durationMs: 560_000 },
      { id: "cooldown", name: "Cooldown", index: 8, stepCount: 6, durationMs: 630_000 }
    ]);
    expect(compiled.steps.filter((step) => step.kind === "rest").every((step) => step.name === "REST"))
      .toBe(true);
    expect(compiled.steps.at(-1)?.name).toBe("Shavasana");
  });

  it("compiles the updated ring class with stable totals", () => {
    const compiled = compileClass(matPilatesRing);

    expect(compiled.steps).toHaveLength(94);
    expect(compiled.totalDurationMs).toBe(3_590_000);
    expect(compiled.phases).toEqual([
      { id: "introduction", name: "INTRODUCTION", index: 1, stepCount: 1, durationMs: 120_000 },
      { id: "warmup", name: "Warm-Up", index: 2, stepCount: 7, durationMs: 330_000 },
      { id: "abs-arms-back", name: "Circuit #1: ABS + ARMS CIRCUIT + back", index: 3, stepCount: 14, durationMs: 540_000 },
      { id: "core-glutes", name: "Circuit #2: Core + Glutes", index: 4, stepCount: 14, durationMs: 565_000 },
      { id: "legs-focused", name: "Circuit #3: legs focused X 2 (switch sides)", index: 5, stepCount: 12, durationMs: 370_000 },
      { id: "side-body", name: "Circuit #4: Side body", index: 6, stepCount: 20, durationMs: 550_000 },
      { id: "mat-core", name: "Circuit #5: Mat Pilates core", index: 7, stepCount: 16, durationMs: 475_000 },
      { id: "cooldown", name: "Cooldown", index: 8, stepCount: 10, durationMs: 640_000 }
    ]);
    expect(compiled.steps.filter((step) => step.kind === "rest").every((step) => step.name === "REST"))
      .toBe(true);
    expect(compiled.steps.some((step) => step.sourceId.startsWith("in-out-press-"))).toBe(false);
    expect(compiled.steps.filter((step) => step.name === "Squat -> add arms with ring")).toHaveLength(2);
    expect(compiled.steps.filter((step) => step.name === "Squat pulse with ring")).toHaveLength(2);
    const assistedPushUp = compiled.steps.find((step) => step.sourceId === "assisted-knee-push-up");
    expect(assistedPushUp).toMatchObject({
      name: "Assisted knee push-up",
      durationMs: 30_000,
      rig: "ring-assisted-knee-push-ups"
    });
    expect(assistedPushUp?.longDescription).toContain("ring vertically under the chest");
    const sideBodySteps = compiled.steps.filter((step) => step.phase.id === "side-body");
    expect(sideBodySteps.filter((step) => step.kind === "exercise").every((step) => step.durationMs === 30_000))
      .toBe(true);
    expect(sideBodySteps.filter((step) => step.kind === "exercise").map((step) => ({
      name: step.name,
      side: step.exerciseReference?.side
    }))).toEqual([
      { name: "Hip lifts with ring press", side: "left" },
      { name: "Hip lifts + leg extensions", side: "left" },
      { name: "Lower and lift top leg", side: "left" },
      { name: "Side crunch lifted leg in", side: "left" },
      { name: "Lift and tap ring", side: "left" },
      { name: "Lift and lower inside leg", side: "right" },
      { name: "Both legs lift", side: "left" },
      { name: "Hip lifts with ring press", side: "right" },
      { name: "Hip lifts + leg extensions", side: "right" },
      { name: "Lower and lift top leg", side: "right" },
      { name: "Side crunch lifted leg in", side: "right" },
      { name: "Lift and tap ring", side: "right" },
      { name: "Lift and lower inside leg", side: "left" },
      { name: "Both legs lift", side: "right" }
    ]);
    expect(sideBodySteps.find((step) => step.sourceId === "side-lift-tap-ring-l")?.longDescription)
      .toContain("lower R leg");
    expect(sideBodySteps.filter((step) => step.sourceId.includes("-rest-")).map((step) => step.sourceId)).toEqual([
      "side-body-l-rest-2",
      "side-body-l-rest-4",
      "side-body-r-rest-2",
      "side-body-r-rest-4"
    ]);
    const matCoreSteps = compiled.steps.filter((step) => step.phase.id === "mat-core");
    expect(matCoreSteps.filter((step) => step.sourceId.startsWith("mat-core-rest-"))).toHaveLength(7);
    expect(matCoreSteps.find((step) => step.sourceId === "leg-lowers-ring-calves")).toMatchObject({
      name: "Leg lowers (ring around calves)",
      durationMs: 45_000,
      rig: "ring-banded-leg-lowers"
    });
    expect(compiled.steps.filter((step) => step.phase.id === "cooldown").map((step) => step.name)).toEqual([
      "REST",
      "Single leg hug knees to chest",
      "Reclining tree pose",
      "Reclining twist",
      "Windshield wipers",
      "Single leg hug knees to chest",
      "Reclining tree pose",
      "Reclining twist",
      "REST",
      "Shavasana"
    ]);
    const thighSqueezeIndex = compiled.steps.findIndex((step) => step.sourceId === "ring-between-thighs-squeeze");
    expect(compiled.steps[thighSqueezeIndex + 1]?.sourceId).toBe("bridge-ring-between-thighs-press");
    const bridgeIndex = compiled.steps.findIndex((step) => step.sourceId === "bridge-ring-thighs");
    expect(compiled.steps[bridgeIndex - 1]).toMatchObject({
      sourceId: "tabletop-to-bridge",
      kind: "rest",
      durationMs: 30_000
    });
    expect(compiled.steps.at(-1)?.name).toBe("Shavasana");
  });

  it("keeps the catalog-backed sliders course equivalent to its legacy timeline", () => {
    const legacy = compileClass(hiitPilatesSlidersLegacy);
    const catalogBacked = compileClass(hiitPilatesSliders);
    // Artwork is deliberately excluded: which visual a movement gets is owned by
    // the rig layer and covered by the artwork tests. This test guards timing,
    // ordering and guidance surviving the move onto the catalog.
    const playbackFields = (step: (typeof legacy.steps)[number]) => ({
      runtimePath: step.runtimeId.slice(step.runtimeId.indexOf("/")),
      sourceId: step.sourceId,
      kind: step.kind,
      name: step.name,
      durationMs: step.durationMs,
      startsAtMs: step.startsAtMs,
      endsAtMs: step.endsAtMs,
      phase: step.phase,
      round: step.round,
      roundPath: step.roundPath,
      step: step.step,
      shortDescription: step.shortDescription,
      longDescription: step.longDescription
    });

    expect(catalogBacked.steps.map(playbackFields)).toEqual(legacy.steps.map(playbackFields));
    expect(catalogBacked.phases).toEqual(legacy.phases);
    expect(catalogBacked.totalDurationMs).toBe(legacy.totalDurationMs);
    expect(catalogBacked.steps.filter((step) => step.kind === "exercise").every(
      (step) => step.exerciseReference !== undefined
    )).toBe(true);
    expect(catalogBacked.steps.filter((step) => step.exerciseReference?.side === "left")).not.toHaveLength(0);
    expect(catalogBacked.steps.filter((step) => step.exerciseReference?.side === "right")).not.toHaveLength(0);
    expect(catalogBacked.steps.filter((step) => step.name === "Single-leg lunge with slider").map(
      (step) => step.exerciseReference?.side
    )).toEqual(["left", "right", "left", "right"]);
  });

  it("keeps the catalog-backed band timing and guidance equivalent to V1", () => {
    const legacy = compileClass(matPilatesBandLegacy);
    const catalogBacked = compileClass(matPilatesBand);
    const playbackFields = (step: (typeof legacy.steps)[number]) => ({
      runtimePath: step.runtimeId.slice(step.runtimeId.indexOf("/")),
      sourceId: step.sourceId,
      kind: step.kind,
      durationMs: step.durationMs,
      startsAtMs: step.startsAtMs,
      endsAtMs: step.endsAtMs,
      phase: step.phase,
      round: step.round,
      roundPath: step.roundPath,
      step: step.step,
      shortDescription: step.shortDescription,
      longDescription: step.longDescription
    });

    expect(catalogBacked.steps.map(playbackFields)).toEqual(legacy.steps.map(playbackFields));
    expect(catalogBacked.phases).toEqual(legacy.phases);
    expect(catalogBacked.totalDurationMs).toBe(legacy.totalDurationMs);
    expect(catalogBacked.steps.some((step) => step.exerciseReference?.side === "left")).toBe(true);
    expect(catalogBacked.steps.some((step) => step.exerciseReference?.side === "right")).toBe(true);
  });

  it("compiles the band class with stable totals", () => {
    const compiled = compileClass(matPilatesBand);

    expect(compiled.steps).toHaveLength(94);
    expect(compiled.totalDurationMs).toBe(3_600_000);
    expect(compiled.phases).toEqual([
      { id: "introduction", name: "Introduction", index: 1, stepCount: 1, durationMs: 120_000 },
      { id: "warmup", name: "Warm-Up", index: 2, stepCount: 5, durationMs: 300_000 },
      { id: "core-circuit", name: "Circuit #1: Core", index: 3, stepCount: 9, durationMs: 360_000 },
      { id: "glutes-circuit", name: "Circuit #2: Glutes", index: 4, stepCount: 14, durationMs: 600_000 },
      { id: "standing-legs", name: "Circuit #3: Legs Focused", index: 5, stepCount: 18, durationMs: 500_000 },
      { id: "lower-body-core-glutes", name: "Circuit #4: Lower Body, Core and Glutes", index: 6, stepCount: 18, durationMs: 500_000 },
      { id: "standing-upper-body-core", name: "Circuit #5: Standing Upper Body and Core", index: 7, stepCount: 18, durationMs: 700_000 },
      { id: "cooldown", name: "Cooldown", index: 8, stepCount: 11, durationMs: 520_000 }
    ]);
    expect(compiled.steps.filter((step) => step.kind === "rest").every((step) => step.name === "REST"))
      .toBe(true);
    expect(compiled.steps.at(-1)?.name).toBe("Shavasana");
  });

  it("calculates stable offsets and unique occurrence IDs", () => {
    const compiled = compileClass(matPilates0724);
    const catCow = compiled.steps[2];

    expect(catCow).toMatchObject({
      runtimeId: "mat-pilates-07-24/warmup/cat-cow",
      sourceId: "cat-cow",
      startsAtMs: 180_000,
      endsAtMs: 210_000
    });
    expect(new Set(compiled.steps.map((step) => step.runtimeId)).size).toBe(
      compiled.steps.length
    );
  });

  it("uses a default name for rests", () => {
    const compiled = compileClass({
      schemaVersion: 1,
      id: "rest-test",
      version: 1,
      title: "Rest test",
      phases: [
        {
          id: "main",
          name: "Main",
          items: [{ type: "rest", id: "quiet-break", durationSeconds: 10 }]
        }
      ]
    });

    expect(compiled.steps[0]?.name).toBe("Break");
  });

  it("rejects unknown fields and duplicate IDs with exact paths", () => {
    expect(() =>
      compileClass({
        schemaVersion: 1,
        id: "invalid-class",
        version: 1,
        title: "Invalid",
        phases: [
          {
            id: "main",
            name: "Main",
            items: [
              { type: "exercise", id: "move", name: "Move", durationSeconds: 10 },
              {
                type: "exercise",
                id: "move",
                name: "Move again",
                durationSeconds: 10,
                durationSecond: 12
              }
            ]
          }
        ]
      })
    ).toThrow(ClassValidationError);

    try {
      compileClass({
        schemaVersion: 1,
        id: "invalid-class",
        version: 1,
        title: "Invalid",
        phases: [
          {
            id: "main",
            name: "Main",
            items: [
              { type: "rest", id: "break", durationSeconds: 10 },
              { type: "rest", id: "break", durationSeconds: 10, durationSecond: 12 }
            ]
          }
        ]
      });
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(ClassValidationError);
      if (error instanceof ClassValidationError) {
        expect(error.issues).toContain('class.phases[0].items[1].id: duplicate ID "break" in this group');
        expect(error.issues).toContain("class.phases[0].items[1].durationSecond: unknown property");
      }
    }
  });
});
