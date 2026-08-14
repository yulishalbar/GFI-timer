import type { ClassEntry, ExerciseEntry, FitnessClassDefinition } from "../domain/class-definition";

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

const gluteSide = (side: "L" | "R"): ClassEntry[] => [
  exercise(`donkey-kick-${side.toLowerCase()}`, `Donkey kick (${side})`, 40,
    "Coming to tabletop, keeping the 90-degree bend in the knee, lift leg up as you resist the band and hold for a second at the top. Exhale as you squeeze at the top.", undefined, "exercises/quadruped-leg-series.svg"),
  exercise(`donkey-kick-crossover-${side.toLowerCase()}`, "Donkey kick + crossover", 40,
    `Donkey kick up, and then cross the ${side === "L" ? "left" : "right"} leg over the other leg, touching the knee down, and kick back up.`, undefined, "exercises/quadruped-leg-series.svg"),
  exercise(`donkey-kick-dog-crunch-${side.toLowerCase()}`, `Donkey kick + downward dog crunch in (${side})`, 40,
    "From tabletop, lift the bent leg at 90 degrees toward the ceiling. As you lower down, lift the grounded knee off the mat and straighten the leg, exhale to crunch the working leg in toward the chest, inhale and return to tabletop. Repeat.", undefined, "exercises/quadruped-leg-series.svg"),
  exercise(`leg-extensions-${side.toLowerCase()}`, `Leg extensions (${side})`, 40,
    "From tabletop, extend the straight back leg and lift toward the ceiling with control. Exhale at the top, holding for a second.", undefined, "exercises/quadruped-leg-series.svg"),
  exercise(`leg-pulses-${side.toLowerCase()}`, `Leg pulses (${side})`, 40,
    "Extend the straight back leg and pulse up and down.", undefined, "exercises/quadruped-leg-series.svg"),
  exercise(`rainbow-${side.toLowerCase()}`, `Rainbow (${side})`, 40,
    `Extend the ${side === "L" ? "left" : "right"} leg straight back, tap your toe to the outer side of your opposite foot, then lift your leg in a wide arc to tap the floor on the other side.`, undefined, "exercises/quadruped-leg-series.svg")
];

const standingLegSide = (side: "L" | "R"): ClassEntry[] => {
  const working = side === "L" ? "left" : "right";
  const moving = side === "L" ? "right" : "left";
  const suffix = side.toLowerCase();

  return [
    exercise(`static-single-leg-squat-${suffix}`, `Static single-leg squat (${side}), ${moving} heel lifts and lowers`, 30,
      `Lower to a squat and hold, ${working} leg planted on the ground, ${moving} heel lifts and lowers while staying in a static low squat.`),
    rest(`standing-legs-rest-one-${suffix}`, 10),
    exercise(`single-leg-squat-opener-${suffix}`, `Single leg squat (${side}) + leg opener`, 30,
      `Stay in a low squat with the ${moving} heel lifted. Open hips toward the ${moving} side, rotate the ${moving} knee outward and twist the ${moving} heel.`),
    exercise(`pulse-leg-openers-${suffix}`, `Pulse leg openers (${side})`, 30,
      `Stay in a low squat with the ${moving} heel lifted. Pulse out by adding small knee rotations outward.`),
    rest(`standing-legs-rest-two-${suffix}`, 10),
    exercise(`full-range-single-leg-squat-${suffix}`, `Full-range single-leg squat (${side}), ${moving} heel lifted`, 30,
      `${working[0]!.toUpperCase()}${working.slice(1)} leg planted on the ground, ${moving} heel lifted with toes on the mat, arms in prayer at chest height; squat down.`),
    exercise(`side-squat-curtsy-${suffix}`, `Side squat to curtsy lunge (${side})`, 30,
      `${working[0]!.toUpperCase()}${working.slice(1)} leg planted on the ground, ${moving} heel lifted with toes on the mat, arms in prayer at chest height. Bring the ${moving} leg far to the side and squat. Shift weight to the ${working} leg and sweep the ${moving} leg diagonally behind into a curtsy lunge, lowering straight down with hips square. Press through the ${working} heel to rise, step back to wide, then tap ${moving} toes to center. Repeat.`),
    exercise(`curtsy-pulse-${suffix}`, `Curtsy pulse (${side})`, 30,
      `Weight in the ${working} leg, with the ${moving} leg diagonally behind in a curtsy lunge; pulse up and down.`)
  ];
};

