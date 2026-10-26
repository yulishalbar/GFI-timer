import type { CourseDefinition, CourseExerciseItem, CourseItem, CoursePhaseDefinition, ExerciseSide } from "../domain/catalog-definition";
import { mergeExerciseCatalogs } from "../catalog/merge-catalogs";
import { resolveCourseDefinition } from "../domain/resolve-course";
import { matPilatesWeightsCatalog } from "./mat-pilates-weights";
import { matPilates0724Catalog } from "./mat-pilates-07-24";
import { matPilatesWeightsBlockPlankCatalog } from "./mat-pilates-weights-block-plank";
import { matPilatesBandCatalog } from "./mat-pilates-band";
import { weightsMobilityCatalog } from "../catalog/weights-mobility";
import { matPilatesRingCatalog } from "./mat-pilates-ring";
import { hiitPilatesSlidersCatalog } from "./hiit-pilates-sliders";
import { weightsStrengthCatalog } from "../catalog/weights-strength";

const catalog = mergeExerciseCatalogs(matPilatesWeightsCatalog.catalog, matPilates0724Catalog.catalog, matPilatesWeightsBlockPlankCatalog.catalog, matPilatesBandCatalog.catalog, weightsMobilityCatalog, weightsStrengthCatalog, { ...hiitPilatesSlidersCatalog.catalog, exercises: hiitPilatesSlidersCatalog.catalog.exercises.filter((exercise) => ["Leg lowers", "Reclined butterfly"].includes(exercise.name)) }, { ...matPilatesRingCatalog.catalog, exercises: matPilatesRingCatalog.catalog.exercises.filter((exercise) => ["Reclining tree pose", "Windshield wipers"].includes(exercise.name)) });

function move(id: string, name: string, durationSeconds: number, side?: ExerciseSide, shortDescription?: string): CourseExerciseItem {
  const matches = catalog.exercises.filter((exercise) => exercise.name === name && exercise.sideSupport === (side ? "left-right" : "none"));
  const exercise = matches.find((entry) => side && entry.id.endsWith(`-${side}`)) ?? matches[0];
  if (!exercise) throw new Error(`Missing pooled exercise: ${name}`);
  return { type: "exercise", id, exerciseId: exercise.id, exerciseVersion: exercise.version, durationSeconds,
    ...(side ? { side } : {}), ...(shortDescription ? { shortDescription } : {}) };
}

const rest = (id: string, durationSeconds: number, shortDescription?: string): CourseItem => ({
  type: "rest", id, name: "REST", durationSeconds, ...(shortDescription ? { shortDescription } : {})
});

function legSide(side: ExerciseSide): CourseItem[] {
  const back = side === "left" ? "right" : "left";
  return [
    move(`lunge-${side}`, "Reverse lunge", 40, back, `Hold light weights beside the hips. Step the ${back} foot back; the ${side} leg supports you. Return to standing with control.`),
    move(`lunge-pulse-${side}`, "Reverse-lunge pulse", 20, back, `Keep the ${back} foot behind and make small lunge pulses. Weights stay beside the hips.`),
    rest(`b-stance-setup-${side}`, 30, `Bring the ${back} toes closer for a staggered squat. Keep most of your weight through the ${side} foot.`),
    move(`b-stance-${side}`, "B-Stance Squats", 40, side, `Keep the ${side} foot planted and the ${back} heel lifted. Hold weights beside the hips, sit back into a squat, then stand.`),
    move(`b-stance-pulse-${side}`, "B-Stance Squats pulse", 20, side, "Keep the staggered stance and make small squat pulses with weights beside the hips."),
    move(`b-stance-curls-${side}`, "B-Stance Squats hold + biceps curls", 40, side, "Hold the staggered squat. Keep elbows close to the ribs as you curl and lower the light weights.")
  ];
}

