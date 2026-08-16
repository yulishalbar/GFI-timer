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

const absMoves = [
  exercise("crunch-legs-lifted", "Crunch w legs lifted", 40,
    "Knees bent, feet grounded on the mat. Exhale as you lift the head and shoulders, drawing the navel toward the spine and curling the ribcage toward the pelvis. Inhale as you slowly lower back to the mat with control. R: option to keep legs on mat."),
  exercise("one-leg-stretch", "Single-leg stretch", 40,
    "Lift head and shoulders into an abdominal curl with legs in tabletop. Exhale as one leg extends long and the opposite knee draws toward the chest. Inhale as you switch legs in a controlled alternating motion while maintaining abdominal engagement. R: option to keep head on mat. P: go faster."),
  exercise("bicycle-legs", "Bicycle legs", 40,
    "From an abdominal curl, alternate the legs in a cycling motion. Exhale as one leg extends long, inhale as you transition and switch legs. Maintain a steady torso and controlled breathing rhythm. P: perform slower."),
  exercise("leg-lowers", "Leg lowers", 40,
    "Exhale to lower legs toward floor; inhale to lift back to tabletop. R: head rests on mat. P: add a crunch at top."),
  exercise("one-leg-circle", "One leg circle", 40,
    "One leg extended on the mat while the other reaches vertically. Inhale to begin the circle across the body and down, exhale as the leg completes the circle back to center. Maintain a stable pelvis and engaged core. Switch sides after 20 sec. R: bend the working leg slightly. P: perform larger circles."),
  exercise("roll-ups", "Roll ups", 40,
    "On the mat, inhale to prepare as you stretch the arms above the ears and legs straight out. Exhale to bring shoulders up, lift the chest and slowly roll up to seated, reach fingertips forward, and slowly roll back down. R: bend knees with feet anchored on mat.")
];

function withTenSecondRests(prefix: string, moves: readonly ExerciseEntry[]): ClassEntry[] {
  return moves.flatMap((move, index) => [
    { ...move, id: `${move.id}-${prefix}` },
    ...(index < moves.length - 1 ? [rest(`${prefix}-rest-${index + 1}`, 10)] : [])
  ]);
}

const reversePlankSeries = (prefix: string): ClassEntry[] => [
  rest(`${prefix}-setup`, 60, "Sit on mat. Describe the next movements: go through all movements."),
  exercise(`${prefix}-reverse-plank-l-sit`, "Reverse plank to L-sit", 30,
    "Begin in reverse plank with hands and heels grounded, chest lifted, and sliders under heels of feet. Inhale to hold the reverse plank. Exhale as you bend at the hips and slide the legs toward an L-sit position, lifting through the core. Inhale as you return to reverse plank. R: hold static reverse plank without sliding."),
  exercise(`${prefix}-in-outs`, "In and outs with sliders", 30,
    "Sit up straight on mat, arms slightly bent behind the back, sliders under heels. Inhale to slide the legs out straight, leaning your torso back to counterbalance."),
  exercise(`${prefix}-glute-bridge`, "Glute bridge", 30,
    "Slowly lower down to mat, heels on sliders planted on mat. Exhale to lift the hips up and squeeze at the top, inhale to slowly lower back down.", undefined, "exercises/glute-bridge.svg"),
  exercise(`${prefix}-glute-bridge-curl`, "Glute bridge curl", 30,
    "Lie on back with heels on sliders. Lift hips into bridge. Exhale as you slide heels toward glutes while keeping hips lifted. Inhale as you slowly extend the legs back out.", undefined, "exercises/glute-bridge.svg"),
  exercise(`${prefix}-glute-bridge-pulse`, "Glute bridge pulse", 30,
    "Pulse at the top with hips lifted and heels grounded to mat.", undefined, "exercises/glute-bridge.svg")
];

