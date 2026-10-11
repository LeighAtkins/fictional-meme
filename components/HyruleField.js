import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import TouchPad from './TouchPad'
import { createHero, createInput, createWorld, followCamera, jump, stepHero, canvasTex } from '../lib/three/world'
import { makeCanvas } from '../lib/three/art'
import { noise, tone } from '../lib/sfx'

// The field behind the pause menu. Run about, cut the grass, smash the pots,
// collect rupees, and open the three chests that hold Leigh's projects.

const RUPEES = [
  { color: '#2fd04a', value: 1, weight: 0.7 },
  { color: '#2f7cff', value: 5, weight: 0.25 },
  { color: '#ff3b3b', value: 20, weight: 0.05 },
]

// Six chests on an arc in front of the start, so no label hides behind another
const CHEST_ORDER = [
  ['sofapaint-desktop', 'SofaPaint Desktop'],
  ['sofapaint', 'SofaPaint'],
  ['threewood', 'ThreeWood'],
  ['reelwalk', 'ReelWalk'],
  ['handoff-tracker', 'Handoff Tracker'],
  ['tslock', 'TSLock'],
]
const CHESTS = CHEST_ORDER.map(([id, label], i) => {
  const a = ((-75 + i * 30) * Math.PI) / 180
  return { id, label, pos: [Math.sin(a) * 9, 0, -Math.cos(a) * 9 - 1], facing: a }
})

const RADIUS = 13.5

function rand(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function grassTexture() {
  const c = makeCanvas(256, 256)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#3f8a34'
  ctx.fillRect(0, 0, 256, 256)
  const r = rand(7)
  for (let i = 0; i < 2200; i++) {
    ctx.fillStyle = `hsl(${95 + r() * 30}, ${40 + r() * 25}%, ${24 + r() * 20}%)`
    ctx.fillRect(r() * 256, r() * 256, 2, 2 + r() * 3)
  }
  return canvasTex(c, [18, 18])
}

function labelSprite(text, family) {
  const c = makeCanvas(512, 128)
  const ctx = c.getContext('2d')
  // Shrink long names to fit rather than clip them
  let size = 66
  do {
    size -= 2
    ctx.font = `700 ${size}px ${family}, serif`
  } while (ctx.measureText(text).width > 480 && size > 28)
  ctx.textAlign = 'center'
  ctx.lineWidth = 10
  ctx.strokeStyle = 'rgba(0,0,0,0.75)'
  ctx.strokeText(text, 256, 84)
  ctx.fillStyle = '#f0d36a'
  ctx.fillText(text, 256, 84)
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(c), transparent: true, depthWrite: false }))
  sp.scale.set(2.4, 0.6, 1)
  return sp
}

function buildChest() {
  const g = new THREE.Group()
  const wood = new THREE.MeshStandardMaterial({ color: '#7a4a1e', roughness: 0.7 })
  const gold = new THREE.MeshStandardMaterial({ color: '#e0b84a', metalness: 0.7, roughness: 0.3 })
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 0.75), wood)
  base.position.y = 0.3
  base.castShadow = true
  const lidPivot = new THREE.Group()
  lidPivot.position.set(0, 0.6, -0.375)
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.375, 0.375, 1.1, 16, 1, false, 0, Math.PI), wood)
  lid.rotation.z = Math.PI / 2
  lid.rotation.y = Math.PI / 2
  lid.position.z = 0.375
  lid.castShadow = true
  lidPivot.add(lid)
  const band1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.62, 0.77), gold)
  band1.position.set(-0.4, 0.3, 0)
  const band2 = band1.clone()
  band2.position.x = 0.4
  const lock = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.06), gold)
  lock.position.set(0, 0.55, 0.39)
  g.add(base, lidPivot, band1, band2, lock)
  g.userData.lid = lidPivot
  return g
}

function buildPot() {
  const pts = [
    [0.0, 0],
    [0.22, 0],
    [0.3, 0.12],
    [0.33, 0.28],
    [0.26, 0.44],
    [0.15, 0.52],
    [0.17, 0.6],
    [0.0, 0.6],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 14), new THREE.MeshStandardMaterial({ color: '#b5683a', roughness: 0.85, flatShading: true }))
  m.castShadow = true
  m.scale.setScalar(1.3)
  return m
}

