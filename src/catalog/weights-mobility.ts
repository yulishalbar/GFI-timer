import type { ExerciseCatalog, ExerciseDefinition } from "../domain/catalog-definition";
import { builtInTags } from "./tags";

// Technique references and authoring adaptations: docs/CLASS_FORMAT.md.
// These movements are text-guided until matching pose rigs are authored.
export const weightsMobilityExercises: ExerciseDefinition[] = ([
  {
    id: "march-in-place", name: "March in place", sideSupport: "none", tags: ["standing", "full-body"],
    shortDescription: "Start easy, with relaxed arm swings and comfortable knee lifts.",
    longDescription: "Stand tall and alternate lifting each foot, placing it down softly beneath you. Swing the arms naturally and gradually make the steps a little more energetic. Keep breathing comfortably; no weights."
  },
  {
    id: "side-step-arm-sweeps", name: "Side steps with arm sweeps", sideSupport: "none", tags: ["standing", "full-body"],
    shortDescription: "Step and touch side to side, opening and closing the arms.",
    longDescription: "Step to one side and bring the other foot in for a light toe touch. Alternate sides with soft knees. Sweep the arms open below shoulder height, then bring them forward as the feet come together. Keep the movement easy and rhythmic."
  },
  {
    id: "standing-open-gate", name: "Standing open the gate", sideSupport: "none", tags: ["standing", "legs"],
    shortDescription: "Lift a bent knee, open it gently outward, and place the foot down. Alternate sides.",
    longDescription: "Stand tall. Lift one knee to a comfortable height, turn the thigh outward from the hip, and lower the foot. Reset before changing sides. Keep the trunk facing forward and use a smaller arc or keep the toes near the floor for balance."
  },
  {
    id: "standing-heel-raises", name: "Standing heel raises", sideSupport: "none", tags: ["standing", "legs"],
    shortDescription: "Rise onto the balls of both feet and lower the heels slowly.",
    longDescription: "Stand with feet parallel and hip-width apart. Lift both heels a little, keeping pressure through the big-toe and second-toe area, then lower quietly. Keep the ankles aligned and use a small lift if balance is challenging."
  },
  {
    id: "bodyweight-hip-hinge", name: "Bodyweight hip hinge", sideSupport: "none", tags: ["standing", "glutes"],
    shortDescription: "Send the hips back with soft knees and a long spine, then stand tall.",
    longDescription: "Place hands on the hips and keep feet hip-width apart. Push the hips backward as the torso tips forward, keeping the back long and the knees softly bent. Stop before the back rounds, then press through the feet to stand. This is unweighted practice for the reverse fly and standing leg work."
  },
  {
    id: "lateral-weight-shifts", name: "Lateral weight shifts", sideSupport: "none", tags: ["standing", "legs"],
    shortDescription: "In a wide stance, gently bend one knee and shift across to the other side.",
    longDescription: "Step feet comfortably wide with toes mostly forward. Send the hips slightly back and bend one knee while the other leg lengthens. Return through center and switch sides. Keep both feet planted and use a shallow range; follow the toes with the bending knee."
  },
  {
    id: "side-lying-open-book", name: "Side-lying open book", sideSupport: "left-right", tags: ["side-lying", "upper-body"],
    shortDescription: "Lie on your side with knees bent together. Slowly open the top arm and chest toward the ceiling, then close.",
    longDescription: "Start on your side with both arms reaching forward and palms together, like a closed book. The side badge identifies the top arm: R means lie on your left side and move your right arm; L means the reverse. Open the top arm slowly, turning the chest toward the ceiling while both knees stay stacked on the mat. Return the hand to the starting hand position. Keep the neck comfortable; the opening hand does not need to touch the floor. Use no weights."
  },
  {
    id: "side-lying-quad-stretch", name: "Side-lying quadriceps stretch", sideSupport: "left-right", tags: ["side-lying", "legs"],
    shortDescription: "Stretch the indicated top thigh; keep the knees close and the pelvis steady.",
    longDescription: "Lie on the opposite side with the bottom knee bent for stability. Bend the top knee and, if comfortable to reach, hold the ankle with the top hand. Bring the heel gently toward the buttock without arching the back or pulling hard. If reaching is uncomfortable, simply bend and relax the knee within an easy range."
  },
  {
    id: "seated-cross-body-shoulder-stretch", name: "Seated cross-body shoulder stretch", sideSupport: "left-right", tags: ["seated", "upper-body"],
    shortDescription: "Bring the indicated arm across the chest and keep that shoulder relaxed.",
    longDescription: "Sit comfortably with a tall spine. Bring one arm across the front of the chest and support its upper arm with the other hand. Draw it gently closer without pressing on the elbow joint. Keep the shoulder down and hold without bouncing."
  },
  {
    id: "supine-hamstring-stretch", name: "Supine hamstring stretch", sideSupport: "left-right", tags: ["supine", "legs"],
    shortDescription: "Support behind the indicated thigh and gently lengthen that leg upward.",
    longDescription: "Lie on your back with both knees bent and feet planted. Lift one thigh and hold behind it with both hands. Slowly straighten that knee only until a gentle stretch is felt behind the thigh. Keep the other foot down, shoulders relaxed, and a soft bend in the lifted knee as needed."
  },
  {
    id: "constructive-rest-breathing", name: "Constructive rest breathing", sideSupport: "none", tags: ["supine", "full-body"],
    shortDescription: "Rest on your back with knees bent, feet planted, and easy breathing.",
    longDescription: "Let the arms rest beside you or place hands lightly on the lower ribs. Allow the shoulders and jaw to soften. Breathe naturally into the sides and back of the ribs, with an unforced exhale. Keep the knees and feet in a comfortable position. At the end, roll to one side before sitting up."
  },
  {
    id: "overhead-side-body-stretch", name: "Overhead side body stretch", sideSupport: "left-right", tags: ["standing", "full-body"],
    shortDescription: "Stand tall, reach overhead and stretch gently toward the indicated side. No weights.",
    longDescription: "Stand with feet comfortably apart and knees soft. Reach the arms overhead and lean gently toward the indicated side without twisting or pushing the hips forward. Keep the shoulders relaxed and breathe into the side ribs. Return upright with control; use no weights."
  },
  {
    id: "standing-back-bend-hands-behind-ears", name: "Back bend (hands behind ears)", sideSupport: "none", tags: ["standing", "full-body"],
    shortDescription: "Place hands behind the ears, open the elbows and gently lift the chest. No weights.",
    longDescription: "Stand tall with soft knees and place the hands lightly behind the ears without pulling the head. Keep the pelvis steady, lift through the chest and make a small comfortable upper-back bend. Keep the neck long and return upright with control; no weights."
  },
  {
    id: "standing-forward-fold", name: "Standing forward fold", sideSupport: "none", tags: ["standing", "full-body"],
    shortDescription: "Soften the knees and fold forward from the hips, letting the arms and head relax. No weights.",
    longDescription: "From standing, soften both knees and hinge forward at the hips. Let the hands rest toward the shins or floor within a comfortable range, without forcing the knees straight. Breathe easily and keep the neck relaxed. Bend the knees and rise slowly before the next standing movement; no weights."
  },
  {
    id: "yogi-squat", name: "Yogi squat", sideSupport: "none", tags: ["standing", "full-body"],
    shortDescription: "Step comfortably wide, turn the toes out slightly and lower into a comfortable yogi squat. No weights.",
    longDescription: "From standing, widen the feet slightly and turn the toes out. Bend the knees in line with the toes and lower the hips only as far as comfortable, keeping the heels supported and the chest lifted. Bring palms together at the chest if comfortable. Stay higher if needed; no weights."
  },
  {
    id: "squat-twist-reach", name: "Squat Twist & reach", sideSupport: "none", tags: ["standing", "full-body"],
    shortDescription: "From a comfortable squat, rotate the chest and reach one arm up. Alternate sides without weights.",
    longDescription: "Stay in a comfortable wide squat with the knees following the toes. Support one hand on the same-side thigh, rotate the chest and reach the opposite arm upward through a comfortable range. Return to center and alternate sides. Keep the movement gentle and use a higher squat if needed; no weights."
  },
  {
    id: "supine-figure-four-stretch", name: "Figure four stretch", sideSupport: "left-right", tags: ["supine", "glutes"],
    shortDescription: "Cross the indicated ankle over the opposite thigh and gently draw the supporting thigh toward you. No weights.",
    longDescription: "Lie on your back with knees bent and feet planted. Cross the indicated ankle over the opposite thigh above the knee, keeping that foot gently flexed. Hold behind the supporting thigh and draw it toward the chest until a comfortable glute stretch is felt. Keep the head and shoulders relaxed. Leave the supporting foot down if reaching is uncomfortable; no weights."
  }

] satisfies Omit<ExerciseDefinition, "schemaVersion" | "version">[]).map((exercise) => ({ ...exercise, schemaVersion: 1, version: 1, tags: ["mat-pilates", "mat", ...exercise.tags] }));

export const weightsMobilityCatalog: ExerciseCatalog = {
  schemaVersion: 1, tags: [...builtInTags], exercises: weightsMobilityExercises
};
