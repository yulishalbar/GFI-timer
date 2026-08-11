# Development guide

## Prerequisites

Use Node.js 22 or newer and npm. CI currently builds with Node.js 24. Dependency
versions are pinned by `package-lock.json`.

## Setup

```sh
npm ci
npm run dev
```

Available scripts:

```sh
npm run dev          # local Vite server
npm run lint         # static checks
npm test             # Vitest unit tests
npm run test:e2e     # Playwright browser tests
npm run build        # type-check and production build
npm run preview      # serve the production build locally
```

## Development sequence

Build from the domain outward:

1. Define and validate class data.
2. Compile nested definitions into a flat timeline.
3. Implement pure timer state and transitions with a fake clock.
4. Build the session UI against the tested domain API.
5. Add persistence, audio, wake lock, and visibility reconciliation.
6. Add the manifest, offline caching, and GitHub Pages deployment.
7. Test on physical iPhone and iPad devices.

Do not start with exercise animations or Spotify. They should not obscure timer
correctness or offline reliability.

## Testing strategy

### Unit tests

The compiler test matrix should cover:

- One phase and one exercise.
- Multiple phases.
- Repeated exercises and explicit rests.
- Nested repeats if supported.
- Correct runtime IDs, labels, offsets, and total duration.
- Empty, invalid, excessive, or duplicate content.

The timer test matrix should cover:

- Start, pause, resume, and completion.
- Real session elapsed time continues while paused and never decreases after
  seeking, navigation, or a backward wall-clock correction.
- Automatic transition at an exact boundary.
- Delayed update that crosses one or several steps.
- Seek while running and paused.
- Add and remove 10 seconds while running and paused, including adjustment at a
  step boundary.
- Previous and next at first, middle, and final steps.
- Restore a paused session.
- Restore a running session before or after its target time.
- Restore adjusted version 2 sessions and accept legacy version 1 sessions.
- System wall-clock changes, with behavior documented.
- No duplicate transition event or audio request.
- Defensive rejection of malformed, unknown-version, or class-version-mismatched
  recovery data.

### Browser tests

Cover the instructor-critical path:

1. Select and start a class.
   Repeat the selection/start smoke flow for every registered class.
2. Pause and resume it.
3. Drag current-step progress.
4. Navigate previous and next.
5. Reload and recover.
6. Complete a class.
7. Use primary controls with a keyboard.
8. Render phone portrait, phone landscape, and iPad viewports without hiding
   essential controls.
9. At 430 × 932, keep the complete current-step description visible above the
   fixed controls without requiring expansion.
10. Open the class overview at scroll position zero, keep Start in the initial
    iPhone 15 Pro Max viewport, and expand pre-class pose details and art.
11. Load each class's referenced illustrations after switching the browser to
    offline mode.

Offline and installation behavior should also be tested manually on physical
iOS/iPadOS hardware before declaring the MVP ready.

## GitHub Pages deployment

The repository is `yulishalbar/GFI-timer`, so its default project Pages URL is:

```text
https://yulishalbar.github.io/GFI-timer/
```

Vite must use the repository subpath:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/GFI-timer/",
  plugins: [react()]
});
```

Deployment will use `.github/workflows/deploy.yml` and run on pushes to `main`:

1. Check out the repository.
2. Install the pinned Node version and npm dependencies with `npm ci`.
3. Run lint, unit tests, and the production build.
4. Upload `dist/` as the Pages artifact.
5. Deploy through the protected `github-pages` environment.

In GitHub, choose **Settings → Pages → Build and deployment → GitHub Actions**.
The workflow needs `contents: read`, `pages: write`, and `id-token: write`.

Do not commit `dist/` or maintain a deployment branch. GitHub Actions owns the
generated artifact.

See [Release and rollback](RELEASE.md) for the production checklist, safe PWA
update behavior, and the non-destructive rollback procedure.

References:

- [Vite static deployment guide](https://vite.dev/guide/static-deploy.html)
- [GitHub Pages custom workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## PWA checklist

- Manifest name, short name, theme/background colors, start URL, and standalone
  display are correct under `/GFI-timer/`.
- Include appropriate maskable and Apple touch icons.
- Cache the app shell and all critical local assets.
- Verify the built app and referenced exercise art reload under Playwright's
  offline browser context.
- Offline startup succeeds after one successful online visit.
- A new build is offered only outside the live-session screen and does not
  forcibly reload an active session.
- Wake lock is requested only from an appropriate user-driven flow.
- Audio is initialized by the Start interaction.
- Storage and service-worker upgrades are tested from the prior deployed build.

## Physical-device test pass

Before a release used in class:

- Install from Safari with Add to Home Screen.
- Start while online, then enable airplane mode and run a cached class.
- Verify the screen stays awake through a representative session.
- Switch away and return; verify time reconciliation and no cue storm.
- Lock and unlock; confirm recovery behavior is understandable.
- Test silent mode and the chosen audio route/speaker.
- Rotate during running and paused states.
- Check safe areas and primary controls on the smallest supported iPhone.
- Check iPad portrait, landscape, and split-screen beside Spotify.
- Refresh during a session and exercise both Resume and Discard.

## Security and privacy

The MVP has no accounts and sends no workout/session data. Keep it that way
unless the product scope changes. Never commit credentials, OAuth tokens, or a
Spotify client secret. Any future analytics must be explicitly justified and
documented before collection.
