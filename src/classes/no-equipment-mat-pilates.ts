import { mergeExerciseCatalogs } from "../catalog/merge-catalogs";
import { resolveCourseDefinition } from "../domain/resolve-course";
import { matPilates0724Catalog } from "./mat-pilates-07-24";
import { matPilates0731Catalog } from "./mat-pilates-07-31";
import { hiitPilatesSlidersCatalog } from "./hiit-pilates-sliders";
import type { CourseItem, CourseExerciseItem, ExerciseDefinition, ExerciseSide } from "../domain/catalog-definition";

const suitcaseCrunch: ExerciseDefinition = {
  schemaVersion: 1,
  id: "no-equipment-suitcase-crunch",
  version: 1,
  name: "Suitcase crunch",
  shortDescription: "Lie on your back with arms reaching overhead and legs extended.",
  longDescription: "Exhale to bend the knees toward the chest and curl the head and shoulders up, reaching the hands toward the shins. Inhale to extend the arms and legs with control. Keep the lower back supported; shorten the reach or rest the heels on the mat as needed. No equipment required.",
  sideSupport: "none",
  tags: ["mat-pilates", "mat"]
};

const singleLegPushUpPike: ExerciseDefinition = {
  schemaVersion: 1,
  id: "no-equipment-single-leg-knee-push-up-pike",
  version: 1,
  name: "Single-leg knee push-up to pike",
  shortDescription: "Keep the working leg lifted and the opposite knee on the mat.",
  longDescription: "With hands under shoulders and the working leg extended behind you, bend the elbows to lower the chest and press back up, supported on the opposite knee. Tuck the supporting toes and lift the hips into a single-leg pike, keeping the working leg lifted. Lower the supporting knee with control and repeat. Keep hips square. Regression: use both knees for the push-up and both feet for the pike.",
  sideSupport: "left-right",
  tags: ["mat-pilates", "mat"]
};

const lowPlankLegLifts: ExerciseDefinition = {
  schemaVersion: 1,
  id: "no-equipment-low-plank-alternating-leg-lifts",
  version: 1,
  name: "Low plank alternating leg lifts",
  shortDescription: "Forearms grounded, elbows under shoulders, and hips square to the mat.",
  longDescription: "Hold a low forearm plank. Squeeze one glute to lift that straight leg slightly off the mat, lower with control, then alternate legs. Keep the pelvis level and the core braced without arching the lower back. Regression: lower the knees and extend and lift one leg at a time.",
  sideSupport: "none",
  tags: ["mat-pilates", "mat"]
};

const posterior = matPilates0724Catalog.course.phases.find((phase) => phase.id === "posterior-core-circuit");
if (!posterior) throw new Error("Posterior core circuit is missing");
const posteriorItems = posterior.items.flatMap((item): CourseItem[] => {
  if (item.type === "rest") {
    return item.id === "rest-after-bird-dog-right" ? [{ ...item, durationSeconds: 20 }] : [];
  }
  if (item.id === "knee-push-ups") return [];
  if (item.type === "exercise" && item.id === "plank-crunch") return [{
    type: "exercise",
    id: "low-plank-alternating-leg-lifts",
    exerciseId: lowPlankLegLifts.id,
    exerciseVersion: lowPlankLegLifts.version,
    durationSeconds: item.durationSeconds
  }];
  if (item.type === "exercise" && item.id === "superman-flutter") return [{ ...item, durationSeconds: 20 }];
  if (item.id !== "bird-dog-right" && item.id !== "bird-dog-left") return [item];
  const side = item.id === "bird-dog-right" ? "right" : "left";
  return [item, {
    type: "exercise",
    id: `single-leg-knee-push-up-pike-${side}`,
    exerciseId: singleLegPushUpPike.id,
    exerciseVersion: singleLegPushUpPike.version,
    side,
    durationSeconds: 40,
    shortDescription: `Keep the ${side} leg lifted; use the ${side === "right" ? "left" : "right"} knee for the push-up, then lift into a single-leg pike.`
  }];
});

