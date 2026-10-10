import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { makeCanvas } from './art'

// Everything in the living room, built from primitives. Consoles and games are
// scaled 1.6× real size so they read from the sofa.

const S = 1.6

export function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.05, ...opts })
}

function box(w, h, d, material, r = 0) {
  const geo = r > 0 ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d)
  const m = new THREE.Mesh(geo, material)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

function cyl(rTop, rBottom, h, material, seg = 32) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, seg), material)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

function canvasTexture(c, repeat) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(...repeat)
  }
  return t
}

function woodCanvas(base = '#6b4426', w = 512, h = 512, planks = 6) {
  const c = makeCanvas(w, h)
  const ctx = c.getContext('2d')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)
  const ph = h / planks
  for (let i = 0; i < planks; i++) {
    ctx.fillStyle = `rgba(${i % 2 ? 0 : 255},${i % 2 ? 0 : 200},${i % 2 ? 0 : 150},0.05)`
    ctx.fillRect(0, i * ph, w, ph)
    for (let g = 0; g < 26; g++) {
      ctx.strokeStyle = `rgba(30,15,5,${0.08 + Math.random() * 0.1})`
      ctx.lineWidth = 1 + Math.random() * 1.5
      ctx.beginPath()
      const y = i * ph + Math.random() * ph
      ctx.moveTo(0, y)
      for (let x = 0; x <= w; x += 32) ctx.lineTo(x, y + Math.sin(x / 50 + g) * 2)
      ctx.stroke()
    }
    ctx.fillStyle = 'rgba(20,10,4,0.55)'
    ctx.fillRect(0, i * ph, w, 2)
    const seam = (i * 173) % w
    ctx.fillRect(seam, i * ph, 2, ph)
  }
  return c
}

export function buildRoom() {
  const g = new THREE.Group()
  const floorTex = canvasTexture(woodCanvas('#5a3a22'), [4, 4])
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), mat('#ffffff', { map: floorTex, roughness: 0.75 }))
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  g.add(floor)

  // Wallpaper: dark navy with a faint stripe
  const wc = makeCanvas(256, 256)
  const wx = wc.getContext('2d')
  wx.fillStyle = '#1c1d3a'
  wx.fillRect(0, 0, 256, 256)
  for (let x = 0; x < 256; x += 32) {
    wx.fillStyle = 'rgba(255,255,255,0.025)'
    wx.fillRect(x, 0, 12, 256)
  }
  const wallMat = mat('#ffffff', { map: canvasTexture(wc, [8, 3]), roughness: 0.95 })
  const back = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.2), wallMat)
  back.position.set(0, 1.6, -2.2)
  back.receiveShadow = true
  g.add(back)
  const left = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.2), wallMat)
  left.rotation.y = Math.PI / 2
  left.position.set(-3, 1.6, 0)
  left.receiveShadow = true
  g.add(left)
  const skirting = box(10, 0.12, 0.03, mat('#e6dccb'))
  skirting.position.set(0, 0.06, -2.18)
  g.add(skirting)

  // A rug under the coffee table
  const rc = makeCanvas(256, 160)
  const rx = rc.getContext('2d')
  rx.fillStyle = '#7a2a2a'
  rx.fillRect(0, 0, 256, 160)
  rx.strokeStyle = '#d9b26a'
  rx.lineWidth = 6
  rx.strokeRect(14, 14, 228, 132)
  rx.strokeStyle = 'rgba(217,178,106,0.5)'
  rx.lineWidth = 2
  rx.strokeRect(28, 28, 200, 104)
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6), mat('#ffffff', { map: canvasTexture(rc), roughness: 1 }))
  rug.rotation.x = -Math.PI / 2
  rug.position.set(0, 0.003, -0.1)
  rug.receiveShadow = true
  g.add(rug)

  return g
}

// Neon sign over the television
export function buildNeon(fonts) {
  const c = makeCanvas(1024, 256)
  const ctx = c.getContext('2d')
  ctx.textAlign = 'center'
  ctx.font = `800 150px ${fonts.archivo}`
  ctx.shadowColor = '#ff4fb0'
  ctx.shadowBlur = 40
  ctx.fillStyle = '#ffd1ec'
  ctx.fillText('itembox', 512, 175)
  ctx.shadowBlur = 20
  ctx.fillText('itembox', 512, 175)
  const tex = canvasTexture(c)
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.3),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false })
  )
  sign.position.set(0, 1.58, -2.18)
  return sign
}

