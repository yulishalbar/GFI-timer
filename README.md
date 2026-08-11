# GFI Timer

An instructor-focused fitness class timer for iPhone and iPad. Classes are
defined as static data, while one reusable timer engine handles phases, rounds,
exercises, rests, progress, and playback controls.

The app is an offline-capable React/TypeScript PWA designed for GitHub Pages.
No backend or App Store installation is required.

## Project status

Milestones 1 and 2 are complete. The repository contains a working class
picker, validated static class format, schedule compiler, responsive timeline,
timestamp-based live timer, touch and keyboard session controls, offline PWA
build, recoverable sessions, local audio cues, wake-lock handling, automated
tests, complete install icons, safe update prompting, offline browser coverage,
and a GitHub Pages workflow. Milestones 3 and 4 are implemented locally and
ready for GitHub Pages enablement plus physical iPhone and iPad verification.
The live session layout is optimized for an iPhone 15 Pro Max in portrait while
retaining compact-phone coverage.

## Requirements

- [Node.js](https://nodejs.org/) 22 or newer
- npm, which is included with Node.js
- Git

## Install and run locally

Clone the repository and install the exact dependency versions recorded in
`package-lock.json`:

```sh
git clone https://github.com/yulishalbar/GFI-timer.git
cd GFI-timer
npm ci
```

### Windows PowerShell execution-policy error

If PowerShell reports that `npm.ps1` cannot be loaded because running scripts
is disabled, use npm's Windows command wrapper:

```powershell
npm.cmd ci
```

You can use `npm.cmd` in place of `npm` for the other commands in this README.
Alternatively, enable locally created and signed scripts for your Windows user:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Confirm the prompt, restart PowerShell, and then run `npm ci` again. On a
managed computer where policy changes are blocked, continue using `npm.cmd`.
Avoid changing the execution policy to `Unrestricted`.

Start the development server:

```sh
npm run dev
```

Open the URL printed by Vite in a browser. It will normally be:

```text
http://localhost:5173/GFI-timer/
```

Changes to source files appear automatically while the server is running. Stop
the server with `Ctrl+C`.

## Test and build

Run the static checks and unit tests:

```sh
npm run lint
npm test
```

Playwright needs its Chromium browser installed once on a new development
machine:

```sh
npx playwright install chromium
npm run test:e2e
```

Create the production build:

```sh
npm run build
```

The deployable static files are written to `dist/`. Preview that exact build
locally with:

```sh
npm run preview
```

Open the URL printed by Vite. The preview uses the same `/GFI-timer/` base path
as GitHub Pages.

## Deploy to GitHub Pages

Deployment is automated by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The workflow
installs dependencies, runs lint, unit tests, browser tests, creates the
production build, and deploys `dist/`.

Enable GitHub Pages once:

1. Open the repository on GitHub.
2. Select **Settings**, then **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.

Deploy the current version by pushing it to `main`:

```sh
git add .
git commit -m "Describe the change"
git push origin main
```

Follow the **Actions** tab on GitHub to watch the `Test and deploy to GitHub
Pages` workflow. After it succeeds, open:

<https://yulishalbar.github.io/GFI-timer/>

The same workflow can also be started manually: open **Actions**, select **Test
and deploy to GitHub Pages**, and choose **Run workflow**. Do not commit `dist/`;
GitHub Actions builds and uploads it.

See the [release and rollback guide](docs/RELEASE.md) before the first
production deployment. New builds are offered only outside the live-session
screen, preventing an update from interrupting a running class.

## Open and install on iPhone or iPad

After a successful deployment:

1. Open Safari on the iPhone or iPad.
2. Visit <https://yulishalbar.github.io/GFI-timer/>.
3. Wait for the app to finish loading while online.
4. Tap Safari's **Share** button.
5. Scroll through the actions and select **Add to Home Screen**.
6. Keep the name **GFI Timer**, then tap **Add**.
7. Launch GFI Timer from its new Home Screen icon.

Opening the Home Screen icon gives the app a standalone, app-like window. After
the first successful online load, cached classes and application assets can be
opened without a network connection. After deploying an update, open the app
while online so the new version can download.

For a quick test from a phone before deployment, connect the computer and phone
to the same network and run:

```sh
npm run dev -- --host 0.0.0.0
```

Open the **Network** URL printed by Vite on the phone. This is suitable for UI
testing, but use the HTTPS GitHub Pages version when testing installation and
offline behavior.

## Start here

- [Product specification](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Class format](docs/CLASS_FORMAT.md)
- [Development guide](docs/DEVELOPMENT.md)
- [Release and rollback](docs/RELEASE.md)
- [Roadmap](docs/ROADMAP.md)
- [Contributor and agent instructions](AGENTS.md)

Production URL:
<https://yulishalbar.github.io/GFI-timer/>
