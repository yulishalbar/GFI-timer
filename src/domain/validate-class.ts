import type {
  ClassEntry,
  FitnessClassDefinition,
  PhaseDefinition
} from "./class-definition";

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_REPEAT_DEPTH = 4;
const MAX_ROUNDS = 100;
const MAX_STEP_SECONDS = 6 * 60 * 60;
const MAX_EXPANDED_STEPS = 10_000;
const MAX_CLASS_SECONDS = 24 * 60 * 60;

type RecordValue = Record<string, unknown>;

export class ClassValidationError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Invalid fitness class:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
    this.name = "ClassValidationError";
    this.issues = issues;
  }
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function checkAllowedKeys(
  value: RecordValue,
  allowed: readonly string[],
  path: string,
  issues: string[]
): void {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedSet.has(key)) {
      issues.push(`${path}.${key}: unknown property`);
    }
  }
}

function checkId(value: unknown, path: string, issues: string[]): void {
  if (typeof value !== "string" || !ID_PATTERN.test(value)) {
    issues.push(`${path}: expected a lowercase kebab-case ID`);
  }
}

function checkRequiredText(value: unknown, path: string, issues: string[]): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    issues.push(`${path}: expected non-empty text`);
  }
}

function checkOptionalText(value: unknown, path: string, issues: string[]): void {
  if (value !== undefined && (typeof value !== "string" || value.trim().length === 0)) {
    issues.push(`${path}: expected non-empty text when provided`);
  }
}

function checkPositiveInteger(
  value: unknown,
  path: string,
  maximum: number,
  issues: string[]
): void {
  if (!Number.isInteger(value) || typeof value !== "number" || value <= 0 || value > maximum) {
    issues.push(`${path}: expected a positive integer no greater than ${maximum}`);
  }
}

function checkIllustration(value: unknown, path: string, issues: string[]): void {
  if (value === undefined) {
    return;
  }

  if (
    typeof value !== "string" ||
    value.startsWith("/") ||
    value.includes("..") ||
    !/^[a-zA-Z0-9][a-zA-Z0-9/_-]*\.(?:svg|png|jpe?g|webp)$/.test(value)
  ) {
    issues.push(`${path}: expected a safe relative SVG, PNG, JPEG, or WebP path`);
  }
}

function checkMotionIllustrations(value: unknown, path: string, issues: string[]): void {
  if (value === undefined) {
    return;
  }
  if (!Array.isArray(value) || value.length < 2) {
    issues.push(`${path}: expected at least two local illustration paths`);
    return;
  }
  value.forEach((frame, index) => checkIllustration(frame, `${path}[${index}]`, issues));
}

function checkExerciseReference(value: unknown, path: string, issues: string[]): void {
  if (value === undefined) {
    return;
  }
  if (!isRecord(value)) {
    issues.push(`${path}: expected an exercise reference object`);
    return;
  }
  checkAllowedKeys(value, ["exerciseId", "exerciseVersion", "side", "tags"], path, issues);
  checkId(value.exerciseId, `${path}.exerciseId`, issues);
  checkPositiveInteger(value.exerciseVersion, `${path}.exerciseVersion`, Number.MAX_SAFE_INTEGER, issues);
  if (value.side !== undefined && value.side !== "left" && value.side !== "right") {
    issues.push(`${path}.side: expected "left" or "right" when provided`);
  }
  if (!Array.isArray(value.tags) || value.tags.some((tag) => typeof tag !== "string" || !ID_PATTERN.test(tag))) {
    issues.push(`${path}.tags: expected lowercase kebab-case tag IDs`);
  }
}

function checkUniqueIds(items: readonly unknown[], path: string, issues: string[]): void {
  const seen = new Set<string>();
  items.forEach((item, index) => {
    if (!isRecord(item) || typeof item.id !== "string") {
      return;
    }
    if (seen.has(item.id)) {
      issues.push(`${path}[${index}].id: duplicate ID "${item.id}" in this group`);
    }
    seen.add(item.id);
  });
}

function validateTimedEntry(
  value: RecordValue,
  path: string,
  issues: string[],
  kind: "exercise" | "rest"
): void {
  const commonKeys = ["type", "id", "name", "durationSeconds", "shortDescription"];
  const allowed =
    kind === "exercise"
      ? [...commonKeys, "longDescription", "rig", "illustration", "motionIllustrations", "exerciseReference"]
      : commonKeys;
  checkAllowedKeys(value, allowed, path, issues);
  checkId(value.id, `${path}.id`, issues);

  if (kind === "exercise") {
    checkRequiredText(value.name, `${path}.name`, issues);
    checkOptionalText(value.longDescription, `${path}.longDescription`, issues);
    if (value.rig !== undefined) checkId(value.rig, `${path}.rig`, issues);
    checkIllustration(value.illustration, `${path}.illustration`, issues);
    checkMotionIllustrations(value.motionIllustrations, `${path}.motionIllustrations`, issues);
    checkExerciseReference(value.exerciseReference, `${path}.exerciseReference`, issues);
  } else {
    checkOptionalText(value.name, `${path}.name`, issues);
  }

  checkPositiveInteger(
    value.durationSeconds,
    `${path}.durationSeconds`,
    MAX_STEP_SECONDS,
    issues
  );
  checkOptionalText(value.shortDescription, `${path}.shortDescription`, issues);
}

