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
  if (id === "fire-hydrant") return "quadruped-glute-lift";
  if (id === "donkey-kicks") return "donkey-kick";
  if (id === "donkey-kick-cross-over") return "donkey-kick-crossover";
  if (id.startsWith("lunge-rdl")) return "single-leg-deadlift-knee-tuck";
  if (id.startsWith("lunge-pulses")) return "reverse-lunge-pulse";
  if (id.startsWith("lunge")) return "reverse-lunge";
  if (id.startsWith("squat")) return "squat-to-stand";
  if (id.startsWith("bird-dog-pushups")) return "knee-push-ups";
  if (id.startsWith("bird-dog-triceps")) return "band-triceps-ups";
  if (id.startsWith("bird-dogs-pulse")) return "quadruped-leg-pulse";
  if (id.startsWith("bird-dogs")) return "bird-dog";
  if (id.startsWith("ninety-ninety-lunge") || id.startsWith("narrow-press")) return "reverse-lunge";
  if (id.startsWith("hinge-knee-taps")) return "single-leg-deadlift-knee-tuck";
  if (id.startsWith("b-stance")) return "static-single-leg-squat";
  if (id.startsWith("front-arm-raises") || id.startsWith("side-arm-raises")) return "arm-circles";
  if (id.startsWith("bent-over-reverse-fly")) return "superman-flutter";
  if (id.startsWith("biceps-curls")) return "banded-biceps-curl";
  if (id.startsWith("close-grip-push-up")) return "pilates-push-ups";
  if (id === "close-grip-high-plank") return "high-plank-hold";
  if (id.startsWith("tabletop-leg-lower")) return "one-leg-stretch";
  if (id.startsWith("tabletop-crunch")) return "criss-cross";
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
    exercise(`lunge-${side.toLowerCase()}`, `Lunge (${side}) (block under ${blockFoot} foot)`, 40),
    exercise(`lunge-rdl-${side.toLowerCase()}`, `Lunge to single leg rdl (${side}) (block under ${blockFoot} foot)`, 40),
    exercise(`lunge-runners-${side.toLowerCase()}`, `Lunge to high runner's lunge (${side})`, 40),
    exercise(`lunge-runners-arms-${side.toLowerCase()}`, `Lunge to high runner's lunge pulsing arms (${side})`, 40),
    exercise(`lunge-pulses-${side.toLowerCase()}`, `Lunge pulses (${side}) (block under ${blockFoot} foot)`, 30),
    exercise(`squat-${side.toLowerCase()}`, `Squat (${side}) (block under ${blockFoot} foot)`, 40)
  ];
};

const coreGlutesSide = (side: "L" | "R"): ClassEntry[] => {
  const knee = side === "L" ? "right" : "left";
  return [
    exercise(`bird-dogs-${side.toLowerCase()}`, `Bird Dogs (${side})`, 45),
    exercise(`bird-dogs-pulse-${side.toLowerCase()}`, `Bird Dogs Pulse It Out (${side})`, 45),
    exercise(`bird-dog-pushups-${side.toLowerCase()}`, `Bird Dog Pushups (${side})`, 45),
    exercise(`bird-dog-triceps-${side.toLowerCase()}`, `Bird dog ${knee} arm triceps extension`, 45),
    rest(`bird-dog-rest-${side.toLowerCase()}`, 15),
    exercise(`ninety-ninety-lunge-${side.toLowerCase()}`, `90/90 Lunge Narrow Press (${side})`, 30,
      `Stepping the ${knee} foot forward into a lunge stance`),
    exercise(`narrow-press-knee-tap-${side.toLowerCase()}`, `Narrow Press + Knee to Block Tap (${side})`, 30),
    exercise(`hinge-knee-taps-${side.toLowerCase()}`, `2-Count Hinge + Knee to Block Taps (weights behind head) (${side})`, 30),
    exercise(`b-stance-squats-${side.toLowerCase()}`, `B-Stance Squats (${side})`, 10),
    exercise(`b-stance-pulse-${side.toLowerCase()}`, `B-Stance Squats pulse (${side})`, 30),
    exercise(`b-stance-hold-curls-${side.toLowerCase()}`, `B-Stance Squats hold + biceps curls (${side})`, 30)
  ];
};

const upperBodyMoves = [
  exercise("front-arm-raises", "Front arm raises", 30),
  exercise("side-arm-raises", "Arm raises to the side", 30),
  exercise("bent-over-reverse-fly", "Bent Over Dumbbell Reverse Fly", 30),
  exercise("biceps-curls", "Biceps curls", 30),
  exercise("close-grip-push-up", "Close-Grip Push-Up hand on block", 30),
  exercise("close-grip-high-plank", "Close-grip high plank", 30)
];

const upperBodyReturnMoves = [
  exercise("close-grip-push-up-return", "Close-Grip Push-Up hand on block", 30),
  exercise("biceps-curls-return", "Biceps curls", 30),
  exercise("bent-over-reverse-fly-return", "Bent Over Dumbbell Reverse Fly", 30),
  exercise("side-arm-raises-return", "Arm raises to the side", 30),
  exercise("front-arm-raises-return", "Front arm raises", 30)
];

function withTenSecondRests(prefix: string, moves: readonly ExerciseEntry[]): ClassEntry[] {
  return moves.flatMap((move, index) => [
    move,
    ...(index < moves.length - 1 ? [rest(`${prefix}-rest-${index + 1}`, 10)] : [])
  ]);
}

