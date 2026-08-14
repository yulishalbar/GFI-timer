# Version 3: Authoring and course history

## Goal

Turn the timer from a static, instructor-specific PWA into a multi-user class
authoring system without weakening the dependable offline session experience.
Users can build reusable exercise libraries, compose courses containing
embedded circuits and explicit rests, import AI-generated course JSON, and
record when a course was taught.

Version 1 remains the playback foundation and Version 2 supplies the normalized
exercise catalog and course model. Authoring and synchronization are additive:
a downloaded course must still run to completion without a network connection.

## Recommended deployment

Use the existing React, TypeScript, Vite, and PWA frontend with Supabase as the
managed backend:

- **Frontend:** continue deploying static assets through GitHub Actions to
  GitHub Pages initially. A custom domain can point to it later.
- **Database:** Supabase Postgres for relational authoring data, versions, tags,
  compositions, and activity history.
- **Authentication:** Supabase Auth, starting with email magic links or a social
  provider. Avoid passwords in the first release unless users require them.
- **Media:** Supabase Storage for user-uploaded exercise images and videos.
  Built-in application artwork can remain in the PWA bundle.
- **Authorization:** Postgres Row Level Security (RLS) on every user-owned table.
- **API:** Supabase's generated data API for ordinary CRUD. Add Edge Functions
  only for operations that require server secrets or transactional orchestration.

This keeps operational complexity low and fits the strongly relational model.
The frontend can remain static; authentication does not require a traditional
always-running application server.

### Expected cost

The Supabase Free plan currently includes 50,000 monthly active users, a 500 MB
database, 1 GB file storage, and 5 GB each of uncached and cached egress. It is
enough for development, a private alpha, and a small pilot. Free projects pause
after one week without activity, so it should not be treated as the final
reliability target for a class-critical production service.

Supabase Pro currently starts at $25 per month and removes the free-project
inactivity behavior while adding larger quotas and backups. GitHub Pages can
continue hosting the frontend for free. A custom domain is the main additional
fixed cost.

User-uploaded video is likely to be the first quota pressure. Enforce file-size,
duration, resolution, and format limits; generate poster images; and defer rich
video processing until usage justifies a dedicated media service.

## Alternatives

### Firebase

Firebase Auth, Firestore, Storage, and Hosting can also start at no cost. Its
Spark quotas currently include 1 GiB Firestore storage, 50,000 reads and 20,000
writes per day, plus authentication and hosting allowances. It is a sound
option, but reusable nested compositions and versioned relationships are more
natural in SQL than in a document database. Read-based billing also rewards
careful denormalization and makes authoring queries less straightforward.

### Cloudflare

Cloudflare Pages/Workers with D1 can be very inexpensive: the free D1 tier
currently includes 5 GB storage, 5 million rows read per day, and 100,000 rows
written per day. It would consolidate frontend, API, and SQL hosting. However,
authentication, authorization, migrations, storage policies, and admin tooling
would require more assembly than Supabase. Choose it if minimizing cost and
owning more infrastructure are more important than development speed.

## Domain model

Use immutable published versions rather than allowing an edit to silently
change a course that has already been taught.

```text
User
 ├── owns Exercise ── has ExerciseVersion ── tagged with Tag
 ├── owns Course ── has CourseVersion ── contains phases and embedded circuits:
 │                                      ├── ExerciseVersion placement
 │                                      └── explicit Break
 └── records CourseRun ── references the exact CourseVersion snapshot
```

Suggested tables:

- `profiles`: user ID, display name, timestamps.
- `exercises`: stable ID, owner, visibility, current draft/version pointers.
- `exercise_versions`: name, instructions, media metadata, version number,
  created time, and publication state.
- `tags`: normalized tag name and optional category.
- `exercise_tags`: exercise-to-tag many-to-many join.
- `courses` and `course_versions`: stable identity and immutable revisions.
- `course_groups`: ordered phases and embedded circuits belonging to one course
  version, with optional round counts.
- `course_items`: ordered discriminated items referencing an exercise version
  placement or an explicit break definition. Exercise placements carry duration
  and optional left/right selection.
- `course_runs`: owner, exact course version, start/end time, actual duration,
  optional audience label, and optional private notes.
- `media_assets`: owner, storage path, type, size, poster, processing status, and
  attribution/licensing fields.
- `import_jobs`: original JSON, validation result, warnings, status, and the
  created draft ID. Retain cautiously and allow deletion.

Course groups and items should use stable ordering keys and database
constraints. Do not store composition only as an opaque JSON blob. A compiled
snapshot may additionally be stored on a published course version for reliable
offline playback and historical fidelity.

## Ownership and sharing

Start with private, per-user content:

- Users can read and mutate only records they own.
- Built-in exercises and courses are system-owned and readable by everyone.
- A user can reuse built-in content or their own content.
- Editing reused content creates a private fork or new version; it never mutates
  another user's source.
- Public sharing, organizations, collaborative editing, moderation, and a
  marketplace are explicitly later features.

Every table needs explicit RLS policies and automated policy tests. Storage
paths must be scoped by authenticated user ID; never rely on hidden UI controls
as authorization.

## Authoring experience

### Exercise library

- Search by name, tag, body area, modality, and equipment.
- Create/edit name, existing supplied instructions, default duration, tags, and
  static/motion media.
- Preview how the exercise appears in the live timer.
- Preserve supplied wording; additional instructions remain separately
  identifiable where provenance matters.

### Course builder

- Compose exercise placements and explicit breaks inside named phases and
  embedded circuits.
