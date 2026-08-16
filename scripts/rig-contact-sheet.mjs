// Renders rigs to one PNG grid so a batch can be reviewed by eye in a single
// look. The test suite can tell you a figure is inside its frame, on the mat
// and moving; it cannot tell you the elbow points the wrong way, or that a side
// plank reads as lying down. Both have shipped, which is why this exists.
//
//   node scripts/rig-contact-sheet.mjs                 # every rig
//   node scripts/rig-contact-sheet.mjs superman plank  # ids matching a substring
//
// Writes rig-contact-sheet.png at the repo root.
//
// The grid is injected into the running app rather than a fresh page, so the
// figures pick up the app's own stylesheet and the sheet shows what actually
// ships instead of an approximation of it.
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const filters = process.argv.slice(2);
/** Two phases far enough apart to show the travel, neither at a loop endpoint. */
const PHASES = [0.15, 0.55];

const server = await createServer({ server: { port: 5199 }, logLevel: "error" });
await server.listen();
// The app is served under a base path for GitHub Pages, and module URLs carry
// it too, so both the page and the imports below have to be prefixed.
const base = server.config.base.replace(/\/$/, "");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:5199${base}/`);
await page.waitForSelector("body");

const count = await page.evaluate(
  async ({ filters, phases, base }) => {
    const { RIGS } = await import(/* @vite-ignore */ `${base}/src/rig/rigs.ts`);
    const { buildFrame, hasMotion, tracePoints } = await import(/* @vite-ignore */ `${base}/src/rig/frame.ts`);

    const ids = Object.keys(RIGS)
      .filter((id) => filters.length === 0 || filters.some((f) => id.includes(f)))
      .sort();

    // Mirrors ShapeNode in ExerciseRig.tsx: same elements, same class names, so
    // the app's own rig styles apply and the output is what ships.
    const fmt = ([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`;
    const toPath = (points, close = false) =>
      points.map((p, i) => `${i ? "L" : "M"}${fmt(p)}`).join("") + (close ? "Z" : "");
    const node = (shape) => {
      const cls = `rig__${shape.role}`;
      const w = shape.width === undefined ? "" : ` stroke-width="${shape.width}"`;
      switch (shape.kind) {
        case "line":
          return `<path class="${cls}" d="M${fmt(shape.from)}L${fmt(shape.to)}"${w}/>`;
        case "dot":
          return `<circle class="${cls} rig--filled" cx="${shape.at[0]}" cy="${shape.at[1]}" r="${shape.radius}"/>`;
        case "disc":
          return `<ellipse class="${cls} rig--filled" cx="${shape.at[0]}" cy="${shape.at[1]}" rx="${shape.rx}" ry="${shape.ry}"/>`;
        case "polyline":
          return `<path class="${cls}" d="${toPath(shape.points)}"${w}${shape.dashed ? ' stroke-dasharray="5 6"' : ""}/>`;
        case "polygon":
          return `<path class="${cls} rig--filled" d="${toPath(shape.points, true)}"${w}/>`;
        case "area":
          return `<path class="${cls} rig--filled" d="${shape.d}"${w}/>`;
        case "curve":
          return `<path class="${cls}" d="M${fmt(shape.from)}Q${fmt(shape.control)} ${fmt(shape.to)}"${w}/>`;
        default:
          return "";
      }
    };
    const frame = (rig, phase, path) =>
      `<svg class="exercise-rig" viewBox="${rig.box}">${buildFrame(rig, phase, path).map(node).join("")}</svg>`;

    const cells = ids.map((id) => {
      const rig = RIGS[id];
      const path = rig.trace && hasMotion(rig) ? tracePoints(rig, rig.trace) : undefined;
      const frames = hasMotion(rig)
        ? phases.map((phase) => frame(rig, phase, path))
        : [frame(rig, 0, path)];
      return `<div class="cell"><h3>${rig.title}</h3><code>${id}</code><div class="frames">${frames.join("")}</div></div>`;
    });

    document.body.innerHTML =
      `<style>
        body{margin:0;padding:16px;background:#0b0f0c}
        .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        .cell{border:1px solid #2b3a30;border-radius:8px;padding:10px;background:#101711}
        .cell h3{margin:0;font-size:13px;color:#f2f5f2;font-family:system-ui,sans-serif}
        .cell code{font-size:11px;color:#8fd8ff}
        .frames{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:6px;margin-top:8px}
        .frames .exercise-rig{width:100%}
      </style><div class="grid">${cells.join("")}</div>`;
    return ids.length;
  },
  { filters, phases: PHASES, base }
);

await page.waitForTimeout(200);
await page.locator(".grid").screenshot({ path: "rig-contact-sheet.png" });
await browser.close();
await server.close();
console.log(`rig-contact-sheet.png - ${count} rig(s)`);
