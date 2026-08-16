import type { LoopMode, Point } from "./skeleton";
import type { Shape } from "./frame";

/**
 * Where the working leg is, as three angles rather than a screen position.
 *
 * A rig lists two or more of these and the loop interpolates between them, the
 * same way the flat rig interpolates poses. Stating the leg as angles is what
 * makes the movement camera-independent: turning the body re-renders it rather
 * than needing it re-authored.
 */
export interface SpatialLeg {
  /**
   * Angle between the thigh and the body's backward axis. Zero points straight
   * back along the spine; ninety is square out from the hip.
   */
  tilt: number;
  /**
   * Rotation of the thigh about that backward axis: which way the leg swings.
   * Zero is straight up, and past ninety either way the foot drops toward the
   * mat.
   */
  sweep: number;
  /** Bend at the knee, trailing the shin back behind the thigh. Zero is straight. */
  knee?: number;
  /**
   * How much of the leg's length is used, one being all of it. The leg stays
   * straight; it simply does not reach as far.
   *
   * This is the only way a straight leg's foot comes closer to the hip when the
   * hips cannot move, which is what a slider circle asks for - the real body
   * finds the room by tipping the pelvis, and there is no pelvis here. Without
   * it the leg has to be aimed through the floor and clamped, and the clamp
   * leaves the knee on the original line: a bend nobody authored, which reads as
   * a different exercise.
   */
  reach?: number;
}

/**
 * A rig solved in the space the exercise happens in, rather than in the picture
 * plane.
 *
 * The flat rig cannot say which way a body is turned, because it has nowhere to
 * say it: every pose is authored as screen angles. Here the body lives in floor
 * coordinates - x along the spine, y up, z across the mat - and one projection
 * maps it to the screen. Depth then falls out: a limb further away draws smaller
 * and higher up the mat, and turning the body is one number rather than a redraw
 * from a new camera.
 *
 * It is deliberately not a general 3D engine. There is no inverse kinematics and
 * no torso shape; it exists for the movements the flat rig genuinely cannot
 * carry, which are the ones whose travel is lateral or whose support is what
 * needs showing.
 *
 * `scripts/rig-3d-prototype.mjs` renders these numbers live with knobs. Tune
 * there and paste the result here.
 */
export interface SpatialRig {
  camera: {
    /** Larger flattens the perspective; smaller exaggerates it. */
    focal: number;
    /** Screen y the floor converges on. */
    horizon: number;
    /** Screen y of the floor directly in front of the camera. */
    base: number;
    /** How much height above the floor counts for. */
    lift: number;
  };
  mat: { width: number; near: number; far: number; lines: number };
  body: {
    /** Degrees the whole body is rotated on the floor. */
    turn: number;
    /**
     * Slides the whole body along its own length before it is turned, so a pose
     * that reaches much further one way than the other still sits centred. A
     * tabletop is roughly symmetric about the hip and needs none; a plank runs a
     * leg's length behind it and only a torso in front, and without this it is
     * pinned to the left of the mat with the frame empty beside it.
     */
    shift?: number;
    length: number;
    hipHeight: number;
    shoulderHeight: number;
    thigh: number;
    shin: number;
    limbWidth: number;
  };
  /**
   * What the body is standing on. A tabletop kneels: hands and shins down, hips
   * high over the knees. A plank stands on the hands and the toes, both legs
   * straight back and the body roughly level.
   *
   * This is the half of the pose the flat overhead camera could never show -
   * from above the two project to the same silhouette, because the support is
   * vertical and that camera has no vertical axis. Defaults to the tabletop,
   * which is what the quadruped family is.
   */
  support?: "quadruped" | "plank";
  /**
   * A slider disc under the working foot. The flat rig names equipment by joint,
   * which a solved rig has no names for; there is only one place a disc can go
   * here, so it is a flag. It is what says the foot is sliding rather than
   * lifting, which is the whole distinction on the plank movements.
   */
  slider?: boolean;
  /** The working leg's travel. The loop runs out along it and back. */
  leg: readonly [SpatialLeg, SpatialLeg, ...SpatialLeg[]];
  /**
   * Paint the body back to front instead of always drawing the working leg on
   * top. Only worth it when the leg genuinely passes behind the body, which is
   * what the cross-body movements do - drawn on top, the knee reads as crossing
   * in front of the chest, which is not a thing a leg can do. Everywhere else it
   * costs more than it buys: a leg that swings behind the torso disappears
   * completely, and it is the limb the viewer is being asked to watch.
   */
  occlude?: boolean;
  /**
   * Which way a bent knee sends the shin. Neither answer is universal: the fold
   * is invisible whenever the shin projects onto the thigh, and which of the two
   * does that depends on where the thigh is pointing and where the camera is.
   * Defaults to trailing behind, which is what a knee does when the hip is
   * square.
   */
  fold?: "back" | "down";
  /**
   * Draw the path a joint travels, with its ends marked. The knee is the joint
   * to watch on a movement that folds; the foot on one that reaches.
   */
  trace?: "foot" | "knee";
}

