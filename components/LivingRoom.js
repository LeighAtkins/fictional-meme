import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useArcade } from '../lib/arcade'
import { EMAIL, games, profile } from '../lib/data'
import { drawBoot, drawCover, drawDisc, drawIdle, loadPortraits, readFonts } from '../lib/three/art'
import { buildCase, buildCart, buildGameCube, buildN64, buildNeon, buildRoom, buildStand, buildTable, buildTV, buildXbox } from '../lib/three/props'
import { createTweener, ease } from '../lib/three/tween'
import { SoundToggle } from './SystemBar'
import s from '../styles/room.module.css'

// The landing page: a living room with a CRT and three consoles. Pick a game
// off the coffee table and it goes into the right machine, the television
// shows its title screen, and the camera dives through the glass.

const CONSOLE_OF = { hyrule: 'n64', castle: 'n64', attache: 'gc', wasteland: 'xbox', normandy: 'xbox' }
const CONSOLE_NAME = { n64: 'Nintendo 64', gc: 'GameCube', xbox: 'Xbox 360' }
const TABLE_ORDER = ['hyrule', 'castle', 'attache', 'wasteland', 'normandy']

const howToPlay = {
  hyrule: 'Run the field cutting grass and smashing pots for rupees, then pause to equip projects and read each one as a dungeon map.',
  attache: 'Organise the attaché case: drag projects, press R to turn them, examine anything. The merchant has wares.',
  wasteland: 'Strap on the Pip-Boy, check the S.P.E.C.I.A.L. stats, then walk up to Leigh and talk.',
  castle: 'Run around the castle hall and jump into a painting to enter a project and collect its stars.',
  normandy: 'Ride the Citadel elevator while the news covers Leigh’s projects, then meet the squad.',
}

function homeView(aspect) {
  if (aspect < 0.8) return { pos: new THREE.Vector3(0, 2.3, 3.3), look: new THREE.Vector3(0, 0.15, -0.75), fov: 52 }
  if (aspect < 1.3) return { pos: new THREE.Vector3(0, 1.55, 2.7), look: new THREE.Vector3(0, 0.5, -0.9), fov: 44 }
  return { pos: new THREE.Vector3(0.0, 1.5, 1.95), look: new THREE.Vector3(-0.32, 0.4, -0.95), fov: 42 }
}

