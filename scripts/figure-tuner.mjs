// Builds an interactive tuner for the figure's head, face and body shape.
//
//   node scripts/figure-tuner.mjs
//
// Writes figure-tuner.html - self-contained, no network, no build step. Open it
// and drag the sliders; every sample redraws live. When it looks right, hit
// "Copy settings" and paste the block back, and the numbers go straight into
// the painter.
//
// The skeleton is solved once, here, and the joint coordinates are baked into
// the page: the knobs only move the head, face, torso and mat, so there is no
// need to ship the solver. That is what makes the page standalone.
import { chromium } from "@playwright/test";
import { createServer } from "vite";
import { writeFileSync } from "node:fs";

/**
 * `view` is the camera, which is the thing a facing angle alone cannot say.
 * The overhead pair is deliberate: the same camera means opposite things
 * depending on whether the body is face up or face down.
 */
const SAMPLES = [
  { rig: "crunch", phase: 0.5, label: "On the back", view: "profile" },
  { rig: "superman", phase: 0.55, label: "Face down", view: "profile" },
  { rig: "cat-cow", phase: 0.2, label: "All fours", view: "profile" },
  { rig: "side-lying-leg-lift", phase: 0.55, label: "On the side", view: "lying" },
  { rig: "squat-to-stand", phase: 0.55, label: "Standing", view: "front" },
  { rig: "knee-across-body", phase: 0.35, label: "On the back, from above", view: "overheadUp", mat: true },
  { rig: "straight-leg-sweep", phase: 0.5, label: "Face down, from above", view: "overheadDown", mat: true }
];

const server = await createServer({ server: { port: 5197 }, logLevel: "error" });
await server.listen();
const base = server.config.base.replace(/\/$/, "");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto(`http://localhost:5197${base}/`);

