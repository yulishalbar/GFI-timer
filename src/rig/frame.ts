import { buildSpatialFrame, type SpatialRig } from "./spatial";
import {
  loopStops,
  poseAtPhase,
  project,
  solvePose,
  type JointId,
  type Joints,
  type LoopMode,
  type Point,
  type Pose
} from "./skeleton";

/**
 * Shapes carry a role rather than a colour so the guide is painted from the
 * app's own tokens and follows the palette instead of shipping its own.
 */
export type ShapeRole =
  | "ground"
  /** The mat's own lines, a step lighter than the mat so they are visible. */
  | "mat"
  | "path"
  | "ghost"
  | "outline"
  | "near"
  | "far"
  | "focus"
  | "equipment";

export type Shape =
  | { kind: "line"; key: string; role: ShapeRole; from: Point; to: Point; width: number }
  | { kind: "dot"; key: string; role: ShapeRole; at: Point; radius: number }
  | { kind: "disc"; key: string; role: ShapeRole; at: Point; rx: number; ry: number }
  | { kind: "polyline"; key: string; role: ShapeRole; points: readonly Point[]; width: number; dashed?: boolean }
  | { kind: "polygon"; key: string; role: ShapeRole; points: readonly Point[]; width: number }
  | { kind: "area"; key: string; role: ShapeRole; d: string; width: number }
  | { kind: "curve"; key: string; role: ShapeRole; from: Point; control: Point; to: Point; width: number };

export type LimbId = "armNear" | "armFar" | "legNear" | "legFar";

/**
 * Where the camera is, which a facing angle alone cannot say.
 *
 * The same facing angle means "seen from the side" on a crunch and "seen from
 * the front" on a side-lying leg lift, so the head has to be drawn differently
 * for each even though the pose data is the same shape. From above it depends
 * on which way up the body is: face up you see a face, face down you see the
 * back of a head and no face at all.
 */
export type RigView = "profile" | "lying" | "front" | "overheadUp" | "overheadDown";

interface ViewStyle {
  headR: number;
  headOval: number;
  headTilt: number;
  hairFull: boolean;
  hairFront: number;
  hairBack: number;
  hairCrown: number;
  hairJaw: number;
  hairInner: number;
  hairStrands: number;
  hairTilt: number;
  eyeR: number;
  eyeOut: number;
  eyeUp: number;
  eyeSpread: number;
  noseLen: number;
  noseBulge: number;
  mouthW: number;
  mouthDrop: number;
  mouthCurve: number;
  ink: number;
  bustArcs: boolean;
  bust: number;
  bustAt: number;
  bustDrop: number;
  waist: number;
  hips: number;
  shoulders: number;
  matLines: number;
  matInset: number;
}

/**
 * Tuned per camera in `scripts/figure-tuner.mjs`, which renders these numbers
 * live against sample poses. Change them there, not here, and paste the result
 * back - the tuner is the only way to judge a face at the size it renders.
 */
