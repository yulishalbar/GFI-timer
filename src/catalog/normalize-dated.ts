import type { CourseExerciseItem, CourseItem, ExerciseDefinition } from "../domain/catalog-definition";
import type { AdaptedLegacyCourse } from "../domain/legacy-catalog-adapter";
import { canonicalExerciseName, sideFromExerciseName } from "./exercise-names";
import { applyRigAssignments } from "./rig-assignments";

/**
 * Turns a dated class that was adapted from the V1 format into a catalog the
 * shared pool can absorb.
 *
 * The band and slider classes each carry a bespoke normalizer because their
 * side information hides in placement ids. The dated classes state it in the
 * name - `(L)`, `— right` - so one normalizer covers both, and it is the name
 * that both the side and the merge decision are read from.
 */

function placements(items: readonly CourseItem[]): CourseExerciseItem[] {
  return items.flatMap((item) =>
    item.type === "exercise"
      ? [item]
      : item.type === "circuit"
        ? item.items.filter((child): child is CourseExerciseItem => child.type === "exercise")
        : []
  );
}

/**
 * What makes two records the same entry. Descriptions are included on purpose:
 * a class that cues the left and right rounds differently keeps both texts, and
 * the library collapses them by name for display.
 */
function signature(exercise: ExerciseDefinition): string {
  return JSON.stringify({
    name: exercise.name,
    shortDescription: exercise.shortDescription,
    longDescription: exercise.longDescription,
    rig: exercise.rig,
    illustration: exercise.illustration,
    motionIllustrations: exercise.motionIllustrations,
    sideSupport: exercise.sideSupport,
    tags: exercise.tags
  });
}

export function normalizeDatedCatalog(input: AdaptedLegacyCourse): AdaptedLegacyCourse {
  const catalog = structuredClone(input.catalog);
  const course = structuredClone(input.course);
  const allPlacements = course.phases.flatMap((phase) => placements(phase.items));
  const exercisesById = new Map(catalog.exercises.map((exercise) => [exercise.id, exercise]));

  allPlacements.forEach((placement) => {
    const exercise = exercisesById.get(placement.exerciseId);
    if (!exercise) return;
    const side = sideFromExerciseName(exercise.name);
    exercise.name = canonicalExerciseName(exercise.name);
    if (!side) return;
    placement.side = side;
    exercise.sideSupport = "left-right";
  });

  applyRigAssignments(catalog);

  const canonicalBySignature = new Map<string, ExerciseDefinition>();
  const replacementIds = new Map<string, string>();
  const deduplicated: ExerciseDefinition[] = [];
  catalog.exercises.forEach((exercise) => {
    const key = signature(exercise);
    const canonical = canonicalBySignature.get(key);
    if (canonical) {
      replacementIds.set(exercise.id, canonical.id);
      return;
    }
    canonicalBySignature.set(key, exercise);
    deduplicated.push(exercise);
  });
  allPlacements.forEach((placement) => {
    placement.exerciseId = replacementIds.get(placement.exerciseId) ?? placement.exerciseId;
  });
  catalog.exercises = deduplicated;

  return { catalog, course };
}
