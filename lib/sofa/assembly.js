import * as THREE from 'three'
import { partGeometry } from './geometry'
import { buildSofaParts, checkSofa, createSofaDocument } from './model'
import { STEPS } from './steps'

// The résumé's drawing: SofaPaint's sofa assembled one step per section,
// drawn the way a CAD package plots it. Every part renders into a normal and
// depth buffer; one full-screen pass turns that into ink lines on paper, plus
// an infinite ground grid. Dimensions, phantom lines, assembly paths and part
// balloons are plotted on a 2D canvas above, so they stay crisp at any zoom.


const rgb = (hex) => new THREE.Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255)
const PAL = {
  ink: '#14233B',
  muted: '#55657A',
  rule: '#D5DEE6',
  dim: '#C43D3A',
  phantom: '#7F95AD',
}

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const ramp = (a, b, t) => clamp01((t - a) / (b - a))
const smooth = (x) => x * x * (3 - 2 * x)
const easeOut = (x) => 1 - Math.pow(1 - x, 3)
const lerp = (a, b, k) => a + (b - a) * k

// Camera stops, one per step: azimuth and elevation in degrees, zoom relative
// to a framing that fits the whole sofa, and the height it looks at
const KEYS = [
  { az: 0, el: 89, zoom: 1.3, ty: 30 }, // before the first step: the plan
  { az: 30, el: 38, zoom: 1.3, ty: 30 }, // legs
  { az: 34, el: 28, zoom: 1.26, ty: 34 }, // frame
  { az: 128, el: 24, zoom: 1.28, ty: 40 }, // back, seen from behind
  { az: 10, el: 18, zoom: 1.26, ty: 38 }, // arms
  { az: -30, el: 32, zoom: 1.22, ty: 38 }, // seat cushions
  { az: -14, el: 22, zoom: 1.22, ty: 44 }, // back cushions
  { az: 18, el: 20, zoom: 1.2, ty: 44 }, // pillows
  { az: 40, el: 24, zoom: 1.95, ty: 64 }, // exploded
  { az: 0, el: 5, zoom: 1.28, ty: 42 }, // general arrangement, front elevation
  { az: 28, el: 16, zoom: 1.24, ty: 40 }, // finished
]

// Which step brings each part, where it comes from, and where it goes when
// the drawing explodes
function schedule(part, counters) {
  const { role, id } = part
  if (role === 'leg') {
    const n = counters.leg++
    return { step: 0, delay: n * 0.035, from: [0, 55, 0], explode: [0, 0, 0] }
  }
  if (id === 'main:frame') return { step: 1, delay: 0, from: [0, 80, 0], explode: [0, 26, 0] }
  if (id === 'main:back-frame') return { step: 2, delay: 0, from: [0, 30, -130], explode: [0, 26, -70] }
  if (id === 'main:back-raised') return { step: 2, delay: 0.07, from: [0, 60, -130], explode: [0, 26, -70] }
  if (role === 'arm') {
    const side = id.endsWith('left') ? -1 : 1
    return { step: 3, delay: side < 0 ? 0 : 0.05, from: [side * 140, 25, 0], explode: [side * 78, 26, 0] }
  }
  if (role === 'seat') {
    const n = counters.seat++
    return { step: 4, delay: n * 0.07, from: [0, 45, 130], explode: [(n - 1) * 12, 70, 26] }
  }
  if (role === 'back') {
    const n = counters.back++
    return { step: 5, delay: n * 0.06, from: [0, 80, 50], explode: [(n - 1) * 12, 96, -36] }
  }
  const n = counters.pillow++
  const side = n % 2 === 0 ? -1 : 1
  return { step: 6, delay: n * 0.07, from: [side * 30, 90, 55], explode: [side * 40, 128, -20], spin: side * 0.9 }
}
const ARRIVE = 0.24

const gbufferVert = `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`
const gbufferFrag = `
uniform float uInk;
varying vec3 vNormal;
void main() {
  vec3 n = normalize(vNormal);
  if (!gl_FrontFacing) n = -n;
  gl_FragColor = vec4(n * 0.5 + 0.5, uInk);
}`