const VIEW_STYLE: Readonly<Record<RigView, ViewStyle>> = {
  profile: {
    headR: 11.5, headOval: 1.18, headTilt: 0,
    hairFull: false, hairFront: -26, hairBack: 150, hairCrown: 1.26, hairJaw: 1.68,
    hairInner: 0.92, hairStrands: 6, hairTilt: 0,
    eyeR: 2.1, eyeOut: 0.38, eyeUp: 3.6, eyeSpread: 0.64,
    noseLen: 3.8, noseBulge: 2.2, mouthW: 0.46, mouthDrop: 6.8, mouthCurve: 2.4, ink: 1.7,
    bustArcs: false, bust: 2.95, bustAt: 0.35, bustDrop: 0.14,
    waist: 0.4, hips: 1.1, shoulders: 0.72,
    matLines: 6, matInset: 0.08
  },
  lying: {
    headR: 11.5, headOval: 1.18, headTilt: -14,
    hairFull: false, hairFront: -44, hairBack: 142, hairCrown: 1.02, hairJaw: 1.72,
    hairInner: 0.92, hairStrands: 0, hairTilt: 46,
    eyeR: 1.6, eyeOut: 0.3, eyeUp: 2.6, eyeSpread: 0.32,
    noseLen: 3.4, noseBulge: 2.2, mouthW: 0.46, mouthDrop: 5.6, mouthCurve: 3, ink: 1.7,
    bustArcs: true, bust: 1.75, bustAt: 0.19, bustDrop: 0.11,
    waist: 0.62, hips: 1.16, shoulders: 0.9,
    matLines: 7, matInset: 0.08
  },
  front: {
    headR: 11.5, headOval: 1.18, headTilt: 0,
    hairFull: false, hairFront: -52, hairBack: 150, hairCrown: 1.14, hairJaw: 1.68,
    hairInner: 0.92, hairStrands: 0, hairTilt: 0,
    eyeR: 2.5, eyeOut: 0.3, eyeUp: 2.6, eyeSpread: 0.38,
    noseLen: 3.4, noseBulge: 4, mouthW: 0.52, mouthDrop: 6.4, mouthCurve: 3, ink: 1.6,
    bustArcs: false, bust: 1.15, bustAt: 0.11, bustDrop: 0.12,
    waist: 0.78, hips: 1.06, shoulders: 0.88,
    matLines: 7, matInset: 0.08
  },
  overheadUp: {
    headR: 11.5, headOval: 1.18, headTilt: 0,
    hairFull: false, hairFront: -40, hairBack: 150, hairCrown: 1.35, hairJaw: 1.5,
    hairInner: 0.92, hairStrands: 3, hairTilt: 0,
    eyeR: 1.9, eyeOut: 0.3, eyeUp: 2.6, eyeSpread: 0.38,
    noseLen: 4, noseBulge: 3.2, mouthW: 0.48, mouthDrop: 6.4, mouthCurve: 3, ink: 1.6,
    bustArcs: false, bust: 1.9, bustAt: 0.13, bustDrop: 0.1,
    waist: 0.7, hips: 1.08, shoulders: 1,
    matLines: 14, matInset: 0.07
  },
  overheadDown: {
    headR: 11.5, headOval: 1.18, headTilt: 0,
    hairFull: true, hairFront: 10, hairBack: 150, hairCrown: 1.4, hairJaw: 1.76,
    hairInner: 0.94, hairStrands: 0, hairTilt: 0,
    eyeR: 3, eyeOut: 0.3, eyeUp: 2.6, eyeSpread: 0.38,
    noseLen: 4, noseBulge: 3.2, mouthW: 0.48, mouthDrop: 6.4, mouthCurve: 1.6, ink: 1.6,
    bustArcs: false, bust: 1.25, bustAt: 0.18, bustDrop: 0.12,
    waist: 0.7, hips: 1.64, shoulders: 1.46,
    matLines: 14, matInset: 0.08
  }
};

const isOverhead = (view: RigView): boolean => view === "overheadUp" || view === "overheadDown";

export type Equipment =
  | { type: "disc"; at: JointId }
  | { type: "band"; from: JointId; to: JointId; sag?: number };

export interface RigDefinition {
  /** Human-readable movement name, used for the accessible label. */
  title: string;
  /** SVG viewBox. Keep the aspect at 16:9 so every guide fills the same surface. */
  box: string;
  /** Milliseconds for one loop. Zero marks a static hold. */
  tempoMs: number;
  loop: LoopMode;
  /** Limbs painted in the accent colour: what the viewer should watch. */
  focus?: readonly LimbId[];
  /** Joint whose travel is drawn as the motion path. */
  trace?: JointId;
  /** Where the camera is. Defaults to a side view, which most poses are. */
  view?: RigView;
  ground?: boolean;
  groundY?: number;
  /**
   * Fraction of the loop parked at the far end of the travel, for a movement
   * that is a hold rather than a rep. Without it a two-pose loop turns straight
   * around and reads as a pulse, which is a different exercise.
   */
  hold?: number;
  /** Onion-skin of the start pose. Defaults to on for anything that moves. */
  ghost?: boolean;
  equipment?: readonly Equipment[];
  /**
   * Pose data in the picture plane. Present on every rig except the spatial
   * ones, which are solved in floor coordinates instead.
   */
  poses?: readonly [Pose, ...Pose[]];
  /**
   * Solved in the space the exercise happens in rather than in the picture
   * plane. For movements whose travel is lateral, which a flat figure can only
   * imply. Exactly one of `poses` and `spatial` is set.
   */
  spatial?: SpatialRig;
}

