export function formatDuration(durationMs: number, options?: { padMinutes?: boolean }): string {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1_000));
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  const minuteText = options?.padMinutes === true ? minutes.toString().padStart(2, "0") : minutes;
  return `${minuteText}:${seconds.toString().padStart(2, "0")}`;
}

export function formatMinutes(durationMs: number): string {
  const minutes = durationMs / 60_000;
  return Number.isInteger(minutes) ? `${minutes} min` : `${minutes.toFixed(1)} min`;
}
