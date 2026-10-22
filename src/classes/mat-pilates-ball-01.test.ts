import { expect, it } from "vitest";
import { compileClass } from "../domain/compile-class";
import { availableClasses } from "./index";
import { matPilatesBall01, matPilatesBall01Catalog } from "./mat-pilates-ball-01";

it("applies instructor timing revisions with explicit breaks", () => {
  const timeline = compileClass(matPilatesBall01);
  expect(timeline.steps).toHaveLength(94);
  expect(timeline.totalDurationMs).toBe(3_470_000);
  expect(timeline.phases.map((phase) => phase.id)).toEqual([
    "intro", "warmup", "core", "glutes", "lower-body", "side-body", "upper-body", "cooldown"
  ]);
  expect(timeline.phases.slice(2, 7).map((phase) => phase.name)).toEqual([
    "Circuit #1: core", "Circuit #2: glutes", "Circuit #3: lower body",
    "Circuit #4: side body", "Circuit #5: upper body"
  ]);
  const steps = timeline.steps;
  expect(timeline.definition.version).toBe(10);
  const warmupSteps = steps.filter((step) => step.phase.id === "warmup");
  expect(warmupSteps.slice(5, 7).map((step) => [
    step.name, step.exerciseReference?.side, step.durationMs
  ])).toEqual([
    ["Bird dogs with wrist rotations", "right", 30_000],
    ["Bird dogs with wrist rotations", "left", 30_000]
  ]);
  expect(warmupSteps[6]?.shortDescription).toContain("equipment");
  expect(steps[0]?.sourceId).toBe("introduction");
  expect(steps[0]?.durationMs).toBe(120_000);
  for (const id of ["thread-l", "thread-r", "warmup-end", "upper-body-setup", "side-body-setup"]) {
    expect(steps.find((step) => step.sourceId === id)?.durationMs).toBe(60_000);
  }
  expect(steps.some((step) => step.sourceId === "lower-end-r")).toBe(false);
  for (const phaseId of ["side-body", "upper-body"]) {
    expect(steps.some((step) =>
      step.phase.id === phaseId && step.kind === "rest" && step.durationMs === 10_000
    )).toBe(false);
  }
  expect(steps.filter((step) => step.phase.id === "side-body" && step.kind === "rest")
    .map((step) => step.durationMs)).toEqual([60_000, 20_000, 30_000, 20_000]);
  expect(steps.filter((step) => step.phase.id === "upper-body" && step.kind === "rest")
    .map((step) => step.durationMs)).toEqual([60_000]);
  const upperExercises = steps.filter((step) => step.phase.id === "upper-body" && step.kind === "exercise");
  expect(upperExercises.map((step) => step.sourceId)).toEqual([
    "bear-rotations", "bear-pike", "bear-arm-lifts", "push-ups", "swan", "ball-lifts", "around-world",
    "bear-rotations-repeat", "bear-pike-repeat", "bear-arm-lifts-repeat"
  ]);
  expect(upperExercises.slice(-3).map((step) => [step.name, step.durationMs]))
    .toEqual(upperExercises.slice(0, 3).map((step) => [step.name, step.durationMs]));
  expect(upperExercises.slice(-3).map((step) => step.durationMs)).toEqual([30_000, 30_000, 30_000]);
  expect(upperExercises.find((step) => step.sourceId === "ball-lifts")).toMatchObject({
    name: "Ball lifts", durationMs: 30_000
  });
  const gluteSteps = steps.filter((step) => step.phase.id === "glutes");
  expect(gluteSteps.at(-1)?.sourceId).toBe("full-range-glute-bridges");
  expect(gluteSteps.at(-1)?.durationMs).toBe(40_000);
  expect(gluteSteps.at(-2)?.sourceId).toBe("pulse-l");
  const coreSteps = steps.filter((step) => step.phase.id === "core");
  expect(coreSteps.slice(-3, -1).map((step) => [
    step.name, step.exerciseReference?.side, step.durationMs
  ])).toEqual([
    ["Single-leg deadbug (ball between hand and thigh)", "left", 40_000],
    ["Single-leg deadbug (ball between hand and thigh)", "right", 40_000]
  ]);
  expect(coreSteps.at(-4)?.sourceId).toBe("deadbug-setup");
  expect(coreSteps.at(-4)?.durationMs).toBe(10_000);
  expect(coreSteps.at(-4)?.shortDescription).toContain("single-leg deadbug");
  expect(coreSteps.at(-5)?.sourceId).toBe("scissors");
  expect(steps.some((step) => step.name === "Boat hold")).toBe(false);
  expect(steps.filter((step) => step.phase.id === "lower-body" && step.kind === "exercise")
    .map((step) => step.durationMs)).toEqual(Array(12).fill(30_000));
  expect(steps.find((step) => step.sourceId === "side-switch")?.durationMs).toBe(30_000);
  for (const side of ["l", "r"]) {
    const twistIndex = steps.findIndex((step) => step.sourceId === `half-moon-${side}`);
    expect(steps[twistIndex + 1]?.sourceId).toBe(`half-moon-pulse-${side}`);
  }
  expect(steps.some((step) => step.sourceId === "puppy")).toBe(false);
  expect(coreSteps.at(-1)?.sourceId).toBe("core-end");
  expect(steps.find((step) => step.sourceId === "glutes-switch")?.durationMs).toBe(30_000);
  expect(steps.find((step) => step.sourceId === "pulse-l")?.exerciseReference?.side).toBe("left");
  expect(steps.find((step) => step.sourceId === "pulse-r")?.exerciseReference?.side).toBe("right");
  for (const side of ["l", "r"]) {
    const lizardIndex = steps.findIndex((step) => step.sourceId === `lizard-${side}`);
    expect(steps[lizardIndex + 1]?.sourceId).toBe(`half-split-${side}`);
    expect(steps[lizardIndex + 1]?.durationMs).toBe(30_000);
    expect(steps[lizardIndex + 1]?.exerciseReference?.side).toBe(side === "l" ? "left" : "right");
    expect(steps[lizardIndex + 2]?.sourceId).toBe(`pigeon-${side}`);
  }
  expect(steps.at(-1)?.durationMs).toBe(180_000);
  expect(steps.at(-1)?.longDescription).toContain("wipe down your mat and the Pilates ball");
});

it("registers the new course and its exercises alongside the original ball class", () => {
  expect(availableClasses.some((course) => course.definition.id === "mat-pilates-ball-01")).toBe(true);
  expect(availableClasses.some((course) => course.definition.id === "mat-pilates-ball")).toBe(true);
  expect(matPilatesBall01Catalog.catalog.exercises.some((exercise) =>
    exercise.name === "Bear hold to pike (ball between thighs)"
  )).toBe(true);
});
