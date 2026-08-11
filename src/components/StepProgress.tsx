import { formatDuration } from "../lib/format-duration";

interface StepProgressProps {
  durationMs: number;
  elapsedMs: number;
  onSeekStart: () => void;
  onSeek: (elapsedMs: number) => void;
  onSeekEnd: () => void;
}

export function StepProgress({
  durationMs,
  elapsedMs,
  onSeekStart,
  onSeek,
  onSeekEnd
}: StepProgressProps) {
  const roundedElapsedMs = Math.round(elapsedMs / 1_000) * 1_000;

  return (
    <label className="step-progress">
      <span>
        Step progress
        <output>{formatDuration(roundedElapsedMs)}</output>
      </span>
      <input
        aria-label="Seek within current step"
        aria-valuetext={`${formatDuration(roundedElapsedMs)} elapsed`}
        type="range"
        min={0}
        max={durationMs}
        step={1_000}
        value={Math.min(durationMs, roundedElapsedMs)}
        onChange={(event) => onSeek(Number(event.currentTarget.value))}
        onPointerDown={onSeekStart}
        onPointerUp={onSeekEnd}
        onPointerCancel={onSeekEnd}
      />
    </label>
  );
}
