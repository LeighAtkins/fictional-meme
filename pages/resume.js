import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import DemoVideo from '../components/DemoVideo'
import { DimensionH, DimensionV } from '../components/Dimension'
import { EMAIL, SITE_URL, items } from '../lib/data'

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
        <div className="grid max-w-xl grid-cols-2 gap-4 sm:gap-6">
          <DemoVideo src={media.src} poster={media.poster} label={media.label} width={540} height={960} />
          {media.src2 ? (
            <DemoVideo src={media.src2} poster={media.poster2} label={media.label2} width={540} height={960} />
          ) : (
            <div className="overflow-hidden rounded border border-ink bg-sheet">
              <Image src={media.still} alt={media.stillAlt} width={540} height={920} className="block h-full w-full object-cover object-top" />
            </div>
          )}
        </div>
        <figcaption className="mt-3 text-sm text-muted">{media.caption}</figcaption>
      </figure>
    )
  }

  return (
    <figure>
      <DemoVideo src={media.src} poster={media.poster} label={media.label} width={960} height={600} />
      {media.src2 && (
        <div className="mt-4 w-3/4">
          <DemoVideo src={media.src2} poster={media.poster2} label={media.label2} width={960} height={600} />
        </div>
      )}
      <figcaption className="mt-3 text-sm text-muted">{media.caption}</figcaption>
    </figure>
  )
}

