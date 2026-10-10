// A tiny promise-based tweener driven by the scene's own render loop, so the
// insert animations can be written as a readable sequence of awaits.

export const ease = {
  linear: (t) => t,
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  back: (t) => {
    const c = 1.70158
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2)
  },
}

export function createTweener() {
  let active = []

  // target: any object; props: { 'position.y': 1, 'rotation.x': 0.3 }
  function to(target, props, duration = 0.5, easing = ease.inOut) {
    return new Promise((resolve) => {
      const tracks = Object.entries(props).map(([path, end]) => {
        const keys = path.split('.')
        const last = keys.pop()
        const owner = keys.reduce((o, k) => o[k], target)
        return { owner, key: last, start: owner[last], end }
      })
      active.push({ tracks, duration: Math.max(0.0001, duration), t: 0, easing, resolve })
    })
  }

  function wait(seconds) {
    return to({ v: 0 }, { v: 1 }, seconds, ease.linear)
  }

  function update(dt) {
    if (!active.length) return
    const done = []
    for (const tw of active) {
      tw.t = Math.min(1, tw.t + dt / tw.duration)
      const k = tw.easing(tw.t)
      for (const tr of tw.tracks) tr.owner[tr.key] = tr.start + (tr.end - tr.start) * k
      if (tw.t >= 1) done.push(tw)
    }
    if (done.length) {
      active = active.filter((tw) => !done.includes(tw))
      done.forEach((tw) => tw.resolve())
    }
  }

  function clear() {
    active = []
  }

  return { to, wait, update, clear, get busy() {
    return active.length > 0
  } }
}