export default function LivingRoom({ active, onEnter, onFail }) {
  const { play, items } = useArcade()
  const mountRef = useRef(null)
  const fontRef = useRef(null)
  const api = useRef(null)
  const [ready, setReady] = useState(false)
  const [focus, setFocus] = useState(0)
  const [busy, setBusy] = useState(false)
  const focusRef = useRef(0)
  focusRef.current = focus

  useEffect(() => {
    const mount = mountRef.current
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    } catch {
      onFail?.()
      return
    }
    let disposed = false
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    mount.appendChild(renderer.domElement)
    renderer.domElement.setAttribute('aria-hidden', 'true')

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0b0b18')
    scene.fog = new THREE.Fog('#0b0b18', 4, 9)
    const camera = new THREE.PerspectiveCamera(42, 1, 0.02, 30)
    const look = new THREE.Vector3()
    const tw = createTweener()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const T = (d) => (reduce ? d * 0.15 : d)

    // Light: a warm lamp, the television's glow, and a little fill
    scene.add(new THREE.HemisphereLight('#a6a8ff', '#3a2a1a', 0.7))
    // A soft light inside the stand so the consoles read
    const shelfLight = new THREE.SpotLight('#ffe2b8', 6, 3, 0.9, 0.6, 1)
    shelfLight.position.set(0, 1.2, 0.2)
    shelfLight.target.position.set(0, 0.15, -1.5)
    scene.add(shelfLight, shelfLight.target)
    // And one on the coffee table
    const tableLight = new THREE.SpotLight('#fff1dc', 5, 3.5, 0.7, 0.7, 1)
    tableLight.position.set(0.4, 2.2, 1.2)
    tableLight.target.position.set(0, 0.4, 0.12)
    tableLight.castShadow = true
    tableLight.shadow.mapSize.set(1024, 1024)
    scene.add(tableLight, tableLight.target)
    const lamp = new THREE.PointLight('#ffc78a', 5, 7, 1.2)
    lamp.position.set(-1.6, 1.9, 0.2)
    lamp.castShadow = true
    lamp.shadow.mapSize.set(1024, 1024)
    lamp.shadow.bias = -0.002
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

    // A floor lamp, because every living room needs one
    const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.7, 10), new THREE.MeshStandardMaterial({ color: '#222' }))
    lampPole.position.set(-1.7, 0.85, -1.7)
    const shade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.24, 0.26, 24, 1, true),
      new THREE.MeshStandardMaterial({ color: '#f3d6a6', emissive: '#ffb860', emissiveIntensity: 0.9, side: THREE.DoubleSide })
    )
    shade.position.set(-1.7, 1.75, -1.7)
    scene.add(lampPole, shade)
    lamp.position.set(-1.7, 1.7, -1.7)

    const tvData = tv.userData
    const screenCtx = tvData.screenCanvas.getContext('2d')
    const screen = { mode: 'idle', id: null, t0: 0, osd: null }

    const gameObjs = {}
    let imgs = {}
    let fonts = {}

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
    }
    const ro = new ResizeObserver(resize)
    ro.observe(mount)
    resize()

    // Games, once the portraits and fonts are in
    const setup = async () => {
      await document.fonts.ready
      fonts = readFonts(fontRef.current)
      imgs = await loadPortraits()
      if (disposed) return
      scene.add(buildNeon(fonts))
      const tableTop = table.userData.top
      TABLE_ORDER.forEach((id, i) => {
        const game = games.find((g) => g.id === id)
        const cover = drawCover(id, imgs, fonts)
        let obj
        if (CONSOLE_OF[id] === 'n64') obj = buildCart(cover, id === 'hyrule')
        else obj = buildCase(cover, drawDisc(id, id === 'attache' ? '#7a1e1e' : id === 'wasteland' ? '#1f5f2a' : '#24324a', fonts), CONSOLE_OF[id] === 'xbox' ? 'xbox' : 'gc')
        const x = -0.6 + i * 0.3
        obj.position.set(x, tableTop + obj.userData.height / 2 + 0.002, 0.12)
        obj.rotation.x = -0.42
        obj.userData.home = { pos: obj.position.clone(), rot: obj.rotation.clone() }
        obj.userData.gameId = id
        obj.userData.title = game.title
        obj.traverse((m) => (m.userData.gameId = id))
        scene.add(obj)
        gameObjs[id] = obj
      })
      setReady(true)
    }
    setup()

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
      if (tw.busy) return
      const id = pickAt(e)
      renderer.domElement.style.cursor = id ? 'pointer' : 'default'
      if (id !== hovered) {
        hovered = id
        if (id) {
          setFocus(games.findIndex((g) => g.id === id))
          play('move')
        }
      }
    }
    const onClick = (e) => {
      const id = pickAt(e)
      if (id) api.current?.insert(id)
    }
    renderer.domElement.addEventListener('pointermove', onMove)
    renderer.domElement.addEventListener('click', onClick)

    // Screen painting
    let lastIdle = 0
    const paintScreen = (now) => {
      if (screen.mode === 'idle') {
        if (now - lastIdle < 70) return
        lastIdle = now
        const g = games[focusRef.current]
        drawIdle(screenCtx, now / 1000, g && !tw.busy ? { top: g.title, bottom: `${CONSOLE_NAME[CONSOLE_OF[g.id]]}: click to insert` } : null)
      } else if (screen.mode === 'boot') {
        drawBoot(screenCtx, screen.id, imgs, fonts, (now - screen.t0) / 1000)
      }
      tvData.texture.needsUpdate = true
    }

    const worldOf = (obj, local) => obj.localToWorld(local.clone())

    // The whole insert, as a script
    const insert = async (id) => {
      if (tw.busy || !gameObjs[id] || screen.dived) return
      setBusy(true)
      play('select')
      const obj = gameObjs[id]
      const kind = CONSOLE_OF[id]
      const con = consoles[kind]
      const standFront = -1.55 + 0.4
      await tw.to(obj.position, { y: obj.position.y + 0.22, z: 0.3 }, T(0.35), ease.out)

      if (kind === 'n64') {
        const slot = worldOf(con, new THREE.Vector3(0, con.userData.slotTop, 0))
        const h = obj.userData.height
        await Promise.all([
          tw.to(obj.position, { x: slot.x, y: slot.y + h / 2 + 0.16, z: standFront }, T(0.7)),
          tw.to(obj.rotation, { x: 0, y: 0, z: 0 }, T(0.7)),
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
          await Promise.all([
            tw.to(disc.position, { z: target.z }, T(0.4)),
            tw.to(disc.rotation, { x: 0 }, T(0.4)),
          ])
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

      // Television: blink off, then the title screen
      await tw.to(tvData.material.uniforms.power, { value: 0 }, T(0.12))
      screen.mode = 'boot'
      screen.id = id
      screen.t0 = performance.now()
      tvLight.color.set(id === 'wasteland' ? '#41f593' : id === 'normandy' ? '#ff9a3c' : id === 'attache' ? '#ff5040' : '#ffe08a')
      await tw.to(tvData.material.uniforms.power, { value: 1 }, T(0.7), ease.out)
      await tw.wait(T(1.5))

      // Dive through the glass
      screen.dived = true
      const center = worldOf(tv, tvData.screenCenter)
      const dist = 0.2
      await Promise.all([
        tw.to(camera.position, { x: center.x, y: center.y, z: center.z + dist }, T(1.1), ease.in),
        tw.to(look, { x: center.x, y: center.y, z: center.z - 1 }, T(0.9)),
        tw.to(camera, { fov: 34 }, T(1.1), ease.in),
      ])
      const snapshot = tvData.screenCanvas.toDataURL('image/jpeg', 0.8)
      screen.inserted = id
      setBusy(false)
      onEnter(id, snapshot)
    }

    // Coming back out of a game: pull back from the screen and eject
    const comeBack = async () => {
      const id = screen.inserted
      if (!id) return
      setBusy(true)
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
      setBusy(false)
    }

    api.current = { insert, comeBack, setPaused: (p) => (paused = p) }

    // Render loop
    let paused = false
    let raf = 0
    let last = performance.now()
    const t0 = last
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (paused) return
      tw.update(dt)
      camera.lookAt(look)
      camera.updateProjectionMatrix()
      // Games on the table bob gently when chosen
      const focusId = games[focusRef.current]?.id
      for (const [id, obj] of Object.entries(gameObjs)) {
        if (tw.busy || screen.inserted === id) continue
        const home = obj.userData.home
        const lift = id === focusId ? 0.045 + Math.sin(now / 300) * 0.006 : 0
        obj.position.y += (home.pos.y + lift - obj.position.y) * Math.min(1, dt * 10)
      }
      tvData.material.uniforms.time.value = (now - t0) / 1000
      tvLight.intensity = 1.6 + 0.4 * Math.sin(now / 90) * Math.sin(now / 37) * tvData.material.uniforms.power.value
      paintScreen(now)
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(loop)

    return () => {
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
      mount.removeChild(renderer.domElement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pause the scene while a game is running; pull back out when it ends
  useEffect(() => {
    if (!api.current) return
    api.current.setPaused(!active)
    if (active) api.current.comeBack()
  }, [active])

  const insert = useCallback((id) => api.current?.insert(id), [])

  const onKeyDown = (e) => {
    if (!active || busy) return
    const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    if (dir) {
      e.preventDefault()
      setFocus((f) => (f + dir + games.length) % games.length)
      play('move')
    } else if (e.key === 'Enter' && e.target === document.body) {
      insert(games[focus].id)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const current = games[focus]
  const projects = items.filter((i) => i.kind === 'project')

  return (
    <main className={`${s.room} ${active ? '' : s.hidden}`} aria-hidden={!active}>
      <div ref={mountRef} className={s.canvas} />
      <span ref={fontRef} className={s.fontProbe} aria-hidden="true" />

      <header className={s.top}>
        <div className={s.intro}>
          <h1 className={s.name}>{profile.name}</h1>
          <p className={s.role}>
            {profile.role}. {profile.pitch}
          </p>
        </div>
        <nav aria-label="Quick links" className={s.quick}>
          <SoundToggle className={s.quickLink} />
          <Link href="/resume" className={s.quickLink}>
            Plain résumé
          </Link>
          <a href={`mailto:${EMAIL}`} className={s.quickLink}>
            {EMAIL}
          </a>
        </nav>
      </header>

      <section className={s.dock} aria-label="Choose a game">
        <div className={s.picker} role="listbox" aria-label="Games">
          {games.map((g, i) => (
            <button
              key={g.id}
              type="button"
              role="option"
              aria-selected={i === focus}
              className={`${s.pick} ${i === focus ? s.picked : ''}`}
              onMouseEnter={() => !busy && setFocus(i)}
              onFocus={() => setFocus(i)}
              onClick={() => (i === focus ? insert(g.id) : (setFocus(i), play('move')))}
              disabled={busy || !ready}
            >
              <span className={s.pickTitle}>{g.title}</span>
              <span className={s.pickMeta}>{CONSOLE_NAME[CONSOLE_OF[g.id]]}</span>
            </button>
          ))}
        </div>
        <div className={s.info} aria-live="polite">
          <p>
            My projects ({projects.map((p) => p.name).join(', ')} and more) are the items in every game.{' '}
            <strong>{current.title}</strong>, a homage to {current.homage} ({current.year}). {howToPlay[current.id]}
          </p>
          <button type="button" className={s.play} onClick={() => insert(current.id)} disabled={busy || !ready}>
            {busy ? 'Loading…' : `Insert ${current.title}`}
          </button>
        </div>
        <p className={s.foot}>
          Fan homages drawn for this site; not affiliated with Nintendo, Capcom, Bethesda, Microsoft or Electronic Arts.
        </p>
      </section>
      {!ready && <p className={s.loading}>Warming up the television…</p>}
    </main>
  )
}