export default function Home() {
  // The hero headline is measured live, the way SofaPaint measures a sofa
  const headlineRef = useRef(null)
  const [size, setSize] = useState(null)

  useEffect(() => {
    const el = headlineRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      setSize({ width: Math.round(el.offsetWidth), height: Math.round(el.offsetHeight) })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="author" content="Leigh Atkins" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#F3F6F8" />
        <link rel="canonical" href={`${SITE_URL}/resume`} />
        <link rel="manifest" href="/site.webmanifest" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
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
              sameAs: [
                'https://github.com/LeighAtkins',
                'https://www.linkedin.com/in/leigh-atkins-0069a731a/',
              ],
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

      <header className="sticky top-0 z-40 border-b border-rule bg-paper/90 backdrop-blur">
        <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="font-display text-xl font-semibold">
            Leigh Atkins
          </a>
          <ul className="flex gap-5 font-display text-base font-medium sm:gap-8">
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
        <section className="relative">
          <div className="drafting-grid pointer-events-none absolute inset-0" />
          <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-20">
            <div className="w-fit">
              <DimensionH label="A1" value={size && `${size.width} px`} className="mb-4" />
              <div className="relative">
                <h1
                  ref={headlineRef}
                  className="font-display text-[clamp(2.25rem,9.5vw,5.75rem)] font-semibold leading-[0.98] tracking-[-0.01em]"
                >
                  <span className="block whitespace-nowrap">Software for sofas,</span>
                  <span className="block whitespace-nowrap">floor plans</span>
                  <span className="block whitespace-nowrap">and fairways.</span>
                </h1>
                <DimensionV
                  label="B1"
                  value={size && `${size.height} px`}
                  className="absolute inset-y-0 left-full hidden lg:flex"
                />
              </div>
            </div>

            <p className="mt-8 max-w-[38rem] text-xl leading-relaxed text-muted">
              I’m Leigh Atkins, a full-stack developer. I build browser tools around real-world things:
              measuring furniture on a drawing, turning a home tour into a reel, growing a golf course from a
              seed.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#work" className="btn-solid">
                See the work
              </a>
              <a href={`mailto:${EMAIL}`} className="btn-outline">
                Email me
              </a>
            </div>
          </div>
        </section>

        <section id="work" aria-labelledby="work-heading" className="border-t border-ink">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 id="work-heading" className="pt-12 font-display text-2xl font-semibold text-muted sm:pt-16">
              Recent work
            </h2>

            {projects.map((project) => (
              <article
                key={project.id}
                id={project.id}
                className="grid gap-8 border-b border-rule py-12 last:border-b-0 sm:py-16 lg:grid-cols-12 lg:gap-12"
              >
                <div className="lg:col-span-7">
                  <ProjectMedia media={project.media} />
                </div>

                <div className="lg:col-span-5">
                  <h3 className="font-display text-4xl font-semibold leading-none sm:text-5xl">{project.name}</h3>
                  {project.status && <p className="mt-2 font-label text-base font-medium text-muted">{project.status}</p>}
                  <p className="mt-3 font-display text-xl font-medium text-dim">{project.tagline}</p>
                  <p className="mt-5">{project.summary}</p>
                  <p className="mt-4 text-muted">{project.details}</p>

                  <dl className="mt-7 border-t border-ink text-base">
                    {project.stack.map(([layer, tools]) => (
                      <div key={layer} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-rule py-2">
                        <dt className="font-label font-medium text-muted">{layer}</dt>
                        <dd>{tools}</dd>
                      </div>
                    ))}
                  </dl>

                  <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-display font-semibold">
                    {project.links.map((link) => (
                      <li key={link.href}>
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className="link">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                  {project.note && <p className="mt-3 text-sm text-muted">{project.note}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="other-heading" className="border-t border-ink">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
            <h2 id="other-heading" className="font-display text-2xl font-semibold text-muted">
              Earlier projects
            </h2>
            <ul className="mt-6 border-t border-rule">
              {otherWork.map((item) => (
                <li
                  key={item.name}
                  className="grid gap-x-8 gap-y-1 border-b border-rule py-4 md:grid-cols-[14rem_1fr_16rem]"
                >
                  <span className="font-display text-lg font-semibold">
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className="link">
                        {item.name}
                      </a>
                    ) : (
                      item.name
                    )}
                  </span>
                  <span>{item.description}</span>
                  <span className="font-label text-muted md:text-right">{item.stack}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="about" aria-labelledby="about-heading" className="border-t border-ink">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 sm:py-16 md:grid-cols-12">
            <div className="md:col-span-4 lg:col-span-3">
              <Image
                src="/leigh-atkins-photo.jpg"
                alt="Leigh Atkins"
                width={600}
                height={768}
                sizes="(min-width: 768px) 280px, 60vw"
                className="w-3/5 rounded border border-ink md:w-full"
              />
            </div>
            <div className="max-w-[40rem] md:col-span-8 lg:col-span-9">
              <h2 id="about-heading" className="font-display text-2xl font-semibold text-muted">
                About
              </h2>
              <p className="mt-6 text-xl leading-relaxed">
                Most of what I build starts with a physical thing and a person who has to describe it to someone
                else: a sofa that needs a cover made to fit, a house that has to be shown to buyers, a fairway
                that should be worth playing twice.
              </p>
              <p className="mt-5 text-muted">
                I work mostly in TypeScript, across the browser (Canvas, Three.js, React and Next.js) and the
                services behind it (Node, PostgreSQL, queues and workers, Docker and Kubernetes). I like
                projects where the interface has to be exact, because someone will cut fabric or book a viewing
                based on what it shows.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" aria-labelledby="contact-heading" className="border-t border-ink bg-ink text-paper">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
            <h2 id="contact-heading" className="font-display text-2xl font-semibold text-rule">
              Contact
            </h2>
            <p className="mt-5">
              <a
                href={`mailto:${EMAIL}`}
                className="break-all font-display text-[clamp(1.75rem,6vw,3.75rem)] font-semibold leading-tight underline decoration-dim decoration-4 underline-offset-8 hover:decoration-paper"
              >
                {EMAIL}
              </a>
            </p>
            <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-2 font-display text-lg font-medium">
              <li>
                <a
                  href="https://github.com/LeighAtkins"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-rule/50 underline-offset-4 hover:decoration-paper"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/leigh-atkins-0069a731a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-rule/50 underline-offset-4 hover:decoration-paper"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
            <p className="mt-14 text-sm text-rule">© {new Date().getFullYear()} Leigh Atkins</p>
          </div>
        </section>
      </main>
    </>
  )
}
