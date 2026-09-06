import type { ClassEntry, ExerciseEntry, FitnessClassDefinition } from "../domain/class-definition";
import { builtInTags } from "../catalog/tags";
import { normalizeBandCatalog } from "../catalog/normalize-band";
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
  shortDescription?: string,
  longDescription?: string
): ExerciseEntry => ({
  type: "exercise",
  id,
  name,
  durationSeconds,
  ...(shortDescription ? { shortDescription } : {}),
  ...(longDescription ? { longDescription } : {})
});

function withBreaks(prefix: string, seconds: number, moves: readonly ExerciseEntry[]): ClassEntry[] {
  return moves.flatMap((move, index) => [
    move,
    ...(index < moves.length - 1 ? [rest(`${prefix}-rest-${index + 1}`, seconds)] : [])
  ]);
}

const gluteSide = (side: "L" | "R"): ExerciseEntry[] => [
  exercise(`glute-bridge-${side.toLowerCase()}`, `Glute bridge (ball under ${side} foot)`, 45,
    `Ball underneath ${side} foot, opposite foot grounded.`,
    "Press through the feet and lift hips into a bridge. Squeeze glutes at the top and lower with control."),
  exercise(`glute-bridge-extension-${side.toLowerCase()}`, `Glute bridge leg extension (ball under ${side} foot)`, 45,
    "Stay lifted in the bridge.",
    "Extend leg out by rolling the ball away, then pull it back underneath you while keeping hips lifted and stable."),
  exercise(`glute-bridge-extension-lift-${side.toLowerCase()}`, `Glute bridge leg extension + lift extended leg (ball under ${side} foot)`, 45,
    "Maintain bridge position and continue controlling the ball.",
    "Perform the leg extension and add a controlled lift of the extended leg before returning. Keep hips square."),
  exercise(`extended-leg-pulses-${side.toLowerCase()}`, `Lift extended leg pulses (${side})`, 45,
    "Keep hips lifted and extended leg active.",
    "Hold the leg lifted and perform small controlled pulses without allowing the pelvis to rock.")
];

const lowerBodySide = (side: "L" | "R"): ClassEntry[] => [
  exercise(`lunge-onto-ball-${side.toLowerCase()}`, `Lunge onto ball (${side})`, 40,
    "Stand tall and position the working leg with the ball.",
    "Lower into a controlled lunge, keeping chest lifted and front knee tracking over the toes. Press back up through the standing leg."),
  exercise(`lunge-onto-ball-hinge-${side.toLowerCase()}`, `Lunge onto ball + hinge (${side})`, 40,
    "Stay in the lunge position.",
    "Lower into the lunge and add a hip hinge, sending hips back while keeping the spine long. Return upright with control."),
  exercise(`hinge-arm-pulses-${side.toLowerCase()}`, `Hinge, pulsing the arms (${side})`, 40,
    "Hold the hinged position and maintain a slight bend in the standing leg.",
    "Keep torso long and stable while performing small controlled arm pulses. Keep core engaged."),
  exercise(`hinge-knee-pulses-${side.toLowerCase()}`, `Hindge, pulsing the knee onto the ball (${side})`, 40,
    "Stay hinged and maintain the ball position.",
    "Keep hips back and pulse the working knee gently toward the ball while maintaining stability through the standing leg."),
  rest(`lower-to-mat-${side.toLowerCase()}`, 30,
    "Release the standing position and begin lowering to the mat. Reset and prepare for tabletop work."),
  exercise(`tabletop-leg-lift-${side.toLowerCase()}`, `Tabletop leg lift (ball under knee) (${side})`, 40,
    "Knee still on the ball, lower hands into a tabletop.",
    "Brace the core and lift the working leg while keeping hips square to the mat. Lower with control."),
  exercise(`tabletop-leg-lift-extension-${side.toLowerCase()}`, `Tabletop leg lift + leg extension (ball under knee) (${side})`, 40,
    "Remain in tabletop with ball underneath knee.",
    "Lift the leg and extend it outward, then bend it back in and return with control."),
  exercise(`rainbows-${side.toLowerCase()}`, `Rainbows (ball under knee) (${side})`, 40,
    "Stay in tabletop and lengthen the working leg.",
    "Sweep the working leg in an arc from one side of the mat to the other, keeping the torso as still as possible."),
  exercise(`tabletop-leg-lift-knee-crunch-${side.toLowerCase()}`, `Tabletop leg lift + knee in crunch (ball under knee) (${side})`, 40,
    "Return to tabletop position with core engaged.",
    "Lift the leg, then draw the knee underneath the torso toward the chest for a crunch. Extend back out and repeat."),
  exercise(`knee-crunch-${side.toLowerCase()}`, `Knee in crunch (ball under knee) (${side})`, 40,
    "Maintain tabletop position.",
    "Draw the knee underneath the body toward the chest while rounding through the abdominals, then extend back out."),
  exercise(`donkey-kicks-${side.toLowerCase()}`, `Donkey kicks (ball behind knee) (${side})`, 40,
    "Move ball behind knee and bend leg to hold it securely.",
    "Squeeze ball behind the knee and press the foot toward the ceiling. Keep hips square and avoid arching the lower back."),
  exercise(`fire-hydrants-${side.toLowerCase()}`, `Fire hydrants (ball behind knee) (${side})`, 40,
    "Keep ball secured behind the bent knee.",
    "Lift the knee out to the side while keeping hips and shoulders square to the mat. Lower with control."),
  rest(`lower-body-side-rest-${side.toLowerCase()}`, 30,
    side === "L" ? "Lower the working knee and reset. Prepare to repeat the entire sequence on the opposite side." : "Lower the working knee and reset.")
];

