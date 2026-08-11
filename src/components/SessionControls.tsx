import type { TimerStatus } from "../domain/timer-state";

interface SessionControlsProps {
  status: TimerStatus;
  onPrevious: () => void;
  onPause: () => void;
  onResume: () => void;
  onNext: () => void;
}

export function SessionControls({
  status,
  onPrevious,
  onPause,
  onResume,
  onNext
}: SessionControlsProps) {
  const isComplete = status === "complete";
  return (
    <nav className="session-controls" aria-label="Session controls">
      <button type="button" onClick={onPrevious} disabled={isComplete}>
        <span aria-hidden="true">←</span>
        Previous
      </button>
      <button
        className="session-controls__primary"
        type="button"
        onClick={status === "running" ? onPause : onResume}
        disabled={isComplete}
      >
        <span aria-hidden="true">{status === "running" ? "Ⅱ" : "▶"}</span>
        {status === "running" ? "Pause" : "Resume"}
      </button>
      <button type="button" onClick={onNext} disabled={isComplete}>
        Next
        <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}
