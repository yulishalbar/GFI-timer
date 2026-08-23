import type { ClassEntry, ExerciseEntry, FitnessClassDefinition } from "../domain/class-definition";
import { normalizeBandCatalog } from "../catalog/normalize-band";
import { builtInTags } from "../catalog/tags";
import { adaptLegacyClassToCatalog } from "../domain/legacy-catalog-adapter";
import { resolveCourseDefinition } from "../domain/resolve-course";

const rest = (id: string, durationSeconds: number, shortDescription?: string): ClassEntry => ({
  type: "rest",
  id,
  name: "REST",
  durationSeconds,
  ...(shortDescription ? { shortDescription } : {})
});

const exercise = (
  id: string,
  name: string,
  durationSeconds: number,
  longDescription?: string,
  illustration?: string
): ExerciseEntry => ({
  type: "exercise",
  id,
  name,
  durationSeconds,
  ...(longDescription ? { longDescription } : {}),
  ...(illustration ? { illustration } : {})
});

function withBreaks(prefix: string, seconds: number, moves: readonly ExerciseEntry[]): ClassEntry[] {
  return moves.flatMap((move, index) => [
    move,
    ...(index < moves.length - 1 ? [rest(`${prefix}-rest-${index + 1}`, seconds)] : [])
  ]);
}

const upperBodyMoves = [
  exercise("ring-chest-press-one", "Ring chest press on knees", 40,
    "Kneel tall holding ring at chest. Exhale squeeze ring. Inhale release."),
  exercise("ring-chest-press-twist-one", "Ring chest press + oblique twist", 40,
    "Add torso twists while squeezing."),
  exercise("kneeling-squat-ring-press-one", "Kneeling Squat + Ring Press", 40,
    "Lower hips back toward heels. Reach arms forward. Exhale power up to tall kneel while squeezing ring. Add small squeeze pulses."),
  exercise("in-out-press-one", "in-and-out press", 40,
    "Still in a kneeling position, squeeze ring out (3 times until all the way out) and back (3 times until all the way in)."),
  exercise("biceps-press-left", "Biceps press (L)", 40,
    "Place one pad of the ring on top of the shoulder or collarbone area using the palm to press straight down against the resistance."),
  exercise("ring-chest-press-two", "Ring chest press on knees", 40,
    "Kneel tall holding ring at chest. Exhale squeeze ring. Inhale release."),
  exercise("ring-chest-press-twist-two", "Ring chest press + oblique twist", 40,
    "Add torso twists while squeezing."),
  exercise("kneeling-squat-ring-press-two", "Kneeling Squat + Ring Press", 40,
    "Lower hips back toward heels. Reach arms forward. Exhale power up to tall kneel while squeezing ring. Add small squeeze pulses."),
  exercise("in-out-press-two", "in-and-out press", 40,
    "Still in a kneeling position, squeeze ring out (3 times until all the way out) and back (3 times until all the way in)."),
  exercise("biceps-press-right", "Biceps press (R)", 40,
    "Place one pad of the ring on top of the shoulder or collarbone area using the palm to press straight down against the resistance.")
];

const tabletopSide = (side: "L" | "R"): ExerciseEntry[] => [
  exercise(`tabletop-leg-lifts-${side.toLowerCase()}`, `Tabletop leg-lifts (${side})`, 40,
    "Opposite hand presses ring. Extend straight back leg. Lift and lower."),
  exercise(`tabletop-leg-lift-crunch-${side.toLowerCase()}`, `Tabletop leg lift + crunch leg in (${side})`, 40,
    "Opposite hand presses the ring. Extend the straight back leg. Crunch back towards the center. Extend straight back."),
  exercise(`tabletop-leg-lift-pulse-${side.toLowerCase()}`, `Tabletop leg lift pulse up and down (${side})`, 40,
    "Opposite hand presses the ring. Extend the straight back leg and pulse up and down.")
];

