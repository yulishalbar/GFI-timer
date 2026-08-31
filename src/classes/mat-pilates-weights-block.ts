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

function rigForExercise(id: string): string | undefined {
  if (id === "childs-pose") return "childs-pose";
  if (id === "tabletop-cat-cows") return "cat-cow";
  if (id === "tabletop-down-dog-alternating") return "tabletop-down-dog-alternating";
  if (id.startsWith("crescent-half-split")) return "crescent-lunge";
  if (id === "downward-facing-dog") return "down-dog";
  if (id.startsWith("mermaid") || id.startsWith("t-arms")) return "standing-side-stretch";
  if (id.startsWith("half-moon")) return "single-leg-deadlift-knee-tuck";
  if (id.startsWith("fire-hydrant-pulses")) return "quadruped-leg-pulse";
  if (id.startsWith("fire-hydrant")) return "quadruped-glute-lift";
  if (id.startsWith("donkey-kick-cross-over")) return "donkey-kick-crossover";
  if (id.startsWith("donkey-kicks")) return "donkey-kick";
  if (id.startsWith("lunge-rdl")) return "single-leg-deadlift-knee-tuck";
  if (id.startsWith("lunge-pulses")) return "reverse-lunge-pulse";
  if (id.startsWith("lunge")) return "reverse-lunge";
  if (id.startsWith("squat") || id === "regular-squats") return "squat-to-stand";
  if (id.startsWith("single-leg-pike")) return "high-plank-alternating-crunch";
  if (id.startsWith("bird-dog-triceps")) return "band-triceps-ups";
  if (id.startsWith("bird-dogs")) return "bird-dog";
  if (id.startsWith("ninety-ninety-lunge") || id.startsWith("narrow-press")) return "reverse-lunge";
  if (id.startsWith("hinge-knee-taps")) return "single-leg-deadlift-knee-tuck";
  if (id.startsWith("b-stance")) return "static-single-leg-squat";
  if (id.startsWith("front-arm-raises") || id.startsWith("side-arm-raises")) return "arm-circles";
  if (id.startsWith("bent-over-reverse-fly")) return "superman-flutter";
  if (id === "serve-the-platter") return "serve-the-platter";
  if (id.startsWith("close-grip-push-up")) return "pilates-push-ups";
  if (id === "close-grip-high-plank") return "high-plank-hold";
  if (id === "tabletop-toe-taps") return "toe-taps-both";
  if (id === "toe-touches-block" || id === "crunches-block") return "crunch";
  if (id === "cacoons") return "slider-in-outs";
  if (id === "windshield-wipers") return "windshield-wipers";
  if (id === "figure-four-twist") return "figure-four-twist";
  if (id === "reclined-butterfly") return "seated-straddle";
  if (id === "sleeping-tiger") return "supine-overhead-arm-stretch";
  return undefined;
}

const exercise = (
  id: string,
  name: string,
  durationSeconds: number,
  longDescription?: string
): ExerciseEntry => {
  const rig = rigForExercise(id);
  return {
    type: "exercise",
    id,
    name,
    durationSeconds,
    ...(rig ? { rig } : {}),
    ...(longDescription ? { longDescription } : {})
  };
};

const lowerBodySide = (side: "L" | "R"): ExerciseEntry[] => {
  const blockFoot = side === "L" ? "right" : "left";
  return [
    exercise(`lunge-${side.toLowerCase()}`, `Lunge (block under ${blockFoot} foot) (${side})`, 30),
    exercise(`lunge-rdl-${side.toLowerCase()}`, `Lunge to single leg rdl (block under ${blockFoot} foot) (${side})`, 30),
    exercise(`lunge-pulses-${side.toLowerCase()}`, `Lunge pulses (block under ${blockFoot} foot) (${side})`, 30)
  ];
};

const coreGlutesSide = (side: "L" | "R"): ExerciseEntry[] => {
  const knee = side === "L" ? "right" : "left";
  return [
    exercise(`bird-dogs-${side.toLowerCase()}`, `Bird Dogs (${side})`, 40),
    exercise(`bird-dog-triceps-${side.toLowerCase()}`, `Bird dog ${knee} arm triceps extension (${side})`, 40),
    exercise(`single-leg-pike-${side.toLowerCase()}`, `Single leg pike (${side})`, 40),
    exercise(`ninety-ninety-lunge-${side.toLowerCase()}`, `90/90 Lunge Narrow Press (${side})`, 40,
      `Stepping the ${knee} foot forward into a lunge stance`),
    exercise(`narrow-press-knee-tap-${side.toLowerCase()}`, `Narrow Press + Knee to Block Tap (${side})`, 40),
    exercise(`hinge-knee-taps-${side.toLowerCase()}`, `2-Count Hinge + Knee to Block Taps (weights behind head) (${side})`, 40),
    exercise(`b-stance-squats-${side.toLowerCase()}`, `B-Stance Squats (${side})`, 40),
    exercise(`b-stance-pulse-${side.toLowerCase()}`, `B-Stance Squats pulse (${side})`, 20),
    exercise(`b-stance-hold-curls-${side.toLowerCase()}`, `B-Stance Squats hold + biceps curls (${side})`, 40)
  ];
};

