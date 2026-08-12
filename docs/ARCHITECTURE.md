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
- **Adjust ±10 seconds:** change the current effective step duration and
  remaining duration by the same amount, preserving completed step time. A
  negative adjustment that consumes the remainder enters the next step once.
  Extensions are capped at ten minutes beyond the authored duration.
- **Reload recovery:** restore paused state exactly or reconcile a running
  timestamp with the compiled timeline.

Manual navigation changes scheduled progress and the scheduled remaining
estimate. A separate real-session clock is derived from the original Start
timestamp, continues while the exercise timer is paused, and is clamped to its
previous value so seeking, navigation, or a backward wall-clock correction can
never reduce it.

## Rendering and responsiveness

Use a small set of CSS design tokens for type scale, spacing, colors, safe-area
insets, and touch targets. The active step and timer dominate the visual
hierarchy.

- Phone portrait: single-column, fixed primary controls near the safe bottom.
  The primary target is iPhone 15 Pro Max at 430 × 932 CSS pixels, where the
  complete current-step description remains visible without disclosure UI.
- Phone landscape: compact two-column information/control arrangement.
- iPad: active timer on the left; next step and details on the right.
- On shorter phones and landscape layouts, descriptions and art may move into
  the scrollable content region before essential controls are affected.

Avoid relying on hover. Prevent accidental double taps from selecting text or
triggering adjacent controls, while preserving browser accessibility and zoom.
In schedule previews, explicit rest and transition rows are indented and use a
secondary treatment so they read as connectors between exercises rather than
as exercises themselves. Opening the picker or a class overview resets document
scroll to the beginning. The overview keeps short instructor comments visible
and provides per-pose plus expand-all controls for longer instructions and art.

## Audio

Generate short cue tones through the local Web Audio context so cues work
offline without additional requests. The Start action initializes or resumes
the audio context. Audio preferences are persisted locally.

Step cues are keyed to observed step-index transitions and final countdown cues
are keyed to the step and whole second, preventing duplicate cues during
re-renders. A delayed foreground reconciliation emits at most the current
transition cue; it does not replay every missed cue.

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

interface StoredSessionV2 {
  version: 2;
  classId: string;
  classVersion: number;
  startedAtEpochMs: number;
  elapsedMsFloor: number;
  status: "running" | "paused";
  stepIndex: number;
  stepDurationMs: number;
  targetEndEpochMs?: number;
  remainingMs?: number;
  savedAtEpochMs: number;
}
```

`expandedDescriptions` is retained in version 1 for compatibility with saved
settings, but descriptions are now always rendered expanded. Session version 2
stores the effective step duration so manual time adjustments recover exactly.
The loader still accepts version 1 session records and clears both storage keys
when a session is discarded or completed.

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

Exercise art may use SVG or an optimized local raster image. Prefer SVG for
motion guides so limbs, joints, hands, and feet stay sharp at phone sizes and
the animation can honor `prefers-reduced-motion`; use compact raster artwork
when realistic form is more useful for a static hold. Static holds do not
animate merely for decoration.

Use a conservative update flow: download a new build in the background and ask
the user to refresh only when no class is running. The update remains pending
but its prompt is hidden throughout the live-session screen, then becomes
available after exit. Never force an update during an active session.

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
