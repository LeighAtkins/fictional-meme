import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { items as baseItems, secretItem } from './data'
import { secretJingle, setSoundEnabled, sfx } from './sfx'

// Every easter egg on the site. Finding one in any game counts everywhere.
export const SECRETS = {
  konami: 'Entered the Konami code',
  fairy: 'Listened to the fairy',
  cbutton: 'Equipped an item to a C button',
  rupees: 'Collected 100 rupees',
  merchant: 'Met the merchant',
  rotate: 'Rotated an item in the case',
  radio: 'Tuned the radio',
  vats: 'Used V.A.T.S.',
  face: 'Stretched Leigh’s face',
  castleRun: 'Found the secret behind the castle stairs',
  painting: 'Jumped into a painting',
  interrupt: 'Took an interrupt',
  elevator: 'Rode the elevator to the end of the news',
  speech: 'Passed a Speech check',
  console: 'Opened the developer console',
}

const ArcadeContext = createContext(null)

function readJSON(key, fallback) {
  try {
    const v = window.localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

export function ArcadeProvider({ game, children }) {
  const [sound, setSound] = useState(false)
  const [found, setFound] = useState([])
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const gameRef = useRef(game)
  gameRef.current = game

  const foundRef = useRef([])

  useEffect(() => {
    foundRef.current = readJSON('itembox.secrets', [])
    setFound(foundRef.current)
    const s = readJSON('itembox.sound', false)
    setSound(s)
    setSoundEnabled(s)
  }, [])

  const notify = useCallback((message, tone = 'info') => {
    setToast({ message, tone, key: Date.now() })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 4200)
  }, [])

  const findSecret = useCallback(
    (id, message) => {
      const prev = foundRef.current
      if (prev.includes(id)) {
        if (message) notify(message)
        return
      }
      const next = [...prev, id]
      foundRef.current = next
      setFound(next)
      writeJSON('itembox.secrets', next)
      secretJingle()
      notify(`${message ? `${message} ` : ''}Secret ${next.length} of ${Object.keys(SECRETS).length}: ${SECRETS[id].replace(/\.$/, '')}.`, 'secret')
    },
    [notify]
  )

  const toggleSound = useCallback(() => {
    const next = !sound
    setSound(next)
    setSoundEnabled(next)
    writeJSON('itembox.sound', next)
    if (next) setTimeout(() => sfx(gameRef.current || 'shelf', 'select'), 30)
  }, [sound])

  // Konami code, in any game
  useEffect(() => {
    let pos = 0
    const onKey = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      pos = key === KONAMI[pos] ? pos + 1 : key === KONAMI[0] ? 1 : 0
      if (pos === KONAMI.length) {
        pos = 0
        findSecret('konami', 'A rubber duck appeared in your inventory.')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [findSecret])

  // Developers who open the console get a note, and a secret if they call it
  useEffect(() => {
    if (window.__itemboxGreeted) return
    window.__itemboxGreeted = true
    console.log(
      '%citembox.site%c\nHello, fellow developer. This site is Next.js, hand-drawn SVG and a few oscillators.\nType hire() to claim a secret.',
      'font: 700 20px sans-serif; color: #c9a227',
      'font: 13px sans-serif'
    )
    window.hire = () => {
      findSecret('console', 'You found the console.')
      return 'hello@itembox.site'
    }
  }, [findSecret])

  // Messages belong to the game that raised them
  useEffect(() => {
    clearTimeout(toastTimer.current)
    setToast(null)
  }, [game])

  const items = useMemo(() => (found.includes('konami') ? [...baseItems, secretItem] : baseItems), [found])

  const value = useMemo(
    () => ({ game, sound, toggleSound, found, findSecret, notify, toast, items, play: (e) => sfx(game || 'shelf', e) }),
    [game, sound, toggleSound, found, findSecret, notify, toast, items]
  )

  return <ArcadeContext.Provider value={value}>{children}</ArcadeContext.Provider>
}

export function useArcade() {
  return useContext(ArcadeContext)
}

// Inventory order and selection for one game, remembered between visits
export function useInventory(game, items, columns) {
  const key = `itembox.order.${game}`
  const [order, setOrder] = useState(() => items.map((i) => i.id))
  const [cursor, setCursor] = useState(0)

  useEffect(() => {
    const saved = readJSON(key, null)
    if (saved) {
      const ids = items.map((i) => i.id)
      const kept = saved.filter((id) => ids.includes(id))
      setOrder([...kept, ...ids.filter((id) => !kept.includes(id))])
    } else {
      setOrder(items.map((i) => i.id))
    }
  }, [key, items])

  const ordered = useMemo(() => order.map((id) => items.find((i) => i.id === id)).filter(Boolean), [order, items])

  const move = useCallback(
    (from, to) => {
      setOrder((prev) => {
        const next = [...prev]
        const [it] = next.splice(from, 1)
        next.splice(to, 0, it)
        writeJSON(key, next)
        return next
      })
    },
    [key]
  )

  const step = useCallback(
    (dx, dy, total) => {
      setCursor((c) => {
        const n = total ?? ordered.length
        let next = c + dx + dy * columns
        if (next < 0) next = (next + n) % n
        if (next >= n) next = next % n
        return next
      })
    },
    [columns, ordered.length]
  )

  return { ordered, cursor, setCursor, move, step }
}

export { readJSON, writeJSON }