const upperBodyMoves = [
  exercise("front-arm-raises", "Front arm raises", 30),
  exercise("side-arm-raises", "Arm raises to the side", 30),
  exercise("bent-over-reverse-fly", "Bent Over Dumbbell Reverse Fly", 30),
  exercise("serve-the-platter", "Serve the platter", 30),
  exercise("close-grip-push-up", "Close-Grip Push-Up hand on block", 30),
  exercise("close-grip-high-plank", "Close-grip high plank", 30)
];

function withRests(prefix: string, seconds: number, moves: readonly ExerciseEntry[]): ClassEntry[] {
  return moves.flatMap((move, index) => [
    move,
    ...(index < moves.length - 1 ? [rest(`${prefix}-rest-${index + 1}`, seconds)] : [])
  ]);
}

function coreGlutesWithRests(side: "L" | "R"): ClassEntry[] {
  return coreGlutesSide(side).flatMap((move, index, moves) => [
    move,
    ...(index < moves.length - 1 && index !== 6 && index !== 7
      ? [rest(`core-glutes-${side.toLowerCase()}-rest-${index + 1}`, 15)]
      : [])
  ]);
}

const sideBody = (side: "L" | "R"): ClassEntry[] => [
  exercise(`mermaid-dip-${side.toLowerCase()}`, `Mermaid dip (weight chest height in hands) (${side})`, 40,
    side === "L"
      ? "Bent on left leg, right leg extendeted to the side, block in hands at chest height, dip towards left side"
      : "Bent on right leg, left leg extended to the side, block in hands at chest height, dip towards right side"),
  exercise(`mermaid-dip-hold-${side.toLowerCase()}`, `Mermaid dip hold, T-arms (${side})`, 40),
  exercise(`t-arms-pulse-${side.toLowerCase()}`, `T-arms pulse (${side})`, 20),
  rest(`side-body-${side.toLowerCase()}-rest-one`, 10),
  exercise(`half-moon-lift-lower-${side.toLowerCase()}`, `Half moon lift and lower (twisting top hand towards the mat as leg lowers) (${side})`, 40,
    "Place bottom hand on the block"),
  exercise(`half-moon-crunch-${side.toLowerCase()}`, `Half moon crunch (${side})`, 40, "Hinge at hips"),
  rest(`side-body-${side.toLowerCase()}-rest-two`, 10),
  exercise(`fire-hydrant-${side.toLowerCase()}`, `Fire hydrant (${side})`, 40, "Same hand’s forearms on block, weight behind knee"),
  exercise(`fire-hydrant-pulses-${side.toLowerCase()}`, `Fire hydrant pulses (${side})`, 20),
  exercise(`donkey-kicks-${side.toLowerCase()}`, `Donkey kicks (${side})`, 40),
  exercise(`donkey-kick-cross-over-${side.toLowerCase()}`, `Donkey kick cross over (${side})`, 40)
];

