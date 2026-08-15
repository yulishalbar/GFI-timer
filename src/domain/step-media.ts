import { getRig } from "../rig/rigs";
import type { RuntimeStep } from "./timeline";

/**
 * Whether a step has any visual at all, in any of the supported forms. Mirrors
 * the resolution order in ExerciseMedia: rig, then motion frames, then a still.
 */
export function hasExerciseMedia(step: RuntimeStep): boolean {
  if (step.rig && getRig(step.rig)) return true;
  return step.motionIllustrations !== undefined || step.illustration !== undefined;
}
