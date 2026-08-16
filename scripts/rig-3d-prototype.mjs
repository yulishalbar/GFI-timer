// Prototype of a 2.5D rig: poses authored in floor coordinates and projected
// through a single vanishing point.
//
//   node scripts/rig-3d-prototype.mjs
//
// Writes rig-3d-prototype.html - self-contained, drag the knobs.
//
// The flat rig cannot say which way a body is turned, because it has no way to
// say it: every pose lives in the picture plane. Here a pose is authored in the
// space the exercise happens in - x across the mat, y up, z away from you - and
// one projection maps it to screen. Depth then comes for free: a limb further
// away draws smaller and higher up the mat, and a body can be turned on the
// floor rather than redrawn from a different camera.
//
// The mat is the anchor. Projected, a floor rectangle is a trapezoid with
// converging lines, and that single shape is what makes the rest read as space.
import { writeFileSync } from "node:fs";

// Camera, mat and body start from the settings you tuned; the movement group
// is widened so the two taps actually land on opposite sides of the mat.
const KNOBS = [
  { group: "Camera", key: "focal", label: "Focal length", min: 80, max: 600, step: 10, value: 380 },
  { group: "Camera", key: "horizon", label: "Horizon", min: 0, max: 90, step: 1, value: 43 },
  { group: "Camera", key: "base", label: "Floor at the near edge", min: 120, max: 178, step: 1, value: 154 },
  { group: "Camera", key: "lift", label: "Camera height", min: 0.2, max: 2.4, step: 0.05, value: 1.15 },
  { group: "Mat", key: "matWidth", label: "Mat width", min: 40, max: 320, step: 4, value: 228 },
  { group: "Mat", key: "matNear", label: "Mat near edge", min: -80, max: 20, step: 2, value: -46 },
  { group: "Mat", key: "matFar", label: "Mat far edge", min: 30, max: 300, step: 4, value: 162 },
  { group: "Mat", key: "matLines", label: "Mat lines", min: 0, max: 16, step: 1, value: 12 },
  { group: "Body", key: "turn", label: "Turn on the mat", min: -90, max: 90, step: 2, value: -22 },
  { group: "Body", key: "bodyLen", label: "Hip to shoulder", min: 30, max: 80, step: 1, value: 52 },
  { group: "Body", key: "hipHeight", label: "Hip height", min: 16, max: 50, step: 1, value: 36 },
  { group: "Body", key: "shoulderHeight", label: "Shoulder height", min: 20, max: 60, step: 1, value: 38 },
  { group: "Body", key: "thigh", label: "Thigh", min: 20, max: 50, step: 1, value: 33 },
  { group: "Body", key: "shin", label: "Shin", min: 20, max: 50, step: 1, value: 33 },
  { group: "Body", key: "limbWidth", label: "Limb width", min: 4, max: 18, step: 0.5, value: 9.5 },
  // The leg is stated as two positions and the loop runs between them, the same
  // shape as the rig data. Tilt is the angle from the body's backward axis and
  // sweep is the rotation about it, so a straight-back leg is tilt 0 and a leg
  // square out from the hip is tilt 90.
  { group: "Start", key: "tiltA", label: "Tilt", min: 0, max: 180, step: 2, value: 82 },
  { group: "Start", key: "sweepA", label: "Sweep", min: -180, max: 180, step: 2, value: -124 },
  { group: "Start", key: "kneeA", label: "Knee bend", min: 0, max: 150, step: 2, value: 0 },
  { group: "End", key: "tiltB", label: "Tilt", min: 0, max: 180, step: 2, value: 82 },
  { group: "End", key: "sweepB", label: "Sweep", min: -180, max: 180, step: 2, value: 124 },
  { group: "End", key: "kneeB", label: "Knee bend", min: 0, max: 150, step: 2, value: 0 },
  // Which way a bent knee sends the shin. Neither answer is universal: the fold
  // disappears whenever the shin projects onto its own thigh, and which of the
  // two does that depends on where the thigh points and where the camera is.
  { group: "Movement", key: "foldDown", label: "Shin hangs down (else trails back)", min: 0, max: 1, step: 1, value: 0 },
  { group: "Movement", key: "showArc", label: "Draw the path", min: 0, max: 1, step: 1, value: 1 },
  { group: "Movement", key: "traceKnee", label: "Path follows the knee (else the foot)", min: 0, max: 1, step: 1, value: 0 },
  { group: "Movement", key: "speed", label: "Seconds per pass", min: 1, max: 6, step: 0.25, value: 2.75 }
];

