import type {
  CourseCircuitChild,
  CourseDefinition,
  CourseExerciseItem,
  CourseItem,
  ExerciseCatalog,
  ExerciseDefinition
} from "./catalog-definition";
import type { ClassEntry, FitnessClassDefinition } from "./class-definition";
import { validateClassDefinition } from "./validate-class";

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_STEP_SECONDS = 6 * 60 * 60;
const MAX_ROUNDS = 100;
const TAG_CATEGORIES = new Set(["body-area", "modality", "equipment", "movement-type", "focus"]);
type RecordValue = Record<string, unknown>;

export class CourseResolutionError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Invalid exercise catalog or course:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
    this.name = "CourseResolutionError";
    this.issues = issues;
  }
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function allowedKeys(value: RecordValue, keys: readonly string[], path: string, issues: string[]): void {
  const allowed = new Set(keys);
  Object.keys(value).forEach((key) => {
    if (!allowed.has(key)) issues.push(`${path}.${key}: unknown property`);
  });
}

function id(value: unknown, path: string, issues: string[]): void {
  if (typeof value !== "string" || !ID_PATTERN.test(value)) {
    issues.push(`${path}: expected a lowercase kebab-case ID`);
  }
}

function text(value: unknown, path: string, issues: string[], optional = false): void {
  if (optional && value === undefined) return;
  if (typeof value !== "string" || value.trim().length === 0) {
    issues.push(`${path}: expected non-empty text${optional ? " when provided" : ""}`);
  }
}

function positiveInteger(value: unknown, path: string, maximum: number, issues: string[]): void {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0 || value > maximum) {
    issues.push(`${path}: expected a positive integer no greater than ${maximum}`);
  }
}

function uniqueIds(values: readonly unknown[], path: string, issues: string[]): void {
  const seen = new Set<string>();
  values.forEach((value, index) => {
    if (!isRecord(value) || typeof value.id !== "string") return;
    if (seen.has(value.id)) issues.push(`${path}[${index}].id: duplicate ID "${value.id}"`);
    seen.add(value.id);
  });
}

function tagList(value: unknown, path: string, knownTags: ReadonlySet<string>, issues: string[]): void {
  if (!Array.isArray(value)) {
    issues.push(`${path}: expected an array of tag IDs`);
    return;
  }
  const seen = new Set<string>();
  value.forEach((tag, index) => {
    if (typeof tag !== "string" || !ID_PATTERN.test(tag)) {
      issues.push(`${path}[${index}]: expected a lowercase kebab-case tag ID`);
    } else if (!knownTags.has(tag)) {
      issues.push(`${path}[${index}]: unknown tag "${tag}"`);
    } else if (seen.has(tag)) {
      issues.push(`${path}[${index}]: duplicate tag "${tag}"`);
    }
    if (typeof tag === "string") seen.add(tag);
  });
}

function safeAsset(value: unknown): boolean {
  return typeof value === "string" && !value.startsWith("/") && !value.includes("..") &&
    /^[a-zA-Z0-9][a-zA-Z0-9/_-]*\.(?:svg|png|jpe?g|webp)$/.test(value);
}