const core = matPilates0731Catalog.course.phases.find((phase) => phase.id === "core-circuit");
if (!core) throw new Error("July 31 core circuit is missing");
const deadBug = hiitPilatesSlidersCatalog.catalog.exercises.find((exercise) => exercise.name === "Dead Bug");
if (!deadBug) throw new Error("Dead Bug exercise is missing");
const coreItems = core.items.filter((item) => item.type !== "rest").map((item) =>
  item.type === "exercise" && item.id.startsWith("supine-bird-dogs-")
    ? {
      ...item,
      id: item.id.replace("supine-bird-dogs-", "dead-bugs-"),
      exerciseId: deadBug.id,
      exerciseVersion: deadBug.version,
      shortDescription: "Lie on your back with legs in tabletop and arms reaching toward the ceiling. Lower opposite arm and leg with control, return, and alternate sides."
    }
    : item
).flatMap((item): CourseItem[] => item.type === "exercise" && item.id.startsWith("double-toe-taps-")
  ? [item, {
    type: "exercise",
    id: item.id.replace("double-toe-taps-", "suitcase-crunch-"),
    exerciseId: suitcaseCrunch.id,
    exerciseVersion: suitcaseCrunch.version,
    durationSeconds: 40
  }]
  : [item]).flatMap((item): CourseItem[] => item.id === "scissors-one"
  ? [item, {
    type: "rest",
    id: "core-round-one-rest",
    name: "REST",
    durationSeconds: 20,
    shortDescription: "Rest, hug the knees in, and prepare to repeat the core circuit."
  }]
  : [item]);
const sideBody = matPilates0724Catalog.course.phases.find((phase) => phase.id === "side-body-circuit");
const plank = matPilates0724Catalog.catalog.exercises.find((exercise) => exercise.name === "Low-plank hold");
if (!sideBody || !plank) throw new Error("Side-body plank movements are missing");
const staticLegHold: ExerciseDefinition = {
  schemaVersion: 1,
  id: "no-equipment-side-lying-static-leg-hold",
  version: 1,
  name: "Static leg hold",
  shortDescription: "Stay side-lying with the top leg extended and lifted at hip height.",
  longDescription: "Keep the hips stacked and hold the straight top leg still at hip height. Brace the core and breathe steadily without rolling backward. Regression: lower the leg slightly or bend the bottom knee for support.",
  sideSupport: "left-right",
  tags: ["mat-pilates", "mat"]
};

function sideMove(id: string): CourseExerciseItem {
  const item = sideBody?.items.find((entry) => entry.id === id);
  if (!item || item.type !== "exercise") throw new Error(`Missing side-body exercise: ${id}`);
  return item;
}

const circleSource = matPilates0724Catalog.catalog.exercises.find((exercise) => exercise.id === sideMove("small-leg-circles-left").exerciseId);
if (!circleSource) throw new Error("Small leg circles exercise is missing");
const shortCircles: ExerciseDefinition = {
  ...circleSource,
  id: "no-equipment-small-leg-circle-pulses",
  version: 1,
  shortDescription: "Reverse direction after 10 seconds.",
  longDescription: "Draw small tight circles with the lifted top leg, 10 seconds in each direction, maintaining constant tension and keeping the hips stacked."
};

function sideSequence(workingLeg: ExerciseSide, supportingSide: ExerciseSide): CourseItem[] {
  return [
    sideMove(`leg-lift-${workingLeg}`),
    sideMove(`big-leg-circles-${workingLeg}`),
    { ...sideMove(`small-leg-circles-${workingLeg}`), exerciseId: shortCircles.id, exerciseVersion: shortCircles.version, durationSeconds: 20, shortDescription: "Draw small circles with the top leg. Reverse direction after 10 seconds; finish after 20 seconds total." },
    {
      type: "exercise",
      id: `static-leg-hold-${workingLeg}`,
      exerciseId: staticLegHold.id,
      exerciseVersion: staticLegHold.version,
      side: workingLeg,
      durationSeconds: 20
    },
    sideMove(`bottom-leg-lifts-${supportingSide}`),
    sideMove(`bottom-leg-pulses-${supportingSide}`),
    sideMove(`tricep-push-up-${workingLeg}`),
    sideMove(`straight-leg-crunch-${workingLeg}`),
    sideMove(`side-plank-${supportingSide}`)
  ];
}

