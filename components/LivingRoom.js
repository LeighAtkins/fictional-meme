import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useArcade } from '../lib/arcade'
import { EMAIL, games, profile } from '../lib/data'
import { SoundToggle } from './SystemBar'
import s from '../styles/room.module.css'

// The landing page: a living room with a CRT and three consoles. Pick a game
// off the coffee table and it goes into the right machine, the television
// shows its title screen, and the camera dives through the glass. The words
// render on the server; the 3D room loads behind them.

const CONSOLE_NAME = { hyrule: 'Nintendo 64', castle: 'Nintendo 64', attache: 'GameCube', wasteland: 'Xbox 360', normandy: 'Xbox 360' }

const howToPlay = {
  hyrule: 'Run the field cutting grass and smashing pots for rupees, open the chests, then pause to read each project as a dungeon map.',
  attache: 'Organise the attaché case: drag projects, press R to turn them, examine anything. The merchant has wares.',
  wasteland: 'Strap on the Pip-Boy, check the S.P.E.C.I.A.L. stats, then talk to Leigh face to face.',
  castle: 'Run around the castle hall and jump into a painting to enter a project and collect its stars.',
  normandy: 'Ride the Citadel elevator while the news covers Leigh’s projects, then meet the squad.',
}

export default function LivingRoom({ active, onEnter, onFail, onReady, onInsertStart }) {
  const { play, items } = useArcade()
  const mountRef = useRef(null)
  const fontRef = useRef(null)
  const api = useRef(null)
  const [ready, setReady] = useState(false)
  const [focus, setFocus] = useState(0)
  const [busy, setBusy] = useState(false)
  const focusRef = useRef(0)
  focusRef.current = focus
  const callbacks = useRef({})
  callbacks.current = { onEnter, onFail, onReady, onInsertStart, play }

  useEffect(() => {
    let room = null
    let cancelled = false
    import('../lib/three/room')
      .then(({ createRoom }) =>
        createRoom(mountRef.current, {
          fontEl: fontRef.current,
          getFocusId: () => games[focusRef.current]?.id,
          onFocus: (id) => {
            setFocus(games.findIndex((g) => g.id === id))
            callbacks.current.play('move')
          },
          onBusy: setBusy,
          onEnter: (id, shot) => callbacks.current.onEnter(id, shot),
          onInsertStart: (id) => callbacks.current.onInsertStart?.(id),
          onReady: () => {
            setReady(true)
            callbacks.current.onReady?.()
          },
          play: (e) => callbacks.current.play(e),
        })
      )
      .then((r) => {
        if (cancelled) return r?.dispose()
        if (!r) return callbacks.current.onFail?.()
        room = r
        api.current = r
      })
      .catch(() => callbacks.current.onFail?.())
    return () => {
      cancelled = true
      room?.dispose()
      api.current = null
    }
  }, [])

  // Pause the scene while a game is running; pull back out when it ends
  useEffect(() => {
    if (!api.current) return
    api.current.setPaused(!active)
    if (active) api.current.comeBack()
  }, [active])

  const insert = useCallback((id) => api.current?.insert(id), [])

  useEffect(() => {
    const onKey = (e) => {
      if (!active) return
      if (busy) {
        // Space, Enter or Escape fast-forwards the insert
        if ([' ', 'Enter', 'Escape'].includes(e.key)) {
          e.preventDefault()
          api.current?.skip()
        }
        return
      }
      const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
      if (dir) {
        e.preventDefault()
        setFocus((f) => (f + dir + games.length) % games.length)
        play('move')
      } else if (e.key === 'Enter' && e.target === document.body) {
        insert(games[focusRef.current].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, busy, insert, play])

  // Keep the chosen game's button in view on narrow screens
  const pickerRef = useRef(null)
  useEffect(() => {
    const el = pickerRef.current?.children[focus]
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }, [focus])

  const current = games[focus]
  const projectCount = items.filter((i) => i.kind === 'project').length

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
        <div ref={pickerRef} className={s.picker} role="listbox" aria-label="Games">
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
              <span className={s.pickMeta}>{CONSOLE_NAME[g.id]}</span>
            </button>
          ))}
        </div>
        <div className={s.info} aria-live="polite">
          <p>
            Every game holds the same items: my {projectCount} projects and a few side quests. <strong>{current.title}</strong>, a homage
            to {current.homage} ({current.year}). {howToPlay[current.id]}
          </p>
          {busy ? (
            <button type="button" className={`${s.play} ${s.skip}`} onClick={() => api.current?.skip()}>
              Skip the animation
            </button>
          ) : (
            <button type="button" className={s.play} onClick={() => insert(current.id)} disabled={!ready}>
              {`Insert ${current.title}`}
            </button>
          )}
        </div>
        <p className={s.foot}>
          Fan homages drawn for this site; not affiliated with Nintendo, Capcom, Bethesda, Microsoft or Electronic Arts.
        </p>
      </section>
      {!ready && (
        <p className={s.loading} role="status">
          Warming up the television…
        </p>
      )}
    </main>
  )
}