export const matPilatesBallLegacy = {
  schemaVersion: 1,
  id: "mat-pilates-ball-v1",
  version: 1,
  title: "Pilates Ball Mat Pilates V1",
  description: "A 60-minute full-body Mat Pilates class. Equipment: mat and Pilates ball.",
  visualsDisabled: true,
  phases: [
    {
      id: "warmup",
      name: "WARM-UP",
      items: [
        exercise("arm-stretch-across", "arm stretch across", 30, "Begin seated tall with shoulders relaxed.",
          "Bring one arm across the chest. Gently pull the arm toward the chest with the opposite arm. Keep shoulder down away from ear. Switch sides halfway."),
        exercise("arm-stretch-over-head", "Arm stretch over head", 30, "Release the arm and reach it overhead, bending at the elbow.",
          "Grabbing opposite elbow with opposite hand, gently pull elbow back and down. Switch sides halfway."),
        exercise("shoulder-rolls", "Shoulder rolls", 30, "Release arms down by sides and sit tall.",
          "Lift shoulders toward ears, roll them back and down, opening through the chest. Continue slowly with the breath."),
        exercise("seated-forward-fold", "seated forward fold", 30, "Sit with legs extended forward.",
          "Inhale reaching arms overhead to lengthen the spine. Exhale as you hinge forward from the hips, reaching toward the feet while relaxing the neck and shoulders."),
        exercise("straddle-side-bend", "Straddle side bend", 60, "Open legs into a comfortable wide straddle and sit tall.",
          "Reach one arm overhead and bend toward the opposite leg, keeping both sit bones grounded. Switch sides after 30 sec."),
        exercise("butterfly", "Butterfly", 60, "Bring soles of feet together and allow knees to open out to the sides.",
          "Sit tall, then gently hinge forward over the legs. Keep the spine long and allow the hips and inner thighs to relax."),
        exercise("90-90-stretch", "90-90 stretch", 60, "Bring both legs into a 90-90 position.",
          "Keep chest lifted and gently hinge toward the front leg to stretch the hips. Switch sides after 30 sec. End: introduce equipment, state its just an option.")
      ]
    },
    {
      id: "core",
      name: "CIRCUIT #1: CORE",
      items: [
        rest("core-setup", 60, "Grab Pilates ball and come to a seated position on the mat. Hydrate, set up equipment, and prepare for the core circuit."),
        ...withBreaks("core", 10, [
          exercise("bent-leg-half-roll-ups", "bent-legs half roll-ups (holding ball)", 40, "Sitting on mat with bent knees, soles of feet on mat. Hold ball in front of chest.", "Scoop the abdominals in and roll halfway toward the mat. Exhale and use the core to return to seated without using momentum."),
          exercise("roll-up", "roll-up", 40, "Extend legs long and hold the ball in both hands.", "Slowly roll the spine down one vertebra at a time. Exhale as you roll back up and reach forward over the legs."),
          exercise("in-and-outs", "In-and outs (ball under heels)", 40, "Place ball underneath the heels and lean torso slightly back with core engaged.", "Draw knees toward chest as the ball rolls toward you, then extend legs back out while maintaining abdominal control."),
          exercise("cross-body-crunch-r", "Cross body crunch (ball under R heel", 40, "Lie onto back with R heel supported by the ball.", "Crunch across the body, bringing opposite shoulder toward the R knee while keeping hips controlled. Slowly lower back down."),
          exercise("cross-body-crunch-l", "Cross body crunch (ball under L heel", 40, "Switch ball underneath L heel.", "Crunch across the body, bringing opposite shoulder toward the L knee. Control the return to the mat."),
          exercise("leg-lowers", "Leg lowers (ball between ankles)", 40, "Lie flat and place ball between ankles. Extend legs toward ceiling.", "Squeeze the ball and slowly lower both legs toward the mat while keeping lower back controlled. Use the core to lift legs back up."),
          exercise("passing-ball-scissors", "Passing the ball in siccisors", 40, "Stay lying on back and begin alternating legs in a scissor position.", "Continue alternating the legs while passing the ball through the opening between the legs, keeping the abdominals engaged."),
          exercise("crunch-left", "Crunch through the legs and over to the left (Holding the ball with right hand)", 40, "Bend knees and hold ball in right hand.", "Crunch through the center of the legs, then rotate toward the left. Return with control before repeating."),
          exercise("crunch-right", "Crunch through the legs and over to the right (Holding the ball with left hand)", 40, "Switch ball into left hand.", "Crunch through the center of the legs, then rotate toward the right. Return slowly without dropping the head.")
        ]),
        rest("core-end", 60, "Lower completely onto mat. Recover, breathe, and prepare for glutes.")
      ]
    },
    {
      id: "glutes",
      name: "CIRCUIT #2: GLUTES",
      items: [
        rest("glutes-setup", 60, "Lie on back with knees bent and place ball under R foot. Set shoulders and arms into the mat and prepare for bridges."),
        ...gluteSide("R"),
        rest("glutes-switch", 30, "Lower hips to the mat. Reset the ball and prepare to repeat on the opposite side."),
        ...gluteSide("L"),
        rest("glutes-end", 30, "Lower hips to the mat. Reset the ball.")
      ]
    },
    {
      id: "lower-body",
      name: "CIRCUIT #3: LOWER BODY",
      items: [
        rest("lower-body-setup", 60, "Come up to standing and position the ball for the first side. Hydrate and set up for the standing lower-body series."),
        ...lowerBodySide("L"),
        ...lowerBodySide("R")
      ]
    },
    {
      id: "upper-body",
      name: "CIRCUIT #4 - UPPER BODY",
      items: withBreaks("upper-body", 10, [
        exercise("bear-hold-rotations", "Bear hold rotations (ball between thighs)", 30, "Come into tabletop and place ball between thighs. Curl toes under and hover knees.", "Squeeze the ball and rotate through the torso/hips while maintaining the bear hold. Keep shoulders stacked over wrists."),
        exercise("bear-hold-rotations-push-up", "Bear hold rotations + pilates push-up (ball between thighs)", 30, "Stay in bear hold with ball between thighs.", "Perform the rotation, return to center, then add a controlled Pilates push-up before repeating."),
        exercise("side-plank-rotations", "Side plank rotations w arm lifts (ball between thighs)", 30, "Rotate from tabletop into side plank while maintaining control of the ball.", "Rotate through the torso, then open the chest and lift the top arm toward the ceiling. Switch sides halfway if desired."),
        exercise("swan-dive-variation", "Swan-dive variation (ball", 30, "Lower onto stomach. Hands holding the ball, extended straight infront of the hand.", "Roll ball back and forth lifting the chest nd head. Keep the back of the neck long and use the upper back rather than throwing the head backward."),
        exercise("superman", "Superman (holding the ball)", 30, "Stay lying on stomach and extend arms forward holding the ball.", "Lift arms, chest, and legs away from the mat. Hold briefly, then lower with control."),
        exercise("around-the-world", "Around the world", 30, "Hands holding the ball, extended straight in front of the hand.", "Lift head chest neck and shoulders, grab ball with right hand and pass it to the left behind the back. Continue passing around the body while maintaining the back extension.")
      ])
    },
    {
      id: "side-body",
      name: "CIRCUIT #5: SIDE BODY",
      items: withBreaks("side-body", 10, [
        exercise("clamshells", "clamshells", 40, "Ball behind top knee. Lie on side with knees bent and hips stacked.", "Keep feet together and open the top knee without rolling the hips backward. Close with control while maintaining tension on the ball."),
        exercise("kickback-top-leg", "Kickback top leg", 40, "Ball behind top knee.", "Keep the knee bent and press the top leg back from the hip. Keep pelvis stable and squeeze through the glute."),
        exercise("ball-between-feet-clamshells", "Ball between feet clamshels", 40, "Move ball between feet while remaining side-lying.", "Keep feet squeezing the ball while opening and closing the knees. Keep hips stacked."),
        exercise("ball-between-feet-v-ups", "Ball between feet V-ups", 20, "Stay side-lying with ball secured between feet.", "Lift the legs and torso toward each other into a side V-up, then lower with control."),
        exercise("crunch-top-hand", "Crunch top hand (holding the ball to knees", 40, "Take ball into top hand while staying on your side.", "Reach the ball toward the knees as you crunch the upper and lower body together. Lengthen back out with control."),
        exercise("side-kneel-leg-sweep-row", "side kneel leg sweep and renegade row", 40, "Come into a side-kneeling position with supporting hand grounded and weight in opposite hand.", "Sweep the top leg forward and back while adding a controlled renegade row with the working arm. Keep the torso stable."),
        exercise("side-kneel-leg-pulse", "side kneel leg pulse with ball under hand", 40, "Place ball underneath supporting hand and maintain side-kneeling position.", "Keep core braced and perform small pulses with the extended top leg without collapsing into the supporting shoulder."),
        exercise("side-bend-oblique-rotation", "side bend with oblique rotation", 40, "Stay in the side-kneeling position and lengthen through the side body.", "Reach into a side bend, then rotate the torso toward the mat to engage the obliques. Reopen and repeat.")
      ])
    },
    {
      id: "cooldown",
      name: "COOLDOWN",
      items: [
        exercise("childs-pose", "Child's pose", 90, "Push hips back and stretch fingers towards the top of the mat.", "Relax chest toward the mat, breathe into the back of the rib cage, and allow the spine and hips to release."),
        exercise("down-dog-paddle", "Downward-facing dog +paddle out legs", 90, "Come forward to tabletop, curl toes under, and press hips up and back.", "Lengthen through the spine and alternate bending one knee while pressing the opposite heel toward the mat."),
        exercise("cobra", "Cobra", 30, "Shift forward, lower to stomach, and place hands underneath shoulders.", "Gently press chest away from the mat while keeping shoulders down. Lengthen through the front of the body without forcing the lower back."),
        exercise("puppy-pose", "Puppy Pose", 30, "From cobra -> come back to all fours -> widen knees -> keep hips elevated -> lower forehead/chest.", "Reach arms forward, lengthen spine, and gently draw armpits toward the mat."),
        exercise("tabletop-open-left", "Tabletop hand opens to left", 30, "Return to tabletop and ground the right hand.", "Sweep left arm toward the ceiling and rotate through the upper back. Follow the hand with the eyes."),
        exercise("tabletop-open-right", "Tabletop hand opens to right", 30, "Return left hand to mat and ground it underneath shoulder.", "Sweep right arm toward the ceiling and rotate through the upper back. Keep hips steady."),
        exercise("roll-onto-back", "Roll onto back", 30, "Lower to one hip and gently roll onto the back.", "Settle shoulders and spine onto the mat and allow the body to relax."),
        exercise("hug-knees-in", "Hug-knees in", 30, "Bring both knees toward chest.", "Wrap arms around the legs and gently draw knees inward. Rock lightly side to side if comfortable."),
        exercise("happy-baby", "Happy baby", 60, "Open knees wide and reach hands toward feet or backs of thighs.", "Draw knees toward the sides of the rib cage while keeping the lower back relaxed. Gently rock side to side."),
        exercise("shavasana", "Shavasana", 180, "Lie comfortably on back with arms relaxed at sides.", "Slow inhale through the nose, slow exhale through the mouth. Allow the body to fully relax and breathing to settle naturally. End: come to seated. Closing words: Thank you for coming today and working out early in the morning, amazing job! Dont forget to wipe down your mat and the Pilates ball. Have a great spring break!!")
      ]
    }
  ]
} satisfies FitnessClassDefinition;

const adaptedBallCourse = normalizeBandCatalog(adaptLegacyClassToCatalog(matPilatesBallLegacy, {
  tags: builtInTags,
  courseTags: ["mat-pilates", "mat", "ball", "full-body"],
  exerciseTags: ["mat-pilates", "mat", "ball"]
}));

export const matPilatesBallCatalog = {
  catalog: adaptedBallCourse.catalog,
  course: {
    ...adaptedBallCourse.course,
    id: "mat-pilates-ball",
    version: 1,
    title: "Pilates Ball Mat Pilates"
  }
};

export const matPilatesBall = {
  ...resolveCourseDefinition(
    matPilatesBallCatalog.catalog,
    matPilatesBallCatalog.course
  ),
  visualsDisabled: true
} satisfies FitnessClassDefinition;