const DEGREES = Math.PI / 180;
const CENTRE_X = 160;
const HIP_DEPTH = 20;
/** The disc is a little wider than the limb standing on it. */
const SLIDER_RADIUS = 1.15;
/**
 * Both of these are stated against the limb width rather than in absolute units,
 * so a body drawn nearer the camera is the same athlete rather than a small head
 * on a large frame. At the tabletop's width of 9.5 they come out at the numbers
 * they were tuned at.
 */
const HEAD_RADIUS = 24 / 19;

type Vec3 = readonly [number, number, number];
interface Projected {
  point: Point;
  scale: number;
}

function project(rig: SpatialRig, [x, y, z]: Vec3): Projected {
  const { focal, horizon, base, lift } = rig.camera;
  const scale = focal / (focal + z);
  return {
    point: [CENTRE_X + x * scale, horizon + (base - horizon) * scale - y * scale * lift],
    scale
  };
}

/** Rotates a point about the vertical axis, so the body turns in place. */
function turn(rig: SpatialRig, [x, y, z]: Vec3): Vec3 {
  const radians = rig.body.turn * DEGREES;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const dx = x;
  const dz = z - HIP_DEPTH;
  return [dx * cos - dz * sin, y, HIP_DEPTH + dx * sin + dz * cos];
}

const scale3 = ([x, y, z]: Vec3, k: number): Vec3 => [x * k, y * k, z * k];
const add3 = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const cross3 = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];

function normalise(v: Vec3): Vec3 {
  const length = Math.hypot(v[0], v[1], v[2]);
  return length < 1e-6 ? [0, 0, 1] : scale3(v, 1 / length);
}

/** Rotation of `v` about a unit `axis`, by Rodrigues' formula. */
function rotateAbout(v: Vec3, axis: Vec3, degrees: number): Vec3 {
  const angle = degrees * DEGREES;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dot = v[0] * axis[0] + v[1] * axis[1] + v[2] * axis[2];
  return add3(
    add3(scale3(v, cos), scale3(cross3(axis, v), sin)),
    scale3(axis, dot * (1 - cos))
  );
}

/** Direction the thigh points, in body coordinates, before the body is turned. */
function thighDirection(leg: SpatialLeg): Vec3 {
  const tilt = leg.tilt * DEGREES;
  const phi = leg.sweep * DEGREES;
  return [-Math.cos(tilt), Math.sin(tilt) * Math.cos(phi), Math.sin(tilt) * Math.sin(phi)];
}

const BACKWARD: Vec3 = [-1, 0, 0];
const DOWNWARD: Vec3 = [0, -1, 0];

/** The hip is where both the body and the working leg are measured from. */
const hipX = (rig: SpatialRig): number => (rig.body.shift ?? 0) - rig.body.length / 2;

/**
 * Where the working leg's joints are for one leg position.
 *
 * The knee folds the shin away from the thigh, either trailing back along the
 * spine or hanging toward the mat. A straight leg is the same calculation with
 * no bend, so the movements that only reach are unaffected.
 *
 * Which fold reads is a property of the pose, not of anatomy. A shin that comes
 * back nearly antiparallel to its own thigh projects onto it and the bend
 * vanishes, and that happens to the trailing fold exactly when the thigh points
 * along the body - which is where a crunch puts it. Hence the choice.
 */
function legJoints(rig: SpatialRig, leg: SpatialLeg): { knee: Vec3; foot: Vec3 } {
  const { hipHeight, thigh, shin } = rig.body;
  const hip: Vec3 = [hipX(rig), hipHeight, HIP_DEPTH];
  const direction = thighDirection(leg);
  // Clamped so a joint rests on the mat rather than passing through it.
  const place = (from: Vec3, along: Vec3, distance: number, rise = 0): Vec3 => {
    const to = add3(from, scale3(along, distance));
    return [to[0], Math.max(0, to[1]) + rise, to[2]];
  };

  // The knee rides slightly proud of the mat, so a leg at the bottom of its
  // travel does not read as welded to the floor.
  const span = leg.reach ?? 1;
  const knee = place(hip, direction, thigh * span, 2);
  const bend = leg.knee ?? 0;
  if (bend === 0) return { knee, foot: place(hip, direction, (thigh + shin) * span) };

  // Folding is a rotation of the thigh direction toward the spine. The axis is
  // whatever is perpendicular to both; when the thigh already lies along the
  // spine there is no such axis, and `normalise` falls back to one across the
  // mat so the fold still happens rather than collapsing to nothing.
  const axis = normalise(cross3(direction, rig.fold === "down" ? DOWNWARD : BACKWARD));
  return { knee, foot: place(knee, rotateAbout(direction, axis, bend), shin * span) };
}

