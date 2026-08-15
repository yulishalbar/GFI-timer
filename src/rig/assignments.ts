/**
 * Which canonical movement each exercise is, keyed by exercise name.
 *
 * The catalog holds several parallel representations of the same classes: the
 * legacy hand-authored definitions, their catalog-backed replacements, and the
 * standalone dated classes. Resolving the guide from the movement's name in one
 * place is what stops the same movement from being drawn one way in a class and
 * another way in the exercise library.
 *
 * Anything absent here is still on its legacy image.
 */
export const RIG_BY_EXERCISE_NAME: Readonly<Record<string, string>> = {
  // Plank and slider floor
  "Straight leg sweep": "straight-leg-sweep",
  "Straight leg sweep circles": "straight-leg-sweep-circles",
  "Thread the leg and open to the side": "thread-leg-side",
  "Sliders mountain climbers": "slider-mountain-climbers",

  // Quadruped
  "Tabletop → alternating bird dog → add wrist circles": "bird-dog",
  "Alternating bird dog → add wrist circles": "bird-dog",

  // Bridges
  "Glute bridge": "glute-bridge-sliders",

  // Standing, band
  "Straight biceps curl": "banded-biceps-curl",

  // Static holds
  Shavasana: "shavasana"
};

export function rigIdForExercise(name: string): string | undefined {
  return RIG_BY_EXERCISE_NAME[name];
}
