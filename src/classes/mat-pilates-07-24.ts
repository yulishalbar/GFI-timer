import type { FitnessClassDefinition } from "../domain/class-definition";

export const matPilates0724 = {
  schemaVersion: 1,
  id: "mat-pilates-07-24",
  version: 1,
  title: "Mat Pilates — July 24",
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
          durationSeconds: 90,
          shortDescription: "Lower the knees and return to neutral tabletop.",
          longDescription:
            "Inhale the right arm toward the ceiling. Exhale to thread it under the left shoulder and lower the head. Add three wrist circles in each direction, then repeat the twist without wrist circles."
        },
        {
          type: "exercise",
          id: "thread-needle-left",
          name: "Thread the needle — left",
          durationSeconds: 90,
          shortDescription: "Finish seated back on the heels, then come to a seated position.",
          longDescription:
            "Inhale the left arm toward the ceiling. Exhale to thread it under the right shoulder and lower the head. Add three wrist circles in each direction, then repeat the twist without wrist circles."
        }
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
        { type: "rest", id: "rest-after-single-leg-stretch", name: "Transition", durationSeconds: 10, shortDescription: "Stay down and prepare to add rotation." },
        {
          type: "exercise",
          id: "criss-cross",
          name: "Criss-cross",
          durationSeconds: 40,
          shortDescription: "Add torso rotation to the alternating legs.",
          longDescription:
            "Extend one leg and draw the opposite knee in as the opposite elbow rotates toward it. Switch steadily. Regression: continue single-leg stretch without rotation."
        },
        { type: "rest", id: "rest-after-criss-cross", name: "Transition", durationSeconds: 10, shortDescription: "Plant the feet with knees bent." },
        {
          type: "exercise",
          id: "crunch",
          name: "Crunch",
          durationSeconds: 40,
          shortDescription: "Knees bent and feet grounded.",
          longDescription:
            "Exhale to curl the head, shoulders, and ribcage toward the pelvis; inhale to lower with control. Option: hold the legs at tabletop."
        },
        { type: "rest", id: "rest-after-crunch", name: "Transition", durationSeconds: 10, shortDescription: "Extend the left leg and lift the right leg." },
        {
          type: "exercise",
          id: "leg-circle-right",
          name: "Leg circle — right",
          durationSeconds: 40,
          shortDescription: "Reverse direction after 20 seconds.",
          longDescription:
            "Circle the right leg across and down, returning to center with a stable pelvis. Regression: soften the working knee. Progression: make the circle larger."
        },
        { type: "rest", id: "rest-after-leg-circle-right", name: "Switch sides", durationSeconds: 10 },
        {
          type: "exercise",
          id: "leg-circle-left",
          name: "Leg circle — left",
          durationSeconds: 40,
          shortDescription: "Reverse direction after 20 seconds.",
          longDescription:
            "Circle the left leg across and down, returning to center with a stable pelvis. Regression: soften the working knee. Progression: make the circle larger."
        },
        { type: "rest", id: "rest-after-leg-circle-left", name: "Transition", durationSeconds: 10, shortDescription: "Extend both legs and reach the arms overhead." },
        {
          type: "exercise",
          id: "roll-ups",
          name: "Roll-ups",
          durationSeconds: 40,
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
        { type: "rest", id: "glutes-setup", name: "Rest and circuit preview", durationSeconds: 60, shortDescription: "Explain that the circuit has no breaks." },
        { type: "exercise", id: "bridge-one", name: "Full-range glute bridge", durationSeconds: 40, shortDescription: "Feet planted hip-width.", longDescription: "Drive through the heels to lift the hips and squeeze the glutes; lower with control.", illustration: "exercises/glute-bridge.svg" },
        { type: "exercise", id: "bridge-knee-drive-right", name: "Bridge with knee drive — right", durationSeconds: 40, shortDescription: "Keep the hips lifted.", longDescription: "Lift the bent right knee while squeezing the left glute, lower, and repeat. Regression: regular bridges." },
        { type: "exercise", id: "bridge-pulse-right", name: "Bridge knee-drive pulses — right", durationSeconds: 40, shortDescription: "Keep the right leg lifted.", longDescription: "Pulse the lifted leg without letting the hips lower." },
        { type: "exercise", id: "bridge-two", name: "Full-range glute bridge", durationSeconds: 40, shortDescription: "Return both feet to the mat.", longDescription: "Drive through the heels to lift the hips and squeeze the glutes; lower with control." },
        { type: "exercise", id: "bridge-knee-drive-left", name: "Bridge with knee drive — left", durationSeconds: 40, shortDescription: "Keep the hips lifted.", longDescription: "Lift the bent left knee while squeezing the right glute, lower, and repeat. Regression: regular bridges." },
        { type: "exercise", id: "bridge-pulse-left", name: "Bridge knee-drive pulses — left", durationSeconds: 40, shortDescription: "Keep the left leg lifted.", longDescription: "Pulse the lifted leg without letting the hips lower." },
        { type: "exercise", id: "bridge-three", name: "Full-range glute bridge", durationSeconds: 40, shortDescription: "Return both feet to the mat.", longDescription: "Drive through the heels to lift the hips and squeeze the glutes; lower with control." },
        { type: "exercise", id: "bridge-pulses", name: "Glute bridge pulses", durationSeconds: 40, shortDescription: "Stay lifted, then finish seated.", longDescription: "Use small pulses at the top while maintaining constant tension." }
      ]
    },
    {
      id: "posterior-core-circuit",
      name: "Circuit 3 — Core, Glutes, and Back",
      items: [
        { type: "rest", id: "prone-transition", name: "Transition", durationSeconds: 60, shortDescription: "Roll onto the stomach with legs extended." },
        { type: "exercise", id: "superman", name: "Superman", durationSeconds: 40, shortDescription: "Lie prone with arms and legs extended.", longDescription: "Lift arms, chest, and legs while keeping the neck neutral, then lower. Regression: leave the legs down." },
        { type: "rest", id: "rest-after-superman", name: "Transition", durationSeconds: 10 },
        { type: "exercise", id: "superman-flutter", name: "Superman hold with flutter arms", durationSeconds: 40, shortDescription: "Hold the lifted position.", longDescription: "Keep the chest and legs elevated while making small alternating arm lifts. Regression: regular superman repetitions." },
        { type: "rest", id: "rest-after-superman-flutter", name: "Transition", durationSeconds: 10, shortDescription: "Take child's pose, then come to tabletop." },
        { type: "exercise", id: "bird-dog-right", name: "Bird-dog extension and crunch — right", durationSeconds: 40, shortDescription: "Hands under shoulders and knees under hips.", longDescription: "Extend opposite arm and leg, then exhale to draw elbow and knee together under the body." },
        { type: "rest", id: "rest-after-bird-dog-right", name: "Switch sides", durationSeconds: 10 },
        { type: "exercise", id: "bird-dog-left", name: "Bird-dog extension and crunch — left", durationSeconds: 40, shortDescription: "Stay in tabletop with the core engaged.", longDescription: "Extend opposite arm and leg, then exhale to draw elbow and knee together under the body." },
        { type: "rest", id: "rest-after-bird-dog-left", name: "Transition", durationSeconds: 10, shortDescription: "Shift forward with the knees down." },
        { type: "exercise", id: "knee-push-ups", name: "Knee push-ups", durationSeconds: 40, shortDescription: "Keep a straight line from knees through shoulders.", longDescription: "Lower the chest toward the floor and press back up. Progression: full push-ups or a slower lowering phase." },
        { type: "rest", id: "rest-after-knee-push-ups", name: "Transition", durationSeconds: 10, shortDescription: "Lift the knees into high plank." },
        { type: "exercise", id: "plank-crunch", name: "High-plank alternating crunch", durationSeconds: 40, shortDescription: "Hands under shoulders and core braced.", longDescription: "Drive one knee toward the chest or elbow and alternate. Regression: slow march or hold plank." },
        { type: "rest", id: "rest-after-plank-crunch", name: "Transition", durationSeconds: 10 },
        { type: "exercise", id: "high-plank-hold", name: "High-plank hold", durationSeconds: 40, shortDescription: "Finish on the knees, take water, then stand.", longDescription: "Hold a neutral spine with steady breathing. Regression: bear hold or lower the knees.", illustration: "exercises/high-plank.svg" }
      ]
    },
    {
      id: "lower-body-circuit",
      name: "Circuit 4 — Lower Body",
      items: [
        { type: "rest", id: "lower-body-setup", name: "Rest and circuit preview", durationSeconds: 60, shortDescription: "Begin on the right; there are no breaks until switching sides." },
        { type: "exercise", id: "squat-to-stand-right", name: "Squat to stand — right round", durationSeconds: 30, shortDescription: "Feet hip-width.", longDescription: "Sit the hips back, then stand and squeeze the glutes." },
        { type: "exercise", id: "squat-pulse-right", name: "Squat pulse — right round", durationSeconds: 30, shortDescription: "Stay low with weight in the heels." },
        { type: "exercise", id: "reverse-lunge-right", name: "Reverse lunge — right", durationSeconds: 30, shortDescription: "Step the right leg back.", longDescription: "Lower into the lunge and drive through the left heel to stand." },
        { type: "exercise", id: "reverse-lunge-pulse-right", name: "Reverse-lunge pulse — right", durationSeconds: 30, shortDescription: "Stay in the lunge with the chest lifted." },
        { type: "exercise", id: "kickback-right", name: "Standing kickback — right", durationSeconds: 30, shortDescription: "Shift weight into the left leg.", longDescription: "Extend the right leg back with square hips, squeeze the glute, and return slowly." },
        { type: "exercise", id: "kickback-pulse-right", name: "Kickback hold and pulse — right", durationSeconds: 30, shortDescription: "Hold the right leg back and pulse." },
        { type: "rest", id: "lower-body-side-break", name: "Switch sides", durationSeconds: 20 },
        { type: "exercise", id: "squat-to-stand-left", name: "Squat to stand — left round", durationSeconds: 30, shortDescription: "Feet hip-width.", longDescription: "Sit the hips back, then stand and squeeze the glutes." },
        { type: "exercise", id: "squat-pulse-left", name: "Squat pulse — left round", durationSeconds: 30, shortDescription: "Stay low with weight in the heels." },
        { type: "exercise", id: "reverse-lunge-left", name: "Reverse lunge — left", durationSeconds: 30, shortDescription: "Step the left leg back.", longDescription: "Lower into the lunge and drive through the right heel to stand." },
        { type: "exercise", id: "reverse-lunge-pulse-left", name: "Reverse-lunge pulse — left", durationSeconds: 30, shortDescription: "Stay in the lunge with the chest lifted." },
        { type: "exercise", id: "kickback-left", name: "Standing kickback — left", durationSeconds: 30, shortDescription: "Shift weight into the right leg.", longDescription: "Extend the left leg back with square hips, squeeze the glute, and return slowly." },
        { type: "exercise", id: "kickback-pulse-left", name: "Kickback hold and pulse — left", durationSeconds: 30, shortDescription: "Hold the left leg back and pulse." }
      ]
    },
    {
      id: "side-body-circuit",
      name: "Circuit 5 — Side Body",
      items: [
        { type: "rest", id: "side-body-setup", name: "Rest and circuit preview", durationSeconds: 60, shortDescription: "Lie on the right side; there are no breaks until switching sides." },
        { type: "exercise", id: "leg-lift-right", name: "Side-lying leg lift — right", durationSeconds: 40, shortDescription: "Keep hips stacked and the top leg long.", longDescription: "Lift the top leg with control and lower slowly. Reduce the range or bend the bottom knee as needed." },
        { type: "exercise", id: "big-leg-circles-right", name: "Big leg circles — right", durationSeconds: 40, shortDescription: "Reverse direction after 20 seconds.", longDescription: "Draw large controlled circles while keeping the hips stable." },
        { type: "exercise", id: "forward-back-kick-right", name: "Forward-and-back kick — right", durationSeconds: 40, shortDescription: "Keep the top leg lifted.", longDescription: "Flex the foot and kick forward twice; point the toes and extend the leg back." },
        { type: "exercise", id: "small-leg-circles-right", name: "Small leg-circle pulses — right", durationSeconds: 40, shortDescription: "Reverse direction after 20 seconds." },
        { type: "exercise", id: "straight-leg-crunch-right", name: "Straight-leg crunch — right", durationSeconds: 40, shortDescription: "Come onto the forearm with the top foot planted.", longDescription: "Draw the straight lower leg toward the chest and crunch the opposite elbow toward it." },
        { type: "exercise", id: "tricep-push-up-right", name: "Tricep side push-up — right", durationSeconds: 40, shortDescription: "Place the top hand on the mat and lower arm across the body.", longDescription: "Press away from the mat using the triceps, then lower with control." },
        { type: "exercise", id: "side-plank-right", name: "Forearm side plank — right", durationSeconds: 40, shortDescription: "Forearm under shoulder; legs stacked or staggered.", longDescription: "Lift the hips into a strong line. Regression: lower the bottom knee." },
        { type: "rest", id: "side-body-side-break", name: "Switch sides", durationSeconds: 20 },
        { type: "exercise", id: "leg-lift-left", name: "Side-lying leg lift — left", durationSeconds: 40, shortDescription: "Keep hips stacked and the top leg long.", longDescription: "Lift the top leg with control and lower slowly. Reduce the range or bend the bottom knee as needed." },
        { type: "exercise", id: "big-leg-circles-left", name: "Big leg circles — left", durationSeconds: 40, shortDescription: "Reverse direction after 20 seconds.", longDescription: "Draw large controlled circles while keeping the hips stable." },
        { type: "exercise", id: "forward-back-kick-left", name: "Forward-and-back kick — left", durationSeconds: 40, shortDescription: "Keep the top leg lifted.", longDescription: "Flex the foot and kick forward twice; point the toes and extend the leg back." },
        { type: "exercise", id: "small-leg-circles-left", name: "Small leg-circle pulses — left", durationSeconds: 40, shortDescription: "Reverse direction after 20 seconds." },
        { type: "exercise", id: "straight-leg-crunch-left", name: "Straight-leg crunch — left", durationSeconds: 40, shortDescription: "Come onto the forearm with the top foot planted.", longDescription: "Draw the straight lower leg toward the chest and crunch the opposite elbow toward it." },
        { type: "exercise", id: "tricep-push-up-left", name: "Tricep side push-up — left", durationSeconds: 40, shortDescription: "Place the top hand on the mat and lower arm across the body.", longDescription: "Press away from the mat using the triceps, then lower with control." },
        { type: "exercise", id: "side-plank-left", name: "Forearm side plank — left", durationSeconds: 40, shortDescription: "Finish in child's pose, then come to the knees.", longDescription: "Lift the hips into a strong line. Regression: lower the bottom knee." }
      ]
    },
    {
      id: "cooldown",
      name: "Cooldown",
      items: [
        { type: "rest", id: "cooldown-transition", name: "Transition", durationSeconds: 30, shortDescription: "Come to the knees and then sit with the legs extended." },
        { type: "exercise", id: "seated-forward-fold", name: "Hamstring stretch and seated forward fold", durationSeconds: 120, shortDescription: "Lengthen the spine before folding.", longDescription: "Reach overhead on the inhale, then hinge from the hips toward the feet while relaxing the neck and shoulders." },
        { type: "exercise", id: "roll-down", name: "Roll down to the mat", durationSeconds: 30, shortDescription: "Lower one vertebra at a time." },
        { type: "exercise", id: "figure-four-right", name: "Figure four and spinal twist — right", durationSeconds: 120, shortDescription: "Cross the right ankle over the left knee.", longDescription: "Draw the supporting leg in for a glute stretch, then lower the legs left into a twist while keeping the shoulders relaxed." },
        { type: "exercise", id: "figure-four-left", name: "Figure four and spinal twist — left", durationSeconds: 120, shortDescription: "Cross the left ankle over the right knee.", longDescription: "Draw the supporting leg in for a glute stretch, then lower the legs right into a twist while keeping the shoulders relaxed." },
        { type: "exercise", id: "overhead-arm-stretch", name: "Overhead arm stretch", durationSeconds: 30, shortDescription: "Reach through fingers and toes, then soften the shoulders." },
        { type: "exercise", id: "shavasana", name: "Shavasana", durationSeconds: 180, shortDescription: "Finish seated and thank the class.", longDescription: "Rest comfortably on the back. Breathe slowly through the nose and out through the mouth, allowing the body to relax." }
      ]
    }
  ]
} satisfies FitnessClassDefinition;