const BODY_WIDTH = 11;
const OUTLINE_WIDTH = 5;
const TRACE_SAMPLES = 72;

const format = ([x, y]: Point): string => `${x.toFixed(1)} ${y.toFixed(1)}`;
const DEGREES = Math.PI / 180;

const LIMB_JOINTS: Record<LimbId, readonly [JointId, JointId, JointId, JointId]> = {
  armNear: ["shoulderNear", "elbowNear", "wristNear", "handNear"],
  armFar: ["shoulderFar", "elbowFar", "wristFar", "handFar"],
  legNear: ["hipNear", "kneeNear", "ankleNear", "toeNear"],
  legFar: ["hipFar", "kneeFar", "ankleFar", "toeFar"]
};

const LIMB_WIDTHS: Record<LimbId, readonly [number, number, number]> = {
  armNear: [BODY_WIDTH * 0.82, BODY_WIDTH * 0.74, BODY_WIDTH * 0.5],
  armFar: [BODY_WIDTH * 0.7, BODY_WIDTH * 0.62, BODY_WIDTH * 0.42],
  legNear: [BODY_WIDTH, BODY_WIDTH * 0.88, BODY_WIDTH * 0.6],
  legFar: [BODY_WIDTH * 0.8, BODY_WIDTH * 0.7, BODY_WIDTH * 0.48]
};

function limbRole(rig: RigDefinition, limb: LimbId, ghost: boolean): ShapeRole {
  if (ghost) return "ghost";
  if (rig.focus?.includes(limb)) return "focus";
  return limb.endsWith("Far") ? "far" : "near";
}

function pushLimb(out: Shape[], joints: Joints, rig: RigDefinition, limb: LimbId, ghost: boolean): void {
  const prefix = ghost ? "ghost-" : "";
  const ids = LIMB_JOINTS[limb];
  const widths = LIMB_WIDTHS[limb];
  const points = ids.map((id) => joints[id]);
  const role = limbRole(rig, limb, ghost);

  // Outline first for the whole limb, so overlapping parts stay separable
  // instead of merging into one silhouette.
  if (!ghost) {
    for (let i = 0; i < 3; i += 1) {
      out.push({
        kind: "line",
        key: `${prefix}${limb}-outline-${i}`,
        role: "outline",
        from: points[i] as Point,
        to: points[i + 1] as Point,
        width: (widths[i] as number) + OUTLINE_WIDTH
      });
    }
  }
  for (let i = 0; i < 3; i += 1) {
    out.push({
      kind: "line",
      key: `${prefix}${limb}-${i}`,
      role,
      from: points[i] as Point,
      to: points[i + 1] as Point,
      width: widths[i] as number
    });
  }
  out.push({
    kind: "dot",
    key: `${prefix}${limb}-joint`,
    role,
    at: points[1] as Point,
    radius: widths[0] * 0.3
  });
}

const midpoint = (a: Point, b: Point): Point => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const norm = (deg: number): number => ((deg % 360) + 360) % 360;
const angleGap = (a: number, b: number): number => Math.abs(((norm(a - b) + 180) % 360) - 180);

/** A quadratic through two points, bowed by `bulge` along `dir`. */
function bow(from: Point, to: Point, dir: number, bulge: number): { from: Point; control: Point; to: Point } {
  return { from, control: project(midpoint(from, to), dir, bulge), to };
}

