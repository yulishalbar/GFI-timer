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
  "High plank hold": "high-plank-hold",
  "High plank shoulder taps, alternating hands": "high-plank-shoulder-taps",
  "High plank opening to a side planks (alternating)": "high-plank-side-plank-open",

  // Quadruped and kneeling
  "Tabletop → alternating bird dog → add wrist circles": "bird-dog",
  "Alternating bird dog → add wrist circles": "bird-dog",
  "Tabletop → cat and cows": "cat-cow",
  "Cat and cows": "cat-cow",
  "Thread the needle": "thread-the-needle",
  "Tabletop → downward-facing dog alternating": "tabletop-down-dog-alternating",
  "Downward dog to hovering tabletop": "down-dog-hovering-tabletop",
  "Donkey kick": "donkey-kick",
  "Donkey kick + crossover": "donkey-kick-crossover",
  "Donkey kick + downward dog crunch in": "donkey-kick-dog-crunch",
  "Leg extensions": "quadruped-leg-extension",
  "Leg pulses": "quadruped-leg-pulse",
  Rainbow: "rainbow",
  "Half rainbow": "half-rainbow",
  "Quadruped Glute Lift": "quadruped-glute-lift",
  "Side crunch": "quadruped-side-crunch",
  "Child's pose": "childs-pose",
  "Child's pose with side stretches": "childs-pose-side-stretch",

  // Supine core
  "Crunch w legs lifted": "crunch-legs-lifted",
  "Single-leg stretch": "one-leg-stretch",
  "Bicycle legs": "bicycle-legs",
  "Leg lowers": "leg-lowers",
  "One leg circle": "one-leg-circle",
  "Roll ups": "roll-ups",
  "Reverse plank to L-sit": "reverse-plank-l-sit",
  "In and outs with sliders": "slider-in-outs",
  "Tabletop crunch - band below knees": "banded-tabletop-crunch",
  "Hundredth - band below knees": "banded-hundred",
  "Leg lowers - band around ankles": "banded-leg-lowers",
  "Flutter kicks up and down - band around ankles": "banded-flutter-kicks",
  "Roll ups - band around wrists": "banded-roll-ups",
  "Russian twist - band around wrists": "banded-russian-twist",

  // Side-lying
  "Leg lift": "side-lying-leg-lift",
  "Clamshell openers": "clamshell-openers",
  "Clamshell lifts": "clamshell-lifts",
  "Side-body crunches": "side-body-crunch",

  "Big leg circles": "side-lying-big-circles",
  "Small leg circle pulses": "side-lying-small-circles",
  "Forward and back kick": "side-lying-forward-back-kick",
  "Straight leg crunches": "side-lying-straight-leg-crunch",
  "Tricep side push-up": "tricep-side-push-up",

  // Cooldown and stretches
  "Standing roll down": "standing-roll-down",
  "Forward fold": "standing-forward-fold",
  "Standing side-body stretch": "standing-side-stretch",
  "Crescent low lunge": "crescent-lunge",
  "Overhead arm stretch": "supine-overhead-arm-stretch",
  "Hug knees in towards chest": "hug-knees",
  "Lying figure four → twist → switch sides": "figure-four-twist",
  "Bent-knee windshield wipers": "windshield-wipers",
  "Downward-facing dog": "down-dog",
  "Downward-facing dog → child's pose → seated": "down-dog-childs-seated",
  "Hamstring stretch → seated forward fold": "seated-forward-fold",

  // Bridges
  "Glute bridge": "glute-bridge-sliders",
  "Glute bridge curl": "glute-bridge-curl",
  "Glute bridge pulse": "glute-bridge-pulse",
  "One-leg banded bridge": "one-leg-banded-bridge",
  "Bridge with band around thighs": "banded-bridge",

  // Standing legs, band. Left and right name themselves differently here, so
  // both spellings point at the one movement.
  "Static single-leg squat (L), right heel lifts and lowers": "static-single-leg-squat",
  "Static single-leg squat (R), left heel lifts and lowers": "static-single-leg-squat",
  "Single leg squat (L) + leg opener": "single-leg-squat-opener",
  "Single leg squat (R) + leg opener": "single-leg-squat-opener",
  "Pulse leg openers": "pulse-leg-openers",
  "Full-range single-leg squat (L), right heel lifted": "full-range-single-leg-squat",
  "Full-range single-leg squat (R), left heel lifted": "full-range-single-leg-squat",
  "Side squat to curtsy lunge": "side-squat-curtsy",
  "Curtsy pulse": "curtsy-pulse",

  // Standing upper body, band
  "Standing punch-outs": "standing-punch-outs",
  "Band hold out": "band-hold-out",
  "Band pulse out": "band-pulse-out",
  "Serve the platter": "serve-the-platter",
  "Band triceps ups (behind back)": "band-triceps-ups",
  "Band outward extension (behind back)": "band-outward-extension",

  // HIIT slider legs
  "Single-leg lunge with slider": "slider-reverse-lunge",
  "Isometric hold single-leg lunge with slider with pulse": "slider-lunge-hold-pulse",
  "Side lunge sliding out": "slider-side-lunge",
  "Isometric hold squat with side lunge": "slider-squat-side-lunge",

  // Standing, band
  "Straight biceps curl": "banded-biceps-curl",

  // Static holds
  Shavasana: "shavasana"
};

export function rigIdForExercise(name: string): string | undefined {
  return RIG_BY_EXERCISE_NAME[name];
}
