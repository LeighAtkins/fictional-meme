import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import TouchPad from './TouchPad'
import { createHero, createInput, createWorld, followCamera, jump, stepHero, canvasTex, loadTexture } from '../lib/three/world'
import { makeCanvas } from '../lib/three/art'
import { tone } from '../lib/sfx'

// The castle hall: chequered floor, red carpet, a staircase, and a painting
// for every project. Run into a painting to jump into its course.

const W = 22
const D = 18
const H = 8

function tiles() {
  const c = makeCanvas(256, 256)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#d8c296'
  ctx.fillRect(0, 0, 256, 256)
  ctx.fillStyle = '#9c7650'
  ctx.beginPath()
  ctx.moveTo(128, 0)
  ctx.lineTo(256, 128)
  ctx.lineTo(128, 256)
  ctx.lineTo(0, 128)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(60,40,20,0.35)'
  ctx.lineWidth = 3
  ctx.stroke()
  return canvasTex(c, [W / 2, D / 2])
}

function stoneWall() {
  const c = makeCanvas(256, 256)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#ead6ad'
  ctx.fillRect(0, 0, 256, 256)
  ctx.strokeStyle = 'rgba(120,90,50,0.25)'
  ctx.lineWidth = 2
  for (let y = 0; y < 256; y += 32) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(256, y)
    ctx.stroke()
    for (let x = (y / 32) % 2 ? 0 : 32; x < 256; x += 64) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + 32)
      ctx.stroke()
    }
  }
  return canvasTex(c, [6, 2])
}

function iconCanvas(color, label) {
  const c = makeCanvas(512, 384)
  const ctx = c.getContext('2d')
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 512, 384)
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  for (let i = 0; i < 12; i++) ctx.fillRect(0, i * 32, 512, 14)
  ctx.textAlign = 'center'
  ctx.font = '700 54px sans-serif'
  ctx.lineWidth = 10
  ctx.strokeStyle = '#1c1c1c'
  ctx.strokeText(label, 256, 210)
  ctx.fillStyle = '#ffd23a'
  ctx.fillText(label, 256, 210)
  return c
}

// Paintings ripple when you get close: a vertex wobble plus a UV swirl
const paintVert = `
uniform float time;
uniform float near;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  float d = distance(uv, vec2(0.5));
  p.z += sin(d * 30.0 - time * 6.0) * 0.06 * near;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`
const paintFrag = `
uniform sampler2D map;
uniform float time;
uniform float near;
uniform vec2 rep;
uniform vec2 off;
varying vec2 vUv;
void main() {
  vec2 c = vUv - 0.5;
  float d = length(c);
  vec2 uv = (vUv + normalize(c + 0.0001) * sin(d * 40.0 - time * 7.0) * 0.012 * near) * rep + off;
  vec3 col = texture2D(map, uv).rgb;
  col += near * 0.08 * sin(d * 40.0 - time * 7.0);
  gl_FragColor = vec4(col, 1.0);
}`