const standingRound = (side: "L" | "R"): ExerciseEntry[] => [
  exercise(`squat-${side.toLowerCase()}-round`, "Squat", 30),
  exercise(`squat-add-arms-${side.toLowerCase()}-round`, "Squat -> add arms", 30),
  exercise(`squat-hold-${side.toLowerCase()}-round`, "Squat hold", 30),
  exercise(`lunge-ring-front-${side.toLowerCase()}`, `Lunge with ring in front (${side})`, 30,
    "Hold the ring in front of the chest while lowering into the lunge."),
  exercise(`high-runners-lunge-${side.toLowerCase()}`, `High runner's lunge (${side})`, 30,
    "Hold a high runner's lunge with the front knee bent and the back leg long.")
];

const sideBody = (side: "L" | "R"): ExerciseEntry[] => [
  exercise(`side-plank-ring-press-${side.toLowerCase()}`, `Side Plank + Ring Press (${side})`, 40,
    "Forearm side plank. Top leg stacks over the bottom leg. Top hand presses ring. Lower and lift hips. Add knee pulls or leg kicks. Finish with pulses."),
  exercise(`side-plank-crunch-${side.toLowerCase()}`, `Side Plank + side crunch lifted leg in (${side})`, 40,
    "Forearm side plank. Top hand presses ring. Crunch top leg in and out while still pressing on the ring."),
  exercise(`side-plank-leg-front-${side.toLowerCase()}`, `Side Plank + bring leg to front (${side})`, 40,
    "Forearm side plank. Top hand presses ring. Exhale to bring the top straight leg to be perpendicular to the core."),
  exercise(`side-plank-leg-lift-${side.toLowerCase()}`, `Side Plank + Leg up and down (${side})`, 40,
    "Forearm side plank. Top hand presses ring. Lift top leg up while still pressing on the ring."),
  exercise(`side-reach-v-up-${side.toLowerCase()}`, `Side reach to v up (${side})`, 40,
    "Forearm side plank. While legs are long extended on the mat, reach top arm holding the ring overhead while rotating the body and the gaze towards the mat. Rotate back and lift legs straight up and slide ring while lowering the legs towards the ground. Lift ring and lower legs back down to repeat."),
  exercise(`ring-press-both-leg-lift-${side.toLowerCase()}`, `Ring press + both leg lift (${side})`, 40,
    "Lower down onto biceps. Top hand presses on ring while both legs lift up. Lower legs and release pulse. Repeat.")
];

