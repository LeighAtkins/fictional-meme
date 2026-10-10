import { useCallback, useEffect, useState } from 'react'
import { EMAIL, GITHUB, profile } from '../lib/data'
import s from '../styles/talk.module.css'

// The dialogue screen: Leigh, close up, talking to you. Pick a line; Leigh
// answers. One Speech check is rigged in your favour.

const lines = {
  start: {
    say: 'Oh, hey. You’re not from around here. Recruiter? Name’s Leigh. What can I do for you?',
    options: ['about', 'work', 'stack', 'why', 'speech', 'barter', 'bye'],
  },
  about: {
    say: `${profile.role}. I build browser tools around real-world things: measuring furniture on a drawing, turning a home tour into a reel, growing a golf course from a seed.`,
    options: ['work', 'stack', 'back'],
  },
  work: {
    say: 'Three things, mostly. Which one?',
    options: ['sofapaint', 'reelwalk', 'threewood', 'back'],
  },
  sofapaint: {
    say: 'SofaPaint. People upload a photo of a sofa, a YOLO model on Modal finds the arms and cushions, and a Cloudflare Worker turns them into labelled measurement lines. Then a human checks them, because somebody is going to cut fabric.',
    options: ['show:sofapaint', 'reelwalk', 'threewood', 'back'],
  },
  reelwalk: {
    say: 'ReelWalk turns listing photos and 360s into Instagram Reels with a floor plan that follows the camera. The preview and the export share one Remotion composition, and renders run on SQS and Kubernetes.',
    options: ['show:reelwalk', 'sofapaint', 'threewood', 'back'],
  },
  threewood: {
    say: 'ThreeWood grows an 18-hole golf course from a seed. Same seed, same course, on any phone. One deterministic physics model runs the shot, the aim line and the test bot.',
    options: ['show:threewood', 'sofapaint', 'reelwalk', 'back'],
  },
  stack: {
    say: 'TypeScript, front to back. React and Next.js, Canvas and Three.js in the browser. Node, PostgreSQL, queues and workers behind it, with Docker and Kubernetes when it needs them.',
    options: ['why', 'work', 'back'],
  },
  why: {
    say: 'I like work where the interface has to be exact, because someone will cut fabric or book a viewing based on what it shows. And I finish things: every project you’ve seen here ships.',
    options: ['speech', 'back'],
  },
  speech: {
    check: true,
    say: '...Well, when you put it like that. Send me a message and we’ll set up a call.',
    options: ['email', 'github', 'back'],
  },
  barter: {
    say: 'Negotiable. Caps are fine, but I’d rather talk numbers on a call.',
    options: ['email', 'back'],
  },
}

const prompts = {
  about: 'Tell me about yourself.',
  work: 'What are you working on?',
  sofapaint: 'Tell me about SofaPaint.',
  reelwalk: 'Tell me about ReelWalk.',
  threewood: 'Tell me about ThreeWood.',
  stack: 'What’s your stack?',
  why: 'Why should I hire you?',
  speech: '[Speech 100] You should come and work with us.',
  barter: '[Barter] What’s your rate?',
  back: 'Let’s talk about something else.',
  bye: 'Goodbye.',
  email: `[Email ${EMAIL}]`,
  github: '[Open GitHub]',
  'show:sofapaint': 'Show me. [Open the Pip-Boy entry]',
  'show:reelwalk': 'Show me. [Open the Pip-Boy entry]',
  'show:threewood': 'Show me. [Open the Pip-Boy entry]',
}

export default function FalloutTalk({ onClose, onShow, onSecret, play }) {
  const [node, setNode] = useState('start')
  const [typed, setTyped] = useState(0)
  const line = lines[node]
  const text = line.say

  useEffect(() => {
    setTyped(0)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return setTyped(9999)
    const id = setInterval(() => setTyped((t) => (t >= text.length ? (clearInterval(id), t) : t + 2)), 16)
    return () => clearInterval(id)
  }, [text])

  const choose = useCallback(
    (opt) => {
      play?.('select')
      if (opt === 'bye') return onClose()
      if (opt === 'back') return setNode('start')
      if (opt === 'email') return (window.location.href = `mailto:${EMAIL}?subject=Let%E2%80%99s%20talk`)
      if (opt === 'github') return window.open(GITHUB, '_blank', 'noopener')
      if (opt.startsWith('show:')) return onShow(opt.slice(5))
      if (opt === 'speech') onSecret?.()
      setNode(opt)
    },
    [onClose, onShow, onSecret, play]
  )

  useEffect(() => {
    const onKey = (e) => {
      const n = Number(e.key)
      if (n >= 1 && n <= line.options.length) choose(line.options[n - 1])
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter' && typed < text.length) setTyped(9999)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [line, choose, onClose, typed, text])

  const talking = typed < text.length

  return (
    <div className={s.scene} role="dialog" aria-modal="true" aria-label="Talking to Leigh">
      <div className={s.sky} aria-hidden="true" />
      <div className={s.shack} aria-hidden="true" />
      <img src="/me/leigh.webp" alt="Leigh, talking to you" className={`${s.leigh} ${talking ? s.talking : ''}`} />
      <div className={s.grade} aria-hidden="true" />

      <div className={s.top}>
        <p className={s.name}>{profile.name}</p>
        <p className={s.say} onClick={() => setTyped(9999)}>
          {line.check && <span className={s.check}>[Succeeded] </span>}
          {text.slice(0, typed)}
          <span className={s.rest} aria-hidden="true">
            {text.slice(typed)}
          </span>
        </p>
      </div>

      <ol className={s.options}>
        {line.options.map((opt, i) => (
          <li key={opt}>
            <button type="button" className={s.option} onClick={() => choose(opt)}>
              <span className={s.num}>{i + 1}.</span> {prompts[opt]}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
