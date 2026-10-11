import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ItemIcon from '../components/ItemIcon'
import ItemBody from '../components/ItemBody'
import FalloutTalk from '../components/FalloutTalk'
import { useArcade, readJSON, writeJSON } from '../lib/arcade'
import { useDrag } from '../lib/drag'
import { EMAIL, profile, skills } from '../lib/data'
import { playRadio, setSoundEnabled } from '../lib/sfx'
import s from './wasteland.module.css'

// A homage to the Fallout 3 wrist terminal: a green CRT with Stats, Items
// and Data, a radio, and a targeting system for the impatient.

const special = [
  {
    key: 'S',
    name: 'Strength',
    value: 8,
    area: 'Back end',
    text: 'Carries the heavy end: Node and Express services, PostgreSQL through Prisma and Supabase, and the jobs behind them.',
  },
  {
    key: 'P',
    name: 'Perception',
    value: 8,
    area: 'Testing',
    text: 'Notices one pixel out of place. SofaPaint runs Playwright visual regression; ThreeWood has a headless bot that plays every course.',
  },
  {
    key: 'E',
    name: 'Endurance',
    value: 7,
    area: 'Infrastructure',
    text: 'Keeps things running: Docker, Kubernetes and Helm for ReelWalk, SQS with a dead-letter queue, S3, Vercel and Cloudflare Workers.',
  },
  {
    key: 'C',
    name: 'Charisma',
    value: 7,
    area: 'Product sense',
    text: 'Builds for people who are not engineers: customers measuring a sofa, agents selling a house, someone with one hand on a phone.',
  },
  {
    key: 'I',
    name: 'Intelligence',
    value: 8,
    area: 'Applied AI',
    text: 'Puts models where they help: YOLO segmentation on Modal for SofaPaint, Gemini for reupholstering, LanceDB retrieval for support replies.',
  },
  {
    key: 'A',
    name: 'Agility',
    value: 9,
    area: 'Front end',
    text: 'Fast in the browser: TypeScript, React and Next.js, a Fabric.js canvas editor, Three.js with custom GLSL.',
  },
  {
    key: 'L',
    name: 'Luck',
    value: 10,
    area: 'Procedural generation',
    text: 'Luck, engineered: every ThreeWood seed grows the same par-72 course, every time, on every phone.',
  },
]

const perks = [
  {
    name: 'Measure Twice',
    text: 'SofaPaint’s lines have to be right before anyone cuts fabric, so a human checks every generated measurement.',
  },
  {
    name: 'Seed Whisperer',
    text: 'Share a seed and a friend plays the same 18 holes. Deterministic all the way down.',
  },
  {
    name: 'One Composition',
    text: 'ReelWalk’s editor preview and its exported reel come from the same Remotion composition.',
  },
  {
    name: 'Dead Letter Office',
    text: 'Failed render jobs land in a dead-letter queue instead of disappearing.',
  },
  {
    name: 'Offline Wanderer',
    text: 'ThreeWood saves after every shot and plays without a connection.',
  },
]

const apparel = [
  {
    id: 'shirt',
    name: 'Work shirt',
    img: '/me/vault-dweller.webp',
    effect: 'INT +1. What Leigh actually wears to write code.',
  },
  {
    id: 'suit',
    name: 'Three-piece suit',
    img: '/me/agent.webp',
    effect: 'CHR +2. For weddings and very serious standups.',
  },
  {
    id: 'kimono',
    name: 'Kimono and hakama',
    img: '/me/hero-of-time.webp',
    effect: 'CHR +2, AGI −1. From a portrait shoot.',
  },
  {
    id: 'linen',
    name: 'Linen suit',
    img: '/me/plumber.webp',
    effect: 'CHR +1. Rated for sunshine.',
  },
]

const stations = [
  {
    id: 'itembox',
    name: 'Radio Itembox',
    note: 'An original tune, played live by your browser.',
  },
  { id: 'off', name: 'Off', note: 'Silence. The wasteland hums on.' },
]

const TABS = ['Stats', 'Items', 'Data']
const SUB = {
  Stats: ['Status', 'S.P.E.C.I.A.L.', 'Skills', 'Perks'],
  Items: ['Projects', 'Apparel', 'Misc'],
  Data: ['Quests', 'Radio'],
}

