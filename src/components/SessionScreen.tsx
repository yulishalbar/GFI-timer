import { useRef } from "react";
import type { CompiledClass } from "../domain/timeline";
import {
  getRemainingMs,
  getScheduledElapsedMs,
  getStepDurationMs
} from "../domain/timer-state";
import { useSessionTimer } from "../hooks/useSessionTimer";
import type { SessionInitialization } from "../hooks/useSessionTimer";
import { formatDuration } from "../lib/format-duration";
import { ExerciseDetails } from "./ExerciseDetails";
import { ExerciseMedia } from "./ExerciseMedia";
import { OverallProgress } from "./OverallProgress";
import { SessionControls } from "./SessionControls";
import { StepProgress } from "./StepProgress";
import { useAudioCues } from "../hooks/useAudioCues";
import { useWakeLock } from "../hooks/useWakeLock";
import { initializeAudioCues } from "../lib/audio-cues";
import { getSessionPreview, PREVIEW_LEAD_MS } from "../domain/session-preview";
import { hasExerciseMedia } from "../domain/step-media";
import { ExerciseSideBadge } from "./ExerciseSideBadge";

interface SessionScreenProps {
  fitnessClass: CompiledClass;
  initialization: SessionInitialization;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onExit: () => void;
}

const wallClockFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit"
});

function formatCountdown(durationMs: number): string {
  return formatDuration(Math.ceil(durationMs / 1_000) * 1_000, { padMinutes: true });
}

