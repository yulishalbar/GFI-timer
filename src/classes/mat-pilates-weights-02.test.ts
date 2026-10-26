import { expect, it } from "vitest";
import { compileClass } from "../domain/compile-class";
import { availableClasses, availableExerciseCatalog, courseTagsById } from "./index";
import { weightsMobilityExercises } from "../catalog/weights-mobility";
import { matPilatesWeights02, matPilatesWeights02Catalog } from "./mat-pilates-weights-02";
import { matPilatesWeights } from "./mat-pilates-weights";

it("registers the second weights class with explicit transitions and the intended circuit order", () => {
  const compiled = compileClass(matPilatesWeights02);
  expect(availableClasses.some((item) => item.definition.id === matPilatesWeights02.id)).toBe(true);
  expect(courseTagsById[matPilatesWeights02.id]).toContain("weights");
  expect(compiled.totalDurationMs).toBe(3_480_000);
  expect(compiled.steps).toHaveLength(104);
  expect(matPilatesWeights02Catalog.course.phases.map((phase) => phase.id)).toEqual([
    "introduction", "warmup", "standing-lower-body", "upper-body-back",
    "glutes-circuit", "core-circuit", "side-body-circuit", "cooldown"
  ]);
  const standing = compiled.steps.filter((step) => step.phase.id === "standing-lower-body");
  expect(standing[0]?.sourceId).toBe("slow-squats");
  expect(standing[2]).toMatchObject({ kind: "rest", durationMs: 20_000 });
  expect(compiled.steps.map((step) => `${step.name} ${step.shortDescription ?? ""} ${step.longDescription ?? ""}`).join(" ")).not.toMatch(/\b(band|slider|block|ring)\b|pilates ball/i);
});

it("changes the movements, rather than merely reordering the original weighted circuits", () => {
  const original = compileClass(matPilatesWeights);
  const revised = compileClass(matPilatesWeights02);
  const originalNames = new Set(original.steps.filter((step) => step.phase.name.startsWith("Circuit")).map((step) => step.name));
  const circuitExercises = revised.steps.filter((step) => step.kind === "exercise" && step.phase.name.startsWith("Circuit"));
  expect(circuitExercises.filter((step) => !originalNames.has(step.name)).length).toBeGreaterThan(circuitExercises.length / 2);
  expect(circuitExercises.map((step) => step.name)).toEqual(expect.arrayContaining([
    "Single arm toe reach with weight", "Reverse lunge", "B-Stance Squats hold + biceps curls",
    "Front arm raises", "Fire hydrant with weight behind knee", "Crunch knee in with weight behind knee", "Bottom leg lifts"
  ]));
  expect(original.totalDurationMs).toBe(3_520_000);
  expect(matPilatesWeights02.version).toBe(16);
});

it("keeps the glute load explicit throughout and side body on the mat", () => {
  const { steps, phases } = compileClass(matPilatesWeights02);
  expect(phases.filter((phase) => phase.name.startsWith("Circuit")).map((phase) => phase.name)).toEqual([
    "Circuit #1: Standing Legs", "Circuit #2: Kneeling Arms", "Circuit #3: Bent-Knee Glutes",
    "Circuit #4: Abs", "Circuit #5: Side Body and Inner Thighs"
  ]);
  const glutes = steps.filter((step) => step.phase.id === "glutes-circuit" && step.kind === "exercise");
  expect(glutes).toHaveLength(12);
  for (const step of glutes) {
    expect(step.shortDescription, step.name).toMatch(/weight behind the bent (left|right) knee/i);
    expect(step.longDescription, step.name).not.toMatch(/across the hips|extend the leg/i);
  }
  const sideBody = steps.filter((step) => step.phase.id === "side-body-circuit");
  expect(sideBody.filter((step) => step.kind === "exercise").map((step) => step.name)).toEqual([
    ...Array.from({ length: 2 }, () => ["Leg lift", "Pulse leg at the top", "Forward and back kick", "Clamshell openers", "Clamshell lifts", "Bottom leg lifts", "Bottom leg pulses"]).flat()
  ]);
  expect(sideBody.map((step) => `${step.name} ${step.shortDescription ?? ""}`).join(" ")).not.toMatch(/suitcase|march|standing|stand up/i);
  expect(sideBody.at(-1)?.shortDescription).toContain("set the weight beside the mat");
});

