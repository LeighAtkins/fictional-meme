import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { SoundToggle } from './SystemBar'
import { useArcade } from '../lib/arcade'
import { EMAIL, GITHUB, games, profile } from '../lib/data'
import s from '../styles/shelf.module.css'

const howToPlay = {
  hyrule: 'Turn the pause menu, equip projects to the C buttons, and listen when the fairy talks.',
  attache: 'Drag projects around the case, press R to rotate them, and keep an eye out for the merchant.',
  wasteland: 'Browse projects on the wrist terminal, check the S.P.E.C.I.A.L. stats and tune the radio.',
  castle: 'Jump into a painting to enter a project, collect its stars, and pull Leigh’s face about.',
  normandy: 'Read the dossier, check the powers, and use the conversation wheel to get in touch.',
}

function Rainbow({ text }) {
  const colors = ['#e8382e', '#f5b800', '#2c9e4b', '#2b6fd6', '#e8382e', '#f5b800']
  return text.split('').map((ch, i) => (
    <span key={i} style={{ color: ch === ' ' ? undefined : colors[i % colors.length] }}>
      {ch}
    </span>
  ))
}

// Box art. Every game stars Leigh, cut out of a real photo and processed to suit.
function Cover({ game }) {
  switch (game.id) {
    case 'hyrule':
      return (
        <div className={`${s.label} ${s.hyruleArt}`}>
          <img src="/me/hero-of-time.webp" alt="" className={s.hyruleHero} />
          <p className={s.hyruleTitle}>
            <span>The Legend of</span> Leigh
          </p>
          <p className={s.hyruleSub}>Ocarina of Code</p>
        </div>
      )
    case 'castle':
      return (
        <div className={`${s.label} ${s.castleArt}`}>
          <img src="/me/face.webp" alt="" className={s.castleFace} />
          <p className={s.castleTitle}>
            <Rainbow text="Super Leigh" />
            <span className={s.castle64}>64</span>
          </p>
        </div>
      )
    case 'attache':
      return (
        <div className={`${s.cover} ${s.attacheArt}`}>
          <img src="/me/agent.webp" alt="" className={s.attacheAgent} />
          <p className={s.attacheTitle}>
            Resident
            <br />
            Developer <span>4</span>
          </p>
        </div>
      )
    case 'wasteland':
      return (
        <div className={`${s.cover} ${s.wastelandArt}`}>
          <div className={s.wastelandScreen}>
            <img src="/me/vault-dweller.webp" alt="" />
          </div>
          <p className={s.wastelandTitle}>Fullstack 3</p>
        </div>
      )
    case 'normandy':
      return (
        <div className={`${s.cover} ${s.normandyArt}`}>
          <img src="/me/commander.webp" alt="" className={s.normandyHolo} />
          <p className={s.normandyTitle}>
            Mass Deploy <span>2</span>
          </p>
        </div>
      )
    default:
      return null
  }
}

export default function Shelf({ onInsert, lastGame }) {
  const { play, items } = useArcade()
  const [focus, setFocus] = useState(0)
  const [inserting, setInserting] = useState(null)
  const buttons = useRef([])

  useEffect(() => {
    if (lastGame) {
      const i = games.findIndex((g) => g.id === lastGame)
      if (i >= 0) {
        setFocus(i)
        // Bring the last game played into view on a narrow shelf
        const shelf = buttons.current[i]?.parentElement
        const el = buttons.current[i]
        if (shelf && el) shelf.scrollLeft = el.offsetLeft - (shelf.clientWidth - el.offsetWidth) / 2
      }
    }
  }, [lastGame])

  const insert = (game) => {
    if (inserting) return
    play('select')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return onInsert(game.id)
    setInserting(game.id)
    setTimeout(() => onInsert(game.id), 900)
  }

  const onKeyDown = (e) => {
    const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (!dir) return
    e.preventDefault()
    const next = (focus + dir + games.length) % games.length
    setFocus(next)
    buttons.current[next]?.focus()
    play('move')
  }

  const current = games[focus]
  const projects = items.filter((i) => i.kind === 'project')

  return (
    <main className={s.room}>
      <div className={s.glow} aria-hidden="true" />
      <header className={s.top}>
        <span className={s.domain}>itembox.site</span>
        <nav aria-label="Quick links" className={s.quick}>
          <SoundToggle className={s.quickLink} />
          <Link href="/resume" className={s.quickLink}>
            Plain résumé
          </Link>
          <a href={`mailto:${EMAIL}`} className={s.quickLink}>
            {EMAIL}
          </a>
        </nav>
      </header>

      <section className={s.intro}>
        <h1 className={s.name}>Leigh Atkins</h1>
        <p className={s.role}>
          {profile.role}. {profile.pitch}
        </p>
        <p className={s.prompt}>
          My projects are the items in this box. Pick a game to open it: {projects.map((p) => p.name).join(', ')} and the rest
          are in every one, each kept the way that game keeps its things.
        </p>
      </section>

      <section aria-label="Choose a game" className={s.shelfWrap}>
        <div role="listbox" aria-label="Games" aria-activedescendant={`game-${current.id}`} className={s.shelf} onKeyDown={onKeyDown}>
          {games.map((game, i) => (
            <button
              key={game.id}
              id={`game-${game.id}`}
              ref={(el) => (buttons.current[i] = el)}
              type="button"
              role="option"
              aria-selected={i === focus}
              tabIndex={i === focus ? 0 : -1}
              onClick={() => (i === focus ? insert(game) : (setFocus(i), play('move')))}
              onDoubleClick={() => insert(game)}
              onMouseEnter={() => i !== focus && !inserting && (setFocus(i), play('move'))}
              onFocus={() => setFocus(i)}
              className={`${s.slot} ${game.media === 'cart' ? s.slotCart : s.slotCase} ${i === focus ? s.picked : ''} ${
                inserting === game.id ? s.inserting : ''
              } ${inserting && inserting !== game.id ? s.dimmed : ''}`}
            >
              <span className="sr-only">
                {game.title}, a homage to {game.homage}
              </span>
              {game.media === 'cart' ? (
                <span className={`${s.cart} ${game.id === 'hyrule' ? s.cartGold : ''}`} aria-hidden="true">
                  <Cover game={game} />
                  <span className={s.cartLip} />
                </span>
              ) : (
                <span className={`${s.case} ${s[`case_${game.id}`]}`} aria-hidden="true">
                  {game.media === 'disc' && <span className={s.disc} />}
                  <Cover game={game} />
                </span>
              )}
            </button>
          ))}
        </div>
        <div className={s.plank} aria-hidden="true" />
      </section>

      <section className={s.info} aria-live="polite">
        <div>
          <h2 className={s.gameTitle}>{current.title}</h2>
          <p className={s.gameMeta}>
            A homage to {current.homage} ({current.year}). {howToPlay[current.id]}
          </p>
        </div>
        <button type="button" className={s.play} onClick={() => insert(current)}>
          Play {current.title}
        </button>
      </section>

      <footer className={s.foot}>
        <p>
          Arrow keys pick a game, Enter plays it. Fan homages drawn for this site; not affiliated with Nintendo, Capcom, Bethesda
          or Electronic Arts. Source on <a href={`${GITHUB}/fictional-meme`}>GitHub</a>.
        </p>
      </footer>

      {inserting && <div className={s.flash} aria-hidden="true" />}
    </main>
  )
}
