import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { DEFAULT_CONSTRUCTION } from './model'

// Part geometry from SofaPaint's sofa3d module (OpenPaint: upholstery.ts,
// profiles.ts, frame-upholstery.ts and renderer.ts), ported as-is apart from
// the cushion shapes this sofa does not use.

export function roundedFrameGeometry(w, h, d, radius) {
  const geometry = new THREE.BoxGeometry(w, h, d, 48, 16, 48)
  const positions = geometry.getAttribute('position')
  const point = new THREE.Vector3()
  const core = new THREE.Vector3()
  const delta = new THREE.Vector3()
  for (let i = 0; i < positions.count; i++) {
    point.fromBufferAttribute(positions, i)
    core.set(
      THREE.MathUtils.clamp(point.x, -w / 2 + radius, w / 2 - radius),
      THREE.MathUtils.clamp(point.y, -h / 2 + radius, h / 2 - radius),
      THREE.MathUtils.clamp(point.z, -d / 2 + radius, d / 2 - radius)
    )
    delta.copy(point).sub(core).normalize().multiplyScalar(radius)
    point.copy(core).add(delta)
    positions.setXYZ(i, point.x, point.y, point.z)
  }
  geometry.computeVertexNormals()
  return geometry
}

function normalizeSize(geometry, part) {
  geometry.computeBoundingBox()
  const box = geometry.boundingBox
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  geometry.translate(-center.x, -center.y, -center.z)
  geometry.scale(part.size.x / size.x, part.size.y / size.y, part.size.z / size.z)
  geometry.computeVertexNormals()
  return geometry
}

export function cushionGeometry(part) {
  const { x: w, y: h, z: d } = part.size
  const seat = part.role === 'seat'
  let geometry
  if (part.shape === 'knife' || part.shape === 'half-knife') {
    // Sewn panels meet at a narrow perimeter; the centre carries the filling
    geometry = new THREE.BoxGeometry(w, h, d, 40, seat ? 8 : 40, seat ? 40 : 8)
    const positions = geometry.getAttribute('position')
    for (let i = 0; i < positions.count; i++) {
      let x = positions.getX(i)
      let y = positions.getY(i)
      let z = positions.getZ(i)
      const u = x / (w / 2)
      const v = seat ? z / (d / 2) : y / (h / 2)
      const panel = Math.pow(Math.max(0, (1 - u * u * u * u) * (1 - v * v * v * v)), 0.42)
      const fullness = 0.1 + 0.9 * panel
      const phase = [...part.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) * 0.37
      const crease = Math.exp(-Math.pow((u - 0.68) / 0.09, 2)) - 0.65 * Math.exp(-Math.pow((u + 0.52) / 0.12, 2))
      const folds = -crease * Math.exp(-Math.pow((v + 0.82) / 0.23, 2)) * panel * part.softness * 0.12
      const thickness = fullness + folds
      if (seat) y *= thickness
      else {
        z *= thickness
        y -= part.softness * Math.min(1.6, h * 0.04) * (1 - u * u) * (1 - v * v)
        z *= 1 - 0.18 * v * part.softness
        y -= h * 0.095 * part.softness * Math.exp(-Math.pow((u - 0.16) / 0.65, 2)) * Math.pow(Math.max(0, (v + 1) / 2), 4)
        z += d * 0.018 * panel * Math.sin(u * 3.1 + phase) * part.softness
        x += w * 0.008 * panel * Math.sin(v * 2.4 + phase) * part.softness
      }
      x *= (1 + part.taper * v) * (1 - 0.045 * Math.pow(Math.abs(v), 8))
      if (seat) z *= 1 - 0.045 * Math.pow(Math.abs(u), 8)
      else y *= 1 - 0.045 * Math.pow(Math.abs(u), 8)
      positions.setXYZ(i, x, y, z)
    }
  } else if (seat) {
    // A boxed seat has a low gusset and a broad filled upper panel, not a flat slab
    geometry = new THREE.BoxGeometry(w, h, d, 48, 12, 48)
    const positions = geometry.getAttribute('position')
    const radius = Math.min(w, d) * 0.055
    for (let i = 0; i < positions.count; i++) {
      let x = positions.getX(i)
      let y = positions.getY(i)
      let z = positions.getZ(i)
      const u = x / (w / 2)
      const v = z / (d / 2)
      const t = y / h + 0.5
      const crown = Math.pow(Math.max(0, (1 - u * u) * (1 - v * v)), 0.62)
      const cx = Math.max(-w / 2 + radius, Math.min(w / 2 - radius, x))
      const cz = Math.max(-d / 2 + radius, Math.min(d / 2 - radius, z))
      const dx = x - cx
      const dz = z - cz
      const length = Math.hypot(dx, dz)
      if (length > radius) {
        x = cx + (dx * radius) / length
        z = cz + (dz * radius) / length
      }
      y = -h / 2 + h * t * (0.65 + 0.35 * crown)
      const bulge = 1 + 0.018 * Math.sin(t * Math.PI)
      positions.setXYZ(i, x * bulge * (1 + part.taper * t), y, z * bulge)
    }
  } else {
    geometry = roundedFrameGeometry(w, h, d, Math.min(w, h, d) * (0.1 + part.softness * 0.3))
    const positions = geometry.getAttribute('position')
    for (let i = 0; i < positions.count; i++) {
      let x = positions.getX(i)
      const y = positions.getY(i)
      let z = positions.getZ(i)
      const edge = Math.min(1, Math.pow(Math.abs(x / (w / 2)), 4) + Math.pow(Math.abs(y / (h / 2)), 4))
      z *= 1 - part.loft * 0.65 * edge
      x *= 1 + part.taper * ((y / h) * 2)
      positions.setXYZ(i, x, y, z)
    }
  }
  return normalizeSize(geometry, part)
}

