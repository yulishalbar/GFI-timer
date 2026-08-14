import type { RuntimeStep } from "../domain/timeline";
import { MotionGuide } from "./MotionGuide";

interface ExerciseMediaProps {
  step: RuntimeStep;
  decorative?: boolean;
}

export function ExerciseMedia({ step, decorative = false }: ExerciseMediaProps) {
  if (step.motionIllustrations) {
    return (
      <MotionGuide
        frames={step.motionIllustrations}
        name={step.name}
        mirrored={step.sourceId.endsWith("-left")}
        decorative={decorative}
      />
    );
  }

  return step.illustration ? (
    <img
      src={`${import.meta.env.BASE_URL}${step.illustration}`}
      alt={decorative ? "" : `Illustration for ${step.name}`}
      aria-hidden={decorative}
    />
  ) : null;
}
