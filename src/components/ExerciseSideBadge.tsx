import type { ExerciseSide } from "../domain/catalog-definition";

interface ExerciseSideBadgeProps {
  side: ExerciseSide | undefined;
}

export function ExerciseSideBadge({ side }: ExerciseSideBadgeProps) {
  if (!side) return null;

  const label = side === "left" ? "Left side" : "Right side";
  return (
    <span className={`exercise-side-badge exercise-side-badge--${side}`} aria-label={label}>
      <span aria-hidden="true">{side === "left" ? "← L" : "R →"}</span>
    </span>
  );
}
