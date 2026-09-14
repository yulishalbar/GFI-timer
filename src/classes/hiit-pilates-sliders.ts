import type { ClassEntry, ExerciseEntry, FitnessClassDefinition } from "../domain/class-definition";
import { builtInTags } from "../catalog/tags";
import { normalizeSlidersCatalog } from "../catalog/normalize-sliders";
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
  shortDescription?: string,
  illustration?: string
): ExerciseEntry => ({
  type: "exercise",
  id,
  name,
  durationSeconds,
  ...(shortDescription ? { shortDescription } : {}),
  ...(longDescription ? { longDescription } : {}),
  ...(illustration ? { illustration } : {})
});

// Source: classes/updated sliders class #1.pdf. Explicit rows govern timing.
const absMoves = [
  exercise("roll-ups", "Roll-ups", 60,
    "Knees bent, feet grounded on the mat. Exhale as you lift the head and shoulders, drawing the navel toward the spine and curling the ribcage toward the pelvis. Inhale as you slowly lower back to the mat with control. -> R: option to keep legs on mat"),
  exercise("double-leg-stretch", "Double Leg Stretch", 40),
  exercise("leg-lowers", "Leg lowers", 40),
  exercise("tabletop-toe-tap", "Tabletop Toe Tap", 40),
  exercise("dead-bug", "Dead Bug", 40),
  exercise("crunches-bent-knees", "Crunches with bent knees", 40)
];

function withTenSecondRests(prefix: string, moves: readonly ExerciseEntry[]): ClassEntry[] {
  return moves.flatMap((move, index) => [
    { ...move, id: `${move.id}-${prefix}` },
    ...(index < moves.length - 1 ? [rest(`${prefix}-rest-${index + 1}`, 10)] : [])
  ]);
}

const reversePlankSeries = (prefix: string): ClassEntry[] => [
  rest(`${prefix}-setup`, 60, "Fold mat. Sit on mat. Describe the next movements: go through all movements."),
  exercise(`${prefix}-reverse-plank-l-sit`, "Reverse plank to L-sit", 30,
    "Begin in reverse plank with hands and heels grounded, chest lifted, and sliders under heels of feet. Inhale to hold the reverse plank. Exhale as you bend at the hips and slide the legs toward an L-sit position, lifting through the core. Inhale as you return to reverse plank. R: hold static reverse plank without sliding."),
  rest(`${prefix}-rest-1`, 10),
  exercise(`${prefix}-in-outs`, "In and outs with sliders", 30,
    "Sit up straight on mat, arms slightly bent behind the back, sliders under heels. Inhale to slide the legs out straight, leaning your torso back to counterbalance."),
  rest(`${prefix}-rest-2`, 10),
  exercise(`${prefix}-glute-bridge`, "Glute bridge", 30,
    "Slowly lower down to mat, heels on sliders planted on mat. Exhale to lift the hips up and squeeze at the top, inhale to slowly lower back down.", undefined, "exercises/glute-bridge.svg"),
  rest(`${prefix}-rest-3`, 10),
  exercise(`${prefix}-glute-bridge-curl`, "Glute bridge curl", 30,
    "Lie on back with heels on sliders. Lift hips into bridge. Exhale as you slide heels toward glutes while keeping hips lifted. Inhale as you slowly extend the legs back out.", undefined, "exercises/glute-bridge.svg"),
  rest(`${prefix}-rest-4`, 10),
  exercise(`${prefix}-glute-bridge-pulse`, "Glute bridge pulse", 30,
    "Pulse at the top with hips lifted and heels grounded to mat.", undefined, "exercises/glute-bridge.svg")
];

const hiitLegRound = (round: "one" | "two"): ClassEntry[] => {
  const moves = [
    exercise(`reverse-lunge-${round}`, "Single-leg lunge with slider", 30,
      "Stand with one foot planted and the other on a slider behind you. Inhale as the sliding leg moves back into a reverse lunge while the front knee bends. Exhale as you press through the front heel and slide the back foot forward to return to standing. Maintain upright posture and engaged core."),
    exercise(`lunge-hold-${round}`, "Single-leg lunge with slider with pulse", 30,
      "Lower into a lunge with the back foot on the slider. Hold while maintaining a strong core and upright torso. Exhale through small pulsing movements. R: static lunge hold without pulses. P: add overhead reach."),
    exercise(`runner-lunge-${round}`, "High runner's lunge leg in-and-out", 30,
      "Hold a high runner's lunge with the front foot planted and back foot on a slider. Slide the back leg in and out while keeping the front knee bent and torso steady."),
    exercise(`side-lunge-${round}`, "Side lunge sliding out", 30,
      "Stand with one foot planted and the other on a slider to the side. Inhale as the sliding leg moves outward while the standing knee bends into a side lunge. Exhale as you engage the inner thigh and glute to pull the slider back to center standing tall."),
    exercise(`squat-side-lunge-${round}`, "Isometric hold squat with side lunge", 30,
      "Starting in a squat, inhale as the sliding leg moves outward while the standing knee bends into a side lunge. Exhale as you engage the inner thigh and glute to pull the slider back to center, staying low.")
  ];
  return moves.flatMap((move, index) => [move, ...(index >= 2 && index < moves.length - 1 ? [rest(`${round}-hiit-rest-${index + 1}`, 10)] : [])]);
};

