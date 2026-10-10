import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ItemBody from '../components/ItemBody'
import StretchFace from '../components/StretchFace'
import { SECRETS, useArcade, readJSON, writeJSON } from '../lib/arcade'
import { profile } from '../lib/data'
import s from './castle.module.css'

const CastleHall = dynamic(() => import('../components/CastleHall'), { ssr: false })

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
  // The course list starts folded away on phones, where it would cover the hall
  const [listOpen, setListOpen] = useState(true)
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) setListOpen(false)
  }, [])

  useEffect(() => {
    setCollected(readJSON('itembox.stars', {}))
  }, [])

  const paintings = items.filter((i) => i.kind === 'project' || i.kind === 'side')
  // Where each painting hangs in the hall: the big frames get the projects
  const hallOrder = useMemo(
    () =>
      ['sofapaint', 'style-check', 'threewood', 'reelwalk', 'supportcopilot', 'galactic']
        .map((id) => paintings.find((p) => p.id === id))
        .filter(Boolean)
        .map((p) => ({ id: p.id, name: p.name, number: paintings.indexOf(p) + 1, poster: p.project?.media.poster, color: canvasColors[p.id] })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  )

  const enter = (item, index) => {
    if (jumping || course) return
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
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const starTotal = Object.values(collected).reduce((a, b) => a + b, 0) + found.length
  const starMax = paintings.reduce((a, p) => a + (p.project ? p.project.features.length : 1), 0) + Object.keys(SECRETS).length

  return (
    <div className={s.castle}>
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

      <div className={s.hall3d}>
        <CastleHall
          paintings={hallOrder}
          paused={!!course || face || talk}
          onEnter={(id) => {
            const i = paintings.findIndex((p) => p.id === id)
            if (i >= 0) enter(paintings[i], i)
          }}
          onSecret={(id) => findSecret(id, 'Up the stairs: the plain résumé lives behind this door, at /resume.')}
          onTalk={() => (setTalk(true), play('select'))}
        />
      </div>

      <div className={s.hint}>
        <p>
          <kbd>WASD</kbd> or arrows to run, <kbd>Space</kbd> to jump. Run into a painting to enter it.
        </p>
      </div>

      <details className={s.quickList} open={listOpen} onToggle={(e) => setListOpen(e.currentTarget.open)}>
        <summary>Or jump straight in</summary>
        <ul>
          {paintings.map((p, i) => (
            <li key={p.id}>
              <button type="button" onClick={() => enter(p, i)}>
                {i + 1}. {p.name}
                {collected[p.id] ? ' ★' : ''}
              </button>
            </li>
          ))}
        </ul>
      </details>

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
