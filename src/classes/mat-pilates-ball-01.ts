import type { FitnessClassDefinition } from "../domain/class-definition";
import { builtInTags } from "../catalog/tags";
import { normalizeBandCatalog } from "../catalog/normalize-band";
import { adaptLegacyClassToCatalog } from "../domain/legacy-catalog-adapter";
import { resolveCourseDefinition } from "../domain/resolve-course";

// Source: classes/Pilates ball class #1.pdf. See CLASS_FORMAT.md for source ambiguities.
export const matPilatesBall01Source = {
  "schemaVersion": 1,
  "id": "mat-pilates-ball-01-source",
  "version": 4,
  "title": "Pilates Ball Mat Pilates #1",
  "description": "Mat and Pilates ball. Timed rows from Pilates ball class #1.pdf.",
  "visualsDisabled": true,
  "phases": [
    {
      "id": "intro",
      "name": "Introduction",
      "items": [
        {
          "type": "exercise",
          "id": "introduction",
          "name": "Class introduction",
          "durationSeconds": 120,
          "shortDescription": "Welcome the class, introduce the Pilates ball, and explain that equipment is optional."
        }
      ]
    },
    {
      "id": "warmup",
      "name": "WARM-UP",
      "items": [
        {
          "type": "exercise",
          "id": "childs-pose",
          "name": "Child's pose with left and right side stretches",
          "durationSeconds": 60
        },
        {
          "type": "exercise",
          "id": "cat-cows",
          "name": "Cat and cow",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "thread-l",
          "name": "Thread the needle (L)",
          "durationSeconds": 60,
          "shortDescription": "(3 times)"
        },
        {
          "type": "exercise",
          "id": "thread-r",
          "name": "Thread the needle (R)",
          "durationSeconds": 60,
          "shortDescription": "(3 times)"
        },
        {
          "type": "exercise",
          "id": "hover-dog",
          "name": "Tabletop hover to downward-facing dog",
          "durationSeconds": 60
        },
        {
          "type": "exercise",
          "id": "flip-palms",
          "name": "Tabletop palm flips",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "twist-palms",
          "name": "Tabletop palm twists",
          "durationSeconds": 30,
          "shortDescription": "At the end, introduce the equipment and explain that it is optional."
        },
        {
          "type": "rest",
          "id": "warmup-end",
          "name": "REST",
          "durationSeconds": 60,
          "shortDescription": "Prepare for Circuit #1: core. Have your Pilates ball ready and come to the mat for the 2-count crunch."
        }
      ]
    },
    {
      "id": "core",
      "name": "Circuit #1: core",
      "items": [
        {
          "type": "rest",
          "id": "core-setup",
          "name": "REST",
          "durationSeconds": 60
        },
        {
          "type": "exercise",
          "id": "crunch",
          "name": "2-count crunch (ball between thighs)",
          "durationSeconds": 40,
          "shortDescription": "Sit on the mat with your knees bent and the soles of your feet on the mat."
        },
        {
          "type": "rest",
          "id": "core-rest-1",
          "name": "REST",
          "durationSeconds": 10
        },
        {
          "type": "exercise",
          "id": "suitcase",
          "name": "Suitcase crunch (ball between thighs)",
          "durationSeconds": 40,
          "longDescription": "Lift your legs off the mat as you crunch."
        },
        {
          "type": "rest",
          "id": "core-rest-2",
          "name": "REST",
          "durationSeconds": 10
        },
        {
          "type": "exercise",
          "id": "criss-cross",
          "name": "Criss-cross (rolling the ball)",
          "durationSeconds": 40
        },
        {
          "type": "rest",
          "id": "core-rest-3",
          "name": "REST",
          "durationSeconds": 10
        },
        {
          "type": "exercise",
          "id": "leg-lowers",
          "name": "Leg lowers (ball at knee height)",
          "durationSeconds": 40
        },
        {
          "type": "rest",
          "id": "core-rest-4",
          "name": "REST",
          "durationSeconds": 10
        },
        {
          "type": "exercise",
          "id": "toe-taps",
          "name": "Toe taps",
          "durationSeconds": 40
        },
        {
          "type": "rest",
          "id": "core-rest-5",
          "name": "REST",
          "durationSeconds": 10
        },
        {
          "type": "exercise",
          "id": "scissors",
          "name": "Passing the ball in scissors",
          "durationSeconds": 40
        },
        {
          "type": "rest",
          "id": "boat-setup",
          "name": "REST",
          "durationSeconds": 10,
          "shortDescription": "Prepare for Boat hold."
        },
        {
          "type": "exercise",
          "id": "boat-hold",
          "name": "Boat hold",
          "durationSeconds": 30,
          "shortDescription": "Balance behind the sit bones with knees bent and chest lifted.",
          "longDescription": "Hold the torso steady and breathe. Keep feet on the mat for support as needed."
        },
        {
          "type": "rest",
          "id": "core-end",
          "name": "REST",
          "durationSeconds": 60
        }
      ]
    },
    {
      "id": "glutes",
      "name": "Circuit #2: glutes",
      "items": [
        {
          "type": "rest",
          "id": "glutes-setup",
          "name": "REST",
          "durationSeconds": 60
        },
        {
          "type": "exercise",
          "id": "hip-thrust-r",
          "name": "Hip thrusts (ball between thighs)",
          "durationSeconds": 40
        },
        {
          "type": "exercise",
          "id": "heel-thrust-r",
          "name": "Hip thrust (R) (ball under right heel)",
          "durationSeconds": 40
        },
        {
          "type": "exercise",
          "id": "roll-ball-r",
          "name": "Static hip thrust: roll ball in and out (R) (ball under right heel)",
          "durationSeconds": 40
        },
        {
          "type": "exercise",
          "id": "pulse-r",
          "name": "Pulse (R)",
          "durationSeconds": 20
        },
        {
          "type": "rest",
          "id": "glutes-switch",
          "name": "REST",
          "durationSeconds": 30,
          "shortDescription": "Rest (knee hug)"
        },
        {
          "type": "exercise",
          "id": "hip-thrust-l",
          "name": "Hip thrusts (ball between thighs)",
          "durationSeconds": 40
        },
        {
          "type": "exercise",
          "id": "heel-thrust-l",
          "name": "Hip thrust (L) (ball under left heel)",
          "durationSeconds": 40
        },
        {
          "type": "exercise",
          "id": "roll-ball-l",
          "name": "Static hip thrust: roll ball in and out (L) (ball under left heel)",
          "durationSeconds": 40
        },
        {
          "type": "exercise",
          "id": "pulse-l",
          "name": "Pulse (L)",
          "durationSeconds": 20
        }
      ]
    },
    {
      "id": "lower-body",
      "name": "Circuit #3: lower body",
      "items": [
        {
          "type": "rest",
          "id": "lower-setup",
          "name": "REST",
          "durationSeconds": 60
        },
        {
          "type": "exercise",
          "id": "lunge-l",
          "name": "Lunge onto ball",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "lunge-hinge-l",
          "name": "Lunge onto ball + hinge",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "hinge-pulse-l",
          "name": "Static hinge with arm pulses (knee on ball)",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "lunge-pulse-l",
          "name": "Lunge with knee pulses onto the ball",
          "durationSeconds": 30
        },
        {
          "type": "rest",
          "id": "tabletop-setup-l",
          "name": "REST",
          "durationSeconds": 20,
          "shortDescription": "Place your hands on the mat with the ball still under your knee."
        },
        {
          "type": "exercise",
          "id": "tabletop-lift-l",
          "name": "Tabletop leg lift (ball under knee)",
          "durationSeconds": 30,
          "shortDescription": "Keep your knee on the ball and lower your hands into a tabletop position."
        },
        {
          "type": "exercise",
          "id": "tabletop-lunge-l",
          "name": "Tabletop leg lift + lunge (ball under knee)",
          "durationSeconds": 30
        },
        {
          "type": "rest",
          "id": "lower-end-l",
          "name": "REST",
          "durationSeconds": 30,
          "shortDescription": "Repeat on the right side."
        },
        {
          "type": "exercise",
          "id": "lunge-r",
          "name": "Lunge onto ball",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "lunge-hinge-r",
          "name": "Lunge onto ball + hinge",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "hinge-pulse-r",
          "name": "Static hinge with arm pulses (knee on ball)",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "lunge-pulse-r",
          "name": "Lunge with knee pulses onto the ball",
          "durationSeconds": 30
        },
        {
          "type": "rest",
          "id": "tabletop-setup-r",
          "name": "REST",
          "durationSeconds": 20,
          "shortDescription": "Place your hands on the mat with the ball still under your knee."
        },
        {
          "type": "exercise",
          "id": "tabletop-lift-r",
          "name": "Tabletop leg lift (ball under knee)",
          "durationSeconds": 30,
          "shortDescription": "Keep your knee on the ball and lower your hands into a tabletop position."
        },
        {
          "type": "exercise",
          "id": "tabletop-lunge-r",
          "name": "Tabletop leg lift + lunge (ball under knee)",
          "durationSeconds": 30
        }
      ]
    },
    {
      "id": "side-body",
      "name": "Circuit #4: side body",
      "items": [
        {
          "type": "rest",
          "id": "side-body-setup",
          "name": "REST",
          "durationSeconds": 60,
          "shortDescription": "Prepare for Circuit #4: side body. Lie on your left side with the ball between elbow and knee."
        },
        {
          "type": "exercise",
          "id": "clamshells-l",
          "name": "Clamshells (ball between elbow and knee)",
          "durationSeconds": 40,
          "shortDescription": "Keep your hips on the mat and squeeze the ball between your elbow and knee."
        },
        {
          "type": "rest",
          "id": "side-l-rest-1",
          "name": "REST",
          "durationSeconds": 10
        },
        {
          "type": "exercise",
          "id": "extension-l",
          "name": "Leg and arm extension",
          "durationSeconds": 40,
          "shortDescription": "Stay in the same position and extend your leg and arm straight out.",
          "longDescription": "Extend your leg and arm straight out."
        },
        {
          "type": "rest",
          "id": "side-l-rest-2",
          "name": "REST",
          "durationSeconds": 10
        },
        {
          "type": "exercise",
          "id": "v-ups-l",
          "name": "V-ups (ball between feet)",
          "durationSeconds": 40,
          "shortDescription": "Place the ball between your feet, lower onto your hip, and rest on your bottom forearm.",
          "longDescription": "Lift both legs toward your elbow."
        },
        {
          "type": "rest",
          "id": "half-moon-setup-l",
          "name": "REST",
          "durationSeconds": 20
        },
        {
          "type": "exercise",
          "id": "half-moon-l",
          "name": "Half moon twist toward the mat (holding ball)",
          "durationSeconds": 40
        },
        {
          "type": "exercise",
          "id": "half-moon-pulse-l",
          "name": "Half moon top-leg pulses",
          "durationSeconds": 20
        },
        {
          "type": "rest",
          "id": "side-l-rest-6",
          "name": "REST",
          "durationSeconds": 10
        },
        {
          "type": "exercise",
          "id": "side-bend-l",
          "name": "Side bend with oblique rotation",
          "durationSeconds": 40,
          "longDescription": "Side bend with oblique rotation."
        },
        {
          "type": "rest",
          "id": "side-switch",
          "name": "REST",
          "durationSeconds": 30,
          "shortDescription": "Repeat on the opposite side."
        },
        {
          "type": "exercise",
          "id": "clamshells-r",
          "name": "Clamshells (ball between elbow and knee)",
          "durationSeconds": 40,
          "shortDescription": "Keep your hips on the mat and squeeze the ball between your elbow and knee."
        },
        {
          "type": "rest",
          "id": "side-r-rest-1",
          "name": "REST",
          "durationSeconds": 10
        },
        {
          "type": "exercise",
          "id": "extension-r",
          "name": "Leg and arm extension",
          "durationSeconds": 40,
          "shortDescription": "Stay in the same position and extend your leg and arm straight out.",
          "longDescription": "Extend your leg and arm straight out."
        },
        {
          "type": "rest",
          "id": "side-r-rest-2",
          "name": "REST",
          "durationSeconds": 10
        },
        {
          "type": "exercise",
          "id": "v-ups-r",
          "name": "V-ups (ball between feet)",
          "durationSeconds": 40,
          "shortDescription": "Place the ball between your feet, lower onto your hip, and rest on your bottom forearm.",
          "longDescription": "Lift both legs toward your elbow."
        },
        {
          "type": "rest",
          "id": "half-moon-setup-r",
          "name": "REST",
          "durationSeconds": 20
        },
        {
          "type": "exercise",
          "id": "half-moon-r",
          "name": "Half moon twist toward the mat (holding ball)",
          "durationSeconds": 40
        },
        {
          "type": "exercise",
          "id": "half-moon-pulse-r",
          "name": "Half moon top-leg pulses",
          "durationSeconds": 20
        },
        {
          "type": "rest",
          "id": "side-r-rest-6",
          "name": "REST",
          "durationSeconds": 10
        },
        {
          "type": "exercise",
          "id": "side-bend-r",
          "name": "Side bend with oblique rotation",
          "durationSeconds": 40,
          "longDescription": "Side bend with oblique rotation."
        }
      ]
    },
    {
      "id": "upper-body",
      "name": "Circuit #5: upper body",
      "items": [
        {
          "type": "rest",
          "id": "upper-body-setup",
          "name": "REST",
          "durationSeconds": 60,
          "shortDescription": "Prepare for Circuit #5: upper body. Come to tabletop with the ball between thighs for bear hold rotations."
        },
        {
          "type": "exercise",
          "id": "bear-rotations",
          "name": "Bear hold rotations (ball between thighs)",
          "durationSeconds": 30
        },
        {
          "type": "rest",
          "id": "upper-rest-1",
          "name": "REST",
          "durationSeconds": 10
        },
        {
          "type": "exercise",
          "id": "bear-pike",
          "name": "Bear hold to pike (ball between thighs)",
          "durationSeconds": 30
        },
        {
          "type": "rest",
          "id": "upper-rest-2",
          "name": "REST",
          "durationSeconds": 10
        },
        {
          "type": "exercise",
          "id": "bear-arm-lifts",
          "name": "Bear hold rotations with arm lifts (ball between thighs)",
          "durationSeconds": 30
        },
        {
          "type": "rest",
          "id": "upper-rest-3",
          "name": "REST",
          "durationSeconds": 10
        },
        {
          "type": "exercise",
          "id": "push-ups",
          "name": "Push-ups (chest to ball)",
          "durationSeconds": 30
        },
        {
          "type": "rest",
          "id": "upper-rest-4",
          "name": "REST",
          "durationSeconds": 10
        },
        {
          "type": "exercise",
          "id": "swan",
          "name": "Swan-dive variation (ball rolls in and out)",
          "durationSeconds": 30,
          "shortDescription": "Hold the ball in both hands with your arms extended straight in front of you.",
          "longDescription": "Roll the ball back and forth while lifting your chest and head."
        },
        {
          "type": "rest",
          "id": "upper-rest-5",
          "name": "REST",
          "durationSeconds": 10
        },
        {
          "type": "exercise",
          "id": "press",
          "name": "Press hands on ball",
          "durationSeconds": 30
        },
        {
          "type": "rest",
          "id": "upper-rest-6",
          "name": "REST",
          "durationSeconds": 10
        },
        {
          "type": "exercise",
          "id": "around-world",
          "name": "Around the world",
          "durationSeconds": 30,
          "shortDescription": "Hold the ball in both hands with your arms extended straight in front of you.",
          "longDescription": "Lift your head, chest, neck, and shoulders. Take the ball in your right hand and pass it to your left hand behind your back."
        }
      ]
    },
    {
      "id": "cooldown",
      "name": "Cooldown",
      "items": [
        {
          "type": "exercise",
          "id": "childs-pose",
          "name": "Child's pose",
          "durationSeconds": 60,
          "shortDescription": "Push hips back and stretch fingers towards the top of the mat.",
          "longDescription": "Warm up the spine, stretch the hamstrings, thighs and abdominals."
        },
        {
          "type": "exercise",
          "id": "down-dog",
          "name": "Downward-facing dog + paddle out legs",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "dog-circles-r",
          "name": "Single-leg downward-facing dog knee circles (R)",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "lizard-r",
          "name": "Lizard pose (R)",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "pigeon-r",
          "name": "Pigeon pose (R)",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "dog-circles-l",
          "name": "Single-leg downward-facing dog knee circles (L)",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "lizard-l",
          "name": "Lizard pose (L)",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "pigeon-l",
          "name": "Pigeon pose (L)",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "cobra",
          "name": "Cobra",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "roll-back",
          "name": "Roll onto back",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "knee-hug",
          "name": "Knee hug",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "happy-baby",
          "name": "Happy baby",
          "durationSeconds": 30
        },
        {
          "type": "exercise",
          "id": "shavasana",
          "name": "Shavasana",
          "durationSeconds": 180,
          "shortDescription": "Lie comfortably on your back with your arms relaxed at your sides.",
          "longDescription": "Inhale slowly through the nose and exhale slowly through the mouth. Allow the body to fully relax and your breathing to settle naturally. At the end, come to a seated position. Closing words: Thank you for coming today and working out early in the morning. Amazing job! Don't forget to wipe down your mat and the Pilates ball. Have a great spring break!"
        }
      ]
    }
  ]
} satisfies FitnessClassDefinition;

const adapted = normalizeBandCatalog(adaptLegacyClassToCatalog(matPilatesBall01Source, {
  tags: builtInTags,
  courseTags: ["mat-pilates", "mat", "ball", "full-body"],
  exerciseTags: ["mat-pilates", "mat", "ball"]
}));
export const matPilatesBall01Catalog = {
  catalog: adapted.catalog,
  course: { ...adapted.course, id: "mat-pilates-ball-01" }
};
export const matPilatesBall01 = {
  ...resolveCourseDefinition(matPilatesBall01Catalog.catalog, matPilatesBall01Catalog.course),
  visualsDisabled: true
} satisfies FitnessClassDefinition;