it("adds new warm-up and cooldown movements to the shared library with complete offline instructions", () => {
  const { steps } = compileClass(matPilatesWeights02);
  const warmup = steps.filter((step) => step.phase.id === "warmup");
  const cooldown = steps.filter((step) => step.phase.id === "cooldown");
  expect(warmup.reduce((total, step) => total + step.durationMs, 0)).toBe(360_000);
  expect(cooldown.reduce((total, step) => total + step.durationMs, 0)).toBe(450_000);
  expect(warmup.map((step) => step.name)).toEqual([
    "March in place", "Overhead side body stretch", "Overhead side body stretch",
    "Back bend (hands behind ears)", "Standing forward fold", "Standing open the gate",
    "Standing heel raises", "Yogi squat", "Squat Twist & reach", "REST"
  ]);
  expect(cooldown.at(-1)?.name).toBe("Shavasana");
  for (const exercise of weightsMobilityExercises) {
    expect(availableExerciseCatalog.exercises.find((entry) => entry.id === exercise.id)).toEqual(exercise);
    // Retained catalog movements stay available even when this schedule stops using them.
    expect(exercise.longDescription?.length).toBeGreaterThan(60);
  }
});

it("gives left and right movements equal time and sets weights down before switching sides", () => {
  const { steps } = compileClass(matPilatesWeights02);
  const times = new Map<string, { left: number; right: number }>();
  for (const step of steps) {
    const side = step.exerciseReference?.side;
    if (!side) continue;
    const duration = times.get(step.name) ?? { left: 0, right: 0 };
    duration[side] += step.durationMs;
    times.set(step.name, duration);
  }
  for (const [name, time] of times) expect(time.left, name).toBe(time.right);
  expect(steps.find((step) => step.sourceId === "side-body-switch")).toMatchObject({ kind: "rest", durationMs: 30_000 });
  expect(steps.find((step) => step.sourceId === "side-body-switch")?.shortDescription).toContain("Set the weight beside the mat");
});

it("gives every main-circuit exercise a weighted instruction and keeps abs focused on mat abdominal work", () => {
  const { steps, phases } = compileClass(matPilatesWeights02);
  const circuits = phases.filter((phase) => phase.name.startsWith("Circuit"));
  expect(circuits).toHaveLength(5);
  for (const phase of circuits) {
    const exercises = steps.filter((step) => step.phase.id === phase.id && step.kind === "exercise");
    expect(exercises.length).toBeGreaterThan(0);
    for (const exercise of exercises) {
      expect(exercise.shortDescription, `${phase.name}: ${exercise.name}`).toMatch(/weight/i);
    }
  }
  expect(steps.find((step) => step.sourceId === "toe-reach-right")?.shortDescription).toContain("weight in the right hand");
  expect(steps.find((step) => step.sourceId === "knee-crunch-right")?.shortDescription).toContain("weight behind the bent right knee");
  expect(steps.filter((step) => step.phase.id === "core-circuit" && step.kind === "exercise").map((step) => step.name)).toEqual([
    "Single arm toe reach with weight", "Leg lowers", "Single arm toe reach with weight", "Leg lowers",
    "Sit up twist", "Leg lowers", "Sit up twist", "Leg lowers", "Crunch to sit up with weight", "Leg lowers", "Russian twists", "Seated ab rows with weight", "Seated ab rows with weight", "Seated ab row with both arms"
  ]);
  expect(steps.map((step) => step.name).join(" ")).not.toMatch(/floor press|suitcase/i);
  for (const name of ["Hundred prep with hand weights", "Half roll back with weight", "Crunch knee in with weight behind knee"]) {
    expect(availableExerciseCatalog.exercises.some((exercise) => exercise.name === name && exercise.tags.includes("weights")), name).toBe(true);
  }
});

