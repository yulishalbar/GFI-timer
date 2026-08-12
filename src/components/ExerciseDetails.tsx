import type { RuntimeStep } from "../domain/timeline";
import { ExerciseMedia } from "./ExerciseMedia";

interface ExerciseDetailsProps {
  step: RuntimeStep;
}

export function ExerciseDetails({ step }: ExerciseDetailsProps) {
  if (!step.shortDescription && !step.longDescription) {
    return null;
  }
  return (
    <section className="exercise-details" aria-label="Current step instructions">
      <ExerciseMedia step={step} decorative />
      <div className="exercise-details__copy">
        {step.shortDescription ? <p>{step.shortDescription}</p> : null}
        {step.longDescription ? (
          <p className="exercise-details__long">{step.longDescription}</p>
        ) : null}
      </div>
    </section>
  );
}