/** Everything that holds still while the working leg travels. */
interface Support {
  hip: Vec3;
  shoulder: Vec3;
  head: Vec3;
  handNear: Vec3;
  handFar: Vec3;
  /** The leg that is not working, through the joints it is drawn with. */
  legFar: readonly Vec3[];
}

/**
 * Where the body meets the mat, which is the difference between a tabletop and
 * a plank and is most of what these guides have to say.
 *
 * A tabletop kneels: the hands are ahead of the shoulders, the shins are down,
 * and the hips ride high over the knees. A plank stands on the hands and the
 * toes with the arms dropping as columns from the shoulders and both legs
 * straight back, so the whole body is held off the floor at once. Overhead the
 * two are the same drawing; here they are not.
 */
function supportOf(rig: SpatialRig): Support {
  const { length, hipHeight, shoulderHeight, thigh, shin } = rig.body;
  const back = hipX(rig);
  const front = back + length;
  const hip: Vec3 = [back, hipHeight, HIP_DEPTH];
  const shoulder: Vec3 = [front, shoulderHeight, HIP_DEPTH];
  if (rig.support === "plank") {
    // How far back a straight leg reaches once the hip is lifted, so the toes
    // rest on the mat rather than hovering over it or driving through it. The
    // working leg is solved the same way, which is what keeps the two the same
    // length.
    const reach = Math.sqrt(Math.max(1, (thigh + shin) ** 2 - hipHeight ** 2));
    // Hands and feet a fifth of the torso either side of the midline. Stated
    // against the body rather than in absolute units, because the plank is drawn
    // nearer the camera than the tabletop and a fixed span would leave a large
    // figure standing on a small stance.
    const spread = length * 0.21;
    return {
      hip,
      shoulder,
      // Forward of the shoulders and a little lower: the gaze is at the mat.
      head: [front + length * 0.37, shoulderHeight - length * 0.08, HIP_DEPTH],
      // Under the shoulders rather than ahead of them. The arms holding the
      // body up are what say it is held up at all, and a column only reads as
      // one when it is vertical.
      handNear: [front, 0, HIP_DEPTH - spread],
      handFar: [front - 1, 0, HIP_DEPTH + spread],
      legFar: [hip, [back - reach, 0, HIP_DEPTH + spread]]
    };
  }
  return {
    hip,
    shoulder,
    head: [front + 20, shoulderHeight + 4, HIP_DEPTH],
    handNear: [front + 4, 0, HIP_DEPTH - 12],
    handFar: [front + 2, 0, HIP_DEPTH + 12],
    legFar: [hip, [back - 2, hipHeight * 0.45, HIP_DEPTH + 10], [back - 16, 0, HIP_DEPTH + 14]]
  };
}

/**
 * The leg position at a phase of the loop.
 *
 * A ping-pong runs out along the list and back, which suits a movement that
 * reverses. A cycle closes the list back onto its first position, which is what
 * an alternating movement does - out, to one side, out, to the other - and
 * reversing that would play the alternation backwards.
 */
function legAtPhase(rig: SpatialRig, phase: number, loop: LoopMode): SpatialLeg {
  const wrapped = ((phase % 1) + 1) % 1;
  const cycle = loop === "cycle";
  const spans = cycle ? rig.leg.length : rig.leg.length - 1;
  const travelled = cycle ? wrapped : wrapped < 0.5 ? wrapped * 2 : 2 - wrapped * 2;
  const scaled = travelled * spans;
  const index = Math.min(Math.floor(scaled), spans - 1);
  const t = scaled - index;
  const from = rig.leg[index] as SpatialLeg;
  const to = rig.leg[(index + 1) % rig.leg.length] as SpatialLeg;
  return {
    tilt: from.tilt + (to.tilt - from.tilt) * t,
    sweep: from.sweep + (to.sweep - from.sweep) * t,
    knee: (from.knee ?? 0) + ((to.knee ?? 0) - (from.knee ?? 0)) * t,
    reach: (from.reach ?? 1) + ((to.reach ?? 1) - (from.reach ?? 1)) * t
  };
}

/** A drawn part together with how far away it is, so the two can be sorted. */
interface Part {
  shape: Shape;
  depth: number;
}

function limb(
  rig: SpatialRig,
  key: string,
  role: Shape["role"],
  joints: readonly Vec3[],
  weight: number
): Part {
  const placed = joints.map((joint) => turn(rig, joint));
  const projected = placed.map((joint) => project(rig, joint));
  const scale = projected.reduce((total, p) => total + p.scale, 0) / projected.length;
  return {
    depth: placed.reduce((total, joint) => total + joint[2], 0) / placed.length,
    shape: {
      kind: "polyline",
      key,
      role,
      points: projected.map((p) => p.point),
      width: rig.body.limbWidth * weight * scale
    }
  };
}

