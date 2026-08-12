import type { ClassEntry, FitnessClassDefinition } from "./class-definition";
import type {
  CompiledClass,
  CompiledPhase,
  RuntimePhase,
  RuntimeRound,
  RuntimeStep
} from "./timeline";
import { validateClassDefinition } from "./validate-class";

interface DraftStep extends Omit<RuntimeStep, "step"> {
  displayContextId: string;
}

interface WalkContext {
  phase: RuntimePhase;
  runtimePath: string;
  roundPath: RuntimeRound[];
  displayContextId: string;
}

function toDraftStep(entry: Exclude<ClassEntry, { type: "repeat" }>, context: WalkContext): DraftStep {
  const durationMs = entry.durationSeconds * 1_000;
  const currentRound = context.roundPath.at(-1);
  const base = {
    runtimeId: `${context.runtimePath}/${entry.id}`,
    sourceId: entry.id,
    kind: entry.type,
    name: entry.name ?? "Break",
    durationMs,
    startsAtMs: 0,
    endsAtMs: 0,
    phase: context.phase,
    roundPath: context.roundPath,
    displayContextId: context.displayContextId,
    ...(currentRound === undefined ? {} : { round: currentRound })
  };

  if (entry.type === "exercise") {
    return {
      ...base,
      ...(entry.shortDescription === undefined ? {} : { shortDescription: entry.shortDescription }),
      ...(entry.longDescription === undefined ? {} : { longDescription: entry.longDescription }),
      ...(entry.illustration === undefined ? {} : { illustration: entry.illustration }),
      ...(entry.motionIllustrations === undefined
        ? {}
        : { motionIllustrations: entry.motionIllustrations })
    };
  }

  return {
    ...base,
    ...(entry.shortDescription === undefined ? {} : { shortDescription: entry.shortDescription })
  };
}

function expandEntries(entries: readonly ClassEntry[], context: WalkContext, output: DraftStep[]): void {
  for (const entry of entries) {
    if (entry.type !== "repeat") {
      output.push(toDraftStep(entry, context));
      continue;
    }

    for (let roundIndex = 1; roundIndex <= entry.rounds; roundIndex += 1) {
      const round: RuntimeRound = {
        repeatId: entry.id,
        index: roundIndex,
        count: entry.rounds
      };
      const repeatRuntimePath = `${context.runtimePath}/${entry.id}[${roundIndex}]`;
      expandEntries(entry.items, {
        phase: context.phase,
        runtimePath: repeatRuntimePath,
        roundPath: [...context.roundPath, round],
        displayContextId: repeatRuntimePath
      }, output);
    }
  }
}

function assignPositions(drafts: readonly DraftStep[]): RuntimeStep[] {
  const counts = new Map<string, number>();
  const positions = new Map<string, number>();

  for (const step of drafts) {
    counts.set(step.displayContextId, (counts.get(step.displayContextId) ?? 0) + 1);
  }

  return drafts.map(({ displayContextId, ...step }) => {
    const index = (positions.get(displayContextId) ?? 0) + 1;
    positions.set(displayContextId, index);
    return {
      ...step,
      step: {
        index,
        count: counts.get(displayContextId) ?? 1
      }
    };
  });
}

export function compileClass(input: unknown): CompiledClass {
  const definition: FitnessClassDefinition = validateClassDefinition(input);
  const drafts: DraftStep[] = [];

  definition.phases.forEach((phase, phaseIndex) => {
    const runtimePhase: RuntimePhase = {
      id: phase.id,
      name: phase.name,
      index: phaseIndex + 1,
      count: definition.phases.length
    };
    const phasePath = `${definition.id}/${phase.id}`;
    expandEntries(phase.items, {
      phase: runtimePhase,
      runtimePath: phasePath,
      roundPath: [],
      displayContextId: phasePath
    }, drafts);
  });

  let elapsedMs = 0;
  const positionedSteps = assignPositions(drafts).map((step) => {
    const startsAtMs = elapsedMs;
    elapsedMs += step.durationMs;
    return {
      ...step,
      startsAtMs,
      endsAtMs: elapsedMs
    };
  });

  const phases: CompiledPhase[] = definition.phases.map((phase, index) => {
    const phaseSteps = positionedSteps.filter((step) => step.phase.id === phase.id);
    return {
      id: phase.id,
      name: phase.name,
      index: index + 1,
      stepCount: phaseSteps.length,
      durationMs: phaseSteps.reduce((total, step) => total + step.durationMs, 0)
    };
  });

  return {
    definition,
    steps: positionedSteps,
    phases,
    totalDurationMs: elapsedMs
  };
}
