import type { FitnessClassDefinition } from "../domain/class-definition";

export const coreBasics = {
  schemaVersion: 1,
  id: "core-basics",
  version: 1,
  title: "Core Basics",
  description: "An intro, mobility warmup, and focused core sequence.",
  phases: [
    {
      id: "intro",
      name: "Intro",
      items: [
        {
          type: "exercise",
          id: "introduction",
          name: "Introduction",
          durationSeconds: 180,
          shortDescription: "Welcome the class and explain today's focus."
        }
      ]
    },
    {
      id: "warmup",
      name: "Warmup",
      items: [
        {
          type: "repeat",
          id: "leg-stretches",
          rounds: 3,
          items: [
            {
              type: "exercise",
              id: "stretch-left",
              name: "Stretch left leg",
              durationSeconds: 30,
              shortDescription: "Keep the front knee aligned.",
              longDescription:
                "Lengthen through the back leg and keep both hips facing forward."
            },
            {
              type: "exercise",
              id: "stretch-right",
              name: "Stretch right leg",
              durationSeconds: 30,
              shortDescription: "Keep the front knee aligned."
            }
          ]
        }
      ]
    },
    {
      id: "core",
      name: "Core",
      items: [
        {
          type: "exercise",
          id: "crunches",
          name: "Crunches",
          durationSeconds: 60,
          shortDescription: "Lift from the ribs and keep the neck relaxed."
        },
        {
          type: "rest",
          id: "break-after-crunches",
          name: "Break",
          durationSeconds: 10
        },
        {
          type: "exercise",
          id: "crunch-left",
          name: "Crunch left",
          durationSeconds: 30
        },
        {
          type: "exercise",
          id: "crunch-right",
          name: "Crunch right",
          durationSeconds: 30
        },
        {
          type: "rest",
          id: "core-finish-break",
          name: "Break",
          durationSeconds: 10
        }
      ]
    }
  ]
} satisfies FitnessClassDefinition;
