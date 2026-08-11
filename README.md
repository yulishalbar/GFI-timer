# GFI Timer

An instructor-focused fitness class timer for iPhone and iPad. Classes are
defined as static data, while one reusable timer engine handles phases, rounds,
exercises, rests, progress, and playback controls.

The app is an offline-capable React/TypeScript PWA designed for GitHub Pages.
No backend or App Store installation is required.

## Project status

Milestone 1 is complete. The repository contains a working class picker,
validated static class format, nested schedule compiler, responsive timeline
preview, offline PWA build, automated tests, and GitHub Pages workflow.

The live countdown and session controls are the next milestone.

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
- [Roadmap](docs/ROADMAP.md)
- [Contributor and agent instructions](AGENTS.md)

Production URL:
<https://yulishalbar.github.io/GFI-timer/>
