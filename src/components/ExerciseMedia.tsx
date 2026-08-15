import type { RuntimeStep } from "../domain/timeline";
import { getRig } from "../rig/rigs";
import { ExerciseRig } from "./ExerciseRig";
import { MotionGuide } from "./MotionGuide";

interface ExerciseMediaProps {
  step: RuntimeStep;
  decorative?: boolean;
}

/**
 * Resolution order is rig, then motion frames, then a still. An unmigrated
 * exercise keeps exactly the artwork it has today, so the catalog can move
 * across in batches without any step losing its visual.
 */
export function ExerciseMedia({ step, decorative = false }: ExerciseMediaProps) {
  const mirrored = step.sourceId.endsWith("-left");
  const rig = step.rig ? getRig(step.rig) : undefined;

  if (rig) {
    return <ExerciseRig rig={rig} name={step.name} mirrored={mirrored} decorative={decorative} />;
  }

  if (step.motionIllustrations) {
    return (
      <MotionGuide
        frames={step.motionIllustrations}
        name={step.name}
        mirrored={mirrored}
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
