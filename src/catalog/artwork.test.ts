import { describe, expect, it } from "vitest";
import { availableClasses, availableExerciseCatalog } from "../classes";
import type { ExerciseDefinition } from "../domain/catalog-definition";
import type { RuntimeStep } from "../domain/timeline";
import { RIGS } from "../rig/rigs";
import { buildFrame } from "../rig/frame";
import { RIG_BY_EXERCISE_NAME } from "../rig/assignments";
import { IMAGE_PREFERRED } from "./rig-assignments";

const exercises = availableExerciseCatalog.exercises;
const steps = availableClasses.flatMap((fitnessClass) =>
  fitnessClass.definition.visualsDisabled ? [] : fitnessClass.steps
).filter((step) => step.kind === "exercise");

/** The movements drawn from pose data rather than a picture. */
const migrated = exercises.filter((exercise) => exercise.rig !== undefined);

/**
 * Spoken preambles, not movements. There is nothing to draw, so these are the
 * only catalog entries allowed to have no visual at all.
 */
// New source movements and conflicting warm-up rows awaiting accurate guides.
// Keep this explicit: unrelated missing artwork must still fail. See ARTWORK.md.
const UPDATED_SLIDERS_PENDING = [
  "Happy Baby", "Seated side stretch", "Seated Cow Pose Variation Arms Crossed On Knees",
  "Reclined butterfly", "Breathing with overhead arm sweeps", "Donkey kick pulses", "Bent-knee leg lift", "Breathing work", "Cross overs", "Double Leg Stretch",
  "Extended pulse infornt", "Extended pulse straight back", "Fire hydrant pulses",
  "Fire hydrants", "Hundred", "Kick knee to chest and extned", "Pulse bent knee",
  "Rotation knee and heel", "Seated cat cows", "Side to side crunch", "head circles",
  "seated cat cow to half roll down"
];

const NOT_A_MOVEMENT = ["Class introduction", "INTRODUCTION"];

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

  it("shows a Pilates ring in every Ring-class movement that uses one", () => {
    const ringClass = availableClasses.find((fitnessClass) => fitnessClass.definition.id === "mat-pilates-ring");
    expect(ringClass).toBeDefined();

    const equipmentFreeIds = new Set([
      "butterfly",
      "side-twist",
      "straight-leg-forward-fold"
    ]);
    const ringMovements = ringClass?.steps.filter((step) =>
      step.kind === "exercise"
      && step.phase.id !== "introduction"
      && step.phase.id !== "cooldown"
      && !equipmentFreeIds.has(step.sourceId)
    ) ?? [];

    ringMovements.forEach((step) => {
      const rig = step.rig ? RIGS[step.rig] : undefined;
      expect(rig, `${step.name} has no Ring-class rig`).toBeDefined();
      if (!rig) return;
      expect(
        buildFrame(rig, 0.25).some((shape) => shape.kind === "ring" && shape.role === "equipment"),
        `${step.name} does not show its Pilates ring`
      ).toBe(true);
    });
  });

  it("retains only the previous sliders bicycle guide outside the active catalog", () => {
    const used = new Set([...exercises, ...steps].flatMap((item) => (item.rig ? [item.rig] : [])));
    // The original push-up poses also supply the pike combination and ring variant.
    if (used.has("knee-push-ups-to-pike") || used.has("ring-assisted-knee-push-ups")) {
      used.add("knee-push-ups");
    }
    if (used.has("ring-double-leg-lift")) used.add("double-leg-lift");
    const unused = Object.keys(RIGS).filter((id) => !used.has(id)).sort();
    // Retain guides from the previous sliders schedule for future class reuse.
    expect(unused).toEqual(["bicycle-legs"]);
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

  it("never explains one movement with another movement's picture", () => {
    // This is the real invariant, and the reason the whole rig exists. An
    // exercise may be a picture; it may not be *someone else's* picture. One
    // file, one movement - including across the motion frame sets.
    const namesByAsset = new Map<string, Set<string>>();
    exercises.forEach((exercise) => {
      assetPaths(exercise).forEach((path) => {
        const names = namesByAsset.get(path) ?? new Set<string>();
        names.add(exercise.name);
        namesByAsset.set(path, names);
      });
    });

    const shared = [...namesByAsset.entries()]
      .filter(([, names]) => names.size > 1)
      .map(([path, names]) => `${path} -> ${[...names].join(", ")}`);

    expect(shared, "one picture used for more than one movement").toEqual([]);
  });

  it("gives every exercise in the catalog a visual", () => {
    // A rig, motion frames or a still - any of the three. Which one is an
    // editorial call per movement, not something the suite should force.
    const withoutMedia = exercises.filter(
      (exercise) => !exercise.rig && !exercise.illustration && !exercise.motionIllustrations
    );
    expect(distinctNames(withoutMedia)).toEqual([...NOT_A_MOVEMENT, ...UPDATED_SLIDERS_PENDING].sort());
  });

  it("keeps a picture only where it was chosen over the rig", () => {
    // Everything on a picture is either a movement with no rig authored yet or
    // one deliberately listed in IMAGE_PREFERRED. Nothing lands on a picture by
    // accident, which is what the assignment step would otherwise allow.
    const onPictures = exercises.filter((exercise) => !exercise.rig && assetPaths(exercise).length > 0);
    onPictures.forEach((exercise) => {
      const hasRig = RIG_BY_EXERCISE_NAME[exercise.name] !== undefined;
      expect(
        !hasRig || IMAGE_PREFERRED.has(exercise.name),
        `"${exercise.name}" has a rig but shows a picture without being listed in IMAGE_PREFERRED`
      ).toBe(true);
    });
  });
});
