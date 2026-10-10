import { useCallback, useEffect, useMemo, useState } from 'react'
import ItemIcon from '../components/ItemIcon'
import ItemBody from '../components/ItemBody'
import { useArcade, useInventory, readJSON, writeJSON } from '../lib/arcade'
import { useDrag } from '../lib/drag'
import { EMAIL, GITHUB, profile, skills } from '../lib/data'
import { setSoundEnabled } from '../lib/sfx'
import s from './hyrule.module.css'

// A homage to the Ocarina of Time pause menu: four subscreens on a turning
// cube, a cursor that pulses, C buttons to equip things to, and a fairy.

const PAGES = ['Select Item', 'Map', 'Quest Status', 'Equipment']
const COLS = 6

const equipment = [
  { row: 'Swords', note: 'Languages', kind: 'sword', gear: ['TypeScript', 'Python', 'SQL', 'GLSL'] },
  { row: 'Shields', note: 'Testing', kind: 'shield', gear: ['Vitest', 'Playwright', 'Jest'] },
  { row: 'Tunics', note: 'Frameworks', kind: 'tunic', gear: ['React', 'Next.js', 'Express', 'Three.js'] },
  { row: 'Boots', note: 'Infrastructure', kind: 'boots', gear: ['Docker', 'Kubernetes', 'Vercel', 'Cloudflare'] },
]
const gearTints = ['#4cae5a', '#c9a227', '#3d7fd6', '#b84a3a']

// Each project drawn as a dungeon: rooms are the parts of the system, the
// boss is the hardest problem in it.
const dungeons = [
  {
    id: 'sofapaint',
    name: 'SofaPaint',
    rooms: [
      { id: 'photo', label: 'Photo upload', x: 0, y: 0 },
      { id: 'yolo', label: 'YOLO segmentation on Modal', x: 1, y: 0 },
      { id: 'worker', label: 'Measurement Worker (Cloudflare)', x: 2, y: 0, boss: true },
      { id: 'editor', label: 'Fabric.js editor', x: 1, y: 1, start: true },
      { id: 'api', label: 'Express on Vercel functions', x: 0, y: 2 },
      { id: 'db', label: 'Supabase Postgres', x: 1, y: 2 },
      { id: 'out', label: 'PDF report and share link', x: 2, y: 2 },
    ],
    doors: [['photo', 'yolo'], ['yolo', 'worker'], ['worker', 'editor'], ['editor', 'api'], ['api', 'db'], ['editor', 'out']],
    boss: 'Turning segmentation masks into measurement lines a customer will trust enough to cut fabric by.',
  },
  {
    id: 'reelwalk',
    name: 'ReelWalk',
    rooms: [
      { id: 'editor', label: 'Next.js editor', x: 0, y: 1, start: true },
      { id: 'db', label: 'Postgres via Prisma', x: 0, y: 2 },
      { id: 'queue', label: 'SQS queue and dead-letter queue', x: 1, y: 1 },
      { id: 'render', label: 'Remotion render worker', x: 2, y: 1, boss: true },
      { id: 's3', label: 'S3 exports', x: 2, y: 2 },
      { id: 'k8s', label: 'Kubernetes and Helm', x: 1, y: 0 },
    ],
    doors: [['editor', 'db'], ['editor', 'queue'], ['queue', 'render'], ['render', 's3'], ['k8s', 'queue']],
    boss: 'Making the editor preview and the exported reel come out of one composition, frame for frame.',
  },
  {
    id: 'threewood',
    name: 'ThreeWood',
    rooms: [
      { id: 'seed', label: 'Seed', x: 0, y: 0, start: true },
      { id: 'route', label: 'Hand-planned routing', x: 1, y: 0 },
      { id: 'holes', label: 'Simplex terrain and holes', x: 2, y: 0 },
      { id: 'fair', label: 'Fairness checks', x: 2, y: 1, boss: true },
      { id: 'physics', label: 'Deterministic ball physics', x: 1, y: 1 },
      { id: 'bot', label: 'Headless test bot', x: 0, y: 1 },
      { id: 'render', label: 'Three.js and GLSL', x: 1, y: 2 },
    ],
    doors: [['seed', 'route'], ['route', 'holes'], ['holes', 'fair'], ['fair', 'physics'], ['physics', 'bot'], ['physics', 'render']],
    boss: 'Every seed has to grow a course that is fair to play, so generated holes are checked by the same physics the player uses.',
  },
]

const medallionColors = ['#4cae5a', '#d9472f', '#3d7fd6', '#e08a2e', '#8b5cc8', '#e6c84a']

