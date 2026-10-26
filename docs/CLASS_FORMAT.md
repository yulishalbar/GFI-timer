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

### Mat Pilates with Weights #2

`mat-pilates-weights-02` version 2 replaces the initial reordered copy with
five newly assembled circuits drawn from July 24, July 31, and Block + Weights.
Core uses lifted-leg crunches, toe taps, single-leg stretch, criss-cross, leg
circles, and weighted roll-ups. Standing Legs combines reverse lunges and
pulses with B-stance squats, pulses, and a squat hold with curls, then regular
squats. Arms has two rounds of front raises, side raises, standing reverse fly,
kneeling curls, and triceps extensions. Glutes combines optional weighted
two-foot bridges with unweighted knee drives and bird-dog crunches. Side Body
combines kicks, circles, straight-leg crunches, triceps push-ups, side planks,
and inner-thigh lifts and pulses. Both sides receive equal time.

A five-minute warm-up and the established eight-minute cooldown bookend the
circuits. Explicit rests cue setup, side changes, and putting down weights.
Equipment is a mat and optional light hand weights; no other equipment is
needed. Shared exercise records are reused with course-specific instructions.
Like the Block + Weights source, this course uses text guidance because several
of its arm guides are approximate. The class totals **57 minutes 10 seconds**
across **100 timed steps**. Version 1 totaled 59:40; the version increment
prevents restoring its different schedule into this revision.

Version 3 replaces both bookends while retaining the five circuits. Warm-up is
five minutes: March in place (60s), Side steps with arm sweeps (45s), Standing
open the gate (45s), Standing heel raises (45s), Bodyweight hip hinge (45s), and
Lateral weight shifts (60s). All are unweighted and progress through easy,
controlled standing movement before the existing one-minute core setup.

Cooldown is eight minutes: Open book and side-lying quadriceps stretch on the
right (30s each), a 15s side switch, then both on the left (30s each). A 15s
setup leads to Crescent low lunge (30s each side) and seated cross-body shoulder
stretch (30s each side). After 15s to lie down, supine hamstring stretches last
30s per side, followed by 135s of bent-knee constructive rest breathing.
The class remains **57:10**, now with **99 timed steps**. Eleven new movements
are shared catalog entries with local instructions and pending artwork.

Technique references for version 3 (accessed October 24, 2026):

