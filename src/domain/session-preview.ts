import type { RuntimeStep } from "./timeline";

export interface SessionPreview {
  primary?: RuntimeStep;
  circuitExerciseNames: string[];
}

/**
 * How long before a step ends to start previewing the next movement.
 *
 * A fixed ten seconds is a third of a thirty-second drill and half of a twenty
 * second one, so it arrives while there is still real work left to do. The lead
 * scales with the step, and the shortest steps get none at all: there is no
 * point pulling attention away from something that is nearly over anyway.
 */
export function previewLeadMs(stepDurationMs: number): number {
  if (stepDurationMs < 20_000) return 0;
  if (stepDurationMs <= 30_000) return 5_000;
  return 10_000;
}

function findNextExerciseIndex(steps: readonly RuntimeStep[], fromIndex: number): number {
  return steps.findIndex((step, index) => index > fromIndex && step.kind === "exercise");
}

export function getSessionPreview(
  steps: readonly RuntimeStep[],
  currentIndex: number
): SessionPreview {
  const immediateNext = steps[currentIndex + 1];
  const currentStep = steps[currentIndex];

  if (currentStep?.kind !== "rest") {
    return {
      ...(immediateNext === undefined ? {} : { primary: immediateNext }),
      circuitExerciseNames: []
    };
  }

  const nextExerciseIndex = findNextExerciseIndex(steps, currentIndex);
  const primary = steps[nextExerciseIndex];
  if (primary === undefined) {
    return { circuitExerciseNames: [] };
  }

  const circuitExerciseNames: string[] = [];
  if (currentStep?.kind === "rest") {
    const seenSourceIds = new Set<string>();
    for (let index = nextExerciseIndex; index < steps.length; index += 1) {
      const step = steps[index];
      if (step === undefined || step.phase.id !== primary.phase.id) {
        break;
      }
      if (step.kind === "exercise" && !seenSourceIds.has(step.sourceId)) {
        seenSourceIds.add(step.sourceId);
        circuitExerciseNames.push(step.name);
      }
    }
  }

  return {
    primary,
    circuitExerciseNames
  };
}
