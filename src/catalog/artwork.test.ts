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

/**
 * The migration backlog: movements the dated classes brought into the pool that
 * no rig has been authored for yet.
 *
 * This list is a target, not a permission. The assertions below compare against
 * it exactly, so authoring a rig fails the suite until the name is deleted from
 * here - which is how the list can only ever shrink. When it reaches zero the
 * checks collapse back to "every movement is drawn from pose data".
 */
const AWAITING_RIG = [
  "Alternating bird dogs",
  "Arm circles",
  "Bird-dog extension and crunch",
  "Bottom leg lifts",
  "Bottom leg pulses",
  "Bridge knee-drive pulses",
  "Bridge with knee drive",
  "Clam shell openers with kick",
  "Combine Side crunch + Cross body crunch",
  "Criss-cross",
  "Cross body crunch",
  "Crunch",
  "Double-leg lift",
  "Forearm side plank",
  "Full-range glute bridge",
  "Half rainbow",
  "High plank hold",
  "High plank opening to a side planks (alternating)",
  "High plank shoulder taps, alternating hands",
  "High-plank alternating crunch",
  "Hip circles",
  "Inner thigh circles",
  "Kickback hold and pulse",
  "Knee across the body",
  "Knee pulls alternating legs",
  "Knee push-ups",
  "Knee to chest stretch",
  "Pilates push-ups",
  "Pulse leg at the top",
  "Quadruped Glute Lift",
  "Reverse lunge",
  "Reverse-lunge pulse",
  "Roll down to the mat",
  "Scissors",
  "Seated Straddle",
  "Shoulder rolls",
  "Side crunch",
  "Side crunch with leg extension",
  "Side to back kick",
  "Side twist",
  "Single-leg deadlift (SLDL) to knee tuck",
  "Small arm circles",
  "Small leg circles",
  "Squat -> add arms",
  "Squat hold",
  "Squat hold leg lift",
  "Squat pulse",
  "Squat to stand",
  "Squat to twist",
  "Standing kickback",
  "Static hold",
  "Sumo squat and hand lifts",
  "Superman",
  "Superman hold with flutter arms",
  "Toe tap to reverse crunch",
  "Toe taps alternating legs",
  "Toe taps both legs"
];

/**
 * Spoken preambles, not movements. There is nothing to draw, so unlike the
 * backlog above these never leave the list.
 */
const NOT_A_MOVEMENT = ["Class introduction", "INTRODUCTION"];

/** The subset of the backlog still explained by a legacy still rather than nothing. */
const onAnImage = [
  "Full-range glute bridge",
  "Half rainbow",
  "High plank hold",
  "High plank opening to a side planks (alternating)",
  "High plank shoulder taps, alternating hands",
  "Knee pulls alternating legs",
  "Quadruped Glute Lift",
  "Seated Straddle",
  "Side crunch",
  "Side to back kick",
  "Toe tap to reverse crunch"
];

const distinctNames = (records: readonly ExerciseDefinition[]): string[] =>
  [...new Set(records.map((record) => record.name))].sort();

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

  it("only stands one movement in for another where a rig is still owed", () => {
    // A shared still is only honest when the exercises are the same movement,
    // so every name here is on the backlog and leaves as its rig lands.
    const namesByStill = new Map<string, Set<string>>();
    exercises.forEach((exercise) => {
      if (!exercise.illustration) return;
      const names = namesByStill.get(exercise.illustration) ?? new Set<string>();
      names.add(exercise.name);
      namesByStill.set(exercise.illustration, names);
    });

    const shared = [...namesByStill.values()]
      .filter((names) => names.size > 1)
      .flatMap((names) => [...names]);

    expect(shared.filter((name) => !AWAITING_RIG.includes(name))).toEqual([]);
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

  it("gives every exercise in the catalog a visual", () => {
    const withoutMedia = exercises.filter(
      (exercise) => !exercise.rig && !exercise.illustration && !exercise.motionIllustrations
    );
    // A subset check, not an exact one: a class that illustrates only the first
    // of three identical placements leaves the same name on both this list and
    // the image list. The exact pin lives in the backlog test below.
    const known = new Set([...AWAITING_RIG, ...NOT_A_MOVEMENT]);
    expect(distinctNames(withoutMedia).filter((name) => !known.has(name))).toEqual([]);
  });

  it("draws every movement from pose data rather than an image", () => {
    const onImages = exercises.filter((exercise) => !exercise.rig && exercise.illustration);
    expect(distinctNames(onImages)).toEqual(onAnImage);
  });

  it("owes a rig to nothing outside the declared backlog", () => {
    // The two lists above partition everything the catalog cannot yet draw from
    // pose data, so a newly imported class cannot slip in unnoticed.
    const undrawn = exercises.filter((exercise) => !exercise.rig);
    expect(distinctNames(undrawn)).toEqual([...AWAITING_RIG, ...NOT_A_MOVEMENT].sort());
  });
});