// Five blades merged into one mesh, so seventy tufts cost seventy draw calls
const tuftMaterials = Array.from({ length: 4 }, (_, i) => new THREE.MeshStandardMaterial({ color: `hsl(${100 + i * 6}, 55%, ${28 + i * 3}%)`, flatShading: true }))
function buildTuft(r) {
  const blades = []
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  for (let i = 0; i < 5; i++) {
    const geo = new THREE.ConeGeometry(0.07, 0.45 + r() * 0.25, 4)
    q.setFromEuler(new THREE.Euler((r() - 0.5) * 0.5, r() * 3, (r() - 0.5) * 0.5))
    m.compose(new THREE.Vector3((r() - 0.5) * 0.35, 0.25, (r() - 0.5) * 0.35), q, new THREE.Vector3(1, 1, 1))
    geo.applyMatrix4(m)
    blades.push(geo)
  }
  const mesh = new THREE.Mesh(mergeGeometries(blades), tuftMaterials[Math.floor(r() * tuftMaterials.length)])
  mesh.castShadow = true
  blades.forEach((g) => g.dispose())
  return mesh
}

function buildTree(r) {
  const g = new THREE.Group()
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 1.6, 7), new THREE.MeshStandardMaterial({ color: '#5a3a1e', flatShading: true }))
  trunk.position.y = 0.8
  const leaves = new THREE.MeshStandardMaterial({ color: `hsl(${105 + r() * 25}, 45%, ${22 + r() * 8}%)`, flatShading: true })
  const c1 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2 + r() * 0.4, 0), leaves)
  c1.position.y = 2.3
  trunk.castShadow = c1.castShadow = true
  g.add(trunk, c1)
  return g
}

