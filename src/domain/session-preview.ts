import type { RuntimeStep } from "./timeline";

export interface SessionPreview {
  primary?: RuntimeStep;
  circuitExerciseNames: string[];
  circuitOverview?: {
    exerciseNames: string[];
    perSide: boolean;
    breakDurationsMs: number[];
  };
}

/**
 * How long before a step ends to start previewing the next movement.
 *
 * The lead used to shrink on short steps, back when the look-ahead displaced
 * the movement being performed. It no longer does: the current guide keeps its
 * size and contrast and the preview sits beside it as a thumbnail, so showing
 * the handover early costs the instructor nothing. A single value also means
 * the handover always arrives at the same point on the countdown, which is one
 * less thing to relearn per drill.
 *
 * On a step shorter than the lead the preview is simply up for its whole
 * duration - which is what a five-second transition wants anyway.
 */
export const PREVIEW_LEAD_MS = 10_000;

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

  const phaseSteps = steps.filter((step) => step.phase.id === primary.phase.id);
  const exercises = phaseSteps.filter((step) => step.kind === "exercise");
  const left = exercises.filter((step) => step.exerciseReference?.side === "left");
  const right = exercises.filter((step) => step.exerciseReference?.side === "right");
  const perSide = left.length > 0 && left.length === right.length
    && left.every((step, index) => step.name === right[index]?.name)
    && exercises.every((step) => step.exerciseReference?.side !== undefined);
  // Preserve repeated movements within a side (such as a pyramid's return),
  // while omitting the matching opposite-side sequence.
  const overviewExercises = perSide ? left : exercises;
  const exerciseNames = overviewExercises.map((step) => step.name);
  const breakDurationsMs = [...new Set(phaseSteps
    .filter((step) => step.kind === "rest")
    .map((step) => step.durationMs))].sort((a, b) => a - b);

  return {
    primary,
    circuitExerciseNames: [...new Set(exerciseNames)],
    circuitOverview: { exerciseNames, perSide, breakDurationsMs }
  };
}
