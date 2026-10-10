import * as THREE from 'three'

// A small third-person engine shared by the walkable games: a renderer, a
// follow camera, a billboard hero cut out of a photo, and input from the
// keyboard or an on-screen pad.

export function createInput() {
  const keys = new Set()
  const state = { x: 0, y: 0, pad: { x: 0, y: 0 }, jump: false, action: false }
  const handlers = { action: [], jump: [] }
  const onDown = (e) => {
    if (e.target.closest?.('input, textarea, [contenteditable]')) return
    const k = e.key.toLowerCase()
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(k)) e.preventDefault()
    if (!keys.has(k)) {
      if (k === ' ') handlers.jump.forEach((f) => f())
      if (k === 'j' || k === 'k' || k === 'x') handlers.action.forEach((f) => f())
    }
    keys.add(k)
  }
  const onUp = (e) => keys.delete(e.key.toLowerCase())
  const blur = () => keys.clear()
  let attached = false
  return {
    state,
    on(name, fn) {
      handlers[name].push(fn)
    },
    trigger(name) {
      handlers[name].forEach((f) => f())
    },
    read() {
      let x = 0
      let y = 0
      if (keys.has('arrowleft') || keys.has('a')) x -= 1
      if (keys.has('arrowright') || keys.has('d')) x += 1
      if (keys.has('arrowup') || keys.has('w')) y += 1
      if (keys.has('arrowdown') || keys.has('s')) y -= 1
      x += state.pad.x
      y += state.pad.y
      const len = Math.hypot(x, y)
      if (len > 1) {
        x /= len
        y /= len
      }
      return { x, y }
    },
    attach() {
      if (attached) return
      attached = true
      window.addEventListener('keydown', onDown)
      window.addEventListener('keyup', onUp)
      window.addEventListener('blur', blur)
    },
    detach() {
      attached = false
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', blur)
      keys.clear()
    },
  }
}

export function loadTexture(src) {
  return new Promise((resolve) => {
    new THREE.TextureLoader().load(src, (t) => {
      t.colorSpace = THREE.SRGBColorSpace
      resolve(t)
    })
  })
}

// The hero: a photo cut-out on a plane that turns to face the camera
export async function createHero(src, height) {
  const tex = await loadTexture(src)
  const aspect = tex.image.width / tex.image.height
  const geo = new THREE.PlaneGeometry(height * aspect, height)
  geo.translate(0, height / 2, 0)
  const sprite = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.9 })
  )
  sprite.castShadow = true
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(height * aspect * 0.42, 24),
    new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.35, depthWrite: false })
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.01
  const group = new THREE.Group()
  const body = new THREE.Group()
  body.add(sprite)
  group.add(body, shadow)
  return {
    group,
    body,
    sprite,
    shadow,
    height,
    vel: new THREE.Vector3(),
    vy: 0,
    grounded: true,
    facing: 1,
    walk: 0,
  }
}

export function createWorld(mount, { background = '#000', fog, fov = 50 } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  mount.appendChild(renderer.domElement)
  renderer.domElement.setAttribute('aria-hidden', 'true')
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(background)
  if (fog) scene.fog = new THREE.Fog(fog.color, fog.near, fog.far)
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.05, 200)

  const resize = () => {
    const w = mount.clientWidth
    const h = mount.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(mount)
  resize()

  const ticks = []
  let paused = false
  let raf = 0
  let last = performance.now()
  const loop = (now) => {
    raf = requestAnimationFrame(loop)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (paused) return
    ticks.forEach((f) => f(dt, now / 1000))
    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(loop)

  return {
    renderer,
    scene,
    camera,
    onTick: (f) => ticks.push(f),
    setPaused: (p) => {
      paused = p
      last = performance.now()
    },
    dispose() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.dispose()
      scene.traverse((o) => {
        o.geometry?.dispose()
        ;[].concat(o.material || []).forEach((m) => {
          m.map?.dispose()
          m.dispose()
        })
      })
      renderer.domElement.remove()
    },
  }
}

// Move the hero relative to the camera's heading, with gravity and bounds
export function stepHero(hero, input, dt, camera, { speed = 4, bounds, jumpSpeed = 6, gravity = 18, collide } = {}) {
  const { x, y } = input.read()
  const fwd = new THREE.Vector3()
  camera.getWorldDirection(fwd)
  fwd.y = 0
  fwd.normalize()
  const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0))
  const move = new THREE.Vector3().addScaledVector(fwd, y).addScaledVector(right, x)
  const moving = move.lengthSq() > 0.01
  const p = hero.group.position
  const next = p.clone().addScaledVector(move, speed * dt)
  if (bounds) {
    next.x = Math.max(bounds.minX, Math.min(bounds.maxX, next.x))
    next.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, next.z))
  }
  if (collide) collide(next, p)
  p.x = next.x
  p.z = next.z
  // Gravity on the body, so the shadow stays on the ground
  hero.vy -= gravity * dt
  hero.body.position.y += hero.vy * dt
  if (hero.body.position.y <= 0) {
    hero.body.position.y = 0
    hero.vy = 0
    hero.grounded = true
  }
  if (moving) {
    if (Math.abs(x) > 0.1) hero.facing = x > 0 ? 1 : -1
    hero.walk += dt * 12
  }
  // A little hop in the step, on the sprite so it never fights the jump
  hero.sprite.position.y = moving && hero.grounded ? Math.abs(Math.sin(hero.walk)) * 0.05 * hero.height : 0
  hero.sprite.scale.x = hero.facing
  hero.sprite.rotation.z = moving && hero.grounded ? Math.sin(hero.walk) * 0.04 : 0
  // Face the camera
  hero.body.rotation.y = Math.atan2(camera.position.x - p.x, camera.position.z - p.z)
  const sh = 1 - Math.min(0.6, hero.body.position.y / 3)
  hero.shadow.scale.set(sh, sh, sh)
  return moving
}

export function jump(hero, speed = 6.5) {
  if (!hero.grounded) return false
  hero.vy = speed
  hero.grounded = false
  return true
}

// A follow camera that trails behind and above, like a cameraman on a cloud
export function followCamera(camera, target, offset, dt, look = new THREE.Vector3(0, 1, 0)) {
  const want = target.clone().add(offset)
  camera.position.lerp(want, 1 - Math.exp(-dt * 4))
  camera.lookAt(target.clone().add(look))
}

export function canvasTex(c, repeat) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(...repeat)
  }
  t.anisotropy = 4
  return t
}