export function buildStand() {
  const g = new THREE.Group()
  const wood = mat('#ffffff', { map: canvasTexture(woodCanvas('#4a2e1a', 256, 256, 3)), roughness: 0.55 })
  const W = 1.9
  const H = 0.56
  const D = 0.55
  const top = box(W, 0.04, D, wood)
  top.position.y = H - 0.02
  const bottom = box(W, 0.04, D, wood)
  bottom.position.y = 0.06
  const sideL = box(0.04, H - 0.04, D, wood)
  sideL.position.set(-W / 2 + 0.02, H / 2 - 0.02 + 0.02, 0)
  const sideR = sideL.clone()
  sideR.position.x = W / 2 - 0.02
  const backP = box(W, H - 0.04, 0.02, mat('#24160c'))
  backP.position.set(0, H / 2, -D / 2 + 0.01)
  g.add(top, bottom, sideL, sideR, backP)
  ;[-1, 1].forEach((sx) =>
    [-1, 1].forEach((sz) => {
      const leg = cyl(0.02, 0.015, 0.04, mat('#1a120a'), 12)
      leg.position.set(sx * (W / 2 - 0.06), 0.02, sz * (D / 2 - 0.06))
      g.add(leg)
    })
  )
  g.userData.top = H
  g.userData.floor = 0.08
  return g
}

export function buildTable() {
  const g = new THREE.Group()
  const wood = mat('#ffffff', { map: canvasTexture(woodCanvas('#6b4426', 256, 256, 2)), roughness: 0.45 })
  const top = box(1.55, 0.05, 0.62, wood, 0.012)
  top.position.y = 0.4
  g.add(top)
  ;[-1, 1].forEach((sx) =>
    [-1, 1].forEach((sz) => {
      const leg = box(0.05, 0.38, 0.05, mat('#3a2414'))
      leg.position.set(sx * 0.7, 0.19, sz * 0.25)
      g.add(leg)
    })
  )
  g.userData.top = 0.425
  return g
}

// The CRT. Its screen is a slightly bulged plane with a shader that draws
// scanlines, a barrel curve and the power-on line.
const screenVert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const screenFrag = `
uniform sampler2D map;
uniform float power;
uniform float time;
varying vec2 vUv;
void main() {
  vec2 c = vUv - 0.5;
  float r2 = dot(c, c);
  vec2 uv = 0.5 + c * (1.0 + 0.12 * r2);
  vec3 col = texture2D(map, uv).rgb;
  col *= 0.86 + 0.14 * sin(uv.y * 900.0);
  col *= 0.97 + 0.03 * sin(time * 50.0);
  float openY = clamp((power - 0.18) / 0.82, 0.0, 1.0);
  float openX = clamp(power / 0.18, 0.0, 1.0);
  float inside = step(abs(uv.y - 0.5), max(openY * 0.5, 0.006)) * step(abs(uv.x - 0.5), openX * 0.5);
  col = mix(vec3(1.4), col, openY) * inside;
  float edge = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  col *= edge * smoothstep(0.78, 0.38, length(c));
  vec3 glass = vec3(0.025, 0.03, 0.035) + 0.05 * (1.0 - vUv.y) + 0.06 * smoothstep(0.2, 0.0, length(c - vec2(-0.22, 0.2)));
  gl_FragColor = vec4(glass + col, 1.0);
}`

export function buildTV() {
  const g = new THREE.Group()
  const plastic = mat('#2a2a2e', { roughness: 0.45 })
  const body = box(0.86, 0.7, 0.5, plastic, 0.05)
  body.position.y = 0.35
  const rear = box(0.62, 0.52, 0.34, mat('#232327'), 0.06)
  rear.position.set(0, 0.36, -0.36)
  g.add(body, rear)

  const W = 0.66
  const H = 0.5
  const geo = new THREE.PlaneGeometry(W, H, 40, 30)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / (W / 2)
    const y = pos.getY(i) / (H / 2)
    pos.setZ(i, 0.03 * (1 - (x * x + y * y) / 2))
  }
  geo.computeVertexNormals()
  const screenCanvas = makeCanvas(640, 480)
  const texture = canvasTexture(screenCanvas)
  const material = new THREE.ShaderMaterial({
    uniforms: { map: { value: texture }, power: { value: 1 }, time: { value: 0 } },
    vertexShader: screenVert,
    fragmentShader: screenFrag,
    toneMapped: false,
  })
  const screen = new THREE.Mesh(geo, material)
  screen.position.set(0, 0.4, 0.251)
  g.add(screen)

  // Bezel lip around the glass
  const bezel = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.34, 4, 1),
    mat('#1c1c20')
  )
  bezel.rotation.z = Math.PI / 4
  bezel.scale.set(1.09, 0.82, 1)
  bezel.position.set(0, 0.4, 0.252)
  g.add(bezel)

  // Control strip: knobs, grille, power light
  for (let i = 0; i < 2; i++) {
    const knob = cyl(0.018, 0.018, 0.02, mat('#151517', { roughness: 0.3 }), 20)
    knob.rotation.x = Math.PI / 2
    knob.position.set(0.3 - i * 0.06, 0.07, 0.255)
    g.add(knob)
  }
  for (let i = 0; i < 9; i++) {
    const slit = box(0.004, 0.035, 0.004, mat('#111'))
    slit.position.set(-0.32 + i * 0.012, 0.07, 0.252)
    g.add(slit)
  }
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.006, 12, 12), new THREE.MeshBasicMaterial({ color: '#30ff60' }))
  led.position.set(0.18, 0.07, 0.252)
  g.add(led)

  g.userData = { screen, screenCanvas, texture, material, led, screenCenter: new THREE.Vector3(0, 0.4, 0.28) }
  return g
}