/**
 * The head's own axes: `down` runs toward the chin, `right` across the face.
 *
 * In profile they come from the pose's facing angle, with the chin on whichever
 * side of it the shoulder lies. In every other camera the face is upright on
 * the body, so they come from the spine instead — which is what lets a
 * side-lying body and a body seen from above carry different faces despite
 * having the same facing angle.
 */
function headFrame(joints: Joints, pose: Pose, view: RigView, tilt: number, chinSign: number) {
  if (view === "profile" && pose.facing !== undefined) {
    const chin = pose.facing + chinSign * 90 + tilt;
    return { right: pose.facing + tilt, down: chin, profile: true };
  }
  const down = (pose.head ?? pose.spine) + 180 + tilt;
  return { right: down - 90, down, profile: false };
}

/**
 * Which side of the facing line the chin is on, solved once from the rig's
 * first pose rather than per frame.
 *
 * It is the side the shoulder lies on, and in a pose that rotates far enough -
 * rolling down from seated to lying - the shoulder crosses that line mid-loop.
 * Recomputing every frame flips the whole face to the other side of the head
 * when it does.
 */
function chinSideOf(pose: Pose): number {
  if (pose.facing === undefined) return 1;
  const joints = solvePose(pose);
  const toShoulder: Point = [joints.shoulder[0] - joints.head[0], joints.shoulder[1] - joints.head[1]];
  const cross =
    Math.cos(pose.facing * DEGREES) * toShoulder[1] - Math.sin(pose.facing * DEGREES) * toShoulder[0];
  return cross >= 0 ? 1 : -1;
}

/**
 * Which torso edge is the front, read from the facing angle rather than
 * assumed. A plank and a supine pose share a spine angle and have opposite
 * fronts, so hardcoding a side puts the chest through the floor on every plank.
 */
function frontSide(pose: Pose): number {
  if (pose.facing === undefined) return pose.spine + 90;
  return angleGap(pose.spine - 90, pose.facing) < angleGap(pose.spine + 90, pose.facing)
    ? pose.spine - 90
    : pose.spine + 90;
}

/**
 * The torso is a tapered band from hip to shoulder carrying a chest, a waist
 * and hips. Its half-width is the pose's spread or the body's own thickness,
 * whichever is larger, so a side view and a front view are the same shape at
 * different widths and nothing pops as one interpolates into the other.
 *
 * Seen head-on or from above both long edges carry the same curve, so the body
 * is symmetric. In profile only the front edge does.
 */
