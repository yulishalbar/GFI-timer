import type { FitnessClassDefinition } from "../domain/class-definition";
import { builtInTags } from "../catalog/tags";
import { normalizeDatedCatalog } from "../catalog/normalize-dated";
import { adaptLegacyClassToCatalog } from "../domain/legacy-catalog-adapter";
import { resolveCourseDefinition } from "../domain/resolve-course";

export const matPilates0731Legacy = {
  schemaVersion: 1,
  id: "mat-pilates-07-31-v1",
  version: 2,
  title: "Mat Pilates — July 31 V1",
  description:
    "60 MIN MAT PILATES- WARM UP, CORE, ARMS, GLUTES, LOWER BODY, & COOL DOWN. Equipment: mat. Focus on the mind and body connection, stretch the total body, and work the upper body, core, and legs.",
  phases: [
    {
      id: "introduction",
      name: "Introduction",
      items: [
        {
          type: "exercise",
          id: "class-introduction",
          name: "INTRODUCTION",
          durationSeconds: 120,
          shortDescription:
            "Focus on the mind and body connection, stretch the total body, and work the upper body, core, and legs."
        }
      ]
    },
    {
      id: "standing-warmup",
      name: "Warm-Up (Standing)",
      items: [
        {
          type: "exercise",
          id: "alternating-knee-pulls",
          name: "Knee pulls alternating legs",
          durationSeconds: 60,
          shortDescription: "Stand up tall with spine straight. Feet hip width apart",
          longDescription: "pull one leg towards the chest using hands under knee. Switch sides",
          illustration: "exercises/standing-knee-pull.svg"
        },
        {
          type: "exercise",
          id: "standing-roll-down",
          name: "Standing roll down",
          durationSeconds: 30,
          shortDescription: "Stand up tall with spine straight",
          longDescription:
            "Inhale as you initiate movement through the chest, exhale begin rolling down the chin towards the chest, round the shoulders, then upper back, finally lower back and reach all the way down with straight legs or a slight bend in the knee. Inhale at the bottom, exhale and curl back up vertebrae by vertebrae"
        },
        {
          type: "exercise",
          id: "shoulder-rolls",
          name: "shoulder rolls",
          durationSeconds: 30,
          shortDescription: "Stand up tall with straight spine, fingers on shoulder blades",
          longDescription:
            "Begin to roll both shoulders simultaneously, initiating the movement through the shoulder blade and not the back; ensure you're not swinging the body"
        },
        {
          type: "exercise",
          id: "sumo-squat-hand-lifts",
          name: "Sumo squat and hand lifts",
          durationSeconds: 60,
          shortDescription: "Bring your feet to a wider stance, turning your toes out from the hips",
          longDescription:
            "Inhale, to lower down sweeping the arms across; exhale, extend up all the way, sweeping the arms upwards, reaching up towards the sky"
        },
        {
          type: "exercise",
          id: "hip-circles",
          name: "Hip circles",
          durationSeconds: 30,
          shortDescription: "Bring feet so that they are parallel, place arms on hips",
          longDescription: "Draw large and slow circles through the hips. Reverse direction after 15 sec"
        },
        {
          type: "exercise",
          id: "squat-to-twist",
          name: "Squat to twist",
          durationSeconds: 30,
          shortDescription: "Bring feet closer together, shoulder-width apart.",
          longDescription:
            "Squat down and on the way up, with the arms stacked horizontally at the height of the shoulders, twist a single leg towards one side, shift the gaze towards that side. Lower down to a squat and repeat"
        },
        {
          type: "rest",
          id: "standing-circuit-preview",
          name: "REST",
          durationSeconds: 60
        }
      ]
    },
    {
      id: "standing-lower-body",
      name: "Circuit #1: Standing lower body",
      items: [
        {
          type: "exercise",
          id: "squat-arms-right-round",
          name: "Squat -> add arms",
          durationSeconds: 30,
          shortDescription: "Stand tall with hands by the hips",
          longDescription:
            "Squat down in a chair pose and lift arms up with control. Hinge at the hips"
        },
        {
          type: "exercise",
          id: "squat-hold-right-round",
          name: "Squat hold",
          durationSeconds: 30,
          shortDescription:
            "Same position as before, low chair-pose square with arms lifted next to ears.",
          longDescription:
            "Without a rest, stay low and hold, closing the ribs and tucking the pelvis under"
        },
        {
          type: "exercise",
          id: "squat-hold-leg-lift-right",
          name: "Squat hold leg lift (R)",
          durationSeconds: 30,
          shortDescription:
            "Come up half-way to chair-pose square with arms lifted next to ears.",
          longDescription:
            "Without a rest stay low and hold, closing the ribs and tucking the pelvis under; point and lift the right leg up and back, squeezing the glutes. Stay square to mat"
        },
        {
          type: "exercise",
          id: "squat-arms-left-round",
          name: "Squat -> add arms",
          durationSeconds: 30,
          shortDescription: "Stand tall with hands by the hips",
          longDescription:
            "Squat down in a chair pose and lift arms up with control. Hinge at the hips"
        },
        {
          type: "exercise",
          id: "squat-hold-left-round",
          name: "Squat hold",
          durationSeconds: 30,
          shortDescription:
            "Same position as before, low chair-pose square with arms lifted next to ears.",
          longDescription:
            "Without a rest, stay low and hold, closing the ribs and tucking the pelvis under"
        },
        {
          type: "exercise",
          id: "squat-hold-leg-lift-left",
          name: "Squat hold leg lift (L)",
          durationSeconds: 30,
          shortDescription:
            "Come up half-way to chair-pose square with arms lifted next to ears.",
          longDescription:
            "Without a rest stay low and hold, closing the ribs and tucking the pelvis under; point and lift the left leg up and back, squeezing the glutes. Stay square to mat"
        },
        {
          type: "rest",
          id: "standing-balance-reset",
          name: "REST",
          durationSeconds: 60,
          shortDescription: "Go over next exercises"
        },
        {
          type: "exercise",
          id: "side-back-kick-right",
          name: "Side to back kick (R)",
          durationSeconds: 40,
          shortDescription: "Standing with a slight bend in the knees, hands on waist",
          longDescription:
            "Open left leg to the side using left glute muscle; bring it back to center still hovering the leg in the air, and hinge forward as you kick leg towards the back of the room",
          illustration: "exercises/standing-side-back-kick.svg"
        },
        {
          type: "rest",
          id: "right-kick-reset",
          name: "REST",
          durationSeconds: 10,
          shortDescription: "Go over next movement"
        },
        {
          type: "exercise",
          id: "deadlift-knee-tuck-right",
          name: "single-leg deadlift (SLDL) to knee tuck (R)",
          durationSeconds: 40,
          shortDescription:
            "Left leg goes slightly forward with most of the weight, right leg back, have a slight bend in the knees. Arms beside hips",
          longDescription:
            "SLDL: Lift right leg and hinge forward, touching right hand to the ground. Knee tuck: Lift leg back to original position and place left arm horizontal where right leg lifts towards. P-> pulse leg at knee tuck twice, keep leg hovering R-> place foot on ground in between reps",
          motionIllustrations: [
            "exercises/single-leg-deadlift-hinge-v2.jpg",
            "exercises/single-leg-deadlift-knee-tuck-v2.jpg"
          ]
        },
        {
          type: "rest",
          id: "standing-side-switch",
          name: "REST",
          durationSeconds: 10,
          shortDescription: "Switch sides"
        },
        {
          type: "exercise",
          id: "side-back-kick-left",
          name: "Side to back kick (L)",
          durationSeconds: 45,
          shortDescription: "Standing with a slight bend in the knees, hands on waist",
          longDescription:
            "Open left leg to the side using right glute muscle; bring it back to center, still hovering the leg in the air, and hinge forward as you kick leg towards the back of the room",
          illustration: "exercises/standing-side-back-kick.svg"
        },
        {
          type: "rest",
          id: "left-kick-reset",
          name: "REST",
          durationSeconds: 10,
          shortDescription: "Go over next movement"
        },
        {
          type: "exercise",
          id: "deadlift-knee-tuck-left",
          name: "single-leg deadlift (SLDL) to knee tuck (L)",
          durationSeconds: 45,
          shortDescription:
            "Right leg goes slightly forward with most of the weight, left leg back, have a slight bend in the knees. Arms beside hips",
          longDescription:
            "SLDL: Lift right leg and hinge forward, touching left hand to the ground. Knee tuck: Lift leg back to original position and place left arm horizontal where right leg lifts towards. P-> pulse leg at knee tuck twice, keep leg hovering R-> place foot on ground in between reps",
          motionIllustrations: [
            "exercises/single-leg-deadlift-hinge-v2.jpg",
            "exercises/single-leg-deadlift-knee-tuck-v2.jpg"
          ]
        }
      ]
    },
    {
      id: "quadruped-glutes-core",
      name: "Circuit #2: glutes and core",
      items: [
        {
          type: "rest",
          id: "quadruped-setup",
          name: "REST",
          durationSeconds: 60,
          shortDescription:
            "Come to tabletop position with hips squared to mat, left hand straight and right hand on elbow. Option to have both straight extended, or both elbows bent"
        },
        ...quadrupedSide("left"),
        {
          type: "rest",
          id: "quadruped-side-switch",
          name: "REST",
          durationSeconds: 30,
          shortDescription: "Switch sides"
        },
        ...quadrupedSide("right")
      ]
    },
    {
      id: "core-circuit",
      name: "Circuit #3: core",
      items: [
        {
          type: "rest",
          id: "core-setup",
          name: "REST",
          durationSeconds: 60,
          shortDescription: "Roll on to stomach with extended legs and arms by sides"
        },
        ...coreRound("one", true),
        ...coreRound("two", false)
      ]
    },
    {
      id: "side-body-circuit",
      name: "Circuit #4: side body",
      items: [
        {
          type: "rest",
          id: "side-body-setup",
          name: "REST",
          durationSeconds: 60,
          shortDescription:
            "Meet me lying on right side with left leg stacked on top of right leg. Cue full circuit (Starting on right side)"
        },
        ...sideBodySide("left"),
        {
          type: "rest",
          id: "side-body-switch",
          name: "REST",
          durationSeconds: 30,
          shortDescription: "Repeat on left side"
        },
        ...sideBodySide("right")
      ]
    },
    {
      id: "upper-body-back",
      name: "Circuit #5: upper body and back",
      items: [
        {
          type: "rest",
          id: "upper-body-setup",
          name: "REST",
          durationSeconds: 60,
          shortDescription: "Cue full circuit (Starting on right side)"
        },
        { type: "exercise", id: "arm-circles", name: "Arm circles", durationSeconds: 40 },
        {
          type: "exercise",
          id: "small-arm-circles",
          name: "Small arm circles",
          durationSeconds: 40
        },
        {
          type: "rest",
          id: "upper-body-explanation",
          name: "REST",
          durationSeconds: 10,
          shortDescription: "Explain next movements"
        },
        {
          type: "exercise",
          id: "pilates-push-ups",
          name: "Pilates push-ups",
          durationSeconds: 30
        },
        {
          type: "exercise",
          id: "plank-shoulder-taps",
          name: "High plank shoulder taps, alternating hands",
          durationSeconds: 30,
          illustration: "exercises/high-plank.svg"
        },
        {
          type: "exercise",
          id: "alternating-side-planks",
          name: "High plank opening to a side planks (alternating)",
          durationSeconds: 30,
          illustration: "exercises/high-plank.svg"
        },
        {
          type: "exercise",
          id: "high-plank-hold",
          name: "High plank hold",
          durationSeconds: 30,
          illustration: "exercises/high-plank.svg"
        },
        {
          type: "rest",
          id: "upper-body-finish-break",
          name: "REST",
          durationSeconds: 20,
          shortDescription: "Repeat on left side. Cue: sit up tall with legs crossed"
        }
      ]
    },
    {
      id: "cooldown",
      name: "Cooldown",
      items: [
        {
          type: "exercise",
          id: "overhead-arm-stretch",
          name: "Overhead arm stretch",
          durationSeconds: 30,
          longDescription:
            "Extend arms overhead along the mat. Inhale reaching through fingers and toes to lengthen the body. Exhale relaxing shoulders and allowing the chest to open."
        },
        {
          type: "exercise",
          id: "seated-straddle",
          name: "Seated Straddle",
          durationSeconds: 90,
          shortDescription: "Sit on the floor. Spread your legs wide apart into a V-shape.",
          longDescription:
            "Fold over right leg (30 sec). Then fold over left (30 sec). Fold over middle (30 sec)",
          illustration: "exercises/seated-straddle-fold.jpg"
        },
        {
          type: "exercise",
          id: "side-twist",
          name: "Side twist",
          durationSeconds: 60,
          shortDescription: "Sit with legs crossed",
          longDescription:
            "Twist towards the left side, grabbing left knee with right hand and left hand towards the back. Switch sides after 30 sec"
        },
        // The second pair was authored as (L) as well, which left the right side
        // unstretched. Corrected to (R), and the twist renamed to name the
        // movement rather than one side of it, so the side badge can carry it.
        {
          type: "exercise",
          id: "knee-chest-left",
          name: "Knee to chest stretch (L)",
          durationSeconds: 30,
          shortDescription: "Slowly roll onto back"
        },
        {
          type: "exercise",
          id: "knee-across-left",
          name: "Knee across the body (L)",
          durationSeconds: 30
        },
        {
          type: "exercise",
          id: "knee-chest-right",
          name: "Knee to chest stretch (R)",
          durationSeconds: 30
        },
        {
          type: "exercise",
          id: "knee-across-right",
          name: "Knee across the body (R)",
          durationSeconds: 30
        },
        {
          type: "exercise",
          id: "shavasana",
          name: "Shavasana",
          durationSeconds: 180,
          shortDescription: "Lie comfortably on back with arms relaxed at sides.",
          longDescription:
            "Slow inhale through the nose, slow exhale through the mouth. Allow the body to fully relax and breathing to settle naturally. end→ come to seated. Closing words: Thank you for coming today and working out early in the morning, amazing job! Don't forget to wipe down your mat. See you next time!",
          illustration: "exercises/shavasana.jpg"
        }
      ]
    }
  ]
} satisfies FitnessClassDefinition;

