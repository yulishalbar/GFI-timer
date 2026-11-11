import { expect, it } from "vitest";
import { compileClass } from "../domain/compile-class";
import { matPilatesBand } from "./mat-pilates-band";
import { matPilatesBandWeights } from "./mat-pilates-band-weights";
import { availableClasses, courseTagsById } from "./index";

it("preserves band guidance outside the revised upper-body circuit", () => {
  const original = compileClass(matPilatesBand);
  const weighted = compileClass(matPilatesBandWeights);
  expect(availableClasses.some((entry) => entry.definition.id === matPilatesBandWeights.id)).toBe(true);
  expect(courseTagsById[matPilatesBandWeights.id]).toEqual(expect.arrayContaining(["band", "weights"]));
  weighted.steps.filter((step) => !["standing-upper-body-core", "core-circuit", "cooldown", "glutes-circuit"].includes(step.phase.id) && !step.sourceId.startsWith("clamshell-to-teaser") && !step.sourceId.startsWith("teaser-setup")).forEach((step) => {
    const source = original.steps.find((entry) => entry.sourceId === step.sourceId)!;
    expect(step).toMatchObject({ sourceId: source.sourceId, name: source.name, kind: source.kind,
      durationMs: source.durationMs, phase: { id: source.phase.id } });
    expect(step.longDescription).toBe(source.longDescription);
    if (source.shortDescription && source.sourceId !== "cooldown-transition") expect(step.shortDescription).toContain(source.shortDescription);
    if (step.kind === "exercise" && step.phase.name.startsWith("Circuit")) {
      expect(step.shortDescription, step.sourceId).toMatch(/weight/i);
    }
    if (step.phase.id === "warmup") {
      expect(step.shortDescription).toBe(source.shortDescription);
    }
  });
  expect(original.steps[0]?.shortDescription).toBeUndefined();
  expect(weighted.steps.find((step) => step.sourceId === "standing-transition")?.shortDescription).toContain("Remove ankle weights");
  expect(weighted.steps.find((step) => step.sourceId === "single-leg-knee-hug-left")?.shortDescription).toContain("Set all weights beside the mat");
});

it("adds teaser after each clamshell sequence and runs two rounds of the seven weighted arm movements", () => {
  const { steps } = compileClass(matPilatesBandWeights);
  for (const side of ["left", "right"] as const) {
    const index = steps.findIndex((step) => step.sourceId === `clamshell-to-teaser-${side}`);
    expect(steps[index]).toMatchObject({ name: "Clamshell to teaser", durationMs: 40_000, exerciseReference: { side } });
    expect(steps[index - 1]?.sourceId).toBe(side === "left" ? "clamshell-lifts-left" : "side-body-crunches-right");
  }
  const arms = steps.filter((step) => step.phase.id === "standing-upper-body-core");
  const names = ["Book opens", "Hinged shoulder press to sides", "Around the worlds", "Bicep curl → front press (palms towards chest)", "Serve the platter", "Front raise + around the world", "Wide offering with rotation"];
  expect(arms.filter((step) => step.kind === "exercise").map((step) => step.name)).toEqual([...names, ...names]);
  expect(arms.filter((step) => step.kind === "exercise").every((step) => step.durationMs === 40_000 && step.shortDescription?.includes("light hand weights"))).toBe(true);
  expect(arms[0]?.shortDescription).toContain("set the band beside the mat");
  const sideBody = steps.filter((step) => step.phase.id === "lower-body-core-glutes");
  expect(sideBody.filter((step) => step.kind === "rest").map((step) => step.sourceId)).toEqual(["side-body-setup"]);
  expect(sideBody.filter((step) => step.kind === "exercise")).toHaveLength(11);
  expect(sideBody[0]).toMatchObject({ kind: "rest", durationMs: 60_000 });
  expect(matPilatesBandWeights.version).toBe(9);
  expect(matPilatesBandWeights.phases.map((phase) => phase.id)).toEqual([
    "introduction", "warmup", "core-circuit", "glutes-circuit", "standing-legs",
    "standing-upper-body-core", "lower-body-core-glutes", "cooldown"
  ]);
});