export default function CastleHall({ paintings, paused, onEnter, onSecret, onTalk }) {
  const mountRef = useRef(null)
  const inputRef = useRef(null)
  const api = useRef(null)
  const cb = useRef({})
  cb.current = { onEnter, onSecret, onTalk }

  useEffect(() => {
    const mount = mountRef.current
    let world
    try {
      world = createWorld(mount, { background: '#6fa8e8', fov: 55 })
    } catch {
      return
    }
    const { scene, camera, onTick } = world
    world.renderer.toneMappingExposure = 1.15
    let disposed = false
    const input = createInput()
    inputRef.current = input
    input.attach()

    scene.add(new THREE.HemisphereLight('#fff4e0', '#8a6a4a', 1.4))
    const sun = new THREE.DirectionalLight('#fff0d0', 2)
    sun.position.set(6, 14, 8)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, far: 50 })
    scene.add(sun)

    // The floor runs on past the open front of the hall, under the camera
    const floorTex = tiles()
    floorTex.repeat.set(W / 2, (D + 24) / 2)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D + 24), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.4 }))
    floor.position.z = 12
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)
    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(3, D + 24), new THREE.MeshStandardMaterial({ color: '#b3262a', roughness: 0.95 }))
    carpet.rotation.x = -Math.PI / 2
    carpet.position.set(0, 0.01, 12)
    carpet.receiveShadow = true
    scene.add(carpet)
    const trim = new THREE.Mesh(new THREE.PlaneGeometry(3.4, D + 24), new THREE.MeshStandardMaterial({ color: '#e0b84a' }))
    trim.rotation.x = -Math.PI / 2
    trim.position.set(0, 0.005, 12)
    scene.add(trim)

    const wallMat = new THREE.MeshStandardMaterial({ map: stoneWall(), roughness: 0.9 })
    const walls = [
      { w: W, pos: [0, H / 2, -D / 2], rot: 0 },
      { w: D, pos: [-W / 2, H / 2, 0], rot: Math.PI / 2 },
      { w: D, pos: [W / 2, H / 2, 0], rot: -Math.PI / 2 },
    ]
    walls.forEach(({ w, pos, rot }) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, H), wallMat)
      m.position.set(...pos)
      m.rotation.y = rot
      m.receiveShadow = true
      scene.add(m)
      const wains = new THREE.Mesh(new THREE.PlaneGeometry(w, 1), new THREE.MeshStandardMaterial({ color: '#8a5a32' }))
      wains.position.set(pos[0], 0.5, pos[2])
      wains.rotation.y = rot
      wains.translateZ(0.02)
      scene.add(wains)
    })

    // Staircase up the middle of the back wall
    const stepMat = new THREE.MeshStandardMaterial({ color: '#d8c296', roughness: 0.5 })
    const stepsN = 7
    const stepH = 0.32
    const stepD = 0.7
    for (let i = 0; i < stepsN; i++) {
      const st = new THREE.Mesh(new THREE.BoxGeometry(4, stepH * (i + 1), stepD), stepMat)
      st.position.set(0, (stepH * (i + 1)) / 2, -D / 2 + stepD * (stepsN - i) - stepD / 2)
      st.castShadow = st.receiveShadow = true
      scene.add(st)
      const run = new THREE.Mesh(new THREE.BoxGeometry(3, 0.02, stepD), new THREE.MeshStandardMaterial({ color: '#b3262a' }))
      run.position.set(0, stepH * (i + 1) + 0.01, st.position.z)
      scene.add(run)
    }
    const topY = stepH * stepsN
    // The star door at the top
    const door = new THREE.Mesh(new THREE.PlaneGeometry(2, 3), new THREE.MeshStandardMaterial({ color: '#6b4423' }))
    door.position.set(0, topY + 1.5, -D / 2 + 0.03)
    scene.add(door)
    const starShape = new THREE.Shape()
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2
      const rr = i % 2 ? 0.18 : 0.42
      const x = Math.cos(a) * rr
      const y = Math.sin(a) * rr
      i ? starShape.lineTo(x, y) : starShape.moveTo(x, y)
    }
    const doorStar = new THREE.Mesh(new THREE.ShapeGeometry(starShape), new THREE.MeshBasicMaterial({ color: '#ffd23a' }))
    doorStar.position.set(0, topY + 2.1, -D / 2 + 0.05)
    scene.add(doorStar)

    // Pillars
    ;[-6.5, 6.5].forEach((x) =>
      [-4, 3].forEach((z) => {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, H, 16), new THREE.MeshStandardMaterial({ color: '#f1e3c4', roughness: 0.6 }))
        p.position.set(x, H / 2, z)
        p.castShadow = p.receiveShadow = true
        scene.add(p)
      })
    )
    const pillars = [-6.5, 6.5].flatMap((x) => [-4, 3].map((z) => ({ x, z, r: 0.55 })))

    // Paintings: three on the back wall, three on the sides
    const slots = [
      { pos: [-6.5, 2.4, -D / 2 + 0.06], rot: 0, w: 3.6, h: 2.7 },
      { pos: [-3.4, 2.6, -D / 2 + 0.06], rot: 0, w: 2.2, h: 1.65 },
      { pos: [6.5, 2.4, -D / 2 + 0.06], rot: 0, w: 3.6, h: 2.7 },
      { pos: [-W / 2 + 0.06, 2.4, -2], rot: Math.PI / 2, w: 3.2, h: 2.4 },
      { pos: [W / 2 - 0.06, 2.4, -2], rot: -Math.PI / 2, w: 3.2, h: 2.4 },
      { pos: [3.4, 2.6, -D / 2 + 0.06], rot: 0, w: 2.2, h: 1.65 },
      { pos: [-W / 2 + 0.06, 2.4, 3.6], rot: Math.PI / 2, w: 3.2, h: 2.4 },
      { pos: [W / 2 - 0.06, 2.4, 3.6], rot: -Math.PI / 2, w: 3.2, h: 2.4 },
      { pos: [-W / 2 + 0.06, 2.4, -6.6], rot: Math.PI / 2, w: 2.2, h: 1.65 },
    ]
    const frames = []
    const loads = paintings.slice(0, slots.length).map(async (p, i) => {
      const slot = slots[i]
      const map = p.poster ? await loadTexture(p.poster) : canvasTex(iconCanvas(p.color || '#335', p.name))
      if (disposed) return
      // Crop the picture to fill the canvas, like object-fit: cover
      const ia = map.image.width / map.image.height
      const pa = slot.w / slot.h
      const rep = ia < pa ? new THREE.Vector2(1, ia / pa) : new THREE.Vector2(pa / ia, 1)
      const off = new THREE.Vector2((1 - rep.x) / 2, (1 - rep.y) / 2)
      const mat = new THREE.ShaderMaterial({
        uniforms: { map: { value: map }, time: { value: 0 }, near: { value: 0 }, rep: { value: rep }, off: { value: off } },
        vertexShader: paintVert,
        fragmentShader: paintFrag,
      })
      const g = new THREE.Group()
      const art = new THREE.Mesh(new THREE.PlaneGeometry(slot.w, slot.h, 30, 22), mat)
      art.position.z = 0.06
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(slot.w + 0.4, slot.h + 0.4, 0.1),
        new THREE.MeshStandardMaterial({ color: '#d9a82e', metalness: 0.7, roughness: 0.3 })
      )
      g.add(frame, art)
      g.position.set(...slot.pos)
      g.rotation.y = slot.rot
      scene.add(g)
      // A plaque underneath
      const c = makeCanvas(512, 96)
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#3a2a12'
      ctx.fillRect(0, 0, 512, 96)
      ctx.fillStyle = '#ffd23a'
      ctx.font = '700 44px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${p.number}. ${p.name}`, 256, 64)
      const plaque = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.42), new THREE.MeshBasicMaterial({ map: canvasTex(c) }))
      plaque.position.set(0, -slot.h / 2 - 0.5, 0.06)
      g.add(plaque)
      frames.push({ id: p.id, index: i, group: g, mat, slot })
    })

    let hero
    createHero('/me/plumber.webp', 1.9).then((h) => {
      if (disposed) return
      hero = h
      hero.group.position.set(0, 0, 6)
      scene.add(hero.group)
      camera.position.set(0, 4.5, 14)
    })

    const jumpNow = () => {
      if (!hero || api.current?.paused) return
      if (jump(hero, 7.5)) {
        tone(392, { type: 'square', dur: 0.08, vol: 0.04 })
        tone(784, { type: 'square', at: 0.06, dur: 0.1, vol: 0.04, slide: 200 })
      }
    }
    input.on('jump', jumpNow)
    input.on('action', () => {
      if (!hero) return
      if (hero.group.position.distanceTo(new THREE.Vector3(0, 0, 6)) < 1.5) cb.current.onTalk?.()
    })

    // Floor height under the hero (the stairs are walkable)
    const groundAt = (x, z) => {
      if (Math.abs(x) > 2) return 0
      const fromBack = z - -D / 2
      const idx = stepsN - Math.ceil(fromBack / stepD) + 1
      if (idx < 1 || fromBack < 0) return fromBack < 0 ? topY : 0
      return Math.min(stepsN, idx) * stepH
    }

    let entering = false
    let topReached = false
    const collide = (next) => {
      for (const p of pillars) {
        const dx = next.x - p.x
        const dz = next.z - p.z
        const d = Math.hypot(dx, dz)
        const min = p.r + 0.35
        if (d < min) {
          next.x = p.x + (dx / d) * min
          next.z = p.z + (dz / d) * min
        }
      }
    }

    let floorY = 0
    const offset = new THREE.Vector3(0, 4.2, 8.5)
    onTick((dt, t) => {
      for (const f of frames) {
        f.mat.uniforms.time.value = t
        let near = 0
        if (hero) {
          const local = f.group.worldToLocal(hero.group.position.clone().setY(f.slot.pos[1]))
          const inX = Math.abs(local.x) < f.slot.w / 2 + 0.6
          near = inX ? Math.max(0, 1 - Math.max(0, local.z - 0.4) / 3) : 0
          // Touching the canvas: in you go
          if (!entering && inX && local.z < 0.75 && Math.abs(local.x) < f.slot.w / 2) {
            entering = true
            tone(220, { type: 'square', dur: 0.4, slide: 900, vol: 0.05 })
            cb.current.onEnter?.(f.id)
            setTimeout(() => {
              if (hero) hero.group.position.set(0, 0, 6)
              entering = false
            }, 600)
          }
        }
        f.mat.uniforms.near.value += (near - f.mat.uniforms.near.value) * Math.min(1, dt * 4)
      }
      doorStar.rotation.z = Math.sin(t * 2) * 0.1
      if (!hero) return
      stepHero(hero, input, dt, camera, {
        speed: 6,
        bounds: { minX: -W / 2 + 0.5, maxX: W / 2 - 0.5, minZ: -D / 2 + 0.5, maxZ: D / 2 - 0.5 },
        collide,
      })
      // Climb the stairs: lift the whole hero to the step height
      const want = groundAt(hero.group.position.x, hero.group.position.z)
      floorY += (want - floorY) * Math.min(1, dt * 12)
      hero.group.position.y = floorY
      if (!topReached && want >= topY - 0.01) {
        topReached = true
        cb.current.onSecret?.('castleRun')
      }
      followCamera(camera, hero.group.position, offset, dt, new THREE.Vector3(0, 1.4, 0))
    })

    api.current = { paused: false }
    Promise.all(loads)

    return () => {
      disposed = true
      input.detach()
      world.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!api.current || !inputRef.current) return
    api.current.paused = paused
    if (paused) inputRef.current.detach()
    else inputRef.current.attach()
  }, [paused])

  return (
    <>
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
      {!paused && <TouchPad input={inputRef.current} a="Jump" b="Talk" />}
    </>
  )
}
