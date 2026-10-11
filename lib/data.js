// Everything the site says about Leigh lives here. Every game screen reads the
// same records, so a project only has to be described once.

export const SITE_URL = 'https://itembox.site'
export const EMAIL = 'hello@itembox.site'
export const GITHUB = 'https://github.com/LeighAtkins'
export const LINKEDIN = 'https://www.linkedin.com/in/leigh-atkins-0069a731a/'

export const profile = {
  name: 'Leigh Atkins',
  role: 'Full-stack developer',
  pitch:
    'I build browser tools around real-world things: measuring furniture on a drawing, turning a home tour into a reel, growing a golf course from a seed.',
  about: [
    'Most of what I build starts with a physical thing and a person who has to describe it to someone else: a sofa that needs a cover made to fit, a house that has to be shown to buyers, a fairway that should be worth playing twice.',
    'I work mostly in TypeScript, across the browser (Canvas, Three.js, React and Next.js) and the services behind it (Node, PostgreSQL, queues and workers on AWS, Docker and Kubernetes), with Rust when a desktop app needs it. I like projects where the interface has to be exact, because someone will cut fabric, book a viewing or chase a parcel based on what it shows.',
  ],
}

// Skill areas, each with the tools that back it up in the projects below
export const skills = [
  { id: 'front', name: 'Front end', tools: ['TypeScript', 'React and Next.js', 'Canvas and Fabric.js', 'Three.js and GLSL', 'Tauri desktop UI'], rank: 4 },
  { id: 'back', name: 'Back end', tools: ['Node', 'PostgreSQL and Prisma', 'Supabase', 'Rust', 'Domain-driven TypeScript'], rank: 4 },
  { id: 'infra', name: 'Infrastructure', tools: ['Docker', 'Kubernetes, Helm and Argo CD', 'AWS: App Runner, Fargate, SQS, S3', 'Terraform', 'Vercel and Cloudflare Workers'], rank: 3 },
  { id: 'ai', name: 'Applied AI', tools: ['YOLO segmentation on Modal', 'OCR (Windows.Media.Ocr)', 'Gemini', 'LanceDB retrieval'], rank: 3 },
  { id: 'video', name: 'Video, 3D and real time', tools: ['Remotion and ffmpeg', 'Three.js toon shading', 'WebRTC with PeerJS', 'Web Audio and Tone.js'], rank: 3 },
  { id: 'tests', name: 'Testing', tools: ['Vitest and node:test', 'Playwright', 'Bots that play every hole', 'cargo test'], rank: 3 },
]

const sofapaint = {
  status: 'Shipped',
  hardest: 'Turning segmentation masks into measurement lines a customer will trust enough to cut fabric by.',
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
  features: [
    'Guides for sofas, armchairs and cushions',
    'Labelled dimension lines on a canvas',
    'PDF measurement reports',
    'Share links customers fill in',
    'Photo to measurement lines with YOLO',
    'Playwright visual regression suite',
  ],
}

const reelwalk = {
  status: 'Shipped',
  tagline: 'Phone-first Reels editor for property listings',
  summary:
    'Estate agents need short vertical videos of their listings but rarely have time to learn a desktop video editor. ReelWalk is a web app built for the phone: pick listing photos, video and 360 photos, trim and arrange them on a timeline, add text and music, and export a 1080×1920 MP4 ready for Instagram.',
  details:
    'The editor preview and the final export use the same Remotion composition, so what plays in the browser is what the server renders. An export goes through a transactional outbox into SQS, and the web app starts a Fargate worker on demand that renders it in headless Chrome and stores the MP4 in S3 behind CloudFront.',
  media: {
    kind: 'portrait',
    src: '/media/reelwalk-demo.mp4',
    poster: '/media/reelwalk-poster.jpg',
    label: 'Phone screen recording of the ReelWalk editor: a text overlay is moved and shortened on the timeline, then three room clips play back',
    src2: '/media/reelwalk-demo2.mp4',
    label2: 'The exported reel: a living room with the caption “Open house · Sunday 2pm”, a 360 photo turning across a bedroom, then a bedroom video',
    caption: 'Editing on a phone, then the reel exactly as the render worker exported it. Stock footage and a CC0 360 photo.',
  },
  stack: [
    ['Web', 'Next.js 16, React 19, TypeScript, Remotion Player'],
    ['Rendering', 'Remotion, headless Chrome, ffmpeg'],
    ['Data', 'PostgreSQL (Supabase), Prisma 7'],
    ['Cloud', 'AWS App Runner, ECS Fargate, SQS, S3, CloudFront, Terraform'],
    ['Delivery', 'GitHub Actions, Trivy, Helm, Argo CD'],
    ['Tests', 'Vitest, Playwright'],
  ],
  links: [
    { label: 'Open ReelWalk', href: 'https://reelwalking.com' },
    { label: 'Source on GitHub', href: 'https://github.com/LeighAtkins/ReelWalk' },
  ],
  note: 'The live app needs an account.',
  hardest:
    'Phone footage is HEVC, which headless Chrome cannot decode, and the frame cache was sized from the host’s memory instead of the container’s, so exports ran out of memory until the worker re-encoded those sources once and capped the caches.',
  features: [
    'Drag text and clip edges on the timeline',
    '360 photos play as a camera sweep',
    'Snaps cuts to the song’s detected beat',
    '1080×1920 MP4 from a render worker',
    'Autosave that guards against two tabs',
    'Checks Instagram length and caption limits',
  ],
}

