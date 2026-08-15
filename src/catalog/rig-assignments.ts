import type { ExerciseCatalog } from "../domain/catalog-definition";
import { rigIdForExercise } from "../rig/assignments";
import { RIGS } from "../rig/rigs";

/**
 * Attaches rigs to a catalog and drops the legacy artwork they replace, so a
 * migrated exercise has exactly one source of truth for its visual.
 *
 * Compiled classes resolve their own rigs by name; this covers the catalog
 * itself, which the exercise library reads directly.
 */
export function applyRigAssignments(catalog: ExerciseCatalog): void {
  catalog.exercises.forEach((exercise) => {
    const rig = rigIdForExercise(exercise.name);
    if (!rig || !RIGS[rig]) return;
    exercise.rig = rig;
    delete exercise.illustration;
    delete exercise.motionIllustrations;
  });
}
