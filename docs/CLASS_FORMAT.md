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
  /** Suppress exercise rigs and images for a deliberately text-only class. */
  visualsDisabled?: boolean;
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
  /** Pose rig id; see docs/ARTWORK.md. Takes precedence over the fields below. */
  rig?: string;
  illustration?: string;
  motionIllustrations?: [string, string, ...string[]];
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

### Version 2 catalog boundary

New catalog-backed courses use the contracts in
`src/domain/catalog-definition.ts`. An exercise stores canonical instructions,
media, side support, and tag IDs once. A course placement pins the exercise ID
and version and supplies its duration and optional left/right side. Named
circuits are embedded groups inside a course; rests remain explicit timed
items.

`resolveCourseDefinition(catalog, course)` strictly validates both inputs and
returns a schema-version-1 immutable snapshot accepted by the existing
compiler. It rejects unknown properties, tags, or exercises; stale exercise
versions; missing sides for left/right exercises; and sides supplied to neutral
exercises. See [`V2_CATALOG.md`](V2_CATALOG.md) for the complete model and
migration sequence.

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

## Updated sliders source

`hiit-pilates-sliders` version 8 follows `classes/updated sliders class #1.pdf`.
With instructor revisions, the 105 timed steps total **59 minutes 30 seconds**,
including the optional 6:30 plank pyramid and push-ups. Approximate section headings and the 60-minute
cover title do not add time. Abs runs once; legs run once per side; Circuit 5
runs once followed by a one-minute rest. The side-body series includes a
20-second transition on each side and a 30-second break between sides.
The optional pyramid remains in the static schedule and is labeled ?If there
is time?; no automatic skipping is implied. Its seven inter-exercise rests are
10 seconds each.

The revised warm-up and Roll-ups rows contain descriptions that conflict with
the movement names. Supplied wording is retained, including source spelling;
these rows need instructor review. Blank instruction cells remain blank.

Instructor revisions add 30-second Shoulder rolls after head circles and
40-second Pilates push-ups after the Circuit 4 pyramid, preceded by its usual
10-second rest. Circuit 6 non-pulse glute movements last 40 seconds on both
sides; pulse movements and rests retain their original durations.

Circuit 6 includes 20-second Donkey kick pulses immediately after Donkey kicks
on each side, with no intervening rest.

A 30-second Breathing with overhead arm sweeps step follows Breathing work.
A 40-second Crunches with bent knees step follows Dead Bug in the abs circuit,
retaining the circuit's 10-second rests between exercises.

One-minute rests follow seated cat cow to half roll down and each side of
Isometric hold squat with side lunge. The first side's rest replaces the
previous 10-second side-switch rest.

The revised cooldown lasts 12:30: overhead breathing arm sweeps (60 seconds),
left side twist (45 seconds), left seated side stretch (30 seconds), and Seated
Cow Pose Variation Arms Crossed On Knees on the left (30 seconds), then the
same three movements on the right. Continue with Seated forward fold (60 seconds),
lower down (10 seconds), reclined tree right then left (60 seconds each),
reclined butterfly (50 seconds), Happy Baby (60 seconds), and Shavasana (180 seconds).
Side placements are explicit.
