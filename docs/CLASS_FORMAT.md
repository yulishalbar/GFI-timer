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

### Mat Pilates with weight

`mat-pilates-weights` version 7 adapts **Mat Pilates — July 31** into a
**58-minute 40-second**, 99-step class. Circuit 1 runs Squat -> add arms,
Squat hold, Squat hold leg lift, Side to back kick, and Single leg RDL on the
right, then an explicit 30-second rest, then the same sequence on the left.
Exercise durations remain unchanged; the former balance and kick-reset rests
are removed. Single leg RDL replaces the deadlift-to-knee-tuck movement with
hinge-and-return instructions and a matching guide. Optional light weights
also apply to the final core roll-up and the kneeling arm series.
Circuit 2 starts on the left: Donkey kick (weight behind knee), Side crunch,
Cross body crunch, Combine, a 15-second rest to remove the weight, Extended leg
lift, Extended hamstring curl, and Extended leg pulse. Extended leg pulses last 20 seconds on each side; the
other exercises last 40 seconds. A 30-second rest precedes the same sequence on the right; the
existing 60-second setup rest remains. The first four movements retain the
weight behind the bent knee; all extended-leg work is unweighted.
Warm-up, side-lying leg work, push-ups, planks, and cooldown stay unweighted. Equipment cues cover pickup and removal.
Circuit 3 replaces the old rounds with one pass: Crunch (40s), Crunch pulses
(20s), rest (10s), Single leg toe reach R (40s), rest (10s), Single leg toe reach
L (40s), rest (10s), Sit up twist L (40s), Sit up twist R (40s), Russian twists
(40s), rest (10s), Boat hold (20s), and Roll ups holding a weight (60s).
The opening core-circuit rest lasts two minutes and prepares supine crunches
and the weight. The rest between warm-up and standing lower body also lasts
two minutes. Side-body breaks previously lasting ten seconds now last fifteen
seconds on both sides; its setup and side-switch rests retain their durations.
Circuit 5's 60-second setup rest cues kneeling on both knees with light weights.
Biceps curls, Serve the platter (out and to the side), Around the world (kneeling
arm sweep overhead), Reverse fly, Triceps extensions, and Flutter arms behind
back each last 40 seconds. Pilates push-ups follow for 30 seconds, then an
explicit 30-second rest precedes the existing high-plank shoulder taps,
alternating side planks, and plank hold (30 seconds each). The final 20-second
rest prepares cooldown; weights are set down before push-ups and planks.
Cooldown stretches are individual entries: Overhead arm stretch, Overhead arm
stretch L, Side twist L, Overhead arm stretch, Overhead arm stretch R, Side twist
R, Cross-body cat+cows, Seated Straddle, Butterfly, Knee hug, Knee to chest
stretch L, Knee across the body L, Knee to chest stretch R, Knee across the body
R, and Shavasana. All last 30 seconds except Seated Straddle at 60 seconds.
Cross-body cat+cows retains the instructor's name without inferred technique
or an unrelated guide. The cooldown still totals eight minutes.
The original July 31 class remains available with its own stable ID.

`schemaVersion` describes the file format. `version` describes a particular
class schedule. They serve different purposes.

Increment the class version when steps, order, rounds, or durations change. Text
or illustration corrections that cannot affect session recovery may retain the
version. A recovered session must match both class ID and class version.

## Updated sliders source

`hiit-pilates-sliders` version 10 follows `classes/updated sliders class #1.pdf`
with instructor revisions. Its 109 timed steps total **58 minutes 40 seconds**, including
an initial two-minute introduction. Seated cat cow to half roll down lasts
30 seconds; Hundred and its preceding 10-second rest are removed.
Circuits are numbered in playback order: 1 Abs, 2 Upper Body and Core Pyramid,
3 Upper Body and Core, 4 Legs Focused, and 5 Side Body. The former Circuit 5
is removed. Circuit 2 takes 4:30: seven 30-second movements
with 10-second rests between them, without Pilates push-ups. Circuit 3 has
10-second rests between exercises.

Each lower-body side flows directly from Single-leg lunge with slider to
Single-leg lunge with slider with pulse to High runner's lunge leg in-and-out
(30 seconds each), then rests 10 seconds before the remaining movements.
Each side-body series adds 40-second Straight leg lift and Rainbow after Cross
overs, followed by the existing 20-second transition to Bent-knee leg lift.
There are 10-second rests after Fire hydrant pulses, Pulse bent knee, and
Kick knee to chest and extned on both sides. New movement durations match
the surrounding exercises; the left side mirrors the right-side additions.

The revised warm-up and Roll-ups rows contain descriptions that conflict with
the movement names. Supplied wording is retained, including source spelling;
these rows need instructor review. Blank instruction cells remain blank.

Instructor revisions add 30-second Shoulder rolls after head circles. Circuit 5 non-pulse glute movements last 40 seconds on both
sides; pulse movements and rests retain their original durations.

Circuit 5 includes 20-second Donkey kick pulses immediately after Donkey kicks
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

Circuit 2 has no optional label. Straight leg sweep, Straight leg sweep circles,
and Thread the leg and open to the side use right-side placements on the first
pass and left-side placements on the return pass. Mountain climbers remain
unsided. Timing and order are unchanged.

## Block + Weights plank copy

`mat-pilates-weights-block-plank` version 5 is listed as **Block + Weights Mat
Pilates #2** and totals **56 minutes 10 seconds**. The warm-up ends with a
two-minute rest. Circuit #1 splits each side's second exercise into Side plank
bends (holding block) and Side plank twist (holding block), 20 seconds each.
Ten-second rests follow the first exercise, the split pair, and the high-plank
knee drive on each side. The second knee drive remains left-sided for 10 seconds;
side-lying moves remain 60 seconds each lying right and 40 seconds lying left.
The existing 15-, 20-, and 15-second rests and instructor notes are retained.

Circuit #2 flows directly from Lunge into Lunge to single leg RDL, then into lunge pulses on
both sides, and retains 30-second Regular squat pulses after Regular squats.
Circuit #3 names the pike Single leg pike knee drive. The 90/90 Lunge Narrow
Press, Narrow Press + Knee to Block Tap, 2-Count Hinge + Knee to Block Taps
(weights behind head), and B-Stance Squats last 30 seconds each on both sides.
B-Stance Squats flow directly into their pulses. Circuit #4 retains its existing
rests. Circuit #5 replaces the Tabletop toe taps name with Leg lowers (block
between ankles), retaining 40 seconds. Crunch pulses follow Crunches
(holding block) immediately for 30 seconds, before the existing end rest.
The original class remains unchanged,
and Class #2 retains its text-only presentation.

## Updated band schedule

`mat-pilates-band` version 6 has 97 timed steps totaling **59 minutes 40 seconds**.
The core sequence uses 40-second Leg extensions then Leg lowers, both with the
band around shins. Each glute side rests 20 seconds after Donkey kick + downward
dog crunch in. The 10-second rest after each Static single-leg squat is removed.
Leg pulses immediately after Leg extensions last 20 seconds on both glute sides.
Pulse leg openers and Curtsy pulse last 20 seconds each on both sides.
Both upper-body rounds omit Standing punch-outs, use 20-second Band pulse out,
rest 10 seconds after Serve the platter, and add a 40-second Band upwards lift
(behind back) after Band outward extension (behind back). The break between
upper-body rounds is 30 seconds. Crescent low lunge lasts 60 seconds per side.
The cooldown starts after its existing transition with Standing side-body stretch
(band around wrists) for 60 seconds, then Palm in with band for 30 seconds,
before continuing with Hug knees in towards chest and the remaining sequence.
