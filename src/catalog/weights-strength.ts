import type { ExerciseCatalog, ExerciseDefinition } from "../domain/catalog-definition";
import { builtInTags } from "./tags";

// Mat Pilates variations with light hand weights; see CLASS_FORMAT.md.
export const weightsStrengthExercises: ExerciseDefinition[] = ([
  {
    id: "weighted-hundred-prep", name: "Hundred prep with hand weights", sideSupport: "none", tags: ["supine", "core"],
    shortDescription: "Hold a very light weight in each hand beside the hips; curl the chest up and make small arm pumps.",
    longDescription: "Lie on your back with feet planted or legs in tabletop. Curl the head and shoulders up without pulling the chin into the chest. Reach the weights low beside the hips and pump the arms in a small controlled range. Breathe in for five pumps and out for five. Keep the weights away from the face; lower the head or feet when needed."
  },
  {
    id: "weighted-half-roll-back", name: "Half roll back with weight", sideSupport: "none", tags: ["seated", "core"],
    shortDescription: "Hold one light weight in both hands near the chest. Roll the pelvis back into a small C-curve, then return.",
    longDescription: "Sit with knees bent and both feet planted. Exhale, tip the pelvis back and round the lower spine, rolling only as far as you can return without momentum. Keep the weight close to the chest and the shoulders relaxed. Exhale to come forward and sit tall again."
  },
  {
    id: "weighted-c-curve-hold", name: "C-curve hold with weight", sideSupport: "none", tags: ["seated", "core"],
    shortDescription: "Hold one light weight close to the chest and maintain a shallow seated C-curve with feet down.",
    longDescription: "Sit with bent knees, feet planted. Roll the pelvis back slightly and round through the lower spine until the abdominals engage. Hold the weight in both hands near the chest, soften the shoulders and breathe continuously. Stay higher if you cannot hold the curve without strain."
  },
  {
    id: "weighted-oblique-roll-back", name: "Oblique roll back with weight", sideSupport: "left-right", tags: ["seated", "core"],
    shortDescription: "Hold one light weight close to the chest. Roll back slightly and rotate toward the indicated side, then return to center.",
    longDescription: "Sit with bent knees and grounded feet, holding the weight with both hands. Exhale to tip the pelvis back into a shallow C-curve, then gently rotate the ribs toward the indicated side while keeping the knees pointing forward. Return through center and sit taller. Repeat on the same side without swinging the weight."
  },
  {
    id: "weighted-bridge-heel-raises", name: "Bridge heel raises with weight", sideSupport: "none", tags: ["supine", "glutes"],
    shortDescription: "Hold one light weight across the hips with both hands. Keep the bridge steady while lifting and lowering both heels.",
    longDescription: "Lie with knees bent and feet hip-width apart. Lift the pelvis into a comfortable bridge, holding the weight securely across the front of the hips. Raise both heels a small amount and lower them slowly, keeping the toes down and pelvis level. Lower the hips to reset when needed."
  },
  {
    id: "weighted-bridge-hold", name: "Bridge hold with weight", sideSupport: "none", tags: ["supine", "glutes"],
    shortDescription: "Hold one light weight securely across the hips with both hands; keep both feet planted and maintain the bridge.",
    longDescription: "Lie with knees bent and feet planted hip-width apart. Lift the hips only until the front of the body lengthens without arching the back. Keep the ribs settled and the weight steady in both hands across the hips. Breathe normally; lower the pelvis briefly to reset if needed."
  },
  {
    id: "knee-weight-donkey-pulses", name: "Donkey kick pulses with weight behind knee", sideSupport: "left-right", tags: ["glutes"],
    shortDescription: "Keep a light weight behind the bent working knee throughout. Use no weight if it cannot be held securely.",
    longDescription: "Hold the bent working thigh lifted behind you and make small upward pulses. Keep the pelvis level and avoid arching the lower back. Keep the working knee bent around the light weight throughout; lower the knee to the mat before adjusting or removing the weight."
  },
  {
    id: "knee-weight-hydrant", name: "Fire hydrant with weight behind knee", sideSupport: "left-right", tags: ["glutes"],
    shortDescription: "Keep a light weight behind the bent working knee throughout. Use no weight if it cannot be held securely.",
    longDescription: "From tabletop, lift the bent working knee out to the side, then lower with control. Keep both hips facing the mat and the trunk still. Keep the working knee bent around the light weight throughout; lower the knee to the mat before adjusting or removing the weight."
  },
  {
    id: "knee-weight-hydrant-pulses", name: "Fire hydrant pulses with weight behind knee", sideSupport: "left-right", tags: ["glutes"],
    shortDescription: "Keep a light weight behind the bent working knee throughout. Use no weight if it cannot be held securely.",
    longDescription: "Hold the bent working knee slightly lifted to the side. Make small controlled upward pulses without rolling the pelvis. Keep the working knee bent around the light weight throughout; lower the knee to the mat before adjusting or removing the weight."
  },
  {
    id: "knee-weight-crossover", name: "Bent-knee crossover with weight behind knee", sideSupport: "left-right", tags: ["glutes"],
    shortDescription: "Keep a light weight behind the bent working knee throughout. Use no weight if it cannot be held securely.",
    longDescription: "Lift the bent working thigh behind you, lower the knee slightly across the supporting leg, then lift again. Keep the hips square and avoid twisting the trunk. Keep the working knee bent around the light weight throughout; lower the knee to the mat before adjusting or removing the weight."
  },
  {
    id: "knee-weight-donkey-hold", name: "Donkey kick hold with weight behind knee", sideSupport: "left-right", tags: ["glutes"],
    shortDescription: "Keep a light weight behind the bent working knee throughout. Use no weight if it cannot be held securely.",
    longDescription: "Lift the bent working thigh behind you and hold with the sole facing upward. Keep the ribs drawn in and the pelvis level without arching the back. Keep the working knee bent around the light weight throughout; lower the knee to the mat before adjusting or removing the weight."
  },
  {
    id: "weighted-single-arm-toe-reach", name: "Single arm toe reach with weight", sideSupport: "left-right", tags: ["supine", "core"],
    shortDescription: "Hold a light weight in the indicated hand and reach toward the raised toes with control.",
    longDescription: "Lie on your back with one leg raised and the other foot planted. Hold a light weight in the indicated hand. Curl the head and shoulders up and reach that hand toward the raised toes, then lower with control. Keep the other arm supported on the mat and avoid swinging the weight. Use no weight if needed."
  },
  {
    id: "weighted-crunch-to-sit-up", name: "Crunch to sit up with weight", sideSupport: "none", tags: ["supine", "core"],
    shortDescription: "Hold one light weight close to the chest with both hands. Curl into a crunch, continue to a sit-up, then lower with control.",
    longDescription: "Lie on your back with knees bent and feet planted. Keep one light weight held close to the chest in both hands. Curl the head and shoulders off the mat into a crunch, then continue rolling up to seated without swinging the arms. Roll down slowly to repeat. Use no weight or stay with a smaller crunch if needed."
  },
  {
    id: "weighted-seated-ab-rows", name: "Seated ab rows with weight", sideSupport: "left-right", tags: ["seated", "core"],
    shortDescription: "Sit with knees bent and lean back slightly. Hold a light weight in the indicated hand, reach forward, then row toward the ribs.",
    longDescription: "Sit with knees bent and feet planted. Hold a light weight in the indicated hand, keep the chest lifted and lean back slightly until the abdominals engage. Reach that arm forward, then draw the elbow back toward the ribs in a controlled row. Keep the other hand lightly supported beside the hip and the torso steady without twisting or swinging. Use no weight if needed."
  },
  {
    id: "knee-weight-crunch-in", name: "Crunch knee in with weight behind knee", sideSupport: "left-right", tags: ["glutes", "core"],
    shortDescription: "Keep a light weight behind the bent working knee. Draw the knee in under the torso, then return the bent thigh behind you.",
    longDescription: "From hands and knees, keep a light weight secure behind the bent working knee. Exhale to draw that knee inward beneath the torso as the abdominals engage. Return the thigh behind you with control, keeping the knee bent around the weight throughout. Keep the hips level and avoid arching the lower back. Use no weight if it cannot be held securely."
  },
  {
    id: "weighted-seated-both-arm-ab-row", name: "Seated ab row with both arms", sideSupport: "none", tags: ["seated", "core"],
    shortDescription: "Hold one light weight in both hands. Lean back slightly, reach both arms forward, then row both elbows toward the ribs.",
    longDescription: "Sit with knees bent and feet planted, holding one light weight in both hands. Keep the chest lifted and lean back slightly until the abdominals engage. Reach both arms forward with soft elbows, then draw both elbows toward the ribs in a controlled row. Keep the torso steady and avoid twisting or swinging the weight. Use no weight if needed."
  }
,
  {
    id: "weighted-slow-squats", name: "Slow squats", sideSupport: "none", tags: ["standing", "legs"],
    shortDescription: "Hold light weights beside the hips. Lower slowly into a squat and rise slowly with control.",
    longDescription: "Stand with feet comfortably apart and hold a light weight in each hand beside the hips. Slowly send the hips back and bend the knees in line with the toes, keeping the chest lifted. Press through both feet and return to standing slowly. Use a comfortable depth and avoid bouncing; use no weights if needed."
  }

] satisfies Omit<ExerciseDefinition, "schemaVersion" | "version">[]).map((exercise) => ({
  ...exercise, schemaVersion: 1, version: exercise.id === "weighted-seated-ab-rows" ? 2 : 1, tags: ["mat-pilates", "mat", "weights", ...exercise.tags]
}));

export const weightsStrengthCatalog: ExerciseCatalog = {
  schemaVersion: 1, tags: [...builtInTags], exercises: weightsStrengthExercises
};
