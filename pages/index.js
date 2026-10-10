import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import Shelf from '../components/Shelf'
import CrtTransition from '../components/CrtTransition'
import SystemBar, { Toast } from '../components/SystemBar'
import { ArcadeProvider, readJSON, writeJSON } from '../lib/arcade'
import { EMAIL, GITHUB, LINKEDIN, SITE_URL, games, profile } from '../lib/data'
import { fontVars } from '../lib/fonts'
import { sfx } from '../lib/sfx'

const TITLE = 'Leigh Atkins, full-stack developer · itembox.site'
const DESCRIPTION =
  'The portfolio of Leigh Atkins, full-stack developer, as a video-game item box. Pick a game, then use SofaPaint, ReelWalk and ThreeWood from its inventory.'

const loading = () => <div className="fixed inset-0 bg-black" />
// three.js only runs in the browser
const LivingRoom = dynamic(() => import('../components/LivingRoom'), { ssr: false })

const screens = {
  hyrule: dynamic(() => import('../themes/hyrule'), { ssr: false, loading }),
  attache: dynamic(() => import('../themes/attache'), { ssr: false, loading }),
  wasteland: dynamic(() => import('../themes/wasteland'), { ssr: false, loading }),
  castle: dynamic(() => import('../themes/castle'), { ssr: false, loading }),
  normandy: dynamic(() => import('../themes/normandy'), { ssr: false, loading }),
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
        <link rel="canonical" href={SITE_URL} />
        <link rel="manifest" href="/site.webmanifest" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content="Leigh Atkins: the item box" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={`${SITE_URL}/og.jpg`} />
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

      <div className={fontVars}>
        {noWebGL ? (
          !Screen && <Shelf onInsert={setGame} lastGame={lastGame} />
        ) : (
          <LivingRoom active={!Screen} onEnter={enter} onFail={() => setNoWebGL(true)} />
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
