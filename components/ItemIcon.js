// Item art, drawn for this site. Each icon's viewBox matches the item's
// footprint in the attaché case (32 units per cell), so long things stay long.

const INK = '#17150f'

const icons = {
  tape: {
    box: [64, 64],
    body: (
      <>
        <rect x="44" y="44" width="17" height="9" fill="#efe2a6" stroke={INK} strokeWidth="2" />
        {[47, 51, 55].map((x) => (
          <line key={x} x1={x} y1="44" x2={x} y2={x === 51 ? 50 : 48} stroke={INK} strokeWidth="1.5" />
        ))}
        <rect x="58" y="40" width="5" height="16" rx="1" fill="#c43d3a" stroke={INK} strokeWidth="2" />
        <rect x="5" y="9" width="46" height="46" rx="14" fill="#f2c230" stroke={INK} strokeWidth="2.5" />
        <path d="M11 20 Q12 13 20 12" stroke="#fff6c8" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="28" cy="32" r="13" fill="#d9a514" stroke={INK} strokeWidth="2" />
        <circle cx="28" cy="32" r="5" fill="#cfd4d8" stroke={INK} strokeWidth="2" />
        <line x1="25" y1="32" x2="31" y2="32" stroke={INK} strokeWidth="1.5" />
        <rect x="18" y="50" width="20" height="5" fill="#c43d3a" stroke={INK} strokeWidth="2" />
      </>
    ),
  },
  reel: {
    box: [64, 64],
    body: (
      <>
        <path
          d="M40 50 L62 58 L60 64 L36 56 Z"
          fill="#2a2a2a"
          stroke={INK}
          strokeWidth="2"
        />
        {[42, 48, 54].map((x) => (
          <rect key={x} x={x} y={53 + (x - 42) / 3} width="3" height="2.5" fill="#e8e2d0" transform={`rotate(20 ${x} 54)`} />
        ))}
        <circle cx="30" cy="30" r="27" fill="#56606c" stroke={INK} strokeWidth="2.5" />
        <circle cx="30" cy="30" r="23" fill="#7d8996" />
        {[0, 72, 144, 216, 288].map((a) => {
          const r = (a * Math.PI) / 180
          return <circle key={a} cx={30 + Math.cos(r) * 13} cy={30 + Math.sin(r) * 13} r="6.5" fill="#1d2228" stroke={INK} strokeWidth="1.5" />
        })}
        <circle cx="30" cy="30" r="4.5" fill="#c9ced3" stroke={INK} strokeWidth="2" />
        <path d="M12 18 Q16 9 26 6" stroke="#c4ccd4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  club: {
    box: [32, 128],
    body: (
      <>
        <rect x="11" y="3" width="10" height="34" rx="3" fill="#24262a" stroke={INK} strokeWidth="2" />
        {[10, 17, 24, 31].map((y) => (
          <line key={y} x1="12" y1={y} x2="20" y2={y + 3} stroke="#4b5058" strokeWidth="1.5" />
        ))}
        <line x1="16" y1="37" x2="17" y2="104" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <line x1="16" y1="37" x2="17" y2="104" stroke="#c9d1d9" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d="M18 101 C27 101 30 108 29 114 C28 121 20 124 9 122 C3 121 2 115 5 111 C8 106 12 102 18 101 Z"
          fill="#7a4322"
          stroke={INK}
          strokeWidth="2.5"
        />
        <path d="M8 113 C12 109 18 107 24 108" stroke="#b9773f" strokeWidth="2" fill="none" />
        <text x="15" y="120" fontSize="7" fontWeight="700" fill="#f2c230" fontFamily="sans-serif">3</text>
      </>
    ),
  },
  swatch: {
    box: [64, 32],
    body: (
      <>
        <path d="M14 6 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 V26 H14 Z" fill="#d8a43a" stroke={INK} strokeWidth="2" />
        <path d="M3 10 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 V30 H3 Z" fill="#2f7a74" stroke={INK} strokeWidth="2" />
        {[9, 17, 25, 33, 41].map((x) => (
          <line key={x} x1={x} y1="11" x2={x - 5} y2="30" stroke="#5fb3a9" strokeWidth="2" />
        ))}
        <rect x="30" y="16" width="18" height="10" rx="2" fill="#f4efe2" stroke={INK} strokeWidth="1.5" />
        <line x1="33" y1="20" x2="45" y2="20" stroke={INK} strokeWidth="1" />
        <line x1="33" y1="23" x2="41" y2="23" stroke={INK} strokeWidth="1" />
      </>
    ),
  },
  headset: {
    box: [64, 64],
    body: (
      <>
        <path d="M12 36 V30 C12 14 22 6 32 6 C42 6 52 14 52 30 V36" fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" />
        <path d="M12 36 V30 C12 14 22 6 32 6 C42 6 52 14 52 30 V36" fill="none" stroke="#3d4450" strokeWidth="4.5" strokeLinecap="round" />
        <rect x="4" y="30" width="15" height="22" rx="6" fill="#c43d3a" stroke={INK} strokeWidth="2.5" />
        <rect x="45" y="30" width="15" height="22" rx="6" fill="#c43d3a" stroke={INK} strokeWidth="2.5" />
        <path d="M14 50 C16 58 26 60 34 58" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <rect x="32" y="54" width="9" height="7" rx="3" fill="#24262a" stroke={INK} strokeWidth="1.5" />
        <path d="M7 35 V44" stroke="#f08f82" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  orrery: {
    box: [32, 32],
    body: (
      <>
        <circle cx="16" cy="16" r="8.5" fill="#6b5bd6" stroke={INK} strokeWidth="2" />
        <path d="M11 12 Q14 9 18 10" stroke="#b8adff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <ellipse cx="16" cy="17" rx="14" ry="4.5" fill="none" stroke={INK} strokeWidth="3.5" transform="rotate(-18 16 17)" />
        <ellipse cx="16" cy="17" rx="14" ry="4.5" fill="none" stroke="#f2c230" strokeWidth="1.8" transform="rotate(-18 16 17)" />
        <path d="M5 4 l1 2.2 l2.2 1 l-2.2 1 l-1 2.2 l-1 -2.2 l-2.2 -1 l2.2 -1 Z" fill="#f2c230" />
        <circle cx="27" cy="27" r="1.5" fill="#f2c230" />
      </>
    ),
  },
  scroll: {
    box: [32, 64],
    body: (
      <>
        <rect x="6" y="9" width="20" height="46" fill="#ecdcab" stroke={INK} strokeWidth="2" />
        {[17, 22, 27, 32, 37, 42].map((y, i) => (
          <line key={y} x1="10" y1={y} x2={i % 2 ? 19 : 22} y2={y} stroke="#8a7650" strokeWidth="1.5" />
        ))}
        <rect x="3" y="4" width="26" height="7" rx="3.5" fill="#7a4322" stroke={INK} strokeWidth="2" />
        <rect x="3" y="53" width="26" height="7" rx="3.5" fill="#7a4322" stroke={INK} strokeWidth="2" />
        <circle cx="16" cy="48" r="3.5" fill="#c43d3a" stroke={INK} strokeWidth="1.5" />
      </>
    ),
  },
  letter: {
    box: [64, 32],
    body: (
      <>
        <rect x="4" y="4" width="56" height="25" rx="2" fill="#efe7d4" stroke={INK} strokeWidth="2.5" />
        <path d="M4 5 L32 20 L60 5" fill="none" stroke={INK} strokeWidth="2" />
        <path d="M4 28 L24 15 M60 28 L40 15" stroke="#b9ac8e" strokeWidth="1.5" />
        <circle cx="32" cy="20" r="5.5" fill="#c43d3a" stroke={INK} strokeWidth="1.5" />
        <path d="M29.5 20 h5 M32 17.5 v5" stroke="#f3b2a8" strokeWidth="1.3" />
      </>
    ),
  },
  tome: {
    box: [32, 32],
    body: (
      <>
        <rect x="6" y="3" width="21" height="26" rx="2" fill="#efe7d4" stroke={INK} strokeWidth="2" />
        <rect x="4" y="3" width="21" height="26" rx="2" fill="#33285e" stroke={INK} strokeWidth="2" />
        <rect x="4" y="3" width="4" height="26" fill="#241b45" />
        <path d="M13 12 l-3 4 l3 4 M18 12 l3 4 l-3 4" stroke="#f2c230" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  card: {
    box: [32, 32],
    body: (
      <>
        <rect x="3" y="8" width="26" height="17" rx="2" fill="#f4f1e8" stroke={INK} strokeWidth="2" transform="rotate(-8 16 16)" />
        <g transform="rotate(-8 16 16)">
          <rect x="6" y="11" width="7" height="7" rx="1" fill="#2a64a8" />
          <line x1="15" y1="12.5" x2="26" y2="12.5" stroke={INK} strokeWidth="1.5" />
          <line x1="15" y1="16" x2="23" y2="16" stroke="#8b8b8b" strokeWidth="1.2" />
          <line x1="6" y1="21" x2="20" y2="21" stroke="#8b8b8b" strokeWidth="1.2" />
        </g>
      </>
    ),
  },
  katana: {
    box: [32, 160],
    body: (
      <>
        <path d="M14 112 C13 80 14 40 22 4 C19 40 19 80 19 112 Z" fill="#dfe5ea" stroke={INK} strokeWidth="2" />
        <path d="M16 110 C16 80 17 42 21 10" stroke="#9aa6b0" strokeWidth="1.2" fill="none" />
        <rect x="13" y="112" width="7" height="5" fill="#c9a227" stroke={INK} strokeWidth="1.5" />
        <ellipse cx="16.5" cy="119" rx="9" ry="3" fill="#2c2620" stroke={INK} strokeWidth="2" />
        <rect x="12.5" y="121" width="8" height="33" rx="3" fill="#1d1d22" stroke={INK} strokeWidth="2" />
        {[124, 130, 136, 142, 148].map((y) => (
          <path key={y} d={`M13 ${y} l3.5 3 l3.5 -3`} stroke="#e8e2d0" strokeWidth="1.3" fill="none" />
        ))}
        <rect x="12.5" y="153" width="8" height="4" rx="1" fill="#c9a227" stroke={INK} strokeWidth="1.5" />
      </>
    ),
  },
  duck: {
    box: [32, 32],
    body: (
      <>
        <path d="M5 19 C5 27 12 29 18 29 C25 29 29 25 28 19 C27 15 22 16 19 16 L18 14 Z" fill="#f6cf2e" stroke={INK} strokeWidth="2" />
        <circle cx="15" cy="11" r="7" fill="#f6cf2e" stroke={INK} strokeWidth="2" />
        <path d="M20 11 L27 12 L21 15 Z" fill="#ef8a2b" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="16" cy="9" r="1.5" fill={INK} />
        <path d="M9 21 C12 24 16 24 19 21" stroke="#d9a514" strokeWidth="2" fill="none" />
      </>
    ),
  },
}

export function iconBox(name) {
  return icons[name]?.box || [32, 32]
}

export default function ItemIcon({ name, className = '', style, rotate = false }) {
  const icon = icons[name]
  if (!icon) return null
  const [w, h] = icon.box
  // Rotated icons swap their footprint and turn the artwork a quarter
  const vw = rotate ? h : w
  const vh = rotate ? w : h
  return (
    <svg viewBox={`0 0 ${vw} ${vh}`} className={className} style={style} aria-hidden="true" focusable="false">
      <g transform={rotate ? `translate(${vw} 0) rotate(90)` : undefined}>{icon.body}</g>
    </svg>
  )
}