function pushTorso(out: Shape[], joints: Joints, pose: Pose, view: RigView, ghost: boolean): void {
  const style = VIEW_STYLE[view];
  const prefix = ghost ? "ghost-" : "";
  const torsoRole: ShapeRole = ghost ? "ghost" : "near";
  const neckWidth = BODY_WIDTH * 0.75;
  const minHalf = (BODY_WIDTH * 1.55) / 2;
  const symmetric = view !== "profile";
  const front = frontSide(pose);
  const back = front === pose.spine - 90 ? pose.spine + 90 : pose.spine - 90;

  const sh = Math.max(pose.shoulderSpread ?? 0, minHalf) * style.shoulders;
  const hp = Math.max(pose.hipSpread ?? 0, minHalf) * style.hips;
  const waist = minHalf * style.waist;
  const bust = sh * style.bust;
  const curve = pose.spineBow ?? 0;
  const corner = BODY_WIDTH * 0.4;
  const along = (t: number): Point => [
    joints.shoulder[0] + (joints.hip[0] - joints.shoulder[0]) * t,
    joints.shoulder[1] + (joints.hip[1] - joints.shoulder[1]) * t
  ];
  const edge = (dir: number): string =>
    `Q${format(project(along(style.bustAt), dir, bust))} ${format(project(along(0.44), dir, sh * 0.72))}` +
    `Q${format(project(project(along(0.62), dir, waist), back, curve))} ${format(project(joints.hip, dir, hp))}`;

  const d =
    `M${format(project(joints.shoulder, back, sh))}L${format(project(joints.shoulder, front, sh * 0.94))}` +
    edge(front) +
    `L${format(project(joints.hip, back, hp))}` +
    (symmetric
      ? `Q${format(project(project(along(0.62), back, waist), back, curve))} ${format(project(along(0.44), back, sh * 0.72))}` +
        `Q${format(project(along(style.bustAt), back, bust))} ${format(project(joints.shoulder, back, sh))}`
      : `Q${format(project(project(along(0.5), back, sh), back, curve))} ${format(project(joints.shoulder, back, sh))}`) +
    "Z";

  if (!ghost) {
    out.push({ kind: "area", key: `${prefix}torso-outline`, role: "outline", d, width: corner + OUTLINE_WIDTH });
  }
  out.push({ kind: "area", key: `${prefix}torso`, role: torsoRole, d, width: corner });

  if (!ghost) {
    out.push({
      kind: "line",
      key: `${prefix}neck-outline`,
      role: "outline",
      from: joints.shoulder,
      to: joints.head,
      width: neckWidth + OUTLINE_WIDTH
    });
  }
  out.push({ kind: "line", key: `${prefix}neck`, role: torsoRole, from: joints.shoulder, to: joints.head, width: neckWidth });

  // Drawn on the body rather than bulged out of it. Across the body is
  // perpendicular to the spine; offsetting along it stacks the arcs head to toe
  // and they read as a garment.
  if (style.bustArcs && !ghost) {
    const centre = along(style.bustAt + style.bustDrop);
    if (view === "lying") {
      // Lying on your side it hangs toward the mat: straight down the screen,
      // not along the body. Spanning and bowing the same way flattens the
      // quadratic into a line.
      const at = project(centre, front, sh * 0.1);
      out.push({
        kind: "curve",
        key: "bust",
        role: "outline",
        ...bow(project(at, pose.spine, -sh * 0.5), project(at, pose.spine, sh * 0.62), 90, sh * 0.85),
        width: style.ink
      });
    } else {
      const span = symmetric ? sh * 0.78 : sh * 0.5;
      const axis = symmetric ? front : pose.spine;
      const at = symmetric ? centre : project(centre, front, sh * 0.3);
      out.push({
        kind: "curve",
        key: "bust",
        role: "outline",
        ...bow(
          project(at, axis, -span),
          project(at, axis, span),
          symmetric ? pose.spine + 180 : front,
          symmetric ? sh * 0.5 : sh * 0.62
        ),
        width: style.ink
      });
    }
  }
}

/**
 * Drawn after the limbs. Hands behind the head is a real position — a curl is
 * held that way — and with the head underneath, the forearm crosses the face
 * and hides the one thing that says which way the body is turned.
 */
