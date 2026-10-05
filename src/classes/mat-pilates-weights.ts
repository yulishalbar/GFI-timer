import type { CourseCircuitChild, CourseDefinition, CourseItem, ExerciseCatalog, CourseExerciseItem, ExerciseDefinition } from "../domain/catalog-definition";
import { resolveCourseDefinition } from "../domain/resolve-course";
import { matPilates0731Catalog } from "./mat-pilates-07-31";

import { matPilates0724Catalog } from "./mat-pilates-07-24";
import { matPilatesWeightsBlockPlankCatalog } from "./mat-pilates-weights-block-plank";

function existingExercise(name: string): ExerciseDefinition {
  const exercise = [...matPilates0724Catalog.catalog.exercises, ...matPilatesWeightsBlockPlankCatalog.catalog.exercises].find((item) => item.name === name);
  if (!exercise) throw new Error(`Missing pooled exercise ${name}`);
  return exercise;
}

const equipmentCue = "Use a pair of light hand weights that allow controlled movement; every exercise can also be done without weights. Keep weights beside the mat, outside your hand and foot placements.";

function weightCue(id: string): string | undefined {
  if (id.startsWith("squat-arms-")) {
    return "Hold one light weight in each hand. Raise the arms with control as you squat; soften the elbows and keep shoulders relaxed. Lower the weights beside the hips as you stand.";
  }
  if (id.startsWith("squat-hold-leg-lift-")) {
    return "Continue holding the light weights with the arms lifted. Keep the pelvis square as the working leg lifts back. Set the weights down if balance or shoulder control changes.";
  }
  if (id.startsWith("squat-hold-")) {
    return "Keep the light weights in the lifted arms during the squat hold. Keep the ribs closed; use no weights if the shoulders tire or the back arches.";
  }
  if (id.startsWith("deadlift-knee-tuck-")) {
    return "Hold one light weight in each hand, arms hanging beneath the shoulders during the hinge. Reach only as low as you can keep a long spine. Return upright with the weights beside the hips, lowering the moving leg without a knee tuck. Option to tap the moving foot down between repetitions.";
  }
  return undefined;
}

const restCues: Readonly<Record<string, string>> = {
  "standing-circuit-preview": "Pick up your light hand weights for the squat series.",
  "standing-side-switch": "Prepare for the squat series on the other side.",
  "quadruped-setup": "Set weights beside the mat. Place a light weight behind the bent working knee for the donkey kick and crunch series.",
  "core-setup": "Lie on your back with knees bent and feet on the mat for crunches. Keep one light weight within reach for the final roll-up.",
  "side-body-setup": "Leave weights beside the mat. All side-lying leg work stays unweighted.",
  "upper-body-setup": "Come to a kneeling position on both knees. Pick up light weights for the arm series and keep the ribs stacked over the hips.",
  "upper-body-finish-break": "Leave weights down for the entire cooldown."
};

function withStepCue(item: CourseCircuitChild): CourseCircuitChild {
  const cue = item.type === "exercise"
    ? item.id === "class-introduction" ? equipmentCue : weightCue(item.id)
    : restCues[item.id];
  const originalDescription = item.shortDescription ?? (item.type === "exercise"
    ? matPilates0731Catalog.catalog.exercises.find((exercise) => exercise.id === item.exerciseId)?.shortDescription
    : undefined);
  return cue ? { ...item, shortDescription: [originalDescription, cue].filter(Boolean).join(" ") } : item;
}

function withCue(item: CourseItem): CourseItem {
  return item.type === "circuit"
    ? { ...item, items: item.items.map(withStepCue) }
    : withStepCue(item);
}

