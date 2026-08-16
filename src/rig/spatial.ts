import type { Point } from "./skeleton";
import type { Shape } from "./frame";

/**
 * A rig solved in the space the exercise happens in, rather than in the picture
 * plane.
 *
 * The flat rig cannot say which way a body is turned, because it has nowhere to
 * say it: every pose is authored as screen angles. Here the body lives in floor
 * coordinates - x across the mat, y up, z away from the viewer - and one
 * projection maps it to the screen. Depth then falls out: a limb further away
 * draws smaller and higher up the mat, and turning the body is one number
 * rather than a redraw from a new camera.
 *
 * It is deliberately not a general 3D engine. There is no inverse kinematics
 * and no torso shape; it exists for the movements the flat rig genuinely cannot
 * carry, which are the ones whose travel is lateral.
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
    length: number;
    hipHeight: number;
    shoulderHeight: number;
    thigh: number;
    shin: number;
    limbWidth: number;
  };
  /**
   * The working leg is a rotation about the body's long axis. Past ninety
   * degrees either way the foot drops below the hip, and far enough past it
   * reaches the mat - which is the tap the movement is named for.
   */
  sweepFrom: number;
  sweepTo: number;
  /** Angle between the leg and the body's axis: how wide the arc is. */
  legTilt: number;
  /** Draw the path the foot travels, with its two taps marked. */
  arc?: boolean;
}

const DEGREES = Math.PI / 180;
const CENTRE_X = 160;
const HIP_DEPTH = 20;

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

/** Where the working foot is for a given sweep angle. */
function footAt(rig: SpatialRig, sweep: number): Vec3 {
  const { length, hipHeight, thigh, shin } = rig.body;
  const tilt = rig.legTilt * DEGREES;
  const phi = sweep * DEGREES;
  const reach = thigh + shin;
  const direction: Vec3 = [
    -Math.cos(tilt),
    Math.sin(tilt) * Math.cos(phi),
    Math.sin(tilt) * Math.sin(phi)
  ];
  return turn(rig, [
    -length / 2 + direction[0] * reach,
    // Clamped so the tap lands on the mat rather than through it.
    Math.max(0, hipHeight + direction[1] * reach),
    HIP_DEPTH + direction[2] * reach
  ]);
}

function limb(
  rig: SpatialRig,
  key: string,
  role: Shape["role"],
  joints: readonly Vec3[],
  weight: number
): Shape {
  const projected = joints.map((joint) => project(rig, joint));
  const scale = projected.reduce((total, p) => total + p.scale, 0) / projected.length;
  return {
    kind: "polyline",
    key,
    role,
    points: projected.map((p) => p.point),
    width: rig.body.limbWidth * weight * scale
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
 * movement rather than a second account of it, and the two dots sit exactly
 * where the foot reaches the mat.
 */
function pushArc(out: Shape[], rig: SpatialRig): void {
  const samples = 48;
  const points: Point[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const sweep = rig.sweepFrom + ((rig.sweepTo - rig.sweepFrom) * i) / samples;
    points.push(project(rig, footAt(rig, sweep)).point);
  }
  out.push({ kind: "polyline", key: "arc", role: "path", points, width: 2, dashed: true });
  [points[0], points[points.length - 1]].forEach((point, index) => {
    if (!point) return;
    out.push({ kind: "dot", key: `arc-tap-${index}`, role: "path", at: point, radius: 3.4 });
  });
}

/**
 * The sweep goes out and back within one loop: the leg has to return the way it
 * came, so a sawtooth would teleport it home each cycle.
 */
function sweepAt(rig: SpatialRig, phase: number): number {
  const wrapped = ((phase % 1) + 1) % 1;
  const triangle = wrapped < 0.5 ? wrapped * 2 : 2 - wrapped * 2;
  return rig.sweepFrom + (rig.sweepTo - rig.sweepFrom) * triangle;
}

export function buildSpatialFrame(rig: SpatialRig, phase: number): Shape[] {
  const sweep = sweepAt(rig, phase);
  const out: Shape[] = [];
  const { length, hipHeight, shoulderHeight, thigh, shin } = rig.body;
  const t = (v: Vec3): Vec3 => turn(rig, v);

  const hip = t([-length / 2, hipHeight, HIP_DEPTH]);
  const shoulder = t([length / 2, shoulderHeight, HIP_DEPTH]);
  const head = t([length / 2 + 20, shoulderHeight + 4, HIP_DEPTH]);
  const handNear = t([length / 2 + 4, 0, HIP_DEPTH - 12]);
  const handFar = t([length / 2 + 2, 0, HIP_DEPTH + 12]);
  const kneeSupport = t([-length / 2 - 2, hipHeight * 0.45, HIP_DEPTH + 10]);
  const footSupport = t([-length / 2 - 16, 0, HIP_DEPTH + 14]);

  const tilt = rig.legTilt * DEGREES;
  const phi = sweep * DEGREES;
  const direction: Vec3 = [
    -Math.cos(tilt),
    Math.sin(tilt) * Math.cos(phi),
    Math.sin(tilt) * Math.sin(phi)
  ];
  const knee = t([
    -length / 2 + direction[0] * thigh,
    Math.max(0, hipHeight + direction[1] * thigh) + 2,
    HIP_DEPTH + direction[2] * thigh
  ]);
  const foot = footAt(rig, sweep);
  void shin;

  pushMat(out, rig);
  if (rig.arc !== false) pushArc(out, rig);
  // Far side first, so depth reads.
  out.push(limb(rig, "arm-far", "far", [shoulder, handFar], 0.85));
  out.push(limb(rig, "leg-far", "far", [hip, kneeSupport, footSupport], 0.95));
  out.push(limb(rig, "torso", "near", [hip, shoulder], 1.7));
  out.push(limb(rig, "arm-near", "near", [shoulder, handNear], 1));
  out.push(limb(rig, "leg-work", "focus", [hip, knee, foot], 1.05));

  const projectedHead = project(rig, head);
  out.push({
    kind: "dot",
    key: "head",
    role: "near",
    at: projectedHead.point,
    radius: 12 * projectedHead.scale
  });
  return out;
}