const sideBodyPyramid: ExerciseEntry[] = [
  exercise("clamshell-openers-left", "Clamshell openers (L)", 40,
    "Lie on the right side of the body facing the volleyball courts. Legs are stacked with a slight bend in the knees. Rotate the upper leg to open the clamshell and then close. Repeat.", undefined, "exercises/side-lying-leg-series.svg"),
  exercise("clamshell-lifts-left", "Clamshell lifts (L)", 40,
    "Staying in the clamshell position, lift the bent upper leg until you feel the activation in the glute and lower back down. Repeat.", undefined, "exercises/side-lying-leg-series.svg"),
  exercise("side-body-crunches-left", "Side-body crunches (L)", 40,
    "Staying in the clamshell position, crunch the upper leg in toward the right elbow, extend back and repeat.", undefined, "exercises/side-lying-leg-series.svg"),
  exercise("one-leg-banded-bridge-left", "One-leg banded bridge (L)", 40,
    "Roll onto back. Lift heel of right leg, with left knee bent and grounded to the mat. Press through the grounded heel with the right leg resisting the band, coming up bent at 90 degrees.", undefined, "exercises/glute-bridge.svg"),
  exercise("banded-bridge", "Bridge with band around thighs", 40,
    "Tuck pelvis under. With feet planted on the mat by the butt, exhale to lift the hips and squeeze the glutes at the top, inhale to lower and repeat.", undefined, "exercises/glute-bridge.svg"),
  exercise("one-leg-banded-bridge-right", "One-leg banded bridge (R)", 40, undefined, undefined, "exercises/glute-bridge.svg"),
  exercise("side-body-crunches-right", "Side-body crunches (R)", 40, undefined, undefined, "exercises/side-lying-leg-series.svg"),
  exercise("clamshell-lifts-right", "Clamshell lifts (R)", 40, undefined, undefined, "exercises/side-lying-leg-series.svg"),
  exercise("clamshell-openers-right", "Clamshell openers (R)", 40, undefined, undefined, "exercises/side-lying-leg-series.svg")
];

const sideBodyWithRests = sideBodyPyramid.flatMap((move, index) => [
  move,
  ...(index < sideBodyPyramid.length - 1 ? [rest(`side-body-rest-${index + 1}`, 10)] : [])
]);

