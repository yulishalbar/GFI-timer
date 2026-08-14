import type { ExerciseCatalog, ExerciseDefinition } from "../domain/catalog-definition";

export function mergeExerciseCatalogs(...catalogs: readonly ExerciseCatalog[]): ExerciseCatalog {
  const exercises = new Map<string, ExerciseDefinition>();
  catalogs.forEach((catalog) => catalog.exercises.forEach((exercise) => {
    const existing = exercises.get(exercise.id);
    if (existing && JSON.stringify(existing) !== JSON.stringify(exercise)) {
      throw new Error(`Conflicting exercise catalog entry "${exercise.id}"`);
    }
    exercises.set(exercise.id, exercise);
  }));

  return {
    schemaVersion: 1,
    tags: [...(catalogs[0]?.tags ?? [])],
    exercises: [...exercises.values()]
  };
}