function pushMat(out: Shape[], rig: SpatialRig): void {
  const half = rig.mat.width / 2;
  const corners: Vec3[] = [
    [-half, 0, rig.mat.far],
    [half, 0, rig.mat.far],
    [half, 0, rig.mat.near],
    [-half, 0, rig.mat.near]
  ];
  out.push({
    kind: "polygon",
    key: "mat",
    role: "ground",
    points: corners.map((corner) => project(rig, corner).point),
    width: 2
  });
  for (let i = 1; i <= rig.mat.lines; i += 1) {
    const x = -half + (rig.mat.width * i) / (rig.mat.lines + 1);
    out.push({
      kind: "line",
      key: `mat-line-${i}`,
      role: "mat",
      from: project(rig, [x, 0, rig.mat.near]).point,
      to: project(rig, [x, 0, rig.mat.far]).point,
      width: 1
    });
  }
}

/**
 * Sampled from the same numbers that move the leg, so it is a readout of the
 * movement rather than a second account of it, and the marks at each end sit
 * exactly where the movement turns around.
 */
function pushTrace(out: Shape[], rig: SpatialRig, joint: "foot" | "knee", loop: LoopMode): void {
  const samples = 48;
  const points: Point[] = [];
  for (let i = 0; i <= samples; i += 1) {
    // On a ping-pong half the loop is the outward travel and the rest retraces
    // it; a cycle never repeats itself, so the whole loop is the path.
    const at = legJoints(rig, legAtPhase(rig, (i / samples) * (loop === "cycle" ? 1 : 0.5), loop));
    points.push(project(rig, turn(rig, at[joint])).point);
  }
  out.push({ kind: "polyline", key: "trace", role: "path", points, width: 2, dashed: true });
  [points[0], points[points.length - 1]].forEach((point, index) => {
    if (!point) return;
    out.push({ kind: "dot", key: `trace-end-${index}`, role: "path", at: point, radius: 3.4 });
  });
}

/**
 * The slider under the working foot, lying on the mat and travelling with it.
 *
 * It is the equipment the movement is named for, and on the floor it also says
 * the foot has not left the mat - sliding rather than lifting is the whole
 * distinction, and a foot drawn alone at ground level cannot make it. A circle
 * on the floor projects to an ellipse squashed by the floor's own
 * foreshortening, which is the same number that makes the mat a trapezoid.
 */
function pushSlider(out: Shape[], rig: SpatialRig, foot: Vec3): void {
  const { focal, horizon, base } = rig.camera;
  const { point, scale } = project(rig, turn(rig, [foot[0], 0, foot[2]]));
  const rx = rig.body.limbWidth * SLIDER_RADIUS * scale;
  out.push({
    kind: "disc",
    key: "slider",
    role: "equipment",
    at: point,
    rx,
    ry: (rx * (base - horizon) * scale) / focal
  });
}

export function buildSpatialFrame(rig: SpatialRig, phase: number, loop: LoopMode): Shape[] {
  const out: Shape[] = [];
  const body = supportOf(rig);
  const working = legJoints(rig, legAtPhase(rig, phase, loop));

  pushMat(out, rig);
  if (rig.trace) pushTrace(out, rig, rig.trace, loop);
  if (rig.slider) pushSlider(out, rig, working.foot);
  // An onion-skin of where the leg starts, so range of motion is readable in a
  // frozen frame. Only the working leg is ghosted: the rest of the body holds
  // still, and drawing it twice reads as two people rather than two moments.
  const start = legJoints(rig, legAtPhase(rig, 0, loop));
  out.push(limb(rig, "leg-ghost", "ghost", [body.hip, start.knee, start.foot], 1.05).shape);

  const projectedHead = project(rig, turn(rig, body.head));
  const parts: Part[] = [
    limb(rig, "arm-far", "far", [body.shoulder, body.handFar], 0.85),
    limb(rig, "leg-far", "far", body.legFar, 0.95),
    limb(rig, "torso", "near", [body.hip, body.shoulder], 1.7),
    limb(rig, "arm-near", "near", [body.shoulder, body.handNear], 1),
    limb(rig, "leg-work", "focus", [body.hip, working.knee, working.foot], 1.05),
    {
      depth: turn(rig, body.head)[2],
      shape: {
        kind: "dot",
        key: "head",
        role: "near",
        at: projectedHead.point,
        radius: rig.body.limbWidth * HEAD_RADIUS * projectedHead.scale
      }
    }
  ];
  if (rig.occlude) parts.sort((a, b) => b.depth - a.depth);
  parts.forEach((part) => out.push(part.shape));
  return out;
}
