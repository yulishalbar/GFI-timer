import type { RigDefinition } from "./frame";
import type { SpatialLeg, SpatialRig } from "./spatial";
import type { Chain, Point, Pose } from "./skeleton";

/**
 * Pose data for the catalog. An exercise is roughly forty numbers, so these
 * diff in review the way code does and a movement is never approximated by
 * another movement's artwork.
 *
 * Shared framing. All boxes are 16:9 so every guide fills the same surface.
 */
const FLOOR_BOX = "32 60 256 144";
const OVERHEAD_BOX = "32 30 256 144";
const STANDING_BOX = "-8 26 320 180";
/** Kneeling poses sit low and wide; this crops in on them. */
const KNEELING_BOX = "70 96 208 117";

/** High plank, facing left, hands under the shoulders. */
const PLANK: Pose = {
  hip: [172, 125],
  spine: 190,
  head: 175,
  facing: 145,
  armNear: [88, 4, 88],
  armFar: [85, 6, 90],
  legNear: [28, 0, 32],
  legFar: [26, 2, 32]
};

const PLANK_LEG_BACK: Chain = [28, 0, 32];
const PLANK_KNEE_IN: Chain = [168, -73, -75];

const plank = (over: Partial<Pose>): Pose => ({ ...PLANK, ...over });

/** Tabletop: knees and hands down, shoulders stacked over the wrists. */
const QUADRUPED: Pose = {
  hip: [180, 131],
  spine: 196,
  head: 200,
  spineScale: 1.04,
  facing: 140,
  armNear: [90, 0, 90],
  armFar: [92, 0, 88],
  legNear: [90, -90, 0],
  legFar: [92, -92, 0]
};

const quad = (over: Partial<Pose>): Pose => ({ ...QUADRUPED, ...over });

/**
 * Tabletop seen three quarters from behind, which is how the lateral quadruped
 * work is actually filmed, solved in floor coordinates rather than as screen
 * angles.
 *
 * This is where a flat figure genuinely fails. Side-on, a leg travelling across
 * the mat collapses into a vertical line; from directly above, the height that
 * makes the pose a tabletop rather than someone lying face down is invisible,
 * because that camera has no axis for it. Here the mat recedes and the
 * supporting limbs stand as columns, so the pose reads before the movement does.
 *
 * Every quadruped rig shares this camera and body and differs only in what the
 * working leg does, so the family reads as one athlete. Tuned in
 * `scripts/rig-3d-prototype.mjs`.
 */
const QUADRUPED_SPACE: Omit<SpatialRig, "leg" | "trace"> = {
  camera: { focal: 380, horizon: 43, base: 154, lift: 1.15 },
  mat: { width: 228, near: -46, far: 162, lines: 12 },
  body: {
    turn: -22,
    length: 52,
    hipHeight: 36,
    shoulderHeight: 38,
    thigh: 33,
    shin: 33,
    limbWidth: 9.5
  },
};

/**
 * High plank on the hands and the toes, in the same floor coordinates as the
 * tabletop.
 *
 * The slider work is the other half of what the overhead camera could not draw.
 * From above, a body held in a plank and a body lying face down on the mat
 * project to the same silhouette: the whole difference between them is vertical,
 * and that camera has no vertical axis. Here the arms stand as columns under the
 * shoulders and the body runs in one line from them back to the toes, so the
 * plank is visible before the leg has moved at all.
 *
 * Drawn nearer than the tabletop, and the camera lower. A tabletop fills the
 * frame because its working leg swings overhead; a plank never leaves the floor,
 * so at the tabletop's distance the whole movement sat in the bottom third with
 * the frame empty above it. The mat runs further toward the viewer for the same
 * reason: a foot sliding out to the side crosses ground the kneeling work never
 * touches.
 */
const PLANK_SCALE = 1.25;
const PLANK_BODY = {
  turn: 20,
  // A plank runs a leg's length behind the hip and only a torso in front of it,
  // so measured from the hip it sits far to the left of the mat. Slid back along
  // itself, it is centred.
  shift: 40,
  length: 52 * PLANK_SCALE,
  // Low enough that the shoulder, the hip and the toes fall on one line, which
  // is the difference between a plank and a tabletop. Set higher, the figure
  // reads as the quadruped it is not.
  hipHeight: 22 * PLANK_SCALE,
  shoulderHeight: 40 * PLANK_SCALE,
  thigh: 33 * PLANK_SCALE,
  shin: 33 * PLANK_SCALE,
  limbWidth: 9.5 * PLANK_SCALE
};

const PLANK_SPACE: Omit<SpatialRig, "leg" | "trace"> = {
  camera: { focal: 380, horizon: 43, base: 134, lift: 1.35 },
  mat: { width: 230, near: -95, far: 162, lines: 12 },
  support: "plank",
  slider: true,
  body: PLANK_BODY
};

const DEGREES = Math.PI / 180;
const PLANK_LEG = PLANK_BODY.thigh + PLANK_BODY.shin;
/** How far behind the hip a straight leg's foot lands with the toes on the mat. */
const PLANK_FOOT_REACH = Math.sqrt(PLANK_LEG ** 2 - PLANK_BODY.hipHeight ** 2);
/** The feet start hip width apart, which is where the working leg slides from. */
const PLANK_HOME = -11;

/**
 * A leg position with the foot flat on the mat, stated as where the foot is
 * rather than as the angles that put it there.
 *
 * On a slider the foot never leaves the floor, and that pins the leg: for a
 * point on the mat there is exactly one direction and one length that put a
 * straight leg's foot on it. `azimuth` is the direction, measured on the floor
 * from straight back along the body, negative toward the viewer's side; `out` is
 * how far along it the foot sits, one being the full stretch of the leg.
 *
 * Under one the foot is inside the circle the straight leg traces, which is the
 * only way it comes in toward the chest with the hips where a plank holds them.
 * A real body finds that room by tipping the pelvis. This one gives up a little
 * of the leg's drawn length instead, which is the smaller lie: the alternative
 * is aiming the leg through the mat, and what comes back from that is a bent
 * knee, which is a different exercise.
 */
const slide = (azimuth: number, out = 1): SpatialLeg => {
  const along = PLANK_FOOT_REACH * out;
  const span = Math.hypot(along, PLANK_BODY.hipHeight);
  const sweep = Math.atan2((Math.sin(azimuth * DEGREES) * along) / span, -PLANK_BODY.hipHeight / span);
  return {
    tilt: Math.acos((Math.cos(azimuth * DEGREES) * along) / span) / DEGREES,
    // Every position here is near the bottom of the sweep, where the branch cut
    // of the arc tangent falls: straight back is -180 on one side of the body's
    // midline and +180 on the other. Left as it comes out, a foot crossing the
    // midline interpolates the long way round - up through vertical, drawing the
    // leg through the air the movement never leaves the floor for.
    sweep: sweep > 0 ? sweep / DEGREES - 360 : sweep / DEGREES,
    reach: span / PLANK_LEG
  };
};

/** Hips high, heels reaching down, head hanging between the arms. */
const DOWN_DOG: Pose = {
  hip: [190, 95],
  spine: 160,
  head: 150,
  facing: 112,
  armNear: [95, -3, 83],
  armFar: [97, -3, 81],
  legNear: [45, 10, 20],
  legFar: [47, 10, 20]
};

/**
 * Kneeling fold: hips back over the heels, chest down toward the mat, arms
 * reaching along the floor. The shins tuck back underneath, which is what
 * separates a kneeling fold from simply lying down.
 */
const kneelingFold = (over: Partial<Pose>): Pose => ({
  hip: [214, 142],
  spine: 165,
  head: 178,
  spineBow: -6,
  facing: 118,
  // Angled down onto the mat rather than straight out, so the arms clear the
  // head instead of merging with it and hiding the face.
  armNear: [168, 4, 3],
  armFar: [170, 4, 3],
  // Knee forward of the hip and on the mat, shin running back underneath to the
  // heel the hips sit on.
  legNear: [130, -132, 2],
  legFar: [133, -135, 2],
  ...over
});

/**
 * Side-lying, head left, hips stacked. Drawn facing the viewer so the top leg's
 * travel is visible: edge-on, the movement these exercises are named for would
 * happen entirely into the screen.
 */
const SIDE_LYING: Pose = {
  hip: [186, 132],
  spine: 180,
  head: 180,
  facing: 178,
  armFar: [184, 2, 2],
  armNear: [10, 4, 4],
  legFar: [22, -40, 0],
  legNear: [18, -40, 0]
};

const sideLying = (over: Partial<Pose>): Pose => ({ ...SIDE_LYING, ...over });

const SIDE_LYING_BOX = "48 62 240 135";

/** Foot target at an angle and reach from the side-lying hip. */
const sideLyingFoot = (degrees: number, reach: number): Point => [
  186 + Math.cos(degrees * (Math.PI / 180)) * reach,
  132 + Math.sin(degrees * (Math.PI / 180)) * reach
];

/** Upright, seen from the side, facing left. */
const STANDING_SIDE: Pose = {
  hip: [160, 122],
  spine: 270,
  head: 270,
  facing: 180,
  armNear: [92, 4, 4],
  armFar: [94, 4, 4],
  legNear: [89, 2, 94],
  legFar: [91, 2, 92]
};

const standingSide = (over: Partial<Pose>): Pose => ({ ...STANDING_SIDE, ...over });

/** Side-on lunge: both feet planted, so both legs follow targets on the mat. */
const lunge = (hipY: number, slidingFoot: Point): Partial<Pose> => ({
  hip: [160, hipY],
  legNear: [0, 0, 116],
  legFar: [0, 0, 112],
  ikLegNear: slidingFoot,
  ikLegFar: [154, 194],
  ikBend: -1,
  ikBendFar: -1
});

/** Upright, seen head-on, carrying real shoulder and hip width. */
const STANDING_FRONT: Pose = {
  hip: [150, 122],
  spine: 270,
  head: 270,
  shoulderSpread: 15,
  hipSpread: 11,
  armNear: [88, 4, 0],
  armFar: [92, -4, 0],
  legNear: [86, 4, -86],
  legFar: [94, -4, 86]
};

const standingFront = (over: Partial<Pose>): Pose => ({ ...STANDING_FRONT, ...over });

/** Room above the head for anything that reaches overhead. */
const STANDING_REACH_BOX = "-24 2 356 200.25";

/**
 * Squat seen head-on. Both feet stay planted so they are IK targets, and the
 * knees splay outward — which is opposite directions on screen, hence the
 * per-leg bend.
 */
const squat = (hipY: number, footNear: Point, footFar: Point, over: Partial<Pose> = {}): Pose => ({
  ...STANDING_FRONT,
  hip: [150, hipY],
  legNear: [0, 0, -118],
  legFar: [0, 0, 118],
  ikLegNear: footNear,
  ikLegFar: footFar,
  ikBend: 1,
  ikBendFar: -1,
  ...over
});

/**
 * Face down, head left, arms reaching past the head and legs long. The mirror
 * of SUPINE, and the base for the back-extension family.
 */
const PRONE: Pose = {
  hip: [180, 164],
  spine: 180,
  head: 180,
  facing: 88,
  armNear: [180, 0, 0],
  armFar: [182, 0, 0],
  legNear: [0, 0, 0],
  legFar: [2, 0, 0]
};

const prone = (over: Partial<Pose>): Pose => ({ ...PRONE, ...over });

/** On the back, head left, face up. The base for the whole core family. */
const SUPINE: Pose = {
  hip: [186, 150],
  spine: 180,
  head: 180,
  facing: 268,
  armNear: [10, 4, 4],
  armFar: [12, 4, 4],
  legNear: [4, 2, -10],
  legFar: [6, 2, -10]
};

const supine = (over: Partial<Pose>): Pose => ({ ...SUPINE, ...over });

/** Head and shoulders curled off the mat, back rounded, chin toward the chest. */
const CURLED: Partial<Pose> = { spine: 200, spineBow: -10, head: 208, facing: 250 };

/** Elbows wide, hands cradling the back of the head, as a curl is actually held. */
const HANDS_BEHIND_HEAD: Partial<Pose> = {
  armNear: [245, -114, -1],
  armFar: [249, -116, -1]
};

/** Tall enough for legs reaching straight up, low enough to keep the mat in. */
const SUPINE_BOX = "64 36 236 132.75";
const SEATED_BOX = "78 58 224 126";
/** A seated figure seen head-on is tall and narrow, like the standing views. */
const SEATED_FRONT_BOX = "20 55 258 145";

