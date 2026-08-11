import { formatDuration } from "../lib/format-duration";

interface OverallProgressProps {
  elapsedMs: number;
  totalDurationMs: number;
}

export function OverallProgress({ elapsedMs, totalDurationMs }: OverallProgressProps) {
  const remainingMs = Math.max(0, totalDurationMs - elapsedMs);
  return (
    <section className="overall-progress" aria-label="Overall class progress">
      <div className="overall-progress__labels">
        <span>
          <small>Elapsed</small>
          <strong>{formatDuration(elapsedMs)}</strong>
        </span>
        <span>
          <small>Remaining</small>
          <strong>{formatDuration(remainingMs)}</strong>
        </span>
      </div>
      <progress max={totalDurationMs} value={elapsedMs}>
        {Math.round((elapsedMs / totalDurationMs) * 100)}%
      </progress>
    </section>
  );
}