const hiitLegRound = (round: "one" | "two"): ClassEntry[] => {
  const moves = [
    exercise(`reverse-lunge-${round}`, "Single-leg lunge with slider", 30,
      "Stand with one foot planted and the other on a slider behind you. Inhale as the sliding leg moves back into a reverse lunge while the front knee bends. Exhale as you press through the front heel and slide the back foot forward to return to standing. Maintain upright posture and engaged core."),
    exercise(`lunge-hold-${round}`, "Isometric hold single-leg lunge with slider with pulse", 30,
      "Lower into a lunge with the back foot on the slider. Hold while maintaining a strong core and upright torso. Exhale through small pulsing movements. R: static lunge hold without pulses. P: add overhead reach."),
    exercise(`side-lunge-${round}`, "Side lunge sliding out", 30,
      "Stand with one foot planted and the other on a slider to the side. Inhale as the sliding leg moves outward while the standing knee bends into a side lunge. Exhale as you engage the inner thigh and glute to pull the slider back to center standing tall."),
    exercise(`squat-side-lunge-${round}`, "Isometric hold squat with side lunge", 30,
      "Starting in a squat, inhale as the sliding leg moves outward while the standing knee bends into a side lunge. Exhale as you engage the inner thigh and glute to pull the slider back to center, staying low.")
  ];
  return moves.flatMap((move, index) => [move, ...(index < moves.length - 1 ? [rest(`${round}-hiit-rest-${index + 1}`, 10)] : [])]);
};

const plankPyramidMoves = [
  exercise("straight-leg-sweep", "Straight leg sweep", 40,
    "Slider under toes on working leg, in a high plank. Stay square to the mat as you slide the straight leg outward, perpendicular to the body; exhale to come back to center. R: do this on knees.", undefined, "exercises/high-plank.svg"),
  exercise("straight-leg-sweep-circles", "Straight leg sweep circles", 40,
    "Slider under toes on working leg, in a high plank. Exhale as you slide the straight leg inward toward the chest, inhale to circle the leg outward and slide back to center. R: do this on knees.", undefined, "exercises/high-plank.svg"),
  exercise("thread-leg-side", "Thread the leg and open to the side", 40,
    "In a high plank, slide working leg with pelvis parallel to the ground, lift the hand to open the side body, then slide the working leg straight under the body toward the side. Exhale to bring the hand back up and return to neutral. Repeat.", undefined, "exercises/high-plank.svg"),
  exercise("slider-mountain-climbers", "Sliders mountain climbers", 40,
    "Begin in a high plank with both feet on sliders, hands under shoulders. Exhale as you slide one knee toward the chest while keeping hips low and spine neutral. Inhale as you slide the leg back and alternate sides.", undefined, "exercises/high-plank.svg")
];

function sideBody(side: "right" | "left"): ClassEntry[] {
  return [
    exercise(`leg-lift-${side}`, "Leg lift", 40,
      "Lying down with straight legs, point top foot and lift up, lower down as you flex and repeat.", undefined, "exercises/side-lying-leg-series.svg"),
    exercise(`big-leg-circles-${side}`, "Big leg circles", 40,
      "Still on the same side, lift top leg and draw large circles."),
    exercise(`forward-back-kick-${side}`, "Forward and back kick", 40,
      "Flex foot, exhale to kick leg forward twice, inhale, point foot and extend it all the way back."),
    exercise(`small-circle-pulses-${side}`, "Small leg circle pulses", 40,
      "Draw small circles with lifted leg; 20 sec each direction."),
    exercise(`straight-leg-crunches-${side}`, "Straight leg crunches", 40,
      "Come up to forearm. Lower top foot on mat with the knee bent, keep lower foot straight, exhale to lift it toward the chest and crunch toward it with opposite arm behind the ear. Inhale to lower and repeat."),
    exercise(`tricep-side-push-up-${side}`, "Tricep side push-up", 40,
      "The hand behind ear comes down to mat, the forearm previously on mat comes across the belly. Exhale to push away from the mat using the triceps, inhale to lower down to mat. Repeat.")
  ];
}