it("runs matching bent-knee glute sequences with explicit equipment transitions", () => {
  const { steps, phases } = compileClass(matPilatesWeights02);
  expect(phases.find((phase) => phase.id === "glutes-circuit")?.durationMs).toBe(520_000);
  for (const side of ["left", "right"] as const) {
    const exercises = steps.filter((step) => step.phase.id === "glutes-circuit" && step.exerciseReference?.side === side);
    expect(exercises.map((step) => [step.sourceId, step.durationMs])).toEqual([
      [`donkey-kick-${side}`, 40_000], [`donkey-pulses-${side}`, 20_000],
      [`hydrant-${side}`, 40_000], [`hydrant-pulses-${side}`, 20_000],
      [`crossover-${side}`, 40_000], [`knee-crunch-${side}`, 40_000]
    ]);
    const pulseIndex = steps.findIndex((step) => step.sourceId === `donkey-pulses-${side}`);
    expect(steps[pulseIndex + 1]).toMatchObject({ sourceId: `glute-reset-${side}`, kind: "rest", durationMs: 15_000 });
  }
  expect(steps.find((step) => step.sourceId === "glute-side-switch")).toMatchObject({ kind: "rest", durationMs: 30_000 });
  expect(steps.find((step) => step.sourceId === "glute-side-switch")?.shortDescription).toContain("Remove the weight before switching sides");
  expect(steps.find((step) => step.sourceId === "core-setup")?.shortDescription).toContain("remove the weight from behind the working knee");
});

it("serves the platter in both kneeling arm rounds instead of triceps extensions", () => {
  const arms = compileClass(matPilatesWeights02).steps.filter((step) => step.phase.id === "upper-body-back");
  expect(arms.filter((step) => step.name === "Serve the platter (out and to the side)").map((step) => [step.sourceId, step.durationMs])).toEqual([
    ["serve-platter-1", 40_000], ["serve-platter-2", 40_000]
  ]);
  expect(arms.some((step) => step.name === "Triceps extensions")).toBe(false);
});

it("alternates leg-lower sets and finishes with right, left and both-arm rows", () => {
  const steps = compileClass(matPilatesWeights02).steps.filter((step) => step.phase.id === "core-circuit");
  expect(steps.map((step) => [step.sourceId, step.durationMs, step.exerciseReference?.side])).toEqual([
    ["core-setup", 60_000, undefined],
    ["toe-reach-right", 40_000, "right"], ["leg-lowers-1", 20_000, undefined],
    ["toe-reach-left", 40_000, "left"], ["leg-lowers-2", 20_000, undefined],
    ["sit-up-right", 40_000, "right"], ["leg-lowers-3", 20_000, undefined],
    ["sit-up-left", 40_000, "left"], ["leg-lowers-4", 20_000, undefined],
    ["crunch-to-sit-up", 40_000, undefined], ["leg-lowers-5", 20_000, undefined],
    ["russian-twists", 40_000, undefined], ["seated-ab-rows-right", 40_000, "right"], ["seated-ab-rows-left", 40_000, "left"], ["seated-ab-rows-both", 20_000, undefined]
  ]);
  expect(steps.find((step) => step.sourceId === "toe-reach-left")?.shortDescription).toContain("weight in the left hand");
});

it("follows the revised warm-up order with thirty seconds per stretch and movement", () => {
  const { steps } = compileClass(matPilatesWeights02);
  expect(steps.filter((step) => step.phase.id === "warmup").map((step) => [step.sourceId, step.durationMs, step.exerciseReference?.side])).toEqual([
    ["march", 60_000, undefined], ["side-stretch-right", 30_000, "right"], ["side-stretch-left", 30_000, "left"],
    ["back-bend", 30_000, undefined], ["forward-fold", 30_000, undefined], ["hip-openers", 30_000, undefined],
    ["heel-raises", 30_000, undefined], ["yogi-squat", 30_000, undefined], ["squat-twist-reach", 30_000, undefined], ["before-standing-circuit", 60_000, undefined]
  ]);
  expect(steps.find((step) => step.sourceId === "hip-openers")?.shortDescription).toContain("rise slowly from the forward fold");
  expect(steps.find((step) => step.sourceId === "glute-setup")?.shortDescription).toContain("Finish the kneeling arm series");
});

