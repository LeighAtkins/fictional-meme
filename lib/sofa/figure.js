import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// A figure sitting on the middle seat at the end of the drawing: a drafting
// mannequin of rounded limbs, with Leigh's photo laid over the head by the
// overlay. Sizes are centimetres, like the sofa.

export const HEAD_RADIUS = 11.5

export function buildFigure(seatTop, backFront, seatFront, makeMaterial) {
  const hipY = seatTop + 5
  const hipZ = backFront + 12
  // Knees just past the front of the seat, so the shins drop clear of it
  const kneeZ = seatFront + 4
  const thigh = kneeZ - hipZ
  const limb = (w, h, d, x, y, z, tilt = 0) => ({ geometry: new RoundedBoxGeometry(w, h, d, 3, Math.min(w, h, d) * 0.42), position: [x, y, z], tilt })
  const specs = [
    // Torso, leaning a little into the back cushion
    { geometry: new RoundedBoxGeometry(38, 52, 22, 4, 7), position: [0, hipY + 24, hipZ - 2], tilt: -0.1 },
    { geometry: new THREE.SphereGeometry(HEAD_RADIUS, 36, 24), position: [0, hipY + 52 + HEAD_RADIUS - 1, hipZ - 5], tilt: 0, head: true },
    // Legs: thighs forward along the seat, shins down to the floor, shoes
    limb(14, 13, thigh + 6, -10, hipY - 1, hipZ + thigh / 2),
    limb(14, 13, thigh + 6, 10, hipY - 1, hipZ + thigh / 2),
    limb(13, hipY - 4, 13, -10, (hipY - 4) / 2 + 1, kneeZ),
    limb(13, hipY - 4, 13, 10, (hipY - 4) / 2 + 1, kneeZ),
    limb(12, 7, 27, -10, 3.5, kneeZ + 6),
    limb(12, 7, 27, 10, 3.5, kneeZ + 6),
    // Arms: upper arms by the sides, forearms resting on the lap
    limb(11, 36, 11, -24, hipY + 33, hipZ - 1, -0.1),
    limb(11, 36, 11, 24, hipY + 33, hipZ - 1, -0.1),
    limb(11, 11, 38, -23, hipY + 12, hipZ + 15, 0.18),
    limb(11, 11, 38, 23, hipY + 12, hipZ + 15, 0.18),
  ]
  const group = new THREE.Group()
  const meshes = specs.map((sp) => {
    const mesh = new THREE.Mesh(sp.geometry, makeMaterial())
    mesh.position.set(...sp.position)
    mesh.rotation.x = sp.tilt
    group.add(mesh)
    return mesh
  })
  const head = meshes[specs.findIndex((sp) => sp.head)]
  return { group, meshes, head }
}

// The cutout photo: where the face sits in it, and how big a circle takes it
export const FACE = { src: '/me/face.webp', cx: 292, cy: 330, r: 222, w: 584, h: 652 }
