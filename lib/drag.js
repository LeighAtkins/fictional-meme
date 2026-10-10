import { useCallback, useEffect, useRef, useState } from 'react'

// Pointer drag that works the same with a mouse, a pen or a thumb. Sources get
// `bind(payload)`; anything with a `data-drop` attribute is a target. A press
// that never moves stays a click.
export function useDrag({ onDrop, onStart, threshold = 6 }) {
  const [drag, setDrag] = useState(null)
  const pending = useRef(null)
  const handlers = useRef({ onDrop, onStart })
  handlers.current = { onDrop, onStart }

  const targetAt = (x, y) => {
    const el = document.elementFromPoint(x, y)
    return el?.closest('[data-drop]')?.getAttribute('data-drop') || null
  }

  useEffect(() => {
    const move = (e) => {
      const p = pending.current
      if (!p) return
      if (!p.active) {
        if (Math.hypot(e.clientX - p.x, e.clientY - p.y) < threshold) return
        p.active = true
        handlers.current.onStart?.(p.payload)
      }
      e.preventDefault()
      setDrag({ payload: p.payload, x: e.clientX, y: e.clientY, over: targetAt(e.clientX, e.clientY) })
    }
    const up = (e) => {
      const p = pending.current
      pending.current = null
      if (!p?.active) return
      p.suppressClick = true
      setDrag(null)
      const target = targetAt(e.clientX, e.clientY)
      handlers.current.onDrop?.(p.payload, target)
      // Swallow the click that follows a drag
      const stop = (ev) => {
        ev.stopPropagation()
        ev.preventDefault()
      }
      window.addEventListener('click', stop, { capture: true, once: true })
      setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 0)
    }
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [threshold])

  const bind = useCallback(
    (payload) => ({
      onPointerDown: (e) => {
        if (e.button !== 0) return
        pending.current = { payload, x: e.clientX, y: e.clientY, active: false }
      },
      style: { touchAction: 'none' },
    }),
    []
  )

  return { drag, bind }
}
