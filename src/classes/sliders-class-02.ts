import type { CourseDefinition, CourseItem, ExerciseDefinition, ExerciseSide } from "../domain/catalog-definition";
import { mergeExerciseCatalogs } from "../catalog/merge-catalogs";
import { resolveCourseDefinition } from "../domain/resolve-course";
import { hiitPilatesSlidersCatalog } from "./hiit-pilates-sliders";
import { matPilates0724Catalog } from "./mat-pilates-07-24";
import { matPilates0731Catalog } from "./mat-pilates-07-31";

const newExercises: ExerciseDefinition[] = [
  { id: "good-morning-leg-extension", name: "Good morning + leg extension", longDescription: "With a soft bend in the supporting knee, hinge forward from the hips with a long spine. Return upright, then extend the working leg behind you with control. Repeat on the same side." },
  { id: "side-plank-top-leg-slide", name: "Side plank top leg slide knee to elbow", longDescription: "Hold a side plank and slide the top knee toward the top elbow, then extend the leg back out with control." },
  { id: "side-plank-hip-lowers", name: "Side plank hip lowers", longDescription: "From side plank, lower the hips toward the mat and lift back into the plank with control." },
  { id: "side-plank-to-teaser", name: "Side plank to teaser", longDescription: "Move from side plank into teaser with control. Option to add the crunch." },
  { id: "opposite-arm-slides", name: "Opposite arm slides", longDescription: "Ease into a controlled torso rotation toward the slider, using the obliques to drive the rotation and control the return back to the center position." },
  { id: "opposite-arm-slides-leg-crunch", name: "Opposite arm slides + leg crunch", longDescription: "Lift one leg into a tabletop position (90° angle at hip and knee) while executing the slide and rotation to add a core stability and balance challenge." },
  { id: "slider-leg-arm-extension", name: "Leg + arm extension", longDescription: "Extend the elevated leg outward as the slider reaches away to increase hip flexor engagement and total core lever length." },
  { id: "single-leg-bicycle-crunch", name: "Single-leg bicycle", longDescription: "Bring the opposite elbow toward the working leg as it bends in. Extend the leg away and return with control; repeat on the same side." },
  { id: "single-arm-toe-reach", name: "Single-arm toe reach", longDescription: "Lie on the mat and reach one arm toward the raised toes. Curl the head and shoulders up, then lower with control. Repeat with the indicated arm." },
  { id: "supine-cross-body-crunch", name: "Supine cross-body crunch", longDescription: "Lie on the mat and curl the opposite shoulder toward the working knee. Lower with control and repeat on the same side." }
].map((exercise) => ({ ...exercise, schemaVersion: 1, version: 1, sideSupport: "left-right", tags: ["mat-pilates", "mat", "core"] }));

const sideNames = ["Leg lift", "Big leg circles", "Small leg circles", "Straight leg crunches", "Tricep side push-up", "Bottom leg lifts", "Bottom leg pulses"];
const pooledSideExercises = sideNames.map((name) => {
  const exercise = [...matPilates0724Catalog.catalog.exercises, ...matPilates0731Catalog.catalog.exercises].find((entry) => entry.name === name);
  if (!exercise) throw new Error(`Missing pooled side-body exercise: ${name}`);
  return exercise;
});

const catalog = mergeExerciseCatalogs(hiitPilatesSlidersCatalog.catalog, {
  schemaVersion: 1,
  tags: hiitPilatesSlidersCatalog.catalog.tags,
  exercises: [...newExercises, ...pooledSideExercises, {
    schemaVersion: 1, id: "glute-bridge-single-leg-extensions", version: 1,
    name: "Glute bridge single leg extensions", sideSupport: "none",
    tags: ["mat-pilates", "mat", "core"],
    longDescription: "Hold a glute bridge with hips level. Extend one leg, return the foot to the mat with control, and alternate legs."
  }]
});

function move(exerciseId: string, side: ExerciseSide, durationSeconds = 40): CourseItem {
  const exercise = catalog.exercises.find((entry) => entry.id === exerciseId);
  if (!exercise) throw new Error(`Missing sliders exercise: ${exerciseId}`);
  return { type: "exercise", id: `${exerciseId}-${side}`, exerciseId, exerciseVersion: exercise.version, durationSeconds,
    ...(exercise.sideSupport === "left-right" ? { side } : {}) };
}

