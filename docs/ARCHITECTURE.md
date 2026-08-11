# Architecture

## Decision summary

Build one static, installable Progressive Web App using React, TypeScript, and
Vite. Class content is checked into the repository as static TypeScript data.
The build output is hosted at GitHub Pages under `/GFI-timer/`.

There is no backend in the initial architecture. The browser cache provides
offline assets, and versioned browser storage provides settings and session
recovery.

## Why a PWA

- It installs from Safari to the iPhone or iPad Home Screen.
- One deployment updates every device on its next online visit.
- GitHub Pages is sufficient for static hosting and HTTPS.
- It avoids App Store review and personal native-app provisioning.
- The same code works on iPhone, iPad, and desktop during development.
- The application can be wrapped or rewritten natively later if background
  execution becomes a hard requirement.

The main limitation is suspension: a web app cannot guarantee that code or
audio cues run while it is backgrounded or the device is locked. The UI will
request Screen Wake Lock during a session and reconcile time when visibility
returns.

## Proposed stack

| Area | Choice | Notes |
| --- | --- | --- |
| UI | React | Component state and accessible controls |
| Language | TypeScript, strict mode | Shared class and timer contracts |
| Build | Vite | Static production output |
| PWA | Web app manifest plus generated service worker | Cache app shell, classes, sounds, and art |
| State | React reducer/hooks | Avoid a global state dependency initially |
| Persistence | `localStorage` initially | Small versioned settings/session snapshots |
| Unit tests | Vitest | Compiler and timer transitions |
| Browser tests | Playwright | Session controls, recovery, viewport behavior |
| Hosting | GitHub Pages | Deploy `dist/` with GitHub Actions |

If session or asset metadata outgrows `localStorage`, use IndexedDB behind a
small storage interface. Do not introduce it preemptively.

## Suggested source layout

```text
src/
  app/
    App.tsx
    routes.ts
  classes/
    index.ts
    mat-pilates-07-24.ts
  components/
    ClassPicker.tsx
    ClassSummary.tsx
    SessionScreen.tsx
    StepProgress.tsx
    OverallProgress.tsx
    SessionControls.tsx
    ExerciseDetails.tsx
  domain/
    class-definition.ts
    compile-class.ts
    timeline.ts
    timer-state.ts
    timer-reducer.ts
  hooks/
    useSessionTimer.ts
    useAudioCues.ts
    useSessionClock.ts
    useWakeLock.ts
    useSessionRecovery.ts
  persistence/
    schema.ts
    session-store.ts
    settings-store.ts
  assets/
    exercises/
    sounds/
  styles/
    global.css
    tokens.css
tests/
  e2e/
public/
  icons/
```

Names may evolve, but domain logic must remain independent from React and
browser APIs.

## Data flow

```text
Class definition
      |
      v
Schema validation ----> actionable validation errors
      |
      v
Timeline compiler ----> flat RuntimeStep[] + total duration
      |
      v
Timer reducer <------ controls / recovered snapshot / visibility event
      |
      +----------> session view
      +----------> persisted snapshot
      +----------> transition audio cue
```

The nested authoring model exists only at the content boundary. Runtime code
operates on a flat ordered timeline with derived labels and offsets.

## Timeline model

A compiled runtime step contains at least:

```ts
interface RuntimeStep {
  runtimeId: string;
  sourceId: string;
  kind: "exercise" | "rest";
  name: string;
  durationMs: number;
  startsAtMs: number;
  endsAtMs: number;
  phase: { id: string; name: string; index: number; count: number };
  round?: { index: number; count: number };
  step: { index: number; count: number };
  shortDescription?: string;
  longDescription?: string;
  illustration?: string;
}
```

`runtimeId` is unique per expanded occurrence. `sourceId` points back to the
authored item and may repeat across rounds.

## Timer state model

Suggested states:

- `ready`: class compiled, not started.
- `running`: current step has an absolute `targetEndEpochMs`.
- `paused`: current step has a fixed `remainingMs`.
- `complete`: final step finished or the session was explicitly completed.

The authoritative running calculation is:

```text
remainingMs = max(0, targetEndEpochMs - Date.now())
```

An animation frame or modest interval triggers renders but never adds or
subtracts time itself. When `remainingMs` crosses zero, the reducer consumes
the overrun across subsequent steps. This matters if the page returns several
seconds late or a very short step was missed.