const baked = await page.evaluate(
  async ({ samples, base }) => {
    const { RIGS } = await import(/* @vite-ignore */ `${base}/src/rig/rigs.ts`);
    const { buildFrame } = await import(/* @vite-ignore */ `${base}/src/rig/frame.ts`);
    const { solvePose, poseAtPhase } = await import(/* @vite-ignore */ `${base}/src/rig/skeleton.ts`);
    const fmt = ([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`;
    const node = (shape) => {
      const cls = `rig__${shape.role}`;
      const w = shape.width === undefined ? "" : ` stroke-width="${shape.width}"`;
      const toPath = (pts, close = false) =>
        pts.map((pt, i) => `${i ? "L" : "M"}${fmt(pt)}`).join("") + (close ? "Z" : "");
      switch (shape.kind) {
        case "line": return `<path class="${cls}" d="M${fmt(shape.from)}L${fmt(shape.to)}"${w}/>`;
        case "dot": return `<circle class="${cls} rig--filled" cx="${shape.at[0]}" cy="${shape.at[1]}" r="${shape.radius}"/>`;
        case "disc": return `<ellipse class="${cls} rig--filled" cx="${shape.at[0]}" cy="${shape.at[1]}" rx="${shape.rx}" ry="${shape.ry}"/>`;
        case "polyline": return `<path class="${cls}" d="${toPath(shape.points)}"${w}/>`;
        case "polygon": return `<path class="${cls} rig--filled" d="${toPath(shape.points, true)}"${w}/>`;
        case "area": return `<path class="${cls} rig--filled" d="${shape.d}"${w}/>`;
        case "curve": return `<path class="${cls}" d="M${fmt(shape.from)}Q${fmt(shape.control)} ${fmt(shape.to)}"${w}/>`;
        default: return "";
      }
    };
    const drop = (key) => /^(ghost-)?(head|nose|torso)(-outline)?$/.test(key);

    return samples.map((sample) => {
      const rig = RIGS[sample.rig];
      const pose = poseAtPhase(rig.poses, rig.loop, sample.phase);
      const j = solvePose(pose);
      return {
        ...sample,
        box: rig.box,
        body: buildFrame(rig, sample.phase)
          .filter((s) => !drop(s.key) && s.role !== "path" && s.role !== "ghost")
          .map(node)
          .join(""),
        head: j.head,
        shoulder: j.shoulder,
        hip: j.hip,
        spine: pose.spine,
        headAngle: pose.head ?? pose.spine,
        facing: pose.facing,
        shoulderSpread: pose.shoulderSpread ?? 0,
        hipSpread: pose.hipSpread ?? 0,
        spineBow: pose.spineBow ?? 0
      };
    });
  },
  { samples: SAMPLES, base }
);

const rigCss = await page.evaluate(() =>
  Array.from(document.styleSheets)
    .flatMap((sheet) => { try { return Array.from(sheet.cssRules); } catch { return []; } })
    .map((rule) => rule.cssText)
    .filter((text) => /^(:root|\.exercise-rig|\.rig--filled)/.test(text))
    .join("\n")
);

await browser.close();
await server.close();

/**
 * Every knob, with its range. The page builds its own controls from this, and
 * holds a separate value per camera - one set of numbers cannot serve a profile
 * and a view from above, which is what the last round showed.
 */
const KNOBS = [
  { group: "Head", key: "headR", label: "Radius", min: 8, max: 20, step: 0.5, value: 11.5 },
  { group: "Head", key: "headOval", label: "Oval (long down the face)", min: 0.8, max: 1.6, step: 0.02, value: 1.18 },
  { group: "Head", key: "headTilt", label: "Head tilt", min: -60, max: 60, step: 2, value: 0 },
  { group: "Hair", key: "hairFull", label: "Fill the whole head (back of head)", min: 0, max: 1, step: 1, value: 0 },
  { group: "Hair", key: "hairFront", label: "Starts behind the brow", min: -100, max: 10, step: 2, value: -40 },
  { group: "Hair", key: "hairBack", label: "Ends below the jaw", min: 40, max: 150, step: 2, value: 100 },
  { group: "Hair", key: "hairCrown", label: "Thickness at the crown", min: 1, max: 1.8, step: 0.02, value: 1.22 },
  { group: "Hair", key: "hairJaw", label: "Thickness at the jaw", min: 1, max: 3, step: 0.04, value: 1.86 },
  { group: "Hair", key: "hairInner", label: "Inner edge", min: 0.6, max: 1, step: 0.02, value: 0.92 },
  { group: "Hair", key: "hairStrands", label: "Strand lines", min: 0, max: 6, step: 1, value: 3 },
  { group: "Hair", key: "hairTilt", label: "Hangs toward the mat", min: -90, max: 90, step: 2, value: 0 },
  { group: "Face", key: "eyeArcs", label: "Eyes as arcs, not dots", min: 0, max: 1, step: 1, value: 1 },
  { group: "Face", key: "eyeR", label: "Eye size", min: 0.8, max: 6, step: 0.1, value: 3 },
  { group: "Face", key: "eyeOut", label: "Eye toward the face", min: 0, max: 0.9, step: 0.02, value: 0.3 },
  { group: "Face", key: "eyeUp", label: "Eye above the nose", min: 0, max: 9, step: 0.2, value: 2.6 },
  { group: "Face", key: "eyeSpread", label: "Eye spacing (two-eye views)", min: 0.1, max: 0.8, step: 0.02, value: 0.38 },
  { group: "Face", key: "browLift", label: "Brow (0 = none)", min: 0, max: 4, step: 0.2, value: 0 },
  { group: "Face", key: "noseLen", label: "Nose length", min: 0, max: 9, step: 0.2, value: 4 },
  { group: "Face", key: "noseBulge", label: "Nose bulge", min: 0, max: 6, step: 0.2, value: 3.2 },
  { group: "Face", key: "mouthW", label: "Mouth width", min: 0.1, max: 1, step: 0.02, value: 0.48 },
  { group: "Face", key: "mouthDrop", label: "Mouth down the face", min: 2, max: 14, step: 0.4, value: 6.4 },
  { group: "Face", key: "mouthCurve", label: "Mouth curve", min: -3, max: 3, step: 0.2, value: 1.6 },
  { group: "Face", key: "ink", label: "Mark weight", min: 0.6, max: 3.5, step: 0.1, value: 1.6 },
  { group: "Body", key: "bustArcs", label: "Chest as arcs on the body", min: 0, max: 1, step: 1, value: 0 },
  { group: "Body", key: "bust", label: "Chest", min: 1, max: 4, step: 0.05, value: 2.6 },
  { group: "Body", key: "bustAt", label: "Chest height on the torso", min: 0.05, max: 0.4, step: 0.01, value: 0.13 },
  { group: "Body", key: "bustDrop", label: "Chest arc lower", min: 0, max: 0.3, step: 0.01, value: 0.1 },
  { group: "Body", key: "waist", label: "Waist", min: 0.4, max: 1.2, step: 0.02, value: 0.7 },
  { group: "Body", key: "hips", label: "Hips", min: 0.9, max: 1.8, step: 0.02, value: 1.3 },
  { group: "Body", key: "shoulders", label: "Shoulders", min: 0.7, max: 1.5, step: 0.02, value: 1 },
  { group: "Mat", key: "matAlpha", label: "Mat contrast", min: 0, max: 1, step: 0.02, value: 0.85 },
  { group: "Mat", key: "matLines", label: "Mat lines", min: 0, max: 14, step: 1, value: 7 },
  { group: "Mat", key: "matInset", label: "Mat size", min: 0, max: 0.3, step: 0.01, value: 0.08 }
];

/**
 * Starting points per camera. Only what differs from the defaults above.
 *
 * The side-lying and overhead-up views are the hard pair: both are a body seen
 * from the front, lying along the screen. What separates them is where gravity
 * points. Lying on your side, hair falls across the body toward the mat; from
 * above it splays evenly around the head. That, the mat, and the chest arcs are
 * the whole difference.
 */
const VIEW_DEFAULTS = {
  profile: {
    headR: 11.5, headOval: 1.18, headTilt: 0,
    hairFull: 0, hairFront: -26, hairBack: 150, hairCrown: 1.26, hairJaw: 1.68,
    hairInner: 0.92, hairStrands: 6, hairTilt: 0,
    eyeArcs: 1, eyeR: 2.1, eyeOut: 0.38, eyeUp: 3.6, eyeSpread: 0.64, browLift: 0,
    noseLen: 3.8, noseBulge: 2.2, mouthW: 0.46, mouthDrop: 6.8, mouthCurve: 2.4, ink: 1.7,
    bustArcs: 0, bust: 2.95, bustAt: 0.35, bustDrop: 0.14,
    waist: 0.4, hips: 1.1, shoulders: 0.72,
    matAlpha: 0.82, matLines: 6, matInset: 0.08
  },
  lying: {
    headR: 11.5, headOval: 1.18, headTilt: -14,
    hairFull: 0, hairFront: -44, hairBack: 142, hairCrown: 1.02, hairJaw: 1.72,
    hairInner: 0.92, hairStrands: 0, hairTilt: 46,
    eyeArcs: 1, eyeR: 1.6, eyeOut: 0.3, eyeUp: 2.6, eyeSpread: 0.32, browLift: 0,
    noseLen: 3.4, noseBulge: 2.2, mouthW: 0.46, mouthDrop: 5.6, mouthCurve: 3, ink: 1.7,
    bustArcs: 1, bust: 1.75, bustAt: 0.19, bustDrop: 0.11,
    waist: 0.62, hips: 1.16, shoulders: 0.9,
    matAlpha: 0.85, matLines: 7, matInset: 0.08
  },
  front: {
    headR: 11.5, headOval: 1.18, headTilt: 0,
    hairFull: 0, hairFront: -52, hairBack: 150, hairCrown: 1.14, hairJaw: 1.68,
    hairInner: 0.92, hairStrands: 0, hairTilt: 0,
    eyeArcs: 1, eyeR: 2.5, eyeOut: 0.3, eyeUp: 2.6, eyeSpread: 0.38, browLift: 0,
    noseLen: 3.4, noseBulge: 4, mouthW: 0.52, mouthDrop: 6.4, mouthCurve: 3, ink: 1.6,
    bustArcs: 0, bust: 1.15, bustAt: 0.11, bustDrop: 0.12,
    waist: 0.78, hips: 1.06, shoulders: 0.88,
    matAlpha: 0.85, matLines: 7, matInset: 0.08
  },
  overheadUp: {
    headR: 11.5, headOval: 1.18, headTilt: 0,
    hairFull: 0, hairFront: -40, hairBack: 150, hairCrown: 1.35, hairJaw: 1.5,
    hairInner: 0.92, hairStrands: 3, hairTilt: 0,
    eyeArcs: 1, eyeR: 1.9, eyeOut: 0.3, eyeUp: 2.6, eyeSpread: 0.38, browLift: 0,
    noseLen: 4, noseBulge: 3.2, mouthW: 0.48, mouthDrop: 6.4, mouthCurve: 3, ink: 1.6,
    bustArcs: 0, bust: 1.9, bustAt: 0.13, bustDrop: 0.1,
    waist: 0.7, hips: 1.08, shoulders: 1,
    matAlpha: 0.72, matLines: 14, matInset: 0.07
  },
  overheadDown: {
    headR: 11.5, headOval: 1.18, headTilt: 0,
    hairFull: 1, hairFront: 10, hairBack: 150, hairCrown: 1.4, hairJaw: 1.76,
    hairInner: 0.94, hairStrands: 0, hairTilt: 0,
    eyeArcs: 1, eyeR: 3, eyeOut: 0.3, eyeUp: 2.6, eyeSpread: 0.38, browLift: 0,
    noseLen: 4, noseBulge: 3.2, mouthW: 0.48, mouthDrop: 6.4, mouthCurve: 1.6, ink: 1.6,
    bustArcs: 0, bust: 1.25, bustAt: 0.18, bustDrop: 0.12,
    waist: 0.7, hips: 1.64, shoulders: 1.46,
    matAlpha: 0.85, matLines: 14, matInset: 0.08
  }
};

const html = `<title>Figure Tuner</title>
<style>
${rigCss}
:root{--ink:#f2f5f2;--muted:#8a9a8f;--bg:#0b0f0c;--card:#101711;--line:#243026;--accent:#d7ff62;--cool:#8fd8ff}
*{box-sizing:border-box}
body{margin:0;padding:0;background:var(--bg);color:var(--ink);
  font:15px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
header{padding:1.2rem clamp(.9rem,3vw,2rem) .9rem;border-bottom:1px solid var(--line)}
.eyebrow{margin:0 0 .4rem;color:var(--accent);font-size:.66rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase}
h1{margin:0 0 .4rem;font-size:clamp(1.5rem,4vw,2.2rem);letter-spacing:-.03em;font-weight:800}
header p{margin:0;color:var(--muted);font-size:.9rem;max-width:44rem}
.layout{display:grid;grid-template-columns:19rem minmax(0,1fr);gap:0;align-items:start}
@media (max-width:900px){.layout{grid-template-columns:1fr}}
.panel{position:sticky;top:0;max-height:100vh;overflow:auto;padding:1rem clamp(.9rem,2vw,1.2rem) 3rem;border-right:1px solid var(--line)}
@media (max-width:900px){.panel{position:static;max-height:none;border-right:0;border-bottom:1px solid var(--line)}}
fieldset{margin:0 0 1rem;padding:.7rem .8rem;border:1px solid var(--line);border-radius:10px;background:var(--card)}
legend{padding:0 .4rem;color:var(--cool);font-size:.66rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
.knob{display:grid;grid-template-columns:1fr auto;gap:.2rem .5rem;margin-bottom:.55rem}
.knob label{font-size:.78rem;color:var(--muted)}
.knob output{font-size:.78rem;font-variant-numeric:tabular-nums;color:var(--ink)}
.knob input{grid-column:1/-1;width:100%;accent-color:var(--accent);margin:0}
.tabs{display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.7rem}
.tab{padding:.4rem .55rem;font-size:.74rem;font-weight:700}
.tab.on{background:var(--accent);color:#10160f;border-color:var(--accent)}
figure.dim{opacity:.6}
.actions{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem}
button{padding:.55rem .8rem;border:1px solid var(--line);border-radius:8px;background:var(--card);
  color:var(--ink);font:inherit;font-size:.82rem;font-weight:650;cursor:pointer}
button:hover{border-color:var(--accent)}
button.primary{background:var(--accent);color:#10160f;border-color:var(--accent)}
.grid{display:grid;gap:.8rem;padding:1rem clamp(.9rem,2vw,1.5rem) 3rem;
  grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr))}
figure{margin:0;padding:.5rem;border:1px solid var(--line);border-radius:10px;background:#0c120e}
figure .exercise-rig{width:100%;aspect-ratio:16/9;display:block}
figcaption{display:flex;justify-content:space-between;gap:.5rem;margin-top:.4rem;font-size:.72rem}
figcaption span{color:var(--muted)}
.small{transform:scale(.42);transform-origin:top left;width:238%}
#out{width:100%;min-height:8rem;padding:.6rem;border:1px solid var(--line);border-radius:8px;
  background:#0c120e;color:var(--cool);font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;resize:vertical}
</style>
<header>
  <p class="eyebrow">Figure tuner</p>
  <h1>Drag until it looks right</h1>
  <p>Every sample redraws live. The camera rules are fixed — one eye in profile,
  two level eyes head-on, two tilted eyes lying on the side, and from above a
  full face if the body is face up but all hair and no face if it is face down.
  The knobs move everything else. When it looks right, copy the settings.</p>
</header>
<div class="layout">
  <div class="panel">
    <div class="tabs" id="tabs"></div>
    <div class="actions">
      <button class="primary" id="copy">Copy settings</button>
      <button id="toAll">Apply to all</button>
      <button id="reset">Reset</button>
      <button id="shrink">Phone size</button>
    </div>
    <div id="knobs"></div>
    <textarea id="out" readonly></textarea>
  </div>
  <div class="grid" id="grid"></div>
</div>
<script>
const SAMPLES = ${JSON.stringify(baked)};
const KNOBS = ${JSON.stringify(KNOBS)};
const VIEW_DEFAULTS = ${JSON.stringify(VIEW_DEFAULTS)};
const VIEWS = ["profile", "lying", "front", "overheadUp", "overheadDown"];
const VIEW_LABELS = {
  profile: "Profile", lying: "On the side", front: "Facing you",
  overheadUp: "Above, face up", overheadDown: "Above, face down"
};
const D = Math.PI / 180;
const INK = "#0b0f0c";

/** One set of numbers per camera. */
const settings = {};
const freshView = (view) => {
  const base = Object.fromEntries(KNOBS.map((k) => [k.key, k.value]));
  return Object.assign(base, VIEW_DEFAULTS[view] || {});
};
VIEWS.forEach((v) => { settings[v] = freshView(v); });
let active = "profile";

const project = (p, deg, len) => [p[0] + Math.cos(deg * D) * len, p[1] + Math.sin(deg * D) * len];
const fmt = ([x, y]) => x.toFixed(1) + " " + y.toFixed(1);
const poly = (pts, close = true) =>
  pts.map((p, i) => (i ? "L" : "M") + fmt(p)).join("") + (close ? "Z" : "");
const arc = (a, b, dir, bulge) => {
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  return "M" + fmt(a) + "Q" + fmt(project(mid, dir, bulge)) + " " + fmt(b);
};

/** Chin side of the facing line, as the shipping painter picks it. */
function chinAngle(s, facing) {
  const to = [s.shoulder[0] - s.head[0], s.shoulder[1] - s.head[1]];
  const cross = Math.cos(facing * D) * to[1] - Math.sin(facing * D) * to[0];
  return facing + (cross >= 0 ? 90 : -90);
}

function headFrame(s, tilt) {
  if (s.view === "profile" && s.facing !== undefined) {
    const down = chinAngle(s, s.facing) + tilt;
    return { right: s.facing + tilt, down, profile: true };
  }
  const down = s.headAngle + 180 + tilt;
  return { right: down - 90, down, profile: false };
}

function drawHead(s) {
  const k = settings[s.view];
  const { right, down, profile } = headFrame(s, k.headTilt);
  // The head is an oval, longer down the face than across it.
  const at = (x, y) => project(project(s.head, right, x), down, y * k.headOval);
  const rim = (deg, scale) =>
    at(k.headR * scale * Math.cos(deg * D), k.headR * scale * Math.sin(deg * D));
  const out = [];
  const face = s.view !== "overheadDown";
  const twoEyes = !profile;
  const headEllipse = (r, cls) =>
    '<ellipse class="' + cls + '" cx="' + s.head[0] + '" cy="' + s.head[1] +
    '" rx="' + r + '" ry="' + r * k.headOval +
    '" transform="rotate(' + (down - 90) + " " + s.head[0] + " " + s.head[1] + ')"/>';

  // Face down from above you see the back of a head: hair all the way across,
  // no face at all. Nothing a drawing can do says "turned away" more plainly.
  if (k.hairFull) {
    out.push(headEllipse(k.headR + 2.5, "rig__outline"));
    out.push(headEllipse(k.headR * k.hairCrown, "rig__far rig--filled"));
    for (let i = 1; i <= k.hairStrands; i += 1) {
      const a = -90 + (180 * i) / (k.hairStrands + 1);
      out.push(
        '<path d="' + poly([rim(a, 0.1), rim(a, k.hairCrown * 0.94)], false) +
          '" fill="none" stroke="' + INK + '" stroke-width="0.9" opacity="0.32" stroke-linecap="round"/>'
      );
    }
    return out.join("");
  }

  // --- hair ---------------------------------------------------------------
  // A carré: from behind the brow, over the crown, squared off below the jaw.
  // Head-on it is the same sweep mirrored, so it frames both sides.
  const steps = 9;
  const sweepAngles = [];
  if (profile) {
    for (let i = 0; i < steps; i += 1) {
      sweepAngles.push(k.hairFront - ((k.hairFront - (k.hairBack - 360)) * i) / (steps - 1));
    }
  } else {
    // Symmetric: one jaw end, up over the crown, down to the mirrored end.
    const a0 = k.hairBack;
    const a1 = 360 + (180 - k.hairBack);
    for (let i = 0; i < steps; i += 1) {
      sweepAngles.push(a0 + ((a1 - a0) * i) / (steps - 1));
    }
  }
  const ramp = (i) => {
    const t = i / (steps - 1);
    // Thin at the crown, thick at the jaw ends.
    const edge = Math.abs(t - 0.5) * 2;
    return k.hairCrown + (k.hairJaw - k.hairCrown) * (profile ? t : edge);
  };
  // Lying on your side, gravity pulls the hair across the body toward the mat.
  // From above it splays evenly. That is the one thing separating two cameras
  // that are otherwise both "a body seen from the front, lying along the page".
  const drape = (p, i) => {
    if (!k.hairTilt) return p;
    const t = i / (steps - 1);
    return project(p, 90, Math.sin(t * Math.PI) * (k.hairTilt / 90) * k.headR * 0.9);
  };
  const hairOuter = sweepAngles.map((a, i) => drape(rim(a, ramp(i)), i));
  const hairInner = [...sweepAngles].reverse().map((a, i) => rim(a, k.hairInner));
  const hair = [...hairOuter, ...hairInner];

  out.push('<path class="rig__outline" d="' + poly(hair) + '" stroke-width="5"/>');
  out.push('<path class="rig__far rig--filled" d="' + poly(hair) + '"/>');
  out.push(
    '<ellipse class="rig__outline" cx="' + s.head[0] + '" cy="' + s.head[1] +
      '" rx="' + (k.headR + 2.5) + '" ry="' + (k.headR * k.headOval + 2.5) +
      '" transform="rotate(' + (down - 90) + ' ' + s.head[0] + ' ' + s.head[1] + ')"/>'
  );
  out.push(
    '<ellipse class="rig__near rig--filled" cx="' + s.head[0] + '" cy="' + s.head[1] +
      '" rx="' + k.headR + '" ry="' + k.headR * k.headOval +
      '" transform="rotate(' + (down - 90) + ' ' + s.head[0] + ' ' + s.head[1] + ')"/>'
  );
  out.push('<path class="rig__far rig--filled" d="' + poly(hair) + '"/>');

  // Strand lines across the hair mass, as in a sketch.
  for (let i = 1; i <= k.hairStrands; i += 1) {
    const t = i / (k.hairStrands + 1);
    const idx = Math.round(t * (steps - 1));
    const a = sweepAngles[idx];
    out.push(
      '<path d="' + poly([rim(a, k.hairInner + 0.04), rim(a, ramp(idx) - 0.05)], false) +
        '" fill="none" stroke="' + INK + '" stroke-width="0.8" opacity="0.35" stroke-linecap="round"/>'
    );
  }

  if (!face) return out.join("");

  // --- face ---------------------------------------------------------------
  const stroke = (d, w) =>
    out.push('<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + (w || k.ink) +
      '" stroke-linecap="round"/>');
  // Either a solid circle at the full eye size, or an almond: two arcs meeting
  // at the corners, one bowing up and one down. A single arc read as a stray
  // mark - it needs the pair to close into an eye.
  const eye = (p) => {
    if (!k.eyeArcs) {
      out.push('<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + k.eyeR + '" fill="' + INK + '"/>');
      return;
    }
    const half = k.eyeR * 0.95;
    const a = project(p, right, -half);
    const b = project(p, right, half);
    stroke(arc(a, b, down, -k.eyeR * 0.62), k.ink);
    stroke(arc(a, b, down, k.eyeR * 0.62), k.ink);
  };
  const dot = eye;
  const R = k.headR;

  if (profile) {
    // Two eyes, crowded toward the front of the head. A single eye read as a
    // stray mark; it is *where* the pair sits, not how many there are, that
    // says the face is turned side-on.
    eye(at(R * (k.eyeOut + k.eyeSpread / 2), -k.eyeUp));
    eye(at(R * (k.eyeOut - k.eyeSpread / 2), -k.eyeUp));
    if (k.browLift > 0) {
      stroke(arc(at(R * (k.eyeOut - 0.3), -k.eyeUp - 2.6), at(R * (k.eyeOut + 0.3), -k.eyeUp - 2.6), down, -k.browLift), k.ink * 0.85);
    }
    if (k.noseLen > 0) {
      stroke(arc(at(R * (k.eyeOut + 0.32), -0.6), at(R * (k.eyeOut + 0.4), k.noseLen), right, k.noseBulge));
      stroke(poly([at(R * (k.eyeOut + 0.4), k.noseLen), at(R * (k.eyeOut + 0.08), k.noseLen + 0.6)], false), k.ink * 0.9);
    }
    stroke(arc(at(R * (k.eyeOut - 0.12), k.mouthDrop), at(R * (k.eyeOut + k.mouthW), k.mouthDrop - 0.4), down, k.mouthCurve));
  } else {
    eye(at(-R * k.eyeSpread, -k.eyeUp));
    eye(at(R * k.eyeSpread, -k.eyeUp));
    if (k.browLift > 0) {
      stroke(arc(at(-R * (k.eyeSpread + 0.22), -k.eyeUp - 2.6), at(-R * (k.eyeSpread - 0.22), -k.eyeUp - 2.6), down, -k.browLift), k.ink * 0.85);
      stroke(arc(at(R * (k.eyeSpread - 0.22), -k.eyeUp - 2.6), at(R * (k.eyeSpread + 0.22), -k.eyeUp - 2.6), down, -k.browLift), k.ink * 0.85);
    }
    if (k.noseLen > 0) stroke(arc(at(-R * 0.1, 0.4), at(R * 0.1, k.noseLen * 0.6), right, k.noseBulge * 0.5));
    stroke(arc(at(-R * k.mouthW, k.mouthDrop), at(R * k.mouthW, k.mouthDrop), down, k.mouthCurve));
  }
  return out.join("");
}

function drawTorso(s) {
  const k = settings[s.view];
  const minHalf = (11 * 1.55) / 2;
  const symmetric = s.view !== "profile";
  const norm = (d) => ((d % 360) + 360) % 360;
  const gap = (a, b) => Math.abs(((norm(a - b) + 180) % 360) - 180);
  const front =
    s.facing === undefined || symmetric
      ? s.spine + 90
      : gap(s.spine - 90, s.facing) < gap(s.spine + 90, s.facing) ? s.spine - 90 : s.spine + 90;
  const back = front === s.spine - 90 ? s.spine + 90 : s.spine - 90;
  const sh = Math.max(s.shoulderSpread, minHalf) * k.shoulders;
  const hp = Math.max(s.hipSpread, minHalf) * k.hips;
  const waist = minHalf * k.waist;
  const bust = sh * k.bust;
  const along = (t) => [s.shoulder[0] + (s.hip[0] - s.shoulder[0]) * t, s.shoulder[1] + (s.hip[1] - s.shoulder[1]) * t];
  const p = (from, deg, len) => project(from, deg, len);
  const edge = (dir) =>
    "Q" + fmt(p(along(k.bustAt), dir, bust)) + " " + fmt(p(along(0.44), dir, sh * 0.72)) +
    "Q" + fmt(p(p(along(0.62), dir, waist), back, s.spineBow)) + " " + fmt(p(s.hip, dir, hp));
  const d =
    "M" + fmt(p(s.shoulder, back, sh)) + "L" + fmt(p(s.shoulder, front, sh * 0.94)) +
    edge(front) + "L" + fmt(p(s.hip, back, hp)) +
    (symmetric
      ? "Q" + fmt(p(p(along(0.62), back, waist), back, s.spineBow)) + " " + fmt(p(along(0.44), back, sh * 0.72)) +
        "Q" + fmt(p(along(k.bustAt), back, bust)) + " " + fmt(p(s.shoulder, back, sh))
      : "Q" + fmt(p(p(along(0.5), back, sh), back, s.spineBow)) + " " + fmt(p(s.shoulder, back, sh))) +
    "Z";
  let out =
    '<path class="rig__outline" d="' + d + '" stroke-width="9.4"/>' +
    '<path class="rig__near rig--filled" d="' + d + '" stroke-width="4.4"/>';

  // Drawn on the body rather than bulged out of it. Seen from the front that is
  // two arcs; in profile the near one is all you would see.
  if (k.bustArcs) {
    // Across the body is perpendicular to the spine - the front/back axis.
    // Offsetting along the spine instead stacked the arcs head-to-toe, which is
    // why they read as a garment rather than as a chest.
    const c = along(k.bustAt + k.bustDrop);
    const line = (from, to, dir, bulge, weight) =>
      '<path d="' + arc(from, to, dir, bulge) + '" fill="none" stroke="' + INK +
      '" stroke-width="' + (weight ?? k.ink) + '" stroke-linecap="round" opacity="0.7"/>';

    if (s.view === "lying") {
      // Lying on your side, it hangs toward the mat - straight down the screen,
      // not along the body. So the arc spans the spine and bulges at gravity.
      // Spanning and bulging in the same direction, as this did, flattens the
      // quadratic into a line.
      const centre = p(c, front, sh * 0.1);
      out += line(p(centre, s.spine, -sh * 0.5), p(centre, s.spine, sh * 0.62), 90, sh * 0.85);
    } else if (symmetric) {
      // Head-on, a single line under the chest rather than two cups.
      out += line(p(c, front, -sh * 0.78), p(c, front, sh * 0.78), s.spine + 180, sh * 0.5);
    } else {
      // In profile only the near one is on the silhouette side.
      const centre = p(c, front, sh * 0.3);
      out += line(p(centre, s.spine, -sh * 0.5), p(centre, s.spine, sh * 0.5), front, sh * 0.62);
    }
  }
  return out;
}

function drawMat(s) {
  if (!s.mat) return "";
  const k = settings[s.view];
  const [bx, by, bw, bh] = s.box.split(" ").map(Number);
  const x = bx + bw * k.matInset;
  const y = by + bh * (k.matInset + 0.12);
  const w = bw * (1 - k.matInset * 2);
  const h = bh * (1 - (k.matInset + 0.12) * 2);
  let out =
    '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
    '" rx="9" fill="#2c3a30" opacity="' + k.matAlpha + '"/>' +
    '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
    '" rx="9" fill="none" stroke="#4a7b59" stroke-width="1.6" opacity="' + k.matAlpha + '"/>';
  for (let i = 1; i <= k.matLines; i += 1) {
    const lx = x + (w * i) / (k.matLines + 1);
    out += '<path d="M' + lx.toFixed(1) + " " + (y + 5).toFixed(1) + "L" + lx.toFixed(1) + " " + (y + h - 5).toFixed(1) +
      '" stroke="#4a7b59" stroke-width="1" opacity="' + k.matAlpha * 0.55 + '"/>';
  }
  return out;
}

const grid = document.getElementById("grid");
grid.innerHTML = SAMPLES.map(
  (s, i) =>
    '<figure id="fig' + i + '"><svg class="exercise-rig" id="svg' + i + '" viewBox="' + s.box + '"></svg>' +
    "<figcaption><b>" + s.label + "</b><span>" + VIEW_LABELS[s.view] + "</span></figcaption></figure>"
).join("");

function render() {
  SAMPLES.forEach((s, i) => {
    document.getElementById("svg" + i).innerHTML = drawMat(s) + s.body + drawTorso(s) + drawHead(s);
    document.getElementById("fig" + i).classList.toggle("dim", s.view !== active);
  });
  document.getElementById("out").value = JSON.stringify(settings, null, 2);
}

const panel = document.getElementById("knobs");
const groups = [...new Set(KNOBS.map((k) => k.group))];
document.getElementById("tabs").innerHTML = VIEWS.map(
  (v) => '<button class="tab" data-view="' + v + '">' + VIEW_LABELS[v] + "</button>"
).join("");

panel.innerHTML = groups
  .map(
    (g) =>
      "<fieldset><legend>" + g + "</legend>" +
      KNOBS.filter((k) => k.group === g)
        .map(
          (k) =>
            '<div class="knob"><label for="' + k.key + '">' + k.label + "</label>" +
            '<output id="o' + k.key + '"></output>' +
            '<input type="range" id="' + k.key + '" min="' + k.min + '" max="' + k.max +
            '" step="' + k.step + '"></div>'
        )
        .join("") +
      "</fieldset>"
  )
  .join("");

function syncInputs() {
  KNOBS.forEach((k) => {
    const value = settings[active][k.key];
    document.getElementById(k.key).value = value;
    document.getElementById("o" + k.key).textContent = value;
  });
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("on", tab.dataset.view === active);
  });
}

KNOBS.forEach((k) => {
  const input = document.getElementById(k.key);
  input.addEventListener("input", () => {
    settings[active][k.key] = Number(input.value);
    document.getElementById("o" + k.key).textContent = input.value;
    render();
  });
});

document.getElementById("tabs").addEventListener("click", (event) => {
  const tab = event.target.closest(".tab");
  if (!tab) return;
  active = tab.dataset.view;
  syncInputs();
  render();
});

document.getElementById("toAll").addEventListener("click", () => {
  VIEWS.forEach((v) => { if (v !== active) settings[v] = { ...settings[active], ...VIEW_DEFAULTS[v] }; });
  render();
});

document.getElementById("reset").addEventListener("click", () => {
  VIEWS.forEach((v) => { settings[v] = freshView(v); });
  syncInputs();
  render();
});
document.getElementById("copy").addEventListener("click", () => {
  const out = document.getElementById("out");
  out.select();
  navigator.clipboard?.writeText(out.value);
});
document.getElementById("shrink").addEventListener("click", () => {
  grid.classList.toggle("small");
});

syncInputs();
render();
</script>
`;

writeFileSync("figure-tuner.html", html);
console.log(`figure-tuner.html - ${baked.length} samples, ${KNOBS.length} knobs`);