const plankPyramidMoves = [
  exercise("straight-leg-sweep", "Straight leg sweep", 30,
    "Slider under toes on working leg, in a high plank. Stay square to the mat as you slide the straight leg outward, perpendicular to the body; exhale to come back to center. R: do this on knees.", undefined, "exercises/high-plank.svg"),
  exercise("straight-leg-sweep-circles", "Straight leg sweep circles", 30,
    "Slider under toes on working leg, in a high plank. Exhale as you slide the straight leg inward toward the chest, inhale to circle the leg outward and slide back to center. R: do this on knees.", undefined, "exercises/high-plank.svg"),
  exercise("thread-leg-side", "Thread the leg and open to the side", 30,
    "In a high plank, slide working leg with pelvis parallel to the ground, lift the hand to open the side body, then slide the working leg straight under the body toward the side. Exhale to bring the hand back up and return to neutral. Repeat.", undefined, "exercises/high-plank.svg"),
  exercise("slider-mountain-climbers", "Sliders mountain climbers", 30,
    "Begin in a high plank with both feet on sliders, hands under shoulders. Exhale as you slide one knee toward the chest while keeping hips low and spine neutral. Inhale as you slide the leg back and alternate sides.", undefined, "exercises/high-plank.svg")
];

function sideBody(side: "right" | "left"): ClassEntry[] {
  return [
    exercise(`donkey-kicks-${side}`, "Donkey kicks", 40),
    exercise(`donkey-kick-pulses-${side}`, "Donkey kick pulses", 20),
    exercise(`fire-hydrants-${side}`, "Fire hydrants", 40),
    exercise(`fire-hydrant-pulses-${side}`, "Fire hydrant pulses", 20),
    rest(`fire-hydrant-rest-${side}`, 10),
    exercise(`cross-overs-${side}`, "Cross overs", 40),
    exercise(`straight-leg-lift-${side}`, "Straight leg lift", 40),
    exercise(`rainbows-${side}`, "Rainbow", 40),
    rest(`come-to-side-${side}`, 20, "Rest, come to the side"),
    exercise(`bent-knee-leg-lift-${side}`, "Bent-knee leg lift", 40),
    exercise(`pulse-bent-knee-${side}`, "Pulse bent knee", 30),
    rest(`bent-knee-pulse-rest-${side}`, 10),
    exercise(`rotation-knee-heel-${side}`, "Rotation knee and heel", 40),
    exercise(`kick-knee-chest-${side}`, "Kick knee to chest and extned", 40),
    rest(`kick-knee-chest-rest-${side}`, 10),
    exercise(`extended-pulse-back-${side}`, "Extended pulse straight back", 30),
    exercise(`extended-pulse-front-${side}`, "Extended pulse infornt", 30)
  ];
}