const html = `<title>Rig in Three Dimensions</title>
<style>
:root{--ink:#f2f5f2;--muted:#8a9a8f;--bg:#0b0f0c;--card:#101711;--line:#243026;--accent:#d7ff62;--cool:#8fd8ff}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
  font:15px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
header{padding:1.2rem clamp(.9rem,3vw,2rem) .9rem;border-bottom:1px solid var(--line)}
.eyebrow{margin:0 0 .4rem;color:var(--accent);font-size:.66rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase}
h1{margin:0 0 .5rem;font-size:clamp(1.5rem,4vw,2.3rem);letter-spacing:-.03em;font-weight:820}
header p{margin:0 0 .5rem;color:var(--muted);font-size:.92rem;max-width:46rem}
.layout{display:grid;grid-template-columns:18rem minmax(0,1fr);align-items:start}
@media (max-width:900px){.layout{grid-template-columns:1fr}}
.panel{position:sticky;top:0;max-height:100vh;overflow:auto;padding:1rem 1.1rem 3rem;border-right:1px solid var(--line)}
@media (max-width:900px){.panel{position:static;max-height:none;border-right:0;border-bottom:1px solid var(--line)}}
fieldset{margin:0 0 .9rem;padding:.7rem .8rem;border:1px solid var(--line);border-radius:10px;background:var(--card)}
legend{padding:0 .4rem;color:var(--cool);font-size:.66rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
.knob{display:grid;grid-template-columns:1fr auto;gap:.2rem .5rem;margin-bottom:.5rem}
.knob label{font-size:.78rem;color:var(--muted)}
.knob output{font-size:.78rem;font-variant-numeric:tabular-nums}
.knob input{grid-column:1/-1;width:100%;accent-color:var(--accent);margin:0}
.player{margin:1rem clamp(.9rem,2vw,1.5rem) 0;max-width:34rem}
.player svg{aspect-ratio:16/9}
.grid{display:grid;gap:.8rem;padding:1rem clamp(.9rem,2vw,1.5rem) 3rem;
  grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr))}
figure{margin:0;padding:.5rem;border:1px solid var(--line);border-radius:10px;background:#0c120e}
figure svg{width:100%;aspect-ratio:16/9;display:block;background:#19221c;border-radius:8px}
figcaption{display:flex;justify-content:space-between;margin-top:.4rem;font-size:.72rem}
figcaption span{color:var(--muted)}
#out{width:100%;min-height:7rem;padding:.6rem;border:1px solid var(--line);border-radius:8px;
  background:#0c120e;color:var(--cool);font:12px/1.5 ui-monospace,Menlo,monospace;resize:vertical}
button{padding:.55rem .8rem;border:1px solid var(--line);border-radius:8px;background:var(--card);
  color:var(--ink);font:inherit;font-size:.82rem;font-weight:650;cursor:pointer;margin:0 .4rem .8rem 0}
button.primary{background:var(--accent);color:#10160f;border-color:var(--accent)}
</style>
<header>
  <p class="eyebrow">Prototype</p>
  <h1>The rig, in the space the exercise happens in</h1>
  <p>A pose is authored in floor coordinates — <b>x</b> across the mat, <b>y</b>
  up, <b>z</b> away from you — and one projection maps it to the screen. Depth
  is then free: a limb further away draws smaller and higher up the mat, and the
  body can be <em>turned on the floor</em> instead of redrawn from a different
  camera. Drag <b>Turn on the mat</b> to see that.</p>
  <p>The mat is the anchor. A floor rectangle projects to a trapezoid with
  converging lines, and that one shape is what makes everything else read as
  space rather than as a diagram.</p>
</header>
<div class="layout">
  <div class="panel">
    <button class="primary" id="copy">Copy settings</button>
    <button id="reset">Reset</button>
    <div id="knobs"></div>
    <textarea id="out" readonly></textarea>
  </div>
  <div>
    <figure class="player">
      <svg id="player" viewBox="0 0 320 180"></svg>
      <figcaption><b>Playing</b><span id="playerSweep"></span></figcaption>
    </figure>
    <div class="grid" id="grid"></div>
  </div>
</div>
<script>
const KNOBS = ${JSON.stringify(KNOBS)};
const state = Object.fromEntries(KNOBS.map((k) => [k.key, k.value]));
const D = Math.PI / 180;
const NEAR = "#f2f5f2", FAR = "#66766c", WORK = "#d7ff62", GHOST = "#3d4a3f", FLOOR = "#33453a", MAT = "#4a7b59", INK = "#0b0f0c";

/**
 * One-point perspective. z is depth away from the viewer; s shrinks with it, so
 * the floor converges on the horizon and everything on the floor lands on the
 * mat's trapezoid automatically.
 */
function project(p) {
  const k = state;
  const s = k.focal / (k.focal + p[2]);
  return {
    x: 160 + p[0] * s,
    y: k.horizon + (k.base - k.horizon) * s - p[1] * s * k.lift,
    s
  };
}
const fmt = (q) => q.x.toFixed(1) + " " + q.y.toFixed(1);

/** Rotate a floor point about the vertical axis, so the body turns in place. */
function turn([x, y, z], deg, about) {
  const c = Math.cos(deg * D), sn = Math.sin(deg * D);
  const dx = x - about[0], dz = z - about[2];
  return [about[0] + dx * c - dz * sn, y, about[2] + dx * sn + dz * c];
}

/** A limb: joints in space, drawn with a width that follows its depth. */
function limb(points, colour, widthScale) {
  const q = points.map(project);
  const s = q.reduce((total, p) => total + p.s, 0) / q.length;
  const d = q.map((p, i) => (i ? "L" : "M") + fmt(p)).join("");
  return '<path d="' + d + '" fill="none" stroke="' + colour +
    '" stroke-width="' + (state.limbWidth * widthScale * s).toFixed(1) +
    '" stroke-linecap="round" stroke-linejoin="round"/>';
}

function mat() {
  const k = state;
  const half = k.matWidth / 2;
  const corners = [
    [-half, 0, k.matFar], [half, 0, k.matFar], [half, 0, k.matNear], [-half, 0, k.matNear]
  ].map(project);
  let out = '<path d="' + corners.map((p, i) => (i ? "L" : "M") + fmt(p)).join("") +
    'Z" fill="' + FLOOR + '" stroke="' + MAT + '" stroke-width="1.6"/>';
  for (let i = 1; i <= k.matLines; i += 1) {
    const x = -half + (k.matWidth * i) / (k.matLines + 1);
    const a = project([x, 0, k.matNear]);
    const b = project([x, 0, k.matFar]);
    out += '<path d="M' + fmt(a) + "L" + fmt(b) + '" stroke="' + MAT + '" stroke-width="1" opacity="0.75"/>';
  }
  return out;
}

/**
 * A quadruped with one working leg. The arc is a real sweep in space, which is
 * the whole argument: in the flat rig it had to be faked from a chosen camera.
 */
/**
 * The leg is two positions and the loop runs between them, matching the rig
 * data exactly so what is tuned here is what gets pasted across.
 */
function legAt(t) {
  const k = state;
  return {
    tilt: k.tiltA + (k.tiltB - k.tiltA) * t,
    sweep: k.sweepA + (k.sweepB - k.sweepA) * t,
    knee: k.kneeA + (k.kneeB - k.kneeA) * t
  };
}

const scale3 = (v, n) => [v[0] * n, v[1] * n, v[2] * n];
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const cross3 = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
function unit(v) {
  const n = Math.hypot(v[0], v[1], v[2]);
  return n < 1e-6 ? [0, 0, 1] : scale3(v, 1 / n);
}
/** Rotation of v about a unit axis, by Rodrigues' formula. */
function spin(v, axis, deg) {
  const a = deg * D;
  const c = Math.cos(a), sn = Math.sin(a);
  const dot = v[0] * axis[0] + v[1] * axis[1] + v[2] * axis[2];
  return add3(add3(scale3(v, c), scale3(cross3(axis, v), sn)), scale3(axis, dot * (1 - c)));
}

/** Knee and foot in space, with the knee bend folding the shin off the thigh. */
function legJoints(t) {
  const k = state;
  const leg = legAt(t);
  const tilt = leg.tilt * D;
  const phi = leg.sweep * D;
  const dir = [-Math.cos(tilt), Math.sin(tilt) * Math.cos(phi), Math.sin(tilt) * Math.sin(phi)];
  const hip = [-k.bodyLen / 2, k.hipHeight, 20];
  const place = (from, along, dist, rise) => {
    const to = add3(from, scale3(along, dist));
    return [to[0], Math.max(0, to[1]) + (rise || 0), to[2]];
  };
  const knee = place(hip, dir, k.thigh, 2);
  if (leg.knee === 0) {
    return { knee: turn(knee, k.turn, [0, 0, 20]), foot: turn(place(hip, dir, k.thigh + k.shin), k.turn, [0, 0, 20]) };
  }
  const target = state.foldDown ? [0, -1, 0] : [-1, 0, 0];
  const axis = unit(cross3(dir, target));
  const foot = place(knee, spin(dir, axis, leg.knee), k.shin);
  return { knee: turn(knee, k.turn, [0, 0, 20]), foot: turn(foot, k.turn, [0, 0, 20]) };
}

/**
 * The path a joint travels, sampled from the same numbers that move the leg
 * rather than drawn by hand - so it is a readout of the movement, and the marks
 * at each end sit exactly where it turns around.
 */
function arc() {
  if (!state.showArc) return "";
  const steps = 48;
  const which = state.traceKnee ? "knee" : "foot";
  const points = Array.from({ length: steps + 1 }, (_, i) => project(legJoints(i / steps)[which]));
  const ends = [points[0], points[points.length - 1]];
  return (
    '<path d="' + points.map((p, i) => (i ? "L" : "M") + fmt(p)).join("") +
    '" fill="none" stroke="' + WORK + '" stroke-width="2" stroke-dasharray="5 6" opacity="0.55"/>' +
    ends
      .map(
        (p) =>
          '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) +
          '" r="3.4" fill="' + WORK + '" opacity="0.8"/>'
      )
      .join("")
  );
}

function figure(t) {
  const k = state;
  const about = [0, 0, 20];
  const tp = (p) => turn(p, k.turn, about);

  const hip = tp([-k.bodyLen / 2, k.hipHeight, 20]);
  const shoulder = tp([k.bodyLen / 2, k.shoulderHeight, 20]);
  const head = tp([k.bodyLen / 2 + 20, k.shoulderHeight + 4, 20]);
  const handNear = tp([k.bodyLen / 2 + 4, 0, 8]);
  const handFar = tp([k.bodyLen / 2 + 2, 0, 32]);
  const kneeSupport = tp([-k.bodyLen / 2 - 2, k.hipHeight * 0.45, 30]);
  const footSupport = tp([-k.bodyLen / 2 - 16, 0, 34]);

  const now = legJoints(t);
  const start = legJoints(0);

  const head2d = project(head);
  return [
    mat(),
    // The path sits on the mat, under the body, so the figure never hides it.
    arc(),
    // An onion-skin of where the leg starts, so the range reads in a still.
    limb([hip, start.knee, start.foot], GHOST, 1.05),
    // Far side first so depth reads.
    limb([shoulder, handFar], FAR, 0.85),
    limb([hip, kneeSupport, footSupport], FAR, 0.95),
    limb([hip, shoulder], NEAR, 1.7),
    limb([shoulder, handNear], NEAR, 1),
    limb([hip, now.knee, now.foot], WORK, 1.05),
    '<circle cx="' + head2d.x.toFixed(1) + '" cy="' + head2d.y.toFixed(1) +
      '" r="' + (12 * head2d.s).toFixed(1) + '" fill="' + NEAR + '"/>'
  ].join("");
}

const FRAMES = 4;
const grid = document.getElementById("grid");
grid.innerHTML = Array.from({ length: FRAMES }, (_, i) =>
  '<figure><svg id="svg' + i + '" viewBox="0 0 320 180"></svg>' +
  '<figcaption><b>Frame ' + (i + 1) + '</b><span class="sw" id="sw' + i + '"></span></figcaption></figure>'
).join("");

const label = (t) => {
  const leg = legAt(t);
  return "tilt " + leg.tilt.toFixed(0) + "  sweep " + leg.sweep.toFixed(0) + "  knee " + leg.knee.toFixed(0);
};

function render() {
  for (let i = 0; i < FRAMES; i += 1) {
    const t = i / (FRAMES - 1);
    document.getElementById("svg" + i).innerHTML = figure(t);
    document.getElementById("sw" + i).textContent = label(t);
  }
  document.getElementById("out").value = JSON.stringify(state, null, 2);
}

// The still frames say whether the shape is right; only playback says whether
// the movement reads, which is the thing being judged here.
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
let started = null;
function play(now) {
  if (started === null) started = now;
  const period = state.speed * 2000;
  const phase = ((now - started) % period) / period;
  const t = phase < 0.5 ? ease(phase * 2) : ease((1 - phase) * 2);
  document.getElementById("player").innerHTML = figure(t);
  document.getElementById("playerSweep").textContent = label(t);
  requestAnimationFrame(play);
}
requestAnimationFrame(play);

const groups = [...new Set(KNOBS.map((k) => k.group))];
document.getElementById("knobs").innerHTML = groups.map((g) =>
  "<fieldset><legend>" + g + "</legend>" +
  KNOBS.filter((k) => k.group === g).map((k) =>
    '<div class="knob"><label for="' + k.key + '">' + k.label + '</label>' +
    '<output id="o' + k.key + '">' + k.value + "</output>" +
    '<input type="range" id="' + k.key + '" min="' + k.min + '" max="' + k.max +
    '" step="' + k.step + '" value="' + k.value + '"></div>').join("") +
  "</fieldset>").join("");

KNOBS.forEach((k) => {
  const input = document.getElementById(k.key);
  input.addEventListener("input", () => {
    state[k.key] = Number(input.value);
    document.getElementById("o" + k.key).textContent = input.value;
    render();
  });
});
document.getElementById("reset").addEventListener("click", () => {
  KNOBS.forEach((k) => {
    state[k.key] = k.value;
    document.getElementById(k.key).value = k.value;
    document.getElementById("o" + k.key).textContent = k.value;
  });
  render();
});
document.getElementById("copy").addEventListener("click", () => {
  const out = document.getElementById("out");
  out.select();
  navigator.clipboard?.writeText(out.value);
});
render();
</script>
`;

writeFileSync("rig-3d-prototype.html", html);
console.log(`rig-3d-prototype.html - ${KNOBS.length} knobs`);