export default function HyruleField({ paused, onChest, rupees, setRupees, onSecret }) {
  const mountRef = useRef(null)
  const inputRef = useRef(null)
  const api = useRef(null)
  const cb = useRef({})
  cb.current = { onChest, setRupees, onSecret, rupees }

  useEffect(() => {
    const mount = mountRef.current
    let world
    try {
      world = createWorld(mount, { background: '#c8607c', fog: { color: '#b86a7c', near: 18, far: 60 }, fov: 50 })
    } catch {
      return
    }
    const { scene, camera, onTick } = world
    let disposed = false
    const input = createInput()
    inputRef.current = input
    input.attach()

    // Dusk sky
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(90, 24, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        vertexShader: 'varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader:
          'varying float h; void main(){ vec3 a=vec3(0.95,0.64,0.37); vec3 b=vec3(0.78,0.38,0.49); vec3 c=vec3(0.29,0.18,0.43); vec3 col = h<0.15 ? mix(a,b,clamp(h/0.15,0.0,1.0)) : mix(b,c,clamp((h-0.15)/0.5,0.0,1.0)); gl_FragColor=vec4(col,1.0); }',
      })
    )
    scene.add(sky)
    scene.add(new THREE.HemisphereLight('#ffd6b0', '#2a3a20', 0.9))
    const sun = new THREE.DirectionalLight('#ffb37a', 2.2)
    sun.position.set(-12, 14, -6)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, far: 60 })
    scene.add(sun)

    // Ground: flat in the middle, rolling hills beyond the edge
    const ground = new THREE.PlaneGeometry(140, 140, 70, 70)
    const gp = ground.attributes.position
    const r = rand(42)
    for (let i = 0; i < gp.count; i++) {
      const x = gp.getX(i)
      const y = gp.getY(i)
      const d = Math.hypot(x, y)
      const lift = d > RADIUS + 3 ? Math.pow(d - RADIUS - 3, 1.25) * 0.35 + Math.sin(x * 0.3) * Math.cos(y * 0.25) * 1.2 : 0
      gp.setZ(i, lift)
    }
    ground.computeVertexNormals()
    const groundMesh = new THREE.Mesh(ground, new THREE.MeshStandardMaterial({ map: grassTexture(), roughness: 1 }))
    groundMesh.rotation.x = -Math.PI / 2
    groundMesh.receiveShadow = true
    scene.add(groundMesh)

    // A dirt path to the chests
    const path = new THREE.Mesh(new THREE.CircleGeometry(2.4, 24), new THREE.MeshStandardMaterial({ color: '#8a6a42', roughness: 1 }))
    path.rotation.x = -Math.PI / 2
    path.position.set(0, 0.01, -4.5)
    path.scale.set(4.1, 2.3, 1)
    path.receiveShadow = true
    scene.add(path)

    // Trees around the edge and a far-off castle
    for (let i = 0; i < 34; i++) {
      const a = (i / 34) * Math.PI * 2 + r() * 0.2
      const d = RADIUS + 1.5 + r() * 9
      const t = buildTree(r)
      t.position.set(Math.cos(a) * d, 0, Math.sin(a) * d)
      t.scale.setScalar(0.9 + r() * 0.8)
      scene.add(t)
    }
    const castle = new THREE.Group()
    const stone = new THREE.MeshStandardMaterial({ color: '#6f6a88', flatShading: true })
    ;[
      [0, 4, 6, 8, 4],
      [-4, 3, 2, 6, 2],
      [4, 3, 2, 6, 2],
      [0, 7, 2, 5, 2],
    ].forEach(([x, y, w, h, d]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stone)
      b.position.set(x, y, 0)
      castle.add(b)
    })
    ;[-4, 4, 0].forEach((x, i) => {
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.5, 6), new THREE.MeshStandardMaterial({ color: '#3d4f9a', flatShading: true }))
      roof.position.set(x, i === 2 ? 10.7 : 7.2, 0)
      castle.add(roof)
    })
    castle.position.set(-6, 3, -48)
    scene.add(castle)

    // Things to hit
    const tufts = []
    const pots = []
    const chests = []
    const rupees = []
    const particles = []
    const solids = []

    const clear = (x, z, d) => CHESTS.every((c) => Math.hypot(c.pos[0] - x, c.pos[2] - z) > d) && Math.hypot(x, z - 4) > 2
    for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI * 2
      const d = 2 + r() * (RADIUS - 2.5)
      const x = Math.cos(a) * d
      const z = Math.sin(a) * d
      if (!clear(x, z, 2)) continue
      const t = buildTuft(r)
      t.position.set(x, 0, z)
      scene.add(t)
      tufts.push(t)
    }
    ;[
      [8.5, 3],
      [9.3, 3.8],
      [8.1, 4.4],
      [9.6, 2.6],
      [-8.6, 2.5],
      [-9.4, 3.3],
      [-8.2, 3.9],
      [-3, 8],
      [3.2, 8.3],
      [2.4, 9],
    ].forEach(([x, z]) => {
      const p = buildPot()
      p.position.set(x, 0, z)
      scene.add(p)
      pots.push(p)
      solids.push({ obj: p, r: 0.45 })
    })
    CHESTS.forEach((c) => {
      const ch = buildChest()
      ch.position.set(...c.pos)
      // Each chest faces the middle of the field
      ch.rotation.y = -c.facing
      ch.userData.id = c.id
      ch.userData.opened = false
      ch.userData.text = c.label
      scene.add(ch)
      chests.push(ch)
      solids.push({ obj: ch, r: 0.8 })
    })

    const rupeeGeo = new THREE.OctahedronGeometry(0.16, 0)
    rupeeGeo.scale(1, 1.9, 0.55)
    const spawnRupee = (pos) => {
      const roll = r()
      let acc = 0
      const kind = RUPEES.find((k) => (acc += k.weight) >= roll) || RUPEES[0]
      const m = new THREE.Mesh(rupeeGeo, new THREE.MeshStandardMaterial({ color: kind.color, emissive: kind.color, emissiveIntensity: 0.35, metalness: 0.3, roughness: 0.25 }))
      m.position.copy(pos).setY(0.4)
      m.castShadow = true
      m.userData = { value: kind.value, vy: 4, life: 0 }
      scene.add(m)
      rupees.push(m)
    }

    const burst = (pos, color, n, size = 0.08) => {
      const geo = new THREE.BoxGeometry(size, size, size)
      const m = new THREE.MeshStandardMaterial({ color, flatShading: true })
      for (let i = 0; i < n; i++) {
        const p = new THREE.Mesh(geo, m)
        p.position.copy(pos).setY(0.3 + Math.random() * 0.3)
        p.userData = { v: new THREE.Vector3((Math.random() - 0.5) * 4, 2 + Math.random() * 3, (Math.random() - 0.5) * 4), life: 0.8 }
        scene.add(p)
        particles.push(p)
      }
    }

    // The slash: a white arc that flashes on the side Leigh is facing
    const slashMesh = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 1.25, 24, 1, -Math.PI * 0.45, Math.PI * 0.9),
      new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
    )
    scene.add(slashMesh)
    let slashT = 0

    let hero
    // Chest names are set in the game's own face, once it has loaded
    const family = getComputedStyle(mount).getPropertyValue('--f-cinzel').trim() || 'serif'
    const labelsReady = document.fonts
      .load(`700 64px ${family}`)
      .catch(() => {})
      .then(() => {
        if (disposed) return
        for (const ch of chests) {
          const label = labelSprite(ch.userData.text, family)
          label.position.set(0, 1.9, 0)
          ch.add(label)
          ch.userData.label = label
        }
      })

    createHero('/me/hero-of-time.webp', 2.1).then(async (h) => {
      await labelsReady
      if (disposed) return
      hero = h
      hero.group.position.set(0, 0, 4)
      scene.add(hero.group)
      camera.position.set(0, 4.2, 11)
      camera.lookAt(0, 1.2, 4)
      // Every shader compiles before the first frame. Rupees and particles reuse
      // materials already in the scene, so a swing never stalls on a new one
      await world.start()
    })

    const near = (obj, dist) => hero && Math.hypot(obj.position.x - hero.group.position.x, obj.position.z - hero.group.position.z) < dist

    const action = () => {
      if (!hero || api.current?.paused) return
      // Open a chest if one is close, otherwise swing
      const chest = chests.find((c) => near(c, 1.9))
      if (chest) {
        if (!chest.userData.opened) {
          chest.userData.opened = true
          chest.userData.opening = 0
          ;[523, 659, 784, 1047].forEach((f, i) => tone(f, { type: 'triangle', at: i * 0.1, dur: 0.18, vol: 0.06 }))
        }
        setTimeout(() => cb.current.onChest?.(chest.userData.id), chest.userData.opened ? 500 : 0)
        return
      }
      slashT = 0.22
      noise({ dur: 0.08, vol: 0.06, hp: 1200 })
      const camDir = new THREE.Vector3()
      camera.getWorldDirection(camDir)
      const side = new THREE.Vector3().crossVectors(camDir.setY(0).normalize(), new THREE.Vector3(0, 1, 0)).multiplyScalar(hero.facing)
      const hit = hero.group.position.clone().addScaledVector(side, 0.7)
      slashMesh.position.copy(hero.group.position).setY(0.9 + hero.body.position.y)
      slashMesh.lookAt(slashMesh.position.clone().add(camDir))
      slashMesh.rotation.z += hero.facing > 0 ? 0 : Math.PI
      for (const t of tufts) {
        if (!t.visible) continue
        if (Math.hypot(t.position.x - hit.x, t.position.z - hit.z) < 1.3) {
          t.visible = false
          burst(t.position, '#4caf3c', 7, 0.06)
          noise({ dur: 0.05, vol: 0.05, hp: 3000 })
          if (r() < 0.35) spawnRupee(t.position)
          // Grass grows back
          setTimeout(() => (t.visible = true), 20000)
        }
      }
      for (const p of pots) {
        if (!p.visible) continue
        if (Math.hypot(p.position.x - hit.x, p.position.z - hit.z) < 1.3) {
          p.visible = false
          burst(p.position, '#b5683a', 12, 0.12)
          noise({ dur: 0.18, vol: 0.09, hp: 500 })
          spawnRupee(p.position)
          if (r() < 0.4) spawnRupee(p.position.clone().add(new THREE.Vector3(0.3, 0, 0.2)))
          setTimeout(() => (p.visible = true), 25000)
        }
      }
    }
    input.on('action', action)
    input.on('jump', () => hero && !api.current?.paused && jump(hero, 6.5) && tone(330, { type: 'square', dur: 0.12, slide: 300, vol: 0.03 }))
    const onClick = (e) => {
      if (e.button === 0) action()
    }
    world.renderer.domElement.addEventListener('pointerdown', onClick)

    const collide = (next) => {
      const d = Math.hypot(next.x, next.z)
      if (d > RADIUS) {
        next.x *= RADIUS / d
        next.z *= RADIUS / d
      }
      for (const s of solids) {
        if (!s.obj.visible) continue
        const dx = next.x - s.obj.position.x
        const dz = next.z - s.obj.position.z
        const dd = Math.hypot(dx, dz)
        const min = s.r + 0.35
        if (dd < min && dd > 0.0001) {
          next.x = s.obj.position.x + (dx / dd) * min
          next.z = s.obj.position.z + (dz / dd) * min
        }
      }
    }

    const offset = new THREE.Vector3(0, 3.6, 7)
    onTick((dt, t) => {
      if (!hero) return
      stepHero(hero, input, dt, camera, { speed: 5.2, collide })
      followCamera(camera, hero.group.position, offset, dt, new THREE.Vector3(0, 1.2, 0))
      if (slashT > 0) {
        slashT -= dt
        slashMesh.material.opacity = Math.max(0, slashT / 0.22) * 0.85
        hero.sprite.rotation.z = -hero.facing * Math.sin((slashT / 0.22) * Math.PI) * 0.35
      } else slashMesh.material.opacity = 0
      for (const ch of chests) {
        if (ch.userData.opened && ch.userData.opening < 1) {
          ch.userData.opening = Math.min(1, ch.userData.opening + dt * 2.5)
          ch.userData.lid.rotation.x = -ch.userData.opening * 1.9
        }
        if (ch.userData.label) ch.userData.label.position.y = 1.9 + Math.sin(t * 2 + ch.position.x) * 0.08
      }
      for (let i = rupees.length - 1; i >= 0; i--) {
        const m = rupees[i]
        m.rotation.y += dt * 3
        m.userData.life += dt
        m.userData.vy -= 12 * dt
        m.position.y = Math.max(0.35, m.position.y + m.userData.vy * dt)
        if (m.position.y <= 0.35) m.userData.vy = Math.abs(m.userData.vy) > 1.5 ? -m.userData.vy * 0.4 : 0
        if (m.userData.life > 0.3 && near(m, 0.8)) {
          scene.remove(m)
          m.material.dispose()
          rupees.splice(i, 1)
          tone(1568, { type: 'square', dur: 0.06, vol: 0.04 })
          tone(2093, { type: 'square', at: 0.06, dur: 0.1, vol: 0.04 })
          const total = (cb.current.rupees || 0) + m.userData.value
          cb.current.setRupees?.(total)
          if (total >= 100) cb.current.onSecret?.('rupees')
        } else if (m.userData.life > 20) {
          scene.remove(m)
          rupees.splice(i, 1)
        }
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.userData.life -= dt
        p.userData.v.y -= 12 * dt
        p.position.addScaledVector(p.userData.v, dt)
        p.rotation.x += dt * 8
        if (p.position.y < 0.04) {
          p.position.y = 0.04
          p.userData.v.multiplyScalar(0.5)
        }
        if (p.userData.life <= 0) {
          scene.remove(p)
          particles.splice(i, 1)
        }
      }
    })

    api.current = { paused: false, setPaused: (p) => world.setPaused(p) }

    return () => {
      disposed = true
      input.detach()
      world.renderer.domElement.removeEventListener('pointerdown', onClick)
      world.dispose()
    }
  }, [])

  useEffect(() => {
    if (!api.current) return
    api.current.paused = paused
    // The field freezes behind the pause menu, as it does in the original
    api.current.setPaused(paused)
    if (inputRef.current) {
      if (paused) inputRef.current.detach()
      else inputRef.current.attach()
    }
  }, [paused])

  return (
    <>
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
      {!paused && <TouchPad input={inputRef.current} a="Jump" b="Swing" />}
    </>
  )
}