const tips = [
  'SofaPaint’s photo mode runs YOLO on Modal, then a Cloudflare Worker turns the masks into labelled measurement lines.',
  'ThreeWood uses one deterministic physics model for the live shot, the aim preview, the putt line and the test bot.',
  'ReelWalk’s preview and its export are the same Remotion composition, so the editor never lies about the render.',
  'Drag an item onto a yellow C button to equip it. Then press 1, 2 or 3 to use it.',
  'Press Q and E (or the Z and R tabs) to turn the menu. The Map shows how each project is built.',
  `Leigh reads every email sent to ${EMAIL}. Even the ones about fairies.`,
]

// Simple equipment art, tinted per tier
function Gear({ kind, tint }) {
  const k = '#17150f'
  if (kind === 'sword')
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M22 3 L27 5 L13 21 L10 19 Z" fill="#dfe6ec" stroke={k} strokeWidth="1.5" />
        <path d="M7 17 L15 25" stroke={tint} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M10 22 L5 27" stroke="#6b4423" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    )
  if (kind === 'shield')
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 3 L27 7 C27 18 23 25 16 29 C9 25 5 18 5 7 Z" fill={tint} stroke={k} strokeWidth="1.8" />
        <path d="M16 8 L22 10 C22 17 20 21 16 24 C12 21 10 17 10 10 Z" fill="rgba(255,255,255,.25)" />
      </svg>
    )
  if (kind === 'tunic')
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M11 4 L16 7 L21 4 L28 9 L25 14 L22 12 L23 28 L9 28 L10 12 L7 14 L4 9 Z" fill={tint} stroke={k} strokeWidth="1.6" strokeLinejoin="round" />
        <rect x="9.5" y="18" width="13" height="3" fill="#6b4423" />
      </svg>
    )
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M9 4 H17 V18 L27 21 C29 22 29 27 27 27 H8 C7 27 7 26 7 25 Z" fill={tint} stroke={k} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 23 H28" stroke="rgba(0,0,0,.35)" strokeWidth="1.5" />
    </svg>
  )
}

function Fairy({ onTalk }) {
  return (
    <button type="button" className={s.fairy} onClick={onTalk} aria-label="Talk to the fairy">
      <span className={s.fairyWingL} />
      <span className={s.fairyWingR} />
      <span className={s.fairyCore} />
    </button>
  )
}

function useRepoCount() {
  const [count, setCount] = useState(null)
  useEffect(() => {
    const cached = readJSON('itembox.repos', null)
    if (cached && Date.now() - cached.at < 3600_000) return setCount(cached.n)
    fetch('https://api.github.com/users/LeighAtkins')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.public_repos != null) {
          setCount(d.public_repos)
          writeJSON('itembox.repos', { n: d.public_repos, at: Date.now() })
        }
      })
      .catch(() => {})
  }, [])
  return count
}

// An original little tune for each song, played on the C buttons
const songs = [
  { name: 'Song of Email', notes: [587, 698, 880, 698, 587, 523], href: `mailto:${EMAIL}`, action: 'Opens a new email to Leigh' },
  { name: 'Song of Source', notes: [440, 523, 659, 784, 659, 880], href: GITHUB, action: 'Opens Leigh’s GitHub' },
  { name: 'Song of the Résumé', notes: [784, 659, 523, 587, 659, 523], href: '/resume', action: 'Opens the plain résumé' },
]

function playNotes(notes) {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return 0
  const ctx = new AC()
  notes.forEach((f, i) => {
    const t = ctx.currentTime + i * 0.22
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = f
    // A breathy ocarina: a sine with a little vibrato
    const lfo = ctx.createOscillator()
    const lg = ctx.createGain()
    lfo.frequency.value = 6
    lg.gain.value = 5
    lfo.connect(lg).connect(o.frequency)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.04)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.21)
    o.connect(g).connect(ctx.destination)
    o.start(t)
    lfo.start(t)
    o.stop(t + 0.22)
    lfo.stop(t + 0.22)
  })
  return notes.length * 220 + 150
}

