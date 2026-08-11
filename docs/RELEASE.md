# Release and rollback

GFI Timer deploys the tested `dist/` build from `main` to GitHub Pages. Do not
commit `dist/` or maintain a deployment branch.

## One-time repository setup

1. Open **Settings → Pages** in `yulishalbar/GFI-timer`.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Confirm the repository plan and visibility allow GitHub Pages.
4. Run the **Test and deploy to GitHub Pages** workflow manually once.
5. Confirm the deployment environment reports
   `https://yulishalbar.github.io/GFI-timer/`.

These are repository-owner actions and cannot be completed by the local build.

## Release checklist

1. Review the class schedule, descriptions, illustrations, and stable class
   IDs. Increment a class version only when its executable schedule changes.
2. Run:

   ```sh
   npm ci
   npm run lint
   npm test
   npm run test:e2e
   npm run build
   ```

3. Commit the reviewed source changes and push them to `main`.
4. In **Actions**, open **Test and deploy to GitHub Pages** and verify both the
   `build` and `deploy` jobs succeed.
5. Open the production URL in a normal browser and confirm the class picker,
   overview, Start button, and exercise art load.
6. Open the installed app on the target iPhone or iPad while online. When the
   update prompt appears outside a session, choose **Update now**.
7. Complete the physical-device checks in `docs/DEVELOPMENT.md`, including an
   airplane-mode launch after the online visit.

The service worker downloads a new build in the background. The app does not
offer or apply that update on the live-session screen; exit the session before
updating.

## Rollback

Use a normal Git revert so history stays reviewable and the existing workflow
can deploy the repair.

1. Find the last known-good deployment commit in **Actions**.
2. Revert the faulty commit on `main`, for example:

   ```sh
   git revert <faulty-commit-sha>
   git push origin main
   ```

3. Verify the workflow deploys the revert successfully.
4. Open production online outside an active class and accept **Update now**
   when prompted.
5. Repeat the production smoke test and offline launch test.

Do not rewrite `main`, force-push, manually edit `dist/`, or delete the Pages
environment as a routine rollback. If the faulty release changed persisted
data or a class version, verify recovery from both old and new browser storage
before declaring the rollback complete.
