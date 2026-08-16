// Builds a standalone page for choosing how the rigged figure should look.
//
//   node scripts/figure-variations.mjs
//
// Writes figure-variations.html - self-contained, no network, openable
// anywhere.
//
// The insight this round is that a single "facing" angle cannot say which way a
// body is turned, because it does not say where the camera is. The same angle
// means "seen in profile" for a crunch and "seen from the front" for a
// side-lying leg lift. So every treatment below is defined per camera:
//
//   profile   we see the side of the face   -> one eye, nose and mouth in profile
//   facing    we see the front of the face  -> two eyes, symmetric hair
//   overhead  we are above the body         -> two eyes or the back of the head
//
// The bodies are solved by the real rig. Only the head, and where a treatment
// says so the torso, is replaced. Nothing here touches the app.
import { chromium } from "@playwright/test";
import { createServer } from "vite";
import { writeFileSync } from "node:fs";

const SAMPLES = [
  { rig: "crunch", phase: 0.5, label: "On the back", note: "profile", view: "profile" },
  { rig: "superman", phase: 0.55, label: "Face down", note: "profile", view: "profile" },
  { rig: "side-lying-leg-lift", phase: 0.55, label: "On the side", note: "facing you", view: "lying" },
  { rig: "cat-cow", phase: 0.2, label: "All fours", note: "profile", view: "profile" },
  { rig: "straight-leg-sweep", phase: 0.5, label: "From above", note: "overhead", view: "overhead", mat: true },
  { rig: "squat-to-stand", phase: 0.55, label: "Standing", note: "facing you", view: "facing" }
];

const VARIANTS = [
  {
    id: "current",
    name: "As it ships",
    head: "nose",
    blurb: "For comparison. One wedge on the outside of the head, the same in every view."
  },
  {
    id: "bob",
    name: "Bob and arcs",
    head: "bob",
    blurb:
      "A carré bob that starts behind the brow and runs past the jaw, plus a brow, nose and mouth drawn as arcs. Profile views get one eye; the views where the face is turned toward you get two, which is by itself the difference between the two cameras."
  },
  {
    id: "bobchest",
    name: "Bob, arcs and chest",
    head: "bob",
    torso: "bust",
    blurb:
      "The same head with a chest curve on the front of the torso. In a profile view the chest points where the face points; seen from the front it sits symmetrically, so the torso says which camera you are looking through too."
  },
  {
    id: "hourglass",
    name: "Bob, chest and body shape",
    head: "bob",
    torso: "hourglass",
    blurb:
      "Adds a waist and wider hips. Three shapes now disagree in a useful way between cameras: in profile the body is a curve with the bust on one edge, head-on it is a symmetric hourglass."
  },
  {
    id: "backhead",
    name: "Back of the head from above",
    head: "bob",
    torso: "hourglass",
    overheadFace: false,
    blurb:
      "Everything as above, except the overhead view shows the back of the head - all hair, no face. Looking down at a plank you would see the back of someone's head, and no face at all is the least ambiguous thing a drawing can say."
  }
];

const server = await createServer({ server: { port: 5198 }, logLevel: "error" });
await server.listen();
const base = server.config.base.replace(/\/$/, "");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto(`http://localhost:5198${base}/`);

