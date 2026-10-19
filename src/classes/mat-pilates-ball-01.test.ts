import { expect, it } from "vitest";
import { compileClass } from "../domain/compile-class";
import { availableClasses } from "./index";
import { matPilatesBall01, matPilatesBall01Catalog } from "./mat-pilates-ball-01";

it("applies instructor timing revisions with explicit breaks", () => {
  const timeline = compileClass(matPilatesBall01);
  expect(timeline.steps).toHaveLength(99);
  expect(timeline.totalDurationMs).toBe(3_350_000);
  expect(timeline.phases.map((phase) => phase.id)).toEqual([
    "intro", "warmup", "core", "glutes", "lower-body", "side-body", "upper-body", "cooldown"
  ]);
  expect(timeline.phases.slice(2, 7).map((phase) => phase.name)).toEqual([
    "Circuit #1: core", "Circuit #2: glutes", "Circuit #3: lower body",
    "Circuit #4: side body", "Circuit #5: upper body"
  ]);
  const steps = timeline.steps;
  expect(timeline.definition.version).toBe(4);
  expect(steps[0]?.sourceId).toBe("introduction");
  expect(steps[0]?.durationMs).toBe(120_000);
  for (const id of ["thread-l", "thread-r", "warmup-end", "upper-body-setup", "side-body-setup"]) {
    expect(steps.find((step) => step.sourceId === id)?.durationMs).toBe(60_000);
  }
  expect(steps.some((step) => step.sourceId === "lower-end-r")).toBe(false);
  const coreSteps = steps.filter((step) => step.phase.id === "core");
  expect(coreSteps.at(-2)?.sourceId).toBe("boat-hold");
  expect(coreSteps.at(-2)?.durationMs).toBe(30_000);
  expect(coreSteps.at(-3)?.sourceId).toBe("boat-setup");
  expect(coreSteps.at(-3)?.durationMs).toBe(10_000);
  expect(coreSteps.at(-4)?.sourceId).toBe("scissors");
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
