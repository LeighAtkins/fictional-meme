import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ItemIcon from '../components/ItemIcon'
import ItemBody, { ItemLink } from '../components/ItemBody'
import { useArcade, readJSON, writeJSON } from '../lib/arcade'
import { EMAIL, profile } from '../lib/data'
import s from './attache.module.css'

// A homage to the Resident Evil 4 attaché case. Every item has a footprint;
// drag it somewhere it fits, press R to turn it, and keep the case tidy.

const COLS = 9
const ROWS = 6

const defaultLayout = {
  katana: { x: 0, y: 0, r: false },
  threewood: { x: 1, y: 0, r: false },
  sofapaint: { x: 2, y: 0, r: false },
  reelwalk: { x: 4, y: 0, r: false },
  supportcopilot: { x: 6, y: 0, r: false },
  resume: { x: 8, y: 0, r: false },
  'style-check': { x: 2, y: 2, r: false },
  contact: { x: 4, y: 2, r: false },
  galactic: { x: 6, y: 2, r: false },
  github: { x: 7, y: 2, r: false },
  linkedin: { x: 8, y: 2, r: false },
  'sofapaint-desktop': { x: 2, y: 3, r: false },
  'handoff-tracker': { x: 4, y: 3, r: false },
  tslock: { x: 6, y: 3, r: false },
  duck: { x: 1, y: 4, r: false },
}

const footprint = (item, r) => (r ? [item.size[1], item.size[0]] : item.size)

function fits(layout, items, id, x, y, r) {
  const item = items.find((i) => i.id === id)
  const [w, h] = footprint(item, r)
  if (x < 0 || y < 0 || x + w > COLS || y + h > ROWS) return false
  return items.every((other) => {
    if (other.id === id || !layout[other.id]) return true
    const p = layout[other.id]
    const [ow, oh] = footprint(other, p.r)
    return x + w <= p.x || p.x + ow <= x || y + h <= p.y || p.y + oh <= y
  })
}

// First free spot, for items the saved layout has never seen
function place(layout, items, id) {
  for (const r of [false, true])
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) if (fits(layout, items, id, x, y, r)) return { x, y, r }
  return null
}

function Heartbeat() {
  return (
    <svg viewBox="0 0 200 40" className={s.ecg} aria-hidden="true">
      <path d="M0 22 H60 L68 22 L74 6 L82 36 L88 16 L92 22 H140 L146 22 L150 12 L156 30 L160 22 H200" />
    </svg>
  )
}

