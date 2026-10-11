import { useEffect, useState } from 'react'

// The moment the camera passes through the glass: the title screen fills the
// view, bulges, flashes, and the game is underneath.
export default function CrtTransition({ src }) {
  const [done, setDone] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1000)
    return () => clearTimeout(t)
  }, [])
  if (done) return null
  return (
    <div className="crt-through" aria-hidden="true">
      <div className="crt-through-img" style={{ backgroundImage: `url(${src})` }} />
      <div className="crt-through-flash" />
      <div className="crt-through-lines" />
    </div>
  )
}
