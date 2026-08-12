import type { FitnessClassDefinition } from "../domain/class-definition";

export const matPilates0731 = {
  schemaVersion: 1,
  id: "mat-pilates-07-31",
  version: 1,
  title: "Mat Pilates — July 31",
  description:
    "A standing-to-mat Pilates class focused on lower body, glutes, core, side body, upper body, and a restorative cooldown. Mat required.",
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
          shortDescription: "Welcome the class and preview the standing-to-mat full-body sequence.",
          longDescription:
            "Invite steady breathing and a mind-body focus. Explain that the class begins standing, progresses through lower-body and mat circuits, and finishes with mobility and rest."
        }
      ]
    },
    {
      id: "standing-warmup",
      name: "Standing Warm-Up",
      items: [
        {
          type: "exercise",
          id: "alternating-knee-pulls",
          name: "Alternating standing knee pulls",
          durationSeconds: 60,
          shortDescription: "Stand tall with feet hip-width and soften the supporting knee.",
          longDescription:
            "Draw one knee toward the chest with the hands behind the thigh, return with control, and switch sides. Keep the spine long instead of folding toward the knee.",
          illustration: "exercises/standing-knee-pull.svg"
        },
        {
          type: "exercise",
          id: "standing-roll-down",
          name: "Standing roll-down",
          durationSeconds: 30,
          shortDescription: "Feet parallel; leave a soft bend in the knees if needed.",
          longDescription:
            "Exhale to nod the chin and roll down one section of the spine at a time. Inhale at the bottom, then exhale to rebuild the spine from the pelvis upward."
        },
        {
          type: "exercise",
          id: "shoulder-rolls",
          name: "Standing shoulder rolls",
          durationSeconds: 30,
          shortDescription: "Stand tall with fingertips resting lightly on the shoulders.",
          longDescription:
            "Circle both elbows from the shoulder blades without swinging the ribs or pelvis. Reverse direction halfway through."
        },
        {
          type: "exercise",
          id: "sumo-squat-arm-sweep",
          name: "Sumo squat with arm sweep",
          durationSeconds: 60,
          shortDescription: "Take a wide stance and turn the toes out from the hips.",
          longDescription:
            "Inhale to bend the knees over the toes while sweeping the arms down and across. Exhale to press through the feet, stand tall, and reach overhead."
        },
        {
          type: "exercise",
          id: "hip-circles",
          name: "Standing hip circles",
          durationSeconds: 30,
          shortDescription: "Bring the feet parallel and place the hands on the hips.",
          longDescription:
            "Draw slow circles through the pelvis while the feet stay grounded and the upper body remains quiet. Reverse direction after 15 seconds."
        },
        {
          type: "exercise",
          id: "squat-to-twist",
          name: "Squat to standing twist",
          durationSeconds: 30,
          shortDescription: "Feet shoulder-width; hold the forearms at shoulder height.",
          longDescription:
            "Sit into a squat. As you stand, rotate the ribs and lift one knee toward the opposite side; return to center, squat, and alternate. Keep both knees tracking forward."
        },
        {
          type: "rest",
          id: "standing-circuit-preview",
          name: "Rest and circuit preview",
          durationSeconds: 60,
          shortDescription: "Preview the standing lower-body sequence and begin with feet hip-width."
        }
      ]
    },
    {
      id: "standing-lower-body",
      name: "Circuit 1 — Standing Lower Body",
      items: [
        {
          type: "exercise",
          id: "squat-arms-right-round",
          name: "Chair squat with arm lift — right round",
          durationSeconds: 30,
          shortDescription: "Stand tall with the arms by the hips.",
          longDescription:
            "Hinge the hips into a chair squat as the arms reach beside the ears, then press through the feet to stand and lower the arms with control."
        },
        {
          type: "exercise",
          id: "squat-hold-right-round",
          name: "Chair squat hold — right round",
          durationSeconds: 30,
          shortDescription: "Stay low with the arms reaching beside the ears.",
          longDescription:
            "Hold the chair position with the ribs stacked, pelvis neutral, and weight balanced through the whole foot. Reduce depth if the lower back takes over."
        },
        {
          type: "exercise",
          id: "squat-hold-leg-lift-right",
          name: "Squat hold with right leg lift",
          durationSeconds: 30,
          shortDescription: "Rise halfway, shift into the left foot, and keep the hips square.",
          longDescription:
            "Maintain a small standing-leg bend while reaching the pointed right leg back and slightly up. Squeeze the right glute without arching the lower back."
        },
        {
          type: "exercise",
          id: "squat-arms-left-round",
          name: "Chair squat with arm lift — left round",
          durationSeconds: 30,
          shortDescription: "Return both feet to the mat and stand tall.",
          longDescription:
            "Hinge the hips into a chair squat as the arms reach beside the ears, then press through the feet to stand and lower the arms with control."
        },
        {
          type: "exercise",
          id: "squat-hold-left-round",
          name: "Chair squat hold — left round",
          durationSeconds: 30,
          shortDescription: "Stay low with the arms reaching beside the ears.",
          longDescription:
            "Hold the chair position with the ribs stacked, pelvis neutral, and weight balanced through the whole foot. Reduce depth if needed."
        },
        {
          type: "exercise",
          id: "squat-hold-leg-lift-left",
          name: "Squat hold with left leg lift",
          durationSeconds: 30,
          shortDescription: "Rise halfway, shift into the right foot, and keep the hips square.",
          longDescription:
            "Maintain a small standing-leg bend while reaching the pointed left leg back and slightly up. Squeeze the left glute without arching the lower back."
        },
        {
          type: "rest",
          id: "standing-balance-reset",
          name: "Rest",
          durationSeconds: 60,
          shortDescription: "Shake out the legs and prepare for balance work, beginning on the right."
        },
        {
          type: "exercise",
          id: "side-back-kick-right",
          name: "Side-to-back kick — right",
          durationSeconds: 45,
          shortDescription: "Stand on the left leg with a soft knee and hands at the waist.",
          longDescription:
            "Lift the right leg to the side, return through a hover, then hinge forward and extend it behind you. Keep the pelvis square and use a wall for balance if needed.",
          illustration: "exercises/standing-side-back-kick.svg"
        },
        {
          type: "rest",
          id: "switch-side-back-kick",
          name: "Switch sides",
          durationSeconds: 10,
          shortDescription: "Transfer weight to the right foot."
        },
        {
          type: "exercise",
          id: "side-back-kick-left",
          name: "Side-to-back kick — left",
          durationSeconds: 45,
          shortDescription: "Stand on the right leg with a soft knee and hands at the waist.",
          longDescription:
            "Lift the left leg to the side, return through a hover, then hinge forward and extend it behind you. Keep the pelvis square and move slowly enough to balance.",
          illustration: "exercises/standing-side-back-kick.svg"
        },
        {
          type: "exercise",
          id: "deadlift-knee-tuck-right",
          name: "Single-leg deadlift to knee tuck — right",
          durationSeconds: 45,
          shortDescription: "Load the left foot and float the right toes behind you.",
          longDescription:
            "Hinge forward as the right leg reaches back and the right hand reaches toward the floor. Stand tall and draw the right knee forward. Option: tap the toes between repetitions; progression: add two knee-tuck pulses.",
          illustration: "exercises/single-leg-deadlift.svg"
        },
        {
          type: "exercise",
          id: "deadlift-knee-tuck-left",
          name: "Single-leg deadlift to knee tuck — left",
          durationSeconds: 45,
          shortDescription: "Load the right foot and float the left toes behind you.",
          longDescription:
            "Hinge forward as the left leg reaches back and the left hand reaches toward the floor. Stand tall and draw the left knee forward. Option: tap the toes between repetitions; progression: add two knee-tuck pulses.",
          illustration: "exercises/single-leg-deadlift.svg"
        }
      ]
    },
    {
      id: "quadruped-glutes-core",
      name: "Circuit 2 — Glutes and Core",
      items: [
        {
          type: "rest",
          id: "quadruped-setup",
          name: "Rest and setup",
          durationSeconds: 60,
          shortDescription: "Come to tabletop or lower to the forearms; begin with the left leg."
        },
        {
          type: "exercise",
          id: "quadruped-leg-lift-left",
          name: "Quadruped straight-leg lift — left",
          durationSeconds: 40,
          shortDescription: "Extend the left leg long with the toes pointed toward the mat.",
          longDescription:
            "Lift the straight leg from the glute until it reaches hip height, then lower without shifting the pelvis. Brace the core and keep both shoulders square.",
          illustration: "exercises/quadruped-leg-series.svg"
        },
        {
          type: "exercise",
          id: "side-crunch-left",
          name: "Quadruped side crunch — left",
          durationSeconds: 40,
          shortDescription: "Keep the left leg lifted and the standing side stable.",
          longDescription:
            "Draw the left knee toward the left elbow with a side-body contraction, then extend the leg long behind you without rotating the torso.",
          illustration: "exercises/quadruped-leg-series.svg"
        },
        {
          type: "exercise",
          id: "cross-body-crunch-left",
          name: "Quadruped cross-body crunch — left",
          durationSeconds: 40,
          shortDescription: "Extend the left leg and prepare to cross underneath the body.",
          longDescription:
            "Bend the left knee and draw it toward the right elbow as the supporting arms bend slightly. Re-extend behind you and return the shoulders over the wrists."
        },
        {
          type: "exercise",
          id: "combined-crunch-left",
          name: "Side and cross-body crunch — left",
          durationSeconds: 40,
          shortDescription: "Alternate one same-side crunch with one cross-body crunch.",
          longDescription:
            "Move the left knee toward the left elbow, extend, then draw it toward the right elbow. Keep the repetitions deliberate and the pelvis as level as possible."
        },
        {
          type: "exercise",
          id: "side-crunch-extension-left",
          name: "Side crunch with leg extension — left",
          durationSeconds: 40,
          shortDescription: "Bring the left knee toward the left elbow.",
          longDescription:
            "From the side crunch, straighten the left leg out to the side, bend it back in, then extend it behind you. Reduce the range to keep the trunk stable."
        },
        {
          type: "exercise",
          id: "half-rainbow-left",
          name: "Half rainbow — left",
          durationSeconds: 40,
          shortDescription: "Extend and point the left leg behind you.",
          longDescription:
            "Sweep the straight left leg in a controlled arc toward the left side of the mat, lift through center, and return. Keep the movement in the hip rather than the lower back.",
          illustration: "exercises/quadruped-leg-series.svg"
        },
        {
          type: "rest",
          id: "quadruped-side-switch",
          name: "Switch sides",
          durationSeconds: 30,
          shortDescription: "Reset the wrists or forearms and extend the right leg."
        },
        {
          type: "exercise",
          id: "quadruped-leg-lift-right",
          name: "Quadruped straight-leg lift — right",
          durationSeconds: 40,
          shortDescription: "Extend the right leg long with the toes pointed toward the mat.",
          longDescription:
            "Lift the straight leg from the glute until it reaches hip height, then lower without shifting the pelvis. Brace the core and keep both shoulders square.",
          illustration: "exercises/quadruped-leg-series.svg"
        },
        {
          type: "exercise",
          id: "side-crunch-right",
          name: "Quadruped side crunch — right",
          durationSeconds: 40,
          shortDescription: "Keep the right leg lifted and the standing side stable.",
          longDescription:
            "Draw the right knee toward the right elbow with a side-body contraction, then extend the leg long behind you without rotating the torso.",
          illustration: "exercises/quadruped-leg-series.svg"
        },
        {
          type: "exercise",
          id: "cross-body-crunch-right",
          name: "Quadruped cross-body crunch — right",
          durationSeconds: 40,
          shortDescription: "Extend the right leg and prepare to cross underneath the body.",
          longDescription:
            "Bend the right knee and draw it toward the left elbow as the supporting arms bend slightly. Re-extend behind you and return the shoulders over the wrists."
        },
        {
          type: "exercise",
          id: "combined-crunch-right",
          name: "Side and cross-body crunch — right",
          durationSeconds: 40,
          shortDescription: "Alternate one same-side crunch with one cross-body crunch.",
          longDescription:
            "Move the right knee toward the right elbow, extend, then draw it toward the left elbow. Keep the repetitions deliberate and the pelvis as level as possible."
        },
        {
          type: "exercise",
          id: "side-crunch-extension-right",
          name: "Side crunch with leg extension — right",
          durationSeconds: 40,
          shortDescription: "Bring the right knee toward the right elbow.",
          longDescription:
            "From the side crunch, straighten the right leg out to the side, bend it back in, then extend it behind you. Reduce the range to keep the trunk stable."
        },
        {
          type: "exercise",
          id: "half-rainbow-right",
          name: "Half rainbow — right",
          durationSeconds: 40,
          shortDescription: "Extend and point the right leg behind you.",
          longDescription:
            "Sweep the straight right leg in a controlled arc toward the right side of the mat, lift through center, and return. Keep the movement in the hip rather than the lower back.",
          illustration: "exercises/quadruped-leg-series.svg"
        }
      ]
    },
    {
      id: "core-circuit",
      name: "Circuit 3 — Core",
      items: [
        {
          type: "rest",
          id: "core-setup",
          name: "Transition",
          durationSeconds: 60,
          shortDescription: "Roll onto the back and bring the legs to tabletop."
        },
        {
          type: "repeat",
          id: "core-rounds",
          rounds: 2,
          items: [
            {
              type: "exercise",
              id: "alternating-toe-taps",
              name: "Alternating toe taps",
              durationSeconds: 45,
              shortDescription: "Knees over hips; keep the ribs and pelvis heavy.",
              longDescription:
                "Lower one bent leg until the toes tap the mat, return to tabletop, and alternate. Keep the head down or curl up for more challenge."
            },
            {
              type: "exercise",
              id: "double-toe-taps",
              name: "Double-leg toe taps",
              durationSeconds: 45,
              shortDescription: "Keep both knees bent at tabletop.",
              longDescription:
                "Lower both feet toward the mat together and return without changing the shape of the knees. Make the range smaller if the lower back lifts."
            },
            {
              type: "exercise",
              id: "toe-tap-reverse-crunch",
              name: "Toe tap to reverse crunch",
              durationSeconds: 45,
              shortDescription: "Alternate a controlled double toe tap with a small hip curl.",
              longDescription:
                "Tap both toes toward the mat, return to tabletop, then exhale to curl the tailbone and lift the hips slightly. Lower the pelvis softly before repeating.",
              illustration: "exercises/toe-tap-reverse-crunch.svg"
            },
            {
              type: "exercise",
              id: "supine-bird-dogs",
              name: "Supine alternating bird dogs",
              durationSeconds: 45,
              shortDescription: "Arms reach over shoulders and legs remain in tabletop.",
              longDescription:
                "Extend one arm overhead and the opposite leg away, return to center, and switch. Keep the back of the ribs grounded; shorten the reach as needed."
            },
            {
              type: "exercise",
              id: "single-leg-stretch",
              name: "Single-leg stretch",
              durationSeconds: 45,
              shortDescription: "Curl up or keep the head supported on the mat.",
              longDescription:
                "Draw one knee in as the opposite leg extends, then switch with control. Keep the pelvis stable and breathe continuously."
            },
            {
              type: "exercise",
              id: "scissors",
              name: "Pilates scissors",
              durationSeconds: 45,
              shortDescription: "Extend both legs and hold behind one thigh or calf.",
              longDescription:
                "Draw one straight leg toward you as the other lowers, pulse gently, and switch. Soften the knees or reduce the range to keep the pelvis steady."
            },
            {
              type: "rest",
              id: "round-reset",
              name: "Round reset",
              durationSeconds: 30,
              shortDescription: "Hug the knees in; after round two, prepare to roll onto the side."
            }
          ]
        }
      ]
    },
    {
      id: "side-body-circuit",
      name: "Circuit 4 — Side Body",
      items: [
        {
          type: "rest",
          id: "side-body-setup",
          name: "Rest and circuit preview",
          durationSeconds: 60,
          shortDescription: "Lie on the right side to work the left leg first."
        },
        {
          type: "exercise",
          id: "leg-lifts-left",
          name: "Side-lying leg lifts — left",
          durationSeconds: 30,
          shortDescription: "Stack the hips and lengthen the left leg.",
          longDescription:
            "Lift the top leg from the outer hip and lower with control. Keep the waist long and the kneecap facing forward.",
          illustration: "exercises/side-lying-leg-series.svg"
        },
        {
          type: "exercise",
          id: "leg-pulses-left",
          name: "Top-leg pulses — left",
          durationSeconds: 30,
          shortDescription: "Hold the left leg at hip height.",
          longDescription:
            "Pulse the straight leg through a small range without rocking the pelvis or shortening the waist."
        },
        {
          type: "exercise",
          id: "large-circles-left",
          name: "Large leg circles — left",
          durationSeconds: 30,
          shortDescription: "Keep the top leg long; reverse halfway.",
          longDescription:
            "Draw the largest circle that allows the hips and ribs to remain stacked. Slow the movement rather than using momentum."
        },
        {
          type: "exercise",
          id: "small-circles-left",
          name: "Small leg circles — left",
          durationSeconds: 30,
          shortDescription: "Reduce the circle and keep constant outer-hip tension.",
          longDescription:
            "Trace small precise circles from the hip joint. Reverse direction after 15 seconds."
        },
        {
          type: "exercise",
          id: "static-hold-left",
          name: "Top-leg static hold — left",
          durationSeconds: 30,
          shortDescription: "Hold the left leg long at a sustainable height.",
          longDescription:
            "Reach through the heel while keeping the pelvis still. Lower briefly whenever alignment starts to change."
        },
        {
          type: "exercise",
          id: "clamshell-left",
          name: "Clamshell openers — left",
          durationSeconds: 30,
          shortDescription: "Bend both knees and keep the heels together.",
          longDescription:
            "Rotate the top knee open without rolling the top hip backward, then close with control."
        },
        {
          type: "exercise",
          id: "clamshell-kick-left",
          name: "Clamshell opener with kick — left",
          durationSeconds: 30,
          shortDescription: "Open the left knee while the heels stay together.",
          longDescription:
            "Open the clamshell, extend the top leg on a diagonal, bend the knee, and close. Keep the pelvis stacked throughout."
        },
        {
          type: "rest",
          id: "side-body-switch",
          name: "Switch sides",
          durationSeconds: 30,
          shortDescription: "Roll onto the left side to work the right leg."
        },
        {
          type: "exercise",
          id: "leg-lifts-right",
          name: "Side-lying leg lifts — right",
          durationSeconds: 30,
          shortDescription: "Stack the hips and lengthen the right leg.",
          longDescription:
            "Lift the top leg from the outer hip and lower with control. Keep the waist long and the kneecap facing forward.",
          illustration: "exercises/side-lying-leg-series.svg"
        },
        {
          type: "exercise",
          id: "leg-pulses-right",
          name: "Top-leg pulses — right",
          durationSeconds: 30,
          shortDescription: "Hold the right leg at hip height.",
          longDescription:
            "Pulse the straight leg through a small range without rocking the pelvis or shortening the waist."
        },
        {
          type: "exercise",
          id: "large-circles-right",
          name: "Large leg circles — right",
          durationSeconds: 30,
          shortDescription: "Keep the top leg long; reverse halfway.",
          longDescription:
            "Draw the largest circle that allows the hips and ribs to remain stacked. Slow the movement rather than using momentum."
        },
        {
          type: "exercise",
          id: "small-circles-right",
          name: "Small leg circles — right",
          durationSeconds: 30,
          shortDescription: "Reduce the circle and keep constant outer-hip tension.",
          longDescription:
            "Trace small precise circles from the hip joint. Reverse direction after 15 seconds."
        },
        {
          type: "exercise",
          id: "static-hold-right",
          name: "Top-leg static hold — right",
          durationSeconds: 30,
          shortDescription: "Hold the right leg long at a sustainable height.",
          longDescription:
            "Reach through the heel while keeping the pelvis still. Lower briefly whenever alignment starts to change."
        },
        {
          type: "exercise",
          id: "clamshell-right",
          name: "Clamshell openers — right",
          durationSeconds: 30,
          shortDescription: "Bend both knees and keep the heels together.",
          longDescription:
            "Rotate the top knee open without rolling the top hip backward, then close with control."
        },
        {
          type: "exercise",
          id: "clamshell-kick-right",
          name: "Clamshell opener with kick — right",
          durationSeconds: 30,
          shortDescription: "Open the right knee while the heels stay together.",
          longDescription:
            "Open the clamshell, extend the top leg on a diagonal, bend the knee, and close. Keep the pelvis stacked throughout."
        }
      ]
    },
    {
      id: "upper-body-back",
      name: "Circuit 5 — Upper Body and Back",
      items: [
        {
          type: "rest",
          id: "upper-body-setup",
          name: "Rest and circuit preview",
          durationSeconds: 60,
          shortDescription: "Come to tabletop and prepare to row with the left arm."
        },
        {
          type: "exercise",
          id: "back-row-left",
          name: "Tabletop back row — left",
          durationSeconds: 40,
          shortDescription: "Root through the right hand and reach the left arm toward the mat.",
          longDescription:
            "Draw the left elbow toward the ribs and squeeze the shoulder blade toward the spine, then extend the arm down. Keep the torso square."
        },
        {
          type: "exercise",
          id: "row-arm-lift-left",
          name: "Back row to arm lift — left",
          durationSeconds: 40,
          shortDescription: "Keep the right hand grounded and the neck long.",
          longDescription:
            "Row the left elbow to the ribs, straighten the arm behind you, lift it slightly from the shoulder, then return with control."
        },
        {
          type: "exercise",
          id: "back-row-right",
          name: "Tabletop back row — right",
          durationSeconds: 40,
          shortDescription: "Root through the left hand and reach the right arm toward the mat.",
          longDescription:
            "Draw the right elbow toward the ribs and squeeze the shoulder blade toward the spine, then extend the arm down. Keep the torso square."
        },
        {
          type: "exercise",
          id: "row-arm-lift-right",
          name: "Back row to arm lift — right",
          durationSeconds: 40,
          shortDescription: "Keep the left hand grounded and the neck long.",
          longDescription:
            "Row the right elbow to the ribs, straighten the arm behind you, lift it slightly from the shoulder, then return with control."
        },
        {
          type: "exercise",
          id: "pilates-push-ups",
          name: "Pilates push-ups",
          durationSeconds: 40,
          shortDescription: "Hands under shoulders; use knees or toes.",
          longDescription:
            "Keep the elbows angled back as the chest lowers, then press the floor away. Maintain one long line from the knees or heels through the crown."
        },
        {
          type: "exercise",
          id: "plank-shoulder-taps",
          name: "High-plank shoulder taps",
          durationSeconds: 40,
          shortDescription: "Widen the feet and brace the core before lifting a hand.",
          longDescription:
            "Alternate tapping the opposite shoulder while minimizing hip rotation. Lower the knees or hold a static plank as needed.",
          illustration: "exercises/high-plank.svg"
        }
      ]
    },
    {
      id: "cooldown",
      name: "Cooldown",
      items: [
        {
          type: "exercise",
          id: "seated-overhead-stretch",
          name: "Seated overhead arm stretch",
          durationSeconds: 30,
          shortDescription: "Sit tall with crossed legs and relax the shoulders.",
          longDescription:
            "Inhale to reach both arms overhead and lengthen the sides of the waist. Exhale to soften the shoulders while keeping the spine tall."
        },
        {
          type: "exercise",
          id: "seated-straddle",
          name: "Seated straddle folds",
          durationSeconds: 90,
          shortDescription: "Extend the legs into a comfortable V shape.",
          longDescription:
            "Fold over the right leg for 30 seconds, the left for 30 seconds, then reach through the center for 30 seconds. Lead with a long spine and soften the knees if needed."
        },
        {
          type: "exercise",
          id: "seated-twist",
          name: "Seated spinal twists",
          durationSeconds: 60,
          shortDescription: "Cross the legs and sit evenly on both sitting bones.",
          longDescription:
            "Rotate left with the right hand to the left knee and the left hand behind you. Return to center and switch after 30 seconds without forcing the neck."
        },
        {
          type: "exercise",
          id: "knee-chest-right",
          name: "Knee-to-chest stretch — right",
          durationSeconds: 30,
          shortDescription: "Roll onto the back and draw the right knee in.",
          longDescription:
            "Hold behind the thigh or over the shin and breathe into the back of the hip while the left leg rests comfortably."
        },
        {
          type: "exercise",
          id: "supine-twist-right",
          name: "Supine twist — right",
          durationSeconds: 30,
          shortDescription: "Guide the right knee across the body toward the left.",
          longDescription:
            "Extend the right arm and keep both shoulders relaxed toward the mat. Reduce the twist if the shoulder lifts or the lower back pinches."
        },
        {
          type: "exercise",
          id: "knee-chest-left",
          name: "Knee-to-chest stretch — left",
          durationSeconds: 30,
          shortDescription: "Return to center and draw the left knee in.",
          longDescription:
            "Hold behind the thigh or over the shin and breathe into the back of the hip while the right leg rests comfortably."
        },
        {
          type: "exercise",
          id: "supine-twist-left",
          name: "Supine twist — left",
          durationSeconds: 30,
          shortDescription: "Guide the left knee across the body toward the right.",
          longDescription:
            "Extend the left arm and keep both shoulders relaxed toward the mat. Reduce the twist if the shoulder lifts or the lower back pinches."
        },
        {
          type: "exercise",
          id: "shavasana",
          name: "Shavasana",
          durationSeconds: 180,
          shortDescription: "Rest comfortably, then finish seated and thank the class.",
          longDescription:
            "Let the arms and legs relax. Breathe slowly through the nose and out through the mouth, allowing the effort of the class to settle.",
          illustration: "exercises/shavasana.jpg"
        }
      ]
    }
  ]
} satisfies FitnessClassDefinition;