function armRound(round: number): CourseItem[] {
  return [
    move(`front-raise-${round}`, "Front arm raises", 40, undefined, "Kneel tall on both knees with light weights. Lift arms forward to shoulder height with soft elbows, then lower with control."),
    move(`side-raise-${round}`, "Arm raises to the side", 40, undefined, "Stay kneeling tall and lift light weights out to the sides, then lower. Keep shoulders relaxed and ribs stacked."),
    move(`reverse-fly-${round}`, "Reverse fly", 40, undefined, "From kneeling, hinge slightly forward with a long spine. Open the light weights to the sides with soft elbows, then lower beneath the shoulders."),
    rest(`arm-reset-${round}`, 10, "Rest the weights beside the mat, return to tall kneeling, then pick them up for curls."),
    move(`curls-${round}`, "Biceps curls", 40, undefined, "Kneel tall holding one light weight in each hand. Keep elbows beside the ribs; curl and lower slowly."),
    move(`serve-platter-${round}`, "Serve the platter (out and to the side)", 40, undefined, "Kneel tall with a light weight in each hand, elbows bent and palms facing up. Reach forward, open the arms to the sides, then return with control. Keep shoulders relaxed and ribs stacked.")
  ];
}

function sideBody(side: ExerciseSide): CourseItem[] {
  const bottom = side === "left" ? "right" : "left";
  return [
    move(`leg-lift-${side}`, "Leg lift", 40, side, `Lie on the ${bottom} side. Use the top hand to hold one light weight against the outer ${side} thigh, above the knee. Lift and lower the top leg with control; keep gripping the weight.`),
    move(`leg-pulse-${side}`, "Pulse leg at the top", 20, undefined, `Keep the light weight held against the outer ${side} thigh with the top hand. Make small top-leg pulses without rolling the hips.`),
    move(`kicks-${side}`, "Forward and back kick", 40, side, `Keep the top hand gripping the light weight against the outer ${side} thigh above the knee. Sweep the top leg gently forward and back in a small range; keep the pelvis still.`),
    rest(`clamshell-setup-${side}`, 10, "Set the weight down while bending both knees. Pick it up and hold it against the upper outer thigh for clamshells."),
    move(`clamshell-${side}`, "Clamshell openers", 30, side, `Hold a light weight against the outer ${side} thigh with the top hand, above the knee. Keep feet together; open and close the top knee without rolling backward.`),
    move(`clamshell-lift-${side}`, "Clamshell lifts", 30, side, `Keep the weight gripped against the outer ${side} thigh. Lift and lower the whole bent top leg a small distance with hips stacked.`),
    rest(`inner-thigh-setup-${side}`, 10, `Set the weight down. Plant the bent top foot in front and extend the bottom ${bottom} leg. Hold the weight against the inner bottom thigh above the knee with the top hand.`),
    move(`inner-thigh-${side}`, "Bottom leg lifts", 30, bottom, `Keep the light weight held against the inner ${bottom} thigh with the top hand. Lift and lower the straight bottom leg; never balance the weight on the knee or ankle.`),
    move(`inner-thigh-pulse-${side}`, "Bottom leg pulses", 20, bottom, `Keep gripping the weight against the inner ${bottom} thigh above the knee. Make small bottom-leg pulses; set the weight beside the mat at the end.`)
  ];
}

function gluteSide(side: ExerciseSide): CourseItem[] {
  const cue = `Keep a light weight behind the bent ${side} knee throughout. Use no weight if it cannot be held securely.`;
  return [
    move(`donkey-kick-${side}`, "Donkey kick", 40, side, cue),
    move(`donkey-pulses-${side}`, "Donkey kick pulses with weight behind knee", 20, side, cue),
    rest(`glute-reset-${side}`, 15, "Lower the working knee to the mat and check the light weight is secure behind the bent knee before continuing."),
    move(`hydrant-${side}`, "Fire hydrant with weight behind knee", 40, side, cue),
    move(`hydrant-pulses-${side}`, "Fire hydrant pulses with weight behind knee", 20, side, cue),
    move(`crossover-${side}`, "Bent-knee crossover with weight behind knee", 40, side, cue),
    move(`knee-crunch-${side}`, "Crunch knee in with weight behind knee", 40, side, cue)
  ];
}

function familiarPhase(id: string): CoursePhaseDefinition {
  const phase = matPilatesWeightsCatalog.course.phases.find((entry) => entry.id === id);
  if (!phase) throw new Error(`Missing weights class section: ${id}`);
  return structuredClone(phase);
}

