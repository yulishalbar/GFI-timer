import type { FitnessClassDefinition } from "../domain/class-definition";
import { builtInTags } from "../catalog/tags";
import { normalizeDatedCatalog } from "../catalog/normalize-dated";
import { adaptLegacyClassToCatalog } from "../domain/legacy-catalog-adapter";
import { resolveCourseDefinition } from "../domain/resolve-course";

export const matPilates0724Legacy = {
  schemaVersion: 1,
  id: "mat-pilates-07-24-v1",
  version: 6,
  title: "Mat Pilates — July 24 V1",
  description:
    "A full-body mat class with warmup, core, glutes, lower body, side body, and cooldown. Mat required.",
  phases: [
    {
      id: "introduction",
      name: "Introduction",
      items: [
        {
          type: "exercise",
          id: "class-introduction",
          name: "Class introduction",
          durationSeconds: 120,
          shortDescription:
            "Welcome the class and introduce the mind-body, mobility, and full-body focus."
        }
      ]
    },
    {
      id: "warmup",
      name: "Warm-Up",
      items: [
        {
          type: "exercise",
          id: "childs-pose",
          name: "Child's pose and side-body stretch",
          durationSeconds: 60,
          illustration: "exercises/childs-pose.svg",
          shortDescription: "Finish in tabletop with wrists under shoulders and knees under hips.",
          longDescription:
            "Bring the big toes together, take the knees wide, and reach forward as the hips lower toward the ankles. Walk both hands right and stack the left hand for a side stretch; return to center and repeat left."
        },
        {
          type: "exercise",
          id: "cat-cow",
          name: "Cat–cow",
          durationSeconds: 30,
          shortDescription: "Begin in neutral tabletop.",
          longDescription:
            "Inhale to open the chest, lift the gaze, and point the tailbone up. Exhale to round the shoulder blades, tuck the pelvis, and lower the gaze without dumping into the lower back."
        },
        {
          type: "exercise",
          id: "hover-to-down-dog",
          name: "Hovering tabletop to downward dog",
          durationSeconds: 30,
          shortDescription: "Lift the knees into a hovering tabletop.",
          longDescription:
            "Inhale to lift the hips into downward dog. Exhale forward until the shoulders stack over the wrists, then lower the knees to hover. Keep the core engaged and move with control."
        },
        {
          type: "exercise",
          id: "thread-needle-right",
          name: "Thread the needle — right",
          durationSeconds: 30,
          shortDescription: "Lower the knees and return to neutral tabletop.",
          longDescription:
            "Inhale the right arm toward the ceiling. Exhale to thread it under the left shoulder and lower the head. Add three wrist circles in each direction, then repeat the twist without wrist circles."
        },
        {
          type: "exercise",
          id: "thread-needle-left",
          name: "Thread the needle — left",
          durationSeconds: 30,
          shortDescription: "Finish seated back on the heels, then come to a seated position.",
          longDescription:
            "Inhale the left arm toward the ceiling. Exhale to thread it under the right shoulder and lower the head. Add three wrist circles in each direction, then repeat the twist without wrist circles."
        },
        { type: "rest", id: "rest-after-warmup", name: "REST", durationSeconds: 60, shortDescription: "Take water and prepare for the core circuit." }
      ]
    },
    {
      id: "core-circuit",
      name: "Circuit 1 — Core",
      items: [
        {
          type: "exercise",
          id: "single-leg-stretch",
          name: "Single-leg stretch",
          durationSeconds: 40,
          shortDescription: "Roll down from seated and bring the legs to tabletop.",
          longDescription:
            "Curl the head and shoulders up. Extend one leg as the opposite knee draws in, then switch with control. Breathe in for two and out for two. Regression: keep legs on the mat. Progression: lift the chest and legs higher."
        },
        { type: "rest", id: "rest-after-single-leg-stretch", name: "REST", durationSeconds: 10, shortDescription: "Stay down and prepare to add rotation." },
        {
          type: "exercise",
          id: "criss-cross",
          name: "Criss-cross",
          durationSeconds: 40,
          shortDescription: "Add torso rotation to the alternating legs.",
          longDescription:
            "Extend one leg and draw the opposite knee in as the opposite elbow rotates toward it. Switch steadily. Regression: continue single-leg stretch without rotation."
        },
        { type: "rest", id: "rest-after-criss-cross", name: "REST", durationSeconds: 10, shortDescription: "Plant the feet with knees bent." },
        {
          type: "exercise",
          id: "crunch",
          name: "Crunch",
          durationSeconds: 40,
          shortDescription: "Knees bent and feet grounded.",
          longDescription:
            "Exhale to curl the head, shoulders, and ribcage toward the pelvis; inhale to lower with control. Option: hold the legs at tabletop."
        },
        { type: "rest", id: "rest-after-crunch", name: "REST", durationSeconds: 10, shortDescription: "Lift both legs to tabletop with knees bent." },
        { type: "exercise", id: "crunch-legs-lifted", name: "Crunch w legs lifted", durationSeconds: 40, shortDescription: "Keep both legs lifted in tabletop with knees bent.", longDescription: "Exhale to curl the head and shoulders toward the knees while keeping the legs steady. Inhale to lower with control. Regression: place the feet on the mat." },
        { type: "rest", id: "rest-after-crunch-legs-lifted", name: "REST", durationSeconds: 10, shortDescription: "Extend the left leg and lift the right leg." },
        {
          type: "exercise",
          id: "leg-circle-right",
          name: "Leg circle — right",
          durationSeconds: 40,
          shortDescription: "Reverse direction after 20 seconds.",
          longDescription:
            "Circle the right leg across and down, returning to center with a stable pelvis. Regression: soften the working knee. Progression: make the circle larger."
        },
        { type: "rest", id: "rest-after-leg-circle-right", name: "REST", durationSeconds: 10, shortDescription: "Switch sides." },
        {
          type: "exercise",
          id: "leg-circle-left",
          name: "Leg circle — left",
          durationSeconds: 40,
          shortDescription: "Reverse direction after 20 seconds.",
          longDescription:
            "Circle the left leg across and down, returning to center with a stable pelvis. Regression: soften the working knee. Progression: make the circle larger."
        },
        { type: "rest", id: "rest-after-leg-circle-left", name: "REST", durationSeconds: 10, shortDescription: "Extend both legs and reach the arms overhead." },
        {
          type: "exercise",
          id: "roll-ups",
          name: "Roll-ups",
          durationSeconds: 60,
          shortDescription: "Finish seated and take water.",
          longDescription:
            "Exhale to roll up and reach toward the toes. Scoop the abdominals into a C-curve to roll back down with control. Regression: bend the knees and anchor the feet."
        }
      ]
    },
    {
      id: "glutes-circuit",
      name: "Circuit 2 — Glutes",
      items: [
        { type: "rest", id: "glutes-setup", name: "REST", durationSeconds: 60, shortDescription: "Explain that the circuit has no breaks." },
        { type: "exercise", id: "bridge-one", name: "Full-range glute bridge", durationSeconds: 30, shortDescription: "Feet planted hip-width.", longDescription: "Drive through the heels to lift the hips and squeeze the glutes; lower with control.", illustration: "exercises/glute-bridge.svg" },
        { type: "exercise", id: "bridge-knee-drive-right", name: "Bridge with knee drive — right", durationSeconds: 30, shortDescription: "Keep the hips lifted.", longDescription: "Lift the bent right knee while squeezing the left glute, lower, and repeat. Regression: regular bridges." },
        { type: "exercise", id: "bridge-pulse-right", name: "Bridge knee-drive pulses — right", durationSeconds: 20, shortDescription: "Keep the right leg lifted.", longDescription: "Pulse the lifted leg without letting the hips lower." },
        { type: "rest", id: "bridge-side-rest", name: "REST", durationSeconds: 20 },
        { type: "exercise", id: "bridge-two", name: "Full-range glute bridge", durationSeconds: 30, shortDescription: "Return both feet to the mat.", longDescription: "Drive through the heels to lift the hips and squeeze the glutes; lower with control." },
        { type: "exercise", id: "bridge-knee-drive-left", name: "Bridge with knee drive — left", durationSeconds: 30, shortDescription: "Keep the hips lifted.", longDescription: "Lift the bent left knee while squeezing the right glute, lower, and repeat. Regression: regular bridges." },
        { type: "exercise", id: "bridge-pulse-left", name: "Bridge knee-drive pulses — left", durationSeconds: 20, shortDescription: "Keep the left leg lifted.", longDescription: "Pulse the lifted leg without letting the hips lower." },
        { type: "exercise", id: "bridge-three", name: "Full-range glute bridge", durationSeconds: 30, shortDescription: "Return both feet to the mat.", longDescription: "Drive through the heels to lift the hips and squeeze the glutes; lower with control." },
        { type: "exercise", id: "bridge-pulses", name: "Glute bridge pulses", durationSeconds: 20, shortDescription: "Stay lifted, then finish seated.", longDescription: "Use small pulses at the top while maintaining constant tension." }
      ]
    },
    {
      id: "posterior-core-circuit",
      name: "Circuit 3 — Core, Glutes, and Back",
      items: [
        { type: "rest", id: "prone-transition", name: "REST", durationSeconds: 60, shortDescription: "Roll onto the stomach with legs extended." },
        { type: "exercise", id: "superman", name: "Superman", durationSeconds: 40, shortDescription: "Lie prone with arms and legs extended.", longDescription: "Lift arms, chest, and legs while keeping the neck neutral, then lower. Regression: leave the legs down." },
        { type: "rest", id: "rest-after-superman", name: "REST", durationSeconds: 10 },
        { type: "exercise", id: "superman-flutter", name: "Superman hold with flutter arms", durationSeconds: 40, shortDescription: "Hold the lifted position.", longDescription: "Keep the chest and legs elevated while making small alternating arm lifts. Regression: regular superman repetitions." },
        { type: "rest", id: "rest-after-superman-flutter", name: "REST", durationSeconds: 10, shortDescription: "Take child's pose, then come to tabletop." },
        { type: "exercise", id: "bird-dog-extension-right", name: "Bird dogs — right", durationSeconds: 40, shortDescription: "Hands under shoulders and knees under hips.", longDescription: "Extend the right leg and left arm, then return to tabletop with control. Keep the hips square and repeat on the same side." },
        { type: "rest", id: "rest-after-bird-dog-extension-right", name: "REST", durationSeconds: 10, shortDescription: "Stay on the same side and prepare to add the crunch." },
        { type: "exercise", id: "bird-dog-right", name: "Bird-dog extension and crunch — right", durationSeconds: 40, shortDescription: "Hands under shoulders and knees under hips.", longDescription: "Extend opposite arm and leg, then exhale to draw elbow and knee together under the body." },
        { type: "rest", id: "rest-after-bird-dog-right", name: "REST", durationSeconds: 10, shortDescription: "Switch sides." },
        { type: "exercise", id: "bird-dog-extension-left", name: "Bird dogs — left", durationSeconds: 40, shortDescription: "Hands under shoulders and knees under hips.", longDescription: "Extend the left leg and right arm, then return to tabletop with control. Keep the hips square and repeat on the same side." },
        { type: "rest", id: "rest-after-bird-dog-extension-left", name: "REST", durationSeconds: 10, shortDescription: "Stay on the same side and prepare to add the crunch." },
        { type: "exercise", id: "bird-dog-left", name: "Bird-dog extension and crunch — left", durationSeconds: 40, shortDescription: "Stay in tabletop with the core engaged.", longDescription: "Extend opposite arm and leg, then exhale to draw elbow and knee together under the body." },
        { type: "rest", id: "rest-after-bird-dog-left", name: "REST", durationSeconds: 10, shortDescription: "Shift forward with the knees down." },
        { type: "exercise", id: "knee-push-ups", name: "Knee push-ups to pike", durationSeconds: 40, shortDescription: "Begin with knees down and a straight line from knees through shoulders.", longDescription: "Lower the chest toward the floor and press back up. Tuck the toes, lift the knees, and send the hips up and back into a pike. Lower the knees and repeat with control." },
        { type: "rest", id: "rest-after-knee-push-ups", name: "REST", durationSeconds: 10, shortDescription: "Lower onto the forearms and lift the knees into low plank." },
        { type: "exercise", id: "plank-crunch", name: "Low-plank opening to the sides", durationSeconds: 40, shortDescription: "Forearms on the mat, elbows under shoulders, and core braced.", longDescription: "Rotate from low plank into a forearm side plank, opening the chest and reaching the top arm up. Return to center and repeat on the other side. Regression: lower the knees." },
        { type: "rest", id: "rest-after-plank-crunch", name: "REST", durationSeconds: 10 },
        { type: "exercise", id: "high-plank-hold", name: "Low-plank hold", durationSeconds: 20, shortDescription: "Forearms grounded and elbows under shoulders. Finish on the knees, take water, then stand.", longDescription: "Keep a straight line from head to heels with the core engaged and breathe steadily. Regression: lower the knees." }
      ]
    },
    {
      id: "lower-body-circuit",
      name: "Circuit 4 — Lower Body",
      items: [
        { type: "rest", id: "lower-body-setup", name: "REST", durationSeconds: 60, shortDescription: "Begin on the right; there are no breaks until switching sides." },
        { type: "exercise", id: "squat-to-stand-right", name: "Squat to stand — right round", durationSeconds: 30, shortDescription: "Feet hip-width.", longDescription: "Sit the hips back, then stand and squeeze the glutes." },
        { type: "exercise", id: "squat-pulse-right", name: "Squat pulse — right round", durationSeconds: 30, shortDescription: "Stay low with weight in the heels." },
        { type: "rest", id: "rest-after-squat-pulse-right", name: "REST", durationSeconds: 10 },
        { type: "exercise", id: "reverse-lunge-right", name: "Reverse lunge — right", durationSeconds: 30, shortDescription: "Step the right leg back.", longDescription: "Lower into the lunge and drive through the left heel to stand." },
        { type: "exercise", id: "reverse-lunge-pulse-right", name: "Reverse-lunge pulse — right", durationSeconds: 30, shortDescription: "Stay in the lunge with the chest lifted." },
        { type: "rest", id: "rest-after-lunge-pulse-right", name: "REST", durationSeconds: 10 },
        { type: "exercise", id: "kickback-right", name: "Standing kickback — right", durationSeconds: 30, shortDescription: "Shift weight into the left leg.", longDescription: "Extend the right leg back with square hips, squeeze the glute, and return slowly." },
        { type: "exercise", id: "kickback-pulse-right", name: "Kickback to RDL — right", durationSeconds: 30, shortDescription: "Shift weight into the left leg.", longDescription: "Kick the right leg back, then hinge forward into a single-leg Romanian deadlift with that leg extended behind you. Keep the standing knee soft and hips square; return upright with control and repeat." },
        { type: "rest", id: "lower-body-side-break", name: "REST", durationSeconds: 30, shortDescription: "Switch sides." },
        { type: "exercise", id: "squat-to-stand-left", name: "Squat to stand — left round", durationSeconds: 30, shortDescription: "Feet hip-width.", longDescription: "Sit the hips back, then stand and squeeze the glutes." },
        { type: "exercise", id: "squat-pulse-left", name: "Squat pulse — left round", durationSeconds: 30, shortDescription: "Stay low with weight in the heels." },
        { type: "rest", id: "rest-after-squat-pulse-left", name: "REST", durationSeconds: 10 },
        { type: "exercise", id: "reverse-lunge-left", name: "Reverse lunge — left", durationSeconds: 30, shortDescription: "Step the left leg back.", longDescription: "Lower into the lunge and drive through the right heel to stand." },
        { type: "exercise", id: "reverse-lunge-pulse-left", name: "Reverse-lunge pulse — left", durationSeconds: 30, shortDescription: "Stay in the lunge with the chest lifted." },
        { type: "rest", id: "rest-after-lunge-pulse-left", name: "REST", durationSeconds: 10 },
        { type: "exercise", id: "kickback-left", name: "Standing kickback — left", durationSeconds: 30, shortDescription: "Shift weight into the right leg.", longDescription: "Extend the left leg back with square hips, squeeze the glute, and return slowly." },
        { type: "exercise", id: "kickback-pulse-left", name: "Kickback to RDL — left", durationSeconds: 30, shortDescription: "Shift weight into the right leg.", longDescription: "Kick the left leg back, then hinge forward into a single-leg Romanian deadlift with that leg extended behind you. Keep the standing knee soft and hips square; return upright with control and repeat." }
      ]
    },
    {
      id: "side-body-circuit",
      name: "Circuit 5 — Side Body",
      items: [
        { type: "rest", id: "side-body-setup", name: "REST", durationSeconds: 60, shortDescription: "Cue the full circuit. Start lying on the right side; there are no breaks until the next rest." },
        { type: "exercise", id: "leg-lift-left", name: "Leg lift (L)", durationSeconds: 40, shortDescription: "Bottom leg bent or straight; top leg long.", longDescription: "Exhale, lift the top leg with control, lower slowly and keep hips stacked. Regression: reduce the range or keep the bottom knee bent.", illustration: "exercises/side-lying-leg-series.svg" },
        { type: "rest", id: "rest-after-leg-lift-left", name: "REST", durationSeconds: 10 },
        { type: "exercise", id: "big-leg-circles-left", name: "Big leg circles (L)", durationSeconds: 40, shortDescription: "Reverse direction after 20 seconds.", longDescription: "Draw large controlled circles while keeping the hips stable. Regression: keep a soft bend in the knee. Progression: increase circle size or use a slower tempo." },
        { type: "rest", id: "rest-after-big-leg-circles-left", name: "REST", durationSeconds: 10 },
        { type: "exercise", id: "forward-back-kick-left", name: "Forward and back kick (L)", durationSeconds: 40, shortDescription: "Stay on the side with the top leg lifted.", longDescription: "Flex the foot, exhale and kick the leg forward twice; inhale, point the foot and extend it all the way back." },
        { type: "rest", id: "rest-after-forward-back-kick-left", name: "REST", durationSeconds: 10 },
        { type: "exercise", id: "small-leg-circles-left", name: "Small leg circle pulses (L)", durationSeconds: 40, shortDescription: "Reverse direction after 20 seconds.", longDescription: "Draw small tight circles, 20 seconds in each direction, maintaining constant tension." },
        { type: "rest", id: "rest-after-small-leg-circles-left", name: "REST", durationSeconds: 10 },
        { type: "exercise", id: "straight-leg-crunch-left", name: "Straight leg crunches (L)", durationSeconds: 40, shortDescription: "Come onto the forearm and plant the bent top foot.", longDescription: "Keep the lower leg straight. Exhale to lift it toward the chest and crunch the opposite elbow toward it. Inhale to lower and repeat." },
        { type: "rest", id: "rest-after-straight-leg-crunch-left", name: "REST", durationSeconds: 10 },
        { type: "exercise", id: "tricep-push-up-left", name: "Tricep side push-up (L)", durationSeconds: 30, shortDescription: "Top hand comes to the mat; the lower forearm crosses the belly.", longDescription: "Exhale to push away from the mat using the triceps; inhale to lower. Regression: rest at the bottom." },
        { type: "rest", id: "rest-after-tricep-push-up-left", name: "REST", durationSeconds: 10 },
        { type: "exercise", id: "side-plank-left", name: "Forearm side plank (L)", durationSeconds: 30, shortDescription: "Forearm under shoulder; legs stacked or staggered.", longDescription: "Lift the hips and hold a strong line from head to feet. Regression: knee side plank. Progression: side plank on the hand." },
        { type: "rest", id: "rest-before-bottom-leg-right", name: "REST", durationSeconds: 20 },
        { type: "exercise", id: "bottom-leg-lifts-right", name: "Bottom leg lifts (R)", durationSeconds: 30, shortDescription: "Keep the bottom leg straight.", longDescription: "Exhale and lift the bottom leg toward the ceiling. Inhale and lower with control without fully resting." },
        { type: "exercise", id: "bottom-leg-pulses-right", name: "Bottom leg pulses (R)", durationSeconds: 30, shortDescription: "Hold the bottom leg lifted.", longDescription: "Use small controlled pulses upward. Keep hips stacked and core engaged." },
        { type: "rest", id: "side-body-side-break", name: "REST", durationSeconds: 30, shortDescription: "Roll over and set up on the opposite side." },
        { type: "exercise", id: "leg-lift-right", name: "Leg lift (R)", durationSeconds: 40, shortDescription: "Bottom leg bent or straight; top leg long.", longDescription: "Exhale, lift the top leg with control, lower slowly and keep hips stacked. Regression: reduce the range or keep the bottom knee bent.", illustration: "exercises/side-lying-leg-series.svg" },
        { type: "exercise", id: "big-leg-circles-right", name: "Big leg circles (R)", durationSeconds: 40, shortDescription: "Reverse direction after 20 seconds.", longDescription: "Draw large controlled circles while keeping the hips stable. Regression: keep a soft bend in the knee. Progression: increase circle size or use a slower tempo." },
        { type: "exercise", id: "forward-back-kick-right", name: "Forward and back kick (R)", durationSeconds: 40, shortDescription: "Stay on the side with the top leg lifted.", longDescription: "Flex the foot, exhale and kick the leg forward twice; inhale, point the foot and extend it all the way back." },
        { type: "exercise", id: "small-leg-circles-right", name: "Small leg circle pulses (R)", durationSeconds: 40, shortDescription: "Reverse direction after 20 seconds.", longDescription: "Draw small tight circles, 20 seconds in each direction, maintaining constant tension." },
        { type: "exercise", id: "straight-leg-crunch-right", name: "Straight leg crunches (R)", durationSeconds: 40, shortDescription: "Come onto the forearm and plant the bent top foot.", longDescription: "Keep the lower leg straight. Exhale to lift it toward the chest and crunch the opposite elbow toward it. Inhale to lower and repeat." },
        { type: "exercise", id: "tricep-push-up-right", name: "Tricep side push-up (R)", durationSeconds: 30, shortDescription: "Top hand comes to the mat; the lower forearm crosses the belly.", longDescription: "Exhale to push away from the mat using the triceps; inhale to lower. Regression: rest at the bottom." },
        { type: "exercise", id: "side-plank-right", name: "Forearm side plank (R)", durationSeconds: 30, shortDescription: "Forearm under shoulder; legs stacked or staggered.", longDescription: "Lift the hips and hold a strong line from head to feet. Regression: knee side plank. Progression: side plank on the hand." },
        { type: "rest", id: "rest-before-bottom-leg-left", name: "REST", durationSeconds: 20 },
        { type: "exercise", id: "bottom-leg-lifts-left", name: "Bottom leg lifts (L)", durationSeconds: 30, shortDescription: "Keep the bottom leg straight.", longDescription: "Exhale and lift the bottom leg toward the ceiling. Inhale and lower with control without fully resting." },
        { type: "exercise", id: "bottom-leg-pulses-left", name: "Bottom leg pulses (L)", durationSeconds: 30, shortDescription: "Hold the bottom leg lifted.", longDescription: "Use small controlled pulses upward. Keep hips stacked and core engaged." },
      ]
    },
    {
      id: "cooldown",
      name: "Cooldown",
      items: [
        { type: "rest", id: "cooldown-transition", name: "REST", durationSeconds: 30, shortDescription: "Come to the knees and then sit with the legs extended." },
        { type: "exercise", id: "seated-forward-fold", name: "Hamstring stretch and seated forward fold", durationSeconds: 120, shortDescription: "Lengthen the spine before folding.", longDescription: "Reach overhead on the inhale, then hinge from the hips toward the feet while relaxing the neck and shoulders.", illustration: "exercises/seated-forward-fold.jpg" },
        { type: "exercise", id: "roll-down", name: "Roll down to the mat", durationSeconds: 30, shortDescription: "Lower one vertebra at a time." },
        { type: "exercise", id: "figure-four-right", name: "Figure four and spinal twist — right", durationSeconds: 120, shortDescription: "Cross the right ankle over the left knee.", longDescription: "Draw the supporting leg in for a glute stretch, then lower the legs left into a twist while keeping the shoulders relaxed." },
        { type: "exercise", id: "figure-four-left", name: "Figure four and spinal twist — left", durationSeconds: 120, shortDescription: "Cross the left ankle over the right knee.", longDescription: "Draw the supporting leg in for a glute stretch, then lower the legs right into a twist while keeping the shoulders relaxed." },
        { type: "exercise", id: "overhead-arm-stretch", name: "Overhead arm stretch", durationSeconds: 30, shortDescription: "Reach through fingers and toes, then soften the shoulders." },
        { type: "exercise", id: "shavasana", name: "Shavasana", durationSeconds: 180, shortDescription: "Finish seated and thank the class.", longDescription: "Rest comfortably on the back. Breathe slowly through the nose and out through the mouth, allowing the body to relax.", illustration: "exercises/shavasana.jpg" },
        { type: "exercise", id: "final-childs-pose", name: "Child's pose", durationSeconds: 30, illustration: "exercises/childs-pose.svg", shortDescription: "Bring the knees wide and lower the hips toward the heels.", longDescription: "Reach the arms forward and rest the forehead toward the mat. Breathe slowly and let the back and shoulders soften." }
      ]
    }
  ]
} satisfies FitnessClassDefinition;

const adapted0724 = normalizeDatedCatalog(adaptLegacyClassToCatalog(matPilates0724Legacy, {
  tags: builtInTags,
  courseTags: ["mat-pilates", "mat", "full-body"],
  exerciseTags: ["mat-pilates", "mat"]
}));

export const matPilates0724Catalog = {
  catalog: adapted0724.catalog,
  course: {
    ...adapted0724.course,
    id: "mat-pilates-07-24",
    version: 7,
    title: "Mat Pilates — July 24"
  }
};

export const matPilates0724 = resolveCourseDefinition(
  matPilates0724Catalog.catalog,
  matPilates0724Catalog.course
);
