import { useEffect, useRef, useState } from 'react'
import { STEPS } from '../lib/sofa/steps'
import s from '../styles/assembly.module.css'

// The résumé as an assembly drawing. Sections marked with data-step drive the
// drawing: scrolling through a section brings in that step's parts. The words
// render on the server; the drawing loads behind them and is purely visual.

const NOTES = [
  'Scroll, and the sofa goes together one section at a time.',
  'A1 overall width and A2 overall depth, measured the way SofaPaint asks a customer to.',
  'G1 back height. The upper back is raked, as SofaPaint’s back profile draws it.',
  null, // the arm check, from the model
  null, // the seat cushion fit, from the model
  null, // the back cushion fit, from the model
  'H1 seat height.',
  'Exploded view. Balloons follow the assembly steps.',
  null, // fabric and part count
]
const ZONES_X = ['1', '2', '3', '4', '5', '6', '7', '8']
const ZONES_Y = ['A', 'B', 'C', 'D', 'E', 'F']

export default function SofaAssembly({ children }) {
  const layoutRef = useRef(null)
  const drawRef = useRef(null)
  const glRef = useRef(null)
  const overlayRef = useRef(null)
  const api = useRef(null)
  const metrics = useRef({ sections: [], anchor: 0, header: 0, end: 0 })
  const [step, setStep] = useState(0)
  const [facts, setFacts] = useState(null)
  const [state, setState] = useState('loading')
  const [labels, setLabels] = useState([])
  // On phones the drawing and the steps share a bar along the bottom that
  // opens into the full sheet; the header folds away on the way down, and the
  // bar tucks away once the résumé ends
  const [open, setOpen] = useState(false)
  const [hide, setHide] = useState(false)
  const [tucked, setTucked] = useState(false)
  const jump = useRef(() => {})

  useEffect(() => {
    let cancelled = false
    let frame = 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const narrow = window.matchMedia('(max-width: 1023px)')
    const draw = drawRef.current
    const layout = layoutRef.current

    const measure = () => {
      const header = document.querySelector('[data-site-header]')
      const headerH = header ? header.offsetHeight : 0
      layout.style.setProperty('--header', `${headerH}px`)
      // Size the renderer to the canvas itself; on phones it takes only part of the bar
      const rect = glRef.current.getBoundingClientRect()
      // The line that decides progress: the middle of the reading area, or on
      // phones low on the screen, so a step builds as its heading comes up
      metrics.current.anchor = narrow.matches ? window.innerHeight * 0.8 : headerH + (window.innerHeight - headerH) * 0.5
      metrics.current.header = headerH
      const y = window.scrollY
      metrics.current.end = layout.getBoundingClientRect().bottom + y
      metrics.current.sections = [...layout.querySelectorAll('[data-step]')].map((el) => {
        const r = el.getBoundingClientRect()
        return { top: r.top + y, h: Math.max(1, r.height), label: el.dataset.label }
      })
      api.current?.resize(rect.width, rect.height)
    }

    // Which way the page is going, and how far since it last turned
    let lastY = window.scrollY
    let dir = 0
    let travel = 0
    const chrome = (y) => {
      const dy = y - lastY
      lastY = y
      if (!narrow.matches) {
        setHide(false)
        setTucked(false)
        return
      }
      if (dy) {
        if (dy > 0 !== dir > 0) travel = 0
        dir = dy
        travel += Math.abs(dy)
      }
      if (y < 80) setHide(false)
      else if (travel > 24) setHide(dir > 0)
      setTucked(y + window.innerHeight > metrics.current.end + 40)
    }

    const update = () => {
      frame = 0
      chrome(window.scrollY)
      const { sections, anchor } = metrics.current
      if (!api.current || !sections.length) return
      const y = window.scrollY + anchor
      let t = 0
      for (let k = 0; k < sections.length; k++) {
        const sec = sections[k]
        if (y < sec.top) {
          // Before the first section the drawing waits; between sections it holds
          if (k === 0) t = (y - sec.top) / sec.h
          break
        }
        t = k + Math.min(1, (y - sec.top) / sec.h)
      }
      api.current.setTarget(t)
    }
    // A numbered step scrolls to its section, a little past the point where
    // its parts land, and the drawing builds (or unbuilds) on the way there.
    // Phones land the section's heading at the top, below the header when
    // the page goes up and the header comes back
    jump.current = (k) => {
      const sec = metrics.current.sections[k]
      if (!sec) return
      const { header, anchor } = metrics.current
      let top = narrow.matches ? sec.top - 12 : sec.top - anchor + Math.min(sec.h * 0.32, 420)
      if (narrow.matches && top < window.scrollY) top -= header
      if (k === 0) top = 0
      window.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'auto' : 'smooth' })
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const onResize = () => {
      measure()
      update()
    }

    const ro = new ResizeObserver(onResize)
    const io = new IntersectionObserver(([e]) => api.current?.setVisible(e.isIntersecting))
    const fine = window.matchMedia('(pointer: fine)').matches
    const onPointer = (e) => {
      const r = draw.getBoundingClientRect()
      api.current?.setPointer(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2)
    }
    const onLeave = () => api.current?.setPointer(0, 0)

    // The steps work as navigation before the drawing has loaded
    measure()
    setLabels(metrics.current.sections.map((sec) => sec.label))
    ro.observe(layout)
    ro.observe(draw)
    window.addEventListener('scroll', onScroll, { passive: true })

    import('../lib/sofa/assembly')
      .then(({ createAssembly }) =>
        createAssembly({ canvas: glRef.current, overlay: overlayRef.current, fontEl: layoutRef.current, reduced, onStep: setStep })
      )
      .then((a) => {
        if (cancelled) return a?.dispose()
        if (!a) return setState('failed')
        api.current = a
        setFacts(a.facts)
        measure()
        update()
        io.observe(draw)
        if (fine) {
          draw.addEventListener('pointermove', onPointer)
          draw.addEventListener('pointerleave', onLeave)
        }
        setState('ready')
      })
      .catch(() => setState('failed'))

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      draw.removeEventListener('pointermove', onPointer)
      draw.removeEventListener('pointerleave', onLeave)
      api.current?.dispose()
      api.current = null
    }
  }, [])

  const checks = facts?.checks || []
  const note =
    NOTES[step] ??
    (step === 3
      ? `Check: ${checks[0]?.text}.`
      : step === 4
        ? `Check: ${checks[2]?.text}.`
        : step === 5
          ? `Check: ${checks[3]?.text}. ${checks.filter((c) => c.pass).length} of ${checks.length} checks pass.`
          : facts
            ? `${facts.parts} parts, ${facts.fabric}. Every dimension and check on this sheet comes from the model.`
            : '')

  useEffect(() => {
    const header = document.querySelector('[data-site-header]')
    header?.toggleAttribute('data-hidden', hide && !open)
    return () => header?.removeAttribute('data-hidden')
  }, [hide, open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const choose = (k) => {
    jump.current(k)
  }

  const balloons = (
    <ol>
      {labels.map((label, k) => (
        <li key={k}>
          <button
            type="button"
            onClick={() => choose(k)}
            aria-current={k === step ? 'step' : undefined}
            className={`${s.balloon} ${k < step ? s.done : ''} ${k === step ? s.current : ''}`}
            title={`${k + 1}. ${STEPS[k]}: ${label}`}
            aria-label={`Step ${k + 1}, ${STEPS[k]}: go to ${label}`}
          >
            {k + 1}
          </button>
        </li>
      ))}
    </ol>
  )

  return (
    <div
      ref={layoutRef}
      className={`${s.layout} ${state === 'failed' ? s.flat : ''} ${open ? s.open : ''} ${tucked && !open ? s.tucked : ''}`}
    >
      <div ref={drawRef} className={s.drawing}>
        {/* The bar on phones: the whole drawing is the button that opens it */}
        <button type="button" className={s.cardButton} onClick={() => setOpen(true)} aria-label={`Open the assembly drawing, sheet ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
          <span className={s.cardChip}>
            <span className={s.cardCount}>
              Step {step + 1} of {STEPS.length}
            </span>
            <span className={s.cardStep}>{STEPS[step]}</span>
          </span>
          <svg className={s.cardOpen} viewBox="0 0 16 16" aria-hidden="true">
            <path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9" />
          </svg>
        </button>
        <button type="button" className={s.close} onClick={() => setOpen(false)}>
          Close
        </button>
        {/* Phones: the steps run along the foot of the bar */}
        {labels.length > 0 && (
          <nav className={s.stepper} aria-label="Résumé sections">
            {balloons}
          </nav>
        )}
        <div className={s.sheet}>
          <div className={s.zonesTop}>{ZONES_X.map((z) => <span key={z}>{z}</span>)}</div>
          <div className={s.zonesBottom}>{ZONES_X.map((z) => <span key={z}>{z}</span>)}</div>
          <div className={s.zonesLeft}>{ZONES_Y.map((z) => <span key={z}>{z}</span>)}</div>
          <div className={s.zonesRight}>{ZONES_Y.map((z) => <span key={z}>{z}</span>)}</div>
          <div className={s.frame}>
            <canvas ref={glRef} aria-hidden="true" className={`${s.gl} ${state === 'ready' ? s.shown : ''}`} />
            <canvas ref={overlayRef} aria-hidden="true" className={`${s.overlay} ${state === 'ready' ? s.shown : ''}`} />

            {labels.length > 0 && (
              <nav className={s.rail} aria-label="Assembly steps">
                {balloons}
                <p className={s.railLabel}>
                  {STEPS[step]}
                  {labels[step] ? <span> · {labels[step]}</span> : null}
                </p>
              </nav>
            )}
            {state === 'loading' && <p className={s.loading}>Plotting the drawing…</p>}

            <div className={s.notes} aria-hidden="true">
              <p className={s.notesHead}>Notes</p>
              <p key={step} className={s.note}>
                {note}
              </p>
            </div>

            <dl className={s.title} aria-hidden="true">
              <div className={s.titleName}>
                <dt className="sr-only">Drawn by</dt>
                <dd>
                  <strong>Leigh Atkins</strong>
                  <span>Full-stack developer</span>
                </dd>
              </div>
              <div className={s.titleSheet}>
                <dt>Sheet</dt>
                <dd>
                  {step + 1} of {STEPS.length}
                </dd>
              </div>
              <div className={s.titleWide}>
                <dt>Drawing</dt>
                <dd>{facts?.title || 'Three-seat sofa, rolled arm'}</dd>
              </div>
              <div className={s.titleStep}>
                <dt>Step</dt>
                <dd>{STEPS[step]}</dd>
              </div>
              <div>
                <dt>Scale</dt>
                <dd>1:20</dd>
              </div>
              <div>
                <dt>Units</dt>
                <dd>cm</dd>
              </div>
              <div>
                <dt>Model</dt>
                <dd>SofaPaint</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      <div className={s.text}>{children}</div>
    </div>
  )
}
