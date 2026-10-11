import { useEffect, useMemo, useRef, useState } from 'react'
import { EMAIL } from '../lib/data'
import s from '../styles/elevator.module.css'

// The famously long elevator ride, with the news on. Each bulletin covers one
// of Leigh's projects; at the end the doors open on the squad screen.

const bulletins = [
  {
    tag: 'Top story',
    image: '/me/leigh.webp',
    text: 'Good evening, Citadel. Our top story: a full-stack developer named Leigh Atkins has been seen building tools around real-world things.',
  },
  {
    tag: 'Technology',
    image: '/media/sofapaint-generation.jpg',
    text: 'SofaPaint lets customers measure their own sofas. A segmentation model on Modal finds the arms and cushions, and a Cloudflare Worker turns them into labelled measurement lines.',
  },
  {
    tag: 'Manufacturing',
    image: '/media/sofapaint-desktop-poster.jpg',
    text: 'Its desktop sibling, built in Rust with Tauri, reads the numbers back off photos and PDFs and checks the cushions fit before any fabric is cut.',
  },
  {
    tag: 'Housing',
    image: '/media/reelwalk-poster.jpg',
    text: 'On the property beat, ReelWalk lets agents cut listing Reels on a phone. Exports render on Fargate from the same composition the editor previews.',
  },
  {
    tag: 'Logistics',
    image: '/media/handoff-tracker-poster.jpg',
    text: 'Parcels lost between carriers? Handoff Tracker follows them across the handoff from 4PX to Sagawa and flags the ones that go quiet.',
  },
  {
    tag: 'Education',
    image: '/media/tslock-poster.jpg',
    text: 'TSLock teaches TypeScript with challenges that only pass when the code runs and the types match a contract.',
  },
  {
    tag: 'Sport',
    image: '/media/threewood-poster.jpg',
    text: 'And in sport, ThreeWood grows a new eighteen-hole course from every seed, for up to four phones at once. Pundits call the greens cruel, but deterministic.',
  },
  {
    tag: 'Classifieds',
    image: '/me/leigh.webp',
    text: `Leigh Atkins is open to new roles. Recruiters can reach Leigh at ${EMAIL.replace('@', ' at ')}. Back to you.`,
  },
]

const SEGMENT = 6200

function useCityLights() {
  return useMemo(() => {
    const r = (() => {
      let x = 11
      return () => ((x = (x * 16807) % 2147483647) - 1) / 2147483646
    })()
    return Array.from({ length: 70 }, () => ({
      left: r() * 100,
      top: r() * 200,
      w: 2 + r() * 10,
      h: 10 + r() * 60,
      hue: r() < 0.7 ? 30 + r() * 20 : 190 + r() * 30,
      o: 0.25 + r() * 0.6,
    }))
  }, [])
}

export default function Elevator({ sound, onArrive, onSecret }) {
  const [seg, setSeg] = useState(0)
  const [opening, setOpening] = useState(false)
  const lights = useCityLights()
  const spoken = useRef(-1)
  const finished = useRef(false)

  // Advance the bulletins; open the doors after the last one
  useEffect(() => {
    if (seg >= bulletins.length) {
      if (!finished.current) {
        finished.current = true
        onSecret?.()
      }
      setOpening(true)
      const t = setTimeout(onArrive, 1400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setSeg((v) => v + 1), SEGMENT)
    return () => clearTimeout(t)
  }, [seg, onArrive, onSecret])

  // Read the news aloud when sound is on
  useEffect(() => {
    if (!sound || !('speechSynthesis' in window) || seg >= bulletins.length || spoken.current === seg) return
    spoken.current = seg
    const u = new SpeechSynthesisUtterance(bulletins[seg].text)
    u.rate = 1.05
    u.pitch = 1.05
    const voice = window.speechSynthesis.getVoices().find((v) => /en-(GB|US)/.test(v.lang) && /female|samantha|zira|libby|sonia/i.test(v.name))
    if (voice) u.voice = voice
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }, [seg, sound])

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  const skip = () => {
    window.speechSynthesis?.cancel()
    finished.current = true
    setSeg(bulletins.length)
  }

  const b = bulletins[Math.min(seg, bulletins.length - 1)]
  const floor = Math.min(1, seg / bulletins.length)

  return (
    <div className={s.car}>
      <div className={s.window} aria-hidden="true">
        <div className={s.city}>
          {[0, 1].map((k) => (
            <div key={k} className={s.cityTile}>
              {lights.map((l, i) => (
                <span
                  key={i}
                  style={{ left: `${l.left}%`, top: `${l.top / 2}%`, width: l.w, height: l.h, background: `hsla(${l.hue}, 90%, 65%, ${l.o})` }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className={s.mullions} />
      </div>
      <div className={s.wallL} aria-hidden="true" />
      <div className={s.wallR} aria-hidden="true" />

      <div className={s.indicator}>
        <span>Presidium</span>
        <span className={s.track}>
          <span style={{ width: `${floor * 100}%` }} />
        </span>
        <span>Docking bay D24</span>
      </div>

      <img src="/me/leigh.webp" alt="Leigh, riding the elevator" className={s.leigh} />

      <figure className={s.news}>
        <div className={s.newsScreen}>
          <img key={b.image + seg} src={b.image} alt="" />
          <span className={s.live}>Live</span>
          <span className={s.lower}>
            <strong>CBN</strong> {b.tag}
          </span>
        </div>
        <figcaption className={s.ticker}>
          <span>Citadel Broadcast Network · Leigh Atkins: full-stack developer, open to new roles · SofaPaint · SofaPaint Desktop · ReelWalk · Handoff Tracker · TSLock · ThreeWood ·</span>
        </figcaption>
      </figure>

      <p className={s.subtitle} aria-live="polite">
        <span className={s.speaker}>News anchor:</span> {b.text}
      </p>

      <button type="button" className={s.skip} onClick={skip}>
        Skip the ride
      </button>

      <div className={`${s.doorL} ${opening ? s.doorOpenL : ''}`} aria-hidden="true" />
      <div className={`${s.doorR} ${opening ? s.doorOpenR : ''}`} aria-hidden="true" />
    </div>
  )
}
