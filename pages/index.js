import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import DemoVideo from '../components/DemoVideo'
import { DimensionH, DimensionV } from '../components/Dimension'

const SITE_URL = 'https://itembox.site'
const EMAIL = 'hello@itembox.site'
const TITLE = 'Leigh Atkins, full-stack developer'
const DESCRIPTION =
  'Leigh Atkins builds browser tools around real-world things: SofaPaint for measured furniture drawings, ReelWalk for floor-plan-aware property reels, and ThreeWood, a seeded 3D golf game.'

const projects = [
  {
    id: 'sofapaint',
    name: 'SofaPaint',
    tagline: 'Measured drawings for made-to-order furniture',
    summary:
      'A sofa cover only fits if the measurements are right, and customers are not draughtsmen. SofaPaint gives them a drawing to follow: pick the guide that matches the sofa, armchair or cushion, or upload a photo, then draw each labelled dimension line and type its value.',
    details:
      'The finished sheet exports as a PDF measurement report, or goes out as a share link the customer fills in themselves. For a head start, a customer can upload a photo instead: a segmentation model finds the arms, cushions and back, a Cloudflare Worker turns those parts into labelled measurement lines, and the result opens in the editor to adjust.',
    media: {
      kind: 'landscape',
      src: '/media/sofapaint-generation.mp4',
      poster: '/media/sofapaint-generation.jpg',
      label: 'Screen recording of SofaPaint: a sofa photo is uploaded, eleven measurement lines are placed on it automatically, and the drawing opens in the editor',
      caption: 'A photo in, eleven measurement lines out, then into the editor to adjust. Shortened; the real run takes about 30 seconds.',
    },
    stack: [
      ['Canvas', 'Fabric.js, TypeScript'],
      ['Build', 'Vite'],
      ['Server', 'Node and Express on Vercel functions'],
      ['Data', 'Supabase (PostgreSQL)'],
      ['AI', 'YOLO segmentation on Modal, Cloudflare Workers'],
      ['Tests', 'Vitest, Playwright visual regression'],
    ],
    links: [
      { label: 'Open SofaPaint', href: 'https://sofapaint.vercel.app/' },
      { label: 'Source on GitHub', href: 'https://github.com/LeighAtkins/OpenPaint' },
    ],
  },
  {
    id: 'reelwalk',
    name: 'ReelWalk',
    tagline: 'Property reels that know the floor plan',
    summary:
      'A phone-first editor that turns listing photos, 360 photos and walkthrough video into a 1080×1920 Instagram Reel. A marker on the floor plan follows the camera from room to room, so a viewer always knows where they are in the house.',
    details:
      'One tap builds a full tour from a set of 360 photos, walking through the doorways in a single move. The same tour can be recut for five kinds of buyer, each with its own music, pace and captions. The preview and the export share one Remotion composition, so what you see in the editor is what the render worker produces.',
    media: {
      kind: 'portrait',
      src: '/media/reelwalk.mp4',
      poster: '/media/reelwalk.jpg',
      label: 'An exported ReelWalk reel: a camera sweep through a home with a floor plan marker and room names',
      caption: 'An exported reel, and the timeline editor that made it.',
      still: '/media/reelwalk-editor.jpg',
      stillAlt: 'ReelWalk timeline editor on a phone, showing the reel preview, clip timeline and room name captions',
    },
    stack: [
      ['Web', 'Next.js 16, React 19, Server Actions'],
      ['Video', 'Remotion, headless Chrome, WebCodecs'],
      ['Data', 'PostgreSQL, Prisma 7'],
      ['Jobs', 'SQS with a dead-letter queue, S3'],
      ['Runtime', 'Docker, Kubernetes, Helm'],
      ['Tests', 'Vitest, Playwright'],
    ],
    links: [{ label: 'Source on GitHub', href: 'https://github.com/LeighAtkins/ReelWalk' }],
    note: 'No hosted demo yet. The whole stack runs locally with one Docker Compose command.',
  },
  {
    id: 'threewood',
    name: 'ThreeWood',
    tagline: 'A new 18-hole golf course from every seed',
    summary:
      'A 3D golf game for the browser, built for a phone held in one hand. Every round is a par-72 course grown from a shareable seed, so the same seed gives a friend the same course. A three-tap swing decides power and strike, and the greens break.',
    details:
      'The routing of each course is planned by hand and the holes are generated, then checked for fairness. One deterministic physics model runs the live shot, the aim preview, the putt line and the headless test bot. Progress saves after every shot, the game works offline, and there is a daily course everyone shares.',
    media: {
      kind: 'landscape',
      src: '/media/threewood.mp4',
      poster: '/media/threewood.jpg',
      label: 'Gameplay recording of ThreeWood: a course flyover, a drive and an approach shot onto the green',
      caption: 'Hole 1 of a nine-hole round: flyover, drive, approach.',
    },
    stack: [
      ['Rendering', 'Three.js, custom GLSL'],
      ['Courses', 'Seeded PRNG, simplex-noise terrain'],
      ['Physics', 'Own deterministic ball simulation'],
      ['Audio', 'Web Audio'],
      ['Build', 'Vite, deployed on Vercel'],
    ],
    links: [
      { label: 'Play ThreeWood', href: 'https://threewood.vercel.app' },
      { label: 'Source on GitHub', href: 'https://github.com/LeighAtkins/threeWood' },
    ],
  },
]

const otherWork = [
  {
    name: 'Sofa Style Visualizer',
    description: 'Upload a room photo and a fabric swatch; Gemini reupholsters the sofa and keeps the room’s lighting.',
    stack: 'Next.js, Gemini, Cloudinary',
    href: 'https://github.com/LeighAtkins/style-check',
  },
  {
    name: 'SupportCopilot',
    description: 'Drafts support replies grounded in a help-centre index, then adds the right product links.',
    stack: 'Python, LanceDB, Flask, Electron',
    href: null,
  },
  {
    name: 'GalacticHoroscope',
    description: 'One TypeScript core shipped three ways: a CLI, a documented REST API and a 3D web page.',
    stack: 'TypeScript, Express, Three.js, Jest',
    href: 'https://github.com/LeighAtkins/GalacticHoroscope',
  },
]

function ProjectMedia({ media }) {
  if (media.kind === 'portrait') {
    return (
      <figure>
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <DemoVideo src={media.src} poster={media.poster} label={media.label} width={540} height={960} />
          <div className="overflow-hidden rounded border border-ink bg-sheet">
            <Image
              src={media.still}
              alt={media.stillAlt}
              width={540}
              height={920}
              className="block h-full w-full object-cover object-top"
            />
          </div>
        </div>
        <figcaption className="mt-3 text-sm text-muted">{media.caption}</figcaption>
      </figure>
    )
  }

  return (
    <figure>
      <DemoVideo src={media.src} poster={media.poster} label={media.label} width={960} height={600} />
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
        <link rel="canonical" href={SITE_URL} />
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