type Side = "left" | "right";

function quadrupedBreak(id: string): FitnessClassDefinition["phases"][number]["items"][number] {
  return { type: "rest", id, name: "REST", durationSeconds: 10 };
}

function quadrupedSide(side: Side): FitnessClassDefinition["phases"][number]["items"] {
  const label = side === "left" ? "L" : "R";
  const opposite = side === "left" ? "right" : "left";
  return [
    {
      type: "exercise",
      id: `quadruped-leg-lift-${side}`,
      name: `Quadruped Glute Lift (${label})`,
      durationSeconds: 40,
      shortDescription: `Extend ${side} leg straight`,
      longDescription: `Lift ${side} leg up using ${side} glutes, engage the core`,
      illustration: "exercises/quadruped-leg-series.svg"
    },
    quadrupedBreak(`after-leg-lift-${side}`),
    {
      type: "exercise",
      id: `side-crunch-${side}`,
      name: `Side crunch (${label})`,
      durationSeconds: 40,
      shortDescription: `Lift leg up so that it is straight and ${side} glute is engaged`,
      longDescription: `Crunch ${side} leg towards the ${side} elbow and extend back out,`,
      illustration: "exercises/quadruped-leg-series.svg"
    },
    quadrupedBreak(`after-side-crunch-${side}`),
    {
      type: "exercise",
      id: `cross-body-crunch-${side}`,
      name: `Cross body crunch (${label})`,
      durationSeconds: 40,
      shortDescription: `Lift leg up so that it is straight and ${side} glute is engaged`,
      longDescription: `Bend ${side} and crunch it over across the ${opposite} leg, lowering the elbows back. Extend outwards and repeat`
    },
    quadrupedBreak(`after-cross-body-crunch-${side}`),
    {
      type: "exercise",
      id: `combined-crunch-${side}`,
      name: `Combine Side crunch (${label}) + Cross body crunch (${label})`,
      durationSeconds: 40,
      longDescription: `Alternate between Side crunch (${label}) and + Cross body crunch (${label})`
    },
    quadrupedBreak(`after-combined-crunch-${side}`),
    {
      type: "exercise",
      id: `side-crunch-extension-${side}`,
      name: `Side crunch with leg extension (${label})`,
      durationSeconds: 40,
      longDescription: `Crunch ${side} leg towards the ${side} elbow, extend leg straight to the side, then extend back out and repeat`
    },
    quadrupedBreak(`after-side-crunch-extension-${side}`),
    {
      type: "exercise",
      id: `half-rainbow-${side}`,
      name: `Half rainbow (${label})`,
      durationSeconds: 40,
      shortDescription: `Extend ${side} leg and point`,
      longDescription: `In a circular motion lower the ${side} leg towards the ${side} side of the ground, lift back up and repeat`,
      illustration: "exercises/quadruped-leg-series.svg"
    }
  ];
}