const catalog: ExerciseCatalog = {
  ...matPilates0731Catalog.catalog,
  exercises: [
    ...matPilates0731Catalog.catalog.exercises,
    existingExercise("Crunch"),
    existingExercise("Crunch pulses"),
    existingExercise("Roll ups"),
    ...[
      { id: "kneeling-biceps-curls", name: "Biceps curls", rig: "kneeling-biceps-curls", longDescription: "Kneel tall on both knees with a light weight in each hand. Keep elbows beside the ribs, curl the weights toward the shoulders, then lower with control." },
      { id: "kneeling-serve-platter", name: "Serve the platter (out and to the side)", rig: "kneeling-serve-platter", longDescription: "Kneel tall with elbows bent and palms facing up, holding light weights. Reach forward as though offering a platter, open the arms to the sides, then return with control." },
      { id: "kneeling-around-world", name: "Around the world (kneeling arm sweep)", rig: "kneeling-around-world", longDescription: "Kneel tall holding light weights beside the hips. Sweep the arms out to the sides and overhead through a comfortable range, then lower along the same arc. Keep the ribs closed and shoulders relaxed." },
      { id: "kneeling-reverse-fly", name: "Reverse fly", rig: "kneeling-reverse-fly", longDescription: "From kneeling, hinge slightly forward with a long spine and let the light weights hang beneath the shoulders. With softly bent elbows, open the arms out to the sides, then lower with control." },
      { id: "kneeling-triceps-extensions", name: "Triceps extensions", rig: "kneeling-triceps-extensions", longDescription: "Kneel tall and hold one light weight in both hands overhead. Keep the upper arms steady, bend the elbows to lower the weight behind the head, then straighten the elbows with control." },
      { id: "kneeling-flutter-arms", name: "Flutter arms behind back", rig: "kneeling-flutter-arms", longDescription: "Kneel tall with a slight forward hinge. Reach the arms behind the hips with light weights and make small controlled up-and-down flutters. Keep the neck long. Set the weights beside the mat before Pilates push-ups." }
    ].map((exercise) => ({ ...exercise, schemaVersion: 1 as const, version: 1, sideSupport: "none" as const, tags: ["mat-pilates", "weights"], shortDescription: "Kneeling on both knees with light weights." })),
    ...[
      { id: "single-leg-toe-reach", name: "Single leg toe reach", sideSupport: "left-right" as const, rig: "single-leg-toe-reach", longDescription: "Lie on your back. Extend the working leg toward the ceiling and keep the other foot on the mat. Exhale to curl the head and shoulders up, reaching toward the lifted toes; lower with control." },
      { id: "sit-up-twist", name: "Sit up twist", sideSupport: "left-right" as const, rig: "sit-up-twist", longDescription: "Lie on your back with knees bent and feet planted. Roll up with control, rotate the chest toward the indicated side, then return to center and roll down. Keep the feet grounded." },
      { id: "unweighted-russian-twists", name: "Russian twists", sideSupport: "none" as const, rig: "unweighted-russian-twists", longDescription: "Sit with knees bent, lean back slightly with a long spine, and rotate the chest from side to side. Keep the feet on the mat or lift them while maintaining control." },
      { id: "boat-hold", name: "Boat hold", sideSupport: "none" as const, rig: "boat-hold", longDescription: "Sit tall, lean back slightly, lift the feet and hold the shins parallel to the floor. Reach the arms forward and keep the chest lifted. Option to keep toes on the mat." }
    ].map((exercise) => ({ ...exercise, schemaVersion: 1 as const, version: 1, tags: ["mat-pilates", "mat"] })),
    ...[
      { id: "extended-leg-lift", name: "Extended leg lift", rig: "quadruped-glute-lift", longDescription: "From tabletop, extend the working leg behind you. Lift and lower the straight leg with control, keeping the hips square and the trunk steady." },
      { id: "extended-hamstring-curl", name: "Extended hamstring curl", rig: "extended-hamstring-curl", longDescription: "From tabletop, hold the working thigh lifted behind you. Bend the knee to bring the heel toward the glute, then extend the leg again without moving the hips." },
      { id: "extended-leg-pulse", name: "Extended leg pulse", rig: "quadruped-leg-pulse", longDescription: "From tabletop, hold the working leg straight behind you. Make small controlled upward pulses, keeping the hips square and the spine steady." }
    ].map((exercise) => ({ ...exercise, schemaVersion: 1 as const, version: 1, sideSupport: "left-right" as const, tags: ["mat-pilates", "mat"], shortDescription: "Keep the working leg extended behind you; no weight." })),
    {
      schemaVersion: 1,
      id: "single-leg-rdl",
      version: 1,
      name: "Single leg RDL",
      sideSupport: "left-right",
      tags: ["mat-pilates", "weights"],
      shortDescription: "Stand on the supporting leg with a soft knee and keep the hips square.",
      longDescription: "Hinge at the hips as the moving leg reaches behind you. Keep a long spine and let the arms hang beneath the shoulders. Press through the supporting foot to return upright and lower the moving leg with control. Option to tap the foot down between repetitions.",
      rig: "single-leg-rdl"
    }
  ]
};

