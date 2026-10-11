// The sofa on the résumé is SofaPaint's own parametric model, ported from
// OpenPaint (src/modules/sofa3d/model.ts) and trimmed to one three-seat
// module: a snug base, a raised back and rolled arms. Units are centimetres.

export const DEFAULT_CONSTRUCTION = {
  frontExtension: 0,
  backTopThickness: 10,
  backRake: 6,
  backTopDrop: 1,
  armRollRadius: 0,
  armStemWidth: 0,
  armFlare: 0,
  armSetback: 0,
  backCushionHeight: 0,
  frameHeight: 0,
  legStyle: 'round',
  legWidth: 4.5,
}

export function createSofaDocument() {
  return {
    title: 'Three-seat sofa, rolled arm',
    dimensions: {
      width: 278,
      depth: 96,
      height: 82,
      armWidth: 17,
      armHeight: 62,
      seatHeight: 43,
      seatThickness: 17,
      backThickness: 16,
      legHeight: 9,
      seatCount: 3,
    },
    style: { arm: 'round', cushion: 'boxed' },
    construction: { ...DEFAULT_CONSTRUCTION },
    fabric: { name: 'Oat linen', colour: '#bcb09b' },
    pillows: 2,
  }
}

// Every part with its assembled size, position and rotation, as buildSofaParts
// produces them in SofaPaint. One change: the seat cushions fill the space
// between the arms exactly, so the drawing's fit check passes the way a
// well-measured order does.
export function buildSofaParts(doc) {
  const d = doc.dimensions
  const c = { ...DEFAULT_CONSTRUCTION, ...doc.construction }
  const parts = []
  const add = (id, name, role, size, position, shape, { tilt = 0, roll = 0, profile } = {}) =>
    parts.push({
      id: `main:${id}`,
      name,
      role,
      size,
      position,
      rotation: { x: tilt, y: 0, z: roll },
      shape,
      profile,
      loft: role === 'pillow' ? 0.65 : 0.16,
      taper: 0,
      softness: role === 'pillow' ? 0.7 : 0.25,
      outline: 'rect',
    })

  const aw = d.armWidth
  const inner = Math.max(15, d.width - aw * 2)
  const baseH = Math.max(8, d.seatHeight - d.seatThickness - d.legHeight)
  const floor = d.legHeight
  const armTop = c.frameHeight || d.armHeight

  add(
    'frame',
    'Frame',
    'frame',
    { x: d.width, y: baseH, z: d.depth + c.frontExtension },
    { x: 0, y: d.legHeight + baseH / 2, z: c.frontExtension / 2 },
    'boxed'
  )

  const lowerHeight = armTop - floor
  add(
    'back-frame',
    'Back frame',
    'frame',
    { x: d.width, y: lowerHeight, z: d.backThickness },
    { x: 0, y: floor + lowerHeight / 2, z: -d.depth / 2 + d.backThickness / 2 },
    'boxed'
  )
  const rise = Math.max(1, d.height - armTop)
  add(
    'back-raised',
    'Raised back',
    'frame',
    { x: inner, y: rise, z: d.backThickness },
    { x: 0, y: armTop + rise / 2, z: -d.depth / 2 + d.backThickness / 2 },
    'boxed',
    { profile: 'raised-back' }
  )

  for (const side of ['left', 'right'])
    add(
      `arm-${side}`,
      `${side === 'left' ? 'Left' : 'Right'} arm`,
      'arm',
      { x: aw, y: Math.max(10, d.armHeight - floor), z: Math.max(10, d.depth - c.armSetback) },
      { x: ((side === 'left' ? -1 : 1) * (d.width - aw)) / 2, y: (d.armHeight + floor) / 2, z: -c.armSetback / 2 },
      doc.style.arm
    )

  const gap = 1.4
  const seatWidth = Math.max(10, (inner - (d.seatCount - 1) * gap) / d.seatCount)
  const seatDepth = d.depth - d.backThickness - 3
  const bh = c.backCushionHeight || Math.max(15, d.height - d.seatHeight + 3)
  for (let i = 0; i < d.seatCount; i++) {
    const cx = -inner / 2 + seatWidth / 2 + i * (seatWidth + gap)
    add(
      `seat-${i}`,
      `Seat cushion ${i + 1}`,
      'seat',
      { x: seatWidth, y: d.seatThickness, z: seatDepth },
      { x: cx, y: d.seatHeight - d.seatThickness / 2, z: d.backThickness / 2 },
      doc.style.cushion
    )
    add(
      `back-${i}`,
      `Back cushion ${i + 1}`,
      'back',
      { x: seatWidth, y: bh, z: Math.max(10, d.backThickness * 0.8) },
      { x: cx, y: d.seatHeight + bh / 2 - 3, z: -d.depth / 2 + d.backThickness * 1.3 + 5 },
      doc.style.cushion,
      { tilt: -0.1 }
    )
  }

  for (const x of [-1, 1])
    for (const z of [-1, 1])
      add(
        `leg-${x}-${z}`,
        'Leg',
        'leg',
        { x: c.legWidth, y: Math.max(0.5, d.legHeight), z: c.legWidth },
        { x: x * (d.width / 2 - 9), y: d.legHeight / 2, z: z * (d.depth / 2 - 9) },
        c.legStyle === 'square' ? 'square' : 'round'
      )

  for (let i = 0; i < doc.pillows; i++) {
    const side = i % 2 === 0 ? -1 : 1
    add(
      `pillow-${i}`,
      `Accent pillow ${i + 1}`,
      'pillow',
      { x: 42, y: 42, z: 13 },
      {
        x: side * (inner / 2 - 29) - Math.floor(i / 2) * 28 * side,
        y: d.seatHeight + 19,
        z: -d.depth / 2 + d.backThickness + 25 + Math.floor(i / 2) * 6,
      },
      'knife',
      { tilt: -0.22, roll: side * -0.17 }
    )
  }
  return parts
}

