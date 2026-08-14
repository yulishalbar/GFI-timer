import type {
  CourseExerciseItem,
  CourseItem,
  ExerciseDefinition,
  MotionIllustrations
} from "../domain/catalog-definition";
import type { AdaptedLegacyCourse } from "../domain/legacy-catalog-adapter";

const GENERIC_PLANK_ART_NAMES = new Set([
  "Straight leg sweep",
  "Straight leg sweep circles",
  "Thread the leg and open to the side",
  "Sliders mountain climbers"
]);

const PLANK_MOTION_ART: Readonly<Record<string, MotionIllustrations>> = {
  "Straight leg sweep": [
    "exercises/straight-leg-sweep-motion-1.jpg",
    "exercises/straight-leg-sweep-motion-2.jpg"
  ],
  "Straight leg sweep circles": [
    "exercises/straight-leg-sweep-circles-motion-1.jpg",
    "exercises/straight-leg-sweep-circles-motion-3.jpg",
    "exercises/straight-leg-sweep-circles-motion-2.jpg"
  ],
  "Thread the leg and open to the side": [
    "exercises/thread-leg-side-motion-1.jpg",
    "exercises/thread-leg-side-motion-2.jpg"
  ],
  "Sliders mountain climbers": [
    "exercises/slider-mountain-climbers-v2-motion-1.jpg",
    "exercises/slider-mountain-climbers-v2-motion-2.jpg",
    "exercises/slider-mountain-climbers-v2-motion-3.jpg",
    "exercises/slider-mountain-climbers-v2-motion-4.jpg"
  ]
};

function placements(items: readonly CourseItem[]): CourseExerciseItem[] {
  return items.flatMap((item) =>
    item.type === "exercise"
      ? [item]
      : item.type === "circuit"
        ? item.items.filter((child): child is CourseExerciseItem => child.type === "exercise")
        : []
  );
}

function exerciseSignature(exercise: ExerciseDefinition): string {
  return JSON.stringify({
    name: exercise.name,
    shortDescription: exercise.shortDescription,
    longDescription: exercise.longDescription,
    illustration: exercise.illustration,
    motionIllustrations: exercise.motionIllustrations,
    sideSupport: exercise.sideSupport,
    tags: exercise.tags
  });
}

export function normalizeSlidersCatalog(input: AdaptedLegacyCourse): AdaptedLegacyCourse {
  const catalog = structuredClone(input.catalog);
  const course = structuredClone(input.course);
  const allPlacements = course.phases.flatMap((phase) => placements(phase.items));
  const hiitPlacements = new Set(placements(course.phases.find((phase) => phase.id === "hiit-legs")?.items ?? []));
  const sideBodyPlacements = new Set(placements(course.phases.find((phase) => phase.id === "side-body")?.items ?? []));
  const exercisesById = new Map(catalog.exercises.map((exercise) => [exercise.id, exercise]));

  allPlacements.forEach((placement) => {
    const isHiitSide = hiitPlacements.has(placement);
    const isSideBody = sideBodyPlacements.has(placement);
    if (!isHiitSide && !isSideBody) return;

    const side = placement.id.endsWith("-one") || placement.id.endsWith("-left")
      ? "left"
      : "right";
    placement.side = side;
    const exercise = exercisesById.get(placement.exerciseId);
    if (exercise) exercise.sideSupport = "left-right";
  });

  catalog.exercises.forEach((exercise) => {
    if (exercise.illustration === "exercises/high-plank.svg" && GENERIC_PLANK_ART_NAMES.has(exercise.name)) {
      delete exercise.illustration;
    }
    const motionIllustrations = PLANK_MOTION_ART[exercise.name];
    if (motionIllustrations) exercise.motionIllustrations = motionIllustrations;
  });

  const canonicalBySignature = new Map<string, ExerciseDefinition>();
  const replacementIds = new Map<string, string>();
  const deduplicated: ExerciseDefinition[] = [];
  catalog.exercises.forEach((exercise) => {
    const signature = exerciseSignature(exercise);
    const canonical = canonicalBySignature.get(signature);
    if (canonical) {
      replacementIds.set(exercise.id, canonical.id);
      return;
    }
    canonicalBySignature.set(signature, exercise);
    deduplicated.push(exercise);
  });
  allPlacements.forEach((placement) => {
    placement.exerciseId = replacementIds.get(placement.exerciseId) ?? placement.exerciseId;
  });
  catalog.exercises = deduplicated;

  return { catalog, course };
}
