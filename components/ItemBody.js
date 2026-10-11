import Link from 'next/link'
import { useState } from 'react'
import DemoVideo from './DemoVideo'

// The content behind "use item". Every game frames it differently but the
// words are the same, styled through the `ib-*` hooks by each game's CSS.

function Media({ media }) {
  if (media.kind === 'portrait') {
    return (
      <figure className="ib-media">
        <div className="ib-pair">
          <DemoVideo src={media.src} poster={media.poster} label={media.label} width={540} height={960} framed={false} />
          {media.src2 ? (
            <DemoVideo src={media.src2} poster={media.poster2} label={media.label2} width={540} height={960} framed={false} />
          ) : (
            <img src={media.still} alt={media.stillAlt} width={540} height={920} loading="lazy" className="ib-still" />
          )}
        </div>
        <figcaption className="ib-caption">{media.caption}</figcaption>
      </figure>
    )
  }
  return (
    <figure className="ib-media">
      <DemoVideo src={media.src} poster={media.poster} label={media.label} width={960} height={600} framed={false} />
      {media.src2 && (
        <div className="ib-second">
          <DemoVideo src={media.src2} poster={media.poster2} label={media.label2} width={960} height={600} framed={false} />
        </div>
      )}
      <figcaption className="ib-caption">{media.caption}</figcaption>
    </figure>
  )
}

// Extra clips stay as posters until asked for, so a dozen videos never load at once
function GalleryClip({ clip }) {
  const [playing, setPlaying] = useState(false)
  return (
    <li className="ib-clip">
      {playing ? (
        <video src={clip.src} poster={clip.poster} autoPlay muted loop playsInline controls aria-label={clip.title} />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`Play: ${clip.title}`}>
          <img src={clip.poster} alt="" loading="lazy" width={960} height={600} />
          <span className="ib-clip-play" aria-hidden="true" />
        </button>
      )}
      <span className="ib-clip-title">{clip.title}</span>
    </li>
  )
}

export function ItemLink({ item, className = 'ib-action' }) {
  if (!item.href) return null
  if (item.internal) {
    return (
      <Link href={item.href} className={className}>
        {item.hrefLabel}
      </Link>
    )
  }
  const external = item.href.startsWith('http')
  return (
    <a href={item.href} className={className} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {item.hrefLabel}
    </a>
  )
}

export default function ItemBody({ item, showMedia = true }) {
  const p = item.project
  if (!p) {
    return (
      <div className="ib">
        <p className="ib-summary">{item.blurb}</p>
        {item.stackLine && <p className="ib-stackline">Built with {item.stackLine}</p>}
        {item.href ? (
          <p className="ib-links">
            <ItemLink item={item} />
          </p>
        ) : (
          item.kind === 'side' && <p className="ib-note">Private repository. Happy to walk through it in an interview.</p>
        )}
      </div>
    )
  }
  return (
    <div className="ib">
      <p className="ib-tagline">{p.tagline}</p>
      {showMedia && <Media media={p.media} />}
      <p className="ib-summary">{p.summary}</p>
      <p className="ib-details">{p.details}</p>
      {p.gallery && (
        <ul className="ib-gallery" aria-label="More clips">
          {p.gallery.map((clip) => (
            <GalleryClip key={clip.src} clip={clip} />
          ))}
        </ul>
      )}
      <dl className="ib-stack">
        {p.stack.map(([layer, tools]) => (
          <div key={layer}>
            <dt>{layer}</dt>
            <dd>{tools}</dd>
          </div>
        ))}
      </dl>
      <p className="ib-links">
        {p.links.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="ib-action">
            {l.label}
          </a>
        ))}
      </p>
      {p.note && <p className="ib-note">{p.note}</p>}
    </div>
  )
}