const threewood = {
  status: 'Shipped',
  tagline: 'A relaxed 18-hole golf game for your phone’s browser',
  summary:
    'A golf game made to be played one-handed on a phone, in a cosy camping style. Every course is generated from a seed, so a link shares the exact same 18 holes, and the holes mix normal golf with crazy golf, sky rings and bouncy mushrooms. Between shots there is fishing, a dog to play fetch with and a campfire.',
  details:
    'Holes are laid out from archetypes, checked for fairness and re-rolled until they pass, all deterministically from the seed. Each hole is sampled once onto a grid that is both the rendered terrain and what the fixed-step ball physics reads, so the ball always sits on what you see. Multiplayer rooms use WebRTC data channels through PeerJS, with the host’s phone relaying shots.',
  media: {
    kind: 'portrait',
    src: '/media/threewood-demo.mp4',
    poster: '/media/threewood-poster.jpg',
    label: 'Phone recording of ThreeWood: a drive flies down a hill through three golden sky rings onto the fairway',
    src2: '/media/threewood-demo2.mp4',
    label2: 'A crazy-golf hole played with the putter round its bends to holing out',
    caption: 'The Ski Jump hole through all three sky rings, and a crazy-golf hole putted round its bends.',
  },
  stack: [
    ['Rendering', 'Three.js, procedural geometry, toon shading'],
    ['Game logic', 'JavaScript modules, fixed-step ball physics'],
    ['Multiplayer', 'PeerJS (WebRTC data channels), host-relayed rooms'],
    ['Audio', 'Web Audio effects, Tone.js music'],
    ['Build', 'Vite, Vercel, service worker for offline play'],
    ['Tests', 'node:test with a bot that plays all 18 holes'],
  ],
  links: [
    { label: 'Play ThreeWood', href: 'https://threewood.vercel.app' },
    { label: 'Source on GitHub', href: 'https://github.com/LeighAtkins/threeWood' },
  ],
  hardest:
    'Generating holes that are varied but always fair and identical on every phone: each hole is designed from an archetype, rejected if it fails fairness checks, and re-rolled from forked seeded random streams.',
  features: [
    'Three-tap swing; timing sets hook or slice',
    'Share a seed link, play the same holes',
    'Rooms for up to four phones, shots in sync',
    'Fishing to win back a ball from the water',
    'Build a cel-shaded camper with unlockables',
    'Sky follows the real time of day',
  ],
}

