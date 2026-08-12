import type { RuntimeStep } from "./timeline";

export interface SessionPreview {
  primary?: RuntimeStep;
  circuitExerciseNames: string[];
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