function pushHead(out: Shape[], joints: Joints, pose: Pose, view: RigView, chinSign: number, ghost: boolean): void {
  const style = VIEW_STYLE[view];
  const role: ShapeRole = ghost ? "ghost" : "near";
  const prefix = ghost ? "ghost-" : "";
  const { right, down, profile } = headFrame(joints, pose, view, style.headTilt, chinSign);
  const R = style.headR;
  // The head is an oval, longer down the face than across it.
  const at = (x: number, y: number): Point =>
    project(project(joints.head, right, x), down, y * style.headOval);
  const rim = (deg: number, scale: number): Point =>
    at(R * scale * Math.cos(deg * DEGREES), R * scale * Math.sin(deg * DEGREES));

  const skull = (radius: number, shapeRole: ShapeRole, key: string): Shape => ({
    kind: "polygon",
    key,
    role: shapeRole,
    points: Array.from({ length: 24 }, (_, i) => rim((i / 24) * 360, radius / R)),
    width: 0
  });

  // Face down from above you see the back of a head: hair all the way across,
  // no face at all. Nothing a drawing can do says "turned away" more plainly.
  if (style.hairFull) {
    if (!ghost) out.push(skull(R + OUTLINE_WIDTH / 2, "outline", `${prefix}head-outline`));
    out.push(skull(R * style.hairCrown, ghost ? "ghost" : "far", `${prefix}hair`));
    return;
  }

  // A carré bob: from behind the brow, over the crown, squared off below the
  // jaw. Head-on it is the same sweep mirrored, so it frames both sides. The
  // ring is walked out along the hairline and back along the scalp, and the two
  // have to be the same sweep reversed or it crosses itself and the fill
  // cancels out.
  const steps = 9;
  const angles: number[] = [];
  for (let i = 0; i < steps; i += 1) {
    const t = i / (steps - 1);
    if (profile) {
      angles.push(style.hairFront - (style.hairFront - (style.hairBack - 360)) * t);
    } else {
      const a1 = 360 + (180 - style.hairBack);
      angles.push(style.hairBack + (a1 - style.hairBack) * t);
    }
  }
  const thickness = (i: number): number => {
    const t = i / (steps - 1);
    // Thin at the crown and thick at the jaw ends; head-on both ends are ends.
    const edgeness = profile ? t : Math.abs(t - 0.5) * 2;
    return style.hairCrown + (style.hairJaw - style.hairCrown) * edgeness;
  };
  // Lying on your side gravity pulls the hair across the body toward the mat.
  // From above it splays evenly. That is what separates two cameras that are
  // otherwise both a body seen from the front, lying along the page.
  const drape = (point: Point, i: number): Point =>
    style.hairTilt === 0
      ? point
      : project(point, 90, Math.sin((i / (steps - 1)) * Math.PI) * (style.hairTilt / 90) * R * 0.9);
  const hair = [
    ...angles.map((a, i) => drape(rim(a, thickness(i)), i)),
    ...[...angles].reverse().map((a) => rim(a, style.hairInner))
  ];

  if (!ghost) {
    out.push({ kind: "polygon", key: `${prefix}hair-outline`, role: "outline", points: hair, width: OUTLINE_WIDTH });
    out.push(skull(R + OUTLINE_WIDTH / 2, "outline", `${prefix}head-outline`));
  }
  out.push({ kind: "polygon", key: `${prefix}hair-back`, role: ghost ? "ghost" : "far", points: hair, width: 0 });
  out.push(skull(R, role, `${prefix}head`));
  // Hair sits on top of the skull, not behind it, so the crown stays covered.
  out.push({ kind: "polygon", key: `${prefix}hair`, role: ghost ? "ghost" : "far", points: hair, width: 0 });

  // Strand lines across the hair mass, as in a sketch.
  if (!ghost) {
    for (let i = 1; i <= style.hairStrands; i += 1) {
      const index = Math.round((i / (style.hairStrands + 1)) * (steps - 1));
      const angle = angles[index] as number;
      out.push({
        kind: "line",
        key: `hair-strand-${i}`,
        role: "outline",
        from: rim(angle, style.hairInner + 0.04),
        to: rim(angle, thickness(index) - 0.05),
        width: 0.9
      });
    }
  }

  // The ghost is an onion-skin of the start pose. Marks on it would read as a
  // second face at half opacity, so it keeps the silhouette and nothing else.
  if (ghost) return;

  const mark = (key: string, shape: { from: Point; control: Point; to: Point }, weight = style.ink): void => {
    out.push({ kind: "curve", key, role: "ground", ...shape, width: weight });
  };
  // An almond: two arcs meeting at the corners, one bowing up and one down. A
  // single arc reads as a stray mark - it needs the pair to close into an eye.
  const eye = (key: string, centre: Point): void => {
    const half = style.eyeR * 0.95;
    const a = project(centre, right, -half);
    const b = project(centre, right, half);
    mark(`${key}-top`, bow(a, b, down, -style.eyeR * 0.62));
    mark(`${key}-bottom`, bow(a, b, down, style.eyeR * 0.62));
  };

  if (profile) {
    // Two eyes, crowded toward the front of the head. Where the pair sits, not
    // how many there are, is what says the face is turned side-on.
    eye("eye-near", at(R * (style.eyeOut + style.eyeSpread / 2), -style.eyeUp));
    eye("eye-far", at(R * (style.eyeOut - style.eyeSpread / 2), -style.eyeUp));
    if (style.noseLen > 0) {
      mark(
        "nose",
        bow(at(R * (style.eyeOut + 0.32), -0.6), at(R * (style.eyeOut + 0.4), style.noseLen), right, style.noseBulge)
      );
      out.push({
        kind: "line",
        key: "nose-base",
        role: "ground",
        from: at(R * (style.eyeOut + 0.4), style.noseLen),
        to: at(R * (style.eyeOut + 0.08), style.noseLen + 0.6),
        width: style.ink * 0.9
      });
    }
    mark(
      "mouth",
      bow(
        at(R * (style.eyeOut - 0.12), style.mouthDrop),
        at(R * (style.eyeOut + style.mouthW), style.mouthDrop - 0.4),
        down,
        style.mouthCurve
      )
    );
    return;
  }

  eye("eye-left", at(-R * style.eyeSpread, -style.eyeUp));
  eye("eye-right", at(R * style.eyeSpread, -style.eyeUp));
  if (style.noseLen > 0) {
    mark("nose", bow(at(-R * 0.1, 0.4), at(R * 0.1, style.noseLen * 0.6), right, style.noseBulge * 0.5));
  }
  mark(
    "mouth",
    bow(at(-R * style.mouthW, style.mouthDrop), at(R * style.mouthW, style.mouthDrop), down, style.mouthCurve)
  );
}

