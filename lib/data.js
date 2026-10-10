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
    'I work mostly in TypeScript, across the browser (Canvas, Three.js, React and Next.js) and the services behind it (Node, PostgreSQL, queues and workers, Docker and Kubernetes). I like projects where the interface has to be exact, because someone will cut fabric or book a viewing based on what it shows.',
  ],
}

// Skill areas, each with the tools that back it up in the projects below
export const skills = [
  { id: 'front', name: 'Front end', tools: ['TypeScript', 'React', 'Next.js', 'Canvas and Fabric.js', 'Three.js and GLSL'], rank: 4 },
  { id: 'back', name: 'Back end', tools: ['Node', 'Express', 'PostgreSQL', 'Prisma', 'Supabase'], rank: 4 },
  { id: 'infra', name: 'Infrastructure', tools: ['Docker', 'Kubernetes and Helm', 'SQS and S3', 'Vercel', 'Cloudflare Workers'], rank: 3 },
  { id: 'ai', name: 'Applied AI', tools: ['YOLO segmentation', 'Modal', 'Gemini', 'LanceDB retrieval'], rank: 3 },
  { id: 'video', name: 'Video and graphics', tools: ['Remotion', 'WebCodecs', 'Web Audio', 'Procedural generation'], rank: 3 },
  { id: 'tests', name: 'Testing', tools: ['Vitest', 'Playwright visual regression', 'Jest', 'Headless test bots'], rank: 3 },
]

const sofapaint = {
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
  features: [
    'Floor plan marker that follows the camera',
    'One-tap tours from 360 photos',
    'Five cuts for five kinds of buyer',
    'One Remotion composition for preview and export',
    'Render jobs on SQS with a dead-letter queue',
    'Whole stack up with one Docker Compose command',
  ],
}

const threewood = {
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
  features: [
    'A par-72 course from every seed',
    'Three-tap swing for one hand',
    'Greens that break',
    'One deterministic physics model',
    'Saves every shot, plays offline',
    'A daily course everyone shares',
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