const course: CourseDefinition = {
  schemaVersion: 2,
  id: "mat-pilates-weights-02",
  version: 13,
  title: "Mat Pilates with Weights #2",
  description: "Mat Pilates with light hand weights in every main-circuit exercise. Flow from standing legs to kneeling arms, then abdominal work on the mat, bent-knee glute work with a weight behind the working knee, and side-lying leg work. Move slowly with controlled breathing. Removing the weights is always an option.",
  tags: ["mat-pilates", "mat", "weights", "full-body"],
  phases: [
    familiarPhase("introduction"),
    { id: "warmup", name: "Warm-up", items: [
      move("march", "March in place", 60),
      move("side-stretch-right", "Overhead side body stretch", 30, "right"),
      move("side-stretch-left", "Overhead side body stretch", 30, "left"),
      move("back-bend", "Back bend (hands behind ears)", 30),
      move("forward-fold", "Standing forward fold", 30),
      move("hip-openers", "Standing open the gate", 30, undefined, "Bend the knees and rise slowly from the forward fold. Once upright, lift a bent knee, open it gently outward, and place the foot down. Alternate sides without weights."),
      move("heel-raises", "Standing heel raises", 30),
      move("yogi-squat", "Yogi squat", 30),
      move("squat-twist-reach", "Squat Twist & reach", 30)
    ] },
    { id: "standing-lower-body", name: "Circuit #1: Standing Legs", items: [
      rest("standing-setup", 60, "Rise slowly from the squat, then pick up a light weight in each hand. Prepare for reverse lunges and staggered squats, left supporting leg first."),
      ...legSide("left"), rest("leg-side-switch", 30, "Switch to the right supporting leg."), ...legSide("right"),
      move("regular-squats", "Regular squats", 40, undefined, "Bring feet parallel and hip-width apart. Hold weights beside the hips; sit back into a squat and stand."),
      move("squat-pulses", "Regular squat pulses", 20, undefined, "Hold the weights beside the hips. Stay low and make small controlled pulses, keeping the chest lifted.")
    ] },
    { id: "upper-body-back", name: "Circuit #2: Kneeling Arms", items: [
      rest("arm-setup", 60, "Set weights beside the mat, lower one knee and then the other, and come to tall kneeling. Pick up the light weights for the arm sequence. Keep ribs over hips; sit comfortably if kneeling is uncomfortable."),
      ...armRound(1), rest("arm-round-switch", 30, "Rest the weights beside the mat and reset tall kneeling for round two."), ...armRound(2)
    ] },
    { id: "core-circuit", name: "Circuit #3: Abs", items: [
      rest("core-setup", 60, "Set weights beside the mat, sit down from kneeling, and lower onto your back. Pick up one light weight in the right hand for the first toe reach. Keep it close to the chest in both hands during leg lowers; use no weight if needed."),
      move("toe-reach-right", "Single arm toe reach with weight", 40, "right", "Hold a light weight in the right hand. Reach toward the raised toes, then lower with control."),
      move("leg-lowers-1", "Leg lowers", 20, undefined, "Hold one light weight close to the chest with both hands. Rest the head down and lower and lift the legs with control; bend the knees or reduce the range as needed."),
      move("toe-reach-left", "Single arm toe reach with weight", 40, "left", "Hold a light weight in the left hand. Reach toward the raised toes, then lower with control."),
      move("leg-lowers-2", "Leg lowers", 20, undefined, "Hold one light weight close to the chest with both hands. Rest the head down and lower and lift the legs with control; bend the knees or reduce the range as needed."),
      move("sit-up-right", "Sit up twist", 40, "right", "Hold one light weight close to the chest with both hands. Sit up and rotate toward the right, then roll down with control."),
      move("leg-lowers-3", "Leg lowers", 20, undefined, "Hold one light weight close to the chest with both hands. Rest the head down and lower and lift the legs with control; bend the knees or reduce the range as needed."),
      move("sit-up-left", "Sit up twist", 40, "left", "Hold one light weight close to the chest with both hands. Sit up and rotate toward the left, then roll down with control."),
      move("leg-lowers-4", "Leg lowers", 20, undefined, "Hold one light weight close to the chest with both hands. Rest the head down and lower and lift the legs with control; bend the knees or reduce the range as needed."),
      move("crunch-to-sit-up", "Crunch to sit up with weight", 40, undefined),
      move("leg-lowers-5", "Leg lowers", 20, undefined, "Hold one light weight close to the chest with both hands. Rest the head down and lower and lift the legs with control; bend the knees or reduce the range as needed."),
      move("russian-twists", "Russian twists", 40, undefined, "Hold one light weight close to the chest with both hands. Lean back slightly and rotate the chest from side to side with control."),
      move("seated-ab-rows-right", "Seated ab rows with weight", 40, "right", "Hold a light weight in the right hand. Lean back slightly, reach forward and row the right elbow toward the ribs, keeping the torso steady."),
      move("seated-ab-rows-left", "Seated ab rows with weight", 40, "left", "Hold a light weight in the left hand. Lean back slightly, reach forward and row the left elbow toward the ribs, keeping the torso steady."),
      move("seated-ab-rows-both", "Seated ab row with both arms", 20)
    ] },
    { id: "glutes-circuit", name: "Circuit #4: Bent-Knee Glutes", items: [
      rest("glute-setup", 60, "Finish the seated ab rows, set the weight down, and come onto hands and knees. Place a light weight behind the bent left knee. Keep the knee bent throughout; use no weight if it cannot be held securely."),
      ...gluteSide("left"),
      rest("glute-side-switch", 30, "Lower both knees to the mat. Remove the weight before switching sides, then place it behind the bent right knee."),
      ...gluteSide("right")
    ] },
    { id: "side-body-circuit", name: "Circuit #5: Side Body and Inner Thighs", items: [
      rest("side-body-setup", 60, "Lower both knees to the mat, remove the weight from behind the knee, and lie on your right side, left leg on top. Grip one light weight against the upper outer thigh with the top hand; keep it away from the knee and ankle."),
      ...sideBody("left"), rest("side-body-switch", 30, "Set the weight beside the mat before rolling onto the left side. Hold it against the outer right thigh with the top hand for the second side."), ...sideBody("right")
    ] },
    { id: "cooldown", name: "Cooldown", items: [
      move("open-book-right", "Side-lying open book", 30, "right", "Leave the weight beside the mat and stay on your left side. Bend both knees together and bring palms together in front. Slowly open the right arm and chest toward the ceiling, then close. No weights."),
      move("quad-right", "Side-lying quadriceps stretch", 30, "right"),
      move("reclined-tree-right", "Reclining tree pose", 30, "right", "Roll onto your back. Extend the left leg along the mat and let the bent right knee open gently to the right, resting the right foot along the inside of the left leg. No weights."),
      move("figure-four-right", "Figure four stretch", 30, "right"),
      rest("cooldown-side-switch", 15, "Release the figure four, bend both knees and roll gently onto your right side with the left arm and leg on top."),
      move("open-book-left", "Side-lying open book", 30, "left", "Lie on your right side, knees bent together and palms touching in front. Slowly open the left arm and chest toward the ceiling, then close. No weights."),
      move("quad-left", "Side-lying quadriceps stretch", 30, "left"),
      move("reclined-tree-left", "Reclining tree pose", 30, "left", "Roll onto your back. Extend the right leg along the mat and let the bent left knee open gently to the left, resting the left foot along the inside of the right leg. No weights."),
      move("figure-four-left", "Figure four stretch", 30, "left"),
      move("windshield-wipers", "Windshield wipers", 30, undefined, "Release the figure four and plant both feet with knees bent. Gently lower both knees from side to side within a comfortable range. No weights."),
      move("reclined-butterfly", "Reclined butterfly", 30, undefined, "Stay on your back, bring the soles of the feet together and let the knees open comfortably to the sides. Relax the shoulders; no weights."),
      move("shavasana", "Shavasana", 135, undefined, "Extend the legs comfortably along the mat and rest the arms beside you. Relax and breathe naturally. No weights.")
    ] }
  ]
};

export const matPilatesWeights02Catalog = { catalog, course };
// Like the block-and-weights source, use text guidance while its approximate
// arm rigs await accurate movement guides.
export const matPilatesWeights02 = { ...resolveCourseDefinition(catalog, course), visualsDisabled: true };
