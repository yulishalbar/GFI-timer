import type {
  CourseCircuitChild,
  CourseDefinition,
  CourseExerciseItem,
  CourseItem,
  CourseRestItem,
  ExerciseCatalog,
  ExerciseDefinition,
  TagDefinition
} from "./catalog-definition";
import type { ClassEntry, FitnessClassDefinition } from "./class-definition";

interface LegacyCatalogOptions {
  tags: readonly TagDefinition[];
  courseTags: string[];
  exerciseTags: string[];
}

export interface AdaptedLegacyCourse {
  catalog: ExerciseCatalog;
  course: CourseDefinition;
}

function canonicalExerciseId(classId: string, phaseId: string, path: readonly string[], entryId: string): string {
  return [classId, phaseId, ...path, entryId].join("-");
}

function adaptEntry(
  entry: ClassEntry,
  classId: string,
  phaseId: string,
  path: readonly string[],
  exerciseTags: string[],
  exercises: ExerciseDefinition[]
): CourseItem {
  if (entry.type === "rest") {
    return {
      type: "rest",
      id: entry.id,
      name: "REST",
      durationSeconds: entry.durationSeconds,
      ...(entry.shortDescription === undefined ? {} : { shortDescription: entry.shortDescription })
    } satisfies CourseRestItem;
  }

  if (entry.type === "repeat") {
    const children = entry.items.map((child) => {
      const adapted = adaptEntry(child, classId, phaseId, [...path, entry.id], exerciseTags, exercises);
      if (adapted.type === "circuit") {
        throw new Error("The V2 migration adapter does not support nested legacy repeats");
      }
      return adapted;
    });
    return {
      type: "circuit",
      id: entry.id,
      name: entry.id,
      rounds: entry.rounds,
      items: children satisfies CourseCircuitChild[]
    };
  }

  const exerciseId = canonicalExerciseId(classId, phaseId, path, entry.id);
  exercises.push({
    schemaVersion: 1,
    id: exerciseId,
    version: 1,
    name: entry.name,
    ...(entry.shortDescription === undefined ? {} : { shortDescription: entry.shortDescription }),
    ...(entry.longDescription === undefined ? {} : { longDescription: entry.longDescription }),
    ...(entry.illustration === undefined ? {} : { illustration: entry.illustration }),
    ...(entry.motionIllustrations === undefined ? {} : { motionIllustrations: entry.motionIllustrations }),
    sideSupport: "none",
    tags: exerciseTags
  });
  return {
    type: "exercise",
    id: entry.id,
    exerciseId,
    exerciseVersion: 1,
    durationSeconds: entry.durationSeconds
  } satisfies CourseExerciseItem;
}

export function adaptLegacyClassToCatalog(
  definition: FitnessClassDefinition,
  options: LegacyCatalogOptions
): AdaptedLegacyCourse {
  const exercises: ExerciseDefinition[] = [];
  const phases = definition.phases.map((phase) => ({
    id: phase.id,
    name: phase.name,
    items: phase.items.map((entry) =>
      adaptEntry(entry, definition.id, phase.id, [], options.exerciseTags, exercises)
    )
  }));

  return {
    catalog: {
      schemaVersion: 1,
      tags: [...options.tags],
      exercises
    },
    course: {
      schemaVersion: 2,
      id: definition.id,
      version: definition.version,
      title: definition.title,
      ...(definition.description === undefined ? {} : { description: definition.description }),
      tags: options.courseTags,
      phases
    }
  };
}