// Consoles ------------------------------------------------------------------

export function buildN64() {
  const g = new THREE.Group()
  const dark = mat('#2c2d31', { roughness: 0.5 })
  const W = 0.26 * S
  const D = 0.19 * S
  const base = box(W, 0.065, D, dark, 0.015)
  base.position.y = 0.0325
  const hump = box(W * 0.74, 0.05, D * 0.7, mat('#34353a', { roughness: 0.45 }), 0.02)
  hump.position.set(0, 0.075, -0.01)
  g.add(base, hump)
  const slot = box(0.17, 0.012, 0.045, mat('#0b0b0c'))
  slot.position.set(0, 0.1, 0.0)
  g.add(slot)
  const power = box(0.03, 0.012, 0.02, mat('#1c1c1f'))
  power.position.set(-0.13, 0.102, 0.02)
  const reset = power.clone()
  reset.position.x = 0.13
  g.add(power, reset)
  for (let i = 0; i < 4; i++) {
    const port = box(0.045, 0.025, 0.01, mat('#141416'), 0.004)
    port.position.set(-0.12 + i * 0.08, 0.03, D / 2)
    g.add(port)
  }
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.005, 10, 10), new THREE.MeshBasicMaterial({ color: '#330000' }))
  led.position.set(0.17, 0.05, D / 2)
  g.add(led)
  g.userData = { slotTop: 0.1, power, led }
  return g
}

export function buildGameCube() {
  const g = new THREE.Group()
  const purple = mat('#4c3c96', { roughness: 0.4 })
  const W = 0.15 * S
  const H = 0.11 * S
  const D = 0.16 * S
  const body = box(W, H, D, purple, 0.02)
  body.position.y = H / 2
  g.add(body)
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 10, 24, Math.PI), mat('#3a2e78'))
  handle.position.set(0, H - 0.02, -D / 2 - 0.005)
  handle.rotation.x = -Math.PI / 2 + 0.3
  g.add(handle)
  const well = cyl(0.072, 0.072, 0.004, mat('#16112e'), 40)
  well.position.set(0, H + 0.001, 0.005)
  g.add(well)
  // The lid pivots on its back edge
  const pivot = new THREE.Group()
  pivot.position.set(0, H + 0.005, 0.005 - 0.075)
  const lid = cyl(0.075, 0.075, 0.008, mat('#5a4aa8', { roughness: 0.3 }), 40)
  lid.position.set(0, 0, 0.075)
  pivot.add(lid)
  g.add(pivot)
  const button = cyl(0.012, 0.012, 0.006, mat('#2a2050'), 20)
  button.rotation.x = Math.PI / 2
  button.position.set(-0.05, 0.05, D / 2 + 0.002)
  g.add(button)
  for (let i = 0; i < 4; i++) {
    const port = box(0.03, 0.02, 0.006, mat('#1f1840'), 0.003)
    port.position.set(-0.075 + i * 0.05, 0.02, D / 2)
    g.add(port)
  }
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.004, 10, 10), new THREE.MeshBasicMaterial({ color: '#102010' }))
  led.position.set(0.08, 0.05, D / 2 + 0.002)
  g.add(led)
  g.userData = { lid: pivot, discY: H + 0.006, discZ: 0.005, led }
  return g
}

