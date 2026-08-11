import { describe, expect, it } from "vitest";
import { compileClass } from "./compile-class";
import {
  createTimerState,
  getRemainingMs,
  getScheduledElapsedMs,
  getSessionElapsedMs,
  nextTimer,
  pauseTimer,
  previousTimer,
  reconcileTimer,
  resumeTimer,
  seekTimer,
  startTimer
} from "./timer-state";

const timeline = compileClass({
  schemaVersion: 1,
  id: "timer-test",
  version: 1,
  title: "Timer test",
  phases: [
    {
      id: "main",
      name: "Main",
      items: [
        { type: "exercise", id: "first", name: "First", durationSeconds: 10 },
        { type: "rest", id: "transition", name: "Transition", durationSeconds: 3 },
        { type: "exercise", id: "last", name: "Last", durationSeconds: 7 }
      ]
    }
  ]
});

describe("timer state", () => {
  it("starts from an absolute end timestamp, pauses exactly, and resumes", () => {
    const ready = createTimerState(timeline.steps);
    const running = startTimer(ready, 1_000);
    expect(running).toEqual({ status: "running", stepIndex: 0, targetEndEpochMs: 11_000 });

    const paused = pauseTimer(running, timeline.steps, 4_250);
    expect(paused).toEqual({ status: "paused", stepIndex: 0, remainingMs: 6_750 });
    expect(getRemainingMs(paused, timeline.steps, 50_000)).toBe(6_750);

    expect(resumeTimer(paused, timeline.steps, 8_000)).toEqual({
      status: "running",
      stepIndex: 0,
      targetEndEpochMs: 14_750
    });
  });

  it("advances at an exact boundary and consumes a delayed update across steps", () => {
    const running = startTimer(createTimerState(timeline.steps), 1_000);
    expect(reconcileTimer(running, timeline.steps, 11_000)).toEqual({
      status: "running",
      stepIndex: 1,
      targetEndEpochMs: 14_000
    });
    expect(reconcileTimer(running, timeline.steps, 15_500)).toEqual({
      status: "running",
      stepIndex: 2,
      targetEndEpochMs: 21_000
    });
    expect(reconcileTimer(running, timeline.steps, 21_000)).toEqual({
      status: "complete",
      stepIndex: 2
    });
  });

  it("seeks while running or paused and clamps to the current step", () => {
    const running = startTimer(createTimerState(timeline.steps), 0);
    expect(seekTimer(running, timeline.steps, 4_000, 1_000)).toEqual({
      status: "running",
      stepIndex: 0,
      targetEndEpochMs: 7_000
    });

    const paused = pauseTimer(running, timeline.steps, 1_000);
    expect(seekTimer(paused, timeline.steps, -100, 9_000)).toEqual({
      status: "paused",
      stepIndex: 0,
      remainingMs: 10_000
    });
    expect(seekTimer(paused, timeline.steps, 50_000, 9_000)).toEqual({
      status: "paused",
      stepIndex: 0,
      remainingMs: 0
    });
  });

  it("navigates deterministically at the first, middle, and final steps", () => {
    const running = startTimer(createTimerState(timeline.steps), 0);
    expect(previousTimer(running, timeline.steps, 2_000)).toEqual({
      status: "running",
      stepIndex: 0,
      targetEndEpochMs: 12_000
    });

    const middle = nextTimer(running, timeline.steps, 2_000);
    expect(middle).toEqual({ status: "running", stepIndex: 1, targetEndEpochMs: 5_000 });
    expect(previousTimer(middle, timeline.steps, 3_000)).toEqual({
      status: "running",
      stepIndex: 0,
      targetEndEpochMs: 13_000
    });

    const last = nextTimer(middle, timeline.steps, 3_000);
    expect(nextTimer(last, timeline.steps, 4_000)).toEqual({
      status: "complete",
      stepIndex: 2
    });
  });

  it("derives overall progress from the compiled offset and current timestamp", () => {
    const running = startTimer(createTimerState(timeline.steps), 1_000);
    expect(getScheduledElapsedMs(running, timeline.steps, timeline.totalDurationMs, 4_500)).toBe(
      3_500
    );

    const transition = reconcileTimer(running, timeline.steps, 12_000);
    expect(getScheduledElapsedMs(transition, timeline.steps, timeline.totalDurationMs, 12_000)).toBe(
      11_000
    );
  });

  it("uses the same absolute timestamp behavior after a simulated restore", () => {
    const restoredRunning = { status: "running", stepIndex: 0, targetEndEpochMs: 5_000 } as const;
    expect(reconcileTimer(restoredRunning, timeline.steps, 14_000)).toEqual({
      status: "running",
      stepIndex: 2,
      targetEndEpochMs: 15_000
    });

    const restoredPaused = { status: "paused", stepIndex: 1, remainingMs: 1_500 } as const;
    expect(reconcileTimer(restoredPaused, timeline.steps, 99_000)).toBe(restoredPaused);
  });

  it("follows epoch-clock changes without counting interval callbacks", () => {
    const running = startTimer(createTimerState(timeline.steps), 10_000);
    expect(getRemainingMs(running, timeline.steps, 12_000)).toBe(8_000);
    expect(getRemainingMs(running, timeline.steps, 9_000)).toBe(11_000);
    expect(reconcileTimer(running, timeline.steps, 9_000)).toBe(running);
  });

  it("keeps real session elapsed time advancing during pauses and never decreases", () => {
    expect(getSessionElapsedMs(10_000, 14_000, 0)).toBe(4_000);
    expect(getSessionElapsedMs(10_000, 18_000, 4_000)).toBe(8_000);
    expect(getSessionElapsedMs(10_000, 12_000, 8_000)).toBe(8_000);
  });
});