it("runs the requested reclining cooldown left then right with an explicit shavasana setup", () => {
  const cooldown = compileClass(matPilatesBandWeights).steps.filter((step) => step.phase.id === "cooldown");
  expect(cooldown.map((step) => [step.sourceId, step.durationMs, step.exerciseReference?.side])).toEqual([
    ["single-leg-knee-hug-left", 90_000, "left"], ["reclining-tree-left", 30_000, "left"], ["reclining-twist-left", 30_000, "left"],
    ["windshield-wipers", 90_000, undefined],
    ["single-leg-knee-hug-right", 90_000, "right"], ["reclining-tree-right", 30_000, "right"], ["reclining-twist-right", 30_000, "right"],
    ["shavasana-setup", 10_000, undefined], ["shavasana", 180_000, undefined]
  ]);
  expect(cooldown[0]?.shortDescription).toContain("roll onto your back");
  expect(cooldown.at(-2)?.shortDescription).toBe("Extend legs straight out.");
});

it("replaces each glute tail with regular crunches and keeps the full class under one hour", () => {
  const compiled = compileClass(matPilatesBandWeights);
  const glutes = compiled.steps.filter((step) => step.phase.id === "glutes-circuit");
  expect(glutes.map((step) => step.sourceId)).toEqual([
    "glutes-setup", "donkey-kick-l", "donkey-kick-crossover-l", "donkey-kick-dog-crunch-l", "donkey-kick-regular-crunch-left",
    "glutes-side-switch", "donkey-kick-r", "donkey-kick-crossover-r", "donkey-kick-dog-crunch-r", "donkey-kick-regular-crunch-right"
  ]);
  for (const step of glutes.filter((entry) => entry.sourceId.startsWith("donkey-kick-regular-crunch-"))) {
    expect(step.durationMs).toBe(40_000);
    expect(step.longDescription).toContain("supporting knee grounded");
  }
  expect(compiled.steps.some((step) => step.sourceId === "cooldown-transition")).toBe(false);
  expect(compiled.totalDurationMs).toBe(3_590_000);
  expect(compiled.totalDurationMs).toBeLessThanOrEqual(3_600_000);
});

it("runs seated band core left then right, three teaser-row sets and a twenty-second boat hold", () => {
  const core = compileClass(matPilatesBandWeights).steps.filter((step) => step.phase.id === "core-circuit");
  expect(core.filter((step) => step.kind === "rest")).toHaveLength(1);
  expect(core.filter((step) => step.kind === "exercise").map((step) => [step.sourceId, step.durationMs, step.exerciseReference?.side])).toEqual([
    ["half-roll-up", 40_000, undefined], ["alternating-arm-rows", 40_000, undefined], ["alternating-rows-knee-drive", 40_000, undefined],
    ["single-leg-knee-drive-left", 40_000, "left"], ["held-leg-side-sweeps-left", 40_000, "left"], ["seated-leg-pulses-left", 20_000, "left"],
    ["single-leg-knee-drive-right", 40_000, "right"], ["held-leg-side-sweeps-right", 40_000, "right"], ["seated-leg-pulses-right", 20_000, "right"],
    ["teaser-arm-rows-1", 40_000, undefined], ["teaser-arm-rows-2", 40_000, undefined], ["teaser-arm-rows-3", 40_000, undefined], ["boat-hold", 20_000, undefined]
  ]);
  for (const step of core) {
    if (step.sourceId.startsWith("teaser-arm-rows-")) {
      expect(step.shortDescription).toContain("arches of both feet");
      expect(step.shortDescription).not.toMatch(/above knees/i);
      expect(step.longDescription).toContain("arches of both feet");
    } else expect(step.shortDescription).toMatch(/band above knees/i);
  }
  expect(core.map((step) => `${step.shortDescription} ${step.longDescription}`).join(" ")).not.toMatch(/band (below|around (shins|wrists))/i);
});