const compositeFrag = `
#include <packing>
uniform sampler2D tNormal;
uniform sampler2D tDepth;
uniform vec2 uStep;
uniform float uNear;
uniform float uFar;
uniform mat4 uInvProj;
uniform mat4 uCamWorld;
uniform vec3 uCamPos;
uniform vec3 uInk;
uniform vec3 uRed;
uniform vec3 uPaper;
uniform vec3 uShade;
uniform vec3 uFabric;
uniform float uFabricMix;
uniform float uGrid;
uniform vec3 uGridMinor;
uniform vec3 uGridMajor;
varying vec2 vUv;

float invZ(float d) {
  return -1.0 / perspectiveDepthToViewZ(d, uNear, uFar);
}

float gridLine(vec2 p, float spacing, float width) {
  vec2 q = p / spacing;
  vec2 w = fwidth(q);
  vec2 g = abs(fract(q - 0.5) - 0.5) / max(w, vec2(1e-4));
  return 1.0 - smoothstep(width - 0.5, width + 0.5, min(g.x, g.y));
}

void main() {
  vec4 c = texture2D(tNormal, vUv);
  float dc = texture2D(tDepth, vUv).x;
  bool bg = dc >= 0.99999;
  float izc = bg ? 0.0 : invZ(dc);
  vec3 nc = c.xyz * 2.0 - 1.0;

  float edge = 0.0;
  float ink = bg ? 0.0 : c.a;
  for (int i = 0; i < 4; i++) {
    vec2 dir = i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(0.0, 1.0) : i == 2 ? vec2(0.7071, 0.7071) : vec2(0.7071, -0.7071);
    vec2 o = dir * uStep;
    float d1 = texture2D(tDepth, vUv + o).x;
    float d2 = texture2D(tDepth, vUv - o).x;
    bool b1 = d1 >= 0.99999;
    bool b2 = d2 >= 0.99999;
    vec4 s1 = texture2D(tNormal, vUv + o);
    vec4 s2 = texture2D(tNormal, vUv - o);
    if (!b1) ink = max(ink, s1.a);
    if (!b2) ink = max(ink, s2.a);
    // The outline against the paper
    if (bg != b1 || bg != b2) edge = 1.0;
    if (!bg && !b1 && !b2) {
      // 1/z is linear across a plane in screen space, so its second difference
      // only fires where one surface steps behind another
      float lap = abs(invZ(d1) + invZ(d2) - 2.0 * izc) / izc;
      edge = max(edge, smoothstep(0.004, 0.012, lap));
      vec3 n1 = s1.xyz * 2.0 - 1.0;
      vec3 n2 = s2.xyz * 2.0 - 1.0;
      float bend = max(1.0 - dot(nc, n1), 1.0 - dot(nc, n2));
      edge = max(edge, smoothstep(0.16, 0.34, bend));
    }
  }

  vec3 col;
  if (bg) {
    col = uPaper;
    // The ground plane, found by casting this pixel's ray at y = 0
    vec4 v = uInvProj * vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
    v /= v.w;
    vec3 dir = normalize((uCamWorld * vec4(v.xyz, 0.0)).xyz);
    if (dir.y < -1e-4 && uGrid > 0.0) {
      vec3 p = uCamPos + dir * (-uCamPos.y / dir.y);
      float fade = (1.0 - smoothstep(220.0, 520.0, length(p.xz))) * smoothstep(0.02, 0.12, -dir.y);
      float minor = gridLine(p.xz, 10.0, 0.5);
      float major = gridLine(p.xz, 50.0, 0.7);
      col = mix(col, uGridMinor, minor * fade * uGrid);
      col = mix(col, uGridMajor, major * fade * uGrid);
    }
  } else {
    vec3 L = normalize(vec3(-0.35, 0.6, 0.72));
    float lambert = max(dot(nc, L), 0.0);
    vec3 paper = mix(uShade, uPaper, 0.35 + 0.65 * lambert);
    vec3 fabric = uFabric * (0.58 + 0.5 * lambert);
    col = mix(paper, fabric, uFabricMix);
  }
  vec3 line = mix(uInk, uRed, clamp(ink, 0.0, 1.0));
  gl_FragColor = vec4(mix(col, line, edge), 1.0);
}`