export const matPilatesWeightsBlockLegacy = {
  schemaVersion: 1,
  id: "mat-pilates-weights-block-v1",
  version: 2,
  title: "Block + Weights (3 lbs) Mat Pilates V1",
  description: "Focus on mind and body connection, stretch total body, and work full body. Equipment: mat, blocks, and 3 lb weights.",
  phases: [
    {
      id: "warmup",
      name: "WARM-UP",
      items: [
        exercise("childs-pose", "Child's pose", 60,
          "Push hips back and stretch fingers towards the top of the mat. Warm up the spine, stretch the hamstrings, thighs and abdominals"),
        exercise("tabletop-cat-cows", "Table top → cat and cows", 30,
          "Come to all 4s position starting with a neutral spine, inhale as you initiate movement through the chest, lifting it towards the ceiling, along with you gaze if it feels comfortable on the neck. exhale as you round your back and lift the gaze towards the ceiling, not dumping lower back. Stretch arms, back, and abdominals"),
        exercise("tabletop-down-dog-alternating", "Table top → downwards facing dog alternating", 30,
          "Still in all 4s, pelvis parallel to the ground, lift right hand up, opening up the right side of the body, then move right shoulder below left shoulder as you thread the right arm under your belly, stay in this pose for a few seconds. Exhale to bring hand back up and then come back to neutral. Switch sides. Side body stretch"),
        exercise("crescent-half-split-left", "Crescent Low Lunge (L) → half split (L)", 60),
        exercise("downward-facing-dog", "Downward facing dog", 10),
        exercise("crescent-half-split-right", "Crescent Low Lunge (R) → half split (R)", 60,
          "End: introduce equipment, state its just an option. Set block horiozntally at the front of the mat.")
      ]
    },
    {
      id: "side-body",
      name: "Circuit #1: side body",
      items: [
        exercise("mermaid-dip", "Mermaid dip (weight chest height in hands)", 40,
          "Bent on left leg, right leg extendeted to the side, block in hands at chest height, dip towards left side"),
        exercise("mermaid-dip-hold", "Mermaid dip hold, T-arms", 40),
        exercise("t-arms-pulse", "T-arms pulse", 20),
        rest("side-body-rest-one", 10),
        exercise("half-moon-lift-lower", "Half moon lift and lower (twisting top hand towards the mat as leg lowers)", 40,
          "Place bottom hand on the block"),
        exercise("half-moon-crunch", "Half moon crunch", 40, "Hinge at hips"),
        rest("side-body-rest-two", 10),
        exercise("fire-hydrant", "Fire hydrant", 40, "Same hand’s forearms on block, weight behind knee"),
        exercise("donkey-kicks", "Donkey kicks", 40),
        exercise("donkey-kick-cross-over", "Donkey kick cross over", 40)
      ]
    },
    {
      id: "lower-body",
      name: "Circuit #2: lower body",
      items: [
        rest("lower-body-setup", 60, "Describe the next movements: Go through all movements"),
        ...lowerBodySide("L"),
        rest("lower-body-side-switch", 30, "Repeat on right"),
        ...lowerBodySide("R")
      ]
    },
    {
      id: "core-glutes-upper-body",
      name: "Circuit #3: Core + glutes + upper body",
      items: [
        rest("core-glutes-setup", 60, "Come to tabletop w right knee on block. Describe the next movements: Start with left leg infront, slider under right leg behind"),
        ...coreGlutesSide("L"),
        ...coreGlutesSide("R")
      ]
    },
    {
      id: "upper-body",
      name: "Circuit #4: upper body",
      items: [
        ...withTenSecondRests("upper-body", upperBodyMoves),
        ...withTenSecondRests("upper-body-return", upperBodyReturnMoves)
      ]
    },
    {
      id: "core",
      name: "Circuit #5: core",
      items: [
        rest("core-setup", 60, "Sit on mat. Describe the next movements: Go through all movements"),
        exercise("tabletop-leg-lower-left", "Tabletop leg lower (L) crunch (right hand holds block to right leg)", 30,
          "Exhale, lift head neck and shoulders while lowering left leg towards the mat"),
        exercise("tabletop-crunch-block-left", "Tabletop leg lower (L) crunch towards block (right hand holds block to right leg)", 30,
          "Exhale, crunch left elbow towards the block, return head down towards the mat while lowering left leg down"),
        exercise("tabletop-crunch-hold-left", "Tabletop leg lower (L) crunch hold (L)", 30),
        rest("core-side-switch", 15, "Switch sides"),
        exercise("tabletop-leg-lower-right", "Tabletop leg lower (R) crunch (right hand holds block to right leg)", 40),
        exercise("tabletop-crunch-block-right", "Tabletop leg lower (R) crunch towards block (right hand holds block to right leg)", 40),
        exercise("tabletop-crunch-hold-right", "Tabletop leg lower (R) crunch hold (R)", 40),
        exercise("tabletop-leg-lower-right-repeat", "Tabletop leg lower (R) crunch (right hand holds block to right leg)", 40),
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
        rest("cooldown-transition", 30, "Hug knees in"),
        exercise("windshield-wipers", "Windshield wipers", 60,
          "Hamstring flexibility, posterior chain release, gentle spinal decompression"),
        exercise("figure-four-twist", "Lying figure four → lower ground, twist body towards opposite side → switch sides", 240,
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
    title: "Block + Weights (3 lbs) Mat Pilates"
  }
};

export const matPilatesWeightsBlock = resolveCourseDefinition(
  matPilatesWeightsBlockCatalog.catalog,
  matPilatesWeightsBlockCatalog.course
);
