import type { FitnessClassDefinition } from "./class-definition";

export interface RuntimePhase {
  id: string;
  name: string;
  index: number;
  count: number;
}

export interface RuntimeRound {
  repeatId: string;
  index: number;
  count: number;
}

export interface RuntimeStepPosition {
  index: number;
  count: number;
}

export interface RuntimeStep {
  runtimeId: string;
  sourceId: string;
  kind: "exercise" | "rest";
  name: string;
  durationMs: number;
  startsAtMs: number;
  endsAtMs: number;
  phase: RuntimePhase;
  round?: RuntimeRound;
  roundPath: RuntimeRound[];
  step: RuntimeStepPosition;
  shortDescription?: string;
  longDescription?: string;
  illustration?: string;
}

export interface CompiledPhase {
  id: string;
  name: string;
  index: number;
  stepCount: number;
  durationMs: number;
}

export interface CompiledClass {
  definition: FitnessClassDefinition;
  steps: RuntimeStep[];
  phases: CompiledPhase[];
  totalDurationMs: number;
}
