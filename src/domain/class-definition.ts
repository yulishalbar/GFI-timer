export interface FitnessClassDefinition {
  schemaVersion: 1;
  id: string;
  version: number;
  title: string;
  description?: string;
  /** Suppress all exercise media for this class while retaining shared catalog visuals. */
  visualsDisabled?: boolean;
  phases: PhaseDefinition[];
}

export interface PhaseDefinition {
  id: string;
  name: string;
  items: ClassEntry[];
}

export type ClassEntry = ExerciseEntry | RestEntry | RepeatEntry;
export type MotionIllustrations = [string, string, ...string[]];

export interface ExerciseEntry {
  type: "exercise";
  id: string;
  name: string;
  durationSeconds: number;
  shortDescription?: string;
  longDescription?: string;
  /** Preferred visual: the id of a pose rig in `src/rig`. */
  rig?: string;
  illustration?: string;
  motionIllustrations?: MotionIllustrations;
  exerciseReference?: ResolvedExerciseReference;
}

export interface ResolvedExerciseReference {
  exerciseId: string;
  exerciseVersion: number;
  side?: "left" | "right";
  tags: string[];
}

export interface RestEntry {
  type: "rest";
  id: string;
  name?: string;
  durationSeconds: number;
  shortDescription?: string;
}

export interface RepeatEntry {
  type: "repeat";
  id: string;
  rounds: number;
  items: ClassEntry[];
}
