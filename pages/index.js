import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import CrtTransition from '../components/CrtTransition'
import LivingRoom from '../components/LivingRoom'
import Shelf from '../components/Shelf'
import SystemBar, { Toast } from '../components/SystemBar'
import { ArcadeProvider, readJSON, writeJSON } from '../lib/arcade'
import { EMAIL, GITHUB, LINKEDIN, SITE_URL, games, profile } from '../lib/data'
import { fontVars } from '../lib/fonts'
import { sfx } from '../lib/sfx'

const TITLE = 'Leigh Atkins, full-stack developer · itembox.site'
const DESCRIPTION =
  'Leigh Atkins, full-stack developer. A portfolio you play: pick a game in a 3D living room and find SofaPaint, ReelWalk, ThreeWood, Handoff Tracker and more in its inventory. Plain résumé at /resume.'

const loading = () => <div className="fixed inset-0 bg-black" />
const loaders = {
  hyrule: () => import('../themes/hyrule'),
  attache: () => import('../themes/attache'),
  wasteland: () => import('../themes/wasteland'),
  castle: () => import('../themes/castle'),
  normandy: () => import('../themes/normandy'),
}
const screens = Object.fromEntries(Object.entries(loaders).map(([id, load]) => [id, dynamic(load, { ssr: false, loading })]))

// Fetch every game's code while the visitor is still looking at the room, one
// at a time and only when the browser is idle, so inserting a game never waits
function prefetchGames() {
  const queue = Object.values(loaders)
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 300))
  const next = () => {
    const load = queue.shift()
    if (load) idle(() => load().finally(next), { timeout: 4000 })
  }
  next()
}

export default function Home() {
  const [game, setGame] = useState(null)
  const [lastGame, setLastGame] = useState(null)
  const [noWebGL, setNoWebGL] = useState(false)
  const [snapshot, setSnapshot] = useState(null)

  // ?game=castle opens a game directly, so a link can point at one
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('game')
    if (fromUrl && screens[fromUrl]) setGame(fromUrl)
    setLastGame(readJSON('itembox.last', null))
  }, [])

  useEffect(() => {
    const url = new URL(window.location.href)
    if (game) url.searchParams.set('game', game)
    else url.searchParams.delete('game')
    window.history.replaceState(null, '', url)
    if (game) {
      writeJSON('itembox.last', game)
      setLastGame(game)
    }
    document.documentElement.dataset.game = game || 'shelf'
  }, [game])

  const eject = useCallback(() => {
    sfx(game, 'page')
    setSnapshot(null)
    setGame(null)
  }, [game])

  const enter = useCallback((id, shot) => {
    setSnapshot(shot)
    setGame(id)
  }, [])

  const Screen = game ? screens[game] : null

  return (
    <ArcadeProvider game={game}>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="author" content={profile.name} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#16132b" />
        <style>{'html,body{background:#0b0b18}'}</style>
        <link rel="canonical" href={SITE_URL} />
        <link rel="manifest" href="/site.webmanifest" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content="Leigh Atkins: the item box" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={`${SITE_URL}/og.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="A 3D living room with a CRT television, three games consoles and five game cases starring Leigh Atkins" />
        <meta property="og:site_name" content="itembox.site" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Leigh Atkins: the item box" />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE_URL}/og.jpg`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: profile.name,
              jobTitle: profile.role,
              description: profile.pitch,
              url: SITE_URL,
              image: `${SITE_URL}/leigh-atkins-photo.jpg`,
              email: `mailto:${EMAIL}`,
              sameAs: [GITHUB, LINKEDIN],
            }),
          }}
        />
      </Head>

      <div className={fontVars} style={{ fontFamily: 'var(--f-archivo), system-ui, sans-serif' }}>
        {noWebGL ? (
          !Screen && <Shelf onInsert={setGame} lastGame={lastGame} />
        ) : (
          <LivingRoom
            active={!Screen}
            onEnter={enter}
            onFail={() => setNoWebGL(true)}
            onReady={prefetchGames}
            onInsertStart={(id) => loaders[id]?.()}
          />
        )}
        {Screen && (
          <>
            <Screen onEject={eject} />
            <SystemBar game={games.find((g) => g.id === game)} onEject={eject} />
            {snapshot && <CrtTransition key={snapshot.length + game} src={snapshot} />}
          </>
        )}
        <Toast />
      </div>
    </ArcadeProvider>
  )
}