function standingSequence(items: CourseItem[]): CourseItem[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const order = [
    "squat-arms-right-round", "squat-hold-right-round", "squat-hold-leg-lift-right",
    "side-back-kick-right", "deadlift-knee-tuck-right", "standing-side-switch",
    "squat-arms-left-round", "squat-hold-left-round", "squat-hold-leg-lift-left",
    "side-back-kick-left", "deadlift-knee-tuck-left"
  ];
  return order.map((id) => {
    const item = byId.get(id);
    if (!item) throw new Error(`Missing standing exercise ${id}`);
    if (item.type === "rest") return { ...item, durationSeconds: 30 };
    if (item.type === "exercise" && id.startsWith("deadlift-knee-tuck-")) {
      return { ...item, exerciseId: "single-leg-rdl", exerciseVersion: 1 };
    }
    if (item.type === "exercise" && id.startsWith("side-back-kick-")) {
      return { ...item, shortDescription: `${item.shortDescription ?? "Standing with a slight bend in the knees, hands on waist"} Set weights beside the mat for the kicks, then pick them up for the RDL.` };
    }
    return item;
  });
}

function quadrupedSequence(items: CourseItem[]): CourseItem[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const required = (id: string): CourseCircuitChild => {
    const item = byId.get(id);
    if (!item || item.type === "circuit") throw new Error(`Missing quadruped item ${id}`);
    return item;
  };
  const sideSequence = (side: "left" | "right"): CourseItem[] => [
    ...["donkey-kick", "side-crunch", "cross-body-crunch", "combined-crunch"].map((prefix) => {
      const item = required(`${prefix}-${side}`);
      if (item.type !== "exercise") throw new Error(`Expected exercise ${item.id}`);
      const description = item.shortDescription ?? catalog.exercises.find((exercise) => exercise.id === item.exerciseId)?.shortDescription;
      return { ...item, shortDescription: `${description ?? ""} Keep a light weight behind the bent ${side} knee.` };
    }),
    { type: "rest", id: `drop-weight-${side}`, name: "REST", durationSeconds: 15, shortDescription: "Drop the weight: remove it from behind the knee and set it beside the mat. Extend the working leg for the unweighted series." },
    ...["extended-leg-lift", "extended-hamstring-curl", "extended-leg-pulse"].map((exerciseId) => ({
      type: "exercise" as const, id: `${exerciseId}-${side}`, exerciseId, exerciseVersion: 1, side, durationSeconds: 40
    }))
  ];
  return [required("quadruped-setup"), ...sideSequence("left"),
    { ...required("quadruped-side-switch"), shortDescription: "Switch sides and place a light weight behind the other bent knee." },
    ...sideSequence("right")];
}

