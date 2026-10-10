import { useEffect, useRef, useState } from 'react'

// Thumb controls for phones: a stick on the left, two buttons on the right.
export default function TouchPad({ input, a = 'Jump', b = 'Action', onA, onB }) {
  const [show, setShow] = useState(false)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const base = useRef(null)
  const pointer = useRef(null)

  useEffect(() => {
    setShow(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  if (!show || !input) return null

  const move = (e) => {
    if (pointer.current !== e.pointerId) return
    const r = base.current.getBoundingClientRect()
    const R = r.width / 2
    let x = (e.clientX - (r.left + R)) / R
    let y = (e.clientY - (r.top + R)) / R
    const len = Math.hypot(x, y)
    if (len > 1) {
      x /= len
      y /= len
    }
    setKnob({ x, y })
    input.state.pad = { x, y: -y }
  }
  const end = (e) => {
    if (pointer.current !== e.pointerId) return
    pointer.current = null
    setKnob({ x: 0, y: 0 })
    input.state.pad = { x: 0, y: 0 }
  }

  const btn = {
    width: 68,
    height: 68,
    borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.7)',
    color: '#fff',
    fontWeight: 800,
    fontSize: 13,
    touchAction: 'none',
  }

  return (
    <div style={{ position: 'fixed', inset: 'auto 0 0', zIndex: 15, pointerEvents: 'none', height: 170 }}>
      <div
        ref={base}
        onPointerDown={(e) => {
          pointer.current = e.pointerId
          e.currentTarget.setPointerCapture(e.pointerId)
          move(e)
        }}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        style={{
          position: 'absolute',
          left: 24,
          bottom: 28,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.35)',
          border: '2px solid rgba(255,255,255,0.35)',
          pointerEvents: 'auto',
          touchAction: 'none',
        }}
        aria-hidden="true"
      >
        <span
          style={{
            position: 'absolute',
            left: 60 + knob.x * 40 - 26,
            top: 60 + knob.y * 40 - 26,
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.75)',
          }}
        />
      </div>
      <div style={{ position: 'absolute', right: 20, bottom: 30, display: 'flex', gap: 14, pointerEvents: 'auto' }}>
        <button type="button" style={{ ...btn, background: 'rgba(40,160,70,0.8)', marginTop: 30 }} onPointerDown={() => (onB ? onB() : input.trigger('action'))}>
          {b}
        </button>
        <button type="button" style={{ ...btn, background: 'rgba(47,111,224,0.85)' }} onPointerDown={() => (onA ? onA() : input.trigger('jump'))}>
          {a}
        </button>
      </div>
    </div>
  )
}
