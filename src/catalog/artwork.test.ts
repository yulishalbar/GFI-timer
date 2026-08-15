import { describe, expect, it } from "vitest";
import { availableClasses, availableExerciseCatalog } from "../classes";
import type { ExerciseDefinition } from "../domain/catalog-definition";
import type { RuntimeStep } from "../domain/timeline";
import { RIGS } from "../rig/rigs";
import { RIG_BY_EXERCISE_NAME } from "../rig/assignments";

const exercises = availableExerciseCatalog.exercises;
const steps = availableClasses.flatMap((fitnessClass) => fitnessClass.steps).filter((step) => step.kind === "exercise");

/** The movements the rig has been authored for so far. */
const migrated = exercises.filter((exercise) => exercise.rig !== undefined);

const assetPaths = (item: ExerciseDefinition | RuntimeStep): string[] => [
  ...(item.illustration ? [item.illustration] : []),
  ...(item.motionIllustrations ?? [])
];

/** Every file sitting in public/exercises. Not eager, so nothing is loaded. */
const shippedAssets = new Set(
  Object.keys(import.meta.glob("../../public/exercises/*")).map((path) =>
    path.replace("../../public/", "")
  )
);

describe("exercise artwork", () => {
  it("points every assigned rig at pose data that exists", () => {
    [...exercises, ...steps].forEach((item) => {
      if (!item.rig) return;
      expect(RIGS[item.rig], `"${item.name}" is assigned unknown rig "${item.rig}"`).toBeDefined();
    });
  });

  it("gives a migrated exercise exactly one source of truth for its visual", () => {
    migrated.forEach((exercise) => {
      expect(exercise.illustration, `${exercise.name} still carries a legacy still`).toBeUndefined();
      expect(exercise.motionIllustrations, `${exercise.name} still carries legacy frames`).toBeUndefined();
    });
  });

  it("ships no pose data the catalog never uses", () => {
    const used = new Set([...exercises, ...steps].flatMap((item) => (item.rig ? [item.rig] : [])));
    Object.keys(RIGS).forEach((id) => {
      expect(used.has(id), `rig "${id}" is authored but no exercise uses it`).toBe(true);
    });
  });

  it("draws the same movement the same way wherever it appears", () => {
    const rigByName = new Map<string, string | undefined>();
    [...exercises, ...steps].forEach((item) => {
      if (!RIG_BY_EXERCISE_NAME[item.name]) return;
      const previous = rigByName.get(item.name);
      if (previous !== undefined) {
        expect(item.rig, `"${item.name}" resolves to two different guides`).toBe(previous);
      }
      rigByName.set(item.name, item.rig);
    });
  });

  it("resolves every name in the assignment map to a real rig", () => {
    Object.entries(RIG_BY_EXERCISE_NAME).forEach(([name, rig]) => {
      expect(RIGS[rig], `"${name}" maps to unknown rig "${rig}"`).toBeDefined();
    });
  });

  it("keeps every image the catalog still references on disk", () => {
    [...exercises, ...steps].forEach((item) => {
      assetPaths(item).forEach((path) => {
        expect(shippedAssets.has(path), `"${item.name}" references missing asset ${path}`).toBe(true);
      });
    });
  });

  it("ships no artwork the catalog no longer references", () => {
    const referenced = new Set([...exercises, ...steps].flatMap(assetPaths));
    const orphaned = [...shippedAssets].filter((path) => !referenced.has(path)).sort();

    expect(orphaned, `artwork left behind after a rig replaced it:\n${orphaned.join("\n")}`).toEqual([]);
  });

  it("never stands a movement in for a different movement", () => {
    // A shared still is only honest when the exercises are the same movement.
    const namesByStill = new Map<string, Set<string>>();
    exercises.forEach((exercise) => {
      if (!exercise.illustration) return;
      const names = namesByStill.get(exercise.illustration) ?? new Set<string>();
      names.add(exercise.name);
      namesByStill.set(exercise.illustration, names);
    });

    const shared = [...namesByStill.entries()]
      .filter(([, names]) => names.size > 1)
      .map(([path, names]) => `${path} -> ${[...names].join(", ")}`);

    // Tightening target: every entry here is an exercise still waiting for a
    // rig. It must only ever shrink.
    expect(shared.length, `generic art reused across movements:\n${shared.join("\n")}`).toBeLessThanOrEqual(4);
  });

  it("has migrated the plank and slider floor movements off their images", () => {
    const batchOne = [
      "Straight leg sweep",
      "Straight leg sweep circles",
      "Thread the leg and open to the side",
      "Sliders mountain climbers"
    ];
    batchOne.forEach((name) => {
      const exercise = exercises.find((item) => item.name === name);
      expect(exercise, `${name} is missing from the catalog`).toBeDefined();
      expect(exercise?.rig, `${name} fell back to an image`).toBeDefined();
    });
  });

  it("reports how much of the catalog still needs a visual", () => {
    const withoutMedia = exercises.filter(
      (exercise) => !exercise.rig && !exercise.illustration && !exercise.motionIllustrations
    );
    // Tightening target: this must only ever go down as batches land.
    expect(withoutMedia.length).toBeLessThanOrEqual(56);
  });
});
