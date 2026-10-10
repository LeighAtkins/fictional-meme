// Tiny synthesised sound effects. Nothing is sampled; every sound is a few
// oscillators, so the whole sound bank weighs less than one icon.

let ctx = null
let enabled = false

export function setSoundEnabled(on) {
  enabled = on
  if (on && !ctx && typeof window !== 'undefined') {
    const AC = window.AudioContext || window.webkitAudioContext
    if (AC) ctx = new AC()
  }
  if (ctx && ctx.state === 'suspended') ctx.resume()
}

export function soundEnabled() {
  return enabled
}

function tone(freq, { at = 0, dur = 0.08, type = 'square', vol = 0.06, slide = 0 } = {}) {
  if (!enabled || !ctx) return
  const t = ctx.currentTime + at
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur)
  gain.gain.setValueAtTime(vol, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

function noise({ at = 0, dur = 0.03, vol = 0.05, hp = 2000 } = {}) {
  if (!enabled || !ctx) return
  const t = ctx.currentTime + at
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  const src = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  filter.type = 'highpass'
  filter.frequency.value = hp
  gain.gain.value = vol
  src.buffer = buffer
  src.connect(filter).connect(gain).connect(ctx.destination)
  src.start(t)
}

// Each game has its own voice for the same three events
const banks = {
  hyrule: {
    move: () => tone(1320, { type: 'sine', dur: 0.06, vol: 0.05 }),
    select: () => {
      tone(880, { type: 'triangle', dur: 0.1 })
      tone(1320, { type: 'triangle', at: 0.06, dur: 0.14 })
    },
    page: () => tone(300, { type: 'sine', dur: 0.25, slide: 500, vol: 0.05 }),
  },
  attache: {
    move: () => noise({ dur: 0.02, vol: 0.06, hp: 3000 }),
    select: () => tone(180, { type: 'triangle', dur: 0.12, vol: 0.12, slide: -60 }),
    page: () => tone(140, { type: 'sawtooth', dur: 0.12, vol: 0.04 }),
  },
  wasteland: {
    move: () => noise({ dur: 0.015, vol: 0.08, hp: 1500 }),
    select: () => {
      noise({ dur: 0.02, vol: 0.08 })
      tone(620, { type: 'square', at: 0.02, dur: 0.05, vol: 0.03 })
    },
    page: () => noise({ dur: 0.06, vol: 0.06, hp: 800 }),
  },
  castle: {
    move: () => tone(990, { type: 'square', dur: 0.05, vol: 0.04 }),
    select: () => [988, 1319, 1976].forEach((f, i) => tone(f, { type: 'square', at: i * 0.06, dur: 0.08, vol: 0.04 })),
    page: () => tone(200, { type: 'square', dur: 0.2, slide: 900, vol: 0.04 }),
  },
  normandy: {
    move: () => tone(2400, { type: 'sine', dur: 0.03, vol: 0.03 }),
    select: () => {
      tone(440, { type: 'sine', dur: 0.18, vol: 0.05, slide: 220 })
      tone(880, { type: 'sine', at: 0.05, dur: 0.12, vol: 0.03 })
    },
    page: () => tone(120, { type: 'sine', dur: 0.4, vol: 0.08, slide: -40 }),
  },
  shelf: {
    move: () => tone(700, { type: 'triangle', dur: 0.04, vol: 0.04 }),
    select: () => {
      noise({ dur: 0.05, vol: 0.08, hp: 400 })
      tone(90, { type: 'square', at: 0.04, dur: 0.12, vol: 0.06 })
    },
    page: () => tone(520, { type: 'triangle', dur: 0.1, vol: 0.04 }),
  },
}

export function sfx(game, event) {
  banks[game]?.[event]?.()
}

// A short original jingle for secrets, in every game
export function secretJingle() {
  ;[523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, { type: 'square', at: i * 0.09, dur: 0.12, vol: 0.04 }))
}

// Wrist-terminal radio: an original loping tune on a detuned square wave
export function playRadio() {
  if (!enabled || !ctx) return () => {}
  const notes = [392, 440, 494, 587, 494, 440, 392, 330, 392, 440, 392, 294, 330, 392, 330, 262]
  let stopped = false
  let step = 0
  const tick = () => {
    if (stopped) return
    const f = notes[step % notes.length]
    tone(f, { type: 'square', dur: 0.32, vol: 0.025 })
    tone(f / 2, { type: 'triangle', dur: 0.32, vol: 0.04 })
    if (step % 4 === 0) noise({ dur: 0.08, vol: 0.015, hp: 5000 })
    step += 1
  }
  tick()
  const id = setInterval(tick, 340)
  return () => {
    stopped = true
    clearInterval(id)
  }
}
