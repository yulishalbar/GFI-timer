export interface FitnessClassDefinition {
  schemaVersion: 1;
  id: string;
  version: number;
  title: string;
  description?: string;
  phases: PhaseDefinition[];
}

export interface PhaseDefinition {
  id: string;
  name: string;
  items: ClassEntry[];
}

export type ClassEntry = ExerciseEntry | RestEntry | RepeatEntry;

export interface ExerciseEntry {
  type: "exercise";
  id: string;
  name: string;
  durationSeconds: number;
  shortDescription?: string;
  longDescription?: string;
  illustration?: string;
  motionIllustrations?: [string, string];
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
