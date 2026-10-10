import { useEffect, useRef } from 'react'

// A face you can grab and pull, in the spirit of a certain title screen.
// The photo is drawn as a mesh of triangles; dragging moves nearby vertices
// and letting go lets them wobble home on springs.

const N = 14

export default function StretchFace({ src, onStretch, className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.src = src
    let raf = 0
    let w = 0
    let h = 0
    let pts = []
    let grab = null
    let stretched = false
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      w = rect.width
      h = rect.height
      // Fit the photo inside the canvas, centred
      const scale = Math.min(w / img.width, h / img.height) * 0.92
      const iw = img.width * scale
      const ih = img.height * scale
      const ox = (w - iw) / 2
      const oy = (h - ih) / 2
      pts = []
      for (let j = 0; j <= N; j++)
        for (let i = 0; i <= N; i++) {
          const x = ox + (i / N) * iw
          const y = oy + (j / N) * ih
          pts.push({ u: (i / N) * img.width, v: (j / N) * img.height, rx: x, ry: y, x, y, vx: 0, vy: 0 })
        }
    }

    // Map one texture triangle onto one screen triangle
    const tri = (a, b, c) => {
      const { u: u0, v: v0, x: x0, y: y0 } = a
      const { u: u1, v: v1, x: x1, y: y1 } = b
      const { u: u2, v: v2, x: x2, y: y2 } = c
      ctx.save()
      ctx.beginPath()
      // Grow the clip a hair so seams between triangles disappear
      const cx = (x0 + x1 + x2) / 3
      const cy = (y0 + y1 + y2) / 3
      const g = (x, y) => [x + (x - cx) * 0.02, y + (y - cy) * 0.02]
      ctx.moveTo(...g(x0, y0))
      ctx.lineTo(...g(x1, y1))
      ctx.lineTo(...g(x2, y2))
      ctx.closePath()
      ctx.clip()
      const d = u0 * (v1 - v2) + u1 * (v2 - v0) + u2 * (v0 - v1)
      if (Math.abs(d) < 1e-6) return ctx.restore()
      const m11 = (x0 * (v1 - v2) + x1 * (v2 - v0) + x2 * (v0 - v1)) / d
      const m12 = (y0 * (v1 - v2) + y1 * (v2 - v0) + y2 * (v0 - v1)) / d
      const m21 = (x0 * (u2 - u1) + x1 * (u0 - u2) + x2 * (u1 - u0)) / d
      const m22 = (y0 * (u2 - u1) + y1 * (u0 - u2) + y2 * (u1 - u0)) / d
      const dx = (x0 * (u1 * v2 - u2 * v1) + x1 * (u2 * v0 - u0 * v2) + x2 * (u0 * v1 - u1 * v0)) / d
      const dy = (y0 * (u1 * v2 - u2 * v1) + y1 * (u2 * v0 - u0 * v2) + y2 * (u0 * v1 - u1 * v0)) / d
      ctx.transform(m11, m12, m21, m22, dx, dy)
      ctx.drawImage(img, 0, 0)
      ctx.restore()
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (let j = 0; j < N; j++)
        for (let i = 0; i < N; i++) {
          const a = pts[j * (N + 1) + i]
          const b = pts[j * (N + 1) + i + 1]
          const c = pts[(j + 1) * (N + 1) + i]
          const d = pts[(j + 1) * (N + 1) + i + 1]
          tri(a, b, c)
          tri(b, d, c)
        }
    }

    const step = () => {
      let moving = false
      for (const p of pts) {
        if (grab && p.w > 0) continue
        const ax = (p.rx - p.x) * 0.16
        const ay = (p.ry - p.y) * 0.16
        p.vx = (p.vx + ax) * 0.82
        p.vy = (p.vy + ay) * 0.82
        p.x += p.vx
        p.y += p.vy
        if (Math.abs(p.vx) + Math.abs(p.vy) + Math.abs(p.rx - p.x) + Math.abs(p.ry - p.y) > 0.05) moving = true
      }
      draw()
      if (moving || grab) raf = requestAnimationFrame(step)
      else raf = 0
    }

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step)
    }

    const local = (e) => {
      const rect = canvas.getBoundingClientRect()
      return [e.clientX - rect.left, e.clientY - rect.top]
    }

    const down = (e) => {
      const [x, y] = local(e)
      const radius = Math.min(w, h) * 0.22
      // Weight every vertex by how close it is to the grab point
      for (const p of pts) {
        const dist = Math.hypot(p.x - x, p.y - y)
        p.w = Math.exp(-(dist * dist) / (2 * radius * radius))
        p.gx = p.x
        p.gy = p.y
      }
      grab = { x, y }
      canvas.setPointerCapture(e.pointerId)
      kick()
    }

    const move = (e) => {
      if (!grab) return
      const [x, y] = local(e)
      const dx = x - grab.x
      const dy = y - grab.y
      for (const p of pts) {
        if (p.w < 0.01) {
          p.w = 0
          continue
        }
        p.x = p.gx + dx * p.w
        p.y = p.gy + dy * p.w
        p.vx = 0
        p.vy = 0
      }
      if (!stretched && Math.hypot(dx, dy) > 60) {
        stretched = true
        onStretch?.()
      }
    }

    const up = () => {
      if (!grab) return
      grab = null
      for (const p of pts) p.w = 0
      kick()
    }

    const ro = new ResizeObserver(() => {
      if (!img.complete) return
      resize()
      draw()
    })

    img.onload = () => {
      resize()
      draw()
      ro.observe(canvas)
      // A little wobble to say "touch me"
      if (!reduce) {
        const mid = pts[Math.floor(pts.length / 2)]
        for (const p of pts) {
          const d = Math.hypot(p.x - mid.x, p.y - mid.y)
          p.vx += Math.sin(d / 18) * 1.5
        }
        kick()
      }
    }

    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
    }
  }, [src, onStretch])

  return <canvas ref={canvasRef} className={className} style={{ touchAction: 'none', cursor: 'grab' }} aria-label="Leigh’s face. Drag to stretch it." role="img" />
}