function validateEntry(
  value: unknown,
  path: string,
  issues: string[],
  repeatDepth: number
): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected an exercise, rest, or repeat object`);
    return;
  }

  if (value.type === "exercise" || value.type === "rest") {
    validateTimedEntry(value, path, issues, value.type);
    return;
  }

  if (value.type !== "repeat") {
    issues.push(`${path}.type: expected "exercise", "rest", or "repeat"`);
    return;
  }

  checkAllowedKeys(value, ["type", "id", "rounds", "items"], path, issues);
  checkId(value.id, `${path}.id`, issues);
  checkPositiveInteger(value.rounds, `${path}.rounds`, MAX_ROUNDS, issues);

  if (repeatDepth >= MAX_REPEAT_DEPTH) {
    issues.push(`${path}: repeat nesting cannot exceed ${MAX_REPEAT_DEPTH} levels`);
  }

  if (!Array.isArray(value.items) || value.items.length === 0) {
    issues.push(`${path}.items: expected at least one item`);
    return;
  }

  checkUniqueIds(value.items, `${path}.items`, issues);
  value.items.forEach((item, index) =>
    validateEntry(item, `${path}.items[${index}]`, issues, repeatDepth + 1)
  );
}

function validatePhase(value: unknown, path: string, issues: string[]): void {
  if (!isRecord(value)) {
    issues.push(`${path}: expected a phase object`);
    return;
  }

  checkAllowedKeys(value, ["id", "name", "items"], path, issues);
  checkId(value.id, `${path}.id`, issues);
  checkRequiredText(value.name, `${path}.name`, issues);

  if (!Array.isArray(value.items) || value.items.length === 0) {
    issues.push(`${path}.items: expected at least one item`);
    return;
  }

  checkUniqueIds(value.items, `${path}.items`, issues);
  value.items.forEach((item, index) => validateEntry(item, `${path}.items[${index}]`, issues, 0));
}

function estimateEntries(entries: readonly ClassEntry[]): { steps: number; seconds: number } {
  return entries.reduce(
    (total, entry) => {
      if (entry.type !== "repeat") {
        return {
          steps: total.steps + 1,
          seconds: total.seconds + entry.durationSeconds
        };
      }

      const nested = estimateEntries(entry.items);
      return {
        steps: Math.min(MAX_EXPANDED_STEPS + 1, total.steps + nested.steps * entry.rounds),
        seconds: Math.min(MAX_CLASS_SECONDS + 1, total.seconds + nested.seconds * entry.rounds)
      };
    },
    { steps: 0, seconds: 0 }
  );
}

export function validateClassDefinition(value: unknown): FitnessClassDefinition {
  const issues: string[] = [];

  if (!isRecord(value)) {
    throw new ClassValidationError(["class: expected an object"]);
  }

  checkAllowedKeys(
    value,
    ["schemaVersion", "id", "version", "title", "description", "phases"],
    "class",
    issues
  );

  if (value.schemaVersion !== 1) {
    issues.push("class.schemaVersion: expected 1");
  }
  checkId(value.id, "class.id", issues);
  checkPositiveInteger(value.version, "class.version", Number.MAX_SAFE_INTEGER, issues);
  checkRequiredText(value.title, "class.title", issues);
  checkOptionalText(value.description, "class.description", issues);

  if (!Array.isArray(value.phases) || value.phases.length === 0) {
    issues.push("class.phases: expected at least one phase");
  } else {
    checkUniqueIds(value.phases, "class.phases", issues);
    value.phases.forEach((phase, index) => validatePhase(phase, `class.phases[${index}]`, issues));
  }

  if (issues.length > 0) {
    throw new ClassValidationError(issues);
  }

  const definition = value as unknown as FitnessClassDefinition;
  const estimate = definition.phases.reduce(
    (total, phase: PhaseDefinition) => {
      const phaseEstimate = estimateEntries(phase.items);
      return {
        steps: Math.min(MAX_EXPANDED_STEPS + 1, total.steps + phaseEstimate.steps),
        seconds: Math.min(MAX_CLASS_SECONDS + 1, total.seconds + phaseEstimate.seconds)
      };
    },
    { steps: 0, seconds: 0 }
  );

  if (estimate.steps > MAX_EXPANDED_STEPS) {
    issues.push(`class: expands to more than ${MAX_EXPANDED_STEPS} timed steps`);
  }
  if (estimate.seconds > MAX_CLASS_SECONDS) {
    issues.push(`class: duration exceeds ${MAX_CLASS_SECONDS} seconds`);
  }

  if (issues.length > 0) {
    throw new ClassValidationError(issues);
  }

  return definition;
}