function validateCatalog(input: unknown, issues: string[]): ExerciseCatalog | undefined {
  if (!isRecord(input)) {
    issues.push("catalog: expected an object");
    return undefined;
  }
  allowedKeys(input, ["schemaVersion", "tags", "exercises"], "catalog", issues);
  if (input.schemaVersion !== 1) issues.push("catalog.schemaVersion: expected 1");
  if (!Array.isArray(input.tags)) issues.push("catalog.tags: expected an array");
  if (!Array.isArray(input.exercises)) issues.push("catalog.exercises: expected an array");
  if (!Array.isArray(input.tags) || !Array.isArray(input.exercises)) return undefined;

  uniqueIds(input.tags, "catalog.tags", issues);
  const knownTags = new Set<string>();
  input.tags.forEach((tag, index) => {
    const path = `catalog.tags[${index}]`;
    if (!isRecord(tag)) {
      issues.push(`${path}: expected a tag object`);
      return;
    }
    allowedKeys(tag, ["id", "label", "category"], path, issues);
    id(tag.id, `${path}.id`, issues);
    text(tag.label, `${path}.label`, issues);
    if (typeof tag.category !== "string" || !TAG_CATEGORIES.has(tag.category)) {
      issues.push(`${path}.category: expected a supported tag category`);
    }
    if (typeof tag.id === "string") knownTags.add(tag.id);
  });

  uniqueIds(input.exercises, "catalog.exercises", issues);
  input.exercises.forEach((exercise, index) => {
    const path = `catalog.exercises[${index}]`;
    if (!isRecord(exercise)) {
      issues.push(`${path}: expected an exercise object`);
      return;
    }
    allowedKeys(exercise, ["schemaVersion", "id", "version", "name", "shortDescription", "longDescription", "illustration", "motionIllustrations", "sideSupport", "tags"], path, issues);
    if (exercise.schemaVersion !== 1) issues.push(`${path}.schemaVersion: expected 1`);
    id(exercise.id, `${path}.id`, issues);
    positiveInteger(exercise.version, `${path}.version`, Number.MAX_SAFE_INTEGER, issues);
    text(exercise.name, `${path}.name`, issues);
    text(exercise.shortDescription, `${path}.shortDescription`, issues, true);
    text(exercise.longDescription, `${path}.longDescription`, issues, true);
    if (exercise.illustration !== undefined && !safeAsset(exercise.illustration)) {
      issues.push(`${path}.illustration: expected a safe local image path`);
    }
    if (exercise.motionIllustrations !== undefined && (!Array.isArray(exercise.motionIllustrations) || exercise.motionIllustrations.length < 2 || exercise.motionIllustrations.some((frame) => !safeAsset(frame)))) {
      issues.push(`${path}.motionIllustrations: expected at least two safe local image paths`);
    }
    if (exercise.sideSupport !== "none" && exercise.sideSupport !== "left-right") {
      issues.push(`${path}.sideSupport: expected "none" or "left-right"`);
    }
    tagList(exercise.tags, `${path}.tags`, knownTags, issues);
  });
  return input as unknown as ExerciseCatalog;
}

function validatePlacement(value: RecordValue, path: string, exercises: ReadonlyMap<string, ExerciseDefinition>, issues: string[]): void {
  allowedKeys(value, ["type", "id", "exerciseId", "exerciseVersion", "side", "durationSeconds", "shortDescription"], path, issues);
  id(value.id, `${path}.id`, issues);
  id(value.exerciseId, `${path}.exerciseId`, issues);
  positiveInteger(value.exerciseVersion, `${path}.exerciseVersion`, Number.MAX_SAFE_INTEGER, issues);
  positiveInteger(value.durationSeconds, `${path}.durationSeconds`, MAX_STEP_SECONDS, issues);
  text(value.shortDescription, `${path}.shortDescription`, issues, true);
  const exercise = typeof value.exerciseId === "string" ? exercises.get(value.exerciseId) : undefined;
  if (!exercise) {
    if (typeof value.exerciseId === "string") issues.push(`${path}.exerciseId: unknown exercise "${value.exerciseId}"`);
    return;
  }
  if (value.exerciseVersion !== exercise.version) {
    issues.push(`${path}.exerciseVersion: expected pinned version ${exercise.version}`);
  }
  if (exercise.sideSupport === "left-right" && value.side !== "left" && value.side !== "right") {
    issues.push(`${path}.side: required for a left-right exercise`);
  }
  if (exercise.sideSupport === "none" && value.side !== undefined) {
    issues.push(`${path}.side: not allowed for this exercise`);
  }
}

function validateRest(value: RecordValue, path: string, issues: string[]): void {
  allowedKeys(value, ["type", "id", "name", "durationSeconds", "shortDescription"], path, issues);
  id(value.id, `${path}.id`, issues);
  if (value.name !== undefined && value.name !== "REST") issues.push(`${path}.name: expected "REST"`);
  positiveInteger(value.durationSeconds, `${path}.durationSeconds`, MAX_STEP_SECONDS, issues);
  text(value.shortDescription, `${path}.shortDescription`, issues, true);
}