const sideBodyItems: CourseItem[] = [
  ...sideSequence("left", "right"),
  { type: "rest", id: "side-body-side-break", name: "REST", durationSeconds: 30, shortDescription: "Switch to lie on the left side with the right leg on top." },
  ...sideSequence("right", "left"),
  { type: "exercise", id: "side-body-regular-plank", exerciseId: plank.id, exerciseVersion: plank.version, durationSeconds: 30, shortDescription: "Turn to face the mat, elbows under shoulders. Hold a regular forearm plank with hips level; lower the knees if needed." }
];

const dogHipCircles: ExerciseDefinition = {
  schemaVersion: 1,
  id: "no-equipment-single-leg-down-dog-hip-circles",
  version: 1,
  name: "Single-leg downward facing dog with hip circles",
  shortDescription: "From downward dog, lift the working leg and bend its knee.",
  longDescription: "Press through both hands and keep the supporting foot grounded. With the working knee bent, make small controlled circles from the hip. Keep the shoulders steady and move within a comfortable range. Regression: keep both feet down in downward dog.",
  sideSupport: "left-right",
  tags: ["mat-pilates", "mat"]
};
const crescentHalfSplit: ExerciseDefinition = {
  schemaVersion: 1,
  id: "no-equipment-crescent-low-lunge-half-split",
  version: 1,
  name: "Crescent Low Lunge → half split",
  shortDescription: "Step the working foot forward and lower the back knee to the mat.",
  longDescription: "Keep the front knee over the ankle and lift the torso and arms into a crescent low lunge. Then shift the hips back, straighten the front leg comfortably and flex the front foot into a half split. Alternate slowly between the two shapes, breathing steadily. Keep hands on the mat for balance and soften the front knee as needed.",
  sideSupport: "left-right",
  tags: ["mat-pilates", "mat"]
};
const warmup = matPilates0724Catalog.course.phases.find((phase) => phase.id === "warmup");
if (!warmup) throw new Error("Warmup is missing");
const warmupItems = warmup.items.flatMap((item): CourseItem[] => {
  if (item.id === "hover-to-down-dog") return [];
  if (item.id !== "cat-cow") return [item];
  return [item, ...(["left", "right"] as const).flatMap((side): CourseItem[] => [
    { type: "exercise", id: `down-dog-hip-circles-${side}`, exerciseId: dogHipCircles.id, exerciseVersion: 1, side, durationSeconds: 10 },
    { type: "exercise", id: `crescent-half-split-${side}`, exerciseId: crescentHalfSplit.id, exerciseVersion: 1, side, durationSeconds: 60 }
  ])];
});

export const noEquipmentMatPilatesCatalog = {
  catalog: mergeExerciseCatalogs(matPilates0724Catalog.catalog, matPilates0731Catalog.catalog, hiitPilatesSlidersCatalog.catalog, {
    schemaVersion: 1,
    tags: matPilates0724Catalog.catalog.tags,
    exercises: [suitcaseCrunch, singleLegPushUpPike, lowPlankLegLifts, staticLegHold, shortCircles, dogHipCircles, crescentHalfSplit]
  }),
  course: {
    ...matPilates0724Catalog.course,
    id: "no-equipment-mat-pilates",
    version: 12,
    title: "No Equipment Mat Pilates",
    description: "July 24's full-body mat class with the July 31 core circuit, dead bugs, suitcase crunches, and a 20-second rest between core rounds. No equipment beyond a mat required.",
    phases: matPilates0724Catalog.course.phases.map((phase) =>
      phase.id === "core-circuit" ? { ...core, name: phase.name, items: coreItems }
        : phase.id === "side-body-circuit" ? { ...phase, items: sideBodyItems }
          : phase.id === "posterior-core-circuit" ? { ...phase, items: posteriorItems }
            : phase.id === "warmup" ? { ...phase, items: warmupItems } : phase
    )
  }
};

export const noEquipmentMatPilates = resolveCourseDefinition(
  noEquipmentMatPilatesCatalog.catalog,
  noEquipmentMatPilatesCatalog.course
);