const sofapaintDesktop = {
  status: 'In progress',
  tagline: 'Checks customer sofa measurements before an order',
  summary:
    'Made-to-measure sofa covers depend on customers measuring correctly, and checking those numbers by hand is slow. SofaPaint Desktop reads measurements from photos and PDFs, rewrites centimetre values on photos as inches, and checks how the numbers relate, such as whether the seat cushions fit between the arms.',
  details:
    'A Tauri app with a Rust core that calls the platform’s text recognition and a plain TypeScript UI. Measurements are keyed by guide code (A1, B1, C1…) and checked by a small data-driven rules engine, and problems are shown on a to-scale plan, on the matching measuring guide, and on a Three.js model.',
  media: {
    kind: 'landscape',
    src: '/media/sofapaint-desktop-demo.mp4',
    poster: '/media/sofapaint-desktop-poster.jpg',
    label: 'Screen recording of SofaPaint Desktop: a measurement table fills in, a sofa plan shows red cushions running past the arm, then a 3D sofa with labelled dimension lines turns',
    src2: '/media/sofapaint-desktop-demo2.mp4',
    label2: 'A filled measuring-guide form imported into the app with each value placed on its dimension line',
    caption: 'A sample order PDF fails the fit check by 12 cm, shown on the plan and in 3D; then a filled guide form is read in. Sample data.',
  },
  stack: [
    ['App shell', 'Tauri 2, Rust'],
    ['UI', 'TypeScript (no framework), Vite'],
    ['Text recognition', 'Windows.Media.Ocr, Apple Vision via objc2'],
    ['Documents', 'pdf.js'],
    ['3D', 'Three.js'],
    ['Tests', 'Vitest, cargo test'],
  ],
  links: [{ label: 'SofaPaint (web)', href: 'https://sofapaint.vercel.app' }],
  note: 'Private repository, no download yet. Built and tested on Windows.',
  hardest:
    'Pairing each code label in 199 inconsistently exported guide drawings with its own dimension line, so every value lands in the right place.',
  features: [
    'Rewrites cm values on photos as inches',
    'Reads filled forms, text and scanned PDFs',
    'Sum and cushion-fit rules with limits',
    'To-scale plan that shows overflow in red',
    'Values placed on 199 guide drawings',
    '3D model with code dimension lines',
  ],
}

const handoffTracker = {
  status: 'In progress',
  tagline: 'Tracks parcels across carrier handoffs and flags stalls',
  summary:
    'When 4PX in China hands a parcel to Sagawa in Japan, the first carrier goes quiet and the second issues a new tracking number, so stalled parcels are easy to miss until a customer asks. Handoff Tracker follows each parcel across both carriers on one timeline and lists shipments that have gone quiet.',
  details:
    'Each carrier’s part of the journey is a Leg with an explicit Handoff between Legs, and the status and stuck rules live in a pure TypeScript domain package with full line coverage. A polling worker fetches events through carrier adapters, normalises them (including Japanese Sagawa messages), follows the handoff to the next tracking number, and writes every change to an audit log in the same transaction.',
  media: {
    kind: 'landscape',
    src: '/media/handoff-tracker-demo.mp4',
    poster: '/media/handoff-tracker-poster.jpg',
    label: 'Screen recording of a dashboard of stuck shipments, then a timeline with two carrier legs and a handoff marker where a manual tracking event is added',
    src2: '/media/handoff-tracker-demo2.mp4',
    label2: 'A CSV of 50 orders is previewed with two rows rejected and the 48 valid orders imported',
    caption: 'A parcel stuck after the 4PX to Sagawa handoff is updated and clears; then a CSV import with per-row errors. Fake data.',
  },
  stack: [
    ['Web', 'Next.js App Router, Server Actions, Tailwind'],
    ['Domain', 'TypeScript, Vitest'],
    ['Data', 'PostgreSQL, Prisma'],
    ['Integrations', 'Ship24, 17TRACK, AfterShip adapters'],
    ['Tests', 'Playwright, Vitest against real Postgres'],
    ['Delivery', 'Docker, GitHub Actions, GHCR, Helm, Argo CD'],
  ],
  links: [{ label: 'Source on GitHub', href: 'https://github.com/LeighAtkins/handoff-tracker' }],
  note: 'No hosted demo yet. Recordings use fake data.',
  hardest:
    'Keeping a parcel tracked when the first carrier hands it to a second under a new tracking number, so a parcel that was handed over but never picked up still gets flagged.',
  features: [
    'Stuck dashboard by carrier and days quiet',
    'One timeline per parcel with handoffs',
    'Manual events, notes and status overrides',
    'CSV import with per-row error preview',
    'Masked customer details, audited reveals',
    'English and Japanese interface',
  ],
}