export function buildXbox() {
  const g = new THREE.Group()
  const white = mat('#ebebe8', { roughness: 0.35 })
  const W = 0.309 * S
  const H = 0.083 * S
  const D = 0.258 * S
  const body = box(W, H, D, white, 0.03)
  body.position.y = H / 2
  g.add(body)
  ;[-1, 1].forEach((sx) => {
    const panel = box(0.05, H * 0.8, D * 0.9, mat('#cfd2d6', { roughness: 0.5 }), 0.02)
    panel.position.set(sx * (W / 2 - 0.02), H / 2, 0)
    g.add(panel)
  })
  // The disc tray slides out of the front
  const tray = new THREE.Group()
  const trayBody = box(0.22, 0.012, 0.22, mat('#d9dadb'))
  const recess = cyl(0.1, 0.1, 0.004, mat('#bfc2c5'), 40)
  recess.position.y = 0.006
  tray.add(trayBody, recess)
  tray.position.set(-0.05, H * 0.62, 0.0)
  tray.userData.inZ = 0.0
  tray.userData.outZ = 0.24
  g.add(tray)
  const slotFace = box(0.24, 0.016, 0.004, mat('#1a1a1a'))
  slotFace.position.set(-0.05, H * 0.62, D / 2)
  g.add(slotFace)
  // Ring of light, four quarters
  const ring = new THREE.Group()
  const ringMats = []
  for (let i = 0; i < 4; i++) {
    const m = new THREE.MeshBasicMaterial({ color: '#203020' })
    ringMats.push(m)
    const q = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.004, 8, 12, Math.PI / 2 - 0.15), m)
    q.rotation.z = (i * Math.PI) / 2 + 0.075
    ring.add(q)
  }
  ring.position.set(0.17, H * 0.55, D / 2 + 0.003)
  const pwr = cyl(0.016, 0.016, 0.006, mat('#c9c9c9', { metalness: 0.6, roughness: 0.3 }), 24)
  pwr.rotation.x = Math.PI / 2
  pwr.position.copy(ring.position)
  g.add(ring, pwr)
  g.userData = { tray, ringMats }
  return g
}

// Games ---------------------------------------------------------------------

export function buildCart(coverCanvas, gold) {
  const g = new THREE.Group()
  const shell = gold
    ? mat('#c9a227', { metalness: 0.75, roughness: 0.3 })
    : mat('#8f8f93', { roughness: 0.55 })
  const W = 0.116 * S
  const H = 0.075 * S
  const T = 0.02 * S
  const body = box(W, H, T, shell, 0.008)
  g.add(body)
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 0.86, H * 0.66),
    new THREE.MeshStandardMaterial({ map: canvasTexture(coverCanvas), roughness: 0.6 })
  )
  label.position.set(0, H * 0.08, T / 2 + 0.001)
  g.add(label)
  // Grip ridges
  for (let i = 0; i < 5; i++) {
    ;[-1, 1].forEach((sx) => {
      const r = box(0.004, 0.03, T * 1.02, shell)
      r.position.set(sx * (W / 2 - 0.01 - i * 0.006), H / 2 - 0.02, 0)
      g.add(r)
    })
  }
  g.userData = { height: H, kind: 'cart' }
  return g
}

export function buildCase(coverCanvas, discCanvas, style) {
  const g = new THREE.Group()
  const W = 0.135 * S
  const H = 0.19 * S
  const T = 0.014 * S
  const shell = style === 'xbox' ? mat('#2f7a2f', { roughness: 0.35, transparent: true, opacity: 0.92 }) : mat('#111113', { roughness: 0.4 })
  const body = box(W, H, T, shell, 0.006)
  g.add(body)
  const cover = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 0.94, H * 0.94),
    new THREE.MeshStandardMaterial({ map: canvasTexture(coverCanvas), roughness: 0.5 })
  )
  cover.position.z = T / 2 + 0.001
  g.add(cover)
  if (style === 'xbox') {
    const band = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.94, H * 0.08), new THREE.MeshStandardMaterial({ color: '#3fae3f', roughness: 0.4 }))
    band.position.set(0, H * 0.43, T / 2 + 0.002)
    g.add(band)
  }
  const radius = style === 'xbox' ? 0.06 * S : 0.04 * S
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 0.002, 48),
    [
      mat('#d9dde2', { metalness: 0.9, roughness: 0.15 }),
      new THREE.MeshStandardMaterial({ map: canvasTexture(discCanvas), metalness: 0.2, roughness: 0.4 }),
      mat('#cfd6de', { metalness: 1, roughness: 0.1 }),
    ]
  )
  disc.castShadow = true
  disc.visible = false
  g.add(disc)
  g.userData = { height: H, kind: 'case', disc, radius }
  return g
}
