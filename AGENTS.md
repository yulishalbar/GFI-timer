# AGENTS.md

## Purpose

Build an instructor-operated fitness class timer that is dependable during a
live class. Favor clarity, large touch targets, offline operation, and accurate
timekeeping over decorative complexity.

Read these documents before making architectural or product changes:

- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/CLASS_FORMAT.md`
- `docs/DEVELOPMENT.md`
- `docs/ROADMAP.md`

## Target stack

- React and TypeScript
- Vite
- PWA manifest and service worker
- Vitest for unit tests
- Playwright for critical browser flows
- GitHub Actions and GitHub Pages

Do not introduce a backend, authentication, database, global state library, UI
framework, or native wrapper unless a documented requirement justifies it.

## Product rules

- The active exercise, remaining time, phase, round, and controls must be
  readable and usable at a glance.
- Essential controls must fit without scrolling on a supported iPhone viewport.
- Every class is static data consumed by the shared application. Do not create
  a separate page or copy the timer implementation for each class.
- Breaks are explicit timeline entries, not hidden gaps between exercises.
- A class definition must be validated before a session can start.
- User-facing timing uses whole seconds, but internal timing uses milliseconds.
- Pause, resume, seek, next, and previous behavior must be deterministic and
  covered by tests.
- The MVP must function offline after its first successful load.
- Do not make Spotify or other network services a dependency of the core timer.

## Timer correctness

Never use the number of interval callbacks as the source of elapsed time.
Browsers throttle callbacks and may suspend a page.

While running, store an absolute end timestamp and derive remaining time from
the current clock. While paused, store an exact remaining duration. On
visibility changes, reloads, or delayed renders, reconcile state from timestamps
instead of replaying missed ticks.

Keep the pure timeline compiler and timer state transitions independent of
React so they can be unit tested without a browser.

## Implementation conventions

- Enable TypeScript strict mode; avoid `any` unless an external boundary makes
  it unavoidable and the reason is documented.
- Keep domain types in a dependency-free module.
- Prefer small, accessible components and semantic HTML.
- Use buttons for actions and a range input or equally accessible control for
  seeking.
- Support touch, keyboard, safe-area insets, portrait, and landscape layouts.
- Prefer static SVG exercise art and CSS motion. Respect
  `prefers-reduced-motion`.
- All persisted data must be versioned and parsed defensively.
- Add tests with behavior changes, especially timer and compiler changes.
- Keep class IDs stable. Changing an ID can invalidate a recoverable session.

## Expected verification

Once the project is bootstrapped, run these before handing off code changes:

```sh
npm run lint
npm test
npm run build
```

Run Playwright tests when changing navigation, session controls, persistence,
or installation/offline behavior. If a command cannot be run, report why.

## Documentation

Update the relevant document when changing product behavior, class schema,
architecture, deployment, or roadmap scope. Examples in `docs/CLASS_FORMAT.md`
must remain valid against the implemented schema.
