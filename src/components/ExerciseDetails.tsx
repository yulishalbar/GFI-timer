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
      {step.illustration ? (
        <img src={`${import.meta.env.BASE_URL}${step.illustration}`} alt="" aria-hidden="true" />
      ) : null}
      <div className="exercise-details__copy">
        {step.shortDescription ? <p>{step.shortDescription}</p> : null}
        {step.longDescription ? (
          <p className="exercise-details__long">{step.longDescription}</p>
        ) : null}
      </div>
    </section>
  );
}
