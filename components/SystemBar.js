import Link from 'next/link'
import { SECRETS, useArcade } from '../lib/arcade'
import { EMAIL } from '../lib/data'

// The console's own overlay: always the same, whatever game is running, so the
// way out, the résumé and the email address are never more than one click away.
export function SoundToggle({ className = '' }) {
  const { sound, toggleSound } = useArcade()
  return (
    <button type="button" onClick={toggleSound} aria-pressed={sound} className={className}>
      <svg viewBox="0 0 20 20" className="h-4 w-4 flex-none" aria-hidden="true">
        <path d="M3 8h3l4-4v12l-4-4H3z" fill="currentColor" />
        {sound ? (
          <path d="M13 7c1.3 1.6 1.3 4.4 0 6M15.5 4.5c2.6 3 2.6 8 0 11" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M13 7l5 6M18 7l-5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        )}
      </svg>
      <span>{sound ? 'Sound on' : 'Sound off'}</span>
    </button>
  )
}

export default function SystemBar({ game, onEject }) {
  const { found } = useArcade()
  const total = Object.keys(SECRETS).length
  const btn =
    'inline-flex items-center gap-1.5 rounded px-2 py-1 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white'
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 flex h-10 items-center justify-between gap-3 border-b bg-black px-2 text-[13px] text-white/90 sm:px-4"
      style={{ borderColor: game?.color, fontFamily: 'var(--f-archivo)' }}
    >
      <p className="min-w-0 truncate">
        <span className="font-semibold text-white">Leigh Atkins</span>
        <span className="hidden text-white/60 md:inline">, full-stack developer. Now playing {game?.title}, a homage to {game?.homage}.</span>
      </p>
      <nav aria-label="Console" className="flex flex-none items-center gap-0.5 sm:gap-1">
        <button type="button" onClick={onEject} className={btn}>
          <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
            <path d="M10 4l6 7H4zM4 13h12v3H4z" fill="currentColor" />
          </svg>
          <span>Change game</span>
        </button>
        <SoundToggle className={`${btn} hidden sm:inline-flex`} />
        <Link href="/resume" className={btn}>
          Résumé
        </Link>
        <a href={`mailto:${EMAIL}`} className={`${btn} hidden sm:inline-flex`}>
          Email
        </a>
        <span className="ml-1 hidden tabular-nums text-white/60 lg:inline" title="Secrets found across all games">
          Secrets {found.length}/{total}
        </span>
      </nav>
    </header>
  )
}

export function Toast() {
  const { toast } = useArcade()
  if (!toast) return null
  return (
    <div
      key={toast.key}
      role="status"
      className="toast-in fixed bottom-5 left-1/2 z-[60] w-[min(92vw,34rem)] -translate-x-1/2 rounded-md border px-4 py-3 text-center text-sm shadow-2xl"
      style={{
        fontFamily: 'var(--f-archivo)',
        background: toast.tone === 'secret' ? '#1d1608' : '#0d0d12',
        borderColor: toast.tone === 'secret' ? '#e8c14a' : 'rgba(255,255,255,.25)',
        color: toast.tone === 'secret' ? '#f8e7a8' : '#fff',
      }}
    >
      {toast.message}
    </div>
  )
}
