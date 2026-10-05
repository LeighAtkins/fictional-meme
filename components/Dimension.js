// A dimension line in the style of SofaPaint's measurement labels:
// extension ticks, arrowheads, and a pill reading "A1 = 742 px".

function Arrow({ className }) {
  return (
    <svg viewBox="0 0 10 10" className={`h-2.5 w-2.5 flex-none fill-current ${className}`}>
      <path d="M0 5 L10 0 L10 10 Z" />
    </svg>
  )
}

function Pill({ label, value }) {
  return (
    <span className="flex-none whitespace-nowrap rounded-full border border-dim bg-paper px-2.5 py-0.5 font-label text-sm font-medium tabular-nums text-ink">
      {value ? `${label} = ${value}` : label}
    </span>
  )
}

export function DimensionH({ label, value, className = '' }) {
  return (
    <div aria-hidden="true" className={`dim-draw-x flex items-center text-dim ${className}`}>
      <span className="h-4 w-px flex-none bg-current" />
      <Arrow />
      <span className="h-px flex-1 bg-current" />
      <Pill label={label} value={value} />
      <span className="h-px flex-1 bg-current" />
      <Arrow className="rotate-180" />
      <span className="h-4 w-px flex-none bg-current" />
    </div>
  )
}

export function DimensionV({ label, value, className = '' }) {
  return (
    <div aria-hidden="true" className={`dim-draw-y flex w-28 flex-col items-center text-dim ${className}`}>
      <span className="h-px w-4 flex-none bg-current" />
      <Arrow className="rotate-90" />
      <span className="w-px flex-1 bg-current" />
      <Pill label={label} value={value} />
      <span className="w-px flex-1 bg-current" />
      <Arrow className="-rotate-90" />
      <span className="h-px w-4 flex-none bg-current" />
    </div>
  )
}