function coreBreak(id: string): FitnessClassDefinition["phases"][number]["items"][number] {
  return { type: "rest", id, name: "REST", durationSeconds: 10 };
}

function coreRound(
  round: "one" | "two",
  includeReset: boolean
): FitnessClassDefinition["phases"][number]["items"] {
  const items: FitnessClassDefinition["phases"][number]["items"] = [
    {
      type: "exercise",
      id: `alternating-toe-taps-${round}`,
      name: "Toe taps alternating legs",
      durationSeconds: 40,
      shortDescription: "Bring legs up to a tabletop position",
      longDescription:
        "Tap one leg down pointing the toes, lift back up and alternate legs. The head neck and shoulders can stay on the ground or be lifted for an increased challenge"
    },
    {
      type: "exercise",
      id: `double-toe-taps-${round}`,
      name: "Toe taps both legs",
      durationSeconds: 40,
      shortDescription: "Stay lying on back in tabletop position with lifted legs",
      longDescription: "Tap both legs down, head can be on mat or lifted"
    },
    {
      type: "exercise",
      id: `toe-tap-reverse-crunch-${round}`,
      name: "Toe tap to reverse crunch",
      durationSeconds: 40,
      shortDescription:
        "Stay lying on back in tabletop position with lifted legs. Arms beside body",
      longDescription: "Tap both legs down",
      illustration: "exercises/toe-tap-reverse-crunch.svg"
    },
    coreBreak(`after-reverse-crunch-${round}`),
    {
      type: "exercise",
      id: `supine-bird-dogs-${round}`,
      name: "Alternating bird dogs",
      durationSeconds: 40,
      shortDescription:
        "Stay lying on back in tabletop position with lifted legs. Arms go straight up perpendicular to the body",
      longDescription: "Lower opposite leg and hand and lower; repeat"
    },
    coreBreak(`after-bird-dogs-${round}`),
    {
      type: "exercise",
      id: `single-leg-stretch-${round}`,
      name: "Single leg stretch",
      durationSeconds: 40,
      shortDescription: "Curl up so that the head, neck, and shoulders lift off the mat.",
      longDescription:
        "Pull one leg towards chin using the biceps, inhale to lower, exhale to repeat with other leg"
    },
    coreBreak(`after-single-leg-stretch-${round}`),
    {
      type: "exercise",
      id: `scissors-${round}`,
      name: "Scissors",
      durationSeconds: 40,
      shortDescription: "Hands go by the sides of the ears",
      longDescription:
        "One elbow reaches towards opposite knee as it bends towards the chest, alternating sides with lifted upper body at all times"
    }
  ];

  if (includeReset) {
    items.push({
      type: "rest",
      id: "round-one-reset",
      name: "REST",
      durationSeconds: 30,
      shortDescription: "Hug knees in, get ready to repeat"
    });
  }

  return items;
}

