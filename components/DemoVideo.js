import { useEffect, useRef, useState } from 'react'

// Silent looping screen recording that behaves like a GIF: plays while on
// screen, pauses when scrolled away, and stays still for reduced-motion users.
export default function DemoVideo({ src, poster, label, width, height, className = '', framed = true }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const stopped = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stopped.current = true
      return
    }

    let timer = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(timer)
        if (entry.isIntersecting && !stopped.current) {
          // Wait until the clip has settled in view, so scrolling past a dozen
          // clips never spins up a dozen video decoders at once
          timer = setTimeout(() => video.play().catch(() => {}), 250)
        } else {
          video.pause()
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(video)
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  const toggle = () => {
    const video = videoRef.current
    if (video.paused) {
      stopped.current = false
      video.play().catch(() => {})
    } else {
      stopped.current = true
      video.pause()
    }
  }

  return (
    <div className={`relative overflow-hidden ${framed ? 'rounded border border-ink bg-sheet' : 'ib-video'} ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        width={width}
        height={height}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="block h-auto w-full"
      />
      <button
        type="button"
        onClick={toggle}
        className={framed ? 'absolute bottom-2 right-2 rounded bg-ink/85 px-2.5 py-1 font-label text-sm font-medium text-paper hover:bg-ink' : 'ib-play'}
      >
        {playing ? 'Pause' : 'Play'}
      </button>
    </div>
  )
}
