import { useEffect, useRef } from "react";
import type { TimerStatus } from "../domain/timer-state";
import type { RuntimeStep } from "../domain/timeline";
import { playAudioCue } from "../lib/audio-cues";

interface AudioCueState {
  enabled: boolean;
  status: TimerStatus;
  stepIndex: number;
  stepKind?: RuntimeStep["kind"];
  remainingMs: number;
}

export function useAudioCues({
  enabled,
  status,
  stepIndex,
  stepKind,
  remainingMs
}: AudioCueState): void {
  const previousStepIndex = useRef(stepIndex);
  const previousStatus = useRef(status);
  const lastCountdownKey = useRef("");

  useEffect(() => {
    if (
      enabled &&
      status === "running" &&
      stepIndex !== previousStepIndex.current &&
      document.visibilityState === "visible"
    ) {
      playAudioCue(stepKind === "rest" ? "rest" : "exercise");
    }
    previousStepIndex.current = stepIndex;
  }, [enabled, status, stepIndex, stepKind]);

  useEffect(() => {
    if (enabled && status === "complete" && previousStatus.current !== "complete") {
      playAudioCue("complete");
    }
    previousStatus.current = status;
  }, [enabled, status]);

  useEffect(() => {
    if (!enabled || status !== "running") {
      return;
    }
    const remainingSeconds = Math.ceil(remainingMs / 1_000);
    const key = `${stepIndex}:${remainingSeconds}`;
    if (
      remainingSeconds > 0 &&
      remainingSeconds <= 3 &&
      key !== lastCountdownKey.current
    ) {
      lastCountdownKey.current = key;
      playAudioCue("countdown");
    }
  }, [enabled, remainingMs, status, stepIndex]);
}