- Set per-placement durations, left/right selection, circuit rounds, and
  course-specific cues without duplicating canonical exercise instructions.
- Reorder accessibly with buttons and keyboard controls, not drag-only UI.
- Preview compiled duration and validation errors continuously.
- Override durations without mutating reusable library definitions.
- Compile through the same pure timeline compiler used by playback.
- Publish an immutable version only after successful validation.
- Download/cache the compiled published snapshot and all required media before
  allowing an offline session to start.

## JSON import for external AI

Treat pasted or uploaded JSON as untrusted proposed data.

1. Accept text paste or a size-limited `.json` file.
2. Parse with no code execution.
3. Validate against a documented, versioned JSON Schema.
4. Enforce depth, item-count, duration, text-length, and total-size limits.
5. Resolve exercise references explicitly. Never guess silently when names are
   ambiguous.
6. Show a review screen with errors, warnings, compiled order, duration, and all
   text before writing records.
7. Import into a draft transactionally; publishing is a separate action.
8. Preserve the supplied wording. Missing instructions may be added, but
   existing text is not rewritten.

Do not put an AI provider key in the browser. V3 initially imports AI output;
it does not need to call an AI service itself.

## Activity log and privacy

Record a run only after the instructor starts it, and finalize it when they
manually stop the elapsed timer. Store:

- exact course version or immutable snapshot;
- scheduled and real start/end/duration;
- completion status;
- optional audience label such as a person or group;
- optional instructor notes.

Audience labels and notes may contain personal information. Keep them private,
avoid health fields, provide edit/delete/export controls, and document a
retention policy. Searching for previous similar classes should use course tags,
exercise overlap, and audience label without exposing another user's data.

## Offline and synchronization

Online authoring and authentication may require connectivity; live playback
must not.

- Cache a local catalog of explicitly downloaded/pinned published courses.
- Store immutable compiled snapshots and required media in IndexedDB/Cache
  Storage with schema versions.
- Verify a course is fully available before showing it as offline-ready.
- Queue completed activity records locally when offline and synchronize them
  idempotently later using a client-generated run ID.
- Never modify an active session because a remote course version changed.
- Define conflict behavior for drafts. Initially use optimistic concurrency and
  require the user to resolve stale edits rather than building real-time
  collaborative editing.

## Security and operations

Before public launch:

- Separate local, staging, and production backend projects.
- Manage schema changes with checked-in SQL migrations and generated TypeScript
  database types.
- Add RLS tests, import abuse tests, upload validation, rate limits, and audit
  logs for sensitive operations.
- Restrict allowed origins and authentication redirect URLs.
- Set Content Security Policy and avoid rendering imported HTML.
- Scan or strictly constrain uploads; serve media with correct content types.
- Configure database backups, restore drills, monitoring, error reporting, and
  budget/quota alerts.
- Publish privacy policy, terms, account deletion, and data export flows.
- Keep secrets only in backend/platform configuration.

## Delivery phases

### V3.0 — Backend foundation

- Create development/staging Supabase projects and migrations.
- Add Auth, profiles, RLS, generated types, and environment configuration.
- Model exercises, tags, immutable versions, and media metadata.
- Seed the Version 2 built-in exercises and courses without removing static
  offline fallback data.

Exit: an authenticated user can privately create, search, edit, and version an
exercise; authorization tests prove users cannot access each other's records.

### V3.1 — Course authoring and offline publishing

- Add course versions with ordered phases, embedded circuits, exercise
  placements, and explicit breaks.
- Add the course builder, validation, side selection, duration preview,
  immutable publication, and tests.
- Adapt the existing compiler to the normalized authoring boundary.
- Publish immutable compiled snapshots.
- Download complete courses/media for offline playback.
- Migrate the current static classes into seeded published courses and confirm
  byte-for-behavior-equivalent timelines.

Exit: a user-authored course runs through the existing reliable timer online and
offline.

### V3.2 — AI JSON import

- Publish versioned JSON Schema and examples.
- Add paste/file import, limits, validation, reference resolution, review, and
  transactional draft creation.
- Add adversarial and malformed-input tests.

Exit: externally generated JSON cannot bypass normal course validation and never
publishes without user review.

### V3.3 — Activity history

- Persist manually stopped course runs, including offline queue/sync.
- Add private audience label and notes.
- Add history filters and similarity indicators based on tags and exercise
  overlap.
- Add edit/delete/export and retention controls.

Exit: users can see what they taught, when, and to whom, including runs completed
offline, without cross-user leakage.

### V3.4 — Production hardening

- Complete accessibility and physical-device test passes.
- Add backups/restore verification, monitoring, quota alerts, privacy and account
  deletion flows, staged rollout, and migration/rollback documentation.
- Decide whether the pilot requires Supabase Pro before inviting users who rely
  on the service for live classes.

## Decisions to make before implementation

1. Are exercises private by default forever, or can users publish/share them?
2. Does an exercise need a suggested duration, or should duration belong only
   to a course placement? Version 2 defaults to placement-only; validate this
   before backend implementation.
3. Can courses reference the latest reusable item, or only an immutable version?
   Recommended: drafts may opt into updates; published courses pin versions.
4. Which sign-in methods are required? Recommended pilot: email magic link plus
   one social provider.
5. What media limits are acceptable for the free/pilot tier?
6. Is the audience field free text, saved private contacts/groups, or both?
   Recommended first release: private free text with autocomplete from that
   user's own history.
7. Must users share libraries or collaborate? Recommended: defer until the
   private single-owner model is proven.
