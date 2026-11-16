import { expect, it } from "vitest";
import { compileClass } from "../domain/compile-class";
import { availableClasses } from "./index";
import { matPilates0724 } from "./mat-pilates-07-24";
import { matPilates0731 } from "./mat-pilates-07-31";
import { noEquipmentMatPilates } from "./no-equipment-mat-pilates";

it("registers the July 24 class with the adapted July 31 core and a rest between rounds", () => {
  expect(availableClasses.some(({ definition }) => definition.id === noEquipmentMatPilates.id)).toBe(true);
  expect(noEquipmentMatPilates.title).toBe("No Equipment Mat Pilates");
  expect(noEquipmentMatPilates.phases.map((phase) => phase.id)).toEqual(matPilates0724.phases.map((phase) => phase.id));
  for (const phase of matPilates0724.phases) {
    const actual = noEquipmentMatPilates.phases.find((item) => item.id === phase.id);
    if (phase.id === "core-circuit") {
      const source = matPilates0731.phases.find((item) => item.id === phase.id)?.items.filter((item) => item.type === "exercise");
      expect(actual?.items.filter((item) => item.type === "rest")).toEqual([
        expect.objectContaining({ id: "core-round-one-rest", durationSeconds: 20 })
      ]);
      const restIndex = actual?.items.findIndex((item) => item.id === "core-round-one-rest") ?? -1;
      expect(restIndex).toBeGreaterThan(0);
      expect(actual?.items[restIndex - 1]?.id).toBe("scissors-one");
      expect(actual?.items[restIndex + 1]?.id).toBe("alternating-toe-taps-two");
      const moves = actual?.items.filter((item) => item.type === "exercise");
      const originalMoves = moves?.filter((item) => item.name !== "Suitcase crunch");
      expect(originalMoves?.map((item) => item.durationSeconds)).toEqual(source?.map((item) => item.durationSeconds));
      expect(moves?.filter((item) => item.name === "Suitcase crunch")).toHaveLength(2);
      for (const round of ["one", "two"]) {
        const index = moves?.findIndex((item) => item.id === `double-toe-taps-${round}`) ?? -1;
        expect(index).toBeGreaterThanOrEqual(0);
        expect(moves?.[index + 1]).toMatchObject({ name: "Suitcase crunch", durationSeconds: 40 });
      }
      expect(moves?.filter((item) => item.name === "Dead Bug")).toHaveLength(2);
      expect(moves?.some((item) => item.name === "Alternating bird dogs")).toBe(false);
      expect(originalMoves?.map((item) => item.name)).toEqual(source?.map((item) => item.name === "Alternating bird dogs" ? "Dead Bug" : item.name));
      expect(actual?.name).toBe(phase.name);
    } else if (!["side-body-circuit", "posterior-core-circuit", "warmup", "cooldown"].includes(phase.id)) {
      expect(actual).toEqual(phase);
    }
  }
});

it("shortens Superman flutters and follows each bird-dog crunch with the matching single-leg push-up to pike", () => {
  const items = noEquipmentMatPilates.phases.find((phase) => phase.id === "posterior-core-circuit")?.items ?? [];
  expect(items.find((item) => item.id === "superman-flutter")).toMatchObject({ durationSeconds: 20 });
  for (const side of ["right", "left"]) {
    const index = items.findIndex((item) => item.id === `bird-dog-${side}`);
    expect(index).toBeGreaterThan(0);
    expect(items[index + 1]).toMatchObject({
      id: `single-leg-knee-push-up-pike-${side}`,
      name: "Single-leg knee push-up to pike",
      durationSeconds: 40,
      exerciseReference: { side }
    });
  }
  expect(items.some((item) => item.id === "knee-push-ups")).toBe(false);
  expect(items.filter((item) => item.type === "rest")).toEqual([
    expect.objectContaining({ id: "rest-after-bird-dog-right", durationSeconds: 20 })
  ]);
  const switchIndex = items.findIndex((item) => item.id === "rest-after-bird-dog-right");
  expect(items[switchIndex - 1]?.id).toBe("single-leg-knee-push-up-pike-right");
  expect(items[switchIndex + 1]?.id).toBe("bird-dog-extension-left");
  const liftIndex = items.findIndex((item) => item.id === "low-plank-alternating-leg-lifts");
  expect(liftIndex).toBeGreaterThan(0);
  expect(items[liftIndex]).toMatchObject({ name: "Low plank alternating leg lifts", durationSeconds: 40 });
  expect(items[liftIndex - 1]?.id).toBe("single-leg-knee-push-up-pike-left");
  expect(items[liftIndex + 1]?.id).toBe("high-plank-hold");
  expect(items.some((item) => item.type === "exercise" && item.name === "Low-plank opening to the sides")).toBe(false);
});

