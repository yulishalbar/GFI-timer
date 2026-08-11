import type { RuntimeStep } from "./timeline";

export type TimerStatus = "ready" | "running" | "paused" | "complete";

export const MAX_STEP_EXTENSION_MS = 10 * 60 * 1_000;

export type TimerState =
  | { status: "ready"; stepIndex: number; remainingMs: number; stepDurationMs: number }
  | { status: "running"; stepIndex: number; targetEndEpochMs: number; stepDurationMs: number }
  | { status: "paused"; stepIndex: number; remainingMs: number; stepDurationMs: number }
  | { status: "complete"; stepIndex: number };

export function getSessionElapsedMs(
  startedAtEpochMs: number,
  nowEpochMs: number,
  previousElapsedMs: number
): number {
  return Math.max(0, previousElapsedMs, nowEpochMs - startedAtEpochMs);
}

function requireSteps(steps: readonly RuntimeStep[]): void {
  if (steps.length === 0) {
    throw new Error("A timer requires at least one compiled step.");
  }
}

export function createTimerState(steps: readonly RuntimeStep[]): TimerState {
  requireSteps(steps);
  const stepDurationMs = steps[0]?.durationMs ?? 0;
  return { status: "ready", stepIndex: 0, remainingMs: stepDurationMs, stepDurationMs };
}

export function getStepDurationMs(state: TimerState, steps: readonly RuntimeStep[]): number {
  return state.status === "complete"
    ? (steps[state.stepIndex]?.durationMs ?? 0)
    : state.stepDurationMs;
}

export function getRemainingMs(
  state: TimerState,
  steps: readonly RuntimeStep[],
  nowEpochMs: number
): number {
  if (state.status === "complete") {
    return 0;
  }
  if (state.status === "running") {
    return Math.max(0, state.targetEndEpochMs - nowEpochMs);
  }
  return Math.min(state.remainingMs, state.stepDurationMs);
}

export function reconcileTimer(
  state: TimerState,
  steps: readonly RuntimeStep[],
  nowEpochMs: number
): TimerState {
  requireSteps(steps);
  if (state.status !== "running" || state.targetEndEpochMs > nowEpochMs) {
    return state;
  }

  let stepIndex = state.stepIndex;
  let targetEndEpochMs = state.targetEndEpochMs;

  while (targetEndEpochMs <= nowEpochMs) {
    stepIndex += 1;
    const nextStep = steps[stepIndex];
    if (nextStep === undefined) {
      return { status: "complete", stepIndex: steps.length - 1 };
    }
    targetEndEpochMs += nextStep.durationMs;
  }

  return {
    status: "running",
    stepIndex,
    targetEndEpochMs,
    stepDurationMs: steps[stepIndex]?.durationMs ?? 0
  };
}

export function startTimer(state: TimerState, nowEpochMs: number): TimerState {
  if (state.status !== "ready") {
    return state;
  }
  return {
    status: "running",
    stepIndex: state.stepIndex,
    targetEndEpochMs: nowEpochMs + state.remainingMs,
    stepDurationMs: state.stepDurationMs
  };
}

export function pauseTimer(
  state: TimerState,
  steps: readonly RuntimeStep[],
  nowEpochMs: number
): TimerState {
  const reconciled = reconcileTimer(state, steps, nowEpochMs);
  if (reconciled.status !== "running") {
    return reconciled;
  }
  return {
    status: "paused",
    stepIndex: reconciled.stepIndex,
    remainingMs: getRemainingMs(reconciled, steps, nowEpochMs),
    stepDurationMs: reconciled.stepDurationMs
  };
}

export function resumeTimer(
  state: TimerState,
  steps: readonly RuntimeStep[],
  nowEpochMs: number
): TimerState {
  if (state.status !== "paused") {
    return state;
  }
  return reconcileTimer(
    {
      status: "running",
      stepIndex: state.stepIndex,
      targetEndEpochMs: nowEpochMs + state.remainingMs,
      stepDurationMs: state.stepDurationMs
    },
    steps,
    nowEpochMs
  );
}