export const matPilatesWeightsBlockLegacy = {
  schemaVersion: 1,
  id: "mat-pilates-weights-block-v1",
  version: 6,
  title: "Block + Weights Mat Pilates V1",
  description: "Focus on mind and body connection, stretch total body, and work full body. Equipment: mat, blocks, and 3 lb weights.",
  visualsDisabled: true,
  phases: [
    {
      id: "introduction",
      name: "INTRODUCTION",
      items: [exercise("introduction", "INTRODUCTION", 120,
        "Focus on mind and body connection, stretch total body, and work full body. Introduce the mat, blocks, and 3 lb weights.")]
    },
    {
      id: "warmup",
      name: "WARM-UP",
      items: [
        exercise("childs-pose", "Child's pose", 60,
          "Push hips back and stretch fingers towards the top of the mat. Warm up the spine, stretch the hamstrings, thighs and abdominals"),
        exercise("tabletop-cat-cows", "Table top → cat and cows", 60,
          "Come to all 4s position starting with a neutral spine, inhale as you initiate movement through the chest, lifting it towards the ceiling, along with you gaze if it feels comfortable on the neck. exhale as you round your back and lift the gaze towards the ceiling, not dumping lower back. Stretch arms, back, and abdominals"),
        exercise("tabletop-down-dog-alternating", "Table top → downwards facing dog alternating", 30,
          "Still in all 4s, pelvis parallel to the ground, lift right hand up, opening up the right side of the body, then move right shoulder below left shoulder as you thread the right arm under your belly, stay in this pose for a few seconds. Exhale to bring hand back up and then come back to neutral. Switch sides. Side body stretch"),
        exercise("crescent-half-split-left", "Crescent Low Lunge (L) → half split (L)", 60),
        exercise("downward-facing-dog", "Downward facing dog", 10),
        exercise("crescent-half-split-right", "Crescent Low Lunge (R) → half split (R)", 60,
          "End: introduce equipment, state its just an option. Set block horiozntally at the front of the mat."),
        rest("warmup-circuit-preview", 60, "Go over the first circuit.")
      ]
    },
    {
      id: "side-body",
      name: "Circuit #1: side body",
      items: [
        ...sideBody("L"),
        rest("side-body-side-switch", 30, "Switch sides."),
        ...sideBody("R")
      ]
    },
    {
      id: "lower-body",
      name: "Circuit #2: lower body",
      items: [
        rest("lower-body-setup", 60, "Describe the next movements: Go through all movements"),
        ...withRests("lower-body-left", 10, lowerBodySide("L")).filter((item) =>
          item.id !== "lower-body-left-rest-1"
        ),
        rest("lower-body-side-switch", 30, "Repeat on right"),
        ...withRests("lower-body-right", 10, lowerBodySide("R")),
        rest("lower-body-squat-setup", 10),
        exercise("regular-squats", "Regular squats", 30)
      ]
    },
    {
      id: "core-glutes-upper-body",
      name: "Circuit #3: Core + glutes + upper body",
      items: [
        rest("core-glutes-setup", 60, "Come to tabletop w right knee on block. Describe the next movements: Start with left leg infront, slider under right leg behind"),
        ...coreGlutesWithRests("L"),
        rest("core-glutes-side-switch", 30, "Switch sides."),
        ...coreGlutesWithRests("R")
      ]
    },
    {
      id: "upper-body",
      name: "Circuit #4: upper body",
      items: withRests("upper-body", 10, upperBodyMoves)
    },
    {
      id: "core",
      name: "Circuit #5: core",
      items: [
        rest("core-setup", 60, "Sit on mat. Describe the next movements: Go through all movements"),
        rest("block-between-feet", 30, "Place block between feet"),
        exercise("tabletop-toe-taps", "Tabletop toe taps", 40),
        exercise("toe-touches-block", "Toe touches grabbing block", 40),
        exercise("cacoons", "Cacoons", 40),
        exercise("crunches-block", "Crunches (holding block)", 40),
        rest("core-end-rest", 60)
      ]
    },
    {
      id: "cooldown",
      name: "Cooldown",
      items: [
        exercise("windshield-wipers", "Windshield wipers", 60,
          "Hamstring flexibility, posterior chain release, gentle spinal decompression"),
        exercise("figure-four-twist", "Lying figure four → lower ground, twist body towards opposite side → switch sides", 180,
          "Lie on back with knees bent. Cross one ankle over opposite knee. Inhale to prepare. Exhale as you gently pull the supporting leg toward the chest, stretching the hip and glutes. → use biceps for deeper stretch. From figure four position, lower both legs toward the opposite side. Inhale to lengthen the spine. Exhale as you rotate into the twist while keeping shoulders relaxed on the mat. Glute and piriformis stretch, hip mobility, lower back relief"),
        exercise("reclined-butterfly", "Reclined butterfly (block under glutes)", 30),
        exercise("sleeping-tiger", "Sleeping tiger (block under glutes)", 60,
          "Extend arms overhead along the mat. Inhale reaching through fingers and toes to lengthen the body. Exhale relaxing shoulders and allowing the chest to open. Full-body lengthening, shoulder mobility, relaxation"),
        {
          ...exercise("shavasana", "Shavasana", 180,
            "Lie comfortably on back with arms relaxed at sides. Slow inhale through the nose, slow exhale through the mouth. Allow the body to fully relax and breathing to settle naturally. Relaxing the mind. End: come to seated. Closing words: Thank you for coming today and working out early in the morning, amazing job! Dont forget to wipe down your mat and the sliders. Have a great spring break!!"),
          illustration: "exercises/shavasana.jpg"
        }
      ]
    }
  ]
} satisfies FitnessClassDefinition;

const adaptedWeightsBlockCourse = normalizeBandCatalog(adaptLegacyClassToCatalog(
  matPilatesWeightsBlockLegacy,
  {
    tags: builtInTags,
    courseTags: ["mat-pilates", "mat", "block", "weights", "full-body"],
    exerciseTags: ["mat-pilates", "mat", "block", "weights"]
  }
));

export const matPilatesWeightsBlockCatalog = {
  catalog: adaptedWeightsBlockCourse.catalog,
  course: {
    ...adaptedWeightsBlockCourse.course,
    id: "mat-pilates-weights-block",
    title: "Block + Weights Mat Pilates"
  }
};

export const matPilatesWeightsBlock = {
  ...resolveCourseDefinition(
    matPilatesWeightsBlockCatalog.catalog,
    matPilatesWeightsBlockCatalog.course
  ),
  visualsDisabled: true
} satisfies FitnessClassDefinition;