it("flows through the requested cooldown on each side before the final supine stretches", () => {
  const cooldown = compileClass(matPilatesWeights02).steps.filter((step) => step.phase.id === "cooldown");
  expect(cooldown.map((step) => [step.name, step.exerciseReference?.side, step.durationMs])).toEqual([
    ["Side-lying open book", "right", 30_000], ["Side-lying quadriceps stretch", "right", 30_000],
    ["Reclining tree pose", "right", 30_000], ["Figure four stretch", "right", 30_000],
    ["REST", undefined, 15_000],
    ["Side-lying open book", "left", 30_000], ["Side-lying quadriceps stretch", "left", 30_000],
    ["Reclining tree pose", "left", 30_000], ["Figure four stretch", "left", 30_000],
    ["Windshield wipers", undefined, 30_000], ["Reclined butterfly", undefined, 30_000],
    ["Shavasana", undefined, 135_000]
  ]);
});

it("uses knee-in crunches instead of holds and rows with the indicated hand", () => {
  const { steps } = compileClass(matPilatesWeights02);
  expect(steps.some((step) => step.name === "Donkey kick hold with weight behind knee")).toBe(false);
  for (const side of ["right", "left"] as const) {
    expect(steps.find((step) => step.sourceId === `knee-crunch-${side}`)).toMatchObject({ durationMs: 40_000 });
    expect(steps.find((step) => step.sourceId === `knee-crunch-${side}`)?.longDescription).toContain("draw that knee inward beneath the torso");
    expect(steps.find((step) => step.sourceId === `seated-ab-rows-${side}`)?.shortDescription).toContain(`weight in the ${side} hand`);
  }
});

it("ends abs with a twenty-second row using both arms instead of leg lowers", () => {
  const abs = compileClass(matPilatesWeights02).steps.filter((step) => step.phase.id === "core-circuit");
  expect(abs.at(-1)).toMatchObject({ sourceId: "seated-ab-rows-both", name: "Seated ab row with both arms", durationMs: 20_000 });
  expect(abs.at(-1)?.shortDescription).toContain("both hands");
  expect(abs.some((step) => step.sourceId === "leg-lowers-finish")).toBe(false);
});

it("starts standing legs with slow and regular squats before resting", () => {
  const { steps } = compileClass(matPilatesWeights02);
  const arms = steps.filter((step) => step.phase.id === "upper-body-back");
  const standing = steps.filter((step) => step.phase.id === "standing-lower-body");
  expect(arms[0]).toMatchObject({ sourceId: "arm-setup", kind: "rest", durationMs: 60_000 });
  expect(standing.slice(0, 3).map((step) => [step.sourceId, step.durationMs])).toEqual([
    ["slow-squats", 30_000], ["regular-squats", 30_000], ["standing-setup", 20_000]
  ]);
  expect(steps.filter((step) => step.phase.id === "standing-lower-body").at(-1)?.sourceId).toBe("b-stance-curls-right");
  expect(steps.some((step) => step.sourceId === "squat-pulses")).toBe(false);
  expect(steps.find((step) => step.sourceId === "side-body-setup")?.shortDescription).toContain("Finish the seated ab rows");
});

it("rests one minute before Standing Legs and twenty seconds within its squat and lunge transitions", () => {
  const { steps } = compileClass(matPilatesWeights02);
  const firstSquat = steps.findIndex((step) => step.sourceId === "slow-squats");
  expect(steps[firstSquat - 1]).toMatchObject({ sourceId: "before-standing-circuit", kind: "rest", durationMs: 60_000 });
  for (const side of ["left", "right"] as const) {
    const pulse = steps.findIndex((step) => step.sourceId === `lunge-pulse-${side}`);
    expect(steps[pulse + 1]).toMatchObject({ sourceId: `b-stance-setup-${side}`, kind: "rest", durationMs: 20_000 });
    expect(steps[pulse + 2]?.sourceId).toBe(`b-stance-${side}`);
  }
  expect(steps.find((step) => step.sourceId === "leg-side-switch")?.durationMs).toBe(30_000);
});
