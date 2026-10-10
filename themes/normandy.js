import { useEffect, useState } from 'react'
import ItemIcon from '../components/ItemIcon'
import ItemBody from '../components/ItemBody'
import { useArcade } from '../lib/arcade'
import { EMAIL, GITHUB, profile, skills } from '../lib/data'
import s from './normandy.module.css'

// A homage to the Mass Effect 2 squad screen: a holographic dossier, powers
// with ranks, research projects, and a conversation wheel for the next step.

const powerNames = {
  front: 'Overload: Front end',
  back: 'Fortification: Back end',
  infra: 'Combat Drone: Infrastructure',
  ai: 'AI Hacking: Applied AI',
  video: 'Incinerate: Video and graphics',
  tests: 'Tech Armor: Testing',
}

const TABS = ['Dossier', 'Powers', 'Research']

export default function Normandy({ onEject }) {
  const { items, play, findSecret } = useArcade()
  const [tab, setTab] = useState(2)
  const [research, setResearch] = useState('sofapaint')
  const [interrupt, setInterrupt] = useState(false)
  const [line, setLine] = useState(null)

  const projects = items.filter((i) => i.kind === 'project' || i.kind === 'side')
  const current = projects.find((p) => p.id === research) || projects[0]

  // Once per visit, a Paragon interrupt flashes up for a few seconds
  useEffect(() => {
    const show = setTimeout(() => setInterrupt(true), 9000)
    const hide = setTimeout(() => setInterrupt(false), 15000)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [])

  const go = (t) => {
    setTab(t)
    play('page')
  }

  const say = (text) => {
    setLine(text)
    play('select')
  }

  const wheel = [
    { pos: 'tr', kind: 'paragon', label: 'Let’s talk about a role.', act: () => (say('Leigh: “Glad to. My inbox is open.”'), setTimeout(() => (window.location.href = `mailto:${EMAIL}`), 700)) },
    { pos: 'r', kind: 'neutral', label: 'Show me your work.', act: () => (go(2), say('Leigh: “Start with SofaPaint. It measures sofas from a photo.”')) },
    { pos: 'br', kind: 'renegade', label: 'Show me the code.', act: () => (say('Leigh: “No need to shout. It’s all on GitHub.”'), window.open(GITHUB, '_blank', 'noopener')) },
    { pos: 'tl', kind: 'neutral', label: 'Who are you?', act: () => (go(0), say(`Leigh: “${profile.role}. I build browser tools around real-world things.”`)) },
    { pos: 'l', kind: 'investigate', label: 'Investigate', act: () => (go(1), say('Leigh: “Here’s what I bring to the squad.”')) },
    { pos: 'bl', kind: 'neutral', label: 'I should go.', act: () => onEject?.() },
  ]

  useEffect(() => {
    const onKey = (e) => {
      if (['1', '2', '3'].includes(e.key)) go(Number(e.key) - 1)
      if (tab === 2 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault()
        const i = projects.findIndex((p) => p.id === research)
        const next = projects[(i + (e.key === 'ArrowDown' ? 1 : -1) + projects.length) % projects.length]
        setResearch(next.id)
        play('move')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className={s.bridge}>
      <div className={s.stars} aria-hidden="true" />
      <div className={s.layout}>
        <section className={s.holoCol} aria-label="Squad member">
          <div className={s.holo}>
            <img src="/me/commander.webp" alt="Leigh, smiling, as a blue hologram" />
            <span className={s.holoScan} aria-hidden="true" />
            <span className={s.holoBase} aria-hidden="true" />
          </div>
          <div className={s.card}>
            <p className={s.name}>{profile.name}</p>
            <dl className={s.facts}>
              <div>
                <dt>Class</dt>
                <dd>Engineer (full stack)</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd className={s.loyal}>Open to new roles</dd>
              </div>
              <div>
                <dt>Comms</dt>
                <dd>
                  <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className={s.panel}>
          <nav className={s.tabs} aria-label="Squad screen">
            {TABS.map((t, i) => (
              <button key={t} type="button" className={`${s.tab} ${i === tab ? s.tabOn : ''}`} onClick={() => go(i)}>
                {t}
              </button>
            ))}
          </nav>

          {tab === 0 && (
            <div className={s.dossier}>
              <h1 className={s.heading}>Dossier: {profile.name}</h1>
              {profile.about.map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
              <p className={s.dim}>Recommended for missions where the interface has to be exact.</p>
            </div>
          )}

          {tab === 1 && (
            <div className={s.powers}>
              <h1 className={s.heading}>Powers</h1>
              <ul>
                {skills.map((sk) => (
                  <li key={sk.id} className={s.power}>
                    <div className={s.powerHead}>
                      <span>{powerNames[sk.id]}</span>
                      <span className={s.pips} aria-label={`Rank ${sk.rank} of 4`}>
                        {[1, 2, 3, 4].map((n) => (
                          <span key={n} className={n <= sk.rank ? s.pipOn : s.pip} />
                        ))}
                      </span>
                    </div>
                    <p className={s.dim}>{sk.tools.join(', ')}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 2 && (
            <div className={s.research}>
              <ul className={s.projectList}>
                {projects.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className={`${s.project} ${p.id === current.id ? s.projectOn : ''}`}
                      onClick={() => {
                        setResearch(p.id)
                        play('move')
                        if (window.innerWidth < 860) setTimeout(() => document.querySelector(`.${s.detail}`)?.scrollIntoView({ block: 'start' }), 50)
                      }}
                    >
                      <ItemIcon name={p.icon} className={s.projIcon} />
                      <span>
                        <strong>{p.name}</strong>
                        <small>{p.project ? p.project.tagline : p.alias}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className={s.detail}>
                <h1 className={s.heading}>{current.name}</h1>
                <ItemBody item={current} />
              </div>
            </div>
          )}
        </section>
      </div>

      <div className={s.convo}>
        {line && (
          <p className={s.subtitle} aria-live="polite">
            {line}
          </p>
        )}
        <div className={s.wheel} role="menu" aria-label="Conversation">
          <span className={s.hub} aria-hidden="true" />
          {wheel.map((w) => (
            <button key={w.pos} type="button" role="menuitem" className={`${s.option} ${s[w.pos]} ${s[w.kind]}`} onClick={w.act}>
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {interrupt && (
        <button
          type="button"
          className={s.interrupt}
          onClick={() => {
            setInterrupt(false)
            say('Leigh: “Nice timing. That’s the kind of reflex I like on a team.”')
            findSecret('interrupt', '+2 Paragon.')
          }}
        >
          <span className={s.interruptIcon} aria-hidden="true" />
          Paragon interrupt
        </button>
      )}
    </div>
  )
}