/**
 * Bridges drive the feet with IK targets on the mat, so the heels stay planted
 * while the hips travel instead of sliding as the joint angles interpolate.
 */
const bridge = (
  hipY: number,
  spine: number,
  /** Pass null for a leg that is lifted rather than planted. */
  footNear: Point | null,
  footFar: Point,
  over: Partial<Pose> = {}
): Pose => ({
  hip: [175, hipY],
  spine,
  head: spine + 6,
  facing: 268,
  armNear: [10, 4, 6],
  armFar: [12, 4, 6],
  legNear: [0, 0, -90],
  legFar: [0, 0, -90],
  ...(footNear === null ? {} : { ikLegNear: footNear }),
  ikLegFar: footFar,
  // Heel planted, hip lifted, so the knee is the high point of the leg. The
  // other bend direction folds the knee down through the mat.
  ikBend: 1,
  ...over
});

export const RIGS: Readonly<Record<string, RigDefinition>> = {
  /* ---- plank and slider floor ---- */

  "straight-leg-sweep": {
    title: "Straight leg sweep",
    box: "0 0 320 180",
    tempoMs: 2400,
    loop: "pingpong",
    ground: false,
    // Square to the mat, sliding the straight leg out to the side and back to
    // centre. Overhead this read as someone lying face down, which is the one
    // thing the movement is not: the plank is held throughout, and the slider is
    // what keeps the foot on the floor while the leg travels.
    //
    // Forty-seven degrees of travel from the hip-width stance, which is the far
    // end of prone abduction and the range the overhead version was drawn at.
    // Three positions rather than two: the foot follows a circle around the hip,
    // and interpolating straight between the ends of a long arc cuts the corner
    // off it, pulling the foot in toward the body on the way.
    spatial: {
      ...PLANK_SPACE,
      trace: "foot",
      leg: [slide(PLANK_HOME), slide(-34), slide(-58)]
    }
  },

  "straight-leg-sweep-circles": {
    title: "Straight leg sweep circles",
    box: "0 0 320 180",
    tempoMs: 3200,
    // A cycle, not a ping-pong: the foot draws a closed loop on the mat, and
    // running it out and back would trace the circle in both directions.
    loop: "cycle",
    ground: false,
    // In toward the chest, around to the side, then out to full stretch and back
    // to centre - the same body and camera as the sweep, differing only in the
    // path the foot walks. Coming in toward the chest is a shorter reach rather
    // than a different angle: with the hips where a plank holds them, that is the
    // only way a straight leg's foot moves closer to the hands.
    spatial: {
      ...PLANK_SPACE,
      trace: "foot",
      leg: [
        slide(PLANK_HOME),
        slide(-4, 0.86),
        slide(-22, 0.72),
        slide(-44, 0.76),
        slide(-58, 0.9),
        slide(-40)
      ]
    }
  },

  "thread-leg-side": {
    title: "Thread the leg and open to the side",
    // Extra headroom: the top hand finishes above the shoulder line.
    box: "32 42 256 144",
    tempoMs: 2600,
    loop: "pingpong",
    groundY: 170,
    focus: ["legNear", "armNear"],
    // The threading foot, not the lifting hand: the hand arcs across the whole
    // frame and its path drowns out the movement it is meant to explain.
    trace: "toeNear",
    equipment: [{ type: "disc", at: "toeNear" }],
    // The working foot is on a slider, so it is driven by an inverse kinematics
    // target that travels along the mat. Interpolating the joint angles instead
    // would swing the leg down through the floor on its way under the body.
    poses: [
      plank({ ikLegNear: [234, 157], legNear: [0, 0, 20], ikBend: -1 }),
      plank({
        ikLegNear: [143, 160],
        legNear: [0, 0, -40],
        ikBend: -1,
        armNear: [230, 5, 5],
        shoulderSpread: 13,
        spine: 192
      })
    ]
  },

  "slider-mountain-climbers": {
    title: "Sliders mountain climbers",
    box: FLOOR_BOX,
    tempoMs: 1500,
    loop: "pingpong",
    groundY: 170,
    focus: ["legNear", "legFar"],
    trace: "ankleNear",
    equipment: [
      { type: "disc", at: "toeNear" },
      { type: "disc", at: "toeFar" }
    ],
    // The scissor is not authored: it falls out of interpolating one pose into
    // the other, which is what the movement actually does.
    poses: [
      plank({ legNear: PLANK_KNEE_IN, legFar: PLANK_LEG_BACK, spine: 188 }),
      plank({ legNear: PLANK_LEG_BACK, legFar: PLANK_KNEE_IN, spine: 186 })
    ]
  },

  "high-plank-hold": {
    title: "High plank hold",
    box: FLOOR_BOX,
    tempoMs: 0,
    loop: "cycle",
    groundY: 170,
    ghost: false,
    // A hold has nothing to animate. Drawn a touch flatter than the moving
    // planks so the shape itself says "this is the position, not a rep".
    poses: [plank({ spine: 189, head: 174, hip: [172, 126] })]
  },

  "high-plank-shoulder-taps": {
    title: "High plank shoulder taps, alternating hands",
    box: FLOOR_BOX,
    tempoMs: 1600,
    loop: "pingpong",
    groundY: 170,
    focus: ["armNear"],
    trace: "handNear",
    // The tapping hand is pinned to a target at both ends rather than written
    // as angles, so it arrives at the shoulder instead of near it. Both ends,
    // because a target named on only one pose is held for the whole loop and
    // the hand never travels at all.
    poses: [
      plank({ ikArmNear: [113, 169], ikArmBend: -1 }),
      plank({
        ikArmNear: [124, 110],
        ikArmBend: -1,
        shoulderSpread: 9,
        spine: 191,
        hip: [172, 127]
      })
    ]
  },

  "high-plank-side-plank-open": {
    title: "High plank opening to a side planks (alternating)",
    // Extra headroom: the opening arm finishes straight above the shoulder.
    box: "32 40 256 144",
    tempoMs: 2400,
    loop: "pingpong",
    groundY: 170,
    focus: ["armNear"],
    trace: "handNear",
    // The rotation itself is into the screen, so the readable part is the arm
    // stacking overhead and the shoulders narrowing as the chest turns.
    poses: [
      plank({}),
      plank({
        armNear: [268, -6, -6],
        shoulderSpread: 4,
        spine: 188,
        head: 166,
        facing: 118
      })
    ]
  },

  "high-plank-alternating-crunch": {
    title: "High-plank alternating crunch",
    box: FLOOR_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 170,
    focus: ["legNear", "legFar"],
    trace: "kneeNear",
    // The same scissor as the slider climbers, but slower and driven further:
    // the knee comes all the way to the chest rather than sliding along the mat,
    // and there is no disc under the foot.
    poses: [
      plank({ legNear: [172, -78, -70], legFar: PLANK_LEG_BACK, spine: 189 }),
      plank({ legNear: PLANK_LEG_BACK, legFar: [174, -80, -72], spine: 187 })
    ]
  },

  "pilates-push-ups": {
    title: "Pilates push-ups",
    box: FLOOR_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 170,
    focus: ["armNear", "armFar"],
    trace: "shoulder",
    // Hands and toes are pinned, so the body rotates about the feet the way a
    // push-up does instead of sliding along the mat as the angles interpolate.
    poses: [
      plank({
        ikArmNear: [113, 169],
        ikArmFar: [115, 169],
        ikArmBend: 1,
        ikLegNear: [236, 156],
        ikLegFar: [238, 158]
      }),
      plank({
        hip: [166, 135],
        spine: 182,
        head: 167,
        // Third value only: the first two are solved from the target. It lays
        // the hand flat along the mat instead of carrying on downward.
        armNear: [88, 4, 101],
        armFar: [85, 6, 103],
        ikArmNear: [113, 169],
        ikArmFar: [115, 169],
        ikArmBend: 1,
        ikLegNear: [236, 156],
        ikLegFar: [238, 158]
      })
    ]
  },

  "knee-push-ups": {
    title: "Knee push-ups",
    box: FLOOR_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 170,
    focus: ["armNear", "armFar"],
    trace: "shoulder",
    // Knees planted and shins lifted, so the body pivots at the knee rather
    // than at the toes. Hands stay pinned to the mat through the rep.
    poses: [
      plank({
        hip: [176, 138],
        spine: 190,
        head: 176,
        legNear: [45, -65, -20],
        legFar: [47, -67, -20],
        // Third value only: the first two are solved from the target. It lays
        // the hand flat along the mat instead of letting it carry on downward.
        armNear: [88, 4, 130],
        armFar: [85, 6, 132],
        ikArmNear: [117, 170],
        ikArmFar: [119, 170],
        ikArmBend: 1
      }),
      plank({
        hip: [168, 151],
        spine: 190,
        head: 178,
        spineBow: -4,
        legNear: [21, -41, -20],
        legFar: [23, -43, -20],
        armNear: [88, 4, 164],
        armFar: [85, 6, 166],
        ikArmNear: [117, 170],
        ikArmFar: [119, 170],
        ikArmBend: 1
      })
    ]
  },

  /* ---- prone back extension ---- */

  superman: {
    title: "Superman",
    box: FLOOR_BOX,
    tempoMs: 2400,
    loop: "pingpong",
    groundY: 170,
    focus: ["armNear", "legNear"],
    trace: "handNear",
    // Arms, chest and legs leave the mat together and the back arches; the bow
    // is what separates this from simply lifting the limbs.
    poses: [
      prone({}),
      prone({
        hip: [180, 160],
        spine: 184,
        head: 190,
        spineBow: 10,
        armNear: [196, 0, 0],
        armFar: [198, 0, 0],
        legNear: [-14, 0, 0],
        legFar: [-12, 0, 0]
      })
    ]
  },

  "superman-flutter": {
    title: "Superman hold with flutter arms",
    box: FLOOR_BOX,
    tempoMs: 700,
    loop: "pingpong",
    groundY: 170,
    focus: ["armNear", "armFar"],
    trace: "handNear",
    // The hold never breaks: chest and legs stay up while the arms alternate.
    poses: [
      prone({
        hip: [180, 160],
        spine: 184,
        head: 190,
        spineBow: 10,
        armNear: [204, 0, 0],
        armFar: [190, 0, 0],
        legNear: [-14, 0, 0],
        legFar: [-12, 0, 0]
      }),
      prone({
        hip: [180, 160],
        spine: 184,
        head: 190,
        spineBow: 10,
        armNear: [190, 0, 0],
        armFar: [204, 0, 0],
        legNear: [-14, 0, 0],
        legFar: [-12, 0, 0]
      })
    ]
  },

  /* ---- quadruped ---- */

  "bird-dog": {
    title: "Alternating bird dog",
    box: FLOOR_BOX,
    tempoMs: 2200,
    loop: "pingpong",
    groundY: 170,
    focus: ["legNear", "armNear"],
    trace: "ankleNear",
    poses: [
      { ...QUADRUPED },
      { ...QUADRUPED, armNear: [200, -5, -5], legNear: [5, -5, 15], spine: 194 }
    ]
  },

  "cat-cow": {
    title: "Cat and cows",
    box: FLOOR_BOX,
    tempoMs: 2800,
    loop: "pingpong",
    groundY: 170,
    // No traced path: the movement is spinal, and a joint path would sit under
    // the figure saying less than the bow itself already does.
    poses: [
      quad({ spineBow: 12, head: 216, hip: [180, 134] }),
      quad({ spineBow: -14, head: 148, hip: [180, 126] })
    ]
  },

  "thread-the-needle": {
    title: "Thread the needle",
    box: FLOOR_BOX,
    tempoMs: 2600,
    loop: "pingpong",
    groundY: 170,
    focus: ["armNear"],
    trace: "handNear",
    poses: [
      quad({}),
      quad({
        spine: 186,
        head: 155,
        armNear: [42, -22, -10],
        armFar: [100, 8, 72],
        spineBow: -5
      })
    ]
  },

  "tabletop-down-dog-alternating": {
    title: "Tabletop → downward-facing dog alternating",
    box: FLOOR_BOX,
    tempoMs: 3400,
    loop: "cycle",
    groundY: 170,
    trace: "hip",
    // Up to the dog, pedal one heel then the other, back down.
    poses: [
      quad({}),
      { ...DOWN_DOG, legNear: [45, 10, 20], legFar: [40, 4, 34] },
      { ...DOWN_DOG, legNear: [40, 4, 34], legFar: [45, 10, 20] }
    ]
  },

  "down-dog-hovering-tabletop": {
    title: "Downward dog to hovering tabletop",
    box: FLOOR_BOX,
    tempoMs: 2600,
    loop: "pingpong",
    groundY: 170,
    trace: "hip",
    poses: [
      { ...DOWN_DOG },
      // Knees hover a few centimetres off the mat rather than resting on it.
      quad({ hip: [180, 129], spine: 193, spineScale: 1.0, legNear: [90, -90, 0], legFar: [92, -92, 0] })
    ]
  },

  "donkey-kick": {
    title: "Donkey kick",
    box: FLOOR_BOX,
    tempoMs: 1800,
    loop: "pingpong",
    groundY: 170,
    focus: ["legNear"],
    trace: "ankleNear",
    poses: [quad({}), quad({ legNear: [10, -90, 80], spine: 194 })]
  },

  "donkey-kick-crossover": {
    title: "Donkey kick + crossover",
    box: FLOOR_BOX,
    tempoMs: 2600,
    loop: "cycle",
    groundY: 170,
    focus: ["legNear"],
    trace: "ankleNear",
    // Kick up, then carry the knee down and across the standing leg.
    poses: [
      quad({}),
      quad({ legNear: [10, -90, 80], spine: 194 }),
      quad({ legNear: [62, -58, 40], spine: 197 })
    ]
  },

  "donkey-kick-dog-crunch": {
    title: "Donkey kick + downward dog crunch in",
    box: FLOOR_BOX,
    tempoMs: 2800,
    loop: "cycle",
    groundY: 170,
    focus: ["legNear"],
    trace: "kneeNear",
    poses: [
      quad({}),
      quad({ legNear: [10, -90, 80], spine: 194 }),
      quad({ legNear: [165, -135, -30], spine: 200, spineBow: -6, head: 160 })
    ]
  },

  "quadruped-leg-extension": {
    title: "Leg extensions",
    box: FLOOR_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 170,
    focus: ["legNear"],
    trace: "ankleNear",
    poses: [quad({}), quad({ legNear: [8, 0, 20], spine: 194 })]
  },

  "quadruped-leg-pulse": {
    title: "Leg pulses",
    box: FLOOR_BOX,
    tempoMs: 900,
    loop: "pingpong",
    groundY: 170,
    focus: ["legNear"],
    trace: "ankleNear",
    // Small range held at the top, not a full extension.
    poses: [quad({ legNear: [16, 0, 20] }), quad({ legNear: [0, 0, 20] })]
  },

  rainbow: {
    title: "Rainbow",
    // The full projection canvas. A spatial rig's numbers are tuned against
    // this frame, so cropping it would move the camera rather than zoom it.
    box: "0 0 320 180",
    tempoMs: 3000,
    loop: "pingpong",
    ground: false,
    // The whole movement is the leg travelling across the body from one side of
    // the mat to the other, which a flat side-on figure can only foreshorten
    // into a vertical line. Solved in floor space instead, so the arc is the
    // shape it actually is and both taps land on the mat.
    spatial: {
      ...QUADRUPED_SPACE,
      trace: "foot",
      leg: [
        { tilt: 82, sweep: -124 },
        { tilt: 82, sweep: 124 }
      ]
    }
  },

  "half-rainbow": {
    title: "Half rainbow",
    box: "0 0 320 180",
    tempoMs: 2200,
    loop: "pingpong",
    ground: false,
    // Half the arc: one tap, then up to the top, rather than crossing to the
    // far side. Same camera and body as the full rainbow, so the pair reads as
    // one movement at two ranges instead of two different exercises.
    spatial: {
      ...QUADRUPED_SPACE,
      trace: "foot",
      leg: [
        { tilt: 82, sweep: -124 },
        { tilt: 82, sweep: 0 }
      ]
    }
  },

  "quadruped-glute-lift": {
    title: "Quadruped Glute Lift",
    box: FLOOR_BOX,
    tempoMs: 1900,
    loop: "pingpong",
    groundY: 170,
    focus: ["legNear"],
    trace: "ankleNear",
    // Starts already extended, unlike Leg extensions: here the lift from level
    // to above the hip is the exercise, not getting the leg straight.
    poses: [
      quad({ legNear: [14, 0, 18] }),
      quad({ legNear: [-20, 0, 26], spine: 195 })
    ]
  },

  "knee-across-body": {
    title: "Knee across the body",
    box: OVERHEAD_BOX,
    view: "overheadUp",
    tempoMs: 2600,
    loop: "pingpong",
    ground: false,
    focus: ["legNear"],
    trace: "kneeNear",
    // Lying twist seen from above: the knee crossing the midline is the whole
    // movement and it happens straight into the screen from the side.
    //
    // The arms are splayed rather than a true T. Drawn at 180 degrees apart they
    // are collinear, and from this camera the two of them plus the shoulders
    // render as one unbroken bar straight through the torso.
    poses: [
      {
        hip: [180, 102],
        spine: 180,
        head: 180,
        armNear: [244, 5, 4],
        armFar: [116, -5, -4],
        legNear: [0, 0, 8],
        legFar: [4, 0, 8]
      },
      {
        hip: [180, 102],
        spine: 180,
        head: 180,
        armNear: [244, 5, 4],
        armFar: [116, -5, -4],
        legNear: [58, -58, 8],
        legFar: [4, 0, 8]
      }
    ]
  },

  "quadruped-side-crunch": {
    title: "Side crunch",
    box: "0 0 320 180",
    tempoMs: 2000,
    loop: "pingpong",
    ground: false,
    // Extended straight back with the glute engaged, then the knee folds in
    // toward the elbow on its own side. Overhead this read as someone lying
    // face down: that camera cannot show the body being held off the mat, which
    // is most of what makes it a tabletop.
    spatial: {
      ...QUADRUPED_SPACE,
      // Turned further round than the rainbow: this movement travels along the
      // body rather than across it, and at the rainbow's camera it ran almost
      // straight into the lens.
      body: { ...QUADRUPED_SPACE.body, turn: 30 },
      trace: "foot",
      fold: "down",
      leg: [
        { tilt: 26, sweep: 0 },
        { tilt: 142, sweep: -88, knee: 112 }
      ]
    }
  },

  "quadruped-cross-body-crunch": {
    title: "Cross body crunch",
    box: "0 0 320 180",
    tempoMs: 2000,
    loop: "pingpong",
    ground: false,
    // The side crunch's mirror: the knee crosses the midline instead of drawing
    // in on its own side. It passes under the torso on the way, so this is the
    // one rig that has to be painted back to front - drawn on top the knee reads
    // as crossing in front of the chest, which a leg cannot do.
    spatial: {
      ...QUADRUPED_SPACE,
      // Turned further than the side crunch. That was forced: crossing the
      // midline swings the leg through angles where, at the side crunch's
      // camera, the shin lined up with its own thigh and the limb rendered as a
      // stub for part of the travel. Carrying the knee well past the midline
      // rather than just to it is both truer to the movement and what keeps the
      // leg clear of its own thigh throughout.
      body: { ...QUADRUPED_SPACE.body, turn: 50 },
      trace: "foot",
      fold: "down",
      occlude: true,
      leg: [
        { tilt: 26, sweep: 0 },
        { tilt: 142, sweep: 120, knee: 112 }
      ]
    }
  },

  "quadruped-combined-crunch": {
    title: "Combine Side crunch + Cross body crunch",
    box: "0 0 320 180",
    tempoMs: 3000,
    // A cycle, not a ping-pong: the two crunches alternate, and reversing that
    // would play the alternation backwards rather than repeating it.
    loop: "cycle",
    ground: false,
    // Literally the other two in one loop: out, in to its own elbow, out, across
    // the body. The leg extends between the crunches rather than swinging
    // straight from one to the other - which is how the movement is actually
    // performed, and it is also what keeps the guide legible, since a leg
    // travelling directly between the two folds passes through an angle where
    // the shin hides behind its own thigh.
    spatial: {
      ...QUADRUPED_SPACE,
      body: { ...QUADRUPED_SPACE.body, turn: 50 },
      trace: "foot",
      fold: "down",
      occlude: true,
      leg: [
        { tilt: 26, sweep: 0 },
        { tilt: 142, sweep: -88, knee: 112 },
        { tilt: 26, sweep: 0 },
        { tilt: 142, sweep: 120, knee: 112 }
      ]
    }
  },

  "quadruped-side-crunch-extension": {
    title: "Side crunch with leg extension",
    box: "0 0 320 180",
    tempoMs: 3000,
    loop: "cycle",
    ground: false,
    // Crunch in to the elbow, then extend the same leg straight out to the side
    // before folding back - the extension is the added element, and it is the
    // knee straightening rather than a separate position.
    spatial: {
      ...QUADRUPED_SPACE,
      body: { ...QUADRUPED_SPACE.body, turn: 30 },
      trace: "foot",
      fold: "down",
      leg: [
        { tilt: 26, sweep: 0 },
        { tilt: 142, sweep: -88, knee: 112 },
        { tilt: 90, sweep: -90 }
      ]
    }
  },

  "bird-dog-crunch": {
    title: "Bird-dog extension and crunch",
    box: FLOOR_BOX,
    tempoMs: 2400,
    loop: "pingpong",
    groundY: 170,
    focus: ["legNear", "armNear"],
    trace: "kneeNear",
    // Opposite arm and leg reach away, then elbow and knee meet under the body.
    // The meeting is the part the plain bird dog does not have.
    poses: [
      quad({ armNear: [200, -5, -5], legNear: [5, -5, 15], spine: 194 }),
      quad({ armNear: [128, 34, 6], legNear: [150, -104, -30], spine: 202, spineBow: -8, head: 166 })
    ]
  },

  "childs-pose": {
    title: "Child's pose",
    box: KNEELING_BOX,
    tempoMs: 0,
    loop: "cycle",
    groundY: 170,
    ghost: false,
    poses: [kneelingFold({})]
  },

  "childs-pose-side-stretch": {
    title: "Child's pose with side stretches",
    box: KNEELING_BOX,
    tempoMs: 3000,
    loop: "pingpong",
    groundY: 170,
    focus: ["armNear", "armFar"],
    trace: "handNear",
    // Walking the hands away is lateral, so a side view can only show the
    // reach, not which way it goes. It still beats standing in a generic pose.
    poses: [
      kneelingFold({}),
      kneelingFold({ armNear: [180, 6, 3], armFar: [182, 6, 3], spineBow: -10, hip: [218, 138] })
    ]
  },

  /* ---- bridges ---- */

  "glute-bridge-sliders": {
    title: "Glute bridge",
    box: FLOOR_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 172,
    focus: ["legNear"],
    trace: "hip",
    equipment: [
      { type: "disc", at: "ankleNear" },
      { type: "disc", at: "ankleFar" }
    ],
    poses: [
      {
        hip: [175, 158],
        spine: 183,
        head: 183,
        armNear: [8, 4, 6],
        armFar: [10, 4, 6],
        legNear: [-35, 110, -75],
        legFar: [-32, 108, -74]
      },
      {
        hip: [175, 134],
        spine: 162,
        head: 168,
        spineScale: 1.06,
        armNear: [14, 4, 6],
        armFar: [16, 4, 6],
        legNear: [0, 100, -100],
        legFar: [3, 98, -98]
      }
    ]
  },

  "glute-bridge-curl": {
    title: "Glute bridge curl",
    box: FLOOR_BOX,
    tempoMs: 2200,
    loop: "pingpong",
    groundY: 172,
    focus: ["legNear"],
    trace: "ankleNear",
    equipment: [
      { type: "disc", at: "ankleNear" },
      { type: "disc", at: "ankleFar" }
    ],
    // The hips stay lifted throughout; only the heels travel.
    poses: [
      bridge(134, 162, [234, 172], [236, 172], { spineScale: 1.06 }),
      bridge(134, 162, [203, 172], [205, 172], { spineScale: 1.06 })
    ]
  },

  "glute-bridge-pulse": {
    title: "Glute bridge pulse",
    box: FLOOR_BOX,
    tempoMs: 800,
    loop: "pingpong",
    groundY: 172,
    // No traced path: a pulse travels too little for one to say anything the
    // start-pose ghost does not already show.
    poses: [
      bridge(137, 165, [222, 172], [224, 172], { spineScale: 1.05 }),
      bridge(125, 153, [222, 172], [224, 172], { spineScale: 1.08 })
    ]
  },

  "one-leg-banded-bridge": {
    title: "One-leg banded bridge",
    box: FLOOR_BOX,
    tempoMs: 2200,
    loop: "pingpong",
    groundY: 172,
    focus: ["legNear"],
    trace: "hip",
    equipment: [{ type: "band", from: "kneeNear", to: "kneeFar", sag: 4 }],
    poses: [
      bridge(156, 182, null, [224, 172], { legNear: [-28, 0, 22] }),
      bridge(133, 161, null, [224, 172], { spineScale: 1.06, legNear: [-42, 0, 22] })
    ]
  },

  "banded-bridge": {
    title: "Bridge with band around thighs",
    box: FLOOR_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 172,
    trace: "hip",
    equipment: [{ type: "band", from: "kneeNear", to: "kneeFar", sag: 3 }],
    // Hip spread separates the knees so the band pressing them apart is
    // visible at all; side-on the legs would otherwise sit on top of each other.
    poses: [
      bridge(157, 183, [216, 172], [236, 172], { hipSpread: 15 }),
      bridge(131, 160, [216, 172], [236, 172], { hipSpread: 15, spineScale: 1.07 })
    ]
  },

  "full-range-glute-bridge": {
    title: "Full-range glute bridge",
    box: FLOOR_BOX,
    tempoMs: 2600,
    loop: "pingpong",
    groundY: 172,
    trace: "hip",
    // The range is the exercise. The hips rest on the mat at the bottom and
    // finish above the ribs, which is what separates this from the shorter
    // bridges either side of it in the library.
    poses: [
      bridge(168, 184, [222, 172], [224, 172]),
      bridge(122, 149, [222, 172], [224, 172], { spineScale: 1.09 })
    ]
  },

  "bridge-knee-drive": {
    title: "Bridge with knee drive",
    box: FLOOR_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 172,
    focus: ["legNear"],
    trace: "kneeNear",
    // The hips never lower: only the free knee travels, which is the cue the
    // class gives and the thing people get wrong.
    poses: [
      bridge(130, 158, null, [224, 172], { legNear: [-40, 0, 22] }),
      bridge(130, 158, null, [224, 172], { legNear: [-100, 130, 20] })
    ]
  },

  "bridge-knee-drive-pulse": {
    title: "Bridge knee-drive pulses",
    box: FLOOR_BOX,
    tempoMs: 800,
    loop: "pingpong",
    groundY: 172,
    focus: ["legNear"],
    // No traced path: a pulse travels too little for one to say anything the
    // start-pose ghost does not already show.
    poses: [
      bridge(130, 158, null, [224, 172], { legNear: [-92, 126, 20] }),
      bridge(130, 158, null, [224, 172], { legNear: [-114, 134, 20] })
    ]
  },

  /* ---- supine core ---- */

  "crunch-legs-lifted": {
    title: "Crunch w legs lifted",
    box: SUPINE_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 162,
    trace: "shoulder",
    poses: [
      supine({ legNear: [-80, 80, -10], legFar: [-78, 80, -10], armNear: [8, 5, 4], armFar: [10, 5, 4] }),
      supine({
        ...CURLED,
        legNear: [-80, 80, -10],
        legFar: [-78, 80, -10],
        armNear: [4, 6, 4],
        armFar: [6, 6, 4]
      })
    ]
  },

  "one-leg-stretch": {
    title: "The one leg stretch - alternating sides",
    box: SUPINE_BOX,
    tempoMs: 1900,
    loop: "pingpong",
    groundY: 162,
    focus: ["legNear", "legFar"],
    trace: "ankleNear",
    // Curled throughout: only the legs alternate.
    poses: [
      supine({ ...CURLED, legNear: [-110, 130, -10], legFar: [-20, 8, 0], armNear: [-30, 15, 5], armFar: [10, 15, 6] }),
      supine({ ...CURLED, legNear: [-20, 8, 0], legFar: [-110, 130, -10], armNear: [10, 15, 6], armFar: [-30, 15, 5] })
    ]
  },

  "bicycle-legs": {
    title: "Bicycle legs",
    box: SUPINE_BOX,
    tempoMs: 2400,
    loop: "cycle",
    groundY: 162,
    focus: ["legNear", "legFar"],
    trace: "ankleNear",
    // Both feet ride the same circle half a turn apart, which is what makes it
    // a pedal rather than an alternating tuck.
    poses: [0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
      const t = (index / 8) * Math.PI * 2;
      const at = (angle: number): Point => [216 + Math.cos(angle) * 30, 120 + Math.sin(angle) * 30];
      return supine({
        ...CURLED,
        ...HANDS_BEHIND_HEAD,
        // Knee leads upward and the shin folds back beneath it; the other bend
        // solution pedals the legs backwards.
        ikBend: 1,
        ikLegNear: at(t),
        ikLegFar: at(t + Math.PI)
      });
    }) as [Pose, ...Pose[]]
  },

  "leg-lowers": {
    title: "Leg lowers",
    box: SUPINE_BOX,
    tempoMs: 2400,
    loop: "pingpong",
    groundY: 162,
    focus: ["legNear", "legFar"],
    trace: "ankleNear",
    poses: [
      supine({ legNear: [-86, 2, -4], legFar: [-84, 2, -4] }),
      supine({ legNear: [-30, 2, -4], legFar: [-28, 2, -4] })
    ]
  },

  "one-leg-circle": {
    title: "One leg circle",
    box: SUPINE_BOX,
    tempoMs: 3000,
    loop: "cycle",
    groundY: 162,
    focus: ["legNear"],
    trace: "ankleNear",
    // One leg stays long on the mat while the other draws the circle overhead.
    // The circling leg stays near its full reach so it reads as a straight leg
    // pivoting at the hip: an arc traced by a bent knee is a different exercise.
    // Seen from the side the circle is a narrow ellipse, so the sweep is wide
    // and the reach barely changes.
    poses: [0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
      const t = (index / 8) * Math.PI * 2;
      const angle = (256 + Math.cos(t) * 17) * (Math.PI / 180);
      const reach = 68 + Math.sin(t) * 3;
      return supine({
        ikBend: 1,
        ikLegNear: [186 + Math.cos(angle) * reach, 150 + Math.sin(angle) * reach]
      });
    }) as [Pose, ...Pose[]]
  },

  crunch: {
    title: "Crunch",
    box: SUPINE_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 162,
    trace: "head",
    // Feet planted on targets so they stay put while the ribcage travels. The
    // third leg value tips the foot up off the shin, which otherwise carries on
    // through the mat.
    poses: [
      supine({ ikLegNear: [232, 162], ikLegFar: [234, 162], ikBend: 1, legNear: [4, 2, -85], legFar: [6, 2, -85], armNear: [12, 5, 3], armFar: [14, 5, 3] }),
      supine({
        ...CURLED,
        ikLegNear: [232, 162],
        ikLegFar: [234, 162],
        ikBend: 1,
        legNear: [4, 2, -85],
        legFar: [6, 2, -85],
        armNear: [26, 8, 4],
        armFar: [28, 8, 4]
      })
    ]
  },

  "criss-cross": {
    title: "Criss-cross",
    box: SUPINE_BOX,
    tempoMs: 1800,
    loop: "pingpong",
    groundY: 162,
    focus: ["legNear", "legFar"],
    trace: "kneeNear",
    // Hands stay behind the head and the legs trade places; the rotation itself
    // is into the screen, so the scissor is what has to carry the movement.
    // The extended leg is written as 342, not -18: the knee has to unfold
    // upward past the chest, and the wrapped value swings it down through the
    // mat on the way.
    poses: [
      supine({ ...CURLED, ...HANDS_BEHIND_HEAD, legNear: [248, 142, 12], legFar: [342, 0, -12] }),
      supine({ ...CURLED, ...HANDS_BEHIND_HEAD, legNear: [342, 0, -12], legFar: [248, 142, 12] })
    ]
  },

  scissors: {
    title: "Scissors",
    box: SUPINE_BOX,
    tempoMs: 1800,
    loop: "pingpong",
    focus: ["legNear", "legFar"],
    groundY: 162,
    trace: "ankleNear",
    // Drawn as the Pilates scissors proper - both legs straight, one drawn
    // toward the chest as the other lowers - rather than as the bent-knee
    // bicycle the class notes describe.
    poses: [
      supine({ ...CURLED, legNear: [-104, 0, -10], legFar: [-26, 0, -10], armNear: [-64, 22, 4], armFar: [-20, 16, 4] }),
      supine({ ...CURLED, legNear: [-26, 0, -10], legFar: [-104, 0, -10], armNear: [-16, 18, 4], armFar: [-58, 20, 4] })
    ]
  },

  "toe-taps-alternating": {
    title: "Toe taps alternating legs",
    box: SUPINE_BOX,
    tempoMs: 1600,
    loop: "pingpong",
    groundY: 162,
    focus: ["legNear", "legFar"],
    trace: "toeNear",
    // Tabletop held while one foot at a time reaches for the mat.
    poses: [
      supine({ legNear: [265, 95, -12], legFar: [267, 93, -12] }),
      supine({ legNear: [265, 165, -12], legFar: [267, 93, -12] })
    ]
  },

  "toe-taps-both": {
    title: "Toe taps both legs",
    box: SUPINE_BOX,
    tempoMs: 1800,
    loop: "pingpong",
    groundY: 162,
    focus: ["legNear", "legFar"],
    trace: "toeNear",
    poses: [
      supine({ legNear: [265, 95, -12], legFar: [267, 93, -12] }),
      supine({ legNear: [265, 163, -12], legFar: [267, 161, -12] })
    ]
  },

  "toe-tap-reverse-crunch": {
    title: "Toe tap to reverse crunch",
    box: SUPINE_BOX,
    tempoMs: 2400,
    loop: "cycle",
    groundY: 162,
    focus: ["legNear", "legFar"],
    trace: "kneeNear",
    // Three stops: tabletop, the tap down, then the knees drawn in far enough
    // that the hips leave the mat. The lift is what makes it a reverse crunch.
    poses: [
      supine({ legNear: [265, 95, -12], legFar: [267, 93, -12] }),
      supine({ legNear: [265, 163, -12], legFar: [267, 161, -12] }),
      supine({ hip: [186, 140], spine: 184, legNear: [232, 70, -12], legFar: [234, 68, -12] })
    ]
  },

  "supine-bird-dog": {
    title: "Alternating bird dogs",
    box: SUPINE_BOX,
    tempoMs: 2200,
    loop: "pingpong",
    groundY: 162,
    focus: ["armNear", "legFar"],
    trace: "handNear",
    // On the back with the arms straight up: opposite arm and leg reach away
    // and return. The mirror of the tabletop bird dog, which is why the class
    // calls it the same name.
    poses: [
      supine({ armNear: [272, 0, 0], armFar: [274, 0, 0], legNear: [265, 95, -12], legFar: [267, 93, -12] }),
      supine({ armNear: [196, 0, 0], armFar: [274, 0, 0], legNear: [265, 95, -12], legFar: [267, 20, -12] })
    ]
  },

  "roll-down-to-mat": {
    title: "Roll down to the mat",
    box: SUPINE_BOX,
    tempoMs: 3000,
    loop: "pingpong",
    groundY: 162,
    trace: "head",
    // Seated and tall, then down one vertebra at a time. The bow deepening as
    // the spine lowers is the "one vertebra at a time" part.
    //
    // Seated, the face looks out along the legs; lying, it looks at the
    // ceiling. That is a quarter turn one way, written as 8 to -82 rather than
    // wrapped, so the chin keeps a constant offset from the face. Values that
    // rotate the face and the chin in opposite directions - which the earlier
    // 200 and 250 did - put the face on the back of the head halfway through.
    poses: [
      supine({ spine: 268, head: 268, facing: 8, armNear: [0, 4, 4], armFar: [2, 4, 4], legNear: [4, 2, -10], legFar: [6, 2, -10] }),
      supine({ spine: 196, head: 200, spineBow: -8, facing: -82, armNear: [16, 6, 4], armFar: [18, 6, 4] })
    ]
  },

  "knee-to-chest": {
    title: "Knee to chest stretch",
    box: SUPINE_BOX,
    tempoMs: 2600,
    loop: "pingpong",
    hold: 0.5,
    groundY: 162,
    focus: ["legNear"],
    trace: "kneeNear",
    // A hold, drawn as the entry: the leg travels from long on the mat to
    // hugged in, which is the part worth showing.
    // Negative rather than wrapped past 180: the knee and the hands both have
    // to travel up over the body, not down through the mat.
    poses: [
      supine({}),
      supine({ legNear: [-118, 158, 10], armNear: [-42, 44, 6], armFar: [-40, 42, 6] })
    ]
  },

  "roll-ups": {
    title: "Roll ups",
    box: SUPINE_BOX,
    tempoMs: 3000,
    loop: "pingpong",
    groundY: 162,
    trace: "shoulder",
    poses: [
      supine({ armNear: [215, 6, 4], armFar: [217, 6, 4] }),
      supine({
        spine: 299,
        spineScale: 0.96,
        spineBow: -12,
        head: 300,
        facing: 350,
        armNear: [370, 4, 2],
        armFar: [372, 4, 2]
      })
    ]
  },

  "reverse-plank-l-sit": {
    title: "Reverse plank to L-sit",
    box: SEATED_BOX,
    tempoMs: 2800,
    loop: "pingpong",
    groundY: 162,
    trace: "hip",
    equipment: [
      { type: "disc", at: "ankleNear" },
      { type: "disc", at: "ankleFar" }
    ],
    poses: [
      // Reverse plank: hips driven up, body one line from shoulder to heel.
      {
        hip: [186, 124],
        spine: 195,
        head: 209,
        facing: 285,
        armNear: [88, 2, 80],
        armFar: [90, 2, 78],
        legNear: [26, 4, 20],
        legFar: [28, 4, 20]
      },
      // L-sit: hips down, torso leaning back over supporting arms, legs level.
      {
        hip: [186, 144],
        spine: 217,
        head: 240,
        facing: 320,
        armNear: [90, 0, 84],
        armFar: [92, 0, 82],
        legNear: [-4, 2, -6],
        legFar: [-2, 2, -6]
      }
    ]
  },

  "slider-in-outs": {
    title: "In and outs with sliders",
    box: SEATED_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 162,
    focus: ["legNear", "legFar"],
    trace: "ankleNear",
    equipment: [
      { type: "disc", at: "ankleNear" },
      { type: "disc", at: "ankleFar" }
    ],
    poses: [
      {
        hip: [180, 146],
        spine: 225,
        head: 250,
        facing: 320,
        armNear: [85, 2, 84],
        armFar: [87, 2, 82],
        legNear: [0, 0, 20],
        legFar: [0, 0, 20],
        // Seated with the feet on sliders: the knees rise as the feet draw in,
        // so the knee belongs above the hip-to-ankle line, not below the mat.
        ikBend: 1,
        ikLegNear: [252, 158],
        ikLegFar: [254, 158]
      },
      {
        hip: [180, 146],
        spine: 222,
        head: 247,
        facing: 320,
        armNear: [85, 2, 84],
        armFar: [87, 2, 82],
        legNear: [0, 0, -20],
        legFar: [0, 0, -20],
        ikBend: 1,
        ikLegNear: [210, 158],
        ikLegFar: [212, 158]
      }
    ]
  },

  /* ---- supine core, band ---- */

  "banded-tabletop-crunch": {
    title: "Tabletop crunch - band below knees",
    box: SUPINE_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 162,
    trace: "shoulder",
    equipment: [{ type: "band", from: "kneeNear", to: "kneeFar", sag: 3 }],
    // Hip spread separates the knees so the band across them is visible at all.
    poses: [
      supine({ hipSpread: 8, legNear: [-80, 80, -10], legFar: [-78, 80, -10], armNear: [8, 5, 4], armFar: [10, 5, 4] }),
      supine({
        ...CURLED,
        hipSpread: 8,
        legNear: [-80, 80, -10],
        legFar: [-78, 80, -10],
        armNear: [4, 6, 4],
        armFar: [6, 6, 4]
      })
    ]
  },

  "banded-hundred": {
    title: "Hundredth - band below knees",
    box: SUPINE_BOX,
    tempoMs: 700,
    loop: "pingpong",
    groundY: 162,
    focus: ["armNear", "armFar"],
    trace: "wristNear",
    equipment: [{ type: "band", from: "kneeNear", to: "kneeFar", sag: 3 }],
    // Held curl with legs long; only the arms pump.
    poses: [
      supine({ ...CURLED, hipSpread: 8, legNear: [-40, 4, -6], legFar: [-38, 4, -6], armNear: [4, 10, 6], armFar: [6, 10, 6] }),
      supine({ ...CURLED, hipSpread: 8, legNear: [-40, 4, -6], legFar: [-38, 4, -6], armNear: [30, 10, 6], armFar: [32, 10, 6] })
    ]
  },

  "banded-leg-lowers": {
    title: "Leg lowers - band around ankles",
    box: SUPINE_BOX,
    tempoMs: 2400,
    loop: "pingpong",
    groundY: 162,
    focus: ["legNear", "legFar"],
    trace: "ankleNear",
    equipment: [{ type: "band", from: "ankleNear", to: "ankleFar", sag: 3 }],
    poses: [
      supine({ hipSpread: 7, legNear: [-86, 2, -4], legFar: [-84, 2, -4] }),
      supine({ hipSpread: 7, legNear: [-30, 2, -4], legFar: [-28, 2, -4] })
    ]
  },

  "banded-flutter-kicks": {
    title: "Flutter kicks up and down - band around ankles",
    box: SUPINE_BOX,
    tempoMs: 800,
    loop: "pingpong",
    groundY: 162,
    focus: ["legNear", "legFar"],
    trace: "ankleNear",
    equipment: [{ type: "band", from: "ankleNear", to: "ankleFar", sag: 3 }],
    // Small, fast, and opposed: the legs pass each other rather than travel far.
    poses: [
      supine({ hipSpread: 6, legNear: [-58, 3, -6], legFar: [-30, 3, -6] }),
      supine({ hipSpread: 6, legNear: [-30, 3, -6], legFar: [-58, 3, -6] })
    ]
  },

  "banded-roll-ups": {
    title: "Roll ups - band around wrists",
    box: SUPINE_BOX,
    tempoMs: 3000,
    loop: "pingpong",
    groundY: 162,
    trace: "shoulder",
    equipment: [{ type: "band", from: "wristNear", to: "wristFar", sag: 4 }],
    poses: [
      supine({ shoulderSpread: 11, armNear: [215, 6, 4], armFar: [221, 6, 4] }),
      supine({
        shoulderSpread: 11,
        spine: 299,
        spineScale: 0.96,
        spineBow: -12,
        head: 300,
        facing: 350,
        armNear: [368, 4, 2],
        armFar: [374, 4, 2]
      })
    ]
  },

  "banded-russian-twist": {
    title: "Russian twist - band around wrists",
    box: SEATED_FRONT_BOX,
    view: "front",
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 190,
    focus: ["armNear", "armFar"],
    trace: "wristNear",
    equipment: [{ type: "band", from: "wristNear", to: "wristFar", sag: 5 }],
    // Front view: the rotation is what the exercise is, and side-on it would
    // happen entirely into the screen.
    poses: [
      {
        hip: [150, 144],
        spine: 272,
        head: 272,
        shoulderSpread: 15,
        hipSpread: 11,
        armNear: [40, 10, 4],
        armFar: [48, 10, 4],
        legNear: [55, 25, 15],
        legFar: [125, -25, -15],
        legNearScale: 0.65,
        legFarScale: 0.65
      },
      {
        hip: [150, 144],
        spine: 268,
        head: 268,
        shoulderSpread: 15,
        hipSpread: 11,
        armNear: [132, -10, -4],
        armFar: [140, -10, -4],
        legNear: [55, 25, 15],
        legFar: [125, -25, -15],
        legNearScale: 0.65,
        legFarScale: 0.65
      }
    ]
  },

  /* ---- side-lying ---- */

  "side-lying-leg-lift": {
    title: "Leg lift",
    box: SIDE_LYING_BOX,
    view: "lying",
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 152,
    focus: ["legNear"],
    trace: "ankleNear",
    // Straight top leg, unlike the bent-knee clamshells below.
    poses: [
      sideLying({ legNear: [4, 2, -14], legFar: [8, 2, -14] }),
      sideLying({ legNear: [-26, 2, -14], legFar: [8, 2, -14] })
    ]
  },

  "clamshell-openers": {
    title: "Clamshell openers",
    box: SIDE_LYING_BOX,
    view: "lying",
    tempoMs: 1900,
    loop: "pingpong",
    groundY: 152,
    focus: ["legNear"],
    // The knee is what travels; the feet stay together throughout.
    trace: "kneeNear",
    poses: [sideLying({}), sideLying({ legNear: [-12, 22, 0] })]
  },

  "clamshell-lifts": {
    title: "Clamshell lifts",
    box: SIDE_LYING_BOX,
    view: "lying",
    tempoMs: 1900,
    loop: "pingpong",
    groundY: 152,
    focus: ["legNear"],
    // The whole bent leg rises, so the foot travels too — that is what
    // separates a lift from an opener.
    trace: "ankleNear",
    poses: [sideLying({}), sideLying({ legNear: [-16, -40, 0] })]
  },

  "side-body-crunch": {
    title: "Side-body crunches",
    box: SIDE_LYING_BOX,
    view: "lying",
    tempoMs: 2100,
    loop: "pingpong",
    groundY: 152,
    focus: ["legNear", "armNear"],
    trace: "kneeNear",
    poses: [
      sideLying({ armNear: [-40, -132, 0], legNear: [6, 2, -14], legFar: [10, 2, -14] }),
      sideLying({
        spine: 172,
        spineBow: -11,
        armNear: [-16, -152, 0],
        legNear: [-34, 64, -10],
        legFar: [10, 2, -14]
      })
    ]
  },

  "side-lying-big-circles": {
    title: "Big leg circles",
    box: SIDE_LYING_BOX,
    view: "lying",
    tempoMs: 3000,
    loop: "cycle",
    groundY: 152,
    focus: ["legNear"],
    trace: "ankleNear",
    poses: [0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
      const t = (index / 8) * Math.PI * 2;
      return sideLying({
        legFar: [8, 2, -14],
        ikBend: 1,
        ikLegNear: sideLyingFoot(-6 - 24 * Math.cos(t), 66 + 5 * Math.sin(t))
      });
    }) as [Pose, ...Pose[]]
  },

  "side-lying-small-circles": {
    title: "Small leg circle pulses",
    box: SIDE_LYING_BOX,
    view: "lying",
    tempoMs: 1400,
    loop: "cycle",
    groundY: 152,
    focus: ["legNear"],
    trace: "ankleNear",
    // The same shape as the big circles, held small and quick at the top.
    poses: [0, 1, 2, 3, 4, 5].map((index) => {
      const t = (index / 6) * Math.PI * 2;
      return sideLying({
        legFar: [8, 2, -14],
        ikBend: 1,
        ikLegNear: sideLyingFoot(-14 - 8 * Math.cos(t), 68 + 3 * Math.sin(t))
      });
    }) as [Pose, ...Pose[]]
  },

  "side-lying-forward-back-kick": {
    title: "Forward and back kick",
    box: SIDE_LYING_BOX,
    view: "lying",
    tempoMs: 2200,
    loop: "pingpong",
    groundY: 152,
    focus: ["legNear"],
    trace: "ankleNear",
    poses: [
      sideLying({ legNear: [-55, 14, -12], legFar: [8, 2, -14] }),
      sideLying({ legNear: [26, 2, -14], legFar: [8, 2, -14] })
    ]
  },

  "side-lying-straight-leg-crunch": {
    title: "Straight leg crunches",
    box: SIDE_LYING_BOX,
    view: "lying",
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 152,
    focus: ["legNear", "armNear"],
    trace: "ankleNear",
    // Straight top leg meeting the top elbow, unlike the bent-knee crunch.
    poses: [
      sideLying({ armNear: [-40, -132, 0], legNear: [6, 2, -14], legFar: [8, 2, -14] }),
      sideLying({
        spine: 172,
        spineBow: -11,
        armNear: [-16, -152, 0],
        legNear: [-40, 3, -12],
        legFar: [8, 2, -14]
      })
    ]
  },

  "bottom-leg-lifts": {
    title: "Bottom leg lifts",
    box: SIDE_LYING_BOX,
    view: "lying",
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 152,
    focus: ["legFar"],
    trace: "ankleFar",
    // The top leg is parked high and the bottom one does the work, which is the
    // whole difference from the leg lifts earlier in the same circuit.
    poses: [
      sideLying({ legNear: [-40, 54, -10], legFar: [8, 2, -14] }),
      sideLying({ legNear: [-40, 54, -10], legFar: [-14, 2, -14] })
    ]
  },

  "bottom-leg-pulses": {
    title: "Bottom leg pulses",
    box: SIDE_LYING_BOX,
    view: "lying",
    tempoMs: 700,
    loop: "pingpong",
    groundY: 152,
    focus: ["legFar"],
    // Held up and pulsing, so there is no travel worth tracing.
    poses: [
      sideLying({ legNear: [-40, 54, -10], legFar: [-12, 2, -14] }),
      sideLying({ legNear: [-40, 54, -10], legFar: [-22, 2, -14] })
    ]
  },

  "inner-thigh-circles": {
    title: "Inner thigh circles",
    box: SIDE_LYING_BOX,
    view: "lying",
    tempoMs: 2400,
    loop: "cycle",
    groundY: 152,
    focus: ["legFar"],
    trace: "ankleFar",
    // The bottom leg stays lifted and draws the circle; the top leg is parked.
    // Drawn wider than the movement literally is: at the size this renders on a
    // phone, a true-to-life circle for the bottom leg was a few pixels across
    // and read as a leg holding still.
    poses: [0, 1, 2, 3, 4, 5].map((index) => {
      const t = (index / 6) * Math.PI * 2;
      return sideLying({
        legNear: [-40, 54, -10],
        ikBendFar: 1,
        ikLegFar: sideLyingFoot(-14 - 15 * Math.cos(t), 66 + 6 * Math.sin(t))
      });
    }) as [Pose, ...Pose[]]
  },

  "double-leg-lift": {
    title: "Double-leg lift",
    box: SIDE_LYING_BOX,
    view: "lying",
    tempoMs: 2400,
    loop: "pingpong",
    groundY: 152,
    focus: ["legNear", "legFar"],
    trace: "ankleNear",
    // Both legs squeezed together and lifted as one, which is what separates
    // this from every other lift in the side-lying set.
    poses: [
      sideLying({ legNear: [4, 2, -14], legFar: [6, 2, -14] }),
      sideLying({ legNear: [-20, 2, -14], legFar: [-18, 2, -14] })
    ]
  },

  "side-lying-small-leg-circles": {
    title: "Small leg circles",
    box: SIDE_LYING_BOX,
    view: "lying",
    tempoMs: 2000,
    loop: "cycle",
    groundY: 152,
    focus: ["legNear"],
    trace: "ankleNear",
    // Drawn a little wider and slower than the small circle pulses in the
    // sliders class, which the instructor keeps as a separate movement.
    poses: [0, 1, 2, 3, 4, 5].map((index) => {
      const t = (index / 6) * Math.PI * 2;
      return sideLying({
        legFar: [8, 2, -14],
        ikBend: 1,
        ikLegNear: sideLyingFoot(-18 - 12 * Math.cos(t), 66 + 5 * Math.sin(t))
      });
    }) as [Pose, ...Pose[]]
  },

  "pulse-leg-at-top": {
    title: "Pulse leg at the top",
    box: SIDE_LYING_BOX,
    view: "lying",
    tempoMs: 650,
    loop: "pingpong",
    groundY: 152,
    focus: ["legNear"],
    // A pulse at the top of the lift: small, quick, and no path to draw.
    poses: [
      sideLying({ legNear: [-24, 2, -14], legFar: [8, 2, -14] }),
      sideLying({ legNear: [-34, 2, -14], legFar: [8, 2, -14] })
    ]
  },

  "side-lying-static-hold": {
    title: "Static hold",
    box: SIDE_LYING_BOX,
    view: "lying",
    tempoMs: 0,
    loop: "cycle",
    groundY: 152,
    focus: ["legNear"],
    ghost: false,
    // Deliberately a still. It sits directly after the leg lifts and the pulses
    // in the same circuit, so animating the entry would draw the movement
    // before it a second time; the position held is the whole instruction.
    poses: [sideLying({ legNear: [-30, 2, -14], legFar: [8, 2, -14] })]
  },

  "clamshell-kick": {
    title: "Clam shell openers with kick",
    box: SIDE_LYING_BOX,
    view: "lying",
    tempoMs: 2600,
    loop: "cycle",
    groundY: 152,
    focus: ["legNear"],
    trace: "ankleNear",
    // Open the clam, then kick that leg straight out of it and fold back.
    poses: [
      sideLying({}),
      sideLying({ legNear: [-12, 22, 0] }),
      sideLying({ legNear: [-20, 2, -12] })
    ]
  },

  "forearm-side-plank": {
    title: "Forearm side plank",
    box: SIDE_LYING_BOX,
    view: "lying",
    tempoMs: 2600,
    loop: "pingpong",
    hold: 0.5,
    groundY: 152,
    // The supporting forearm is highlighted rather than the working side: at
    // this angle the body is close to horizontal, and the propped forearm is
    // what tells the reader this is a plank and not lying down.
    focus: ["armFar"],
    trace: "hip",
    // Cued as a hold, drawn as the lift into it: what the instructor has to
    // correct is a sagging hip, and only the travel shows where it belongs.
    // The elbow stays under the shoulder throughout, which is why both poses
    // put the shoulder at the same height and vary the hip instead.
    poses: [
      sideLying({
        hip: [184, 150],
        spine: 206,
        head: 206,
        armFar: [90, 90, 0],
        armNear: [14, 16, 0],
        // Toes tipped back off the shin so the foot rests on the mat rather
        // than carrying on through it.
        legNear: [18, -40, -26],
        legFar: [20, -42, -26],
        ikLegNear: [258, 152],
        ikLegFar: [260, 152]
      }),
      sideLying({
        // Hip level with the shoulder rather than on the sagging line, so the
        // gap under the hips - the one tell that this is a plank - is visible.
        hip: [190, 124],
        spine: 180,
        head: 180,
        armFar: [90, 90, 0],
        armNear: [16, 18, 0],
        legNear: [18, -40, -26],
        legFar: [20, -42, -26],
        ikLegNear: [258, 152],
        ikLegFar: [260, 152]
      })
    ]
  },

  "tricep-side-push-up": {
    title: "Tricep side push-up",
    box: SIDE_LYING_BOX,
    view: "lying",
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 152,
    focus: ["armNear"],
    trace: "shoulder",
    // The top hand presses the mat and the bottom forearm crosses the belly.
    // The pressing hand is an inverse kinematics target pinned on the mat, so
    // it stays planted while the torso rises: writing the arm as angles let the
    // hand sink through the floor at the bottom of the rep. The shoulder must
    // also stay above the hip - a spine angle under 180 tips it below, which is
    // what drove the whole arm underground.
    poses: [
      sideLying({
        hip: [186, 140],
        spine: 186,
        head: 190,
        armNear: [60, 70, -70],
        ikArmNear: [108, 152],
        ikArmBend: -1,
        armFar: [10, -26, -8]
      }),
      sideLying({
        hip: [186, 136],
        spine: 202,
        head: 206,
        armNear: [40, 30, -84],
        ikArmNear: [108, 152],
        ikArmBend: -1,
        armFar: [14, -30, -8]
      })
    ]
  },

  /* ---- cooldown and stretches ---- */

  "standing-roll-down": {
    title: "Lower down slowly",
    box: STANDING_BOX,
    tempoMs: 3400,
    loop: "pingpong",
    groundY: 196,
    trace: "head",
    // One vertebra at a time: the bow does the talking, not the limbs.
    poses: [
      standingSide({}),
      standingSide({ spine: 160, spineBow: -14, head: 130, facing: 110, armNear: [104, 28, 16], armFar: [106, 28, 16] })
    ]
  },

  "standing-forward-fold": {
    title: "Forward fold",
    box: STANDING_BOX,
    tempoMs: 0,
    loop: "cycle",
    groundY: 196,
    ghost: false,
    poses: [
      standingSide({
        spine: 158,
        spineBow: -16,
        head: 126,
        facing: 105,
        armNear: [106, 30, 18],
        armFar: [108, 30, 18]
      })
    ]
  },

  "standing-side-stretch": {
    title: "Standing side-body stretch",
    box: STANDING_REACH_BOX,
    view: "front",
    tempoMs: 2600,
    loop: "pingpong",
    groundY: 196,
    focus: ["armNear"],
    trace: "handNear",
    // Seen head-on, because a side bend is lateral and vanishes in profile.
    poses: [
      standingFront({ armNear: [278, 22, 12], armFar: [92, -4, 0] }),
      standingFront({ spineBow: 14, armNear: [304, 14, 8], armFar: [98, -4, 0] })
    ]
  },

  "crescent-lunge": {
    title: "Crescent low lunge",
    box: STANDING_REACH_BOX,
    tempoMs: 0,
    loop: "cycle",
    groundY: 196,
    ghost: false,
    poses: [
      {
        hip: [168, 152],
        spine: 268,
        head: 268,
        facing: 186,
        armNear: [280, 6, 4],
        armFar: [282, 6, 4],
        // Front foot planted ahead, back foot long behind: both are on the mat,
        // so both are driven by targets rather than angles.
        legNear: [0, 0, 30],
        legFar: [0, 0, -20],
        ikBend: 1,
        ikLegNear: [140, 196],
        ikLegFar: [222, 192]
      }
    ]
  },

  "supine-overhead-arm-stretch": {
    title: "Overhead arm stretch",
    box: SUPINE_BOX,
    tempoMs: 0,
    loop: "cycle",
    groundY: 162,
    ghost: false,
    poses: [supine({ armNear: [200, 3, 2], armFar: [202, 3, 2] })]
  },

  "hug-knees": {
    title: "Hug knees in towards chest",
    box: SUPINE_BOX,
    tempoMs: 0,
    loop: "cycle",
    groundY: 162,
    ghost: false,
    poses: [
      supine({
        ...CURLED,
        spine: 192,
        legNear: [-120, 118, -8],
        legFar: [-116, 118, -8],
        armNear: [-46, 52, 14],
        armFar: [-42, 52, 14]
      })
    ]
  },

  "figure-four-twist": {
    title: "Lying figure four → twist → switch sides",
    box: SUPINE_BOX,
    tempoMs: 3200,
    loop: "pingpong",
    groundY: 162,
    focus: ["legNear"],
    trace: "kneeNear",
    poses: [
      supine({ legNear: [-105, 100, -10], legFar: [-50, 100, -24] }),
      supine({
        legNear: [-150, 100, -10],
        legFar: [-50, 100, -24],
        // No shoulder spread here: lying on the back it is perpendicular to the
        // mat, so it would drive the far arm straight through the floor. The
        // spine stays level for the same reason: dropping it sends the resting
        // arms below the mat.
        spineBow: 7
      })
    ]
  },

  "windshield-wipers": {
    title: "Bent-knee windshield wipers",
    box: OVERHEAD_BOX,
    view: "overheadUp",
    tempoMs: 2600,
    loop: "pingpong",
    ground: false,
    focus: ["legNear", "legFar"],
    trace: "kneeNear",
    // Overhead: the knees drop side to side, which is invisible in profile.
    poses: [
      {
        hip: [186, 102],
        spine: 180,
        head: 180,
        armNear: [232, 4, 4],
        armFar: [128, -4, -4],
        legNear: [-52, 96, 10],
        legFar: [-44, 96, 10]
      },
      {
        hip: [186, 102],
        spine: 180,
        head: 180,
        armNear: [232, 4, 4],
        armFar: [128, -4, -4],
        legNear: [44, -96, -10],
        legFar: [52, -96, -10]
      }
    ]
  },

  "down-dog": {
    title: "Downward-facing dog",
    box: FLOOR_BOX,
    tempoMs: 0,
    loop: "cycle",
    groundY: 170,
    ghost: false,
    poses: [{ ...DOWN_DOG }]
  },

  "down-dog-childs-seated": {
    title: "Downward-facing dog → child's pose → seated",
    // One box wide enough for all three shapes in the sequence.
    box: "76 64 216 121.5",
    tempoMs: 4200,
    loop: "cycle",
    groundY: 170,
    trace: "hip",
    poses: [
      { ...DOWN_DOG },
      kneelingFold({}),
      {
        hip: [206, 150],
        spine: 268,
        head: 268,
        facing: 190,
        armNear: [96, 4, 70],
        armFar: [98, 4, 68],
        legNear: [130, -132, 2],
        legFar: [133, -135, 2]
      }
    ]
  },

  "seated-straddle": {
    title: "Seated Straddle",
    box: SEATED_FRONT_BOX,
    view: "front",
    tempoMs: 3400,
    loop: "cycle",
    groundY: 196,
    trace: "head",
    // Head-on, because the wide V of the legs is the position and it is
    // invisible side-on. The fold over each leg then reads as a lean, and the
    // class folds right, left, then centre.
    poses: [
      standingFront({
        hip: [150, 162],
        spine: 268,
        head: 268,
        hipSpread: 13,
        legNear: [166, 0, 6],
        legFar: [14, 0, -6]
      }),
      standingFront({
        hip: [150, 162],
        spine: 216,
        head: 212,
        spineBow: -8,
        hipSpread: 13,
        armNear: [56, 8, 0],
        armFar: [60, -6, 0],
        legNear: [166, 0, 6],
        legFar: [14, 0, -6]
      }),
      standingFront({
        hip: [150, 162],
        spine: 324,
        head: 328,
        spineBow: 8,
        hipSpread: 13,
        armNear: [122, -8, 0],
        armFar: [126, 6, 0],
        legNear: [166, 0, 6],
        legFar: [14, 0, -6]
      })
    ]
  },

  "seated-side-twist": {
    title: "Side twist",
    box: SEATED_FRONT_BOX,
    view: "front",
    tempoMs: 3200,
    loop: "pingpong",
    groundY: 196,
    focus: ["armNear", "armFar"],
    trace: "handNear",
    // Cross-legged and turning: the rotation is into the screen, so the hands
    // trading places - one to the opposite knee, one reaching behind - is what
    // has to carry it, with the shoulders narrowing as the chest turns.
    poses: [
      standingFront({
        hip: [150, 166],
        spine: 268,
        head: 268,
        hipSpread: 14,
        shoulderSpread: 15,
        armNear: [118, 26, 0],
        armFar: [62, -26, 0],
        legNear: [162, -152, 6],
        legFar: [18, 152, -6]
      }),
      standingFront({
        hip: [150, 166],
        spine: 268,
        head: 268,
        hipSpread: 14,
        shoulderSpread: 6,
        armNear: [62, 30, 0],
        armFar: [118, -30, 0],
        legNear: [162, -152, 6],
        legFar: [18, 152, -6]
      })
    ]
  },

  "seated-forward-fold": {
    title: "Hamstring stretch → seated forward fold",
    box: SEATED_BOX,
    tempoMs: 3000,
    loop: "pingpong",
    // A stretch is held at the bottom, not bounced into and out of.
    hold: 0.45,
    groundY: 162,
    trace: "head",
    poses: [
      {
        hip: [180, 150],
        spine: 276,
        head: 276,
        facing: 350,
        armNear: [40, 12, 6],
        armFar: [42, 12, 6],
        legNear: [-2, 2, -20],
        legFar: [0, 2, -20]
      },
      {
        hip: [180, 150],
        spine: 322,
        spineBow: -13,
        // Written past 360 rather than wrapped to 8 and 40: interpolation is
        // linear, so the wrapped value would rotate the head and face the long
        // way round - backwards through the body - on the way into the fold.
        head: 368,
        facing: 400,
        armNear: [14, 6, 4],
        armFar: [16, 6, 4],
        legNear: [-2, 2, -20],
        legFar: [0, 2, -20]
      }
    ]
  },

  /* ---- standing legs, band ---- */

  "squat-to-stand": {
    title: "Squat to stand",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 2200,
    loop: "pingpong",
    groundY: 196,
    focus: ["legNear", "legFar"],
    trace: "hip",
    // Feet planted hip-width and the hips travelling the full range, which is
    // what separates this from the held and pulsed squats around it.
    poses: [
      squat(122, [168, 196], [132, 196]),
      squat(158, [168, 196], [132, 196], { armNear: [56, 10, 0], armFar: [60, -10, 0] })
    ]
  },

  "squat-pulse": {
    title: "Squat pulse",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 700,
    loop: "pingpong",
    groundY: 196,
    focus: ["legNear", "legFar"],
    // Small and quick at the bottom; no travel worth tracing.
    poses: [
      squat(154, [168, 196], [132, 196], { armNear: [56, 10, 0], armFar: [60, -10, 0] }),
      squat(164, [168, 196], [132, 196], { armNear: [56, 10, 0], armFar: [60, -10, 0] })
    ]
  },

  "squat-add-arms": {
    title: "Squat -> add arms",
    box: STANDING_REACH_BOX,
    view: "front",
    tempoMs: 2400,
    loop: "pingpong",
    groundY: 196,
    focus: ["armNear", "armFar"],
    trace: "handNear",
    // Down into the chair and the arms lift with it, so the guide has to carry
    // both halves at once.
    poses: [
      squat(122, [168, 196], [132, 196], { armNear: [92, 6, 0], armFar: [96, -6, 0] }),
      squat(158, [168, 196], [132, 196], { armNear: [256, 6, 0], armFar: [260, -6, 0] })
    ]
  },

  "squat-hold": {
    title: "Squat hold",
    box: STANDING_REACH_BOX,
    view: "front",
    tempoMs: 2600,
    loop: "pingpong",
    // A hold, not a pulse: it arrives and stays for most of the loop.
    hold: 0.55,
    groundY: 196,
    trace: "hip",
    // The hold shown as its entry: standing, then low with the arms by the
    // ears, ribs closed and pelvis tucked.
    poses: [
      squat(132, [168, 196], [132, 196], { armNear: [264, 4, 0], armFar: [268, -4, 0] }),
      squat(160, [168, 196], [132, 196], { armNear: [258, 4, 0], armFar: [262, -4, 0], spineBow: 5 })
    ]
  },

  "squat-hold-leg-lift": {
    title: "Squat hold leg lift",
    box: STANDING_REACH_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 196,
    focus: ["legNear"],
    trace: "ankleNear",
    // Side-on, not head-on like the other squats: a leg pointing behind is
    // almost entirely foreshortened from the front, and the point of the
    // exercise is how far back it travels.
    poses: [
      standingSide({
        hip: [160, 146],
        spine: 254,
        head: 254,
        armNear: [244, 4, 4],
        armFar: [246, 4, 4],
        legNear: [30, 4, 8],
        ikLegFar: [148, 194],
        ikBendFar: -1
      }),
      standingSide({
        hip: [160, 146],
        spine: 250,
        head: 250,
        armNear: [244, 4, 4],
        armFar: [246, 4, 4],
        legNear: [4, 4, 8],
        ikLegFar: [148, 194],
        ikBendFar: -1
      })
    ]
  },

  "squat-to-twist": {
    title: "Squat to twist",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 2600,
    loop: "pingpong",
    groundY: 196,
    focus: ["armNear", "armFar"],
    // No traced path: the hand sweeps a wide arc that reads as a circle drawn
    // over the figure and says less than the two poses already do.
    // Down to the squat, then up and round: arms stacked horizontally at
    // shoulder height and the chest turning, which narrows the shoulders.
    poses: [
      squat(158, [168, 196], [132, 196], { armNear: [4, 8, 0], armFar: [8, -8, 0] }),
      squat(138, [168, 196], [132, 196], {
        shoulderSpread: 5,
        armNear: [352, 6, 0],
        armFar: [356, -6, 0]
      })
    ]
  },

  "sumo-squat-hand-lifts": {
    title: "Sumo squat and hand lifts",
    box: STANDING_REACH_BOX,
    view: "front",
    tempoMs: 3000,
    loop: "pingpong",
    groundY: 196,
    focus: ["armNear", "armFar"],
    trace: "handNear",
    // Wide stance with the toes turned out, arms sweeping across on the way
    // down and overhead on the way up.
    poses: [
      squat(152, [196, 196], [104, 196], {
        hipSpread: 14,
        armNear: [40, 14, 0],
        armFar: [44, -14, 0]
      }),
      squat(128, [196, 196], [104, 196], {
        hipSpread: 14,
        armNear: [268, 4, 0],
        armFar: [272, -4, 0]
      })
    ]
  },

  "reverse-lunge": {
    title: "Reverse lunge",
    box: STANDING_BOX,
    tempoMs: 2200,
    loop: "pingpong",
    groundY: 196,
    focus: ["legNear"],
    trace: "kneeNear",
    // Side-on: the back knee dropping is the movement, and it is the thing
    // people let travel forward over the front foot.
    poses: [
      standingSide({ ...lunge(122, [176, 194]), ikLegFar: [160, 194] }),
      standingSide({ ...lunge(150, [212, 194]), ikLegFar: [148, 194] })
    ]
  },

  "reverse-lunge-pulse": {
    title: "Reverse-lunge pulse",
    box: STANDING_BOX,
    tempoMs: 700,
    loop: "pingpong",
    groundY: 196,
    focus: ["legNear"],
    // Held at the bottom of the lunge with the chest lifted.
    poses: [
      standingSide({ ...lunge(146, [212, 194]), ikLegFar: [148, 194] }),
      standingSide({ ...lunge(156, [212, 194]), ikLegFar: [148, 194] })
    ]
  },

  "standing-kickback": {
    title: "Standing kickback",
    box: STANDING_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 196,
    focus: ["legNear"],
    trace: "ankleNear",
    // Weight into the standing leg, hips square, the other leg reaching
    // straight back. Side-on, because that is where the extension shows.
    poses: [
      standingSide({ legNear: [86, 4, 94], legFar: [91, 2, 92] }),
      standingSide({ legNear: [34, 4, 10], spine: 262, legFar: [91, 2, 92] })
    ]
  },

  "kickback-hold-pulse": {
    title: "Kickback hold and pulse",
    box: STANDING_BOX,
    tempoMs: 650,
    loop: "pingpong",
    groundY: 196,
    focus: ["legNear"],
    // The leg never comes back down; it just pulses at the top.
    poses: [
      standingSide({ legNear: [40, 4, 10], spine: 262, legFar: [91, 2, 92] }),
      standingSide({ legNear: [26, 4, 10], spine: 260, legFar: [91, 2, 92] })
    ]
  },

  "side-to-back-kick": {
    title: "Side to back kick",
    // A touch deeper than the standing box: the hinge drops the head and the
    // pointed back foot reaches lower than a plain standing pose does.
    box: "-8 30 320 180",
    tempoMs: 3000,
    loop: "cycle",
    groundY: 196,
    focus: ["legNear"],
    trace: "ankleNear",
    // Three stops: open to the side, back through centre, then hinge forward
    // and kick behind. Drawn side-on so the hinge and the kick read; the
    // opening to the side is the half this camera foreshortens.
    poses: [
      standingSide({ legNear: [72, 6, 26], legFar: [91, 2, 92] }),
      standingSide({ legNear: [88, 4, 26], legFar: [91, 2, 92] }),
      standingSide({ legNear: [24, 4, 10], spine: 236, head: 232, spineBow: -5, legFar: [91, 2, 92] })
    ]
  },

  "single-leg-deadlift-knee-tuck": {
    title: "Single-leg deadlift (SLDL) to knee tuck",
    box: STANDING_BOX,
    tempoMs: 3000,
    loop: "pingpong",
    groundY: 196,
    focus: ["legNear"],
    trace: "kneeNear",
    // Hinge at the hip with the free leg reaching back as a counterweight,
    // then stand and drive the same knee up. The two halves are one movement.
    poses: [
      standingSide({ legNear: [20, 4, 10], spine: 232, head: 228, armNear: [64, 6, 4], armFar: [66, 6, 4], legFar: [91, 2, 92] }),
      standingSide({ legNear: [212, -74, -30], spine: 276, head: 276, armNear: [128, 30, 4], armFar: [130, 28, 4], legFar: [91, 2, 92] })
    ]
  },

  "standing-knee-pulls": {
    title: "Knee pulls alternating legs",
    box: STANDING_BOX,
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 196,
    focus: ["legNear", "legFar"],
    trace: "kneeNear",
    // Tall spine, hands under the knee drawing it to the chest, alternating.
    poses: [
      standingSide({ legNear: [206, -78, -28], armNear: [124, 34, 6], armFar: [126, 32, 6], legFar: [91, 2, 92] }),
      standingSide({ legNear: [89, 2, 94], armNear: [96, 6, 4], armFar: [128, 34, 6], legFar: [206, -78, -28] })
    ]
  },

  "arm-circles": {
    title: "Arm circles",
    box: STANDING_REACH_BOX,
    view: "front",
    tempoMs: 2600,
    loop: "cycle",
    groundY: 196,
    focus: ["armNear", "armFar"],
    trace: "handNear",
    // Head-on, arms straight out to the sides, hands drawing a full circle.
    poses: [0, 1, 2, 3, 4, 5].map((index) => {
      const t = (index / 6) * Math.PI * 2;
      return standingFront({
        armNear: [4 + 26 * Math.cos(t), 4 + 20 * Math.sin(t), 0],
        armFar: [176 - 26 * Math.cos(t), -4 - 20 * Math.sin(t), 0]
      });
    }) as [Pose, ...Pose[]]
  },

  "small-arm-circles": {
    title: "Small arm circles",
    box: STANDING_REACH_BOX,
    view: "front",
    tempoMs: 1200,
    loop: "cycle",
    groundY: 196,
    focus: ["armNear", "armFar"],
    trace: "handNear",
    // The same shape held tight and quick, which is the whole difference.
    poses: [0, 1, 2, 3, 4, 5].map((index) => {
      const t = (index / 6) * Math.PI * 2;
      return standingFront({
        armNear: [2 + 9 * Math.cos(t), 4 + 7 * Math.sin(t), 0],
        armFar: [178 - 9 * Math.cos(t), -4 - 7 * Math.sin(t), 0]
      });
    }) as [Pose, ...Pose[]]
  },

  "shoulder-rolls": {
    title: "Shoulder rolls",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 2400,
    loop: "cycle",
    groundY: 196,
    focus: ["armNear", "armFar"],
    trace: "elbowNear",
    // Fingertips stay on the shoulders and the elbows draw the circle, which
    // is what keeps the movement in the shoulder blade rather than the back.
    poses: [0, 1, 2, 3, 4, 5].map((index) => {
      const t = (index / 6) * Math.PI * 2;
      return standingFront({
        armNear: [24 + 34 * Math.cos(t), 132 + 24 * Math.sin(t), 0],
        armFar: [156 - 34 * Math.cos(t), -132 - 24 * Math.sin(t), 0]
      });
    }) as [Pose, ...Pose[]]
  },

  "hip-circles": {
    title: "Hip circles",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 2800,
    loop: "cycle",
    groundY: 196,
    trace: "hip",
    // Hands on the hips, feet planted: the hips themselves draw the circle, so
    // the pelvis travels and the feet do not.
    poses: [0, 1, 2, 3, 4, 5].map((index) => {
      const t = (index / 6) * Math.PI * 2;
      return standingFront({
        hip: [150 + 15 * Math.cos(t), 124 + 7 * Math.sin(t)],
        spine: 270 - 6 * Math.cos(t),
        head: 270 - 3 * Math.cos(t),
        armNear: [40, 96, 0],
        armFar: [140, -96, 0],
        ikLegNear: [168, 196],
        ikLegFar: [132, 196],
        ikBend: 1,
        ikBendFar: -1
      });
    }) as [Pose, ...Pose[]]
  },

  "static-single-leg-squat": {
    title: "Static single-leg squat",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 1600,
    loop: "pingpong",
    groundY: 196,
    focus: ["legNear"],
    // Held low throughout; only the working heel lifts and lowers, which is
    // too small a travel for a path to add anything the ghost does not.
    poses: [
      squat(140, [170, 196], [130, 196]),
      squat(140, [170, 182], [130, 196])
    ]
  },

  "single-leg-squat-opener": {
    title: "Single leg squat + leg opener",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 2000,
    loop: "pingpong",
    groundY: 196,
    focus: ["legNear"],
    trace: "ankleNear",
    // The heel stays lifted while the knee rotates out to the side.
    poses: [
      squat(140, [166, 184], [130, 194]),
      squat(140, [198, 184], [130, 194])
    ]
  },

  "pulse-leg-openers": {
    title: "Pulse leg openers",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 800,
    loop: "pingpong",
    groundY: 196,
    focus: ["legNear"],
    // A pulse at the open position, too small a travel for a path to add anything.
    poses: [
      squat(140, [182, 184], [130, 196]),
      squat(140, [196, 184], [130, 196])
    ]
  },

  "full-range-single-leg-squat": {
    title: "Full-range single-leg squat",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 2400,
    loop: "pingpong",
    groundY: 196,
    trace: "hip",
    poses: [
      squat(126, [168, 188], [128, 196]),
      squat(150, [172, 188], [130, 196])
    ]
  },

  "side-squat-curtsy": {
    title: "Side squat to curtsy lunge",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 2800,
    loop: "pingpong",
    groundY: 196,
    focus: ["legNear"],
    trace: "ankleNear",
    // Wide to the side, then swept diagonally behind the standing leg.
    poses: [
      squat(142, [206, 194], [128, 194]),
      squat(146, [124, 192], [140, 194])
    ]
  },

  "curtsy-pulse": {
    title: "Curtsy pulse",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 800,
    loop: "pingpong",
    groundY: 196,
    poses: [
      squat(142, [124, 192], [140, 194]),
      squat(152, [124, 192], [140, 194])
    ]
  },

  /* ---- standing upper body, band ---- */

  "standing-punch-outs": {
    title: "Standing punch-outs",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 900,
    loop: "pingpong",
    groundY: 196,
    focus: ["armNear", "armFar"],
    trace: "wristNear",
    equipment: [{ type: "band", from: "wristNear", to: "wristFar", sag: 5 }],
    // Alternating: one arm punches out as the other draws back to the chest.
    poses: [
      standingFront({ armNear: [6, 4, 2], armFar: [170, -110, 0] }),
      standingFront({ armNear: [170, -110, 0], armFar: [174, -4, -2] })
    ]
  },

  "band-hold-out": {
    title: "Band hold out",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 0,
    loop: "cycle",
    groundY: 196,
    ghost: false,
    focus: ["armNear", "armFar"],
    equipment: [{ type: "band", from: "wristNear", to: "wristFar", sag: 7 }],
    poses: [standingFront({ armNear: [6, 4, 2], armFar: [174, -4, -2] })]
  },

  "band-pulse-out": {
    title: "Band pulse out",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 700,
    loop: "pingpong",
    groundY: 196,
    focus: ["armNear", "armFar"],
    equipment: [{ type: "band", from: "wristNear", to: "wristFar", sag: 7 }],
    // Small presses out from the held position, so no path.
    poses: [
      standingFront({ armNear: [16, 10, 4], armFar: [164, -10, -4] }),
      standingFront({ armNear: [4, 2, 2], armFar: [176, -2, -2] })
    ]
  },

  "serve-the-platter": {
    title: "Serve the platter",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 1800,
    loop: "pingpong",
    groundY: 196,
    focus: ["armNear", "armFar"],
    trace: "wristNear",
    equipment: [{ type: "band", from: "wristNear", to: "wristFar", sag: 6 }],
    // Elbows pinned at the ribs, forearms rotating out and back.
    poses: [
      standingFront({ armNear: [80, -74, 4], armFar: [100, 74, -4] }),
      standingFront({ armNear: [80, -40, 4], armFar: [100, 40, -4] })
    ]
  },

  "band-triceps-ups": {
    title: "Band triceps ups (behind back)",
    box: STANDING_BOX,
    tempoMs: 1600,
    loop: "pingpong",
    groundY: 196,
    focus: ["armNear", "armFar"],
    trace: "wristNear",
    // Side on, because the whole movement happens behind the body.
    poses: [
      standingSide({ armNear: [104, 20, 6], armFar: [106, 20, 6] }),
      standingSide({ armNear: [58, 6, 4], armFar: [60, 6, 4] })
    ]
  },

  "band-outward-extension": {
    title: "Band outward extension (behind back)",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 1600,
    loop: "pingpong",
    groundY: 196,
    focus: ["armNear", "armFar"],
    trace: "wristNear",
    equipment: [{ type: "band", from: "wristNear", to: "wristFar", sag: 5 }],
    // Arms low and behind, pressing apart against the band.
    poses: [
      standingFront({ armNear: [76, 6, 2], armFar: [104, -6, -2] }),
      standingFront({ armNear: [46, 6, 2], armFar: [134, -6, -2] })
    ]
  },

  /* ---- HIIT slider legs ---- */

  "slider-reverse-lunge": {
    title: "Single-leg lunge with slider",
    box: STANDING_BOX,
    tempoMs: 2200,
    loop: "pingpong",
    groundY: 196,
    focus: ["legNear"],
    trace: "ankleNear",
    equipment: [{ type: "disc", at: "ankleNear" }],
    // The sliding foot travels along the mat, so it is an IK target.
    poses: [
      standingSide(lunge(122, [164, 194])),
      standingSide(lunge(142, [200, 194]))
    ]
  },

  "slider-lunge-hold-pulse": {
    title: "Isometric hold single-leg lunge with slider with pulse",
    box: STANDING_BOX,
    tempoMs: 800,
    loop: "pingpong",
    groundY: 196,
    equipment: [{ type: "disc", at: "ankleNear" }],
    // Held at the bottom with only a small pulse, so no path: the ghost of the
    // top position says more than a few pixels of travel would.
    poses: [
      standingSide(lunge(138, [200, 194])),
      standingSide(lunge(150, [196, 194]))
    ]
  },

  "slider-side-lunge": {
    title: "Side lunge sliding out",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 2200,
    loop: "pingpong",
    groundY: 196,
    focus: ["legNear"],
    trace: "ankleNear",
    equipment: [{ type: "disc", at: "ankleNear" }],
    poses: [
      squat(126, [166, 196], [132, 196]),
      squat(146, [222, 196], [128, 196])
    ]
  },

  "slider-squat-side-lunge": {
    title: "Isometric hold squat with side lunge",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 1800,
    loop: "pingpong",
    groundY: 196,
    focus: ["legNear"],
    trace: "ankleNear",
    equipment: [{ type: "disc", at: "ankleNear" }],
    // The standing leg stays down in the squat while the other slides out.
    poses: [
      squat(148, [174, 196], [126, 196]),
      squat(148, [224, 196], [126, 196])
    ]
  },

  /* ---- standing, band ---- */

  "banded-biceps-curl": {
    title: "Straight biceps curl",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 1800,
    loop: "pingpong",
    groundY: 196,
    focus: ["armNear", "armFar"],
    trace: "wristNear",
    equipment: [
      { type: "band", from: "ankleNear", to: "wristNear", sag: 6 },
      { type: "band", from: "ankleFar", to: "wristFar", sag: 6 }
    ],
    // Seen from the front, so the body carries real shoulder and hip width
    // rather than collapsing onto its own centre line.
    poses: [
      {
        hip: [150, 122],
        spine: 270,
        head: 270,
        shoulderSpread: 15,
        hipSpread: 11,
        armNear: [88, 4, 0],
        armFar: [92, -4, 0],
        legNear: [86, 4, -86],
        legFar: [94, -4, 86]
      },
      {
        hip: [150, 122],
        spine: 270,
        head: 270,
        shoulderSpread: 15,
        hipSpread: 11,
        armNear: [88, -163, 0],
        armFar: [92, 163, 0],
        legNear: [86, 4, -86],
        legFar: [94, -4, 86]
      }
    ]
  },

  "ring-collarbone-press": {
    title: "Ring press at collarbone",
    box: STANDING_BOX,
    view: "front",
    tempoMs: 1500,
    loop: "pingpong",
    groundY: 196,
    focus: ["armNear"],
    trace: "handNear",
    equipment: [{ type: "ring", from: "shoulderNear", to: "handNear" }],
    // One pad stays planted at the collarbone/shoulder. The palm on the upper
    // pad presses almost straight down, visibly shortening the ring rather than
    // curling it up from the hip like the old borrowed biceps-curl guide.
    poses: [
      standingFront({ armNear: [88, -138, 0], armFar: [92, -4, 0] }),
      standingFront({ armNear: [88, -170, 0], armFar: [92, -4, 0] })
    ]
  },

  // Shavasana used to live here. It is a photograph now: side-on a body lying
  // flat is a horizontal line, and the pose - arms fallen away, palms up, feet
  // dropped open - is invisible from that camera. The picture shows it at a
  // glance, which is worth more than matching the rest of the library.
};

export type RigId = keyof typeof RIGS;

export function getRig(id: string): RigDefinition | undefined {
  return RIGS[id];
}
