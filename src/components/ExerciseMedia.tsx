import type { RuntimeStep } from "../domain/timeline";

interface ExerciseMediaProps {
  step: RuntimeStep;
  decorative?: boolean;
}

export function ExerciseMedia({ step, decorative = false }: ExerciseMediaProps) {
  const alt = decorative ? "" : `Illustration for ${step.name}`;

  if (step.motionIllustrations) {
    return (
      <span
        className={`exercise-motion${step.sourceId.endsWith("-left") ? " exercise-motion--mirrored" : ""}`}
        aria-label={decorative ? undefined : `Motion guide for ${step.name}`}
      >
        {step.motionIllustrations.map((frame, index) => (
          <img
            className={index === 0 ? "exercise-motion__first" : "exercise-motion__second"}
            src={`${import.meta.env.BASE_URL}${frame}`}
            alt={index === 0 ? alt : ""}
            aria-hidden={decorative || index > 0}
            key={frame}
          />
        ))}
      </span>
    );
  }

  return step.illustration ? (
    <img
      src={`${import.meta.env.BASE_URL}${step.illustration}`}
      alt={alt}
      aria-hidden={decorative}
    />
  ) : null;
}
