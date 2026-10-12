import { useEffect } from 'react'
import { Barlow, Barlow_Condensed, Barlow_Semi_Condensed } from 'next/font/google'
import Head from 'next/head'
import Link from 'next/link'
import DemoVideo from '../components/DemoVideo'
import SofaAssembly from '../components/SofaAssembly'
import { EMAIL, GITHUB, LINKEDIN, SITE_URL, items, profile } from '../lib/data'

// The résumé keeps its own typeface, so the game pages never download it
const barlow = Barlow({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-barlow' })
const barlowSemi = Barlow_Semi_Condensed({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-barlow-semi' })
const barlowCond = Barlow_Condensed({ subsets: ['latin'], weight: ['500'], variable: '--font-barlow-cond' })

const TITLE = 'Leigh Atkins, full-stack developer: résumé'
const DESCRIPTION =
  'Leigh Atkins builds tools around real-world things: SofaPaint and SofaPaint Desktop for made-to-measure sofa covers, ReelWalk for property Reels, Handoff Tracker for parcels between carriers, TSLock for learning TypeScript, and ThreeWood, a seeded 3D golf game.'

// The same records every game reads
const projects = items.filter((i) => i.project).map((i) => ({ id: i.id, name: i.name, ...i.project }))
const otherWork = items
  .filter((i) => i.kind === 'side')
  .map((i) => ({ name: i.name, description: i.blurb, stack: i.stackLine, href: i.href || null }))

function ProjectMedia({ media }) {
  if (media.kind === 'portrait') {
    return (
      <figure>
        <div className="grid grid-cols-2 gap-3">
          <DemoVideo src={media.src} poster={media.poster} label={media.label} width={540} height={960} />
          {media.src2 ? (
            <DemoVideo src={media.src2} poster={media.poster2} label={media.label2} width={540} height={960} />
          ) : (
            <div className="overflow-hidden rounded border border-ink bg-sheet">
              <img src={media.still} alt={media.stillAlt} width={540} height={920} loading="lazy" className="block h-full w-full object-cover object-top" />
            </div>
          )}
        </div>
        <figcaption className="mt-2 text-sm text-muted">{media.caption}</figcaption>
      </figure>
    )
  }

  return (
    <figure>
      <DemoVideo src={media.src} poster={media.poster} label={media.label} width={960} height={600} />
      {media.src2 && (
        <div className="mt-3 w-3/4">
          <DemoVideo src={media.src2} poster={media.poster2} label={media.label2} width={960} height={600} />
        </div>
      )}
      <figcaption className="mt-2 text-sm text-muted">{media.caption}</figcaption>
    </figure>
  )
}

export default function Resume() {
  // Contact's lines come in from the side as the band scrolls into view
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.setAttribute('data-shown', '')),
      { rootMargin: '0px 0px -12% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className={`${barlow.variable} ${barlowSemi.variable} ${barlowCond.variable} font-sans`}>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="author" content="Leigh Atkins" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#F3F6F8" />
        <link rel="canonical" href={`${SITE_URL}/resume`} />
        <link rel="manifest" href="/site.webmanifest" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/resume`} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={`${SITE_URL}/media/sofapaint-generation.jpg`} />
        <meta property="og:site_name" content="Leigh Atkins" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE_URL}/media/sofapaint-generation.jpg`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Leigh Atkins',
              jobTitle: 'Full-stack developer',
              description: DESCRIPTION,
              url: SITE_URL,
              image: `${SITE_URL}/leigh-atkins-photo.jpg`,
              email: `mailto:${EMAIL}`,
              sameAs: [GITHUB, LINKEDIN],
            }),
          }}
        />
      </Head>

      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to work
      </a>

      <header data-site-header className="sticky top-0 z-40 border-b border-rule bg-paper">
        <nav aria-label="Main" className="flex items-center justify-between gap-3 whitespace-nowrap py-3 pl-[clamp(1.25rem,5vw,6rem)] pr-5 sm:py-4 sm:pr-8">
          <a href="#top" className="font-display text-lg font-semibold sm:text-xl">
            Leigh Atkins
          </a>
          <ul className="flex gap-3.5 font-display text-[0.95rem] font-medium min-[400px]:gap-5 sm:gap-8 sm:text-base">
            <li>
              <a href="#work" className="hover:text-dim">
                Work
              </a>
            </li>
            <li>
              <a href="#about" className="hover:text-dim">
                About
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-dim">
                Contact
              </a>
            </li>
            <li>
              <Link href="/" className="text-dim hover:text-ink">
                Item box
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main id="top">
        <SofaAssembly>
          <section data-step="0" data-label="Introduction" className="pb-16 pt-12 sm:pt-16 lg:min-h-[calc(100vh-57px)] lg:pb-24 lg:pt-20">
            <h1 className="font-display text-[clamp(2.4rem,3.9vw,3.6rem)] font-semibold leading-[0.98] tracking-[-0.01em]">
              Software for sofas, parcels, floor plans and fairways.
            </h1>
            <p className="mt-7 max-w-[34rem] text-xl leading-relaxed text-muted">
              I’m {profile.name}, a full-stack developer. {profile.pitch}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#work" className="btn-solid">
                See the work
              </a>
              <a href={`mailto:${EMAIL}`} className="btn-outline">
                Email me
              </a>
            </div>
            <p className="mt-10 max-w-[30rem] text-base text-muted">
              The drawing is SofaPaint’s own sofa model. It goes together as you scroll, one part per section; pick a numbered step to jump to it.
            </p>
          </section>

          <div id="work" className="border-t border-ink">
            <h2 className="pt-10 font-display text-2xl font-semibold text-muted">Recent work</h2>
            {projects.map((project, i) => (
              <article key={project.id} id={project.id} data-step={i + 1} data-label={project.name} className="border-b border-rule py-12 last:border-b-0 sm:py-14">
                <h3 className="flex items-center gap-3 font-display text-4xl font-semibold leading-none">
                  <span className="balloon" aria-hidden="true">{i + 2}</span>
                  {project.name}
                </h3>
                <p className="mt-2 font-label text-base font-medium text-muted">{project.status}</p>
                <p className="mt-2 font-display text-xl font-medium text-dim">{project.tagline}</p>
                <div className="mt-6">
                  <ProjectMedia media={project.media} />
                </div>
                <p className="mt-6">{project.summary}</p>
                <p className="mt-4 text-muted">{project.details}</p>

                <dl className="mt-6 border-t border-ink text-base">
                  {project.stack.map(([layer, tools]) => (
                    <div key={layer} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-rule py-2">
                      <dt className="font-label font-medium text-muted">{layer}</dt>
                      <dd>{tools}</dd>
                    </div>
                  ))}
                </dl>

                <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-display font-semibold">
                  {project.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="link">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
                {project.note && <p className="mt-3 text-sm text-muted">{project.note}</p>}
              </article>
            ))}
          </div>

          <section data-step={projects.length + 1} data-label="Earlier projects" aria-labelledby="other-heading" className="border-t border-ink py-12 sm:py-14 lg:min-h-[70vh]">
            <h2 id="other-heading" className="flex items-center gap-3 font-display text-2xl font-semibold text-muted">
              <span className="balloon" aria-hidden="true">{projects.length + 2}</span>
              Earlier projects
            </h2>
            <ul className="mt-5 border-t border-rule">
              {otherWork.map((item) => (
                <li key={item.name} className="border-b border-rule py-4">
                  <p className="font-display text-lg font-semibold">
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className="link">
                        {item.name}
                      </a>
                    ) : (
                      item.name
                    )}
                  </p>
                  <p className="mt-1">{item.description}</p>
                  <p className="mt-1 font-label text-muted">{item.stack}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="about" data-step={projects.length + 2} data-label="About" aria-labelledby="about-heading" className="border-t border-ink py-12 sm:py-14 lg:min-h-[100vh]">
            <h2 id="about-heading" className="flex items-center gap-3 font-display text-2xl font-semibold text-muted">
              <span className="balloon" aria-hidden="true">{projects.length + 3}</span>
              About
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-[9rem_1fr]">
              <img
                src="/me/portrait.webp"
                alt="Leigh Atkins"
                width={600}
                height={768}
                loading="lazy"
                decoding="async"
                className="w-36 rounded border border-ink"
              />
              <div>
                <p className="text-xl leading-relaxed">{profile.about[0]}</p>
                <p className="mt-5 text-muted">{profile.about[1]}</p>
              </div>
            </div>
          </section>
        </SofaAssembly>

        <section id="contact" aria-labelledby="contact-heading" className="bg-ink text-paper">
          {/* The paper darkens into the band rather than cutting to it */}
          <div aria-hidden="true" className="h-40 bg-gradient-to-b from-paper to-ink sm:h-56" />
          <div className="pb-14 pl-[clamp(1.25rem,5vw,6rem)] pr-5 sm:pb-20 sm:pr-8">
            <h2 id="contact-heading" data-reveal className="font-display text-2xl font-semibold text-rule">
              Contact
            </h2>
            <p className="mt-5" data-reveal style={{ transitionDelay: '120ms' }}>
              <a
                href={`mailto:${EMAIL}`}
                className="break-all font-display text-[clamp(1.75rem,6vw,3.75rem)] font-semibold leading-tight underline decoration-dim decoration-4 underline-offset-8 hover:decoration-paper"
              >
                {EMAIL}
              </a>
            </p>
            <ul data-reveal style={{ transitionDelay: '240ms' }} className="mt-8 flex flex-wrap gap-x-8 gap-y-2 font-display text-lg font-medium">
              <li>
                <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="underline decoration-rule/50 underline-offset-4 hover:decoration-paper">
                  GitHub
                </a>
              </li>
              <li>
                <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="underline decoration-rule/50 underline-offset-4 hover:decoration-paper">
                  LinkedIn
                </a>
              </li>
            </ul>
            <p data-reveal style={{ transitionDelay: '340ms' }} className="mt-14 text-sm text-rule">© {new Date().getFullYear()} Leigh Atkins</p>
          </div>
        </section>
      </main>
    </div>
  )
}
