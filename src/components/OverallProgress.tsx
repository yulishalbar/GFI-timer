import { formatDuration } from "../lib/format-duration";

interface OverallProgressProps {
  sessionElapsedMs: number;
  scheduledElapsedMs: number;
  totalDurationMs: number;
}

export function OverallProgress({
  sessionElapsedMs,
  scheduledElapsedMs,
  totalDurationMs
}: OverallProgressProps) {
  const remainingMs = Math.max(0, totalDurationMs - scheduledElapsedMs);
  return (
    <section className="overall-progress" aria-label="Overall class progress">
      <div className="overall-progress__labels">
        <span>
          <small>Real elapsed</small>
          <strong>{formatDuration(sessionElapsedMs)}</strong>
        </span>
        <span>
          <small>Scheduled remaining</small>
          <strong>{formatDuration(remainingMs)}</strong>
        </span>
      </div>
      <progress max={totalDurationMs} value={scheduledElapsedMs}>
        {Math.round((scheduledElapsedMs / totalDurationMs) * 100)}%
      </progress>
    </section>
  );
}
