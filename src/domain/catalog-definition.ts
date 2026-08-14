export type ExerciseSide = "left" | "right";
export type ExerciseSideSupport = "none" | "left-right";
export type MotionIllustrations = [string, string, ...string[]];

export interface TagDefinition {
  id: string;
  label: string;
  category: "body-area" | "modality" | "equipment" | "movement-type" | "focus";
}

export interface ExerciseDefinition {
  schemaVersion: 1;
  id: string;
  version: number;
  name: string;
  shortDescription?: string;
  longDescription?: string;
  illustration?: string;
  motionIllustrations?: MotionIllustrations;
  sideSupport: ExerciseSideSupport;
  tags: string[];
}

export interface ExerciseCatalog {
  schemaVersion: 1;
  tags: TagDefinition[];
  exercises: ExerciseDefinition[];
}

export interface CourseDefinition {
  schemaVersion: 2;
  id: string;
  version: number;
  title: string;
  description?: string;
  tags: string[];
  phases: CoursePhaseDefinition[];
}

export interface CoursePhaseDefinition {
  id: string;
  name: string;
  items: CourseItem[];
}

export type CourseItem = CourseExerciseItem | CourseRestItem | CourseCircuitItem;
export type CourseCircuitChild = CourseExerciseItem | CourseRestItem;

export interface CourseExerciseItem {
  type: "exercise";
  id: string;
  exerciseId: string;
  exerciseVersion: number;
  side?: ExerciseSide;
  durationSeconds: number;
  shortDescription?: string;
}

export interface CourseRestItem {
  type: "rest";
  id: string;
  name?: "REST";
  durationSeconds: number;
  shortDescription?: string;
}

export interface CourseCircuitItem {
  type: "circuit";
  id: string;
  name: string;
  rounds?: number;
  items: CourseCircuitChild[];
}
