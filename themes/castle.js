import { useCallback, useEffect, useState } from 'react'
import ItemIcon from '../components/ItemIcon'
import ItemBody from '../components/ItemBody'
import StretchFace from '../components/StretchFace'
import { SECRETS, useArcade, readJSON, writeJSON } from '../lib/arcade'
import { profile } from '../lib/data'
import s from './castle.module.css'

// A homage to the Super Mario 64 castle: every project hangs on the wall as
// a painting, and jumping into one opens its course and its stars.

const canvasColors = { 'style-check': '#2f7a74', supportcopilot: '#7a2f3a', galactic: '#2e2a6b' }

function Star({ got = true, className = '' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M20 2 L25 14 L38 15 L28 24 L31 37 L20 30 L9 37 L12 24 L2 15 L15 14 Z"
        fill={got ? '#ffd23a' : 'rgba(255,255,255,0.15)'}
        stroke={got ? '#8a5a00' : 'rgba(255,255,255,0.5)'}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {got && (
        <>
          <ellipse cx="16.5" cy="20" rx="1.6" ry="3.4" fill="#1c1c1c" />
          <ellipse cx="23.5" cy="20" rx="1.6" ry="3.4" fill="#1c1c1c" />
        </>
      )}
    </svg>
  )
}

export default function Castle() {
  const { items, play, findSecret, found } = useArcade()
  const [course, setCourse] = useState(null)
  const [jumping, setJumping] = useState(null)
  const [starSel, setStarSel] = useState(0)
  const [collected, setCollected] = useState({})
  const [face, setFace] = useState(false)
  const [talk, setTalk] = useState(false)
  const [focus, setFocus] = useState(0)

  useEffect(() => {
    setCollected(readJSON('itembox.stars', {}))
  }, [])

  const paintings = items.filter((i) => i.kind === 'project' || i.kind === 'side')

  const enter = (item, index) => {
    if (jumping) return
    play('page')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setJumping(item.id)
    setTimeout(
      () => {
        setJumping(null)
        setCourse({ item, number: index + 1 })
        setStarSel(0)
        findSecret('painting', 'Wahoo!')
        const stars = item.project ? item.project.features.length : 1
        setCollected((prev) => {
          const next = { ...prev, [item.id]: stars }
          writeJSON('itembox.stars', next)
          return next
        })
      },
      reduce ? 0 : 750
    )
  }

  const onStretch = useCallback(() => findSecret('face', 'Mamma mia, what a face.'), [findSecret])

  useEffect(() => {
    const onKey = (e) => {
      if (face || talk) {
        if (e.key === 'Escape') (setFace(false), setTalk(false))
        return
      }
      if (course) {
        if (e.key === 'Escape' || e.key === 'Backspace') setCourse(null)
        const n = course.item.project?.features.length || 0
        if (n && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
          setStarSel((v) => (v + (e.key === 'ArrowRight' ? 1 : -1) + n) % n)
          play('move')
        }
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        setFocus((f) => (f + (e.key === 'ArrowRight' ? 1 : -1) + paintings.length) % paintings.length)
        play('move')
      } else if (e.key === 'Enter') {
        enter(paintings[focus], focus)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const starTotal = Object.values(collected).reduce((a, b) => a + b, 0) + found.length
  const starMax = paintings.reduce((a, p) => a + (p.project ? p.project.features.length : 1), 0) + Object.keys(SECRETS).length

  return (
    <div className={s.castle}>
      {/* The ripple every painting uses on hover */}
      <svg width="0" height="0" className={s.defs} aria-hidden="true">
        <filter id="ripple">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="3">
            <animate attributeName="baseFrequency" dur="3s" values="0.012 0.03;0.016 0.04;0.012 0.03" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="14" />
        </filter>
      </svg>

      <header className={s.hud}>
        <button type="button" className={s.lives} onClick={() => setFace(true)} title="Pull Leigh’s face">
          <img src="/me/face.webp" alt="" className={s.lifeFace} />
          <span>×</span>1
        </button>
        <p className={s.stars}>
          <Star className={s.hudStar} />
          <span>×</span>
          {starTotal}
          <small>/{starMax}</small>
        </p>
      </header>

      <div className={s.hall}>
        <div className={s.wall}>
          <h1 className={s.title}>Leigh’s castle</h1>
          <p className={s.sub}>Jump into a painting to enter a project. Every course has stars to collect.</p>

          <ul className={s.paintings}>
            {paintings.map((p, i) => {
              const big = p.kind === 'project'
              return (
                <li key={p.id} className={big ? s.bigSlot : s.smallSlot}>
                  <button
                    type="button"
                    className={`${s.frame} ${jumping === p.id ? s.jump : ''} ${i === focus ? s.focused : ''}`}
                    onClick={() => (setFocus(i), enter(p, i))}
                    onMouseEnter={() => setFocus(i)}
                    aria-label={`Course ${i + 1}: ${p.name}. Jump in.`}
                  >
                    <span className={s.canvas} style={{ background: canvasColors[p.id] }}>
                      {p.project ? (
                        <img src={p.project.media.poster} alt="" className={s.poster} />
                      ) : (
                        <ItemIcon name={p.icon} className={s.canvasIcon} />
                      )}
                    </span>
                  </button>
                  <p className={s.plaque}>
                    <span>Course {i + 1}</span> {p.name}
                    {collected[p.id] && <Star className={s.plaqueStar} />}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>

        <div className={s.floor}>
          <div className={s.tiles} aria-hidden="true" />
          <button type="button" className={s.leigh} onClick={() => (setTalk(true), play('select'))} aria-label="Talk to Leigh">
            <img src="/me/plumber.webp" alt="" />
            <span className={s.shadow} />
          </button>
        </div>
      </div>

      {talk && (
        <div className={s.dialog} role="dialog" aria-label="Leigh says" onClick={() => setTalk(false)}>
          <p>
            <strong>It’s-a me, Leigh!</strong> {profile.pitch} Jump into a painting to see how. Click my face up top if you
            want to pull it about.
          </p>
        </div>
      )}

      {course && (
        <div className={s.course} role="dialog" aria-modal="true" aria-label={`Course ${course.number}: ${course.item.name}`}>
          <button type="button" className={s.exit} onClick={() => setCourse(null)}>
            Exit course
          </button>
          <p className={s.courseNo}>Course {course.number}</p>
          <h2 className={s.courseName}>{course.item.name}</h2>

          {course.item.project && (
            <div className={s.starRow} role="listbox" aria-label="Stars">
              {course.item.project.features.map((f, i) => (
                <button
                  key={f}
                  type="button"
                  role="option"
                  aria-selected={i === starSel}
                  className={`${s.starBtn} ${i === starSel ? s.starOn : ''}`}
                  onClick={() => (setStarSel(i), play('move'))}
                  onMouseEnter={() => setStarSel(i)}
                >
                  <Star className={s.bigStar} />
                  <span className="sr-only">{f}</span>
                </button>
              ))}
            </div>
          )}
          {course.item.project && <p className={s.starName}>★ {course.item.project.features[starSel]}</p>}

          <div className={s.courseBody}>
            <ItemBody item={course.item} />
          </div>
        </div>
      )}

      {face && (
        <div className={s.faceWrap} role="dialog" aria-modal="true" aria-label="Leigh’s face" onClick={() => setFace(false)}>
          <div className={s.faceStage} onClick={(e) => e.stopPropagation()}>
            <StretchFace src="/me/face.webp" onStretch={onStretch} className={s.faceCanvas} />
            <p className={s.faceHint}>Grab anywhere and pull. Let go to watch it snap back.</p>
            <button type="button" className={s.exit} onClick={() => setFace(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
