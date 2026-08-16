import type { ExerciseCatalog } from "../domain/catalog-definition";
import { rigIdForExercise } from "../rig/assignments";
import { RIGS } from "../rig/rigs";

/**
 * Movements shown as a picture even though a rig exists for them.
 *
 * The rig is the default because one figure drawn the same way everywhere is
 * easier to read across a class. But it is a 2D stick figure: rotation, lateral
 * travel and equipment detail are the things it cannot say, and where it cannot,
 * a picture that the instructor actually understands beats a consistent one they
 * do not. Add a name here and the exercise keeps its own artwork.
 *
 * See docs/ARTWORK.md for when to reach for which.
 */
export const IMAGE_PREFERRED: ReadonlySet<string> = new Set<string>([]);

/**
 * Attaches rigs to a catalog and drops the legacy artwork they replace, so a
 * migrated exercise has exactly one source of truth for its visual.
 *
 * Compiled classes resolve their own rigs by name; this covers the catalog
 * itself, which the exercise library reads directly.
 */
export function applyRigAssignments(catalog: ExerciseCatalog): void {
  catalog.exercises.forEach((exercise) => {
    if (IMAGE_PREFERRED.has(exercise.name)) return;
    const rig = rigIdForExercise(exercise.name);
    if (!rig || !RIGS[rig]) return;
    exercise.rig = rig;
    delete exercise.illustration;
    delete exercise.motionIllustrations;
  });
}
