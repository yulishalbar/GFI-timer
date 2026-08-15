# Version 2: Exercise catalog and course model

## Goal

Prepare the static, offline application for future authoring without adding
accounts, a backend, or synchronization. Version 2 separates reusable exercise
content from course structure, adds first-class side variants and searchable
tags, and keeps the current timer behavior unchanged.

There are two persisted domain entities:

- **Exercise:** reusable movement identity, instructions, media, side support,
  and tags.
- **Course:** an ordered workout made from exercise references, circuits, and
  explicit rests.

A circuit is a structural group inside a course. It is not a third reusable
entity in Version 2. If later use proves that independently reusable circuits
are necessary, that can be added without changing exercise identity.

## Principles

- Live playback remains reliable and fully offline.
- Existing class IDs and executable timelines remain stable during migration.
- Exercise instructions and media have one canonical source.
- Course placements own timing, side selection, order, circuit membership, and
  course-specific instructor cues.
- Supplied wording is preserved. Additional guidance is stored separately when
  provenance matters.
- Search and filters work locally with no network dependency.
- The pure compiler continues to produce the same flat runtime timeline used by
  the timer.

## Exercise entity

An exercise describes the movement independent of a particular course:

```ts
type ExerciseSideSupport = "none" | "left-right";

interface ExerciseDefinition {
  schemaVersion: 1;
  id: string;
  version: number;
  name: string;
  shortDescription?: string;
  longDescription?: string;
  /** Pose rig id; see docs/ARTWORK.md. Takes precedence over the fields below. */
  rig?: string;
  illustration?: string;
  motionIllustrations?: [string, string, ...string[]];
  sideSupport: ExerciseSideSupport;
  tags: string[];
}
```

Exercise definitions do not contain the duration used by a course. A future
authoring UI may offer a suggested duration, but the executable duration always
belongs to the course placement.

### Left and right variants

Exercises such as donkey kicks, leg circles, and side lunges are stored once
with `sideSupport: "left-right"`. A course placement selects `"left"` or
`"right"`:

```ts
interface CourseExerciseItem {
  type: "exercise";
  id: string;
  exerciseId: string;
  exerciseVersion: number;
  side?: "left" | "right";
  durationSeconds: number;
  shortDescriptionOverride?: string;
}
```

Validation rules:

- A side is required when the referenced exercise supports left/right.
- A side is rejected when the exercise has `sideSupport: "none"`.
- Side selection changes labels and presentation, not the canonical exercise
  instructions.
- Course-specific setup cues may identify the working or supporting side without
  duplicating the full explanation.

The UI shows a compact, accessible side badge next to the exercise name:

- `L` with a directional arrow for left.
- `R` with a directional arrow for right.
- The badge has an accessible name such as “Left side”; direction is never
  communicated by color or arrow alone.
- Mirrored media may be derived at render time only when anatomically correct.
  An exercise can later opt out and provide side-specific media if mirroring
  would make the movement misleading.

## Course entity

`CourseDefinition` replaces the current role of a static class definition while
retaining a stable course ID and version. It contains phases and ordered items:

```ts
type CourseItem = CourseExerciseItem | CourseRestItem | CourseCircuitItem;

interface CourseRestItem {
  type: "rest";
  id: string;
  name: "REST";
  durationSeconds: number;
  shortDescription?: string;
}

interface CourseCircuitItem {
  type: "circuit";
  id: string;
  name: string;
  rounds?: number;
  items: Array<CourseExerciseItem | CourseRestItem>;
}

interface CourseDefinition {
  schemaVersion: 2;
  id: string;
  version: number;
  title: string;
  description?: string;
  tags: string[];
  phases: Array<{
    id: string;
    name: string;
    items: CourseItem[];
  }>;
}
```

Course tags describe the workout as a whole. Equipment is represented through
tags rather than a separate field initially, while keeping tag categories in
the catalog so the UI can present an Equipment filter.

## Tags and local search

Tags have stable normalized IDs and user-facing labels. Start with a controlled
catalog checked into the repository; do not accept near-duplicate free text in
static definitions.

Initial exercise tag categories:

- **Body area:** core, glutes, legs, inner thighs, side body, upper body, back,
  shoulders, arms, full body.
- **Modality:** classic mat Pilates, HIIT Pilates, yoga, mobility, strength,
  balance, stretch.
- **Equipment:** none, mat, band, sliders, weights.
- **Movement type:** standing, seated, supine, prone, side-lying, quadruped,
  plank, static hold, dynamic.

Initial course tag categories:

- **Equipment:** mat, band, sliders, weights, no equipment.
- **Modality:** mat Pilates, HIIT Pilates, yoga, mobility, strength.
- **Focus:** core, lower body, upper body, glutes, full body.
- **Duration band:** under 30, 30–45, 45–60, 60+ minutes. This can be derived
  from the compiled duration rather than authored manually.

Search behavior:

- Separate Exercise Library and Course Library views.
- Case-insensitive search across names, descriptions, and tag labels.
- Multiple filters within one category use OR; filters across categories use
  AND.
- Search and filtering are deterministic, keyboard accessible, and tested.
- Course results show duration, equipment, focus, and exercise count.
- Exercise results show side support, media availability, and grouped tags.

## Compiler boundary

Add a resolver before the existing timeline compiler:

```text
Exercise catalog + Course definition
                  |
                  v
Reference and side validation
                  |
                  v
Resolved authored class snapshot
                  |
                  v
Existing flat timeline compiler
                  |
                  v
RuntimeStep[]
```