/**
 * An overhead view has no ground line, so nothing says the body is on the floor
 * at all. A mat under it is the missing half, and the lines are what give it
 * enough contrast to register at thumbnail size.
 */
function pushMat(out: Shape[], rig: RigDefinition, view: RigView): void {
  const style = VIEW_STYLE[view];
  const [bx, by, bw, bh] = rig.box.split(" ").map(Number) as [number, number, number, number];
  const x = bx + bw * style.matInset;
  const y = by + bh * (style.matInset + 0.12);
  const w = bw * (1 - style.matInset * 2);
  const h = bh * (1 - (style.matInset + 0.12) * 2);
  out.push({
    kind: "polygon",
    key: "mat",
    role: "ground",
    points: [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h]
    ],
    width: 9
  });
  for (let i = 1; i <= style.matLines; i += 1) {
    const lx = x + (w * i) / (style.matLines + 1);
    out.push({
      kind: "line",
      key: `mat-line-${i}`,
      role: "mat",
      from: [lx, y + 5],
      to: [lx, y + h - 5],
      width: 1
    });
  }
}

/** Painting order is far side, torso, near side, so depth reads correctly. */
function pushFigure(out: Shape[], joints: Joints, pose: Pose, rig: RigDefinition, ghost: boolean): void {
  const view = rig.view ?? "profile";
  pushLimb(out, joints, rig, "armFar", ghost);
  pushLimb(out, joints, rig, "legFar", ghost);
  pushTorso(out, joints, pose, view, ghost);
  pushLimb(out, joints, rig, "legNear", ghost);
  pushLimb(out, joints, rig, "armNear", ghost);
  pushHead(out, joints, pose, view, chinSideOf(posesOf(rig)[0]), ghost);
}

function pushEquipment(out: Shape[], joints: Joints, rig: RigDefinition): void {
  rig.equipment?.forEach((item, index) => {
    if (item.type === "disc") {
      const at = joints[item.at];
      out.push({
        kind: "disc",
        key: `equipment-${index}`,
        role: "equipment",
        at: [at[0], at[1] + 4],
        rx: 13,
        ry: 4.5
      });
      return;
    }
    const from = joints[item.from];
    const to = joints[item.to];
    out.push({
      kind: "curve",
      key: `equipment-${index}`,
      role: "equipment",
      from,
      to,
      control: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 + (item.sag ?? 8)],
      width: 5
    });
  });
}

