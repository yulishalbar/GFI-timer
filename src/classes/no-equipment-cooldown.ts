import { mergeExerciseCatalogs } from "../catalog/merge-catalogs";
import { weightsMobilityCatalog } from "../catalog/weights-mobility";
import type { CourseExerciseItem, CoursePhaseDefinition, ExerciseDefinition, ExerciseSide } from "../domain/catalog-definition";
import { matPilates0724Catalog } from "./mat-pilates-07-24";
import { hiitPilatesSlidersCatalog } from "./hiit-pilates-sliders";

// Adapted from Yogalates SOP, pp. 11–19; see docs/CLASS_FORMAT.md.
const newExercises: ExerciseDefinition[] = [
  {
    schemaVersion: 1, id: "no-equipment-sphinx", version: 1, name: "Sphinx pose",
    sideSupport: "none", tags: ["mat-pilates", "mat"],
    shortDescription: "From forearm plank, lower the knees, hips and belly to the mat. Keep elbows beneath shoulders.",
    longDescription: "Rest on the forearms with legs relaxed behind you. Gently lengthen the chest forward and up while softening the shoulders away from the ears. Breathe slowly without pressing into the lower back. Slide the elbows farther forward or rest the forehead on stacked hands for less intensity."
  },
  {
    schemaVersion: 1, id: "no-equipment-eagle-supine-twist", version: 1, name: "Eagle supine twist",
    sideSupport: "left-right", tags: ["mat-pilates", "mat"],
    shortDescription: "From figure four, plant the supporting foot and cross the working thigh over the other thigh.",
    longDescription: "The side badge identifies the top crossed leg. With the right leg crossed over the left, gently lower the knees left; reverse for the left leg. Open the arms comfortably and keep both shoulders relaxed toward the mat. Let the head face wherever the neck feels easy. Uncross the legs and use a smaller knee drop if needed. Return slowly to center before changing sides."
  }
];

const pool = mergeExerciseCatalogs(matPilates0724Catalog.catalog, hiitPilatesSlidersCatalog.catalog, weightsMobilityCatalog);
function findExercise(name: string): ExerciseDefinition {
  const exercise = [...pool.exercises, ...newExercises].find((entry) => entry.name === name);
  if (!exercise) throw new Error(`Missing cooldown exercise: ${name}`);
  return exercise;
}
const usedExercises = new Map<string, ExerciseDefinition>();
function move(id: string, name: string, durationSeconds: number, shortDescription?: string, side?: ExerciseSide): CourseExerciseItem {
  const exercise = findExercise(name);
  usedExercises.set(exercise.id, exercise);
  return { type: "exercise", id, exerciseId: exercise.id, exerciseVersion: exercise.version, durationSeconds, ...(side ? { side } : {}), ...(shortDescription ? { shortDescription } : {}) };
}

export const noEquipmentCooldown: CoursePhaseDefinition = {
  id: "cooldown", name: "Cooldown",
  items: [
    move("cooldown-sphinx", "Sphinx pose", 60),
    move("cooldown-childs-pose", "Child's pose", 60, "Press gently up through tabletop and sit the hips back toward the heels. Rest the forehead and soften the back after sphinx."),
    move("cooldown-forward-fold", "Hamstring stretch → seated forward fold", 60, "Come up slowly and swing the legs forward to sit. Soften the knees, lengthen the spine and ease into a comfortable forward fold."),
    move("cooldown-roll-down", "Roll down to the mat", 30, "Rise slowly from the fold, bend the knees and lower onto the back with control. Use the hands for support if preferred; finish with feet planted."),
    move("cooldown-figure-four-right", "Figure four stretch", 60, undefined, "right"),
    move("cooldown-twist-right", "Eagle supine twist", 60, undefined, "right"),
    move("cooldown-figure-four-left", "Figure four stretch", 60, "Return to center, uncross and plant both feet. Cross the left ankle over the right thigh for figure four.", "left"),
    move("cooldown-twist-left", "Eagle supine twist", 60, undefined, "left"),
    move("cooldown-happy-baby", "Happy Baby", 30, "Return to center and uncross the legs. Draw knees toward the armpits and hold thighs, calves or feet. Keep the head and lower back comfortably supported."),
    move("shavasana", "Shavasana", 180, "Release the legs along the mat with feet falling comfortably apart. Rest arms beside the body, palms up. Relax the shoulders and let breathing settle; remain resting through the end of class.")
  ]
};
export const noEquipmentCooldownCatalog = { ...pool, exercises: [...usedExercises.values()] };