function sideBodySide(side: Side): FitnessClassDefinition["phases"][number]["items"] {
  const label = side === "left" ? "L" : "R";
  const lyingSide = side === "left" ? "right" : "left";
  return [
    {
      type: "exercise",
      id: `leg-lifts-${side}`,
      name: `Leg lifts (${label})`,
      durationSeconds: 30,
      shortDescription: `Lie on the ${lyingSide} side of the body, facing ____ ${side} leg stacked on top of ${lyingSide}`,
      longDescription: `Lift ${side} leg up slowly and controlled`,
      illustration: "exercises/side-lying-leg-series.svg"
    },
    {
      type: "exercise",
      id: `leg-pulses-${side}`,
      name: "Pulse leg at the top",
      durationSeconds: 30,
      shortDescription: `Lift ${side} leg up slow and controlled`
    },
    {
      type: "rest",
      id: `after-leg-pulses-${side}`,
      name: "REST",
      durationSeconds: 10
    },
    {
      type: "exercise",
      id: `large-circles-${side}`,
      name: "Large leg circles",
      durationSeconds: 30
    },
    {
      type: "exercise",
      id: `small-circles-${side}`,
      name: "Small leg circles",
      durationSeconds: 30
    },
    {
      type: "exercise",
      id: `static-hold-${side}`,
      name: "Static hold",
      durationSeconds: 30
    },
    {
      type: "rest",
      id: `after-static-hold-${side}`,
      name: "REST",
      durationSeconds: 10
    },
    {
      type: "exercise",
      id: `clamshell-${side}`,
      name: "Clam shell openers",
      durationSeconds: 30
    },
    {
      type: "exercise",
      id: `clamshell-kick-${side}`,
      name: "Clam shell openers with kick",
      durationSeconds: 30
    }
  ];
}

const adapted0731 = normalizeDatedCatalog(adaptLegacyClassToCatalog(matPilates0731Legacy, {
  tags: builtInTags,
  courseTags: ["mat-pilates", "mat", "full-body"],
  exerciseTags: ["mat-pilates", "mat"]
}));

export const matPilates0731Catalog = {
  catalog: adapted0731.catalog,
  course: {
    ...adapted0731.course,
    id: "mat-pilates-07-31",
    version: 3,
    title: "Mat Pilates — July 31"
  }
};

export const matPilates0731 = resolveCourseDefinition(
  matPilates0731Catalog.catalog,
  matPilates0731Catalog.course
);
