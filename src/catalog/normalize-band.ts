import type { CourseExerciseItem, CourseItem, ExerciseDefinition } from "../domain/catalog-definition";
import type { AdaptedLegacyCourse } from "../domain/legacy-catalog-adapter";

function placements(items: readonly CourseItem[]): CourseExerciseItem[] {
  return items.flatMap((item) =>
    item.type === "exercise"
      ? [item]
      : item.type === "circuit"
        ? item.items.filter((child): child is CourseExerciseItem => child.type === "exercise")
        : []
  );
}

function trailingSide(id: string): "left" | "right" | undefined {
  if (/(?:-l|-left)$/.test(id)) return "left";
  if (/(?:-r|-right)$/.test(id)) return "right";
  return undefined;
}

function canonicalName(name: string): string {
  return name.replace(/\s*\((?:L|R)\)$/, "");
}

function signature(exercise: ExerciseDefinition): string {
  return JSON.stringify({
    name: exercise.name,
    shortDescription: exercise.shortDescription,
    longDescription: exercise.longDescription,
    illustration: exercise.illustration,
    motionIllustrations: exercise.motionIllustrations,
    sideSupport: exercise.sideSupport,
    tags: exercise.tags
  });
}

export function normalizeBandCatalog(input: AdaptedLegacyCourse): AdaptedLegacyCourse {
  const catalog = structuredClone(input.catalog);
  const course = structuredClone(input.course);
  const allPlacements = course.phases.flatMap((phase) => placements(phase.items));
  const exercisesById = new Map(catalog.exercises.map((exercise) => [exercise.id, exercise]));

  allPlacements.forEach((placement) => {
    const side = trailingSide(placement.id);
    if (!side) return;
    placement.side = side;
    const exercise = exercisesById.get(placement.exerciseId);
    if (exercise) {
      exercise.sideSupport = "left-right";
      exercise.name = canonicalName(exercise.name);
    }
  });

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