// The measuring-guide codes SofaPaint Desktop checks, with the rules it uses
export const CODE_NAMES = {
  A1: 'Overall width',
  A2: 'Overall depth',
  B1: 'Seat width between arms',
  F2: 'Arm width (left)',
  F2R: 'Arm width (right)',
  G1: 'Back height',
  H1: 'Seat height',
  C1: 'Seat cushion 1',
  C2: 'Seat cushion 2',
  C3: 'Seat cushion 3',
  BC1: 'Back cushion 1',
  BC2: 'Back cushion 2',
  BC3: 'Back cushion 3',
}

const round = (n) => Math.round(n * 10) / 10

// Same arithmetic as SofaPaint Desktop's rules engine (check/rules.ts)
export function checkSofa(values) {
  const sum = (codes) => round(codes.reduce((t, c) => t + values[c], 0))
  const arms = sum(['B1', 'F2', 'F2R'])
  const seats = sum(['C1', 'C2', 'C3'])
  const backs = sum(['BC1', 'BC2', 'BC3'])
  const fits = (actual, space, over, under) => {
    const diff = round(actual - values[space])
    return diff <= over && -diff <= under
  }
  return [
    { id: 'arms', pass: Math.abs(arms - values.A1) <= 3, text: `B1 + F2 + F2R = ${arms}, matches A1 (${values.A1})` },
    { id: 'symmetry', pass: Math.abs(values.F2 - values.F2R) <= 1, text: `F2 (${values.F2}) agrees with F2R (${values.F2R})` },
    { id: 'seats', pass: fits(seats, 'B1', 3, 3), text: `C1 + C2 + C3 = ${seats}, fits B1 (${values.B1})` },
    { id: 'backs', pass: fits(backs, 'B1', 10, 3), text: `BC1 + BC2 + BC3 = ${backs}, fits B1 (${values.B1})` },
  ]
}
