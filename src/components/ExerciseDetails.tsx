import type { RuntimeStep } from "../domain/timeline";

interface ExerciseDetailsProps {
  step: RuntimeStep;
}

export function ExerciseDetails({ step }: ExerciseDetailsProps) {
  if (!step.shortDescription && !step.longDescription) {
    return null;
  }
  return (
    <section className="exercise-details" aria-label="Current step instructions">
      {step.shortDescription ? <p>{step.shortDescription}</p> : null}
      {step.longDescription ? (
        <details>
          <summary>More instruction</summary>
          <p>{step.longDescription}</p>
        </details>
      ) : null}
    </section>
  );
}