export const hiitPilatesSlidersLegacy = {
  schemaVersion: 1,
  id: "hiit-pilates-sliders-v1",
  version: 10,
  title: "Mat Pilates with Sliders V1",
  description:
    "A lower-body-focused Mat Pilates class with sliders, including glutes, legs, core, upper-body support, and cooldown. Equipment: mat and optional sliders.",
  phases: [
    { id: "introduction", name: "Intro", items: [exercise("introduction", "Class introduction", 120)] },
    {
      id: "warmup",
      name: "Warm-Up",
      items: [
        exercise("breathing-work", "Breathing work", 30,
          "Push hips back and stretch fingers towards the top of the mat"),
        exercise("breathing-arm-sweeps", "Breathing with overhead arm sweeps", 30),
        exercise("head-circles", "head circles", 30,
          "Come to all 4s position starting with a neutral spine, inhale as you initiate movement through the chest, lifting it towards the ceiling, along with you gaze if it feels comfortable on the neck. exhale as you round your back and lift the gaze towards the ceiling, not dumping lower back"),
        exercise("shoulder-rolls", "Shoulder rolls", 30),
        exercise("side-to-side-crunch", "Side to side crunch", 30,
          "Hands besides ears, slowly exhale to side crunch towards one side, inhale lift neck back straight up, sit tall, and repeate on other side"),
        exercise("seated-cat-cows", "Seated cat cows", 30,
          "Still in all 4s, pelvis parallel to the ground, lift right hand up, opening up the right side of the body, then move right shoulder below left shoulder as you thread the right arm under your belly, stay in this pose for a few seconds. Exhale to bring hand back up and then come back to neutral. Switch sides"),
        exercise("seated-cat-cow-half-roll-down", "seated cat cow to half roll down", 30,
          "From tabletop position extend right arm forward and left leg back,. Hold briefly, then return to center and switch sides in a slow, controlled manner.. Add wrist circles as extended keeping hips square to the mat and core engaged",
          "end-> introduce equipment, state its just an option"),
        rest("warmup-break", 60, "Get ready for the abs circuit.")
      ]
    },
    {
      id: "abs-circuit",
      name: "Circuit #1: Abs",
      items: [
        ...withTenSecondRests("abs-round-one", absMoves)
      ]
    },
    {
      id: "plank-pyramid",
      name: "Circuit #2: Upper Body and Core Pyramid",
      items: [
        ...withTenSecondRests("plank-pyramid", [
          ...plankPyramidMoves,
          { ...plankPyramidMoves[2]!, id: "thread-leg-side-return" },
          { ...plankPyramidMoves[1]!, id: "straight-leg-sweep-circles-return" },
          { ...plankPyramidMoves[0]!, id: "straight-leg-sweep-return" }
        ])
      ]
    },
    { id: "upper-core-one", name: "Circuit #3: Upper Body and Core", items: reversePlankSeries("upper-one") },
    {
      id: "hiit-legs",
      name: "Circuit #4: Legs Focused",
      items: [
        rest("hiit-setup", 60, "Come to standing. Start with left leg in front, slider under right leg behind. R-> dont use the sliders"),
        ...hiitLegRound("one"),
        rest("hiit-side-switch", 60, "Switch sides."),
        ...hiitLegRound("two"),
        rest("hiit-finish-break", 60, "Get ready for the next circuit.")
      ]
    },
    {
      id: "side-body",
      name: "Circuit #5: Side Body",
      items: [
        ...sideBody("right"),
        rest("side-body-switch", 30, "Repeat on left side."),
        ...sideBody("left")
      ]
    },
    {
      id: "cooldown",
      name: "Cooldown",
      items: [
        exercise("cooldown-breathing-arm-sweeps", "Breathing with overhead arm sweeps", 60),
        exercise("side-twist-left", "Side twist", 45, undefined, "Left side."),
        exercise("seated-side-stretch-left", "Seated side stretch", 30, undefined, "Left side."),
        exercise("seated-cow-arms-crossed-left", "Seated Cow Pose Variation Arms Crossed On Knees", 30, undefined, "Left side."),
        exercise("side-twist-right", "Side twist", 45, undefined, "Right side."),
        exercise("seated-side-stretch-right", "Seated side stretch", 30, undefined, "Right side."),
        exercise("seated-cow-arms-crossed-right", "Seated Cow Pose Variation Arms Crossed On Knees", 30, undefined, "Right side."),
        exercise("seated-forward-fold", "Seated forward fold", 60,
          "Sit with legs extended forward. Inhale reaching arms overhead to lengthen the spine. Exhale as you hinge forward from the hips, reaching toward the feet while relaxing the neck and shoulders.", undefined, "exercises/seated-forward-fold.jpg"),
        exercise("roll-down", "Lower down slowley", 10,
          "From seated, exhale as you slowly roll down to the mat one vertebra at a time. Inhale once fully lying down."),
        exercise("reclined-tree-right", "Reclining tree pose", 60, undefined, "Right side."),
        exercise("reclined-tree-left", "Reclining tree pose", 60, undefined, "Left side."),
        exercise("reclined-butterfly", "Reclined butterfly", 50),
        exercise("happy-baby", "Happy Baby", 60),
        exercise("shavasana", "Shavasana", 180,
          "Lie comfortably on back with arms relaxed at sides. Slow inhale through the nose, slow exhale through the mouth. Allow the body to fully relax and breathing to settle naturally. End: come to seated. Closing words: Thank you for coming today and working out early in the morning, amazing job! Don't forget to wipe down your mat and the sliders. Have a great spring break!!", undefined, "exercises/shavasana.jpg")
      ]
    }
  ]
} satisfies FitnessClassDefinition;

const adaptedSlidersCourse = normalizeSlidersCatalog(adaptLegacyClassToCatalog(hiitPilatesSlidersLegacy, {
  tags: builtInTags,
  courseTags: ["mat-pilates", "mat", "sliders", "full-body"],
  exerciseTags: ["mat-pilates", "mat", "sliders"]
}));

export const hiitPilatesSlidersCatalog = {
  catalog: adaptedSlidersCourse.catalog,
  course: {
    ...adaptedSlidersCourse.course,
    id: "hiit-pilates-sliders",
    version: 10,
    title: "Mat Pilates with Sliders"
  }
};

export const hiitPilatesSlidersV1 = hiitPilatesSlidersLegacy;

export const hiitPilatesSliders = resolveCourseDefinition(
  hiitPilatesSlidersCatalog.catalog,
  hiitPilatesSlidersCatalog.course
);