function validateItem(value: unknown, path: string, exercises: ReadonlyMap<string, ExerciseDefinition>, issues: string[], allowCircuit: boolean): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected a course item`);
    return;
  }
  if (value.type === "exercise") return validatePlacement(value, path, exercises, issues);
  if (value.type === "rest") return validateRest(value, path, issues);
  if (value.type !== "circuit" || !allowCircuit) {
    issues.push(`${path}.type: expected ${allowCircuit ? '"exercise", "rest", or "circuit"' : '"exercise" or "rest"'}`);
    return;
  }
  allowedKeys(value, ["type", "id", "name", "rounds", "items"], path, issues);
  id(value.id, `${path}.id`, issues);
  text(value.name, `${path}.name`, issues);
  if (value.rounds !== undefined) positiveInteger(value.rounds, `${path}.rounds`, MAX_ROUNDS, issues);
  if (!Array.isArray(value.items) || value.items.length === 0) {
    issues.push(`${path}.items: expected at least one item`);
    return;
  }
  uniqueIds(value.items, `${path}.items`, issues);
  value.items.forEach((item, index) => validateItem(item, `${path}.items[${index}]`, exercises, issues, false));
}

function validateCourse(input: unknown, catalog: ExerciseCatalog, issues: string[]): CourseDefinition | undefined {
  if (!isRecord(input)) {
    issues.push("course: expected an object");
    return undefined;
  }
  allowedKeys(input, ["schemaVersion", "id", "version", "title", "description", "tags", "phases"], "course", issues);
  if (input.schemaVersion !== 2) issues.push("course.schemaVersion: expected 2");
  id(input.id, "course.id", issues);
  positiveInteger(input.version, "course.version", Number.MAX_SAFE_INTEGER, issues);
  text(input.title, "course.title", issues);
  text(input.description, "course.description", issues, true);
  tagList(input.tags, "course.tags", new Set(catalog.tags.map((tag) => tag.id)), issues);
  if (!Array.isArray(input.phases) || input.phases.length === 0) {
    issues.push("course.phases: expected at least one phase");
    return undefined;
  }
  const exercises = new Map(catalog.exercises.map((exercise) => [exercise.id, exercise]));
  uniqueIds(input.phases, "course.phases", issues);
  input.phases.forEach((phase, phaseIndex) => {
    const path = `course.phases[${phaseIndex}]`;
    if (!isRecord(phase)) {
      issues.push(`${path}: expected a phase object`);
      return;
    }
    allowedKeys(phase, ["id", "name", "items"], path, issues);
    id(phase.id, `${path}.id`, issues);
    text(phase.name, `${path}.name`, issues);
    if (!Array.isArray(phase.items) || phase.items.length === 0) {
      issues.push(`${path}.items: expected at least one item`);
      return;
    }
    uniqueIds(phase.items, `${path}.items`, issues);
    phase.items.forEach((item, itemIndex) => validateItem(item, `${path}.items[${itemIndex}]`, exercises, issues, true));
  });
  return input as unknown as CourseDefinition;
}

function resolveExercise(item: CourseExerciseItem, exercise: ExerciseDefinition): ClassEntry {
  return {
    type: "exercise",
    id: item.id,
    name: exercise.name,
    durationSeconds: item.durationSeconds,
    ...(item.shortDescription === undefined
      ? exercise.shortDescription === undefined ? {} : { shortDescription: exercise.shortDescription }
      : { shortDescription: item.shortDescription }),
    ...(exercise.longDescription === undefined ? {} : { longDescription: exercise.longDescription }),
    ...(exercise.illustration === undefined ? {} : { illustration: exercise.illustration }),
    ...(exercise.motionIllustrations === undefined ? {} : { motionIllustrations: exercise.motionIllustrations }),
    exerciseReference: {
      exerciseId: exercise.id,
      exerciseVersion: exercise.version,
      ...(item.side === undefined ? {} : { side: item.side }),
      tags: exercise.tags
    }
  };
}

function resolveChild(item: CourseCircuitChild, exercises: ReadonlyMap<string, ExerciseDefinition>): ClassEntry {
  if (item.type === "rest") return { ...item, name: "REST" };
  return resolveExercise(item, exercises.get(item.exerciseId)!);
}

function resolveItem(item: CourseItem, exercises: ReadonlyMap<string, ExerciseDefinition>): ClassEntry[] {
  if (item.type !== "circuit") return [resolveChild(item, exercises)];
  const children = item.items.map((child) => resolveChild(child, exercises));
  if ((item.rounds ?? 1) === 1) return children;
  return [{ type: "repeat", id: item.id, rounds: item.rounds!, items: children }];
}

export function resolveCourseDefinition(catalogInput: unknown, courseInput: unknown): FitnessClassDefinition {
  const issues: string[] = [];
  const catalog = validateCatalog(catalogInput, issues);
  const course = catalog ? validateCourse(courseInput, catalog, issues) : undefined;
  if (!catalog || !course || issues.length > 0) throw new CourseResolutionError(issues);

  const exercises = new Map(catalog.exercises.map((exercise) => [exercise.id, exercise]));
  const resolved = {
    schemaVersion: 1,
    id: course.id,
    version: course.version,
    title: course.title,
    ...(course.description === undefined ? {} : { description: course.description }),
    phases: course.phases.map((phase) => ({
      id: phase.id,
      name: phase.name,
      items: phase.items.flatMap((item) => resolveItem(item, exercises))
    }))
  } satisfies FitnessClassDefinition;

  return validateClassDefinition(resolved);
}