export const hiitPilatesSlidersLegacy = {
  schemaVersion: 1,
  id: "hiit-pilates-sliders-v1",
  version: 1,
  title: "HIIT Pilates with Sliders V1",
  description:
    "Warm-up, abs, arms, glutes, lower-body HIIT, and cooldown. Equipment: mat and optional sliders.",
  phases: [
    {
      id: "warmup",
      name: "Warm-Up",
      items: [
        exercise("childs-pose", "Child's pose", 60,
          "Push hips back and stretch fingers toward the top of the mat.", undefined, "exercises/childs-pose.svg"),
        exercise("cat-cow", "Tabletop → cat and cows", 30,
          "Come to all fours starting with a neutral spine. Inhale to open through the chest; exhale as you round your back with control."),
        exercise("thread-needle", "Tabletop → downward-facing dog alternating", 30,
          "Still on all fours, lift one hand to open the side body, then thread the arm under your belly. Return to neutral and switch sides."),
        exercise("bird-dog-wrist-circles", "Tabletop → alternating bird dog → add wrist circles", 60,
          "From tabletop extend opposite arm and leg. Hold briefly, return to center and switch sides slowly. Add wrist circles while extended, keeping hips square and core engaged.")
      ]
    },
    {
      id: "abs-circuit",
      name: "Circuit #1: Abs",
      items: [
        ...withTenSecondRests("abs-round-one", absMoves),
        rest("abs-round-reset", 10, "Get ready to repeat."),
        ...withTenSecondRests("abs-round-two", absMoves)
      ]
    },
    { id: "upper-core-one", name: "Circuit #2: Upper Body and Core", items: reversePlankSeries("upper-one") },
    {
      id: "hiit-legs",
      name: "Circuit #3: HIIT — Legs Focused",
      items: [
        rest("hiit-setup", 60, "Come to standing. Start with left leg in front, slider under right leg behind."),
        ...hiitLegRound("one"),
        rest("hiit-side-switch", 10, "Switch sides."),
        ...hiitLegRound("two")
      ]
    },
    {
      id: "plank-pyramid",
      name: "Circuit #4: Upper Body and Core Pyramid",
      items: [
        ...plankPyramidMoves,
        { ...plankPyramidMoves[2]!, id: "thread-leg-side-return" },
        { ...plankPyramidMoves[1]!, id: "straight-leg-sweep-circles-return" },
        { ...plankPyramidMoves[0]!, id: "straight-leg-sweep-return" }
      ]
    },
    { id: "upper-core-two", name: "Circuit #5: Upper Body and Core", items: reversePlankSeries("upper-two") },
    {
      id: "side-body",
      name: "Circuit #6: Side Body",
      items: [
        rest("unfold-mat", 60, "Unfold mat and lie on one side."),
        ...sideBody("right"),
        rest("side-body-switch", 20, "Repeat on left side."),
        ...sideBody("left")
      ]
    },
    {
      id: "cooldown",
      name: "Cooldown",
      items: [
        rest("cooldown-transition", 30, "Come to knees."),
        exercise("seated-forward-fold", "Hamstring stretch → seated forward fold", 120,
          "Sit with legs extended forward. Inhale reaching arms overhead to lengthen the spine. Exhale as you hinge forward from the hips, reaching toward the feet while relaxing the neck and shoulders.", undefined, "exercises/seated-forward-fold.jpg"),
        exercise("roll-down", "Standing roll down", 30,
          "From seated, exhale as you slowly roll down to the mat one vertebra at a time. Inhale once fully lying down."),
        exercise("figure-four-twists", "Lying figure four → twist → switch sides", 240,
          "Lie on back with knees bent. Cross one ankle over opposite knee and gently pull the supporting leg toward the chest. From figure four, lower both legs toward the opposite side while keeping shoulders relaxed. Switch sides after 2 minutes."),
        exercise("overhead-arm-stretch", "Overhead arm stretch", 30,
          "Extend arms overhead along the mat. Inhale reaching through fingers and toes to lengthen the body. Exhale relaxing shoulders and allowing the chest to open."),
        exercise("shavasana", "Shavasana", 180,
          "Lie comfortably on back with arms relaxed at sides. Slow inhale through the nose, slow exhale through the mouth. Allow the body to fully relax and breathing to settle naturally. End: come to seated. Closing words: Thank you for coming today and working out early in the morning, amazing job! Don't forget to wipe down your mat and the sliders. Have a great spring break!!", undefined, "exercises/shavasana.jpg")
      ]
    }
  ]
} satisfies FitnessClassDefinition;

const adaptedSlidersCourse = normalizeSlidersCatalog(adaptLegacyClassToCatalog(hiitPilatesSlidersLegacy, {
  tags: builtInTags,
  courseTags: ["hiit-pilates", "mat", "sliders", "full-body"],
  exerciseTags: ["hiit-pilates", "mat", "sliders"]
}));

export const hiitPilatesSlidersCatalog = {
  catalog: adaptedSlidersCourse.catalog,
  course: {
    ...adaptedSlidersCourse.course,
    id: "hiit-pilates-sliders",
    version: 1,
    title: "HIIT Pilates with Sliders"
  }
};

export const hiitPilatesSlidersV1 = hiitPilatesSlidersLegacy;

export const hiitPilatesSliders = resolveCourseDefinition(
  hiitPilatesSlidersCatalog.catalog,
  hiitPilatesSlidersCatalog.course
);