export function SessionScreen({
  fitnessClass,
  initialization,
  soundEnabled,
  onSoundToggle,
  onExit
}: SessionScreenProps) {
  const timer = useSessionTimer(fitnessClass, initialization);
  const { state, nowEpochMs } = timer;
  const wasRunningBeforeSeek = useRef(false);
  const audioStep = fitnessClass.steps[state.stepIndex];
  const audioRemainingMs = getRemainingMs(state, fitnessClass.steps, nowEpochMs);
  useAudioCues({
    enabled: soundEnabled,
    status: state.status,
    stepIndex: state.stepIndex,
    ...(audioStep === undefined ? {} : { stepKind: audioStep.kind }),
    remainingMs: audioRemainingMs
  });
  const wakeLockStatus = useWakeLock(true);

  if (state.status === "complete") {
    return (
      <main className="session-shell session-shell--complete" id="main-content">
        <p className="eyebrow">Class complete</p>
        <h1>Excellent work.</h1>
        <p>
          {fitnessClass.definition.title} is complete. Real elapsed time: {" "}
          <time className="session-complete-elapsed">{formatDuration(timer.sessionElapsedMs)}</time>.
        </p>
        <button className="primary-button" type="button" onClick={onExit}>
          Stop timer and return to class overview
          <span aria-hidden="true">→</span>
        </button>
      </main>
    );
  }

  const currentStep = fitnessClass.steps[state.stepIndex];
  if (currentStep === undefined) {
    return null;
  }
  const remainingMs = getRemainingMs(state, fitnessClass.steps, nowEpochMs);
  const stepDurationMs = getStepDurationMs(state, fitnessClass.steps);
  const elapsedStepMs = stepDurationMs - remainingMs;
  const scheduledElapsedMs = getScheduledElapsedMs(
    state,
    fitnessClass.steps,
    fitnessClass.totalDurationMs,
    nowEpochMs
  );
  const preview = getSessionPreview(fitnessClass.steps, state.stepIndex);
  const displayedPhase =
    currentStep.kind === "rest" && preview.primary ? preview.primary.phase : currentStep.phase;
  const isEnding = remainingMs <= PREVIEW_LEAD_MS;
  const isFinalThreeSeconds = state.status === "running" && remainingMs <= 3_000;

  const handleSeekStart = () => {
    wasRunningBeforeSeek.current = state.status === "running";
    if (wasRunningBeforeSeek.current) {
      timer.pause();
    }
  };
  const handleSeekEnd = () => {
    if (wasRunningBeforeSeek.current) {
      wasRunningBeforeSeek.current = false;
      timer.resume();
    }
  };

  return (
    <main
      className={`session-shell session-shell--${currentStep.kind}${isEnding ? " session-shell--ending" : ""}${isFinalThreeSeconds ? " session-shell--final-three" : ""}`}
      id="main-content"
    >
      <header className="session-topbar">
        <button type="button" onClick={onExit} aria-label="Exit session and return to class overview">
          <span aria-hidden="true">×</span>
          Exit
        </button>
        <span className="session-topbar__title">{fitnessClass.definition.title}</span>
        <div className="session-topbar__utilities">
          {wakeLockStatus === "unavailable" || wakeLockStatus === "error" ? (
            <span className="wake-warning">Screen lock unavailable</span>
          ) : null}
          <button
            type="button"
            className="sound-toggle"
            aria-pressed={!soundEnabled}
            onClick={onSoundToggle}
          >
            <span aria-hidden="true">{soundEnabled ? "♪" : "×"}</span>
            {soundEnabled ? "Sound on" : "Muted"}
          </button>
          <time dateTime={new Date(nowEpochMs).toISOString()}>
            {wallClockFormatter.format(nowEpochMs)}
          </time>
        </div>
      </header>

      <div className="session-dashboard">
        <section className="session-primary" aria-live="polite">
          <div className="session-status-row">
            <span className={`status-pill status-pill--${state.status}`}>{state.status}</span>
            <span>{currentStep.kind === "rest" ? "Transition" : "Exercise"}</span>
          </div>
          <p className="session-phase">
            Phase {displayedPhase.index}/{displayedPhase.count} · {displayedPhase.name}
          </p>
          <h1>
            {currentStep.name}
            <ExerciseSideBadge side={currentStep.exerciseReference?.side} />
          </h1>
          <p className="session-position">
            Step {currentStep.step.index}/{currentStep.step.count}
            {currentStep.round
              ? ` · Round ${currentStep.round.index}/${currentStep.round.count}`
              : ""}
          </p>
          <div className="session-timing">
            <time className="session-countdown" dateTime={`PT${Math.ceil(remainingMs / 1_000)}S`}>
              {formatCountdown(remainingMs)}
            </time>
            <OverallProgress
              sessionElapsedMs={timer.sessionElapsedMs}
              scheduledElapsedMs={scheduledElapsedMs}
              totalDurationMs={fitnessClass.totalDurationMs}
            />
          </div>
          <StepProgress
            durationMs={stepDurationMs}
            elapsedMs={elapsedStepMs}
            onSeekStart={handleSeekStart}
            onSeek={timer.seek}
            onSeekEnd={handleSeekEnd}
          />
        </section>

        <aside className="session-context">
          <div className="current-step-details">
            <ExerciseDetails step={currentStep} />
          </div>
          <section className="next-step" aria-label="Next step" aria-live="polite">
            <span>{currentStep.kind === "rest" ? "Prepare for" : "Up next"}</span>
            <strong>
              {preview.primary?.name ?? "Class complete"}
              <ExerciseSideBadge side={preview.primary?.exerciseReference?.side} />
            </strong>
            {preview.primary ? <time>{formatDuration(preview.primary.durationMs)}</time> : null}
            {isEnding && preview.primary && hasExerciseMedia(preview.primary) ? (
              <div className="next-step__preview">
                <ExerciseMedia step={preview.primary} decorative />
              </div>
            ) : null}
            {preview.circuitOverview ? (
              <div className="next-step__circuit">
                <span>{preview.primary?.phase.name}</span>
                <p>
                  {preview.circuitOverview.exerciseNames.length} exercises · Breaks: {preview.circuitOverview.breakDurationsMs.length > 0
                    ? preview.circuitOverview.breakDurationsMs.map((duration) => formatDuration(duration)).join(", ")
                    : "none"}
                </p>
                <ol>
                  {preview.circuitOverview.exerciseNames.map((name, index) => <li key={`${index}-${name}`}>{name}</li>)}
                </ol>
              </div>
            ) : preview.circuitExerciseNames.length > 1 ? (
              <div className="next-step__circuit">
                <span>{preview.primary?.phase.name}</span>
                <ul>
                  {preview.circuitExerciseNames.map((name) => <li key={name}>{name}</li>)}
                </ul>
              </div>
            ) : null}
          </section>
        </aside>
      </div>

      <SessionControls
        status={state.status}
        onPrevious={timer.previous}
        onPause={timer.pause}
        onResume={() => {
          if (soundEnabled) {
            initializeAudioCues();
          }
          timer.resume();
        }}
        onNext={timer.next}
        onAdjust={timer.adjust}
      />
    </main>
  );
}
