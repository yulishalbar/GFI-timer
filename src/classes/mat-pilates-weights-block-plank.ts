import type { CourseDefinition, CourseExerciseItem, ExerciseDefinition } from "../domain/catalog-definition";
import { resolveCourseDefinition } from "../domain/resolve-course";
import { matPilatesWeightsBlockCatalog } from "./mat-pilates-weights-block";

const exercises: ExerciseDefinition[] = ([
  ["down-dog-left", "Downward facing dog to side plank leg bend (holding block) (L)"],
  ["side-bends-left", "Side plank bends (holding block) (L)"],
  ["arm-twist-left", "Side plank twist (holding block) (L)"],
  ["knee-drive-left", "High plank Knee drive (L)"],
  ["bear-twists", "Bear plank side twists"],
  ["lying-right-knee-drive", "Lying kneedrive (R) balance block on side of foot"],
  ["lying-right-leg-lift", "Lying leg lift (R) balance block on side of foot"],
  ["down-dog-right", "Downward facing dog to side plank leg bend (holding block) (R)"],
  ["side-bends-right", "Side plank bends (holding block) (R)"],
  ["arm-twist-right", "Side plank twist (holding block) (R)"],
  ["lying-left-knee-drive", "Lying kneedrive (L) balance block on side of foot"],
  ["lying-left-leg-lift", "Lying leg lift (L) balance block on side of foot"],
  ["regular-squat-pulses", "Regular squat pulses"],
  ["single-leg-pike", "Single leg pike knee drive"],
  ["leg-lowers", "Leg lowers (block between ankles)"],
  ["crunch-pulses", "Crunch pulses"]
] satisfies [string, string][]).map(([id, name]) => ({
  schemaVersion: 1,
  id: `block-plank-${id}`,
  version: 1,
  name,
  sideSupport: id === "single-leg-pike" ? "left-right" : "none",
  tags: ["mat-pilates", "mat", "block", "weights"]
}));

function move(id: string, exercise: string, durationSeconds: number, shortDescription?: string): CourseExerciseItem {
  return {
    type: "exercise",
    id,
    exerciseId: `block-plank-${exercise}`,
    exerciseVersion: 1,
    durationSeconds,
    ...(shortDescription ? { shortDescription } : {})
  };
}

// Reuse the original course's remaining phases and pinned exercise records.
// The supplied second knee drive is deliberately left-sided and ten seconds.
const course: CourseDefinition = {
  ...matPilatesWeightsBlockCatalog.course,
  id: "mat-pilates-weights-block-plank",
  version: 5,
  title: "Block + Weights Mat Pilates #2",
  phases: matPilatesWeightsBlockCatalog.course.phases.map((phase) => phase.id === "side-body" ? {
    id: "plank-side-body",
    name: "Circuit #1: plank + side body",
    items: [
      move("down-dog-left", "down-dog-left", 40),
      { type: "rest", id: "down-dog-left-rest", durationSeconds: 10 },
      move("side-bends-left", "side-bends-left", 20),
      move("arm-twist-left", "arm-twist-left", 20),
      { type: "rest", id: "arm-twist-left-rest", durationSeconds: 10 },
      move("knee-drive-first", "knee-drive-left", 40),
      { type: "rest", id: "knee-drive-first-rest", durationSeconds: 10 },
      move("bear-twists-first", "bear-twists", 40),
      { type: "rest", id: "lying-right-rest", durationSeconds: 15 },
      move("lying-right-knee-drive", "lying-right-knee-drive", 60,
        "Left leg on top Balancing block on heel/side of foot"),
      move("lying-right-leg-lift", "lying-right-leg-lift", 60),
      { type: "rest", id: "side-switch-rest", durationSeconds: 20 },
      move("down-dog-right", "down-dog-right", 40),
      { type: "rest", id: "down-dog-right-rest", durationSeconds: 10 },
      move("side-bends-right", "side-bends-right", 20),
      move("arm-twist-right", "arm-twist-right", 20),
      { type: "rest", id: "arm-twist-right-rest", durationSeconds: 10 },
      move("knee-drive-second", "knee-drive-left", 10),
      { type: "rest", id: "knee-drive-second-rest", durationSeconds: 10 },
      move("bear-twists-second", "bear-twists", 40,
        "Same hand’s forearms on block, weight behind knee"),
      { type: "rest", id: "lying-left-rest", durationSeconds: 15 },
      move("lying-left-knee-drive", "lying-left-knee-drive", 40),
      move("lying-left-leg-lift", "lying-left-leg-lift", 40)
    ]
  } : phase.id === "lower-body" ? {
    ...structuredClone(phase),
    items: phase.items.filter((item) => !["lower-body-left-rest-2", "lower-body-right-rest-1", "lower-body-right-rest-2"].includes(item.id)).flatMap((item) => item.id === "regular-squats"
      ? [structuredClone(item), move("regular-squat-pulses", "regular-squat-pulses", 30)]
      : [structuredClone(item)])
  } : {
    ...structuredClone(phase),
    items: phase.items.filter((item) =>
      !(phase.id === "core-glutes-upper-body" && /^core-glutes-[lr]-rest-6$/.test(item.id))
    ).flatMap((item) => {
      const copy = structuredClone(item);
      if (copy.id === "warmup-circuit-preview" && copy.type === "rest") copy.durationSeconds = 120;
      if (copy.type === "exercise") {
        if (/^(ninety-ninety-lunge|narrow-press-knee-tap|hinge-knee-taps|b-stance-squats)-[lr]$/.test(copy.id)) {
          copy.durationSeconds = 30;
        }
        if (copy.id.startsWith("single-leg-pike-")) copy.exerciseId = "block-plank-single-leg-pike";
        if (copy.id === "tabletop-toe-taps") copy.exerciseId = "block-plank-leg-lowers";
      }
      return copy.id === "crunches-block"
        ? [copy, move("crunch-pulses", "crunch-pulses", 30)]
        : [copy];
    })
  })
};

export const matPilatesWeightsBlockPlankCatalog = {
  catalog: {
    ...matPilatesWeightsBlockCatalog.catalog,
    exercises: [...matPilatesWeightsBlockCatalog.catalog.exercises, ...exercises]
  },
  course
};

export const matPilatesWeightsBlockPlank = {
  ...resolveCourseDefinition(matPilatesWeightsBlockPlankCatalog.catalog, course),
  visualsDisabled: true
};