export const matPilatesRingLegacy = {
  schemaVersion: 1,
  id: "mat-pilates-ring-v1",
  version: 3,
  title: "Mat Pilates Ring Class V1",
  description: "A 63-minute full-body Mat Pilates class using a Pilates ring, with core, arms, glutes, legs, side body, back work, and cooldown.",
  phases: [
    {
      id: "introduction",
      name: "INTRODUCTION",
      items: [exercise("introduction", "INTRODUCTION", 120,
        "Focus on the mind and body connection, stretch the total body, and work the upper body, core, and legs.")]
    },
    {
      id: "warmup",
      name: "Warm-Up",
      items: [
        exercise("butterfly", "Butterfly", 30,
          "Sit tall with soles of the feet together, knees open wide. Hold ankles or shins. Gently press knees toward the floor while lengthening through the spine. Option to add small pulses or remain still."),
        exercise("side-twist", "Side twist", 60,
          "Sit with legs crossed. Twist towards the left side, grabbing left knee with right hand and left hand towards the back. Switch sides after 30 sec."),
        exercise("overhead-reach-palms-inside-ring", "Overhead reach with palms inside ring", 30,
          "Reach the ring overhead with the palms pressing into the inside pads of the ring."),
        exercise("straight-leg-forward-fold", "Straight leg forward fold - Reach right and left", 30,
          "Straighten legs. Sit with both legs extended straight in front. Flex feet and sit tall. Inhale lengthen spine. Exhale hinge forward from hips, reaching toward shins, ankles, or feet. Keep chest lifted and avoid rounding excessively."),
        exercise("one-leg-roll-up-ring-left", "One-leg roll-up with ring, with single arms stretching back (L)", 60,
          "Place ring over lifted left leg. Inhale prepare. Exhale to roll down with control. Inhale at the bottom. Exhale roll up toward the lifted leg, reaching the ring forward. At the top, extend one arm back behind you to open the chest. Return arm forward."),
        exercise("one-leg-roll-up-ring-right", "One-leg roll-up with ring, with single arms stretching back (R)", 60,
          "Place ring over lifted right leg. Inhale prepare. Exhale to roll down with control. Inhale at the bottom. Exhale roll up toward the lifted leg, reaching the ring forward. At the top, extend one arm back behind you to open the chest. Return arm forward."),
        rest("warmup-end", 60, "Rest before beginning standing circuit.")
      ]
    },
    {
      id: "abs-arms-back",
      name: "Circuit #1: ABS + ARMS CIRCUIT + back",
      items: [
        ...withBreaks("upper", 10, upperBodyMoves),
        rest("prone-setup", 30, "Lie on back, preparing for back exercises."),
        exercise("prone-leg-lifts", "Prone leg lifts", 30,
          "Lie face down on your mat with your arms extended forward, holding the pads of the ring on the floor. Exhale to lift legs up together, squeezing at the top, lower down."),
        exercise("prone-back-lift", "Prone back lift", 30,
          "Lie face down on your mat with your arms extended forward, holding the pads of the ring on the floor. Inhale to prepare, then exhale as you press down lightly on the ring and lift your head, chest, and arms a few inches off the mat. Keep your lower ribs and pubic bone anchored to the floor. Inhale to lower back down with control."),
        exercise("superman", "superman", 30,
          "Combining prone Back lift and prone leg lifts."),
        exercise("prone-chest-lift-ring", "Lifted chest ring press", 30,
          "Lie face down with legs extended long behind you and arms reaching overhead, holding the Pilates ring. Engage your core and glutes. Keeping the arms long, gently lift your head, chest, and arms off the mat by extending through the upper back. Reach the ring forward as you lift rather than pulling the shoulders toward the ears. Keep the pelvis and legs grounded. Slowly lower the chest and arms back toward the mat with control, then repeat.")
      ]
    },
    {
      id: "core-glutes",
      name: "Circuit #3: Core + Glutes",
      items: [
        rest("core-glutes-setup", 60, "Come to tabletop and prepare the ring."),
        ...tabletopSide("R"),
        ...tabletopSide("L"),
        exercise("bridge-ring-thighs", "Bridge with ring Around Thighs", 30,
          "Ring around outer thighs. Exhale lift into bridge. Press knees outward against ring."),
        exercise("bridge-ring-thighs-pulse", "Bridge with ring Around Thighs + Pulse", 30,
          "Add pulses and half-lowers."),
        rest("bridge-ring-position-change", 10, "Move the ring between the thighs."),
        exercise("bridge-ring-between-thighs-press", "Bridge with ring between thighs press in", 30,
          "Hold the bridge and press the thighs inward against the ring, then release with control."),
        exercise("bridge-ring-between-thighs-hold", "Bridge with ring between thighs hold", 30,
          "Hold the bridge and maintain an inward press against the ring.")
      ]
    },
    {
      id: "legs-focused",
      name: "Circuit #4: legs focused X 2 (switch sides)",
      items: [
        rest("legs-setup", 60, "Come to standing. Describe the next movements."),
        ...withBreaks("legs-left", 10, standingRound("L")),
        rest("legs-side-switch", 10, "Switch sides."),
        ...withBreaks("legs-right", 10, standingRound("R"))
      ]
    },
    {
      id: "side-body",
      name: "Circuit #2: Side body",
      items: [
        rest("side-body-setup", 60, "Lower to the mat and prepare for the side-body circuit."),
        ...withBreaks("side-body-left", 15, sideBody("L")),
        rest("side-body-switch", 30, "Switch sides."),
        ...withBreaks("side-body-right", 15, sideBody("R"))
      ]
    },
    {
      id: "mat-core",
      name: "Circuit #5: Mat Pilates core",
      items: [
        rest("mat-core-setup", 60, "Cue next circuit."),
        ...withBreaks("mat-core", 10, [
          exercise("crunch-ring-thighs", "Crunch w ring in between thighs", 40,
            "Knees bent with soles of feet on mat."),
          exercise("crunch-pulse", "Crunch pulse", 40),
          exercise("tabletop-crunch-lifted-legs", "Table top crunch with lifted legs", 40,
            "Ring in the interior of ankles. Exhale to lift chest, shoulders and head, reach towards the toes and lower down. Progression: come all the way up to a boat pose and lift arms up overhead."),
          exercise("cocoons-ring-shins", "Cocoons placing ring on shins and then holding ring", 40,
            "Laying on the mat with the pelvis tucked in. Place legs over the shins in tabletop. Extend legs out hovering in the air, and reach arms back straight overhead. Exhale to squeeze core and bring legs and hands to center, grabbing the ring with the hand to repeat movement."),
          exercise("leg-extensions-ring-calves", "Leg extensions (ring around calves)", 40,
            "Extend legs to 45 and bend towards chest."),
          exercise("in-out-ring-calves", "In and out (ring around calves)", 40),
          exercise("russian-twist-ring", "Russian twist", 40,
            "Hold ring and squeeze."),
          exercise("boat-pose-ring", "Boat pose", 30,
            "Hold ring and squeeze.")
        ])
      ]
    },
    {
      id: "cooldown",
      name: "Cooldown",
      items: [
        rest("cooldown-setup", 60, "Sit up tall with legs crossed and prepare for cooldown."),
        exercise("single-leg-knee-hug-left", "Single leg hug knees to chest (L)", 90),
        exercise("single-leg-knee-hug-right", "Single leg hug knees to chest (R)", 90),
        exercise("windshield-wipers", "Windshield wipers", 90),
        exercise("reclining-twist-right", "Reclining twist (R)", 30,
          "Lie on your back and drop your knees to left side."),
        exercise("reclining-twist-left", "Reclining twist (L)", 30,
          "Lie on your back and drop your knees to left side."),
        exercise("knee-to-chest", "Knee to chest", 30),
        exercise("reclining-tree-right", "Reclining tree pose (R)", 30,
          "From knees to chest, extend left leg straight out while lowering the right knee towards the floor, use the right hand on right knee to gently move it towards the floor."),
        exercise("reclining-tree-left", "Reclining tree pose (L)", 30,
          "From knees to chest, extend right leg straight out while lowering the left knee towards the floor, use the left hand on left knee to gently move it towards the floor."),
        rest("shavasana-setup", 10, "Extend legs straight out."),
        exercise("shavasana", "Shavasana", 180,
          "Extend legs straight out. End: come to seated. Closing words: Thank you for coming today and working out early in the morning, amazing job! Don't forget to wipe down your mat. See you next time!",
          "exercises/shavasana.jpg")
      ]
    }
  ]
} satisfies FitnessClassDefinition;

const adaptedRingCourse = normalizeBandCatalog(adaptLegacyClassToCatalog(matPilatesRingLegacy, {
  tags: builtInTags,
  courseTags: ["mat-pilates", "mat", "ring", "full-body"],
  exerciseTags: ["mat-pilates", "mat", "ring"]
}));

export const matPilatesRingCatalog = {
  catalog: adaptedRingCourse.catalog,
  course: {
    ...adaptedRingCourse.course,
    id: "mat-pilates-ring",
    version: 3,
    title: "Mat Pilates Ring Class"
  }
};

export const matPilatesRing = resolveCourseDefinition(
  matPilatesRingCatalog.catalog,
  matPilatesRingCatalog.course
);
