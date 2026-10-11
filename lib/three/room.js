import * as THREE from 'three'
import { games } from '../data'
import { drawBoot, drawCover, drawDisc, drawIdle, loadPortraits, makeNoise, readFonts } from './art'
import { buildCase, buildCart, buildGameCube, buildN64, buildNeon, buildRoom, buildStand, buildTable, buildTV, buildXbox } from './props'
import { createTweener, ease } from './tween'

// The living room scene: a CRT, three consoles and the games on the coffee
// table. Loaded on demand so the words on the landing page never wait for it.

export const CONSOLE_OF = { hyrule: 'n64', castle: 'n64', attache: 'gc', wasteland: 'xbox', normandy: 'xbox' }
export const CONSOLE_NAME = { n64: 'Nintendo 64', gc: 'GameCube', xbox: 'Xbox 360' }
const TABLE_ORDER = ['hyrule', 'castle', 'attache', 'wasteland', 'normandy']
const DISC_COLOR = { attache: '#7a1e1e', wasteland: '#1f5f2a', normandy: '#24324a' }
const TV_GLOW = { wasteland: '#41f593', normandy: '#ff9a3c', attache: '#ff5040' }

function homeView(aspect) {
  if (aspect < 0.8) return { pos: new THREE.Vector3(0, 2.3, 3.3), look: new THREE.Vector3(0, 0.15, -0.75), fov: 52 }
  if (aspect < 1.3) return { pos: new THREE.Vector3(0, 1.55, 2.7), look: new THREE.Vector3(0, 0.5, -0.9), fov: 44 }
  return { pos: new THREE.Vector3(0.0, 1.5, 1.95), look: new THREE.Vector3(-0.32, 0.4, -0.95), fov: 42 }
}

// Wait for every face the box art uses; document.fonts.ready alone does not
// fetch fonts nothing on the page has asked for yet
async function loadFonts(fonts) {
  const faces = [
    `800 40px ${fonts.archivo}`,
    `700 40px ${fonts.cinzel}`,
    `600 40px ${fonts.cinzel}`,
    `40px ${fonts.luckiest}`,
    `600 40px ${fonts.oswald}`,
    `400 40px ${fonts.oswald}`,
    `700 40px ${fonts.rajdhani}`,
    `600 40px ${fonts.rajdhani}`,
    `40px ${fonts.mono}`,
  ]
  await Promise.all(faces.map((f) => document.fonts.load(f).catch(() => {})))
}

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()))

// Upload every texture a frame at a time, so the first rendered frame only draws
async function uploadTextures(renderer, scene) {
  const seen = new Set()
  scene.traverse((o) => {
    for (const m of [].concat(o.material || [])) {
      if (m.map) seen.add(m.map)
      if (m.uniforms?.map?.value) seen.add(m.uniforms.map.value)
    }
  })
  for (const t of seen) {
    renderer.initTexture(t)
    await nextFrame()
  }
}

