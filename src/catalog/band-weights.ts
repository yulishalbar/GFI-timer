import type { ExerciseDefinition } from "../domain/catalog-definition";

export const seatedBandCoreExercises: ExerciseDefinition[] = ([
  ["half-roll-up", "1/2 roll up", "Start seated with knees bent and feet on the mat. Reach hands forward, tuck the pelvis and slowly roll halfway back, then draw the abdominals in to return to seated without pulling on the neck."],
  ["alternating-arm-rows", "Alternating arm rows", "From the seated half-roll-back position, reach both hands forward. Draw one elbow back beside the ribs, return it forward, then row with the other arm. Keep knees bent and feet on the mat."],
  ["alternating-rows-knee-drive", "Alternating arm rows + opposite knee drive", "Stay seated with knees bent. As one elbow rows back, lift the opposite bent knee toward the chest. Return that foot to the mat and reach the arm forward; alternate sides with control."],
  ["single-leg-knee-drive", "Single-leg knee drive", "Sit with knees bent and hands reaching in front. Keep the supporting foot on the mat. Draw the indicated knee toward the chest, then lower that foot to a light tap; repeat without rocking the torso."],
  ["held-leg-side-sweeps", "Hold leg sweeps to the side", "Stay seated, hands reaching forward, supporting foot on the mat. Hold the indicated bent leg lifted and sweep that knee slightly out to the side against the band, then return to center without twisting the hips."],
  ["seated-leg-pulses", "Pulse legs up and down", "Stay seated with hands forward and the supporting foot on the mat. Keep the indicated bent leg lifted and pulse it gently up and down while holding the torso steady."],
  ["teaser-arm-rows", "Teaser to row arms", "Place the band around the arches of both feet before the teaser sets. From seated with knees bent, lean back with the chest lifted and float the feet into a bent-knee teaser. Reach both arms forward, row both elbows back beside the ribs, then reach forward again. Keep toes on the mat as an option."]
] as const).map(([id, name, longDescription], index): ExerciseDefinition => ({
  schemaVersion: 1, id: `seated-band-${id}`, version: id === "teaser-arm-rows" ? 2 : 1, name,
  shortDescription: id === "teaser-arm-rows"
    ? "Band around the arches of both feet for all three teaser-row sets. Keep knees bent and leave hand weights down."
    : "Band above knees. Start seated with legs bent and feet on the mat; leave hand weights down.",
  longDescription, sideSupport: index >= 3 && index <= 5 ? "left-right" : "none",
  tags: ["mat-pilates", "mat", "band", "core", "seated"]
}));

export const weightedArmMovements = [
  ["book-opens", "Book opens", "Stand tall with a light weight in each hand. Bend elbows to 90 degrees at shoulder height, forearms upright. Open the arms to the sides, then bring them together in front without dropping the elbows or arching the back."],
  ["hinged-shoulder-press-sides", "Hinged shoulder press to sides", "Hold light weights and hinge forward from the hips with soft knees and a long spine. Bend elbows beside the torso, then press the arms out to the sides in line with the torso. Bend elbows to return, keeping shoulders away from ears."],
  ["around-the-worlds", "Around the worlds", "Stand tall with light weights beside the hips and palms facing forward. Sweep both arms out to the sides and overhead in a comfortable arc, then lower along the same path. Keep elbows soft and ribs stacked over hips."],
  ["bicep-curl-front-press", "Bicep curl → front press (palms towards chest)", "Stand tall holding light weights with elbows beside the ribs. Curl the weights toward the chest, keeping palms facing towards the chest, then press forward at chest height. Draw the weights back in and lower with control."],
  ["serve-platter", "Serve the platter", "Start with elbows by ribs and palms facing the ceiling; extend arms up to chest height."],
  ["front-raise-around-world", "Front raise + around the world", "Hold light weights in front of the thighs. Raise both arms forward to shoulder height, open them wide, then sweep through a comfortable overhead arc and lower to the sides. Reset with control before the next front raise; avoid lifting the ribs."],
  ["wide-offering-rotation", "Wide offering with rotation", "Stand with soft knees holding light weights, elbows bent beside the ribs and palms up. Offer both arms forward and open them wide while gently rotating the upper torso to one side. Return to center and draw elbows back in; alternate rotation sides while keeping hips facing forward."]
] as const;

export const bandWeightsExercises: ExerciseDefinition[] = [
  {
    schemaVersion: 1, id: "band-weights-donkey-kick-crunch", version: 1,
    name: "Donkey kick + regular crunch", sideSupport: "left-right",
    shortDescription: "Band around thighs; optional fitted ankle weights. Keep both hands and the supporting knee on the mat.",
    longDescription: "From tabletop, lift the indicated bent leg into a donkey kick without arching the back. Lower and draw that knee toward the chest as you round gently through the spine for a regular crunch, then return to tabletop and repeat. Keep the supporting knee grounded throughout; do not lift into downward dog.",
    tags: ["mat-pilates", "mat", "band", "glutes", "core", "quadruped"]
  },
  ...seatedBandCoreExercises,
  ...weightedArmMovements.filter(([id]) => id !== "serve-platter").map(([id, name, longDescription]): ExerciseDefinition => ({
    schemaVersion: 1, id: `band-weights-${id}`, version: 1, name,
    shortDescription: "Use light hand weights; leave the band beside the mat for this arm circuit.",
    longDescription, sideSupport: "none", tags: ["mat-pilates", "weights", "upper-body", "standing"]
  })),
  {
    schemaVersion: 1, id: "band-weights-clamshell-to-teaser", version: 1,
    name: "Clamshell to teaser", sideSupport: "left-right",
    shortDescription: "Leave hand weights down and remove ankle weights. Keep the band above the knees; bend knees for a smaller teaser.",
    longDescription: "Begin side-lying with knees bent and stacked. Open and close the top knee for one clamshell. Using the supporting forearm or hand, roll onto the sitting bones and lift the chest into a bent-knee teaser, reaching the free arm toward the legs. Lower with control onto the same side and repeat. Keep the knees bent or feet down as needed.",
    tags: ["mat-pilates", "mat", "band", "core", "side-lying"]
  }
];
