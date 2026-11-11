import type { CourseDefinition, CourseItem, ExerciseSide } from "../domain/catalog-definition";
import { resolveCourseDefinition } from "../domain/resolve-course";
import { matPilatesBandCatalog } from "./mat-pilates-band";
import { bandWeightsExercises, weightedArmMovements } from "../catalog/band-weights";
import { matPilatesWeightsCatalog } from "./mat-pilates-weights";
import { matPilatesRingCatalog } from "./mat-pilates-ring";
import { mergeExerciseCatalogs } from "../catalog/merge-catalogs";

const ringCooldown = matPilatesRingCatalog.course.phases.find((phase) => phase.id === "cooldown");
if (!ringCooldown) throw new Error("Missing shared reclining cooldown");
const cooldownItems = ringCooldown.items.filter((item) => item.id !== "cooldown-setup");
const cooldownExerciseIds = new Set(cooldownItems.flatMap((item) => item.type === "exercise" ? [item.exerciseId] : []));

const boatHold = (() => {
  const exercise = matPilatesWeightsCatalog.catalog.exercises.find((entry) => entry.name === "Boat hold");
  if (!exercise) throw new Error("Missing shared Boat hold exercise");
  return exercise;
})();

function coreMove(id: string, side?: ExerciseSide): CourseItem {
  return { type: "exercise", id: `${id}${side ? `-${side}` : ""}`, exerciseId: `seated-band-${id}`, exerciseVersion: id === "teaser-arm-rows" ? 2 : 1, durationSeconds: id === "seated-leg-pulses" ? 20 : 40, ...(side ? { side } : {}) };
}

const servePlatter = (() => {
  const exercise = matPilatesBandCatalog.catalog.exercises.find((entry) => entry.name === "Serve the platter");
  if (!exercise) throw new Error("Missing shared Serve the platter exercise");
  return exercise;
})();

const coreCues: Record<string, string> = {
  "tabletop-crunch": "Hold one light weight at the chest as you curl; keep the band below knees.",
  "hundredth": "Hold light hand weights beside the hips for small arm pumps; keep the band below knees.",
  "leg-extensions": "Hold one light weight still at the chest while extending the legs; keep the band around shins.",
  "leg-lowers": "Hold one light weight still at the chest as the legs lower; keep the band around shins.",
  "roll-ups": "Hold light hand weights with the band around wrists; follow the same slow roll-up and use a smaller range if needed.",
  "russian-twist": "Hold light hand weights close to the chest with the band around wrists; rotate the torso with control."
};

function weightCue(phaseId: string, id: string): string | undefined {
  if (phaseId === "core-circuit") return coreCues[id];
  if (phaseId === "glutes-circuit") {
    return "Optional fitted ankle weights add load to the working leg; keep the band around thighs and both hands free for support.";
  }
  if (phaseId === "standing-legs") {
    return "Hold light hand weights close to the chest, hands together in prayer; keep the band in place through the squat or lunge.";
  }
  if (phaseId === "lower-body-core-glutes") {
    return id.includes("bridge")
      ? "Hold one light weight securely across the hips with both hands; keep the band around thighs."
      : "Optional fitted ankle weights add load to the top leg; keep the band around thighs and the supporting arm free.";
  }
  if (phaseId === "standing-upper-body-core") {
    return id.startsWith("straight-biceps-curl")
      ? "Hold a light weight in each hand while curling against the band; keep elbows close to ribs."
      : "Hold a light weight in each hand while maintaining the original band placement and arm movement; keep the range small and controlled.";
  }
  return undefined;
}

const setupCues: Record<string, string> = {
  "core-setup": "Prepare light hand weights beside the mat; keep the band below knees for the first exercises.",
  "move-band-shins": "Set hand weights down before repositioning the band, then pick up one weight at the chest.",
  "move-band-wrists": "Set the weight down before moving the band to wrists; then pick up light hand weights.",
  "glutes-setup": "Set hand weights beside the mat. Add optional fitted ankle weights and place the band around thighs.",
  "standing-transition": "Remove ankle weights, then rise slowly and pick up light hand weights at the chest.",
  "side-body-setup": "Set hand weights down before lying on your side. Add optional fitted ankle weights; keep one hand weight nearby for bridges.",
  "upper-body-setup": "Remove ankle weights, come to standing, and pick up light hand weights; retain the original band placements.",
  "cooldown-transition": "Set all weights beside the mat and remove ankle weights before stretching."
};

function addWeights(item: CourseItem, phaseId: string): CourseItem {
  if (item.type === "circuit") return { ...item, items: item.items.map((child) => addWeights(child, phaseId)) as typeof item.items };
  const cue = item.type === "rest" ? setupCues[item.id] : weightCue(phaseId, item.id);
  const introduction = item.id === "class-introduction"
    ? "Equipment: mat, band, light hand weights, and optional fitted ankle weights. Warm up and cool down without weights. Every exercise can also be done with the band alone."
    : undefined;
  const addition = cue ?? introduction;
  return addition ? { ...item, shortDescription: [item.shortDescription, addition].filter(Boolean).join(" ") } : { ...item };
}