const tslock = {
  status: 'In progress',
  tagline: 'Learn TypeScript by solving type-checked challenges',
  summary:
    'Reading about TypeScript’s type system does not show whether you can use it. TSLock turns the sections of the Survival TypeScript book into 24 short challenges and a multi-file project lab, each opened in VS Code with a coach in the terminal. A challenge only passes when the code behaves correctly and its types match the challenge’s type contract.',
  details:
    'Attempts are real .ts files run in a separate Node process with built-in type stripping, the permission model, a timeout and a heap cap. Before that, the TypeScript 7 compiler checks the attempt in strict mode against a contract of Expect<Equal<…>> assertions that is rewritten before every run, and a trace command drives Node’s inspector to record each line with its locals and call stack.',
  media: {
    kind: 'landscape',
    src: '/media/tslock-demo.mp4',
    poster: '/media/tslock-poster.jpg',
    label: 'Terminal recording: the TSLock coach lists strict TypeScript errors, then four green checks pass and the run prints increment(999): 1000',
    src2: '/media/tslock-demo2.mp4',
    label2: 'Terminal recording of a step-by-step trace showing both setCount calls storing 1000, then the fixed version passing its tests',
    caption: 'A challenge fails on types, then passes; and a trace that shows why two setCount calls both store 1000.',
  },
  stack: [
    ['Runtime', 'Node.js with built-in TypeScript type stripping'],
    ['Type checking', 'TypeScript 7 tsc, per-challenge contracts'],
    ['Sandbox', 'node:test, Node permission model'],
    ['Tracing', 'Node inspector protocol over WebSocket'],
    ['Editor', 'VS Code tasks and generated workspaces'],
  ],
  links: [{ label: 'JSLock, the JavaScript original', href: 'https://github.com/LeighAtkins/jslock' }],
  note: 'No public repository yet.',
  hardest:
    'Grading types as well as behaviour without TypeScript 7’s unstable compiler API, by running tsc against a contract file rewritten before every run and mapping each diagnostic back to the assertion that failed.',
  features: [
    '24 challenges mapped to Survival TypeScript',
    'Strict tsc plus per-challenge type contracts',
    'Hidden runtime checks in a sandbox',
    'Line-by-line trace with locals and stack',
    'VS Code workspace with a coach that starts itself',
    'Rebuild-from-memory ladder',
  ],
}

