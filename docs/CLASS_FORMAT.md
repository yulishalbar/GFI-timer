# Class format

## Goals

Class definitions should be:

- Readable and easy to generate or edit with AI assistance.
- Static, reviewable, and committed with the application.
- Able to express phases, exercises, rests, and repeated groups.
- Strictly validated before use.
- Independent of React and presentation layout.

Use TypeScript definitions initially. They provide editor completion, allow
media imports if needed, and catch basic mistakes during the build. If external
authoring is added later, the same conceptual schema can be represented as JSON.

## Proposed schema

```ts
type ClassEntry = ExerciseEntry | RestEntry | RepeatEntry;

interface FitnessClassDefinition {
  schemaVersion: 1;
  id: string;
  version: number;
  title: string;
  description?: string;
  phases: PhaseDefinition[];
}

interface PhaseDefinition {
  id: string;
  name: string;
  items: ClassEntry[];
}

interface ExerciseEntry {
  type: "exercise";
  id: string;
  name: string;
  durationSeconds: number;
  shortDescription?: string;
  longDescription?: string;
  illustration?: string;
}

interface RestEntry {
  type: "rest";
  id: string;
  name?: string;
  durationSeconds: number;
  shortDescription?: string;
}

interface RepeatEntry {
  type: "repeat";
  id: string;
  rounds: number;
  items: ClassEntry[];
}
```

Repeats may be nested in the schema. The first implementation may cap nesting
depth during validation to avoid content that is difficult to communicate in
the UI.

## Complete schema example

```ts
import type { FitnessClassDefinition } from "../domain/class-definition";

export const exampleClass = {
  schemaVersion: 1,
  id: "example-class",
  version: 1,
  title: "Example Class",
  description: "Intro, mobility warmup, and two core blocks.",
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
                "Lengthen through the back leg and keep both hips facing forward.",
              illustration: "exercises/stretch-left.svg"
            },
            {
              type: "exercise",
              id: "stretch-right",
              name: "Stretch right leg",
              durationSeconds: 30,
              illustration: "exercises/stretch-right.svg"
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
          durationSeconds: 60
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
```

## Validation rules

- `schemaVersion` must be supported.
- Class, phase, repeat, and entry IDs use lowercase kebab case.
- IDs are unique within their natural parent. The compiler produces globally
  unique runtime IDs from the full path and round occurrence.
- Class `version` is a positive integer and increases when the executable
  schedule changes.
- Titles, names, and phases are non-empty after trimming.
- A class has at least one phase; a phase/repeat has at least one item.
- Durations are positive integers in seconds.
- Repeat counts are positive integers with a documented reasonable limit.
- Total expanded step count and duration stay under documented safety limits.
- Referenced local assets exist at build time where practical.
- Unknown properties produce validation errors, preventing silent typos.

Validation errors should identify the class and exact nested path, for example:

```text
example-class.phases[1].items[0].rounds: expected a positive integer
```

## Compilation

Compilation recursively walks the class in authored order and expands repeats
into a flat array. It calculates:

- Phase index and phase count.
- Round index and count for repeated entries.
- Step index and count for the displayed context.
- Unique runtime occurrence ID.
- Scheduled start and end offsets.
- Total class duration.
- Previous and next positions by array index.

For a nested repeat, the UI initially displays the innermost round because it is
the most immediately useful. Preserve the complete repeat path in runtime data
so a richer label can be added later without changing the source schema.

## Authoring workflow

1. Copy the closest existing class definition.
2. Assign a stable unique class ID and start at version 1.
3. Enter phases and timed entries using seconds.
4. Add optional descriptions and local illustration paths.
5. Register the class in `src/classes/index.ts`.
6. Run validation, unit tests, and the production build.
7. Preview the full timeline and verify the calculated duration.
8. Test the class on the target device before teaching it.

When AI generates a class, treat the output as proposed source data. Review the
exercise order, durations, repetitions, total duration, and safety-related
instructions before committing it.

When converting a PDF or table whose section heading conflicts with its timed
rows, preserve the explicit row durations and explicit breaks. Do not add hidden
minutes merely to match an approximate heading. Complete missing descriptions
conservatively, keep transitions as rest entries, and record the compiled total
in a test so later edits cannot change it accidentally.

## Versioning

`schemaVersion` describes the file format. `version` describes a particular
class schedule. They serve different purposes.

Increment the class version when steps, order, rounds, or durations change. Text
or illustration corrections that cannot affect session recovery may retain the
version. A recovered session must match both class ID and class version.