export const matPilatesBand = {
  schemaVersion: 1,
  id: "mat-pilates-band",
  version: 2,
  title: "Mat Pilates with Band",
  description: "Warm-up, core, glutes, legs, upper body, and cooldown. Equipment: mat and band.",
  phases: [
    {
      id: "introduction",
      name: "Introduction",
      items: [exercise("class-introduction", "INTRODUCTION", 120,
        "Focus on the mind and body connection, stretch the total body, and work the upper body, core, and legs.")]
    },
    {
      id: "warmup",
      name: "Warm-Up",
      items: [
        exercise("childs-pose-side-stretches", "Child's pose with side stretches", 60,
          "Bring big toes together, knees wide apart, crawl the hands toward the top of the mat as you lower your hips toward the ankles and place your forehead on the mat. Side-body stretch: bring right hand to top-right corner and stack left hand on top. Inhale back to center; repeat on left.", undefined, "exercises/childs-pose.svg"),
        exercise("cat-cows", "Cat and cows", 60,
          "Come to an all-fours position starting with a neutral spine. Inhale as you initiate movement through the chest, lifting it toward the ceiling along with your gaze if it feels comfortable on the neck. Exhale as you round your back and lift the gaze toward the ceiling, not dumping into the lower back."),
        exercise("thread-needle", "Thread the needle", 60,
          "Still on all fours, pelvis parallel to the ground, lift right hand up, opening the right side of the body, then move right shoulder below left shoulder as you thread the right arm under your belly. Stay for a few seconds. Exhale to bring the hand back up and return to neutral. Switch sides."),
        exercise("alternating-bird-dog", "Alternating bird dog → add wrist circles", 60,
          "From tabletop extend right arm forward and left leg back. Hold briefly, then return to center and switch sides in a slow, controlled manner. Add wrist circles while extended, keeping hips square to the mat and core engaged."),
        exercise("down-dog-hovering-tabletop", "Downward dog to hovering tabletop", 60,
          "In neutral tabletop, lift knees off the ground. Shift hips back and lengthen through the upper body into downward-facing dog, take a breath, and shift hips back to hovering tabletop. End: sit back onto heels, come to seated, and place the band below the knees.")
      ]
    },
    {
      id: "core-circuit",
      name: "Circuit #1: Core",
      items: [
        rest("core-setup", 60, "Cue the next five exercises."),
        exercise("tabletop-crunch", "Tabletop crunch - band below knees", 40,
          "Tuck pelvis, imprint back onto mat and lift legs. With band right below knees, lift the head and shoulders, draw stomach in, exhale and curl up; inhale to lower."),
        exercise("hundredth", "Hundredth - band below knees", 60,
          "From the lifted curl, extend arms beside the body and flutter them up and down. Breathe in 2, 3, 4 and out 2, 3, 4."),
        rest("move-band-ankles-one", 10, "Move band down to ankles."),
        exercise("leg-lowers", "Leg lowers - band around ankles", 40,
          "Extend legs up, perpendicular to the body. Lower legs toward the floor, then lift back to tabletop. Option to curl up."),
        exercise("flutter-kicks", "Flutter kicks up and down - band around ankles", 40,
          "Back flat on the mat, inhale to prepare, exhale and flutter legs up and down, slowly lowering them toward the mat. Return slowly without fluttering and repeat."),
        rest("move-band-wrists", 10, "Move band to around wrists."),
        exercise("roll-ups", "Roll ups - band around wrists", 60,
          "Extend legs on the mat and arms straight overhead. Inhale to prepare. Exhale to bring shoulders up, lift the chest and slowly roll up to seated, reach fingertips forward, and slowly roll back down."),
        exercise("russian-twist", "Russian twist - band around wrists", 40,
          "From seated, bend knees toward the body, with the option to lift feet off the mat. Exhale and twist right, inhale to center, exhale and twist left, and repeat.")
      ]
    },
    {
      id: "glutes-circuit",
      name: "Circuit #2: Glutes",
      items: [
        rest("glutes-setup", 60, "Band around thighs. Cue the full circuit and remind everyone there are no breaks between exercises."),
        ...gluteSide("L"),
        rest("glutes-side-switch", 60, "Rest and switch sides."),
        ...gluteSide("R")
      ]
    },
    {
      id: "standing-legs",
      name: "Circuit #3: Legs Focused",
      items: [
        rest("standing-transition", 60, "Come to standing and cue the following six movements."),
        ...standingLegSide("L"),
        rest("standing-side-switch", 40, "Rest and switch sides."),
        ...standingLegSide("R")
      ]
    },
    {
      id: "lower-body-core-glutes",
      name: "Circuit #4: Lower Body, Core and Glutes",
      items: [
        rest("side-body-setup", 60, "Band on upper thighs. Lie on the right side facing the volleyball courts and cue the next exercises."),
        ...sideBodyWithRests
      ]
    },
    {
      id: "standing-upper-body-core",
      name: "Circuit #5: Standing Upper Body and Core",
      items: [
        rest("upper-body-setup", 60, "Cue the full circuit, starting on the right side."),
        exercise("standing-punch-outs", "Standing punch-outs", 40,
          "Stand with a slight bend in the knees, band around wrists. Start with hands close to the chest, punch out with the right hand and then the left."),
        exercise("band-hold-out", "Band hold out", 40, "Straighten hands out and hold the band extended."),
        exercise("band-pulse-out", "Band pulse out", 40, "Pulse the band while extended."),
        rest("upper-body-mid-rest", 10),
        exercise("straight-biceps-curl", "Straight biceps curl", 40,
          "Bring elbows tight to ribs and curl up with the band using triceps."),
        exercise("serve-platter", "Serve the platter", 40,
          "Start with elbows by ribs and palms facing the ceiling; extend arms up to chest height."),
        exercise("band-triceps-ups", "Band triceps ups (behind back)", 40,
          "Bring more of a bend to the knees. Bring the band across wrists behind the back and lift up and lower."),
        exercise("band-outward-extension", "Band outward extension (behind back)", 40,
          "With the band still behind the back, extend the band out and in."),
        rest("upper-body-round-two-setup", 60, "Reset and cue the second round."),
        exercise("standing-punch-outs-round-two", "Standing punch-outs", 40,
          "Stand with a slight bend in the knees, band around wrists. Start with hands close to the chest, punch out with the right hand and then the left."),
        exercise("band-hold-out-round-two", "Band hold out", 40, "Straighten hands out and hold the band extended."),
        exercise("band-pulse-out-round-two", "Band pulse out", 40, "Pulse the band while extended."),
        rest("upper-body-mid-rest-round-two", 10),
        exercise("straight-biceps-curl-round-two", "Straight biceps curl", 40,
          "Bring elbows tight to ribs and curl up with the band using triceps."),
        exercise("serve-platter-round-two", "Serve the platter", 40,
          "Start with elbows by ribs and palms facing the ceiling; extend arms up to chest height."),
        exercise("band-triceps-ups-round-two", "Band triceps ups (behind back)", 40,
          "Bring more of a bend to the knees. Bring the band across wrists behind the back and lift up and lower."),
        exercise("band-outward-extension-round-two", "Band outward extension (behind back)", 40,
          "With the band still behind the back, extend the band out and in.")
      ]
    },
    {
      id: "cooldown",
      name: "Cooldown",
      items: [
        rest("cooldown-transition", 30, "Drink water and stay standing."),
        exercise("standing-side-body-stretch", "Standing side-body stretch", 60,
          "Stand tall with feet about hip-width apart. Reach both arms overhead. Grab one wrist and gently lean to the opposite side. Return to center and switch."),
        exercise("hug-knees", "Hug knees in towards chest", 30),
        exercise("forward-fold", "Forward fold", 30,
          "Soften the knees and slowly hinge forward. Let the head, neck and arms relax. Option to hold opposite elbows and gently sway side to side."),
        exercise("down-dog-one", "Downward-facing dog", 20),
        exercise("crescent-lunge-left", "Crescent low lunge (L)", 30),
        exercise("down-dog-two", "Downward-facing dog", 20),
        exercise("crescent-lunge-right", "Crescent low lunge (R)", 30),
        exercise("down-dog-childs-pose-seated", "Downward-facing dog → child's pose → seated", 30, undefined, undefined, "exercises/childs-pose.svg"),
        exercise("windshield-wipers", "Bent-knee windshield wipers", 60),
        exercise("shavasana", "Shavasana", 180,
          "Lie comfortably on back with arms relaxed at sides. Slow inhale through the nose, slow exhale through the mouth. Allow the body to fully relax and breathing to settle naturally. End: come to seated. Closing words: Thank you for coming today and working out early in the morning, amazing job! Don't forget to wipe down your mat. See you next time!", undefined, "exercises/shavasana.jpg")
      ]
    }
  ]
} satisfies FitnessClassDefinition;