// The inventory. `size` is the item's footprint in the attaché case (columns × rows).
export const items = [
  {
    id: 'sofapaint',
    name: 'SofaPaint',
    alias: 'Tailor’s tape',
    kind: 'project',
    icon: 'tape',
    size: [2, 2],
    blurb: 'Measures any sofa from a photo, then hands the drawing to a human to check.',
    project: sofapaint,
  },
  {
    id: 'reelwalk',
    name: 'ReelWalk',
    alias: 'Film reel',
    kind: 'project',
    icon: 'reel',
    size: [2, 2],
    blurb: 'Turns a house into a Reel, with a floor plan that keeps up with the camera.',
    project: reelwalk,
  },
  {
    id: 'threewood',
    name: 'ThreeWood',
    alias: 'The three wood',
    kind: 'project',
    icon: 'club',
    size: [1, 4],
    blurb: 'Grows an 18-hole golf course from a seed. Fits in one hand.',
    project: threewood,
  },
  {
    id: 'sofapaint-desktop',
    name: 'SofaPaint Desktop',
    alias: 'Measuring monitor',
    kind: 'project',
    icon: 'monitor',
    size: [2, 2],
    blurb: 'Reads a customer’s sofa measurements and checks the cushions fit before anything is cut.',
    project: sofapaintDesktop,
  },
  {
    id: 'handoff-tracker',
    name: 'Handoff Tracker',
    alias: 'Parcel',
    kind: 'project',
    icon: 'parcel',
    size: [2, 2],
    blurb: 'Follows a parcel from one carrier to the next and notices when it goes quiet.',
    project: handoffTracker,
  },
  {
    id: 'tslock',
    name: 'TSLock',
    alias: 'Type lock',
    kind: 'project',
    icon: 'lock',
    size: [1, 2],
    blurb: 'Only opens when your code works and your types are right.',
    project: tslock,
  },
  {
    id: 'style-check',
    name: 'Sofa Style Visualizer',
    alias: 'Fabric swatch',
    kind: 'side',
    icon: 'swatch',
    size: [2, 1],
    blurb: 'Upload a room photo and a fabric swatch; Gemini reupholsters the sofa and keeps the room’s lighting.',
    stackLine: 'Next.js, Gemini, Cloudinary',
    href: 'https://github.com/LeighAtkins/style-check',
    hrefLabel: 'Source on GitHub',
  },
  {
    id: 'supportcopilot',
    name: 'SupportCopilot',
    alias: 'Headset',
    kind: 'side',
    icon: 'headset',
    size: [2, 2],
    blurb: 'Drafts support replies grounded in a help-centre index, then adds the right product links.',
    stackLine: 'Python, LanceDB, Flask, Electron',
  },
  {
    id: 'galactic',
    name: 'GalacticHoroscope',
    alias: 'Orrery',
    kind: 'side',
    icon: 'orrery',
    size: [1, 1],
    blurb: 'One TypeScript core shipped three ways: a CLI, a documented REST API and a 3D web page.',
    stackLine: 'TypeScript, Express, Three.js, Jest',
    href: 'https://github.com/LeighAtkins/GalacticHoroscope',
    hrefLabel: 'Source on GitHub',
  },
  {
    id: 'resume',
    name: 'Résumé',
    alias: 'Scroll',
    kind: 'link',
    icon: 'scroll',
    size: [1, 2],
    blurb: 'The plain version of this site. No controller required.',
    href: '/resume',
    hrefLabel: 'Read the résumé',
    internal: true,
  },
  {
    id: 'contact',
    name: 'Email Leigh',
    alias: 'Sealed letter',
    kind: 'link',
    icon: 'letter',
    size: [2, 1],
    blurb: `Open it to write to ${EMAIL}. Replies arrive faster than a carrier pigeon.`,
    href: `mailto:${EMAIL}`,
    hrefLabel: 'Write an email',
  },
  {
    id: 'github',
    name: 'GitHub',
    alias: 'Book of source',
    kind: 'link',
    icon: 'tome',
    size: [1, 1],
    blurb: 'Every project in this box, down to the commit history.',
    href: GITHUB,
    hrefLabel: 'Open GitHub',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    alias: 'Calling card',
    kind: 'link',
    icon: 'card',
    size: [1, 1],
    blurb: 'The same person, in a more serious font.',
    href: LINKEDIN,
    hrefLabel: 'Open LinkedIn',
  },
  {
    id: 'katana',
    name: 'Katana',
    alias: 'Portrait-shoot katana',
    kind: 'curio',
    icon: 'katana',
    size: [1, 5],
    blurb: 'Borrowed for a portrait shoot. Does no damage. Looks great in a pause menu.',
  },
]

// Unlocked by the Konami code
export const secretItem = {
  id: 'duck',
  name: 'Rubber Duck',
  alias: 'Debugging companion',
  kind: 'curio',
  icon: 'duck',
  size: [1, 1],
  blurb: 'Explain the bug to the duck. The duck says nothing. The bug is fixed. You found a secret.',
}

export const projectItems = items.filter((i) => i.kind === 'project')
export const sideItems = items.filter((i) => i.kind === 'side')
export const linkItems = items.filter((i) => i.kind === 'link')

export const games = [
  {
    id: 'hyrule',
    title: 'The Legend of Leigh',
    subtitle: 'Ocarina of Code',
    homage: 'Ocarina of Time',
    year: 1998,
    media: 'cart',
    color: '#C9A227',
  },
  {
    id: 'attache',
    title: 'Resident Developer 4',
    subtitle: 'The attaché case',
    homage: 'Resident Evil 4',
    year: 2005,
    media: 'disc',
    color: '#7A1E1E',
  },
  {
    id: 'wasteland',
    title: 'Fullstack 3',
    subtitle: 'Wrist terminal',
    homage: 'Fallout 3',
    year: 2008,
    media: 'case',
    color: '#1F5F2A',
  },
  {
    id: 'castle',
    title: 'Super Leigh 64',
    subtitle: 'Paintings in the castle',
    homage: 'Super Mario 64',
    year: 1996,
    media: 'cart',
    color: '#9C9C9C',
  },
  {
    id: 'normandy',
    title: 'Mass Deploy 2',
    subtitle: 'Squad screen',
    homage: 'Mass Effect 2',
    year: 2010,
    media: 'case',
    color: '#1B2433',
  },
]