export async function createAssembly({ canvas, overlay, fontEl, reduced = false, onStep }) {
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' })
  } catch {
    return null
  }
  let disposed = false
  // Render at twice the CSS size or more: the browser's downscale smooths the lines
  const scale = Math.min(2.5, Math.max(1.75, window.devicePixelRatio || 1))
  renderer.setPixelRatio(scale)
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace
  renderer.setClearColor(0x8080ff, 0)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(26, 1, 10, 4000)
  const doc = createSofaDocument()
  const parts = buildSofaParts(doc)
  const counters = { leg: 0, seat: 0, back: 0, pillow: 0 }

  const items = parts.map((part) => {
    const geometry = partGeometry(part, doc.construction)
    geometry.computeBoundingBox()
    const material = new THREE.ShaderMaterial({
      uniforms: { uInk: { value: 0 } },
      vertexShader: gbufferVert,
      fragmentShader: gbufferFrag,
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(part.position.x, part.position.y, part.position.z)
    mesh.rotation.set(part.rotation.x, part.rotation.y, part.rotation.z, 'YXZ')
    scene.add(mesh)
    const box = geometry.boundingBox
    const corners = []
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) corners.push(new THREE.Vector3(x, y, z))
    return {
      part,
      mesh,
      material,
      corners,
      home: mesh.position.clone(),
      homeRot: mesh.rotation.clone(),
      ...schedule(part, counters),
    }
  })

  // Measure the assembled sofa the way SofaPaint Desktop places its dimensions
  scene.updateMatrixWorld(true)
  const boxOf = (id) => new THREE.Box3().setFromObject(items.find((i) => i.part.id === id).mesh)
  const model = new THREE.Box3()
  items.forEach((i) => model.expandByObject(i.mesh))
  const d = doc.dimensions
  const inner = d.width - d.armWidth * 2
  const seatW = Math.round(((inner - (d.seatCount - 1) * 1.4) / d.seatCount) * 10) / 10
  const values = { A1: d.width, A2: d.depth, B1: inner, F2: d.armWidth, F2R: d.armWidth, G1: d.height, H1: d.seatHeight, C1: seatW, C2: seatW, C3: seatW, BC1: seatW, BC2: seatW, BC3: seatW }
  const v3 = (x, y, z) => new THREE.Vector3(x, y, z)
  const front = model.max.z
  const armL = boxOf('main:arm-left')
  const armR = boxOf('main:arm-right')
  const back = boxOf('main:back-raised')
  const seats = [0, 1, 2].map((i) => boxOf(`main:seat-${i}`))
  const backs = [0, 1, 2].map((i) => boxOf(`main:back-${i}`))
  const deckY = Math.min(...seats.map((b) => b.min.y))
  const seatTop = Math.max(...seats.map((b) => b.max.y))
  // Each dimension: anchors, the offset it sits at, and when it shows
  const dims = [
    { code: 'A1', a: v3(model.min.x, 0, front), b: v3(model.max.x, 0, front), off: v3(0, 0, 34), unit: true, show: [[1.22, 1.42, 6.95, 7.05], [8.04, 8.22, 99, 100]] },
    { code: 'A2', a: v3(model.max.x, 0, model.min.z), b: v3(model.max.x, 0, front), off: v3(30, 0, 0), unit: true, show: [[1.28, 1.48, 6.95, 7.05], [8.06, 8.24, 99, 100]] },
    { code: 'G1', a: v3(model.max.x, 0, model.min.z), b: v3(model.max.x, back.max.y, model.min.z), off: v3(22, 0, 0), unit: true, show: [[2.28, 2.48, 2.95, 3.05], [8.08, 8.26, 99, 100]] },
    { code: 'F2', a: v3(armL.min.x, armL.max.y, armL.max.z), b: v3(armL.max.x, armL.max.y, armL.max.z), off: v3(0, 10, 0), show: [[3.28, 3.48, 3.95, 4.05]] },
    { code: 'F2R', a: v3(armR.min.x, armR.max.y, armR.max.z), b: v3(armR.max.x, armR.max.y, armR.max.z), off: v3(0, 10, 0), show: [[3.3, 3.5, 3.95, 4.05]] },
    { code: 'B1', a: v3(armL.max.x, deckY, front), b: v3(armR.min.x, deckY, front), off: v3(0, 0, 14), unit: true, show: [[3.34, 3.54, 4.95, 5.05], [8.1, 8.28, 99, 100]] },
    ...seats.map((s, i) => ({ code: `C${i + 1}`, a: v3(s.min.x, s.max.y, s.max.z), b: v3(s.max.x, s.max.y, s.max.z), off: v3(0, 3, 6), show: [[4.34 + i * 0.03, 4.5 + i * 0.03, 4.95, 5.05]] })),
    ...backs.map((s, i) => {
      const z = (s.min.z + s.max.z) / 2
      return { code: `BC${i + 1}`, a: v3(s.min.x, s.max.y, z), b: v3(s.max.x, s.max.y, z), off: v3(0, 10, 0), show: [[5.32 + i * 0.03, 5.5 + i * 0.03, 5.95, 6.05]] }
    }),
    { code: 'H1', a: v3(model.min.x, 0, front), b: v3(model.min.x, seatTop, front), off: v3(-22, 0, 0), unit: true, show: [[6.28, 6.48, 6.95, 7.05], [8.12, 8.3, 99, 100]] },
  ]
  for (const dm of dims) dm.value = values[dm.code]
  const visibility = (show, t) => show.reduce((v, [a, b, c, e]) => Math.max(v, ramp(a, b, t) * (1 - ramp(c, e, t))), 0)
  const envelope = []
  for (const x of [model.min.x, model.max.x]) for (const y of [0, model.max.y]) for (const z of [model.min.z, model.max.z]) envelope.push(v3(x, y, z))
  const center = model.getCenter(new THREE.Vector3())
  const radius = model.getBoundingSphere(new THREE.Sphere()).radius

  // Full-screen composite
  let target = null
  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: {
        tNormal: { value: null },
        tDepth: { value: null },
        uStep: { value: new THREE.Vector2() },
        uNear: { value: camera.near },
        uFar: { value: camera.far },
        uInvProj: { value: new THREE.Matrix4() },
        uCamWorld: { value: new THREE.Matrix4() },
        uCamPos: { value: new THREE.Vector3() },
        uInk: { value: rgb(0x14233b) },
        uRed: { value: rgb(0xc43d3a) },
        uPaper: { value: rgb(0xffffff) },
        uShade: { value: rgb(0xe3e9ef) },
        uFabric: { value: rgb(0xbcb09b) },
        uFabricMix: { value: 0 },
        uGrid: { value: 0 },
        uGridMinor: { value: rgb(0xeef2f5) },
        uGridMajor: { value: rgb(0xdbe3ea) },
      },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: compositeFrag,
      depthTest: false,
      depthWrite: false,
    })
  )
  quad.frustumCulled = false
  const quadScene = new THREE.Scene()
  quadScene.add(quad)
  const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  // Overlay
  const ctx = overlay.getContext('2d')
  const family = (fontEl && getComputedStyle(fontEl).getPropertyValue('--font-barlow-cond').trim()) || 'sans-serif'
  try {
    await Promise.all([document.fonts.load(`500 12px ${family}`), document.fonts.load(`500 13px ${family}`)])
  } catch {}
  if (disposed) return null

  let width = 1
  let height = 1
  let dpr = 1
  const resize = (w, h) => {
    width = Math.max(1, Math.round(w))
    height = Math.max(1, Math.round(h))
    renderer.setSize(width, height, false)
    const pw = Math.round(width * scale)
    const ph = Math.round(height * scale)
    target?.dispose()
    target = new THREE.WebGLRenderTarget(pw, ph, { depthTexture: new THREE.DepthTexture(pw, ph), samples: 0 })
    target.texture.minFilter = target.texture.magFilter = THREE.NearestFilter
    quad.material.uniforms.tNormal.value = target.texture
    quad.material.uniforms.tDepth.value = target.depthTexture
    // About one CSS pixel per sample, so lines plot near 1.2 px wide
    quad.material.uniforms.uStep.value.set((scale * 1.05) / pw, (scale * 1.05) / ph)
    dpr = window.devicePixelRatio || 1
    overlay.width = Math.round(width * dpr)
    overlay.height = Math.round(height * dpr)
    camera.aspect = width / height
    kick()
  }

  // State
  let tTarget = 0
  let tShown = reduced ? 0 : -1
  let introStart = null
  let pointer = { x: 0, y: 0 }
  let pointerShown = { x: 0, y: 0 }
  let lastStep = null
  let visible = true

  const poseAt = (t) => {
    const k = Math.min(KEYS.length - 2, Math.max(0, Math.floor(t + 1)))
    const u = smooth(clamp01(t + 1 - k))
    const a = KEYS[k]
    const b = KEYS[k + 1]
    return { az: lerp(a.az, b.az, u), el: lerp(a.el, b.el, u), zoom: lerp(a.zoom, b.zoom, u), ty: lerp(a.ty, b.ty, u) }
  }

  const placeCamera = (t) => {
    const pose = reduced ? { az: 28, el: 18, zoom: 0.9, ty: 40 } : poseAt(t)
    const az = THREE.MathUtils.degToRad(pose.az + pointerShown.x * 4)
    const el = THREE.MathUtils.degToRad(Math.min(89.5, pose.el + pointerShown.y * 2.5))
    const half = THREE.MathUtils.degToRad(camera.fov / 2)
    const fit = Math.min(half, Math.atan(Math.tan(half) * camera.aspect))
    // A wide strip (the phone's bottom bar) has no notes or title block to
    // clear, so the sofa can fill its height
    const strip = camera.aspect > 2.6
    const dist = (radius / Math.sin(fit)) * pose.zoom * (strip ? 0.6 : 1)
    const tgt = new THREE.Vector3(0, pose.ty, 0)
    camera.position.set(tgt.x + dist * Math.cos(el) * Math.sin(az), tgt.y + dist * Math.sin(el), tgt.z + dist * Math.cos(el) * Math.cos(az))
    // Near the plan view the up vector would flip; keep north pointing up the page
    camera.up.set(0, 1, 0)
    if (pose.el > 85) camera.up.set(-Math.sin(az), 0, -Math.cos(az))
    camera.lookAt(tgt)
    // Lift the sofa above the title block
    camera.setViewOffset(width, height, 0, strip ? 0 : height * 0.06, width, height)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
  }

  const explodeAt = (t) => (reduced ? 0 : smooth(ramp(7.0, 7.32, t)) * (1 - smooth(ramp(7.72, 8.06, t))))

  const placeParts = (t) => {
    const e = explodeAt(t)
    for (const it of items) {
      const start = it.step + it.delay
      const p = clamp01((t - start) / ARRIVE)
      it.progress = p
      it.mesh.visible = t >= start
      const k = reduced ? 0 : 1 - easeOut(p)
      it.mesh.position.set(
        it.home.x + it.from[0] * k + it.explode[0] * e,
        it.home.y + it.from[1] * k + it.explode[1] * e,
        it.home.z + it.from[2] * k + it.explode[2] * e
      )
      it.mesh.rotation.set(it.homeRot.x, it.homeRot.y + (it.spin || 0) * k, it.homeRot.z, 'YXZ')
      // Red ink while a part travels, fading back to black once it lands
      it.material.uniforms.uInk.value = t < start ? 0 : 1 - ramp(start + ARRIVE, start + ARRIVE + 0.18, t)
    }
    return e
  }

  const project = (v) => {
    const p = v.clone().project(camera)
    if (p.z > 1) return null
    return { x: ((p.x + 1) / 2) * width, y: ((1 - p.y) / 2) * height }
  }

  const BOX_EDGES = [
    [0, 1], [2, 3], [4, 5], [6, 7],
    [0, 2], [1, 3], [4, 6], [5, 7],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ]
  const strokeBox = (corners, matrix, color, alpha, dash) => {
    const pts = corners.map((c) => project(matrix ? c.clone().applyMatrix4(matrix) : c))
    if (pts.some((p) => !p)) return
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.setLineDash(dash)
    ctx.beginPath()
    for (const [a, b] of BOX_EDGES) {
      ctx.moveTo(pts[a].x, pts[a].y)
      ctx.lineTo(pts[b].x, pts[b].y)
    }
    ctx.stroke()
    ctx.restore()
  }

  const arrowHead = (from, to, size, color) => {
    const ang = Math.atan2(to.y - from.y, to.x - from.x)
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(to.x, to.y)
    ctx.lineTo(to.x - size * Math.cos(ang - 0.38), to.y - size * Math.sin(ang - 0.38))
    ctx.lineTo(to.x - size * Math.cos(ang + 0.38), to.y - size * Math.sin(ang + 0.38))
    ctx.closePath()
    ctx.fill()
  }

  const pill = (x, y, text, alpha) => {
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.font = `500 12.5px ${family}`
    const w = ctx.measureText(text).width + 14
    const h = 19
    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = PAL.dim
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = PAL.ink
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, x, y + 0.5)
    ctx.restore()
  }

  const drawDimension = (dm, v) => {
    const a = project(dm.a)
    const b = project(dm.b)
    const a2 = project(dm.a.clone().add(dm.off))
    const b2 = project(dm.b.clone().add(dm.off))
    if (!a || !b || !a2 || !b2) return
    const len = Math.hypot(b2.x - a2.x, b2.y - a2.y)
    if (len < 6) return
    const draw = easeOut(v)
    ctx.save()
    ctx.strokeStyle = PAL.dim
    ctx.lineWidth = 1
    ctx.globalAlpha = Math.min(1, v * 1.6)
    // Extension lines from the part out to the dimension line, a little past it
    const ext = (p, q) => {
      const dx = q.x - p.x
      const dy = q.y - p.y
      const l = Math.hypot(dx, dy) || 1
      ctx.beginPath()
      ctx.moveTo(p.x + (dx / l) * 3, p.y + (dy / l) * 3)
      ctx.lineTo(q.x + (dx / l) * 5, q.y + (dy / l) * 5)
      ctx.stroke()
    }
    ext(a, a2)
    ext(b, b2)
    // The dimension line draws outward from its middle, like the résumé's own
    const mx = (a2.x + b2.x) / 2
    const my = (a2.y + b2.y) / 2
    const pa = { x: lerp(mx, a2.x, draw), y: lerp(my, a2.y, draw) }
    const pb = { x: lerp(mx, b2.x, draw), y: lerp(my, b2.y, draw) }
    ctx.beginPath()
    ctx.moveTo(pa.x, pa.y)
    ctx.lineTo(pb.x, pb.y)
    ctx.stroke()
    if (draw > 0.96 && len > 22) {
      arrowHead({ x: mx, y: my }, a2, 7, PAL.dim)
      arrowHead({ x: mx, y: my }, b2, 7, PAL.dim)
    }
    ctx.restore()
    const label = `${dm.code} = ${dm.value}${dm.unit ? ' cm' : ''}`
    pill(mx, my, label, clamp01((v - 0.35) / 0.4))
  }

  const balloon = (anchor, n, alpha, dx, dy) => {
    const p = project(anchor)
    if (!p) return
    const bx = p.x + dx
    const by = p.y + dy
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.strokeStyle = PAL.ink
    ctx.fillStyle = PAL.ink
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    const l = Math.hypot(dx, dy)
    ctx.lineTo(bx - (dx / l) * 12, by - (dy / l) * 12)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(bx, by, 12, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = PAL.ink
    ctx.font = `500 13px ${family}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(n), bx, by + 0.5)
    ctx.restore()
  }

  const triad = () => {
    const ox = 46
    const oy = height - 46
    const m = camera.matrixWorldInverse
    const axes = [
      ['X', new THREE.Vector3(1, 0, 0), PAL.dim],
      ['Y', new THREE.Vector3(0, 1, 0), PAL.ink],
      ['Z', new THREE.Vector3(0, 0, 1), PAL.muted],
    ]
    ctx.save()
    ctx.lineWidth = 1.2
    ctx.font = `500 11px ${family}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const [name, v, color] of axes) {
      const d2 = v.clone().transformDirection(m)
      const ex = ox + d2.x * 24
      const ey = oy - d2.y * 24
      ctx.strokeStyle = color
      ctx.beginPath()
      ctx.moveTo(ox, oy)
      ctx.lineTo(ex, ey)
      ctx.stroke()
      ctx.fillStyle = color
      ctx.fillText(name, ox + d2.x * 34, oy - d2.y * 34)
    }
    ctx.restore()
  }

  const drawOverlay = (t, explode) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    if (!reduced) {
      // The sofa's envelope, in phantom line, from the first stroke to the explode
      const env = ramp(-0.85, -0.45, t) * (1 - ramp(6.85, 7.0, t))
      if (env > 0) strokeBox(envelope, null, PAL.phantom, env * 0.9, [6, 4])
      // Parts about to arrive show where they will go
      for (const it of items) {
        const start = it.step + it.delay
        const pre = ramp(start - 0.42, start - 0.32, t) * (1 - ramp(start, start + ARRIVE * 0.6, t))
        if (pre > 0) {
          it.mesh.updateMatrixWorld()
          const home = new THREE.Matrix4().compose(it.home, new THREE.Quaternion().setFromEuler(it.homeRot), new THREE.Vector3(1, 1, 1))
          strokeBox(it.corners, home, PAL.phantom, pre, [4, 3])
        }
      }
      // Assembly paths for parts on their way in
      for (const it of items) {
        if (it.progress > 0 && it.progress < 1) {
          const k = Math.sin(it.progress * Math.PI)
          const from = project(it.home.clone().add(new THREE.Vector3(...it.from)))
          const to = project(it.home)
          if (from && to) {
            ctx.save()
            ctx.globalAlpha = k
            ctx.strokeStyle = PAL.dim
            ctx.lineWidth = 1
            ctx.setLineDash([5, 4])
            ctx.beginPath()
            ctx.moveTo(from.x, from.y)
            ctx.lineTo(to.x, to.y)
            ctx.stroke()
            ctx.setLineDash([])
            arrowHead(from, to, 8, PAL.dim)
            ctx.restore()
          }
        }
      }
    }
    for (const dm of dims) {
      const v = visibility(dm.show, t)
      if (v > 0.001) drawDimension(dm, v)
    }
    // Balloons number each step's parts in the exploded view
    if (explode > 0.05) {
      const groups = [[0, 'main:leg-1-1'], [1, 'main:frame'], [2, 'main:back-raised'], [3, 'main:arm-right'], [4, 'main:seat-2'], [5, 'main:back-2'], [6, 'main:pillow-1']]
      groups.forEach(([n, id], i) => {
        const it = items.find((x) => x.part.id === id)
        if (!it) return
        const c = new THREE.Vector3()
        new THREE.Box3().setFromObject(it.mesh).getCenter(c)
        balloon(c, n + 1, smooth(ramp(0.4, 1, explode)), 44 + (i % 2) * 10, -30 - (i % 3) * 6)
      })
    }
    triad()
  }

  const render = () => {
    const t = tShown
    const explode = placeParts(t)
    placeCamera(t)
    const u = quad.material.uniforms
    u.uInvProj.value.copy(camera.projectionMatrixInverse)
    u.uCamWorld.value.copy(camera.matrixWorld)
    u.uCamPos.value.copy(camera.position)
    u.uGrid.value = reduced ? 1 : ramp(-0.95, -0.55, t)
    u.uFabricMix.value = smooth(ramp(8.14, 8.42, t))
    renderer.setRenderTarget(target)
    renderer.clear()
    renderer.render(scene, camera)
    renderer.setRenderTarget(null)
    renderer.render(quadScene, quadCamera)
    drawOverlay(t, explode)
    const step = Math.max(0, Math.min(STEPS.length - 1, Math.floor(t + 0.02)))
    if (step !== lastStep) {
      lastStep = step
      onStep?.(step)
    }
  }

  // Render only while something is moving
  let raf = 0
  let last = 0
  const frame = (now) => {
    raf = 0
    if (disposed) return
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016
    last = now
    if (introStart === null) introStart = now
    let settling = false
    if (reduced) tShown = tTarget
    else if (now - introStart < 1900 && tShown < tTarget) {
      // The first visit drafts the sheet: grid, envelope, then the legs
      const k = smooth(clamp01((now - introStart) / 1900))
      tShown = lerp(-1, tTarget, k)
      settling = true
    } else {
      const diff = tTarget - tShown
      tShown += diff * (1 - Math.exp(-dt * 6.5))
      if (Math.abs(diff) < 0.0005) tShown = tTarget
      else settling = true
    }
    const px = pointer.x - pointerShown.x
    const py = pointer.y - pointerShown.y
    pointerShown.x += px * (1 - Math.exp(-dt * 5))
    pointerShown.y += py * (1 - Math.exp(-dt * 5))
    if (Math.abs(px) + Math.abs(py) > 0.002) settling = true
    if (visible) render()
    if (settling) raf = requestAnimationFrame(frame)
    else last = 0
  }
  function kick() {
    if (!raf && !disposed) raf = requestAnimationFrame(frame)
  }

  // Compile every shader before the first frame, then fade the drawing in
  try {
    await renderer.compileAsync(scene, camera)
  } catch {}
  if (disposed) return null

  const facts = { values, checks: checkSofa(values), title: doc.title, fabric: doc.fabric.name, parts: parts.length }

  return {
    facts,
    resize,
    setTarget(t) {
      tTarget = Math.max(-1, Math.min(STEPS.length, t))
      kick()
    },
    setPointer(x, y) {
      if (reduced) return
      pointer = { x, y }
      kick()
    },
    setVisible(v) {
      visible = v
      if (v) kick()
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      items.forEach((i) => {
        i.mesh.geometry.dispose()
        i.material.dispose()
      })
      quad.geometry.dispose()
      quad.material.dispose()
      target?.dispose()
      renderer.dispose()
    },
  }
}