export default function Attache() {
  const { items, play, findSecret, notify } = useArcade()
  const [layout, setLayout] = useState(defaultLayout)
  const [selected, setSelected] = useState('sofapaint')
  const [held, setHeld] = useState(null) // { id, r, x, y, dx, dy, px, py }
  const [examining, setExamining] = useState(null)
  const [merchant, setMerchant] = useState(false)
  // The command list that pops up beside an item, as in the original
  const [command, setCommand] = useState(null)
  const caseRef = useRef(null)
  const heldRef = useRef(null)
  heldRef.current = held
  // A click only examines an item that was already selected before the press
  const clickIntent = useRef({ examine: false, dragged: false })

  // Restore the saved arrangement, slotting in anything new
  useEffect(() => {
    const saved = readJSON('itembox.attache', null)
    const base = saved || defaultLayout
    const next = {}
    for (const it of items) if (base[it.id] && fits(next, items, it.id, base[it.id].x, base[it.id].y, base[it.id].r)) next[it.id] = base[it.id]
    for (const it of items) if (!next[it.id]) next[it.id] = place(next, items, it.id) || { x: 0, y: 0, r: false }
    setLayout(next)
  }, [items])

  const save = (next) => {
    setLayout(next)
    writeJSON('itembox.attache', next)
  }

  const cellSize = () => {
    const rect = caseRef.current.getBoundingClientRect()
    return { rect, size: rect.width / COLS }
  }

  const pointerToCell = (px, py, h) => {
    const { rect, size } = cellSize()
    const item = items.find((i) => i.id === h.id)
    const [w, hh] = footprint(item, h.r)
    const x = Math.round((px - rect.left - h.dx * size) / size)
    const y = Math.round((py - rect.top - h.dy * size) / size)
    return { x: Math.max(0, Math.min(COLS - w, x)), y: Math.max(0, Math.min(ROWS - hh, y)) }
  }

  const pick = (e, item) => {
    if (e.button !== 0) return
    const p = layout[item.id]
    const { rect, size } = cellSize()
    // Where in the item the pointer grabbed, in cells
    const dx = (e.clientX - rect.left) / size - p.x
    const dy = (e.clientY - rect.top) / size - p.y
    clickIntent.current = { examine: selected === item.id, dragged: false }
    setSelected(item.id)
    setHeld({ id: item.id, r: p.r, x: p.x, y: p.y, dx, dy, startX: e.clientX, startY: e.clientY, moved: false })
    play('move')
  }

  const rotateHeld = useCallback(() => {
    const h = heldRef.current
    if (!h) return false
    const item = items.find((i) => i.id === h.id)
    if (item.size[0] === item.size[1]) return true
    setHeld({ ...h, r: !h.r, dx: h.dy, dy: h.dx, moved: true })
    play('page')
    findSecret('rotate', 'Turned it.')
    return true
  }, [items, play, findSecret])

  useEffect(() => {
    if (!held) return
    const move = (e) => {
      const h = heldRef.current
      if (!h) return
      const moved = h.moved || Math.hypot(e.clientX - h.startX, e.clientY - h.startY) > 5
      const { x, y } = pointerToCell(e.clientX, e.clientY, h)
      setHeld({ ...h, x, y, moved })
    }
    const up = () => {
      const h = heldRef.current
      setHeld(null)
      if (!h) return
      if (!h.moved) return
      clickIntent.current.dragged = true
      if (fits(layout, items, h.id, h.x, h.y, h.r)) {
        save({ ...layout, [h.id]: { x: h.x, y: h.y, r: h.r } })
        play('select')
      } else {
        notify('It won’t fit there.')
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  })

  const rotateSelected = useCallback(() => {
    const item = items.find((i) => i.id === selected)
    if (!item) return
    if (item.size[0] === item.size[1]) return notify(`${item.name} looks the same either way.`)
    const p = layout[selected]
    if (fits(layout, items, selected, p.x, p.y, !p.r)) {
      save({ ...layout, [selected]: { ...p, r: !p.r } })
      play('page')
      findSecret('rotate', 'Turned it.')
    } else {
      notify('No room to turn it here. Drag it somewhere with space first.')
    }
  }, [items, selected, layout, play, notify, findSecret])

  // Organize: repack everything, biggest first, the way the case's own button does
  const organize = () => {
    const sorted = [...items].sort((a, b) => b.size[0] * b.size[1] - a.size[0] * a.size[1] || b.size[1] - a.size[1])
    const next = {}
    for (const it of sorted) {
      let spot = null
      for (let x = 0; x < COLS && !spot; x++)
        for (let y = 0; y < ROWS && !spot; y++)
          for (const r of [false, true]) if (!spot && fits(next, items, it.id, x, y, r)) spot = { x, y, r }
      next[it.id] = spot || layout[it.id]
    }
    save(next)
    setCommand(null)
    play('select')
    notify('Organized.')
  }

  const order = useMemo(
    () =>
      items
        .filter((i) => layout[i.id])
        .sort((a, b) => layout[a.id].y - layout[b.id].y || layout[a.id].x - layout[b.id].x),
    [items, layout]
  )

  useEffect(() => {
    const onKey = (e) => {
      if (examining || merchant) {
        if (e.key === 'Escape') (setExamining(null), setMerchant(false))
        return
      }
      if (command) {
        if (e.key === 'Escape' || e.key === 'Backspace') setCommand(null)
        return
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        if (!rotateHeld()) rotateSelected()
        return
      }
      const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
      if (dir) {
        e.preventDefault()
        const i = order.findIndex((it) => it.id === selected)
        setSelected(order[(i + dir + order.length) % order.length].id)
        play('move')
      }
      if (e.key === 'Enter' && selected) {
        setCommand(selected)
        play('select')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [examining, merchant, command, order, selected, items, rotateHeld, rotateSelected, play])

  const meetMerchant = () => {
    setMerchant(true)
    play('select')
    findSecret('merchant')
  }

  const current = items.find((i) => i.id === selected)
  const heldItem = held && items.find((i) => i.id === held.id)
  const heldFits = held && fits(layout, items, held.id, held.x, held.y, held.r)

  return (
    <div className={s.room}>
      <div className={s.layout}>
        <section className={s.caseSide} aria-label="Attaché case">
          <header className={s.header}>
            <h1 className={s.title}>Attaché case</h1>
            <button type="button" className={s.cmd} onClick={organize}>
              Organize
            </button>
            <p className={s.ptas}>
              <span>PTAS</span> Negotiable
            </p>
          </header>

          <div className={s.leather}>
            <span className={s.latch} style={{ left: '22%' }} aria-hidden="true" />
            <span className={s.latch} style={{ right: '22%' }} aria-hidden="true" />
            <div
              ref={caseRef}
              className={s.case}
              style={{ aspectRatio: `${COLS} / ${ROWS}` }}
              onContextMenu={(e) => {
                if (held) {
                  e.preventDefault()
                  rotateHeld()
                }
              }}
            >
              {items.map((item) => {
                const p = layout[item.id]
                if (!p) return null
                const [w, h] = footprint(item, p.r)
                const isHeld = held?.id === item.id && held.moved
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`${s.item} ${selected === item.id ? s.selected : ''} ${isHeld ? s.ghosted : ''}`}
                    style={{
                      left: `${(p.x / COLS) * 100}%`,
                      top: `${(p.y / ROWS) * 100}%`,
                      width: `${(w / COLS) * 100}%`,
                      height: `${(h / ROWS) * 100}%`,
                      touchAction: 'none',
                    }}
                    onPointerDown={(e) => pick(e, item)}
                    onClick={(e) => {
                      // Keyboard activation has no pointer press before it
                      const viaKeyboard = e.detail === 0
                      if (viaKeyboard || (clickIntent.current.examine && !clickIntent.current.dragged)) {
                        setCommand(item.id)
                        play('select')
                      }
                    }}
                    onFocus={() => setSelected(item.id)}
                    aria-label={`${item.name}, ${item.alias}. ${w} by ${h}.`}
                  >
                    <ItemIcon name={item.icon} rotate={p.r} className={s.icon} />
                  </button>
                )
              })}

              {command &&
                layout[command] &&
                (() => {
                  const it = items.find((i) => i.id === command)
                  const p = layout[command]
                  const [w] = footprint(it, p.r)
                  const right = p.x + w <= COLS - 3
                  const href = it.href || it.project?.links[0]?.href
                  return (
                    <ul
                      className={s.commands}
                      role="menu"
                      aria-label={`${it.name} commands`}
                      style={{
                        left: right ? `${((p.x + w) / COLS) * 100}%` : undefined,
                        right: right ? undefined : `${((COLS - p.x) / COLS) * 100}%`,
                        top: `${(Math.min(p.y, ROWS - 3) / ROWS) * 100}%`,
                      }}
                    >
                      <li>
                        <button type="button" role="menuitem" autoFocus onClick={() => (setCommand(null), setExamining(it), play('select'))}>
                          Examine
                        </button>
                      </li>
                      {href && (
                        <li>
                          <a
                            role="menuitem"
                            href={href}
                            {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                            onClick={() => setCommand(null)}
                          >
                            Use
                          </a>
                        </li>
                      )}
                      {it.size[0] !== it.size[1] && (
                        <li>
                          <button type="button" role="menuitem" onClick={() => (setCommand(null), rotateSelected())}>
                            Turn
                          </button>
                        </li>
                      )}
                      <li>
                        <button type="button" role="menuitem" onClick={() => setCommand(null)}>
                          Back
                        </button>
                      </li>
                    </ul>
                  )
                })()}

              {held?.moved && heldItem && (
                <div
                  className={`${s.held} ${heldFits ? s.fits : s.blocked}`}
                  style={{
                    left: `${(held.x / COLS) * 100}%`,
                    top: `${(held.y / ROWS) * 100}%`,
                    width: `${(footprint(heldItem, held.r)[0] / COLS) * 100}%`,
                    height: `${(footprint(heldItem, held.r)[1] / ROWS) * 100}%`,
                  }}
                  aria-hidden="true"
                >
                  <ItemIcon name={heldItem.icon} rotate={held.r} className={s.icon} />
                </div>
              )}
            </div>
          </div>
          <p className={s.controls}>
            <kbd>Drag</kbd> move <kbd>R</kbd> or right-click turn <kbd>Click again</kbd> or <kbd>Enter</kbd> commands
          </p>
        </section>

        <aside className={s.side}>
          <div className={s.status}>
            <div className={s.gauge}>
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="46" className={s.gaugeTrack} />
                <circle cx="50" cy="50" r="46" className={s.gaugeFill} />
              </svg>
              <img src="/me/agent.webp" alt="Leigh in a dark brown three-piece suit" className={s.agent} />
            </div>
            <div className={s.vitals}>
              <p className={s.agentName}>{profile.name}</p>
              <p className={s.agentRole}>{profile.role}</p>
              <div className={s.monitor}>
                <Heartbeat />
                <span className={s.fine}>Fine</span>
              </div>
            </div>
          </div>

          {current && (
            <div className={s.info}>
              <div className={s.infoHead}>
                <h2 className={s.itemName}>{current.name}</h2>
                <p className={s.itemAlias}>{current.alias}</p>
              </div>
              <p className={s.blurb}>{current.project ? current.project.summary : current.blurb}</p>
              <div className={s.actions}>
                <button type="button" className={s.cmd} onClick={() => (setExamining(current), play('select'))}>
                  Examine
                </button>
                {current.href && <ItemLink item={current} className={s.cmd} />}
                {current.project?.links[0] && (
                  <a href={current.project.links[0].href} target="_blank" rel="noopener noreferrer" className={s.cmd}>
                    {current.project.links[0].label}
                  </a>
                )}
                <button type="button" className={s.cmd} onClick={rotateSelected}>
                  Turn
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      <button type="button" className={s.merchant} onClick={meetMerchant} aria-label="A hooded figure waits by the door">
        <span className={s.hood} />
        <span className={s.eyes} />
      </button>

      {examining && (
        <div className={s.overlay} onClick={() => setExamining(null)}>
          <div className={s.examine} role="dialog" aria-modal="true" aria-label={examining.name} onClick={(e) => e.stopPropagation()}>
            <div className={s.turntable} aria-hidden="true">
              <ItemIcon name={examining.icon} className={s.spin} />
            </div>
            <div className={s.examineText}>
              <button type="button" className={s.back} onClick={() => setExamining(null)}>
                Back
              </button>
              <h2 className={s.examineName}>{examining.name}</h2>
              <p className={s.itemAlias}>{examining.alias}</p>
              <ItemBody item={examining} />
            </div>
          </div>
        </div>
      )}

      {merchant && (
        <div className={s.overlay} onClick={() => setMerchant(false)}>
          <div className={s.shop} role="dialog" aria-modal="true" aria-label="The merchant" onClick={(e) => e.stopPropagation()}>
            <p className={s.shopSays}>What’re ya buyin’?</p>
            <ul className={s.wares}>
              <li>
                <span>
                  <strong>One full-stack developer</strong>
                  <small>Ships TypeScript front to back. Some assembly required: an interview.</small>
                </span>
                <a className={s.cmd} href={`mailto:${EMAIL}?subject=Interview`}>
                  Buy
                </a>
              </li>
              <li>
                <span>
                  <strong>Today’s course at ThreeWood</strong>
                  <small>Rare. Everyone gets the same one today.</small>
                </span>
                <a className={s.cmd} href="https://threewood.app" target="_blank" rel="noopener noreferrer">
                  Play
                </a>
              </li>
              <li>
                <span>
                  <strong>The plain résumé</strong>
                  <small>Free, stranger. No tune-ups needed.</small>
                </span>
                <a className={s.cmd} href="/resume">
                  Take
                </a>
              </li>
            </ul>
            <button type="button" className={s.back} onClick={() => setMerchant(false)}>
              Leave
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
