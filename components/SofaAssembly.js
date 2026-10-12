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
  const metrics = useRef({ sections: [], anchor: 0 })
  const [step, setStep] = useState(0)
  const [facts, setFacts] = useState(null)
  const [state, setState] = useState('loading')
  const [labels, setLabels] = useState([])
  // On phones the drawing is a small card that opens into the full sheet
  const [open, setOpen] = useState(false)
  const jump = useRef(() => {})

  useEffect(() => {
    let cancelled = false
    let frame = 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const draw = drawRef.current

    const measure = () => {
      const header = document.querySelector('[data-site-header]')
      const headerH = header ? header.getBoundingClientRect().height : 0
      const rect = draw.getBoundingClientRect()
      // The line that decides progress: the middle of the reading area
      metrics.current.anchor = headerH + (window.innerHeight - headerH) * 0.5
      const y = window.scrollY
      metrics.current.sections = [...layoutRef.current.querySelectorAll('[data-step]')].map((el) => {
        const r = el.getBoundingClientRect()
        return { top: r.top + y, h: Math.max(1, r.height), label: el.dataset.label }
      })
      api.current?.resize(rect.width, rect.height)
    }

    const update = () => {
      frame = 0
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
    // its parts land, and the drawing builds (or unbuilds) on the way there
    jump.current = (k) => {
      const sec = metrics.current.sections[k]
      if (!sec) return
      const top = sec.top - metrics.current.anchor + (k === 0 ? 0 : Math.min(sec.h * 0.32, 420))
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
        setLabels(metrics.current.sections.map((sec) => sec.label))
        ro.observe(layoutRef.current)
        ro.observe(draw)
        io.observe(draw)
        window.addEventListener('scroll', onScroll, { passive: true })
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
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const choose = (k) => {
    jump.current(k)
  }

  return (
    <div ref={layoutRef} className={`${s.layout} ${state === 'failed' ? s.flat : ''} ${open ? s.open : ''}`}>
      <div ref={drawRef} className={s.drawing}>
        {/* The card on phones: the whole drawing is the button that opens it */}
        <button type="button" className={s.cardButton} onClick={() => setOpen(true)} aria-label={`Open the assembly drawing, sheet ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
          <span className={s.cardChip}>
            {step + 1}/{STEPS.length} · {STEPS[step]}
          </span>
        </button>
        <button type="button" className={s.close} onClick={() => setOpen(false)}>
          Close
        </button>
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
