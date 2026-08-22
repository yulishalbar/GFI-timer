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
  "High-plank alternating crunch": "high-plank-alternating-crunch",
  "Pilates push-ups": "pilates-push-ups",
  "Knee push-ups": "knee-push-ups",

  // Prone back extension
  Superman: "superman",
  "Superman hold with flutter arms": "superman-flutter",

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
  "Cross body crunch": "quadruped-cross-body-crunch",
  "Combine Side crunch + Cross body crunch": "quadruped-combined-crunch",
  "Bird-dog extension and crunch": "bird-dog-crunch",
  "Seated Straddle": "seated-straddle",
  "Side twist": "seated-side-twist",
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
  Crunch: "crunch",
  "Criss-cross": "criss-cross",
  Scissors: "scissors",
  "Toe taps alternating legs": "toe-taps-alternating",
  "Toe taps both legs": "toe-taps-both",
  "Toe tap to reverse crunch": "toe-tap-reverse-crunch",
  "Alternating bird dogs": "supine-bird-dog",
  "Roll down to the mat": "roll-down-to-mat",
  "Knee to chest stretch": "knee-to-chest",
  "Knee across the body": "knee-across-body",

  // Side-lying
  "Leg lift": "side-lying-leg-lift",
  "Clamshell openers": "clamshell-openers",
  "Clamshell lifts": "clamshell-lifts",
  "Side-body crunches": "side-body-crunch",
  "Bottom leg lifts": "bottom-leg-lifts",
  "Bottom leg pulses": "bottom-leg-pulses",
  "Inner thigh circles": "inner-thigh-circles",
  "Double-leg lift": "double-leg-lift",
  "Small leg circles": "side-lying-small-leg-circles",
  "Pulse leg at the top": "pulse-leg-at-top",
  "Static hold": "side-lying-static-hold",
  "Clam shell openers with kick": "clamshell-kick",

  "Big leg circles": "side-lying-big-circles",
  "Small leg circle pulses": "side-lying-small-circles",
  "Forward and back kick": "side-lying-forward-back-kick",
  "Straight leg crunches": "side-lying-straight-leg-crunch",
  "Tricep side push-up": "tricep-side-push-up",
  "Forearm side plank": "forearm-side-plank",

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
  "Full-range glute bridge": "full-range-glute-bridge",
  "Bridge with knee drive": "bridge-knee-drive",
  "Bridge knee-drive pulses": "bridge-knee-drive-pulse",
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
  "Squat to stand": "squat-to-stand",
  "Squat pulse": "squat-pulse",
  "Squat -> add arms": "squat-add-arms",
  "Squat hold": "squat-hold",
  "Squat hold leg lift": "squat-hold-leg-lift",
  "Squat to twist": "squat-to-twist",
  "Sumo squat and hand lifts": "sumo-squat-hand-lifts",
  "Reverse lunge": "reverse-lunge",
  "Reverse-lunge pulse": "reverse-lunge-pulse",
  "Standing kickback": "standing-kickback",
  "Kickback hold and pulse": "kickback-hold-pulse",
  "Side to back kick": "side-to-back-kick",
  "Single-leg deadlift (SLDL) to knee tuck": "single-leg-deadlift-knee-tuck",
  "Knee pulls alternating legs": "standing-knee-pulls",
  "Arm circles": "arm-circles",
  "Small arm circles": "small-arm-circles",
  "Shoulder rolls": "shoulder-rolls",
  "Hip circles": "hip-circles",

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

  // Pilates ring. The shared skeleton carries the body path; the written cue
  // remains authoritative for where and how the ring is pressed.
  Butterfly: "seated-straddle",
  "Overhead reach with palms inside ring": "standing-side-stretch",
  "Straight leg forward fold - Reach right and left": "seated-forward-fold",
  "One-leg roll-up with ring, with single arms stretching back": "roll-ups",
  "Ring chest press on knees": "band-hold-out",
  "Ring chest press + oblique twist": "banded-russian-twist",
  "Kneeling Squat + Ring Press": "squat-add-arms",
  "in-and-out press": "band-pulse-out",
  "Biceps press": "ring-collarbone-press",
  "Prone leg lifts": "superman",
  "Prone back lift": "superman",
  superman: "superman",
  "Lifted chest ring press": "superman",
  "Tabletop leg-lifts": "quadruped-glute-lift",
  "Tabletop leg lift + crunch leg in": "bird-dog-crunch",
  "Tabletop leg lift pulse up and down": "quadruped-leg-pulse",
  "Bridge with ring Around Thighs": "banded-bridge",
  "Bridge with ring Around Thighs + Pulse": "glute-bridge-pulse",
  "Bridge with ring between thighs press in": "banded-bridge",
  "Bridge with ring between thighs hold": "banded-bridge",
  Squat: "squat-to-stand",
  "Lunge with ring in front": "reverse-lunge",
  "High runner's lunge": "reverse-lunge",
  "90/90 lunge w shoulder press": "reverse-lunge",
  "single-leg Warrior III row transitioning into a single leg lunge with ring shoulder press": "single-leg-deadlift-knee-tuck",
  "Arabesque lunge with shoulder press + knee drive": "single-leg-deadlift-knee-tuck",
  "Sumo Squat + standing upright row": "sumo-squat-hand-lifts",
  "Side Plank + Ring Press": "forearm-side-plank",
  "Side Plank + side crunch lifted leg in": "side-body-crunch",
  "Side Plank + bring leg to front": "side-lying-forward-back-kick",
  "Side Plank + Leg up and down": "side-lying-leg-lift",
  "Side reach to v up": "side-lying-straight-leg-crunch",
  "Ring press + both leg lift": "double-leg-lift",
  "Crunch w ring in between thighs": "crunch",
  "Crunch pulse": "crunch",
  "Table top crunch with lifted legs": "crunch-legs-lifted",
  "Cocoons placing ring on shins and then holding ring": "slider-in-outs",
  "Leg extensions (ring around calves)": "banded-leg-lowers",
  "In and out (ring around calves)": "slider-in-outs",
  "Russian twist": "banded-russian-twist",
  "Boat pose": "reverse-plank-l-sit",
  "Single leg hug knees to chest": "knee-to-chest",
  "Windshield wipers": "windshield-wipers",
  "Reclining twist": "knee-across-body",
  "Knee to chest": "knee-to-chest",
  "Reclining tree pose": "figure-four-twist"

  // Shavasana is deliberately absent: it is a photograph, because side-on a
  // body lying flat is a horizontal line. See the rig-or-a-picture section of
  // docs/ARTWORK.md.
};

export function rigIdForExercise(name: string): string | undefined {
  return RIG_BY_EXERCISE_NAME[name];
}