const chance = {
  sofapaint: 95,
  reelwalk: 96,
  threewood: 99,
  'sofapaint-desktop': 88,
  'handoff-tracker': 91,
  tslock: 93,
  contact: 100,
  resume: 97,
}

export default function Wasteland() {
  const { items, play, findSecret, sound } = useArcade()
  const [tab, setTab] = useState(1)
  const [sub, setSub] = useState(0)
  const [cursor, setCursor] = useState(0)
  const [open, setOpen] = useState(null)
  const [vats, setVats] = useState(false)
  const [talking, setTalking] = useState(false)
  const [radio, setRadio] = useState('off')
  const [quest, setQuest] = useState({ read: false, email: false })
  const [order, setOrder] = useState(null)
  const stopRadio = useRef(() => {})

  useEffect(() => {
    setQuest(readJSON('itembox.quest', { read: false, email: false }))
    return () => stopRadio.current()
  }, [])

  const tick = useCallback((k) => {
    setQuest((q) => {
      const next = { ...q, [k]: true }
      writeJSON('itembox.quest', next)
      return next
    })
  }, [])

  const tabName = TABS[tab]
  const subName = SUB[tabName][sub]

  // Item lists for the Items tab, reorderable by dragging
  const lists = useMemo(() => {
    const projects = items.filter((i) => i.kind === 'project' || i.kind === 'side')
    const misc = items.filter((i) => i.kind === 'link' || i.kind === 'curio')
    return { Projects: projects, Misc: misc }
  }, [items])

  useEffect(() => {
    setOrder(readJSON('itembox.wasteland.order', null))
  }, [])

  const listFor = (name) => {
    const base = lists[name] || []
    const saved = order?.[name]
    if (!saved) return base
    const kept = saved.map((id) => base.find((i) => i.id === id)).filter(Boolean)
    return [...kept, ...base.filter((i) => !saved.includes(i.id))]
  }

  const { drag, bind } = useDrag({
    onDrop: ({ list, from }, target) => {
      if (!target) return
      const to = Number(target.split(':')[1])
      const arr = listFor(list).map((i) => i.id)
      const [moved] = arr.splice(from, 1)
      arr.splice(to, 0, moved)
      const next = { ...(order || {}), [list]: arr }
      setOrder(next)
      writeJSON('itembox.wasteland.order', next)
      setCursor(to)
      play('select')
    },
  })

  // How many rows the current list has, for the cursor
  let rows = 0
  if (subName === 'S.P.E.C.I.A.L.') rows = special.length
  else if (subName === 'Skills') rows = skills.length
  else if (subName === 'Perks') rows = perks.length
  else if (subName === 'Projects' || subName === 'Misc') rows = listFor(subName).length
  else if (subName === 'Apparel') rows = apparel.length
  else if (subName === 'Radio') rows = stations.length

  const switchTab = (t) => {
    setTab(t)
    setSub(0)
    setCursor(0)
    setOpen(null)
    play('page')
  }

  const switchSub = (i) => {
    setSub(i)
    setCursor(0)
    setOpen(null)
    play('page')
  }

  const tune = useCallback(
    (id) => {
      stopRadio.current()
      setRadio(id)
      if (id === 'off') return
      if (!sound) setSoundEnabled(true)
      stopRadio.current = playRadio()
      findSecret('radio', 'Now playing Radio Itembox.')
    },
    [sound, findSecret],
  )

  const activate = useCallback(
    (idx = cursor) => {
      play('select')
      if (subName === 'Projects' || subName === 'Misc') {
        const it = listFor(subName)[idx]
        if (it) {
          setOpen(it)
          if (it.kind === 'project') tick('read')
          // On a phone the entry opens below the list, so bring it up
          if (window.innerWidth < 760)
            setTimeout(() => document.querySelector(`.${s.reader}`)?.scrollIntoView({ block: 'start' }), 50)
        }
      } else if (subName === 'Radio') {
        tune(stations[idx].id)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cursor, subName, play, tune, tick, order, lists],
  )

  useEffect(() => {
    const onKey = (e) => {
      if (talking) return
      if (e.key === 't' || e.key === 'T') return startTalk()
      if (vats) {
        if (e.key === 'Escape' || e.key === 'v' || e.key === 'V') setVats(false)
        return
      }
      if (e.key === 'v' || e.key === 'V') {
        setVats(true)
        play('select')
        findSecret('vats', 'V.A.T.S. engaged.')
        return
      }
      if (open && (e.key === 'Escape' || e.key === 'Backspace')) return setOpen(null)
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        if (!rows) return
        setCursor((c) => (c + (e.key === 'ArrowDown' ? 1 : -1) + rows) % rows)
        play('move')
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const n = SUB[tabName].length
        switchSub((sub + (e.key === 'ArrowRight' ? 1 : -1) + n) % n)
      } else if (e.key === 'Enter') {
        activate()
      } else if (['1', '2', '3'].includes(e.key)) {
        switchTab(Number(e.key) - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const rowProps = (i, onPick) => ({
    className: `${s.row} ${i === cursor ? s.rowOn : ''}`,
    onMouseEnter: () => i !== cursor && (setCursor(i), play('move')),
    onFocus: () => setCursor(i),
    onClick: () => (setCursor(i), onPick ? onPick(i) : play('move')),
  })

  const vatsTargets = items.filter((i) => chance[i.id])

  const startTalk = () => {
    setTalking(true)
    play('page')
    tick('talk')
  }

  const showFromTalk = (id) => {
    setTalking(false)
    setTab(1)
    setSub(0)
    setCursor(0)
    const it = items.find((x) => x.id === id)
    if (it) {
      setOpen(it)
      tick('read')
    }
  }

  const dial = (tab / (TABS.length - 1)) * 90 - 45

  return (
    <div className={s.device}>
      <div className={s.casing}>
        <div className={s.bezel}>
          <div className={s.screen}>
            <div className={s.content}>
              <header className={s.top}>
                <h1 className={s.section}>{tabName}</h1>
                <nav className={s.subtabs} aria-label={`${tabName} sections`}>
                  {SUB[tabName].map((name, i) => (
                    <button
                      key={name}
                      type="button"
                      className={`${s.subtab} ${i === sub ? s.subOn : ''}`}
                      onClick={() => switchSub(i)}
                    >
                      {name}
                    </button>
                  ))}
                </nav>
                <p className={s.meta}>
                  <span>LVL ∞</span>
                  <span>HP 100/100</span>
                  <span>AP 90/90</span>
                </p>
              </header>

              <main className={s.body}>
                {/* STATS */}
                {subName === 'Status' && (
                  <div className={s.status}>
                    <div className={s.portrait}>
                      <img src="/me/vault-dweller.webp" alt="Leigh, smiling, rendered in green phosphor" />
                    </div>
                    <div className={s.condition}>
                      <p className={s.big}>{profile.name}</p>
                      <p className={s.dim}>{profile.role}</p>
                      <ul className={s.bars}>
                        {skills.map((sk) => (
                          <li key={sk.id}>
                            <span>{sk.name}</span>
                            <span className={s.bar}>
                              <span style={{ width: `${sk.rank * 25}%` }} />
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className={s.dim}>Condition bars read as confidence in each area. Press V for V.A.T.S.</p>
                    </div>
                  </div>
                )}

                {subName === 'S.P.E.C.I.A.L.' && (
                  <div className={s.split}>
                    <ul className={s.list}>
                      {special.map((st, i) => (
                        <li key={st.key}>
                          <button type="button" {...rowProps(i)}>
                            <span>{st.name}</span>
                            <span>{st.value}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className={s.detail}>
                      <p className={s.letter}>{special[cursor]?.key}</p>
                      <p className={s.big}>
                        {special[cursor]?.name}: {special[cursor]?.area}
                      </p>
                      <p>{special[cursor]?.text}</p>
                    </div>
                  </div>
                )}

                {subName === 'Skills' && (
                  <div className={s.split}>
                    <ul className={s.list}>
                      {skills.map((sk, i) => (
                        <li key={sk.id}>
                          <button type="button" {...rowProps(i)}>
                            <span>{sk.name}</span>
                            <span>{sk.rank * 25}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className={s.detail}>
                      <p className={s.big}>{skills[cursor]?.name}</p>
                      <ul className={s.tools}>
                        {skills[cursor]?.tools.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {subName === 'Perks' && (
                  <div className={s.split}>
                    <ul className={s.list}>
                      {perks.map((p, i) => (
                        <li key={p.name}>
                          <button type="button" {...rowProps(i)}>
                            <span>{p.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className={s.detail}>
                      <p className={s.big}>{perks[cursor]?.name}</p>
                      <p>{perks[cursor]?.text}</p>
                    </div>
                  </div>
                )}

                {/* ITEMS */}
                {(subName === 'Projects' || subName === 'Misc') &&
                  (() => {
                    const list = listFor(subName)
                    const cur = list[cursor]
                    return (
                      <div className={s.split}>
                        <ul className={s.list}>
                          <li className={s.listHead} aria-hidden="true">
                            <span>Item</span>
                            <span>{subName === 'Projects' ? 'Layers' : ''}</span>
                          </li>
                          {list.map((it, i) => (
                            <li key={it.id} data-drop={`row:${i}`}>
                              <button
                                type="button"
                                {...rowProps(i, (n) => activate(n))}
                                {...bind({ list: subName, from: i })}
                                className={`${s.row} ${i === cursor ? s.rowOn : ''} ${drag?.over === `row:${i}` ? s.rowDrop : ''}`}
                              >
                                <span>
                                  {open?.id === it.id && <span aria-hidden="true">■ </span>}
                                  {it.name}
                                </span>
                                <span>{it.project ? it.project.stack.length : ''}</span>
                              </button>
                            </li>
                          ))}
                          <li className={s.hintRow}>Drag to reorder. Enter to use.</li>
                        </ul>
                        {open ? (
                          <div className={`${s.detail} ${s.reader}`}>
                            <button type="button" className={s.backBtn} onClick={() => setOpen(null)}>
                              Back
                            </button>
                            <p className={s.big}>{open.name}</p>
                            <ItemBody item={open} />
                          </div>
                        ) : (
                          cur && (
                            <div className={s.detail}>
                              <div className={s.iconBox}>
                                <ItemIcon name={cur.icon} className={s.icon} />
                              </div>
                              <table className={s.statTable}>
                                <tbody>
                                  <tr>
                                    <th>WG</th>
                                    <td>{cur.size[0] * cur.size[1]}</td>
                                    <th>VAL</th>
                                    <td>{cur.kind === 'project' ? '∞' : cur.kind === 'link' ? 'Free' : '—'}</td>
                                  </tr>
                                </tbody>
                              </table>
                              <p className={s.dim}>{cur.alias}</p>
                              <p>{cur.blurb}</p>
                              {cur.project && (
                                <ul className={s.tools}>
                                  {cur.project.stack.map(([k, v]) => (
                                    <li key={k}>
                                      {k}: {v}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              <button type="button" className={s.useBtn} onClick={() => activate(cursor)}>
                                {cur.project ? 'Read the full entry' : 'Use'}
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )
                  })()}

                {subName === 'Apparel' && (
                  <div className={s.split}>
                    <ul className={s.list}>
                      {apparel.map((a, i) => (
                        <li key={a.id}>
                          <button type="button" {...rowProps(i)}>
                            <span>
                              {i === 0 && <span aria-hidden="true">■ </span>}
                              {a.name}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className={s.detail}>
                      <div className={s.apparel}>
                        <img src={apparel[cursor]?.img} alt={`Leigh wearing the ${apparel[cursor]?.name.toLowerCase()}`} />
                      </div>
                      <p className={s.big}>{apparel[cursor]?.name}</p>
                      <p>{apparel[cursor]?.effect}</p>
                    </div>
                  </div>
                )}

                {/* DATA */}
                {subName === 'Quests' && (
                  <div className={s.split}>
                    <ul className={s.list}>
                      <li>
                        <button type="button" className={`${s.row} ${s.rowOn}`}>
                          <span>■ Find a team worth joining</span>
                        </button>
                      </li>
                      {items
                        .filter((it) => it.project)
                        .map((it) => (
                          <li key={it.id} className={it.project.status === 'Shipped' ? s.done : s.active}>
                            {it.name}: {it.project.status.toLowerCase()}
                          </li>
                        ))}
                    </ul>
                    <div className={s.detail}>
                      <p className={s.big}>Find a team worth joining</p>
                      <p>
                        Leigh is open to new roles, ideally on a team building tools people rely on for real-world decisions. The
                        objectives tick themselves off as you go.
                      </p>
                      <ul className={s.objectives}>
                        <li className={quest.read ? s.ticked : ''}>Read one of Leigh’s project entries</li>
                        <li className={quest.email ? s.ticked : ''}>
                          <a href={`mailto:${EMAIL}`} onClick={() => tick('email')}>
                            Send a message to {EMAIL}
                          </a>
                        </li>
                        <li className={quest.talk ? s.ticked : ''}>
                          <button type="button" className={s.inlineLink} onClick={startTalk}>
                            Talk to Leigh
                          </button>
                        </li>
                        <li>Book an interview</li>
                      </ul>
                    </div>
                  </div>
                )}

                {subName === 'Radio' && (
                  <div className={s.split}>
                    <ul className={s.list}>
                      {stations.map((st, i) => (
                        <li key={st.id}>
                          <button type="button" {...rowProps(i, () => tune(st.id))}>
                            <span>
                              {radio === st.id && <span aria-hidden="true">■ </span>}
                              {st.name}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className={s.detail}>
                      <div className={`${s.wave} ${radio !== 'off' ? s.waveOn : ''}`} aria-hidden="true">
                        {Array.from({ length: 32 }, (_, i) => (
                          <span key={i} style={{ animationDelay: `${(i * 37) % 600}ms` }} />
                        ))}
                      </div>
                      <p>{stations[cursor]?.note}</p>
                    </div>
                  </div>
                )}
              </main>

              <footer className={s.tabs}>
                {TABS.map((t, i) => (
                  <button key={t} type="button" className={`${s.tab} ${i === tab ? s.tabOn : ''}`} onClick={() => switchTab(i)}>
                    {t}
                  </button>
                ))}
                <button
                  type="button"
                  className={s.vatsBtn}
                  onClick={() => (setVats(true), findSecret('vats', 'V.A.T.S. engaged.'))}
                >
                  V.A.T.S.
                </button>
              </footer>
            </div>

            {vats && (
              <div className={s.vats} role="dialog" aria-modal="true" aria-label="V.A.T.S.">
                <p className={s.big}>V.A.T.S.</p>
                <p className={s.dim}>Pick a target. Probabilities are approximate.</p>
                <ul className={s.targets}>
                  {vatsTargets.map((it) => (
                    <li key={it.id}>
                      <button
                        type="button"
                        className={s.target}
                        onClick={() => {
                          setVats(false)
                          if (it.kind === 'project') {
                            setTab(1)
                            setSub(0)
                            setOpen(it)
                            tick('read')
                          } else if (it.href) {
                            window.location.href = it.href
                          }
                        }}
                      >
                        <ItemIcon name={it.icon} className={s.targetIcon} />
                        <span>{it.name}</span>
                        <strong>{chance[it.id]}%</strong>
                      </button>
                    </li>
                  ))}
                </ul>
                <button type="button" className={s.backBtn} onClick={() => setVats(false)}>
                  Exit V.A.T.S.
                </button>
              </div>
            )}

            <div className={s.scan} aria-hidden="true" />
          </div>
        </div>

        <aside className={s.controls} aria-label="Pip-Boy controls">
          <p className={s.brand}>LEIGHCO 3000</p>
          <div className={s.knobWrap}>
            {TABS.map((t, i) => (
              <button
                key={t}
                type="button"
                className={`${s.knobLabel} ${s[`kl${i}`]} ${i === tab ? s.klOn : ''}`}
                onClick={() => switchTab(i)}
              >
                {t}
              </button>
            ))}
            <span className={s.knob} style={{ transform: `rotate(${dial}deg)` }} aria-hidden="true" />
          </div>
          <button type="button" className={s.talkBtn} onClick={startTalk}>
            <span>Talk to Leigh</span>
            <small>T</small>
          </button>
          <div className={s.radioDial} aria-hidden="true">
            <span style={{ transform: `rotate(${radio === 'off' ? -40 : 50}deg)` }} />
          </div>
          <div className={s.vents} aria-hidden="true" />
        </aside>
      </div>

      {talking && (
        <FalloutTalk
          onClose={() => setTalking(false)}
          onShow={showFromTalk}
          onSecret={() => findSecret('speech', 'Speech check passed.')}
          play={play}
        />
      )}
    </div>
  )
}