/**
 * The motion path is sampled from the same pose data that moves the figure, so
 * it is a readout of the movement rather than a second, hand-drawn account of
 * it. Depends only on the poses, so callers can cache it per rig.
 */
export function tracePoints(rig: RigDefinition, joint: JointId, samples = TRACE_SAMPLES): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= samples; i += 1) {
    points.push(solvePose(poseAtPhase(posesOf(rig), rig.loop, i / samples))[joint]);
  }
  return points;
}

function arrowHead(points: readonly Point[], phase: number): Point[] {
  const last = points.length - 1;
  const index = Math.min(Math.floor(((phase % 1) + 1) % 1 * last), last);
  const here = points[index] as Point;
  const ahead = points[Math.min(index + 3, last)] as Point;
  const angle = (Math.atan2(ahead[1] - here[1], ahead[0] - here[0]) * 180) / Math.PI;
  const tip = project(here, angle, 9);
  return [project(tip, angle + 145, 9), tip, project(tip, angle - 145, 9)];
}

/**
 * Pose data for the flat path. Every caller below has already ruled out the
 * spatial path, which carries no poses at all.
 */
function posesOf(rig: RigDefinition): readonly [Pose, ...Pose[]] {
  if (!rig.poses) throw new Error(`Rig "${rig.title}" has neither poses nor a spatial definition`);
  return rig.poses;
}

export function hasMotion(rig: RigDefinition): boolean {
  if (rig.tempoMs <= 0) return false;
  // A spatial rig's travel is the sweep, which is always a real movement.
  if (rig.spatial) return true;
  return loopStops(posesOf(rig), rig.loop).length > 2;
}

/**
 * Parks the loop at its far end for `hold` of its duration.
 *
 * A ping-pong reaches the position and immediately turns around, so a hold and
 * a pulse animate identically. Dwelling at the top is the difference, and the
 * travel either side is compressed into what is left.
 */
function holdPhase(phase: number, hold: number): number {
  if (hold <= 0) return phase;
  const half = Math.min(hold, 0.9) / 2;
  const ramp = 0.5 - half;
  if (phase < ramp) return (phase / ramp) * 0.5;
  if (phase > 0.5 + half) return 0.5 + ((phase - 0.5 - half) / ramp) * 0.5;
  return 0.5;
}

/** Everything needed to paint one frame, as plain geometry. */
export function buildFrame(rig: RigDefinition, phase: number, tracedPath?: readonly Point[]): Shape[] {
  if (rig.spatial) return buildSpatialFrame(rig.spatial, holdPhase(phase, rig.hold ?? 0), rig.loop);

  const shapes: Shape[] = [];
  const moving = hasMotion(rig);
  const view = rig.view ?? "profile";

  if (isOverhead(view)) pushMat(shapes, rig, view);

  if (rig.ground !== false) {
    shapes.push({
      kind: "line",
      key: "ground",
      role: "ground",
      from: [20, rig.groundY ?? 170],
      to: [280, rig.groundY ?? 170],
      width: 6
    });
  }

  if (rig.trace && moving) {
    const path = tracedPath ?? tracePoints(rig, rig.trace);
    shapes.push({ kind: "polyline", key: "trace", role: "path", points: path, width: 2.5, dashed: true });
    shapes.push({ kind: "polyline", key: "trace-arrow", role: "path", points: arrowHead(path, phase), width: 3 });
  }

  if (rig.ghost !== false && moving) {
    const startPose = posesOf(rig)[0];
    pushFigure(shapes, solvePose(startPose), startPose, rig, true);
  }

  const pose = poseAtPhase(posesOf(rig), rig.loop, holdPhase(phase, rig.hold ?? 0));
  const joints = solvePose(pose);
  pushFigure(shapes, joints, pose, rig, false);
  pushEquipment(shapes, joints, rig);
  return shapes;
}