function enterStep(
  state: TimerState,
  steps: readonly RuntimeStep[],
  stepIndex: number,
  nowEpochMs: number
): TimerState {
  const durationMs = steps[stepIndex]?.durationMs;
  if (durationMs === undefined) {
    return { status: "complete", stepIndex: steps.length - 1 };
  }
  if (state.status === "running") {
    return {
      status: "running",
      stepIndex,
      targetEndEpochMs: nowEpochMs + durationMs,
      stepDurationMs: durationMs
    };
  }
  if (state.status === "ready" && stepIndex === 0) {
    return { status: "ready", stepIndex, remainingMs: durationMs, stepDurationMs: durationMs };
  }
  return { status: "paused", stepIndex, remainingMs: durationMs, stepDurationMs: durationMs };
}

export function nextTimer(
  state: TimerState,
  steps: readonly RuntimeStep[],
  nowEpochMs: number
): TimerState {
  const reconciled = reconcileTimer(state, steps, nowEpochMs);
  return enterStep(reconciled, steps, reconciled.stepIndex + 1, nowEpochMs);
}

export function previousTimer(
  state: TimerState,
  steps: readonly RuntimeStep[],
  nowEpochMs: number
): TimerState {
  const reconciled = reconcileTimer(state, steps, nowEpochMs);
  return enterStep(reconciled, steps, Math.max(0, reconciled.stepIndex - 1), nowEpochMs);
}

export function seekTimer(
  state: TimerState,
  steps: readonly RuntimeStep[],
  elapsedMs: number,
  nowEpochMs: number
): TimerState {
  const reconciled = reconcileTimer(state, steps, nowEpochMs);
  if (reconciled.status === "complete") {
    return reconciled;
  }

  const durationMs = reconciled.stepDurationMs;
  const clampedElapsedMs = Math.min(durationMs, Math.max(0, elapsedMs));
  const remainingMs = durationMs - clampedElapsedMs;

  if (reconciled.status === "running") {
    return reconcileTimer(
      {
        status: "running",
        stepIndex: reconciled.stepIndex,
        targetEndEpochMs: nowEpochMs + remainingMs,
        stepDurationMs: reconciled.stepDurationMs
      },
      steps,
      nowEpochMs
    );
  }

  return { ...reconciled, remainingMs };
}

export function adjustTimer(
  state: TimerState,
  steps: readonly RuntimeStep[],
  adjustmentMs: number,
  nowEpochMs: number
): TimerState {
  const reconciled = reconcileTimer(state, steps, nowEpochMs);
  if (reconciled.status === "complete" || !Number.isFinite(adjustmentMs) || adjustmentMs === 0) {
    return reconciled;
  }

  const authoredDurationMs = steps[reconciled.stepIndex]?.durationMs ?? 0;
  const adjustedDurationMs = Math.min(
    authoredDurationMs + MAX_STEP_EXTENSION_MS,
    Math.max(0, reconciled.stepDurationMs + adjustmentMs)
  );
  const appliedAdjustmentMs = adjustedDurationMs - reconciled.stepDurationMs;
  const adjustedRemainingMs =
    getRemainingMs(reconciled, steps, nowEpochMs) + appliedAdjustmentMs;

  if (adjustedRemainingMs <= 0) {
    return enterStep(reconciled, steps, reconciled.stepIndex + 1, nowEpochMs);
  }

  if (reconciled.status === "running") {
    return {
      status: "running",
      stepIndex: reconciled.stepIndex,
      targetEndEpochMs: nowEpochMs + adjustedRemainingMs,
      stepDurationMs: adjustedDurationMs
    };
  }

  return {
    ...reconciled,
    remainingMs: adjustedRemainingMs,
    stepDurationMs: adjustedDurationMs
  };
}

export function getScheduledElapsedMs(
  state: TimerState,
  steps: readonly RuntimeStep[],
  totalDurationMs: number,
  nowEpochMs: number
): number {
  if (state.status === "complete") {
    return totalDurationMs;
  }
  const step = steps[state.stepIndex];
  if (step === undefined) {
    return totalDurationMs;
  }
  return step.startsAtMs + step.durationMs - getRemainingMs(state, steps, nowEpochMs);
}
