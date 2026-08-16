import type { CourseExerciseItem, CourseItem, ExerciseDefinition } from "../domain/catalog-definition";
import type { AdaptedLegacyCourse } from "../domain/legacy-catalog-adapter";
import { applyRigAssignments } from "./rig-assignments";

function placements(items: readonly CourseItem[]): CourseExerciseItem[] {
  return items.flatMap((item) =>
    item.type === "exercise"
      ? [item]
      : item.type === "circuit"
        ? item.items.filter((child): child is CourseExerciseItem => child.type === "exercise")
        : []
  );
}

function exerciseSignature(exercise: ExerciseDefinition): string {
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

export function normalizeSlidersCatalog(input: AdaptedLegacyCourse): AdaptedLegacyCourse {
  const catalog = structuredClone(input.catalog);
  const course = structuredClone(input.course);
  const allPlacements = course.phases.flatMap((phase) => placements(phase.items));
  const hiitPlacements = new Set(placements(course.phases.find((phase) => phase.id === "hiit-legs")?.items ?? []));
  const sideBodyPlacements = new Set(placements(course.phases.find((phase) => phase.id === "side-body")?.items ?? []));
  const exercisesById = new Map(catalog.exercises.map((exercise) => [exercise.id, exercise]));

  allPlacements.forEach((placement) => {
    const isHiitSide = hiitPlacements.has(placement);
    const isSideBody = sideBodyPlacements.has(placement);
    if (!isHiitSide && !isSideBody) return;

    const side = placement.id.endsWith("-one") || placement.id.endsWith("-three") || placement.id.endsWith("-left")
      ? "left"
      : "right";
    placement.side = side;
    const exercise = exercisesById.get(placement.exerciseId);
    if (exercise) exercise.sideSupport = "left-right";
  });

  applyRigAssignments(catalog);

  const canonicalBySignature = new Map<string, ExerciseDefinition>();
  const replacementIds = new Map<string, string>();
  const deduplicated: ExerciseDefinition[] = [];
  catalog.exercises.forEach((exercise) => {
    const signature = exerciseSignature(exercise);
    const canonical = canonicalBySignature.get(signature);
    if (canonical) {
      replacementIds.set(exercise.id, canonical.id);
      return;
    }
    canonicalBySignature.set(signature, exercise);
    deduplicated.push(exercise);
  });
  allPlacements.forEach((placement) => {
    placement.exerciseId = replacementIds.get(placement.exerciseId) ?? placement.exerciseId;
  });
  catalog.exercises = deduplicated;

  return { catalog, course };
}