const rendered = await page.evaluate(
  async ({ samples, variants, base }) => {
    const { RIGS } = await import(/* @vite-ignore */ `${base}/src/rig/rigs.ts`);
    const { buildFrame } = await import(/* @vite-ignore */ `${base}/src/rig/frame.ts`);
    const { solvePose, poseAtPhase, project } = await import(/* @vite-ignore */ `${base}/src/rig/skeleton.ts`);

    const BODY_WIDTH = 11;
    const OUTLINE = 5;
    const R = 11;
    const INK = "#0b0f0c";
    const D = Math.PI / 180;
    const fmt = ([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`;
    const poly = (pts, close = true) =>
      pts.map((p, i) => `${i ? "L" : "M"}${fmt(p)}`).join("") + (close ? "Z" : "");
    /** A quadratic through two points, bulging by `bulge` along `dir`. */
    const arc = (a, b, dir, bulge) => {
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      return `M${fmt(a)}Q${fmt(project(mid, dir, bulge))} ${fmt(b)}`;
    };

    /** Chin side of the facing line, as the shipping painter picks it. */
    const chinAngle = (joints, facing) => {
      const toShoulder = [joints.shoulder[0] - joints.head[0], joints.shoulder[1] - joints.head[1]];
      const cross = Math.cos(facing * D) * toShoulder[1] - Math.sin(facing * D) * toShoulder[0];
      return facing + (cross >= 0 ? 90 : -90);
    };

    /**
     * The head's own axes. `down` runs toward the chin, `right` across the face.
     * In profile they come from the facing angle; in the other cameras the face
     * is upright on the body, so they come from the spine.
     */
    const headFrame = (joints, pose, view) => {
      if (view === "profile" && pose.facing !== undefined) {
        const down = chinAngle(joints, pose.facing);
        return { right: pose.facing, down, profile: true };
      }
      const down = (pose.head ?? pose.spine) + 180;
      return { right: down - 90, down, profile: false };
    };

    const headShapes = (kind, joints, pose, view, showFace) => {
      const { right, down, profile } = headFrame(joints, pose, view);
      const at = (x, y) => project(project(joints.head, right, x), down, y);
      const outlined = [];
      const filled = [];
      const push = (d, cls = "rig__near rig--filled", w = OUTLINE) => {
        outlined.push(`<path class="rig__outline" d="${d}" stroke-width="${w}"/>`);
        filled.push(`<path class="${cls}" d="${d}"/>`);
      };

      if (kind === "nose") {
        if (pose.facing !== undefined && view === "profile") {
          push(poly([at(R * 0.45, -3.4), at(R + 4.6, -0.4), at(R + 4.4, 1.4), at(R * 0.45, 3)]));
        }
        outlined.push(`<circle class="rig__outline" cx="${joints.head[0]}" cy="${joints.head[1]}" r="${R + OUTLINE / 2}"/>`);
        filled.push(`<circle class="rig__near rig--filled" cx="${joints.head[0]}" cy="${joints.head[1]}" r="${R}"/>`);
        return outlined.join("") + filled.join("");
      }

      // --- the bob -------------------------------------------------------
      // A carré: level with the brow at the front, full over the crown, and
      // squared off below the jaw at the back. Angles run 0 = the way the face
      // points, 90 = toward the chin.
      const rim = (deg, scale) => at(R * scale * Math.cos(deg * D), R * scale * Math.sin(deg * D));
      // One sweep of angles, walked out along the hairline and back along the
      // scalp. They have to be the same sweep in reverse or the ring crosses
      // itself and the fill cancels out.
      const sweep = profile
        ? // Starts behind the brow, over the crown, and squares off below the
          // jaw at the back - a carré seen from the side.
          [[-46, 1.06], [-76, 1.22], [-108, 1.3], [-142, 1.34], [-176, 1.42], [150, 1.62], [126, 1.86], [108, 1.9], [94, 1.7]]
        : // Face-on: down both sides from the crown, widest at the jaw.
          [[52, 1.54], [18, 1.32], [-22, 1.2], [-58, 1.15], [-90, 1.14], [-122, 1.15], [-158, 1.2], [162, 1.32], [128, 1.54]];
      const hair = [
        ...sweep.map(([a, s]) => rim(a, s)),
        ...[...sweep].reverse().map(([a]) => rim(a, 0.93))
      ];

      push(poly(hair), "rig__far rig--filled");
      outlined.push(`<circle class="rig__outline" cx="${joints.head[0]}" cy="${joints.head[1]}" r="${R + OUTLINE / 2}"/>`);
      filled.push(`<circle class="rig__near rig--filled" cx="${joints.head[0]}" cy="${joints.head[1]}" r="${R}"/>`);
      filled.push(`<path class="rig__far rig--filled" d="${poly(hair)}"/>`);

      if (!showFace) return outlined.join("") + filled.join("");

      // --- the face ------------------------------------------------------
      const stroke = (d, w = 1.5) =>
        filled.push(`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round"/>`);
      const dot = (p, r = 1.7) =>
        filled.push(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="${INK}"/>`);

      if (profile) {
        dot(at(R * 0.3, -2.4));
        stroke(arc(at(R * 0.06, -5.2), at(R * 0.58, -4.6), down, -1.6), 1.3); // brow
        stroke(arc(at(R * 0.34, -0.6), at(R * 0.46, 3.4), right, 3.4), 1.5); // nose
        stroke(arc(at(R * 0.2, 6), at(R * 0.68, 5.6), down, 1.6), 1.5); // mouth
      } else {
        dot(at(-R * 0.36, -2.4));
        dot(at(R * 0.36, -2.4));
        stroke(arc(at(-R * 0.12, 0.4), at(R * 0.12, 2.6), right, 1.8), 1.4); // nose
        stroke(arc(at(-R * 0.34, 5.4), at(R * 0.34, 5.4), down, 1.8), 1.5); // mouth
      }
      return outlined.join("") + filled.join("");
    };

    /** Which torso edge is the front, read from `facing` rather than assumed. */
    const frontSide = (pose) => {
      const norm = (deg) => ((deg % 360) + 360) % 360;
      const gap = (a, b) => Math.abs(((norm(a - b) + 180) % 360) - 180);
      if (pose.facing === undefined) return pose.spine + 90;
      return gap(pose.spine - 90, pose.facing) < gap(pose.spine + 90, pose.facing)
        ? pose.spine - 90
        : pose.spine + 90;
    };

    const shapedTorso = (joints, pose, kind, view) => {
      const minHalf = (BODY_WIDTH * 1.55) / 2;
      const symmetric = view !== "profile";
      const front = frontSide(pose);
      const back = front === pose.spine - 90 ? pose.spine + 90 : pose.spine - 90;
      const sh = Math.max(pose.shoulderSpread ?? 0, minHalf);
      const hp = Math.max(pose.hipSpread ?? 0, minHalf) * (kind === "hourglass" ? 1.3 : 1.2);
      const waist = kind === "hourglass" ? minHalf * 0.68 : minHalf * 0.82;
      const bust = sh * 2.6;
      const bow = pose.spineBow ?? 0;
      const p = (from, deg, len) => project(from, deg, len);
      const along = (t) => [
        joints.shoulder[0] + (joints.hip[0] - joints.shoulder[0]) * t,
        joints.shoulder[1] + (joints.hip[1] - joints.shoulder[1]) * t
      ];
      // Seen head-on both edges carry the same curve, so the body is an
      // hourglass. In profile the bust sits on the front edge only.
      const edge = (dir, withBust) =>
        `Q${fmt(p(along(0.13), dir, withBust ? bust : sh * 1.15))} ${fmt(p(along(0.44), dir, sh * 0.72))}` +
        `Q${fmt(p(p(along(0.62), dir, waist), back, bow))} ${fmt(p(joints.hip, dir, hp))}`;

      const d =
        `M${fmt(p(joints.shoulder, back, sh))}L${fmt(p(joints.shoulder, front, sh * 0.94))}` +
        edge(front, true) +
        `L${fmt(p(joints.hip, back, hp))}` +
        (symmetric && kind === "hourglass"
          ? `Q${fmt(p(p(along(0.62), back, waist), back, bow))} ${fmt(p(along(0.44), back, sh * 0.72))}` +
            `Q${fmt(p(along(0.13), back, bust))} ${fmt(p(joints.shoulder, back, sh))}`
          : `Q${fmt(p(p(along(0.5), back, sh), back, bow))} ${fmt(p(joints.shoulder, back, sh))}`) +
        "Z";
      const corner = BODY_WIDTH * 0.4;
      return (
        `<path class="rig__outline" d="${d}" stroke-width="${corner + OUTLINE}"/>` +
        `<path class="rig__near rig--filled" d="${d}" stroke-width="${corner}"/>`
      );
    };

    const node = (shape) => {
      const cls = `rig__${shape.role}`;
      const w = shape.width === undefined ? "" : ` stroke-width="${shape.width}"`;
      const toPath = (pts, close = false) =>
        pts.map((pt, i) => `${i ? "L" : "M"}${fmt(pt)}`).join("") + (close ? "Z" : "");
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

    const isHead = (key) => /^(ghost-)?(head|nose)(-outline)?$/.test(key);
    const isTorso = (key) => /^torso(-outline)?$/.test(key);

    return variants.map((variant) => ({
      ...variant,
      cells: samples.map((sample) => {
        const rig = RIGS[sample.rig];
        const [bx, by, bw, bh] = rig.box.split(" ").map(Number);
        const pose = poseAtPhase(rig.poses, rig.loop, sample.phase);
        const joints = solvePose(pose);
        const shaped = variant.torso && variant.head !== "nose";
        const showFace = sample.view === "overhead" ? variant.overheadFace !== false : true;

        // An overhead view has no ground line, so there is nothing saying the
        // body is on the floor at all. A mat under it is the missing half.
        const mat = sample.mat
          ? `<rect class="rig__ground rig--filled" x="${bx + bw * 0.06}" y="${by + bh * 0.2}" width="${bw * 0.88}" height="${bh * 0.6}" rx="10" opacity="0.55"/>`
          : "";

        const body = buildFrame(rig, sample.phase)
          .filter((shape) => !isHead(shape.key))
          .filter((shape) => !(shaped && isTorso(shape.key)))
          .filter((shape) => shape.role !== "path" && shape.role !== "ghost")
          .map(node)
          .join("");
        const torso = shaped ? shapedTorso(joints, pose, variant.torso, sample.view) : "";
        return {
          label: sample.label,
          note: sample.note,
          svg: `<svg class="exercise-rig" viewBox="${rig.box}">${mat}${body}${torso}${headShapes(variant.head, joints, pose, sample.view, showFace)}</svg>`
        };
      })
    }));
  },
  { samples: SAMPLES, variants: VARIANTS, base }
);

const rigCss = await page.evaluate(() =>
  Array.from(document.styleSheets)
    .flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules);
      } catch {
        return [];
      }
    })
    .map((rule) => rule.cssText)
    .filter((text) => /^(:root|\.exercise-rig|\.rig--filled)/.test(text))
    .join("\n")
);

await browser.close();
await server.close();

const section = (variant, index) => `
<section class="variant" id="${variant.id}">
  <header>
    <p class="tag">Option ${String(index + 1).padStart(2, "0")}</p>
    <h2>${variant.name}</h2>
    <p class="blurb">${variant.blurb}</p>
  </header>
  <div class="strip">
    ${variant.cells
      .map(
        (cell) => `<figure>
      ${cell.svg}
      <figcaption><b>${cell.label}</b><span>${cell.note}</span></figcaption>
    </figure>`
      )
      .join("")}
  </div>
</section>`;

const html = `<title>Figure Variations</title>
<style>
${rigCss}
:root{
  --ink:#f2f5f2; --muted:#8a9a8f; --bg:#0b0f0c; --card:#101711;
  --line:#243026; --accent:#d7ff62; --cool:#8fd8ff;
}
*{box-sizing:border-box}
body{
  margin:0; padding:clamp(1rem,3vw,2.75rem) clamp(0.85rem,3vw,2.75rem) 4rem;
  background:
    radial-gradient(circle at 88% -8%, rgba(215,255,98,.09), transparent 30rem),
    var(--bg);
  color:var(--ink);
  font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;
  -webkit-font-smoothing:antialiased;
}
.masthead{max-width:46rem;margin:0 auto clamp(2rem,5vw,3.5rem)}
.eyebrow{
  margin:0 0 .7rem; color:var(--accent); font-size:.7rem; font-weight:800;
  letter-spacing:.16em; text-transform:uppercase;
}
h1{
  margin:0 0 .9rem; font-size:clamp(2.1rem,7vw,3.6rem); line-height:.98;
  letter-spacing:-.045em; font-weight:820; text-wrap:balance;
}
.masthead p{margin:0 0 .7rem;color:var(--muted);max-width:38rem}
.cameras{
  display:grid; gap:.55rem; margin:1.4rem 0 0; padding:0; list-style:none;
  max-width:38rem;
}
.cameras li{
  display:grid; grid-template-columns:5.5rem 1fr; gap:.75rem;
  padding:.5rem .7rem; border-left:3px solid var(--accent);
  border-radius:0 8px 8px 0; background:rgba(215,255,98,.05);
  color:var(--muted); font-size:.88rem;
}
.cameras b{color:var(--ink);font-weight:700}
.variant{
  max-width:66rem; margin:0 auto clamp(1rem,2.5vw,1.6rem);
  padding:clamp(1rem,2.5vw,1.6rem);
  border:1px solid var(--line); border-radius:14px; background:var(--card);
}
.variant header{max-width:42rem;margin-bottom:1.1rem}
.tag{
  margin:0 0 .35rem; color:var(--cool); font-size:.68rem; font-weight:800;
  letter-spacing:.14em; text-transform:uppercase; font-variant-numeric:tabular-nums;
}
.variant h2{margin:0 0 .5rem;font-size:clamp(1.3rem,3.4vw,1.75rem);letter-spacing:-.02em}
.blurb{margin:0;color:var(--muted);font-size:.94rem}
.strip{
  display:grid; gap:.7rem;
  grid-template-columns:repeat(auto-fit,minmax(min(100%,13rem),1fr));
}
figure{margin:0;padding:.5rem;border:1px solid var(--line);border-radius:10px;background:#0c120e}
figure .exercise-rig{width:100%;aspect-ratio:16/9;display:block}
figcaption{display:flex;justify-content:space-between;gap:.5rem;margin-top:.4rem;font-size:.72rem}
figcaption b{font-weight:700}
figcaption span{color:var(--muted)}
.closing{max-width:46rem;margin:2.5rem auto 0;color:var(--muted);font-size:.94rem}
.closing strong{color:var(--ink)}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.88em;color:var(--cool)}
</style>
<div class="masthead">
  <p class="eyebrow">Rig design review, round two</p>
  <h1>The head has to say where the camera is</h1>
  <p>One facing angle cannot tell you which way a body is turned, because it
  never says where you are standing. The same angle means “seen from the side”
  on a crunch and “seen from the front” on a side-lying leg lift — which is
  exactly why those two looked the same.</p>
  <p>So every option below draws three cameras differently:</p>
  <ul class="cameras">
    <li><b>Profile</b><span>the side of the face: one eye, nose and mouth in profile, the bob squared off behind the jaw</span></li>
    <li><b>Facing you</b><span>the front of the face: two eyes, a symmetric bob that widens at the jaw</span></li>
    <li><b>Overhead</b><span>above the body: two eyes and a mat under the figure — or, in the last option, the back of the head and no face at all</span></li>
  </ul>
  <p>Judge them small. This is the size they run at on a phone mid-class.</p>
</div>
${rendered.map(section).join("")}
<p class="closing">The camera is the new idea, and it is the part worth
deciding first — it needs one field per pose in <code>src/rig/rigs.ts</code>,
which the facing angle can mostly be derived into. Everything else here is a
painter in <code>src/rig/frame.ts</code> that every pose picks up at once.</p>
`;

writeFileSync("figure-variations.html", html);
console.log(`figure-variations.html - ${rendered.length} variants x ${SAMPLES.length} poses`);