Use a monotonic clock such as `performance.now()` for same-page precision if
helpful, but persist epoch timestamps because monotonic values do not survive a
reload. Keep clock access injectable so tests use a fake clock.

### Control semantics

- **Start:** enter the first step at zero elapsed.
- **Pause:** calculate and store exact remaining time.
- **Resume:** set target end to current time plus stored remaining time.
- **Seek:** set elapsed position within the current step, clamped to its bounds.
- **Next:** enter the next step at zero elapsed; completing the final step ends
  the session.
- **Previous:** enter the previous step at zero elapsed; at the first step,
  restart it.
- **Reload recovery:** restore paused state exactly or reconcile a running
  timestamp with the compiled timeline.

Manual navigation changes scheduled elapsed progress. It does not pretend that
skipped exercises were completed in real time; overall progress is the current
timeline offset, not a wall-clock session history metric.

## Rendering and responsiveness

Use a small set of CSS design tokens for type scale, spacing, colors, safe-area
insets, and touch targets. The active step and timer dominate the visual
hierarchy.

- Phone portrait: single-column, fixed primary controls near the safe bottom.
- Phone landscape: compact two-column information/control arrangement.
- iPad: active timer on the left; next step and details on the right.
- Descriptions and art may collapse before essential controls do.

Avoid relying on hover. Prevent accidental double taps from selecting text or
triggering adjacent controls, while preserving browser accessibility and zoom.
In schedule previews, explicit rest and transition rows are indented and use a
secondary treatment so they read as connectors between exercises rather than
as exercises themselves.

## Audio

Load small local audio assets so cues work offline. The Start action initializes
or resumes the audio context. Audio preferences are persisted locally.

Audio events should be emitted from domain transitions rather than inferred
from rendered seconds, preventing duplicate cues during re-renders. Do not
replay every missed cue after foreground recovery.

## Wake lock and visibility

Request Screen Wake Lock after Start and release it when the class ends. A wake
lock may be released by the browser, so request it again when the document
becomes visible and a session is still active. Wake-lock failure is recoverable
and must not stop the timer.

On `visibilitychange`, persist a snapshot. On return, reconcile state using the
current timestamp before rendering or emitting any transition cue.

## Persistence

Persist two versioned records:

```ts
interface StoredSettingsV1 {
  version: 1;
  soundEnabled: boolean;
  expandedDescriptions: boolean;
}

interface StoredSessionV1 {
  version: 1;
  classId: string;
  classVersion: number;
  status: "running" | "paused";
  stepIndex: number;
  targetEndEpochMs?: number;
  remainingMs?: number;
  savedAtEpochMs: number;
}
```

Reject or migrate unknown versions. If the referenced class/version no longer
matches, explain that the session cannot safely resume and offer to discard it.

## Routing and GitHub Pages

The expected URL is:

```text
https://yulishalbar.github.io/GFI-timer/
```

Configure Vite with `base: "/GFI-timer/"`. Prefer a single application route
and view state for the MVP; this avoids deep-link fallback problems on static
GitHub Pages. If URL routes are later introduced, use hash routing or provide a
tested Pages fallback.

All asset URLs, manifest fields, service-worker scope, and icons must work under
the repository subpath. Do not assume the app is hosted at `/`.

## Offline and update behavior

Precache the application shell, registered class definitions, essential audio,
icons, and referenced exercise illustrations. A class shown as available must
not fail halfway through because its static media was not cached.

Use a conservative update flow: download a new build in the background and ask
the user to refresh only when no class is running. Never force an update during
an active session.

## Spotify boundary

Spotify is a later, optional adapter. The timer domain must not know about
Spotify authentication or playback APIs. A future integration can subscribe to
manual media-control commands and expose connection/player state separately.

The likely web approach is OAuth Authorization Code with PKCE and Spotify Web
API playback endpoints. Tokens must not be committed or logged, and no client
secret belongs in a static application. Requirements and Spotify policy must be
reviewed again before implementation.

## References

- [WebKit: Web apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- [Vite: Deploying a static site](https://vite.dev/guide/static-deploy.html)
- [GitHub: Custom workflows for Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk)
- [Spotify iOS SDK](https://developer.spotify.com/documentation/ios)