function coreSequence(): CourseItem[] {
  const move = (id: string, exerciseId: string, durationSeconds = 40, side?: "left" | "right", shortDescription?: string): CourseExerciseItem => ({
    type: "exercise", id, exerciseId, exerciseVersion: 1, durationSeconds,
    ...(side ? { side } : {}), ...(shortDescription ? { shortDescription } : {})
  });
  const rest = (id: string): CourseCircuitChild => ({ type: "rest", id, name: "REST", durationSeconds: 10 });
  return [
    { type: "rest", id: "core-setup", name: "REST", durationSeconds: 60 },
    move("crunches", existingExercise("Crunch").id),
    move("crunch-pulses", existingExercise("Crunch pulses").id, 20, undefined, "Keep the shoulders lifted and make small controlled crunch pulses."),
    rest("after-crunch-pulses"),
    move("single-leg-toe-reach-right", "single-leg-toe-reach", 40, "right"),
    rest("after-toe-reach-right"),
    move("single-leg-toe-reach-left", "single-leg-toe-reach", 40, "left"),
    rest("after-toe-reach-left"),
    move("sit-up-twist-left", "sit-up-twist", 40, "left"),
    move("sit-up-twist-right", "sit-up-twist", 40, "right"),
    move("russian-twists", "unweighted-russian-twists"),
    rest("after-russian-twists"),
    move("boat-hold", "boat-hold", 20),
    move("weighted-roll-up", existingExercise("Roll ups").id, 60, undefined, "Hold one light weight in both hands as you roll up and down with control. Keep the shoulders relaxed and avoid using momentum.")
  ];
}

function upperBodySequence(items: CourseItem[]): CourseItem[] {
  const required = (id: string): CourseCircuitChild => {
    const item = items.find((entry) => entry.id === id);
    if (!item || item.type === "circuit") throw new Error(`Missing upper-body item ${id}`);
    return item;
  };
  const move = (exerciseId: string): CourseExerciseItem => ({ type: "exercise", id: exerciseId, exerciseId, exerciseVersion: 1, durationSeconds: 40 });
  return [
    { ...required("upper-body-setup"), shortDescription: "Prepare for the kneeling arm series." },
    move("kneeling-biceps-curls"), move("kneeling-serve-platter"),
    move("kneeling-around-world"), move("kneeling-reverse-fly"),
    move("kneeling-triceps-extensions"), move("kneeling-flutter-arms"),
    { ...required("pilates-push-ups"), shortDescription: "Set weights clear of the mat. Place palms directly on the mat for Pilates push-ups." },
    { type: "rest", id: "before-high-planks", name: "REST", durationSeconds: 30, shortDescription: "Leave weights beside the mat and prepare for the high-plank series." },
    required("plank-shoulder-taps"), required("alternating-side-planks"), required("high-plank-hold"),
    { ...required("upper-body-finish-break"), shortDescription: "Sit up tall with legs crossed and prepare for cooldown." }
  ];
}

// Load is a course-specific option on existing movements, not a replacement
// for the shared exercise records or the original July 31 course.
const course: CourseDefinition = {
  ...structuredClone(matPilates0731Catalog.course),
  id: "mat-pilates-weights",
  version: 5,
  title: "Mat Pilates with weight",
  description: `Based on Mat Pilates — July 31, with light hand weights for the squat series, single leg RDLs, bent-knee quadruped work, the final core roll-up, and the kneeling arm series. Circuit 1 flows through all five movements per side with a 30-second rest between sides. Equipment: mat and a pair of light hand weights. ${equipmentCue}`,
  tags: ["mat-pilates", "mat", "weights", "full-body"],
  phases: matPilates0731Catalog.course.phases.map((phase) => ({
    ...phase,
    items: (phase.id === "standing-lower-body" ? standingSequence(phase.items) : phase.id === "quadruped-glutes-core" ? quadrupedSequence(phase.items) : phase.id === "core-circuit" ? coreSequence() : phase.id === "upper-body-back" ? upperBodySequence(phase.items) : phase.items).map(withCue)
  }))
};

export const matPilatesWeightsCatalog = { catalog, course };
export const matPilatesWeights = resolveCourseDefinition(catalog, course);
