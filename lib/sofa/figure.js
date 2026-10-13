import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// Leigh on the middle seat once the sofa is finished: leaning back, right
// ankle over the left knee, one arm along the back of the sofa and the other
// hand on the raised knee. Business casual: a tucked tee, a belt, chinos and
// black Vans with white soles. The overlay lays the photo over the head.
// Centimetres, like the sofa.

export const HEAD_RADIUS = 11.5

// Each part carries one of these ids; the composite shader colours by it
export const FIGURE_COLOURS = [
  0x8e9b88, // tee, sage like the shirt in the photo
  0x46556f, // chinos
  0xe3a98b, // skin
  0x2a2d33, // Vans canvas
  0xf1eee6, // Vans sole and side stripe
  0x6b4a32, // belt
]
const TEE = 0
const CHINOS = 1
const SKIN = 2
const CANVAS = 3
const RUBBER = 4
const BELT = 5

const v = (x, y, z) => new THREE.Vector3(x, y, z)
const UP = v(0, 1, 0)

// `sofa` gives the seat top, the front of the seat, the front of the back
// cushions and the top of the back, all measured from the model
export function buildFigure(sofa, makeMaterial) {
  const { seatTop, seatFront, backFront, backTop } = sofa
  const group = new THREE.Group()
  const meshes = []
  const part = (geometry, id, parent = group) => {
    const mesh = new THREE.Mesh(geometry, makeMaterial(id))
    meshes.push(mesh)
    parent.add(mesh)
    return mesh
  }
  const box = (w, h, d, r, id, parent) => part(new RoundedBoxGeometry(w, h, d, 3, r), id, parent)
  // A rounded limb whose ends sit on two joints
  const limb = (a, b, radius, id) => {
    const dir = b.clone().sub(a)
    const mesh = part(new THREE.CapsuleGeometry(radius, Math.max(0.01, dir.length()), 6, 18), id)
    mesh.position.copy(a).add(b).multiplyScalar(0.5)
    mesh.quaternion.setFromUnitVectors(UP, dir.normalize())
    return mesh
  }
  // An Old Skool: toes along +z, sole down; the ankle sits at (0, 3.5, -8)
  const ANKLE = v(0, 3.5, -8)
  const vans = (ankle, rotation) => {
    const shoe = new THREE.Group()
    box(11, 3, 28.5, 1.2, RUBBER, shoe).position.set(0, -5.2, 0.6)
    const upper = box(10.2, 8, 27.4, 3.2, CANVAS, shoe)
    upper.position.set(0, 0.2, 0)
    upper.rotation.x = 0.05
    for (const side of [-1, 1]) {
      const stripe = box(0.7, 1.8, 15, 0.3, RUBBER, shoe)
      stripe.position.set(side * 5.15, 0.4, 2)
      stripe.rotation.x = 0.3
    }
    shoe.rotation.copy(rotation)
    shoe.position.copy(ankle).sub(ANKLE.clone().applyEuler(rotation))
    group.add(shoe)
  }

  // Leaning back from the waist into the cushions
  const lean = 0.36
  const up = v(0, Math.cos(lean), -Math.sin(lean))
  const waist = v(0, seatTop + 12, backFront + 14)
  const spine = (k, x = 0) => waist.clone().addScaledVector(up, k).add(v(x, 0, 0))

  // Tee, tucked in, with a crew neck
  const torso = limb(spine(3), spine(33), 11, TEE)
  torso.scale.set(1.6, 1, 0.95)
  // Square the shoulders the capsule would otherwise slope
  const yoke = box(34, 8, 19, 3.5, TEE)
  yoke.position.copy(spine(37.5))
  yoke.rotation.x = -lean
  const collar = part(new THREE.TorusGeometry(6.2, 1.2, 10, 28), TEE)
  collar.position.copy(spine(44.5))
  collar.rotation.x = Math.PI / 2 - lean

  // Neck and head, held upright to look out of the drawing
  const neckBase = spine(47)
  const head = part(new THREE.SphereGeometry(HEAD_RADIUS, 36, 24), SKIN)
  head.position.copy(neckBase).add(v(0, 14, 4))
  limb(spine(44), head.position.clone().add(v(0, -8, -1)), 5.2, SKIN)

  // Belt and chinos
  const belt = box(36, 3.6, 24.5, 1.6, BELT)
  belt.position.copy(spine(0.5))
  belt.rotation.x = -lean
  const pelvis = box(35, 15, 24, 6, CHINOS)
  pelvis.position.set(0, seatTop + 7, backFront + 18)
  pelvis.rotation.x = -0.2

  // Left leg planted; the right crosses over it, ankle on the left knee
  const hipL = v(9.5, seatTop + 6, backFront + 20)
  const hipR = v(-9.5, seatTop + 6, backFront + 20)
  const kneeL = v(11, seatTop + 7.5, seatFront + 3)
  const ankleL = v(12.5, 10.2, seatFront + 9.5)
  const kneeR = v(-28, seatTop + 18, seatFront - 4.5)
  const ankleR = v(kneeL.x + 3, kneeL.y + 13.1, kneeL.z - 3)
  limb(hipL, kneeL, 7.6, CHINOS)
  limb(kneeL, ankleL, 5.6, CHINOS)
  limb(hipR, kneeR, 7.6, CHINOS)
  limb(kneeR, ankleR, 5.6, CHINOS)
  vans(ankleL, new THREE.Euler(0, 0.12, 0))
  // The crossed foot turns on its side: sole out to the left, toes forward
  vans(ankleR, new THREE.Euler(0, 0.25, Math.PI / 2, 'YXZ'))

  // Arms: short sleeves, then skin. The left lies along the top of the back;
  // the right hand rests on the raised knee
  const arm = (shoulder, elbow, wrist, hand) => {
    const dir = elbow.clone().sub(shoulder).normalize()
    limb(shoulder, shoulder.clone().addScaledVector(dir, 13), 6.1, TEE)
    limb(shoulder, elbow, 4.9, SKIN)
    limb(elbow, wrist, 4.2, SKIN)
    limb(wrist, hand, 3.3, SKIN)
  }
  arm(spine(41, 17), v(44, backTop + 4, backFront - 12), v(62, backTop + 3, backFront - 24), v(66, backTop - 1.5, backFront - 28.5))
  arm(spine(41, -17), v(-28, seatTop + 32, backFront + 18), v(-30, kneeR.y + 10.5, kneeR.z - 12), v(-30.5, kneeR.y + 9.5, kneeR.z - 3))

  return { group, meshes, head }
}

// The cutout photo, and the circle that frames the face in it: centred
// between the ears, eyes a little above the middle, hairline to chin
export const FACE = { src: '/me/face.webp', cx: 234, cy: 312, r: 195 }