function revisedItems(phaseId: string, items: CourseItem[]): CourseItem[] {
  if (phaseId === "glutes-circuit") return items.flatMap((item): CourseItem[] => {
    if (/^(leg-extensions|leg-pulses|rainbow)-/.test(item.id)) return [];
    if (item.id.startsWith("glutes-crunch-rest-")) {
      const side = item.id.endsWith("-l") ? "left" : "right";
      return [{ type: "exercise", id: `donkey-kick-regular-crunch-${side}`, exerciseId: "band-weights-donkey-kick-crunch", exerciseVersion: 1, durationSeconds: 40, side }];
    }
    if (item.type === "rest" && item.id === "glutes-setup") return [{ ...item, shortDescription: "Set hand weights beside the mat. Add optional fitted ankle weights and place the band around thighs. Preview donkey kick, crossover, downward dog crunch, then donkey kick + regular crunch on each side." }];
    return [item];
  });
  if (phaseId === "core-circuit") return [
    { type: "rest", id: "core-setup", durationSeconds: 60, shortDescription: "Sit with legs bent and feet on the mat. Start with the band above knees, then move it to the arches of both feet for the teaser-row sets; leave hand weights down." },
    coreMove("half-roll-up"), coreMove("alternating-arm-rows"), coreMove("alternating-rows-knee-drive"),
    ...(["left", "right"] as const).flatMap((side) => [coreMove("single-leg-knee-drive", side), coreMove("held-leg-side-sweeps", side), coreMove("seated-leg-pulses", side)]),
    ...[1, 2, 3].map((round): CourseItem => ({ ...coreMove("teaser-arm-rows"), id: `teaser-arm-rows-${round}` })),
    { type: "exercise", id: "boat-hold", exerciseId: boatHold.id, exerciseVersion: boatHold.version, durationSeconds: 20, shortDescription: "Move the band above knees again. From seated with knees bent, hold boat with arms forward; option to keep feet on the mat. Leave hand weights down." }
  ];
  if (phaseId === "cooldown") return cooldownItems.map((item, index) => index === 0
    ? { ...item, shortDescription: "Set all weights beside the mat, remove ankle weights and the band, and roll onto your back. Hug the left knee toward your chest with the right leg resting on the mat." }
    : { ...item });
  if (phaseId === "standing-upper-body-core") {
    return [
      { type: "rest", id: "upper-body-setup", durationSeconds: 60, shortDescription: "Stay standing after the leg circuit, set the band beside the mat, and hold light hand weights for the seven arm exercises." },
      ...[1, 2].flatMap((round): CourseItem[] => [
        ...(round === 2 ? [{ type: "rest" as const, id: "upper-body-round-two-setup", durationSeconds: 30, shortDescription: "Set weights down briefly, then reset for the same seven movements." }] : []),
        ...weightedArmMovements.flatMap(([id], index): CourseItem[] => [
          { type: "exercise", id: `${id}-${round}`, exerciseId: id === "serve-platter" ? servePlatter.id : `band-weights-${id}`, exerciseVersion: id === "serve-platter" ? servePlatter.version : 1, durationSeconds: 40,
            ...(id === "serve-platter" ? { shortDescription: "Use light hand weights, palms up; leave the band beside the mat and extend the arms forward at chest height." } : {}) },
          ...([1, 3].includes(index) ? [{ type: "rest" as const, id: `arms-rest-${round}-${index}`, durationSeconds: 10, shortDescription: "Relax the arms and reset the weights." }] : [])
        ])
      ])
    ];
  }
  if (phaseId !== "lower-body-core-glutes") return items;
  return items.flatMap((item, index): CourseItem[] => {
    if (item.type === "rest" && item.id !== "side-body-setup") return [];
    const nextExercise = items.slice(index + 1).find((next) => next.type === "exercise");
    const leftInsertion = item.id.startsWith("clamshell-") && item.id.endsWith("left") && !nextExercise?.id.startsWith("clamshell-");
    if (!leftInsertion && item.id !== "side-body-crunches-right") return [item];
    const side = leftInsertion ? "left" : "right";
    return [item,
      { type: "exercise", id: `clamshell-to-teaser-${side}`, exerciseId: "band-weights-clamshell-to-teaser", exerciseVersion: 1, durationSeconds: 40, side }
    ];
  });
}

// Reuse the band movements; course placements own the added equipment cues.
// Clone the schedule so the original band class and recovery version stay intact.
const course: CourseDefinition = {
  ...matPilatesBandCatalog.course,
  id: "mat-pilates-band-weights",
  version: 9,
  title: "Mat Pilates with Band and Weights",
  description: "Band circuits with added weight options, seven weighted arm movements after standing legs, and a final side-body circuit with clamshell to teaser. Equipment: mat, band, light hand weights, and optional fitted ankle weights.",
  tags: [...matPilatesBandCatalog.course.tags, "weights"],
  phases: ["introduction", "warmup", "core-circuit", "glutes-circuit", "standing-legs", "standing-upper-body-core", "lower-body-core-glutes", "cooldown"].map((id) => {
    const phase = matPilatesBandCatalog.course.phases.find((entry) => entry.id === id);
    if (!phase) throw new Error(`Missing band phase ${id}`);
    return {
    ...phase,
    ...(id === "standing-upper-body-core" ? { name: "Circuit #4: Standing Upper Body and Core" } : {}),
    ...(id === "lower-body-core-glutes" ? { name: "Circuit #5: Side Body, Core and Glutes" } : {}),
    items: revisedItems(phase.id, phase.items.map((item) => addWeights(item, phase.id)))
    };
  })
};

export const matPilatesBandWeightsCatalog = {
  catalog: mergeExerciseCatalogs(
    { ...matPilatesBandCatalog.catalog, exercises: [...matPilatesBandCatalog.catalog.exercises, ...bandWeightsExercises, boatHold] },
    { ...matPilatesRingCatalog.catalog, exercises: matPilatesRingCatalog.catalog.exercises.filter((exercise) => cooldownExerciseIds.has(exercise.id)) }
  ),
  course
};
export const matPilatesBandWeights = resolveCourseDefinition(matPilatesBandWeightsCatalog.catalog, course);
