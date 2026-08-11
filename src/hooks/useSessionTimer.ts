import { useCallback, useEffect, useState } from "react";
import type { CompiledClass } from "../domain/timeline";
import {
  createTimerState,
  nextTimer,
  pauseTimer,
  previousTimer,
  reconcileTimer,
  resumeTimer,
  seekTimer,
  startTimer,
  type TimerState
} from "../domain/timer-state";

export function useSessionTimer(fitnessClass: CompiledClass, startedAtEpochMs: number) {
  const { steps } = fitnessClass;
  const [nowEpochMs, setNowEpochMs] = useState(startedAtEpochMs);
  const [state, setState] = useState<TimerState>(() =>
    startTimer(createTimerState(steps), startedAtEpochMs)
  );

  useEffect(() => {
    if (state.status !== "running") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      setNowEpochMs(now);
      setState((current) => reconcileTimer(current, steps, now));
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [state.status, steps]);

  const updateAtCurrentTime = useCallback(
    (transition: (current: TimerState, now: number) => TimerState) => {
      const now = Date.now();
      setNowEpochMs(now);
      setState((current) => transition(current, now));
    },
    []
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

  return { state, nowEpochMs, pause, resume, previous, next, seek };
}