// The rolled arm: a roll overhanging an inset upright
export function rolledArmOutline(width, height, construction = DEFAULT_CONSTRUCTION) {
  const x = width / 2
  const bottom = -height / 2
  const top = height / 2
  const r = Math.min(construction.armRollRadius || width * 0.5, height * 0.4)
  const stem = x - Math.min(width * 0.95, construction.armStemWidth || width * 0.66)
  const flare = Math.min(construction.armFlare, width * 0.3)
  const shape = new THREE.Shape()
  shape.moveTo(stem + flare, bottom)
  shape.lineTo(x - flare * 0.25, bottom)
  shape.lineTo(x, top - r)
  shape.bezierCurveTo(x, top - r * 0.43, x - width * 0.18, top, 0, top)
  shape.bezierCurveTo(-width * 0.48, top, -x, top - r * 0.47, -x, top - r)
  shape.bezierCurveTo(-x, top - r * 1.6, stem - width * 0.05, top - r * 1.77, stem, top - r * 1.78)
  shape.lineTo(stem + flare, bottom)
  shape.closePath()
  return shape
}

export function extrudeArm(part, construction = DEFAULT_CONSTRUCTION) {
  const { x: w, y: h, z: d } = part.size
  const geometry = new THREE.ExtrudeGeometry(rolledArmOutline(w, h, construction), {
    depth: d,
    bevelEnabled: false,
    curveSegments: 24,
    steps: 1,
  })
  geometry.translate(0, 0, -d / 2)
  if (part.id.endsWith('arm-right')) geometry.rotateY(Math.PI)
  // Smooth across the roll, sharp where it meets the end panels, so the line
  // drawing traces the arm's shape rather than its facets
  const creased = toCreasedNormals(geometry, Math.PI / 5)
  geometry.dispose()
  return creased
}

// The upper back's cross section: a raked front face and a softened crown
function backProfile(depth, rise, construction) {
  const topDepth = Math.min(depth, construction.backTopThickness)
  const rake = Math.min(depth - topDepth, construction.backRake)
  const rear = -depth / 2
  const front = depth / 2
  return [
    { z: rear, y: -rise / 2 },
    { z: front, y: -rise / 2 },
    { z: front - rake, y: rise / 2 },
    { z: front - rake - topDepth, y: rise / 2 - construction.backTopDrop },
  ]
}

export function extrudeBack(part, construction) {
  const points = backProfile(part.size.z, part.size.y, construction)
  const shape = new THREE.Shape()
  points.forEach((p, i) => (i ? shape.lineTo(p.z, p.y) : shape.moveTo(p.z, p.y)))
  shape.closePath()
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: part.size.x, bevelEnabled: false })
  const positions = geometry.getAttribute('position')
  for (let i = 0; i < positions.count; i++) {
    const z = positions.getX(i)
    const x = positions.getZ(i) - part.size.x / 2
    positions.setXYZ(i, x, positions.getY(i), z)
  }
  // The axis swap reverses the winding
  const index = geometry.index
  if (index)
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i)
      index.setX(i, index.getX(i + 2))
      index.setX(i + 2, a)
    }
  else
    for (let i = 0; i < positions.count; i += 3) {
      const a = new THREE.Vector3().fromBufferAttribute(positions, i)
      const b = new THREE.Vector3().fromBufferAttribute(positions, i + 2)
      positions.setXYZ(i, b.x, b.y, b.z)
      positions.setXYZ(i + 2, a.x, a.y, a.z)
    }
  geometry.computeVertexNormals()
  return geometry
}

// Which geometry each part gets, in the same order SofaPaint's renderer decides
export function partGeometry(part, construction) {
  const { x: w, y: h, z: d } = part.size
  if (['seat', 'back', 'pillow'].includes(part.role)) return cushionGeometry(part)
  if (part.role === 'leg' && part.shape === 'round') return new THREE.CylinderGeometry(w * 0.43, w * 0.34, h, 16)
  if (part.role === 'arm' && part.shape === 'round') return extrudeArm(part, construction)
  if (part.profile === 'raised-back') return extrudeBack(part, construction)
  const radius = Math.min(w, h, d) * (part.role === 'leg' ? 0.035 : part.role === 'frame' ? 0.07 : 0.23)
  return new RoundedBoxGeometry(w, h, d, 5, radius)
}