function coreSide(side: ExerciseSide): CourseItem[] {
  const rollUp = catalog.exercises.find((exercise) => exercise.name === "Roll-ups");
  if (!rollUp) throw new Error("Missing pooled Roll-ups");
  return [
    move("opposite-arm-slides", side),
    move("opposite-arm-slides-leg-crunch", side),
    { type: "rest", id: `roll-onto-mat-${side}`, name: "REST", durationSeconds: 10, shortDescription: "Roll onto the mat." },
    move("single-leg-bicycle-crunch", side),
    move("single-arm-toe-reach", side),
    move("supine-cross-body-crunch", side),
    move(rollUp.id, side, 60)
  ];
}

function sideBody(side: ExerciseSide): CourseItem[] {
  const bottom = side === "right" ? "left" : "right";
  return [
    move("side-plank-top-leg-slide", side, 30),
    move("side-plank-hip-lowers", side, 30),
    move("side-plank-to-teaser", side, 30),
    { type: "rest", id: `lower-to-mat-${side}`, name: "REST", durationSeconds: 10, shortDescription: "Lower onto the mat for the side-lying leg series." },
    ...pooledSideExercises.map((exercise) => move(exercise.id, exercise.name.startsWith("Bottom leg") ? bottom : side))
  ];
}

function thirtySecondExercises(items: CourseItem[]): CourseItem[] {
  return items.map((item) => item.type === "exercise" ? { ...item, durationSeconds: 30 }
    : item.type === "circuit" ? { ...item, items: item.items.map((child) => child.type === "exercise" ? { ...child, durationSeconds: 30 } : child) }
      : item);
}

function replaceRunnerLunge(items: CourseItem[]): CourseItem[] {
  return items.filter((item) => !["one-hiit-rest-4", "two-hiit-rest-4"].includes(item.id)).map((item) => {
    if (item.type === "circuit") return { ...item, items: replaceRunnerLunge(item.items) as typeof item.items };
    if (item.type !== "exercise") return item;
    const exercise = catalog.exercises.find((entry) => entry.id === item.exerciseId);
    if (exercise?.name !== "High runner's lunge leg in-and-out") return item;
    return { ...item, exerciseId: "good-morning-leg-extension", exerciseVersion: 1 };
  });
}

function updateBridgeSeries(items: CourseItem[]): CourseItem[] {
  return thirtySecondExercises(items).map((item) => {
    if (item.type !== "exercise") return item;
    const exercise = catalog.exercises.find((entry) => entry.id === item.exerciseId);
    if (exercise?.name === "Glute bridge curl") return { ...item, exerciseId: "glute-bridge-single-leg-extensions", exerciseVersion: 1 };
    if (exercise?.name === "Glute bridge pulse") return { ...item, durationSeconds: 20 };
    return item;
  });
}

const course: CourseDefinition = {
  ...structuredClone(hiitPilatesSlidersCatalog.course),
  id: "sliders-class-02",
  version: 7,
  title: "sliders class #2",
  phases: structuredClone(hiitPilatesSlidersCatalog.course.phases).map((phase) => {
    if (phase.id === "abs-circuit") return { ...phase, items: [...coreSide("right"), ...coreSide("left"), { type: "rest", id: "after-circuit-one", name: "REST", durationSeconds: 60, shortDescription: "Rest and prepare for Circuit #2." }] };
    if (phase.id === "hiit-legs") return { ...phase, items: replaceRunnerLunge(phase.items) };
    if (phase.id === "side-body") return { ...phase, items: [...sideBody("right"), { type: "rest", id: "side-body-switch", name: "REST", durationSeconds: 30, shortDescription: "Switch sides and prepare for side plank." }, ...sideBody("left")] };
    if (phase.id === "upper-core-one") return { ...phase, items: updateBridgeSeries(phase.items) };
    if (phase.id === "plank-pyramid") return { ...phase, items: thirtySecondExercises(phase.items) };
    return phase;
  })
};

export const slidersClass02Catalog = { catalog, course };
export const slidersClass02 = resolveCourseDefinition(catalog, course);