export default function Hyrule() {
  const { items, play, findSecret, notify, sound } = useArcade()
  const { ordered, cursor, setCursor, move, step } = useInventory('hyrule', items, COLS)
  const [turn, setTurn] = useState(0)
  const page = ((turn % PAGES.length) + PAGES.length) % PAGES.length
  const [open, setOpen] = useState(null)
  const [cButtons, setCButtons] = useState([null, null, null])
  const [talk, setTalk] = useState(null)
  const [tipIndex, setTipIndex] = useState(0)
  const [dungeon, setDungeon] = useState(0)
  const [gearSel, setGearSel] = useState([0, 0])
  const [medal, setMedal] = useState(0)
  const repos = useRepoCount()

  useEffect(() => {
    setCButtons(readJSON('itembox.hyrule.c', ['sofapaint', 'threewood', 'contact']))
  }, [])

  const equip = useCallback(
    (slot, id) => {
      setCButtons((prev) => {
        const next = prev.map((v) => (v === id ? null : v))
        next[slot] = id
        writeJSON('itembox.hyrule.c', next)
        return next
      })
      play('select')
      findSecret('cbutton', 'Equipped.')
    },
    [play, findSecret]
  )

  const { drag, bind } = useDrag({
    onDrop: (from, target) => {
      if (!target) return
      const [kind, n] = target.split(':')
      if (kind === 'slot') {
        move(from, Number(n))
        setCursor(Number(n))
        play('move')
      } else if (kind === 'c') {
        equip(Number(n), ordered[from].id)
      }
    },
  })

  const turnTo = useCallback(
    (dir) => {
      setTurn((t) => t + dir)
      play('page')
    },
    [play]
  )

  const activate = useCallback(
    (item) => {
      if (!item) return
      play('select')
      setOpen(item)
    },
    [play]
  )

  // Controller: arrows move, Enter uses, Q/E turn the menu, 1-3 fire C buttons
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return
      if (open) {
        if (e.key === 'Escape' || e.key === 'Backspace') setOpen(null)
        return
      }
      if (e.key === 'q' || e.key === 'Q' || e.key === '[') return turnTo(-1)
      if (e.key === 'e' || e.key === 'E' || e.key === ']') return turnTo(1)
      if (['1', '2', '3'].includes(e.key)) {
        const id = cButtons[Number(e.key) - 1]
        return activate(items.find((i) => i.id === id))
      }
      if (page !== 0) return
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]
      if (d) {
        e.preventDefault()
        step(d[0], d[1])
        play('move')
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        activate(ordered[cursor])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, page, cursor, ordered, cButtons, items, step, play, turnTo, activate])

  const talkToFairy = () => {
    const tip = tips[tipIndex % tips.length]
    setTipIndex((i) => i + 1)
    setTalk(tip)
    play('select')
    if (tipIndex === 2) findSecret('fairy')
  }

  const playSong = (song) => {
    if (!sound) setSoundEnabled(true)
    const ms = playNotes(song.notes)
    notify(`You played the ${song.name}.`)
    setTimeout(() => {
      if (song.href.startsWith('/')) window.location.href = song.href
      else window.open(song.href, song.href.startsWith('mailto') ? '_self' : '_blank', 'noopener')
    }, ms)
  }

  const selected = ordered[cursor]
  const slots = useMemo(() => {
    const n = Math.max(24, Math.ceil(ordered.length / COLS) * COLS)
    return Array.from({ length: n }, (_, i) => ordered[i] || null)
  }, [ordered])

  const pageName = (offset) => PAGES[(page + offset + PAGES.length) % PAGES.length]

  // What the bottom strip names depends on the page
  let caption = ''
  if (page === 0) caption = selected ? `${selected.name}` : ''
  if (page === 1) caption = `${dungeons[dungeon].name} dungeon`
  if (page === 2) caption = `${skills[medal].name} medallion`
  if (page === 3) caption = equipment[gearSel[0]].gear[gearSel[1]]

  const hearts = items.filter((i) => i.kind === 'project' || i.kind === 'side').length

  return (
    <div className={s.world}>
      <div className={s.field} aria-hidden="true">
        <div className={s.sun} />
        <div className={s.hillsFar} />
        <div className={s.hillsNear} />
      </div>

      <div className={s.hud}>
        <div className={s.hearts} aria-label={`${hearts} heart containers, one per project`}>
          {Array.from({ length: hearts }, (_, i) => (
            <svg key={i} viewBox="0 0 16 14" className={s.heart} aria-hidden="true">
              <path d="M8 13 L1.5 6.5 C-0.5 4 1 0.5 4.3 0.8 C6 1 7.2 2.2 8 3.5 C8.8 2.2 10 1 11.7 0.8 C15 0.5 16.5 4 14.5 6.5 Z" />
            </svg>
          ))}
          <span className={s.magic} />
        </div>
        <div className={s.cGroup}>
          <span className={s.aButton}>Pause</span>
          {cButtons.map((id, i) => {
            const it = items.find((x) => x.id === id)
            return (
              <button
                key={i}
                type="button"
                data-drop={`c:${i}`}
                className={`${s.cButton} ${s[`c${i}`]} ${drag?.over === `c:${i}` ? s.cHot : ''}`}
                onClick={() => activate(it)}
                aria-label={it ? `C button ${i + 1}: use ${it.name}` : `C button ${i + 1}: empty, drag an item here`}
                title={it ? `${it.name} (press ${i + 1})` : 'Drag an item here'}
              >
                {it ? <ItemIcon name={it.icon} className={s.cIcon} /> : <span className={s.cArrow} />}
              </button>
            )
          })}
        </div>
      </div>

      <div className={s.stage}>
        <button type="button" className={`${s.tab} ${s.tabL}`} onClick={() => turnTo(-1)}>
          <span className={s.tabKey}>Z</span>
          <span className={s.tabName}>{pageName(-1)}</span>
        </button>

        <div className={s.cube} style={{ transform: `translateZ(calc(var(--depth) * -1)) rotateY(${turn * 90}deg)` }}>
          {PAGES.map((name, i) => {
            const active = i === page
            return (
              <section
                key={name}
                className={`${s.face} ${active ? s.faceActive : ''}`}
                style={{ transform: `rotateY(${i * -90}deg) translateZ(var(--depth))` }}
                aria-hidden={!active}
                inert={active ? undefined : ''}
              >
                <h2 className={s.banner}>{name}</h2>

                {i === 0 && (
                  <div className={s.grid} role="grid" aria-label="Items">
                    {slots.map((it, idx) => (
                      <div
                        key={it ? it.id : `empty-${idx}`}
                        data-drop={`slot:${Math.min(idx, ordered.length - 1)}`}
                        className={s.slotCell}
                      >
                        {it ? (
                          <button
                            type="button"
                            {...bind(idx)}
                            className={`${s.slot} ${idx === cursor ? s.cursor : ''} ${drag?.payload === idx ? s.lifted : ''}`}
                            onClick={() => (idx === cursor ? activate(it) : (setCursor(idx), play('move')))}
                            onMouseEnter={() => idx !== cursor && !drag && (setCursor(idx), play('move'))}
                            onFocus={() => setCursor(idx)}
                            tabIndex={idx === cursor ? 0 : -1}
                            aria-label={`${it.name}, ${it.alias}`}
                          >
                            <ItemIcon name={it.icon} className={`${s.icon} ${it.size[1] >= 4 ? s.tall : ''}`} />
                          </button>
                        ) : (
                          <span className={s.slotEmpty} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {i === 1 && (
                  <div className={s.mapPage}>
                    <ul className={s.dungeonList}>
                      {dungeons.map((d, di) => (
                        <li key={d.id}>
                          <button
                            type="button"
                            className={`${s.dungeonName} ${di === dungeon ? s.dungeonOn : ''}`}
                            onClick={() => (setDungeon(di), play('move'))}
                          >
                            {d.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <DungeonMap d={dungeons[dungeon]} />
                  </div>
                )}

                {i === 2 && (
                  <div className={s.questPage}>
                    <div className={s.medallions}>
                      {skills.map((sk, mi) => {
                        const a = (mi / skills.length) * Math.PI * 2 - Math.PI / 2
                        return (
                          <button
                            key={sk.id}
                            type="button"
                            className={`${s.medallion} ${mi === medal ? s.medalOn : ''}`}
                            style={{
                              left: `calc(50% + ${Math.cos(a) * 38}% - 1.4rem)`,
                              top: `calc(50% + ${Math.sin(a) * 38}% - 1.4rem)`,
                              '--m': medallionColors[mi],
                            }}
                            onClick={() => (setMedal(mi), play('move'))}
                            onMouseEnter={() => setMedal(mi)}
                            aria-label={sk.name}
                          />
                        )
                      })}
                      <div className={s.medalText}>
                        <strong>{skills[medal].name}</strong>
                        <span>{skills[medal].tools.join(', ')}</span>
                      </div>
                    </div>
                    <div className={s.questSide}>
                      <p className={s.questLabel}>Songs</p>
                      <ul className={s.songs}>
                        {songs.map((song) => (
                          <li key={song.name}>
                            <button type="button" className={s.song} onClick={() => playSong(song)} title={song.action}>
                              <span className={s.note} aria-hidden="true">♪</span>
                              {song.name}
                              <span className={s.songHint}>{song.action}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      <p className={s.questLabel}>Gold tokens</p>
                      <p className={s.tokens}>
                        <span className={s.token} aria-hidden="true" />
                        {repos ?? '…'} <span className={s.tokenNote}>public repositories on GitHub, counted live</span>
                      </p>
                    </div>
                  </div>
                )}

                {i === 3 && (
                  <div className={s.equipPage}>
                    <figure className={s.hero}>
                      <img src="/me/hero-of-time.webp" alt="Leigh in a black kimono and hakama, holding a katana, drawn in a low-poly game style" />
                      <figcaption>
                        <strong>{profile.name}</strong>
                        <span>{profile.role}</span>
                      </figcaption>
                    </figure>
                    <div className={s.equipGrid}>
                      {equipment.map((row, ri) => (
                        <div key={row.row} className={s.equipRow}>
                          <span className={s.equipLabel}>
                            {row.row}
                            <small>{row.note}</small>
                          </span>
                          {row.gear.map((g, gi) => (
                            <button
                              key={g}
                              type="button"
                              className={`${s.gear} ${gearSel[0] === ri && gearSel[1] === gi ? s.cursor : ''}`}
                              onClick={() => (setGearSel([ri, gi]), play('move'))}
                              onMouseEnter={() => setGearSel([ri, gi])}
                              aria-label={`${row.row}: ${g}`}
                            >
                              <Gear kind={row.kind} tint={gearTints[gi % gearTints.length]} />
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )
          })}
        </div>

        <button type="button" className={`${s.tab} ${s.tabR}`} onClick={() => turnTo(1)}>
          <span className={s.tabKey}>R</span>
          <span className={s.tabName}>{pageName(1)}</span>
        </button>
      </div>

      <div className={s.strip}>
        <p className={s.caption} aria-live="polite">
          {caption}
        </p>
        <p className={s.hint}>
          {page === 0 ? (
            <>
              <span className={s.aDot}>A</span> Use <span className={s.cDot} /> Drag to a C button to equip
            </>
          ) : page === 1 ? (
            <>Each project as a dungeon. The skull marks the hardest room.</>
          ) : page === 2 ? (
            <>Play a song to get in touch.</>
          ) : (
            <>What Leigh carries into every project.</>
          )}
        </p>
      </div>

      <Fairy onTalk={talkToFairy} />
      {talk && (
        <div className={s.talk} role="dialog" aria-label="Fairy" onClick={() => setTalk(null)}>
          <p className={s.talkName}>Hey! Listen!</p>
          <p>{talk}</p>
          <span className={s.talkNext} aria-hidden="true" />
        </div>
      )}

      {drag && ordered[drag.payload] && (
        <div className={s.ghost} style={{ left: drag.x, top: drag.y }}>
          <ItemIcon name={ordered[drag.payload].icon} className={s.icon} />
        </div>
      )}

      {open && (
        <div className={s.modalBack} onClick={() => setOpen(null)}>
          <div className={s.getItem} aria-hidden="true">
            <ItemIcon name={open.icon} className={s.getIcon} />
          </div>
          <div className={s.textbox} role="dialog" aria-modal="true" aria-label={open.name} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={s.close} onClick={() => setOpen(null)}>
              Close
            </button>
            <p className={s.gotText}>
              You got the <span className={s.red}>{open.alias}</span>!
            </p>
            <h3 className={s.itemName}>{open.name}</h3>
            <ItemBody item={open} />
          </div>
        </div>
      )}
    </div>
  )
}

function DungeonMap({ d }) {
  const W = 3
  const H = 3
  const pos = (id) => {
    const r = d.rooms.find((x) => x.id === id)
    return [((r.x + 0.5) / W) * 100, ((r.y + 0.5) / H) * 100]
  }
  return (
    <div className={s.dungeon}>
      <div className={s.mapBoard}>
        <svg className={s.mapLines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {d.doors.map(([a, b]) => {
            const [x1, y1] = pos(a)
            const [x2, y2] = pos(b)
            return <line key={a + b} x1={x1} y1={y1} x2={x2} y2={y2} />
          })}
        </svg>
        {d.rooms.map((r) => (
          <div
            key={r.id}
            className={`${s.room} ${r.boss ? s.bossRoom : ''} ${r.start ? s.startRoom : ''}`}
            style={{ left: `${(r.x / W) * 100}%`, top: `${(r.y / H) * 100}%`, width: `${100 / W}%`, height: `${100 / H}%` }}
          >
            <span>
              {r.boss && <span className={s.skull} aria-label="Boss room">☠ </span>}
              {r.label}
            </span>
          </div>
        ))}
      </div>
      <p className={s.bossNote}>
        <strong>Boss:</strong> {d.boss}
      </p>
    </div>
  )
}