The resolver copies canonical exercise presentation fields into an immutable
resolved snapshot and applies placement fields such as duration, side, and
course cue. The timer never performs catalog lookups during a session.

Runtime steps gain optional exercise metadata:

```ts
interface RuntimeExerciseReference {
  exerciseId: string;
  exerciseVersion: number;
  side?: "left" | "right";
  tags: string[];
}
```

Session recovery continues to match course ID and course version. Published or
downloaded v3 courses will later pin exact exercise versions and compile through
the same boundary.

## Migration and compatibility

Migrate one current static class first and compare its compiled snapshot against
the existing timeline step by step:

- runtime order;
- names and side labels;
- durations and offsets;
- phase and round labels;
- rests and transition cues;
- descriptions and media references;
- total duration and step count.

After the pilot is equivalent, migrate the remaining built-in classes. Keep a
temporary adapter for schema-version-1 definitions until all built-in courses
use the catalog. Do not migrate active-session storage merely to rename Class to
Course in the UI.

## Delivery slices

### V2.0 — Contracts and compatibility resolver — complete

- Add exercise, tag, and schema-version-2 course contracts.
- Add strict validation for references, versions, side selection, tags, and
  duplicate IDs.
- Resolve a course plus catalog into the existing compiler input.
- Add snapshot-equivalence and malformed-reference tests.

Exit: a small fixture course using references and both sides compiles through
the current timer without UI changes.

Implemented in `src/domain/catalog-definition.ts` and
`src/domain/resolve-course.ts`. The resolved snapshot pins exercise identity,
version, side, and tags on runtime steps while preserving the schema-version-1
compiler and timer boundary.

### V2.1 — Migrate the built-in catalog — in progress

- Extract canonical exercises from current classes.
- Merge only genuinely identical exercises; keep separate identities when form
  or instructions differ materially.
- Migrate one class as a pilot, then migrate all current classes.
- Preserve course IDs, versions, wording, timing, and offline media.

Exit: every built-in course produces its locked expected timeline and runs
offline with no playback regression.

HIIT Pilates with Sliders and Mat Pilates with Band are the first registered
catalog-backed courses. The unversioned name is the V2 default; the picker keeps
explicit **V1** fallbacks under separate stable IDs for comparison and rollback.
Timing, guidance, and media equivalence tests lock each migrated schedule. A
migration adapter performs the initial
mechanical split without changing playback; the remaining V2.1 work is to merge
genuinely identical exercise records, assign specific tags and side support,
then migrate the other built-in courses and remove the temporary legacy copies.

### V2.2 — Side-aware playback and previews — started in pilot

- Add accessible `L`/`R` directional badges in overview, current step, and Up
  Next.
- Add side-aware labels without changing canonical exercise names.
- Mirror eligible media consistently and support a per-exercise no-mirror or
  side-specific-media override.
- Test reduced motion, missing media, mobile layout, and transitions between
  opposite sides.

Exit: the instructor can distinguish the working side at a glance everywhere
an exercise appears.

The sliders V2 pilot now normalizes repeated left/right movements, stores side
selection on each course placement, and shows accessible directional badges in
the course overview, current step, and Up Next. The legacy sliders option remains
unchanged for comparison. Four distinct plank movements no longer reuse the
same generic high-plank illustration; each is now drawn by its own pose rig,
sharing one figure and one camera convention. See `docs/ARTWORK.md`.

Left badges use a cool blue treatment and right badges use a warm orange
treatment. The visible arrows and `L`/`R` text plus accessible “Left side” and
“Right side” names remain mandatory, so color is never the only side cue.

### V2.3 — Exercise and course discovery — pilot implemented

- Add the separate Exercise Library and Course Library views.
- Add local text search, category filters, empty states, and filter clearing.
- Show tags and side/media metadata without crowding the live session.
- Add unit tests for normalization/filter semantics and Playwright flows for
  phone and desktop.

Exit: an instructor can quickly find an exercise or course by name, equipment,
body area, modality, or focus while offline.

The picker now provides separate Courses and Exercises tabs, local text search,
category-aware tag filters, clear/empty states, side capability, and media status.
Course discovery covers all current built-in courses. Exercise discovery
currently exposes the merged normalized Sliders and Band catalog and will grow as the
remaining courses migrate in V2.1. Search uses OR within a tag category and AND
across categories, with unit and responsive browser coverage.

### V2.4 — v3 readiness

- Document stable JSON serialization for exercises and courses.
- Add catalog export fixtures and deterministic IDs/versions.
- Define the repository interface that static data uses now and a remote v3
  implementation can satisfy later.
- Measure catalog/media size and define IndexedDB/cache migration needs.
- Update v3 import and database plans to the two-entity model.

Exit: v3 can add authentication, remote persistence, authoring, imports, and
activity history without redesigning playback or course compilation.

## Explicitly deferred to v3

- Accounts and authentication.
- Backend database and synchronization.
- Creating or editing exercises in the app.
- Creating or editing courses in the app.
- Uploading media.
- AI JSON import UI.
- Activity history.
- Sharing and collaboration.

## Decisions to validate during v2

1. Whether circuits need reusable identity later. Default: keep them embedded
   until repeated authoring proves otherwise.
2. Whether canonical exercises need a suggested duration. Default: no;
   placements own executable duration.
3. Which movements are safe to mirror. Default: explicit per-exercise policy,
   not automatic mirroring for every left/right movement.
4. Whether equipment should remain tags only or gain structured quantity and
   setup fields in v3.
5. Whether exercise search should index full instructions or only names and
   tags on small screens.
