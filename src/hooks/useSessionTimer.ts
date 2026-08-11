import { useCallback, useEffect, useState } from "react";
import type { CompiledClass } from "../domain/timeline";
import {
  createTimerState,
  getSessionElapsedMs,
  nextTimer,
  pauseTimer,
  previousTimer,
  reconcileTimer,
  resumeTimer,
  seekTimer,
  startTimer,
  type TimerState
} from "../domain/timer-state";
import { clearStoredSession, saveStoredSession } from "../persistence/session-store";

export interface SessionInitialization {
  startedAtEpochMs: number;
  initializedAtEpochMs: number;
  elapsedMsFloor?: number;
  timerState?: TimerState;
}

export function useSessionTimer(
  fitnessClass: CompiledClass,
  initialization: SessionInitialization
) {
  const { steps } = fitnessClass;
  const { startedAtEpochMs } = initialization;
  const initialNowEpochMs = initialization.initializedAtEpochMs;
  const [nowEpochMs, setNowEpochMs] = useState(initialNowEpochMs);
  const [sessionElapsedMs, setSessionElapsedMs] = useState(() =>
    getSessionElapsedMs(
      startedAtEpochMs,
      initialNowEpochMs,
      initialization.elapsedMsFloor ?? 0
    )
  );
  const [state, setState] = useState<TimerState>(() => {
    const initialState =
      initialization.timerState ?? startTimer(createTimerState(steps), startedAtEpochMs);
    return reconcileTimer(initialState, steps, initialNowEpochMs);
  });

  useEffect(() => {
    if (state.status === "complete") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      setNowEpochMs(now);
      setSessionElapsedMs((previous) =>
        getSessionElapsedMs(startedAtEpochMs, now, previous)
      );
      setState((current) => reconcileTimer(current, steps, now));
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [startedAtEpochMs, state.status, steps]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }
      const now = Date.now();
      setNowEpochMs(now);
      setSessionElapsedMs((previous) =>
        getSessionElapsedMs(startedAtEpochMs, now, previous)
      );
      setState((current) => reconcileTimer(current, steps, now));
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [startedAtEpochMs, steps]);

  const updateAtCurrentTime = useCallback(
    (transition: (current: TimerState, now: number) => TimerState) => {
      const now = Date.now();
      setNowEpochMs(now);
      setSessionElapsedMs((previous) =>
        getSessionElapsedMs(startedAtEpochMs, now, previous)
      );
      setState((current) => transition(current, now));
    },
    [startedAtEpochMs]
  );

  const pause = useCallback(
    () => updateAtCurrentTime((current, now) => pauseTimer(current, steps, now)),
    [steps, updateAtCurrentTime]
  );
  const resume = useCallback(
    () => updateAtCurrentTime((current, now) => resumeTimer(current, steps, now)),
    [steps, updateAtCurrentTime]
  );
  const previous = useCallback(
    () => updateAtCurrentTime((current, now) => previousTimer(current, steps, now)),
    [steps, updateAtCurrentTime]
  );
  const next = useCallback(
    () => updateAtCurrentTime((current, now) => nextTimer(current, steps, now)),
    [steps, updateAtCurrentTime]
  );
  const seek = useCallback(
    (elapsedMs: number) =>
      updateAtCurrentTime((current, now) => seekTimer(current, steps, elapsedMs, now)),
    [steps, updateAtCurrentTime]
  );

  const persistedSecond = Math.floor(sessionElapsedMs / 1_000);
  const persistenceStateKey =
    state.status === "running"
      ? `${state.status}:${state.stepIndex}:${state.targetEndEpochMs}`
      : state.status === "paused"
        ? `${state.status}:${state.stepIndex}:${state.remainingMs}`
        : state.status;
  useEffect(() => {
    if (state.status === "complete") {
      clearStoredSession();
      return;
    }
    if (state.status === "ready") {
      return;
    }

    const common = {
      version: 1 as const,
      classId: fitnessClass.definition.id,
      classVersion: fitnessClass.definition.version,
      startedAtEpochMs,
      elapsedMsFloor: persistedSecond * 1_000,
      stepIndex: state.stepIndex,
      savedAtEpochMs: startedAtEpochMs + persistedSecond * 1_000
    };
    saveStoredSession(
      state.status === "running"
        ? { ...common, status: "running", targetEndEpochMs: state.targetEndEpochMs }
        : { ...common, status: "paused", remainingMs: state.remainingMs }
    );
  }, [fitnessClass.definition.id, fitnessClass.definition.version, persistedSecond, persistenceStateKey, startedAtEpochMs, state]);

  return { state, nowEpochMs, sessionElapsedMs, pause, resume, previous, next, seek };
}