export async function createRoom(mount, { fontEl, getFocusId, onFocus, onBusy, onEnter, onReady, onInsertStart, play }) {
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  } catch {
    return null
  }
  let disposed = false
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  // Shadows only re-render when something on the table actually moves
  renderer.shadowMap.autoUpdate = false
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.domElement.setAttribute('aria-hidden', 'true')
  renderer.domElement.style.opacity = '0'
  renderer.domElement.style.transition = 'opacity 600ms ease'
  mount.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#0b0b18')
  scene.fog = new THREE.Fog('#0b0b18', 4, 9)
  const camera = new THREE.PerspectiveCamera(42, 1, 0.02, 30)
  const look = new THREE.Vector3()
  const tw = createTweener()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const T = (d) => (reduce ? d * 0.15 : d)

  // Light: the television's glow, a lamp in the corner, a light over the table
  scene.add(new THREE.HemisphereLight('#a6a8ff', '#3a2a1a', 0.7))
  const shelfLight = new THREE.SpotLight('#ffe2b8', 6, 3, 0.9, 0.6, 1)
  shelfLight.position.set(0, 1.2, 0.2)
  shelfLight.target.position.set(0, 0.15, -1.5)
  scene.add(shelfLight, shelfLight.target)
  const tableLight = new THREE.SpotLight('#fff1dc', 5, 3.5, 0.7, 0.7, 1)
  tableLight.position.set(0.4, 2.2, 1.2)
  tableLight.target.position.set(0, 0.4, 0.12)
  tableLight.castShadow = true
  tableLight.shadow.mapSize.set(1024, 1024)
  scene.add(tableLight, tableLight.target)
  const lamp = new THREE.PointLight('#ffc78a', 5, 7, 1.2)
  lamp.position.set(-2.3, 1.7, -1.75)
  scene.add(lamp)
  const tvLight = new THREE.PointLight('#5a7cff', 2.2, 4, 1.4)
  tvLight.position.set(0, 0.95, -0.9)
  scene.add(tvLight)
  const rim = new THREE.DirectionalLight('#9fb6ff', 0.4)
  rim.position.set(2, 3, 1)
  scene.add(rim)

  scene.add(buildRoom())
  const stand = buildStand()
  stand.position.set(0, 0, -1.55)
  scene.add(stand)
  const tv = buildTV()
  tv.position.set(0, stand.userData.top, -1.55)
  scene.add(tv)
  const n64 = buildN64()
  n64.position.set(-0.56, stand.userData.floor, -1.5)
  const gc = buildGameCube()
  gc.position.set(0.0, stand.userData.floor, -1.48)
  const xbox = buildXbox()
  xbox.position.set(0.53, stand.userData.floor, -1.5)
  scene.add(n64, gc, xbox)
  const consoles = { n64, gc, xbox }
  const table = buildTable()
  table.position.set(0, 0, 0.12)
  scene.add(table)

  // A floor lamp in the far corner, clear of the words on the left
  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.7, 10), new THREE.MeshStandardMaterial({ color: '#222' }))
  lampPole.position.set(-2.3, 0.85, -1.75)
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.24, 0.26, 24, 1, true),
    new THREE.MeshStandardMaterial({ color: '#f3d6a6', emissive: '#ffb860', emissiveIntensity: 0.9, side: THREE.DoubleSide })
  )
  shade.position.set(-2.3, 1.75, -1.75)
  scene.add(lampPole, shade)

  const tvData = tv.userData
  const screenCtx = tvData.screenCanvas.getContext('2d')
  const screen = { mode: 'idle', id: null, t0: 0 }
  const noise = makeNoise()
  const gameObjs = {}
  let imgs = {}
  let fonts = {}
  let ready = false

  const resize = () => {
    const w = mount.clientWidth
    const h = mount.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    if (!tw.busy && !screen.dived) {
      const v = homeView(camera.aspect)
      camera.position.copy(v.pos)
      look.copy(v.look)
      camera.fov = v.fov
    }
    camera.updateProjectionMatrix()
    renderer.shadowMap.needsUpdate = true
  }
  const ro = new ResizeObserver(resize)
  ro.observe(mount)
  resize()

  // Pointer: hover and pick games on the table
  const ray = new THREE.Raycaster()
  const ptr = new THREE.Vector2()
  let hovered = null
  const pickAt = (e) => {
    const r = renderer.domElement.getBoundingClientRect()
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(ptr, camera)
    const hit = ray.intersectObjects(Object.values(gameObjs), true)[0]
    return hit?.object.userData.gameId || null
  }
  const onMove = (e) => {
    if (tw.busy || !ready) return
    const id = pickAt(e)
    renderer.domElement.style.cursor = id ? 'pointer' : 'default'
    if (id !== hovered) {
      hovered = id
      if (id) onFocus(id)
    }
  }
  const onClick = (e) => {
    if (tw.busy) return api.skip()
    const id = pickAt(e)
    if (id) api.insert(id)
  }
  renderer.domElement.addEventListener('pointermove', onMove)
  renderer.domElement.addEventListener('click', onClick)

  let lastIdle = 0
  const paintScreen = (now) => {
    if (screen.mode === 'idle') {
      if (now - lastIdle < 70) return
      lastIdle = now
      const id = getFocusId()
      const g = games.find((x) => x.id === id)
      drawIdle(screenCtx, now / 1000, g && !tw.busy ? { top: g.title, bottom: `${CONSOLE_NAME[CONSOLE_OF[g.id]]}: click to insert` } : null, noise)
    } else if (screen.mode === 'boot') {
      drawBoot(screenCtx, screen.id, imgs, fonts, (now - screen.t0) / 1000)
    }
    tvData.texture.needsUpdate = true
  }

  const worldOf = (obj, local) => obj.localToWorld(local.clone())

  const insert = async (id) => {
    if (tw.busy || !gameObjs[id] || screen.dived || !ready) return
    tw.speed = 1
    onBusy(true)
    onInsertStart?.(id)
    play('select')
    const obj = gameObjs[id]
    const kind = CONSOLE_OF[id]
    const con = consoles[kind]
    const standFront = -1.55 + 0.4
    await tw.to(obj.position, { y: obj.position.y + 0.22, z: 0.3 }, T(0.3), ease.out)

    if (kind === 'n64') {
      const slot = worldOf(con, new THREE.Vector3(0, con.userData.slotTop, 0))
      const h = obj.userData.height
      await Promise.all([
        tw.to(obj.position, { x: slot.x, y: slot.y + h / 2 + 0.16, z: standFront }, T(0.6)),
        tw.to(obj.rotation, { x: 0, y: 0, z: 0 }, T(0.6)),
      ])
      await tw.to(obj.position, { z: slot.z }, T(0.4))
      await tw.to(obj.position, { y: slot.y + h / 2 - 0.065 }, T(0.25), ease.in)
      play('move')
      await tw.to(con.userData.power.position, { z: con.userData.power.position.z - 0.014 }, T(0.15))
      con.userData.led.material.color.set('#ff2a2a')
    } else {
      const disc = obj.userData.disc
      disc.visible = true
      disc.rotation.set(Math.PI / 2, 0, 0)
      disc.position.set(0, 0, 0)
      await tw.to(disc.position, { y: obj.userData.height * 0.62 }, T(0.45))
      scene.attach(disc)
      await tw.to(obj.position, { y: obj.userData.home.pos.y, x: obj.userData.home.pos.x, z: obj.userData.home.pos.z }, T(0.3))
      if (kind === 'gc') {
        const target = worldOf(con, new THREE.Vector3(0, con.userData.discY, con.userData.discZ))
        await Promise.all([
          tw.to(disc.position, { x: target.x, y: target.y + 0.2, z: standFront }, T(0.6)),
          tw.to(con.userData.lid.rotation, { x: -1.8 }, T(0.5)),
        ])
        await Promise.all([tw.to(disc.position, { z: target.z }, T(0.4)), tw.to(disc.rotation, { x: 0 }, T(0.4))])
        await tw.to(disc.position, { y: target.y + 0.002 }, T(0.25), ease.in)
        await tw.to(con.userData.lid.rotation, { x: 0 }, T(0.3), ease.in)
        disc.visible = false
        play('move')
        con.userData.led.material.color.set('#3cff5a')
      } else {
        const tray = con.userData.tray
        await tw.to(tray.position, { z: tray.userData.outZ }, T(0.45))
        const target = worldOf(tray, new THREE.Vector3(0, 0.01, 0))
        await Promise.all([
          tw.to(disc.position, { x: target.x, y: target.y + 0.18, z: target.z + 0.05 }, T(0.6)),
          tw.to(disc.rotation, { x: 0 }, T(0.6)),
        ])
        await tw.to(disc.position, { x: target.x, y: target.y, z: target.z }, T(0.25), ease.in)
        tray.attach(disc)
        await tw.to(tray.position, { z: tray.userData.inZ }, T(0.45))
        play('move')
        for (const m of con.userData.ringMats) {
          m.color.set('#4dff4d')
          await tw.wait(T(0.08))
        }
      }
    }

    // The television blinks off, then shows the game's title screen
    await tw.to(tvData.material.uniforms.power, { value: 0 }, T(0.12))
    screen.mode = 'boot'
    screen.id = id
    screen.t0 = performance.now()
    tvLight.color.set(TV_GLOW[id] || '#ffe08a')
    await tw.to(tvData.material.uniforms.power, { value: 1 }, T(0.6), ease.out)
    await tw.wait(T(0.9))

    // And the camera dives through the glass
    screen.dived = true
    const center = worldOf(tv, tvData.screenCenter)
    await Promise.all([
      tw.to(camera.position, { x: center.x, y: center.y, z: center.z + 0.2 }, T(1.0), ease.in),
      tw.to(look, { x: center.x, y: center.y, z: center.z - 1 }, T(0.85)),
      tw.to(camera, { fov: 34 }, T(1.0), ease.in),
    ])
    const snapshot = tvData.screenCanvas.toDataURL('image/jpeg', 0.8)
    screen.inserted = id
    tw.speed = 1
    onBusy(false)
    onEnter(id, snapshot)
  }

  // Coming back out of a game: pull back from the screen and eject it
  const comeBack = async () => {
    const id = screen.inserted
    if (!id) return
    tw.speed = 1
    onBusy(true)
    const v = homeView(camera.aspect)
    await Promise.all([
      tw.to(camera.position, { x: v.pos.x, y: v.pos.y, z: v.pos.z }, T(1.2), ease.out),
      tw.to(look, { x: v.look.x, y: v.look.y, z: v.look.z }, T(1.2), ease.out),
      tw.to(camera, { fov: v.fov }, T(1.2), ease.out),
    ])
    screen.dived = false
    await tw.to(tvData.material.uniforms.power, { value: 0 }, T(0.25))
    screen.mode = 'idle'
    tvLight.color.set('#5a7cff')
    tw.to(tvData.material.uniforms.power, { value: 1 }, T(0.5))

    const obj = gameObjs[id]
    const kind = CONSOLE_OF[id]
    const con = consoles[kind]
    const home = obj.userData.home
    if (kind === 'n64') {
      con.userData.led.material.color.set('#330000')
      await tw.to(con.userData.power.position, { z: con.userData.power.position.z + 0.014 }, T(0.15))
      await tw.to(obj.position, { y: obj.position.y + 0.12 }, T(0.3), ease.out)
      await tw.to(obj.position, { z: -1.15 }, T(0.3))
    } else {
      const disc = obj.userData.disc
      if (kind === 'gc') {
        con.userData.led.material.color.set('#102010')
        await tw.to(con.userData.lid.rotation, { x: -1.8 }, T(0.35))
        disc.visible = true
        scene.attach(disc)
        await tw.to(disc.position, { y: disc.position.y + 0.15 }, T(0.3))
        tw.to(con.userData.lid.rotation, { x: 0 }, T(0.3))
      } else {
        con.userData.ringMats.forEach((m) => m.color.set('#203020'))
        const tray = con.userData.tray
        await tw.to(tray.position, { z: tray.userData.outZ }, T(0.35))
        scene.attach(disc)
        await tw.to(disc.position, { y: disc.position.y + 0.15 }, T(0.3))
        tw.to(tray.position, { z: tray.userData.inZ }, T(0.35))
      }
      obj.attach(disc)
      await Promise.all([
        tw.to(disc.position, { x: 0, y: obj.userData.height * 0.62, z: 0 }, T(0.6)),
        tw.to(disc.rotation, { x: Math.PI / 2, y: 0, z: 0 }, T(0.6)),
      ])
      await tw.to(disc.position, { y: 0 }, T(0.3))
      disc.visible = false
    }
    await Promise.all([
      tw.to(obj.position, { x: home.pos.x, y: home.pos.y, z: home.pos.z }, T(0.6)),
      tw.to(obj.rotation, { x: home.rot.x, y: home.rot.y, z: home.rot.z }, T(0.6)),
    ])
    screen.inserted = null
    tw.speed = 1
    onBusy(false)
  }

  let paused = false
  const api = {
    insert,
    comeBack,
    setPaused: (p) => (paused = p),
    // Anyone in a hurry can click or press a key to fast-forward the animation
    skip: () => {
      if (tw.busy) tw.speed = 5
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.domElement.removeEventListener('pointermove', onMove)
      renderer.domElement.removeEventListener('click', onClick)
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

  // Render loop
  let raf = 0
  let last = performance.now()
  const t0 = last
  let shadowFrames = 0
  let lastFocus = null
  const loop = (now) => {
    raf = requestAnimationFrame(loop)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (paused || !ready) return
    tw.update(dt)
    camera.lookAt(look)
    camera.updateProjectionMatrix()
    // The chosen game bobs on the table
    const focusId = getFocusId()
    if (focusId !== lastFocus) {
      lastFocus = focusId
      shadowFrames = 40
    }
    for (const [id, obj] of Object.entries(gameObjs)) {
      if (tw.busy || screen.inserted === id) continue
      const home = obj.userData.home
      const lift = id === focusId ? 0.045 + Math.sin(now / 300) * 0.006 : 0
      obj.position.y += (home.pos.y + lift - obj.position.y) * Math.min(1, dt * 10)
    }
    if (tw.busy || shadowFrames > 0) {
      renderer.shadowMap.needsUpdate = true
      shadowFrames--
    }
    tvData.material.uniforms.time.value = (now - t0) / 1000
    tvLight.intensity = 1.6 + 0.4 * Math.sin(now / 90) * Math.sin(now / 37) * tvData.material.uniforms.power.value
    paintScreen(now)
    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(loop)

  // Box art needs the fonts and the portraits; shaders compile off the main
  // thread before the first frame, so the page never freezes
  fonts = readFonts(fontEl)
  await loadFonts(fonts)
  imgs = await loadPortraits()
  if (disposed) return null
  scene.add(buildNeon(fonts))
  const tableTop = table.userData.top
  // One game per frame: painting box art with glows is the slow part
  for (const [i, id] of TABLE_ORDER.entries()) {
    await nextFrame()
    if (disposed) return null
    const game = games.find((g) => g.id === id)
    const cover = drawCover(id, imgs, fonts)
    const obj =
      CONSOLE_OF[id] === 'n64'
        ? buildCart(cover, id === 'hyrule')
        : buildCase(cover, drawDisc(id, DISC_COLOR[id], fonts), CONSOLE_OF[id] === 'xbox' ? 'xbox' : 'gc')
    obj.position.set(-0.6 + i * 0.3, tableTop + obj.userData.height / 2 + 0.002, 0.12)
    obj.rotation.x = -0.42
    obj.userData.home = { pos: obj.position.clone(), rot: obj.rotation.clone() }
    obj.userData.gameId = id
    obj.userData.title = game.title
    obj.traverse((m) => (m.userData.gameId = id))
    scene.add(obj)
    gameObjs[id] = obj
  }
  paintScreen(performance.now())
  try {
    await renderer.compileAsync(scene, camera)
  } catch {}
  await uploadTextures(renderer, scene)
  if (disposed) return null
  renderer.shadowMap.needsUpdate = true
  ready = true
  requestAnimationFrame(() => (renderer.domElement.style.opacity = '1'))
  onReady?.()
  return api
}