it("runs matching side-body sequences with only a side-switch rest and finishes in forearm plank", () => {
  const items = noEquipmentMatPilates.phases.find((phase) => phase.id === "side-body-circuit")?.items ?? [];
  const sequence = (side: string, support: string) => [
    [`leg-lift-${side}`, 40], [`big-leg-circles-${side}`, 40],
    [`small-leg-circles-${side}`, 20], [`static-leg-hold-${side}`, 20],
    [`bottom-leg-lifts-${support}`, 30], [`bottom-leg-pulses-${support}`, 30],
    [`tricep-push-up-${side}`, 30], [`straight-leg-crunch-${side}`, 40],
    [`side-plank-${support}`, 30]
  ];
  expect(items.map((item) => [item.id, item.type === "repeat" ? 0 : item.durationSeconds])).toEqual([
    ...sequence("left", "right"), ["side-body-side-break", 30],
    ...sequence("right", "left"), ["side-body-regular-plank", 30]
  ]);
  expect(items.filter((item) => item.type === "rest")).toHaveLength(1);
  expect(items.at(-1)).toMatchObject({ name: "Low-plank hold" });
  for (const item of items) {
    if (item.type === "exercise" && item.id.startsWith("small-leg-circles-")) {
      expect(item.longDescription).toContain("10 seconds in each direction");
    }
  }
});

it("warms up each side with downward dog hip circles and crescent lunge to half split after cat-cow", () => {
  const items = noEquipmentMatPilates.phases.find((phase) => phase.id === "warmup")?.items ?? [];
  const catIndex = items.findIndex((item) => item.id === "cat-cow");
  expect(catIndex).toBeGreaterThanOrEqual(0);
  expect(items.slice(catIndex + 1, catIndex + 5).map((item) => [item.id, item.type === "exercise" ? item.durationSeconds : 0, item.type === "exercise" ? item.exerciseReference?.side : undefined])).toEqual([
    ["down-dog-hip-circles-left", 30, "left"], ["crescent-half-split-left", 60, "left"],
    ["down-dog-hip-circles-right", 30, "right"], ["crescent-half-split-right", 60, "right"]
  ]);
  expect(items.some((item) => item.id === "hover-to-down-dog")).toBe(false);
  expect(items.some((item) => item.id.startsWith("thread-needle-"))).toBe(false);
  expect(items[catIndex + 5]).toMatchObject({ id: "warmup-cobra", name: "Cobra", durationSeconds: 30 });
  expect(items.at(-1)).toMatchObject({ id: "rest-after-warmup", type: "rest" });
});

it("flows through an eleven-minute SOP-based cooldown ending in shavasana", () => {
  const compiled = compileClass(noEquipmentMatPilates);
  const steps = compiled.steps.filter((step) => step.phase.id === "cooldown");
  const original = compileClass(matPilates0724).steps.filter((step) => step.phase.id === "cooldown");
  expect(steps.reduce((total, step) => total + step.durationMs, 0)).toBe(660_000);
  expect(steps.reduce((total, step) => total + step.durationMs, 0)).toBe(original.reduce((total, step) => total + step.durationMs, 0));
  expect(steps.map((step) => step.sourceId)).toEqual([
    "cooldown-sphinx", "cooldown-childs-pose", "cooldown-forward-fold", "cooldown-roll-down",
    "cooldown-figure-four-right", "cooldown-twist-right", "cooldown-figure-four-left", "cooldown-twist-left",
    "cooldown-happy-baby", "shavasana"
  ]);
  expect(compiled.steps.at(-1)).toMatchObject({ name: "Shavasana", durationMs: 180_000 });
  expect(steps.filter((step) => step.exerciseReference?.side === "right").map((step) => step.durationMs))
    .toEqual(steps.filter((step) => step.exerciseReference?.side === "left").map((step) => step.durationMs));
});