- [Hartford HealthCare dynamic warm-up](https://rehab.hartfordhospital.org/services/sports-medicine/conditions-treatments/dynamic-stretch-warmup): open-the-gate mechanics, adapted to alternate in place.
- [ACE hip hinge](https://www.acefitness.org/resources/everyone/exercise-library/33/hip-hinge/): hips-back pattern, adapted to hands on hips without a teaching bar.
- [AAOS warm-up and stretching](https://www.orthoinfo.org/staying-healthy/warm-up-cool-down-and-be-flexible/): gradual warm-up, gentle holds, and cross-body shoulder stretch.
- [NHS open-book exercise resource](https://www.cddft.nhs.uk/services/physiotherapy/services/backs-future): thoracic rotation movement reference.
- [AzOPT side-lying quadriceps stretch](https://azopt.net/lying-quadriceps/): supported side-lying position and gentle stretch.
- [Grady Health supine hamstring stretch](https://healthlibrary.gradyhealth.org/orthopedics/management/supine-hamstring-stretch): bent-knee supine setup, adapted to hands behind the thigh without a towel.

Sequence, durations, standing variations, and closing breathing are authored for
this class, rather than a prescribed routine from any one source. No external
media or network connection is needed during playback.

Version 4 adds weighted work across all five main circuits. Crunches and their
pulses hold one light weight close to the chest. Alternating toe taps remain
unweighted; a new ten-second pickup rest precedes a 40-second Dumbbell floor
press, replacing double toe taps. The following rest cues putting down the pair.
All bridge movements, including knee drives, knee-drive pulses, and the final
two-foot bridges, now cue a light weight secured across the hips with both
hands. Two-foot or unweighted options are explicit. The reset before knee
drives checks load placement; the tabletop transition removes the weight.

Each side-body pass begins standing with a 40-second Suitcase march and a
20-second Suitcase hold, replacing kicks and circles. The side identifies the
hand holding the weight. The ten-second floor transition moves before the
straight-leg crunch, cues putting the weight down, and leads into the remaining
unweighted floor sequence. The side switch returns to standing. Warm-up and
cooldown retain their version 3 sequences. The revised total is **57:20** across
**100 timed steps**. New strength movements have local instructions and pending
artwork, and are included in the shared exercise library.

The floor press follows [Mayo Clinic's dumbbell chest-press guidance](https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/chest-press/vid-20084677),
which includes the floor variation. Suitcase work uses the upright, one-sided
load position from [ACE's suitcase carry](https://www.acefitness.org/resources/everyone/exercise-library/358/suitcase-carry/),
adapted here to an in-place march and static hold. These class-specific timings
and combinations are authored choices, not a source-prescribed workout.

Version 5 makes every main-circuit exercise weighted mat-Pilates-style work.
Abs is now weighted lifted-leg curls (40s), curl pulses (20s), alternating toe
taps holding the weight close to the chest (40s), Hundred prep with very light
hand weights (40s), Half roll back (40s), C-curve hold (40s), Oblique roll back
left then right (40s each), and Roll ups (60s). Explicit ten-second resets
separate the changes of position and grip. Floor presses are removed.

The arm sequence is entirely kneeling. Glutes ends with weighted bridge heel
raises and a weighted bridge hold instead of bird dogs. Side Body stays on the
mat: leg lifts (40s), pulses (20s), forward/back kicks (40s), rest (10s),
clamshell openers (30s), bent-leg clamshell lifts (30s), rest (10s), inner-thigh
lifts (30s), and inner-thigh pulses (20s), then the other side. A light weight
is held by the top hand against the moving thigh above the knee throughout
each exercise; it is never balanced loose on a joint or ankle. Setup and
side-switch rests cue putting it down before repositioning. Suitcase work is
removed. Warm-up and cooldown retain their existing sequences. Total remains
**57:20 across 100 timed steps**, with equal time on both sides.

The rejected floor-press and suitcase catalog entries are replaced by six
weighted Pilates variations. Every main-circuit exercise has a visible weight
cue, checked in tests; every abs exercise is an abdominal curl, stabilization,
or controlled roll-back/roll-up movement. The class is a contemporary Pilates
adaptation with light load and an unweighted regression. Movement categories were checked against
[Pilates Encyclopedia's mat exercises with hand weights](https://www.pilatesencyclopedia.com/blog/pilates-mat-exercises-with-hand-weights)
and [Merrithew's Matwork exercise guide](https://www.costco.ca/wcsstore/CostcoCABCCatalogAssetStore/Attachment/MERRITHEWMatworkExerGuideENG.pdf).
Specific loading placements, sequence, and durations are authored for this class.

Version 6 improves position flow: standing warm-up, Circuit #1 Standing Legs,
Circuit #2 Kneeling Arms, Circuit #3 Abs, Circuit #4 Weighted Bridges, Circuit
#5 Side Body and Inner Thighs, then cooldown. Once participants come down to
the mat after standing legs, no circuit asks them to stand again. Setup cues
explain putting down the weights before changing position and where to hold
them next. Every glute exercise explicitly specifies a weight held across the
hips with both hands; removing it is a regression. Side Body stays side-lying
for both passes and ends on the same side as the first cooldown movement.
The nine glute exercises and fourteen side-body exercises are checked in both
unit and browser tests. Duration remains **57:20**, with **100 timed steps**.
See [the current instructor sequence](WEIGHTS_02.md) for the complete schedule
and visible equipment cues.

### Pilates Ball Mat Pilates #1

`mat-pilates-ball-01` version 1 follows `classes/Pilates ball class #1.pdf`:
97 timed steps totaling **52 minutes 10 seconds**, with warm-up, side body,
lower body, glutes, upper body, core, and cooldown in that order. The original
`mat-pilates-ball` remains available unchanged. This course uses text guidance.

The PDF's block-and-weights heading conflicts with its ball exercises; the
course uses mat and Pilates ball. Explicit row durations take precedence over
the approximate 60-minute heading. The side-body sequence runs left then right,
with ten-second rests between exercises and a ten-second side switch; its
explicit twenty-second rest replaces the usual ten-second gap. Lower body
repeats on the right as directed. The second printed right-side glute sequence
is interpreted as the opposite side, following the repeat note. Spelling, grammar, punctuation, and capitalization have been corrected at the
instructor's request, including the closing equipment reference to the Pilates
ball. No extra time is added to reach sixty minutes.

Version 2 adds a two-minute introduction, extends Thread the needle to one
minute per side, and adds a one-minute rest after warm-up to cue Circuit #1.
A one-minute setup rest precedes Circuit #4. The final thirty-second rest in
Circuit #2 is removed; its side-switch rest remains. A thirty-second Boat hold
follows the final core exercise, before the existing cooldown rest. The revised
class totals **57 minutes 10 seconds** across **100 timed steps**.

Version 3 reorders the circuits to Core, Glutes, Lower Body, Side Body, then
Upper Body, numbered 1 through 5. Warm-up and upper-body setup cues follow the
new numbering. Each circuit retains its exercises, durations, and rests,
including Boat hold in Core. Introduction, warm-up, and cooldown remain in
place. The total remains **57 minutes 10 seconds** across **100 timed steps**.

Version 4 adds a ten-second rest between Passing the ball in scissors and Boat
hold. Every lower-body exercise lasts thirty seconds; that circuit's rests
retain their durations. A one-minute setup rest precedes Side Body, with a
thirty-second side switch. Half moon twist flows directly into top-leg pulses
on both sides. Puppy Pose is removed from cooldown. The revised total is
**55 minutes 50 seconds** across **99 timed steps**.

Version 5 adds a thirty-second Half split pose immediately after Lizard pose
and before Pigeon pose on each side of cooldown. The total is now
**56 minutes 50 seconds** across **101 timed steps**.

Version 6 appends forty-second Full-range glute bridges as the final exercise
in Circuit #2: glutes, immediately after the left-side pulses. The total is now
**57 minutes 30 seconds** across **102 timed steps**.

Version 7 replaces Tabletop palm flips and Tabletop palm twists in warm-up
with Bird dogs with wrist rotations, right then left, thirty seconds per side.
The closing equipment cue remains on the left-side entry. The total remains
**57 minutes 30 seconds** across **102 timed steps**.

Version 8 replaces Boat hold after Passing the ball in scissors with Single-leg
deadbug (ball between hand and thigh), left then right for forty seconds each.
The preceding ten-second setup rest remains and cues deadbug; the two sides
flow directly into each other. The class now totals **58 minutes 20 seconds**
across **103 timed steps**.

Version 9 removes all six ten-second rests in Side Body and all six ten-second
rests in Upper Body, preserving the longer setup, half-moon preparation, and
side-switch breaks. Ball lifts replaces Press hands on ball for thirty seconds.
The class now totals **56 minutes 20 seconds** across **91 timed steps**.

Version 10 repeats Bear hold rotations, Bear hold to pike, and Bear hold
rotations with arm lifts (all with the ball between thighs) after Around the
world at the end of Upper Body. Each lasts thirty seconds, with no intervening
rests. The class now totals **57 minutes 50 seconds** across **94 timed steps**.

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

## Ring circuit order

`mat-pilates-ring` version 10 swaps the first and last circuits: Mat Pilates
core is Circuit #1, and ABS + ARMS CIRCUIT + back is Circuit #5. Circuits
2 through 4 retain their order. Circuit exercises, rests, and durations remain
unchanged; the class still totals 60 minutes 20 seconds across 94 timed steps.

Version 11 sets every exercise in the final ABS + ARMS CIRCUIT + back circuit
to 30 seconds. Its existing rest is also 30 seconds, so the circuit totals
7 minutes and the class totals **58 minutes 20 seconds** across 94 timed steps.

Version 12 sets Crunch w ring in between thighs to 40 seconds, followed
immediately by 20-second Crunch pulse with ring, removing the intervening
10-second rest. The class totals **57 minutes 40 seconds** across 93 timed steps.

Version 13 extends Overhead reach with palms inside ring in the warm-up to
90 seconds. The class totals **58 minutes 40 seconds** across 93 timed steps.

Version 14 replaces High runner's lunge on both sides of Circuit #3 with
Single leg RDL pressing ring to mat, retaining 30 seconds per side. Instructions
cue a hip hinge while pressing the ring into the mat; the guide shows the RDL
movement. Total duration remains **58 minutes 40 seconds** across 93 timed steps.

Version 15 adds a 20-second side-switch rest immediately after Tabletop leg
lift pulse up and down (R), before the left-side tabletop sequence. The class
totals **59 minutes** across 94 timed steps.

### Weights #2 bent-knee glute revision

`mat-pilates-weights-02` version 7 replaces Circuit #4's weighted bridges with
an eight-minute bent-knee glute circuit. After a 60-second setup, each side
runs Donkey kick (40s), Donkey kick pulses (20s), reset rest (15s), Fire hydrant
(40s), Fire hydrant pulses (20s), Bent-knee crossover (40s), and Donkey kick hold
(20s). A 30-second rest allows removing the weight and changing sides. All
exercises keep a light weight behind the bent working knee, with an unweighted
option. The side-body setup now removes that weight before lying on the side.
The class remains **57:20** across **102 timed steps**. The original
`mat-pilates-weights` class remains unchanged.

Weights #2 version 8 replaces Triceps extensions in both kneeling arm rounds
with Serve the platter (out and to the side), retaining 40 seconds each. Total
duration and step count remain **57:20** and **102 timed steps**.

Weights #2 version 9 replaces Abs with: Single arm toe reach holding a weight
in the right hand (40s), Leg lowers (20s), toe reach with the left hand (40s),
Leg lowers (20s), Sit up twist right (40s), Leg lowers (20s), Sit up twist left
(40s), Leg lowers (20s), Crunch to sit up (20s), Leg lowers (20s), Russian
twists (40s), and Leg lowers (20s). The 60-second setup remains; exercises
flow directly without intervening rests. Total is **56:10** across **100 timed
steps**. The glute setup now transitions from supine leg lowers.

Weights #2 version 10 extends Crunch to sit up to 40 seconds and replaces
the final 20-second Leg lowers after Russian twists with 30-second Seated ab
rows holding a weight. Abs now lasts 7:10, including setup. The five-minute
warm-up runs March (60s), Overhead side body stretch right then left (30s each),
Back bend with hands behind ears (30s), Standing forward fold (30s), slowly
rise into Standing open the gate (30s), Standing heel raises (30s), Yogi squat
(30s), and Squat Twist & reach (30s). Setup cues now rise from the squat and
transition from seated ab rows into glutes. Total: **56:40**, **103 timed steps**.

Weights #2 version 11 cooldown runs Side-lying open book, Side-lying quadriceps
stretch, Reclining tree pose, and Figure four stretch on the right, a 15-second
side-switch rest, then the same sequence on the left. Windshield wipers and
Reclined butterfly follow, then Shavasana. Stretches last 30 seconds each; the
existing 135-second final rest is retained as Shavasana. Cooldown is 7:30 and
the class totals **56:10** across **101 timed steps**.

Weights #2 version 12 replaces each 20-second donkey-kick hold with Crunch knee
in, keeping the weight behind the bent working knee throughout. Abs ends with
Russian twists, Seated ab rows right (40s), Seated ab rows left (40s), then
Leg lowers (20s). Rows use a light weight in the indicated hand; the shared
row exercise is version 2 with left/right support. Glute setup now transitions
from supine leg lowers. Class total: **57:20**, **103 timed steps**.

Weights #2 version 13 replaces the final 20-second Leg lowers with a 20-second
Seated ab row with both arms, following the right and left 40-second rows.
Each bent-knee glute crunch now lasts 40 seconds. The glute setup returns
from seated rows to hands and knees. Glutes total 8:40, and the full class
totals **58:00** across **103 timed steps**.

Weights #2 version 14 starts Circuit #2 with Slow squats (30s), Regular squats
(30s), then the existing 60-second kneeling-arm setup rest. The former final
Regular squats (40s) and Regular squat pulses (20s) are removed from Circuit #1.
The final three circuits now run #3 Bent-Knee Glutes, #4 Abs, #5 Side Body and
Inner Thighs. Setup cues match the new positions and weight removal. Total
remains **58:00** across **103 timed steps**.

Weights #2 version 15 corrects the squat placement: Circuit #1 Standing Legs
starts Slow squats (30s), Regular squats (30s), then its existing setup rest
(60s). Circuit #2 starts with its kneeling-arm setup rest again. Squats are not
repeated at the end of Standing Legs. Circuit order, total **58:00**, and
**103 timed steps** remain unchanged.

Weights #2 version 16 adds a 60-second rest at the end of warm-up, immediately
before Standing Legs. The rest after the opening squats becomes 20 seconds,
and the two Reverse-lunge pulse to B-Stance Squats setup rests become 20 seconds
each. The side-switch rest remains 30 seconds. Total stays **58:00**, now across
**104 timed steps**.
